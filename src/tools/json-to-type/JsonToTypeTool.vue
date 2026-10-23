<template>
  <div class="space-y-4">
    <!-- 顶部目标语言选择、根类型名称与快捷操作 -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="flex flex-wrap items-center gap-3">
        <!-- 语言选择 -->
        <div class="flex items-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-semibold">
          <button
            type="button"
            @click="targetLang = 'typescript'"
            :class="targetLang === 'typescript' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-600 dark:text-slate-300'"
            class="px-3 py-1.5 transition-colors"
          >
            TypeScript (Interface)
          </button>
          <button
            type="button"
            @click="targetLang = 'go'"
            :class="targetLang === 'go' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-600 dark:text-slate-300'"
            class="px-3 py-1.5 transition-colors"
          >
            Go (Struct)
          </button>
          <button
            type="button"
            @click="targetLang = 'python'"
            :class="targetLang === 'python' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-600 dark:text-slate-300'"
            class="px-3 py-1.5 transition-colors"
          >
            Python (Pydantic)
          </button>
        </div>

        <!-- 根类名 -->
        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span class="font-semibold">根类型名:</span>
          <input
            v-model="rootName"
            type="text"
            placeholder="如 Root / UserResponse"
            class="w-32 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          />
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="loadSample"
          class="px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
        >
          载入示例 JSON
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

    <!-- 错误异常提示 -->
    <div
      v-if="errorMessage"
      class="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center justify-between"
    >
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="text-rose-500 hover:underline ml-2">关闭</button>
    </div>

    <!-- 输入与输出双栏 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 输入面板 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">源 JSON 数据</span>
          <span class="font-mono text-slate-400">{{ inputJson.length }} 字符</span>
        </div>
        <textarea
          v-model="inputJson"
          rows="15"
          placeholder="在此粘贴任意 JSON 数据对象或数组..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        ></textarea>
      </div>

      <!-- 输出面板 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">生成的类型声明代码</span>
          <div class="flex items-center gap-2">
            <button
              v-if="outputCode"
              type="button"
              @click="copyResult"
              class="hover:text-primary-600 font-semibold text-primary-600 dark:text-primary-400 text-xs"
            >
              {{ copied ? '已复制类型代码!' : '复制代码' }}
            </button>
          </div>
        </div>
        <textarea
          :value="outputCode"
          readonly
          rows="15"
          placeholder="转换后的类型定义代码将在此显示..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 outline-none resize-y"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  jsonToTypeScript,
  jsonToGo,
  jsonToPython,
  type TargetTypeLanguage
} from '../../utils/json-to-type-utils'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const targetLang = ref<TargetTypeLanguage>('typescript')
const rootName = ref('UserProfile')
const inputJson = ref(
  JSON.stringify(
    {
      user_id: 1001,
      username: 'devhub_developer',
      email: 'alex@example.com',
      is_active: true,
      account_balance: 520.85,
      skills: ['Vue', 'TypeScript', 'Go', 'Docker'],
      department: {
        id: 42,
        name: 'Infrastructure & Tooling',
        leader: 'Sarah'
      }
    },
    null,
    2
  )
)

const outputCode = ref('')
const errorMessage = ref('')
const copied = ref(false)

function convert() {
  errorMessage.value = ''
  if (!inputJson.value.trim()) {
    outputCode.value = ''
    return
  }

  const name = rootName.value.trim() || 'Root'
  if (targetLang.value === 'typescript') {
    const res = jsonToTypeScript(inputJson.value, name)
    if (res.success) outputCode.value = res.code
    else {
      outputCode.value = ''
      errorMessage.value = res.error || 'JSON 解析失败'
    }
  } else if (targetLang.value === 'go') {
    const res = jsonToGo(inputJson.value, name)
    if (res.success) outputCode.value = res.code
    else {
      outputCode.value = ''
      errorMessage.value = res.error || 'JSON 解析失败'
    }
  } else {
    const res = jsonToPython(inputJson.value, name)
    if (res.success) outputCode.value = res.code
    else {
      outputCode.value = ''
      errorMessage.value = res.error || 'JSON 解析失败'
    }
  }
}

function loadSample() {
  inputJson.value = JSON.stringify(
    {
      order_id: 'ORD-2026-9988',
      total_amount: 149.9,
      currency: 'USD',
      items: [
        { product_id: 'PROD-1', quantity: 2, unit_price: 49.95 },
        { product_id: 'PROD-2', quantity: 1, unit_price: 50.0 }
      ],
      shipping: {
        recipient: 'DevHub User',
        city: 'Shanghai',
        is_express: true
      }
    },
    null,
    2
  )
  rootName.value = 'OrderResponse'
  convert()
}

function clearAll() {
  inputJson.value = ''
  outputCode.value = ''
  errorMessage.value = ''
}

async function copyResult() {
  if (!outputCode.value) return
  await navigator.clipboard.writeText(outputCode.value)
  copied.value = true
  toast.show(`已复制 ${targetLang.value.toUpperCase()} 类型声明！`)
  setTimeout(() => (copied.value = false), 1800)
}

watch([inputJson, targetLang, rootName], () => {
  convert()
})

onMounted(() => {
  convert()
})
</script>
