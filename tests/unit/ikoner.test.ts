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

  it('logoen i topplinjen er ikonet uten bakgrunn', () => {
    const ikon = readFileSync(join(rot, 'ikon/ikon.svg'), 'utf8');
    const logo = readFileSync(join(rot, 'public/ikoner/logo.svg'), 'utf8');
    const bakgrunn = /<[a-z]+[^>]*\sid="bakgrunn"/;
    if (bakgrunn.test(ikon)) {
      expect(logo).not.toMatch(bakgrunn);
      expect(logo).not.toMatch(/viewBox="0 0 512 512"/);
    } else {
      expect(logo).toBe(ikon);
    }
  });
});
