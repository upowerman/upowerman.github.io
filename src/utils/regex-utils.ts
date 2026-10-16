export const commonRegexTemplates: Record<string, { label: string; pattern: string; desc: string }> = {
  email: {
    label: '电子邮箱',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    desc: '匹配常见格式的 Email 地址'
  },
  phone: {
    label: '中国手机号',
    pattern: '1[3-9]\\d{9}',
    desc: '匹配 11 位中国大陆手机号码'
  },
  ipv4: {
    label: 'IPv4 地址',
    pattern: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
    desc: '匹配标准 IPv4 地址'
  },
  url: {
    label: 'HTTP/HTTPS 链接',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    desc: '匹配常见 Web 链接 URL'
  },
  chinese: {
    label: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    desc: '匹配汉字'
  },
  idCard: {
    label: '中国身份证号',
    pattern: '[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]',
    desc: '匹配 18 位中国二代身份证'
  }
}

export function testRegex(
  pattern: string,
  flags: string = 'g',
  text: string
): { matches: string[]; error?: string } {
  if (!pattern) {
    return { matches: [] }
  }

  // 防御 ReDoS：限制测试文本长度在 50,000 字符内
  const safeText = text.length > 50000 ? text.slice(0, 50000) : text

  try {
    const reg = new RegExp(pattern, flags)
    if (!flags.includes('g')) {
      const match = reg.exec(safeText)
      return { matches: match ? [match[0]] : [] }
    }

    const matches: string[] = []
    let match: RegExpExecArray | null
    let count = 0
    while ((match = reg.exec(safeText)) !== null) {
      matches.push(match[0])
      count++
      if (count > 2000) break // 防止死循环
      if (match.index === reg.lastIndex) {
        reg.lastIndex++
      }
    }
    return { matches }
  } catch (err: any) {
    return {
      matches: [],
      error: `正则语法错误: ${err?.message || '未知错误'}`
    }
  }
}
