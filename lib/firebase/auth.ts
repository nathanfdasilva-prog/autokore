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

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export async function loginComEmail(email: string, senha: string) {
  const cred = await signInWithEmailAndPassword(auth, email, senha)
  return cred.user
}

export async function loginComGoogle() {
  const cred = await signInWithPopup(auth, googleProvider)
  const user = cred.user

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid:        user.uid,
      nome:       user.displayName ?? 'Usuario',
      email:      user.email,
      role:       'mecanico' as Role,
      oficina_id: '',
      ativo:      true,
      avatar_url: user.photoURL ?? '',
      createdAt:  serverTimestamp(),
    })
  }

  return user
}

export async function capturarRedirectGoogle() {
  return null
}

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

  await updateProfile(user, { displayName: nome })

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

export async function recuperarSenha(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function logout() {
  await signOut(auth)
}

export async function buscarPerfil(user: User): Promise<Usuario | null> {
  const snap = await getDoc(doc(db, 'users', user.uid))
  if (!snap.exists()) return null
  return { ...snap.data(), createdAt: snap.data().createdAt?.toDate() } as Usuario
}