<template>
  <div class="space-y-4">
    <div>
      <div class="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Cron 表达式</div>
      <input
        v-model="expr"
        type="text"
        placeholder="例如: */5 * * * *"
        data-autofocus
        class="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
      />
      <div class="flex flex-wrap gap-2 mt-2">
        <button
          v-for="p in presets"
          :key="p.expr"
          type="button"
          @click="expr = p.expr"
          :class="expr === p.expr ? 'border-primary-500 text-primary-600 dark:text-primary-400' : ''"
          class="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="result.error" class="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
      {{ result.error }}
    </div>

    <div v-else-if="result.unsupported" class="p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
      {{ result.unsupported }}
    </div>

    <div v-else class="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
      <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">人类可读描述</div>
      <div class="text-sm md:text-base font-semibold text-primary-700 dark:text-primary-300 mt-1">{{ result.text }}</div>
    </div>

    <div v-if="runs.length" class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">未来 5 次执行时间(本地时区)</div>
      <ol class="space-y-1.5">
        <li v-for="(d, i) in runs" :key="i" class="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
          <span>{{ pad(d.getMonth() + 1) }}-{{ pad(d.getDate()) }} {{ pad(d.getHours()) }}:{{ pad(d.getMinutes()) }}:{{ pad(d.getSeconds()) }} (周{{ '日一二三四五六'[d.getDay()] }})</span>
          <button type="button" @click="copy(d.toISOString())" class="text-primary-600 dark:text-primary-400 hover:underline">复制</button>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { describeCron, nextRuns } from '../../utils/cron-utils'

const presets = [
  { label: '每分钟', expr: '* * * * *' },
  { label: '每 5 分钟', expr: '*/5 * * * *' },
  { label: '每小时', expr: '0 * * * *' },
  { label: '每天 03:00', expr: '0 3 * * *' },
  { label: '工作日 09:00', expr: '0 9 * * 1-5' },
  { label: '每周一 09:00', expr: '0 9 * * 1' },
  { label: '每月 1 号', expr: '0 0 1 * *' }
]

const expr = ref('*/5 * * * *')

const result = computed(() => describeCron(expr.value))
const runs = computed(() => (result.value.valid ? nextRuns(expr.value, 5) : []))

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function copy(s: string) {
  navigator.clipboard.writeText(s)
}
</script>
