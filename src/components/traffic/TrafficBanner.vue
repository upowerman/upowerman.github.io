<template>
  <div class="my-8 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary-500/10 to-teal-500/10 border border-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center space-x-4 text-center md:text-left">
      <div class="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
        <Sparkles class="w-6 h-6" />
      </div>
      <div>
        <h4 class="text-sm md:text-base font-bold text-slate-900 dark:text-white">
          想要收录你的独立产品或推荐实用工具？
        </h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          DevHub 坚持开源与免费共建，欢迎提交 PR、加入交流群或参与日常讨论！
        </p>
      </div>
    </div>

    <div class="flex items-center space-x-3 shrink-0">
      <button
        type="button"
        @click="$emit('open-community')"
        class="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
      >
        加入技术交流群
      </button>
      <a
        href="https://github.com/upowerman/upowerman.github.io"
        target="_blank"
        class="px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
      >
        GitHub 贡献 ⭐
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

defineEmits<{
  (e: 'open-community'): void
}>()
</script>
