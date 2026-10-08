// Meldingen om ny versjon (avgjørelse 088): punktene i content/versjoner.yaml, versjon.json og når meldingen vises.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesFil } from '../../scripts/innhold/last.ts';
import { lagVersjonsfil, lesVersjonsfil, sammenlignVersjon, vurderOppdatering, type Versjonsomtale } from '../../src/core/versjon/versjoner.ts';

const rot = join(__dirname, '../..');
const pakke = JSON.parse(readFileSync(join(rot, 'package.json'), 'utf8')) as { version: string };
const { versjoner } = lesFil(rot, join(rot, 'content/versjoner.yaml')) as { versjoner: Versjonsomtale[] };

describe('content/versjoner.yaml', () => {
  it('har punktene for versjonen i package.json (skrives i versjons-PR-en)', () => {
    expect(versjoner.map((v) => v.versjon)).toContain(pakke.version);
  });

  it('har nyeste versjon øverst og hver versjon én gang', () => {
    const nr = versjoner.map((v) => v.versjon);
    expect(new Set(nr).size).toBe(nr.length);
    expect([...nr].sort((a, b) => sammenlignVersjon(b, a))).toEqual(nr);
  });
});

describe('versjon.json', () => {
  const omtale: Versjonsomtale[] = [{ versjon: '1.2.0', dato: '2026-10-08', nytt: [{ nb: 'Nytt', nn: 'Nytt nn' }] }];

  it('har punktene på begge målformer, eller null uten omtale', () => {
    expect(lagVersjonsfil(omtale, '1.2.0')).toEqual({ versjon: '1.2.0', nytt: { nb: ['Nytt'], nn: ['Nytt nn'] } });
    expect(lagVersjonsfil(omtale, '1.3.0')).toEqual({ versjon: '1.3.0', nytt: null });
  });

  it('leses tilbake, og annet innhold gir null', () => {
    const fil = lagVersjonsfil(omtale, '1.2.0');
    expect(lesVersjonsfil(JSON.parse(JSON.stringify(fil)))).toEqual(fil);
    expect(lesVersjonsfil({ versjon: '1.3.0', nytt: null })).toEqual({ versjon: '1.3.0', nytt: null });
    for (const feil of [null, 'tekst', {}, { versjon: 1 }, { versjon: '1.0.0', nytt: { nb: [1], nn: [] } }]) expect(lesVersjonsfil(feil)).toBeNull();
  });
});

describe('når meldingen vises (eier 08.10.2026)', () => {
  const fil = (versjon: string) => ({ versjon, nytt: { nb: ['Nytt'], nn: ['Nytt'] } });

  it('sammenligner versjonsnumre som tall', () => {
    expect(sammenlignVersjon('0.43.0', '0.43.0')).toBe(0);
    expect(sammenlignVersjon('0.44.0', '0.43.0')).toBeGreaterThan(0);
    expect(sammenlignVersjon('0.9.0', '0.10.0')).toBeLessThan(0);
    expect(sammenlignVersjon('1.0.0', '0.99.9')).toBeGreaterThan(0);
  });

  it('bare nye data (samme versjon): ingen melding', () => {
    expect(vurderOppdatering(fil('0.43.0'), '0.43.0')).toEqual({ type: 'stille' });
  });

  it('ny versjon: melding med punktene', () => {
    expect(vurderOppdatering(fil('0.44.0'), '0.43.0')).toEqual({ type: 'melding', versjon: '0.44.0', nytt: fil('0.44.0').nytt });
  });

  it('versjon.json mangler eller er eldre enn appen: melding uten punkter', () => {
    expect(vurderOppdatering(null, '0.43.0')).toEqual({ type: 'melding', versjon: null, nytt: null });
    expect(vurderOppdatering(fil('0.42.0'), '0.43.0')).toEqual({ type: 'melding', versjon: null, nytt: null });
  });
});
