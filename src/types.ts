export type Mood = '心动' | '温暖' | '快乐' | '想念' | '平静'

export interface CoupleProfile {
  personA: string
  personB: string
  startDate: string
  anniversaryDate: string
}

export interface MemoryEntry {
  id: string
  date: string
  title: string
  content: string
  mood: Mood
  createdAt: string
}

export interface QuizState {
  questionOrder: string[]
  currentIndex: number
  answerA: string
  answerB: string
  stage: 'personA' | 'personB' | 'reveal' | 'finished'
}

export interface AppData {
  version: 1
  profile: CoupleProfile | null
  memories: MemoryEntry[]
  quiz: QuizState | null
}
