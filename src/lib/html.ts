const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * Sanitizes rendered Markdown/HTML strings before DOM insertion (`innerHTML` / `set:html`).
 * Strips active-content tags, inline event handlers, and dangerous URL protocols while
 * preserving benign formatting, links, headings, lists, code blocks, and images.
 */
export function sanitizeHtml(rawHtml: unknown): string {
  const html = String(rawHtml ?? '');
  if (!html) return '';

  return html
    // Remove dangerous container elements and their inner payloads
    .replace(/<(script|iframe|object|embed|style|form|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove unclosed / self-closing dangerous tags
    .replace(/<\/?(script|iframe|object|embed|style|form|meta|base|link|noscript|template)\b[^>]*\/?>/gi, '')
    // Remove inline event handler attributes (quoted, single-quoted, or unquoted)
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Neutralize javascript:, vbscript:, and dangerous data: URIs on href/src/xlink:href/action/formaction
    .replace(
      /\s(href|src|xlink:href|action|formaction)\s*=\s*(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi,
      ' $1="#"'
    )
    .replace(
      /\s(href|src|xlink:href|action|formaction)\s*=\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]*/gi,
      ' $1="#"'
    );
}
