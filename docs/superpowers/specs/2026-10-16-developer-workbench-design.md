# 开发者复合型工作台与流量聚合站 (DevHub) 设计规范

- **创建日期**: 2026-10-16
- **状态**: 待评审 (Pending User Review)
- **对应域名**: `yunitytech.top` (`upowerman.github.io`)

---

## 1. 项目愿景与目标

### 1.1 背景与目标
将当前极简的个人起始页，重构为面向程序员群体的高频次、高粘性**复合型开发者工作台（DevHub）**。
通过结合**高频离线纯前端小工具**与**高质量垂直资源导航**，解决传统导航站“即用即走、留存率低”的痛点，使用户将其设为浏览器常用标签页或收藏夹首位，进而实现流量长期沉淀与多维导流。

### 1.2 核心衡量指标
1. **高频留存**：提供秒开、零后台、数据不出本地的高频开发工具，建立日常使用习惯；
2. **导流转化**：在侧栏、页脚与导航分类中自然嵌入微信公众号/社群、GitHub 开源共建与合作推荐入口；
3. **零运维成本**：纯前端静态架构，利用 GitHub Actions 持续集成并部署至 GitHub Pages。

---

## 2. 整体技术架构与工程规划

### 2.1 技术栈选型
* **基础框架**：`Vite 5.x` + `Vue 3.x`（Composition API + `<script setup>`）+ `TypeScript 5.x`
* **样式系统**：`Tailwind CSS 3.x`（支持深色/浅色模式自适应切换）
* **图标库**：`lucide-vue-next`
* **状态与持久化**：`Pinia 2.x` + `@vueuse/core`（利用 `useLocalStorage`、`useDark` 零负担实现本地状态响应式绑定）
* **代码编辑器组件**：`CodeMirror 6`（模块化按需加载 JSON/JavaScript 语法着色与高亮，避免 Monaco 大包体问题）
* **单测框架**：`Vitest`

