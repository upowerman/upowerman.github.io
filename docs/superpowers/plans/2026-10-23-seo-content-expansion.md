# SEO 内容扩充与遗留优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 3 个纯前端工具页(cron/UUID/颜色转换)并同步全部 SEO 基建,深化现有 5 页 FAQ,完成 6 项遗留优化,最后合并 main 一次上线。

**Architecture:** 完全复用既有工具页模式:utils 纯函数(TDD)→ 工具组件 → `tools/<slug>/index.html` SEO 入口(Vite 多页构建)→ 注册进 `tools-registry/tool-routes/tool-components/tool-pages` 四张表。无新依赖、无路由变更、无后端。

**Tech Stack:** Vue 3.4 + Pinia + Tailwind 3.4 + Vitest(happy-dom)+ lucide-vue-next(已有)。

**Spec:** `docs/superpowers/specs/2026-10-23-seo-content-expansion-design.md`

## Global Constraints

- 不新增任何 npm 依赖;所有计算 100% 浏览器本地。
- 部署工件是 `dist/`(Actions 只上传 dist);根目录 `sitemap.xml` 是 Hugo 遗留、**不部署**——本计划只更新 `public/sitemap.xml`(spec"两份都改"据此修正,记 Ruling)。
- 每个工具四表注册缺一不可:`tools-registry.ts`(ToolItem)、`tool-routes.ts`(TOOL_ROUTES)、`tool-components.ts`、`tool-pages.ts`(ToolPageContent)。
- 新 HTML 入口必须与现有 5 页同构:SEO head(title/description/OG/canonical/JSON-LD 三件套)+ 静态预渲染正文 + noscript + 暗色防闪脚本(charset 之后)。
- FAQ 文案在 `tool-pages.ts` 与静态 HTML 中**同批提交、内容一致**。
- 每 Task 结束 `npm run test:run` + `npm run build` 必须绿;涉及逻辑先写失败测试。
- 推送 main(=部署上线)前必须获得用户明确确认。

## Review Focus

1. **cron 下次执行时间跨日/周末/跨月算错** → Task 1 固定日期断言(周五 10:00→下周一 09:00;月末跨月;每分钟连续)
2. **6 字段带秒 cron 秒粒度正确性** → Task 1 `*/30 * * * * *` 断言秒边界
3. **v7 UUID 有序性/批量唯一性破缺** → Task 2 同毫秒 1000 个唯一 + 时间戳前缀单调断言
4. **颜色非法输入渲染出 NaN/undefined** → Task 3 `#12`、`rgb(300,0,0)`、空串、`red` 全部返回 valid:false
5. **新页面 SEO 三件套缺失** → Task 4/5/6 构建后 grep dist 断言(canonical/JSON-LD/防闪脚本/canonical URL 正确)

---

### Task 1: cron-utils(TDD)

**Files:**
- Create: `src/utils/cron-utils.ts`
- Test: `tests/unit/cron-utils.test.ts`

**Interfaces:**
- Produces:
  - `parseCron(expr: string): { valid: boolean; error?: string; unsupported?: string; hasSeconds: boolean }`
  - `describeCron(expr: string): { valid: boolean; text?: string; error?: string; unsupported?: string }` — text 为中文
  - `nextRuns(expr: string, count = 5, from: Date = new Date()): Date[]` — 非法表达式返回 `[]`

- [ ] **Step 1: 写失败测试**

```ts
// tests/unit/cron-utils.test.ts
import { describe, it, expect } from 'vitest'
import { parseCron, describeCron, nextRuns } from '../../src/utils/cron-utils'

describe('parseCron', () => {
  it('accepts standard 5-field expressions', () => {
    expect(parseCron('*/5 * * * *').valid).toBe(true)
    expect(parseCron('0 9 * * 1-5').valid).toBe(true)
    expect(parseCron('30 8 1 * *').valid).toBe(true)
    expect(parseCron('0,30 9-17 * * 1,3,5').valid).toBe(true)
  })
  it('accepts 6-field with seconds', () => {
    const r = parseCron('*/30 * * * * *')
    expect(r.valid).toBe(true)
    expect(r.hasSeconds).toBe(true)
  })
  it('treats dow 7 as valid (sunday)', () => {
    expect(parseCron('0 9 * * 7').valid).toBe(true)
  })
  it('rejects wrong field count / out-of-range / garbage', () => {
    expect(parseCron('* * *').valid).toBe(false)
    expect(parseCron('61 * * * *').valid).toBe(false)
    expect(parseCron('* 25 * * *').valid).toBe(false)
    expect(parseCron('* * 0 * *').valid).toBe(false)
    expect(parseCron('* * * 13 *').valid).toBe(false)
    expect(parseCron('a * * * *').valid).toBe(false)
    expect(parseCron('').valid).toBe(false)
  })
  it('flags quartz modifiers as unsupported, not crash', () => {
    const r = parseCron('0 0 L * *')
    expect(r.valid).toBe(false)
    expect(r.unsupported).toBeTruthy()
    expect(parseCron('0 0 * * 1W').valid).toBe(false)
    expect(parseCron('0 0 * * 5#3').valid).toBe(false)
  })
})

describe('describeCron', () => {
  it('renders common patterns in chinese', () => {
    expect(describeCron('* * * * *').text).toBe('每分钟执行一次')
    expect(describeCron('*/5 * * * *').text).toBe('每 5 分钟执行一次')
    expect(describeCron('0 * * * *').text).toBe('每小时整点执行一次')
    expect(describeCron('30 8 * * *').text).toBe('每天 08:30 执行')
    expect(describeCron('0 9 * * 1-5').text).toBe('工作日(周一至周五)每天 09:00 执行')
    expect(describeCron('0 9 * * 1').text).toBe('每周一 09:00 执行')
    expect(describeCron('0 0 1 * *').text).toBe('每月 1 号 00:00 执行')
  })
  it('falls back to per-field translation', () => {
    expect(describeCron('15,45 */2 * * *').text).toContain('分钟')
  })
  it('propagates errors', () => {
    expect(describeCron('bad').valid).toBe(false)
    expect(describeCron('bad').error).toBeTruthy()
  })
})

describe('nextRuns', () => {
  it('every-minute runs are consecutive', () => {
    const from = new Date(2026, 9, 23, 10, 0, 30) // 周五
    const runs = nextRuns('* * * * *', 3, from)
    expect(runs.map(d => d.getMinutes())).toEqual([1, 2, 3])
  })
  it('weekday 09:00 skips the weekend', () => {
    const fri = new Date(2026, 9, 23, 10, 0, 0) // 2026-10-23 周五
    const runs = nextRuns('0 9 * * 1-5', 2, fri)
    expect(runs[0].getDay()).toBe(1) // 下周一
    expect(runs[0].getHours()).toBe(9)
    expect(runs[1].getDay()).toBe(2) // 再下周一? 不——第二个是周二
  })
  it('monthly run crosses month boundary', () => {
    const jan30 = new Date(2027, 0, 30, 12, 0, 0)
    const runs = nextRuns('0 0 1 * *', 1, jan30)
    expect(runs[0].getMonth()).toBe(1) // 2 月 1 日
    expect(runs[0].getDate()).toBe(1)
  })
  it('respects seconds field', () => {
    const from = new Date(2026, 9, 23, 10, 0, 10)
    const runs = nextRuns('*/30 * * * * *', 2, from)
    expect(runs[0].getSeconds()).toBe(30)
    expect(runs[1].getSeconds()).toBe(0)
  })
  it('dow 7 equals sunday', () => {
    const wed = new Date(2026, 9, 21, 12, 0, 0) // 周三
    const runs = nextRuns('0 9 * * 7', 1, wed)
    expect(runs[0].getDay()).toBe(0)
  })
  it('returns empty for invalid expr', () => {
    expect(nextRuns('bad', 3)).toEqual([])
  })
})
```

- [ ] **Step 2: 运行确认失败** — `npm run test:run -- tests/unit/cron-utils.test.ts`,FAIL:模块不存在
- [ ] **Step 3: 实现**

