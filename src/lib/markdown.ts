import { marked } from 'marked';
import katex from 'katex';
import { escapeHtml, sanitizeHtml } from './html';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface RenderedMarkdown {
  html: string;
  toc: TocHeading[];
}

function slugifyHeading(text: string): string {
  const plain = text.replace(/<[^>]+>/g, '').trim().toLowerCase();
  const base = plain
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'section';
}

/**
 * Renders untrusted Markdown safely with:
 * - Protected code fences & inline code before KaTeX extraction
 * - Safe placeholder replacement so `sanitizeHtml()` scrubs Markdown HTML before trusted KaTeX markup insertion
 * - Deterministic heading IDs + TOC extraction (`h2`, `h3`)
 * - Technical code block wrapper with language badge
 */
export function renderTechnicalMarkdown(rawMarkdown: unknown): RenderedMarkdown {
  const source = String(rawMarkdown ?? '');
  if (!source.trim()) {
    return { html: '', toc: [] };
  }

  // 1. Temporarily mask fenced and inline code spans so `$` inside code is untouched
  const codeMasks: string[] = [];
  let working = source.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
    const idx = codeMasks.length;
    codeMasks.push(match);
    return `CODEMASKPLACEHOLDER${idx}X`;
  });

  // 2. Extract block math `$$...$$` and inline math `$...$`
  const mathRenderMap = new Map<string, string>();
  let mathCounter = 0;

  working = working.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr: string) => {
    const token = `KATEXBLOCKTOKEN${mathCounter++}END`;
    try {
      const rendered = katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: 'ignore',
      });
      mathRenderMap.set(token, `<div class="katex-block-wrapper overflow-x-auto py-2 my-4">${rendered}</div>`);
    } catch {
      mathRenderMap.set(token, `<code>${escapeHtml(expr)}</code>`);
    }
    return `\n\n${token}\n\n`;
  });

  working = working.replace(/(^|[^\\$])\$([^\n$]+?)\$/g, (_m, lead: string, expr: string) => {
    const trimmed = expr.trim();
    // Skip pure currency / empty expressions starting with a digit + punctuation without math operators
    if (!trimmed || /^\d+(?:[.,]\d+)?$/.test(trimmed)) {
      return `${lead}$${expr}$`;
    }
    const token = `KATEXINLINETOKEN${mathCounter++}END`;
    try {
      const rendered = katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false,
        strict: 'ignore',
      });
      mathRenderMap.set(token, rendered);
    } catch {
      mathRenderMap.set(token, `<code>${escapeHtml(trimmed)}</code>`);
    }
    return `${lead}${token}`;
  });

  // 3. Restore masked code fences/spans
  working = working.replace(/CODEMASKPLACEHOLDER(\d+)X/g, (_m, idxStr: string) => {
    return codeMasks[Number(idxStr)] ?? '';
  });

  // 4. Parse Markdown to HTML
  const parsed = marked.parse(working, { async: false });
  let cleanHtml = sanitizeHtml(parsed);

  // 5. Add IDs to h2/h3 headings and build TOC
  const toc: TocHeading[] = [];
  const usedIds = new Map<string, number>();

  cleanHtml = cleanHtml.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvlStr: string, attrs: string, inner: string) => {
    const level = Number(lvlStr) as 2 | 3;
    const plainText = inner.replace(/<[^>]+>/g, '').trim();
    const baseId = slugifyHeading(plainText);
    const seenCount = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, seenCount + 1);
    const uniqueId = seenCount === 0 ? baseId : `${baseId}-${seenCount + 1}`;

    if (plainText) {
      toc.push({ id: uniqueId, text: plainText, level });
    }
    const cleanedAttrs = attrs.replace(/\sid\s*=\s*["'][^"']*["']/gi, '');
    return `<h${level}${cleanedAttrs} id="${escapeHtml(uniqueId)}">${inner}</h${level}>`;
  });

  // 6. Enhance fenced `<pre><code class="language-...">` blocks cleanly
  cleanHtml = cleanHtml.replace(
    /<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/gi,
    (_m, lang: string | undefined, codeInner: string) => {
      const safeLang = escapeHtml((lang || 'code').toUpperCase());
      return `<div class="tech-code-block not-prose my-6 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 text-slate-100 shadow-sm"><div class="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-800 bg-slate-900/90 text-[10px] font-mono font-bold tracking-widest text-slate-400"><span>${safeLang}</span></div><pre class="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed m-0 bg-transparent"><code>${codeInner}</code></pre></div>`;
    }
  );

  // 7. Re-inject trusted KaTeX markup AFTER sanitization
  mathRenderMap.forEach((renderedHtml, token) => {
    cleanHtml = cleanHtml.split(token).join(renderedHtml);
  });

  return { html: cleanHtml, toc };
}
