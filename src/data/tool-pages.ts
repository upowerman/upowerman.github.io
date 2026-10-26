export interface ToolFaq {
  q: string
  a: string
}

export interface ToolExtraSection {
  title: string
  head: string[]
  /** 渲染为 font-mono 的列下标 */
  monoCols?: number[]
  rows: string[][]
}

export interface ToolPageContent {
  h1: string
  intro: string
  extra?: ToolExtraSection
  extraSections?: ToolExtraSection[]
  faqs: ToolFaq[]
}

export const toolPageContent: Record<string, ToolPageContent> = {
  'tool-json': {
    h1: 'JSON 格式化与在线校验工具',
    intro:
      '免费高效的纯前端离线 JSON 实验室:支持 2 空格/4 空格美化排版、单行去除空格压缩、语法错误精确定位与一键快速复制。数据 100% 在本地浏览器计算,绝不上报远程服务器。',
    faqs: [
      {
        q: '为什么推荐使用纯前端离线 JSON 格式化工具?',
        a: '传统在线工具通常将用户的 JSON 请求内容发送至服务端解析,存在接口密钥、Token 与业务私有数据泄露的严重风险。DevHub 采用纯前端 JavaScript 本地解析与格式化,数据全程仅在当前浏览器内存中流转,杜绝外泄可能。'
      },
      {
        q: 'JSON 格式化与单行压缩有什么应用场景区别?',
        a: '格式化排版(2空格或4空格)能够让多层嵌套的复杂 JSON 结构层次分明,极大提升后端接口联调与日志排查效率;而单行压缩(Minify)去除冗余空白符与换行,可显著减少数据传输体积,适合生产环境 API 调用或配置文件储存。'
      },
      {
        q: 'JSON 解析失败时如何准确定位语法错误?',
        a: '常见错误包括:尾部遗留多余逗号 (trailing comma)、使用了非标准的单引号包裹键值、未正确闭合花括号等。DevHub 内置错误捕获器,会在顶部红框精准提示解析失败原因,助你秒级排查修正。'
      },
      {
        q: '超大 JSON 文件在这里会卡吗?',
        a: 'DevHub 在浏览器主线程同步解析,常规接口报文与日志片段(几 MB 内)秒级完成。浏览器对单标签页有内存上限,超大的文件会得到明确报错而不是假死;若经常处理上百 MB 数据,建议改用本地命令行工具(如 jq)。'
      },
      {
        q: 'JSON 和 JSONP 有什么区别?',
        a: 'JSON 是纯数据格式;JSONP 是利用 <script> 标签可跨域加载的历史方案,把数据包在回调函数里返回以绕过同源策略。现代浏览器已有 CORS 标准方案,JSONP 已基本淘汰且存在 XSS 风险,新项目不应再使用。'
      }
    ]
  },
  'tool-timestamp': {
    h1: '时间戳转换 - 在线Unix时间戳与北京时间双向转换工具',
    intro:
      '专为后端工程师、数据库管理员及分布式系统排障打造的高效转换工具。支持 10 位秒级 / 13 位毫秒级时间戳与北京时间(GMT+8)、UTC、ISO 8601 标准日期双向互转，自带实时秒级看板、多语言获取时间戳速查及常用时间秒数换算对照。',
    extra: {
      title: '主流语言获取当前时间戳代码速查',
      head: ['编程语言 / 数据库', '秒级时间戳 (10位)', '毫秒级时间戳 (13位)'],
      monoCols: [1, 2],
      rows: [
        ['JavaScript', 'Math.floor(Date.now() / 1000)', 'Date.now()'],
        ['Python', 'int(time.time())', 'int(time.time() * 1000)'],
        ['Java', 'Instant.now().getEpochSecond()', 'System.currentTimeMillis()'],
        ['Go', 'time.Now().Unix()', 'time.Now().UnixMilli()'],
        ['PHP', 'time()', 'round(microtime(true) * 1000)'],
        ['MySQL', 'UNIX_TIMESTAMP()', 'ROUND(UNIX_TIMESTAMP(CURTIME(3)) * 1000)'],
        ['PostgreSQL', 'EXTRACT(epoch FROM NOW())::BIGINT', 'ROUND(EXTRACT(epoch FROM NOW()) * 1000)'],
        ['Shell / Bash', 'date +%s', 'date +%s%3N'],
        ['C# / .NET', 'DateTimeOffset.UtcNow.ToUnixTimeSeconds()', 'DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()'],
        ['Redis', 'TIME (秒部分)', 'TIME (微秒部分换算)']
      ]
    },
    extraSections: [
      {
        title: '常用时间秒数换算速查表 (TTL / 过期时间参考)',
        head: ['时间跨度', '换算秒数 (秒级时间戳跨度)', '常用业务场景'],
        monoCols: [1],
        rows: [
          ['1 分钟', '60 秒', '验证码有效期、短轮询间隔'],
          ['1 小时', '3,600 秒', 'OAuth 访问令牌 (Access Token)'],
          ['1 天 (24小时)', '86,400 秒', 'Redis 日报缓存、每日限流窗口'],
          ['1 周 (7天)', '604,800 秒', '用户记住登录态、统计周报'],
          ['30 天 (1个月)', '2,592,000 秒', '刷新令牌 (Refresh Token)、月度账单'],
          ['365 天 (平年)', '31,536,000 秒', '长效数据归档、SSL 证书有效期']
        ]
      }
    ],
    faqs: [
      {
        q: 'Unix 秒级时间戳 (10位) 与毫秒级时间戳 (13位) 有什么区别?',
        a: 'Unix 秒级时间戳是指从协调世界时 1970年1月1日 00:00:00 UTC 起至现在的总秒数(通常为 10 位整型,如 Python 的 time.time() 取整);毫秒级时间戳为总毫秒数(通常为 13 位整型,如 JavaScript 的 Date.now() 或 Java 的 System.currentTimeMillis())。'
      },
      {
        q: '为什么转换出来的时间经常差了 8 个小时?',
        a: '这是由于时区差引起的。Unix 时间戳本质上是无时区偏置的标准 UTC 绝对时间。中国标准时间(北京时间)为东八区(UTC+8),比标准 UTC 时间快 8 个小时。DevHub 同时展示 Local 北京时间与 UTC 标准时间,避免时区偏差导致的数据排查混乱。'
      },
      {
        q: '什么是 2038 年问题(Y2038 Bug)?',
        a: '在旧版 32 位有符号整数系统中,Unix 时间戳的最大表示上限为 2147483647(对应北京时间 2038年1月19日 11:14:07),溢出后会回卷为负数导致系统异常。现代 64 位操作系统已将时间上限扩展至近 2920 亿年之后。'
      },
      {
        q: '为什么数据库推荐存时间戳而不是日期字符串?',
        a: '时间戳是定长整数,占空间小、可索引、比较排序快,且天然无时区歧义;字符串在不同地区、不同格式(MM/dd vs dd/MM)下解析极易出错。工程最佳实践是存储层统一存 UTC 时间戳,展示层再按用户时区格式化。'
      },
      {
        q: '前端 new Date() 有哪些时区陷阱?',
        a: "new Date('2026-10-23') 按 UTC 零点解析,而 new Date('2026-10-23 12:00') 按本地时区解析——同一个日期字符串带不带时间,在东八区会差 8 小时。Safari 还严格要求 ISO 格式。稳妥做法:传时间戳或带时区偏移的完整 ISO 8601 字符串。"
      }
    ]
  },
  'tool-jwt': {
    h1: 'JWT 在线解码与 Token 过期校验工具',
    intro:
      '专为后端架构师、API 开发者及全栈工程师打造的 JWT 调试利器。本地结构化着色解析 Header 与 Payload、深度校验标准 Claims,智能判定 Token 过期状态,绝不上报服务器。',
    extra: {
      title: 'JWT 标准 Claims 字段速查',
      head: ['字段', '英文全称', '含义与说明'],
      monoCols: [0],
      rows: [
        ['sub', 'Subject', '该 JWT 所面向的主体(通常为用户唯一 User ID)'],
        ['iss', 'Issuer', '签发机构标识或 OAuth 认证中心域名'],
        ['exp', 'Expiration Time', '过期时间(秒级 Unix 时间戳),超时即拒绝服务'],
        ['iat', 'Issued At', '签发时间(秒级 Unix 时间戳)'],
        ['nbf', 'Not Before', '生效时间,在此时刻之前 Token 不可被接受']
      ]
    },
    faqs: [
      {
        q: '在线使用 JWT 解码器解析生产环境 Token 安全吗?',
        a: '使用常规服务端解析工具存在安全合规隐患。DevHub JWT 解码器基于纯前端浏览器本地算法,使用 UTF-8 安全 Base64URL 纯客户端解码,没有任何后台接口接收你的 Token,可放心解析含用户鉴权信息的测试与生产 Token。'
      },
      {
        q: 'JWT 结构中的三部分分别代表什么?',
        a: "JWT 采用以句号 '.' 分隔的三段结构:第一段为 Header(头部,声明签名算法如 HS256/RS256 及令牌类型);第二段为 Payload(有效载荷,存放身份 Claims 与自定义业务属性);第三段为 Signature(数字签名,由前两段结合服务端私钥防篡改生成)。"
      },
      {
        q: '如何通过 exp 字段判断 JWT 是否过期?',
        a: 'exp 是 JWT 标准声明中的 Expiration Time(过期时间戳,以秒为单位)。DevHub 会自动将 exp * 1000 转换为可读的北京时间,并与本地当前系统时间对比:当当前时间大于 exp 时自动预警已过期。'
      },
      {
        q: 'access token 和 refresh token 应该怎么设计有效期?',
        a: '常见实践:access token 短有效期(15 分钟~2 小时)随请求携带;refresh token 长有效期(7~30 天)只在刷新端点使用且可服务端吊销。这样即使 access token 泄露,攻击窗口也很短,兼顾了 JWT 无状态与服务端可控性。'
      },
      {
        q: 'JWT 为什么很难做到立即注销?',
        a: 'JWT 的签名校验不依赖服务端状态,token 在 exp 前天然有效。要支持立即注销必须引入状态:例如在 Redis 维护 jti 黑名单直至过期,或回退为服务端会话——这实际放弃了无状态优势。务实折中是短有效期 + refresh token 轮换吊销。'
      }
    ]
  },
  'tool-codec': {
    h1: 'Base64 / URL 在线编解码与 MD5 / SHA256 哈希计算',
    intro:
      '纯前端离线一站式加密解密与哈希工具箱:支持中文字符与 Emoji 的 Base64 编码解码、URL 参数 Encode/Decode 转码,以及标准 MD5 与 SHA-256 摘要哈希极速计算。',
    extra: {
      title: '常见编解码与哈希算法对比指南',
      head: ['算法/格式', '是否可逆', '输出长度', '核心应用场景'],
      monoCols: [0],
      rows: [
        ['Base64', '可逆', '~ 原文本 133%', '文本协议传输图片、内联资源、邮件协议附件'],
        ['URL Encode', '可逆', '视非ASCII字符而定', 'HTTP GET 请求 Query 参数中包含特殊标点与汉字转义'],
        ['MD5', '不可逆', '32 位十六进制', '快速文件完整性校验 (Checksum)、数据指纹生成'],
        ['SHA-256', '不可逆', '64 位十六进制', '数字证书验签、区块链加密哈希、安全密码存证']
      ]
    },
    faqs: [
      {
        q: '为什么在部分网站进行 Base64 编解码时中文会出现乱码?',
        a: '浏览器原生的 btoa 和 atob 函数仅支持单字节 Latin1 字符(0-255)。遇到多字节的 UTF-8 中文字符或 Emoji 表情时会直接抛出字符越界异常或产生乱码。DevHub 底层统一采用 TextEncoder 与 TextDecoder 处理二进制字节流,实现 100% 汉字与特殊字符安全编解码。'
      },
      {
        q: 'MD5 和 SHA-256 可以被解密吗?',
        a: "MD5 与 SHA-256 是单向散列哈希函数(Hash Function),而非可逆的对称/非对称加密算法,数学上不可逆向解密。网上常见的所谓'MD5解密'实际上是利用预先计算好的'彩虹表(Rainbow Table)'进行碰撞反查。建议涉及密码存储时务必配合盐值(Salt)或使用专门的 bcrypt/argon2 算法。"
      },
      {
        q: 'encodeURI 与 encodeURIComponent 有什么区别?',
        a: 'encodeURI 用于编码完整的统一资源标识符 (URI),它不会对 URI 中的语义分隔符(如 http://, /, ?, &, =)进行转义;而 encodeURIComponent 会对除了字母数字外的绝大部分标点符号都进行转义,通常用于给 URL 查询参数中的单个 key 或 value 进行安全转码。'
      },
      {
        q: '为什么 URL 里空格有时是 %20 有时是 +?',
        a: '%20 是 RFC 3986 的标准百分号编码;+ 是 application/x-www-form-urlencoded 表单提交的历史约定,只在查询串中代表空格。encodeURIComponent 只产出 %20,若后端按表单语义解析就需要把空格换成 +,这是接口联调最常见的坑之一。'
      },
      {
        q: '哈希"加盐"是什么意思?还有必要吗?',
        a: '加盐指哈希前拼接每用户唯一的随机串,使相同密码产出不同摘要,令预计算彩虹表失效。现代建议是直接用 bcrypt/scrypt/argon2 这类自带盐、计算速度可调慢的专用密码哈希算法,而不是裸算一次 MD5/SHA256。'
      }
    ]
  },
  'tool-regex': {
    h1: '正则表达式在线测试与常用正则速查表',
    intro:
      '专为前端表单校验、爬虫提取与服务端日志分析打造的轻快正则调试器。支持实时多项匹配结果列表呈现,集成 200ms 防抖与 ReDoS 防假死保护,预置 6 款工业级常用模板。',
    extra: {
      title: '常用正则表达式速查模板清单',
      head: ['业务场景', '正则表达式模式 Pattern'],
      monoCols: [1],
      rows: [
        ['电子邮箱 (Email)', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'],
        ['中国手机号码', '1[3-9]\\d{9}'],
        ['IPv4 地址', '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'],
        ['HTTP/HTTPS 链接', 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)'],
        ['中文字符匹配', '[\\u4e00-\\u9fa5]+'],
        ['中国二代身份证号', '[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]']
      ]
    },
    faqs: [
      {
        q: '常用的正则表达式修饰符(Flags)代表什么?',
        a: "g (Global) 代表全局匹配,找到目标字符串中所有符合条件的结果而非在命中首项后退出;i (Ignore Case) 代表忽略英文大小写;m (Multiline) 代表多行匹配,让 ^ 和 $ 可以分别定位每行的行首与行尾;s (Dot All) 允许点号 '.' 匹配换行符。"
      },
      {
        q: '什么是正则表达式拒绝服务攻击 (ReDoS)?如何预防?',
        a: '当正则表达式包含大量嵌套分组、重叠交替以及贪婪量词(例如 (a+)+$)时,面对精心构造的不匹配长输入,正则引擎会发生天文数字级别的灾难性回溯(Catastrophic Backtracking),导致 CPU 满载假死。DevHub 通过文本长度截断与最多循环限制进行安全防死锁。'
      },
      {
        q: '如何用正则准确匹配包含汉字中文字符的内容?',
        a: '基本中文字符的 Unicode 范围为 [\\u4e00-\\u9fa5]。若要匹配全汉字字符串,可使用 ^[\\u4e00-\\u9fa5]+$;在现代 ES2018+ 还可以使用 Unicode 属性转义 /\\p{Script=Han}+/u。'
      },
      {
        q: '贪婪匹配和非贪婪匹配有什么区别?',
        a: '量词(*、+、?、{n,m})默认贪婪,尽量多吃字符;后跟 ? 变为非贪婪,尽量少吃。例如对 "a"b"c",/".*"/ 一口吞到底,而 /".*?"/ 依次匹配出 "a" 与 "c"。提取成对符号之间的内容时几乎总应使用非贪婪。'
      },
      {
        q: '正则的前瞻断言 (?=) 和 (?!) 是什么?',
        a: '(?=x) 表示"此处后面必须是 x"但不消耗字符;(?!x) 表示"此处后面不能是 x"。常用于"后面跟着单位的数字""不含某词的行"等场景。ES2018 起还支持后行断言 (?<=) 与 (?<!)。'
      }
    ]
  },
  'tool-cron': {
    h1: 'Cron 表达式在线生成与解析工具',
    intro:
      '输入标准 5 位(分 时 日 月 周)或 6 位(含秒)Cron 表达式,即时获得中文语义描述与未来 5 次执行时间。支持 *、*/n、区间、列表等全部常用语法,100% 浏览器本地计算。',
    extra: {
      title: 'Cron 五个字段速查',
      head: ['字段', '允许值', '允许的特殊字符'],
      rows: [
        ['分钟', '0-59', '* / - ,'],
        ['小时', '0-23', '* / - ,'],
        ['日(月份中的天)', '1-31', '* / - ,'],
        ['月', '1-12', '* / - ,'],
        ['星期(0 和 7 都表示周日)', '0-7', '* / - ,']
      ]
    },
    faqs: [
      {
        q: 'Cron 表达式 5 位和 7 位有什么区别?',
        a: 'Linux crontab 使用 5 位(分 时 日 月 周);Quartz 等 Java 调度框架常用 7 位(秒 分 时 日 月 周 年),并在日/周字段扩展了 L(最后)、W(最近工作日)、#(第 n 个周 x)等修饰符。DevHub 支持标准 5 位与含秒 6 位语法,Quartz 特有修饰符会明确提示暂不支持,避免给出错误结果。'
      },
      {
        q: 'Cron 里的 ? 和 * 有什么区别?',
        a: '两者都表示"任意",但 ? 只能用在日和周字段,用于在另一个字段已被指定时避免歧义(如每月 1 号执行 0 0 1 * ?)。标准 Linux crontab 不支持 ?,那两个位置用 * 即可。'
      },
      {
        q: 'Cron 任务用的是服务器时区还是 UTC?',
        a: 'cron 守护进程按服务器本地时区匹配字段。容器化部署的服务器常默认 UTC,导致任务比预期早 8 小时(东八区视角)。排查时先 date 确认服务器时区,或在容器中设置 TZ=Asia/Shanghai。本工具按你的浏览器本地时区计算下次执行时间。'
      }
    ]
  },
  'tool-uuid': {
    h1: 'UUID 在线批量生成器',
    intro:
      '基于浏览器加密安全随机源(crypto.getRandomValues)批量生成 UUID:v4 全随机版本与 v7 时间戳有序版本,支持 1-100 个批量产出、大写与连字符开关、单条或全部一键复制。',
    extra: {
      title: 'UUID 版本选型速查',
      head: ['版本', '生成方式', '有序性', '典型场景'],
      rows: [
        ['v1', 'MAC 地址 + 时间戳', '时间有序', '遗留系统,已因隐私问题很少使用'],
        ['v4', '122 位纯随机', '无序', '绝大多数场景的默认选择:主键、请求 ID、文件名'],
        ['v7', '48 位毫秒时间戳 + 随机', '毫秒有序', '数据库主键(插入局部性好)、日志追踪、可排序令牌']
      ]
    },
    faqs: [
      {
        q: 'UUID v1、v4、v7 应该怎么选?',
        a: 'v4(122 位随机)是通用默认,无信息泄露;v7 前 48 位是毫秒时间戳,天然按时间排序,做数据库主键时 B+ 树插入局部性远好于随机的 v4,是新版主流推荐;v1 含 MAC 地址有隐私问题,新项目不应使用。'
      },
      {
        q: 'UUID 真的会重复吗?',
        a: '理论上会,实际上概率可以忽略:随机 122 位的 v4,生成 103 万亿个后碰撞概率才约 10⁻¹²。日常业务量级下可以放心当作全局唯一标识使用,无需查重。'
      },
      {
        q: '为什么不用 Math.random 生成 UUID?',
        a: 'Math.random 是非加密安全的伪随机数,可被预测与重现;UUID 用作令牌或 ID 时必须使用加密安全随机源。本工具使用浏览器原生 crypto.getRandomValues,与后端 crypto 库同等强度。'
      }
    ]
  },
  'tool-color': {
    h1: '颜色格式在线转换与对比度检查',
    intro:
      '输入任意一种格式(#hex、rgb()、hsl())即时得到三种格式实时互转结果与色彩预览,并自动计算该颜色对黑/白文本的 WCAG 对比度比值与 AA/AAA 达标状态。',
    extra: {
      title: '常见颜色格式速查',
      head: ['格式', '形式', '示例', '适用场景'],
      monoCols: [2],
      rows: [
        ['HEX', '#RRGGBB 十六进制', '#16a34a', 'CSS / 设计软件默认,最短书写'],
        ['RGB', '红绿蓝各 0-255', 'rgb(22, 163, 74)', '需要单独操纵通道(渐变、滤镜)'],
        ['HSL', '色相 0-360 + 饱和度/亮度 %', 'hsl(142, 76%, 36%)', '调明暗/饱和最直观,主题色派生']
      ]
    },
    faqs: [
      {
        q: 'HSL 的 H、S、L 分别控制什么?',
        a: 'H(Hue 色相)是色环角度:0 红、120 绿、240 蓝;S(Saturation 饱和度)越高颜色越纯,0% 即灰色;L(Lightness 亮度)0% 是黑、100% 是白、50% 是纯色。想要"同一颜色的浅色版",只改 L 就行——这是它比 RGB 直观的原因。'
      },
      {
        q: '正文文字的对比度要达到多少才合格?',
        a: 'WCAG 2.1 标准:正常字号正文至少 4.5:1(AA),大字号(≥18pt 或 14pt 粗体)至少 3:1,增强级 AAA 为 7:1。本工具自动计算你输入的颜色对白色与黑色文本的比值并标注达标状态。'
      },
      {
        q: '为什么设计系统常用 HSL 派生色板?',
        a: '保持 H 与 S 不变、按档位递变 L,即可得到一组视觉上同族、明暗有序的色阶(如 50-950),这正是 Tailwind 等设计系统的调色板生成方式。用 RGB 手工派生很难保持这种规律感。'
      }
    ]
  },
  'tool-aes': {
    h1: 'AES 在线加解密实验室与多语言联调工具',
    intro:
      '支持 CBC / ECB / CTR / OFB / CFB 全部分组工作模式，PKCS7 / ZeroPadding / NoPadding 等多种填充，Base64 与 Hex 密文编码。内置 Java、Python、Node.js、Go 生产级联调代码即时生成，数据纯本地客户端计算绝不上报。',
    extra: {
      title: 'AES 工作模式与安全性对比速查',
      head: ['模式', '全称', '需要 IV', '安全性与特点', '建议场景'],
      monoCols: [0],
      rows: [
        ['CBC', 'Cipher Block Chaining', '是 (16字节)', '分组串联，最成熟普及；密文块被破坏仅影响两块', '通用 API 交互、数据库敏感字段存储'],
        ['ECB', 'Electronic Codebook', '否', '相同明文块产生相同密文块，泄露明文模式，不安全', '仅用于单块测试或已废弃遗留系统兼容'],
        ['CTR', 'Counter Mode', '是 (16字节计数器)', '流加密特性，支持并发加解密且无填充开销', '高性能传输、流媒体、并发数据管道'],
        ['OFB', 'Output Feedback', '是 (16字节)', '将分组密码转换为同步流密码，抗信道误码传播', '卫星通信、容错数据传输通道']
      ]
    },
    faqs: [
      {
        q: '为什么前后端联调 AES 经常出现解密失败？',
        a: '最常见原因有四点：1. 模式或填充不匹配（Java 默认 AES 实际为 AES/ECB/PKCS5Padding，而常见前端库默认 CBC）；2. IV 缺失或长度不满足 16 字节；3. 密钥编码不一致（如 UTF-8 字符串与 Hex 16进制混淆）；4. 输出编码不一致（Base64 与 Hex 字符大小写）。DevHub 提供了 Java、Python、Go 等多语言联调代码生成，复制即可对齐双方配置。'
      },
      {
        q: 'PKCS#5 和 PKCS#7 填充有什么区别？',
        a: '本质上算法完全相同：PKCS#5 规范规定块大小固定为 8 字节（最初用于 DES）；而 PKCS#7 允许块大小为 1 到 255 字节。由于 AES 的分组块固定为 16 字节（128位），严格来说 AES 使用的是 PKCS#7。在 Java 中由于历史原因写为 PKCS5Padding，实际在 AES 下就是 PKCS#7，二者完全通用。'
      },
      {
        q: '为什么强烈不推荐在生产环境中使用 AES-ECB 模式？',
        a: 'ECB（电子密码本）模式将明文拆分为独立的 16 字节块各自加密，相同的明文块永远输出相同的密文块。攻击者即使不知道密钥，也可以通过分析密文重复模式窥探出原始图像轮廓或报文结构（如著名的 ECB 企鹅图），且极易遭受重放攻击与块重组攻击。推荐使用 CBC 或 CTR 模式。'
      },
      {
        q: 'AES 的 128 位、192 位和 256 位密钥有什么差别？',
        a: '数字代表密钥长度：128 位需要 16 字节，192 位需要 24 字节，256 位需要 32 字节。加密轮数分别为 10、12、14 轮。在当代密码学中，AES-128 已足以抵御暴力破解；金融、政企与极高敏感级系统常规范要求采用 AES-256。密钥越长对 CPU 的算力消耗略有增加，但在现代支持硬件加速的 CPU 上性能差异极小。'
      },
      {
        q: '在线使用 AES 工具会有密钥或明文泄露风险吗？',
        a: '传统服务端在线工具会把您的密钥和数据发送到远端服务器，存在日志记录和网络劫持泄露风险。DevHub 采用纯前端 WebAssembly 与 JavaScript 纯本地客户端运算，全程在当前浏览器内存执行，绝不向任何后端接口上传数据，断网亦可正常工作。'
      }
    ]
  },
  'tool-case': {
    h1: '变量命名风格转换与多行批量处理工具',
    intro:
      '支持 camelCase、PascalCase、snake_case、kebab-case、CONSTANT_CASE、Title Case、dot.case、path/case 8 种主流编程命名风格实时互转。智能识别连续大写缩写词（如 HTTP、JSON），支持多行数据库字段批量转换为 Java/TS 实体属性。',
    extra: {
      title: '各主流编程语言与技术栈命名规范推荐',
      head: ['技术栈 / 语言', '变量与方法', '类名 / 接口 / 类型', '常量 / 环境变量', '数据库列名'],
      monoCols: [1, 2, 3, 4],
      rows: [
        ['JavaScript / TS', 'camelCase', 'PascalCase', 'CONSTANT_CASE', 'snake_case'],
        ['Java', 'camelCase', 'PascalCase', 'CONSTANT_CASE', 'snake_case'],
        ['Python', 'snake_case', 'PascalCase', 'CONSTANT_CASE', 'snake_case'],
        ['Go', 'camelCase / PascalCase', 'PascalCase', 'CONSTANT_CASE', 'snake_case'],
        ['Rust', 'snake_case', 'PascalCase', 'CONSTANT_CASE', 'snake_case'],
        ['CSS / HTML', 'kebab-case', 'kebab-case', 'kebab-case', 'N/A']
      ]
    },
    faqs: [
      {
        q: '什么是小驼峰 (camelCase) 与大驼峰 (PascalCase)？',
        a: '驼峰命名法（CamelCase）通过单词首字母大写消除空格以模拟骆驼驼峰。小驼峰（lowerCamelCase）首字母小写（如 userName），在 JS、Java、Swift、Go（私有）中广泛用于局部变量与方法；大驼峰（UpperCamelCase 或 PascalCase）首字母大写（如 UserProfile），通常用于类名、接口、React 组件或 Go 导出的公共属性。'
      },
      {
        q: '遇到类似 getHTTPResponse 的连续大写缩写词时如何智能分词？',
        a: '简单粗暴的正则会把 HTTPResponse 拆分成每个单独大写字母或拆错词。DevHub 内置智能分词算法：将连续大写字母作为一个整体单词识别，但当后面紧跟小写字母时自动将最后一个大写字母归入后续词（例如 HTTPResponse 正确拆解为 HTTP 与 Response），精准还原缩写意图。'
      },
      {
        q: '如何高效把 SQL 数据库列名批量转为后端 Java 或前端 TS 变量？',
        a: '在日常开发中，从建表 DDL 导出的字段往往是下划线风格（如 user_account_id）。切换到本工具的"批量多行转换"模式，将数据库列名多行粘贴在左侧，选择目标命名风格为"小驼峰 camelCase"，右侧即可一键生成对齐的实体属性列表，支持一键复制到 IDE 中。'
      },
      {
        q: '为什么 URL 路径和 CSS 类名推荐 kebab-case 而不是 camelCase？',
        a: 'URL 规范中部分协议或 CDN 缓存服务器对大小写可能不敏感（导致 itemDetail 与 itemdetail 被判定为同一资源或缓存混乱）；而在 CSS 中选择器也是大小写不敏感的，且使用短横线（kebab-case）具有极高的可读性，例如 user-avatar-image，这是前端规范事实上的黄金标准。'
      }
    ]
  },
  'tool-sql': {
    h1: 'SQL 在线格式化与美化工具',
    intro:
      '免费强大的纯前端离线 SQL 格式化与美化实验室。支持 MySQL、PostgreSQL、SQLite、SQL Server、Oracle 等主流方言语法，提供 2 空格/4 空格层级缩进、SQL 关键字大写/小写转换与单行极简压缩。本地计算，零数据库敏感数据外泄风险。',
    extra: {
      title: '标准 SQL 子句语法书写与执行顺序速查',
      head: ['执行顺序', 'SQL 子句', '作用说明', '优化关注点'],
      monoCols: [1],
      rows: [
        ['1', 'FROM / JOIN', '确定数据源表并执行笛卡尔积或关联过滤 (ON 条件)', '小表驱动大表，JOIN 字段务必建立索引'],
        ['2', 'WHERE', '对基础行执行行级条件过滤', '避免函数计算导致索引失效 (如 WHERE YEAR(d)=2026)'],
        ['3', 'GROUP BY', '对筛选后的数据进行分组聚合', '尽量配合聚合字段，避免隐式排序'],
        ['4', 'HAVING', '对分组聚合后的结果进行二次过滤', '非聚合条件的过滤应前置放入 WHERE 中'],
        ['5', 'SELECT', '提取指定字段或执行表达式投影', '严禁生产环境中使用 SELECT * 增加网络与解析开销'],
        ['6', 'ORDER BY', '对结果集执行排序', '尽量利用联合索引的已有顺序，避免 filesort 磁盘排序'],
        ['7', 'LIMIT / OFFSET', '限制返回行数并执行分页', '深度分页 (如 LIMIT 1000000, 10) 需采用延迟关联优化']
      ]
    },
    faqs: [
      {
        q: '为什么推荐在开发中将 SQL 关键字全部大写？',
        a: '在复杂的多表关联与长子查询中，将保留关键字（如 SELECT、FROM、LEFT JOIN、WHERE、GROUP BY）全大写，表名、列名保持小写或驼峰，能形成极其强烈的视觉层次对比，极大降低代码 Review 与排障成本，符合业界如阿里巴巴 Java 开发手册及主流 DBA 规范。'
      },
      {
        q: '单行压缩 (Minify) SQL 有什么实际使用场景？',
        a: '格式化排版适合开发者在 IDE 或 Navicat/DBeaver 中阅读调试；而在微服务日志输出、MyBatis XML 映射文件内嵌、应用监控 APM 埋点以及传输高频 REST API 查询请求时，单行压缩能够消除全部冗余空白换行与注释，减少网络传输负载与日志磁盘占用。'
      },
      {
        q: '为什么在线格式化 SQL 工具必须使用纯前端离线实现？',
        a: 'SQL 语句中通常包含大量敏感业务元数据（例如公司真实的表名、列名、租户标识 ID、甚至 WHERE 条件中夹带的用户手机号、密码哈希与订单金额）。如果上传到远端第三方后端服务器，存在严重的数据泄露与合规风险。DevHub 100% 采用浏览器本地主线程计算，不发任何网络请求。'
      },
      {
        q: '复杂嵌套子查询或几千行的存储过程在这里会卡顿吗？',
        a: '常规几十行至上千行的 DDL/DML 查询在浏览器中均能在几十毫秒内完成美化渲染。对于数万行的数据库备份 dump 文件，建议使用专用命令行工具处理。'
      }
    ]
  },
  'tool-curl': {
    h1: 'cURL 转多语言代码工具 (cURL Converter)',
    intro:
      '将浏览器控制台 Network 复制的 cURL 命令或 API 文档片段，一键秒级转换为生产级 JavaScript Fetch、Axios、Python Requests、Go net/http 以及 Java HttpClient 代码。自动解析 URL、Method、Header、Cookie、Basic Auth 与 JSON Body，100% 本地运算。',
    extra: {
      title: '浏览器各内核一键复制 cURL 方式速查',
      head: ['浏览器 / 平台', '操作路径', '推荐格式'],
      monoCols: [1],
      rows: [
        ['Chrome / Edge', 'F12 打开控制台 -> Network -> 右键请求条目 -> Copy -> Copy as cURL (bash)', 'cURL (bash)'],
        ['Firefox 火狐', 'F12 控制台 -> 网络 -> 右键请求 -> 复制 -> 复制为 cURL', 'cURL'],
        ['Postman', '右侧侧边栏 -> 点击 </> Code 按钮 -> 选择 cURL', 'cURL'],
        ['ApiFox / Apipost', '接口文档右上角 -> 点击“生成代码” -> 复制 cURL', 'cURL']
      ]
    },
    faqs: [
      {
        q: '从 Chrome 复制的 cURL 命令如何快速转为 Python 或前端代码？',
        a: '在 Chrome 开发者工具的“网络 (Network)”面板中，右键任意已发起的请求，选择“复制 -> 作为 cURL (bash) 复制”。打开 DevHub 本工具，直接粘贴在左侧输入框，顶部点击 Python (requests) 或 JS (fetch)，右侧即刻生成包含完整 Headers、Cookies 与 Payload 的生产代码，一键复制即可运行。'
      },
      {
        q: '工具能自动识别 POST 请求与 JSON 报文吗？',
        a: '可以。只要命令中包含 -d、--data、--data-raw 或 --json 参数，工具会自动推断请求方法为 POST，并将 JSON 字符串格式化为各语言标准的数据字典或结构体（如 Python 字典或 JS 对象），省去手动拼接字符串转义符的麻烦。'
      },
      {
        q: '转换涉及 Authorization 密钥或 Token，会不会有安全泄露？',
        a: '绝不会。DevHub 坚持纯前端离线计算理念，所有 cURL 命令的词法解析与代码生成逻辑均通过本地 JavaScript 引擎在当前浏览器沙箱中执行，零网络上报，杜绝生产环境敏感鉴权 Token 与私有接口外泄。'
      },
      {
        q: '支持带有换行反斜杠 (\\) 的多行 cURL 命令吗？',
        a: '完全支持。DevHub 内置高级 Bash 词法分词器，完美兼容单引号、双引号嵌套以及 Chrome 默认导出的多行反斜杠 (\\) 格式命令。'
      }
    ]
  },
  'tool-diff': {
    h1: '文本与代码 Diff 在线对比工具',
    intro:
      '纯前端离线文本与代码差异对比工具。支持行级与字符级高亮、忽略空白字符开关、Unified 单栏与 Git 统一补丁 (Patch) 导出。数据 100% 本地运算，绝不上报私有代码或配置。',
    extra: {
      title: 'Git Diff 符号与输出语义速查',
      head: ['符号 / 标记', '中文名称', '含义与说明'],
      monoCols: [0],
      rows: [
        ['+', 'Added (新增行)', '在新版本中新增的内容，绿色高亮'],
        ['-', 'Deleted (删除行)', '在旧版本中存在、但在新版本中被移除的内容，红色删除线'],
        ['@@ -a,b +c,d @@', 'Hunk Header (差异块头)', '表示差异块在旧文件 (从第 a 行起共 b 行) 与新文件 (从第 c 行起共 d 行) 中的定位'],
        ['\\ No newline at end of file', '文件末尾无换行', '提醒该文件末尾缺少标准 POSIX 规范换行符']
      ]
    },
    faqs: [
      {
        q: '为什么推荐使用纯前端在线 Diff 工具比较敏感代码或配置？',
        a: '传统在线对比网站会将两个版本的文本上传至远端服务器进行比对，若文本中包含数据库连接串、私钥、API Token 或专有业务逻辑，极易造成严重的数据泄露。DevHub 100% 在当前浏览器主线程本地运行 Myers 差异算法，断网即可使用，数据绝不离手。'
      },
      {
        q: '单栏视图 (Unified) 与 Git 补丁 (Patch) 各有什么优势？',
        a: '单栏视图将增删改以行号顺序同屏平铺展示，适合快速审查代码审查 PR 或阅读配置文件改动；Git 补丁格式完全遵循 POSIX / Git 标准规范，可直接复制后保存为 .patch 文件，并在本地终端通过 git apply 一键应用到仓库中。'
      },
      {
        q: '比较不同操作系统的文件时为什么会整篇报错或显示全部变动？',
        a: '这是由于 Windows 系统的换行符为 CRLF (\\r\\n)，而 Linux / macOS 为 LF (\\n)。如果换行符不一致，会导致整段文本行哈希不匹配。开启本工具的“忽略首尾空白与缩进”开关，或在 IDE 中统一转换为 LF 即可解决。'
      },
      {
        q: '大文本（上万行日志或大型代码文件）比对会卡死浏览器吗？',
        a: '几千行文本比对均能在几十毫秒内完成渲染。如果文本达到数万行甚至几十万行，浏览器渲染 DOM 节点会消耗较多显存，建议拆分段落比对或使用本地命令行 diff -u file1 file2。'
      }
    ]
  },
  'tool-json-to-type': {
    h1: 'JSON 转 TS/Go 类型声明与结构体工具',
    intro:
      '将任意复杂嵌套 JSON 快速解析为强类型定义。支持 TypeScript Interface、Go Struct（自动生成 json tag 标签）以及 Python Pydantic BaseModel 模型。智能解析嵌套对象、数组类型推断，100% 浏览器本地运算。',
    extra: {
      title: '各语言 JSON 序列化标签与类型映射速查',
      head: ['JSON 原生类型', 'TypeScript', 'Go (golang)', 'Python (Pydantic)'],
      monoCols: [0, 1, 2, 3],
      rows: [
        ['String 字符串', 'string', 'string', 'str'],
        ['Integer 整数', 'number', 'int64', 'int'],
        ['Float 浮点数', 'number', 'float64', 'float'],
        ['Boolean 布尔值', 'boolean', 'bool', 'bool'],
        ['Array 数组', 'T[]', '[]T', 'List[T]'],
        ['Object 嵌套对象', 'Interface', 'struct', 'BaseModel']
      ]
    },
    faqs: [
      {
        q: 'JSON 转 Go 结构体时，下划线字段名如何正确映射？',
        a: 'Go 语言要求首字母大写的导出字段（如 UserId）才能被外部 json.Marshal/Unmarshal 访问，而 JSON 字段通常是下划线风格（如 user_id）。DevHub 会自动将字段转为大驼峰 PascalCase，并在后方紧跟标准结构体标签 json:"user_id"，完全符合 Go 官方最佳实践。'
      },
      {
        q: '遇到深层嵌套的 JSON 对象时，工具是如何组织子类型的？',
        a: 'DevHub 采用递归类型提炼机制：遇到内部嵌套的 Object 或复杂数组时，会自动提取出独立的子接口或子结构体，并按依赖顺序排列。例如用户档案中的 profile 会被提取为 Profile 接口，使代码模块化且极具可维护性。'
      },
      {
        q: '生成 TypeScript 类型时支持可选字段与可空值吗？',
        a: '当 JSON 字段值为 null 或在复杂列表中偶尔缺失时，工具会智能将其推断为 any 或复合类型。生成的接口代码开箱即用，支持一键粘贴到 .ts 文件中与 Axios / Fetch 请求响应配合使用。'
      },
      {
        q: '在线转换会有业务数据外泄风险吗？',
        a: '绝无风险。DevHub 严格遵守纯前端离线客户端计算规范，所有 JSON 语法解析、AST 提取与类型代码拼接均在浏览器本地主线程内执行，断网亦可正常工作。'
      }
    ]
  }
}
