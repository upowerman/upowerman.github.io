export type CurlTargetLanguage = 'fetch' | 'axios' | 'python' | 'go' | 'java'

export interface ParsedCurlRequest {
  url: string
  method: string
  headers: Record<string, string>
  rawHeaders: Array<{ key: string; value: string }>
  data?: string
  auth?: { user: string; pass: string }
}

/**
 * 将命令行字符串安全拆分为 tokens，正确处理单引号、双引号及反斜杠转义
 */
function tokenizeCurl(command: string): string[] {
  const normalized = command.replace(/\\\r?\n/g, ' ')
  const tokens: string[] = []
  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let escaped = false

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]

    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\' && !inSingleQuote) {
      escaped = true
      continue
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      continue
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      continue
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (current.length > 0) {
    tokens.push(current)
  }

  return tokens
}

export function parseCurl(command: string): ParsedCurlRequest {
  if (!command || !command.trim()) {
    throw new Error('请输入有效的 cURL 命令')
  }

  const tokens = tokenizeCurl(command.trim())
  if (tokens.length === 0) {
    throw new Error('未解析出任何有效命令参数')
  }

  let url = ''
  let method = ''
  const headers: Record<string, string> = {}
  const rawHeaders: Array<{ key: string; value: string }> = []
  let data: string | undefined = undefined
  let auth: { user: string; pass: string } | undefined = undefined

  let i = 0
  if (tokens[0] === 'curl' || tokens[0].endsWith('/curl') || tokens[0].endsWith('curl.exe')) {
    i = 1
  }

  while (i < tokens.length) {
    const token = tokens[i]

    if (token === '-X' || token === '--request') {
      method = (tokens[++i] || '').toUpperCase()
    } else if (token === '-H' || token === '--header') {
      const headerStr = tokens[++i] || ''
      const colonIdx = headerStr.indexOf(':')
      if (colonIdx > -1) {
        const key = headerStr.slice(0, colonIdx).trim()
        const value = headerStr.slice(colonIdx + 1).trim()
        headers[key.toLowerCase()] = value
        rawHeaders.push({ key, value })
      }
    } else if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary' ||
      token === '--data-ascii'
    ) {
      data = tokens[++i] || ''
      if (!method) method = 'POST'
    } else if (token === '--json') {
      data = tokens[++i] || ''
      if (!method) method = 'POST'
      if (!headers['content-type']) {
        headers['content-type'] = 'application/json'
        rawHeaders.push({ key: 'Content-Type', value: 'application/json' })
      }
    } else if (token === '-u' || token === '--user') {
      const authStr = tokens[++i] || ''
      const parts = authStr.split(':')
      auth = { user: parts[0] || '', pass: parts[1] || '' }
    } else if (token === '--url') {
      url = tokens[++i] || ''
    } else if (!token.startsWith('-')) {
      if (!url) {
        url = token
      }
    }
    i++
  }

  if (!url) {
    throw new Error('未在命令中找到请求目标 URL')
  }

  if (!method) {
    method = data !== undefined ? 'POST' : 'GET'
  }

  return {
    url,
    method,
    headers,
    rawHeaders,
    data,
    auth
  }
}

// ================= 代码生成器 =================

function toFetch(req: ParsedCurlRequest): string {
  const options: any = {
    method: req.method
  }

  if (req.rawHeaders.length > 0) {
    const h: Record<string, string> = {}
    for (const item of req.rawHeaders) h[item.key] = item.value
    options.headers = h
  }

  let bodyStr = ''
  if (req.data !== undefined) {
    try {
      // 尝试是否是标准 JSON
      const parsed = JSON.parse(req.data)
      bodyStr = `\n  body: JSON.stringify(${JSON.stringify(parsed, null, 2).replace(/\n/g, '\n  ')}),`
    } catch {
      bodyStr = `\n  body: ${JSON.stringify(req.data)},`
    }
  }

  const optJson = JSON.stringify(options, null, 2)
  // 如果有 body，拼装进 options
  let finalOpts = optJson
  if (bodyStr) {
    finalOpts = optJson.slice(0, optJson.lastIndexOf('}')) + bodyStr + '\n}'
  }

  return `// JavaScript (原生 fetch)
const response = await fetch(${JSON.stringify(req.url)}, ${finalOpts});

const data = await response.json();
console.log(data);`
}

