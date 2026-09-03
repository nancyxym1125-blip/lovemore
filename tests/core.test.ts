import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isRelationshipMilestone, relationshipDay } from '../src/data.ts'

describe('纪念日日期', () => {
  it('从在一起当天开始按第 1 天计数', () => {
    assert.equal(relationshipDay('2026-05-31', '2026-05-31'), 1)
    assert.equal(relationshipDay('2026-05-31', '2026-09-06'), 99)
    assert.equal(relationshipDay('2026-05-31', '2026-09-07'), 100)
    assert.equal(relationshipDay('2026-05-31', '2026-05-30'), 0)
  })

  it('拒绝非法日期', () => {
    assert.equal(relationshipDay('2026-02-30', '2026-09-07'), 0)
    assert.equal(relationshipDay('2026-05-31', 'not-a-date'), 0)
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
