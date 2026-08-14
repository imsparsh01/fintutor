export function dataExportFilename(exportedAt: string): string {
  const date = exportedAt.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? `fintutor-data-${date}.json`
    : 'fintutor-data.json';
}

export function formatDataExport(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
