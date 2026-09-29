// Enhetstester for beregningene i arbeidstidsmodulen (utover fasiteksemplene).
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { finnVerdi, slaaSammen } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import {
  beregnBeskjeftigelse,
  beregnFordeling,
  beregnPeriodebeskjeftigelse,
  beregnPlanfestet,
  beregnTimevikar,
  finnRad,
  harUkontrollert,
  type Hent,
  lesArsrammer,
  lesGarantilonn,
  radNavn,
  rund,
} from '../../src/modules/arbeidstid/beregning/index.ts';
import { lesFil } from '../../scripts/innhold/last.ts';

const rot = join(__dirname, '../..');
const filer = (m: string) =>
  readdirSync(join(rot, m), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => lesFil(rot, join(rot, m, f)) as Regelsett);
const alle = slaaSammen([...filer('rules'), ...filer('tests/fixtures/regler')]);
const hent: Hent = (n) => finnVerdi(alle, n, { dato: '2026-09-29' });
const hentSkole: Hent = (n) => finnVerdi(alle, n, { dato: '2026-09-29', fylke: '46', skole: '999999999' });
const rader = lesArsrammer(hent('sfs2213.arsrammer'));
const rad = (fag: string | null, program: string, trinn: string) => {
  const r = finnRad(rader, { fag, program, trinn });
  if (!r) throw new Error(`mangler ${fag} ${program} ${trinn}`);
  return { type: 'rad' as const, rad: r };
};

describe('vedlegg 1', () => {
  it('har 151 rader for videregående med gyldige årsrammer', () => {
    expect(rader).toHaveLength(151);
    for (const r of rader) {
      // 45-minuttersenhetene er 60-minuttersenhetene × 4/3 (avrundet i vedlegget).
      expect(Math.abs(r.t45 - (r.t60 * 4) / 3), radNavn(r)).toBeLessThan(1);
    }
    expect(new Set(rader.map((r) => r.nr)).size).toBe(rader.length);
  });

  it('har unike kombinasjoner av fag, program og trinn', () => {
    const nokler = rader.map((r) => `${r.kategori}|${r.fag}|${r.program}|${r.trinn}`);
    expect(new Set(nokler).size).toBe(nokler.length);
  });
});

describe('beskjeftigelse', () => {
  it('regner om økter per uke til årstimer med 38 uker fra regelsettet', () => {
    const r = beregnBeskjeftigelse(hent, [
      { arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'okter', okterPerUke: 5, minutter: 45, uker: null } },
    ]);
    expect(r.grupper[0]?.timer.verdi).toBeCloseTo(142.5);
    expect(rund(r.sum.verdi)).toBe(27.14);
    expect(r.trinn.map((t) => t.id)).toEqual(['arstimer_fra_okter', 'beskjeftigelse']);
  });

  it('bruker stjernetillegget på laveste årsramme i en blandet gruppe', () => {
    const r = beregnBeskjeftigelse(hent, [
      { arsrammer: [rad('Kroppsøv.', 'Stud.spes', 'Vg1'), rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 12, undervisning: { type: 'arstimer', arstimer: 140 } },
    ]);
    expect(r.grupper[0]?.arsramme.verdi).toBe(577.5);
    expect(r.trinn.map((t) => t.id)).toEqual(['laveste_arsramme', 'stjernetillegg', 'beskjeftigelse']);
  });

  it('varsler når elevtall mangler for et stjernefag', () => {
    const r = beregnBeskjeftigelse(hent, [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: null, undervisning: { type: 'arstimer', arstimer: 140 } }]);
    expect(r.advarsler).toContain('mangler_elevtall');
    expect(r.grupper[0]?.arsramme.verdi).toBe(525);
  });

  it('godtar årsramme skrevet inn av brukeren', () => {
    const r = beregnBeskjeftigelse(hent, [{ arsrammer: [{ type: 'manuell', t60: 500, stjerne: false }], elever: null, undervisning: { type: 'arstimer', arstimer: 100 } }]);
    expect(r.sum.verdi).toBe(20);
    expect(r.grupper[0]?.arsramme.opprinnelse).toBe('inndata');
  });

  it('merker at verdiene ikke er kontrollert', () => {
    const r = beregnBeskjeftigelse(hent, [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'arstimer', arstimer: 140 } }]);
    expect(harUkontrollert(r.trinn)).toBe(true);
  });
});

