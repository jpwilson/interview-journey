export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: readonly (keyof T)[],
): string {
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return ''
    const s = typeof val === 'string' ? val : String(val)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const header = columns.map((c) => escape(String(c))).join(',')
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(',')).join('\n')
  return body ? `${header}\n${body}\n` : `${header}\n`
}

export function csvResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
