// Lokale regler (fase 9, avgjørelse 093): oppslaget, hvilke regler som gjelder, filen som publiseres, innmeldingen og
// lagringen.
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { egneRegler, migrer, standard } from '../../src/core/lagring/lagring.ts';
import { innmelding, nyKode } from '../../src/core/lokale/innmelding.ts';
import { aktiveEgne, egenstatus, finnFeil, lagPublisert, lokaleVerdier, reglerForTema } from '../../src/core/lokale/regler.ts';
import { type EgenRegel, egenRegelSkjema, type GodkjentRegel, kodeSkjema } from '../../src/core/lokale/skjema.ts';
import { finnVerdi, type LokalVerdi } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';

const regelsett: Regelsett[] = [
  {
    id: 'sfs-test',
    regelverk: 'sfs2213',
    gyldig_fra: '2026-01-01',
    gyldig_til: '2027-12-31',
    kilde: 'ks-sfs2213-avtaletekst',
    gyldighet: { niva: 'nasjonal' },
    verdier: {
      planfestet_timer: { verdi: 1150, enhet: 'timer', kilde: { id: 'ks-sfs2213-avtaletekst', punkt: '5.1' }, kontrollert: null, lokal: true },
    },
  },
];

const egen = (del: Partial<EgenRegel> = {}): EgenRegel => ({
  kode: 'LR-AAAA',
  tema: 'arbeidstid',
  type: 'verdi',
  niva: 'skole',
  fylke: '46',
  skole: '974624486',
  stedsnavn: 'Slåtthaug vgs',
  nokkel: 'sfs2213.planfestet_timer',
  verdi: 1100,
  lagtInn: '2026-10-08',
  ...del,
});

const godkjent = (del: Partial<GodkjentRegel> = {}): GodkjentRegel => ({
  kode: 'LR-BBBB',
  tema: 'arbeidstid',
  type: 'verdi',
  niva: 'skole',
  fylke: '46',
  skole: '974624486',
  stedsnavn: 'Slåtthaug vgs',
  nokkel: 'sfs2213.planfestet_timer',
  verdi: 1125,
  kilde: { navn: 'Lokal avtale om arbeidstid', offentlig: false },
  meldt_inn: '2026-10-01',
  kontrollert: { dato: '2026-10-03' },
  ...del,
});

const sted = { fylke: '46', skole: '974624486' };
const dato = '2026-10-08';

describe('oppslaget med lokale verdier', () => {
  const lokal = (del: Partial<LokalVerdi>): LokalVerdi => ({
    nokkel: 'sfs2213.planfestet_timer',
    verdi: 1100,
    niva: 'skole',
    fylke: '46',
    skole: '974624486',
    egen: false,
    kode: 'LR-CCCC',
    kontrollert: '2026-10-03',
    stedsnavn: 'Slåtthaug vgs',
    ...del,
  });

  it('bruker den nasjonale verdien uten lokale verdier', () => {
    expect(finnVerdi(regelsett, 'sfs2213.planfestet_timer', { dato, ...sted }).verdi).toBe(1150);
  });

  it('egne verdier går foran godkjente, og skolen foran fylket', () => {
    const lokale = [lokal({ niva: 'fylke', skole: null, verdi: 1000, kode: 'LR-DDDD' }), lokal({ verdi: 1100 }), lokal({ egen: true, verdi: 1050, kode: 'LR-EEEE', kontrollert: null })];
    const o = finnVerdi(regelsett, 'sfs2213.planfestet_timer', { dato, ...sted, lokale });
    expect(o.verdi).toBe(1050);
    expect(o.lokal?.egen).toBe(true);
    expect(o.kontrollert).toBeNull();
    expect(finnVerdi(regelsett, 'sfs2213.planfestet_timer', { dato, ...sted, lokale: lokale.slice(0, 2) }).verdi).toBe(1100);
    expect(finnVerdi(regelsett, 'sfs2213.planfestet_timer', { dato, ...sted, lokale: lokale.slice(0, 1) }).verdi).toBe(1000);
  });

  it('beholder enheten og kilden til den nasjonale verdien, og nivået til den lokale', () => {
    const o = finnVerdi(regelsett, 'sfs2213.planfestet_timer', { dato, ...sted, lokale: [lokal({})] });
    expect(o).toMatchObject({ enhet: 'timer', niva: 'skole', kilde: { id: 'ks-sfs2213-avtaletekst', punkt: '5.1' }, kontrollert: { dato: '2026-10-03' } });
  });

  it('bruker ikke verdier for et annet fylke eller en annen skole', () => {
    const lokale = [lokal({ skole: '999' }), lokal({ niva: 'fylke', fylke: '03', skole: null })];
    expect(finnVerdi(regelsett, 'sfs2213.planfestet_timer', { dato, ...sted, lokale }).verdi).toBe(1150);
  });
});

