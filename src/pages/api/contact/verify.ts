import type { APIRoute } from "astro";
import jwt from "jsonwebtoken";
import { sendContactEmail, sendConfirmationEmail } from "../../../lib/email";

export const prerender = false; // SSR required

export const POST: APIRoute = async ({ request }) => {
    try {
        const { token } = await request.json();

        if (!token) {
            return new Response(
                JSON.stringify({ message: "Missing token." }),
                { status: 400 }
            );
        }

        const secret = import.meta.env.JWT_SECRET || (typeof process !== 'undefined' ? process.env.JWT_SECRET : undefined) || "dev-secret-do-not-use-in-prod";
        const decoded = jwt.verify(token, secret) as any;

        if (!decoded) {
            return new Response(
                JSON.stringify({ message: "Invalid or expired token." }),
                { status: 400 }
            );
        }

        // Send actual contact email to owner (Marlon)
        await sendContactEmail(
            decoded.name,
            decoded.email,
            decoded.message,
        );

        // Send confirmation receipt back to the submitter
        await sendConfirmationEmail(
            decoded.name,
            decoded.email,
            decoded.message,
        );

        return new Response(
            JSON.stringify({ message: "Your message has been successfully verified and sent!" }),
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Verification API Error:", error);
        return new Response(
            JSON.stringify({ message: "Verification failed. The link may have expired or is invalid." }),
            { status: 500 }
        );
    }
};
