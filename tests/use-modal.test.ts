import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, ref, h, nextTick } from 'vue'
import { useModal } from '../src/composables/useModal'

function mountModal(withAutofocus = false) {
  const opened = ref(true)
  let closedTimes = 0
  const app = createApp({
    setup() {
      const { panelRef } = useModal(opened, () => { closedTimes++; opened.value = false })
      return () => h('div', { ref: panelRef as any, tabindex: '-1' }, [
        h('button', { id: 'first' }, 'first'),
        withAutofocus
          ? h('input', { id: 'autofocus-input', type: 'text', 'data-autofocus': true })
          : null,
        h('button', { id: 'last' }, 'last')
      ].filter(Boolean))
    }
  })
  const host = document.createElement('div')
  document.body.appendChild(host)
  app.mount(host)
  return { opened, get closedTimes() { return closedTimes }, unmount: () => app.unmount() }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('useModal', () => {
  it('locks body scroll and moves focus into panel on open', async () => {
    const m = mountModal()
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.activeElement?.id).toBe('first')
    m.unmount()
  })

  it('prefers [data-autofocus] element for initial focus', async () => {
    const m = mountModal(true)
    await nextTick()
    expect(document.activeElement?.id).toBe('autofocus-input')
    m.unmount()
  })

  it('Escape closes even when focus is on body', async () => {
    const m = mountModal()
    await nextTick()
    document.body.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(m.closedTimes).toBe(1)
    expect(m.opened.value).toBe(false)
    m.unmount()
  })

  it('Tab wraps focus inside the panel (last -> first)', async () => {
    const m = mountModal()
    await nextTick()
    const last = document.getElementById('last')!
    last.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    await nextTick()
    expect(document.activeElement?.id).toBe('first')
    m.unmount()
  })

  it('Shift+Tab wraps focus inside the panel (first -> last)', async () => {
    const m = mountModal()
    await nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }))
    await nextTick()
    expect(document.activeElement?.id).toBe('last')
    m.unmount()
  })
})
