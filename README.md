# DevHub - 开发者复合型工作台与资源导航 🚀

<p align="center">
  <strong>专为程序员打造的高频日常工作台 · 纯前端离线开发者小工具 · 精选垂直技术生态导航</strong>
</p>

<p align="center">
  <a href="https://yunitytech.top" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-yunitytech.top-22c55e?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Vue-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-18%20Passed-729B1B?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 🌟 为什么选择 DevHub？

传统导航站往往“看一眼就关、留存率低”，而安装过多本地调试软件又占用大量系统资源。**DevHub** 将 **高质量垂直开发资源导航** 与 **日常高频纯前端小工具** 深度结合，成为你浏览器中常驻的生产力第一站。

- ⚡ **秒开体验**：无服务端依赖，静态单页架构，全站 Gzip 后仅 ~85KB，首屏秒级加载。
- 🔒 **100% 隐私安全**：所有数据转换（代码、JSON、JWT、密钥）均在浏览器本地主线程计算，**绝不上报任何外部服务器**，杜绝泄露风险。
- 🛠️ **开箱即用工具箱**：内置 5 大高频生产力工具，支持快捷键关闭与即开即用弹窗。
- 🔍 **聚合搜索与站内直达**：支持 Google、百度、GitHub、Bing 快捷切换，输入关键词即时联想并直达站内小工具与书签。
- ⭐ **自由个性化定制**：支持自定义添加私有书签，一键 ⭐ 置顶常用工具或网站，数据通过 `localStorage` 自动持久化。
- 🌙 **全天候舒适体验**：原生支持深色模式 (Dark Mode) 与浅色模式跟随系统自动或手动切换。

---

## 🧰 内置小工具矩阵

| 工具模块 | 核心功能特性 | 适用场景 |
| :--- | :--- | :--- |
| **JSON 实验室** | 2/4空格美化格式化、单行压缩、语法错误精确定位、一键复制 | 接口联调、日志排查、配置解析 |
| **时间戳转换器** | 秒/毫秒时间戳双向转换、本地时间/UTC/相对时间（如“3分钟前”）、实时秒级看板 | 数据库时间排查、分布式追踪 |
| **JWT 解码器** | Header 与 Payload 结构化着色解析、Claims 检查、过期时间 `exp` 智能预警 | Token 校验、身份鉴权、OAuth 联调 |
| **全能编解码与哈希** | UTF-8 中文/Emoji 安全 Base64 编解码、URL Encode/Decode、MD5 / SHA256 哈希计算 | 加解密对接、接口验签、URL 参数处理 |
| **正则测试与速查** | 实时多项高亮匹配、200ms 防抖防护防死锁、预置邮箱/手机/IP/身份证常用模板 | 表单校验、日志正则提取、爬虫编写 |

---

## 🧭 精选分类资源导航

涵盖现代化软件工程全流程的高质量生态外链（配备 Favicon 裂图智能回退徽章）：
- **AI 与大模型**：DeepSeek、ChatGPT、Claude、Hugging Face、Ollama 等前沿模型与推理生态；
- **前端与跨端**：Vue 3、React、Tailwind CSS、Vite、TypeScript 官方文档与设计库；
- **后端与云原生**：Spring Boot、Go、Docker Hub、Linux 常用命令中文速查、Kubernetes；
- **独立开发与出海**：Product Hunt、Supabase、Cloudflare、Stripe 出海基础设施与支付；
- **极客社区与热榜**：GitHub Trending 每日热榜、V2EX、Hacker News、LINUX DO。

---

## 🛠️ 本地开发与构建

### 环境准备
- Node.js >= 20
- npm >= 10

### 快速上手
```bash
# 1. 克隆代码仓库
git clone https://github.com/upowerman/upowerman.github.io.git
cd upowerman.github.io

# 2. 安装项目依赖
npm install

# 3. 启动本地开发预览
npm run dev

# 4. 运行完整单元测试套件 (Vitest)
npm run test:run

# 5. 生产构建打包 (输出至 dist/)
npm run build
```

---

## 🚀 CI/CD 自动化流水线

本项目已配置基于 GitHub Actions 的持续集成与发布工作流（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）：
- 只要向 `main` 分支执行 `git push`，流水线将自动运行类型检查与 18 项单测；
- 测试通过后，自动打包构建并部署至 **GitHub Pages**；
- 自动保留 [`public/CNAME`](public/CNAME)，确保持续稳定绑定独立域名 **`yunitytech.top`**。

---

## 🤝 提交收录与交流共建

* **提交新网站或小工具建议**：欢迎提交 [GitHub Issues](https://github.com/upowerman/upowerman.github.io/issues) 或发起 Pull Request。
* **微信技术社群**：微信添加群助手微信号 **`upowerman`**，备注「入群」，即可加入开发者交流群，探讨独立开发、出海案例与实用技术工具！

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
