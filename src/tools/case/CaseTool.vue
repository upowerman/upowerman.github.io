<template>
  <div class="space-y-4">
    <!-- 模式切换与快速示例 -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
      <div class="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
        <button
          type="button"
          @click="activeMode = 'all'"
          :class="[
            'px-3.5 py-1.5 rounded-md transition-colors',
            activeMode === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          全风格卡片速览
        </button>
        <button
          type="button"
          @click="activeMode = 'batch'"
          :class="[
            'px-3.5 py-1.5 rounded-md transition-colors',
            activeMode === 'batch'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          批量多行转换
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 hidden sm:inline">快速示例:</span>
        <button
          v-for="sample in samples"
          :key="sample"
          type="button"
          @click="loadSample(sample)"
          class="px-2.5 py-1 text-xs font-mono rounded-lg text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        >
          {{ sample }}
        </button>
        <button
          type="button"
          @click="clearInput"
          class="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 模式 1: 全风格卡片速览 -->
    <div v-if="activeMode === 'all'" class="space-y-4">
      <div>
        <div class="flex items-center justify-between mb-1.5 text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">输入任意变量名、单词或文本短句</span>
          <span class="font-mono text-slate-400">{{ singleInput.length }} 字符</span>
        </div>
        <input
          v-model="singleInput"
          type="text"
          placeholder="在此输入待转换的名称 (支持自动识别驼峰、下划线、短横线、空格与缩写词)..."
          class="w-full px-3.5 py-2.5 font-mono text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- 8种格式卡片网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="card in caseCards"
          :key="card.key"
          class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-primary-400 dark:hover:border-primary-600 transition-colors group"
        >
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ card.title }}</span>
              <button
                type="button"
                @click="copyText(allResults[card.key], card.key)"
                class="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                {{ copiedKey === card.key ? '已复制!' : '复制' }}
              </button>
            </div>
            <p class="text-[11px] text-slate-400 mb-2 leading-tight">{{ card.desc }}</p>
          </div>
          <div
            @click="copyText(allResults[card.key], card.key)"
            class="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-100 break-all select-all cursor-pointer hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
          >
            {{ allResults[card.key] || '等待输入...' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 模式 2: 批量多行转换 -->
    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">目标命名规范:</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="card in caseCards"
            :key="card.key"
            type="button"
            @click="batchTarget = card.key"
            :class="[
              'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
              batchTarget === card.key
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
          >
            {{ card.title }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 批量输入 -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span class="font-semibold text-slate-700 dark:text-slate-300">多行源文本 (每行一条)</span>
            <span class="font-mono text-slate-400">{{ batchInputLines }} 行</span>
          </div>
          <textarea
            v-model="batchInput"
            rows="10"
            placeholder="在此粘贴多行待转换的变量或字段名，例如：&#10;user_account_id&#10;user_full_name&#10;total_pay_amount&#10;is_active"
            class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          ></textarea>
        </div>

        <!-- 批量输出 -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span class="font-semibold text-slate-700 dark:text-slate-300">转换后文本</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-slate-400">{{ batchOutputLines }} 行</span>
              <button
                v-if="batchOutput"
                type="button"
                @click="copyBatch"
                class="hover:text-primary-600 font-semibold text-primary-600 dark:text-primary-400 text-xs"
              >
                {{ copiedBatch ? '已复制!' : '复制全部' }}
              </button>
            </div>
          </div>
          <textarea
            :value="batchOutput"
            readonly
            rows="10"
            placeholder="转换后的文本将在此显示..."
            class="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 outline-none resize-y"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  convertAllCases,
  convertBatchText,
  type NamingCaseType
} from '../../utils/case-utils'

const activeMode = ref<'all' | 'batch'>('all')
const singleInput = ref('user_account_balance')
const copiedKey = ref('')

const batchInput = ref('user_account_id\nuser_full_name\ntotal_pay_amount\nis_active\ncreated_at')
const batchTarget = ref<NamingCaseType>('camelCase')
const copiedBatch = ref(false)

const samples = ['user_account_id', 'getHTTPResponse', 'system-config', 'USER_TOKEN']

const caseCards: Array<{ key: NamingCaseType; title: string; desc: string }> = [
  { key: 'camelCase', title: '小驼峰 camelCase', desc: 'JS/TS/Java 变量与方法名' },
  { key: 'pascalCase', title: '大驼峰 PascalCase', desc: '类名 / TS接口 / React组件' },
  { key: 'snakeCase', title: '下划线 snake_case', desc: 'Python / Rust / 数据库字段' },
  { key: 'kebabCase', title: '短横线 kebab-case', desc: 'CSS类名 / URL路径 / 文件名' },
  { key: 'constantCase', title: '大写常量 CONSTANT', desc: '全局常量 / 环境变量 / 枚举' },
  { key: 'titleCase', title: '标题词 Title Case', desc: '文档大纲 / 界面标题' },
  { key: 'dotCase', title: '点号 dot.case', desc: '配置文件键 / i18n 翻译键' },
  { key: 'pathCase', title: '路径 path/case', desc: '模块文件路径 / 路由层级' }
]

const allResults = computed(() => {
  return convertAllCases(singleInput.value)
})

const batchOutput = computed(() => {
  return convertBatchText(batchInput.value, batchTarget.value)
})

const batchInputLines = computed(() => {
  if (!batchInput.value.trim()) return 0
  return batchInput.value.split('\n').length
})

const batchOutputLines = computed(() => {
  if (!batchOutput.value.trim()) return 0
  return batchOutput.value.split('\n').length
})

function loadSample(sample: string) {
  if (activeMode.value === 'all') {
    singleInput.value = sample
  } else {
    batchInput.value = `${sample}\n${sample}_detail\n${sample}_list`
  }
}

function clearInput() {
  if (activeMode.value === 'all') {
    singleInput.value = ''
  } else {
    batchInput.value = ''
  }
}

async function copyText(text: string, key: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copiedKey.value = key
  setTimeout(() => {
    if (copiedKey.value === key) copiedKey.value = ''
  }, 1800)
}

async function copyBatch() {
  if (!batchOutput.value) return
  await navigator.clipboard.writeText(batchOutput.value)
  copiedBatch.value = true
  setTimeout(() => (copiedBatch.value = false), 1800)
}
</script>
