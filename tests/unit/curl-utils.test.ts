import { describe, it, expect } from 'vitest'
import {
  parseCurl,
  generateCurlCode
} from '../../src/utils/curl-utils'

describe('curl-utils', () => {
  describe('parseCurl', () => {
    it('parses basic GET request', () => {
      const curl = 'curl https://api.github.com/users/octocat'
      const parsed = parseCurl(curl)
      expect(parsed.url).toBe('https://api.github.com/users/octocat')
      expect(parsed.method).toBe('GET')
      expect(Object.keys(parsed.headers).length).toBe(0)
      expect(parsed.data).toBeUndefined()
    })

    it('parses POST request with headers and JSON body', () => {
      const curl = `curl -X POST 'https://httpbin.org/post' \\
        -H 'Content-Type: application/json' \\
        -H 'Authorization: Bearer my_token' \\
        -d '{"name":"devhub"}'`
      const parsed = parseCurl(curl)
      expect(parsed.url).toBe('https://httpbin.org/post')
      expect(parsed.method).toBe('POST')
      expect(parsed.headers['content-type']).toBe('application/json')
      expect(parsed.headers['authorization']).toBe('Bearer my_token')
      expect(parsed.data).toBe('{"name":"devhub"}')
    })

    it('infers POST method when --data is present without explicit -X', () => {
      const curl = `curl https://api.test.com/login --data 'username=admin&pass=123456'`
      const parsed = parseCurl(curl)
      expect(parsed.url).toBe('https://api.test.com/login')
      expect(parsed.method).toBe('POST')
      expect(parsed.data).toBe('username=admin&pass=123456')
    })

    it('supports basic auth (-u user:password)', () => {
      const curl = `curl -u admin:secret123 https://api.example.com/protected`
      const parsed = parseCurl(curl)
      expect(parsed.auth).toEqual({ user: 'admin', pass: 'secret123' })
    })

    it('throws error when command is empty or no URL found', () => {
      expect(() => parseCurl('')).toThrow()
      expect(() => parseCurl('curl -H "X: 1"')).toThrow()
    })
  })

  describe('generateCurlCode', () => {
    const sampleCurl = `curl -X POST 'https://httpbin.org/post' \\
      -H 'Content-Type: application/json' \\
      -H 'Authorization: Bearer token123' \\
      -d '{"title":"Hello","published":true}'`

    it('generates JavaScript Fetch code', () => {
      const res = generateCurlCode(sampleCurl, 'fetch')
      expect(res.success).toBe(true)
      expect(res.code).toContain('fetch("https://httpbin.org/post"')
      expect(res.code).toContain('"method": "POST"')
      expect(res.code).toContain('"Content-Type": "application/json"')
      expect(res.code).toContain('body:')
    })

    it('generates JavaScript Axios code', () => {
      const res = generateCurlCode(sampleCurl, 'axios')
      expect(res.success).toBe(true)
      expect(res.code).toContain('import axios from \'axios\';')
      expect(res.code).toContain('url: "https://httpbin.org/post"')
      expect(res.code).toContain('method: "POST"')
    })

    it('generates Python Requests code', () => {
      const res = generateCurlCode(sampleCurl, 'python')
      expect(res.success).toBe(true)
      expect(res.code).toContain('import requests')
      expect(res.code).toContain('url = "https://httpbin.org/post"')
      expect(res.code).toContain('response = requests.request(')
    })

    it('generates Go net/http code', () => {
      const res = generateCurlCode(sampleCurl, 'go')
      expect(res.success).toBe(true)
      expect(res.code).toContain('package main')
      expect(res.code).toContain('http.NewRequest("POST", url, payload)')
    })

    it('generates Java HttpClient code', () => {
      const res = generateCurlCode(sampleCurl, 'java')
      expect(res.success).toBe(true)
      expect(res.code).toContain('HttpClient client = HttpClient.newHttpClient();')
      expect(res.code).toContain('HttpRequest request = HttpRequest.newBuilder()')
      expect(res.code).toContain('.uri(URI.create("https://httpbin.org/post"))')
    })
  })
})
