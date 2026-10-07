// Visningen av nøkkeltallene fra Udirs statistikkbank (avgjørelse 080): endringen fra året før, rangeringen av fylkene
// og utdanningsprogrammene i riktig rekkefølge.
import { describe, expect, it } from 'vitest';
import type { Statistikk } from '../../src/core/statistikk/skjema.ts';
import { endringPoeng, endringProsent, forrigeVerdi, fylkesnokkel, programmerFor, ranger, sisteVerdi } from '../../src/modules/statistikk/visning.ts';

const d = {
  enheter: { L: { navn: 'Hele landet' }, F46: { navn: 'Vestland' }, F11: { navn: 'Rogaland' }, F03: { navn: 'Oslo' }, F18: { navn: 'Nordland' } },
  sokere: {
    utdanningsprogram: {
      aar: [2025, 2026],
      programmer: [
        { id: 'st', navn: 'Studiespesialisering', yrkesfag: false },
        { id: 'tp', navn: 'Teknologi- og industrifag', yrkesfag: true },
        { id: 'id', navn: 'Idrettsfag', yrkesfag: false },
        { id: 'el', navn: 'Elektro og datateknologi', yrkesfag: true },
      ],
      verdier: { F46: { st: [7684, 7392], tp: [3779, 3985], id: [957, 1002], el: [2101, 2448] } },
    },
  },
} as unknown as Statistikk;

describe('visningen av nøkkeltallene', () => {
  it('finner fylket eller landet og siste og forrige verdi', () => {
    expect(fylkesnokkel('46')).toBe('F46');
    expect(fylkesnokkel(null)).toBe('L');
    expect(sisteVerdi([1, 2, 3])).toBe(3);
    expect(forrigeVerdi([1, 2, 3])).toBe(2);
    expect(forrigeVerdi([3])).toBeNull();
    expect(sisteVerdi(undefined)).toBeNull();
  });

  it('regner endringen i prosent og prosentpoeng, men ikke med skjermede tall eller fra null', () => {
    expect(endringProsent(25090, 24801)).toBe(1.2);
    expect(endringProsent(10, 0)).toBeNull();
    expect(endringProsent('*', 10)).toBeNull();
    expect(endringPoeng(84, 81.5)).toBe(2.5);
    expect(endringPoeng(null, 81.5)).toBeNull();
  });

  it('rangerer fylkene, uten landet og fylker uten tall, og like verdier får samme plass', () => {
    const r = ranger(d, { L: 79.5, F46: 84, F11: 85.6, F03: 82, F18: 84, F56: '*' });
    expect(r.map((x) => [x.enhet, x.plass])).toEqual([
      ['F11', 1],
      ['F18', 2],
      ['F46', 2],
      ['F03', 4],
    ]);
    // Fravær: lavest er best.
    expect(ranger(d, { F46: 7, F03: 5 }, true)[0]?.enhet).toBe('F03');
  });

  it('viser studieforberedende før yrkesfag, med flest søkere først i hver gruppe', () => {
    const p = programmerFor(d, 'F46');
    expect(p.map((x) => x.id)).toEqual(['st', 'id', 'tp', 'el']);
    expect(p[0]).toMatchObject({ naa: 7392, foer: 7684 });
    expect(programmerFor(d, 'F03').every((x) => x.naa === null)).toBe(true);
  });
});
