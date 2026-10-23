import { describe, it, expect } from 'vitest'
import {
  jsonToTypeScript,
  jsonToGo,
  jsonToPython
} from '../../src/utils/json-to-type-utils'

describe('json-to-type-utils', () => {
  const sampleJson = JSON.stringify({
    user_id: 1001,
    username: 'alex',
    is_vip: true,
    score: 98.5,
    tags: ['admin', 'editor'],
    profile: {
      bio: 'Developer',
      avatar_url: 'https://example.com/avatar.png'
    }
  })

  describe('jsonToTypeScript', () => {
    it('generates valid TypeScript interfaces with nested types', () => {
      const res = jsonToTypeScript(sampleJson, 'UserProfile')
      expect(res.success).toBe(true)
      expect(res.code).toContain('export interface UserProfile {')
      expect(res.code).toContain('user_id: number;')
      expect(res.code).toContain('username: string;')
      expect(res.code).toContain('is_vip: boolean;')
      expect(res.code).toContain('tags: string[];')
      expect(res.code).toContain('profile: Profile;')
      expect(res.code).toContain('export interface Profile {')
      expect(res.code).toContain('bio: string;')
    })

    it('returns error when JSON is invalid', () => {
      const res = jsonToTypeScript('{ bad json', 'Bad')
      expect(res.success).toBe(false)
      expect(res.error).toBeTruthy()
    })
  })

  describe('jsonToGo', () => {
    it('generates Go struct with json tags', () => {
      const res = jsonToGo(sampleJson, 'User')
      expect(res.success).toBe(true)
      expect(res.code).toContain('type User struct {')
      expect(res.code).toContain('UserId int64 `json:"user_id"`')
      expect(res.code).toContain('Username string `json:"username"`')
      expect(res.code).toContain('IsVip bool `json:"is_vip"`')
      expect(res.code).toContain('Score float64 `json:"score"`')
      expect(res.code).toContain('Tags []string `json:"tags"`')
      expect(res.code).toContain('Profile Profile `json:"profile"`')
      expect(res.code).toContain('type Profile struct {')
    })
  })

  describe('jsonToPython', () => {
    it('generates Pydantic BaseModel classes', () => {
      const res = jsonToPython(sampleJson, 'User')
      expect(res.success).toBe(true)
      expect(res.code).toContain('from pydantic import BaseModel')
      expect(res.code).toContain('class User(BaseModel):')
      expect(res.code).toContain('user_id: int')
      expect(res.code).toContain('username: str')
      expect(res.code).toContain('is_vip: bool')
      expect(res.code).toContain('tags: List[str]')
      expect(res.code).toContain('profile: Profile')
    })
  })
})
