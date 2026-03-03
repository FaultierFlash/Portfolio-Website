import { Resend } from 'resend';

const isDev = import.meta.env.DEV;

// Initialize Resend with API key from environment variables
// Note: RESEND_API_KEY must be set in .env
const resend = isDev
  ? null
  : new Resend(import.meta.env.RESEND_API_KEY);

const SENDER_EMAIL = import.meta.env.SENDER_EMAIL || 'onboarding@resend.dev';
const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL;

export async function sendVerificationEmail(email: string, token: string, siteUrl: string) {
  if (!email || !token) throw new Error("Missing email or token");

  const verifyUrl = `${siteUrl}/contact/verify?token=${token}`;

  if (isDev) {
    console.log("----------------------------------------------------------------");
    console.log(" [DEV MODE] Mock Validation Email Sent");
    console.log(" To:", email);
    console.log(" Subject: Verify your contact request");
    console.log(" Validation Link:", verifyUrl);
    console.log("----------------------------------------------------------------");
    return { success: true, data: { id: "mock-validation-id" } };
  }

  try {
    if (!resend) throw new Error("Resend client not initialized (missing API key?)");
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: 'Verify your contact request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your contact request</h2>
          <p>Please click the link below to verify your email address and send your message:</p>
          <p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
              Verify Email & Send Message
            </a>
          </p>
          <p style="font-size: 12px; color: #666;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend Error (Verification):", error);
    throw error;
  }
}

export async function sendContactEmail(name: string, userEmail: string, message: string) {
  if (isDev) {
    console.log("----------------------------------------------------------------");
    console.log(" [DEV MODE] Mock Contact Message Sent");
    console.log(" From:", name, `<${userEmail}>`);
    console.log(" To (Owner):", CONTACT_EMAIL || "[Not Configured]");
    console.log(" Message:");
    console.log(message);
    console.log("----------------------------------------------------------------");
    return { success: true, data: { id: "mock-contact-id" } };
  }

  if (!CONTACT_EMAIL) {
    console.warn("CONTACT_EMAIL not set, skipping owner notification.");
    return { success: false, error: "Configuration Error" };
  }

  try {
    if (!resend) throw new Error("Resend client not initialized (missing API key?)");
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: userEmail,
      subject: `New Contact from ${name}`,
      html: `
        <div style="font-family: monospace; padding: 20px; border: 1px solid #ccc; background: #f9f9f9;">
          <h3>New Contact Message</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <hr/>
          <pre style="white-space: pre-wrap;">${message}</pre>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend Error (Contact Forward):", error);
    throw error;
  }
}
