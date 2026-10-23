<template>
  <div class="group relative flex items-start space-x-3 p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/50 dark:hover:border-primary-500/50 hover:shadow-md transition-all duration-200">
    <SiteIcon :name="item.name" :url="item.url" :icon="item.icon" />
    <div class="flex-1 min-w-0 pr-12">
      <div class="flex items-center space-x-1.5">
        <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
          {{ item.name }}
        </h4>
        <ExternalLink class="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
        {{ item.desc }}
      </p>
    </div>

    <!-- 拉伸链接:铺满整卡,键盘 Tab 可达,星标/删除按钮以 z-10 浮于其上 -->
    <a
      :href="item.url"
      target="_blank"
      rel="noopener noreferrer"
      class="absolute inset-0 rounded-xl"
      :aria-label="`在新标签页打开 ${item.name}`"
    ></a>

    <!-- 操作按钮组 (删除自定义 / 收藏置顶) -->
    <div class="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1">
      <button
        v-if="item.categoryId === 'custom'"
        type="button"
        @click.stop="store.removeCustomLink(item.id)"
        class="p-1 rounded-md text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="删除此自定义书签"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        @click.stop="store.togglePin(item.id)"
        class="p-1 rounded-md text-slate-300 hover:text-amber-500 dark:text-slate-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        :title="isPinned ? '取消置顶收藏' : '置顶收藏'"
      >
        <Star
          class="w-4 h-4 transition-transform active:scale-125"
          :class="isPinned ? 'fill-amber-400 text-amber-500 dark:text-amber-400' : ''"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink, Star, Trash2 } from 'lucide-vue-next'
import SiteIcon from '../common/SiteIcon.vue'
import { useAppStore } from '../../stores/useAppStore'
import type { NavItem } from '../../types'

const props = defineProps<{
  item: NavItem
}>()

const store = useAppStore()

const isPinned = computed(() => store.isPinned(props.item.id))
</script>
