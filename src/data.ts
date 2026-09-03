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

export function toLocalDateString(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
