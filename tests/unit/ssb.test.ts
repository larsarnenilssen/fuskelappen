// Tallene fra SSB (avgjørelse 090): json-stat2 leses riktig, spørringene er riktige, dataene bygges med riktige enheter
// og andeler, og den hentede filen følger skjemaet og ser ut som ventet.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bygg, endringerSsb, sporringer, TABELLER, type Tabellnavn, validerSsb } from '../../scripts/hent-ssb.ts';
import { andel, enhetFraKode, harForelopigSisteAar, kostraKode, lesJsonStat, type SsbTabell, sporring, sum } from '../../scripts/statistikk/ssb.ts';
import { type Ssb, ssbSkjema } from '../../src/core/statistikk/ssb-skjema.ts';

const rot = join(__dirname, '../..');

describe('json-stat2 fra SSB', () => {
  const svar = {
    id: ['Region', 'Kjonn', 'Tid'],
    size: [2, 1, 3],
    value: [10, 11, null, 20, 21, 22],
    dimension: {
      Region: { category: { index: { '0': 0, '46': 1 } } },
      Kjonn: { category: { index: { '0': 0 } } },
      Tid: { category: { index: ['2023', '2024', '2025'] } },
    },
    updated: '2026-08-25T06:00:00Z',
    note: ['Foreløpige tall  \nTallene for siste årgang er foreløpige.'],
  };

  it('finner verdien for kodene, med den siste dimensjonen raskest, og null der SSB ikke viser tallet', () => {
    const t = lesJsonStat(svar);
    expect(t.verdi({ Region: '0', Tid: '2023' })).toBe(10);
    expect(t.verdi({ Region: '0', Kjonn: '0', Tid: '2025' })).toBeNull();
    expect(t.verdi({ Region: '46', Tid: '2024' })).toBe(21);
    expect(t.koder('Tid')).toEqual(['2023', '2024', '2025']);
    expect(t.oppdatert).toBe('2026-08-25T06:00:00Z');
    expect(harForelopigSisteAar(t)).toBe(true);
  });

  it('leser verdiene også når de står som et objekt, og feiler på ukjente koder', () => {
    const t = lesJsonStat({ ...svar, value: { '4': 21 } });
    expect(t.verdi({ Region: '46', Tid: '2024' })).toBe(21);
    expect(t.verdi({ Region: '46', Tid: '2025' })).toBeNull();
    expect(() => t.verdi({ Region: '03', Tid: '2024' })).toThrow(/03/);
    expect(() => lesJsonStat({ feil: 'svar' })).toThrow(/json-stat2/);
  });

  it('skriver spørringen med %2B for pluss og nøklene som de er når de har klammer', () => {
    expect(sporring({ Region: ['0', '46'], Alder: ['060+'], 'codelist[Region]': 'agg_KommFylker' })).toBe('valueCodes[Region]=0,46&valueCodes[Alder]=060%2B&codelist[Region]=agg_KommFylker');
  });

  it('gjør om kodene til enhetene i appen og regner andeler og summer', () => {
    expect(enhetFraKode('0')).toBe('L');
    expect(enhetFraKode('F-46')).toBe('F46');
    expect(enhetFraKode('03')).toBe('F03');
    expect(kostraKode('L')).toBe('EAFK');
    expect(kostraKode('F03')).toBe('0300');
    expect(andel(1, 3)).toBe(33.3);
    expect(andel(1, 0)).toBeNull();
    expect(sum([null, null])).toBeNull();
    expect(sum([2, null, 3])).toBe(5);
  });

  it('spør etter de siste årene med top(n), og framskrivingen for årene skriptet gir', () => {
    const s = sporringer(['46'], ['2026', '2027']);
    expect(s.befolkning).toContain('codelist[Region]=agg_KommFylker');
    expect(s.befolkning).toContain('valueCodes[Tid]=top(11)');
    expect(s.framskriving).toContain('valueCodes[Region]=0,46');
    expect(s.framskriving).toContain('valueCodes[Tid]=2026,2027');
    expect(s.utgifter).toContain('valueCodes[KOKfylkesregion0000]=EAFK,4600');
    expect(s.laerereUtdanning).toContain('060%2B');
  });
});

/** En falsk tabell: verdien er lik for alle koder, unntatt det `f` gir. Årene står i `aar`. */
function falsk(aar: readonly string[], f: (k: Record<string, string>) => number | null): SsbTabell {
  return { verdi: f, koder: (d) => (d === 'Tid' ? [...aar] : []), oppdatert: '2026-01-01T00:00:00Z', merknader: [] };
}

