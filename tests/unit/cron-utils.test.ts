import { describe, it, expect } from 'vitest'
import { parseCron, describeCron, nextRuns } from '../../src/utils/cron-utils'

describe('parseCron', () => {
  it('accepts standard 5-field expressions', () => {
    expect(parseCron('*/5 * * * *').valid).toBe(true)
    expect(parseCron('0 9 * * 1-5').valid).toBe(true)
    expect(parseCron('30 8 1 * *').valid).toBe(true)
    expect(parseCron('0,30 9-17 * * 1,3,5').valid).toBe(true)
  })
  it('accepts 6-field with seconds', () => {
    const r = parseCron('*/30 * * * * *')
    expect(r.valid).toBe(true)
    expect(r.hasSeconds).toBe(true)
  })
  it('treats dow 7 as valid (sunday)', () => {
    expect(parseCron('0 9 * * 7').valid).toBe(true)
  })
  it('rejects wrong field count / out-of-range / garbage', () => {
    expect(parseCron('* * *').valid).toBe(false)
    expect(parseCron('61 * * * *').valid).toBe(false)
    expect(parseCron('* 25 * * *').valid).toBe(false)
    expect(parseCron('* * 0 * *').valid).toBe(false)
    expect(parseCron('* * * 13 *').valid).toBe(false)
    expect(parseCron('a * * * *').valid).toBe(false)
    expect(parseCron('').valid).toBe(false)
  })
  it('flags quartz modifiers as unsupported, not crash', () => {
    const r = parseCron('0 0 L * *')
    expect(r.valid).toBe(false)
    expect(r.unsupported).toBeTruthy()
    expect(parseCron('0 0 * * 1W').valid).toBe(false)
    expect(parseCron('0 0 * * 5#3').valid).toBe(false)
  })
})

describe('describeCron', () => {
  it('renders common patterns in chinese', () => {
    expect(describeCron('* * * * *').text).toBe('每分钟执行一次')
    expect(describeCron('*/5 * * * *').text).toBe('每 5 分钟执行一次')
    expect(describeCron('0 * * * *').text).toBe('每小时整点执行一次')
    expect(describeCron('30 8 * * *').text).toBe('每天 08:30 执行')
    expect(describeCron('0 9 * * 1-5').text).toBe('工作日(周一至周五)每天 09:00 执行')
    expect(describeCron('0 9 * * 1').text).toBe('每周一 09:00 执行')
    expect(describeCron('0 0 1 * *').text).toBe('每月 1 号 00:00 执行')
  })
  it('falls back to per-field translation', () => {
    expect(describeCron('15,45 */2 * * *').text).toContain('分钟')
  })
  it('propagates errors', () => {
    expect(describeCron('bad').valid).toBe(false)
    expect(describeCron('bad').error).toBeTruthy()
  })
})

describe('nextRuns', () => {
  it('every-minute runs are consecutive', () => {
    const from = new Date(2026, 9, 23, 10, 0, 30)
    const runs = nextRuns('* * * * *', 3, from)
    expect(runs.map(d => d.getMinutes())).toEqual([1, 2, 3])
  })
  it('weekday 09:00 skips the weekend', () => {
    const fri = new Date(2026, 9, 23, 10, 0, 0)
    const runs = nextRuns('0 9 * * 1-5', 2, fri)
    expect(runs[0].getDay()).toBe(1)
    expect(runs[0].getHours()).toBe(9)
    expect(runs[1].getDay()).toBe(2)
  })
  it('monthly run crosses month boundary', () => {
    const jan30 = new Date(2027, 0, 30, 12, 0, 0)
    const runs = nextRuns('0 0 1 * *', 1, jan30)
    expect(runs[0].getMonth()).toBe(1)
    expect(runs[0].getDate()).toBe(1)
  })
  it('respects seconds field', () => {
    const from = new Date(2026, 9, 23, 10, 0, 10)
    const runs = nextRuns('*/30 * * * * *', 2, from)
    expect(runs[0].getSeconds()).toBe(30)
    expect(runs[1].getSeconds()).toBe(0)
  })
  it('dow 7 equals sunday', () => {
    const wed = new Date(2026, 9, 21, 12, 0, 0)
    const runs = nextRuns('0 9 * * 7', 1, wed)
    expect(runs[0].getDay()).toBe(0)
  })
  it('returns empty for invalid expr', () => {
    expect(nextRuns('bad', 3)).toEqual([])
  })
})
