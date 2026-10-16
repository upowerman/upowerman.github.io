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
import { ref, computed } from 'vue'

const props = defineProps<{
  url?: string
  name: string
  icon?: string
}>()

const hasError = ref(false)

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

const badgeColor = computed(() => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#f97316'
  ]
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
})

function handleError() {
  hasError.value = true
}
</script>
