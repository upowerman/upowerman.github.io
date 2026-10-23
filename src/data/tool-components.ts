import type { Component } from 'vue'
import JsonTool from '../tools/json/JsonTool.vue'
import TimestampTool from '../tools/timestamp/TimestampTool.vue'
import JwtTool from '../tools/jwt/JwtTool.vue'
import CodecTool from '../tools/codec/CodecTool.vue'
import RegexTool from '../tools/regex/RegexTool.vue'
import CronTool from '../tools/cron/CronTool.vue'
import UuidTool from '../tools/uuid/UuidTool.vue'
import ColorTool from '../tools/color/ColorTool.vue'
import AesTool from '../tools/aes/AesTool.vue'
import CaseTool from '../tools/case/CaseTool.vue'

export const toolComponents: Record<string, Component> = {
  'tool-json': JsonTool,
  'tool-timestamp': TimestampTool,
  'tool-jwt': JwtTool,
  'tool-codec': CodecTool,
  'tool-regex': RegexTool,
  'tool-cron': CronTool,
  'tool-uuid': UuidTool,
  'tool-color': ColorTool,
  'tool-aes': AesTool,
  'tool-case': CaseTool
}
