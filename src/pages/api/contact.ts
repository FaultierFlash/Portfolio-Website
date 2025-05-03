// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// --- Tell Astro not to pre-render this route to static HTML ---
export const prerender = false;

// --- Environment Variables ---
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RESEND_SENDING_EMAIL = import.meta.env.RESEND_SENDING_EMAIL;
const EMAIL_TO = import.meta.env.EMAIL_TO;

// --- Initialize Resend (only if API key exists) ---
let resend: Resend | null = null;
if (RESEND_API_KEY) {
   resend = new Resend(RESEND_API_KEY);
} else if (import.meta.env.PROD) {
    console.error("Resend API Key is missing. Cannot initialize Resend for production.");
}


// --- POST Handler ---
export const POST: APIRoute = async ({ request }) => {
  let data;
  try {
    // Ensure the request has a body before trying to parse
    if (!request.body) {
        throw new Error("Request body is missing.");
    }
    data = await request.json();
  } catch (error: any) { // Catch specific error types if needed
    console.error("Error parsing request body:", error);
    // Send back a more specific error message if possible
    const errorMessage = error instanceof SyntaxError ? 'Invalid JSON format.' : 'Could not read request body.';
    return new Response(JSON.stringify({ message: errorMessage }), { status: 400 });
  }

  // --- Input Validation ---
  const { name, email, message } = data;
  if (!name || !email || !message) {
    return new Response(JSON.stringify({ message: 'Missing required fields (name, email, message).' }), { status: 400 });
  }

  // --- Environment-Specific Logic ---

  // DEVELOPMENT MODE: Log to console, simulate success
  if (import.meta.env.DEV) {
    console.log("\n--- Contact Form Submission (DEV MODE) ---");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", message);
    console.log("-----------------------------------------\n");

    // Simulate success response for the frontend
    return new Response(
      JSON.stringify({ message: 'Message logged locally (Dev Mode).' }),
      { status: 200 }
    );
  }

  // PRODUCTION MODE: Attempt to send via Resend
  else {
    // Check if Resend is configured for production
    if (!resend || !RESEND_SENDING_EMAIL || !EMAIL_TO) {
       console.error("Resend configuration error in production environment.");
       return new Response(
        JSON.stringify({ message: 'Server configuration error.' }),
        { status: 500 }
      );
    }

    // --- Send Email using Resend ---
    try {
      const { data: responseData, error } = await resend.emails.send({
        from: `Contact Form <${RESEND_SENDING_EMAIL}>`, // Must be from your verified domain
        to: [EMAIL_TO],
        reply_to: email,
        subject: `New Contact Submission from ${name}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
      });

      if (error) {
        console.error('Resend Error:', error);
        // Provide more specific error if possible
        const resendErrorMessage = error.message || 'Unknown Resend error.';
        return new Response(
          JSON.stringify({ message: `Failed to send message via Resend: ${resendErrorMessage}` }),
          { status: 500 }
        );
      }

      console.log('Resend Success Response ID:', responseData?.id);
      return new Response(
        JSON.stringify({ message: 'Message sent successfully!' }),
        { status: 200 }
      );

    } catch (error: any) { // Catch unexpected errors
      console.error('Error sending email:', error);
      return new Response(
        JSON.stringify({ message: `Failed to send message. ${error.message || ''}`.trim() }),
        { status: 500 }
      );
    }
  }
};

// Optional: Add a GET handler
export const GET: APIRoute = () => {
  return new Response(null, { status: 405, statusText: 'Method Not Allowed' });
}
