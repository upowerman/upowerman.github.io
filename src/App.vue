<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors selection:bg-primary-500 selection:text-white">
    <!-- 顶部导航栏 -->
    <AppHeader
      @open-add-link="isAddLinkOpen = true"
    />

    <!-- 页面核心区域 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <!-- 聚合搜索与快速直达 -->
      <section class="text-center pt-2 pb-4">
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
          Hello, Developer.
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          今天想探索什么新工具或开源项目？
        </p>

        <SearchBar />

        <!-- 常用置顶快捷磁贴 -->
        <div class="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <template v-for="item in pinnedItems" :key="item.id">
            <a
              v-if="'url' in item"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500 shadow-sm hover:shadow transition-all group"
            >
              <SiteIcon :name="item.name" :url="item.url" />
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ item.name }}
              </span>
            </a>
            <a
              v-else
              :href="toolPath(item.id) || '/'"
              class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500 shadow-sm hover:shadow transition-all group"
            >
              <SiteIcon :name="item.name" />
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ item.name }}
              </span>
            </a>
          </template>
        </div>
      </section>

      <!-- 模块 1：常用开发者小工具区域（当处于 all 或 tools 视图时渲染） -->
      <section v-if="store.activeTab === 'all' || store.activeTab === 'tools'" id="tools" class="scroll-mt-20">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <Wrench class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              纯前端离线小工具
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">
              数据 100% 本地
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          <a
            v-for="tool in store.defaultToolsRegistry"
            :key="tool.id"
            :href="toolPath(tool.id) || '/#tools'"
            class="group p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                <component :is="getToolIcon(tool.icon)" class="w-5 h-5" />
              </div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ tool.name }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {{ tool.desc }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-600">
              <span>立即使用</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </section>

      <!-- 模块 2：精选网址导航区域（当处于 all 或 nav 视图时渲染） -->
      <div v-if="store.activeTab === 'all' || store.activeTab === 'nav'">
        <!-- 自定义链接分类（如果有） -->
        <NavSection
          v-if="store.customLinks.length > 0"
          :category="{ id: 'custom', name: '我的自定义书签', icon: 'Globe', items: store.customLinks }"
        />

        <NavSection
          v-for="cat in store.defaultNavCategories"
          :key="cat.id"
          :category="cat"
        />
      </div>

      <!-- 模块 3：仅我的收藏视图 -->
      <section v-if="store.activeTab === 'pinned'" class="space-y-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Star class="w-5 h-5 text-amber-500 fill-amber-400" />
          <span>我置顶收藏的网站与工具</span>
        </h3>

        <div v-if="pinnedItems.length === 0" class="py-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p>暂无收藏项，在任意卡片点击右上角的星标即可将网站或工具置顶到此处。</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          <template v-for="item in pinnedItems" :key="item.id">
            <a
              v-if="'keywords' in item"
              :href="toolPath(item.id) || '/'"
              class="group relative flex items-start space-x-3 p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-md transition-all"
            >
              <div class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                <component :is="getToolIcon(item.icon)" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0 pr-8">
                <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate">
                  {{ item.name }}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {{ item.desc }}
                </p>
              </div>
              <button
                type="button"
                @click.stop.prevent="store.togglePin(item.id)"
                class="absolute top-2.5 right-2.5 p-1 rounded-md text-amber-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="取消置顶"
              >
                <Star class="w-4 h-4 fill-amber-400" />
              </button>
            </a>

            <NavCard
              v-else
              :item="item"
            />
          </template>
        </div>
      </section>
    </main>

    <!-- 页脚与隐私声明 -->
    <AppFooter />

    <!-- 模态框容器 -->
    <AddLinkModal :is-open="isAddLinkOpen" @close="isAddLinkOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Wrench,
  ArrowRight,
  Star,
  FileJson,
  Clock,
  KeyRound,
  Binary,
  Regex,
  CalendarClock,
  Fingerprint
} from 'lucide-vue-next'
import { useAppStore } from './stores/useAppStore'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import SearchBar from './components/search/SearchBar.vue'
import NavCard from './components/navigation/NavCard.vue'
import NavSection from './components/navigation/NavSection.vue'
import SiteIcon from './components/common/SiteIcon.vue'
import AddLinkModal from './components/modal/AddLinkModal.vue'
import { toolPath } from './utils/tool-routes'
import type { NavItem, ToolItem } from './types'

const store = useAppStore()

const isAddLinkOpen = ref(false)

const toolIcons: Record<string, any> = {
  FileJson,
  Clock,
  KeyRound,
  Binary,
  Regex,
  CalendarClock,
  Fingerprint
}

function getToolIcon(iconName: string) {
  return toolIcons[iconName] || Wrench
}

const allItems = computed(() => {
  const navItems = store.defaultNavCategories.flatMap(c => c.items)
  return [...store.customLinks, ...navItems]
})

const pinnedItems = computed(() => {
  const result: (NavItem | ToolItem)[] = []
  store.pinnedIds.forEach(id => {
    const tool = store.defaultToolsRegistry.find(t => t.id === id)
    if (tool) {
      result.push(tool)
      return
    }
    const nav = allItems.value.find(n => n.id === id)
    if (nav) {
      result.push(nav)
    }
  })
  return result
})
</script>
