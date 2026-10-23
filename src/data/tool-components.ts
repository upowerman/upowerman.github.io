import type { Component } from 'vue'
import JsonTool from '../tools/json/JsonTool.vue'
import TimestampTool from '../tools/timestamp/TimestampTool.vue'
import JwtTool from '../tools/jwt/JwtTool.vue'
import CodecTool from '../tools/codec/CodecTool.vue'
import RegexTool from '../tools/regex/RegexTool.vue'

export const toolComponents: Record<string, Component> = {
  'tool-json': JsonTool,
  'tool-timestamp': TimestampTool,
  'tool-jwt': JwtTool,
  'tool-codec': CodecTool,
  'tool-regex': RegexTool
}
