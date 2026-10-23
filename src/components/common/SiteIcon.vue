<template>
  <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg overflow-hidden select-none">
    <img
      v-if="!hasError && faviconUrl"
      :src="faviconUrl"
      :alt="name"
      class="w-full h-full object-contain"
      @error="handleError"
    />
    <div
      v-else
      class="w-full h-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
      :style="{ backgroundColor: badgeColor }"
    >
      {{ initialChar }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  url?: string
  name: string
  icon?: string
}>()

const hasError = ref(false)

// favicon 源变化时重置错误态,避免残留字母徽章
watch(() => [props.url, props.icon], () => {
  hasError.value = false
})

const faviconUrl = computed(() => {
  if (props.icon) return props.icon
  if (!props.url) return ''
  try {
    const domain = new URL(props.url).hostname
    return `https://favicon.splitbee.io/?url=${domain}`
  } catch {
    return ''
  }
})

const initialChar = computed(() => {
  const trimmed = props.name.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?'
})

// 全站主题色深浅两档 fallback 徽章,避免随机彩虹色块喧宾夺主
const badgePalette = ['#15803d', '#166534', '#0f766e', '#115e59']

const badgeColor = computed(() => {
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return badgePalette[Math.abs(hash) % badgePalette.length]
})

function handleError() {
  hasError.value = true
}
</script>