```ts
// src/utils/cron-utils.ts
export interface CronParseResult {
  valid: boolean
  error?: string
  unsupported?: string
  hasSeconds: boolean
  seconds?: number[]
  minutes?: number[]
  hours?: number[]
  daysOfMonth?: number[]
  months?: number[]
  daysOfWeek?: number[]
}

const FIELD_RANGES: { name: string; min: number; max: number }[] = [
  { name: '秒', min: 0, max: 59 },
  { name: '分钟', min: 0, max: 59 },
  { name: '小时', min: 0, max: 23 },
  { name: '日', min: 1, max: 31 },
  { name: '月', min: 1, max: 12 },
  { name: '星期', min: 0, max: 7 }
]

function parseField(part: string, min: number, max: number, name: string): { values?: number[]; error?: string; unsupported?: string } {
  if (/[LW#?]/i.test(part)) {
    return { unsupported: `字段"${name}"中的 Quartz 修饰符(${part.match(/[LW#?]/gi)!.join(', ')})暂不支持,请使用标准 5/6 字段语法` }
  }
  const out = new Set<number>()
  for (const piece of part.split(',')) {
    const m = piece.match(/^(?:(\*|\d+-\d+|\d+)(?:\/(\d+))?)$/)
    if (!m) return { error: `字段"${name}"语法无法识别: ${piece}` }
    const step = m[2] ? Number(m[2]) : 1
    if (step < 1) return { error: `字段"${name}"步长必须 ≥ 1` }
    let lo = min
    let hi = max
    if (m[1] !== '*') {
      if (m[1].includes('-')) {
        const [a, b] = m[1].split('-').map(Number)
        lo = a
        hi = b
      } else {
        lo = Number(m[1])
        hi = step > 1 || m[2] ? max : lo // "5" 单值;"5/15" 表示 5 到 max
        if (!m[2] && piece.includes('/')) hi = max
      }
    }
    if (lo < min || hi > max || lo > hi) return { error: `字段"${name}"取值超出范围 ${min}-${max}: ${piece}` }
    for (let v = lo; v <= hi; v += step) out.add(v === 7 && max === 7 ? 0 : v)
  }
  return { values: [...out].sort((a, b) => a - b) }
}

export function parseCron(expr: string): CronParseResult {
  const parts = expr.trim().split(/\s+/)
  if (parts.length < 5 || parts.length > 6 || parts[0] === '') {
    return { valid: false, hasSeconds: false, error: `需要 5 个字段(分 时 日 月 周)或 6 个字段(含秒),当前 ${parts.length} 个` }
  }
  const hasSeconds = parts.length === 6
  const fields = hasSeconds ? parts : ['0', ...parts]
  const keys: (keyof CronParseResult)[] = ['seconds', 'minutes', 'hours', 'daysOfMonth', 'months', 'daysOfWeek']
  const result: CronParseResult = { valid: true, hasSeconds }
  for (let i = 0; i < 6; i++) {
    const r = parseField(fields[i], FIELD_RANGES[i].min, FIELD_RANGES[i].max, FIELD_RANGES[i].name)
    if (r.unsupported) return { valid: false, hasSeconds, unsupported: r.unsupported }
    if (r.error) return { valid: false, hasSeconds, error: r.error }
    ;(result as any)[keys[i]] = r.values
  }
  return result
}

function rangeText(vals: number[] | undefined, min: number, max: number): string {
  if (!vals) return '*'
  if (vals.length === max - min + 1) return '每'
  if (vals.length === 1) return String(vals[0])
  return vals.join('/')
}

export function describeCron(expr: string): { valid: boolean; text?: string; error?: string; unsupported?: string } {
  const p = parseCron(expr)
  if (!p.valid) return p
  const [sec, min, hour, dom, mon, dow] = [p.seconds!, p.minutes!, p.hours!, p.daysOfMonth!, p.months!, p.daysOfWeek!]
  const everyMin = min.length === 60 && hour.length === 24 && dom.length === 31 && mon.length === 12 && dow.length === 8
  const secPrefix = p.hasSeconds && sec.length === 60 ? '' : p.hasSeconds ? `第 ${rangeText(sec, 0, 59)} 秒,` : ''
  if (everyMin && (!p.hasSeconds || sec.length === 60)) return { valid: true, text: '每分钟执行一次' }
  if (min.length > 1 && min[1] - min[0] === min[0] && hour.length === 24 && dom.length === 31 && mon.length === 12 && dow.length === 8) {
    return { valid: true, text: `每 ${min[1] - min[0]} 分钟执行一次` }
  }
  if (min.length === 1 && hour.length === 1 && dom.length === 31 && mon.length === 12 && dow.length === 8) {
    return { valid: true, text: `每天 ${String(hour[0]).padStart(2, '0')}:${String(min[0]).padStart(2, '0')} 执行` }
  }
  if (min.length === 1 && hour.length === 1 && dom.length === 31 && mon.length === 12) {
    const days = dow.map(d => '日一二三四五六'[d]).join('、')
    if (dow.length === 5 && dow.join(',') === '1,2,3,4,5') {
      return { valid: true, text: `工作日(周一至周五)每天 ${String(hour[0]).padStart(2, '0')}:${String(min[0]).padStart(2, '0')} 执行` }
    }
    if (dow.length === 1) return { valid: true, text: `每周${'日一二三四五六'[dow[0]]} ${String(hour[0]).padStart(2, '0')}:${String(min[0]).padStart(2, '0')} 执行` }
    return { valid: true, text: `每周${days} ${String(hour[0]).padStart(2, '0')}:${String(min[0]).padStart(2, '0')} 执行` }
  }
  if (min.length === 1 && hour.length === 1 && dom.length === 1 && mon.length === 12 && dow.length === 8) {
    return { valid: true, text: `每月 ${dom[0]} 号 ${String(hour[0]).padStart(2, '0')}:${String(min[0]).padStart(2, '0')} 执行` }
  }
  return {
    valid: true,
    text: `分钟: ${rangeText(min, 0, 59)}, 小时: ${rangeText(hour, 0, 23)}, 日: ${rangeText(dom, 1, 31)}, 月: ${rangeText(mon, 1, 12)}, 周: ${rangeText(dow, 0, 7)}${secPrefix ? '(秒: ' + rangeText(sec, 0, 59) + ')' : ''}`
  }
}

function matches(d: Date, p: CronParseResult): boolean {
  if (!p.seconds!.includes(d.getSeconds())) return false
  if (!p.minutes!.includes(d.getMinutes())) return false
  if (!p.hours!.includes(d.getHours())) return false
  if (!p.months!.includes(d.getMonth() + 1)) return false
  const domAll = p.daysOfMonth!.length === 31
  const dowAll = p.daysOfWeek!.length === 8
  const domOk = p.daysOfMonth!.includes(d.getDate())
  const dowOk = p.daysOfWeek!.includes(d.getDay())
  if (!domAll && !dowAll) return domOk || dowOk // Vixie cron OR 语义
  return domOk && dowOk
}

export function nextRuns(expr: string, count = 5, from: Date = new Date()): Date[] {
  const p = parseCron(expr)
  if (!p.valid) return []
  const out: Date[] = []
  const stepMs = p.hasSeconds ? 1000 : 60000
  let t = new Date(from.getTime())
  t.setMilliseconds(0)
  if (p.hasSeconds) t = new Date(Math.floor(t.getTime() / 1000) * 1000 + 1000)
  else t = new Date(Math.floor(t.getTime() / 60000) * 60000 + 60000)
  for (let i = 0; i < 600000 && out.length < count; i++) {
    if (matches(t, p)) out.push(new Date(t))
    t = new Date(t.getTime() + stepMs)
  }
  return out
}
```

注:`describeCron('0 * * * *')` 命中"每天 HH:MM"分支前需先判 `min.length===1 && hour.length===24`:在"每 N 分钟"判断之后补一条:

```ts
  if (min.length === 1 && hour.length === 24 && dom.length === 31 && mon.length === 12 && dow.length === 8) {
    return { valid: true, text: min[0] === 0 ? '每小时整点执行一次' : `每小时第 ${min[0]} 分钟执行` }
  }
```

- [ ] **Step 4: 运行确认通过** — `npm run test:run -- tests/unit/cron-utils.test.ts` PASS
- [ ] **Step 5: Commit** — `git add src/utils/cron-utils.ts tests/unit/cron-utils.test.ts && git commit -m "feat(cron): add cron parse/describe/next-runs utils with full test coverage"`

---

### Task 2: uuid-utils(TDD)

**Files:**
- Create: `src/utils/uuid-utils.ts`
- Test: `tests/unit/uuid-utils.test.ts`

**Interfaces:**
- Produces:
  - `generateUuidV4(): string`(8-4-4-4-12 小写)
  - `generateUuidV7(timestampMs?: number): string`
  - `generateUuids(version: 'v4' | 'v7', count: number, timestampMs?: number): string[]`
  - `formatUuid(u: string, opts: { uppercase?: boolean; hyphens?: boolean }): string`(hyphens 默认 true)

- [ ] **Step 1: 写失败测试**

```ts
// tests/unit/uuid-utils.test.ts
import { describe, it, expect } from 'vitest'
import { generateUuidV4, generateUuidV7, generateUuids, formatUuid } from '../../src/utils/uuid-utils'

const RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('uuid v4', () => {
  it('matches canonical format with version 4 and valid variant', () => {
    for (let i = 0; i < 50; i++) {
      const u = generateUuidV4()
      expect(u).toMatch(RE)
      expect(u[14]).toBe('4')
      expect('89ab').toContain(u[19])
    }
  })
})

describe('uuid v7', () => {
  it('has version 7, valid variant, and embeds the timestamp', () => {
    const ts = 1740000000000
    const u = generateUuidV7(ts)
    expect(u[14]).toBe('7')
    expect('89ab').toContain(u[19])
    const embedded = parseInt(u.slice(0, 12), 16) // 前 48 bit
    expect(embedded).toBe(ts)
  })
  it('is unique and timestamp-sorted within a batch', () => {
    const a = generateUuids('v7', 500, 1750000000000)
    expect(new Set(a).size).toBe(500)
    const b = generateUuids('v7', 10, 1750000001000)
    expect(parseInt(b[0].slice(0, 12), 16)).toBeGreaterThan(parseInt(a[499].slice(0, 12), 16))
  })
})

describe('generateUuids', () => {
  it('batch v4 all unique', () => {
    const list = generateUuids('v4', 1000)
    expect(list).toHaveLength(1000)
    expect(new Set(list).size).toBe(1000)
  })
})

describe('formatUuid', () => {
  it('uppercase and no-hyphen options', () => {
    const u = '01234567-89ab-cdef-0123-456789abcdef'
    expect(formatUuid(u, {})).toBe(u)
    expect(formatUuid(u, { uppercase: true })).toBe(u.toUpperCase())
    expect(formatUuid(u, { hyphens: false })).toBe(u.replace(/-/g, ''))
  })
})
```

- [ ] **Step 2: 运行确认失败**(模块不存在)
- [ ] **Step 3: 实现**

```ts
// src/utils/uuid-utils.ts
function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n)
  crypto.getRandomValues(b)
  return b
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map(v => v.toString(16).padStart(2, '0')).join('')
}

