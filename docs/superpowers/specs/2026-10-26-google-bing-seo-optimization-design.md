# Google 与 Bing 搜索引擎 SEO 优化与时间戳工具深度收录设计规范

日期：2026-10-26  
状态：待评审 / 待执行  
基线分支：`main`  
目标搜索引擎：**Google** 与 **Bing**（免 ICP 备案，技术开发者高频检索渠道）  

---

## 1. 背景与目标 (Intent & Why)

### 1.1 背景与关键转向
站点 DevHub (`yunitytech.top`) 部署于 GitHub Pages，包含 14 款 100% 纯前端离线开发者小工具。
由于未申请国内 ICP 备案，国内部分搜索引擎（如百度）存在收录门槛与抓取限制。而全球及国内技术开发者广泛使用 **Google** 与 **Bing** 作为主力搜索引擎。Google 与 Bing 完全无需 ICP 备案，对技术工具站非常友好，且对结构化数据（Schema.org JSON-LD）和即时索引（IndexNow 协议）有极高的支持度。

当前站点针对 Google 与 Bing 仍有显著的优化提升空间：
1. **即时推送覆盖不足**：`.github/workflows/deploy.yml` 中的 Bing IndexNow 自动推送仅提交了 6 个工具，遗漏了超过一半的页面（其余 8 个工具未纳入自动推送）。
2. **时间戳等高频词缺少 SERP 转化力**：
   - 当前 Title 结构为“Unix 时间戳在线转换工具...”，未在前部置顶开发者在 Google/Bing 最常输入的精准检索词（如“时间戳转换”、“时间戳”、“Unix Timestamp”）；
   - Google/Bing 开发者搜索习惯常夹杂英文或特定语言长尾词（例如“python 获取时间戳”、“mysql unix timestamp”、“时间戳 毫秒”）。
3. **内容深度与 Google Helpful Content 指南**：
   - 目前时间戳速查仅列出 4 门语言，缺乏 MySQL/PostgreSQL/PHP/Shell/C#/Redis 等工业级高频语言片段；
   - 缺少工程实践中极高频的“常用时间秒数换算”（86400秒/天、3600秒/小时）及时区陷阱 FAQ，导致长尾搜索词覆盖受限。
4. **Sitemap 冗余与漂移**：根目录保留了旧版无用的 `sitemap.xml`，而 `public/sitemap.xml` 需保持与全站 15 个页面（首页 + 14 工具）同步更新。

### 1.2 目标 (Goals)
1. **Google & Bing 结构化数据 (Rich Snippets) 全面升级**：
   - 强化 `WebApplication`、`BreadcrumbList` 与 `FAQPage` 结构化数据，确保 Google 与 Bing SERP 能够直接展开 FAQ 手风琴下拉富摘要，提升 CTR（点击率）。
2. **时间戳单页打造深度标杆落地页**：
   - 重构 TDK：首置“时间戳转换”，兼顾中英文关键词；
   - 扩充代码速查矩阵（JS、Python、Java、Go、PHP、MySQL、PostgreSQL、Shell、C#、Redis）；
   - 增设工程高频“常用秒数换算速查表”（1天=86400s等）与典型时间戳对照（Y2038 等）；
   - 扩充 3 条权威 FAQ（深入时区、数据库存储选型、浏览器解析陷阱）。
3. **全站 14 个小工具 TDK 黄金结构标准化**：
   - 按照 Google/Bing 最佳点击率与标题截断规则（~55-60字符/30中文字符），规范全站 14 个工具的 Title/Description/Keywords。
4. **IndexNow 与 Sitemap 全量自动化收录闭环**：
   - 更新 GitHub Actions 部署流，每次代码推送自动向 Bing IndexNow 提交全量 15 个页面，实现分钟级发现收录；
   - 统一根目录与 `public/sitemap.xml`。

### 1.3 非目标与防劣化 (Non-Goals & Anti-Goals)
- **非目标**：不强行适配需 ICP 备案的国内专属渠道（如百度站长验证）；不引入任何服务端渲染或远程 API，保证 100% 纯前端离线与隐私安全。
- **防劣化 (Anti-Goals)**：
  - 严格遵守 Google 搜索反垃圾政策（Spam Policies），严禁关键词生硬堆砌，所有长尾词必须有机结合在代码片段、速查表和实用解答中。
  - 预渲染静态 HTML 须与 Vue 挂载后的 DOM 结构保持语义一致，不影响 Core Web Vitals（LCP/CLS）。

