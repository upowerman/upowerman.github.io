<template>
  <div class="space-y-4">
    <!-- 控制栏：比对模式、选项与示例 -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="flex flex-wrap items-center gap-3">
        <!-- 视图模式 -->
        <div class="flex items-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-semibold">
          <button
            type="button"
            @click="viewMode = 'unified'"
            :class="viewMode === 'unified' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-600 dark:text-slate-300'"
            class="px-3 py-1.5 transition-colors"
          >
            单栏视图 (Unified)
          </button>
          <button
            type="button"
            @click="viewMode = 'patch'"
            :class="viewMode === 'patch' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-600 dark:text-slate-300'"
            class="px-3 py-1.5 transition-colors"
          >
            Git 补丁 (Patch)
          </button>
        </div>

        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
          <input v-model="ignoreWhitespace" type="checkbox" class="accent-primary-600" />
          <span>忽略首尾空白与缩进</span>
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="loadSample"
          class="px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
        >
          载入示例
        </button>
        <button
          type="button"
          @click="clearAll"
          class="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 输入双栏：原始文本 vs 目标文本 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 原始文本 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">原始版本 (Original / Old)</span>
          <span class="font-mono text-slate-400">{{ oldText.split('\n').length }} 行</span>
        </div>
        <textarea
          v-model="oldText"
          rows="8"
          placeholder="在此粘贴变更前的文本或代码..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        ></textarea>
      </div>

      <!-- 修改后文本 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">修改后版本 (Modified / New)</span>
          <span class="font-mono text-slate-400">{{ newText.split('\n').length }} 行</span>
        </div>
        <textarea
          v-model="newText"
          rows="8"
          placeholder="在此粘贴变更后的文本或代码..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        ></textarea>
      </div>
    </div>

    <!-- 差异统计条 -->
    <div class="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
      <div class="flex items-center gap-3 font-mono">
        <span class="text-emerald-600 dark:text-emerald-400 font-semibold">+{{ diffStats.added }} 新增</span>
        <span class="text-rose-600 dark:text-rose-400 font-semibold">-{{ diffStats.removed }} 删除</span>
        <span class="text-slate-500">{{ diffStats.unchanged }} 无变化</span>
      </div>
      <button
        v-if="viewMode === 'patch' && patchText"
        type="button"
        @click="copyPatch"
        class="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold"
      >
        {{ copiedPatch ? '已复制 Patch!' : '复制补丁文本' }}
      </button>
    </div>

    <!-- 差异对比渲染区域 -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <!-- 模式 1: 单栏统一视图 -->
      <div v-if="viewMode === 'unified'" class="overflow-x-auto max-h-[460px] divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
        <div
          v-for="(line, idx) in diffLinesResult"
          :key="idx"
          :class="[
            'flex items-stretch px-2 py-0.5 transition-colors',
            line.type === 'added' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' : '',
            line.type === 'removed' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through opacity-80' : '',
            line.type === 'unchanged' ? 'text-slate-700 dark:text-slate-300' : ''
          ]"
        >
          <!-- 旧行号 -->
          <span class="w-10 text-right pr-2 text-slate-400 select-none shrink-0 font-mono text-[11px]">
            {{ line.oldLineNumber || '' }}
          </span>
          <!-- 新行号 -->
          <span class="w-10 text-right pr-3 text-slate-400 select-none shrink-0 font-mono text-[11px] border-r border-slate-200 dark:border-slate-800">
            {{ line.newLineNumber || '' }}
          </span>
          <!-- 变动符号 -->
          <span class="w-6 text-center select-none shrink-0 font-bold">
            {{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}
          </span>
          <!-- 文本正文 -->
          <span class="whitespace-pre-wrap break-all flex-1">{{ line.value }}</span>
        </div>
        <div v-if="diffLinesResult.length === 0" class="p-8 text-center text-slate-400 text-xs">
          输入原始文本与新文本以计算差异
        </div>
      </div>

      <!-- 模式 2: Git Patch 文本 -->
      <div v-else class="p-3 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[460px]">
        <pre class="leading-relaxed">{{ patchText || '无任何差异内容' }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  computeLineDiff,
  computeUnifiedPatch
} from '../../utils/diff-utils'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const viewMode = ref<'unified' | 'patch'>('unified')
const ignoreWhitespace = ref(false)

const oldText = ref(
  `function calculateTotal(price, quantity) {
  const taxRate = 0.08;
  const subtotal = price * quantity;
  return subtotal + (subtotal * taxRate);
}`
)

const newText = ref(
  `function calculateTotal(price, quantity, discount = 0) {
  const taxRate = 0.08;
  const subtotal = (price * quantity) - discount;
  if (subtotal < 0) return 0;
  return subtotal + (subtotal * taxRate);
}`
)

const copiedPatch = ref(false)

const diffLinesResult = computed(() => {
  return computeLineDiff(oldText.value, newText.value, {
    ignoreWhitespace: ignoreWhitespace.value
  })
})

const patchText = computed(() => {
  if (!oldText.value && !newText.value) return ''
  return computeUnifiedPatch('snippet.js', oldText.value, newText.value)
})

const diffStats = computed(() => {
  let added = 0
  let removed = 0
  let unchanged = 0
  for (const item of diffLinesResult.value) {
    if (item.type === 'added') added++
    else if (item.type === 'removed') removed++
    else unchanged++
  }
  return { added, removed, unchanged }
})

function loadSample() {
  oldText.value = `{
  "server": "192.168.1.100",
  "port": 8080,
  "max_connections": 500,
  "enable_ssl": false
}`
  newText.value = `{
  "server": "api.prod.example.com",
  "port": 443,
  "max_connections": 2000,
  "enable_ssl": true,
  "timeout_seconds": 30
}`
}

function clearAll() {
  oldText.value = ''
  newText.value = ''
}

async function copyPatch() {
  if (!patchText.value) return
  await navigator.clipboard.writeText(patchText.value)
  copiedPatch.value = true
  toast.show('已复制标准 Git Patch 补丁到剪贴板！')
  setTimeout(() => (copiedPatch.value = false), 1800)
}
</script>
