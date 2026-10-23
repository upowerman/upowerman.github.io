import { nextTick, onUnmounted, ref, watch, type Ref } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

export function useModal(isOpen: Ref<boolean>, onClose: () => void) {
  const panelRef = ref<HTMLElement | null>(null)
  let restoreEl: HTMLElement | null = null

  function focusables(): HTMLElement[] {
    if (!panelRef.value) return []
    return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const items = focusables()
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    // 焦点不在弹窗内可聚焦元素上(如 body、面板自身)时,原生 Tab 会逃出弹窗,这里一律拦回
    const active = document.activeElement
    const activeInItems = active instanceof HTMLElement && items.includes(active)
    if (e.shiftKey) {
      if (!activeInItems || active === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (!activeInItems || active === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  watch(isOpen, async (open) => {
    if (open) {
      restoreEl = document.activeElement instanceof HTMLElement ? document.activeElement : null
      document.documentElement.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown, true)
      await nextTick()
      const target = panelRef.value?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? panelRef.value
      target?.focus()
    } else {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown, true)
      restoreEl?.focus?.()
      restoreEl = null
    }
  }, { immediate: true })

  onUnmounted(() => {
    document.documentElement.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown, true)
  })

  return { panelRef }
}
