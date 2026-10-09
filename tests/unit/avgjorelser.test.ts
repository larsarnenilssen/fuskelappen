// Oversikten over avgjørelsene (avgjørelse 105): docs/avgjorelser/README.md lages fra notatene og skal være oppdatert.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lagAvgjorelserMd, lesAvgjorelse, lesNotater } from '../../scripts/lag-avgjorelser.ts';

const rot = join(__dirname, '../..');

describe('oversikten over avgjørelsene', () => {
  it('docs/avgjorelser/README.md er oppdatert (kjør «npm run avgjorelser»)', () => {
    expect(readFileSync(join(rot, 'docs/avgjorelser/README.md'), 'utf8')).toBe(lagAvgjorelserMd(lesNotater(rot)));
  });

  it('to notater har ikke samme nummer', () => {
    const numre = lesNotater(rot).map((n) => n.fil.slice(0, 3));
    expect(numre.filter((n, i) => numre.indexOf(n) !== i)).toEqual([]);
  });
});

describe('status', () => {
  const notat = (tekst: string, fil = '012-noe.md') => lesAvgjorelse({ fil, tekst: `# ${fil.slice(0, 3)} – Noe\n\n${tekst}` });

  it('gjeldende uten «Endret» eller «Erstattet»', () => {
    expect(notat('**Kontekst:** … (avgjørelse 004).\n\n**Tillegg (0.21.1):** …')).toMatchObject({ status: 'gjeldende', av: [] });
  });

  it('endret, med avgjørelsene linjene nevner', () => {
    expect(notat('**Endret 04.10.2026 (avgjørelse 056):** …\n\n**Endret 09.10.2026:** … (avgjørelse 098 og 100).')).toMatchObject({ status: 'endret', av: ['056', '098', '100'] });
    expect(notat('**Endret:** Avgjørelse 036 (0.19.0) viser …')).toMatchObject({ status: 'endret', av: ['036'] });
    expect(notat('**Endret 07.10.2026:** Årshjulet er tatt ut.')).toMatchObject({ status: 'endret', av: [] });
    expect(notat('- **Navn:** … (Erstattet i avgjørelse 014: id og adresse er nå `arbeidsplan`.)')).toMatchObject({ status: 'endret', av: ['014'] });
  });

  it('erstattet går foran endret', () => {
    expect(notat('**Erstattet av avgjørelse 055** (04.10.2026): …\n\n**Endret (eier 03.10.2026):** …', '040-ci.md')).toMatchObject({ status: 'erstattet', av: ['055'] });
  });

  it('første linje må ha samme nummer som filen', () => {
    expect(() => lesAvgjorelse({ fil: '012-noe.md', tekst: '# 013 – Noe\n' })).toThrow();
    expect(() => lesAvgjorelse({ fil: '012-noe.md', tekst: '# Noe\n' })).toThrow();
  });
});
