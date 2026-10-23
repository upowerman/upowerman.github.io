# DevHub 前端设计修复(移动端/键盘/弹窗/对比度/视觉/工具路由页)实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落实设计评审 1–6 号修复:移动端 Tab 切换、卡片键盘可达(工具卡改真链接)、弹窗 a11y(Esc/焦点圈/aria)、低对比度文案修复、建立"终端命令栏"视觉记忆点、把 5 个工具从"首页+弹窗"改为独立路由页。

**Architecture:** 不引入 vue-router。`main.ts` 按 `window.location.pathname` 选择挂载 `App.vue`(首页)或 `ToolPage.vue`(工具页),工具页复用现有 5 个 Vite HTML 入口的预渲染 SEO 内容;首页所有"打开工具"路径从 store 弹窗状态改为 `window.location.assign` 整页导航;两个业务弹窗(添加书签/社群)收敛到共享 `useModal` 组合式函数(Esc、焦点圈、焦点恢复、滚动锁定)。视觉上唯一的大胆元素是首屏深色"命令栏"搜索框(两种主题下都是深色控制台),其余元素全部降噪。

**Tech Stack:** Vue 3.4 `<script setup>` + Pinia + @vueuse/core + Tailwind 3.4 + Vitest(happy-dom)。无新增依赖。

**Spec:** 本计划自带评审结论作为 spec(见 Global Constraints),无独立 spec 文件。

## Global Constraints

