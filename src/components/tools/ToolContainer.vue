<template>
  <div
    v-if="store.activeToolId"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
    @click.self="store.closeTool"
  >
    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <!-- 弹窗顶栏 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
            <component :is="activeToolIcon" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              {{ activeToolMeta?.name }}
            </h3>
            <p class="text-xs text-slate-400">
              {{ activeToolMeta?.desc }}
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="store.closeTool"
          class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 工具内容区 -->
      <div class="flex-1 overflow-y-auto p-6">
        <component :is="activeToolComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { X, FileJson, Clock, KeyRound, Binary, Regex, Wrench } from 'lucide-vue-next'
import { useAppStore } from '../../stores/useAppStore'
import JsonTool from '../../tools/json/JsonTool.vue'
import TimestampTool from '../../tools/timestamp/TimestampTool.vue'
import JwtTool from '../../tools/jwt/JwtTool.vue'
import CodecTool from '../../tools/codec/CodecTool.vue'
import RegexTool from '../../tools/regex/RegexTool.vue'

const store = useAppStore()

const toolComponents: Record<string, any> = {
  'tool-json': JsonTool,
  'tool-timestamp': TimestampTool,
  'tool-jwt': JwtTool,
  'tool-codec': CodecTool,
  'tool-regex': RegexTool
}

const toolIcons: Record<string, any> = {
  FileJson,
  Clock,
  KeyRound,
  Binary,
  Regex
}

const activeToolMeta = computed(() => {
  return store.defaultToolsRegistry.find(t => t.id === store.activeToolId)
})

const activeToolComponent = computed(() => {
  if (!store.activeToolId) return null
  return toolComponents[store.activeToolId] || null
})

const activeToolIcon = computed(() => {
  if (!activeToolMeta.value) return Wrench
  return toolIcons[activeToolMeta.value.icon] || Wrench
})

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && store.activeToolId) {
    store.closeTool()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