export function generateUuidV4(): string {
  const b = randomBytes(16)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = hex(b)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function generateUuidV7(timestampMs: number = Date.now()): string {
  const ts = BigInt(Math.floor(timestampMs)) & 0xffffffffffffn
  const b = randomBytes(16)
  const tsHex = ts.toString(16).padStart(12, '0')
  const h = tsHex + hex(b.subarray(6)) // 48bit 时间戳 + 80bit 随机
  const s = h.slice(0, 12) + '7' + h.slice(13, 16) + '8' + h.slice(17) // 版本 7 / 变体 10xx(取 8,熵足够)
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
}

export function generateUuids(version: 'v4' | 'v7', count: number, timestampMs: number = Date.now()): string[] {
  const n = Math.max(1, Math.min(100, Math.floor(count)))
  return Array.from({ length: n }, () => (version === 'v4' ? generateUuidV4() : generateUuidV7(timestampMs)))
}

export function formatUuid(u: string, opts: { uppercase?: boolean; hyphens?: boolean }): string {
  let out = opts.hyphens === false ? u.replace(/-/g, '') : u
  return opts.uppercase ? out.toUpperCase() : out
}
```

- [ ] **Step 4: 运行确认通过**
- [ ] **Step 5: Commit** — `git commit -m "feat(uuid): add v4/v7 generator utils with batch and format options"`

---

### Task 3: color-utils(TDD)

**Files:**
- Create: `src/utils/color-utils.ts`
- Test: `tests/unit/color-utils.test.ts`

**Interfaces:**
- Produces:
  - `interface Rgb { r: number; g: number; b: number }` / `interface Hsl { h: number; s: number; l: number }`
  - `parseColor(input: string): { valid: boolean; rgb?: Rgb; error?: string }`
  - `rgbToHex(rgb: Rgb): string`(#aabbcc 小写)/ `rgbToHsl(rgb: Rgb): Hsl` / `hslToRgb(hsl: Hsl): Rgb`
  - `contrastRatio(a: Rgb, b: Rgb): number`

- [ ] **Step 1: 写失败测试**

```ts
// tests/unit/color-utils.test.ts
import { describe, it, expect } from 'vitest'
import { parseColor, rgbToHex, rgbToHsl, hslToRgb, contrastRatio } from '../../src/utils/color-utils'

describe('parseColor', () => {
  it('accepts #abc, #aabbcc, rgb(), hsl()', () => {
    expect(parseColor('#fff').rgb).toEqual({ r: 255, g: 255, b: 255 })
    expect(parseColor('#16a34a').rgb).toEqual({ r: 22, g: 163, b: 74 })
    expect(parseColor('rgb(22, 163, 74)').rgb).toEqual({ r: 22, g: 163, b: 74 })
    expect(parseColor('hsl(0, 100%, 50%)').rgb).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseColor('HSL(140, 70%, 40%)').valid).toBe(true)
  })
  it('rejects invalid inputs without NaN', () => {
    for (const bad of ['', 'red', '#12', '#12345', 'rgb(300, 0, 0)', 'rgb(a,b,c)', 'hsl(400, 50, 40)', 'foo bar']) {
      const r = parseColor(bad)
      expect(r.valid, bad).toBe(false)
      expect(r.error, bad).toBeTruthy()
      expect(r.rgb, bad).toBeUndefined()
    }
  })
})

describe('conversions', () => {
  it('hex round trip', () => {
    expect(rgbToHex({ r: 22, g: 163, b: 74 })).toBe('#16a34a')
  })
  it('rgb<->hsl known values', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
    const gray = rgbToHsl({ r: 128, g: 128, b: 128 })
    expect(gray.s).toBe(0)
  })
})

describe('contrastRatio', () => {
  it('black/white = 21, same color = 1', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0)
    expect(contrastRatio({ r: 10, g: 10, b: 10 }, { r: 10, g: 10, b: 10 })).toBeCloseTo(1, 0)
  })
  it('#777 on white ≈ 4.47 (AA normal text boundary)', () => {
    expect(contrastRatio({ r: 119, g: 119, b: 119 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(4.47, 1)
  })
})
```

- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现**

```ts
// src/utils/color-utils.ts
export interface Rgb { r: number; g: number; b: number }
export interface Hsl { h: number; s: number; l: number }

export function parseColor(input: string): { valid: boolean; rgb?: Rgb; error?: string } {
  const s = input.trim().toLowerCase()
  if (!s) return { valid: false, error: '请输入颜色值' }
  let m = s.match(/^#([0-9a-f]{3})$/)
  if (m) {
    const [a, b, c] = m[1].split('').map(ch => parseInt(ch + ch, 16))
    return { valid: true, rgb: { r: a, g: b, b: c } }
  }
  m = s.match(/^#([0-9a-f]{6})$/)
  if (m) {
    const n = parseInt(m[1], 16)
    return { valid: true, rgb: { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 } }
  }
  m = s.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (m) {
    const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
    if ([r, g, b].every(v => v >= 0 && v <= 255)) return { valid: true, rgb: { r, g, b } }
    return { valid: false, error: 'RGB 分量需在 0-255 之间' }
  }
  m = s.match(/^hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%/)
  if (m) {
    const h = Number(m[1])
    const sat = Number(m[2])
    const l = Number(m[3])
    if (h < 0 || h > 360 || sat < 0 || sat > 100 || l < 0 || l > 100) return { valid: false, error: 'HSL 需满足 h∈[0,360], s/l∈[0,100]%' }
    return { valid: true, rgb: hslToRgb({ h, s: sat, l }) }
  }
  return { valid: false, error: '无法识别的颜色格式,支持 #hex、rgb()、hsl()' }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
    else if (max === gn) h = ((bn - rn) / d + 2) * 60
    else h = ((rn - gn) / d + 4) * 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const hp = ((h % 360) + 360) % 360 / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x]
  const m = ln - c / 2
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) }
}

