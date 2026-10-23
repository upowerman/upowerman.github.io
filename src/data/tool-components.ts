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
import SqlTool from '../tools/sql/SqlTool.vue'
import CurlTool from '../tools/curl/CurlTool.vue'
import DiffTool from '../tools/diff/DiffTool.vue'
import JsonToTypeTool from '../tools/json-to-type/JsonToTypeTool.vue'

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
  'tool-case': CaseTool,
  'tool-sql': SqlTool,
  'tool-curl': CurlTool,
  'tool-diff': DiffTool,
  'tool-json-to-type': JsonToTypeTool
}
