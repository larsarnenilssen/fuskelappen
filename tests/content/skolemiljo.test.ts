// Skolemiljø (fase 7): paragrafene i kortene om skolereglene finnes i Lov og forskrift, hvert fylke med skoleregler i
// Lovdata har et kort med paragrafene om reaksjoner og saksbehandling, og hvert fylke har bare ett slikt kort.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import { alleParagrafer, type Lovdokument, type Lovoversikt } from '../../src/modules/lov/typer.ts';

const rot = join(__dirname, '../..');
const alle = lesInnhold(rot).map((x) => x.element);
const kortene = alle.filter((e) => e.id.startsWith('sr-'));
const fylkeskort = kortene.filter((e) => e.id.startsWith('sr-fylke-'));
const mappe = join(rot, 'data/lovdata');

function paragrafFinnes(ref: string): boolean {
  const [dok, nr] = ref.split('/');
  const fil = join(mappe, `${dok}.json`);
  if (!existsSync(fil)) return false;
  const d = JSON.parse(readFileSync(fil, 'utf8')) as Lovdokument;
  return alleParagrafer(d.seksjoner).some(({ paragraf }) => paragraf.nr === nr);
}

describe('skolereglene', () => {
  it.runIf(existsSync(join(mappe, 'oversikt.json')))('paragrafene i kortene finnes i Lov og forskrift', () => {
    const feil = kortene.flatMap((e) => ('paragrafer' in e ? (e.paragrafer ?? []) : []).filter((p) => !paragrafFinnes(p)).map((p) => `${e.id}: ${p}`));
    expect(feil).toEqual([]);
  });

  it.runIf(existsSync(join(mappe, 'oversikt.json')))('hvert fylke med skoleregler i Lovdata har ett kort med paragrafene fra sine egne skoleregler', () => {
    const oversikt = JSON.parse(readFileSync(join(mappe, 'oversikt.json'), 'utf8')) as Lovoversikt;
    const regler = oversikt.dokumenter.filter((d) => d.lokaltype === 'skoleregler' && d.gyldighet.niva === 'fylke');
    for (const d of regler) {
      const fylke = d.gyldighet.niva === 'fylke' ? d.gyldighet.fylke : '';
      const kort = fylkeskort.filter((e) => e.gyldighet.niva === 'fylke' && e.gyldighet.fylke === fylke);
      expect(kort.length, fylke).toBe(1);
      const paragrafer = kort[0] && 'paragrafer' in kort[0] ? (kort[0].paragrafer ?? []) : [];
      expect(paragrafer.length, fylke).toBeGreaterThan(0);
      expect(paragrafer.every((p) => p.startsWith(`${d.id}/`)), fylke).toBe(true);
    }
  });
});
