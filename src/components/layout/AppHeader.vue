<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- 品牌 Logo -->
      <div class="flex items-center space-x-3 cursor-pointer" @click="store.setActiveTab('all')">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
          <Terminal class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center space-x-1.5">
            <span class="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              DevHub
            </span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold uppercase">
              Pro
            </span>
          </div>
          <span class="hidden sm:block text-[11px] text-slate-400 font-medium leading-none">
            程序员复合型工作台
          </span>
        </div>
      </div>

      <!-- 视图切换 Tab -->
      <nav class="hidden md:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-semibold">
        <button
          type="button"
          @click="store.setActiveTab('all')"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all',
            store.activeTab === 'all'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          综合看板
        </button>
        <button
          type="button"
          @click="store.setActiveTab('nav')"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all',
            store.activeTab === 'nav'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          资源导航
        </button>
        <button
          type="button"
          @click="store.setActiveTab('tools')"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all',
            store.activeTab === 'tools'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          开发工具箱
        </button>
        <button
          type="button"
          @click="store.setActiveTab('pinned')"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1',
            store.activeTab === 'pinned'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Star class="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>我的收藏</span>
        </button>
      </nav>

      <!-- 右侧动作区 -->
      <div class="flex items-center space-x-2">
        <!-- 添加自定义书签 -->
        <button
          type="button"
          @click="$emit('open-add-link')"
          class="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          title="添加自定义书签"
        >
          <Plus class="w-3.5 h-3.5 text-primary-600" />
          <span>添加书签</span>
        </button>

        <!-- 社群交流入口（导流核心） -->
        <button
          type="button"
          @click="$emit('open-community')"
          class="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800"
        >
          <Users class="w-3.5 h-3.5" />
          <span>交流群 / 资源</span>
        </button>

        <!-- GitHub 仓库 -->
        <a
          href="https://github.com/upowerman/upowerman.github.io"
          target="_blank"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          title="GitHub 开源仓库"
        >
          <Github class="w-4 h-4" />
        </a>

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
  </header>
</template>

<script setup lang="ts">
import { Terminal, Star, Plus, Users, Github, Sun, Moon } from 'lucide-vue-next'
import { useAppStore } from '../../stores/useAppStore'

defineEmits<{
  (e: 'open-add-link'): void
  (e: 'open-community'): void
}>()

const store = useAppStore()
</script>
