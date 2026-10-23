import { defineStore } from 'pinia'
import { useLocalStorage, useDark, useToggle } from '@vueuse/core'
import type { NavItem, SearchEngineType, ViewTabType } from '../types'
import { defaultNavCategories } from '../data/nav-categories'
import { defaultToolsRegistry } from '../data/tools-registry'
import { toolPath } from '../utils/tool-routes'

export const useAppStore = defineStore('app', () => {
  // 主题管理
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  // 默认置顶 ID
  const defaultPinned = ['ai-deepseek', 'tool-json', 'comm-gh-trending', 'be-docker', 'fe-vue', 'tool-timestamp']

  // 持久化状态
  const pinnedIds = useLocalStorage<string[]>('devhub_pinned_ids', defaultPinned)
  const customLinks = useLocalStorage<NavItem[]>('devhub_custom_links', [])
  const searchEngine = useLocalStorage<SearchEngineType>('devhub_search_engine', 'google')
  const activeTab = useLocalStorage<ViewTabType>('devhub_active_tab', 'all')

  // 辅助方法
  function isPinned(id: string): boolean {
    return pinnedIds.value.includes(id)
  }

  function togglePin(id: string) {
    if (isPinned(id)) {
      pinnedIds.value = pinnedIds.value.filter(item => item !== id)
    } else {
      pinnedIds.value.push(id)
    }
  }

  function addCustomLink(link: NavItem) {
    customLinks.value.push(link)
  }

  function removeCustomLink(id: string) {
    customLinks.value = customLinks.value.filter(item => item.id !== id)
  }

  function setSearchEngine(engine: SearchEngineType) {
    searchEngine.value = engine
  }

  function setActiveTab(tab: ViewTabType) {
    activeTab.value = tab
  }

  function navigateToTool(toolId: string) {
    const path = toolPath(toolId)
    if (path) window.location.assign(path)
  }

  return {
    isDark,
    toggleDark,
    pinnedIds,
    customLinks,
    searchEngine,
    activeTab,
    defaultNavCategories,
    defaultToolsRegistry,
    isPinned,
    togglePin,
    addCustomLink,
    removeCustomLink,
    setSearchEngine,
    setActiveTab,
    navigateToTool
  }
})
