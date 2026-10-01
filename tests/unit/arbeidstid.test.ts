// Enhetstester for beregningene i arbeidstidsmodulen (utover fasiteksemplene).
import { readdirSync, readFileSync } from 'node:fs';
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
  type Hent,
  lesArsrammer,
  lesGarantilonn,
  radNavn,
  rund,
  unikeFag,
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

  it('regner ut ukene fra dagene i perioden når antall uker ikke er oppgitt, og varsler', () => {
    const okter = (uker: number | null) => [
      { arsrammer: [rad('Bio', 'Stud.spes', 'Vg3')], elever: 30, undervisning: { type: 'okter' as const, okterPerUke: 3, minutter: 60, uker } },
    ];
    // 40 dager ÷ 5 = 8 uker, 3 × 60 ÷ 60 × 8 = 24 timer i perioden.
    const r = beregnPeriodebeskjeftigelse(hent, okter(null), { dagerIPerioden: 40, dagerISkolearet: null });
    expect(r.trinn.find((t) => t.id === 'uker_i_perioden')?.resultat.verdi).toBe(8);
    expect(r.trinn.find((t) => t.id === 'timer_i_perioden_fra_okter')?.resultat.verdi).toBe(24);
    expect(r.advarsler).toContain('uker_fra_dager');
    // Oppgitt antall uker brukes som før, uten varsel.
    const oppgitt = beregnPeriodebeskjeftigelse(hent, okter(7), { dagerIPerioden: 40, dagerISkolearet: null });
    expect(oppgitt.trinn.find((t) => t.id === 'timer_i_perioden_fra_okter')?.resultat.verdi).toBe(21);
    expect(oppgitt.trinn.some((t) => t.id === 'uker_i_perioden')).toBe(false);
    expect(oppgitt.advarsler).not.toContain('uker_fra_dager');
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

  it('planleggingsdagene står for seg, og timene per uke er resten fordelt på 38 skoleuker', () => {
    const hel = beregnFordeling(hent, { grupper: [], stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0 });
    const planfestet = (r: typeof hel) => r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
    expect(hel.planleggingstimer.verdi).toBeCloseTo(45);
    expect(hel.skoleuker.verdi).toBeCloseTo(38);
    expect((planfestet(hel) - hel.planleggingstimer.verdi) / hel.skoleuker.verdi).toBeCloseTo(1105 / 38);
    // Skrevet inn for den enkelte, f.eks. deltid: 27 timer.
    const deltid = beregnFordeling(hent, { grupper: [], stilling: 60, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0, planleggingstimer: 27 });
    expect(deltid.deler.find((d) => d.id === 'planleggingsdager')?.timer).toBeCloseTo(27);
    expect(planfestet(deltid)).toBeCloseTo(690);
    // Utvidet arbeidsår: skoleukene får utvidelsen, så 100 % funksjon gir 37,5 timer per uke.
    const funksjon = beregnFordeling(hent, { grupper: [], funksjon: { type: 'prosent', prosent: 100 }, moterPerUke: 0 });
    expect(funksjon.skoleuker.verdi).toBeCloseTo(43.8);
    expect((planfestet(funksjon) - funksjon.planleggingstimer.verdi) / funksjon.skoleuker.verdi).toBeCloseTo(37.5);
    // I en periode: timene som er skrevet inn, og skoleukene i perioden (40 dager = 8 uker).
    const periode = beregnFordeling(hent, { grupper: [], stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0, periode: { dagerIPerioden: 40, dagerISkolearet: null }, planleggingstimer: 7.5 });
    expect(periode.skoleuker.verdi).toBeCloseTo(8);
    expect(periode.planleggingstimer.verdi).toBeCloseTo(7.5);
  });

  it('fra 60 år er arbeidsåret fem dager kortere (ekstra ferie)', () => {
    const vanlig = beregnFordeling(hent, { grupper, stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0 });
    const eldre = beregnFordeling(hent, { grupper, stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0, over60: true });
    expect(vanlig.arbeidsaarUker.verdi).toBeCloseTo(39.2);
    expect(eldre.arbeidsaarUker.verdi).toBeCloseTo(38.2);
    expect(eldre.arsverk.verdi).toBe(1650);
    expect(eldre.trinn.find((t) => t.id === 'ekstra_feriedager_60')?.resultat.verdi).toBe(5);
    expect(eldre.trinn.find((t) => t.id === 'arbeidsaar_dager_60')?.resultat.verdi).toBe(191);
    // Samme andel planfestet tid som for andre lærere.
    const planfestet = (r: typeof vanlig) => r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
    expect(planfestet(eldre) / eldre.arsverk.verdi).toBeCloseTo(planfestet(vanlig) / vanlig.arsverk.verdi);
    expect(planfestet(eldre)).toBeCloseTo((1150 * 1650) / 1687.5);
  });

  it('delene summerer seg til årsverket for stillingen', () => {
    const r = beregnFordeling(hent, { grupper, funksjon: { type: 'arsrammetimer', timer: 28.5 }, moterPerUke: 2 });
    const sum = r.deler.reduce((s, d) => s + d.timer, 0);
    expect(sum).toBeCloseTo(r.arsverk.verdi);
    expect(r.arsverk.verdi).toBeCloseTo((1687.5 * r.stilling.verdi) / 100);
    expect(r.deler.find((d) => d.id === 'motetid')?.timer).toBe(76);
    expect(r.advarsler).toEqual([]);
  });

  it('for hel stilling med funksjon gir planfestet tid det samme som punkt 5.3', () => {
    const hel = [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'arstimer' as const, arstimer: 420 } }];
    const r = beregnFordeling(hent, { grupper: hel, funksjon: { type: 'prosent', prosent: 20 }, moterPerUke: 0 });
    const planfestet = r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
    expect(planfestet).toBeCloseTo(beregnPlanfestet(hent, { type: 'prosent', prosent: 20 }).planfestet.verdi);
  });

  it('varsler når stillingen er over 100 % eller møtetiden er større enn planfestet tid', () => {
    const r = beregnFordeling(hent, { grupper, funksjon: { type: 'prosent', prosent: 30 }, moterPerUke: 40 });
    expect(r.advarsler).toEqual(expect.arrayContaining(['over_hel_stilling', 'motetid_for_stor']));
  });

  it('regner ut en stilling med bare funksjon, og legger møtetiden i funksjonstiden', () => {
    // 10 % stilling med 10 % funksjon og 3 timer møter i uka: ingen undervisning.
    const r = beregnFordeling(hent, { grupper: [], stilling: 10, funksjon: { type: 'prosent', prosent: 10 }, moterPerUke: 3 });
    const del = (id: string) => r.deler.find((d) => d.id === id)?.timer ?? NaN;
    expect(r.beskjeftigelse.verdi).toBe(0);
    expect(r.stilling.verdi).toBe(10);
    expect(r.arsverk.verdi).toBeCloseTo(168.75);
    expect(del('undervisning')).toBe(0);
    expect(del('motetid')).toBe(114);
    // Planleggingsdagene (45 timer, som for hel stilling når ikke annet er skrevet inn) tas fra funksjonstiden.
    expect(del('planleggingsdager')).toBeCloseTo(45);
    expect(del('funksjonstid')).toBeCloseTo(9.75);
    expect(del('annen_planfestet')).toBe(0);
    expect(del('selvdisponert')).toBe(0);
    expect(r.deler.reduce((s, d) => s + d.timer, 0)).toBeCloseTo(r.arsverk.verdi);
    expect(r.advarsler).toEqual([]);

    // Det samme uten fag i fagvisningen.
    const utenFag = beregnFordeling(hent, { grupper: [], funksjon: { type: 'prosent', prosent: 10 }, moterPerUke: 3 });
    expect(utenFag.deler).toEqual(r.deler);

    // Møter som ikke får plass i funksjonstiden heller, gir varsel.
    const forMye = beregnFordeling(hent, { grupper: [], stilling: 10, funksjon: { type: 'prosent', prosent: 10 }, moterPerUke: 10 });
    expect(forMye.advarsler).toContain('motetid_for_stor');
  });

  it('med oppgitt stilling fordeles også den delen som ikke er fylt med fag og funksjoner', () => {
    const del = (r: ReturnType<typeof beregnFordeling>, id: string) => r.deler.find((d) => d.id === id)?.timer ?? NaN;
    // 100 % stilling uten fag, møter eller funksjoner: all planfestet tid er annen planfestet tid.
    const tom = beregnFordeling(hent, { grupper: [], stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0 });
    expect(tom.stilling.verdi).toBe(100);
    expect(del(tom, 'annen_planfestet') + del(tom, 'planleggingsdager')).toBeCloseTo(1150);
    expect(del(tom, 'planleggingsdager')).toBeCloseTo(45);
    expect(del(tom, 'selvdisponert')).toBeCloseTo(537.5);
    expect(del(tom, 'undervisning')).toBe(0);

    // 50 % stilling: halvparten.
    const halv = beregnFordeling(hent, { grupper: [], stilling: 50, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0 });
    expect(del(halv, 'annen_planfestet') + del(halv, 'planleggingsdager')).toBeCloseTo(575);
    expect(del(halv, 'selvdisponert')).toBeCloseTo(268.75);

    // 100 % stilling med 80 % undervisning: resten (20 %) regnes som undervisningsdelen.
    const r = beregnFordeling(hent, { grupper, stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 2 });
    expect(r.trinn.find((t) => t.id === 'ikke_fordelt')?.resultat.verdi).toBeCloseTo(20);
    expect(del(r, 'annen_planfestet')).toBeCloseTo(1150 - 420 - 76 - 45);
    expect(del(r, 'selvdisponert')).toBeCloseTo(537.5);
    expect(r.deler.reduce((s, d) => s + d.timer, 0)).toBeCloseTo(1687.5);

    // Er fag og funksjoner mer enn stillingen, er det de som fordeles, som før.
    const over = beregnFordeling(hent, { grupper, stilling: 100, funksjon: { type: 'prosent', prosent: 30 }, moterPerUke: 0 });
    const utenStilling = beregnFordeling(hent, { grupper, funksjon: { type: 'prosent', prosent: 30 }, moterPerUke: 0 });
    expect(over.deler).toEqual(utenStilling.deler);
    expect(over.stilling.verdi).toBeCloseTo(110);
  });

  it('funksjoner som ikke utvider planfestet tid, fordeles som undervisningen', () => {
    // 80 % undervisning (420 av 525) og 20 % kontaktlærer uten utvidelse: planfestet tid blir 1150 som for hel undervisning.
    const r = beregnFordeling(hent, { grupper, funksjon: { type: 'prosent', prosent: 0 }, funksjonUtenUtvidelse: 20, moterPerUke: 0 });
    const del = (id: string) => r.deler.find((d) => d.id === id)?.timer ?? NaN;
    expect(r.stilling.verdi).toBe(100);
    expect(del('funksjonstid')).toBeCloseTo(230);
    expect(del('selvdisponert')).toBeCloseTo(537.5);
    expect(r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0)).toBeCloseTo(1150);
    expect(r.deler.reduce((s, d) => s + d.timer, 0)).toBeCloseTo(1687.5);

    // Med utvidelse blir planfestet tid det samme som punkt 5.3.
    const med = beregnFordeling(hent, { grupper, funksjon: { type: 'prosent', prosent: 20 }, moterPerUke: 0 });
    expect(med.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0)).toBeCloseTo(1257.5);

    // Begge deler: 10 % som utvider og 10 % som ikke utvider.
    const blandet = beregnFordeling(hent, { grupper, funksjon: { type: 'prosent', prosent: 10 }, funksjonUtenUtvidelse: 10, moterPerUke: 0 });
    expect(blandet.deler.find((d) => d.id === 'funksjonstid')?.timer).toBeCloseTo(168.75 + 115);
    expect(blandet.deler.reduce((s, d) => s + d.timer, 0)).toBeCloseTo(1687.5);
  });

  it('utvider arbeidsåret når planfestet tid går over 37,5 timer per uke, som punkt 5.3', () => {
    // Hel stilling med bare funksjon: 1687,5 timer planfestet, over grensen på 39,2 × 37,5 = 1470 timer.
    const r = beregnFordeling(hent, { grupper: [], stilling: 100, funksjon: { type: 'prosent', prosent: 100 }, moterPerUke: 0 });
    const p = beregnPlanfestet(hent, { type: 'prosent', prosent: 100 });
    expect(r.utvidelseDager.verdi).toBeCloseTo(p.utvidelseDager.verdi);
    expect(r.utvidelseDager.verdi).toBeCloseTo(29);
    expect(r.arbeidsaarUker.verdi).toBeCloseTo(45);
    const planfestet = r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
    expect(planfestet / r.arbeidsaarUker.verdi).toBeCloseTo(37.5);

    // Innenfor grensen er arbeidsåret 39,2 uker.
    const vanlig = beregnFordeling(hent, { grupper, funksjon: { type: 'prosent', prosent: 20 }, moterPerUke: 0 });
    expect(vanlig.utvidelseDager.verdi).toBe(0);
    expect(vanlig.arbeidsaarUker.verdi).toBeCloseTo(39.2);
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

  it('feriepenger regnes i prosent av overtidsbetalingen og holdes utenfor den', async () => {
    const { beregnOvertid } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const inn = { beskjeftigelse: 102, arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: false, lonn: { type: 'garantilonn' as const, stillingsgruppe: 'lektor', ansiennitet: 0 } };
    const vanlig = beregnOvertid(hent, inn);
    const over60 = beregnOvertid(hent, { ...inn, over60: true });
    expect(rund(vanlig.betaling.verdi)).toBe(14573.33);
    expect(rund(vanlig.feriepenger.verdi)).toBe(1748.8);
    expect(rund(over60.betaling.verdi)).toBe(14573.33);
    expect(rund(over60.feriepenger.verdi)).toBe(2083.99);
  });
});