---

## 2. 备选方案与决策 (Approaches)

| 方案 | 覆盖范围 | 优点 | 缺点 / 权衡 | 决策 |
| :--- | :--- | :--- | :--- | :--- |
| **方案 A：全站 Google/Bing 自动化基建 + 时间戳标杆深度优化** | 15 页全量 IndexNow 自动化提交 + 全站 14 工具 TDK 规范 + 时间戳单页做极致中英文长尾内容与 FAQ Schema | 投产比最高，契合免备案环境；时间戳页面在 Google/Bing 能迅速斩获富摘要（Rich Results） | 需系统修改 16 个 HTML 入口与内容数据映射 | **采纳 (Adopted)** |
| **方案 B：仅修改时间戳单页** | 仅改动 `tools/timestamp/index.html` 的 TDK 与静态文字 | 改动极小 | 剩余 8 个新工具依然被 IndexNow 遗漏，失去集群效应 | 放弃 |

---

## 3. 详细设计规范 (Detailed Design)

### 3.1 验证与站长工具配置 (Google & Bing Verification)
保留且统一全站所有 HTML（`index.html`、`privacy/index.html` 以及 `tools/*/index.html` 全部 14 个页面）的 Google 与 Bing 站长认证标签：
```html
<!-- 搜索引擎站长认证 (Google & Bing) -->
<meta name="google-site-verification" content="hQ9erPqBH30Xp3w2vhYCbv0J6926dausslpRig-8S8I" />
<meta name="msvalidate.01" content="C881F074467FD6757DFB5E6C8EE1B7DB" />
```

### 3.2 时间戳工具页深度改造 (`/tools/timestamp/`)

#### 3.2.1 针对 Google/Bing 的 TDK 优化
- **Title**: `时间戳转换 - 在线Unix时间戳与北京时间双向转换 (秒/毫秒互转) | DevHub`
- **Keywords**: `时间戳转换,时间戳,在线时间戳转换,北京时间转时间戳,毫秒时间戳转换,Unix时间戳,时间戳转日期,日期转时间戳,Unix Timestamp Converter,DevHub`
- **Description**: `精准高效的在线时间戳转换工具 (Unix Timestamp Converter)。支持 10 位秒级与 13 位毫秒级时间戳与北京时间(GMT+8)、UTC、ISO 8601 双向互转；内置 Python/Java/JS/Go/PHP/MySQL/Shell 等 10 种语言获取时间戳代码速查及常用时间秒数换算对照。`

#### 3.2.2 静态预渲染 HTML 与 `src/data/tool-pages.ts` 内容扩充
1. **多语言获取时间戳速查表 (扩展至 10 门语言/数据库)**：
   - **JavaScript**: `Math.floor(Date.now() / 1000)` / `Date.now()`
   - **Python**: `int(time.time())` / `int(time.time() * 1000)`
   - **Java**: `Instant.now().getEpochSecond()` / `System.currentTimeMillis()`
   - **Go**: `time.Now().Unix()` / `time.Now().UnixMilli()`
   - **PHP**: `time()` / `round(microtime(true) * 1000)`
   - **MySQL**: `UNIX_TIMESTAMP()` / `ROUND(UNIX_TIMESTAMP(CURTIME(3)) * 1000)`
   - **PostgreSQL**: `EXTRACT(epoch FROM NOW())::BIGINT` / `ROUND(EXTRACT(epoch FROM NOW()) * 1000)`
   - **Shell / Bash**: `date +%s` / `date +%s%3N`
   - **C# / .NET**: `DateTimeOffset.UtcNow.ToUnixTimeSeconds()` / `DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()`
   - **Redis**: `TIME` (秒与微秒返回)

2. **常用时间秒数换算速查表 (针对配置与 TTL 检索)**：
   - 1 分钟 = 60 秒
   - 1 小时 = 3,600 秒
   - 1 天 (24 小时) = 86,400 秒
   - 1 周 (7 天) = 604,800 秒
   - 30 天 (1 个月) = 2,592,000 秒
   - 365 天 (平年) = 31,536,000 秒

