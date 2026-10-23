export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export function parseColor(input: string): { valid: boolean; rgb?: Rgb; error?: string } {
  const s = input.trim().toLowerCase()
  if (!s) return { valid: false, error: '请输入颜色值' }

  let m = s.match(/^#([0-9a-f]{3})$/)
  if (m) {
    const [r, g, b] = m[1].split('').map(ch => parseInt(ch + ch, 16))
    return { valid: true, rgb: { r, g, b } }
  }

  m = s.match(/^#([0-9a-f]{6})$/)
  if (m) {
    const n = parseInt(m[1], 16)
    return { valid: true, rgb: { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 } }
  }

  m = s.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (m) {
    const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
    if (![r, g, b].every(v => Number.isInteger(v) && v >= 0 && v <= 255)) {
      return { valid: false, error: 'RGB 分量需为 0-255 的整数' }
    }
    return { valid: true, rgb: { r, g, b } }
  }

  m = s.match(/^hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?)%\s*,\s*(\d{1,3}(?:\.\d+)?)%/)
  if (m) {
    const h = Number(m[1])
    const sat = Number(m[2])
    const l = Number(m[3])
    if (h < 0 || h > 360 || sat < 0 || sat > 100 || l < 0 || l > 100) {
      return { valid: false, error: 'HSL 需满足 h∈[0,360], s/l∈[0,100]%' }
    }
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
  const hp = (((h % 360) + 360) % 360) / 60
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