function luminance({ r, g, b }: Rgb): number {
  const f = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}
```

- [ ] **Step 4: 运行确认通过**
- [ ] **Step 5: Commit** — `git commit -m "feat(color): add color parse/convert/contrast utils"`

---

### Task 4: cron 工具页完整接入

**Files:**
- Create: `src/tools/cron/CronTool.vue`、`tools/cron/index.html`
- Modify: `src/data/tools-registry.ts`、`src/data/tool-components.ts`、`src/data/tool-pages.ts`、`src/utils/tool-routes.ts`、`src/App.vue`(icon map + 网格)、`src/ToolPage.vue`(icon map)、`vite.config.ts`(输入 + 恢复原始 2 空格缩进)、`public/sitemap.xml`、`index.html`(ItemList/预渲染/noscript)、`public/404.html`、`README.md`

**Interfaces:**
- Consumes: Task 1 `parseCron/describeCron/nextRuns`;现有 `ToolItem`/`ToolPageContent` 结构
- Produces: `tool-cron` 全链路注册(后续任务照此模式);`toolIcons` 增加 `CalendarClock`

- [ ] **Step 1: 组件**

```vue
<!-- src/tools/cron/CronTool.vue -->
<template>
  <div class="space-y-4">
    <div>
      <div class="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Cron 表达式</div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="expr"
          type="text"
          placeholder="例如: */5 * * * *"
          data-autofocus
          class="flex-1 min-w-[220px] px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div class="flex flex-wrap gap-2 mt-2">
        <button v-for="p in presets" :key="p.expr" type="button" @click="expr = p.expr"
          class="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors">
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="result.error" class="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
      {{ result.error }}
    </div>

    <div v-else-if="result.unsupported" class="p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
      {{ result.unsupported }}
    </div>

    <div v-else class="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
      <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">人类可读描述</div>
      <div class="text-sm md:text-base font-semibold text-primary-700 dark:text-primary-300 mt-1">{{ result.text }}</div>
    </div>

    <div v-if="runs.length" class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">未来 5 次执行时间(本地时区)</div>
      <ol class="space-y-1.5">
        <li v-for="(d, i) in runs" :key="i" class="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
          <span>{{ pad(d.getMonth() + 1) }}-{{ pad(d.getDate()) }} {{ pad(d.getHours()) }}:{{ pad(d.getMinutes()) }}:{{ pad(d.getSeconds()) }} (周{{ '日一二三四五六'[d.getDay()] }})</span>
          <button type="button" @click="copy(d.toISOString())" class="text-primary-600 dark:text-primary-400 hover:underline">复制</button>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { describeCron, nextRuns } from '../../utils/cron-utils'

const presets = [
  { label: '每分钟', expr: '* * * * *' },
  { label: '每 5 分钟', expr: '*/5 * * * *' },
  { label: '每小时', expr: '0 * * * *' },
  { label: '每天 03:00', expr: '0 3 * * *' },
  { label: '工作日 09:00', expr: '0 9 * * 1-5' },
  { label: '每周一 09:00', expr: '0 9 * * 1' },
  { label: '每月 1 号', expr: '0 0 1 * *' }
]
const expr = ref('*/5 * * * *')
const copiedTip = ref('')

const result = computed(() => describeCron(expr.value))
const runs = computed(() => (result.value.valid ? nextRuns(expr.value, 5) : []))

function pad(n: number) { return String(n).padStart(2, '0') }
function copy(s: string) {
  navigator.clipboard.writeText(s).then(() => {
    copiedTip.value = s
    setTimeout(() => (copiedTip.value = ''), 1500)
  })
}
</script>
```

(copiedTip 未用于模板则删除——实现时保留 `copy` 但去掉 copiedTip,避免未使用变量。)

- [ ] **Step 2: 注册四表 + 图标映射**

`tools-registry.ts` 追加(放 codec 之后):

```ts
  {
    id: 'tool-cron',
    name: 'Cron 表达式工具',
    desc: '标准 5/6 位 Cron 解析、中文描述与下次执行时间计算',
    icon: 'CalendarClock',
    category: 'schedule',
    keywords: ['cron', 'crontab', '定时任务', 'quartz', '调度', '表达式', '下一次执行']
  },
```

`tool-routes.ts` TOOL_ROUTES 追加 `'tool-cron': 'cron'`;`tool-components.ts` 追加 CronTool;`App.vue` 与 `ToolPage.vue` 的 import 加 `CalendarClock` 并入 `toolIcons` map;`App.vue` 工具网格 `xl:grid-cols-5` → `xl:grid-cols-4`。

`tool-pages.ts` 追加:

```ts
  'tool-cron': {
    h1: 'Cron 表达式在线生成与解析工具',
    intro:
      '输入标准 5 位(分 时 日 月 周)或 6 位(含秒)Cron 表达式,即时获得中文语义描述与未来 5 次执行时间。支持 *、*/n、区间、列表等全部常用语法,100% 浏览器本地计算。',
    extra: {
      title: 'Cron 五个字段速查',
      head: ['字段', '允许值', '允许的特殊字符'],
      monoCols: [],
      rows: [
        ['分钟', '0-59', '* / - ,'],
        ['小时', '0-23', '* / - ,'],
        '日(月份中的天)', '1-31', '* / - ,',
        ['月', '1-12', '* / - ,'],
        ['星期(0 和 7 都表示周日)', '0-7', '* / - ,']
      ].map(r => (Array.isArray(r) ? r : [r])) as string[][]
    },
    faqs: [
      { q: 'Cron 表达式 5 位和 7 位有什么区别?', a: 'Linux crontab 使用 5 位(分 时 日 月 周);Quartz 等 Java 调度框架常用 7 位(秒 分 时 日 月 周 年),并在日/周字段扩展了 L(最后)、W(最近工作日)、#(第 n 个周 x)等修饰符。DevHub 支持标准 5 位与含秒 6 位语法,Quartz 特有修饰符会明确提示暂不支持,避免给出错误结果。' },
      { q: 'Cron 里的 ? 和 * 有什么区别?', a: '两者都表示"任意",但 ? 只能用在日和周字段,用于在另一个字段已被指定时避免歧义(如每月 1 号执行 0 0 1 * ?)。标准 Linux crontab 不支持 ?,那两个位置用 * 即可。' },
      { q: 'Cron 任务用的是服务器时区还是 UTC?', a: 'cron 守护进程按服务器本地时区匹配字段。容器化部署的服务器常默认 UTC,导致任务比预期早 8 小时(东八区视角)。排查时先 date 确认服务器时区,或在容器中设置 TZ=Asia/Shanghai。本工具按你的浏览器本地时区计算下次执行时间。' }
    ]
  },
