import { describe, it, expect } from 'vitest'
import {
  aesEncrypt,
  aesDecrypt,
  generateRandomAesKey,
  generateRandomIv,
  getAesCodeSnippet
} from '../../src/utils/aes-utils'

describe('aes-utils', () => {
  const plainText = 'Hello DevHub! 你好，AES加解密。🚀'
  const key128 = '1234567890123456' // 16 chars = 128 bits
  const iv128 = 'abcdef9876543210'  // 16 chars = 128 bits

  it('encrypts and decrypts with AES-CBC-Pkcs7 in Base64 encoding', () => {
    const enc = aesEncrypt({
      text: plainText,
      key: key128,
      iv: iv128,
      mode: 'CBC',
      padding: 'Pkcs7',
      outputEncoding: 'Base64'
    })
    expect(enc.success).toBe(true)
    expect(enc.result).toBeTruthy()

    const dec = aesDecrypt({
      ciphertext: enc.result,
      key: key128,
      iv: iv128,
      mode: 'CBC',
      padding: 'Pkcs7',
      inputEncoding: 'Base64'
    })
    expect(dec.success).toBe(true)
    expect(dec.result).toBe(plainText)
  })

  it('encrypts and decrypts with AES-ECB-Pkcs7 in Hex encoding', () => {
    const enc = aesEncrypt({
      text: plainText,
      key: key128,
      mode: 'ECB',
      padding: 'Pkcs7',
      outputEncoding: 'Hex'
    })
    expect(enc.success).toBe(true)
    expect(enc.result).toMatch(/^[0-9a-fA-F]+$/)

    const dec = aesDecrypt({
      ciphertext: enc.result,
      key: key128,
      mode: 'ECB',
      padding: 'Pkcs7',
      inputEncoding: 'Hex'
    })
    expect(dec.success).toBe(true)
    expect(dec.result).toBe(plainText)
  })

  it('encrypts and decrypts with AES-CTR and ZeroPadding', () => {
    const enc = aesEncrypt({
      text: 'Simple test string',
      key: key128,
      iv: iv128,
      mode: 'CTR',
      padding: 'ZeroPadding',
      outputEncoding: 'Base64'
    })
    expect(enc.success).toBe(true)

    const dec = aesDecrypt({
      ciphertext: enc.result,
      key: key128,
      iv: iv128,
      mode: 'CTR',
      padding: 'ZeroPadding',
      inputEncoding: 'Base64'
    })
    expect(dec.success).toBe(true)
    expect(dec.result).toBe('Simple test string')
  })

  it('handles invalid ciphertext or wrong key gracefully without crashing', () => {
    const dec = aesDecrypt({
      ciphertext: 'not-a-valid-base64!',
      key: key128,
      iv: iv128,
      mode: 'CBC',
      padding: 'Pkcs7',
      inputEncoding: 'Base64'
    })
    expect(dec.success).toBe(false)
    expect(dec.error).toBeTruthy()
  })

  it('generates random keys and IVs', () => {
    const key = generateRandomAesKey(256, 'Hex')
    expect(key.length).toBe(64) // 32 bytes * 2 hex chars
    const iv = generateRandomIv('Hex')
    expect(iv.length).toBe(32) // 16 bytes * 2 hex chars
  })

  it('provides multi-language code snippets', () => {
    const javaCode = getAesCodeSnippet('java', 'CBC', 'Pkcs7')
    expect(javaCode).toContain('Cipher.getInstance("AES/CBC/PKCS5Padding")')
    const pythonCode = getAesCodeSnippet('python', 'CBC', 'Pkcs7')
    expect(pythonCode).toContain('Crypto.Cipher')
    const goCode = getAesCodeSnippet('go', 'CBC', 'Pkcs7')
    expect(goCode).toContain('crypto/cipher')
    const nodeCode = getAesCodeSnippet('nodejs', 'CBC', 'Pkcs7')
    expect(nodeCode).toContain('crypto')
  })
})
