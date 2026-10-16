export function decodeJwt(token: string): {
  valid: boolean
  header: any
  payload: any
  isExpired: boolean
  expDate?: string
  error?: string
} {
  if (!token || !token.trim()) {
    return {
      valid: false,
      header: null,
      payload: null,
      isExpired: false,
      error: 'Token 为空'
    }
  }

  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    return {
      valid: false,
      header: null,
      payload: null,
      isExpired: false,
      error: '无效的 JWT 格式（必须包含三个以英文句号分隔的部分）'
    }
  }

  try {
    const decodeBase64Url = (str: string) => {
      let output = str.replace(/-/g, '+').replace(/_/g, '/')
      switch (output.length % 4) {
        case 0:
          break
        case 2:
          output += '=='
          break
        case 3:
          output += '='
          break
        default:
          throw new Error('Base64 字符串长度异常')
      }
      const raw = atob(output)
      const bytes = Uint8Array.from(raw, c => c.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    }

    const header = JSON.parse(decodeBase64Url(parts[0]))
    const payload = JSON.parse(decodeBase64Url(parts[1]))

    let isExpired = false
    let expDate = undefined

    if (payload && typeof payload.exp === 'number') {
      const expMs = payload.exp * 1000
      expDate = new Date(expMs).toLocaleString('zh-CN', { hour12: false })
      isExpired = Date.now() > expMs
    }

    return {
      valid: true,
      header,
      payload,
      isExpired,
      expDate
    }
  } catch (err: any) {
    return {
      valid: false,
      header: null,
      payload: null,
      isExpired: false,
      error: `解析失败: ${err?.message || '非法的内容格式'}`
    }
  }
}
