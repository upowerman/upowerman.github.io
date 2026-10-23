<template>
  <div class="space-y-4">
    <!-- 加密 / 解密 模式切换 -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
      <div class="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
        <button
          type="button"
          @click="action = 'encrypt'"
          :class="[
            'px-4 py-1.5 rounded-md transition-colors',
            action === 'encrypt'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          AES 加密 (Encrypt)
        </button>
        <button
          type="button"
          @click="action = 'decrypt'"
          :class="[
            'px-4 py-1.5 rounded-md transition-colors',
            action === 'decrypt'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          AES 解密 (Decrypt)
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="loadSample"
          class="px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        >
          填入示例数据
        </button>
        <button
          type="button"
          @click="clearAll"
          class="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 加密算法参数配置卡片 -->
    <div class="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- 加密模式 -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">分组工作模式 (Mode)</label>
          <select
            v-model="mode"
            class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="CBC">CBC (密码分组链接 - 最常用)</option>
            <option value="ECB">ECB (电子密码本 - 无IV/不推荐生产)</option>
            <option value="CTR">CTR (计数器模式)</option>
            <option value="OFB">OFB (输出反馈模式)</option>
            <option value="CFB">CFB (密文反馈模式)</option>
          </select>
        </div>

        <!-- 填充方式 -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">填充方式 (Padding)</label>
          <select
            v-model="padding"
            class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Pkcs7">PKCS#7 / PKCS#5 (标准默认)</option>
            <option value="ZeroPadding">ZeroPadding (零填充)</option>
            <option value="NoPadding">NoPadding (无填充 - 需16倍数字节)</option>
            <option value="AnsiX923">AnsiX923</option>
            <option value="Iso10126">ISO 10126</option>
          </select>
        </div>

        <!-- 密文编码 -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            密文字符编码格式
          </label>
          <select
            v-model="encoding"
            class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Base64">Base64 (最常用传输格式)</option>
            <option value="Hex">Hex / 16进制字符串 (小写)</option>
          </select>
        </div>
      </div>

      <!-- 密钥与 IV 输入 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <!-- 密钥 -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">
              密钥 (Key)
              <span class="font-mono font-normal text-slate-400">({{ keyLengthInfo }})</span>
            </span>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="key = generateRandomAesKey(128)"
                class="text-[11px] text-primary-600 dark:text-primary-400 hover:underline"
              >
                生成128位
              </button>
              <span class="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                @click="key = generateRandomAesKey(256)"
                class="text-[11px] text-primary-600 dark:text-primary-400 hover:underline"
              >
                生成256位
              </button>
            </div>
          </div>
          <input
            v-model="key"
            type="text"
            placeholder="请输入 16/24/32 字符的密钥 (如 128/192/256 位)"
            class="w-full px-3 py-1.5 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- 初始向量 IV -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">
              初始向量 (IV)
              <span class="font-mono font-normal text-slate-400" v-if="mode !== 'ECB'">({{ iv.length }} 字符 / 16字节)</span>
              <span class="text-amber-500 font-normal" v-else>(ECB 模式不使用 IV)</span>
            </span>
            <button
              v-if="mode !== 'ECB'"
              type="button"
              @click="iv = generateRandomIv()"
              class="text-[11px] text-primary-600 dark:text-primary-400 hover:underline"
            >
              随机生成 IV
            </button>
          </div>
          <input
            v-model="iv"
            :disabled="mode === 'ECB'"
            type="text"
            placeholder="请输入 16 字节固定偏移向量 (如 16位 ASCII 字符)"
            :class="[
              'w-full px-3 py-1.5 font-mono text-xs rounded-lg border outline-none transition-colors',
              mode === 'ECB'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary-500'
            ]"
          />
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
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
          <span class="font-semibold text-slate-700 dark:text-slate-300">
            {{ action === 'encrypt' ? '明文内容 (Plaintext)' : '密文内容 (Ciphertext)' }}
          </span>
          <span class="font-mono text-slate-400">{{ inputText.length }} 字符</span>
        </div>
        <textarea
          v-model="inputText"
          rows="7"
          :placeholder="action === 'encrypt' ? '在此输入待加密的原始文本或 JSON 数据...' : `在此粘贴待解密的 ${encoding} 格式密文...`"
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        ></textarea>
      </div>

      <!-- 输出面板 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">
            {{ action === 'encrypt' ? '密文结果 (Ciphertext)' : '解密明文 (Plaintext)' }}
          </span>
          <div class="flex items-center gap-2">
            <span class="font-mono text-slate-400" v-if="outputText">{{ outputText.length }} 字符</span>
            <button
              v-if="outputText"
              type="button"
              @click="copyResult"
              class="hover:text-primary-600 font-semibold text-primary-600 dark:text-primary-400 text-xs"
            >
              {{ copiedResult ? '已复制!' : '复制结果' }}
            </button>
          </div>
        </div>
        <textarea
          :value="outputText"
          readonly
          rows="7"
          :placeholder="action === 'encrypt' ? '加密后的密文将在此显示...' : '解密后的明文将在此显示...'"
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 outline-none resize-y"
        ></textarea>
      </div>
    </div>

    <!-- 跨语言实现代码预览 -->
    <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">跨语言联调代码预览</span>
          <span class="text-[11px] text-slate-500">（同步当前 Key / IV / Mode / Padding）</span>
        </div>
        <div class="flex items-center space-x-1">
          <button
            v-for="lang in supportedLangs"
            :key="lang.id"
            type="button"
            @click="activeLang = lang.id"
            :class="[
              'px-2.5 py-1 text-xs rounded-md font-medium transition-colors',
              activeLang === lang.id
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            {{ lang.label }}
          </button>
          <button
            type="button"
            @click="copySnippet"
            class="ml-2 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {{ copiedSnippet ? '已复制!' : '复制代码' }}
          </button>
        </div>
      </div>
      <pre class="p-3 text-[11px] font-mono overflow-x-auto text-slate-800 dark:text-slate-200 bg-slate-900/5 dark:bg-slate-950/80 leading-relaxed max-h-64">{{ currentSnippet }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  aesEncrypt,
  aesDecrypt,
  generateRandomAesKey,
  generateRandomIv,
  getAesCodeSnippet,
  type AesMode,
  type AesPadding,
  type AesEncoding
} from '../../utils/aes-utils'

