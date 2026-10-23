import { describe, it, expect } from 'vitest'
import {
  splitWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toTitleCase,
  toDotCase,
  toPathCase,
  convertAllCases,
  convertBatchText
} from '../../src/utils/case-utils'

describe('case-utils', () => {
  it('splits words accurately across various naming conventions', () => {
    expect(splitWords('helloWorld')).toEqual(['hello', 'World'])
    expect(splitWords('HelloWorld')).toEqual(['Hello', 'World'])
    expect(splitWords('hello_world_test')).toEqual(['hello', 'world', 'test'])
    expect(splitWords('hello-world-test')).toEqual(['hello', 'world', 'test'])
    expect(splitWords('getUserID')).toEqual(['get', 'User', 'ID'])
    expect(splitWords('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request'])
    expect(splitWords('API2ResponseV3')).toEqual(['API2', 'Response', 'V3'])
  })

  it('converts to all standard naming conventions', () => {
    const input = 'user_order_item'
    expect(toCamelCase(input)).toBe('userOrderItem')
    expect(toPascalCase(input)).toBe('UserOrderItem')
    expect(toSnakeCase(input)).toBe('user_order_item')
    expect(toKebabCase(input)).toBe('user-order-item')
    expect(toConstantCase(input)).toBe('USER_ORDER_ITEM')
    expect(toTitleCase(input)).toBe('User Order Item')
    expect(toDotCase(input)).toBe('user.order.item')
    expect(toPathCase(input)).toBe('user/order/item')
  })

  it('convertAllCases returns a map of all converted formats', () => {
    const res = convertAllCases('my-api-token')
    expect(res.camelCase).toBe('myApiToken')
    expect(res.pascalCase).toBe('MyApiToken')
    expect(res.constantCase).toBe('MY_API_TOKEN')
  })

  it('convertBatchText processes multi-line text line-by-line', () => {
    const multi = 'first_name\nlast_name\nuser_id'
    const out = convertBatchText(multi, 'camelCase')
    expect(out).toBe('firstName\nlastName\nuserId')
  })
})
