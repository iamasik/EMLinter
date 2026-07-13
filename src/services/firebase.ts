
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc, orderBy } from "firebase/firestore";
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

// Never throw here: this module is imported by client-only islands (e.g. AnnouncementBar).
// A throw at module-eval crashes the island before any React .catch() can run, which can
// blank chrome (header/footer). Warn instead and let network calls fail gracefully — the
// callers already .catch() their reads.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    "Firebase config missing (PUBLIC_FIREBASE_* env vars). DB-backed features will be disabled. See .env.example."
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

// Rating writes go through POST /api/rate-template (firebase-admin), not this client
// SDK — see src/services/firebaseAdmin.ts.

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

// Vote writes go through POST /api/vote-post (firebase-admin), not this client SDK —
// see src/services/firebaseAdmin.ts.

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

// Contact-form writes go through POST /api/contact (firebase-admin, gated by hCaptcha
// verification), not this client SDK — see src/services/firebaseAdmin.ts.

export { db };
