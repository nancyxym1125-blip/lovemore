import type { AppData, CoupleProfile, MemoryEntry, Mood } from './types.ts'

export const MOODS: Mood[] = ['心动', '温暖', '快乐', '想念', '平静']

export const EMPTY_DATA: AppData = {
  version: 1,
  profile: null,
  memories: [],
  quiz: null,
}

function calendarNumber(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return Number.NaN
  const [, year, month, day] = match.map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  const date = new Date(timestamp)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return Number.NaN
  return Math.floor(timestamp / 86_400_000)
}

export function isDateString(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(calendarNumber(value))
}

export function toLocalDateString(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function daysTogether(startDate: string, today: string): number {
  const difference = calendarNumber(today) - calendarNumber(startDate)
  return Number.isFinite(difference) ? Math.max(0, difference) : 0
}

export function relationshipDay(startDate: string, today: string): number {
  const start = calendarNumber(startDate)
  const current = calendarNumber(today)
  if (!Number.isFinite(start) || !Number.isFinite(current) || current < start) return 0
  return current - start + 1
}

export function isRelationshipMilestone(startDate: string, today: string): boolean {
  const day = relationshipDay(startDate, today)
  if ([99, 100, 999, 9999].includes(day)) return true

  const start = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate)
  const current = /^(\d{4})-(\d{2})-(\d{2})$/.exec(today)
  if (!start || !current || day === 0) return false

  return Number(current[1]) > Number(start[1])
    && current[2] === start[2]
    && current[3] === start[3]
}

export function daysUntil(targetDate: string, today: string): number {
  const difference = calendarNumber(targetDate) - calendarNumber(today)
  return Number.isFinite(difference) ? difference : 0
}

export function sortMemories(memories: MemoryEntry[]): MemoryEntry[] {
  return [...memories].sort((a, b) =>
    b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )
}

export function upsertMemory(memories: MemoryEntry[], entry: MemoryEntry): MemoryEntry[] {
  const existing = memories.some((memory) => memory.id === entry.id)
  return sortMemories(existing
    ? memories.map((memory) => memory.id === entry.id ? entry : memory)
    : [...memories, entry])
}

function isProfile(value: unknown): value is CoupleProfile {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.personA === 'string' && item.personA.trim().length > 0
    && typeof item.personB === 'string' && item.personB.trim().length > 0
    && isDateString(item.startDate) && isDateString(item.anniversaryDate)
}

function isMemory(value: unknown): value is MemoryEntry {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && item.id.length > 0
    && isDateString(item.date)
    && typeof item.title === 'string' && item.title.trim().length > 0
    && typeof item.content === 'string' && item.content.trim().length > 0
    && typeof item.createdAt === 'string' && !Number.isNaN(Date.parse(item.createdAt))
    && typeof item.mood === 'string' && MOODS.includes(item.mood as Mood)
}

function isQuiz(value: unknown): value is NonNullable<AppData['quiz']> {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return Array.isArray(item.questionOrder)
    && item.questionOrder.every((id) => typeof id === 'string')
    && new Set(item.questionOrder).size === item.questionOrder.length
    && typeof item.currentIndex === 'number' && Number.isInteger(item.currentIndex)
    && item.currentIndex >= 0 && item.currentIndex <= item.questionOrder.length
    && typeof item.answerA === 'string'
    && typeof item.answerB === 'string'
    && ['personA', 'personB', 'reveal', 'finished'].includes(String(item.stage))
}

export function validateAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return data.version === 1
    && (data.profile === null || isProfile(data.profile))
    && Array.isArray(data.memories) && data.memories.every(isMemory)
    && (data.quiz === null || isQuiz(data.quiz))
}

export function parseImport(text: string): AppData {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('文件不是有效的 JSON，请重新选择。')
  }
  if (!validateAppData(value)) {
    throw new Error('文件内容不是 LoveMore 数据，原有记录没有改变。')
  }
  return {
    ...value,
    memories: sortMemories(value.memories),
  }
}

export function serializeExport(data: AppData): string {
  return JSON.stringify(data, null, 2)
}
