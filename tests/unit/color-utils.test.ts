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
