import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import SiteIcon from '../src/components/common/SiteIcon.vue'

function mountIcon(props: Record<string, any>) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(SiteIcon, props)
  app.mount(host)
  return { host, unmount: () => app.unmount() }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('SiteIcon.vue', () => {
  it('does not use deprecated/blocked favicon.splitbee.io', () => {
    const { host, unmount } = mountIcon({
      url: 'https://claude.ai',
      name: 'Claude'
    })
    const img = host.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.src).not.toContain('favicon.splitbee.io')
    unmount()
  })

  it('uses Google S2 or DuckDuckGo icon service with cross-origin support', () => {
    const { host, unmount } = mountIcon({
      url: 'https://claude.ai',
      name: 'Claude'
    })
    const img = host.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.src).toMatch(/google\.com\/s2\/favicons|duckduckgo\.com/)
    unmount()
  })

  it('uses explicit props.icon directly when provided', () => {
    const { host, unmount } = mountIcon({
      url: 'https://start.spring.io',
      name: 'Spring Initializr',
      icon: 'https://www.google.com/s2/favicons?domain=spring.io&sz=64'
    })
    const img = host.querySelector('img')
    expect(img?.src).toBe('https://www.google.com/s2/favicons?domain=spring.io&sz=64')
    unmount()
  })

  it('falls back to apex domain and then letter badge when image load fails', async () => {
    const { host, unmount } = mountIcon({
      url: 'https://invalid-subdomain.non-existent-xyz-12345.xyz',
      name: 'Claude'
    })
    const img = host.querySelector('img')
    expect(img).toBeTruthy()

    // Trigger error on image repeatedly until exhausted
    for (let i = 0; i < 4; i++) {
      const el = host.querySelector('img')
      if (el) {
        el.dispatchEvent(new Event('error'))
        await nextTick()
      }
    }

    expect(host.querySelector('img')).toBeNull()
    expect(host.textContent?.trim()).toBe('C')
    unmount()
  })
})