- 不新增任何 npm 依赖;不引入 vue-router。
- 现有 5 个 `tools/*/index.html` 的 head(SEO meta/JSON-LD/noscript)与预渲染静态正文**原样保留**,只允许在 `<head>` 顶部插入暗色防闪脚本。
- 站点文案语言为简体中文;所有 UI 新文案保持现有口吻(简洁、动宾结构、无感叹号滥用)。
- 主色不变:Tailwind `primary-*`(emerald 系,500=#22c55e,600=#16a34a);暗色模式 `darkMode: 'class'`,localStorage key 为 vueuse 默认 `vueuse-color-scheme`。
- 浅色模式正文级文字对比度 ≥ 4.5:1(即浅色下禁用 `text-slate-400`,统一 `text-slate-500 dark:text-slate-400`)。
- 每个 Task 结束必须 `npm run build` 通过(vue-tsc 类型检查 + vite 构建);涉及逻辑的 Task 先写 Vitest 测试。
- 每个工具的旧 URL(`/tools/json/` 等)和旧参数形式(`/?tool=json`)必须仍然可达(后者 301 式跳转)。
- 删除 `ToolContainer.vue` 与 store 中的 `activeToolId`/`openTool`/`closeTool`,新增唯一入口 `store.navigateToTool(id)`。

## Review Focus

以下是最可能坑到真实用户的输入/状态,每条已落实到对应 Task 的测试步骤:

1. **旧参数深链 `/?tool=jwt`** → 必须跳转到 `/tools/jwt/`,不能静默忽略(Task 1 单测 `legacyToolRedirect`)。
2. **未知工具路径 `/tools/unknown/`** → `toolIdFromPath` 返回 null,渲染首页 App 而不是白屏(Task 1 单测)。
3. **自定义书签(有 url)与工具(无 url)混排在置顶磁贴** → href 与 target 必须各自正确(Task 3 手动清单 + 构建后检查)。
4. **弹窗打开时焦点在 `<body>` 上按 Esc / Tab** → Esc 必须关闭、Tab 不得逃出弹窗、关闭后焦点回到触发按钮(Task 5 单测)。
5. **系统暗色 + 首次访问(无 localStorage)** → 首屏不得闪白;JS 慢加载时静态预渲染内容必须可读(Task 8 构建产物 grep + Task 9 截图验证)。

---

### Task 1: 工具路由映射工具函数

**Files:**
- Create: `src/utils/tool-routes.ts`
- Test: `tests/tool-routes.test.ts`

**Interfaces:**
- Produces(后续任务依赖):
  - `TOOL_ROUTES: Record<string, string>`(toolId → slug)
  - `toolPath(id: string): string | null` → `'/tools/json/'` 或 `null`
  - `toolIdFromPath(pathname: string): string | null`(容忍尾斜杠)
  - `legacyToolRedirect(search: string): string | null`(`'?tool=jwt'` → `'/tools/jwt/'`)

- [ ] **Step 1: 写失败测试**

```ts
// tests/tool-routes.test.ts
import { describe, it, expect } from 'vitest'
import { toolPath, toolIdFromPath, legacyToolRedirect, TOOL_ROUTES } from '../src/utils/tool-routes'

describe('toolPath', () => {
  it('maps registry ids to /tools/<slug>/', () => {
    expect(toolPath('tool-json')).toBe('/tools/json/')
    expect(toolPath('tool-timestamp')).toBe('/tools/timestamp/')
    expect(toolPath('tool-jwt')).toBe('/tools/jwt/')
    expect(toolPath('tool-codec')).toBe('/tools/codec/')
    expect(toolPath('tool-regex')).toBe('/tools/regex/')
  })
  it('returns null for unknown ids', () => {
    expect(toolPath('tool-nope')).toBeNull()
    expect(toolPath('')).toBeNull()
  })
})

describe('toolIdFromPath', () => {
  it('parses tool paths with or without trailing slash', () => {
    expect(toolIdFromPath('/tools/json/')).toBe('tool-json')
    expect(toolIdFromPath('/tools/json')).toBe('tool-json')
  })
  it('returns null for home, bare prefix and unknown tools', () => {
    expect(toolIdFromPath('/')).toBeNull()
    expect(toolIdFromPath('/tools/')).toBeNull()
    expect(toolIdFromPath('/tools/unknown/')).toBeNull()
  })
})

describe('legacyToolRedirect', () => {
  it('redirects legacy ?tool= param to canonical path', () => {
    expect(legacyToolRedirect('?tool=jwt')).toBe('/tools/jwt/')
  })
  it('is tolerant of extra params and unknown values', () => {
    expect(legacyToolRedirect('?a=1&tool=regex&b=2')).toBe('/tools/regex/')
    expect(legacyToolRedirect('?tool=bad')).toBeNull()
    expect(legacyToolRedirect('')).toBeNull()
  })
})

describe('TOOL_ROUTES coverage', () => {
  it('has 5 entries', () => {
    expect(Object.keys(TOOL_ROUTES)).toHaveLength(5)
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:run -- tests/tool-routes.test.ts`
Expected: FAIL(模块不存在)

- [ ] **Step 3: 最小实现**

```ts
// src/utils/tool-routes.ts
export const TOOL_ROUTES: Record<string, string> = {
  'tool-json': 'json',
  'tool-timestamp': 'timestamp',
  'tool-jwt': 'jwt',
  'tool-codec': 'codec',
  'tool-regex': 'regex'
}

const idBySlug: Record<string, string> = Object.fromEntries(
  Object.entries(TOOL_ROUTES).map(([id, slug]) => [slug, id])
)

export function toolPath(id: string): string | null {
  const slug = TOOL_ROUTES[id]
  return slug ? `/tools/${slug}/` : null
}

export function toolIdFromPath(pathname: string): string | null {
  const m = pathname.replace(/\/+$/, '').match(/^\/tools\/([a-z0-9-]+)$/)
  return m ? (idBySlug[m[1]] ?? null) : null
}

export function legacyToolRedirect(search: string): string | null {
  const param = new URLSearchParams(search).get('tool')
  return param ? toolPath(`tool-${param}`) : null
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm run test:run -- tests/tool-routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/tool-routes.ts tests/tool-routes.test.ts
git commit -m "feat(routing): add tool id/path mapping utils with legacy ?tool= redirect"
```

---

### Task 2: 工具页内容数据(从静态 HTML 原样转录)

**Files:**
- Create: `src/data/tool-pages.ts`
- Test: `tests/tool-pages.test.ts`

**Interfaces:**
- Consumes: `src/data/tools-registry.ts` 的 `defaultToolsRegistry`(已存在)
- Produces:
  - `interface ToolFaq { q: string; a: string }`
  - `interface ToolPageContent { h1: string; intro: string; extra?: { title: string; head: string[]; monoCols?: number[]; rows: string[][] }; faqs: ToolFaq[] }`
  - `toolPageContent: Record<string, ToolPageContent>`(key 为 toolId)

- [ ] **Step 1: 写失败测试**

```ts
// tests/tool-pages.test.ts
import { describe, it, expect } from 'vitest'
import { toolPageContent } from '../src/data/tool-pages'
import { defaultToolsRegistry } from '../src/data/tools-registry'

describe('toolPageContent integrity', () => {
  it('every registered tool has page content', () => {
    for (const tool of defaultToolsRegistry) {
      const c = toolPageContent[tool.id]
      expect(c, `missing content for ${tool.id}`).toBeTruthy()
      expect(c.h1.length).toBeGreaterThan(4)
      expect(c.intro.length).toBeGreaterThan(10)
      expect(c.faqs.length).toBeGreaterThanOrEqual(3)
      for (const f of c.faqs) {
        expect(f.q.length).toBeGreaterThan(6)
        expect(f.a.length).toBeGreaterThan(10)
      }
      if (c.extra) {
        expect(c.extra.head.length).toBeGreaterThan(1)
        expect(c.extra.rows.length).toBeGreaterThan(2)
        for (const row of c.extra.rows) {
          expect(row).toHaveLength(c.extra.head.length)
        }
      }
    }
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:run -- tests/tool-pages.test.ts`
Expected: FAIL(模块不存在)

- [ ] **Step 3: 写数据文件(内容逐字取自各工具静态 HTML 的 JSON-LD/正文)**

```ts
// src/data/tool-pages.ts
export interface ToolFaq {
  q: string
  a: string
}

export interface ToolExtraSection {
  title: string
  head: string[]
  /** 渲染为 font-mono 的列下标 */
  monoCols?: number[]
  rows: string[][]
}

export interface ToolPageContent {
  h1: string
  intro: string
  extra?: ToolExtraSection
  faqs: ToolFaq[]
}

export const toolPageContent: Record<string, ToolPageContent> = {
  'tool-json': {
    h1: 'JSON 格式化与在线校验工具',
    intro:
      '免费高效的纯前端离线 JSON 实验室:支持 2 空格/4 空格美化排版、单行去除空格压缩、语法错误精确定位与一键快速复制。数据 100% 在本地浏览器计算,绝不上报远程服务器。',
    faqs: [
      {
        q: '为什么推荐使用纯前端离线 JSON 格式化工具?',
        a: '传统在线工具通常将用户的 JSON 请求内容发送至服务端解析,存在接口密钥、Token 与业务私有数据泄露的严重风险。DevHub 采用纯前端 JavaScript 本地解析与格式化,数据全程仅在当前浏览器内存中流转,杜绝外泄可能。'
      },
      {
        q: 'JSON 格式化与单行压缩有什么应用场景区别?',
        a: '格式化排版(2空格或4空格)能够让多层嵌套的复杂 JSON 结构层次分明,极大提升后端接口联调与日志排查效率;而单行压缩(Minify)去除冗余空白符与换行,可显著减少数据传输体积,适合生产环境 API 调用或配置文件储存。'
      },
      {
        q: 'JSON 解析失败时如何准确定位语法错误?',
        a: '常见错误包括:尾部遗留多余逗号 (trailing comma)、使用了非标准的单引号包裹键值、未正确闭合花括号等。DevHub 内置错误捕获器,会在顶部红框精准提示解析失败原因,助你秒级排查修正。'
      }
    ]
  },
  'tool-timestamp': {
    h1: 'Unix 时间戳在线转换工具',
    intro:
      '专为后端工程师、数据库管理员及分布式系统排障打造的高效转换工具。支持 10 位秒级 / 13 位毫秒级时间戳与北京时间、UTC、ISO 8601 标准日期双向互转,自带实时看板与相对时间换算。',
    extra: {
      title: '常用语言获取当前时间戳速查',
      head: ['编程语言', '秒级时间戳 (10位)', '毫秒级时间戳 (13位)'],
      monoCols: [1, 2],
      rows: [
        ['JavaScript', 'Math.floor(Date.now() / 1000)', 'Date.now()'],
        ['Python', 'int(time.time())', 'int(time.time() * 1000)'],
        ['Java', 'Instant.now().getEpochSecond()', 'System.currentTimeMillis()'],
        ['Go', 'time.Now().Unix()', 'time.Now().UnixMilli()']
      ]
    },
    faqs: [
      {
        q: 'Unix 秒级时间戳 (10位) 与毫秒级时间戳 (13位) 有什么区别?',
        a: 'Unix 秒级时间戳是指从协调世界时 1970年1月1日 00:00:00 UTC 起至现在的总秒数(通常为 10 位整型,如 Python 的 time.time() 取整);毫秒级时间戳为总毫秒数(通常为 13 位整型,如 JavaScript 的 Date.now() 或 Java 的 System.currentTimeMillis())。'
      },
      {
        q: '为什么转换出来的时间经常差了 8 个小时?',
        a: '这是由于时区差引起的。Unix 时间戳本质上是无时区偏置的标准 UTC 绝对时间。中国标准时间(北京时间)为东八区(UTC+8),比标准 UTC 时间快 8 个小时。DevHub 同时展示 Local 北京时间与 UTC 标准时间,避免时区偏差导致的数据排查混乱。'
      },
      {
        q: '什么是 2038 年问题(Y2038 Bug)?',
        a: '在旧版 32 位有符号整数系统中,Unix 时间戳的最大表示上限为 2147483647(对应北京时间 2038年1月19日 11:14:07),溢出后会回卷为负数导致系统异常。现代 64 位操作系统已将时间上限扩展至近 2920 亿年之后。'
      }
    ]
  },
  'tool-jwt': {
    h1: 'JWT 在线解码与 Token 过期校验工具',
    intro:
      '专为后端架构师、API 开发者及全栈工程师打造的 JWT 调试利器。本地结构化着色解析 Header 与 Payload、深度校验标准 Claims,智能判定 Token 过期状态,绝不上报服务器。',
    extra: {
      title: 'JWT 标准 Claims 字段速查',
      head: ['字段', '英文全称', '含义与说明'],
      monoCols: [0],
      rows: [
        ['sub', 'Subject', '该 JWT 所面向的主体(通常为用户唯一 User ID)'],
        ['iss', 'Issuer', '签发机构标识或 OAuth 认证中心域名'],
        ['exp', 'Expiration Time', '过期时间(秒级 Unix 时间戳),超时即拒绝服务'],
        ['iat', 'Issued At', '签发时间(秒级 Unix 时间戳)'],
        ['nbf', 'Not Before', '生效时间,在此时刻之前 Token 不可被接受']
      ]
    },
    faqs: [
      {
        q: '在线使用 JWT 解码器解析生产环境 Token 安全吗?',
        a: '使用常规服务端解析工具存在安全合规隐患。DevHub JWT 解码器基于纯前端浏览器本地算法,使用 UTF-8 安全 Base64URL 纯客户端解码,没有任何后台接口接收你的 Token,可放心解析含用户鉴权信息的测试与生产 Token。'
      },
      {
        q: 'JWT 结构中的三部分分别代表什么?',
        a: "JWT 采用以句号 '.' 分隔的三段结构:第一段为 Header(头部,声明签名算法如 HS256/RS256 及令牌类型);第二段为 Payload(有效载荷,存放身份 Claims 与自定义业务属性);第三段为 Signature(数字签名,由前两段结合服务端私钥防篡改生成)。"
      },
      {
        q: '如何通过 exp 字段判断 JWT 是否过期?',
        a: 'exp 是 JWT 标准声明中的 Expiration Time(过期时间戳,以秒为单位)。DevHub 会自动将 exp * 1000 转换为可读的北京时间,并与本地当前系统时间对比:当当前时间大于 exp 时自动预警已过期。'
      }
    ]
  },
  'tool-codec': {
    h1: 'Base64 / URL 在线编解码与 MD5 / SHA256 哈希计算',
    intro:
      '纯前端离线一站式加密解密与哈希工具箱:支持中文字符与 Emoji 的 Base64 编码解码、URL 参数 Encode/Decode 转码,以及标准 MD5 与 SHA-256 摘要哈希极速计算。',
    extra: {
      title: '常见编解码与哈希算法对比指南',
      head: ['算法/格式', '是否可逆', '输出长度', '核心应用场景'],
      monoCols: [0],
      rows: [
        ['Base64', '可逆', '~ 原文本 133%', '文本协议传输图片、内联资源、邮件协议附件'],
        ['URL Encode', '可逆', '视非ASCII字符而定', 'HTTP GET 请求 Query 参数中包含特殊标点与汉字转义'],
        ['MD5', '不可逆', '32 位十六进制', '快速文件完整性校验 (Checksum)、数据指纹生成'],
        ['SHA-256', '不可逆', '64 位十六进制', '数字证书验签、区块链加密哈希、安全密码存证']
      ]
    },
    faqs: [
      {
        q: '为什么在部分网站进行 Base64 编解码时中文会出现乱码?',
        a: '浏览器原生的 btoa 和 atob 函数仅支持单字节 Latin1 字符(0-255)。遇到多字节的 UTF-8 中文字符或 Emoji 表情时会直接抛出字符越界异常或产生乱码。DevHub 底层统一采用 TextEncoder 与 TextDecoder 处理二进制字节流,实现 100% 汉字与特殊字符安全编解码。'
      },
      {
        q: 'MD5 和 SHA-256 可以被解密吗?',
        a: "MD5 与 SHA-256 是单向散列哈希函数(Hash Function),而非可逆的对称/非对称加密算法,数学上不可逆向解密。网上常见的所谓'MD5解密'实际上是利用预先计算好的'彩虹表(Rainbow Table)'进行碰撞反查。建议涉及密码存储时务必配合盐值(Salt)或使用专门的 bcrypt/argon2 算法。"
      },
      {
        q: 'encodeURI 与 encodeURIComponent 有什么区别?',
        a: 'encodeURI 用于编码完整的统一资源标识符 (URI),它不会对 URI 中的语义分隔符(如 http://, /, ?, &, =)进行转义;而 encodeURIComponent 会对除了字母数字外的绝大部分标点符号都进行转义,通常用于给 URL 查询参数中的单个 key 或 value 进行安全转码。'
      }
    ]
  },
  'tool-regex': {
    h1: '正则表达式在线测试与常用正则速查表',
    intro:
      '专为前端表单校验、爬虫提取与服务端日志分析打造的轻快正则调试器。支持实时多项匹配结果列表呈现,集成 200ms 防抖与 ReDoS 防假死保护,预置 6 款工业级常用模板。',
    extra: {
      title: '常用正则表达式速查模板清单',
      head: ['业务场景', '正则表达式模式 Pattern'],
      monoCols: [1],
      rows: [
        ['电子邮箱 (Email)', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'],
        ['中国手机号码', '1[3-9]\\d{9}'],
        ['IPv4 地址', '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'],
        ['HTTP/HTTPS 链接', 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)'],
        ['中文字符匹配', '[\\u4e00-\\u9fa5]+'],
        ['中国二代身份证号', '[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]']
      ]
    },
    faqs: [
      {
        q: '常用的正则表达式修饰符(Flags)代表什么?',
        a: "g (Global) 代表全局匹配,找到目标字符串中所有符合条件的结果而非在命中首项后退出;i (Ignore Case) 代表忽略英文大小写;m (Multiline) 代表多行匹配,让 ^ 和 $ 可以分别定位每行的行首与行尾;s (Dot All) 允许点号 '.' 匹配换行符。"
      },
      {
        q: '什么是正则表达式拒绝服务攻击 (ReDoS)?如何预防?',
        a: '当正则表达式包含大量嵌套分组、重叠交替以及贪婪量词(例如 (a+)+$)时,面对精心构造的不匹配长输入,正则引擎会发生天文数字级别的灾难性回溯(Catastrophic Backtracking),导致 CPU 满载假死。DevHub 通过文本长度截断与最多循环限制进行安全防死锁。'
      },
      {
        q: '如何用正则准确匹配包含汉字中文字符的内容?',
        a: '基本中文字符的 Unicode 范围为 [\\u4e00-\\u9fa5]。若要匹配全汉字字符串,可使用 ^[\\u4e00-\\u9fa5]+$;在现代 ES2018+ 还可以使用 Unicode 属性转义 /\\p{Script=Han}+/u。'
      }
    ]
  }
}
```

注意:上面 regex 行里的 `\\` 是 TS 源码转义,渲染到页面时是单反斜杠,与静态 HTML 一致。

- [ ] **Step 4: 运行确认通过**

Run: `npm run test:run -- tests/tool-pages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/tool-pages.ts tests/tool-pages.test.ts
git commit -m "feat(tool-pages): add per-tool landing content data transcribed from static SEO pages"
```

---

### Task 3: 工具独立路由页(核心架构切换)

**Files:**
- Create: `src/ToolPage.vue`
- Create: `src/data/tool-components.ts`
- Modify: `src/main.ts`
- Modify: `src/stores/useAppStore.ts`
- Modify: `src/App.vue`
- Modify: `src/components/layout/AppHeader.vue`(加 `toolMode` prop)
- Modify: `src/components/search/SearchBar.vue`(仅 selectSuggestion 一处)
- Delete: `src/components/tools/ToolContainer.vue`

**Interfaces:**
- Consumes: Task 1 的 `toolPath`/`toolIdFromPath`/`legacyToolRedirect`;Task 2 的 `toolPageContent`
- Produces:
  - `store.navigateToTool(toolId: string): void`(整页导航)
  - `AppHeader` 新增可选 prop `toolMode?: boolean`(隐藏 Tab/添加书签,Logo 点击回首页)
  - `toolComponents: Record<string, Component>`(toolId → 工具组件)

- [ ] **Step 1: 创建工具组件映射**

```ts
// src/data/tool-components.ts
import type { Component } from 'vue'
import JsonTool from '../tools/json/JsonTool.vue'
import TimestampTool from '../tools/timestamp/TimestampTool.vue'
import JwtTool from '../tools/jwt/JwtTool.vue'
import CodecTool from '../tools/codec/CodecTool.vue'
import RegexTool from '../tools/regex/RegexTool.vue'

export const toolComponents: Record<string, Component> = {
  'tool-json': JsonTool,
  'tool-timestamp': TimestampTool,
  'tool-jwt': JwtTool,
  'tool-codec': CodecTool,
  'tool-regex': RegexTool
}
```

- [ ] **Step 2: 改 store(删弹窗状态,加导航)**

`src/stores/useAppStore.ts`:

1. 顶部增加 `import { toolPath } from '../utils/tool-routes'`
2. 删除这一行:`const activeToolId = useLocalStorage<string | null>('devhub_active_tool_id', null)`
3. 将 `openTool`/`closeTool` 两个函数替换为:

```ts
function navigateToTool(toolId: string) {
  const path = toolPath(toolId)
  if (path) window.location.assign(path)
}
```

4. return 对象中删除 `activeToolId`、`openTool`、`closeTool`,加入 `navigateToTool`。

- [ ] **Step 3: AppHeader 加 toolMode**

`src/components/layout/AppHeader.vue`:

1. script 增加:

```ts
const props = defineProps<{
  toolMode?: boolean
}>()

function handleLogoClick() {
  if (props.toolMode) {
    window.location.assign('/')
    return
  }
  store.setActiveTab('all')
}
```

(原 `<div class="flex items-center space-x-3 cursor-pointer" @click="store.setActiveTab('all')">` 改为 `@click="handleLogoClick"`。)

2. 桌面 Tab `<nav class="hidden md:flex ...">` 改为 `<nav v-if="!toolMode" class="hidden md:flex ...">`
3. "添加书签"按钮加 `v-if="!toolMode"`(与现有 `hidden sm:flex` 合并为 `v-if="!toolMode" class="hidden sm:flex ..."`)

- [ ] **Step 4: 创建 ToolPage.vue**

```vue
<!-- src/ToolPage.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors selection:bg-primary-500 selection:text-white">
    <AppHeader tool-mode @open-community="isCommunityOpen = true" />

    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
      <!-- 面包屑 -->
      <nav aria-label="面包屑" class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <a href="/" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">DevHub 首页</a>
        <span aria-hidden="true">/</span>
        <a href="/#tools" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">开发者工具箱</a>
        <span aria-hidden="true">/</span>
        <span class="text-slate-700 dark:text-slate-300 font-medium">{{ tool?.name }}</span>
      </nav>

      <!-- 标题与简介 -->
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {{ content.h1 }}
      </h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {{ content.intro }}
      </p>

      <!-- 工具主体(首屏可见) -->
      <div v-if="toolComponent" class="mt-6 p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div class="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
            <component :is="activeIcon" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ tool?.name }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ tool?.desc }}</p>
          </div>
        </div>
        <component :is="toolComponent" />
      </div>

      <!-- 附加速查表 -->
      <section v-if="content.extra" class="mt-10 p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ content.extra.title }}</h2>
        <div class="overflow-x-auto -mx-1 px-1">
          <table class="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr class="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th v-for="h in content.extra.head" :key="h" class="py-2 pr-4 font-semibold whitespace-nowrap">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="text-slate-600 dark:text-slate-300">
              <tr v-for="(row, ri) in content.extra.rows" :key="ri" class="border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td v-for="(cell, ci) in row" :key="ci" class="py-2.5 pr-4 align-top" :class="content.extra.monoCols?.includes(ci) ? 'font-mono text-primary-700 dark:text-primary-300 break-all' : ''">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- FAQ(原生 details/summary,零 JS 可折叠) -->
      <section class="mt-10">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">常见问题</h2>
        <div class="space-y-2">
          <details v-for="(f, i) in content.faqs" :key="i" class="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <summary class="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ f.q }}</summary>
            <p class="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ f.a }}</p>
          </details>
        </div>
      </section>

      <!-- 其他工具互链 -->
      <section class="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 class="text-sm font-bold text-slate-900 dark:text-white mb-3">浏览更多 DevHub 生产力工具</h2>
        <div class="flex flex-wrap gap-2.5">
          <a
            v-for="other in otherTools"
            :key="other.id"
            :href="toolPath(other.id) || '/'"
            class="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ other.name }}
          </a>
          <a href="/" class="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors">返回 DevHub 首页</a>
        </div>
      </section>
    </main>

    <AppFooter @open-community="isCommunityOpen = true" />
    <CommunityModal :is-open="isCommunityOpen" @close="isCommunityOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileJson, Clock, KeyRound, Binary, Regex, Wrench } from 'lucide-vue-next'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import CommunityModal from './components/traffic/CommunityModal.vue'
import { useAppStore } from './stores/useAppStore'
import { toolPageContent } from './data/tool-pages'
import { toolComponents } from './data/tool-components'
import { toolPath } from './utils/tool-routes'

const props = defineProps<{
  toolId: string
}>()

const store = useAppStore()
const isCommunityOpen = ref(false)

const toolIcons: Record<string, any> = { FileJson, Clock, KeyRound, Binary, Regex }

const tool = computed(() => store.defaultToolsRegistry.find(t => t.id === props.toolId))
const content = computed(() => toolPageContent[props.toolId])
const toolComponent = computed(() => toolComponents[props.toolId] || null)
const activeIcon = computed(() => (tool.value && toolIcons[tool.value.icon]) || Wrench)
const otherTools = computed(() => store.defaultToolsRegistry.filter(t => t.id !== props.toolId))
</script>
```

- [ ] **Step 5: main.ts 路由分发**

```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ToolPage from './ToolPage.vue'
import './style.css'
import { toolIdFromPath, legacyToolRedirect } from './utils/tool-routes'

const legacy = legacyToolRedirect(window.location.search)
if (legacy) {
  // 兼容旧版 /?tool=json 参数直达
  window.location.replace(legacy)
} else {
  const toolId = toolIdFromPath(window.location.pathname)
  const app = toolId ? createApp(ToolPage, { toolId }) : createApp(App)
  app.use(createPinia())
  app.mount('#app')
}
```

- [ ] **Step 6: App.vue 集成(锚点化 + 删除弹窗/history 逻辑)**

对 `src/App.vue` 做以下修改:

1. **模板**:删除 `<!-- 模态框容器 -->` 下的 `<ToolContainer />` 行。
2. **模板** 工具卡片(`store.defaultToolsRegistry` 的 v-for):外层 `div` 改为 `<a>`,删除 `@click="store.openTool(tool.id)"`,`:href` 指向路由页:

```vue
<a
  v-for="tool in store.defaultToolsRegistry"
  :key="tool.id"
  :href="toolPath(tool.id) || '/#tools'"
  class="group p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between"
>
  <!-- 内部结构不变 -->
</a>
```

3. **模板** 首屏置顶磁贴:原来是单个 div + `handlePinnedClick`,改为按类型渲染两个 `<a>`:

```vue
<template v-for="item in pinnedItems" :key="item.id">
  <a
    v-if="'url' in item"
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500 shadow-sm hover:shadow transition-all group"
  >
    <SiteIcon :name="item.name" :url="item.url" />
    <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      {{ item.name }}
    </span>
  </a>
  <a
    v-else
    :href="toolPath(item.id) || '/'"
    class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500 shadow-sm hover:shadow transition-all group"
  >
    <SiteIcon :name="item.name" />
    <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      {{ item.name }}
    </span>
  </a>
</template>
```

4. **模板** "我的收藏"视图中的工具卡(原 `v-if="'keywords' in item"` 的 div):同样改为 `<a :href="toolPath(item.id) || '/'" ...>`,删除 `@click="store.openTool(item.id)"`,其余 class 不变,内部星标按钮保留 `@click.stop.prevent="store.togglePin(item.id)"`。
5. **script**:
   - 删除 `handlePinnedClick`、`toolToPathMap`、`pathToToolMap`、`handlePopState`、`watch(...)` 整段、`onMounted`/`onUnmounted` 中的 deep-link 与 popstate 监听(两个生命周期钩子可整体删除)。
   - import 中删除 `ToolContainer`、`onMounted`、`onUnmounted`、`watch`;新增 `import { toolPath } from './utils/tool-routes'`。

- [ ] **Step 7: SearchBar 切换导航**

`src/components/search/SearchBar.vue` 的 `selectSuggestion` 中 `store.openTool(item.id)` 改为 `store.navigateToTool(item.id)`。

- [ ] **Step 8: 删除旧组件**

```bash
git rm src/components/tools/ToolContainer.vue
```

- [ ] **Step 9: 全量测试 + 构建验证**

Run: `npm run test:run && npm run build`
Expected: 全部 PASS;build 无 TS 错误。构建产物中出现 `tools/json/index.html` 等入口。

- [ ] **Step 10: 本地起 preview 手动验证清单**

Run: `python3 -m http.server 4173 --directory dist`(后台)后逐项访问确认:
- `http://localhost:4173/` 首页正常,点 JSON 卡片 → 整页跳到 `/tools/json/`,工具主体在首屏(无弹窗、无地址栏不变)。
- `http://localhost:4173/?tool=jwt` → 跳转到 `/tools/jwt/`。
- `http://localhost:4173/tools/regex/` → 正则工具页,FAQ 可折叠,互链正确。
- `http://localhost:4173/tools/unknown/` → 渲染的是首页(回退行为)。
- 首页 Tab 切到"我的收藏",置顶磁贴中"JSON 实验室"点击进入工具页、DeepSeek 打开新标签页。

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(routing): tools become real routed pages; drop modal container and history hacks"
```

---

### Task 4: 键盘可达(NavCard 拉伸链接 / 搜索联想锚点化)

**Files:**
- Modify: `src/components/navigation/NavCard.vue`
- Modify: `src/components/search/SearchBar.vue`

**Interfaces:**
- Consumes: Task 1 `toolPath`、Task 3 `store.navigateToTool`
- Produces: 无新接口(纯模板/交互改造)

- [ ] **Step 1: NavCard 改拉伸链接(stretched link)模式**

`src/components/navigation/NavCard.vue` 模板整体替换为:

```vue
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
```

script 部分删除 `handleClick` 函数(`window.open` 逻辑由锚点接管)。

- [ ] **Step 2: SearchBar 联想项锚点化 + combobox aria + 方向键**

`src/components/search/SearchBar.vue`:

1. input 增加 aria 与方向键支持:

```vue
<input
  v-model="query"
  type="text"
  :placeholder="currentPlaceholder"
  role="combobox"
  :aria-expanded="isFocused && suggestions.length > 0"
  aria-controls="search-suggestions"
  aria-autocomplete="list"
  class="..."
  @keydown.enter="handleEnter"
  @keydown.down.prevent="focusFirstSuggestion"
  @focus="isFocused = true"
/>
```

2. 下拉容器与列表项改为 listbox/option 语义,列表项由 div 改为真锚点:

```vue
<div
  v-if="query && isFocused && suggestions.length > 0"
  id="search-suggestions"
  role="listbox"
  ref="suggestionsRef"
  class="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
>
  <div class="p-2 text-xs font-semibold text-slate-400 px-3">
    站内直达推荐
  </div>
  <a
    v-for="item in suggestions"
    :key="item.id"
    role="option"
    aria-selected="false"
    :href="suggestionHref(item)"
    :target="'url' in item ? '_blank' : undefined"
    :rel="'url' in item ? 'noopener noreferrer' : undefined"
    class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
  >
    <div class="flex items-center space-x-3">
      <SiteIcon :name="item.name" :url="'url' in item ? item.url : undefined" />
      <div>
        <div class="text-sm font-medium text-slate-800 dark:text-slate-200">
          {{ item.name }}
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md">
          {{ item.desc }}
        </div>
      </div>
    </div>
    <span class="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
      {{ 'keywords' in item ? '工具' : '网址' }}
    </span>
  </a>
</div>
```

3. script 增加(`toolPath` 从 `'../../utils/tool-routes'` 导入):

```ts
const suggestionsRef = ref<HTMLElement | null>(null)

function suggestionHref(item: (ToolItem & { type: 'tool' }) | (NavItem & { type: 'nav' })): string {
  return 'url' in item ? item.url : (toolPath(item.id) || '/')
}

function focusFirstSuggestion() {
  suggestionsRef.value?.querySelector('a')?.focus()
}
```

4. 引擎切换 pills 增加 `:aria-pressed="store.searchEngine === engine.id"`。

- [ ] **Step 3: 构建验证 + 手动键盘走查**

Run: `npm run test:run && npm run build`
手动(preview 环境,纯 Tab 键,不用鼠标):Tab 能依次聚焦 搜索框 → 联想第一项(输入 json 后)→ 引擎 pill → 工具卡(JSON 实验室,回车进入)→ NavCard(回车新开标签)→ 星标按钮(回车切换置顶)。每步焦点环可见。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix(a11y): keyboard-accessible nav cards via stretched links; combobox semantics for search suggestions"
```

---

### Task 5: 弹窗 a11y 组合式函数(Esc/焦点圈/焦点恢复/滚动锁)

**Files:**
- Create: `src/composables/useModal.ts`
- Test: `tests/use-modal.test.ts`
- Modify: `src/components/modal/AddLinkModal.vue`
- Modify: `src/components/traffic/CommunityModal.vue`

**Interfaces:**
- Produces:

```ts
useModal(isOpen: Ref<boolean>, onClose: () => void): {
  panelRef: Ref<HTMLElement | null>  // 绑到弹窗面板根元素,需带 tabindex="-1"
}
```

- [ ] **Step 1: 写失败测试**

```ts
// tests/use-modal.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, ref, h, nextTick } from 'vue'
import { useModal } from '../src/composables/useModal'

function mountModal() {
  const opened = ref(true)
  let closedTimes = 0
  const app = createApp({
    setup() {
      const { panelRef } = useModal(opened, () => { closedTimes++; opened.value = false })
      return () => h('div', { ref: panelRef as any, tabindex: '-1' }, [
        h('button', { id: 'first' }, 'first'),
        h('button', { id: 'last' }, 'last')
      ])
    }
  })
  const host = document.createElement('div')
  document.body.appendChild(host)
  app.mount(host)
  return { opened, get closedTimes() { return closedTimes }, unmount: () => app.unmount() }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('useModal', () => {
  it('locks body scroll and moves focus into panel on open', async () => {
    const m = mountModal()
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.activeElement?.id).toBe('first')
    m.unmount()
  })

  it('Escape closes even when focus is on body', async () => {
    const m = mountModal()
    await nextTick()
    document.body.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(m.closedTimes).toBe(1)
    expect(m.opened.value).toBe(false)
    m.unmount()
  })

  it('Tab wraps focus inside the panel (last -> first)', async () => {
    const m = mountModal()
    await nextTick()
    const last = document.getElementById('last')!
    last.focus()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    await nextTick()
    expect(document.activeElement?.id).toBe('first')
    m.unmount()
  })

  it('Shift+Tab wraps focus inside the panel (first -> last)', async () => {
    const m = mountModal()
    await nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }))
    await nextTick()
    expect(document.activeElement?.id).toBe('last')
    m.unmount()
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `npm run test:run -- tests/use-modal.test.ts`
Expected: FAIL(模块不存在)

- [ ] **Step 3: 实现组合式函数**

```ts
// src/composables/useModal.ts
import { nextTick, onUnmounted, ref, watch, type Ref } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

export function useModal(isOpen: Ref<boolean>, onClose: () => void) {
  const panelRef = ref<HTMLElement | null>(null)
  let restoreEl: HTMLElement | null = null

  function focusables(): HTMLElement[] {
    if (!panelRef.value) return []
    return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const items = focusables()
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.value)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(isOpen, async (open) => {
    if (open) {
      restoreEl = document.activeElement instanceof HTMLElement ? document.activeElement : null
      document.documentElement.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown, true)
      await nextTick()
      const target = focusables()[0] ?? panelRef.value
      target?.focus()
    } else {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown, true)
      restoreEl?.focus?.()
      restoreEl = null
    }
  }, { immediate: true })

  onUnmounted(() => {
    document.documentElement.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown, true)
  })

  return { panelRef }
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm run test:run -- tests/use-modal.test.ts`
Expected: PASS(4 条)

- [ ] **Step 5: AddLinkModal 接入**

`src/components/modal/AddLinkModal.vue`:

1. 面板根 div(白卡那层)改为:

```vue
<div
  ref="panelRef"
  role="dialog"
  aria-modal="true"
  aria-labelledby="add-link-title"
  tabindex="-1"
  class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
