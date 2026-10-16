# 开发者复合型工作台 (DevHub) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 Vue 3 + Tailwind CSS 的高频开发者复合型工作台与资源导航站，集成 5 款开箱即用的纯前端离线小工具，通过 GitHub Actions 自动化部署至 GitHub Pages (`yunitytech.top`)。

**Architecture:** 采用静态化单页应用（SPA）无服务端架构，所有工具计算 100% 在客户端浏览器内执行。预置精选开发资源数据驱动导航渲染，利用 Pinia 与 VueUse `useLocalStorage` 实现用户收藏与自定义书签的本地持久化，并通过侧栏与弹窗嵌入社群、公众号和开源共建等导流闭环。

**Tech Stack:** Vue 3, Vite, TypeScript, Tailwind CSS, Pinia, @vueuse/core, CodeMirror 6, lucide-vue-next, Vitest

**Spec:** `docs/superpowers/specs/2026-10-16-developer-workbench-design.md`

## Global Constraints

- 所有开发者小工具计算必须 100% 在客户端完成，严禁向外部服务器发送任何用户输入的代码、Token 或明文内容。
- 静态构建产物中必须保留 `CNAME` 文件，内容严格为 `yunitytech.top`，防止 GitHub Pages 自定义域名丢失。
- 页面必须完全支持深色模式 (Dark Mode) 与浅色模式，并默认跟随系统偏好或用户手动切换。
- 所有外链卡片必须具备 Favicon 裂图容错机制，网络不可达时自动回退为名称首字母生成的彩色徽章。
- 核心算法与工具转换函数必须具备 Vitest 单元测试覆盖。

## Review Focus

1. **非标/截断 JSON 输入**：当用户粘贴未闭合或带有注释的非法 JSON 时，展示具体错误行与说明，不得导致前端抛出未捕获异常或空白页。
2. **非法或伪造 JWT Token**：当粘贴非三段式或非法 Base64URL 字符时，应提示“无效的 JWT 格式”，不中断页面。
3. **中文与 Emoji 字符 Base64 编解码**：原生 `btoa` / `atob` 不支持 UTF-8 字符（如中文），工具必须使用 `TextEncoder`/`TextDecoder` 安全处理中文字符与 Emoji。
4. **时间戳超大或负数边界**：输入非数字或负数/超大溢出时间戳时，正确识别并显示“无效时间戳”，防止渲染为 `Invalid Date` 或崩溃。
5. **灾难性回溯正则表达式 (ReDoS)**：在正则实时测试中限制测试文本长度（如最大 50,000 字符）并加入 200ms 防抖，防止浏览器标签页冻结。

---

### Task 1: 项目基础工程与构建配置 (Scaffolding & CI/CD Workflow)

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `public/CNAME`
- Create: `.github/workflows/deploy.yml`
- Test: `tests/setup.ts`

**Interfaces:**
- Produces: 完整可运行、可通过 `npm run build` 和 `npm run test:run` 的 Vue 3 + Tailwind + Vitest 工程底座。

- [ ] **Step 1: 创建 `package.json` 并配置必要依赖**

```json
{
  "name": "devhub",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test:run": "vitest run"
  },
  "dependencies": {
    "@codemirror/lang-json": "^6.0.1",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@vueuse/core": "^10.9.0",
    "codemirror": "^6.0.1",
    "crypto-js": "^4.2.0",
    "lucide-vue-next": "^0.368.0",
    "pinia": "^2.1.7",
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.2",
    "@types/node": "^20.11.30",
    "@vitejs/plugin-vue": "^5.0.4",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.3",
    "vite": "^5.1.6",
    "vitest": "^1.4.0",
    "vue-tsc": "^2.0.7"
  }
}
```

- [ ] **Step 2: 创建 `vite.config.ts`、`tsconfig.json`、`tailwind.config.js`、`postcss.config.js`**

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    environment: 'happy-dom'
  }
})
```

`tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        }
      }
    }
  },
  plugins: []
}
```

`public/CNAME`:
```text
yunitytech.top
```

- [ ] **Step 3: 配置 GitHub Actions 自动化部署 `.github/workflows/deploy.yml`**

确保部署自动保留 `CNAME` 并发布到 GitHub Pages。

- [ ] **Step 4: 安装依赖并验证环境**

Run: `npm install && npm run test:run`
Expected: 依赖安装成功，测试 runner 正常就绪。

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tailwind.config.js postcss.config.js public/CNAME .github/workflows/deploy.yml
git commit -m "chore: scaffold Vue 3 + Tailwind + Vitest project structure with CI"
```

---

### Task 2: 核心小工具算法函数与单元测试 (TDD: Core Utility Algorithms)

