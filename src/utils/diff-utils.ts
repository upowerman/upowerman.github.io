import { diffLines, createPatch } from 'diff'

export interface DiffLineItem {
  type: 'added' | 'removed' | 'unchanged'
  value: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface SplitDiffRow {
  left?: { lineNum: number; text: string; type: 'removed' | 'unchanged' | 'empty' }
  right?: { lineNum: number; text: string; type: 'added' | 'unchanged' | 'empty' }
}

export function computeLineDiff(
  oldText: string,
  newText: string,
  options: { ignoreWhitespace?: boolean } = {}
): DiffLineItem[] {
  if (!oldText && !newText) return []

  const normalizedOld = oldText ? (oldText.endsWith('\n') ? oldText : oldText + '\n') : ''
  const normalizedNew = newText ? (newText.endsWith('\n') ? newText : newText + '\n') : ''

  const changes = diffLines(normalizedOld, normalizedNew, {
    ignoreWhitespace: options.ignoreWhitespace
  })

  const result: DiffLineItem[] = []
  let oldLine = 1
  let newLine = 1

  for (const part of changes) {
    // 拆解换行
    let lines = part.value.split('\n')
    if (lines.length > 0 && lines[lines.length - 1] === '') {
      lines = lines.slice(0, -1)
    }

    for (const line of lines) {
      if (part.added) {
        result.push({
          type: 'added',
          value: line,
          newLineNumber: newLine++
        })
      } else if (part.removed) {
        result.push({
          type: 'removed',
          value: line,
          oldLineNumber: oldLine++
        })
      } else {
        result.push({
          type: 'unchanged',
          value: line,
          oldLineNumber: oldLine++,
          newLineNumber: newLine++
        })
      }
    }
  }

  return result
}

export function computeUnifiedPatch(fileName: string, oldText: string, newText: string): string {
  return createPatch(fileName, oldText, newText, 'a/' + fileName, 'b/' + fileName)
}
