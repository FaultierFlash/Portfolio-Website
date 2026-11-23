import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import { sendContactEmail, sendConfirmationEmail, type EmailLocale } from '../../../lib/email';
import { getJwtSecret } from '../../../lib/jwt';

export const prerender = false; // SSR required

// Bounded in-memory tracking of consumed jti values within a warm function instance
const consumedTokens = new Map<string, number>();

function pruneConsumedTokens(nowMs: number) {
  for (const [jti, expMs] of consumedTokens.entries()) {
    if (expMs <= nowMs) {
      consumedTokens.delete(jti);
    }
  }
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

export const POST: APIRoute = async ({ request }) => {
  let body: { token?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ message: 'Invalid JSON payload.' }, 400);
  }

  const token = typeof body?.token === 'string' ? body.token : '';
  if (!token) {
    return jsonResponse({ message: 'Missing token.' }, 400);
  }

  let secret: string;
  try {
    secret = getJwtSecret();
  } catch (err) {
    console.error('Verify API Configuration Error:', err);
    return jsonResponse({ message: 'Server configuration error.' }, 500);
  }

  let decoded: jwt.JwtPayload;
  try {
    const verified = jwt.verify(token, secret);
    if (
      !verified ||
      typeof verified === 'string' ||
      !verified.name ||
      !verified.email ||
      !verified.message
    ) {
      return jsonResponse({ message: 'Invalid or expired token.' }, 400);
    }
    decoded = verified;
  } catch {
    return jsonResponse(
      { message: 'Verification failed. The link may have expired or is invalid.' },
      400
    );
  }

  const locale: EmailLocale = decoded.locale === 'de' ? 'de' : 'en';
  const isDe = locale === 'de';
  const nowMs = Date.now();
  pruneConsumedTokens(nowMs);

  const jti = typeof decoded.jti === 'string' ? decoded.jti : token;
  if (consumedTokens.has(jti)) {
    return jsonResponse(
      {
        message: isDe
          ? 'Dieser Bestätigungslink wurde bereits verwendet.'
          : 'This verification link has already been used.',
      },
      409
    );
  }

  try {
    await sendContactEmail(String(decoded.name), String(decoded.email), String(decoded.message));
  } catch (error) {
    console.error('Contact Delivery Error:', error);
    return jsonResponse(
      {
        message: isDe
          ? 'Die Nachricht konnte serverseitig nicht zugestellt werden. Bitte versuche es später erneut.'
          : 'Failed to deliver your message due to a server error. Please try again later.',
      },
      500
    );
  }

  const expMs = typeof decoded.exp === 'number' ? decoded.exp * 1000 : nowMs + 60 * 60 * 1000;
  consumedTokens.set(jti, expMs);

  await sendConfirmationEmail(
    String(decoded.name),
    String(decoded.email),
    String(decoded.message),
    locale
  );

  return jsonResponse(
    {
      message: isDe
        ? 'Deine Nachricht wurde erfolgreich verifiziert und zugestellt!'
        : 'Your message has been successfully verified and delivered!',
    },
    200
  );
};
