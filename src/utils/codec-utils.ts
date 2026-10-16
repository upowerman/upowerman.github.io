import CryptoJS from 'crypto-js'

export function safeBase64Encode(text: string): string {
  if (!text) return ''
  try {
    const bytes = new TextEncoder().encode(text)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  } catch (err) {
    return ''
  }
}

export function safeBase64Decode(b64: string): string {
  if (!b64) return ''
  try {
    const binary = atob(b64.trim())
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  } catch (err) {
    return 'Base64 解码失败：格式非法'
  }
}

export function safeUrlEncode(text: string): string {
  return encodeURIComponent(text)
}

export function safeUrlDecode(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

export function calculateHashes(text: string): { md5: string; sha256: string } {
  if (!text) {
    return { md5: '', sha256: '' }
  }
  return {
    md5: CryptoJS.MD5(text).toString(),
    sha256: CryptoJS.SHA256(text).toString()
  }
}
