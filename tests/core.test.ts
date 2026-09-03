import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { daysTogether, daysUntil, EMPTY_DATA, isRelationshipMilestone, parseImport, relationshipDay, serializeExport, sortMemories, upsertMemory } from '../src/data.ts'
import { createQuiz, nextQuestion, shuffledQuestionIds, submitQuizAnswer } from '../src/quiz.ts'
import { clearData, loadData, saveData, STORAGE_KEY, type StorageLike } from '../src/storage.ts'
import type { AppData, MemoryEntry } from '../src/types.ts'

class MemoryStorage implements StorageLike {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

const memory = (id: string, date: string, title = id): MemoryEntry => ({
  id, date, title, content: '值得记住的一天', mood: '温暖', createdAt: `${date}T12:00:00.000Z`,
})

describe('日期', () => {
  it('计算相恋天数并跨过闰日', () => {
    assert.equal(daysTogether('2024-02-28', '2024-03-01'), 2)
  })
  it('未来开始日期不返回负数', () => {
    assert.equal(daysTogether('2027-01-01', '2026-09-01'), 0)
  })
  it('计算纪念日倒计时和已过天数', () => {
    assert.equal(daysUntil('2026-09-20', '2026-09-01'), 19)
    assert.equal(daysUntil('2026-08-30', '2026-09-01'), -2)
  })
  it('从在一起当天开始按第 1 天计数', () => {
    assert.equal(relationshipDay('2026-05-31', '2026-05-31'), 1)
    assert.equal(relationshipDay('2026-05-31', '2026-09-06'), 99)
    assert.equal(relationshipDay('2026-05-31', '2026-09-07'), 100)
    assert.equal(relationshipDay('2026-05-31', '2026-05-30'), 0)
  })
  it('识别指定天数与每周年纪念日', () => {
    assert.equal(isRelationshipMilestone('2026-05-31', '2026-09-06'), true)
    assert.equal(isRelationshipMilestone('2026-05-31', '2026-09-07'), true)
    assert.equal(isRelationshipMilestone('2026-05-31', '2027-05-31'), true)
    assert.equal(isRelationshipMilestone('2026-05-31', '2028-05-31'), true)
    assert.equal(isRelationshipMilestone('2026-05-31', '2029-02-22'), true)
    assert.equal(isRelationshipMilestone('2026-05-31', '2053-10-14'), true)
    assert.equal(isRelationshipMilestone('2026-05-31', '2026-09-08'), false)
  })
})

describe('回忆', () => {
  it('按日期倒序排列，同日按创建时间倒序', () => {
    assert.deepEqual(sortMemories([memory('a', '2025-01-01'), memory('b', '2025-02-01')]).map((m) => m.id), ['b', 'a'])
  })
  it('新增和编辑时保持排序且不产生副本', () => {
    const added = upsertMemory([memory('a', '2025-01-01')], memory('b', '2025-02-01'))
    const edited = upsertMemory(added, memory('a', '2025-03-01', '改过的标题'))
    assert.deepEqual(edited.map((m) => m.id), ['a', 'b'])
    assert.equal(edited.length, 2)
    assert.equal(edited[0].title, '改过的标题')
  })
  it('删除可由纯数组操作完成且不改变原数组', () => {
    const original = [memory('a', '2025-01-01'), memory('b', '2025-02-01')]
    const removed = original.filter((item) => item.id !== 'a')
    assert.deepEqual(removed.map((m) => m.id), ['b'])
    assert.equal(original.length, 2)
  })
})

describe('本地保存和导入', () => {
  it('保存后可在刷新时完整恢复', () => {
    const storage = new MemoryStorage()
    const data: AppData = { ...EMPTY_DATA, memories: [memory('a', '2025-01-01')] }
    saveData(storage, data)
    assert.deepEqual(loadData(storage), data)
  })
  it('损坏的本地数据回退为空状态', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{broken')
    assert.deepEqual(loadData(storage), EMPTY_DATA)
  })
  it('清空操作移除本机保存的数据', () => {
    const storage = new MemoryStorage()
    saveData(storage, { ...EMPTY_DATA, memories: [memory('a', '2025-01-01')] })
    clearData(storage)
    assert.equal(storage.getItem(STORAGE_KEY), null)
  })
  it('合法 JSON 可以导入并排序', () => {
    const data: AppData = { ...EMPTY_DATA, memories: [memory('a', '2025-01-01'), memory('b', '2025-02-01')] }
    assert.deepEqual(parseImport(JSON.stringify(data)).memories.map((m) => m.id), ['b', 'a'])
  })
  it('导出的 JSON 可以无损导回', () => {
    const data: AppData = { ...EMPTY_DATA, memories: [memory('roundtrip', '2026-08-18')] }
    assert.deepEqual(parseImport(serializeExport(data)), data)
  })
  it('非法导入抛出错误，调用方原数据保持不变', () => {
    const original = { ...EMPTY_DATA, memories: [memory('safe', '2025-01-01')] }
    assert.throws(() => parseImport('{"version":1,"memories":"bad"}'), /原有记录没有改变/)
    assert.equal(original.memories[0].id, 'safe')
  })
})

describe('默契问答', () => {
  it('一轮牌组包含 12 道不重复问题', () => {
    const ids = shuffledQuestionIds(() => 0.42)
    assert.equal(ids.length, 12)
    assert.equal(new Set(ids).size, 12)
  })
  it('两人依次作答，第二人作答前看不到第一人的内容', () => {
    const started = createQuiz(() => 0.5)
    const afterA = submitQuizAnswer(started, '第一人的秘密答案')
    assert.equal(afterA.stage, 'personB')
    assert.equal(afterA.answerA, '第一人的秘密答案')
    assert.equal(afterA.answerB, '')
    const revealed = submitQuizAnswer(afterA, '第二人的答案')
    assert.equal(revealed.stage, 'reveal')
  })
  it('下一题会清空答案，整轮结束后进入完成状态', () => {
    let state = createQuiz(() => 0.5)
    state = { ...state, answerA: 'A', answerB: 'B', stage: 'reveal' }
    const next = nextQuestion(state)
    assert.equal(next.answerA + next.answerB, '')
    const finished = nextQuestion({ ...state, currentIndex: state.questionOrder.length - 1 })
    assert.equal(finished.stage, 'finished')
  })
})
