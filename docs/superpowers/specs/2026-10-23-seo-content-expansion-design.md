# DevHub SEO 内容扩充与遗留优化设计

日期:2026-10-23
状态:待用户评审
前置:`feat/frontend-design-fixes` 分支(15 提交,未合并)为本设计的实现基线;全部完成后一次性合并 main 上线。

## 背景与目标

站点完成前端重构后内容层单薄:5 个工具页 + 5 个导航分类,一屏半即读完。用户目标:**让搜索引擎尽可能搜到这些工具**(主),顺手完成上轮评审遗留的 6 项优化(次)。

成功标准:
- 工具页从 5 → 8,每页是独立可收录的 SEO 落地页(含 FAQ/速查/结构化数据)
- 现有 5 页各增 2-3 条"People Also Ask"型 FAQ,加深内容厚度
- 合并部署后 sitemap/JSON-LD/内链同步反映 8 个工具

## 范围

1. 新增 3 个纯前端工具:cron 表达式、UUID 生成器、颜色转换(规格见下)
2. 深化现有 5 个工具页(FAQ 追加,不改版式)
3. 遗留优化 6 项(见"遗留修复"节)
4. SEO 基建同步:registry/routes/构建入口/sitemap(根目录与 public 两份都更新)/index.html ItemList 与预渲染列表/404 工具链接/README 工具表
5. 工具卡网格从 5 列改 4 列(8 卡 = 2×4,截图验证)

## 非目标

- cheatsheet 速查中心(二期)
- 任何后端/账号/远程数据(坚持 100% 本地)
- Quartz 完整方言(L/W/# 修饰符 v1 明确提示不支持)
- 博客/更新日志

## 新工具规格

### 1. cron 表达式工具 `/tools/cron/`

- **解析**:5 字段(分 时 日 月 周)标准 cron;支持 `*`、`*/n`、`a-b`、`a,b,c`、`a-b/n` 组合;6 字段(含秒)识别并解析。Quartz 特有修饰符(L/W/#)给出"暂不支持"提示,不报错崩溃。
- **人类可读描述**:中文输出("每 5 分钟执行一次""每周一 09:00"),覆盖常见模式;无法归纳时输出逐字段直译。
- **下次运行时间**:计算未来 5 次执行时刻(本地时区,向前迭代分钟级,366 天为界)。
- **预置模板**:每分钟/每小时/每天 03:00/每周一 09:00/每月 1 号/工作日 09:00,一键填入。
- **SEO 关键词**:cron 表达式在线生成、cron 解析、crontab、下一次执行时间。
- **FAQ 主题**:5 位和 7 位 cron 区别;`?` 与 `*` 的区别;cron 用的是服务器时区吗。

### 2. UUID 生成器 `/tools/uuid/`

- **生成**:v4(标准随机)与 v7(时间戳有序,新版主流)切换;批量 1–100 个;连字符/大写开关;一键复制单个或全部。
- **实现**:`crypto.getRandomValues`(不用 Math.random,v4/v7 均为规范算法,v7 = 48bit 毫秒时间戳 + 随机位 + 版本/变体位)。
- **SEO 关键词**:uuid 在线生成、guid 生成器、uuid v4 v7 区别、批量 uuid。
- **FAQ 主题**:v1/v4/v7 怎么选;UUID 会重复吗(碰撞概率数量级);为什么不用 Math.random。

### 3. 颜色转换器 `/tools/color/`

- **输入**:接受 `#rgb`/`#rrggbb`/`rgb(r,g,b)`/`hsl(h,s%,l%)`,非法输入即时反馈。
- **输出**:HEX/RGB/HSL 三格式实时互转 + 大色块预览。
- **对比度检查**:对黑/白两色的 WCAG 对比度比值 + AA/AAA 达标标注(顺带瞄准"颜色对比度"搜索词)。
- **SEO 关键词**:颜色转换、hex 转 rgb、rgb 转 hsl、颜色对比度检查。
- **FAQ 主题**:HSL 的 H/S/L 各控制什么;为什么设计稿用 HSL 更好调;正文对比度要多少才达标(4.5:1/3:1)。

## 现有页深化(方案 C)

每页追加 2–3 条 FAQ(真实有用内容,非凑数),写入 `src/data/tool-pages.ts` 与对应静态 HTML 的 FAQ 区,保持两处一致:
- JSON:超大 JSON 怎么不卡;JSON 与 JSONP 区别;JSON5 是什么
- 时间戳:为什么数据库存时间戳不存字符串;前端 new Date() 时区陷阱
- JWT:access token 与 refresh token;JWT 注销为什么难
- 编解码:为什么 URL 里空格变 %20 或 +;哈希加盐是什么
- 正则:贪婪与非贪婪;前瞻断言是什么

## 遗留修复(上轮评审 Minor,除文字选中项)

1. Tab 组件:`aria-controls` + roving tabindex(方向键 ←→ 切换视图)
2. 搜索联想:Esc 收起下拉、↑↓ 循环高亮、`aria-activedescendant`
3. `main.ts` 启动时 `localStorage.removeItem('devhub_active_tool_id')`(一次性清理旧键)
4. `toolIdFromPath` 剥离 `/index.html` 后缀
5. `navigateToTool` 单测(happy-dom 下 mock `window.location.assign`)
6. `vite.config.ts` 还原纯缩进变更(消除 diff 噪音;新增 3 个构建入口的实质变更保留)

## 基建改动清单(每个新工具一致)

- `src/utils/{cron,uuid,color}-utils.ts`(TDD,纯函数)
- `src/tools/{cron,uuid,color}/XxxTool.vue`
- `tools/{slug}/index.html`:完整 SEO head(title/description/OG/canonical/JSON-LD: WebApplication + BreadcrumbList + FAQPage)、静态预渲染正文、noscript、暗色防闪脚本(与现有 5 页同构)
- `tools-registry.ts`/`tool-components.ts`/`tool-routes.ts`/`tool-pages.ts` 各加 3 条
- `vite.config.ts` rollupOptions.input 加 3 个入口
- `public/sitemap.xml` 与根 `sitemap.xml` 同步加 3 个 URL(两份都要,防漂移)
- `index.html`:ItemList JSON-LD 5→8、预渲染 `<ul>` 与 noscript 列表补 3 项
- `public/404.html` 工具网格补 3 链接
- `README.md` 工具矩阵表补 3 行
- 首页工具网格 `xl:grid-cols-5` → `xl:grid-cols-4`

## 测试策略

- 每个新 utils 文件单测:cron 解析(合法/非法/Quartz 修饰符/下次运行)、UUID v4/v7(版本位/变体位/批量唯一性/格式)、颜色(往返转换/非法输入/对比度计算边界)
- `tool-routes`/`tool-pages` 完整性测试随条目增加自动覆盖(已有断言模式)
- `navigateToTool` mock 单测
- 每工具页构建后 grep 产物确认 SEO 元素齐全;桌面/移动截图走查

## 部署

全部任务完成后:全量测试 + 构建 → 合并 `feat/frontend-design-fixes` → main(GitHub Pages 自动部署)→ 线上抽查 8 个工具页 200 与 canonical。

## 风险与对策

- cron"下次运行"计算出错 = 工具可信度归零 → 解析与运行时间计算全部单测覆盖,预置模板逐一断言
- 静态 HTML 与 TS 数据两处 FAQ 漂移 → 同一任务内同批提交;完整性测试锁 TS 侧
- 8 卡 4 列在窄屏退化 → 断点断言沿用现有 1/2/3/4 阶梯,截图验证 390px