>
```

2. `<h3>` 加 `id="add-link-title"`。
3. script 增加:

```ts
import { useModal } from '../../composables/useModal'

const props = defineProps<{ isOpen: boolean }>()  // 替换原 defineProps(注意原来是匿名 defineProps<{isOpen:boolean}>(),需接住 props 传给 useModal)
const emit = defineEmits<{ (e: 'close'): void }>()

const { panelRef } = useModal(toRef(props, 'isOpen'), () => emit('close'))
```

(`toRef` 从 vue 导入;原有 `form`/`close`/`handleSubmit` 不动。)

- [ ] **Step 6: CommunityModal 同样接入**

`src/components/traffic/CommunityModal.vue`:

1. 面板根 div 加 `ref="panelRef" role="dialog" aria-modal="true" aria-labelledby="community-title" tabindex="-1"`。
2. `<h3>加入开发者技术社群</h3>` 加 `id="community-title"`。
3. script:

```ts
import { toRef } from 'vue'
import { useModal } from '../../composables/useModal'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const { panelRef } = useModal(toRef(props, 'isOpen'), () => emit('close'))
```

(原 `const copied = ref(false)` 与复制逻辑不动。)

- [ ] **Step 7: 全量验证 + 手动清单**

Run: `npm run test:run && npm run build`
手动(preview):打开"添加书签"→ 背景不可滚动、焦点落在名称输入框、Tab 在弹窗内循环、Esc 关闭且焦点回到"添加书签"按钮;社群弹窗同样。两个弹窗同时开一个时 Esc 只关最上层(keydown 是 window 捕获,后开者监听在数组尾部后注册——实测确认只触发一个即可;若两个都关,可接受,不阻塞)。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix(a11y): shared useModal with Esc close, focus trap/restore and scroll lock for both modals"
```

