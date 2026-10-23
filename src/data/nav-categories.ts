import type { NavCategory } from '../types'

export const defaultNavCategories: NavCategory[] = [
  {
    id: 'ai',
    name: 'AI 与大模型',
    icon: 'Bot',
    items: [
      {
        id: 'ai-deepseek',
        name: 'DeepSeek',
        url: 'https://chat.deepseek.com',
        desc: '国产开源最强大模型与推理助手',
        categoryId: 'ai',
        tags: ['ai', 'llm', 'chat', 'deepseek']
      },
      {
        id: 'ai-chatgpt',
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        desc: 'OpenAI 旗下领先的通用大模型',
        categoryId: 'ai',
        tags: ['ai', 'openai', 'chatgpt']
      },
      {
        id: 'ai-claude',
        name: 'Claude',
        url: 'https://claude.ai',
        desc: 'Anthropic 编码与长文本理解大模型',
        categoryId: 'ai',
        tags: ['ai', 'claude', 'anthropic']
      },
      {
        id: 'ai-huggingface',
        name: 'Hugging Face',
        url: 'https://huggingface.co',
        desc: '全球最大的开源模型与数据集社区',
        categoryId: 'ai',
        tags: ['ai', 'model', 'dataset', 'open-source']
      },
      {
        id: 'ai-ollama',
        name: 'Ollama',
        url: 'https://ollama.com',
        desc: '极简在本地启动运行大模型的终端神器',
        categoryId: 'ai',
        tags: ['ai', 'local', 'cli']
      }
    ]
  },
  {
    id: 'frontend',
    name: '前端与跨端',
    icon: 'Layout',
    items: [
      {
        id: 'fe-vue',
        name: 'Vue.js',
        url: 'https://cn.vuejs.org',
        desc: '渐进式易学易用的 JavaScript 框架',
        categoryId: 'frontend',
        tags: ['vue', 'frontend', 'framework']
      },
      {
        id: 'fe-react',
        name: 'React',
        url: 'https://react.dev',
        desc: '用于构建 Web 与原生交互界面的前端库',
        categoryId: 'frontend',
        tags: ['react', 'frontend', 'ui']
      },
      {
        id: 'fe-tailwind',
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        desc: '高度灵活的原子化现代 CSS 框架',
        categoryId: 'frontend',
        tags: ['css', 'tailwind', 'style']
      },
      {
        id: 'fe-vite',
        name: 'Vite',
        url: 'https://cn.vitejs.dev',
        desc: '下一代极速前端开发构建工具',
        categoryId: 'frontend',
        tags: ['vite', 'build', 'bundler']
      },
      {
        id: 'fe-ts',
        name: 'TypeScript',
        url: 'https://www.typescriptlang.org',
        desc: '带类型的 JavaScript 超集语言',
        categoryId: 'frontend',
        tags: ['typescript', 'ts', 'js']
      }
    ]
  },
  {
    id: 'backend',
    name: '后端与云原生',
    icon: 'Server',
    items: [
      {
        id: 'be-spring',
        name: 'Spring Initializr',
        url: 'https://start.spring.io',
        desc: 'Spring Boot 工程脚手架快速生成',
        icon: 'https://www.google.com/s2/favicons?domain=spring.io&sz=64',
        categoryId: 'backend',
        tags: ['java', 'spring', 'boot']
      },
      {
        id: 'be-docker',
        name: 'Docker Hub',
        url: 'https://hub.docker.com',
        desc: '全球最大的容器镜像资源中心',
        categoryId: 'backend',
        tags: ['docker', 'container', 'hub']
      },
      {
        id: 'be-linux-cmd',
        name: 'Linux 命令速查',
        url: 'https://wangchujiang.com/linux-command/',
        desc: '最全的 Linux 常用命令中文搜索速查手册',
        categoryId: 'backend',
        tags: ['linux', 'command', 'cheatsheet']
      },
      {
        id: 'be-k8s',
        name: 'Kubernetes',
        url: 'https://kubernetes.io/zh-cn/docs/',
        desc: '自动化容器化编排官方中文文档',
        categoryId: 'backend',
        tags: ['k8s', 'kubernetes', 'cloud-native']
      }
    ]
  },
  {
    id: 'indie',
    name: '独立开发与出海',
    icon: 'Rocket',
    items: [
      {
        id: 'indie-ph',
        name: 'Product Hunt',
        url: 'https://www.producthunt.com',
        desc: '全球最新科技产品发现与发布首选地',
        categoryId: 'indie',
        tags: ['product', 'launch', 'global']
      },
      {
        id: 'indie-supabase',
        name: 'Supabase',
        url: 'https://supabase.com',
        desc: '开源的 Firebase 替代方案，内置 Postgres',
        categoryId: 'indie',
        tags: ['database', 'backend', 'saas']
      },
      {
        id: 'indie-cloudflare',
        name: 'Cloudflare',
        url: 'https://dash.cloudflare.com',
        desc: '全球 CDN、DNS、DDoS 防御与边缘计算',
        categoryId: 'indie',
        tags: ['cdn', 'dns', 'cloud']
      },
      {
        id: 'indie-stripe',
        name: 'Stripe',
        url: 'https://stripe.com',
        desc: '全球领先的互联网支付与订阅基础设施',
        categoryId: 'indie',
        tags: ['payment', 'global', 'stripe']
      }
    ]
  },
  {
    id: 'community',
    name: '极客社区与热榜',
    icon: 'Flame',
    items: [
      {
        id: 'comm-gh-trending',
        name: 'GitHub Trending',
        url: 'https://github.com/trending',
        desc: '查看 GitHub 今日最火热的开源项目',
        categoryId: 'community',
        tags: ['github', 'trending', 'open-source']
      },
      {
        id: 'comm-v2ex',
        name: 'V2EX',
        url: 'https://www.v2ex.com',
        desc: '创意工作者与极客的交流分享社区',
        categoryId: 'community',
        tags: ['community', 'v2ex', 'geek']
      },
      {
        id: 'comm-hn',
        name: 'Hacker News',
        url: 'https://news.ycombinator.com',
        desc: 'Y Combinator 旗下极客创业与技术热点新闻',
        categoryId: 'community',
        tags: ['news', 'hn', 'startup']
      },
      {
        id: 'comm-linuxdo',
        name: 'LINUX DO',
        url: 'https://linux.do',
        desc: '高活跃度极客技术圈与资源分享论坛',
        categoryId: 'community',
        tags: ['forum', 'community', 'tech']
      }
    ]
  }
]
