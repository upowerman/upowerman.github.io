import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '../../src/stores/useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with default pinned items and search engine', () => {
    const store = useAppStore()
    expect(store.searchEngine).toBe('google')
    expect(Array.isArray(store.pinnedIds)).toBe(true)
    expect(store.pinnedIds.length).toBeGreaterThan(0)
  })

  it('can toggle pin state of an item', () => {
    const store = useAppStore()
    const testId = 'test-item-123'
    expect(store.isPinned(testId)).toBe(false)
    store.togglePin(testId)
    expect(store.isPinned(testId)).toBe(true)
    store.togglePin(testId)
    expect(store.isPinned(testId)).toBe(false)
  })

  it('can add and remove custom links', () => {
    const store = useAppStore()
    const customLink = {
      id: 'custom-1',
      name: 'My Blog',
      url: 'https://yunitytech.top',
      desc: 'Personal Site',
      categoryId: 'custom',
      tags: ['blog']
    }
    store.addCustomLink(customLink)
    expect(store.customLinks.length).toBe(1)
    expect(store.customLinks[0].name).toBe('My Blog')

    store.removeCustomLink('custom-1')
    expect(store.customLinks.length).toBe(0)
  })

  it('can switch search engine', () => {
    const store = useAppStore()
    store.setSearchEngine('github')
    expect(store.searchEngine).toBe('github')
  })
})