describe('stillingsplan', () => {
  it('regner funksjoner uten fag, flere funksjoner og balanse', async () => {
    const { beregnStillingsplan } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const bareFunksjon = beregnStillingsplan(hent, { stilling: 50, grupper: [], funksjoner: [{ navn: 'Leder', prosent: 50 }], timerIGruppe: null });
    expect(bareFunksjon.beskjeftigelse.verdi).toBe(50);
    expect(bareFunksjon.differanse.verdi).toBe(0);
    expect(bareFunksjon.differanseTimer).toBeNull();

    const to = beregnStillingsplan(hent, {
      stilling: 100,
      grupper: [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: false, undervisning: { type: 'arstimer', arstimer: 420 } }],
      funksjoner: [
        { navn: 'Kontaktlærer', prosent: 10 },
        { navn: 'Teamleder', prosent: 5 },
      ],
      timerIGruppe: 0,
    });
    // 420 ÷ 525 × 100 = 80 %, + 10 + 5 = 95 %, differanse −5 % = −26,25 årsrammetimer.
    expect(to.funksjon.verdi).toBe(15);
    expect(rund(to.beskjeftigelse.verdi)).toBe(95);
    expect(rund(to.differanse.verdi)).toBe(-5);
    expect(rund(to.differanseTimer?.verdi ?? NaN)).toBe(-26.25);
    expect(to.trinn.map((t) => t.id)).toEqual(['beskjeftigelse', 'sum_funksjon', 'samlet_beskjeftigelse', 'teknisk_differanse', 'teknisk_timer']);
  });
});