describe('byggingen av dataene', () => {
  const aar = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => String(fra + i));
  const t: Record<Tabellnavn, SsbTabell> = {
    // 100 per kjønn og alder i fylket og 1000 i landet: 600 og 6000 16–18-åringer.
    befolkning: falsk(aar(2016, 2026), () => 100),
    befolkningLandet: falsk(aar(2016, 2026), () => 1000),
    // Framskrivingen har også 2026, som ikke skal tas med to ganger.
    framskriving: falsk(aar(2026, 2040), (k) => (k.Region === '0' ? 900 : 90)),
    utenforHistorikk: falsk(aar(2015, 2025), (k) => (k.HovArbStyrkStatus === 'TOT' ? 1000 : k.InnvandrKat === 'B' ? 250 : 100)),
    utenforHistorikkLandet: falsk(aar(2015, 2025), (k) => (k.HovArbStyrkStatus === 'TOT' ? 1000 : 101)),
    utenfor: falsk(['2025'], (k) => (k.ContentsCode === 'Bosatte' ? 500 : 4.3)),
    grunnskolepoeng: falsk(aar(2019, 2026), (k) => (k.Region === '46' && k.Tid === '2019' ? 0 : k.Kjonn === '11' ? 44.4 : 42.5)),
    utgifter: falsk(aar(2021, 2025), () => 215431),
    kostra: falsk(aar(2021, 2025), () => 8.1),
    laerereUtdanning: falsk(aar(2019, 2025), (k) => (k.PedagogiskUtd === '90' ? (k.Alder === '999A' ? 160 : 0) : k.Alder === '999A' ? 1000 : k.Alder === '060+' ? 140 : 100)),
    laerereKjonn: falsk(['2025'], (k) => (k.Kjonn === '2' ? (k.Kompetanse === 'FC05' ? null : 80) : 140)),
    deltakelse: falsk(aar(2020, 2025), (k) => (k.KOKinnvandringka0000 === 'J' ? 84.7 : 92.6)),
    deltakelseLandet: falsk(['2025'], (k) => (k.InnvandrKat2008 === 'B' ? 79.7 : 93)),
  };
  const d = bygg(t, ['46'], '2026-10-08T00:00:00Z');

  it('følger skjemaet og har landet og fylket', () => {
    expect(() => ssbSkjema.parse(d)).not.toThrow();
    expect(Object.keys(d.ungdomskull.verdier)).toEqual(['L', 'F46']);
  });

  it('setter sammen ungdomskullene: registrert til og med 2026 og framskrevet fra 2027', () => {
    expect(d.ungdomskull.aar[0]).toBe(2016);
    expect(d.ungdomskull.aar.at(-1)).toBe(2040);
    expect(d.ungdomskull.aar.filter((a) => a === 2026)).toHaveLength(1);
    expect(d.ungdomskull.framskrevetFra).toBe(2026);
    const i = d.ungdomskull.aar.indexOf(2026);
    expect(d.ungdomskull.verdier.F46?.[i]).toBe(600);
    expect(d.ungdomskull.verdier.F46?.[i + 1]).toBe(540);
    expect(d.ungdomskull.verdier.L?.[i]).toBe(6000);
  });

  it('regner andelene for unge utenfor, lærerne og deltakelsen', () => {
    expect(d.utenfor.prosent.F46?.at(-1)).toBe(10);
    expect(d.utenfor.prosent.L?.at(-1)).toBe(10.1);
    expect(d.utenfor.innvandrere.F46).toBe(25);
    expect(d.utenfor.antall.F46).toBe(500);
    expect(d.utenfor.alder.F46?.['15-19']).toBe(4.3);
    expect(d.laerere.antall.F46?.at(-1)).toBe(1000);
    expect(d.laerere.andel60.F46?.at(-1)).toBe(14);
    expect(d.laerere.alder.F46).toEqual({ under30: 10, fra30til49: 20, fra50til59: 10, fra60: 14 });
    expect(d.laerere.pedagogisk.F46).toBe(84);
    // Kompetansene summeres. Én mangler (null) og teller som null: 6 × 80 av 7 × 140.
    expect(d.laerere.kvinner.F46).toBe(49);
    expect(d.deltakelse.innvandringsbakgrunn.F46).toBe(84.7);
    expect(d.deltakelse.landet).toEqual({ innvandrere: 79.7, norskfodte: 93 });
  });

  it('gjør 0 grunnskolepoeng om til null (fylket fantes ikke)', () => {
    expect(d.grunnskolepoeng.poeng.F46?.[0]).toBeNull();
    expect(d.grunnskolepoeng.jenter.F46).toBe(44.4);
  });

  it('har tidspunktet for hver tabell', () => {
    expect(Object.keys(d.tabeller).sort()).toEqual([...new Set(Object.values(TABELLER))].sort());
  });

  it('finner nye årganger som endringer', () => {
    const ny: Ssb = { ...d, laerere: { ...d.laerere, aar: [...d.laerere.aar.slice(1), 2026] } };
    expect(endringerSsb(d, ny)).toEqual(['Lærerne: nye tall for 2026.']);
    expect(endringerSsb(d, d)).toEqual([]);
  });
});

describe('den hentede filen data/statistikk/ssb.json', () => {
  const fil = join(rot, 'data/statistikk/ssb.json');
  it.runIf(existsSync(fil))('følger skjemaet og har tall for landet og alle fylkene', () => {
    const d = ssbSkjema.parse(JSON.parse(readFileSync(fil, 'utf8')));
    const fylker = Object.keys(d.ungdomskull.verdier)
      .filter((k) => k !== 'L')
      .map((k) => k.slice(1));
    expect(fylker).toHaveLength(15);
    expect(validerSsb(d, fylker)).toEqual([]);
  });
});
