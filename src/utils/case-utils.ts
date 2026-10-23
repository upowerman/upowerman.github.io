export type NamingCaseType =
  | 'camelCase'
  | 'pascalCase'
  | 'snakeCase'
  | 'kebabCase'
  | 'constantCase'
  | 'titleCase'
  | 'dotCase'
  | 'pathCase'

export function splitWords(str: string): string[] {
  if (!str) return []
  // 将下划线、短横线、点、斜杠替换为空格
  let s = str.trim().replace(/[-_./\\]+/g, ' ')
  // 在连续大写后跟首字母大写前插入空格 (如 XMLHttp -> XML Http)
  s = s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  // 在小写/数字后跟大写前插入空格 (如 helloWorld -> hello World, api2Response -> api2 Response)
  s = s.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  return s.split(/\s+/).filter(Boolean)
}

function capitalize(w: string): string {
  if (!w) return ''
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
}

export function toCamelCase(str: string): string {
  const words = splitWords(str)
  if (words.length === 0) return ''
  return words
    .map((w, idx) => (idx === 0 ? w.toLowerCase() : capitalize(w)))
    .join('')
}

export function toPascalCase(str: string): string {
  return splitWords(str).map(capitalize).join('')
}

export function toSnakeCase(str: string): string {
  return splitWords(str).map(w => w.toLowerCase()).join('_')
}

export function toKebabCase(str: string): string {
  return splitWords(str).map(w => w.toLowerCase()).join('-')
}

export function toConstantCase(str: string): string {
  return splitWords(str).map(w => w.toUpperCase()).join('_')
}

export function toTitleCase(str: string): string {
  return splitWords(str).map(capitalize).join(' ')
}

export function toDotCase(str: string): string {
  return splitWords(str).map(w => w.toLowerCase()).join('.')
}

export function toPathCase(str: string): string {
  return splitWords(str).map(w => w.toLowerCase()).join('/')
}

export function convertAllCases(input: string): Record<NamingCaseType, string> {
  return {
    camelCase: toCamelCase(input),
    pascalCase: toPascalCase(input),
    snakeCase: toSnakeCase(input),
    kebabCase: toKebabCase(input),
    constantCase: toConstantCase(input),
    titleCase: toTitleCase(input),
    dotCase: toDotCase(input),
    pathCase: toPathCase(input)
  }
}

export function convertBatchText(text: string, targetCase: NamingCaseType): string {
  if (!text) return ''
  const converterMap: Record<NamingCaseType, (s: string) => string> = {
    camelCase: toCamelCase,
    pascalCase: toPascalCase,
    snakeCase: toSnakeCase,
    kebabCase: toKebabCase,
    constantCase: toConstantCase,
    titleCase: toTitleCase,
    dotCase: toDotCase,
    pathCase: toPathCase
  }
  const converter = converterMap[targetCase] || toCamelCase
  return text
    .split('\n')
    .map(line => {
      if (!line.trim()) return line
      return converter(line)
    })
    .join('\n')
}
