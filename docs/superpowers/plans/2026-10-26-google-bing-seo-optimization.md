# Google 与 Bing SEO 优化与时间戳工具深度收录 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 DevHub 实施面向 Google 与 Bing 的系统性 SEO 优化，打通全量 15 个页面的 IndexNow 即时收录与 Sitemap，并将时间戳工具打造成具备 Google 富摘要（FAQPage、10门语言速查、秒数对照表）的高转化落地页，同时标准化其余 13 个小工具的 TDK。

**Architecture:** 静态优先的多入口多页面架构。在 HTML 入口层标准化 TDK、OpenGraph 与 Schema.org 结构化数据；在 `src/data/tool-pages.ts` 与 `src/ToolPage.vue` 扩充多语言代码片段及常用时间秒数换算表；在 GitHub Actions 工作流与 `public/sitemap.xml` 中完成全站 URL 自动化分发闭环。

**Tech Stack:** Vue 3, TypeScript, Vite, Tailwind CSS, Schema.org (JSON-LD), IndexNow API, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-google-bing-seo-optimization-design.md`

## Global Constraints
- 纯前端与离线隐私安全：无服务端、无数据库、无用户数据上报，所有页面在客户端或静态构建时完成计算。
- 保证构建与单元测试通过：`npm run test:run` 和 `npm run build` 零报错，所有现存测试及新增测试均通过。
- 保持客户端挂载无跳变：静态预渲染 HTML 内容与 Vue 挂载后的 DOM 语义高度一致，遵循 Core Web Vitals 要求。
- TDK 字符数限制：Title 严格控制在 55-60 字符（约 30 中文字符），前置高频搜索词；Description 涵盖高价值长尾词。

## Review Focus
1. 静态预渲染 HTML 与 JSON-LD 的 FAQ 内容一致性：`tests/static-pages-consistency.test.ts` 要求每一个在 FAQPage JSON-LD 中的问题必须在正文中明文可见。
2. 表格与数据结构完整性：`tests/tool-pages.test.ts` 要求 `extra.head` 与每一行的单元格列数严格一致。
3. 全站 14 个工具页面的兄弟互链完整性：每个工具页必须完整链接到其余 13 个工具和首页。
4. Canonical URL 准确性：每个页面的 `canonical` 必须为对应的绝对生产地址（`https://yunitytech.top/tools/{slug}/`）。
5. IndexNow 自动化提交清单：`.github/workflows/deploy.yml` 必须包含全量 15 个页面的准确 URL，且 JSON 格式无语法错误。

---

### Task 1: 全站 Sitemap 同步与 IndexNow 自动化提交升级

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `sitemap.xml` (root)
- Modify: `.github/workflows/deploy.yml:68-75`
- Test: `tests/sitemap-and-workflow.test.ts` (Create)

**Interfaces:**
- Produces: 同步更新的 `public/sitemap.xml` 与根目录 `sitemap.xml`（16 个 URL，lastmod 刷新至 2026-10-26），并在 `deploy.yml` 中配置 15 个页面的 IndexNow 自动推送。

- [ ] **Step 1: Write the failing test for sitemap & workflow completeness**

