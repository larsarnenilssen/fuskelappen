import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rot = join(__dirname, '../..');

function pngStorrelse(fil: string): [number, number] {
  const b = readFileSync(fil);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

describe('ikoner', () => {
  it('alle ikonfilene er laget fra ikon/ikon.svg med riktig størrelse', () => {
    expect(existsSync(join(rot, 'ikon/ikon.svg'))).toBe(true);
    const forventet: Record<string, number> = {
      'ikon-192.png': 192,
      'ikon-512.png': 512,
      'ikon-maskable-512.png': 512,
      'apple-touch-icon.png': 180,
      'favicon-32.png': 32,
    };
    for (const [fil, s] of Object.entries(forventet)) {
      expect(pngStorrelse(join(rot, 'public/ikoner', fil)), fil).toEqual([s, s]);
    }
    expect(readFileSync(join(rot, 'public/ikoner/favicon.svg'), 'utf8')).toBe(readFileSync(join(rot, 'ikon/ikon.svg'), 'utf8'));
  });
});
