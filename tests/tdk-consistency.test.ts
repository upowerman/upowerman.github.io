import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TOOL_ROUTES } from '../src/utils/tool-routes'

const EXPECTED_TITLE_PREFIXES: Record<string, string> = {
  'tool-json': 'JSON格式化 -',
  'tool-timestamp': '时间戳转换 -',
  'tool-jwt': 'JWT解码器 -',
  'tool-codec': '编解码与哈希 -',
  'tool-regex': '正则表达式在线测试 -',
  'tool-cron': 'Cron表达式生成器 -',
  'tool-uuid': 'UUID在线生成器 -',
  'tool-color': '颜色转换器 -',
  'tool-aes': 'AES在线加解密 -',
  'tool-case': '变量命名风格转换 -',
  'tool-sql': 'SQL格式化工具 -',
  'tool-curl': 'cURL转代码 -',
  'tool-diff': '文本Diff对比工具 -',
  'tool-json-to-type': 'JSON转类型 -'
}

describe('TDK title standard prefix check', () => {
  for (const [toolId, slug] of Object.entries(TOOL_ROUTES)) {
    it(`${slug} title starts with designated keyword prefix`, () => {
      const html = readFileSync(join(__dirname, '..', 'tools', slug, 'index.html'), 'utf-8')
      const match = html.match(/<title>(.*?)<\/title>/)
      expect(match, `title tag found in ${slug}`).toBeTruthy()
      const title = match![1]
      expect(title).toContain(EXPECTED_TITLE_PREFIXES[toolId])
      expect(title).toContain('| DevHub')
      expect(title.length).toBeLessThanOrEqual(65)

      const ogMatch = html.match(/<meta property="og:title" content="(.*?)" \/>/)
      expect(ogMatch, `og:title found in ${slug}`).toBeTruthy()
      expect(ogMatch![1], `og:title matches title in ${slug}`).toBe(title)

      const twitterMatch = html.match(/<meta name="twitter:title" content="(.*?)" \/>/)
      expect(twitterMatch, `twitter:title found in ${slug}`).toBeTruthy()
      expect(twitterMatch![1], `twitter:title matches title in ${slug}`).toBe(title)
    })
  }
})