describe('årstimer fra Grep', () => {
  it('stemmer med omfanget for fagkodene i Grep og peker på rader i vedlegg 1', async () => {
    const { lesArstimer } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const grep = JSON.parse(readFileSync(join(rot, 'data/grep/arstimer.json'), 'utf8')) as { arstimer: Record<string, number | null> };
    const tabell = lesArstimer(hent);
    expect(tabell.size).toBeGreaterThan(80);
    for (const [nr, rad] of tabell) {
      expect(rader.some((r) => r.nr === nr), `rad ${nr} finnes i vedlegg 1`).toBe(true);
      for (const kode of rad.fagkoder) expect(grep.arstimer[kode], `${kode} (rad ${nr})`).toBe(rad.arstimer);
    }
    // Eksemplene fra eier: kroppsøving 56 og engelsk vg1 studieforberedende 140.
    expect(tabell.get(rad('Kroppsøv.', 'Stud.spes', 'Vg1').rad.nr)?.arstimer).toBe(56);
    expect(tabell.get(rad('Engelsk', 'Stud.spes', 'Vg1').rad.nr)?.arstimer).toBe(140);
    // Yrkesfag (eier 29.09.2026): norsk 112 og engelsk 140.
    expect(tabell.get(rad('Norsk', 'Yrkesfag', 'Vg1').rad.nr)?.arstimer).toBe(112);
    expect(tabell.get(rad('Engelsk', 'Yrkesfag', 'Vg2').rad.nr)?.arstimer).toBe(140);
  });
});

