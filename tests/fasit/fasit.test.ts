// Kjører alle fasiteksemplene mot de ekte regelfilene i rules/. Eksemplene er godkjent av eier og
// endres aldri uten eiers godkjenning. Feiler en test her, er det koden eller regelsettet som skal undersøkes.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { finnVerdi, slaaSammen } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import {
  type Arsrammevalg,
  beregnBeskjeftigelse,
  beregnPeriodebeskjeftigelse,
  beregnPlanfestet,
  beregnTimevikar,
  beregnStillingsplan,
  beregnVikarFast,
  differanseIHvertFag,
  finnRad,
  type Gruppe,
  type Hent,
  lesArsrammer,
  type Reduksjon,
  rund,
} from '../../src/modules/arbeidstid/beregning/index.ts';
import { lesFil } from '../../scripts/innhold/last.ts';

const mappe = __dirname;
const rot = join(__dirname, '../..');

function yamlFiler(dir: string): string[] {
  return readdirSync(dir).flatMap((navn) => {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) return yamlFiler(sti);
    return navn.endsWith('.yaml') ? [sti] : [];
  });
}

const regelsett = slaaSammen(yamlFiler(join(rot, 'rules')).map((f) => lesFil(rot, f) as Regelsett));

interface Fasit {
  id: string;
  beskrivelse: string;
  godkjent: { av: string; dato: string };
  kalkulator: string;
  input: Fasitinput;
  forventet: Record<string, number>;
  begrunnelse: string;
}

type Radsok = { fag: string | null; program: string; trinn: string };
type Gruppeinput = { arsrammer: Radsok[]; elever?: number | null; arstimer?: number; timer?: number };

/** Alle felt som kan stå under input (se README.md). Hver kalkulator bruker noen av dem. */
interface Fasitinput {
  dato?: string;
  grupper?: Gruppeinput[];
  dager_i_perioden?: number;
  dager_i_skolearet?: number | null;
  reduksjon?: { prosent?: number; arsrammetimer?: number };
  arsrammer?: Radsok[];
  elever?: number | null;
  okter?: number;
  minutter?: number;
  lonn?: { stillingsgruppe?: string; ansiennitet?: number; arslonn?: number };
  over60?: boolean;
  stilling?: number;
  funksjoner?: { navn?: string; prosent: number }[];
}

function krev<T>(verdi: T | undefined, navn: string): T {
  if (verdi === undefined) throw new Error(`Fasiteksempelet mangler input.${navn}`);
  return verdi;
}

function lagHent(dato: string): Hent {
  return (nokkel) => finnVerdi(regelsett, nokkel, { dato });
}

function arsrammer(hent: Hent, sok: Radsok[]): Arsrammevalg[] {
  const rader = lesArsrammer(hent('sfs2213.arsrammer'));
  return sok.map((s) => {
    const rad = finnRad(rader, { fag: s.fag ?? null, program: s.program, trinn: s.trinn });
    if (!rad) throw new Error(`Fant ikke raden ${JSON.stringify(s)} i vedlegg 1`);
    return { type: 'rad', rad };
  });
}

function grupper(hent: Hent, liste: Gruppeinput[]): Gruppe[] {
  return liste.map((g) => ({
    arsrammer: arsrammer(hent, g.arsrammer),
    elever: g.elever ?? null,
    undervisning: { type: 'arstimer', arstimer: g.arstimer ?? g.timer ?? 0 },
  }));
}

function reduksjon(r: { prosent?: number; arsrammetimer?: number }): Reduksjon {
  return r.arsrammetimer !== undefined ? { type: 'arsrammetimer', timer: r.arsrammetimer } : { type: 'prosent', prosent: r.prosent ?? 0 };
}

