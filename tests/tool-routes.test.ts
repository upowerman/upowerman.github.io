import { describe, it, expect } from 'vitest'
import { toolPath, toolIdFromPath, legacyToolRedirect, TOOL_ROUTES } from '../src/utils/tool-routes'
import { defaultToolsRegistry } from '../src/data/tools-registry'

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
  it('covers every registered tool', () => {
    expect(Object.keys(TOOL_ROUTES).length).toBe(defaultToolsRegistry.length)
    for (const t of defaultToolsRegistry) {
      expect(TOOL_ROUTES[t.id], t.id).toBeTruthy()
    }
  })
})
