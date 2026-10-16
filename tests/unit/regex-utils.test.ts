import { describe, it, expect } from 'vitest'
import { testRegex, commonRegexTemplates } from '../../src/utils/regex-utils'

describe('regex-utils', () => {
  it('matches emails correctly', () => {
    const res = testRegex(commonRegexTemplates.email.pattern, 'g', 'Contact us at test@example.com or info@dev.org')
    expect(res.matches).toEqual(['test@example.com', 'info@dev.org'])
    expect(res.error).toBeUndefined()
  })

  it('handles invalid regex syntax without throwing error', () => {
    const res = testRegex('([a-z', 'g', 'some text')
    expect(res.matches).toEqual([])
    expect(res.error).toBeDefined()
  })
})