describe('hvilke lokale regler som gjelder', () => {
  it('egne regler gjelder for stedet og innenfor datoene', () => {
    const egne = [egen(), egen({ kode: 'LR-FFFF', skole: '999' }), egen({ kode: 'LR-GGGG', gjelderTil: '2026-07-31' }), egen({ kode: 'LR-HHHH', gjelderFra: '2027-01-01' })];
    expect(aktiveEgne(egne, [], sted, dato).map((e) => e.kode)).toEqual(['LR-AAAA']);
    expect(egenstatus(egne[2]!, [], dato)).toBe('utlopt');
  });

  it('en egen regel med samme kode som en godkjent, er byttet ut', () => {
    const g = lagPublisert([godkjent({ kode: 'LR-AAAA' })]).regler;
    expect(egenstatus(egen(), g, dato)).toBe('godkjent');
    expect(lokaleVerdier([egen()], g, sted, dato)).toEqual([expect.objectContaining({ egen: false, kode: 'LR-AAAA' })]);
  });

  it('en egen endring av en godkjent regel gjelder i stedet for den godkjente', () => {
    const g = lagPublisert([godkjent()]).regler;
    expect(lokaleVerdier([], g, sted, dato).map((v) => v.verdi)).toEqual([1125]);
    const verdier = lokaleVerdier([egen({ endrer: 'LR-BBBB' })], g, sted, dato);
    expect(verdier.map((v) => [v.verdi, v.egen])).toEqual([[1100, true]]);
  });

  it('reglene på siden for et tema, skolen før fylket', () => {
    const tekst = { nb: 'Tekst', nn: 'Tekst' };
    const g = lagPublisert([
      godkjent({ kode: 'LR-JJJJ', type: 'regel', tema: 'eksamen', niva: 'fylke', skole: null, nokkel: undefined, verdi: undefined, tittel: tekst, tekst }),
      godkjent({ kode: 'LR-KKKK', type: 'regel', tema: 'eksamen', nokkel: undefined, verdi: undefined, tittel: tekst, tekst }),
      godkjent({ kode: 'LR-LLLL', type: 'regel', tema: 'inntak', nokkel: undefined, verdi: undefined, tittel: tekst, tekst }),
    ]).regler;
    const r = reglerForTema('eksamen', [egen({ type: 'regel', tema: 'eksamen', tittel: 'Min', tekst: 'Regel' })], g, sted, dato);
    expect(r.godkjente.map((x) => x.kode)).toEqual(['LR-KKKK', 'LR-JJJJ']);
    expect(r.egne.map((x) => x.kode)).toEqual(['LR-AAAA']);
  });
});

describe('filen som publiseres', () => {
  it('har bare kontrollerte regler, uten kontrollspørsmål og uten regler som er erstattet', () => {
    const fil = lagPublisert([
      godkjent({ kontrollsporsmal: ['Stemmer tallet?'] }),
      godkjent({ kode: 'LR-MMMM', kontrollert: null }),
      godkjent({ kode: 'LR-NNNN', endrer: 'LR-BBBB' }),
    ]);
    expect(fil.regler.map((r) => r.kode)).toEqual(['LR-NNNN']);
    expect(lagPublisert([godkjent({ kontrollsporsmal: ['?'] })]).regler[0]).not.toHaveProperty('kontrollsporsmal');
  });

  it('finner feil som skjemaet ikke fanger', () => {
    const kjente = new Set(['sfs2213.planfestet_timer']);
    expect(finnFeil([godkjent()], kjente)).toEqual([]);
    expect(finnFeil([godkjent(), godkjent()], kjente)).toHaveLength(1);
    expect(finnFeil([godkjent({ nokkel: 'sfs2213.arsverk_timer' })], kjente)[0]).toMatch(/lokal: true/);
    expect(finnFeil([godkjent({ type: 'regel', tittel: undefined })], kjente)[0]).toMatch(/tittel og tekst/);
    expect(finnFeil([godkjent({ kilde: { navn: 'Avtale', offentlig: false, url: 'https://x.no' } })], kjente)[0]).toMatch(/ingen lenke/);
    expect(finnFeil([godkjent({ kilde: { navn: 'Side', offentlig: true } })], kjente)[0]).toMatch(/trenger lenke/);
    expect(finnFeil([godkjent({ niva: 'fylke' })], kjente)[0]).toMatch(/skole: null/);
  });
});

describe('innmeldingen', () => {
  it('koden har bare tegn som ikke kan forveksles', () => {
    for (let i = 0; i < 50; i++) expect(kodeSkjema.safeParse(nyKode()).success).toBe(true);
    expect(nyKode(() => 0)).toBe('LR-AAAA');
  });

  it('er gyldig YAML med regelen i fast form', () => {
    const regel = egen({ type: 'regel', nokkel: undefined, verdi: undefined, tema: 'skoleregler', tittel: 'Mobil «i hylla»', tekst: 'Linje 1\n\nLinje 2: "sitat"', lenke: 'https://example.no', innmeldt: '2026-10-08' });
    const lest = parse(innmelding(regel, { fylkesnavn: 'Vestland', nasjonal: null }, 'nb', '0.46.0', dato).join('\n')) as { lokal_regel: Record<string, unknown> };
    expect(lest.lokal_regel).toMatchObject({ kode: 'LR-AAAA', tema: 'skoleregler', type: 'regel', niva: 'skole', fylke: '46', skole: '974624486', tittel: 'Mobil «i hylla»', tekst: 'Linje 1\n\nLinje 2: "sitat"', meldt_inn: '2026-10-08' });
  });

  it('har verdien og den nasjonale verdien for et tall', () => {
    const lest = parse(innmelding(egen(), { fylkesnavn: 'Vestland', nasjonal: '1150' }, 'nb', '0.46.0', dato).join('\n')) as { lokal_regel: Record<string, unknown> };
    expect(lest.lokal_regel).toMatchObject({ nokkel: 'sfs2213.planfestet_timer', verdi: 1100, nasjonal_verdi: 1150 });
  });
});

describe('lagringen', () => {
  it('leser data uten egne regler, fra før fase 9', () => {
    const data = migrer(standard());
    expect(data).not.toBeNull();
    expect(egneRegler(data!)).toEqual([]);
  });

  it('hopper over ugyldige regler uten å forkaste resten av lagringen', () => {
    const data = migrer({ ...standard(), egneRegler: [egen(), { kode: 'feil' }] });
    expect(data?.favoritter).toEqual([]);
    expect(egneRegler(data!).map((r) => r.kode)).toEqual(['LR-AAAA']);
    expect(egenRegelSkjema.safeParse(egen()).success).toBe(true);
  });
});