describe('variabel lønn og teknisk overtid', () => {
  const fag = (arstimer: number) => [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'arstimer' as const, arstimer } }];

  it('deler differansen over en stilling under 100 % i variabel lønn og teknisk overtid', async () => {
    const { beregnStillingsplan } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    // 50 % stilling, 280 årstimer engelsk (53,33 %): bare variabel lønn.
    const halv = beregnStillingsplan(hent, { stilling: 50, grupper: fag(280), funksjoner: [], timerIGruppe: 0 });
    expect(halv.variabel.verdi).toBeCloseTo(10 / 3);
    expect(halv.overtid.verdi).toBe(0);
    expect(halv.differanseTimer?.verdi).toBeCloseTo(17.5);
    // 80 % stilling, 577,5 årstimer (110 %): 20 % variabel lønn og 10 % teknisk overtid.
    const over = beregnStillingsplan(hent, { stilling: 80, grupper: fag(577.5), funksjoner: [], timerIGruppe: 0 });
    expect(over.variabel.verdi).toBeCloseTo(20);
    expect(over.overtid.verdi).toBeCloseTo(10);
    expect(over.variabelTimer?.verdi).toBeCloseTo(105);
    expect(over.overtidTimer?.verdi).toBeCloseTo(52.5);
    // Hel stilling: hele differansen er teknisk overtid.
    const hel = beregnStillingsplan(hent, { stilling: 100, grupper: fag(577.5), funksjoner: [], timerIGruppe: 0 });
    expect(hel.variabel.verdi).toBe(0);
    expect(hel.overtid.verdi).toBeCloseTo(10);
  });

  it('betaler variabel lønn med vanlig timelønn og overtid med 50 % tillegg', async () => {
    const { beregnLonn } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const lonn = { type: 'manuell' as const, arslonn: 600000 };
    const arsrammer = [rad('Engelsk', 'Stud.spes', 'Vg1')];
    const timelonn = (600000 / 1687.5) * (100 / 112);
    // 80 % stilling og 110 % beskjeftigelse: 20 % = 105 årsrammetimer = 280 timer kalkulert tid med variabel lønn.
    const r = beregnLonn(hent, { lonn, stilling: 80, tillegg: null, overtid: { beskjeftigelse: 110, arsrammer, elever: 30 }, over60: false });
    expect(r.variabel?.verdi).toBeCloseTo(280 * timelonn);
    expect(r.overtid?.verdi).toBeCloseTo(140 * timelonn * 1.5);
    expect(r.samlet.verdi).toBeCloseTo(480000 + 280 * timelonn + 140 * timelonn * 1.5);
    expect(r.trinn.filter((t) => t.id === 'timelonn')).toHaveLength(1);
    // 50 % stilling og 53,33 % beskjeftigelse: bare variabel lønn.
    const halv = beregnLonn(hent, { lonn, stilling: 50, tillegg: null, overtid: { beskjeftigelse: 160 / 3, arsrammer, elever: 30 }, over60: false });
    expect(halv.overtid).toBeNull();
    expect(halv.variabel?.verdi).toBeCloseTo(((17.5 * 1400) / 525) * timelonn);
    // Regnet som vikartimer: 105 timer i engelsk gir samme lønn som 105 vikartimer for en timevikar.
    const { beregnTimevikar } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const vikar = beregnTimevikar(hent, { arsrammer, elever: 30, okter: 105, minutter: 60, lonn, over60: false });
    expect(r.variabelKalkulertTid?.verdi).toBeCloseTo(vikar.kalkulertTid.verdi);
    expect(r.variabel?.verdi).toBeCloseTo(vikar.lonn.verdi);
    // Hel stilling: ingen variabel lønn.
    expect(beregnLonn(hent, { lonn, stilling: 100, tillegg: null, overtid: { beskjeftigelse: 110, arsrammer, elever: 30 }, over60: false }).variabel).toBeNull();
  });
});

