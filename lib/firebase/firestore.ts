import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, runTransaction, increment,
  DocumentData, Timestamp,
} from 'firebase/firestore'
import { db } from './config'

export function toDate(value: any): Date {
  if (!value) return new Date()
  if (value instanceof Date) return value
  if (value && typeof value.toDate === 'function') return value.toDate()
  if (value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  try { return new Date(value) } catch { return new Date() }
}

export function docToData<T>(snap: DocumentData): T {
  let data: any = {}
  try { data = snap.data() || {} } catch { data = {} }
  return {
    ...data,
    id: snap.id,
    createdAt:    data.createdAt    ? toDate(data.createdAt)    : new Date(),
    updatedAt:    data.updatedAt    ? toDate(data.updatedAt)    : new Date(),
    finalizadaAt: data.finalizadaAt ? toDate(data.finalizadaAt) : undefined,
    data_hora:    data.data_hora    ? toDate(data.data_hora)    : undefined,
  } as T
}

export {
  serverTimestamp, increment, runTransaction,
  collection, doc, query, where, orderBy,
  limit, onSnapshot, addDoc, updateDoc,
  getDocs, getDoc, deleteDoc, Timestamp, db
}