import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import { sendContactEmail, sendConfirmationEmail } from '../../../lib/email';
import { getJwtSecret } from '../../../lib/jwt';

export const prerender = false; // SSR required

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ message: 'Missing token.' }), { status: 400 });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload | string;

    if (
      !decoded ||
      typeof decoded === 'string' ||
      !decoded.name ||
      !decoded.email ||
      !decoded.message
    ) {
      return new Response(JSON.stringify({ message: 'Invalid or expired token.' }), {
        status: 400,
      });
    }

    await sendContactEmail(decoded.name, decoded.email, decoded.message);
    await sendConfirmationEmail(decoded.name, decoded.email, decoded.message);

    return new Response(
      JSON.stringify({ message: 'Your message has been successfully verified and sent!' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification API Error:', error);
    return new Response(
      JSON.stringify({ message: 'Verification failed. The link may have expired or is invalid.' }),
      { status: 400 }
    );
  }
};
