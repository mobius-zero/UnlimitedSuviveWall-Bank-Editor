import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('privacy requirements', () => {
  test('no network client API usage in source', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const entries = fs.readdirSync(srcDir, { recursive: true }) as string[];
    const sourceFiles = entries
      .filter((entry) => entry.endsWith('.ts') || entry.endsWith('.tsx'))
      .map((entry) => path.join(srcDir, entry));

    const banned = ['fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon('];
    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const token of banned) {
        expect(content.includes(token), `${path.basename(filePath)} contains ${token}`).toBe(false);
      }
    }
  });
});
