// Fordeling av årsverket i en tenkt stilling, til diagrammet.
// Undervisningen kommer fra fagene (årstimer og årsramme), funksjoner og andre oppgaver fra funksjonsprosenten,
// og møtetiden fra brukeren. Resten av planfestet tid er egentid til andre oppgaver innenfor planfestet tid.
//
// For en stilling med undervisning B % og funksjon F % (SFS 2213 punkt 5.1 og 5.3):
//   planfestet tid for undervisningsdelen = planfestet × B, tid læreren disponerer selv = (årsverk − planfestet) × B,
//   funksjonstid = årsverk × F. Summen er årsverk × (B + F).
// For hel stilling gir dette samme planfestede tid som punkt 5.3 (eier bekreftet 29.09.2026).
import { beregnBeskjeftigelse, type Gruppe } from './beskjeftigelse.ts';
import { arbeidsaaret, funksjonsprosent, type Reduksjon } from './planfestet.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

export interface Fordelingsinndata {
  grupper: Gruppe[];
  funksjon: Reduksjon;
  moterPerUke: number;
}

/** Delene i diagrammet, i rekkefølge. Alle i timer per år. */
export type FordelingsdelId = 'undervisning' | 'motetid' | 'annen_planfestet' | 'funksjonstid' | 'selvdisponert';

export interface Fordelingsdel {
  id: FordelingsdelId;
  timer: number;
  planfestet: boolean;
}

export interface Fordelingsresultat extends Utregning {
  beskjeftigelse: Operand;
  funksjonsprosent: Operand;
  stilling: Operand;
  arsverk: Operand;
  /** Uker i arbeidsåret (196 dager ÷ 5), til visning av timer per uke. */
  arbeidsaarUker: Operand;
  deler: Fordelingsdel[];
}

export function beregnFordeling(hent: Hent, inn: Fordelingsinndata): Fordelingsresultat {
  const b = beregnBeskjeftigelse(hent, inn.grupper);
  const f = funksjonsprosent(hent, inn.funksjon);
  const undervisning: Operand = {
    navn: 'arstimer',
    verdi: b.grupper.reduce((s, g) => s + g.timer.verdi, 0),
    enhet: 'timer',
    opprinnelse: 'trinn',
    liste: b.grupper.map((g) => g.timer.verdi),
  };
  const arsverk = regel(hent, 'sfs2213.arsverk_timer', 'arsverk', 'timer');
  const planfestet = regel(hent, 'sfs2213.planfestet_timer', 'planfestet', 'timer');
  const B = b.sum;
  const F = f.prosent;

  const stilling = trinn('stilling', { beskjeftigelse: B, funksjonsprosent: F }, 'stilling', 'prosent', B.verdi + F.verdi);
  const arsverkStilling = trinn('arsverk_stilling', { arsverk, stilling: stilling.resultat }, 'arsverk_stilling', 'timer', (arsverk.verdi * stilling.resultat.verdi) / 100);
  const planU = trinn('planfestet_undervisning', { planfestet, beskjeftigelse: B }, 'planfestet_undervisning', 'timer', (planfestet.verdi * B.verdi) / 100);
  const funksjonstid = trinn('funksjonstid', { arsverk, funksjonsprosent: F }, 'funksjonstid', 'timer', (arsverk.verdi * F.verdi) / 100);
  const skolearUker = regel(hent, 'sfs2213.skolear_uker', 'skolear_uker', 'uker');
  const motetid = trinn('motetid', { moter: inndata('moter_per_uke', inn.moterPerUke, 'timer_per_uke'), uker: skolearUker }, 'motetid', 'timer', inn.moterPerUke * skolearUker.verdi);
  const annen = trinn(
    'annen_planfestet',
    { planfestet_undervisning: planU.resultat, undervisning, motetid: motetid.resultat },
    'annen_planfestet',
    'timer',
    planU.resultat.verdi - undervisning.verdi - motetid.resultat.verdi,
  );
  const selv = trinn(
    'selvdisponert_stilling',
    { arsverk, planfestet, beskjeftigelse: B },
    'selvdisponert_stilling',
    'timer',
    ((arsverk.verdi - planfestet.verdi) * B.verdi) / 100,
  );

  const advarsler = new Set<AdvarselId>(b.advarsler);
  if (stilling.resultat.verdi > 100 + 1e-9) advarsler.add('over_hel_stilling');
  if (annen.resultat.verdi < -1e-9) advarsler.add('motetid_for_stor');

  const trinnliste: Trinn[] = [...b.trinn, ...f.trinn, stilling, arsverkStilling, planU, motetid, annen, funksjonstid, selv];
  return {
    beskjeftigelse: B,
    funksjonsprosent: F,
    stilling: stilling.resultat,
    arsverk: arsverkStilling.resultat,
    arbeidsaarUker: arbeidsaaret(hent).uker,
    deler: [
      { id: 'undervisning', timer: undervisning.verdi, planfestet: true },
      { id: 'motetid', timer: motetid.resultat.verdi, planfestet: true },
      { id: 'annen_planfestet', timer: Math.max(0, annen.resultat.verdi), planfestet: true },
      { id: 'funksjonstid', timer: funksjonstid.resultat.verdi, planfestet: true },
      { id: 'selvdisponert', timer: selv.resultat.verdi, planfestet: false },
    ],
    trinn: trinnliste,
    advarsler: [...advarsler],
  };
}
