import { Resend } from 'resend';
import { escapeHtml } from './html';

const isDev = import.meta.env.DEV;

// Safe runtime environment variable access for serverless/SSR environments
const getEnv = (key: string): string | undefined => {
  return import.meta.env[key] || (typeof process !== 'undefined' ? process.env[key] : undefined);
};

const resendApiKey = getEnv('RESEND_API_KEY');
const resend = isDev || !resendApiKey ? null : new Resend(resendApiKey);

const SENDER_EMAIL =
  getEnv('SENDER_EMAIL') ||
  getEnv('RESEND_FROM_EMAIL') ||
  getEnv('RESEND_SENDING_EMAIL') ||
  'onboarding@resend.dev';

const CONTACT_EMAIL =
  getEnv('CONTACT_EMAIL') || getEnv('CONTACT_RECIPIENT_EMAIL') || getEnv('EMAIL_TO');

export type EmailLocale = 'en' | 'de';

export async function sendVerificationEmail(
  name: string,
  email: string,
  token: string,
  siteUrl: string,
  locale: EmailLocale = 'en'
) {
  if (!email || !token) throw new Error('Missing email or token');

  const verifyUrl = `${siteUrl}/contact/verify?token=${encodeURIComponent(token)}`;
  const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const safeName = escapeHtml(name);
  const safeVerifyUrl = escapeHtml(verifyUrl);
  const isDe = locale === 'de';

  const copy = isDe
    ? {
        subject: `Kontaktanfrage bestätigen [Ref: #${refCode}]`,
        heading: 'Kontaktanfrage bestätigen',
        greeting: `Hallo ${safeName},`,
        body: 'bitte klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen und deine Nachricht an Marlon Müller zu senden:',
        cta: 'E-Mail bestätigen & Nachricht senden',
        ignore: 'Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail einfach ignorieren.',
        ref: `Sicherheitsreferenz: #${refCode}`,
      }
    : {
        subject: `Verify your contact request [Ref: #${refCode}]`,
        heading: 'Verify your contact request',
        greeting: `Hello ${safeName},`,
        body: 'Please click the link below to verify your email address and send your message to Marlon Müller:',
        cta: 'Verify Email & Send Message',
        ignore: "If you didn't request this, you can safely ignore this email.",
        ref: `Security Reference: #${refCode}`,
      };

  if (isDev) {
    console.log('----------------------------------------------------------------');
    console.log(` [DEV MODE] Mock Validation Email (${locale.toUpperCase()})`);
    console.log(' To:', email);
    console.log(' Subject:', copy.subject);
    console.log(' Validation Link:', verifyUrl);
    console.log(' Reference Code:', refCode);
    console.log('----------------------------------------------------------------');
    return { success: true, data: { id: 'mock-validation-id' } };
  }

  if (!resend) {
    throw new Error('Resend client not initialized (missing RESEND_API_KEY).');
  }

  const { data, error } = await resend.emails.send({
    from: SENDER_EMAIL,
    to: email,
    subject: copy.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2>${copy.heading}</h2>
        <p>${copy.greeting}</p>
        <p>${copy.body}</p>
        <p>
          <a href="${safeVerifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
            ${copy.cta}
          </a>
        </p>
        <p style="font-size: 12px; color: #666;">${copy.ignore}</p>
        <p style="font-size: 10px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
          ${copy.ref}
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend Error (Verification):', error);
    throw new Error(error.message || 'Failed to send verification email.');
  }

  return { success: true, data };
}

export async function sendContactEmail(name: string, userEmail: string, message: string) {
  if (isDev) {
    console.log('----------------------------------------------------------------');
    console.log(' [DEV MODE] Mock Contact Message Sent');
    console.log(' From:', name, `<${userEmail}>`);
    console.log(' To (Owner):', CONTACT_EMAIL || '[Not Configured]');
    console.log(' Message:');
    console.log(message);
    console.log('----------------------------------------------------------------');
    return { success: true, data: { id: 'mock-contact-id' } };
  }

  if (!CONTACT_EMAIL) {
    throw new Error('CONTACT_EMAIL environment variable is not configured.');
  }

  if (!resend) {
    throw new Error('Resend client not initialized (missing RESEND_API_KEY).');
  }

  const safeName = escapeHtml(name);
  const safeUserEmail = escapeHtml(userEmail);
  const safeMessage = escapeHtml(message);
  const safeSubjectName = String(name ?? '').replace(/[\r\n]+/g, ' ').slice(0, 120);

  const { data, error } = await resend.emails.send({
    from: SENDER_EMAIL,
    to: CONTACT_EMAIL,
    replyTo: userEmail,
    subject: `New Contact from ${safeSubjectName}`,
    html: `
      <div style="font-family: monospace; padding: 20px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeUserEmail}</p>
        <hr/>
        <pre style="white-space: pre-wrap;">${safeMessage}</pre>
      </div>
    `,
  });

  if (error) {
    console.error('Resend Error (Contact Forward):', error);
    throw new Error(error.message || 'Failed to forward contact message.');
  }

  return { success: true, data };
}

export async function sendConfirmationEmail(
  name: string,
  email: string,
  messagePreview: string,
  locale: EmailLocale = 'en'
) {
  const isDe = locale === 'de';
  const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const copy = isDe
    ? {
        subject: `Nachricht zugestellt [Ref: #${refCode}]`,
        heading: 'Nachricht zugestellt',
        greeting: `Hallo ${escapeHtml(name)},`,
        line1: 'vielen Dank für deine Nachricht. Deine Kontaktanfrage wurde erfolgreich bestätigt und an Marlon Müller zugestellt.',
        line2: 'Er wird sich so bald wie möglich bei dir melden.',
        previewLabel: 'Deine Nachricht im Überblick:',
        ref: `Sicherheitsreferenz: #${refCode}`,
      }
    : {
        subject: `Contact message received [Ref: #${refCode}]`,
        heading: 'Message Delivered',
        greeting: `Hello ${escapeHtml(name)},`,
        line1: 'Thank you for reaching out. Your contact message has been successfully verified and delivered to Marlon Müller.',
        line2: 'He will get back to you as soon as possible.',
        previewLabel: 'Your message preview:',
        ref: `Security Reference: #${refCode}`,
      };

  if (isDev) {
    console.log('----------------------------------------------------------------');
    console.log(` [DEV MODE] Mock Confirmation Email (${locale.toUpperCase()})`);
    console.log(' To User:', name, `<${email}>`);
    console.log('----------------------------------------------------------------');
    return { success: true };
  }

  if (!resend) {
    console.warn('Resend client not initialized; skipping confirmation email.');
    return { success: false };
  }

  const safePreview = escapeHtml(messagePreview);

  const { data, error } = await resend.emails.send({
    from: SENDER_EMAIL,
    to: email,
    subject: copy.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2>${copy.heading}</h2>
        <p>${copy.greeting}</p>
        <p>${copy.line1}</p>
        <p>${copy.line2}</p>
        <br/>
        <div style="background-color: #f9f9f9; border-left: 4px solid #FF7D1A; padding: 15px; margin: 20px 0; font-family: monospace;">
          <strong>${copy.previewLabel}</strong>
          <pre style="white-space: pre-wrap; margin-top: 10px; font-family: monospace; color: #333;">${safePreview}</pre>
        </div>
        <p style="font-size: 10px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          ${copy.ref}
        </p>
      </div>
    `,
  });

  if (error) {
    // Non-fatal: owner already received the message, log for observability
    console.error('Resend Error (Confirmation):', error);
    return { success: false, error };
  }

  return { success: true, data };
}