**Files:**
- Create: `src/utils/json-utils.ts`
- Create: `src/utils/timestamp-utils.ts`
- Create: `src/utils/jwt-utils.ts`
- Create: `src/utils/codec-utils.ts`
- Create: `src/utils/regex-utils.ts`
- Test: `tests/unit/json-utils.test.ts`
- Test: `tests/unit/timestamp-utils.test.ts`
- Test: `tests/unit/jwt-utils.test.ts`
- Test: `tests/unit/codec-utils.test.ts`
- Test: `tests/unit/regex-utils.test.ts`

**Interfaces:**
- Produces:
  - `formatJson(raw: string, indent?: number): { success: boolean; result: string; error?: string }`
  - `compressJson(raw: string): { success: boolean; result: string; error?: string }`
  - `timestampToDate(ts: number, unit?: 's' | 'ms'): { local: string; utc: string; iso: string; relative: string }`
  - `dateToTimestamp(dateStr: string): { seconds: number; milliseconds: number }`
  - `decodeJwt(token: string): { valid: boolean; header: any; payload: any; isExpired: boolean; expDate?: string; error?: string }`
  - `safeBase64Encode(text: string): string` / `safeBase64Decode(b64: string): string`
  - `calculateHashes(text: string): { md5: string; sha256: string }`
  - `testRegex(pattern: string, flags: string, text: string): { matches: string[]; error?: string }`

- [ ] **Step 1: 编写 Vitest 单元测试集**

编写 `tests/unit/json-utils.test.ts`, `tests/unit/timestamp-utils.test.ts`, `tests/unit/jwt-utils.test.ts`, `tests/unit/codec-utils.test.ts`, `tests/unit/regex-utils.test.ts`，涵盖标准用例、UTF-8 中文、过期判定、非法格式报错。

- [ ] **Step 2: 运行测试验证失败**

Run: `npm run test:run`
Expected: FAIL（函数尚未定义）

- [ ] **Step 3: 实现工具核心算法**

在 `src/utils/` 下分别实现上述 5 个模块，采用安全的 UTF-8 编码解码与健壮的 `try-catch` 保护。

- [ ] **Step 4: 运行测试验证全部通过**

Run: `npm run test:run`
Expected: PASS，所有测试套件通过。

- [ ] **Step 5: Commit**

```bash
git add src/utils/ tests/unit/
git commit -m "feat(utils): implement client-side devtools algorithms with unit tests"
```

---

### Task 3: 状态管理与本地持久化 (Pinia Stores & Navigation Data Source)

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/nav-categories.ts`
- Create: `src/data/tools-registry.ts`
- Create: `src/stores/useAppStore.ts`
- Test: `tests/unit/store.test.ts`

**Interfaces:**
- Consumes: `@vueuse/core`
- Produces:
  - `interface NavItem { id: string; name: string; url: string; desc: string; icon?: string; categoryId: string; tags: string[] }`
  - `interface NavCategory { id: string; name: string; icon: string; items: NavItem[] }`
  - `interface ToolItem { id: string; name: string; desc: string; icon: string; component: string }`
  - `useAppStore()`：管理 `pinnedIds`、`customLinks`、`searchEngine`、`activeTab`、`theme`，并提供增删收藏及持久化能力。

- [ ] **Step 1: 编写 Store 与数据结构的测试**

验证收藏项添加、删除、切换搜索引擎与自定义网址保存。

- [ ] **Step 2: 运行测试验证失败**

Run: `npm run test:run tests/unit/store.test.ts`
Expected: FAIL

- [ ] **Step 3: 编写数据源与 Pinia Store**

在 `src/data/nav-categories.ts` 中构建包括“AI 大模型”、“前端开发”、“后端与云原生”、“独立开发出海”、“极客热榜”的精选站点库；在 `src/stores/useAppStore.ts` 中实现本地持久化状态。

- [ ] **Step 4: 运行测试验证全部通过**

Run: `npm run test:run tests/unit/store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/data/ src/stores/ tests/unit/store.test.ts
git commit -m "feat(store): define navigation data and localStorage pinia store"
```

---

### Task 4: 导航、搜索与快速启动组件 (UI: SearchBar & NavGrid)

**Files:**
- Create: `src/components/common/SiteIcon.vue`
- Create: `src/components/search/SearchBar.vue`
- Create: `src/components/navigation/NavCard.vue`
- Create: `src/components/navigation/NavSection.vue`
- Create: `src/components/modal/AddLinkModal.vue`

**Interfaces:**
- Consumes: `useAppStore`, `nav-categories.ts`, `tools-registry.ts`
- Produces:
  - `<SiteIcon :url="url" :name="name" />`：带自动裂图检测与首字母徽章回退；
  - `<SearchBar />`：多引擎切换、模糊搜索匹配内置工具和书签、直接回车跳转；
  - `<NavCard :item="item" :isPinned="isPinned" />`：展示卡片及收藏按钮；
  - `<AddLinkModal />`：用户添加自定义书签。

- [ ] **Step 1: 实现 `<SiteIcon.vue>` 并处理裂图**

利用 `@error` 事件动态切换为 CSS 首字母圆圈徽章。

- [ ] **Step 2: 实现 `<SearchBar.vue>` 聚合搜索与智能匹配**

支持 Google、Baidu、GitHub、Bing 搜索，以及站内搜索联想直达。

- [ ] **Step 3: 实现 `<NavCard.vue>` 和 `<NavSection.vue>`**

渲染分类卡片网格，响应式自适应（移动端 1~2 列，桌面端 3~4 列），悬浮显示收藏星标。

- [ ] **Step 4: 验证组件渲染与功能**

Run: `npm run build`
Expected: 编译无类型错误。

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat(ui): add search bar, site icon with fallback, and nav cards"
```

