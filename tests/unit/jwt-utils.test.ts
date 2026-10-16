import { describe, it, expect } from 'vitest'
import { decodeJwt } from '../../src/utils/jwt-utils'

describe('jwt-utils', () => {
  // A test JWT: header = {"alg":"HS256","typ":"JWT"}, payload = {"sub":"1234567890","name":"John Doe","iat":1516239022,"exp":1516240000}
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDAwMDB9.signature'

  it('decodes standard JWT token accurately', () => {
    const res = decodeJwt(sampleToken)
    expect(res.valid).toBe(true)
    expect(res.header.alg).toBe('HS256')
    expect(res.payload.name).toBe('John Doe')
    expect(res.isExpired).toBe(true)
  })

  it('handles invalid JWT string format gracefully', () => {
    const res = decodeJwt('not-a-valid-jwt')
    expect(res.valid).toBe(false)
    expect(res.error).toContain('格式')
  })
})
