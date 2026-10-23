<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0" :style="{ backgroundColor: previewCss }" aria-hidden="true"></div>
      <input
        v-model="input"
        type="text"
        placeholder="输入 #16a34a / rgb(22,163,74) / hsl(142,76%,36%)"
        data-autofocus
        class="flex-1 min-w-[240px] px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div v-if="error" class="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
      {{ error }}
    </div>

    <div v-if="rgb" class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div v-for="f in formats" :key="f.label" class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>{{ f.label }}</span>
          <button type="button" @click="copyText(f.value)" class="text-primary-600 dark:text-primary-400 hover:underline">
            {{ copied === f.value ? '已复制' : '复制' }}
          </button>
        </div>
        <code class="text-sm font-mono text-slate-800 dark:text-slate-100">{{ f.value }}</code>
      </div>
    </div>

    <div v-if="rgb" class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">WCAG 对比度检查</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center justify-between">
            <span>对白色 #FFFFFF</span>
            <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">{{ ratioWhite.toFixed(2) }} : 1</span>
          </div>
          <div class="mt-1.5 flex gap-1.5">
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioWhite >= 4.5 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AA 正文 {{ ratioWhite >= 4.5 ? '达标' : '未达' }}</span>
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioWhite >= 7 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AAA {{ ratioWhite >= 7 ? '达标' : '未达' }}</span>
          </div>
        </div>
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center justify-between">
            <span>对黑色 #000000</span>
            <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">{{ ratioBlack.toFixed(2) }} : 1</span>
          </div>
          <div class="mt-1.5 flex gap-1.5">
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioBlack >= 4.5 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AA 正文 {{ ratioBlack >= 4.5 ? '达标' : '未达' }}</span>
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioBlack >= 7 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AAA {{ ratioBlack >= 7 ? '达标' : '未达' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseColor, rgbToHex, rgbToHsl, contrastRatio, type Rgb } from '../../utils/color-utils'

const input = ref('#16a34a')
const copied = ref('')

const parsed = computed(() => parseColor(input.value))
const error = computed(() => (parsed.value.valid ? '' : parsed.value.error || '无法识别的颜色'))
const rgb = computed<Rgb | null>(() => (parsed.value.valid ? parsed.value.rgb ?? null : null))
const previewCss = computed(() => (rgb.value ? rgbToHex(rgb.value) : 'transparent'))

const formats = computed(() => {
  if (!rgb.value) return []
  const hsl = rgbToHsl(rgb.value)
  return [
    { label: 'HEX', value: rgbToHex(rgb.value) },
    { label: 'RGB', value: `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }
  ]
})

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }
const ratioWhite = computed(() => (rgb.value ? contrastRatio(rgb.value, WHITE) : 0))
const ratioBlack = computed(() => (rgb.value ? contrastRatio(rgb.value, BLACK) : 0))

function copyText(s: string) {
  navigator.clipboard.writeText(s).then(() => {
    copied.value = s
    setTimeout(() => (copied.value = ''), 1500)
  })
}
</script>
