export interface NavItem {
  id: string
  name: string
  url: string
  desc: string
  icon?: string
  categoryId: string
  tags: string[]
}

export interface NavCategory {
  id: string
  name: string
  icon: string
  items: NavItem[]
}

export interface ToolItem {
  id: string
  name: string
  desc: string
  icon: string
  category: string
  keywords: string[]
}

export type SearchEngineType = 'google' | 'baidu' | 'github' | 'bing'
export type ViewTabType = 'all' | 'nav' | 'tools' | 'pinned'
