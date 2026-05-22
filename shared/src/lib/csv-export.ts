export type CsvColumn = { key: string; header: string };

function escapeCell(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build CSV text from rows and column definitions */
export function rowsToCsv(rows: Record<string, unknown>[], columns: CsvColumn[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(','),
  );
  return [header, ...body].join('\r\n');
}

/** Trigger browser download of a CSV file */
export function downloadCsv(
  rows: Record<string, unknown>[],
  columns: CsvColumn[],
  filename: string,
): void {
  const csv = rowsToCsv(rows, columns);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
