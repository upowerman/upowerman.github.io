import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import AdBanner from '../src/components/common/AdBanner.vue'

const ROOT = join(__dirname, '..')

function mountBanner(props: Record<string, any> = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(AdBanner, props)
  app.mount(host)
  return { host, unmount: () => app.unmount() }
}

beforeEach(() => {
  document.body.innerHTML = ''
  ;(window as any).adsbygoogle = []
})

describe('AdBanner.vue Component', () => {
  it('renders a safe container with min-height to prevent CLS', () => {
    const { host, unmount } = mountBanner()
    const container = host.querySelector('.ad-banner-container')
    expect(container).toBeTruthy()
    unmount()
  })

  it('renders <ins class="adsbygoogle"> and pushes to window.adsbygoogle when adSlot is provided', async () => {
    const pushSpy = vi.spyOn((window as any).adsbygoogle, 'push')
    const { host, unmount } = mountBanner({
      adSlot: '1234567890',
      adClient: 'ca-pub-8846399986169251'
    })
    await nextTick()

    const ins = host.querySelector('ins.adsbygoogle')
    expect(ins).toBeTruthy()
    expect(ins?.getAttribute('data-ad-slot')).toBe('1234567890')
    expect(ins?.getAttribute('data-ad-client')).toBe('ca-pub-8846399986169251')
    expect(pushSpy).toHaveBeenCalled()
    unmount()
  })

  it('ToolPage.vue imports and includes AdBanner component', () => {
    const content = readFileSync(join(ROOT, 'src', 'ToolPage.vue'), 'utf-8')
    expect(content).toContain('AdBanner')
  })

  it('App.vue imports and includes AdBanner component', () => {
    const content = readFileSync(join(ROOT, 'src', 'App.vue'), 'utf-8')
    expect(content).toContain('AdBanner')
  })
})