---

### Task 5: 纯前端高频工具箱组件 (UI: DevTools)

**Files:**
- Create: `src/tools/json/JsonTool.vue`
- Create: `src/tools/timestamp/TimestampTool.vue`
- Create: `src/tools/jwt/JwtTool.vue`
- Create: `src/tools/codec/CodecTool.vue`
- Create: `src/tools/regex/RegexTool.vue`
- Create: `src/components/tools/ToolContainer.vue`

**Interfaces:**
- Consumes: `src/utils/*`
- Produces: 5 款即开即用、响应式的离线小工具，配备一键复制、一键清空及错误行提示。

- [ ] **Step 1: 实现 `JsonTool.vue`（格式化、压缩、错误行高亮）**
- [ ] **Step 2: 实现 `TimestampTool.vue`（秒/毫秒时间戳与日期双向互转）**
- [ ] **Step 3: 实现 `JwtTool.vue`（Token Header/Payload 解码与过期提醒）**
- [ ] **Step 4: 实现 `CodecTool.vue`（Base64、URL 编解码与 MD5/SHA256 哈希计算）**
- [ ] **Step 5: 实现 `RegexTool.vue`（正则匹配高亮与内置常用正则模板）**
- [ ] **Step 6: 实现 `ToolContainer.vue` 统一弹层或全屏工作台容器**
- [ ] **Step 7: 验证全部工具编译与交互**

Run: `npm run build && npm run test:run`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/tools/ src/components/tools/
git commit -m "feat(tools): build 5 core client-side devtool components"
```

---

### Task 6: 页面整体框架与导流闭环组件 (Workbench Layout & Conversion Hooks)

**Files:**
- Create: `src/components/layout/AppHeader.vue`
- Create: `src/components/layout/AppFooter.vue`
- Create: `src/components/traffic/CommunityModal.vue`
- Create: `src/components/traffic/TrafficBanner.vue`
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: 所有前序模块
- Produces: 完整交互的 DevHub 页面，集成了模式切换、置顶栏、导航网格、工具切换、社群与公众号引流卡片、GitHub 合作入口。

- [ ] **Step 1: 实现 `<AppHeader.vue>`**

包含品牌 Logo、深色模式切换、视图切换（全部 / 仅导航 / 仅工具）、GitHub Star 链接。

- [ ] **Step 2: 实现 `<CommunityModal.vue>` 与 `<TrafficBanner.vue>`**

设计友好的开发者社群引流弹窗（公众号、交流群二维码预留与复制微信号功能），在侧边与页脚提示“加入独立开发与技术交流群”、“欢迎在 GitHub 提交收录”。

- [ ] **Step 3: 组装 `src/App.vue`**

整合 Header、置顶快捷栏、搜索栏、主工作区（工具 + 导航）、Footer 与导流弹窗。

- [ ] **Step 4: 运行本地开发服务器测试全流程交互**

Run: `npm run build`
Expected: 构建成功且产物符合预期。

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/components/traffic/ src/App.vue
git commit -m "feat(app): assemble complete DevHub workbench with traffic conversion hooks"
```

---

### Task 7: 生产构建优化与发布验证 (Production Build & Verification)

**Files:**
- Modify: `vite.config.ts`（配置分包 manualChunks）
- Modify: `public/robots.txt`
- Check: `dist/CNAME`

**Interfaces:**
- Produces: 优化后的单页产物，首屏加载快速，CNAME 正确保留，自动化流水线验证就绪。

- [ ] **Step 1: 调优 `vite.config.ts` 分包策略**

将 CodeMirror 和常用工具分离至独立 Chunk，确保首屏体积保持极小。

- [ ] **Step 2: 完整运行全量检查与构建**

Run: `npm run test:run && npm run build`
Expected:
1. 所有 Vitest 单元测试通过；
2. 构建无 TypeScript 报错；
3. `dist/` 目录正常生成，且 `dist/CNAME` 包含 `yunitytech.top`。

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts public/robots.txt
git commit -m "perf(build): optimize chunk splitting and ensure CNAME preservation"
```
