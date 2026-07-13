import type { APIRoute } from 'astro';
import { voteOnPost } from '../../services/firebaseAdmin';

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

    const postId = typeof payload.postId === 'string' ? payload.postId.trim() : '';
    const voteType =
        payload.voteType === 'helpful' || payload.voteType === 'not-helpful' ? payload.voteType : null;

    if (!postId || !voteType) {
        return json({ error: 'postId and a valid voteType are required.' }, 400);
    }

    try {
        await voteOnPost(postId, voteType);
        return json({ ok: true }, 200);
    } catch (err) {
        console.error('Failed to submit post vote:', err);
        return json({ error: 'Something went wrong. Please try again later.' }, 500);
    }
};
