<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
      <!-- 装饰背景 -->
      <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-2xl"></div>

      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- 头部图标 -->
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 mb-3">
        <Users class="w-6 h-6" />
      </div>

      <h3 class="text-lg font-bold text-slate-900 dark:text-white">
        加入开发者技术社群
      </h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
        与 1000+ 独立开发者、全栈工程师一起交流技术、探讨出海灵感与实用工具
      </p>

      <!-- 福利清单 -->
      <div class="my-5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-left space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <div class="flex items-center space-x-2">
          <CheckCircle2 class="w-4 h-4 text-primary-600 shrink-0" />
          <span>每日精选 GitHub Trending 与 AI 前沿资讯</span>
        </div>
        <div class="flex items-center space-x-2">
          <CheckCircle2 class="w-4 h-4 text-primary-600 shrink-0" />
          <span>独立开发、SaaS 盈利与出海产品打法交流</span>
        </div>
        <div class="flex items-center space-x-2">
          <CheckCircle2 class="w-4 h-4 text-primary-600 shrink-0" />
          <span>DevHub 优先定制上线你所需的高频小工具</span>
        </div>
      </div>

      <!-- 加群方式 -->
      <div class="p-4 border border-dashed border-primary-300 dark:border-primary-800 rounded-xl bg-primary-50/50 dark:bg-primary-950/20">
        <div class="text-xs font-semibold text-primary-700 dark:text-primary-300">
          微信添加群助手备注「入群」：
        </div>
        <div class="flex items-center justify-center space-x-3 mt-2">
          <code class="px-3 py-1 rounded-md bg-white dark:bg-slate-800 font-mono text-sm font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
            upowerman
          </code>
          <button
            type="button"
            @click="copyWeChat"
            class="px-3 py-1 text-xs font-semibold rounded-md bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
          >
            {{ copied ? '已复制微信号!' : '一键复制' }}
          </button>
        </div>
      </div>

      <div class="mt-4 text-[11px] text-slate-400">
        关注公众号「极客工作台」获取出海产品工具包
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, Users, CheckCircle2 } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)

function copyWeChat() {
  navigator.clipboard.writeText('upowerman').then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>
