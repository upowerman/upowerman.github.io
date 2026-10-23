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

function parseField(
  part: string,
  min: number,
  max: number,
  name: string
): { values?: number[]; error?: string; unsupported?: string } {
  const modifier = part.match(/[LW#?]/gi)
  if (modifier) {
    return { unsupported: `字段"${name}"中的 Quartz 修饰符(${modifier.join(', ')})暂不支持,请使用标准 5/6 字段语法` }
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
        // "5" 单值;"5/15" 表示从 5 到字段上限、步长 15
        hi = m[2] ? max : lo
      }
    }
    if (lo < min || hi > max || lo > hi) {
      return { error: `字段"${name}"取值超出范围 ${min}-${max}: ${piece}` }
    }
    for (let v = lo; v <= hi; v += step) {
      // 星期字段的 7 与 0 都表示周日,统一归一为 0
      out.add(v === 7 && max === 7 ? 0 : v)
    }
  }
  return { values: [...out].sort((a, b) => a - b) }
}

export function parseCron(expr: string): CronParseResult {
  const parts = expr.trim().split(/\s+/)
  if (!expr.trim() || parts.length < 5 || parts.length > 6) {
    return {
      valid: false,
      hasSeconds: false,
      error: `需要 5 个字段(分 时 日 月 周)或 6 个字段(秒 分 时 日 月 周),当前 ${parts.length} 个`
    }
  }
  const hasSeconds = parts.length === 6
  const fields = hasSeconds ? parts : ['0', ...parts]
  const keys: (keyof CronParseResult)[] = ['seconds', 'minutes', 'hours', 'daysOfMonth', 'months', 'daysOfWeek']
  const result: CronParseResult = { valid: true, hasSeconds }
  for (let i = 0; i < 6; i++) {
    const r = parseField(fields[i], FIELD_RANGES[i].min, FIELD_RANGES[i].max, FIELD_RANGES[i].name)
    if (r.unsupported) return { valid: false, hasSeconds, unsupported: r.unsupported }
    if (r.error) return { valid: false, hasSeconds, error: r.error }
    ;(result as unknown as Record<string, unknown>)[keys[i]] = r.values
  }
  return result
}

function rangeText(vals: number[], min: number, max: number): string {
  if (vals.length === max - min + 1) return '每'
  if (vals.length === 1) return String(vals[0])
  return vals.join('/')
}

const isFull = (vals: number[], min: number, max: number) => vals.length === max - min + 1
const hhmm = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
const WEEK = '日一二三四五六'

export function describeCron(expr: string): { valid: boolean; text?: string; error?: string; unsupported?: string } {
  const p = parseCron(expr)
  if (!p.valid) return p
  const [sec, min, hour, dom, mon, dow] = [p.seconds!, p.minutes!, p.hours!, p.daysOfMonth!, p.months!, p.daysOfWeek!]
  const dateFull = isFull(dom, 1, 31) && isFull(mon, 1, 12)
  const dowFull = dow.length === 7 // 0-7 去重后满集为 7 个值

  if (isFull(min, 0, 59) && isFull(hour, 0, 23) && dateFull && dowFull && (!p.hasSeconds || isFull(sec, 0, 59))) {
    return { valid: true, text: '每分钟执行一次' }
  }
  const step = min.length > 1 ? min[1] - min[0] : 0
  const arithmetic = step > 1 && min.every((v, i) => i === 0 || v - min[i - 1] === step)
  if (arithmetic && isFull(hour, 0, 23) && dateFull && dowFull) {
    return { valid: true, text: `每 ${step} 分钟执行一次` }
  }
  if (min.length === 1 && isFull(hour, 0, 23) && dateFull && dowFull) {
    return { valid: true, text: min[0] === 0 ? '每小时整点执行一次' : `每小时第 ${min[0]} 分钟执行` }
  }
  if (min.length === 1 && hour.length === 1 && dateFull && dowFull) {
    return { valid: true, text: `每天 ${hhmm(hour[0], min[0])} 执行` }
  }
  if (min.length === 1 && hour.length === 1 && isFull(dom, 1, 31) && isFull(mon, 1, 12)) {
    const time = hhmm(hour[0], min[0])
    if (dow.length === 5 && dow.join(',') === '1,2,3,4,5') {
      return { valid: true, text: `工作日(周一至周五)每天 ${time} 执行` }
    }
    if (dow.length === 1) return { valid: true, text: `每周${WEEK[dow[0]]} ${time} 执行` }
    return { valid: true, text: `每周${dow.map(d => WEEK[d]).join('、')} ${time} 执行` }
  }
  if (min.length === 1 && hour.length === 1 && dom.length === 1 && isFull(mon, 1, 12) && dowFull) {
    return { valid: true, text: `每月 ${dom[0]} 号 ${hhmm(hour[0], min[0])} 执行` }
  }
  const secText = p.hasSeconds ? `, 秒: ${rangeText(sec, 0, 59)}` : ''
  return {
    valid: true,
    text: `分钟: ${rangeText(min, 0, 59)}, 小时: ${rangeText(hour, 0, 23)}, 日: ${rangeText(dom, 1, 31)}, 月: ${rangeText(mon, 1, 12)}, 周: ${rangeText(dow, 0, 7)}${secText}`
  }
}

function matches(d: Date, p: CronParseResult): boolean {
  if (!p.seconds!.includes(d.getSeconds())) return false
  if (!p.minutes!.includes(d.getMinutes())) return false
  if (!p.hours!.includes(d.getHours())) return false
  if (!p.months!.includes(d.getMonth() + 1)) return false
  const domAll = p.daysOfMonth!.length === 31
  const dowAll = p.daysOfWeek!.length === 7
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
  // 从下一个最小粒度边界开始搜索(366 天为界)
  const unit = p.hasSeconds ? 1000 : 60000
  let t = new Date(Math.floor(from.getTime() / unit) * unit + unit)
  const limit = 366 * 24 * 60 * (p.hasSeconds ? 60 : 1)
  for (let i = 0; i < limit && out.length < count; i++) {
    if (matches(t, p)) out.push(new Date(t))
    t = new Date(t.getTime() + stepMs)
  }
  return out
}
