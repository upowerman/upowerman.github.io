<template>
  <div class="space-y-4">
    <!-- 控制栏：方言、缩进、大小写及操作按钮 -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="flex flex-wrap items-center gap-3">
        <!-- SQL 方言 -->
        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span class="font-semibold">SQL 方言:</span>
          <select
            v-model="dialect"
            @change="handleFormat"
            class="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="mysql">MySQL / MariaDB</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="sqlite">SQLite</option>
            <option value="transactsql">SQL Server (T-SQL)</option>
            <option value="plsql">Oracle (PL/SQL)</option>
            <option value="sql">标准 ANSI SQL</option>
          </select>
        </label>

        <!-- 缩进空格 -->
        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span class="font-semibold">缩进:</span>
          <select
            v-model.number="indent"
            @change="handleFormat"
            class="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option :value="2">2 空格</option>
            <option :value="4">4 空格</option>
          </select>
        </label>

        <!-- 关键字大小写 -->
        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span class="font-semibold">关键字:</span>
          <select
            v-model="keywordCase"
            @change="handleFormat"
            class="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="upper">大写 (UPPERCASE)</option>
            <option value="lower">小写 (lowercase)</option>
            <option value="preserve">保持原样</option>
          </select>
        </label>
      </div>

      <!-- 操作按钮群 -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleFormat"
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
        >
          美化排版 (Format)
        </button>
        <button
          type="button"
          @click="handleMinify"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
        >
          单行压缩 (Minify)
        </button>
        <button
          type="button"
          @click="loadSample"
          class="px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
        >
          示例
        </button>
        <button
          type="button"
          @click="clearAll"
          class="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 输入与输出双栏 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 输入面板 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">原始 SQL 查询语句</span>
          <span class="font-mono text-slate-400">{{ inputSql.length }} 字符</span>
        </div>
        <textarea
          v-model="inputSql"
          rows="14"
          placeholder="在此粘贴任意混乱或紧凑的 SQL 查询语句..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        ></textarea>
      </div>

      <!-- 输出面板 -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span class="font-semibold text-slate-700 dark:text-slate-300">格式化结果</span>
          <div class="flex items-center gap-2">
            <span class="font-mono text-slate-400" v-if="outputSql">{{ outputSql.length }} 字符</span>
            <button
              v-if="outputSql"
              type="button"
              @click="copyResult"
              class="hover:text-primary-600 font-semibold text-primary-600 dark:text-primary-400 text-xs"
            >
              {{ copiedResult ? '已复制!' : '复制结果' }}
            </button>
          </div>
        </div>
        <textarea
          :value="outputSql"
          readonly
          rows="14"
          placeholder="格式化后的 SQL 将在此高质排版显示..."
          class="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 outline-none resize-y"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  formatSql,
  minifySql,
  type SqlDialect,
  type SqlKeywordCase
} from '../../utils/sql-utils'

const dialect = ref<SqlDialect>('mysql')
const indent = ref<2 | 4>(2)
const keywordCase = ref<SqlKeywordCase>('upper')

const inputSql = ref(
  `select u.id as user_id, u.username, u.email, count(o.id) as order_count, sum(o.total_amount) as total_spent from users u left join orders o on u.id = o.user_id where u.status = 1 and u.created_at >= '2026-01-01' group by u.id, u.username, u.email having count(o.id) > 2 order by total_spent desc limit 20;`
)
const outputSql = ref('')
const copiedResult = ref(false)

function handleFormat() {
  if (!inputSql.value.trim()) {
    outputSql.value = ''
    return
  }
  outputSql.value = formatSql(inputSql.value, {
    dialect: dialect.value,
    indent: indent.value,
    keywordCase: keywordCase.value
  })
}

function handleMinify() {
  if (!inputSql.value.trim()) {
    outputSql.value = ''
    return
  }
  outputSql.value = minifySql(inputSql.value)
}

function loadSample() {
  inputSql.value = `SELECT p.product_id, p.title, c.category_name, AVG(r.rating) as avg_rating FROM products p INNER JOIN categories c ON p.category_id = c.id LEFT JOIN reviews r ON p.product_id = r.product_id WHERE p.is_active = 1 AND p.price BETWEEN 10.00 AND 299.99 GROUP BY p.product_id, p.title, c.category_name ORDER BY avg_rating DESC, p.created_at DESC;`
  handleFormat()
}

function clearAll() {
  inputSql.value = ''
  outputSql.value = ''
}

async function copyResult() {
  if (!outputSql.value) return
  await navigator.clipboard.writeText(outputSql.value)
  copiedResult.value = true
  setTimeout(() => (copiedResult.value = false), 1800)
}

watch(inputSql, () => {
  handleFormat()
})

onMounted(() => {
  handleFormat()
})
</script>