describe('arbeidsplan for en periode', () => {
  // Halve skoleåret (95 av 190 dager): periodenøkkel 0,5. 262,5 timer engelsk i perioden er 100 % i perioden.
  const periode = { dagerIPerioden: 95, dagerISkolearet: null };
  const fag = [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'arstimer' as const, arstimer: 262.5 } }];

  it('regner beskjeftigelse, funksjoner og differanse i perioden, og gir nøkkelen til årsbasis', async () => {
    const { beregnStillingsplan } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const r = beregnStillingsplan(hent, { stilling: 100, grupper: fag, funksjoner: [{ navn: 'Kontaktlærer', prosent: 10 }], timerIGruppe: 0, periode });
    expect(r.undervisning.verdi).toBeCloseTo(100);
    // Funksjonen er like mange prosent i perioden som for et helt år (eier 30.09.2026).
    expect(r.beskjeftigelse.verdi).toBeCloseTo(110);
    expect(r.overtid.verdi).toBeCloseTo(10);
    expect(r.periodenokkel?.verdi).toBeCloseTo(0.5);
    // 10 % av perioderammen (525 × 0,5) = 26,25 timer i perioden.
    expect(r.differanseTimer?.verdi).toBeCloseTo(26.25);
    // På årsbasis: 100 % i halve året er 50 % for hele året.
    expect(r.undervisning.verdi * (r.periodenokkel?.verdi ?? 1)).toBeCloseTo(50);
    // Uten fag gir perioden likevel nøkkelen.
    const bareFunksjon = beregnStillingsplan(hent, { stilling: 50, grupper: [], funksjoner: [{ navn: '', prosent: 50 }], timerIGruppe: null, periode });
    expect(bareFunksjon.periodenokkel?.verdi).toBeCloseTo(0.5);
  });

  it('regner lønn, tillegg, variabel lønn og overtid for perioden', async () => {
    const { beregnLonn } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const lonn = { type: 'manuell' as const, arslonn: 600000 };
    const timelonn = (600000 / 1687.5) * (100 / 112);
    const nokkel = { navn: 'periodenokkel' as const, verdi: 0.5, enhet: 'faktor' as const, opprinnelse: 'trinn' as const };
    const arsrammer = [rad('Engelsk', 'Stud.spes', 'Vg1')];
    const r = beregnLonn(hent, { lonn, stilling: 80, tillegg: 12000, overtid: { beskjeftigelse: 110, arsrammer, elever: 30 }, over60: false, periodenokkel: nokkel });
    expect(r.arslonn.verdi).toBeCloseTo(240000);
    expect(r.tillegg?.verdi).toBeCloseTo(6000);
    // 20 % variabel lønn i perioden = 10 % på årsbasis = 52,5 timer = 140 timer kalkulert tid.
    expect(r.variabel?.verdi).toBeCloseTo(140 * timelonn);
    // 10 % overtid i perioden = 5 % på årsbasis = 26,25 timer = 70 timer kalkulert tid, med 50 % tillegg.
    expect(r.overtid?.verdi).toBeCloseTo(70 * timelonn * 1.5);
  });

  it('regner andelen av årslønnen fra datoene: hele måneder, og arbeidsdager ÷ 21,67 i brutte måneder', async () => {
    const { lonnsperiode, beregnLonn } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    // Hele skoleåret: 12 hele måneder.
    expect(lonnsperiode(hent, '2026-08-01', '2027-07-31')?.andel.verdi).toBeCloseTo(1);
    // 15.1.–30.6.2027: januar er brutt (fredag 15. til søndag 31. = 11 arbeidsdager), februar–juni er hele.
    const p = lonnsperiode(hent, '2027-01-15', '2027-06-30');
    expect(p?.heleManeder).toBe(5);
    expect(p?.arbeidsdager).toBe(11);
    expect(p?.andel.verdi).toBeCloseTo((5 + 11 / 21.67) / 12);
    // Innenfor én måned: onsdag 3. til fredag 12. februar = 8 arbeidsdager.
    expect(lonnsperiode(hent, '2027-02-03', '2027-02-12')?.andel.verdi).toBeCloseTo(8 / 21.67 / 12);
    // Ugyldig eller baklengs periode gir ingen andel.
    expect(lonnsperiode(hent, '2027-02-12', '2027-02-03')).toBeNull();
    expect(lonnsperiode(hent, '', '2027-02-03')).toBeNull();
    // Lønn og tillegg ganges med andelen fra datoene, ikke periodenøkkelen.
    const nokkel = { navn: 'periodenokkel' as const, verdi: 0.5, enhet: 'faktor' as const, opprinnelse: 'trinn' as const };
    const r = beregnLonn(hent, { lonn: { type: 'manuell', arslonn: 600000 }, stilling: 100, tillegg: 12000, overtid: null, over60: false, periodenokkel: nokkel, lonnsandel: p?.andel ?? null });
    expect(r.arslonn.verdi).toBeCloseTo(600000 * ((5 + 11 / 21.67) / 12));
    expect(r.tillegg?.verdi).toBeCloseTo(12000 * ((5 + 11 / 21.67) / 12));
  });

  it('gir timene i fordelingen for perioden, med samme timer per uke som for et helt år', async () => {
    const hel = beregnFordeling(hent, { grupper: [{ ...fag[0]!, undervisning: { type: 'arstimer', arstimer: 525 } }], stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0 });
    const del = beregnFordeling(hent, { grupper: fag, stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, moterPerUke: 0, periode });
    const planfestet = (r: typeof hel) => r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
    expect(del.deler.find((d) => d.id === 'undervisning')?.timer).toBeCloseTo(262.5);
    expect(del.arsverk.verdi).toBeCloseTo(1687.5 / 2);
    expect(planfestet(del)).toBeCloseTo(575);
    expect(planfestet(del) / del.arbeidsaarUker.verdi).toBeCloseTo(planfestet(hel) / hel.arbeidsaarUker.verdi);
    expect(del.periodenokkel?.verdi).toBeCloseTo(0.5);
  });
});

