import { initializeApp } from 'firebase/app';
import { collection, query, orderBy, getDocs, getFirestore, where, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-Rqi0np7SQun_B7oo0LdHsIUVynbaeP4",
  authDomain: "emlinter.firebaseapp.com",
  projectId: "emlinter",
  storageBucket: "emlinter.appspot.com",
  messagingSenderId: "921309098896",
  appId: "1:921309098896:web:ad1f4e1a4164ea5a2ab915"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function getTemplates() {
  const templatesCol = collection(db, "templates");
  const templateSnapshot = await getDocs(templatesCol);
  return templateSnapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
}
async function getTemplateBySlug(slug) {
  const templatesCol = collection(db, "templates");
  const q = query(templatesCol, where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const d = querySnapshot.docs[0];
  return { id: d.id, ...d.data() };
}
async function getPosts() {
  const postsCol = collection(db, "posts");
  const q = query(postsCol, orderBy("createdAt", "desc"));
  const postSnapshot = await getDocs(q);
  return postSnapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
}
async function getPostBySlug(slug) {
  const postsCol = collection(db, "posts");
  const q = query(postsCol, where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const d = querySnapshot.docs[0];
  return { id: d.id, ...d.data() };
}
async function getProducts() {
  const productsCol = collection(db, "products");
  const q = query(productsCol, orderBy("createdAt", "desc"));
  const productSnapshot = await getDocs(q);
  return productSnapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
}
async function getProductBySlug(slug) {
  const productsCol = collection(db, "products");
  const q = query(productsCol, where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const d = querySnapshot.docs[0];
  return { id: d.id, ...d.data() };
}

export { getProductBySlug as a, getPosts as b, getTemplates as c, getProducts as d, getTemplateBySlug as e, getPostBySlug as g };
