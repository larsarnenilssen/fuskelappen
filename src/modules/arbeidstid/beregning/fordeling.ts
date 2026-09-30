// Fordeling av årsverket i en stilling, til diagrammet i Arbeidsplan.
// Undervisningen kommer fra fagene (årstimer og årsramme). Funksjoner og andre oppgaver kommer fra funksjonsprosenten,
// og møtetiden fra brukeren. Resten av planfestet tid er egentid til andre oppgaver innenfor planfestet tid.
// Møtetid som ikke får plass i den planfestede tiden for undervisningen (f.eks. når stillingen bare er
// funksjon), legges i funksjonstiden, som også er planfestet.
//
// For en stilling med undervisning B % og funksjon F % (SFS 2213 punkt 5.1 og 5.3):
//   planfestet tid for undervisningsdelen = planfestet × B, tid læreren disponerer selv = (årsverk − planfestet) × B,
//   funksjonstid = årsverk × F. Summen er årsverk × (B + F).
// For hel stilling gir dette samme planfestede tid som punkt 5.3 (eier bekreftet 29.09.2026).
// Funksjoner som ikke utvider planfestet tid (G %, eiers valg per funksjon 30.09.2026), fordeles som undervisningen:
//   planfestet del = planfestet × G, tid læreren disponerer selv = (årsverk − planfestet) × G.
//   Redusert undervisning etter punkt 6 (livsfasetiltak) regnes på samme måte (eier 30.09.2026).
// Er stillingsprosenten oppgitt, fordeles den delen av stillingen som ikke er fylt med fag og funksjoner (R),
// som undervisningsdelen: planfestet × R og (årsverk − planfestet) × R. Da viser diagrammet hvor mye planfestet tid
// og tid til egen disposisjon stillingen gir uansett (eiers ønske 30.09.2026).
// For lærere som er 60 år og eldre er årsverket 1650 timer (punkt 4). De 37,5 timene er fem arbeidsdager ekstra ferie,
// så arbeidsåret er fem dager kortere: 191 dager eller 38,2 uker. Planfestet tid er samme andel av årsverket som for
// andre: 1150 × 1650 ÷ 1687,5 (eier 30.09.2026).
// I en periode regnes fordelingen som for et helt år med prosentene i perioden, og timene ganges til slutt med
// periodenøkkelen (dager i perioden ÷ dager i skoleåret). Timene per uke blir da de samme som for et helt år.
// Blir planfestet tid mer enn 37,5 timer per uke i snitt, utvides arbeidsåret som i punkt 5.3, og timene per uke
// regnes med det utvidede arbeidsåret.
import { beregnBeskjeftigelse, beregnPeriodebeskjeftigelse, type Gruppe, type Periode } from './beskjeftigelse.ts';
import { arbeidsaaret, funksjonsprosent, type Reduksjon } from './planfestet.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

export interface Fordelingsinndata {
  grupper: readonly Gruppe[];
  /** Stillingsprosenten læreren er ansatt i. Er den større enn fag og funksjoner, fordeles resten også. */
  stilling?: number;
  funksjon: Reduksjon;
  /** Funksjoner og redusert undervisning i prosent av full stilling som ikke utvider planfestet tid. */
  funksjonUtenUtvidelse?: number;
  moterPerUke: number;
  /** Læreren er 60 år eller eldre: årsverket er 1650 timer (punkt 4), og arbeidsåret fem dager kortere. */
  over60?: boolean;
  /** En periode av skoleåret. Fagene er da timer i perioden, og timene i fordelingen gjelder perioden. */
  periode?: Periode;
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
  /** Uker i arbeidsåret (196 dager ÷ 5, eller 191 fra 60 år), utvidet når planfestet tid går over grensen. Til visning av timer per uke. */
  arbeidsaarUker: Operand;
  /** Dager arbeidsåret er utvidet med (0 når planfestet tid er innenfor grensen). */
  utvidelseDager: Operand;
  /** Høyeste planfestede tid per uke i snitt (37,5), til forklaringen. */
  planfestetMaksUke: Operand;
  deler: Fordelingsdel[];
  /** Periodenøkkelen timene er ganget med, eller null for hele skoleåret. */
  periodenokkel: Operand | null;
}

