import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { ContactMessage } from '../types';

// Server-only. Imported exclusively by Astro API routes (src/pages/api/*.ts), which run
// in Node and are never included in the client:only React bundle. Writes here go through
// a service account, so they bypass Firestore Security Rules under a trusted identity —
// that's the point: the public client SDK in firebase.ts is read-only from now on, and
// firestore.rules at the repo root denies all client writes.

let app: App | undefined;

function getAdminApp(): App {
    if (app) return app;
    const existing = getApps();
    if (existing.length) {
        app = existing[0]!;
        return app;
    }
    const raw = import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw) {
        throw new Error(
            'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Generate a service-account key in the ' +
            'Firebase console (Project settings -> Service accounts -> Generate new private key) ' +
            'and set its JSON contents as this server-only env var.'
        );
    }
    let parsed: { project_id: string; client_email: string; private_key: string };
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.');
    }
    app = initializeApp({
        credential: cert({
            projectId: parsed.project_id,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key.replace(/\\n/g, '\n'),
        }),
    });
    return app;
}

function getAdminDb() {
    return getFirestore(getAdminApp());
}

/**
 * NOTE: this must only be called from the server (see /api/contact) *after*
 * hCaptcha verification — the API route is the spam gate, not this function.
 */
export async function submitContactMessage(
    data: Pick<ContactMessage, 'fullName' | 'email' | 'subject' | 'message'>
): Promise<string> {
    const docRef = await getAdminDb().collection('contactMessages').add({
        fullName: data.fullName,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'unread' as const,
        openedBy: 'Unassigned',
        createdAt: FieldValue.serverTimestamp(),
    });
    return docRef.id;
}

export async function rateTemplate(
    templateId: string,
    rating: number
): Promise<{ newAverage: number; newCount: number }> {
    const templateRef = getAdminDb().collection('templates').doc(templateId);
    return getAdminDb().runTransaction(async (transaction) => {
        const templateDoc = await transaction.get(templateRef);
        if (!templateDoc.exists) throw new Error('Template does not exist.');
        const data = templateDoc.data() as { averageRating?: number; numberOfRatings?: number };
        const currentAverage = data.averageRating || 0;
        const currentCount = data.numberOfRatings || 0;
        const newCount = currentCount + 1;
        const newAverage = (currentAverage * currentCount + rating) / newCount;
        transaction.update(templateRef, { averageRating: newAverage, numberOfRatings: newCount });
        return { newAverage, newCount };
    });
}

export async function voteOnPost(
    postId: string,
    voteType: 'helpful' | 'not-helpful'
): Promise<void> {
    const postRef = getAdminDb().collection('posts').doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) throw new Error('Post does not exist.');
    const fieldToUpdate = voteType === 'helpful' ? 'helpfulCount' : 'notHelpfulCount';
    await postRef.update({ [fieldToUpdate]: FieldValue.increment(1) });
}
