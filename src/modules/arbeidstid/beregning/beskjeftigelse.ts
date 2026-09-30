// Beskjeftigelse (undervisningsprosent) for én eller flere grupper, og periodebeskjeftigelse.
// Beskjeftigelse = årstimer ÷ årsramme × 100, i 60-minutters timer (vedlegg 1 til SFS 2213).
import { type Arsrammevalg, type Elevtall, velgArsramme } from './arsrammer.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

/** Undervisningen i en gruppe: årstimer direkte, eller økter per uke. */
export type Undervisning =
  | { type: 'arstimer'; arstimer: number }
  | { type: 'okter'; okterPerUke: number; minutter: number; uker: number | null };

export interface Gruppe {
  arsrammer: Arsrammevalg[];
  /** Faktisk antall elever, eller om klassen har 15 eller færre. Trengs bare for fag merket * i vedlegg 1. */
  elever: Elevtall;
  undervisning: Undervisning;
}

export interface Gruppeberegning {
  timer: Operand;
  arsramme: Operand;
  beskjeftigelse: Operand;
}

export interface Beskjeftigelsesresultat extends Utregning {
  grupper: Gruppeberegning[];
  sum: Operand;
}

type Gruppenr = { gruppe?: number };

/**
 * Timene i gruppen. Økter per uke regnes om med antall uker: oppgitt av brukeren, ellers skoleårets uker, eller
 * i en periode ukene regnet ut fra dagene i perioden (periodeUker).
 */
function timer(hent: Hent, u: Undervisning, nr: Gruppenr, periode: boolean, periodeUker?: Operand): { timer: Operand; trinn: Trinn[] } {
  const navn = periode ? 'timer_i_perioden' : 'arstimer';
  if (u.type === 'arstimer') return { timer: inndata(navn, u.arstimer, 'timer'), trinn: [] };
  const uker =
    u.uker !== null
      ? inndata('uker', u.uker, 'uker')
      : periode
        ? (periodeUker ?? inndata('uker', 0, 'uker'))
        : regel(hent, 'sfs2213.skolear_uker', 'uker', 'uker');
  const t = trinn(
    periode ? 'timer_i_perioden_fra_okter' : 'arstimer_fra_okter',
    {
      okter: inndata('okter_per_uke', u.okterPerUke, 'okter'),
      minutter: inndata('minutter_per_okt', u.minutter, 'minutter'),
      uker,
    },
    navn,
    'timer',
    (u.okterPerUke * u.minutter * uker.verdi) / 60,
    nr,
  );
  return { timer: t.resultat, trinn: [t] };
}

function summer(grupper: readonly Gruppeberegning[], navn: 'sum_beskjeftigelse', flere: boolean): { sum: Operand; trinn: Trinn[] } {
  const verdi = grupper.reduce((s, g) => s + g.beskjeftigelse.verdi, 0);
  if (!flere) {
    const forste = grupper[0];
    return { sum: forste ? { ...forste.beskjeftigelse, navn } : { navn, verdi: 0, enhet: 'prosent', opprinnelse: 'trinn' }, trinn: [] };
  }
  const liste: Operand = { navn: 'beskjeftigelser', verdi, enhet: 'prosent', opprinnelse: 'trinn', liste: grupper.map((g) => g.beskjeftigelse.verdi) };
  const t = trinn('sum_beskjeftigelse', { beskjeftigelser: liste }, navn, 'prosent', verdi);
  return { sum: t.resultat, trinn: [t] };
}

/** Beskjeftigelse for hele skoleåret. Flere grupper summeres (fagkombinasjoner). */
export function beregnBeskjeftigelse(hent: Hent, grupper: readonly Gruppe[]): Beskjeftigelsesresultat {
  const alleTrinn: Trinn[] = [];
  const advarsler = new Set<AdvarselId>();
  const flere = grupper.length > 1;
  const resultater = grupper.map((g, i) => {
    const nr: Gruppenr = flere ? { gruppe: i + 1 } : {};
    const valg = velgArsramme(hent, g.arsrammer, g.elever, nr.gruppe);
    if (valg.manglerElevtall) advarsler.add('mangler_elevtall');
    const t = timer(hent, g.undervisning, nr, false);
    const b = trinn('beskjeftigelse', { arstimer: t.timer, arsramme: valg.arsramme }, 'beskjeftigelse', 'prosent', (t.timer.verdi / valg.arsramme.verdi) * 100, nr);
    alleTrinn.push(...valg.trinn, ...t.trinn, b);
    return { timer: t.timer, arsramme: valg.arsramme, beskjeftigelse: b.resultat };
  });
  const s = summer(resultater, 'sum_beskjeftigelse', flere);
  alleTrinn.push(...s.trinn);
  return { grupper: resultater, sum: s.sum, trinn: alleTrinn, advarsler: [...advarsler] };
}