export function beregnFordeling(hent: Hent, inn: Fordelingsinndata): Fordelingsresultat {
  const f = funksjonsprosent(hent, inn.funksjon);
  const F = f.prosent;
  const G = inn.funksjonUtenUtvidelse ?? 0;
  const utenUtvidelse = G > 0 ? inndata('funksjon_uten_utvidelse', G, 'prosent') : null;
  // Alle funksjoner, også dem som ikke utvider planfestet tid.
  const alleFunksjoner: Operand = utenUtvidelse ? { navn: 'funksjoner', verdi: F.verdi + G, enhet: 'prosent', opprinnelse: 'inndata', liste: [F.verdi, G] } : F;
  const b = inn.periode ? beregnPeriodebeskjeftigelse(hent, inn.grupper, inn.periode) : beregnBeskjeftigelse(hent, inn.grupper);
  // Periodenøkkelen, eller 1 for hele skoleåret. Timene i perioden ÷ nøkkelen gir timene på årsbasis.
  const nokkel = b.trinn.find((tr) => tr.id === 'periodenokkel')?.resultat ?? null;
  const k = nokkel?.verdi ?? 1;
  const undervisningstimer: Operand = {
    navn: 'arstimer',
    verdi: b.grupper.reduce((sum, g) => sum + g.timer.verdi, 0) / k,
    enhet: 'timer',
    opprinnelse: 'trinn',
    liste: b.grupper.map((g) => g.timer.verdi),
  };
  const arsverk = regel(hent, inn.over60 ? 'sfs2213.arsverk_timer_60_ar' : 'sfs2213.arsverk_timer', 'arsverk', 'timer');
  // Fra 60 år er planfestet tid samme andel av det kortere årsverket som for andre lærere (eier 30.09.2026):
  // planfestet × årsverk 60 år ÷ årsverk. Den ekstra ferien tas da like mye fra planfestet tid og tiden læreren disponerer selv.
  const planfestetTrinn: Trinn[] = [];
  let planfestet = regel(hent, 'sfs2213.planfestet_timer', 'planfestet', 'timer');
  if (inn.over60) {
    const full = regel(hent, 'sfs2213.arsverk_timer', 'arsverk', 'timer');
    const t = trinn('planfestet_60', { planfestet, arsverk_60: arsverk, arsverk: full }, 'planfestet', 'timer', (planfestet.verdi * arsverk.verdi) / full.verdi);
    planfestetTrinn.push(t);
    planfestet = t.resultat;
  }
  const B = b.sum;

  // Den delen av en oppgitt stilling som ikke er fylt med fag og funksjoner, regnes som undervisningsdelen.
  const oppgitt = inn.stilling;
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
  const stilling = oppgittStilling
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
  const aar = arbeidsaaret(hent, inn.over60 ?? false);
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

  const advarsler = new Set<AdvarselId>(b.advarsler);
  if (stilling.resultat.verdi > 100 + 1e-9) advarsler.add('over_hel_stilling');
  if (moterForStore) advarsler.add('motetid_for_stor');

  const trinnliste: Trinn[] = [...f.trinn, ...b.trinn, ...restTrinn, ...stilling.trinn, arsverkStilling, ...planfestetTrinn, planU, motetid, annen, ...funksjonTrinn, ...moteTrinn, selv, ...aarTrinn];
  return {
    beskjeftigelse: B,
    funksjonsprosent: F,
    stilling: stilling.resultat,
    arsverk: { ...arsverkStilling.resultat, verdi: arsverkStilling.resultat.verdi * k },
    arbeidsaarUker: { ...uker, verdi: uker.verdi * k },
    utvidelseDager: { ...utvidelseDager, verdi: utvidelseDager.verdi * k },
    planfestetMaksUke: maksUke,
    deler: [
      { id: 'undervisning', timer: undervisningstimer.verdi * k, planfestet: true },
      { id: 'motetid', timer: motetid.resultat.verdi * k, planfestet: true },
      { id: 'annen_planfestet', timer: Math.max(0, annen.resultat.verdi) * k, planfestet: true },
      { id: 'funksjonstid', timer: funksjonsdel * k, planfestet: true },
      { id: 'selvdisponert', timer: selv.resultat.verdi * k, planfestet: false },
    ],
    periodenokkel: nokkel,
    trinn: trinnliste,
    advarsler: [...advarsler],
  };
}