describe('periodebeskjeftigelse', () => {
  it('bruker skoleårets dager fra regelsettet, og lokal verdi når skolen har en', () => {
    const g = [{ arsrammer: [rad('Bio', 'Stud.spes', 'Vg3')], elever: 30, undervisning: { type: 'arstimer' as const, arstimer: 30 } }];
    expect(rund(beregnPeriodebeskjeftigelse(hent, g, { dagerIPerioden: 40, dagerISkolearet: null }).sum.verdi)).toBe(28.73);
    const lokal = beregnPeriodebeskjeftigelse(hentSkole, g, { dagerIPerioden: 40, dagerISkolearet: null });
    const nokkel = lokal.trinn.find((t) => t.id === 'periodenokkel');
    expect(nokkel?.operander.dager_skolear?.oppslag?.niva).toBe('skole');
    expect(nokkel?.operander.dager_skolear?.verdi).toBe(188);
  });
});

describe('planfestet arbeidstid', () => {
  it('bruker lokal planfestet tid og merker nivået', () => {
    const r = beregnPlanfestet(hentSkole, { type: 'prosent', prosent: 0 });
    expect(r.planfestet.verdi).toBe(1050);
    const planfestet = r.trinn.find((t) => t.id === 'planfestet_ny')?.operander.planfestet;
    expect(planfestet?.oppslag?.niva).toBe('skole');
  });
});

describe('timevikar', () => {
  it('har garantilønn for fem stillingsgrupper og fem ansiennitetstrinn', () => {
    const tabell = lesGarantilonn(hent);
    expect(tabell.map((r) => r.id)).toEqual(['laerer', 'adjunkt', 'adjunkt-tillegg', 'lektor', 'lektor-tillegg']);
    for (const r of tabell) expect(Object.keys(r.lonn).map(Number)).toEqual([0, 6, 8, 10, 16]);
  });

  it('bruker 14,3 % feriepenger over 60 år og egen årslønn', () => {
    const r = beregnTimevikar(hent, {
      arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')],
      elever: 30,
      okter: 4,
      minutter: 60,
      lonn: { type: 'manuell', arslonn: 700000 },
      over60: true,
    });
    expect(rund(r.feriepenger.verdi / r.lonn.verdi, 3)).toBe(0.143);
    expect(r.timelonn.verdi).toBeCloseTo((700000 / 1687.5) * (100 / 112));
  });
});

