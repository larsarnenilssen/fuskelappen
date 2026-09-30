// Fordeling av årsverket i en tenkt stilling, til diagrammet.
// Undervisningen kommer fra fagene (årstimer og årsramme), eller fra stillingsprosenten minus funksjonene
// og en årsramme. Funksjoner og andre oppgaver kommer fra funksjonsprosenten, og møtetiden fra brukeren.
// Resten av planfestet tid er egentid til andre oppgaver innenfor planfestet tid.
// Møtetid som ikke får plass i den planfestede tiden for undervisningen (f.eks. når stillingen bare er
// funksjon), legges i funksjonstiden, som også er planfestet.
//
// For en stilling med undervisning B % og funksjon F % (SFS 2213 punkt 5.1 og 5.3):
//   planfestet tid for undervisningsdelen = planfestet × B, tid læreren disponerer selv = (årsverk − planfestet) × B,
//   funksjonstid = årsverk × F. Summen er årsverk × (B + F).
// For hel stilling gir dette samme planfestede tid som punkt 5.3 (eier bekreftet 29.09.2026).
// Funksjoner som ikke utvider planfestet tid (G %, eiers valg per funksjon 30.09.2026), fordeles som undervisningen:
//   planfestet del = planfestet × G, tid læreren disponerer selv = (årsverk − planfestet) × G.
// Er stillingsprosenten oppgitt sammen med fagene (Arbeidsplan), fordeles den delen av stillingen som ikke er fylt
// med fag og funksjoner (R), som undervisningsdelen: planfestet × R og (årsverk − planfestet) × R. Da viser
// diagrammet hvor mye planfestet tid og tid til egen disposisjon stillingen gir uansett (eiers ønske 30.09.2026).
// Blir planfestet tid mer enn 37,5 timer per uke i snitt, utvides arbeidsåret som i punkt 5.3, og timene per uke
// regnes med det utvidede arbeidsåret.
import { Regelfeil } from '../../../core/regler/motor.ts';
import { type Arsrammevalg, velgArsramme } from './arsrammer.ts';
import { beregnBeskjeftigelse, type Gruppe } from './beskjeftigelse.ts';
import { arbeidsaaret, funksjonsprosent, type Reduksjon } from './planfestet.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

/**
 * Undervisningen i stillingen: fra fagene, eller fra stillingsprosenten. Med stillingsprosent er undervisningen
 * stillingen minus funksjonene. Årsrammen trengs bare når det er undervisning igjen.
 */
export type Undervisningsgrunnlag =
  | {
      type: 'fag';
      grupper: Gruppe[];
      /** Stillingsprosenten læreren er ansatt i. Er den større enn fag og funksjoner, fordeles resten også. */
      stilling?: number;
    }
  | { type: 'stilling'; prosent: number; arsramme: Arsrammevalg | null };

export interface Fordelingsinndata {
  undervisning: Undervisningsgrunnlag;
  funksjon: Reduksjon;
  /** Funksjoner i prosent av full stilling som ikke utvider planfestet tid. 0 når alle utvider (standard). */
  funksjonUtenUtvidelse?: number;
  moterPerUke: number;
}

