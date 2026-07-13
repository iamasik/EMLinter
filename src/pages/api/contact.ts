import type { APIRoute } from 'astro';
import { submitContactMessage } from '../../services/firebaseAdmin';

export const prerender = false;

const MAX = { fullName: 120, email: 254, subject: 160, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status: number): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

/** Verify the hCaptcha response token server-side against the siteverify endpoint. */
async function verifyCaptcha(token: string, ip?: string | null): Promise<boolean> {
    const secret = import.meta.env.HCAPTCHA_SECRET;
    const sitekey = import.meta.env.PUBLIC_HCAPTCHA_SITEKEY;
    if (!secret) {
        console.error('HCAPTCHA_SECRET is not set — cannot verify captcha.');
        return false;
    }
    const params = new URLSearchParams({ secret, response: token });
    if (sitekey) params.set('sitekey', sitekey);
    if (ip) params.set('remoteip', ip);

    try {
        const res = await fetch('https://api.hcaptcha.com/siteverify', {
            method: 'POST',
            body: params,
        });
        const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
        if (!data.success) {
            console.warn('hCaptcha verification failed:', data['error-codes']);
        }
        return Boolean(data.success);
    } catch (err) {
        console.error('hCaptcha verification request errored:', err);
        return false;
    }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
    let payload: Record<string, unknown>;
    try {
        payload = await request.json();
    } catch {
        return json({ error: 'Invalid request body.' }, 400);
    }

    const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    const captchaToken = typeof payload.captchaToken === 'string' ? payload.captchaToken : '';

    // Field validation.
    if (!fullName || !email || !subject || !message) {
        return json({ error: 'All fields are required.' }, 400);
    }
    if (!EMAIL_RE.test(email)) {
        return json({ error: 'Please enter a valid email address.' }, 400);
    }
    if (
        fullName.length > MAX.fullName ||
        email.length > MAX.email ||
        subject.length > MAX.subject ||
        message.length > MAX.message
    ) {
        return json({ error: 'One or more fields exceed the allowed length.' }, 400);
    }

    // Spam gate: no valid captcha token, no DB write.
    if (!captchaToken) {
        return json({ error: 'Please complete the captcha.' }, 400);
    }
    let ip: string | null = null;
    try {
        ip = clientAddress ?? null;
    } catch {
        // clientAddress can throw on some adapters when the address is unavailable.
        ip = null;
    }
    const ok = await verifyCaptcha(captchaToken, ip);
    if (!ok) {
        return json({ error: 'Captcha verification failed. Please try again.' }, 400);
    }

    try {
        const id = await submitContactMessage({ fullName, email, subject, message });
        return json({ ok: true, id }, 201);
    } catch (err) {
        console.error('Failed to store contact message:', err);
        return json({ error: 'Something went wrong. Please try again later.' }, 500);
    }
};
