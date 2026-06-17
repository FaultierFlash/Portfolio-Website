import type { APIRoute } from "astro";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../../lib/email";

export const POST: APIRoute = async ({ request, site }) => {
    try {
        const data = await request.json();
        const { name, email, message } = data;

        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ message: "Missing required fields." }),
                { status: 400 }
            );
        }

        // Create a verification token
        // Secret should be in env, using a fallback for dev if needed (but dangerous for prod)
        const secret = import.meta.env.JWT_SECRET || (typeof process !== 'undefined' ? process.env.JWT_SECRET : undefined) || "dev-secret-do-not-use-in-prod";

        // Token payload
        const payload = {
            name,
            email,
            message,
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        };

        const token = jwt.sign(payload, secret);

        // Site URL for the verification link
        const siteUrl = site?.toString() || request.url.split('/api')[0]; // Fallback if site not configured

        // Send verification email
        await sendVerificationEmail(email, token, siteUrl);

        return new Response(
            JSON.stringify({
                message: "Verification email sent. Please check your inbox and click the link to send your message.",
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Contact API Error:", error);
        return new Response(
            JSON.stringify({ message: "Internal Server Error" }),
            { status: 500 }
        );
    }
};