```

(注:上面 extra.rows 中的裸字符串写法在 TS 里不合法,实现时直接写成规范的二维数组。)

- [ ] **Step 3: vite.config.ts(恢复 2 空格缩进 + 加 3 入口,cron 本任务先加 cron 一项,Task 5/6 再各加一项)**

```ts
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
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'tools/json': path.resolve(__dirname, 'tools/json/index.html'),
        'tools/timestamp': path.resolve(__dirname, 'tools/timestamp/index.html'),
        'tools/jwt': path.resolve(__dirname, 'tools/jwt/index.html'),
        'tools/codec': path.resolve(__dirname, 'tools/codec/index.html'),
        'tools/regex': path.resolve(__dirname, 'tools/regex/index.html'),
        'tools/cron': path.resolve(__dirname, 'tools/cron/index.html')
      },
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', '@vueuse/core'],
          icons: ['lucide-vue-next'],
          crypto: ['crypto-js']
        }
      }
    }
  },
  test: {
    environment: 'happy-dom'
  }
})
```

- [ ] **Step 4: tools/cron/index.html**

head 复用既有模板:title `Cron 表达式在线生成与解析工具 - 下次执行时间计算 | DevHub`;description `免费好用的在线 Cron 表达式工具:输入 crontab 表达式即时生成中文语义解读,计算未来 5 次执行时间,内置每分钟/每小时/工作日/每周/每月常用模板。纯前端本地计算,数据不上报。`;keywords `cron表达式,cron解析,crontab,定时任务,quartz cron,下一次执行时间,cron在线生成,DevHub`;canonical `https://yunitytech.top/tools/cron/`;OG/Twitter 同构;JSON-LD @graph:WebApplication(name "DevHub Cron 表达式工具"/url …/tools/cron/)+ BreadcrumbList(DevHub 首页 → 开发者工具箱 → Cron 表达式工具)+ FAQPage(3 条与 tool-pages.ts 完全一致,全文照抄 Step 2 的 faqs);charset 后插入暗色防闪脚本(与现有一字不差);`<body>`/`<div id="app">`/noscript 同构。预渲染正文结构:

```html
<article style="max-width: 900px; margin: 0 auto; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
  <nav style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
    <a href="/" style="color: #16a34a; text-decoration: none;">DevHub 首页</a> &gt; <span>开发者工具箱</span> &gt; <span>Cron 表达式工具</span>
  </nav>
  <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Cron 表达式在线生成与解析工具 (Cron Expression Parser)</h1>
  <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">(与 tool-pages.ts intro 相同正文)</p>
  <section style="margin-bottom: 32px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #ffffff;">
    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">Cron 五个字段速查</h2>
    <table style="width: 100%; font-size: 13px; border-collapse: collapse; text-align: left;">
      <thead><tr style="border-bottom: 2px solid #e2e8f0; color: #475569;"><th style="padding: 8px 4px;">字段</th><th style="padding: 8px 4px;">允许值</th><th style="padding: 8px 4px;">特殊字符</th></tr></thead>
      <tbody>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 4px; font-weight: 600;">分钟</td><td style="padding: 8px 4px;">0-59</td><td style="padding: 8px 4px; font-family: monospace;">* / - ,</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 4px; font-weight: 600;">小时</td><td style="padding: 8px 4px;">0-23</td><td style="padding: 8px 4px; font-family: monospace;">* / - ,</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 4px; font-weight: 600;">日</td><td style="padding: 8px 4px;">1-31</td><td style="padding: 8px 4px; font-family: monospace;">* / - ,</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 4px; font-weight: 600;">月</td><td style="padding: 8px 4px;">1-12</td><td style="padding: 8px 4px; font-family: monospace;">* / - ,</td></tr>
        <tr><td style="padding: 8px 4px; font-weight: 600;">星期</td><td style="padding: 8px 4px;">0-7(0/7 为周日)</td><td style="padding: 8px 4px; font-family: monospace;">* / - ,</td></tr>
      </tbody>
    </table>
  </section>
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">常见问题解答 (FAQ)</h2>
    <!-- 3 条 FAQ,与 tool-pages.ts faqs 逐字一致:h3 Q + p A,样式照抄既有页面 -->
  </section>
  <section style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
    <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">浏览更多 DevHub 生产力工具</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 12px;">
      <!-- JSON 实验室/时间戳/JWT/编解码/正则 5 个链接样式同现有页面 + 返回首页绿色链接 -->
    </div>
  </section>
</article>
```

- [ ] **Step 5: 基建同步**

- `public/sitemap.xml`:正则工具后追加 cron URL 块(lastmod `2026-10-23`,priority 0.9,注释"Cron 表达式工具")
- `index.html`:ItemList 追加 position 6(JSON-LD);预渲染 `<ul>` 追加一条 `<li>`(h3 链接 `/tools/cron/` + 描述"标准 Cron 解析、中文语义描述与下次执行时间计算");noscript 列表追加一条
- `public/404.html`:tools-grid 追加 `<a href="/tools/cron/" class="tool-link">Cron 表达式</a>`
- `README.md` 工具矩阵表追加一行:`| **Cron 表达式工具** | 5/6 位表达式解析、中文语义描述、未来 5 次执行时间计算、常用模板一键填入 | 定时任务配置、crontab 排查、Quartz 迁移对照 |`

- [ ] **Step 6: 验证**

Run: `npm run test:run && npm run build`
然后:`python3 -m http.server 4173 --directory dist` 后 grep + 截图:

```bash
curl -s http://localhost:4173/tools/cron/ | grep -c "Cron 表达式在线生成与解析工具\|application/ld+json\|vueuse-color-scheme"
# 期望 ≥ 3(标题、JSON-LD、防闪脚本都在)
curl -s http://localhost:4173/sitemap.xml | grep -c "tools/cron"
# 期望 1
```

Edge 截图 `/tools/cron/` 1440×1600:工具主体首屏可见、FAQ 可折叠、互链正确。

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat(cron): full tool page with SEO pre-render, registrations, sitemap and cross-links"`

---

### Task 5: uuid 工具页接入

**Files:** 与 Task 4 同构,对象为 uuid。
- Create: `src/tools/uuid/UuidTool.vue`、`tools/uuid/index.html`
- Modify: 四表 + `vite.config.ts`(追加 `'tools/uuid'` 输入)+ `public/sitemap.xml` + `index.html` + `public/404.html` + `README.md`;icon `Fingerprint`(两个 icon map 都加)

**Interfaces:**
- Consumes: Task 2 全部函数;Task 4 建立的接入模式
- Produces: `tool-uuid` 全链路注册

- [ ] **Step 1: 组件**

```vue
<!-- src/tools/uuid/UuidTool.vue -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
      <div class="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-semibold">
        <button type="button" @click="version = 'v4'" :class="version === 'v4' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-500'" class="px-3 py-1.5">v4 随机</button>
        <button type="button" @click="version = 'v7'" :class="version === 'v7' ? 'bg-primary-600 text-white rounded-md' : 'text-slate-500'" class="px-3 py-1.5">v7 有序</button>
      </div>
      <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">数量
        <input v-model.number="count" type="number" min="1" max="100" class="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none" />
      </label>
      <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><input v-model="uppercase" type="checkbox" class="accent-primary-600" />大写</label>
      <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><input v-model="hyphens" type="checkbox" class="accent-primary-600" />连字符</label>
      <button type="button" @click="generate" class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors">生成</button>
      <button v-if="list.length" type="button" @click="copyAll" class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors">{{ copiedAll ? '已全部复制!' : '复制全部' }}</button>
    </div>

    <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
      <div v-for="(u, i) in list" :key="i" class="flex items-center justify-between py-1.5 gap-2">
        <code class="text-xs font-mono text-slate-700 dark:text-slate-200 break-all">{{ u }}</code>
        <button type="button" @click="copyOne(u)" class="text-xs text-primary-600 dark:text-primary-400 hover:underline shrink-0">{{ copied === u ? '已复制' : '复制' }}</button>
      </div>
      <p v-if="list.length === 0" class="text-slate-500 dark:text-slate-400 text-xs text-center py-4">点击"生成"批量创建 {{ version.toUpperCase() }} UUID</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateUuids, formatUuid } from '../../utils/uuid-utils'

const version = ref<'v4' | 'v7'>('v4')
const count = ref(10)
const uppercase = ref(false)
const hyphens = ref(true)
const list = ref<string[]>([])
const copied = ref('')
const copiedAll = ref(false)

function generate() {
  list.value = generateUuids(version.value, count.value).map(u => formatUuid(u, { uppercase: uppercase.value, hyphens: hyphens.value }))
}

function copyOne(u: string) {
  navigator.clipboard.writeText(u).then(() => {
    copied.value = u
    setTimeout(() => (copied.value = ''), 1500)
  })
}

function copyAll() {
  navigator.clipboard.writeText(list.value.join('\n')).then(() => {
    copiedAll.value = true
    setTimeout(() => (copiedAll.value = false), 1500)
  })
}
</script>
```

