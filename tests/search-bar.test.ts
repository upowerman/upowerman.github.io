import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import SearchBar from '../src/components/search/SearchBar.vue'

function mountBar() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(SearchBar)
  app.use(createPinia())
  app.mount(host)
  const input = host.querySelector('input') as HTMLInputElement
  return { host, input, unmount: () => app.unmount() }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('SearchBar keyboard interaction', () => {
  it('shows suggestions for a query, ArrowDown focuses first option, Escape collapses', async () => {
    const { input, host, unmount } = mountBar()
    input.focus()
    input.value = 'json'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    const box = host.querySelector('#search-suggestions')
    expect(box).toBeTruthy()
    const first = box!.querySelector('a') as HTMLElement
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await nextTick()
    expect(document.activeElement).toBe(first)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(host.querySelector('#search-suggestions')).toBeNull()
    unmount()
  })

  it('ArrowDown cycles within options and Escape from an option returns focus to input', async () => {
    const { input, host, unmount } = mountBar()
    input.focus()
    input.value = '表达式'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    const options = Array.from(host.querySelectorAll('#search-suggestions a')) as HTMLElement[]
    expect(options.length).toBeGreaterThan(1)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await nextTick()
    options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await nextTick()
    expect(document.activeElement).toBe(options[1])
    options[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(host.querySelector('#search-suggestions')).toBeNull()
    expect(document.activeElement).toBe(input)
    unmount()
  })
})
