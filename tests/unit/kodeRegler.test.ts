// Sjekker faste regler fra AGENTS.md som kan testes automatisk.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const rot = join(__dirname, '../..');

function filer(mappe: string, endelser: string[]): string[] {
  return readdirSync(mappe).flatMap((navn) => {
    const sti = join(mappe, navn);
    if (statSync(sti).isDirectory()) return filer(sti, endelser);
    return endelser.some((e) => navn.endsWith(e)) ? [sti] : [];
  });
}

describe('kode', () => {
  it('ingen farger utenfor tokens.css', () => {
    const farge = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\blab\(/;
    const brudd = filer(join(rot, 'src'), ['.ts', '.tsx', '.css'])
      .filter((f) => !f.endsWith('tokens.css'))
      .flatMap((f) =>
        readFileSync(f, 'utf8')
          .split('\n')
          .map((linje, i) => ({ linje, i }))
          .filter(({ linje }) => farge.test(linje) && !/^\s*(\/\/|\*)/.test(linje))
          .map(({ linje, i }) => `${relative(rot, f)}:${i + 1}: ${linje.trim()}`),
      );
    expect(brudd).toEqual([]);
  });

  it('ingen any uten begrunnet kommentar', () => {
    const brudd = filer(join(rot, 'src'), ['.ts', '.tsx']).flatMap((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .map((linje, i) => ({ linje, i, forrige: readFileSync(f, 'utf8').split('\n')[i - 1] ?? '' }))
        .filter(({ linje, forrige }) => /:\s*any\b|as any\b|<any>/.test(linje) && !/\/\/.*any/.test(forrige + linje))
        .map(({ i }) => `${relative(rot, f)}:${i + 1}`),
    );
    expect(brudd).toEqual([]);
  });

  it('appen kaller ingen eksterne tjenester', () => {
    // fetch() i src/ skal bare hente egne statiske filer (BASE_URL).
    const brudd = filer(join(rot, 'src'), ['.ts', '.tsx']).flatMap((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .map((linje, i) => ({ linje, i }))
        .filter(({ linje }) => /fetch\(/.test(linje) && !/import\.meta\.env\.BASE_URL/.test(linje))
        .map(({ i }) => `${relative(rot, f)}:${i + 1}`),
    );
    expect(brudd).toEqual([]);
  });

  it('appnavnet er definert ett sted', () => {
    const html = readFileSync(join(rot, 'index.html'), 'utf8');
    expect(html).not.toMatch(/Protokollen/);
  });
});
