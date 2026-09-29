// Kjører alle fasiteksemplene. Kalkulatorene kobles inn fra fase 1.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const mappe = __dirname;

function eksempler(dir: string): string[] {
  return readdirSync(dir).flatMap((navn) => {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) return eksempler(sti);
    return navn.endsWith('.yaml') ? [sti] : [];
  });
}

describe('fasit', () => {
  it('fasitmappen finnes og er beskrevet', () => {
    expect(existsSync(join(mappe, 'README.md'))).toBe(true);
  });

  it('fase 0 har ingen fasiteksempler ennå', () => {
    // Når eksempler legges inn i fase 1, erstattes denne testen av en som kjører dem.
    expect(eksempler(mappe)).toEqual([]);
  });
});
