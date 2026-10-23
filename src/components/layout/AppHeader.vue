<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- 品牌 Logo -->
      <button type="button" class="flex items-center space-x-3" @click="handleLogoClick" aria-label="DevHub 首页">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
          <Terminal class="w-5 h-5" />
        </div>
        <div class="text-left">
          <span class="block text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            DevHub
          </span>
          <span class="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
            程序员复合型工作台
          </span>
        </div>
      </button>

      <!-- 视图切换 Tab(桌面) -->
      <nav v-if="!toolMode" role="tablist" aria-label="视图切换" class="hidden md:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-semibold">
        <button
          v-for="t in viewTabs"
          :key="t.id"
          :id="'view-tab-' + t.id"
          type="button"
          role="tab"
          :aria-selected="store.activeTab === t.id"
          aria-controls="main-view"
          :tabindex="store.activeTab === t.id ? 0 : -1"
          @click="store.setActiveTab(t.id)"
          @keydown="onTabKeydown($event, t.id)"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1',
            store.activeTab === t.id
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Star v-if="t.id === 'pinned'" class="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{{ t.label }}</span>
        </button>
      </nav>

      <!-- 右侧动作区 -->
      <div class="flex items-center space-x-2">
        <!-- 添加自定义书签(唯一的自定义入口) -->
        <button
          v-if="!toolMode"
          type="button"
          @click="$emit('open-add-link')"
          class="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          title="添加自定义书签"
        >
          <Plus class="w-3.5 h-3.5 text-primary-600" />
          <span>添加书签</span>
        </button>

        <!-- 深浅主题切换 -->
        <button
          type="button"
          @click="store.toggleDark()"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          :title="store.isDark ? '切换至浅色模式' : '切换至深色模式'"
        >
          <Sun v-if="store.isDark" class="w-4 h-4 text-amber-400" />
          <Moon v-else class="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>

    <!-- 移动端视图切换（可横滑） -->
    <nav
      v-if="!toolMode"
      role="tablist"
      aria-label="视图切换"
      class="md:hidden flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        v-for="t in viewTabs"
        :key="t.id"
        :id="'view-tab-m-' + t.id"
        type="button"
        role="tab"
        :aria-selected="store.activeTab === t.id"
        aria-controls="main-view"
        :tabindex="store.activeTab === t.id ? 0 : -1"
        @click="store.setActiveTab(t.id)"
        @keydown="onTabKeydown($event, t.id)"
        :class="[
          'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1',
          store.activeTab === t.id
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
        ]"
      >
        <Star v-if="t.id === 'pinned'" class="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
        <span>{{ t.label }}</span>
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { Terminal, Star, Plus, Sun, Moon } from 'lucide-vue-next'
import { useAppStore } from '../../stores/useAppStore'
import type { ViewTabType } from '../../types'

const props = defineProps<{
  toolMode?: boolean
}>()

defineEmits<{
  (e: 'open-add-link'): void
}>()

const viewTabs: { id: ViewTabType; label: string }[] = [
  { id: 'all', label: '综合看板' },
  { id: 'nav', label: '资源导航' },
  { id: 'tools', label: '开发工具箱' },
  { id: 'pinned', label: '我的收藏' }
]

const store = useAppStore()

function handleLogoClick() {
  if (props.toolMode) {
    window.location.assign('/')
    return
  }
  store.setActiveTab('all')
}

function onTabKeydown(e: KeyboardEvent, currentId: ViewTabType) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  e.preventDefault()
  const idx = viewTabs.findIndex(t => t.id === currentId)
  const next = viewTabs[(idx + (e.key === 'ArrowRight' ? 1 : -1) + viewTabs.length) % viewTabs.length]
  store.setActiveTab(next.id)
  const prefix = (e.currentTarget as HTMLElement).id.startsWith('view-tab-m-') ? 'view-tab-m-' : 'view-tab-'
  nextTick(() => {
    document.getElementById(prefix + next.id)?.focus()
  })
}
</script>