describe('fordeling', () => {
  const grupper = [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'arstimer' as const, arstimer: 420 } }];

  it('delene summerer seg til årsverket for stillingen', () => {
    const r = beregnFordeling(hent, { undervisning: { type: 'fag', grupper }, funksjon: { type: 'arsrammetimer', timer: 28.5 }, moterPerUke: 2 });
    const sum = r.deler.reduce((s, d) => s + d.timer, 0);
    expect(sum).toBeCloseTo(r.arsverk.verdi);
    expect(r.arsverk.verdi).toBeCloseTo((1687.5 * r.stilling.verdi) / 100);
    expect(r.deler.find((d) => d.id === 'motetid')?.timer).toBe(76);
    expect(r.advarsler).toEqual([]);
  });

  it('for hel stilling med funksjon gir planfestet tid det samme som punkt 5.3', () => {
    const hel = [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'arstimer' as const, arstimer: 420 } }];
    const r = beregnFordeling(hent, { undervisning: { type: 'fag', grupper: hel }, funksjon: { type: 'prosent', prosent: 20 }, moterPerUke: 0 });
    const planfestet = r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
    expect(planfestet).toBeCloseTo(beregnPlanfestet(hent, { type: 'prosent', prosent: 20 }).planfestet.verdi);
  });

  it('kan regne ut fra stillingsprosent og årsramme i stedet for fag', () => {
    const r = beregnFordeling(hent, { undervisning: { type: 'stilling', prosent: 100, arsramme: { type: 'niva', t60: 525, t45: 700 } }, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0 });
    const del = (id: string) => r.deler.find((d) => d.id === id)?.timer;
    expect(del('undervisning')).toBe(525);
    expect(del('annen_planfestet')).toBe(625);
    expect(del('selvdisponert')).toBe(537.5);
    expect(r.arsverk.verdi).toBe(1687.5);
    expect(r.trinn.find((t) => t.id === 'arstimer_fra_stilling')?.operander.arsramme?.oppslag?.kilde.punkt).toBe('Vedlegg 1');
  });

  it('varsler når stillingen er over 100 % eller møtetiden er større enn planfestet tid', () => {
    const r = beregnFordeling(hent, { undervisning: { type: 'fag', grupper }, funksjon: { type: 'prosent', prosent: 30 }, moterPerUke: 20 });
    expect(r.advarsler).toEqual(expect.arrayContaining(['over_hel_stilling', 'motetid_for_stor']));
  });
});

describe('overtid', () => {
  it('betaler beskjeftigelse over 100 % med 1,5 × timelønn for undervisning', async () => {
    const { beregnOvertid } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const r = beregnOvertid(hent, {
      beskjeftigelse: 110,
      arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')],
      elever: 30,
      lonn: { type: 'garantilonn', stillingsgruppe: 'lektor', ansiennitet: 0 },
    });
    expect(r.overtidstimer.verdi).toBeCloseTo(52.5);
    // 52,5 timer × 1400 ÷ 525 = 140 timer kalkulert tid; × 655 800 ÷ 1687,5 × 100 ÷ 112 × 1,5.
    expect(rund(r.betaling.verdi)).toBe(rund(((140 * 655800) / 1687.5) * (100 / 112) * 1.5));
    const ingen = beregnOvertid(hent, { beskjeftigelse: 90, arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, lonn: { type: 'manuell', arslonn: 600000 } });
    expect(ingen.betaling.verdi).toBe(0);
  });

  it('fag og små klasser endrer undervisningstimene, men ikke beløpet', async () => {
    const { beregnOvertid } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const lonn = { type: 'garantilonn', stillingsgruppe: 'lektor', ansiennitet: 0 } as const;
    const engelsk = rad('Engelsk', 'Stud.spes', 'Vg1');
    const stor = beregnOvertid(hent, { beskjeftigelse: 102, arsrammer: [engelsk], elever: false, lonn });
    const liten = beregnOvertid(hent, { beskjeftigelse: 102, arsrammer: [engelsk], elever: true, lonn });
    const manuell = beregnOvertid(hent, { beskjeftigelse: 102, arsrammer: [{ type: 'manuell', t60: 607.5, stjerne: false }], elever: null, lonn });
    // 2 % av 525, 577,5 (med stjernetillegg) og 607,5 årsrammetimer.
    expect(stor.overtidstimer.verdi).toBeCloseTo(10.5);
    expect(liten.overtidstimer.verdi).toBeCloseTo(11.55);
    expect(manuell.overtidstimer.verdi).toBeCloseTo(12.15);
    // Kalkulert tid er 2 × 1400 ÷ 100 = 28 timer i alle tilfellene, og beløpet blir det samme.
    for (const r of [stor, liten, manuell]) {
      expect(r.kalkulertTid.verdi).toBeCloseTo(28);
      expect(rund(r.betaling.verdi)).toBe(14573.33);
    }
  });
});
