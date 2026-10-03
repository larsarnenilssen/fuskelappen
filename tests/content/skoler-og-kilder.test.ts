// Dataene fra utdanning.no, VIGO, NOR og NDLA i data/ (avgjørelse 053): form, omfang og sammenheng med Grep,
// skoleregisteret og fylkene i appen.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { validerNdla } from '../../scripts/ndla/bygg.ts';
import { validerOpplaeringskontor } from '../../scripts/nor/bygg.ts';
import { validerSkoler, validerYrker } from '../../scripts/utdanning/bygg.ts';
import { ndlaSkjema } from '../../src/modules/fag/ndla/skjema.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { skolerSkjema, yrkerSkjema } from '../../src/modules/fag/utdanning/skjema.ts';
import { skolenummerSkjema } from '../../src/modules/fag/vigo/skjema.ts';
import { opplaeringskontorerSkjema } from '../../src/modules/opplaeringslop/nor/skjema.ts';
import { kobleSkoler } from '../../src/modules/opplaeringslop/skoler.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const tekst = (f: string) => readFileSync(join(rot, f), 'utf8');
const les = (f: string) => JSON.parse(tekst(f)) as unknown;
const indeks = les('data/grep/fagindeks.json') as Fagindeks;
const skoler = skolerSkjema.parse(les('data/utdanning/skoler.json'));
const yrker = yrkerSkjema.parse(les('data/utdanning/yrker.json'));
const nummer = skolenummerSkjema.parse(les('data/vigo/skolenummer.json'));
const kontor = opplaeringskontorerSkjema.parse(les('data/udir/opplaeringskontor.json'));
const ndla = ndlaSkjema.parse(les('data/ndla/fag.json'));
const nsr = (les('data/skoler/vgs.json') as { skoler: { id: string }[] }).skoler;
const fylker = new Set((parse(tekst('content/fylker.yaml')) as { fylker: { nummer: string }[] }).fylker.map((f) => f.nummer));

describe('skolene og tilbudene fra utdanning.no', () => {
  it('har riktig form og omfang', () => {
    expect(validerSkoler(skoler)).toEqual([]);
  });

  it('bruker bare programområder i Grep og fylkene i appen', () => {
    for (const s of skoler.skoler) {
      expect(fylker.has(s.fylke), s.navn).toBe(true);
      for (const k of s.tilbud) expect(indeks.programomrader[k], `${s.navn}: ${k}`).toBeDefined();
    }
  });

  it('kobler de fleste skolene til skoleregisteret, som skolen i innstillingene velges fra', () => {
    const iNsr = new Set(nsr.map((s) => s.id));
    const koblet = kobleSkoler(skoler.skoler, nummer.orgnr).filter((s) => s.orgnr && iNsr.has(s.orgnr));
    expect(koblet.length / skoler.skoler.filter((s) => s.nr).length).toBeGreaterThan(0.9);
  });
});

describe('skolenummeret fra VIGO', () => {
  it('har bare numre, ingen navn eller kontaktinformasjon', () => {
    expect(Object.keys(nummer.orgnr).length).toBeGreaterThan(300);
    // Skjemaet er strengt: filen har bare kilde, tidspunkt og numrene.
    for (const [nr, org] of Object.entries(nummer.orgnr)) expect(`${nr} ${org}`).toMatch(/^\d{5} \d{9}$/);
  });
});

describe('yrkene fra utdanning.no', () => {
  it('har riktig form og omfang', () => {
    expect(validerYrker(yrker)).toEqual([]);
  });

  it('har yrker for de fleste lærefagene i Grep', () => {
    const laerefag = Object.entries(indeks.programomrader).filter(([, p]) => p.sted === 'bedrift').map(([k]) => k);
    expect(laerefag.filter((k) => yrker.programomrader[k]).length / laerefag.length).toBeGreaterThan(0.85);
  });
});

describe('opplæringskontorene fra NOR', () => {
  it('har riktig form og omfang, og er godkjent i fylkene i appen', () => {
    expect(validerOpplaeringskontor(kontor)).toEqual([]);
    for (const k of kontor.kontor) for (const f of k.godkjentI) expect(fylker.has(f), `${k.navn}: ${f}`).toBe(true);
  });
});

describe('fagene på NDLA', () => {
  it('har riktig form og omfang, og bare fagkoder i fagindeksen', () => {
    expect(validerNdla(ndla)).toEqual([]);
    for (const k of Object.keys(ndla.fag)) expect(indeks.fag[k], k).toBeDefined();
  });
});
