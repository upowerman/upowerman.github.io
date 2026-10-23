<template>
  <Transition name="toast">
    <div
      v-if="toast.visible"
      role="status"
      aria-live="polite"
      class="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border pointer-events-none select-none text-xs font-semibold tracking-wide"
      :class="[
        toast.type === 'error'
          ? 'bg-rose-950/90 dark:bg-rose-900/90 text-white border-rose-800'
          : toast.type === 'info'
            ? 'bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 border-slate-700/50 dark:border-slate-200/50'
            : 'bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 border-slate-700/50 dark:border-slate-200/50'
      ]"
    >
      <CheckCircle2
        v-if="toast.type === 'success'"
        class="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0"
      />
      <AlertCircle
        v-else-if="toast.type === 'error'"
        class="w-4 h-4 text-rose-400 shrink-0"
      />
      <Info
        v-else
        class="w-4 h-4 text-sky-400 dark:text-sky-600 shrink-0"
      />
      <span>{{ toast.message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertCircle, Info } from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'

const { toast } = useToast()
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -14px) scale(0.94);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.96);
}
</style>