export interface Periode {
  dagerIPerioden: number;
  /** Undervisningsdager i skoleåret. null gir verdien fra regelsettet (190). */
  dagerISkolearet: number | null;
}

/**
 * Periodebeskjeftigelse: timene i perioden ÷ (årsramme × periodenøkkel) × 100,
 * der periodenøkkelen er undervisningsdager i perioden ÷ undervisningsdager i skoleåret.
 */
export function beregnPeriodebeskjeftigelse(hent: Hent, grupper: readonly Gruppe[], periode: Periode): Beskjeftigelsesresultat {
  const alleTrinn: Trinn[] = [];
  const advarsler = new Set<AdvarselId>();
  const dagerSkolear =
    periode.dagerISkolearet === null
      ? regel(hent, 'sfs2213.skolear_dager', 'dager_i_skolearet', 'dager')
      : inndata('dager_i_skolearet', periode.dagerISkolearet, 'dager');
  const nokkel = trinn(
    'periodenokkel',
    { dager_periode: inndata('dager_i_perioden', periode.dagerIPerioden, 'dager'), dager_skolear: dagerSkolear },
    'periodenokkel',
    'faktor',
    periode.dagerIPerioden / dagerSkolear.verdi,
  );
  alleTrinn.push(nokkel);
  // Uker i perioden for økter per uke uten oppgitt antall uker: dagene i perioden ÷ skoledager per uke.
  // Ukene kan ha ulikt antall skoledager eller ulik timeplan, så det gir en advarsel.
  let periodeUker: Operand | undefined;
  if (grupper.some((g) => g.undervisning.type === 'okter' && g.undervisning.uker === null)) {
    const perUke = regel(hent, 'sfs2213.arbeidsdager_per_uke', 'arbeidsdager_per_uke', 'dager');
    const u = trinn(
      'uker_i_perioden',
      { dager_periode: inndata('dager_i_perioden', periode.dagerIPerioden, 'dager'), per_uke: perUke },
      'uker',
      'uker',
      periode.dagerIPerioden / perUke.verdi,
    );
    alleTrinn.push(u);
    periodeUker = u.resultat;
    advarsler.add('uker_fra_dager');
  }
  const flere = grupper.length > 1;
  const resultater = grupper.map((g, i) => {
    const nr: Gruppenr = flere ? { gruppe: i + 1 } : {};
    const valg = velgArsramme(hent, g.arsrammer, g.elever, nr.gruppe);
    if (valg.manglerElevtall) advarsler.add('mangler_elevtall');
    const t = timer(hent, g.undervisning, nr, true, periodeUker);
    const ramme = trinn('perioderamme', { arsramme: valg.arsramme, periodenokkel: nokkel.resultat }, 'perioderamme', 'arsrammetimer', valg.arsramme.verdi * nokkel.resultat.verdi, nr);
    const b = trinn('periodebeskjeftigelse', { timer: t.timer, perioderamme: ramme.resultat }, 'beskjeftigelse', 'prosent', (t.timer.verdi / ramme.resultat.verdi) * 100, nr);
    alleTrinn.push(...valg.trinn, ...t.trinn, ramme, b);
    return { timer: t.timer, arsramme: valg.arsramme, beskjeftigelse: b.resultat };
  });
  const s = summer(resultater, 'sum_beskjeftigelse', flere);
  alleTrinn.push(...s.trinn);
  return { grupper: resultater, sum: s.sum, trinn: alleTrinn, advarsler: [...advarsler] };
}
