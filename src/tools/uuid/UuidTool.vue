<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
      <div class="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-semibold">
        <button
          type="button"
          @click="version = 'v4'"
          :class="version === 'v4' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
          class="px-3 py-1.5 transition-colors"
        >
          v4 随机
        </button>
        <button
          type="button"
          @click="version = 'v7'"
          :class="version === 'v7' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
          class="px-3 py-1.5 transition-colors"
        >
          v7 有序
        </button>
      </div>
      <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
        数量
        <input
          v-model.number="count"
          type="number"
          min="1"
          max="100"
          class="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </label>
      <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
        <input v-model="uppercase" type="checkbox" class="accent-primary-600" />大写
      </label>
      <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
        <input v-model="hyphens" type="checkbox" class="accent-primary-600" />连字符
      </label>
      <button
        type="button"
        @click="generate"
        class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
      >
        生成
      </button>
      <button
        v-if="list.length"
        type="button"
        @click="copyAll"
        class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
      >
        {{ copiedAll ? '已全部复制!' : '复制全部' }}
      </button>
    </div>

    <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
      <div v-for="(u, i) in list" :key="i" class="flex items-center justify-between py-1.5 gap-2">
        <code class="text-xs font-mono text-slate-700 dark:text-slate-200 break-all">{{ u }}</code>
        <button type="button" @click="copyOne(u)" class="text-xs text-primary-600 dark:text-primary-400 hover:underline shrink-0">
          {{ copied === u ? '已复制' : '复制' }}
        </button>
      </div>
      <p v-if="list.length === 0" class="text-slate-500 dark:text-slate-400 text-xs text-center py-4">
        点击"生成"批量创建 {{ version.toUpperCase() }} UUID
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateUuids, formatUuid } from '../../utils/uuid-utils'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const version = ref<'v4' | 'v7'>('v4')
const count = ref(10)
const uppercase = ref(false)
const hyphens = ref(true)
const list = ref<string[]>([])
const copied = ref('')
const copiedAll = ref(false)

onMounted(generate)

function generate() {
  list.value = generateUuids(version.value, count.value).map(u =>
    formatUuid(u, { uppercase: uppercase.value, hyphens: hyphens.value })
  )
}

function copyOne(u: string) {
  navigator.clipboard.writeText(u).then(() => {
    copied.value = u
    toast.show(`已复制 UUID: ${u.slice(0, 8)}...`)
    setTimeout(() => (copied.value = ''), 1500)
  })
}

function copyAll() {
  navigator.clipboard.writeText(list.value.join('\n')).then(() => {
    copiedAll.value = true
    toast.show(`已复制全部 ${list.value.length} 个 UUID！`)
    setTimeout(() => (copiedAll.value = false), 1500)
  })
}
</script>
