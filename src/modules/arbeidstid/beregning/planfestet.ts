// Planfestet arbeidstid ved funksjoner og andre arbeidsoppgaver (SFS 2213 punkt 5.3).
// Reduseres undervisningen med x %, reduseres tiden læreren disponerer selv (årsverk − planfestet)
// med x %, og planfestet tid øker like mye. Overskrides 37,5 timer per uke, utvides arbeidsåret.
import type { Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

export type Reduksjon = { type: 'prosent'; prosent: number } | { type: 'arsrammetimer'; timer: number };

/** Funksjonsprosent: oppgitt direkte, eller årsrammetimer ÷ årsramme ved funksjon (607,5) × 100. */
export function funksjonsprosent(hent: Hent, r: Reduksjon): { prosent: Operand; trinn: Trinn[] } {
  if (r.type === 'prosent') return { prosent: inndata('funksjonsprosent', r.prosent, 'prosent'), trinn: [] };
  const reduksjon = inndata('reduksjon_arsrammetimer', r.timer, 'arsrammetimer');
  const arsramme = regel(hent, 'sfs2213.arsramme_funksjon', 'arsramme_funksjon', 'arsrammetimer');
  const t = trinn('funksjonsprosent', { reduksjon, arsramme }, 'funksjonsprosent', 'prosent', (reduksjon.verdi / arsramme.verdi) * 100);
  return { prosent: t.resultat, trinn: [t] };
}

/**
 * Arbeidsåret: elevenes skoleår + 6 dager, gjort om til uker. For lærere som er 60 år og eldre er årsverket 37,5 timer
 * kortere (punkt 4). Det er fem arbeidsdager ekstra ferie, så arbeidsåret er fem dager kortere (eier 30.09.2026).
 * Dagene regnes ut fra regelverdiene: (årsverk − årsverk 60 år) ÷ 7,5.
 */
export function arbeidsaaret(hent: Hent, over60 = false): { uker: Operand; trinn: Trinn[] } {
  const skolear = regel(hent, 'sfs2213.skolear_dager', 'skolear_dager', 'dager');
  const tillegg = regel(hent, 'sfs2213.arbeidsaar_tillegg_dager', 'arbeidsaar_tillegg', 'dager');
  const alle: Trinn[] = [];
  let dager: Trinn;
  if (over60) {
    const arsverk = regel(hent, 'sfs2213.arsverk_timer', 'arsverk', 'timer');
    const arsverk60 = regel(hent, 'sfs2213.arsverk_timer_60_ar', 'arsverk_60', 'timer');
    const perDag = regel(hent, 'sfs2213.timer_per_dag', 'timer_per_dag', 'timer');
    const ferie = trinn(
      'ekstra_feriedager_60',
      { arsverk, arsverk_60: arsverk60, per_dag: perDag },
      'ekstra_feriedager',
      'dager',
      (arsverk.verdi - arsverk60.verdi) / perDag.verdi,
    );
    dager = trinn('arbeidsaar_dager_60', { skolear, tillegg, ferie: ferie.resultat }, 'arbeidsaar_dager', 'dager', skolear.verdi + tillegg.verdi - ferie.resultat.verdi);
    alle.push(ferie);
  } else {
    dager = trinn('arbeidsaar_dager', { skolear, tillegg }, 'arbeidsaar_dager', 'dager', skolear.verdi + tillegg.verdi);
  }
  const perUke = regel(hent, 'sfs2213.arbeidsdager_per_uke', 'arbeidsdager_per_uke', 'dager');
  const uker = trinn('arbeidsaar_uker', { dager: dager.resultat, per_uke: perUke }, 'arbeidsaar_uker', 'uker', dager.resultat.verdi / perUke.verdi);
  alle.push(dager, uker);
  return { uker: uker.resultat, trinn: alle };
}

export interface PlanfestetResultat extends Utregning {
  funksjonsprosent: Operand;
  planfestet: Operand;
  perUke: Operand;
  utvidelseDager: Operand;
}

export function beregnPlanfestet(hent: Hent, reduksjon: Reduksjon): PlanfestetResultat {
  const f = funksjonsprosent(hent, reduksjon);
  const arsverk = regel(hent, 'sfs2213.arsverk_timer', 'arsverk', 'timer');
  const planfestet = regel(hent, 'sfs2213.planfestet_timer', 'planfestet', 'timer');
  const selv = trinn('selvdisponert', { arsverk, planfestet }, 'selvdisponert', 'timer', arsverk.verdi - planfestet.verdi);
  const okning = trinn(
    'planfestet_okning',
    { selvdisponert: selv.resultat, funksjonsprosent: f.prosent },
    'planfestet_okning',
    'timer',
    (selv.resultat.verdi * f.prosent.verdi) / 100,
  );
  const ny = trinn('planfestet_ny', { planfestet, okning: okning.resultat }, 'planfestet_ny', 'timer', planfestet.verdi + okning.resultat.verdi);
  const aar = arbeidsaaret(hent);
  const maksUke = regel(hent, 'sfs2213.planfestet_maks_uke', 'planfestet_maks_uke', 'timer_per_uke');
  const maks = trinn('planfestet_maks', { uker: aar.uker, maks_uke: maksUke }, 'planfestet_maks', 'timer', aar.uker.verdi * maksUke.verdi);

  const alle: Trinn[] = [...f.trinn, selv, okning, ny, ...aar.trinn, maks];
  let perUke: Operand;
  let utvidelseDager: Operand;
  if (ny.resultat.verdi <= maks.resultat.verdi) {
    const t = trinn('planfestet_per_uke', { planfestet: ny.resultat, uker: aar.uker }, 'planfestet_per_uke', 'timer_per_uke', ny.resultat.verdi / aar.uker.verdi);
    alle.push(t);
    perUke = t.resultat;
    utvidelseDager = { navn: 'utvidelse_dager', verdi: 0, enhet: 'dager', opprinnelse: 'trinn' };
  } else {
    const t = trinn('planfestet_per_uke_maks', { maks: maks.resultat, uker: aar.uker }, 'planfestet_per_uke', 'timer_per_uke', maks.resultat.verdi / aar.uker.verdi);
    const over = trinn('utvidelse_timer', { planfestet: ny.resultat, maks: maks.resultat }, 'utvidelse_timer', 'timer', ny.resultat.verdi - maks.resultat.verdi);
    const perDag = regel(hent, 'sfs2213.timer_per_dag', 'timer_per_dag', 'timer');
    const dager = trinn('utvidelse_dager', { timer: over.resultat, per_dag: perDag }, 'utvidelse_dager', 'dager', over.resultat.verdi / perDag.verdi);
    alle.push(t, over, dager);
    perUke = t.resultat;
    utvidelseDager = dager.resultat;
  }
  return { funksjonsprosent: f.prosent, planfestet: ny.resultat, perUke, utvidelseDager, trinn: alle, advarsler: [] };
}