describe('lønn i stillingen', () => {
  it('er årslønn i hel stilling × stillingsprosent ÷ 100, fra garantilønn eller egen lønn', async () => {
    const { beregnLonn, lesGarantilonn } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const enkel = beregnLonn(hent, { lonn: { type: 'manuell', arslonn: 600000 }, stilling: 80, tillegg: null, overtid: null, over60: false });
    expect(enkel.arslonn.verdi).toBe(480000);
    expect(enkel.samlet.verdi).toBe(480000);
    expect(enkel.feriepenger.verdi).toBeCloseTo(57600);
    const lektor = lesGarantilonn(hent).find((r) => r.id === 'lektor');
    const r = beregnLonn(hent, { lonn: { type: 'garantilonn', stillingsgruppe: 'lektor', ansiennitet: 0 }, stilling: 50, tillegg: null, overtid: null, over60: false });
    expect(r.arslonn.verdi).toBeCloseTo((lektor?.lonn[0] ?? NaN) / 2);
    expect(r.trinn[0]?.operander.arslonn?.opprinnelse).toBe('tabell');
  });

  it('legger til tillegg og overtidsbetaling, og regner feriepenger av det som utbetales', async () => {
    const { beregnLonn, beregnOvertid } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    const lonn = { type: 'manuell' as const, arslonn: 700000 };
    const overtid = { beskjeftigelse: 110, arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30 };
    const r = beregnLonn(hent, { lonn, stilling: 100, tillegg: 12000, overtid, over60: false });
    const o = beregnOvertid(hent, { ...overtid, lonn, over60: false });
    expect(r.overtid?.verdi).toBeCloseTo(o.betaling.verdi);
    expect(r.samlet.verdi).toBeCloseTo(700000 + 12000 + o.betaling.verdi);
    expect(r.feriepenger.verdi).toBeCloseTo(r.samlet.verdi * 0.12);
    expect(r.trinn.filter((t) => t.id === 'feriepenger')).toHaveLength(1);
    // Over 60 år gir høyere sats.
    const eldre = beregnLonn(hent, { lonn, stilling: 100, tillegg: 12000, overtid: null, over60: true });
    expect(eldre.feriepenger.verdi / eldre.samlet.verdi).toBeCloseTo(0.143, 3);
    // Ingen overtid når beskjeftigelsen ikke er over 100 %.
    expect(beregnLonn(hent, { lonn, stilling: 100, tillegg: null, overtid: { ...overtid, beskjeftigelse: 95 }, over60: false }).overtid).toBeNull();
  });

  it('godtgjøringen for kontaktlærer og rådgiver står i regelverket (SFS 2213 punkt 9.1)', () => {
    expect(hent('sfs2213.godtgjoring_kontaktlaerer').verdi).toBe(12000);
    expect(hent('sfs2213.godtgjoring_radgiver').verdi).toBe(12000);
  });
});

