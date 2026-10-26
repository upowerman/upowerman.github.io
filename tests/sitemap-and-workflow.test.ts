import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TOOL_ROUTES } from '../src/utils/tool-routes'

describe('sitemap and deployment workflow integrity', () => {
  it('public/sitemap.xml and root sitemap.xml contain all 14 tools, home, and privacy', () => {
    const publicSitemap = readFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), 'utf-8')
    const rootSitemap = readFileSync(join(__dirname, '..', 'sitemap.xml'), 'utf-8')

    for (const slug of Object.values(TOOL_ROUTES)) {
      expect(publicSitemap, `public/sitemap.xml has ${slug}`).toContain(`https://yunitytech.top/tools/${slug}/`)
      expect(rootSitemap, `root sitemap.xml has ${slug}`).toContain(`https://yunitytech.top/tools/${slug}/`)
    }
    expect(publicSitemap).toContain('https://yunitytech.top/')
    expect(publicSitemap).toContain('https://yunitytech.top/privacy/')
    expect(rootSitemap).toContain('https://yunitytech.top/')
    expect(rootSitemap).toContain('https://yunitytech.top/privacy/')
    expect(publicSitemap).toContain('<lastmod>2026-10-26</lastmod>')
    expect(rootSitemap).toContain('<lastmod>2026-10-26</lastmod>')
  })

  it('deploy.yml IndexNow URL list includes all 14 tools and home', () => {
    const workflow = readFileSync(join(__dirname, '..', '.github', 'workflows', 'deploy.yml'), 'utf-8')
    for (const slug of Object.values(TOOL_ROUTES)) {
      expect(workflow, `deploy.yml has ${slug}`).toContain(`"https://yunitytech.top/tools/${slug}/"`)
    }
    expect(workflow).toContain('"https://yunitytech.top/"')
  })
})
