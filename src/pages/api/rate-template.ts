import type { APIRoute } from 'astro';
import { rateTemplate } from '../../services/firebaseAdmin';

export const prerender = false;

function json(body: unknown, status: number): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const POST: APIRoute = async ({ request }) => {
    let payload: Record<string, unknown>;
    try {
        payload = await request.json();
    } catch {
        return json({ error: 'Invalid request body.' }, 400);
    }

    const templateId = typeof payload.templateId === 'string' ? payload.templateId.trim() : '';
    const rating = typeof payload.rating === 'number' ? payload.rating : NaN;

    if (!templateId) {
        return json({ error: 'templateId is required.' }, 400);
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return json({ error: 'rating must be an integer between 1 and 5.' }, 400);
    }

    try {
        const { newAverage, newCount } = await rateTemplate(templateId, rating);
        return json({ newAverage, newCount }, 200);
    } catch (err) {
        console.error('Failed to submit template rating:', err);
        return json({ error: 'Something went wrong. Please try again later.' }, 500);
    }
};
