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

  it('falls back to letter badge when image load fails', async () => {
    const { host, unmount } = mountIcon({
      url: 'https://invalid-non-existent-domain-12345.xyz',
      name: 'Claude'
    })
    const img = host.querySelector('img')
    expect(img).toBeTruthy()

    // Trigger error on image
    img?.dispatchEvent(new Event('error'))
    await nextTick()
    // If there is a second provider, trigger error again
    const img2 = host.querySelector('img')
    if (img2) {
      img2.dispatchEvent(new Event('error'))
      await nextTick()
    }

    expect(host.querySelector('img')).toBeNull()
    expect(host.textContent?.trim()).toBe('C')
    unmount()
  })
})
