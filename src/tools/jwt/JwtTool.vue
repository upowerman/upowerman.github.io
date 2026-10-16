<template>
  <div class="space-y-4">
    <!-- 输入框 -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">粘贴 JWT Token (Encoded)</label>
        <button
          type="button"
          @click="loadSampleToken"
          class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          载入测试 Token
        </button>
      </div>
      <textarea
        v-model="tokenInput"
        placeholder="在此粘贴 JWT Token（以三个句号分隔，如 eyJhbGci...）"
        rows="4"
        class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-none break-all"
      ></textarea>
    </div>

    <!-- 状态指示 -->
    <div v-if="decodedResult.error" class="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
      {{ decodedResult.error }}
    </div>

    <div v-else-if="decodedResult.valid" class="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 gap-2">
      <div class="flex items-center space-x-2">
        <span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          格式有效
        </span>
        <span
          :class="[
            'px-2 py-0.5 text-xs font-bold rounded',
            decodedResult.isExpired
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
          ]"
        >
          {{ decodedResult.isExpired ? '已过期' : '有效期内' }}
        </span>
      </div>

      <div v-if="decodedResult.expDate" class="text-xs text-slate-500 dark:text-slate-400">
        过期时间: <span class="font-mono text-slate-700 dark:text-slate-200">{{ decodedResult.expDate }}</span>
      </div>
    </div>

    <!-- 解析结果 Header & Payload -->
    <div v-if="decodedResult.valid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-rose-500">
          <span>HEADER (算法与令牌类型)</span>
          <span class="font-mono">{{ decodedResult.header?.alg }}</span>
        </div>
        <pre class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">{{ JSON.stringify(decodedResult.header, null, 2) }}</pre>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-purple-500">
          <span>PAYLOAD (数据与标准声明)</span>
          <span v-if="decodedResult.payload?.sub" class="font-mono truncate max-w-[150px]">sub: {{ decodedResult.payload.sub }}</span>
        </div>
        <pre class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-[300px]">{{ JSON.stringify(decodedResult.payload, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { decodeJwt } from '../../utils/jwt-utils'

const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZodWItMTIzNCIsIm5hbWUiOiJEZXZlbG9wZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTgwMDAwMDAwMH0.signature'
const tokenInput = ref(sampleToken)

function loadSampleToken() {
  tokenInput.value = sampleToken
}

const decodedResult = computed(() => {
  return decodeJwt(tokenInput.value)
})
</script>