Create `tests/sitemap-and-workflow.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TOOL_ROUTES } from '../src/utils/tool-routes'

describe('sitemap and deployment workflow integrity', () => {
  it('public/sitemap.xml and root sitemap.xml contain all 14 tools, home, and privacy', () => {
    const publicSitemap = readFileSync(join(__dirname, '..', 'public', 'sitemap.xml'), 'utf-8')
    const rootSitemap = readFileSync(join(__dirname, '..', 'sitemap.xml'), 'utf-8')

    for (const slug of Object.values(TOOL_ROUTES)) {
      expect(publicSitemap).toContain(`https://yunitytech.top/tools/${slug}/`)
      expect(rootSitemap).toContain(`https://yunitytech.top/tools/${slug}/`)
    }
    expect(publicSitemap).toContain('https://yunitytech.top/')
    expect(publicSitemap).toContain('https://yunitytech.top/privacy/')
    expect(rootSitemap).toContain('https://yunitytech.top/')
    expect(rootSitemap).toContain('https://yunitytech.top/privacy/')
    expect(publicSitemap).toContain('<lastmod>2026-10-26</lastmod>')
  })

  it('deploy.yml IndexNow URL list includes all 14 tools and home', () => {
    const workflow = readFileSync(join(__dirname, '..', '.github', 'workflows', 'deploy.yml'), 'utf-8')
    for (const slug of Object.values(TOOL_ROUTES)) {
      expect(workflow).toContain(`"https://yunitytech.top/tools/${slug}/"`)
    }
    expect(workflow).toContain('"https://yunitytech.top/"')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run tests/sitemap-and-workflow.test.ts`
Expected: FAIL (root sitemap is missing tools, deploy.yml only has 6 tools).

- [ ] **Step 3: Update `public/sitemap.xml`, `sitemap.xml`, and `.github/workflows/deploy.yml`**

1. In `public/sitemap.xml`, update all `<lastmod>` to `2026-10-26` and verify all 16 entries (home + 14 tools + privacy).
2. Overwrite `sitemap.xml` in root with the exact contents of `public/sitemap.xml`.
3. In `.github/workflows/deploy.yml`, update `urlList` under the IndexNow step to contain all 15 indexable URLs:
   - `"https://yunitytech.top/"`
   - `"https://yunitytech.top/tools/json/"`
   - `"https://yunitytech.top/tools/timestamp/"`
   - `"https://yunitytech.top/tools/jwt/"`
   - `"https://yunitytech.top/tools/codec/"`
   - `"https://yunitytech.top/tools/regex/"`
   - `"https://yunitytech.top/tools/cron/"`
   - `"https://yunitytech.top/tools/uuid/"`
   - `"https://yunitytech.top/tools/color/"`
   - `"https://yunitytech.top/tools/aes/"`
   - `"https://yunitytech.top/tools/case/"`
   - `"https://yunitytech.top/tools/sql/"`
   - `"https://yunitytech.top/tools/curl/"`
   - `"https://yunitytech.top/tools/diff/"`
   - `"https://yunitytech.top/tools/json-to-type/"`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run tests/sitemap-and-workflow.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add public/sitemap.xml sitemap.xml .github/workflows/deploy.yml tests/sitemap-and-workflow.test.ts
git commit -m "feat(seo): synchronize sitemaps and expand IndexNow URLs to all tools"
```

---

### Task 2: 全站其余 13 个小工具 TDK 与 Open Graph 标准化

**Files:**
- Modify: `tools/json/index.html`
- Modify: `tools/jwt/index.html`
- Modify: `tools/codec/index.html`
- Modify: `tools/regex/index.html`
- Modify: `tools/cron/index.html`
- Modify: `tools/uuid/index.html`
- Modify: `tools/color/index.html`
- Modify: `tools/aes/index.html`
- Modify: `tools/case/index.html`
- Modify: `tools/sql/index.html`
- Modify: `tools/curl/index.html`
- Modify: `tools/diff/index.html`
- Modify: `tools/json-to-type/index.html`
- Test: `tests/tdk-consistency.test.ts` (Create)

**Interfaces:**
- Produces: 统一且契合 Google/Bing CTR 的 TDK（标题遵循 `[核心功能词] - [动作/形态描述] | DevHub`，首置高频搜索词）。

- [ ] **Step 1: Write test for standardized TDK titles**

Create `tests/tdk-consistency.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TOOL_ROUTES } from '../src/utils/tool-routes'

const EXPECTED_TITLE_PREFIXES: Record<string, string> = {
  'tool-json': 'JSON格式化 -',
  'tool-timestamp': '时间戳转换 -',
  'tool-jwt': 'JWT解码器 -',
  'tool-codec': '编解码与哈希 -',
  'tool-regex': '正则表达式在线测试 -',
  'tool-cron': 'Cron表达式生成器 -',
  'tool-uuid': 'UUID在线生成器 -',
  'tool-color': '颜色转换器 -',
  'tool-aes': 'AES在线加解密 -',
  'tool-case': '变量命名风格转换 -',
  'tool-sql': 'SQL格式化工具 -',
  'tool-curl': 'cURL转代码 -',
  'tool-diff': '文本Diff对比工具 -',
  'tool-json-to-type': 'JSON转类型 -'
}

describe('TDK title standard prefix check', () => {
  for (const [toolId, slug] of Object.entries(TOOL_ROUTES)) {
    it(`${slug} title starts with designated keyword prefix`, () => {
      const html = readFileSync(join(__dirname, '..', 'tools', slug, 'index.html'), 'utf-8')
      const match = html.match(/<title>(.*?)<\/title>/)
      expect(match, `title tag found in ${slug}`).toBeTruthy()
      const title = match![1]
      expect(title).toContain(EXPECTED_TITLE_PREFIXES[toolId])
      expect(title).toContain('| DevHub')
      expect(title.length).toBeLessThanOrEqual(65)
    })
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run tests/tdk-consistency.test.ts`
Expected: FAIL (existing titles use older patterns like "JSON 格式化与在线校验工具", "Unix 时间戳在线转换工具").

- [ ] **Step 3: Update `<title>`, `og:title`, and `twitter:title` for the 13 tools**

Update the following 13 files:
1. `tools/json/index.html`: `JSON格式化 - 在线JSON解析校验与美化压缩工具 | DevHub`
2. `tools/jwt/index.html`: `JWT解码器 - 在线JSON Web Token解析与载荷检查 | DevHub`
3. `tools/codec/index.html`: `编解码与哈希 - Base64/URL/MD5/SHA256在线转换 | DevHub`
4. `tools/regex/index.html`: `正则表达式在线测试 - 常用正则验证与速查手册 | DevHub`
5. `tools/cron/index.html`: `Cron表达式生成器 - 在线Cron语法解析与运行时间推算 | DevHub`
6. `tools/uuid/index.html`: `UUID在线生成器 - 批量生成UUID v4/v7与GUID生成 | DevHub`
7. `tools/color/index.html`: `颜色转换器 - HEX/RGB/HSL互转与WCAG对比度检测 | DevHub`
8. `tools/aes/index.html`: `AES在线加解密 - CBC/ECB/CTR对称加密与代码生成 | DevHub`
9. `tools/case/index.html`: `变量命名风格转换 - 驼峰/下划线/常量批量命名转换 | DevHub`
10. `tools/sql/index.html`: `SQL格式化工具 - 在线SQL美化排版与语法压缩 | DevHub`
11. `tools/curl/index.html`: `cURL转代码 - 在线将cURL转换为Fetch/Python/Go/Java | DevHub`
12. `tools/diff/index.html`: `文本Diff对比工具 - 在线代码与文本差异比对与补丁生成 | DevHub`
13. `tools/json-to-type/index.html`: `JSON转类型 - 在线JSON转TypeScript/Go结构体/Python类 | DevHub`
(Also keep `og:title` and `twitter:title` synchronized).

- [ ] **Step 4: Run test to verify it passes (with timestamp remaining or mocked)**

Note: `tool-timestamp` will be updated in Task 4, but we can set its title now or alongside.
Run: `npm run test:run tests/tdk-consistency.test.ts`
Expected: PASS once title prefixes match.

- [ ] **Step 5: Run existing static page consistency tests**

Run: `npm run test:run tests/static-pages-consistency.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tools/*/index.html tests/tdk-consistency.test.ts
git commit -m "feat(seo): standardize TDK titles across all 13 sibling tool pages"
```

---

### Task 3: 时间戳数据层升级（10 门语言速查、秒数换算表、扩展 FAQ）

**Files:**
- Modify: `src/data/tool-pages.ts:49-80`
- Modify: `src/ToolPage.vue:57-77`
- Test: `tests/tool-pages.test.ts`

**Interfaces:**
- Consumes: `toolPageContent['tool-timestamp']`
- Produces: 扩充后的 `extra`（包含 10 种语言：JS, Python, Java, Go, PHP, MySQL, PostgreSQL, Shell, C#, Redis），新增 `extraSections`（常用秒数换算速查表、典型时间戳里程碑），以及 5 条以上高质量工程 FAQ。

- [ ] **Step 1: Extend test in `tests/tool-pages.test.ts` for expanded timestamp data**

Modify `tests/tool-pages.test.ts` to assert that `toolPageContent['tool-timestamp']`:
1. Has at least 10 rows in `extra.rows`.
2. Has at least 5 FAQs.
3. Has `extraSections` with seconds conversion table.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run tests/tool-pages.test.ts`
Expected: FAIL (currently only 4 rows and 5 FAQs).

- [ ] **Step 3: Update `src/data/tool-pages.ts` and `src/ToolPage.vue`**

1. In `src/data/tool-pages.ts`:
   - Update `ToolPageContent` interface to support optional `extraSections?: ToolExtraSection[]`.
   - Update `toolPageContent['tool-timestamp']`:
     - `h1`: `时间戳转换 - 在线Unix时间戳与北京时间双向转换工具`
     - `intro`: `专为后端工程师、数据库管理员及分布式系统排障打造的高效转换工具。支持 10 位秒级 / 13 位毫秒级时间戳与北京时间(GMT+8)、UTC、ISO 8601 标准日期双向互转，自带实时秒级看板、多语言获取时间戳速查及常用时间秒数换算对照。`
     - `extra.rows`: Add PHP, MySQL, PostgreSQL, Shell/Bash, C# / .NET, Redis. Total 10 rows.
     - `extraSections`: Add "常用时间秒数换算对照表" (1分钟=60s, 1小时=3600s, 1天=86400s, 1周=604800s, 30天=2592000s, 365天=31536000s).
     - `faqs`: Ensure 5 comprehensive FAQs are present (秒级毫秒级区别、时区8小时偏差、Y2038问题、数据库为什么存时间戳、前端 new Date() 时区陷阱).
2. In `src/ToolPage.vue`:
   - Render `content.extraSections` beneath `content.extra` if present, with the same accessible table formatting.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run tests/tool-pages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/tool-pages.ts src/ToolPage.vue tests/tool-pages.test.ts
git commit -m "feat(seo): expand timestamp languages cheat sheet, seconds conversion table and FAQs"
```

---

### Task 4: 时间戳落地页静态 HTML 深度重构与 JSON-LD 富摘要升级

**Files:**
- Modify: `tools/timestamp/index.html`
- Test: `tests/static-pages-consistency.test.ts`

**Interfaces:**
- Produces: 语义完全同步的预渲染静态 HTML 与符合 Google Rich Results 标准的 Schema.org JSON-LD。

- [ ] **Step 1: Check consistency requirements**

`tests/static-pages-consistency.test.ts` checks:
- JSON-LD parses and every FAQ in JSON-LD is visible on page.
- Canonical is `https://yunitytech.top/tools/timestamp/`.
- All sibling tools are linked.

- [ ] **Step 2: Update `tools/timestamp/index.html`**

1. TDK updates:
   - `<title>时间戳转换 - 在线Unix时间戳与北京时间双向转换 (秒/毫秒互转) | DevHub</title>`
   - `<meta name="description" content="精准高效的在线时间戳转换工具 (Unix Timestamp Converter)。支持 10 位秒级与 13 位毫秒级时间戳与北京时间(GMT+8)、UTC、ISO 8601 双向互转；内置 Python/Java/JS/Go/PHP/MySQL/Shell 等 10 种语言获取时间戳代码速查及常用时间秒数换算对照。" />`
   - `<meta name="keywords" content="时间戳转换,时间戳,在线时间戳转换,北京时间转时间戳,毫秒时间戳转换,Unix时间戳,时间戳转日期,日期转时间戳,Unix Timestamp Converter,DevHub" />`
   - Open Graph & Twitter title and description synchronized.
2. JSON-LD updates:
   - `WebApplication`: name `"DevHub 时间戳转换器 (Unix Timestamp Converter)"`, description aligned.
   - `FAQPage`: Update questions and answers to match the 5 FAQs in `toolPageContent['tool-timestamp']`.
3. Pre-rendered HTML (`<article>` inside `<div id="app">`):
   - Update `<h1>时间戳转换 - 在线Unix时间戳与北京时间双向转换工具 (Unix Timestamp Converter)</h1>`.
   - Update 10-language table with JS, Python, Java, Go, PHP, MySQL, PostgreSQL, Shell, C#, Redis.
   - Add the "常用时间秒数换算对照表" section.
   - Add the "常见典型时间戳里程碑对照" section.
   - Verify every FAQ question and answer in JSON-LD is present in the FAQ section.

- [ ] **Step 3: Run static page consistency tests**

Run: `npm run test:run tests/static-pages-consistency.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tools/timestamp/index.html
git commit -m "feat(seo): enrich timestamp static pre-rendered HTML and FAQ JSON-LD schema"
```

---

### Task 5: 首页预渲染摘要与锚文本优化

**Files:**
- Modify: `index.html`
- Test: `tests/static-pages-consistency.test.ts`

**Interfaces:**
- Produces: 首页工具列表中关于“时间戳转换”的关键词权重强化与语义锚文本优化。

- [ ] **Step 1: Check `index.html` pre-rendered list and ItemList JSON-LD**

In `index.html`:
- ItemList JSON-LD for timestamp:
  - Name: `"时间戳转换器 (Unix Timestamp Converter)"`
- Pre-rendered `<ul>`:
  - Link text: `<a href="/tools/timestamp/" ...>时间戳转换 (Unix Timestamp)</a>`
  - Description: `Unix 秒/毫秒时间戳与北京时间双向转换、10门编程语言获取时间戳速查及常用秒数换算对照。`

- [ ] **Step 2: Run all tests**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(seo): optimize timestamp anchor text and description on homepage"
```

---

### Task 6: 全链路回归测试与构建打包验证

**Files:**
- None modified; verification only.

- [ ] **Step 1: Run complete test suite**

Run: `npm run test:run`
Expected: All tests pass (26+ test files, 165+ tests).

- [ ] **Step 2: Build project and verify dist output**

Run: `npm run build`
Verify:
1. `dist/sitemap.xml` exists and contains 16 URLs with `2026-10-26`.
2. `dist/tools/timestamp/index.html` contains the updated title, 10-language table, and JSON-LD schema.
3. No build warnings or errors.

- [ ] **Step 3: Git status clean check**

Run: `git status`
Expected: Clean working tree.
