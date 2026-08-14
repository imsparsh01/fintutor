// @ts-nocheck -- run by Node 26's built-in TS-strip test runner; Expo intentionally lacks Node types.
import assert from 'node:assert/strict';
import test from 'node:test';
import { dataExportFilename, formatDataExport } from './dataExportFormat.ts';

test('uses the backend export date in a portable JSON filename', () => {
  assert.equal(dataExportFilename('2026-08-14T10:20:30Z'), 'fintutor-data-2026-08-14.json');
});

test('falls back safely when an export has no valid timestamp', () => {
  assert.equal(dataExportFilename(''), 'fintutor-data.json');
});

test('formats readable, newline-terminated JSON without altering data', () => {
  const value = { generated_at: '2026-08-14T10:20:30Z', holdings: [{ display_name: 'My fund' }] };
  const formatted = formatDataExport(value);
  assert.equal(formatted.endsWith('\n'), true);
  assert.deepEqual(JSON.parse(formatted), value);
});