/** Beskjeftigelse (B) og undervisningstimer (U) for grunnlaget, med trinnene. F er funksjonsprosenten. */
function undervisning(hent: Hent, u: Undervisningsgrunnlag, F: Operand): { B: Operand; U: Operand; trinn: Trinn[]; advarsler: AdvarselId[] } {
  if (u.type === 'fag') {
    const b = beregnBeskjeftigelse(hent, u.grupper);
    const U: Operand = {
      navn: 'arstimer',
      verdi: b.grupper.reduce((s, g) => s + g.timer.verdi, 0),
      enhet: 'timer',
      opprinnelse: 'trinn',
      liste: b.grupper.map((g) => g.timer.verdi),
    };
    return { B: b.sum, U, trinn: b.trinn, advarsler: b.advarsler };
  }
  const S = inndata('stilling', u.prosent, 'prosent');
  const b = trinn('undervisning_fra_stilling', { stilling: S, funksjonsprosent: F }, 'beskjeftigelse', 'prosent', Math.max(0, u.prosent - F.verdi));
  const advarsler: AdvarselId[] = u.prosent - F.verdi < -1e-9 ? ['funksjon_over_stilling'] : [];
  if (b.resultat.verdi === 0) return { B: b.resultat, U: inndata('arstimer', 0, 'timer'), trinn: [b], advarsler };
  if (!u.arsramme) throw new Regelfeil('Velg årsramme for undervisningen i stillingen.');
  const ramme = velgArsramme(hent, [u.arsramme], false);
  const t = trinn('arstimer_fra_stilling', { stilling: b.resultat, arsramme: ramme.arsramme }, 'arstimer', 'timer', (b.resultat.verdi * ramme.arsramme.verdi) / 100);
  return { B: b.resultat, U: t.resultat, trinn: [b, ...ramme.trinn, t], advarsler };
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
  /** Uker i arbeidsåret (196 dager ÷ 5), utvidet når planfestet tid går over grensen. Til visning av timer per uke. */
  arbeidsaarUker: Operand;
  /** Dager arbeidsåret er utvidet med (0 når planfestet tid er innenfor grensen). */
  utvidelseDager: Operand;
  /** Høyeste planfestede tid per uke i snitt (37,5), til forklaringen. */
  planfestetMaksUke: Operand;
  deler: Fordelingsdel[];
}

