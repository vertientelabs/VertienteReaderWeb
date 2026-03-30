import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { Usuario } from '../types';

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string, email?: string): Promise<Usuario | null> {
  // Strategy 1: buscar por UID como document ID
  console.log('[Auth] Buscando perfil por UID:', uid);
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    console.log('[Auth] ✅ Perfil encontrado por UID');
    return { id: userDoc.id, ...userDoc.data() } as Usuario;
  }

  // Strategy 2: buscar por campo email en la colección users
  if (email) {
    console.log('[Auth] No encontrado por UID, buscando por email:', email);
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firstDoc = snap.docs[0];
      console.log('[Auth] ✅ Perfil encontrado por email, doc ID:', firstDoc.id);
      return { id: firstDoc.id, ...firstDoc.data() } as Usuario;
    }
  }

  console.log('[Auth] ⚠️ No se encontró perfil en Firestore. Creando perfil mínimo.');
  // Strategy 3: crear un perfil mínimo basado en Firebase Auth para que el usuario pueda entrar
  return {
    id: uid,
    email: email || '',
    nombre: email?.split('@')[0] || 'Usuario',
    apellidos: '',
    usertype: 'administrador',
    companiId: '',
    activo: true,
    createdBy: uid,
  } as Usuario;
}
