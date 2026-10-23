<template>
  <div class="ad-banner-container w-full min-h-[90px] flex items-center justify-center overflow-hidden my-6">
    <!-- 真实广告单元（当配置了 adSlot 时渲染） -->
    <ins
      v-if="adSlot"
      class="adsbygoogle w-full block"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      :data-ad-format="adFormat"
      :data-full-width-responsive="responsive ? 'true' : 'false'"
    />

    <!-- 本地开发环境或未配置 slot 时的占位预览 -->
    <div
      v-else-if="isDev"
      class="w-full py-4 px-6 border border-dashed border-slate-300 dark:border-slate-700/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-center"
    >
      <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Google AdSense 广告位占位
      </div>
      <div class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
        当前为自适应广告容器预留区（待配置正式 ad-slot）
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    adSlot?: string
    adClient?: string
    adFormat?: string
    responsive?: boolean
  }>(),
  {
    adSlot: '',
    adClient: 'ca-pub-8846399986169251',
    adFormat: 'auto',
    responsive: true
  }
)

const isDev = import.meta.env.DEV

onMounted(() => {
  if (props.adSlot && typeof window !== 'undefined') {
    try {
      const adsbygoogle = ((window as any).adsbygoogle = (window as any).adsbygoogle || [])
      adsbygoogle.push({})
    } catch (e) {
      // 容错处理：当被 AdBlock 浏览器插件拦截时避免报错阻断 Vue 生命周期
    }
  }
})
</script>
