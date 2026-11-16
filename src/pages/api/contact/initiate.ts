import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../../lib/email';
import { getJwtSecret } from '../../../lib/jwt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, site }) => {
  try {
    const data = await request.json();
    const rawName = typeof data?.name === 'string' ? data.name.trim() : '';
    const rawEmail = typeof data?.email === 'string' ? data.email.trim() : '';
    const rawMessage = typeof data?.message === 'string' ? data.message.trim() : '';
    const targetLocale = data?.locale === 'de' ? 'de' : 'en';

    if (!rawName || !rawEmail || !rawMessage) {
      return new Response(JSON.stringify({ message: 'Missing required fields.' }), {
        status: 400,
      });
    }

    if (!EMAIL_REGEX.test(rawEmail) || rawEmail.length > 254 || rawName.length > 200 || rawMessage.length > 10000) {
      return new Response(JSON.stringify({ message: 'Invalid input.' }), { status: 400 });
    }

    const secret = getJwtSecret();

    const payload = {
      name: rawName,
      email: rawEmail,
      message: rawMessage,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    };

    const token = jwt.sign(payload, secret);

    let siteUrl = site?.toString() || request.url.split('/api')[0];
    if (siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1);
    }

    const localizedBaseUrl = `${siteUrl}/${targetLocale}`;

    await sendVerificationEmail(rawName, rawEmail, token, localizedBaseUrl);

    return new Response(
      JSON.stringify({
        message:
          'Verification email sent. Please check your inbox and click the link to send your message.',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API Error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
