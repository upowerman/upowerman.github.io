import { describe, it, expect } from 'vitest'
import { formatSql, minifySql } from '../../src/utils/sql-utils'

describe('sql-utils', () => {
  describe('formatSql', () => {
    it('formats basic SELECT query with keyword uppercase and 2-space indentation', () => {
      const input = 'select id, name, email from users where id = 1 and status in (1, 2) order by created_at desc'
      const output = formatSql(input, {
        dialect: 'mysql',
        indent: 2,
        keywordCase: 'upper'
      })
      expect(output).toContain('SELECT')
      expect(output).toContain('FROM\n  users')
      expect(output).toContain('WHERE\n  id = 1')
      expect(output).toContain('ORDER BY')
    })

    it('supports 4 spaces indent and lowercase keywords', () => {
      const input = 'SELECT ID, NAME FROM USERS WHERE ID = 1'
      const output = formatSql(input, {
        dialect: 'sql',
        indent: 4,
        keywordCase: 'lower'
      })
      expect(output).toContain('select')
      expect(output).toContain('from\n    USERS')
    })

    it('formats complex JOIN queries with aliases', () => {
      const input = 'select o.id, u.name, p.title from orders o left join users u on o.user_id = u.id inner join products p on o.prod_id = p.id where o.amount > 100'
      const output = formatSql(input, {
        dialect: 'postgresql',
        indent: 2,
        keywordCase: 'upper'
      })
      expect(output).toContain('LEFT JOIN')
      expect(output).toContain('INNER JOIN')
      expect(output).toContain('ON')
    })

    it('handles empty string gracefully', () => {
      expect(formatSql('', { dialect: 'mysql' })).toBe('')
      expect(formatSql('   ', { dialect: 'mysql' })).toBe('')
    })

    it('returns error-tolerant output on syntax anomalies', () => {
      const weirdSql = 'SELECT * FROM ;;;'
      const res = formatSql(weirdSql, { dialect: 'mysql' })
      expect(res).toBeTruthy()
    })
  })

  describe('minifySql', () => {
    it('compresses multiline SQL into a single line', () => {
      const input = `
        SELECT
          id,
          name,
          email
        FROM users
        WHERE id = 10
      `
      const min = minifySql(input)
      expect(min).toBe('SELECT id, name, email FROM users WHERE id = 10')
    })

    it('strips single-line comments (-- ...) and block comments (/* ... */)', () => {
      const input = `
        -- Query to fetch active users
        SELECT id, name /* internal id and name */
        FROM users -- users table
        WHERE status = 1;
      `
      const min = minifySql(input)
      expect(min).not.toContain('Query to fetch')
      expect(min).not.toContain('internal id')
      expect(min).toBe('SELECT id, name FROM users WHERE status = 1;')
    })

    it('handles empty or whitespace-only strings', () => {
      expect(minifySql('')).toBe('')
      expect(minifySql('   \n  \t  ')).toBe('')
    })
  })
})