### 2.2 目录结构规划
```text
upowerman.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions 自动化构建与发布到 GitHub Pages
├── public/
│   ├── CNAME                     # 自定义域名配置: yunitytech.top
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/                   # 静态图片资源
│   ├── components/
│   │   ├── layout/               # Header, Sidebar, Footer 骨架组件
│   │   ├── search/               # 多引擎与站内直达搜索条
│   │   ├── navigation/           # 网址卡片与分类网格
│   │   ├── modal/                # 弹窗与自定义网址表单
│   │   └── traffic/              # 社群导流卡片、GitHub Star 推广卡片
│   ├── tools/                    # 纯前端开发者小工具实现
│   │   ├── json/                 # JSON 格式化、压缩与语法检查
│   │   ├── timestamp/            # Unix 时间戳与日期双向转换
│   │   ├── jwt/                  # JWT Token 解码与过期校验
│   │   ├── codec/                # Base64, URL, Hash (MD5, SHA256)
│   │   └── regex/                # 正则表达式实时测试与预置模板
│   ├── data/                     # 预置数据源
│   │   ├── nav-categories.ts     # 分类与站点信息库
│   │   └── tools-registry.ts     # 内置小工具元数据与路由注册
│   ├── stores/                   # Pinia 存储库（用户收藏、自定义链接、搜索设置）
│   ├── types/                    # 全局 TypeScript 接口定义
│   ├── utils/                    # 纯前端算法与格式化工具函数（配单元测试）
│   ├── App.vue                   # 页面入口组件
│   └── main.ts                   # 应用主入口
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 3. 核心功能与交互设计

### 3.1 顶部栏 (Header)
* **品牌标识**：展示产品名称（`DevHub` / `YunityTech`）及极客标语。
* **视图切换锚点**：
  * `【网址导航】`：平滑滚动或快速切换到分类资源区域；
  * `【常用工具】`：聚焦到内置开发者小工具区域；
  * `【我的常用】`：快速定位到用户个人收藏项。
* **全局工具**：深色模式切换切换（Dark / Light / System）、全屏模式切换。
* **导流入口**：GitHub 仓库 Star 按钮、`「交流群 / 公众号」` 弹层入口。

### 3.2 搜索与快速启动区 (Search & Quick Launcher)
* **多引擎搜索**：默认支持快捷切换 Google、Baidu、GitHub、Bing 搜索。
* **智能站内直达**：输入框支持即时模糊搜索：
  * 输入关键词（如 `json`、`jwt`、`github`、`docker`）时，下拉框即时展示匹配的内置工具与常用书签，回车直接激活或跳转。
* **置顶快捷栏**：以磁贴形式展示 6~8 个最高频使用的工具与网站（支持悬浮编辑、排序与移除）。

### 3.3 分类资源导航 (Curated Dev Navigation)
精选高价值、现代化开发者生态资源：
1. **AI 与大模型**：DeepSeek、ChatGPT、Claude、HuggingFace、Prompt 优化库、开源模型榜单；
2. **前端与全栈**：Vue 3、React、Next.js、Tailwind CSS、Lucide 图标、前端动效库；
3. **后端与云原生**：Go / Python / Java 生态库、Docker Hub、Kubernetes 文档、Linux 命令速查；
4. **独立开发与出海**：ProductHunt、Stripe、域名与支付、开源变现指南；
5. **极客热榜与资讯**：GitHub Trending、V2EX、掘金热榜、Hacker News。

* **卡片细节**：网站 Logo（支持裂图平滑回退为彩色首字母图标）、标题、一句话功能介绍、一键 `⭐ 收藏` 按钮。
* **开放收录**：分类底部提供 `「➕ 提交收录」` 链接，点击直达 GitHub 仓库对应 issue / 模板。

### 3.4 纯前端高频工具箱 (Client-Side DevTools)
首期上线 5 款核心工具，全部采用纯前端实现，数据 100% 留在浏览器：
1. **JSON 格式化与校验**：
   * 基于 CodeMirror 6 实现多行高亮展示、一键美化、压缩单行、转义/去除转义；
   * 针对语法错误精确标红报错行与错误原因；
   * 支持一键快速复制结果与清空。
2. **时间戳转换器**：
   * 实时展示当前 Unix 时间戳（秒 / 毫秒）；
   * 秒级/毫秒级时间戳与日期时间（本地时间、UTC 时间、ISO 格式）双向互转；
   * 人类友好型相对时间显示（如“10 分钟前”、“3 天后”）。
3. **JWT 解码器**：
   * 粘贴 Token 自动拆解 Header、Payload，格式化展示 Claims；
   * 自动检测 `exp` 字段，高亮提示当前 Token 是否已过期及剩余有效时长。
4. **编解码与哈希计算器**：
   * Base64 文本与 DataURL 双向编解码；
   * URL Encode 与 Decode（支持 UTF-8 中文与特殊符号）；
   * 常用单向哈希实时计算（MD5、SHA-1、SHA-256）。
5. **正则测试与常用速查**：
   * 输入正则表达式与测试文本，实时高亮所有匹配项并显示捕获组详情；
   * 内置常用正则清单（电子邮箱、手机号、IPv4/IPv6、身份证、URL、纯中文）一键载入。

### 3.5 导流与用户转化策略
1. **私域社群沉淀**：侧边浮动或底部展示“加入技术交流群 / 关注公众号”卡片，说明入群福利（如“获取出海与独立开发资源汇总 / 提报新工具”）；
2. **开源协作共建**：导航项与工具页面标注开源共建入口，吸引开发者前往 GitHub 仓库点 Star、提交 PR 或 Issue；
3. **商业化预留**：预留 1~2 个带有 `Sponsored / 优质推荐` 标签的卡片，供后续承接技术服务、独立产品或联盟返佣。

---

## 4. 数据流与状态持久化设计

### 4.1 数据流向
* **配置层（只读静态配置）**：存储于 `src/data/`，包含官方维护的精选导航站列表及工具注册表。
* **用户层（本地持久化状态）**：通过 `@vueuse/core` 绑定到 `localStorage`：
  * `devhub_pinned_ids: string[]`（置顶项目 ID）
  * `devhub_custom_links: CustomLink[]`（用户自己添加的私有链接）
  * `devhub_search_engine: string`（默认搜索引擎）
  * `devhub_theme: 'dark' | 'light' | 'auto'`（颜色偏好）
  * `devhub_recent_tools: string[]`（最近使用的小工具 ID）

### 4.2 隐私安全保障
* 所有工具内的数据输入与转换操作纯在本地内存中执行，没有任何打点、日志或后端接口接收用户敏感内容。

### 4.3 容错与防御策略
* **语法解析异常捕获**：JSON 解析、JWT 解码统一做 `try-catch` 捕获，以友好的 UI 警告提示取代应用崩溃；
* **正则防卡死 (ReDoS)**：在测试文本匹配时进行输入长度限制，并使用防抖处理；
* **图片裂图防御**：`<SiteIcon />` 组件监听 `img @error` 事件，自动回退到提取标题首字母的渐变色 SVG 徽章；
* **无痕模式防御**：本地存储受限时自动捕获异常并转为内存存储，给出 Toast 提示。

---

## 5. 持续集成与发布 (CI/CD)

### 5.1 工作流文件 `.github/workflows/deploy.yml`
```yaml
name: Deploy DevHub to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests & Typecheck
        run: |
          npm run test:run
          npm run typecheck

      - name: Build static site
        run: npm run build

      - name: Ensure CNAME exists
        run: cp public/CNAME dist/CNAME

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 6. 测试与质量保证

### 6.1 单元测试矩阵 (`Vitest`)
* `tests/unit/json-utils.test.ts`：测试格式化、压缩、转义及格式异常精确定位；
* `tests/unit/timestamp-utils.test.ts`：测试秒/毫秒单位转换、时区跨度、边界时间戳转换；
* `tests/unit/jwt-utils.test.ts`：测试标准 JWT 拆解、Base64URL 解码、有效性判定；
* `tests/unit/codec-utils.test.ts`：测试中文/特殊字符的 Base64 与 URL 互转、MD5/SHA256 哈希比对；
* `tests/unit/regex-utils.test.ts`：测试匹配高亮、捕获组解析及异常正则语法拦截。

### 6.2 构建与性能指标
* **包体控制**：CodeMirror 核心与语法包单独分包（Chunk），首屏无需载入的代码按需动态 `import()`；
* **加载速度**：静态资源全部配置哈希与长效缓存，首屏加载目标保持在 1s 以内。

---

## 7. 实施计划演进路线 (Roadmap)
* **第一阶段（基础设施与工程初始化）**：初始化 Vite + Vue 3 + Tailwind CSS + Vitest，配置构建脚本与 CI/CD 流水线，验证 GitHub Pages 自动化发布与域名绑定。
* **第二阶段（页面骨架与搜索导航）**：搭建 Header、聚合多引擎搜索框、分类网址卡片网格与 Favicon 容错机制。
* **第三阶段（核心工具集开发与单测）**：实现 JSON 实验室、时间戳、JWT、编解码与正则测试等 5 大工具，完成 Vitest 100% 逻辑单测。
* **第四阶段（个性化与导流闭环）**：实现收藏置顶、自定义书签、深色模式持久化，嵌入微信公众号/社群卡片与开源共建入口。
* **第五阶段（打包优化与上线验证）**：构建分包调优、响应式适配测试、全量部署上线验证。