export function beregnFordeling(hent: Hent, inn: Fordelingsinndata): Fordelingsresultat {
  const f = funksjonsprosent(hent, inn.funksjon);
  const F = f.prosent;
  const G = inn.funksjonUtenUtvidelse ?? 0;
  const utenUtvidelse = G > 0 ? inndata('funksjon_uten_utvidelse', G, 'prosent') : null;
  // Undervisningen fra stillingsprosent er stillingen minus alle funksjonene.
  const alleFunksjoner: Operand = utenUtvidelse ? { navn: 'funksjoner', verdi: F.verdi + G, enhet: 'prosent', opprinnelse: 'inndata', liste: [F.verdi, G] } : F;
  const u = undervisning(hent, inn.undervisning, alleFunksjoner);
  const undervisningstimer = u.U;
  const arsverk = regel(hent, 'sfs2213.arsverk_timer', 'arsverk', 'timer');
  const planfestet = regel(hent, 'sfs2213.planfestet_timer', 'planfestet', 'timer');
  const B = u.B;

  // Den delen av en oppgitt stilling som ikke er fylt med fag og funksjoner, regnes som undervisningsdelen.
  const oppgitt = inn.undervisning.type === 'fag' ? inn.undervisning.stilling : undefined;
  const restTrinn: Trinn[] = [];
  let Bdel = B;
  let oppgittStilling: Operand | null = null;
  if (oppgitt !== undefined && oppgitt - (B.verdi + alleFunksjoner.verdi) > 1e-9) {
    oppgittStilling = inndata('stilling', oppgitt, 'prosent');
    const rest = trinn(
      'ikke_fordelt',
      { stilling: oppgittStilling, beskjeftigelse: B, funksjoner: alleFunksjoner },
      'ikke_fordelt',
      'prosent',
      oppgitt - B.verdi - alleFunksjoner.verdi,
    );
    const del = trinn('undervisningsdel', { beskjeftigelse: B, ikke_fordelt: rest.resultat }, 'undervisningsdel', 'prosent', B.verdi + rest.resultat.verdi);
    restTrinn.push(rest, del);
    Bdel = del.resultat;
  }

  // Med stillingsprosent er stillingen oppgitt. Med fag er den undervisning + funksjoner, eller den oppgitte stillingen
  // når den er større.
  const stilling =
    inn.undervisning.type === 'stilling'
      ? { resultat: inndata('stilling', Math.max(inn.undervisning.prosent, alleFunksjoner.verdi), 'prosent'), trinn: [] as Trinn[] }
      : oppgittStilling
        ? { resultat: oppgittStilling, trinn: [] as Trinn[] }
        : (() => {
          const t = utenUtvidelse
            ? trinn('stilling_alle_funksjoner', { beskjeftigelse: B, funksjonsprosent: F, funksjon_uten_utvidelse: utenUtvidelse }, 'stilling', 'prosent', B.verdi + F.verdi + G)
            : trinn('stilling', { beskjeftigelse: B, funksjonsprosent: F }, 'stilling', 'prosent', B.verdi + F.verdi);
          return { resultat: t.resultat, trinn: [t] };
        })();
  const arsverkStilling = trinn('arsverk_stilling', { arsverk, stilling: stilling.resultat }, 'arsverk_stilling', 'timer', (arsverk.verdi * stilling.resultat.verdi) / 100);
  const planU = trinn('planfestet_undervisning', { planfestet, beskjeftigelse: Bdel }, 'planfestet_undervisning', 'timer', (planfestet.verdi * Bdel.verdi) / 100);
  const utvidende = trinn('funksjonstid', { arsverk, funksjonsprosent: F }, 'funksjonstid', 'timer', (arsverk.verdi * F.verdi) / 100);
  // Funksjonstid i planfestet tid: funksjonene som utvider (årsverk × F) og planfestet del av dem som ikke utvider.
  const funksjonTrinn: Trinn[] = [utvidende];
  let funksjonstid = utvidende;
  if (utenUtvidelse) {
    const del = trinn(
      'funksjonstid_uten_utvidelse',
      { planfestet, funksjon_uten_utvidelse: utenUtvidelse },
      'funksjonstid_uten_utvidelse',
      'timer',
      (planfestet.verdi * G) / 100,
    );
    funksjonstid = trinn('funksjonstid_i_alt', { funksjonstid: utvidende.resultat, funksjonstid_uten_utvidelse: del.resultat }, 'funksjonstid_i_alt', 'timer', utvidende.resultat.verdi + del.resultat.verdi);
    funksjonTrinn.push(del, funksjonstid);
  }
  const skolearUker = regel(hent, 'sfs2213.skolear_uker', 'skolear_uker', 'uker');
  const motetid = trinn('motetid', { moter: inndata('moter_per_uke', inn.moterPerUke, 'timer_per_uke'), uker: skolearUker }, 'motetid', 'timer', inn.moterPerUke * skolearUker.verdi);
  const annen = trinn(
    'annen_planfestet',
    { planfestet_undervisning: planU.resultat, undervisning: undervisningstimer, motetid: motetid.resultat },
    'annen_planfestet',
    'timer',
    planU.resultat.verdi - undervisningstimer.verdi - motetid.resultat.verdi,
  );
  // Møtetid som går over den planfestede tiden for undervisningen, tas fra funksjonstiden.
  const moteTrinn: Trinn[] = [];
  let funksjonsdel = funksjonstid.resultat.verdi;
  let moterForStore = false;
  if (annen.resultat.verdi < -1e-9) {
    const over = -annen.resultat.verdi;
    const flytt = trinn(
      'motetid_i_funksjon',
      { motetid: motetid.resultat, planfestet_undervisning: planU.resultat, undervisning: undervisningstimer },
      'motetid_i_funksjon',
      'timer',
      Math.min(over, funksjonstid.resultat.verdi),
    );
    const igjen = trinn('funksjonstid_etter_moter', { funksjonstid: funksjonstid.resultat, motetid_i_funksjon: flytt.resultat }, 'funksjonstid_etter_moter', 'timer', funksjonstid.resultat.verdi - flytt.resultat.verdi);
    moteTrinn.push(flytt, igjen);
    funksjonsdel = igjen.resultat.verdi;
    moterForStore = over > funksjonstid.resultat.verdi + 1e-9;
  }
  const selv = utenUtvidelse
    ? trinn(
        'selvdisponert_med_funksjon',
        { arsverk, planfestet, beskjeftigelse: Bdel, funksjon_uten_utvidelse: utenUtvidelse },
        'selvdisponert_stilling',
        'timer',
        ((arsverk.verdi - planfestet.verdi) * (Bdel.verdi + G)) / 100,
      )
    : trinn('selvdisponert_stilling', { arsverk, planfestet, beskjeftigelse: Bdel }, 'selvdisponert_stilling', 'timer', ((arsverk.verdi - planfestet.verdi) * Bdel.verdi) / 100);

  // Planfestet tid i alt. Går den over grensen for arbeidsåret, utvides arbeidsåret (punkt 5.3).
  const planfestetStilling = trinn(
    'planfestet_stilling',
    { planfestet_undervisning: planU.resultat, funksjonstid: funksjonstid.resultat },
    'planfestet_stilling',
    'timer',
    planU.resultat.verdi + funksjonstid.resultat.verdi,
  );
  const aar = arbeidsaaret(hent);
  const maksUke = regel(hent, 'sfs2213.planfestet_maks_uke', 'planfestet_maks_uke', 'timer_per_uke');
  const maks = trinn('planfestet_maks', { uker: aar.uker, maks_uke: maksUke }, 'planfestet_maks', 'timer', aar.uker.verdi * maksUke.verdi);
  const aarTrinn: Trinn[] = [planfestetStilling, ...aar.trinn, maks];
  let uker = aar.uker;
  let utvidelseDager: Operand = { navn: 'utvidelse_dager', verdi: 0, enhet: 'dager', opprinnelse: 'trinn' };
  if (planfestetStilling.resultat.verdi > maks.resultat.verdi + 1e-9) {
    const over = trinn('utvidelse_timer', { planfestet: planfestetStilling.resultat, maks: maks.resultat }, 'utvidelse_timer', 'timer', planfestetStilling.resultat.verdi - maks.resultat.verdi);
    const perDag = regel(hent, 'sfs2213.timer_per_dag', 'timer_per_dag', 'timer');
    const dager = trinn('utvidelse_dager', { timer: over.resultat, per_dag: perDag }, 'utvidelse_dager', 'dager', over.resultat.verdi / perDag.verdi);
    const perUke = regel(hent, 'sfs2213.arbeidsdager_per_uke', 'arbeidsdager_per_uke', 'dager');
    const utvidet = trinn(
      'arbeidsaar_uker_utvidet',
      { uker: aar.uker, dager: dager.resultat, per_uke: perUke },
      'arbeidsaar_uker_utvidet',
      'uker',
      aar.uker.verdi + dager.resultat.verdi / perUke.verdi,
    );
    aarTrinn.push(over, dager, utvidet);
    uker = utvidet.resultat;
    utvidelseDager = dager.resultat;
  }

  const advarsler = new Set<AdvarselId>(u.advarsler);
  if (stilling.resultat.verdi > 100 + 1e-9) advarsler.add('over_hel_stilling');
  if (moterForStore) advarsler.add('motetid_for_stor');

  const trinnliste: Trinn[] = [...f.trinn, ...u.trinn, ...restTrinn, ...stilling.trinn, arsverkStilling, planU, motetid, annen, ...funksjonTrinn, ...moteTrinn, selv, ...aarTrinn];
  return {
    beskjeftigelse: B,
    funksjonsprosent: F,
    stilling: stilling.resultat,
    arsverk: arsverkStilling.resultat,
    arbeidsaarUker: uker,
    utvidelseDager,
    planfestetMaksUke: maksUke,
    deler: [
      { id: 'undervisning', timer: undervisningstimer.verdi, planfestet: true },
      { id: 'motetid', timer: motetid.resultat.verdi, planfestet: true },
      { id: 'annen_planfestet', timer: Math.max(0, annen.resultat.verdi), planfestet: true },
      { id: 'funksjonstid', timer: funksjonsdel, planfestet: true },
      { id: 'selvdisponert', timer: selv.resultat.verdi, planfestet: false },
    ],
    trinn: trinnliste,
    advarsler: [...advarsler],
  };
}
