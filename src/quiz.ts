import type { QuizState } from './types.ts'

export const QUESTIONS = [
  { id: 'q01', text: '最近哪一个小瞬间，让你觉得“我们真好”？' },
  { id: 'q02', text: '如果明天完全不用工作，你最想和我怎么过？' },
  { id: 'q03', text: '我做过什么不起眼的小事，却让你记了很久？' },
  { id: 'q04', text: '最近有什么压力，是你希望我多理解一点的？' },
  { id: 'q05', text: '你觉得我们最默契的一件事是什么？' },
  { id: 'q06', text: '下一次旅行，你最想和我去哪里，为什么？' },
  { id: 'q07', text: '如果把我们的故事拍成电影，这一章叫什么？' },
  { id: 'q08', text: '你最近最想被怎样关心？' },
  { id: 'q09', text: '我们有什么共同习惯，是你想一直保留的？' },
  { id: 'q10', text: '哪一句夸奖，是你最想从我这里听到的？' },
  { id: 'q11', text: '今年结束前，你想和我一起完成哪件小事？' },
  { id: 'q12', text: '如果可以重温一天，你会选我们经历过的哪一天？' },
] as const

export function shuffledQuestionIds(random = Math.random): string[] {
  const ids = QUESTIONS.map((question) => question.id)
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]]
  }
  return ids
}

export function createQuiz(random = Math.random): QuizState {
  return {
    questionOrder: shuffledQuestionIds(random),
    currentIndex: 0,
    answerA: '',
    answerB: '',
    stage: 'personA',
  }
}

export function currentQuestion(state: QuizState) {
  const id = state.questionOrder[state.currentIndex]
  return QUESTIONS.find((question) => question.id === id) ?? QUESTIONS[0]
}

export function submitQuizAnswer(state: QuizState, answer: string): QuizState {
  const cleaned = answer.trim()
  if (!cleaned) return state
  if (state.stage === 'personA') {
    return { ...state, answerA: cleaned, stage: 'personB' }
  }
  if (state.stage === 'personB') {
    return { ...state, answerB: cleaned, stage: 'reveal' }
  }
  return state
}

export function nextQuestion(state: QuizState): QuizState {
  const nextIndex = state.currentIndex + 1
  if (nextIndex >= state.questionOrder.length) {
    return { ...state, currentIndex: state.questionOrder.length, stage: 'finished' }
  }
  return { ...state, currentIndex: nextIndex, answerA: '', answerB: '', stage: 'personA' }
}
