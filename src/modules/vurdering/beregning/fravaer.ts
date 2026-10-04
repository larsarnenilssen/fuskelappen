// Fraværsgrensen i videregående skole (fase 6, pakke 2) etter opplæringsforskrifta § 9-8 og Udirs rundskriv om
// fraværsgrensen. Rene funksjoner uten avhengighet til grensesnittet. Tallene (10 og 15 prosent og 60 minutter) leses
// fra rules/vurdering/ via hent(). Fasittestene FR1–FR8 i tests/fasit/vurdering/ er godkjent av eier 04.10.2026.
//
// Fraværet føres i økter. Grensen i økter er årstimetallet × prosent × 60 ÷ øktlengden. Eleven er innenfor så lenge
// fraværet ikke er mer enn grensen, så grensen gir det største hele antallet økter eleven kan ha (eier 04.10.2026, FR2
// og FR3). Hele årstimetallet brukes alltid, også ved sen oppstart og fagbytte (eier 04.10.2026).
import type { KildeRef } from '../../../core/innhold/skjema.ts';
import { type Oppslag, somTall } from '../../../core/regler/motor.ts';

/** Leser en regelverdi, f.eks. «vurdering.fravaer_grense_prosent». I appen er dette hentVerdi() med brukerens kontekst. */
export type Hent = (nokkel: string) => Oppslag;

/** Litt slakk, så 14 × 60 ÷ 60 ikke blir 13,999… og rundes ned til 13. */
const SLAKK = 1e-9;

const forskrift = (punkt: string): KildeRef => ({ id: 'opplaeringsforskrifta', punkt, url: 'https://lovdata.no/forskrift/2024-06-03-900/§9-8' });
const RUNDSKRIV = 'https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/rundskriv-om-fravarsgrensen/3.-hva-omfattes-av-fravarsgrensen/';
const rundskriv = (punkt: string): KildeRef => ({ id: 'udir-rundskriv-fravarsgrensen', punkt, url: RUNDSKRIV });

/** Én grense: 10 prosent (fraværsgrensen) eller 15 prosent (rektors skjønn). */
export interface Grense {
  prosent: number;
  /** Grensen i klokketimer, uavrundet (f.eks. 11,3). */
  timer: number;
  /** Grensen i økter av valgt lengde, uavrundet (f.eks. 18,67). Er øktene 60 minutter, er det det samme som timer. */
  okter: number;
  /** Det største hele antallet økter som ikke er mer enn grensen (f.eks. 18). */
  innenfor: number;
  /** Det minste hele antallet økter som er over grensen (f.eks. 19). */
  over: number;
}

export interface Fravaerssteg {
  id: 'arstimer' | 'grense' | 'okter' | 'innenfor' | 'skjonn' | 'skjonnOkter' | 'skjonnInnenfor';
  /** Tallene i trinnet. Teksten står i src/strings. */
  verdier: Record<string, number>;
  kilder: KildeRef[];
}

export interface Grenseresultat {
  arstimer: number;
  minutter: number;
  /** Minuttene i en klokketime (60). */
  klokketime: number;
  grense: Grense;
  skjonn: Grense;
  steg: Fravaerssteg[];
}

export interface Grenseinput {
  /** Årstimetallet i faget det skoleåret, i klokketimer (fra Grep eller skrevet inn). */
  arstimer: number;
  /** Lengden på øktene i minutter, f.eks. 45. */
  minutter: number;
  /** Kilden til årstimetallet, f.eks. Grep med fagkoden. Uten kilde er tallet skrevet inn av brukeren. */
  arstimerKilde?: KildeRef | null;
}

function lagGrense(arstimer: number, prosent: number, minutter: number, klokketime: number): Grense {
  const timer = (arstimer * prosent) / 100;
  const okter = (timer * klokketime) / minutter;
  const innenfor = Math.max(0, Math.floor(okter + SLAKK));
  return { prosent, timer, okter, innenfor, over: innenfor + 1 };
}

/** Kaster når timene eller øktlengden ikke kan brukes. */
function sjekk(input: Grenseinput) {
  if (!Number.isFinite(input.arstimer) || input.arstimer <= 0) throw new RangeError('Årstimetallet må være større enn null.');
  if (!Number.isFinite(input.minutter) || input.minutter <= 0) throw new RangeError('Øktlengden må være større enn null.');
}

