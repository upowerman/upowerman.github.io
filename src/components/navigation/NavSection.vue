<template>
  <section :id="category.id" class="mb-10 scroll-mt-20">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <component :is="iconComponent" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">
          {{ category.name }}
        </h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 font-medium">
          {{ category.items.length }}
        </span>
      </div>

      <a
        href="https://github.com/upowerman/upowerman.github.io/issues"
        target="_blank"
        class="text-xs text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-1 transition-colors"
      >
        <span>提交收录</span>
        <PlusCircle class="w-3.5 h-3.5" />
      </a>
    </div>

    <!-- 网格列表 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
      <NavCard
        v-for="item in category.items"
        :key="item.id"
        :item="item"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Bot,
  Layout,
  Server,
  Rocket,
  Flame,
  Globe,
  PlusCircle
} from 'lucide-vue-next'
import NavCard from './NavCard.vue'
import type { NavCategory } from '../../types'

const props = defineProps<{
  category: NavCategory
}>()

const iconMap: Record<string, any> = {
  Bot,
  Layout,
  Server,
  Rocket,
  Flame,
  Globe
}

const iconComponent = computed(() => {
  return iconMap[props.category.icon] || Globe
})
</script>