3. **典型时间戳里程碑**：
   - `0`: 1970-01-01 08:00:00 (北京时间东八区纪元起点)
   - `1000000000` (10亿秒): 2001-09-09 09:46:40
   - `2147483647` (32位上限): 2038-01-19 11:14:07 (Y2038 Bug)

4. **Google FAQPage 结构化数据与正文 FAQ 扩充**：
   - 补充 3 条高质量问答（涵盖秒与毫秒区分、时区 8 小时偏差原因、数据库存储为什么推荐 BIGINT 时间戳）。

### 3.3 全站 13 个其余小工具的 TDK 规范化
遵循 Google/Bing 高点击率规范：`[核心功能中文] - [副标题/动作说明 (英文辅助)] | DevHub`：
1. `tools/json/`：`JSON格式化 - 在线JSON解析校验与美化压缩工具 | DevHub`
2. `tools/jwt/`：`JWT解码器 - 在线JSON Web Token解析与载荷检查 | DevHub`
3. `tools/codec/`：`编解码与哈希 - Base64/URL/MD5/SHA256在线转换 | DevHub`
4. `tools/regex/`：`正则表达式在线测试 - 常用正则验证与速查手册 | DevHub`
5. `tools/cron/`：`Cron表达式生成器 - 在线Cron语法解析与运行时间推算 | DevHub`
6. `tools/uuid/`：`UUID在线生成器 - 批量生成UUID v4/v7与GUID生成 | DevHub`
7. `tools/color/`：`颜色转换器 - HEX/RGB/HSL互转与WCAG对比度检测 | DevHub`
8. `tools/aes/`：`AES在线加解密 - CBC/ECB/CTR对称加密与代码生成 | DevHub`
9. `tools/case/`：`变量命名风格转换 - 驼峰/下划线/常量批量命名转换 | DevHub`
10. `tools/sql/`：`SQL格式化工具 - 在线SQL美化排版与语法压缩 | DevHub`
11. `tools/curl/`：`cURL转代码 - 在线将cURL转换为Fetch/Python/Go/Java | DevHub`
12. `tools/diff/`：`文本Diff对比工具 - 在线代码与文本差异比对与补丁生成 | DevHub`
13. `tools/json-to-type/`：`JSON转类型 - 在线JSON转TypeScript/Go结构体/Python类 | DevHub`

### 3.4 IndexNow 全量自动化与 Sitemap 同步
1. **GitHub Actions (`.github/workflows/deploy.yml`)**：
   - 将 IndexNow 推送列表由原来的 6 个扩充为全部 15 个页面（首页 + 14 个工具页）。
2. **Sitemap 同步**：
   - 更新 `public/sitemap.xml`，所有 URL 的 `lastmod` 统一刷新为当前发布日期，覆盖全部 14 个工具、首页与隐私页。
   - 同步覆盖根目录 `sitemap.xml`，避免版本漂移。

---

## 4. 实施阶段与测试策略 (Implementation & Testing)

1. **第一阶段：基建与 TDK 标准化**
   - 检查全站 16 个 HTML 文件中的 Google/Bing 验证标签；
   - 统一更新 14 个工具页面的 TDK 与 Open Graph 元标签。
2. **第二阶段：时间戳页面深度改造**
   - 更新 `src/data/tool-pages.ts` 中的 `tool-timestamp` 内容，增加 10 门语言速查、换算对照表与扩展 FAQ；
   - 适配 `src/ToolPage.vue` 对扩充数据（如换算表）的渲染支持；
   - 更新 `tools/timestamp/index.html` 的预渲染静态 HTML 与 FAQPage JSON-LD，确保爬虫无需执行 JS 即可获取全部结构化内容。
3. **第三阶段：Sitemap 与 IndexNow 自动化**
   - 刷新 `public/sitemap.xml` 与根目录 `sitemap.xml`；
   - 更新 `.github/workflows/deploy.yml` 中的 IndexNow URL 列表至 15 个全量页面。
4. **验证策略**：
   - 运行单元测试（`npm run test:run`）确保无破坏性变更；
   - 检查 HTML 源码中的 JSON-LD，确保 Schema.org 语法符合 Google Rich Results 测试标准。

---

## 5. 留给实现者的自由裁量 (Left to Builder)
- 语言速查表在小屏幕（手机端）下的滚动排版细节；
- FAQ 展开折叠的样式微调。
