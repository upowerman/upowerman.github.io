<template>
  <div class="space-y-4">
    <!-- 子功能选择 -->
    <div class="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
      <button
        v-for="tab in subTabs"
        :key="tab.id"
        type="button"
        @click="activeSubTab = tab.id"
        :class="[
          'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
          activeSubTab === tab.id
            ? 'bg-primary-600 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 输入区 -->
    <div>
      <div class="flex items-center justify-between mb-1 text-xs text-slate-500">
        <span>输入文本</span>
        <button type="button" @click="input = ''" class="hover:text-rose-500">清空</button>
      </div>
      <textarea
        v-model="input"
        placeholder="在此输入需要处理的文本..."
        rows="3"
        class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
      ></textarea>
    </div>

    <!-- 操作按钮 (Base64 / URL 模式) -->
    <div v-if="activeSubTab !== 'hash'" class="flex items-center space-x-2">
      <button
        type="button"
        @click="handleEncode"
        class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
      >
        编码 (Encode)
      </button>
      <button
        type="button"
        @click="handleDecode"
        class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
      >
        解码 (Decode)
      </button>
    </div>

    <!-- 输出区 (Base64 / URL 模式) -->
    <div v-if="activeSubTab !== 'hash'">
      <div class="flex items-center justify-between mb-1 text-xs text-slate-500">
        <span>转换结果</span>
        <button type="button" @click="copyResult" class="hover:text-primary-600 text-xs font-medium">
          {{ copied ? '已复制!' : '复制结果' }}
        </button>
      </div>
      <textarea
        v-model="output"
        readonly
        placeholder="转换结果将在此显示..."
        rows="3"
        class="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
      ></textarea>
    </div>

    <!-- 哈希计算结果展示 -->
    <div v-else class="space-y-3">
      <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div class="text-xs font-bold text-slate-500 mb-1">MD5 (32位 小写)</div>
        <div class="flex items-center justify-between font-mono text-xs text-slate-800 dark:text-slate-200">
          <span class="break-all">{{ hashes.md5 || '请输入文本以计算' }}</span>
          <button v-if="hashes.md5" @click="copyText(hashes.md5)" class="ml-2 text-primary-600 shrink-0">复制</button>
        </div>
      </div>

      <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div class="text-xs font-bold text-slate-500 mb-1">SHA-256 (64位 小写)</div>
        <div class="flex items-center justify-between font-mono text-xs text-slate-800 dark:text-slate-200">
          <span class="break-all">{{ hashes.sha256 || '请输入文本以计算' }}</span>
          <button v-if="hashes.sha256" @click="copyText(hashes.sha256)" class="ml-2 text-primary-600 shrink-0">复制</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { safeBase64Encode, safeBase64Decode, safeUrlEncode, safeUrlDecode, calculateHashes } from '../../utils/codec-utils'

const subTabs = [
  { id: 'base64', label: 'Base64 编解码' },
  { id: 'url', label: 'URL 编解码' },
  { id: 'hash', label: 'MD5 / SHA256 哈希' }
]

const activeSubTab = ref('base64')
const input = ref('Hello DevHub')
const output = ref(safeBase64Encode('Hello DevHub'))
const copied = ref(false)

function handleEncode() {
  if (activeSubTab.value === 'base64') {
    output.value = safeBase64Encode(input.value)
  } else if (activeSubTab.value === 'url') {
    output.value = safeUrlEncode(input.value)
  }
}

function handleDecode() {
  if (activeSubTab.value === 'base64') {
    output.value = safeBase64Decode(input.value)
  } else if (activeSubTab.value === 'url') {
    output.value = safeUrlDecode(input.value)
  }
}

const hashes = computed(() => {
  return calculateHashes(input.value)
})

function copyResult() {
  copyText(output.value)
}

function copyText(str: string) {
  if (!str) return
  navigator.clipboard.writeText(str).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>
