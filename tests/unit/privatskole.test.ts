// Privatskoler (fase 7, avgjørelse 075): kildene i opplæringsforskrifta byttes til parallellen i
// privatskoleforskrifta, paragrafene i privatskolelova kommer med i «I regelverket», og parallellene stemmer med
// titlene i Lov og forskrift.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { lesFil } from '../../scripts/innhold/last.ts';
import { paragraferFra } from '../../src/components/kilderader.ts';
import { innstillingerSkjema } from '../../src/core/lagring/lagring.ts';
import { PRIVATSKOLEDOKUMENTER, parallellTil, privatskolekilder } from '../../src/core/privatskole.ts';
import { appRuteForLovdata } from '../../src/modules/lov/lenker.ts';
import { alleParagrafer, type Lovdokument } from '../../src/modules/lov/typer.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const paralleller = (lesFil(rot, join(rot, 'content/privatskole/paralleller.yaml')) as { paralleller: { fra: string; til: string; tittel: string; lik: boolean }[] }).paralleller;

/** Titlene på paragrafene i et dokument i data/lovdata, eller null når dokumentet ikke er hentet. */
function titler(dokument: string): Map<string, string> | null {
  const fil = join(rot, 'data/lovdata', `${dokument}.json`);
  if (!existsSync(fil)) return null;
  const d = JSON.parse(readFileSync(fil, 'utf8')) as Lovdokument;
  return new Map(alleParagrafer(d.seksjoner).map(({ paragraf }) => [paragraf.nr, paragraf.tittel]));
}

describe('privatskoler', () => {
  it('privatskolelova og forskriften er merket i utvalget', () => {
    expect([...PRIVATSKOLEDOKUMENTER].sort()).toEqual(['privatskoleforskrifta', 'privatskolelova']);
  });

  it('en kilde i opplæringsforskrifta med parallell får paragrafen i privatskoleforskrifta, uten leddet', () => {
    expect(
      privatskolekilder([
        { id: 'opplaeringsforskrifta', punkt: '§ 9-8 andre ledd', url: 'https://lovdata.no/forskrift/2024-06-03-900/§9-8' },
        { id: 'opplaeringsforskrifta', punkt: '§ 4-19' },
        { id: 'opplaeringslova', punkt: '§ 9-8' },
        { id: 'udir-merknader-ofo-kap9', punkt: 'Merknad til § 9-8' },
      ]),
    ).toEqual([
      { id: 'privatskoleforskrifta', punkt: '§ 6-8' },
      { id: 'opplaeringsforskrifta', punkt: '§ 4-19' },
      { id: 'opplaeringslova', punkt: '§ 9-8' },
      { id: 'udir-merknader-ofo-kap9', punkt: 'Merknad til § 9-8' },
    ]);
    expect(parallellTil('opplaeringsforskrifta/10-4')).toBe('privatskoleforskrifta/7-4');
    expect(parallellTil('opplaeringsforskrifta/9-56')).toBeNull();
  });

  it('ordet etter paragrafnummeret (første, andre, bokstav) blir ikke en del av nummeret', () => {
    expect(
      paragraferFra([
        { id: 'opplaeringsforskrifta', punkt: '§ 4-14 første ledd' },
        { id: 'opplaeringsforskrifta', punkt: '§ 9-8 andre ledd bokstav a' },
      ]),
    ).toEqual(['opplaeringsforskrifta/4-14', 'opplaeringsforskrifta/9-8']);
  });

  it('parallellene går fra opplæringsforskrifta til privatskoleforskrifta, og hver paragraf står én gang', () => {
    expect(paralleller.every((p) => p.fra.startsWith('opplaeringsforskrifta/') && p.til.startsWith('privatskoleforskrifta/'))).toBe(true);
    expect(new Set(paralleller.map((p) => p.fra)).size).toBe(paralleller.length);
    expect(new Set(paralleller.map((p) => p.til)).size).toBe(paralleller.length);
  });

  it('en parallell med lik tittel har samme tittel som paragrafen i opplæringsforskrifta', () => {
    const ofo = titler('opplaeringsforskrifta');
    if (!ofo) return;
    for (const p of paralleller) {
      const tittel = ofo.get(p.fra.split('/')[1] ?? '');
      expect(tittel, p.fra).toBeDefined();
      if (p.lik) expect(tittel, p.fra).toBe(p.tittel);
      else expect(tittel, p.fra).not.toBe(p.tittel);
    }
  });

  // Når kildesjekken har hentet privatskoleforskrifta, kontrolleres titlene mot teksten fra Lovdata.
  it.runIf(existsSync(join(rot, 'data/lovdata/privatskoleforskrifta.json')))('titlene stemmer med privatskoleforskrifta fra Lovdata', () => {
    const psf = titler('privatskoleforskrifta');
    for (const p of paralleller) expect(psf?.get(p.til.split('/')[1] ?? ''), p.til).toBe(p.tittel);
  });

  it.runIf(existsSync(join(rot, 'data/lovdata/privatskolelova.json')))('en kilde hos Lovdata med stor bokstav i nummeret (§ 5A-7) får lenke til paragrafen i appen', async () => {
    expect(await appRuteForLovdata('https://lovdata.no/lov/2003-07-04-84/§5A-7')).toBe('/lov/privatskolelova/5A-7');
    expect(await appRuteForLovdata('https://lovdata.no/lov/2003-07-04-84/§3-10')).toBe('/lov/privatskolelova/3-10');
  });

  it('innstillingen er valgfri, så data lagret før 0.40.0 kan leses', () => {
    const inn = { malform: 'nb', tema: 'system', fylke: null, skole: null };
    expect(innstillingerSkjema.safeParse(inn).success).toBe(true);
    expect(innstillingerSkjema.safeParse({ ...inn, privatskole: true }).success).toBe(true);
  });
});
