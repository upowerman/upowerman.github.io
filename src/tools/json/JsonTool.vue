<template>
  <div class="flex flex-col h-full space-y-3">
    <!-- 工具操作栏 -->
    <div class="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
      <div class="flex items-center space-x-2">
        <button
          type="button"
          @click="handleFormat(2)"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
        >
          格式化 (2 空格)
        </button>
        <button
          type="button"
          @click="handleFormat(4)"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
        >
          格式化 (4 空格)
        </button>
        <button
          type="button"
          @click="handleCompress"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
        >
          单行压缩
        </button>
      </div>

      <div class="flex items-center space-x-2">
        <button
          type="button"
          @click="copyResult"
          class="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
        >
          <Copy class="w-3.5 h-3.5" />
          <span>{{ copied ? '已复制!' : '复制内容' }}</span>
        </button>
        <button
          type="button"
          @click="clear"
          class="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>清空</span>
        </button>
      </div>
    </div>

    <!-- 错误行提示 -->
    <div
      v-if="errorMessage"
      class="p-2.5 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center space-x-2"
    >
      <AlertCircle class="w-4 h-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- 编辑器主体 -->
    <div class="flex-1 min-h-[360px] relative">
      <textarea
        v-model="inputContent"
        placeholder="在此粘贴或输入 JSON 字符串..."
        class="w-full h-full min-h-[360px] p-4 font-mono text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-none leading-relaxed"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Trash2, AlertCircle } from 'lucide-vue-next'
import { formatJson, compressJson } from '../../utils/json-utils'

const inputContent = ref('{\n  "title": "DevHub",\n  "description": "专为开发者设计的高频工作台",\n  "version": 1,\n  "offline": true\n}')
const errorMessage = ref('')
const copied = ref(false)

function handleFormat(indent: number = 2) {
  errorMessage.value = ''
  const res = formatJson(inputContent.value, indent)
  if (res.success) {
    inputContent.value = res.result
  } else {
    errorMessage.value = res.error || 'JSON 解析失败'
  }
}

function handleCompress() {
  errorMessage.value = ''
  const res = compressJson(inputContent.value)
  if (res.success) {
    inputContent.value = res.result
  } else {
    errorMessage.value = res.error || 'JSON 解析失败'
  }
}

function copyResult() {
  if (!inputContent.value) return
  navigator.clipboard.writeText(inputContent.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}

function clear() {
  inputContent.value = ''
  errorMessage.value = ''
}
</script>
