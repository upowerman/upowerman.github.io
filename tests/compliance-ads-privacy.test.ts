import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(__dirname, '..')

describe('Compliance: Google AdSense ads.txt & Privacy Policy', () => {
  it('public/ads.txt exists and has valid Google AdSense entry', () => {
    const adsTxtPath = join(ROOT, 'public', 'ads.txt')
    expect(existsSync(adsTxtPath), 'public/ads.txt should exist').toBe(true)
    const content = readFileSync(adsTxtPath, 'utf-8')
    expect(content).toContain('google.com, pub-8846399986169251, DIRECT, f08c47fec0942fa0')
  })

  it('privacy/index.html exists and contains necessary compliance sections', () => {
    const privacyPath = join(ROOT, 'privacy', 'index.html')
    expect(existsSync(privacyPath), 'privacy/index.html should exist').toBe(true)
    const html = readFileSync(privacyPath, 'utf-8')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('https://yunitytech.top/privacy/')
    expect(html).toContain('Cookie')
    expect(html).toContain('Google')
    expect(html).toContain('AdSense')
  })

  it('AppFooter.vue contains link to privacy policy', () => {
    const footerPath = join(ROOT, 'src', 'components', 'layout', 'AppFooter.vue')
    const footerContent = readFileSync(footerPath, 'utf-8')
    expect(footerContent).toContain('/privacy/')
  })

  it('public/sitemap.xml includes privacy page URL', () => {
    const sitemapPath = join(ROOT, 'public', 'sitemap.xml')
    const sitemapContent = readFileSync(sitemapPath, 'utf-8')
    expect(sitemapContent).toContain('https://yunitytech.top/privacy/')
  })

  it('vite.config.ts includes privacy entry in rollupOptions.input', () => {
    const viteConfigPath = join(ROOT, 'vite.config.ts')
    const viteConfigContent = readFileSync(viteConfigPath, 'utf-8')
    expect(viteConfigContent).toMatch(/['"]?privacy['"]?\s*:\s*path\.resolve\(__dirname,\s*['"]privacy\/index\.html['"]\)/)
  })

  it('all 12 active HTML entry files include Google AdSense script', () => {
    const htmlFiles = [
      'index.html',
      'privacy/index.html',
      'tools/json/index.html',
      'tools/timestamp/index.html',
      'tools/jwt/index.html',
      'tools/codec/index.html',
      'tools/regex/index.html',
      'tools/cron/index.html',
      'tools/uuid/index.html',
      'tools/color/index.html',
      'tools/aes/index.html',
      'tools/case/index.html'
    ]
    const scriptPattern = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8846399986169251'
    for (const file of htmlFiles) {
      const content = readFileSync(join(ROOT, file), 'utf-8')
      expect(content, `${file} should contain adsbygoogle.js script`).toContain(scriptPattern)
    }
  })

  it('tools/json/index.html does not claim "无广告"', () => {
    const jsonHtml = readFileSync(join(ROOT, 'tools/json/index.html'), 'utf-8')
    expect(jsonHtml).not.toContain('无广告')
  })
})
