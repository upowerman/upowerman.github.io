<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
    @click.self="close"
  >
    <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">添加自定义书签</h3>
        <button
          type="button"
          @click="close"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">网站名称 *</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="例如: 我的博客"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">网站网址 *</label>
          <input
            v-model="form.url"
            type="url"
            required
            placeholder="https://example.com"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">网站描述</label>
          <input
            v-model="form.desc"
            type="text"
            placeholder="一句话介绍该网站"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            取消
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm transition-colors"
          >
            保存并置顶
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useAppStore } from '../../stores/useAppStore'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useAppStore()

const form = ref({
  name: '',
  url: '',
  desc: ''
})

function close() {
  form.value = { name: '', url: '', desc: '' }
  emit('close')
}

function handleSubmit() {
  if (!form.value.name.trim() || !form.value.url.trim()) return
  const id = `custom-${Date.now()}`
  const newLink = {
    id,
    name: form.value.name.trim(),
    url: form.value.url.trim(),
    desc: form.value.desc.trim() || form.value.name.trim(),
    categoryId: 'custom',
    tags: ['custom']
  }
  store.addCustomLink(newLink)
  store.togglePin(id)
  close()
}
</script>
