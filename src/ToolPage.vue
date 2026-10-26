<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors selection:bg-primary-500 selection:text-white">
    <AppHeader tool-mode />

    <main
      :class="[
        'flex-1 w-full mx-auto px-4 sm:px-6 py-8 transition-all duration-300 ease-in-out',
        isWide ? 'max-w-7xl' : 'max-w-4xl'
      ]"
    >
      <!-- 面包屑与视图宽度切换 -->
      <div class="flex items-center justify-between mb-3">
        <nav aria-label="面包屑" class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <a href="/" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">DevHub 首页</a>
          <span aria-hidden="true">/</span>
          <a href="/#tools" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">开发者工具箱</a>
          <span aria-hidden="true">/</span>
          <span class="text-slate-700 dark:text-slate-300 font-medium">{{ tool?.name }}</span>
        </nav>

        <button
          type="button"
          @click="toggleWide"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-slate-600 dark:text-slate-300 transition-all shadow-xs"
          :title="isWide ? '切换至紧凑宽度' : '切换至宽屏工作台'"
        >
          <component :is="isWide ? Minimize2 : Maximize2" class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ isWide ? '紧凑视图' : '宽屏工作台' }}</span>
        </button>
      </div>

      <!-- 标题与简介 -->
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {{ content.h1 }}
      </h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {{ content.intro }}
      </p>

      <!-- 工具主体(首屏可见) -->
      <div v-if="toolComponent" class="mt-6 p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div class="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
            <component :is="activeIcon" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ tool?.name }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ tool?.desc }}</p>
          </div>
        </div>
        <component :is="toolComponent" />
      </div>

      <!-- 广告展示位（工具主卡片与下方速查表之间，保障高可见度同时避免误触） -->
      <AdBanner />

      <!-- 附加速查表 -->
      <section v-if="content.extra" class="mt-10 p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ content.extra.title }}</h2>
        <div class="overflow-x-auto -mx-1 px-1">
          <table class="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr class="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th v-for="h in content.extra.head" :key="h" class="py-2 pr-4 font-semibold whitespace-nowrap">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="text-slate-600 dark:text-slate-300">
              <tr v-for="(row, ri) in content.extra.rows" :key="ri" class="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td v-for="(cell, ci) in row" :key="ci" class="py-2.5 pr-4 align-top" :class="content.extra.monoCols?.includes(ci) ? 'font-mono text-primary-700 dark:text-primary-300 break-all' : ''">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 扩展速查表组 (如秒数换算等) -->
      <template v-if="content.extraSections">
        <section v-for="(sec, si) in content.extraSections" :key="si" class="mt-6 p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ sec.title }}</h2>
          <div class="overflow-x-auto -mx-1 px-1">
            <table class="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr class="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th v-for="h in sec.head" :key="h" class="py-2 pr-4 font-semibold whitespace-nowrap">{{ h }}</th>
                </tr>
              </thead>
              <tbody class="text-slate-600 dark:text-slate-300">
                <tr v-for="(row, ri) in sec.rows" :key="ri" class="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td v-for="(cell, ci) in row" :key="ci" class="py-2.5 pr-4 align-top" :class="sec.monoCols?.includes(ci) ? 'font-mono text-primary-700 dark:text-primary-300 break-all' : ''">
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <!-- FAQ(原生 details/summary,零 JS 可折叠) -->
      <section class="mt-10">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">常见问题</h2>
        <div class="space-y-2">
          <details v-for="(f, i) in content.faqs" :key="i" class="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <summary class="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ f.q }}</summary>
            <p class="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ f.a }}</p>
          </details>
        </div>
      </section>

      <!-- 其他工具互链 -->
      <section class="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 class="text-sm font-bold text-slate-900 dark:text-white mb-3">浏览更多 DevHub 生产力工具</h2>
        <div class="flex flex-wrap gap-2.5">
          <a
            v-for="other in otherTools"
            :key="other.id"
            :href="toolPath(other.id) || '/'"
            class="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ other.name }}
          </a>
          <a href="/" class="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors">返回 DevHub 首页</a>
        </div>
      </section>
    </main>

    <AppFooter />
    <GlobalToast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileJson,
  Clock,
  KeyRound,
  Binary,
  Regex,
  CalendarClock,
  Fingerprint,
  Palette,
  ShieldCheck,
  CaseUpper,
  Database,
  Terminal,
  GitCompare,
  Code2,
  Wrench,
  Maximize2,
  Minimize2
} from 'lucide-vue-next'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AdBanner from './components/common/AdBanner.vue'
import GlobalToast from './components/common/GlobalToast.vue'
import { useAppStore } from './stores/useAppStore'
import { toolPageContent } from './data/tool-pages'
import { toolComponents } from './data/tool-components'
import { toolPath } from './utils/tool-routes'

const props = defineProps<{
  toolId: string
}>()

const store = useAppStore()

const isWide = ref(false)
try {
  isWide.value = localStorage.getItem('devhub_tool_wide_mode') === 'true'
} catch {
  /* ignore */
}

function toggleWide() {
  isWide.value = !isWide.value
  try {
    localStorage.setItem('devhub_tool_wide_mode', String(isWide.value))
  } catch {
    /* ignore */
  }
}

const toolIcons: Record<string, any> = { FileJson, Clock, KeyRound, Binary, Regex, CalendarClock, Fingerprint, Palette, ShieldCheck, CaseUpper, Database, Terminal, GitCompare, Code2 }

const tool = computed(() => store.defaultToolsRegistry.find(t => t.id === props.toolId))
const content = computed(() => toolPageContent[props.toolId])
const toolComponent = computed(() => toolComponents[props.toolId] || null)
const activeIcon = computed(() => (tool.value && toolIcons[tool.value.icon]) || Wrench)
const otherTools = computed(() => store.defaultToolsRegistry.filter(t => t.id !== props.toolId))
</script>
