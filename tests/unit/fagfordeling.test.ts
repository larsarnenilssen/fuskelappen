// Leseren for tabellene i rundskrivet Udir-1 (scripts/udir/fagfordeling.ts) og endringsrapporten for dem.
import { describe, expect, it } from 'vitest';
import { rundskrivFraAdresse, sammenlignFagfordeling } from '../../scripts/hent-udir.ts';
import { lesTabeller, lesTimer, validerFagfordeling } from '../../scripts/udir/fagfordeling.ts';
import type { Fagfordeling } from '../../src/modules/fag/tilbud/skjema.ts';

const fordeling = `<table><caption>Tabell 17a Fag- og timefordeling på vg1</caption><tbody>
<tr><th>Omfang i timer</th><th colspan="2">vg1&nbsp;</th></tr>
<tr><th>Kolonnenummer&nbsp;</th><td>1&nbsp;</td><td>2</td></tr>
<tr><th>&nbsp;</th><td>Ordinær&nbsp;</td><td>Samisk</td></tr>
<tr><th>Norsk</th><td>&nbsp;</td><td>45</td></tr>
<tr><th>Engelsk<sup><br></sup></th><td>140&nbsp;</td><td>140</td></tr>
<tr><th>Sum fellesfag</th><td>140</td><td>185</td></tr>
<tr><th>Yrkesfaglig fordypning <sup>13</sup></th><td>168</td><td>140</td></tr>
<tr><th>Totalt omfang</th><td>308</td><td>1 325</td></tr>
</tbody></table>`;
const fagliste = `<table><caption>Tabell 22c Programfag på vg3 i skole</caption><tbody>
<tr><th>Programområde</th><th>Programfag</th><th>Timer</th></tr>
<tr><th colspan="3">Fotterapi</th></tr>
<tr><th colspan="3">Felles programfag</th></tr>
<tr><th>&nbsp;</th><td>Helse, funksjon og bevegelse</td><td>250</td></tr>
<tr><th>Biologi</th><td>Biologi 1</td><td>140</td></tr>
<tr><th></th><td>Biologi 2</td><td>140</td></tr>
</tbody></table>`;

describe('tabellene i rundskrivet', () => {
  it('leser fag- og timefordeling med kolonner, tomme celler og fotnoter', () => {
    const [t] = lesTabeller(fordeling);
    expect(t).toMatchObject({ nr: '17a', type: 'fordeling', omfang: 'vg1', kolonner: [{ nr: 1, navn: 'Ordinær' }, { nr: 2, navn: 'Samisk' }] });
    if (t?.type !== 'fordeling') throw new Error('fordeling');
    expect(t.rader.map((r) => [r.linje, ...r.timer])).toEqual([
      ['Norsk', null, 45],
      ['Engelsk', 140, 140],
      ['Sum fellesfag', 140, 185],
      ['Yrkesfaglig fordypning', 168, 140],
      ['Totalt omfang', 308, 1325],
    ]);
  });

  it('leser faglister med programområde, del og fagområde som gjelder for flere rader', () => {
    const [t] = lesTabeller(fagliste);
    if (t?.type !== 'fagliste') throw new Error('fagliste');
    expect(t.rader).toEqual([
      { gruppe: 'Fotterapi', del: 'Felles programfag', fag: 'Helse, funksjon og bevegelse', timer: 250 },
      { gruppe: 'Biologi', del: 'Felles programfag', fag: 'Biologi 1', timer: 140 },
      { gruppe: 'Biologi', del: 'Felles programfag', fag: 'Biologi 2', timer: 140 },
    ]);
  });

  it('melder summer som ikke stemmer, og for få tabeller', () => {
    const merknader = validerFagfordeling({ tabeller: lesTabeller(fordeling) } as unknown as Fagfordeling);
    expect(merknader).toContain('Tabell 17a (vg1), kolonne 2 Samisk: linjene gir 325, tabellen sier 1325.');
    expect(merknader.some((m) => m.startsWith('Fant bare 1 tabeller'))).toBe(true);
  });

  it('leser timetall med mellomrom og tomme celler', () => {
    expect(lesTimer('1 963')).toBe(1963);
    expect(lesTimer(' ')).toBeNull();
    expect(() => lesTimer('ti')).toThrow();
  });
});

describe('rundskrivet og skoleåret', () => {
  it('finner rundskrivet og skoleåret i adressen', () => {
    expect(rundskrivFraAdresse('https://www.udir.no/.../udir-1-2026/')).toEqual({ rundskriv: 'Udir-1-2026', aar: 2026, skolear: '2026-2027' });
  });

  it('viser endrede, nye og fjernede celler', () => {
    const [a] = lesTabeller(fordeling);
    if (a?.type !== 'fordeling') throw new Error('fordeling');
    const b = { ...a, rader: a.rader.map((r) => (r.linje === 'Norsk' ? { ...r, timer: [113, 45] } : r)).filter((r) => r.linje !== 'Engelsk') };
    const f = (t: typeof a) => ({ tabeller: [t] }) as unknown as Fagfordeling;
    expect(sammenlignFagfordeling(f(a), f(b))).toEqual([
      'Fjernet: Tabell 17a (vg1) · Engelsk · Ordinær (var 140)',
      'Fjernet: Tabell 17a (vg1) · Engelsk · Samisk (var 140)',
      'Endret: Tabell 17a (vg1) · Norsk · Ordinær: – → 113',
    ]);
  });
});
