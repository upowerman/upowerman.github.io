import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia } from 'pinia'
import { useAppStore } from '../../src/stores/useAppStore'

describe('navigateToTool', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: vi.fn() },
      writable: true
    })
  })

  it('navigates to the tool path via location.assign', () => {
    const store = useAppStore(createPinia())
    store.navigateToTool('tool-json')
    expect(window.location.assign).toHaveBeenCalledWith('/tools/json/')
  })

  it('does nothing for unknown ids', () => {
    const store = useAppStore(createPinia())
    store.navigateToTool('tool-nope')
    expect(window.location.assign).not.toHaveBeenCalled()
  })
})