(挂载时先 `generate()` 一次让页面非空。)

- [ ] **Step 2: 注册** — registry 条目:`id: 'tool-uuid'`,`name: 'UUID 生成器'`,`desc: '批量生成 v4 随机与 v7 时间戳有序 UUID,支持大小写与连字符开关'`,`icon: 'Fingerprint'`,`category: 'id'`,`keywords: ['uuid', 'guid', 'v4', 'v7', '生成器', '唯一 id', '批量']`。tool-pages:

```ts
  'tool-uuid': {
    h1: 'UUID 在线批量生成器',
    intro:
      '基于浏览器加密安全随机源(crypto.getRandomValues)批量生成 UUID:v4 全随机版本与 v7 时间戳有序版本,支持 1-100 个批量产出、大写与连字符开关、单条或全部一键复制。',
    extra: {
      title: 'UUID 版本选型速查',
      head: ['版本', '生成方式', '有序性', '典型场景'],
      monoCols: [],
      rows: [
        ['v1', 'MAC 地址 + 时间戳', '时间有序', '遗留系统,已因隐私问题很少使用'],
        ['v4', '122 位纯随机', '无序', '绝大多数场景的默认选择:主键、请求 ID、文件名'],
        ['v7', '48 位毫秒时间戳 + 随机', '毫秒有序', '数据库主键(插入局部性好)、日志追踪、可排序令牌']
      ]
    },
    faqs: [
      { q: 'UUID v1、v4、v7 应该怎么选?', a: 'v4(122 位随机)是通用默认,无信息泄露;v7 前 48 位是毫秒时间戳,天然按时间排序,做数据库主键时 B+ 树插入局部性远好于随机的 v4,是新版主流推荐;v1 含 MAC 地址有隐私问题,新项目不应使用。' },
      { q: 'UUID 真的会重复吗?', a: '理论上会,实际上概率可以忽略:随机 122 位的 v4,生成 103 万亿个后碰撞概率才约 10⁻¹²。日常业务量级下可以放心当作全局唯一标识使用,无需查重。' },
      { q: '为什么不用 Math.random 生成 UUID?', a: 'Math.random 是非加密安全的伪随机数,可被预测与重现;UUID 用作令牌或 ID 时必须使用加密安全随机源。本工具使用浏览器原生 crypto.getRandomValues,与后端 crypto 库同等强度。' }
    ]
  },
```

HTML:title `UUID 在线批量生成器 (v4/v7) - GUID 生成 | DevHub`;description `免费在线 UUID/GUID 批量生成器:加密安全随机源生成 v4 与 v7 版本 UUID,支持大小写、连字符与批量复制。纯前端本地生成,绝不联网。`;keywords `uuid在线生成,guid生成器,uuid v4,uuid v7,批量uuid,唯一标识,DevHub`;canonical `https://yunitytech.top/tools/uuid/`;预渲染正文含"UUID 版本选型速查"表(与 extra.rows 一致)+ FAQ + 互链。JSON-LD 三件套同构。

- [ ] **Step 3: 基建同步** — sitemap/index.html(ItemList position 7、预渲染 li、noscript)/404/README(`| **UUID 生成器** | v4/v7 版本切换、1-100 批量生成、大小写与连字符开关、一键复制 | 数据库主键设计、测试数据构造、请求追踪 ID |`)
- [ ] **Step 4: 验证** — 同 Task 4 Step 6(grep `/tools/uuid/` + 截图)
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(uuid): full tool page with SEO pre-render and registrations"`

---

### Task 6: color 工具页接入

**Files:** 同构。
- Create: `src/tools/color/ColorTool.vue`、`tools/color/index.html`
- Modify: 四表 + `vite.config.ts`(`'tools/color'`)+ `public/sitemap.xml` + `index.html` + `public/404.html` + `README.md`;icon `Palette`(两个 icon map 都加)

**Interfaces:**
- Consumes: Task 3 全部函数
- Produces: `tool-color` 全链路注册;工具总数 8

- [ ] **Step 1: 组件**

```vue
<!-- src/tools/color/ColorTool.vue -->
<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0" :style="{ backgroundColor: previewCss }" aria-hidden="true"></div>
      <input
        v-model="input"
        type="text"
        placeholder="输入 #16a34a / rgb(22,163,74) / hsl(142,76%,36%)"
        data-autofocus
        class="flex-1 min-w-[240px] px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div v-if="error" class="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">{{ error }}</div>

    <div v-if="rgb" class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div v-for="f in formats" :key="f.label" class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>{{ f.label }}</span>
          <button type="button" @click="copyText(f.value)" class="text-primary-600 dark:text-primary-400 hover:underline">{{ copied === f.value ? '已复制' : '复制' }}</button>
        </div>
        <code class="text-sm font-mono text-slate-800 dark:text-slate-100">{{ f.value }}</code>
      </div>
    </div>

    <div v-if="rgb" class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">WCAG 对比度检查</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center justify-between"><span>对白色 #FFFFFF</span><span class="font-mono font-semibold text-slate-800 dark:text-slate-200">{{ ratioWhite.toFixed(2) }} : 1</span></div>
          <div class="mt-1.5 flex gap-1.5">
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioWhite >= 4.5 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AA 正文 {{ ratioWhite >= 4.5 ? '达标' : '未达' }}</span>
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioWhite >= 7 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AAA {{ ratioWhite >= 7 ? '达标' : '未达' }}</span>
          </div>
        </div>
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div class="flex items-center justify-between"><span>对黑色 #000000</span><span class="font-mono font-semibold text-slate-800 dark:text-slate-200">{{ ratioBlack.toFixed(2) }} : 1</span></div>
          <div class="mt-1.5 flex gap-1.5">
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioBlack >= 4.5 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AA 正文 {{ ratioBlack >= 4.5 ? '达标' : '未达' }}</span>
            <span class="px-1.5 py-0.5 rounded font-semibold" :class="ratioBlack >= 7 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">AAA {{ ratioBlack >= 7 ? '达标' : '未达' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseColor, rgbToHex, rgbToHsl, contrastRatio, type Rgb } from '../../utils/color-utils'

const input = ref('#16a34a')
const copied = ref('')

const parsed = computed(() => parseColor(input.value))
const error = computed(() => (parsed.value.valid ? '' : parsed.value.error || '无法识别的颜色'))
const rgb = computed<Rgb | null>(() => (parsed.value.valid ? parsed.value.rgb ?? null : null))
const previewCss = computed(() => (rgb.value ? rgbToHex(rgb.value) : 'transparent'))

const formats = computed(() => {
  if (!rgb.value) return []
  const hsl = rgbToHsl(rgb.value)
  return [
    { label: 'HEX', value: rgbToHex(rgb.value) },
    { label: 'RGB', value: `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }
  ]
})

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }
const ratioWhite = computed(() => (rgb.value ? contrastRatio(rgb.value, WHITE) : 0))
const ratioBlack = computed(() => (rgb.value ? contrastRatio(rgb.value, BLACK) : 0))