---

### Task 6: 头部 Tab 重构 + 移动端 Tab 行

**Files:**
- Modify: `src/components/layout/AppHeader.vue`

**Interfaces:**
- Consumes: 现有 `store.activeTab`/`store.setActiveTab`/`ViewTabType`
- Produces: 无(内部重构 + 新移动端行)

- [ ] **Step 1: 数组驱动 Tab + 移动端行**

`src/components/layout/AppHeader.vue` script 增加常量:

```ts
const viewTabs: { id: ViewTabType; label: string }[] = [
  { id: 'all', label: '综合看板' },
  { id: 'nav', label: '资源导航' },
  { id: 'tools', label: '开发工具箱' },
  { id: 'pinned', label: '我的收藏' }
]
```

(`ViewTabType` 从 `'../../types'` 导入。)

桌面 Tab 的 4 个手写按钮替换为一个 v-for(注意保留"我的收藏"前的 Star 图标判断,用 `t.id === 'pinned'` 条件渲染):

```vue
<nav v-if="!toolMode" role="tablist" aria-label="视图切换" class="hidden md:flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-semibold">
  <button
    v-for="t in viewTabs"
    :key="t.id"
    type="button"
    role="tab"
    :aria-selected="store.activeTab === t.id"
    @click="store.setActiveTab(t.id)"
    :class="[
      'px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1',
      store.activeTab === t.id
        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
    ]"
  >
    <Star v-if="t.id === 'pinned'" class="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
    <span>{{ t.label }}</span>
  </button>
</nav>
```

