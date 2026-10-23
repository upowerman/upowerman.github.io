import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { TOOL_ROUTES } from '../src/utils/tool-routes'

const TOOLS_DIR = join(__dirname, '..', 'tools')
const slugs = readdirSync(TOOLS_DIR)

function decode(t: string): string {
  return t
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/[？，。：；（）、「」""''\s*]/g, '')
}

describe('static tool pages consistency', () => {
  it('every route has a static HTML entry', () => {
    for (const slug of Object.values(TOOL_ROUTES)) {
      expect(slugs, slug).toContain(slug)
    }
  })

  for (const slug of slugs) {
    describe(`tools/${slug}/`, () => {
      const html = readFileSync(join(TOOLS_DIR, slug, 'index.html'), 'utf-8')

      it('JSON-LD parses and every FAQ question is visible on the page', () => {
        const m = html.match(/<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/)
        expect(m, 'JSON-LD script block').toBeTruthy()
        const graph = (JSON.parse(m![1]) as { '@graph': Array<{ '@type': string; mainEntity?: Array<{ name: string }> }> })['@graph']
        const faq = graph.find(n => n['@type'] === 'FAQPage')
        expect(faq, 'FAQPage node').toBeTruthy()

        const visible = decode(html.replace(/<script[\s\S]*?<\/script>/g, ''))
        for (const q of faq!.mainEntity!) {
          expect(visible.includes(decode(q.name)), `visible FAQ missing: ${q.name}`).toBe(true)
        }
      })

      it('cross-link section links all sibling tools and home', () => {
        for (const [id, other] of Object.entries(TOOL_ROUTES)) {
          if (other === slug) continue
          expect(html.includes(`href="/tools/${other}/"`), `${id} link missing`).toBe(true)
        }
        expect(html.includes('href="/"'), 'home link missing').toBe(true)
      })

      it('has canonical, anti-flash script and noscript', () => {
        expect(html.includes(`canonical" href="https://yunitytech.top/tools/${slug}/"`)).toBe(true)
        expect(html.includes('vueuse-color-scheme')).toBe(true)
        expect(html.includes('<noscript>')).toBe(true)
      })
    })
  }
})
