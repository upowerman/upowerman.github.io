export function formatJson(raw: string, indent: number = 2): { success: boolean; result: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { success: true, result: '' }
  }
  try {
    const parsed = JSON.parse(raw)
    return {
      success: true,
      result: JSON.stringify(parsed, null, indent)
    }
  } catch (err: any) {
    return {
      success: false,
      result: raw,
      error: err?.message || 'JSON 格式解析失败'
    }
  }
}

export function compressJson(raw: string): { success: boolean; result: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { success: true, result: '' }
  }
  try {
    const parsed = JSON.parse(raw)
    return {
      success: true,
      result: JSON.stringify(parsed)
    }
  } catch (err: any) {
    return {
      success: false,
      result: raw,
      error: err?.message || 'JSON 格式解析失败'
    }
  }
}
