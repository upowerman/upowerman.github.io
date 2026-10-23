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
  },
  {
    id: 'tool-cron',
    name: 'Cron 表达式工具',
    desc: '标准 5/6 位 Cron 解析、中文描述与下次执行时间计算',
    icon: 'CalendarClock',
    category: 'schedule',
    keywords: ['cron', 'crontab', '定时任务', 'quartz', '调度', '表达式', '下一次执行']
  },
  {
    id: 'tool-uuid',
    name: 'UUID 生成器',
    desc: '批量生成 v4 随机与 v7 时间戳有序 UUID,支持大小写与连字符开关',
    icon: 'Fingerprint',
    category: 'id',
    keywords: ['uuid', 'guid', 'v4', 'v7', '生成器', '唯一 id', '批量']
  },
  {
    id: 'tool-color',
    name: '颜色转换器',
    desc: 'HEX/RGB/HSL 实时互转与 WCAG 黑白对比度达标检查',
    icon: 'Palette',
    category: 'design',
    keywords: ['颜色转换', 'hex', 'rgb', 'hsl', '对比度', '色值', 'color']
  },
  {
    id: 'tool-aes',
    name: 'AES 加解密实验室',
    desc: 'CBC/ECB/CTR 全模式、PKCS7 填充、Base64/Hex 编解码及 Java/Python/Go 多语言联调代码生成',
    icon: 'ShieldCheck',
    category: 'crypto',
    keywords: ['aes', 'encrypt', 'decrypt', 'cbc', 'ecb', 'pkcs7', '加密', '解密', '对称加密']
  },
  {
    id: 'tool-case',
    name: '变量命名风格转换',
    desc: '小驼峰/大驼峰/下划线/短横线/常量等 8 种代码命名风格实时互转与多行批量处理',
    icon: 'CaseUpper',
    category: 'format',
    keywords: ['case', 'camelCase', 'pascalCase', 'snake_case', 'kebab-case', '命名转换', '驼峰', '下划线']
  },
  {
    id: 'tool-sql',
    name: 'SQL 格式化与美化',
    desc: 'MySQL/PostgreSQL/SQLite/Oracle 等多方言格式化排版、关键字大小写转换与单行压缩',
    icon: 'Database',
    category: 'format',
    keywords: ['sql', 'format', 'minify', 'mysql', 'postgresql', 'sqlite', '格式化', '美化']
  },
  {
    id: 'tool-curl',
    name: 'cURL 转多语言代码',
    desc: '浏览器/Postman cURL 命令一键转换原生 Fetch、Axios、Python requests、Go 及 Java 代码',
    icon: 'Terminal',
    category: 'code',
    keywords: ['curl', 'fetch', 'axios', 'python', 'requests', 'golang', 'java', '代码生成', 'http']
  }
]