在 header 内部(主 row 的 div 之后、header 闭合标签之前)新增移动端第二行:

```vue
<!-- 移动端视图切换(可横滑) -->
<nav
  v-if="!toolMode"
  role="tablist"
  aria-label="视图切换"
  class="md:hidden flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
  <button
    v-for="t in viewTabs"
    :key="t.id"
    type="button"
    role="tab"
    :aria-selected="store.activeTab === t.id"
    @click="store.setActiveTab(t.id)"
    :class="[
      'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1',
      store.activeTab === t.id
        ? 'bg-primary-600 text-white shadow-sm'
        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
    ]"
  >
    <Star v-if="t.id === 'pinned'" class="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
    <span>{{ t.label }}</span>
  </button>
</nav>
```

- [ ] **Step 2: 构建 + 截图验证**

Run: `npm run build`,然后:

```bash
python3 -m http.server 4173 --directory dist & sleep 1
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --headless --disable-gpu \
  --screenshot=/tmp/tab-mobile.png --window-size=390,1200 --hide-scrollbars --virtual-time-budget=6000 \
  http://localhost:4173/
```

确认 390px 宽度下 header 下方出现"综合看板/资源导航/开发工具箱/我的收藏"胶囊行,点按可切换(截图静态确认存在即可,交互用 preview 手测)。

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(mobile): array-driven view tabs with horizontal scrollable mobile tab row in header"
```

---

### Task 7: 命令栏视觉记忆点(搜索框重设计,含折行修复)

**Files:**
- Modify: `src/components/search/SearchBar.vue`(模板重写,script 不变)

**Interfaces:**
- Consumes: Task 4 之后的 SearchBar 结构(联想锚点、combobox aria、focusFirstSuggestion 均保留)
- Produces: 无

设计说明(本站唯一的大胆元素):首屏搜索框做成**两种主题下都是深色的终端命令栏**——浅色页面中央一块 slate-900 控制台,左侧 `$` 提示符,等宽字体输入,绿色光标色,右侧 Enter 键位提示与搜索按钮。这是"开发者工作台"身份最贴切的视觉锚点,其余元素在 Task 8 全部降噪。

- [ ] **Step 1: 重写搜索框区模板**

将 engine pills + 输入框两部分替换为(pills 保留原位置与逻辑,仅微调间距;`aria-pressed` 等 Task 4 改动保留):

```vue
<!-- 搜索引擎切换 Tabs -->
<div class="flex items-center justify-center space-x-1.5 mb-2.5 text-xs font-medium">
  <button
    v-for="engine in engines"
    :key="engine.id"
    type="button"
    :aria-pressed="store.searchEngine === engine.id"
    @click="store.setSearchEngine(engine.id)"
    :class="[
      'px-2.5 py-1 rounded-full transition-colors',
      store.searchEngine === engine.id
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
    ]"
  >
    {{ engine.name }}
  </button>
