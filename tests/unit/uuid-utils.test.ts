import { describe, it, expect } from 'vitest'
import { generateUuidV4, generateUuidV7, generateUuids, formatUuid } from '../../src/utils/uuid-utils'

const RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('uuid v4', () => {
  it('matches canonical format with version 4 and valid variant', () => {
    for (let i = 0; i < 50; i++) {
      const u = generateUuidV4()
      expect(u).toMatch(RE)
      expect(u[14]).toBe('4')
      expect('89ab').toContain(u[19])
    }
  })
})

describe('uuid v7', () => {
  it('has version 7, valid variant, and embeds the timestamp', () => {
    const ts = 1740000000000
    const u = generateUuidV7(ts)
    expect(u[14]).toBe('7')
    expect('89ab').toContain(u[19])
    const embedded = parseInt(u.replace(/-/g, '').slice(0, 12), 16)
    expect(embedded).toBe(ts)
  })
  it('is unique and timestamp-sorted within a batch', () => {
    const a = generateUuids('v7', 100, 1750000000000)
    expect(a).toHaveLength(100)
    expect(new Set(a).size).toBe(100)
    const b = generateUuids('v7', 10, 1750000001000)
    const tsOf = (u: string) => parseInt(u.replace(/-/g, '').slice(0, 12), 16)
    expect(tsOf(b[0])).toBeGreaterThan(tsOf(a[99]))
  })
})

describe('generateUuids', () => {
  it('batch v4 all unique, clamped to 100', () => {
    const list = generateUuids('v4', 100)
    expect(list).toHaveLength(100)
    expect(new Set(list).size).toBe(100)
    expect(generateUuids('v4', 999)).toHaveLength(100)
  })
})

describe('formatUuid', () => {
  it('uppercase and no-hyphen options', () => {
    const u = '01234567-89ab-cdef-0123-456789abcdef'
    expect(formatUuid(u, {})).toBe(u)
    expect(formatUuid(u, { uppercase: true })).toBe(u.toUpperCase())
    expect(formatUuid(u, { hyphens: false })).toBe(u.replace(/-/g, ''))
  })
})