describe('arbeidsplan: årsrammetimer og redusert undervisning', () => {
  const engelsk = [{ arsrammer: [rad('Engelsk', 'Stud.spes', 'Vg1')], elever: 30, undervisning: { type: 'arstimer' as const, arstimer: 420 } }];

  it('gjør funksjoner i årsrammetimer om til prosent med årsrammen for funksjoner, med eget trinn', async () => {
    const { beregnStillingsplan, funksjonsprosentFor } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    // Kontaktlærer 28,5 årsrammetimer ÷ 607,5 × 100 = 4,69 %.
    expect(funksjonsprosentFor(hent, { navn: 'Kontaktlærer', prosent: 0, arsrammetimer: 28.5 })).toBeCloseTo(4.6914, 3);
    const r = beregnStillingsplan(hent, {
      stilling: 100,
      grupper: engelsk,
      funksjoner: [{ navn: 'Kontaktlærer', prosent: 0, arsrammetimer: 28.5 }, { navn: 'Team', prosent: 10 }],
      timerIGruppe: 0,
    });
    expect(r.funksjonsprosenter[0]).toBeCloseTo(4.6914, 3);
    expect(r.funksjon.verdi).toBeCloseTo(14.6914, 3);
    expect(r.trinn.some((t) => t.id === 'funksjonsprosent')).toBe(true);
  });

  it('regner redusert undervisning som en del av stillingen', async () => {
    const { beregnStillingsplan } = await import('../../src/modules/arbeidstid/beregning/index.ts');
    // 87,5 % undervisning (459,375 av 525) og 12,5 % redusert undervisning for 60 år: stillingen går opp.
    const g = [{ ...engelsk[0]!, undervisning: { type: 'arstimer' as const, arstimer: 459.375 } }];
    const r = beregnStillingsplan(hent, { stilling: 100, grupper: g, funksjoner: [], timerIGruppe: 0, reduksjon: 12.5 });
    expect(r.reduksjon?.verdi).toBe(12.5);
    expect(r.beskjeftigelse.verdi).toBeCloseTo(100);
    expect(Math.abs(r.differanse.verdi)).toBeLessThan(1e-9);
    expect(r.trinn.some((t) => t.id === 'samlet_med_reduksjon')).toBe(true);
  });

  it('fordeler redusert undervisning uten å utvide planfestet tid, og bruker årsverket 1650 for 60 år', () => {
    const g = [{ ...engelsk[0]!, undervisning: { type: 'arstimer' as const, arstimer: 459.375 } }];
    const r = beregnFordeling(hent, { grupper: g, stilling: 100, funksjon: { type: 'prosent', prosent: 0 }, funksjonUtenUtvidelse: 12.5, moterPerUke: 0, over60: true });
    const planfestet = r.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
    expect(r.arsverk.verdi).toBe(1650);
    // Samme andel planfestet tid som for andre lærere (eier 30.09.2026).
    expect(planfestet).toBeCloseTo((1150 * 1650) / 1687.5);
    expect(r.deler.find((d) => d.id === 'selvdisponert')?.timer).toBeCloseTo(1650 - (1150 * 1650) / 1687.5);
    expect(r.deler.reduce((s, d) => s + d.timer, 0)).toBeCloseTo(1650);
  });
});

describe('unikeFag', () => {
  it('viser et fag som er lagt til flere ganger, én gang, og husker gruppene', () => {
    const rader = [
      { fag: 'Engelsk', arsramme: 525, timer: 14.54 },
      { fag: 'Norsk', arsramme: 496, timer: 13.73 },
      { fag: 'Norsk', arsramme: 496, timer: 13.73 },
    ];
    expect(unikeFag(rader)).toEqual([
      { fag: 'Engelsk', arsramme: 525, timer: 14.54, indekser: [0] },
      { fag: 'Norsk', arsramme: 496, timer: 13.73, indekser: [1, 2] },
    ]);
  });

  it('holder samme fag med ulik årsramme hver for seg', () => {
    const rader = [
      { fag: 'Matematikk', arsramme: 607.5, timer: 10 },
      { fag: 'Matematikk', arsramme: 525, timer: 8.64 },
    ];
    expect(unikeFag(rader).map((r) => r.indekser)).toEqual([[0], [1]]);
  });
});
