import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, type EmailLocale } from '../../../lib/email';
import { getJwtSecret } from '../../../lib/jwt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_IP = 5;
const MAX_REQUESTS_PER_EMAIL = 3;

const ipBuckets = new Map<string, number[]>();
const emailBuckets = new Map<string, number[]>();

function isRateLimited(bucketMap: Map<string, number[]>, key: string, limit: number, now: number): boolean {
  if (bucketMap.size > 1000) {
    for (const [k, timestamps] of bucketMap.entries()) {
      if (timestamps.every((ts) => now - ts > RATE_WINDOW_MS)) {
        bucketMap.delete(k);
      }
    }
  }

  const recent = (bucketMap.get(key) || []).filter((ts) => now - ts <= RATE_WINDOW_MS);
  if (recent.length >= limit) {
    bucketMap.set(key, recent);
    return true;
  }
  recent.push(now);
  bucketMap.set(key, recent);
  return false;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export const POST: APIRoute = async ({ request, site }) => {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ message: 'Invalid JSON payload.' }, 400);
  }

  const targetLocale: EmailLocale = data?.locale === 'de' ? 'de' : 'en';
  const isDe = targetLocale === 'de';

  const rawName = typeof data?.name === 'string' ? data.name.trim() : '';
  const rawEmail = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';
  const rawMessage = typeof data?.message === 'string' ? data.message.trim() : '';

  if (!rawName || !rawEmail || !rawMessage) {
    return jsonResponse(
      {
        message: isDe ? 'Bitte fülle alle Pflichtfelder aus.' : 'Missing required fields.',
      },
      400
    );
  }

  if (
    !EMAIL_REGEX.test(rawEmail) ||
    rawEmail.length > 254 ||
    rawName.length > 200 ||
    rawMessage.length > 10000
  ) {
    return jsonResponse(
      {
        message: isDe ? 'Ungültige Eingabe.' : 'Invalid input.',
      },
      400
    );
  }

  const clientIp =
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const now = Date.now();

  if (
    (clientIp !== 'unknown' && isRateLimited(ipBuckets, clientIp, MAX_REQUESTS_PER_IP, now)) ||
    isRateLimited(emailBuckets, rawEmail, MAX_REQUESTS_PER_EMAIL, now)
  ) {
    return jsonResponse(
      {
        message: isDe
          ? 'Zu viele Anfragen. Bitte warte einige Minuten und versuche es erneut.'
          : 'Too many requests. Please wait a few minutes and try again.',
      },
      429
    );
  }

  try {
    const secret = getJwtSecret();
    const payload = {
      name: rawName,
      email: rawEmail,
      message: rawMessage,
      locale: targetLocale,
      jti: randomUUID(),
      exp: Math.floor(now / 1000) + 60 * 60, // 1 hour expiration
    };

    const token = jwt.sign(payload, secret);

    // Prefer the incoming request origin so local dev and Netlify deploy previews verify against themselves
    const origin = new URL(request.url).origin || site?.toString().replace(/\/$/, '') || 'https://marlonmueller.eu';
    const localizedBaseUrl = `${origin.replace(/\/$/, '')}/${targetLocale}`;

    await sendVerificationEmail(rawName, rawEmail, token, localizedBaseUrl, targetLocale);

    return jsonResponse(
      {
        message: isDe
          ? 'Bestätigungs-E-Mail wurde gesendet. Bitte prüfe dein Postfach und klicke auf den Link, um deine Nachricht abzuschicken.'
          : 'Verification email sent. Please check your inbox and click the link to send your message.',
      },
      200
    );
  } catch (error) {
    console.error('Contact API Error:', error);
    return jsonResponse(
      {
        message: isDe
          ? 'Die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.'
          : 'Failed to send verification email. Please try again later.',
      },
      500
    );
  }
};
