import { toPascalCase } from './case-utils'

export type TargetTypeLanguage = 'typescript' | 'go' | 'python'

function safeParseJson(jsonStr: string): any {
  if (!jsonStr || !jsonStr.trim()) {
    throw new Error('请输入有效的 JSON 文本')
  }
  return JSON.parse(jsonStr)
}

// ================= TypeScript 转换 =================

export function jsonToTypeScript(
  jsonStr: string,
  rootName = 'Root'
): { success: boolean; code: string; error?: string } {
  try {
    const data = safeParseJson(jsonStr)
    const interfaces: Array<{ name: string; fields: string[] }> = []

    function parseObject(obj: any, typeName: string): string {
      if (obj === null) return 'any'
      if (Array.isArray(obj)) {
        if (obj.length === 0) return 'any[]'
        const elemType = parseObject(obj[0], typeName + 'Item')
        return `${elemType}[]`
      }
      if (typeof obj !== 'object') {
        return typeof obj
      }

      const fields: string[] = []
      for (const [key, val] of Object.entries(obj)) {
        let fieldType: string
        if (val === null) {
          fieldType = 'any'
        } else if (Array.isArray(val)) {
          if (val.length === 0) {
            fieldType = 'any[]'
          } else if (typeof val[0] === 'object' && val[0] !== null) {
            const nestedName = toPascalCase(key) + 'Item'
            parseObject(val[0], nestedName)
            fieldType = `${nestedName}[]`
          } else {
            fieldType = `${typeof val[0]}[]`
          }
        } else if (typeof val === 'object') {
          const nestedName = toPascalCase(key)
          parseObject(val, nestedName)
          fieldType = nestedName
        } else {
          fieldType = typeof val
        }
        fields.push(`  ${key}: ${fieldType};`)
      }

      interfaces.push({ name: typeName, fields })
      return typeName
    }

    parseObject(data, rootName)

    // 反转顺序，让 Root 在最前，子接口紧随其后
    const code = interfaces
      .reverse()
      .map(item => `export interface ${item.name} {\n${item.fields.join('\n')}\n}`)
      .join('\n\n')

    return { success: true, code }
  } catch (err: any) {
    return { success: false, code: '', error: err?.message || 'JSON 解析失败' }
  }
}

// ================= Go 转换 =================

export function jsonToGo(
  jsonStr: string,
  rootName = 'Root'
): { success: boolean; code: string; error?: string } {
  try {
    const data = safeParseJson(jsonStr)
    const structs: Array<{ name: string; fields: string[] }> = []

    function parseGoType(val: any, fieldKey: string): string {
      if (val === null) return 'any'
      if (typeof val === 'boolean') return 'bool'
      if (typeof val === 'number') {
        return Number.isInteger(val) ? 'int64' : 'float64'
      }
      if (typeof val === 'string') return 'string'
      if (Array.isArray(val)) {
        if (val.length === 0) return '[]any'
        const elemType = parseGoType(val[0], fieldKey + 'Item')
        return `[]${elemType}`
      }
      if (typeof val === 'object') {
        const nestedName = toPascalCase(fieldKey)
        buildStruct(val, nestedName)
        return nestedName
      }
      return 'any'
    }

    function buildStruct(obj: any, structName: string) {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return

      const fields: string[] = []
      for (const [key, val] of Object.entries(obj)) {
        const fieldName = toPascalCase(key)
        const goType = parseGoType(val, key)
        fields.push(`  ${fieldName} ${goType} \`json:"${key}"\``)
      }

      structs.push({ name: structName, fields })
    }

    buildStruct(data, rootName)

    const code = structs
      .reverse()
      .map(s => `type ${s.name} struct {\n${s.fields.join('\n')}\n}`)
      .join('\n\n')

    return { success: true, code }
  } catch (err: any) {
    return { success: false, code: '', error: err?.message || 'JSON 解析失败' }
  }
}

// ================= Python (Pydantic) 转换 =================

export function jsonToPython(
  jsonStr: string,
  rootName = 'Root'
): { success: boolean; code: string; error?: string } {
  try {
    const data = safeParseJson(jsonStr)
    const classes: Array<{ name: string; fields: string[] }> = []

    function parsePyType(val: any, fieldKey: string): string {
      if (val === null) return 'Optional[Any]'
      if (typeof val === 'boolean') return 'bool'
      if (typeof val === 'number') {
        return Number.isInteger(val) ? 'int' : 'float'
      }
      if (typeof val === 'string') return 'str'
      if (Array.isArray(val)) {
        if (val.length === 0) return 'List[Any]'
        const elem = parsePyType(val[0], fieldKey + 'Item')
        return `List[${elem}]`
      }
      if (typeof val === 'object') {
        const nestedName = toPascalCase(fieldKey)
        buildClass(val, nestedName)
        return nestedName
      }
      return 'Any'
    }

    function buildClass(obj: any, className: string) {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return

      const fields: string[] = []
      for (const [key, val] of Object.entries(obj)) {
        const pyType = parsePyType(val, key)
        fields.push(`    ${key}: ${pyType}`)
      }

      classes.push({ name: className, fields })
    }

    buildClass(data, rootName)

    const header = 'from typing import List, Optional, Any\nfrom pydantic import BaseModel\n\n'
    const code =
      header +
      classes
        .reverse()
        .map(c => `class ${c.name}(BaseModel):\n${c.fields.join('\n')}`)
        .join('\n\n')

    return { success: true, code }
  } catch (err: any) {
    return { success: false, code: '', error: err?.message || 'JSON 解析失败' }
  }
}