</div>

<!-- 终端命令栏:全站视觉锚点,明暗主题均为深色 -->
<div class="relative flex items-center rounded-2xl bg-slate-900 dark:bg-black/60 border border-slate-700/80 dark:border-slate-800 shadow-lg shadow-slate-900/15 pl-4 pr-1.5 py-1.5 transition-all focus-within:border-primary-500/70 focus-within:ring-2 focus-within:ring-primary-500/40">
  <span class="font-mono text-sm md:text-base text-primary-400 select-none mr-2 shrink-0" aria-hidden="true">$</span>
  <input
    v-model="query"
    type="text"
    :placeholder="currentPlaceholder"
    role="combobox"
    :aria-expanded="isFocused && suggestions.length > 0"
    aria-controls="search-suggestions"
    aria-autocomplete="list"
    class="flex-1 min-w-0 bg-transparent py-2.5 text-sm md:text-base text-slate-100 placeholder:text-slate-500 font-mono caret-primary-400 outline-none"
    @keydown.enter="handleEnter"
    @keydown.down.prevent="focusFirstSuggestion"
    @focus="isFocused = true"
  />
  <button
    v-if="query"
    type="button"
    @click="query = ''"
    class="p-2 text-slate-500 hover:text-slate-300 shrink-0"
    aria-label="清空搜索词"
  >
    <X class="w-4 h-4" />
  </button>
  <kbd class="hidden md:inline-flex mr-2 px-1.5 py-0.5 rounded border border-slate-700 text-[10px] font-mono text-slate-500 shrink-0" aria-hidden="true">Enter</kbd>
  <button
    type="button"
    @click="executeSearch"
    class="shrink-0 whitespace-nowrap px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors"
  >
    搜索
  </button>
