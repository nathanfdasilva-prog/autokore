// ============================================================
// AUTH — lib/firebase/auth.ts
// Todas as funções de autenticação centralizadas aqui.
// ============================================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './config'
import type { Role, Usuario } from '../types'

const googleProvider = new GoogleAuthProvider()

// ----------------------------------------------------------
// LOGIN com email e senha
// ----------------------------------------------------------
export async function loginComEmail(email: string, senha: string) {
  const cred = await signInWithEmailAndPassword(auth, email, senha)
  return cred.user
}

// ----------------------------------------------------------
// LOGIN com Google
// ----------------------------------------------------------
export async function loginComGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  const user = cred.user

  // Verifica se o usuário já tem documento no Firestore
  const userRef = doc(db, 'users', user.uid)
  const snap    = await getDoc(userRef)

  // Se é a primeira vez com Google, cria o doc básico
  // O admin precisará definir o role e oficina_id depois
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid:        user.uid,
      nome:       user.displayName ?? 'Usuário',
      email:      user.email,
      role:       'mecanico' as Role,   // default — admin promove depois
      oficina_id: '',                   // a ser preenchido no onboarding
      ativo:      true,
      avatar_url: user.photoURL ?? '',
      createdAt:  serverTimestamp(),
    })
  }

  return user
}

// ----------------------------------------------------------
// REGISTRO com email/senha + criação de perfil no Firestore
// ----------------------------------------------------------
export async function registrarUsuario(params: {
  nome:       string
  email:      string
  senha:      string
  role:       Role
  oficina_id: string
}) {
  const { nome, email, senha, role, oficina_id } = params

  const cred = await createUserWithEmailAndPassword(auth, email, senha)
  const user = cred.user

  // Atualiza displayName no Auth
  await updateProfile(user, { displayName: nome })

  // Cria documento do usuário no Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid:        user.uid,
    nome,
    email,
    role,
    oficina_id,
    ativo:      true,
    avatar_url: '',
    createdAt:  serverTimestamp(),
  } satisfies Omit<Usuario, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> })

  return user
}

// ----------------------------------------------------------
// RECUPERAÇÃO de senha
// ----------------------------------------------------------
export async function recuperarSenha(email: string) {
  await sendPasswordResetEmail(auth, email)
}

// ----------------------------------------------------------
// LOGOUT
// ----------------------------------------------------------
export async function logout() {
  await signOut(auth)
}

// ----------------------------------------------------------
// BUSCAR dados do usuário no Firestore
// ----------------------------------------------------------
export async function buscarPerfil(user: User): Promise<Usuario | null> {
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (!snap.exists()) return null
  return { ...snap.data(), createdAt: snap.data().createdAt?.toDate() } as Usuario
}
