import { describe, it, expect } from 'vitest'
import { formatJson, compressJson } from '../../src/utils/json-utils'

describe('json-utils', () => {
  it('formats valid json correctly', () => {
    const raw = '{"a":1,"b":"hello"}'
    const formatted = formatJson(raw, 2)
    expect(formatted.success).toBe(true)
    expect(formatted.result).toBe('{\n  "a": 1,\n  "b": "hello"\n}')
  })

  it('handles invalid json with error message', () => {
    const raw = '{a: 1}'
    const formatted = formatJson(raw)
    expect(formatted.success).toBe(false)
    expect(formatted.error).toBeDefined()
  })

  it('compresses json into a single line', () => {
    const raw = '{\n  "name": "DevHub",\n  "tools": [1, 2, 3]\n}'
    const compressed = compressJson(raw)
    expect(compressed.success).toBe(true)
    expect(compressed.result).toBe('{"name":"DevHub","tools":[1,2,3]}')
  })
})
