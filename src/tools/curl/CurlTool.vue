<template>
  <div class="space-y-4">
    <!-- 顶部目标语言选择与快速示例 -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1">生成目标代码:</span>
        <button
          v-for="lang in languageList"
          :key="lang.id"
          type="button"
          @click="activeLang = lang.id"
          :class="[
            'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors',
            activeLang === lang.id
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          ]"
        >
          {{ lang.name }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 hidden sm:inline">示例:</span>
        <button
          type="button"
          @click="loadSample('get')"
          class="px-2.5 py-1 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
        >
          GET 接口
        </button>
        <button
          type="button"
          @click="loadSample('post')"
          class="px-2.5 py-1 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
        >
          POST JSON
        </button>
        <button
          type="button"
          @click="clearAll"
          class="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 错误警告提示 -->
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
          <span class="font-semibold text-slate-700 dark:text-slate-300">粘贴 cURL 命令行</span>
          <span class="text-[11px] text-slate-400">支持多行反斜杠 (\) 拼接</span>
        </div>
        <textarea
          v-model="inputCurl"
          rows="14"
          placeholder="在此粘贴从浏览器开发者工具或 Postman 复制的 cURL 命令，如：&#10;curl 'https://api.example.com/v1/users' \&#10;  -H 'Authorization: Bearer token123' \&#10;  -H 'Content-Type: application/json' \&#10;  -d '{&quot;name&quot;:&quot;devhub&quot;}'"
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        ></textarea>
      </div>

      <!-- 输出面板 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">生成的生产级目标代码</span>
          <div class="flex items-center gap-2">
            <button
              v-if="generatedCode"
              type="button"
              @click="copyCode"
              class="hover:text-primary-600 font-semibold text-primary-600 dark:text-primary-400 text-xs"
            >
              {{ copied ? '已复制代码!' : '复制代码' }}
            </button>
          </div>
        </div>
        <textarea
          :value="generatedCode"
          readonly
          rows="14"
          placeholder="代码将在此处动态生成..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 outline-none resize-y"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  generateCurlCode,
  type CurlTargetLanguage
} from '../../utils/curl-utils'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const activeLang = ref<CurlTargetLanguage>('fetch')
const inputCurl = ref(
  `curl 'https://httpbin.org/post' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer devhub_api_token_2026' \\
  -d '{"userId":1024,"action":"login","timestamp":1700000000}'`
)

const generatedCode = ref('')
const errorMessage = ref('')
const copied = ref(false)

const languageList: Array<{ id: CurlTargetLanguage; name: string }> = [
  { id: 'fetch', name: 'JS (fetch)' },
  { id: 'axios', name: 'JS/Node (Axios)' },
  { id: 'python', name: 'Python (requests)' },
  { id: 'go', name: 'Go (net/http)' },
  { id: 'java', name: 'Java (HttpClient)' }
]

function handleConvert() {
  errorMessage.value = ''
  if (!inputCurl.value.trim()) {
    generatedCode.value = ''
    return
  }
  const res = generateCurlCode(inputCurl.value, activeLang.value)
  if (res.success) {
    generatedCode.value = res.code
  } else {
    generatedCode.value = ''
    errorMessage.value = res.error || 'cURL 解析异常'
  }
}

function loadSample(type: 'get' | 'post') {
  if (type === 'get') {
    inputCurl.value = `curl 'https://api.github.com/repos/vuejs/core' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'User-Agent: DevHub-Online-Client'`
  } else {
    inputCurl.value = `curl -X POST 'https://httpbin.org/post' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer secret_token_xyz' \\
  -d '{"projectId":"devhub-404","status":"active","tags":["tools","frontend"]}'`
  }
  handleConvert()
}

function clearAll() {
  inputCurl.value = ''
  generatedCode.value = ''
  errorMessage.value = ''
}

async function copyCode() {
  if (!generatedCode.value) return
  await navigator.clipboard.writeText(generatedCode.value)
  copied.value = true
  toast.show(`已复制 ${activeLang.value.toUpperCase()} 代码到剪贴板！`)
  setTimeout(() => (copied.value = false), 1800)
}

watch([inputCurl, activeLang], () => {
  handleConvert()
})

onMounted(() => {
  handleConvert()
})
</script>
