// Søk og filter i fagene (src/modules/fag/oppslag.ts), på de ekte dataene fra Grep.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { filterFraAdresse, filterTilAdresse, filtervalg, filtrerFag, programmerFor, tekstpoeng, tomtFilter, udirLenke, vurderingsmerker } from '../../src/modules/fag/oppslag.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const indeks = JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')) as Fagindeks;
const koder = (f: Partial<typeof tomtFilter>) => filtrerFag(indeks, { ...tomtFilter, ...f }).map((t) => t.kode);

describe('fagsøket', () => {
  it('finner fagkoden først ved eksakt kode, og tåler små bokstaver', () => {
    expect(koder({ tekst: 'hea2005' })[0]).toBe('HEA2005');
    expect(koder({ tekst: 'REA30' }).every((k) => k.startsWith('REA30'))).toBe(true);
  });

  it('søker i fagnavn på bokmål og nynorsk', () => {
    expect(koder({ tekst: 'helsefremmende arbeid' })).toContain('HEA2005');
    expect(koder({ tekst: 'helsefremjande' })).toContain('HEA2005');
    expect(koder({ tekst: 'biologi 2' })).toContain('REA3036');
  });

  it('gir ingen treff når et ord ikke passer', () => {
    expect(koder({ tekst: 'norsk xyzxyz' })).toEqual([]);
    const fag = indeks.fag.NOR1260;
    expect(fag && tekstpoeng('NOR1260', fag, '')).toBe(1);
  });

  it('filtrerer på utdanningsprogram, trinn, fagtype, vurdering, eksamensform og årstimer', () => {
    const hs = koder({ program: 'HS', trinn: 'Vg2', type: 'felles_programfag' });
    expect(hs).toContain('HEA2005');
    expect(hs.every((k) => indeks.fag[k]?.trinn.includes('Vg2') && indeks.fag[k]?.type === 'felles_programfag')).toBe(true);
    expect(koder({ timer: '197' }).every((k) => indeks.fag[k]?.timer === 197)).toBe(true);
    expect(koder({ vurdering: 'standpunkt', tekst: 'biologi 2' })).toContain('REA3036');
    expect(koder({ eksamensform: 'eksamensform_6' }).every((k) => indeks.fag[k]?.elev?.eksamensform === 'eksamensform_6')).toBe(true);
    expect(koder({ program: 'ST', tekst: 'helsefremmende arbeid' })).not.toContain('HEA2005');
  });

  it('har filtervalg fra dataene', () => {
    const v = filtervalg(indeks);
    expect(v.program).toEqual(expect.arrayContaining(['ST', 'HS', 'PB']));
    expect(v.trinn).toEqual(['Vg1', 'Vg2', 'Vg3', 'Bedrift']);
    expect(v.vurdering[0]).toBe('standpunkt');
    expect(v.timer).toContain(140);
    const fag = indeks.fag.REA3036;
    if (fag) {
      expect(programmerFor(indeks, fag)).toEqual(['ST']);
      expect(vurderingsmerker(fag)).toEqual(['standpunkt', 'trekkordning_2']);
    }
  });

  it('holder søk og filter i adressen', () => {
    const f = { ...tomtFilter, tekst: 'norsk', program: 'ST', timer: '113' };
    const adresse = new URLSearchParams(filterTilAdresse(f));
    expect(adresse.toString()).toBe('q=norsk&program=ST&timer=113');
    expect(filterFraAdresse(adresse)).toEqual(f);
  });

  it('lenker til læreplanen og kompetansemålene på udir.no', () => {
    expect(udirLenke('HEA02-04')).toBe('https://www.udir.no/lk20/hea02-04');
    expect(udirLenke('HEA02-04', 'KV366')).toBe('https://www.udir.no/lk20/hea02-04/kompetansemaal-og-vurdering/kv366');
  });
});
