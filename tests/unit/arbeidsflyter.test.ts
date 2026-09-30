// Arbeidsflytene i .github/workflows: det som må stemme med resten av repoet.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rot = join(__dirname, '../..');

describe('arbeidsflyter', () => {
  it('CI bruker Playwright-bildet med samme versjon som @playwright/test', () => {
    const lock = JSON.parse(readFileSync(join(rot, 'package-lock.json'), 'utf8')) as { packages: Record<string, { version?: string }> };
    const versjon = lock.packages['node_modules/@playwright/test']?.version;
    const ci = readFileSync(join(rot, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).toContain(`image: mcr.microsoft.com/playwright:v${versjon}-noble`);
  });
});
