import { EMPTY_DATA, sortMemories, validateAppData } from './data.ts'
import type { AppData } from './types.ts'

export const STORAGE_KEY = 'lovemore:data:v1'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function loadData(storage: StorageLike): AppData {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return structuredClone(EMPTY_DATA)
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!validateAppData(parsed)) return structuredClone(EMPTY_DATA)
    return { ...parsed, memories: sortMemories(parsed.memories) }
  } catch {
    return structuredClone(EMPTY_DATA)
  }
}

export function saveData(storage: StorageLike, data: AppData): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearData(storage: StorageLike): void {
  storage.removeItem(STORAGE_KEY)
}
