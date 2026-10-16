<template>
  <div class="space-y-4">
    <!-- 常用预置模板 -->
    <div>
      <div class="text-xs font-semibold text-slate-500 mb-2">常用正则表达式模板</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(tpl, key) in commonRegexTemplates"
          :key="key"
          type="button"
          @click="applyTemplate(tpl.pattern)"
          class="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          :title="tpl.desc"
        >
          {{ tpl.label }}
        </button>
      </div>
    </div>

    <!-- 正则表达式输入 -->
    <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
      <div class="flex items-center space-x-2">
        <span class="font-mono text-slate-400 text-sm">/</span>
        <input
          v-model="pattern"
          type="text"
          placeholder="输入正则表达式模式..."
          class="flex-1 px-2 py-1.5 font-mono text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
        />
        <span class="font-mono text-slate-400 text-sm">/</span>
        <input
          v-model="flags"
          type="text"
          placeholder="flags"
          class="w-16 px-2 py-1.5 font-mono text-sm bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 outline-none text-center"
        />
      </div>

      <div v-if="testResult.error" class="text-xs text-rose-500 font-medium">
        {{ testResult.error }}
      </div>
    </div>

    <!-- 测试文本与匹配结果 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div class="flex items-center justify-between mb-1.5 text-xs text-slate-500">
          <span>待测试文本</span>
          <button type="button" @click="testText = ''" class="hover:text-rose-500">清空</button>
        </div>
        <textarea
          v-model="testText"
          rows="6"
          placeholder="输入待测试的目标字符串..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
        ></textarea>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5 text-xs text-slate-500">
          <span>匹配结果 (共 {{ testResult.matches.length }} 项)</span>
        </div>
        <div class="p-3 h-[142px] font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-y-auto space-y-1.5">
          <div
            v-for="(match, idx) in testResult.matches"
            :key="idx"
            class="px-2 py-1 rounded bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-900 break-all"
          >
            #{{ idx + 1 }}: {{ match }}
          </div>
          <div v-if="testResult.matches.length === 0" class="text-slate-400 py-4 text-center">
            暂无匹配项
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import { testRegex, commonRegexTemplates } from '../../utils/regex-utils'

const pattern = ref(commonRegexTemplates.email.pattern)
const flags = ref('g')
const testText = ref('你好，欢迎联系 devhub@yunitytech.top 或 support@github.com！')

const debouncedPattern = refDebounced(pattern, 200)
const debouncedFlags = refDebounced(flags, 200)
const debouncedTestText = refDebounced(testText, 200)

function applyTemplate(tplPattern: string) {
  pattern.value = tplPattern
}

const testResult = computed(() => {
  return testRegex(debouncedPattern.value, debouncedFlags.value, debouncedTestText.value)
})
</script>
