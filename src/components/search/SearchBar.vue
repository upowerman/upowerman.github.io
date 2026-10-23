<template>
  <div ref="searchContainerRef" class="w-full max-w-2xl mx-auto relative">
    <!-- 搜索引擎切换 Tabs -->
    <div class="flex items-center justify-center space-x-2 mb-2 text-xs font-medium">
      <button
        v-for="engine in engines"
        :key="engine.id"
        type="button"
        :aria-pressed="store.searchEngine === engine.id"
        @click="store.setSearchEngine(engine.id)"
        :class="[
          'px-2.5 py-1 rounded-full transition-colors',
          store.searchEngine === engine.id
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
        ]"
      >
        {{ engine.name }}
      </button>
    </div>

    <!-- 搜索命令栏:与全站同色系,以 $ 提示符呼应终端身份;聚焦不显示高亮框,光标即焦点 -->
    <div class="relative flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm pl-4 pr-1.5 py-1.5">
      <span class="font-mono text-sm md:text-base text-primary-600 dark:text-primary-400 select-none mr-2 shrink-0" aria-hidden="true">$</span>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="currentPlaceholder"
        role="combobox"
        :aria-expanded="isFocused && suggestions.length > 0"
        aria-controls="search-suggestions"
        aria-autocomplete="list"
        class="search-cmd-input flex-1 min-w-0 bg-transparent py-2.5 text-sm md:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono caret-primary-600 outline-none"
        @keydown.enter="handleEnter"
        @keydown.down.prevent="focusFirstSuggestion"
        @keydown.escape="collapseToInput"
        @focus="isFocused = true"
      />
      <button
        v-if="query"
        type="button"
        @click="query = ''"
        class="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 shrink-0"
        aria-label="清空搜索词"
      >
        <X class="w-4 h-4" />
      </button>
      <div class="hidden sm:inline-flex items-center mr-2 shrink-0 select-none">
        <kbd
          class="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400 dark:text-slate-500 shadow-[0_1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)]"
          :title="`按下 ${shortcutLabel} 或 / 聚焦搜索`"
        >
          {{ query ? 'Enter ↵' : shortcutLabel }}
        </kbd>
      </div>
      <button
        type="button"
        @click="executeSearch"
        class="shrink-0 whitespace-nowrap px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        搜索
      </button>
    </div>

    <!-- 站内快捷匹配建议下拉框 -->
    <div
      v-if="query && isFocused && suggestions.length > 0"
      id="search-suggestions"
      role="listbox"
      ref="suggestionsRef"
      class="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
    >
      <div class="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-3" aria-hidden="true">
        站内直达推荐
      </div>
      <a
        v-for="item in suggestions"
        :key="item.id"
        role="option"
        aria-selected="false"
        :href="suggestionHref(item)"
        :target="'url' in item ? '_blank' : undefined"
        :rel="'url' in item ? 'noopener noreferrer' : undefined"
        class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
        @keydown.up.prevent="focusSibling($event, -1)"
        @keydown.down.prevent="focusSibling($event, 1)"
        @keydown.escape="collapseToInput"
      >
        <div class="flex items-center space-x-3">
          <SiteIcon :name="item.name" :url="'url' in item ? item.url : undefined" />
          <div>
            <div class="text-sm font-medium text-slate-800 dark:text-slate-200">
              {{ item.name }}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md">
              {{ item.desc }}
            </div>
          </div>
        </div>
        <span class="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
          {{ 'keywords' in item ? '工具' : '网址' }}
        </span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import { useAppStore } from '../../stores/useAppStore'
import SiteIcon from '../common/SiteIcon.vue'
import { toolPath } from '../../utils/tool-routes'
import type { SearchEngineType, NavItem, ToolItem } from '../../types'

const store = useAppStore()
const query = ref('')
const isFocused = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)
const suggestionsRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const isMac = computed(() => {
  if (typeof navigator === 'undefined') return true
  return /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent)
})
const shortcutLabel = computed(() => (isMac.value ? '⌘K' : 'Ctrl+K'))

function onGlobalKeydown(e: KeyboardEvent) {
  const activeEl = document.activeElement
  const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement || (activeEl as HTMLElement)?.isContentEditable

  // ⌘K 或 Ctrl+K 全局任意处唤醒并聚焦
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
    inputRef.value?.select()
    isFocused.value = true
    return
  }

  // 非输入框编辑状态下按 '/' 快捷聚焦
  if (e.key === '/' && !isInput) {
    e.preventDefault()
    inputRef.value?.focus()
    inputRef.value?.select()
    isFocused.value = true
    return
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})

onClickOutside(searchContainerRef, () => {
  isFocused.value = false
})

const engines: { id: SearchEngineType; name: string; url: string; placeholder: string }[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', placeholder: '搜索 Google 或输入工具/站内书签...' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=', placeholder: '百度一下，你就知道...' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=', placeholder: '搜索 GitHub 仓库与开源项目...' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', placeholder: '微软必应搜索...' }
]

const currentPlaceholder = computed(() => {
  const current = engines.find(e => e.id === store.searchEngine)
  return current ? current.placeholder : '搜索...'
})

const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []

  const matchedTools: (ToolItem & { type: 'tool' })[] = store.defaultToolsRegistry
    .filter(t => t.name.toLowerCase().includes(q) || t.keywords.some(k => k.toLowerCase().includes(q)))
    .map(t => ({ ...t, type: 'tool' as const }))

  const allNavItems = [...store.customLinks, ...store.defaultNavCategories.flatMap(c => c.items)]
  const matchedNav: (NavItem & { type: 'nav' })[] = allNavItems
    .filter(n => n.name.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)))
    .map(n => ({ ...n, type: 'nav' as const }))

  return [...matchedTools, ...matchedNav].slice(0, 6)
})

function suggestionHref(item: (ToolItem & { type: 'tool' }) | (NavItem & { type: 'nav' })): string {
  return 'url' in item ? item.url : (toolPath(item.id) || '/')
}

function focusFirstSuggestion() {
  suggestionsRef.value?.querySelector('a')?.focus()
}

function focusSibling(e: Event, dir: 1 | -1) {
  const items = Array.from(suggestionsRef.value?.querySelectorAll('a') ?? []) as HTMLElement[]
  const idx = items.indexOf(e.currentTarget as HTMLElement)
  const next = items[(idx + dir + items.length) % items.length]
  next?.focus()
}

function collapseToInput() {
  query.value = ''
  isFocused.value = false
  inputRef.value?.focus()
}

function executeSearch() {
  const q = query.value.trim()
  if (!q) return

  // 如果建议列表第一个精准匹配，直接打开
  if (suggestions.value.length > 0) {
    const first = suggestions.value[0]
    if (first.name.toLowerCase() === q.toLowerCase()) {
      selectSuggestion(first)
      return
    }
  }

  const engine = engines.find(e => e.id === store.searchEngine) || engines[0]
  window.open(`${engine.url}${encodeURIComponent(q)}`, '_blank')
}

function handleEnter() {
  executeSearch()
}

function selectSuggestion(item: (ToolItem & { type: 'tool' }) | (NavItem & { type: 'nav' })) {
  if (item.type === 'tool') {
    store.navigateToTool(item.id)
  } else if ('url' in item) {
    window.open(item.url, '_blank')
  }
  query.value = ''
  isFocused.value = false
}
</script>
