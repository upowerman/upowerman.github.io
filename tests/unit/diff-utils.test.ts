import { describe, it, expect } from 'vitest'
import {
  computeLineDiff,
  computeUnifiedPatch
} from '../../src/utils/diff-utils'

describe('diff-utils', () => {
  describe('computeLineDiff', () => {
    it('computes line additions and removals correctly', () => {
      const oldText = 'apple\nbanana\norange'
      const newText = 'apple\nblueberry\norange\npeach'
      const lines = computeLineDiff(oldText, newText)

      expect(lines.length).toBeGreaterThan(0)
      const removed = lines.filter(l => l.type === 'removed')
      const added = lines.filter(l => l.type === 'added')
      const unchanged = lines.filter(l => l.type === 'unchanged')

      expect(removed.map(l => l.value)).toContain('banana')
      expect(added.map(l => l.value)).toContain('blueberry')
      expect(added.map(l => l.value)).toContain('peach')
      expect(unchanged.map(l => l.value)).toContain('apple')
      expect(unchanged.map(l => l.value)).toContain('orange')
    })

    it('handles identical texts', () => {
      const text = 'line 1\nline 2'
      const lines = computeLineDiff(text, text)
      expect(lines.every(l => l.type === 'unchanged')).toBe(true)
    })

    it('handles empty old or new text', () => {
      const lines = computeLineDiff('', 'line 1\nline 2')
      expect(lines.every(l => l.type === 'added')).toBe(true)
    })
  })

  describe('computeUnifiedPatch', () => {
    it('generates standard unified patch header and hunks', () => {
      const oldText = 'function foo() {\n  return 1;\n}'
      const newText = 'function foo() {\n  return 2;\n}'
      const patch = computeUnifiedPatch('file.js', oldText, newText)
      expect(patch).toContain('--- file.js')
      expect(patch).toContain('+++ file.js')
      expect(patch).toContain('-  return 1;')
      expect(patch).toContain('+  return 2;')
    })
  })
})