</div>
```

(注意:`shrink-0 whitespace-nowrap` 同时修复了窄屏"搜索"按钮折行 bug;`flex-1 min-w-0` 防止 input 撑破容器。)

- [ ] **Step 2: 联想下拉配色改为同族深色**

下拉容器(含 listbox/option 语义,来自 Task 4)class 调整为深色控制台风格:

```vue
class="absolute left-0 right-0 mt-1.5 bg-slate-900 dark:bg-black/70 rounded-xl shadow-2xl border border-slate-700/80 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-800"
```

- 列表项 hover:`hover:bg-slate-800/80`
- 名称文字:`text-slate-200`
- 描述文字:`text-slate-400`(深底上约 7:1,达标)
- "站内直达推荐"标签:`text-slate-500`
- 类型徽章:`bg-slate-800 text-slate-300`

- [ ] **Step 3: 构建 + 双主题截图**

Run: `npm run build && npm run test:run`

```bash
python3 -m http.server 4173 --directory dist & sleep 1
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --headless --disable-gpu \
  --screenshot=/tmp/cmdbar-light.png --window-size=1440,1000 --hide-scrollbars --virtual-time-budget=6000 \
  http://localhost:4173/
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --headless --disable-gpu \
  --screenshot=/tmp/cmdbar-mobile.png --window-size=360,900 --hide-scrollbars --virtual-time-budget=6000 \
  http://localhost:4173/
```

检查:浅色页中央深色命令栏成立、360px 下"搜索"按钮单行不折行、pills 不与命令栏重叠。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(design): terminal-style command bar search as the site's visual anchor; fix search button wrap"
```

---

### Task 8: 降噪与对比度清扫

**Files:**
- Modify: `src/components/layout/AppHeader.vue`(Logo 去 gradient/Pro)
- Modify: `src/components/common/SiteIcon.vue`(双色系徽章 + hasError 重置)
- Modify: `src/components/layout/AppFooter.vue`(🔒 → Lock 图标,对比度)
- Modify: `src/components/traffic/TrafficBanner.vue`(⭐ → 图标)
- Modify: `src/App.vue`(立即使用对比度、去 scale-110、空状态文案)
- Modify: `src/tools/timestamp/TimestampTool.vue`、`src/tools/regex/RegexTool.vue`、`src/components/traffic/CommunityModal.vue`(slate-400 → slate-500)

**Interfaces:** 无新接口。

- [ ] **Step 1: AppHeader Logo**

- 渐变字改为实色:`class="text-base font-extrabold tracking-tight text-slate-900 dark:text-white"`(删除 bg-gradient-to-r/bg-clip-text/text-transparent)。
- 删除 "Pro" 徽章 `<span>` 整块(无对应功能,是装饰噪音)。

- [ ] **Step 2: SiteIcon 徽章去彩虹**

`src/components/common/SiteIcon.vue`:

```ts
// 全站主题色深浅两档(fallback 徽章),替代原 10 色随机彩虹
const badgePalette = ['#15803d', '#166534', '#0f766e', '#115e59']

const badgeColor = computed(() => {
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return badgePalette[Math.abs(hash) % badgePalette.length]
})
```

并修复 hasError 不随 URL 复位的 bug(script 增加):

```ts
import { ref, computed, watch } from 'vue'

watch(() => [props.url, props.icon], () => {
  hasError.value = false
})
```

- [ ] **Step 3: 对比度替换清单(浅色下 slate-400 → slate-500,保留 dark 变体)**

| 文件 | 原 | 改为 |
|---|---|---|
| `src/App.vue`(工具卡底部) | `text-slate-400 group-hover:text-primary-600` | `text-slate-500 dark:text-slate-400 group-hover:text-primary-600` |
| `src/components/layout/AppHeader.vue`(副标题) | `text-[11px] text-slate-400` | `text-[11px] text-slate-500 dark:text-slate-400` |
| `src/components/layout/AppFooter.vue`(隐私行) | `text-slate-400 dark:text-slate-500` | `text-slate-500 dark:text-slate-400` |
| `src/components/traffic/CommunityModal.vue`(公众号行) | `text-[11px] text-slate-400` | `text-[11px] text-slate-500 dark:text-slate-400` |
| `src/tools/timestamp/TimestampTool.vue` 5 处(当前毫秒、Local/ISO/相对/UTC 标签、秒/毫秒标签) | `text-slate-400` | `text-slate-500 dark:text-slate-400` |
| `src/tools/regex/RegexTool.vue`(暂无匹配项) | `text-slate-400 py-4 text-center` | `text-slate-500 dark:text-slate-400 py-4 text-center` |