function copyText(s: string) {
  navigator.clipboard.writeText(s).then(() => {
    copied.value = s
    setTimeout(() => (copied.value = ''), 1500)
  })
}
</script>
```

- [ ] **Step 2: 注册** — registry:`id: 'tool-color'`,`name: '颜色转换器'`,`desc: 'HEX/RGB/HSL 实时互转与 WCAG 黑白对比度达标检查'`,`icon: 'Palette'`,`category: 'design'`,`keywords: ['颜色转换', 'hex', 'rgb', 'hsl', '对比度', '色值', 'color']`。tool-pages:

```ts
  'tool-color': {
    h1: '颜色格式在线转换与对比度检查',
    intro:
      '输入任意一种格式(#hex、rgb()、hsl())即时得到三种格式实时互转结果与色彩预览,并自动计算该颜色对黑/白文本的 WCAG 对比度比值与 AA/AAA 达标状态。',
    extra: {
      title: '常见颜色格式速查',
      head: ['格式', '形式', '示例', '适用场景'],
      monoCols: [2],
      rows: [
        ['HEX', '#RRGGBB 十六进制', '#16a34a', 'CSS / 设计软件默认,最短书写'],
        ['RGB', '红绿蓝各 0-255', 'rgb(22, 163, 74)', '需要单独操纵通道(渐变、滤镜)'],
        ['HSL', '色相 0-360 + 饱和度/亮度 %', 'hsl(142, 76%, 36%)', '调明暗/饱和最直观,主题色派生']
      ]
    },
    faqs: [
      { q: 'HSL 的 H、S、L 分别控制什么?', a: 'H(Hue 色相)是色环角度:0 红、120 绿、240 蓝;S(Saturation 饱和度)越高颜色越纯,0% 即灰色;L(Lightness 亮度)0% 是黑、100% 是白、50% 是纯色。想要"同一颜色的浅色版",只改 L 就行——这是它比 RGB 直观的原因。' },
      { q: '正文文字的对比度要达到多少才合格?', a: 'WCAG 2.1 标准:正常字号正文至少 4.5:1(AA),大字号(≥18pt 或 14pt 粗体)至少 3:1,增强级 AAA 为 7:1。本工具自动计算你输入的颜色对白色与黑色文本的比值并标注达标状态。' },
      { q: '为什么设计系统常用 HSL 派生色板?', a: '保持 H 与 S 不变、按档位递变 L,即可得到一组视觉上同族、明暗有序的色阶(如 50-950),这正是 Tailwind 等设计系统的调色板生成方式。用 RGB 手工派生很难保持这种规律感。' }
    ]
  },
```

HTML:title `颜色格式在线转换 - HEX/RGB/HSL 互转与对比度检查 | DevHub`;description `在线颜色转换器:输入 HEX、RGB 或 HSL 即时互转三种格式并实时预览,自动计算对黑/白文本的 WCAG 对比度比值,标注 AA/AAA 达标状态。纯前端本地计算。`;keywords `颜色转换,hex转rgb,rgb转hsl,hsl转hex,颜色对比度,wcag对比度,色值转换,DevHub`;canonical `https://yunitytech.top/tools/color/`;预渲染正文含格式速查表 + FAQ + 互链;JSON-LD 三件套同构。

- [ ] **Step 3: 基建同步** — sitemap/index.html(position 8、li、noscript)/404/README(`| **颜色转换器** | HEX/RGB/HSL 实时互转、色彩预览、WCAG 黑白对比度与 AA/AAA 达标 | 前端配色、无障碍检查、设计色板派生 |`)
- [ ] **Step 4: 验证** — grep `/tools/color/` + 截图;同时截图首页确认 8 张工具卡 4×2 排布
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(color): full tool page with SEO pre-render and registrations; tool grid now 4-col for 8 tools"`

---

### Task 7: 现有 5 页 FAQ 深化

**Files:**
- Modify: `src/data/tool-pages.ts`(5 个条目各追加 FAQ)
- Modify: `tools/json/index.html`、`tools/timestamp/index.html`、`tools/jwt/index.html`、`tools/codec/index.html`、`tools/regex/index.html`(静态 FAQ 区同步追加;JSON-LD FAQPage 数组同步追加)

**Interfaces:** 无新接口;ToolPageContent.faqs 数组长度约束从 ≥3 保持(完整性测试天然放行更长数组)。

- [ ] **Step 1: 追加到 tool-pages.ts(全文如下,同时同步进 5 个静态 HTML 的 FAQ <section> 与 JSON-LD)**

JSON(+2):
- q: 超大 JSON 文件在这里会卡吗? a: DevHub 在浏览器主线程同步解析,常规接口报文与日志片段(几 MB 内)秒级完成。浏览器对单标签页有内存上限,超大的文件会得到明确报错而不是假死;若经常处理上百 MB 数据,建议改用本地命令行工具(如 jq)。
- q: JSON 和 JSONP 有什么区别? a: JSON 是纯数据格式;JSONP 是利用 <script> 标签可跨域加载的历史方案,把数据包在回调函数里返回以绕过同源策略。现代浏览器已有 CORS 标准方案,JSONP 已基本淘汰且存在 XSS 风险,新项目不应再使用。

时间戳(+2):
- q: 为什么数据库推荐存时间戳而不是日期字符串? a: 时间戳是定长整数,占空间小、可索引、比较排序快,且天然无时区歧义;字符串在不同地区、不同格式(MM/dd vs dd/MM)下解析极易出错。工程最佳实践是存储层统一存 UTC 时间戳,展示层再按用户时区格式化。
- q: 前端 new Date() 有哪些时区陷阱? a: new Date('2026-10-23') 按 UTC 零点解析,而 new Date('2026-10-23 12:00') 按本地时区解析——同一个日期字符串带不带时间,在东八区会差 8 小时。Safari 还严格要求 ISO 格式。稳妥做法:传时间戳或带时区偏移的完整 ISO 8601 字符串。

JWT(+2):
- q: access token 和 refresh token 应该怎么设计有效期? a: 常见实践:access token 短有效期(15 分钟~2 小时)随请求携带;refresh token 长有效期(7~30 天)只在刷新端点使用且可服务端吊销。这样即使 access token 泄露,攻击窗口也很短,兼顾了 JWT 无状态与服务端可控性。
- q: JWT 为什么很难做到立即注销? a: JWT 的签名校验不依赖服务端状态,token 在 exp 前天然有效。要支持立即注销必须引入状态:例如在 Redis 维护 jti 黑名单直至过期,或回退为服务端会话——这实际放弃了无状态优势。务实折中是短有效期 + refresh token 轮换吊销。

编解码(+2):
- q: 为什么 URL 里空格有时是 %20 有时是 +? a: %20 是 RFC 3986 的标准百分号编码;+ 是 application/x-www-form-urlencoded 表单提交的历史约定,只在查询串中代表空格。encodeURIComponent 只产出 %20,若后端按表单语义解析就需要把空格换成 +,这是接口联调最常见的坑之一。
- q: 哈希"加盐"是什么意思?还有必要吗? a: 加盐指哈希前拼接每用户唯一的随机串,使相同密码产出不同摘要,令预计算彩虹表失效。现代建议是直接用 bcrypt/scrypt/argon2 这类自带盐、计算速度可调慢的专用密码哈希算法,而不是裸算一次 MD5/SHA256。

正则(+2):
- q: 贪婪匹配和非贪婪匹配有什么区别? a: 量词(*、+、?、{n,m})默认贪婪,尽量多吃字符;后跟 ? 变为非贪婪,尽量少吃。例如对 "a"b"c",/".*"/ 一口吞到底,而 /".*?"/ 依次匹配出 "a" 与 "c"。提取成对符号之间的内容时几乎总应使用非贪婪。
- q: 正则的前瞻断言 (?=) 和 (?!) 是什么? a: (?=x) 表示"此处后面必须是 x"但不消耗字符;(?!x) 表示"此处后面不能是 x"。常用于"后面跟着单位的数字""不含某词的行"等场景。ES2018 起还支持后行断言 (?<=) 与 (?<!)。

(每条问答在静态 HTML 中渲染为既有页面的 `<div><h3>Q: …</h3><p>A: …</p></div>` 结构,并同步追加进该页 JSON-LD 的 FAQPage mainEntity 数组。)

- [ ] **Step 2: 验证** — `npm run test:run && npm run build`;`curl -s http://localhost:4173/tools/json/ | grep -c "JSONP"` 期望 ≥2(静态正文 + JSON-LD);Vue 版页面(截图)FAQ 数量 5。
- [ ] **Step 3: Commit** — `git add -A && git commit -m "content: deepen 5 tool pages with 2 extra FAQs each, kept in sync between data and static HTML"`

---

### Task 8: Tab/搜索联想 a11y 遗留

**Files:**
- Modify: `src/components/layout/AppHeader.vue`(tablist 补 aria-controls + roving tabindex + 方向键)
- Modify: `src/App.vue`(`<main>` 加 `id="main-view" role="tabpanel"`)
- Modify: `src/components/search/SearchBar.vue`(Esc 收起、↑↓ 循环)
- Test: `tests/search-bar.test.ts`(新)

**Interfaces:**
- Produces: `viewTabs` 按钮带 `:id="'view-tab-' + t.id"` 与 `:tabindex="store.activeTab === t.id ? 0 : -1"`;SearchBar 暴露行为由测试锁定。

