import type { ToolItem } from '../types'

export const defaultToolsRegistry: ToolItem[] = [
  {
    id: 'tool-json',
    name: 'JSON 实验室',
    desc: '格式化、校验、单行压缩与错误精准定位',
    icon: 'FileJson',
    category: 'format',
    keywords: ['json', 'format', 'minify', 'parse', 'validate', '格式化']
  },
  {
    id: 'tool-timestamp',
    name: '时间戳转换器',
    desc: 'Unix 秒/毫秒时间戳与北京时间、UTC 双向互转',
    icon: 'Clock',
    category: 'time',
    keywords: ['timestamp', 'time', 'date', 'unix', '时间戳', '日期']
  },
  {
    id: 'tool-jwt',
    name: 'JWT 解码器',
    desc: 'Token Header/Payload 解析、Claims 展示与过期提醒',
    icon: 'KeyRound',
    category: 'crypto',
    keywords: ['jwt', 'token', 'decode', 'bearer', 'auth', '鉴权']
  },
  {
    id: 'tool-codec',
    name: '编解码与哈希',
    desc: 'Base64 字符串/图片转换、URL 编码、MD5/SHA256 计算',
    icon: 'Binary',
    category: 'codec',
    keywords: ['base64', 'url', 'encode', 'decode', 'md5', 'sha256', 'hash', '哈希']
  },
  {
    id: 'tool-regex',
    name: '正则测试与速查',
    desc: '实时正则匹配高亮展示，包含常用正则模板一键载入',
    icon: 'Regex',
    category: 'regex',
    keywords: ['regex', 'regexp', 'match', '正则', '表达式', '测试']
  }
]
