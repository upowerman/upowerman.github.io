import { describe, it, expect } from 'vitest'
import { safeBase64Encode, safeBase64Decode, calculateHashes } from '../../src/utils/codec-utils'

describe('codec-utils', () => {
  it('encodes and decodes utf8 Chinese and Emoji strings to Base64', () => {
    const text = '你好，DevHub 🚀 开发者工作台'
    const encoded = safeBase64Encode(text)
    const decoded = safeBase64Decode(encoded)
    expect(decoded).toBe(text)
  })

  it('calculates MD5 and SHA256 hashes accurately', () => {
    const text = 'hello'
    const hashes = calculateHashes(text)
    expect(hashes.md5).toBe('5d41402abc4b2a76b9719d911017c592')
    expect(hashes.sha256).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })
})