- [ ] **Step 1: 写失败测试(happy-dom 挂载 SearchBar + pinia)**

```ts
// tests/search-bar.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import SearchBar from '../src/components/search/SearchBar.vue'

function mountBar() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(SearchBar)
  app.use(createPinia())
  app.mount(host)
  const input = host.querySelector('input') as HTMLInputElement
  return { host, input, unmount: () => app.unmount() }
}

beforeEach(() => { document.body.innerHTML = '' })

describe('SearchBar keyboard interaction', () => {
  it('shows suggestions for a query and supports ArrowDown focus + Escape collapse', async () => {
    const { input, host, unmount } = mountBar()
    input.value = 'json'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    const box = host.querySelector('#search-suggestions')
    expect(box).toBeTruthy()
    const first = box!.querySelector('a') as HTMLElement
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await nextTick()
    expect(document.activeElement).toBe(first)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(host.querySelector('#search-suggestions')).toBeNull()
    unmount()
  })
})
```

- [ ] **Step 2: 运行确认失败**(Escape 分支未实现时下拉仍在,断言失败;ArrowDown 已实现应过)
- [ ] **Step 3: 实现**

SearchBar input 增加 `@keydown.escape="isFocused = false"`;每个联想 `<a>` 增加 `@keydown.up.prevent="focusSibling($event, -1)" @keydown.down.prevent="focusSibling($event, 1)" @keydown.escape="backToInput"`:

```ts
function focusSibling(e: Event, dir: 1 | -1) {
  const items = Array.from(suggestionsRef.value?.querySelectorAll('a') ?? []) as HTMLElement[]
  const idx = items.indexOf(e.currentTarget as HTMLElement)
  const next = items[(idx + dir + items.length) % items.length]
  next?.focus()
}
function backToInput() {
  isFocused.value = false
  ;(document.activeElement as HTMLElement)?.blur?.()
}
```

AppHeader 每个tab 按钮:

```vue
:id="'view-tab-' + t.id"
:tabindex="store.activeTab === t.id ? 0 : -1"
aria-controls="main-view"
@keydown="onTabKeydown($event, t.id)"
```

```ts
function onTabKeydown(e: KeyboardEvent, currentId: ViewTabType) {
  if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return
  e.preventDefault()
  const idx = viewTabs.findIndex(t => t.id === currentId)
  const next = viewTabs[(idx + (e.key === 'ArrowRight' ? 1 : -1) + viewTabs.length) % viewTabs.length]
  store.setActiveTab(next.id)
  nextTick(() => {
    const list = (e.currentTarget as HTMLElement).closest('[role="tablist"]')
    list?.querySelector<HTMLElement>(`#view-tab-${next.id}`)?.focus()
  })
}
```

(`nextTick` 从 vue 导入。)App.vue `<main>` 加 `id="main-view" role="tabpanel" aria-label="主内容区"`。

- [ ] **Step 4: 运行确认通过 + 构建截图**(键盘 Tab 顺序不变)
- [ ] **Step 5: Commit** — `git add -A && git commit -m "fix(a11y): tablist arrow-key roving with aria-controls; combobox Escape collapse and up/down cycling"`

---

### Task 9: 小型遗留清理

**Files:**
- Modify: `src/main.ts`(清旧键)、`src/utils/tool-routes.ts`(/index.html 后缀)、`tests/tool-routes.test.ts`(+用例)
- Create: `tests/unit/store-navigation.test.ts`

- [ ] **Step 1: 写失败测试**

`tests/tool-routes.test.ts` 追加:

```ts
it('strips index.html suffix', () => {
  expect(toolIdFromPath('/tools/json/index.html')).toBe('tool-json')
  expect(toolIdFromPath('/tools/cron/index.html')).toBe('tool-cron')
})
```

`tests/unit/store-navigation.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia } from 'pinia'
import { useAppStore } from '../../src/stores/useAppStore'

describe('navigateToTool', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: vi.fn() },
      writable: true
    })
  })

  it('navigates to the tool path via location.assign', () => {
    const store = useAppStore(createPinia())
    store.navigateToTool('tool-json')
    expect(window.location.assign).toHaveBeenCalledWith('/tools/json/')
  })

  it('does nothing for unknown ids', () => {
    const store = useAppStore(createPinia())
    store.navigateToTool('tool-nope')
    expect(window.location.assign).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 运行确认失败**
- [ ] **Step 3: 实现**

`toolIdFromPath` 第一行改为:

```ts
const stripped = pathname.replace(/index\.html$/i, '').replace(/\/+$/, '')
const m = stripped.match(/^\/tools\/([a-z0-9-]+)$/)
```

`main.ts` 在挂载分支内(`else {`)最前面加:

```ts
try {
  localStorage.removeItem('devhub_active_tool_id')
} catch {
  /* 隐私模式下忽略 */
}
```

- [ ] **Step 4: 运行确认通过**(全量 `npm run test:run`)
- [ ] **Step 5: Commit** — `git add -A && git commit -m "fix: strip /index.html in tool paths, clean legacy localStorage key, test navigateToTool"`

---

### Task 10: 全量验收 + 合并部署

**Files:** 无新文件。

- [ ] **Step 1: 全量验证**

```bash
npm run test:run        # 期望全绿(≥ 45 tests)
npm run build           # dist 含 8 个 HTML 入口
python3 -m http.server 4173 --directory dist
```

逐项断言:

```bash
for t in json timestamp jwt codec regex cron uuid color; do
  curl -s -o /dev/null -w "$t:%{http_code} " http://localhost:4173/tools/$t/
done
# 期望全部 200
curl -s http://localhost:4173/sitemap.xml | grep -c "<loc>"   # 期望 8+1(首页)=9
grep -c "vueuse-color-scheme" dist/index.html dist/tools/*/index.html  # 期望全部含
```

截图:首页(浅/暗,8 卡 4×2)、/tools/cron/ /tools/uuid/ /tools/color/(浅色 1440)、390px 移动首页。

- [ ] **Step 2: 人工键盘走查**(Tab 流:搜索框 → 联想 → 工具卡 → Tab 行方向键切换视图;弹窗 Esc/焦点圈)

- [ ] **Step 3: 合并(推送前必须获得用户确认)**

向用户展示验收截图与结果清单,确认后:

```bash
git checkout main
git merge feat/frontend-design-fixes
npm run test:run && npm run build   # 合并结果再验一次
git push origin main                # ← 用户确认后执行,触发 Pages 部署
```

- [ ] **Step 4: 部署后线上验证**(Actions 完成后):

```bash
curl -s -o /dev/null -w "%{http_code}" https://yunitytech.top/tools/cron/
curl -s https://yunitytech.top/sitemap.xml | grep -c "tools/"
# 期望 200 与 8
```

- [ ] **Step 5: 收尾 Commit(如有修正)+ 汇报**

---

## Self-Review 记录

- **Spec 覆盖**:3 工具(T1-6)、FAQ 深化(T7)、遗留 6 项(T8 a11y 两项、T9 三项、T4 vite 缩进随重写还原)、sitemap/JSON-LD/404/README/网格(T4-6 内联)、合并部署(T10)。全覆盖。
- **占位符**:HTML 模板段落用"与现有页面同构 + 具体内容"表述,关键内容(title/desc/FAQ 全文/表格行)全部实写;无 TBD。
- **类型一致**:`parseCron/describeCron/nextRuns`、`generateUuidV4/V7/Uuids/formatUuid`、`parseColor/rgbToHex/rgbToHsl/hslToRgb/contrastRatio`、四表键名(`tool-cron/uuid/color`)在各任务间一致;icon 名 `CalendarClock/Fingerprint/Palette` 与两个 icon map 增补一致。
- **Review Focus 落位**:1/2→T1 用例;3→T2 用例;4→T3 用例;5→T4/5/6 grep + T10 全量。
- 已知风险:cron `nextRuns` 最坏迭代 60 万次(带秒/极稀疏表达式),单次 <50ms,可接受;happy-dom 对 `closest('[role=tablist]')` 支持良好,T8 若 mount 测试受阻则退回 DOM 断言并记 Ruling。