/** Fraværsgrensen (10 prosent) og grensen for rektors skjønn (15 prosent) i klokketimer og økter. */
export function beregnGrenser(hent: Hent, input: Grenseinput): Grenseresultat {
  sjekk(input);
  const grenseOppslag = hent('vurdering.fravaer_grense_prosent');
  const skjonnOppslag = hent('vurdering.fravaer_skjonn_prosent');
  const timeOppslag = hent('vurdering.klokketime_minutter');
  const klokketime = somTall(timeOppslag);
  const { arstimer, minutter } = input;
  const grense = lagGrense(arstimer, somTall(grenseOppslag), minutter, klokketime);
  const skjonn = lagGrense(arstimer, somTall(skjonnOppslag), minutter, klokketime);
  const iOkter = Math.abs(minutter - klokketime) > SLAKK;

  const steg: Fravaerssteg[] = [
    { id: 'arstimer', verdier: { arstimer }, kilder: [...(input.arstimerKilde ? [input.arstimerKilde] : []), rundskriv('3.5 Hvordan beregnes fraværet')] },
    { id: 'grense', verdier: { arstimer, prosent: grense.prosent, timer: grense.timer }, kilder: [forskrift('§ 9-8 første ledd')] },
  ];
  if (iOkter) steg.push({ id: 'okter', verdier: { timer: grense.timer, klokketime, minutter, okter: grense.okter }, kilder: [rundskriv('3.6 Én time er en klokketime')] });
  steg.push({ id: 'innenfor', verdier: { okter: grense.okter, innenfor: grense.innenfor, over: grense.over }, kilder: [rundskriv('3.5 Hvordan beregnes fraværet')] });
  steg.push({ id: 'skjonn', verdier: { arstimer, prosent: skjonn.prosent, timer: skjonn.timer }, kilder: [forskrift('§ 9-8 fjerde ledd')] });
  if (iOkter) steg.push({ id: 'skjonnOkter', verdier: { timer: skjonn.timer, klokketime, minutter, okter: skjonn.okter }, kilder: [rundskriv('3.6 Én time er en klokketime')] });
  steg.push({ id: 'skjonnInnenfor', verdier: { okter: skjonn.okter, innenfor: skjonn.innenfor }, kilder: [rundskriv('3.4 Skjønn opp til 15 prosent')] });
  return { arstimer, minutter, klokketime, grense, skjonn, steg };
}

/** Fraværet i faget, i økter av valgt lengde. Tomme felt er null. */
export interface Fravaer {
  /** Udokumentert fravær. */
  udokumentert: number;
  /** Helserelatert fravær til grensen ble nådd, med egenmelding, legeerklæring eller uten dokumentasjon. */
  helse: number;
  /**
   * Helserelatert fravær etter at grensen ble nådd, dokumentert av helsepersonell (eller med egenmelding når
   * helsepersonell har dokumentert en tilstand som gir høyere risiko for fravær, § 9-8 tredje ledd).
   */
  helseEtter: number;
  /** Fravær dokumentert med grunnene i § 9-8 andre ledd bokstav b–i (velferd, lovpålagt oppmøte osv.). */
  andre: number;
}

export type Utfall = 'innenfor' | 'skjonn' | 'over';

export interface Fravaersresultat {
  /** Fraværet som teller mot grensen, i økter. */
  teller: number;
  /** Alt fraværet som er lagt inn, i økter. */
  samlet: number;
  /** Helsefravær «etter grensen» som likevel teller, fordi grensen ikke var nådd (§ 9-8 tredje ledd). */
  helseEtterTeller: number;
  /** Fraværet som teller, i prosent av årstimetallet. */
  prosent: number;
  /** Fraværet som teller, i klokketimer. */
  timer: number;
  utfall: Utfall;
  kilder: KildeRef[];
}

/**
 * Hvor mye av fraværet som teller mot grensen, og utfallet. Udokumentert og helserelatert fravær teller til grensen
 * er nådd. Helsefravær dokumentert av helsepersonell etter det teller ikke, og heller ikke fravær dokumentert med
 * grunnene i andre ledd bokstav b–i (§ 9-8 andre og tredje ledd, rundskrivet punkt 3.3). Er grensen ikke nådd, teller
 * helsefraværet «etter grensen» til den er nådd. Rektors skjønn gjelder alt fraværet som teller, også helsefravær med
 * legeerklæring før grensen (eier 04.10.2026, FR8).
 */
export function sjekkFravaer(g: Grenseresultat, f: Fravaer): Fravaersresultat {
  const tall = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
  const udokumentert = tall(f.udokumentert);
  const helse = tall(f.helse);
  const helseEtter = tall(f.helseEtter);
  const andre = tall(f.andre);
  const forGrensen = udokumentert + helse;
  const helseEtterTeller = Math.min(helseEtter, Math.max(0, g.grense.innenfor - forGrensen));
  const teller = forGrensen + helseEtterTeller;
  const timer = (teller * g.minutter) / g.klokketime;
  const prosent = (timer / g.arstimer) * 100;
  const utfall: Utfall = teller <= g.grense.okter + SLAKK ? 'innenfor' : teller <= g.skjonn.okter + SLAKK ? 'skjonn' : 'over';
  return {
    teller,
    samlet: forGrensen + helseEtter + andre,
    helseEtterTeller,
    prosent,
    timer,
    utfall,
    kilder: [forskrift('§ 9-8 andre, tredje og fjerde ledd'), rundskriv('3.3 Fravær som kan dokumenteres')],
  };
}