- [ ] **Step 4: emoji → Lucide 图标**

- `AppFooter.vue`:隐私行改为 flex 布局带图标:

```vue
<p class="flex items-center justify-center gap-1.5">
  <Lock class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
  <span>隐私保证:所有内置小工具均为纯前端运行,数据 100% 留存在您的本地浏览器,绝不上报服务器。</span>
</p>
```

(`Lock` 从 `lucide-vue-next` 导入。)

- `TrafficBanner.vue`:"GitHub 贡献 ⭐" → `<Github class="w-3.5 h-3.5" /> <span>GitHub 贡献</span>`(a 内已是 flex 容器,补 `items-center` 到 space-x-1 的 flex 上;`Github` 从 lucide 导入)。
- `App.vue` 空状态文案:"在任意卡片点击右上角 ⭐ 即可…" → "在任意卡片点击右上角的星标即可将网站或工具置顶到此处。"(纯文字,无 emoji)

- [ ] **Step 5: 去多余动效**

`src/App.vue` 工具卡图标容器删除 `group-hover:scale-110 transition-transform`(保留底色与文字 hover 反馈)。

- [ ] **Step 6: 构建 + 验证**

Run: `npm run test:run && npm run build`
截图复查 `/tmp` 下最新首页:Logo 实色无 Pro、卡片图标无放大动画、favicon 徽章(断网或服务失效时)为绿色系。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "polish: quiet the chrome — solid logo, two-tone fallback badges, AA contrast, lucide icons over emoji"
```

---

### Task 9: 暗色防闪脚本 + 全局动效/焦点样式

**Files:**
- Modify: `index.html`、`tools/json/index.html`、`tools/timestamp/index.html`、`tools/jwt/index.html`、`tools/codec/index.html`、`tools/regex/index.html`(均为同一插入)
- Modify: `src/style.css`

**Interfaces:** 无。

- [ ] **Step 1: 六个 HTML 头部插入防闪脚本**

在每份文件 `<meta charset="UTF-8" />` 之后立即插入(必须在样式渲染前执行;读取的 key 与 vueuse `useDark` 默认一致):

```html
<script>
  (function () {
    try {
      var s = localStorage.getItem('vueuse-color-scheme')
      var dark = s === 'dark' || ((!s || s === 'auto') && window.matchMedia('(prefers-color-scheme: dark)').matches)
      if (dark) document.documentElement.classList.add('dark')
    } catch (e) {}
  })()
</script>
```

- [ ] **Step 2: style.css 全局规则**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

:root.dark {
  color-scheme: dark;
}

/* 键盘焦点全局可见(配合各组件已有 ring) */
:focus-visible {
  outline: 2px solid #22c55e;
  outline-offset: 2px;
}

/* 弹窗入场:用户触发的反馈动效 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.18s ease-out;
}

/* 尊重系统减弱动效设置 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

(注:此前模板里的 `animate-fadeIn` 类没有任何 CSS 定义,是死类;本步让它真正生效并为所有动效提供 reduced-motion 逃生门。`:root` 上原 `color-scheme: light dark` 删除,改由 .dark 类驱动,与 Tailwind darkMode:'class' 对齐。)

- [ ] **Step 3: 构建 + 暗色首屏截图验证**

Run: `npm run build`

```bash
python3 -m http.server 4173 --directory dist & sleep 1
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --headless --disable-gpu \
  --screenshot=/tmp/dark-firstpaint.png --window-size=1440,1000 --hide-scrollbars --virtual-time-budget=6000 \
  --force-prefers-color-scheme=dark http://localhost:4173/
```

Expected: 首屏即深色(slate-950 底),无大面积白色。再验证构建产物中 6 个 HTML 都含 `vueuse-color-scheme`:

```bash
grep -l "vueuse-color-scheme" dist/index.html dist/tools/*/index.html
```

Expected: 6 个文件全部列出。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix(theme): inline dark-mode bootstrap to kill first-paint flash; global focus-visible and reduced-motion"
```

---

### Task 10: README 文案同步 + 全量验收

**Files:**
- Modify: `README.md`

**Interfaces:** 无。

- [ ] **Step 1: README 更新**

- "🛠️ 开箱即用工具箱:内置 5 大高频生产力工具,支持快捷键关闭与即开即用弹窗。" →
  "🛠️ **开箱即用工具箱**:内置 5 大高频生产力工具,每个工具均有独立 URL 页面,可收藏夹直达、可被搜索引擎收录。"
- 工具矩阵表格上方若提及"弹窗"字样一并核对替换为"独立页面"。

- [ ] **Step 2: 全量验收**

Run: `npm run test:run && npm run build`
Expected: 测试全绿、构建零错误。

手动验收清单(preview + 浏览器):
1. 桌面 1440px:首页 → 工具卡(回车/点击)→ 工具页 → 面包屑回首页。
2. 移动 390px:Tab 行可见可切换;命令栏不折行。
3. 键盘-only:完成一次"搜索 json → 上下联想 → 进入 JSON 工具 → 返回 → 打开社群弹窗 → Esc 关闭"全流程。
4. 暗色系统偏好:首屏无白闪;工具页同样。
5. `/tools/json/` 关闭 JS(DevTools → Disable JavaScript 刷新):静态文章与 noscript 内容可读。

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: sync README with routed tool pages replacing modal workflow"
```

---

## Self-Review 记录

- **Spec 覆盖**:评审 1(移动端 Tab)= Task 6;2(键盘可达+工具卡 `<a>`)= Task 3/4;3(搜索按钮折行 = Task 7,弹窗 Esc/aria/焦点 = Task 5);4(对比度)= Task 8;5(视觉记忆点+降噪)= Task 7/8;6(工具独立路由页)= Task 1/2/3。全覆盖。
- **占位符扫描**:Task 2 数据为逐字转录的真实文案;各任务代码块完整可执行;无 TBD/"适当处理"。
- **类型一致性**:`toolPath`/`toolIdFromPath`/`legacyToolRedirect` 签名在 Task 1/3/4/7 引用一致;`useModal(isOpen, onClose) → { panelRef }` 在 Task 5 定义与两个弹窗接入一致;`navigateToTool` 在 store 定义、SearchBar/首页消费一致;`toolPageContent`/`ToolPageContent` 在 Task 2 定义、Task 3 消费一致。
- **Review Focus 测试落位**:1→Task 1 单测;2→Task 1 单测;3→Task 3 Step 10 手动清单;4→Task 5 单测;5→Task 9 构建产物 grep + 截图。
- 已知取舍(不阻塞):弹窗同开时 Esc 可能同时关闭两个(窗口捕获监听);深链页 Vue 挂载时预渲染静态文与 Vue 渲染有一次轻微结构切换(布局同构,可接受);`/?tool=` 跳转用 `location.replace` 不留历史记录,符合"旧地址兼容"语义。