/** Regner ut et eksempel og gir de samme nøklene som «forventet». */
function regn(f: Fasit): Record<string, number> {
  const i = f.input;
  const hent = lagHent(i.dato ?? f.godkjent.dato);
  switch (f.kalkulator) {
    case 'beskjeftigelse': {
      const r = beregnBeskjeftigelse(hent, grupper(hent, krev(i.grupper, 'grupper')));
      return { beskjeftigelse: r.sum.verdi, arsramme: r.grupper[0]?.arsramme.verdi ?? NaN };
    }
    case 'periode': {
      const r = beregnPeriodebeskjeftigelse(hent, grupper(hent, krev(i.grupper, 'grupper')), {
        dagerIPerioden: krev(i.dager_i_perioden, 'dager_i_perioden'),
        dagerISkolearet: i.dager_i_skolearet ?? null,
      });
      return { beskjeftigelse: r.sum.verdi };
    }
    case 'planfestet': {
      const r = beregnPlanfestet(hent, reduksjon(krev(i.reduksjon, 'reduksjon')));
      return { funksjonsprosent: r.funksjonsprosent.verdi, planfestet: r.planfestet.verdi, per_uke: r.perUke.verdi, utvidelse_dager: r.utvidelseDager.verdi };
    }
    case 'vikar-fast': {
      const r = beregnVikarFast(hent, {
        arsrammer: arsrammer(hent, krev(i.arsrammer, 'arsrammer')),
        elever: i.elever ?? null,
        okter: krev(i.okter, 'okter'),
        minutter: krev(i.minutter, 'minutter'),
      });
      return { endring: r.endring.verdi };
    }
    case 'timevikar': {
      const l = krev(i.lonn, 'lonn');
      const r = beregnTimevikar(hent, {
        arsrammer: arsrammer(hent, krev(i.arsrammer, 'arsrammer')),
        elever: i.elever ?? null,
        okter: krev(i.okter, 'okter'),
        minutter: krev(i.minutter, 'minutter'),
        lonn: l.arslonn !== undefined ? { type: 'manuell', arslonn: l.arslonn } : { type: 'garantilonn', stillingsgruppe: krev(l.stillingsgruppe, 'lonn.stillingsgruppe'), ansiennitet: l.ansiennitet ?? 0 },
        over60: i.over60 ?? false,
      });
      return { kalkulert_tid: r.kalkulertTid.verdi, timelonn: r.timelonn.verdi, lonn: r.lonn.verdi, feriepenger: r.feriepenger.verdi, samlet: r.samlet.verdi };
    }
    case 'stillingsplan': {
      const r = beregnStillingsplan(hent, {
        stilling: krev(i.stilling, 'stilling'),
        grupper: grupper(hent, i.grupper ?? []),
        funksjoner: (i.funksjoner ?? []).map((fu) => ({ navn: fu.navn ?? '', prosent: fu.prosent })),
        timerIGruppe: 0,
      });
      const timer = Object.fromEntries(differanseIHvertFag(r).map((d, n) => [`timer_fag_${n + 1}`, d.timer]));
      return { undervisning: r.undervisning.verdi, beskjeftigelse: r.beskjeftigelse.verdi, differanse: r.differanse.verdi, ...timer };
    }
    default:
      throw new Error(`Ukjent kalkulator i ${f.id}: ${f.kalkulator}`);
  }
}

const eksempler = yamlFiler(mappe).map((fil) => ({ fil, fasit: parse(readFileSync(fil, 'utf8')) as Fasit }));

describe('fasit', () => {
  it('fasitmappen er beskrevet og har eksempler for SFS 2213', () => {
    expect(readdirSync(mappe)).toContain('README.md');
    expect(eksempler.filter((e) => e.fil.includes('sfs2213')).length).toBeGreaterThanOrEqual(5);
  });

  for (const { fasit } of eksempler) {
    it(`${fasit.id}: ${fasit.beskrivelse}`, () => {
      expect(fasit.godkjent.av, 'Fasiteksempler må være godkjent av eier').toBe('eier');
      const faktisk = regn(fasit);
      for (const [nokkel, forventet] of Object.entries(fasit.forventet)) {
        expect(rund(faktisk[nokkel] ?? NaN, 2), `${fasit.id} → ${nokkel}`).toBe(forventet);
      }
    });
  }
});
