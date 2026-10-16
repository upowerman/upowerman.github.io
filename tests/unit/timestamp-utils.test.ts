import { describe, it, expect } from 'vitest'
import { timestampToDate, dateToTimestamp } from '../../src/utils/timestamp-utils'

describe('timestamp-utils', () => {
  it('converts seconds timestamp to human readable dates', () => {
    // 1700000000 is 2023-11-14T22:13:20.000Z
    const res = timestampToDate(1700000000, 's')
    expect(res.iso).toBe('2023-11-14T22:13:20.000Z')
    expect(res.utc).toContain('2023')
    expect(res.local).toBeDefined()
    expect(res.relative).toBeDefined()
  })

  it('converts milliseconds timestamp to human readable dates', () => {
    const res = timestampToDate(1700000000000, 'ms')
    expect(res.iso).toBe('2023-11-14T22:13:20.000Z')
  })

  it('handles invalid timestamp gracefully', () => {
    const res = timestampToDate(NaN)
    expect(res.local).toBe('无效时间戳')
    expect(res.iso).toBe('')

    const negativeRes = timestampToDate(-100)
    expect(negativeRes.local).toBe('无效时间戳')
    expect(negativeRes.iso).toBe('')
  })

  it('converts date string to timestamps', () => {
    const res = dateToTimestamp('2023-11-14T22:13:20.000Z')
    expect(res.seconds).toBe(1700000000)
    expect(res.milliseconds).toBe(1700000000000)

    const invalidRes = dateToTimestamp('invalid-date-string')
    expect(invalidRes.seconds).toBeNull()
    expect(invalidRes.milliseconds).toBeNull()
  })
})