function toAxios(req: ParsedCurlRequest): string {
  const headersObj: Record<string, string> = {}
  for (const h of req.rawHeaders) headersObj[h.key] = h.value

  let dataSnippet = ''
  if (req.data !== undefined) {
    try {
      const parsed = JSON.parse(req.data)
      dataSnippet = `\n  data: ${JSON.stringify(parsed, null, 2).replace(/\n/g, '\n  ')},`
    } catch {
      dataSnippet = `\n  data: ${JSON.stringify(req.data)},`
    }
  }

  return `// JavaScript / Node.js (Axios)
import axios from 'axios';

const config = {
  method: ${JSON.stringify(req.method)},
  url: ${JSON.stringify(req.url)},${
    Object.keys(headersObj).length > 0
      ? `\n  headers: ${JSON.stringify(headersObj, null, 2).replace(/\n/g, '\n  ')},`
      : ''
  }${dataSnippet}
};

try {
  const response = await axios(config);
  console.log(response.data);
} catch (error) {
  console.error(error);
}`
}

function toPythonRequests(req: ParsedCurlRequest): string {
  let lines = ['# Python (requests 库)', 'import requests', '']
  lines.push(`url = ${JSON.stringify(req.url)}`)

  if (req.rawHeaders.length > 0) {
    lines.push('headers = {')
    for (const h of req.rawHeaders) {
      lines.push(`    ${JSON.stringify(h.key)}: ${JSON.stringify(h.value)},`)
    }
    lines.push('}')
  } else {
    lines.push('headers = {}')
  }

  let dataVar = ''
  if (req.data !== undefined) {
    try {
      JSON.parse(req.data)
      lines.push(`payload = ${JSON.stringify(req.data)}`)
      dataVar = ', data=payload'
    } catch {
      lines.push(`payload = ${JSON.stringify(req.data)}`)
      dataVar = ', data=payload'
    }
  }

  let authParam = ''
  if (req.auth) {
    authParam = `, auth=(${JSON.stringify(req.auth.user)}, ${JSON.stringify(req.auth.pass)})`
  }

  lines.push('')
  lines.push(
    `response = requests.request(${JSON.stringify(req.method)}, url, headers=headers${dataVar}${authParam})`
  )
  lines.push('print(response.status_code)')
  lines.push('print(response.text)')

  return lines.join('\n')
}

function toGolang(req: ParsedCurlRequest): string {
  let bodyReader = 'nil'
  let stringsImport = ''
  let setupBody = ''

  if (req.data !== undefined) {
    stringsImport = '\n  "strings"'
    setupBody = `\n  payload := strings.NewReader(${JSON.stringify(req.data)})`
    bodyReader = 'payload'
  }

  let headersCode = ''
  if (req.rawHeaders.length > 0) {
    headersCode = '\n' + req.rawHeaders
      .map(h => `  req.Header.Add(${JSON.stringify(h.key)}, ${JSON.stringify(h.value)})`)
      .join('\n')
  }

  return `// Go (net/http 标准库)
package main

import (
  "fmt"
  "io"
  "net/http"${stringsImport}
)

func main() {
  url := ${JSON.stringify(req.url)}${setupBody}

  req, err := http.NewRequest(${JSON.stringify(req.method)}, url, ${bodyReader})
  if err != nil {
    panic(err)
  }${headersCode}

  res, err := http.DefaultClient.Do(req)
  if err != nil {
    panic(err)
  }
  defer res.Body.Close()

  body, err := io.ReadAll(res.Body)
  if err != nil {
    panic(err)
  }

  fmt.Println(res.StatusCode)
  fmt.Println(string(body))
}`
}

function toJavaHttpClient(req: ParsedCurlRequest): string {
  let bodyPublisher = 'HttpRequest.BodyPublishers.noBody()'
  if (req.data !== undefined) {
    bodyPublisher = `HttpRequest.BodyPublishers.ofString(${JSON.stringify(req.data)})`
  }

  let headersCode = ''
  for (const h of req.rawHeaders) {
    headersCode += `\n            .header(${JSON.stringify(h.key)}, ${JSON.stringify(h.value)})`
  }

  return `// Java 11+ (java.net.http.HttpClient)
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class CurlDemo {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(${JSON.stringify(req.url)}))${headersCode}
            .method(${JSON.stringify(req.method)}, ${bodyPublisher})
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.statusCode());
        System.out.println(response.body());
    }
}`
}

export function generateCurlCode(
  curlCommand: string,
  targetLang: CurlTargetLanguage
): { success: boolean; code: string; error?: string } {
  try {
    const parsed = parseCurl(curlCommand)
    let code = ''
    switch (targetLang) {
      case 'fetch':
        code = toFetch(parsed)
        break
      case 'axios':
        code = toAxios(parsed)
        break
      case 'python':
        code = toPythonRequests(parsed)
        break
      case 'go':
        code = toGolang(parsed)
        break
      case 'java':
        code = toJavaHttpClient(parsed)
        break
      default:
        code = toFetch(parsed)
    }
    return { success: true, code }
  } catch (err: any) {
    return { success: false, code: '', error: err?.message || 'cURL 命令解析失败，请检查语法' }
  }
}