const action = ref<'encrypt' | 'decrypt'>('encrypt')
const mode = ref<AesMode>('CBC')
const padding = ref<AesPadding>('Pkcs7')
const encoding = ref<AesEncoding>('Base64')

const key = ref('1234567890123456')
const iv = ref('1234567890123456')
const inputText = ref('Hello DevHub! 纯前端 AES 离线加解密')
const outputText = ref('')
const errorMessage = ref('')
const copiedResult = ref(false)
const copiedSnippet = ref(false)

type LanguageType = 'java' | 'python' | 'nodejs' | 'go'
const activeLang = ref<LanguageType>('java')
const supportedLangs = [
  { id: 'java' as const, label: 'Java' },
  { id: 'python' as const, label: 'Python' },
  { id: 'nodejs' as const, label: 'Node.js' },
  { id: 'go' as const, label: 'Go' }
]

const keyLengthInfo = computed(() => {
  const len = key.value.length
  const bits = len * 8
  return `${len} 字符 / ${bits} 位`
})

function execute() {
  errorMessage.value = ''
  if (!inputText.value) {
    outputText.value = ''
    return
  }
  if (!key.value) {
    errorMessage.value = '请输入加解密密钥 (Key)'
    outputText.value = ''
    return
  }
  if (mode.value !== 'ECB' && !iv.value) {
    errorMessage.value = 'CBC/CTR/OFB/CFB 模式必须提供 16 字节初始向量 (IV)'
    outputText.value = ''
    return
  }

  if (action.value === 'encrypt') {
    const res = aesEncrypt({
      text: inputText.value,
      key: key.value,
      iv: iv.value,
      mode: mode.value,
      padding: padding.value,
      outputEncoding: encoding.value
    })
    if (res.success) {
      outputText.value = res.result
    } else {
      outputText.value = ''
      errorMessage.value = res.error || '加密执行失败'
    }
  } else {
    const res = aesDecrypt({
      ciphertext: inputText.value,
      key: key.value,
      iv: iv.value,
      mode: mode.value,
      padding: padding.value,
      inputEncoding: encoding.value
    })
    if (res.success) {
      outputText.value = res.result
    } else {
      outputText.value = ''
      errorMessage.value = res.error || '解密执行失败，请检查密钥、IV 或密文编码'
    }
  }
}

watch([action, mode, padding, encoding, key, iv, inputText], () => {
  execute()
}, { immediate: true })

function loadSample() {
  action.value = 'encrypt'
  mode.value = 'CBC'
  padding.value = 'Pkcs7'
  encoding.value = 'Base64'
  key.value = '1234567890123456'
  iv.value = 'abcdef9876543210'
  inputText.value = '{"userId":1001,"username":"devhub_user","role":"admin"}'
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
}

async function copyResult() {
  if (!outputText.value) return
  await navigator.clipboard.writeText(outputText.value)
  copiedResult.value = true
  setTimeout(() => (copiedResult.value = false), 1800)
}

const currentSnippet = computed(() => {
  return getAesCodeSnippet(activeLang.value, mode.value, padding.value)
})

async function copySnippet() {
  if (!currentSnippet.value) return
  await navigator.clipboard.writeText(currentSnippet.value)
  copiedSnippet.value = true
  setTimeout(() => (copiedSnippet.value = false), 1800)
}
</script>
