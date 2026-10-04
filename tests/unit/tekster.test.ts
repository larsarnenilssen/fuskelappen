import { describe, expect, it } from 'vitest';
import { fyllInn, hentTekst, visTekst } from '../../src/core/i18n/tekst.ts';
import { nb } from '../../src/strings/nb.ts';
import { nn } from '../../src/strings/nn.ts';

function nokler(objekt: object, prefiks = ''): string[] {
  return Object.entries(objekt).flatMap(([k, v]) =>
    typeof v === 'string' ? [`${prefiks}${k}`] : nokler(v as object, `${prefiks}${k}.`),
  );
}

describe('UI-tekster', () => {
  it('bokmål og nynorsk har nøyaktig de samme nøklene', () => {
    expect(nokler(nn).sort()).toEqual(nokler(nb).sort());
  });

  it('ingen tekst er tom', () => {
    for (const tabell of [nb, nn]) {
      for (const nokkel of nokler(tabell)) {
        expect(hentTekst(tabell === nb ? 'nb' : 'nn', nokkel as never).trim(), nokkel).not.toBe('');
      }
    }
  });

  it('plassholdere er de samme i nb og nn', () => {
    for (const nokkel of nokler(nb)) {
      const plass = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(plass(hentTekst('nn', nokkel as never)), nokkel).toEqual(plass(hentTekst('nb', nokkel as never)));
    }
  });

  it('fyller inn verdier', () => {
    expect(fyllInn('{antall} treff', { antall: 3 })).toBe('3 treff');
    expect(fyllInn('Hei {navn}', {})).toBe('Hei {navn}');
    expect(hentTekst('nn', 'sok.ingenTreff', { sok: 'skule' })).toBe('Ingen treff på «skule».');
  });

  it('viser tekst fra nøkkel eller fra innhold', () => {
    expect(visTekst('nav.innstillinger', 'nn')).toBe('Innstillingar');
    expect(visTekst({ nb: 'skole', nn: 'skule' }, 'nn')).toBe('skule');
  });
});
