export function timestampToDate(ts: number, unit: 's' | 'ms' = 's'): { local: string; utc: string; iso: string; relative: string } {
  if (isNaN(ts) || typeof ts !== 'number') {
    return {
      local: '无效时间戳',
      utc: '',
      iso: '',
      relative: ''
    }
  }

  const ms = unit === 's' ? ts * 1000 : ts
  const date = new Date(ms)

  if (isNaN(date.getTime())) {
    return {
      local: '无效时间戳',
      utc: '',
      iso: '',
      relative: ''
    }
  }

  const now = Date.now()
  const diffSec = Math.round((now - ms) / 1000)
  let relative = ''
  if (Math.abs(diffSec) < 60) {
    relative = diffSec >= 0 ? `${diffSec} 秒前` : `${-diffSec} 秒后`
  } else if (Math.abs(diffSec) < 3600) {
    const mins = Math.round(diffSec / 60)
    relative = mins >= 0 ? `${mins} 分钟前` : `${-mins} 分钟后`
  } else if (Math.abs(diffSec) < 86400) {
    const hours = Math.round(diffSec / 3600)
    relative = hours >= 0 ? `${hours} 小时前` : `${-hours} 小时后`
  } else {
    const days = Math.round(diffSec / 86400)
    relative = days >= 0 ? `${days} 天前` : `${-days} 天后`
  }

  return {
    local: date.toLocaleString('zh-CN', { hour12: false }),
    utc: date.toUTCString(),
    iso: date.toISOString(),
    relative
  }
}

export function dateToTimestamp(dateStr: string): { seconds: number; milliseconds: number } {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return { seconds: 0, milliseconds: 0 }
  }
  const ms = date.getTime()
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms
  }
}
