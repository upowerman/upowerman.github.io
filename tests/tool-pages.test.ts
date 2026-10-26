import { describe, it, expect } from 'vitest'
import { toolPageContent } from '../src/data/tool-pages'
import { defaultToolsRegistry } from '../src/data/tools-registry'

describe('toolPageContent integrity', () => {
  it('every registered tool has page content', () => {
    for (const tool of defaultToolsRegistry) {
      const c = toolPageContent[tool.id]
      expect(c, `missing content for ${tool.id}`).toBeTruthy()
      expect(c.h1.length).toBeGreaterThan(4)
      expect(c.intro.length).toBeGreaterThan(10)
      expect(c.faqs.length).toBeGreaterThanOrEqual(3)
      for (const f of c.faqs) {
        expect(f.q.length).toBeGreaterThan(6)
        expect(f.a.length).toBeGreaterThan(10)
      }
      if (c.extra) {
        expect(c.extra.head.length).toBeGreaterThan(1)
        expect(c.extra.rows.length).toBeGreaterThan(2)
        for (const row of c.extra.rows) {
          expect(row).toHaveLength(c.extra.head.length)
        }
      }
      if (c.extraSections) {
        for (const s of c.extraSections) {
          expect(s.head.length).toBeGreaterThan(1)
          expect(s.rows.length).toBeGreaterThan(2)
          for (const row of s.rows) {
            expect(row).toHaveLength(s.head.length)
          }
        }
      }
    }
  })

  it('tool-timestamp has 10+ languages in extra and extraSections for seconds conversion', () => {
    const ts = toolPageContent['tool-timestamp']
    expect(ts.extra?.rows.length).toBeGreaterThanOrEqual(10)
    expect(ts.extraSections).toBeDefined()
    expect(ts.extraSections!.length).toBeGreaterThanOrEqual(1)
    const secTable = ts.extraSections![0]
    expect(secTable.title).toContain('秒数')
    expect(secTable.rows.length).toBeGreaterThanOrEqual(6)
  })
})
