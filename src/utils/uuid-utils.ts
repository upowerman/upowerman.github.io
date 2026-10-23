function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n)
  crypto.getRandomValues(b)
  return b
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map(v => v.toString(16).padStart(2, '0')).join('')
}

function toUuidForm(s: string): string {
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
}

export function generateUuidV4(): string {
  const b = randomBytes(16)
  b[6] = (b[6] & 0x0f) | 0x40 // version 4
  b[8] = (b[8] & 0x3f) | 0x80 // variant 10xx
  return toUuidForm(hex(b))
}

export function generateUuidV7(timestampMs: number = Date.now()): string {
  // RFC 9562: 48bit 毫秒时间戳 + 版本 7 + 12bit rand_a + 变体 10xx + 62bit rand_b
  const ts = BigInt(Math.floor(timestampMs)) & 0xffffffffffffn
  const randHex = hex(randomBytes(11)) // 22 个 hex 字符随机
  const s = ts.toString(16).padStart(12, '0') + '7' + randHex.slice(0, 3) + '8' + randHex.slice(3, 18)
  return toUuidForm(s)
}

export function generateUuids(version: 'v4' | 'v7', count: number, timestampMs: number = Date.now()): string[] {
  const n = Math.max(1, Math.min(100, Math.floor(count)))
  return Array.from({ length: n }, () => (version === 'v4' ? generateUuidV4() : generateUuidV7(timestampMs)))
}

export function formatUuid(u: string, opts: { uppercase?: boolean; hyphens?: boolean }): string {
  const out = opts.hyphens === false ? u.replace(/-/g, '') : u
  return opts.uppercase ? out.toUpperCase() : out
}
