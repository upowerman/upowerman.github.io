export const TOOL_ROUTES: Record<string, string> = {
  'tool-json': 'json',
  'tool-timestamp': 'timestamp',
  'tool-jwt': 'jwt',
  'tool-codec': 'codec',
  'tool-regex': 'regex',
  'tool-cron': 'cron',
  'tool-uuid': 'uuid',
  'tool-color': 'color',
  'tool-aes': 'aes',
  'tool-case': 'case',
  'tool-sql': 'sql',
  'tool-curl': 'curl'
}

const idBySlug: Record<string, string> = Object.fromEntries(
  Object.entries(TOOL_ROUTES).map(([id, slug]) => [slug, id])
)

export function toolPath(id: string): string | null {
  const slug = TOOL_ROUTES[id]
  return slug ? `/tools/${slug}/` : null
}

export function toolIdFromPath(pathname: string): string | null {
  const stripped = pathname.replace(/index\.html$/i, '').replace(/\/+$/, '')
  const m = stripped.match(/^\/tools\/([a-z0-9-]+)$/)
  return m ? (idBySlug[m[1]] ?? null) : null
}

export function legacyToolRedirect(search: string): string | null {
  const param = new URLSearchParams(search).get('tool')
  return param ? toolPath(`tool-${param}`) : null
}
