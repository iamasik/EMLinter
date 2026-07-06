
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc, runTransaction, orderBy, updateDoc, increment } from "firebase/firestore";
import type { Template, VideoGuide, Post, Expert, AppSettings, Product } from '../types';

// Firebase web config lives in env (PUBLIC_-prefixed so it is available both client-side
// and in the server-side detail shells / sitemap that also call these getters).
// These are public identifiers, not secrets — access control is enforced by Firestore
// Security Rules. See .env.example for the required keys.
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    "Firebase config missing. Set PUBLIC_FIREBASE_* vars in .env (see .env.example)."
  );
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getTemplates(): Promise<Template[]> {
    const templatesCol = collection(db, 'templates');
    const templateSnapshot = await getDocs(templatesCol);
    return templateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
    const templatesCol = collection(db, 'templates');
    const q = query(templatesCol, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const d = querySnapshot.docs[0];
    return { id: d.id, ...d.data() } as Template;
}

export async function updateTemplateRating(
    templateId: string,
    newRating: number
): Promise<{ newAverage: number; newCount: number }> {
    const templateRef = doc(db, 'templates', templateId);
    try {
        const { newAverage, newCount } = await runTransaction(db, async (transaction) => {
            const templateDoc = await transaction.get(templateRef);
            if (!templateDoc.exists()) throw new Error("Document does not exist!");
            const data = templateDoc.data();
            const currentAverage = data.averageRating || 0;
            const currentCount = data.numberOfRatings || 0;
            const newCount = currentCount + 1;
            const newAverage = ((currentAverage * currentCount) + newRating) / newCount;
            transaction.update(templateRef, { averageRating: newAverage, numberOfRatings: newCount });
            return { newAverage, newCount };
        });
        return { newAverage, newCount };
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
}

export async function getVideoGuides(): Promise<VideoGuide[]> {
    const guidesCol = collection(db, 'VideoGuide');
    const q = query(guidesCol, orderBy("createdAt", "desc"));
    const guideSnapshot = await getDocs(q);
    return guideSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoGuide));
}

export async function getPosts(): Promise<Post[]> {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, orderBy("createdAt", "desc"));
    const postSnapshot = await getDocs(q);
    return postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const d = querySnapshot.docs[0];
    return { id: d.id, ...d.data() } as Post;
}

export async function getRecommendedPosts(): Promise<Post[]> {
    const postsCol = collection(db, 'posts');
    const q = query(postsCol, orderBy("helpfulCount", "desc"), limit(20));
    const postSnapshot = await getDocs(q);
    return postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}

export async function updatePostVoteCount(postId: string, voteType: 'helpful' | 'not-helpful'): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const fieldToUpdate = voteType === 'helpful' ? 'helpfulCount' : 'notHelpfulCount';
    try {
        await updateDoc(postRef, { [fieldToUpdate]: increment(1) });
    } catch (e) {
        console.error("Vote update failed: ", e);
        throw e;
    }
}

export async function getExperts(): Promise<Expert[]> {
    const expertsCol = collection(db, 'OurExperts');
    const q = query(expertsCol, orderBy("createdAt", "asc"));
    const expertSnapshot = await getDocs(q);
    return expertSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expert));
}

export async function getAppSettings(): Promise<AppSettings | null> {
    const docRef = doc(db, 'settings', 'app-settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as AppSettings;
    console.log("No settings document found!");
    return null;
}

export async function getProducts(): Promise<Product[]> {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, orderBy("createdAt", "desc"));
    const productSnapshot = await getDocs(q);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const d = querySnapshot.docs[0];
    return { id: d.id, ...d.data() } as Product;
}

export { db };
