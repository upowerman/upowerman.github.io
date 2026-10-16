<template>
  <div class="space-y-6">
    <!-- 当前时间戳看板 -->
    <div class="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-4">
      <div>
        <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">当前 Unix 时间戳</div>
        <div class="flex items-center space-x-3 mt-1">
          <span class="text-xl md:text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
            {{ currentSeconds }}
          </span>
          <span class="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-mono">
            秒 (s)
          </span>
          <span class="text-sm font-mono text-slate-400">
            {{ currentMilliseconds }} ms
          </span>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          @click="toggleTicker"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {{ isRunning ? '暂停刷新' : '恢复刷新' }}
        </button>
        <button
          type="button"
          @click="copyCurrent"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          {{ copied ? '已复制!' : '复制秒时间戳' }}
        </button>
      </div>
    </div>

    <!-- 时间戳转日期 -->
    <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">时间戳 转换为 北京时间 / UTC</h4>
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="inputTimestamp"
          type="text"
          placeholder="输入时间戳 (秒或毫秒)"
          class="flex-1 min-w-[200px] px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          v-model="selectedUnit"
          class="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
        >
          <option value="s">秒 (10位)</option>
          <option value="ms">毫秒 (13位)</option>
        </select>
        <button
          type="button"
          @click="setNowToInput"
          class="px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          设为当前时间
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
        <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span class="text-slate-400">北京时间 (Local):</span>
          <div class="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{{ convertedDate.local }}</div>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span class="text-slate-400">ISO 8601 (UTC):</span>
          <div class="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{{ convertedDate.iso || '-' }}</div>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span class="text-slate-400">相对时间:</span>
          <div class="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5">{{ convertedDate.relative || '-' }}</div>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span class="text-slate-400">UTC 格式:</span>
          <div class="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">{{ convertedDate.utc || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- 日期转时间戳 -->
    <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">日期 转换为 时间戳</h4>
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="inputDateStr"
          type="text"
          placeholder="例如: 2026-10-16 12:00:00"
          class="flex-1 min-w-[200px] px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          @click="setDateNow"
          class="px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          填入当前
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
        <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span class="text-slate-400">秒时间戳 (10位):</span>
          <div class="font-mono font-medium text-primary-600 dark:text-primary-400 mt-0.5">{{ convertedTimestamp.seconds }}</div>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <span class="text-slate-400">毫秒时间戳 (13位):</span>
          <div class="font-mono font-medium text-primary-600 dark:text-primary-400 mt-0.5">{{ convertedTimestamp.milliseconds }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { timestampToDate, dateToTimestamp } from '../../utils/timestamp-utils'

const currentSeconds = ref(Math.floor(Date.now() / 1000))
const currentMilliseconds = ref(Date.now())
const isRunning = ref(true)
const copied = ref(false)
let timer: any = null

const inputTimestamp = ref(String(Math.floor(Date.now() / 1000)))
const selectedUnit = ref<'s' | 'ms'>('s')
const inputDateStr = ref(new Date().toISOString().replace('T', ' ').slice(0, 19))

onMounted(() => {
  timer = setInterval(() => {
    if (isRunning.value) {
      const now = Date.now()
      currentMilliseconds.value = now
      currentSeconds.value = Math.floor(now / 1000)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function toggleTicker() {
  isRunning.value = !isRunning.value
}

function copyCurrent() {
  navigator.clipboard.writeText(String(currentSeconds.value)).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}

function setNowToInput() {
  inputTimestamp.value = String(currentSeconds.value)
  selectedUnit.value = 's'
}

function setDateNow() {
  inputDateStr.value = new Date().toISOString().replace('T', ' ').slice(0, 19)
}

const convertedDate = computed(() => {
  const num = Number(inputTimestamp.value.trim())
  return timestampToDate(num, selectedUnit.value)
})

const convertedTimestamp = computed(() => {
  return dateToTimestamp(inputDateStr.value.trim())
})
</script>
