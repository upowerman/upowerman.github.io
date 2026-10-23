import { format, type SqlLanguage, type KeywordCase } from 'sql-formatter'

export type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'transactsql' | 'plsql'
export type SqlKeywordCase = 'upper' | 'lower' | 'preserve'

export interface FormatSqlOptions {
  dialect?: SqlDialect
  indent?: 2 | 4
  keywordCase?: SqlKeywordCase
}

const DIALECT_MAP: Record<SqlDialect, SqlLanguage> = {
  sql: 'sql',
  mysql: 'mysql',
  postgresql: 'postgresql',
  sqlite: 'sqlite',
  transactsql: 'transactsql',
  plsql: 'plsql'
}

export function formatSql(sql: string, options: FormatSqlOptions = {}): string {
  if (!sql || !sql.trim()) return ''

  const dialect = options.dialect || 'mysql'
  const tabWidth = options.indent || 2
  const keywordCase = (options.keywordCase || 'upper') as KeywordCase

  try {
    return format(sql, {
      language: DIALECT_MAP[dialect] || 'sql',
      tabWidth,
      keywordCase,
      linesBetweenQueries: 2
    })
  } catch (err) {
    // 遇到不规范方言或片段时优雅降级
    return sql.trim()
  }
}

export function minifySql(sql: string): string {
  if (!sql || !sql.trim()) return ''

  // 1. 移除多行注释 /* ... */
  let s = sql.replace(/\/\*[\s\S]*?\*\//g, ' ')

  // 2. 逐行移除单行注释 -- ...
  s = s
    .split('\n')
    .map(line => {
      const commentIndex = line.indexOf('--')
      if (commentIndex === -1) return line
      return line.slice(0, commentIndex)
    })
    .join(' ')

  // 3. 将连续的空白符、换行符折叠为单个空格
  s = s.replace(/\s+/g, ' ').trim()

  return s
}
