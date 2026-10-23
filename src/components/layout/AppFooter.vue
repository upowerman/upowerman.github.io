<template>
  <footer class="mt-20 border-t border-slate-200/80 dark:border-slate-800/80 py-10 bg-slate-100/50 dark:bg-slate-950/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
      <div class="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <a href="https://github.com/upowerman/upowerman.github.io" target="_blank" class="hover:text-primary-600 transition-colors">
          GitHub 源码仓库
        </a>
        <a href="https://github.com/upowerman/upowerman.github.io/issues" target="_blank" class="hover:text-primary-600 transition-colors">
          提交新网站 / 工具建议
        </a>
      </div>

      <div class="text-xs text-slate-500 dark:text-slate-400">
        <p class="flex items-center justify-center gap-1.5">
          <Lock class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>隐私保证：所有内置小工具均为纯前端运行，数据 100% 留存在您的本地浏览器，绝不上报服务器。</span>
        </p>
        <p class="mt-1">
          © {{ currentYear }} <a href="https://yunitytech.top" class="hover:underline font-medium text-slate-600 dark:text-slate-400">yunitytech.top</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Lock } from 'lucide-vue-next'

const currentYear = computed(() => new Date().getFullYear())
</script>
