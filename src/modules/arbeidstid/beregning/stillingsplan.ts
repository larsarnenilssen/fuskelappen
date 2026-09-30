// Stillingsplan for én lærer: undervisning i fag og funksjoner i prosent av stillingen, sammenlignet med
// stillingsprosenten. Differansen er teknisk undertid (negativ) eller teknisk overtid (positiv), og kan
// regnes om til årsrammetimer i et valgt fag: differanse × årsramme ÷ 100 (eiers beslutning 29.09.2026).
// Funksjoner kan oppgis i årsrammetimer, som gjøres om til prosent med årsrammen for funksjoner (607,5).
// Redusert undervisning etter punkt 6 (livsfasetiltak) regnes som en del av stillingen, som funksjonene (eier 30.09.2026).
import { beregnBeskjeftigelse, type Gruppe, type Gruppeberegning } from './beskjeftigelse.ts';
import type { Arsrammevalg, Elevtall } from './arsrammer.ts';
import { beregnOvertid, beregnVariabelLonn } from './overtid.ts';
import { funksjonsprosent } from './planfestet.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';
import { arslonn, type Lonnsgrunnlag } from './vikar.ts';

export interface Funksjon {
  /** Fritt navn, f.eks. «kontaktlærer». Brukes bare i visningen. */
  navn: string;
  /** Funksjonen i prosent av full stilling. */
  prosent: number;
  /** Funksjonen i årsrammetimer. Er den oppgitt, regnes prosenten ut fra den i stedet. */
  arsrammetimer?: number;
}

export interface Stillingsplan {
  /** Stillingsprosenten læreren er ansatt i, f.eks. 100. */
  stilling: number;
  grupper: readonly Gruppe[];
  funksjoner: readonly Funksjon[];
  /** Gruppen (0, 1, …) med årsrammen differansen regnes om til timer med. null gir bare prosent. */
  timerIGruppe: number | null;
  /** Redusert undervisning etter punkt 6 i prosent av full stilling, eller 0. */
  reduksjon?: number;
}

export interface StillingsplanResultat extends Utregning {
  grupper: Gruppeberegning[];
  undervisning: Operand;
  funksjon: Operand;
  /** Prosenten for hver funksjon, i samme rekkefølge som funksjonene (også dem oppgitt i årsrammetimer). */
  funksjonsprosenter: number[];
  /** Redusert undervisning etter punkt 6, eller null. */
  reduksjon: Operand | null;
  beskjeftigelse: Operand;
  stilling: Operand;
  /** Beskjeftigelse − stilling. Negativ er teknisk undertid, positiv er teknisk overtid. */
  differanse: Operand;
  /** Differansen i årsrammetimer i valgt fag (med fortegn), eller null når fag ikke er valgt. */
  differanseTimer: Operand | null;
  /**
   * Beskjeftigelsen ut over en stilling under 100 %, opp til hel stilling: variabel lønn (eier 30.09.2026).
   * 0 når stillingen er hel eller det ikke er noe ut over den.
   */
  variabel: Operand;
  /** Beskjeftigelsen ut over hel stilling (eller ut over stillingen når den er større): teknisk overtid. */
  overtid: Operand;
  /** Variabel lønn og teknisk overtid i årsrammetimer i valgt fag, når begge finnes og fag er valgt. */
  variabelTimer: Operand | null;
  overtidTimer: Operand | null;
}

/** Funksjonen i prosent av full stilling, også når den er oppgitt i årsrammetimer. */
export function funksjonsprosentFor(hent: Hent, f: Funksjon): number {
  return f.arsrammetimer === undefined ? f.prosent : funksjonsprosent(hent, { type: 'arsrammetimer', timer: f.arsrammetimer }).prosent.verdi;
}

export function beregnStillingsplan(hent: Hent, s: Stillingsplan): StillingsplanResultat {
  const alle: Trinn[] = [];
  const b =
    s.grupper.length > 0
      ? beregnBeskjeftigelse(hent, s.grupper)
      : { grupper: [], sum: inndata('sum_beskjeftigelse', 0, 'prosent'), trinn: [], advarsler: [] };
  alle.push(...b.trinn);
  const undervisning: Operand = { ...b.sum, navn: 'undervisningsprosent' };

  // Funksjoner i årsrammetimer gjøres om til prosent, med eget trinn i utregningen.
  const operander: Operand[] = s.funksjoner.map((f) => {
    if (f.arsrammetimer === undefined) return inndata('funksjon', f.prosent, 'prosent');
    const r = funksjonsprosent(hent, { type: 'arsrammetimer', timer: f.arsrammetimer });
    alle.push(...r.trinn);
    return r.prosent;
  });
  const prosenter = operander.map((o) => o.verdi);
  let funksjon: Operand = operander[0] ?? inndata('funksjon', 0, 'prosent');
  if (prosenter.length > 1) {
    const liste: Operand = { navn: 'funksjoner', verdi: 0, enhet: 'prosent', opprinnelse: 'inndata', liste: prosenter };
    const t = trinn('sum_funksjon', { funksjoner: liste }, 'funksjon', 'prosent', prosenter.reduce((a, p) => a + p, 0));
    alle.push(t);
    funksjon = t.resultat;
  }

  const reduksjon = s.reduksjon ? inndata('redusert_undervisning', s.reduksjon, 'prosent') : null;
  const total = reduksjon
    ? trinn('samlet_med_reduksjon', { undervisning, funksjon, reduksjon }, 'samlet_beskjeftigelse', 'prosent', undervisning.verdi + funksjon.verdi + reduksjon.verdi)
    : trinn('samlet_beskjeftigelse', { undervisning, funksjon }, 'samlet_beskjeftigelse', 'prosent', undervisning.verdi + funksjon.verdi);
  const stilling = inndata('stilling', s.stilling, 'prosent');
  const differanse = trinn('teknisk_differanse', { beskjeftigelse: total.resultat, stilling }, 'teknisk_differanse', 'prosent', total.resultat.verdi - s.stilling);
  alle.push(total, differanse);

  let differanseTimer: Operand | null = null;
  const valgt = s.timerIGruppe === null ? undefined : b.grupper[s.timerIGruppe];
  if (valgt) {
    const t = trinn(
      'teknisk_timer',
      { differanse: differanse.resultat, arsramme: valgt.arsramme },
      'teknisk_timer',
      'arsrammetimer',
      (differanse.resultat.verdi * valgt.arsramme.verdi) / 100,
      s.grupper.length > 1 && s.timerIGruppe !== null ? { gruppe: s.timerIGruppe + 1 } : {},
    );
    alle.push(t);
    differanseTimer = t.resultat;
  }

  // Differansen over stillingen deles i variabel lønn (opp til hel stilling) og teknisk overtid (over hel stilling).
  // Delingen vises som egne trinn bare når det er begge deler. Ellers er den ene delen hele differansen.
  const hel = Math.max(100, s.stilling);
  const variabelVerdi = s.stilling < 100 ? Math.max(0, Math.min(total.resultat.verdi, 100) - s.stilling) : 0;
  const overtidVerdi = Math.max(0, total.resultat.verdi - hel);
  let variabel: Operand = { navn: 'variabel_prosent', verdi: variabelVerdi, enhet: 'prosent', opprinnelse: 'trinn' };
  let overtid: Operand = { navn: 'overtidsprosent', verdi: overtidVerdi, enhet: 'prosent', opprinnelse: 'trinn' };
  let variabelTimer: Operand | null = null;
  let overtidTimer: Operand | null = null;
  if (variabelVerdi > 0 && overtidVerdi > 0) {
    const v = trinn('variabel_prosent', { stilling }, 'variabel_prosent', 'prosent', variabelVerdi);
    const o = trinn('overtidsprosent', { beskjeftigelse: total.resultat }, 'overtidsprosent', 'prosent', overtidVerdi);
    alle.push(v, o);
    variabel = v.resultat;
    overtid = o.resultat;
    if (valgt) {
      const vt = trinn('variabel_timer', { variabel, arsramme: valgt.arsramme }, 'variabel_timer', 'arsrammetimer', (variabelVerdi * valgt.arsramme.verdi) / 100);
      const ot = trinn('overtidstimer', { overtidsprosent: overtid, arsramme: valgt.arsramme }, 'overtidstimer', 'arsrammetimer', (overtidVerdi * valgt.arsramme.verdi) / 100);
      alle.push(vt, ot);
      variabelTimer = vt.resultat;
      overtidTimer = ot.resultat;
    }
  }

  return {
    grupper: b.grupper,
    undervisning,
    funksjon,
    funksjonsprosenter: prosenter,
    reduksjon,
    beskjeftigelse: total.resultat,
    stilling,
    differanse: differanse.resultat,
    differanseTimer,
    variabel,
    overtid,
    variabelTimer,
    overtidTimer,
    trinn: alle,
    advarsler: b.advarsler,
  };
}

/** Differansen i årsrammetimer i hvert fag: hvor mye undervisning som mangler (eller er for mye). */
export function differanseIHvertFag(r: StillingsplanResultat): { arsramme: number; timer: number }[] {
  return r.grupper.map((g) => ({ arsramme: g.arsramme.verdi, timer: (r.differanse.verdi * g.arsramme.verdi) / 100 }));
}

export interface Lonnsinndata {
  lonn: Lonnsgrunnlag;
  /** Stillingsprosenten læreren er ansatt i. */
  stilling: number;
  /** Tillegg i kroner per år, f.eks. godtgjøring for funksjoner (SFS 2213 punkt 9.1). null gir ingen tillegg. */
  tillegg: number | null;
  /**
   * Samlet beskjeftigelse og faget timene regnes om med. Beskjeftigelse ut over en stilling under 100 %, opp til hel
   * stilling, gir variabel lønn. Beskjeftigelse over 100 % gir overtid. null gir ingen av delene.
   */
  overtid: { beskjeftigelse: number; arsrammer: Arsrammevalg[]; elever: Elevtall } | null;
  /** Høyere feriepengesats for arbeidstakere over 60 år. */
  over60: boolean;
}

export interface LonnResultat extends Utregning {
  /** Årslønn i stillingen: årslønn i hel stilling × stillingsprosent ÷ 100. */
  arslonn: Operand;
  tillegg: Operand | null;
  /** Variabel lønn for beskjeftigelse ut over stillingen, opp til hel stilling, eller null. */
  variabel: Operand | null;
  /** Kalkulert tid variabel lønn betales for, eller null. */
  variabelKalkulertTid: Operand | null;
  overtid: Operand | null;
  /** Lønn, tillegg, variabel lønn og overtid i alt. Det er det som utbetales i året. */
  samlet: Operand;
  /** Feriepenger av det som utbetales. Kommer i tillegg, og er ikke med i det samlede beløpet. */
  feriepenger: Operand;
}

/**
 * Lønn i stillingen: årslønn × stillingsprosent ÷ 100, med tillegg, variabel lønn og overtidsbetaling (som i
 * beregnOvertid) når de er valgt. Feriepengene regnes som vanlig i prosent av det som utbetales (hovedtariffavtalen § 7.4.2).
 */
export function beregnLonn(hent: Hent, inn: Lonnsinndata): LonnResultat {
  const hel = arslonn(hent, inn.lonn);
  const lonn = trinn('arslonn_stilling', { arslonn: hel, stilling: inndata('stilling', inn.stilling, 'prosent') }, 'arslonn_stilling', 'kroner', (hel.verdi * inn.stilling) / 100);
  const alle: Trinn[] = [lonn];
  const advarsler: AdvarselId[] = [];
  const tillegg = inn.tillegg !== null ? inndata('funksjonstillegg', inn.tillegg, 'kroner') : null;
  let variabel: Operand | null = null;
  let variabelKalkulertTid: Operand | null = null;
  const variabelProsent = inn.overtid && inn.stilling < 100 ? Math.min(inn.overtid.beskjeftigelse, 100) - inn.stilling : 0;
  if (inn.overtid && variabelProsent > 1e-9) {
    const stilling = inndata('stilling', inn.stilling, 'prosent');
    // Opp til hel stilling: 100 − stilling når beskjeftigelsen er over 100 %, ellers beskjeftigelse − stilling.
    const prosent =
      inn.overtid.beskjeftigelse > 100
        ? trinn('variabel_prosent', { stilling }, 'variabel_prosent', 'prosent', variabelProsent)
        : trinn('variabel_prosent_differanse', { beskjeftigelse: inndata('beskjeftigelse', inn.overtid.beskjeftigelse, 'prosent'), stilling }, 'variabel_prosent', 'prosent', variabelProsent);
    const v = beregnVariabelLonn(hent, { prosent: prosent.resultat, arsrammer: inn.overtid.arsrammer, elever: inn.overtid.elever, lonn: inn.lonn });
    alle.push(prosent, ...v.trinn);
    advarsler.push(...v.advarsler);
    variabel = v.betaling;
    variabelKalkulertTid = v.kalkulertTid;
  }
  let overtid: Operand | null = null;
  if (inn.overtid && inn.overtid.beskjeftigelse > 100) {
    const o = beregnOvertid(hent, { ...inn.overtid, lonn: inn.lonn, over60: inn.over60 });
    // Feriepengene regnes av det samlede beløpet under, ikke av overtiden alene.
    // Årsrammen og timelønnen står allerede i utregningen når variabel lønn er regnet ut.
    const finnes = new Set(alle.map((t) => t.id));
    alle.push(...o.trinn.filter((t) => t.id !== 'feriepenger' && !(variabel && finnes.has(t.id))));
    if (!variabel) advarsler.push(...o.advarsler);
    overtid = o.betaling;
  }
  let samlet = lonn.resultat;
  if (tillegg || variabel || overtid) {
    const t = trinn(
      'lonn_i_alt',
      {
        arslonn: lonn.resultat,
        tillegg: tillegg ?? inndata('funksjonstillegg', 0, 'kroner'),
        variabel: variabel ?? inndata('variabel_lonn', 0, 'kroner'),
        overtid: overtid ?? inndata('overtidsbetaling', 0, 'kroner'),
      },
      'lonn_i_alt',
      'kroner',
      lonn.resultat.verdi + (tillegg?.verdi ?? 0) + (variabel?.verdi ?? 0) + (overtid?.verdi ?? 0),
    );
    alle.push(t);
    samlet = t.resultat;
  }
  const sats = regel(hent, inn.over60 ? 'hta.feriepenger_prosent_over_60' : 'hta.feriepenger_prosent', 'feriepengesats', 'prosent');
  const ferie = trinn('feriepenger', { lonn: samlet, sats }, 'feriepenger', 'kroner', (samlet.verdi * sats.verdi) / 100);
  alle.push(ferie);
  return { arslonn: lonn.resultat, tillegg, variabel, variabelKalkulertTid, overtid, samlet, feriepenger: ferie.resultat, trinn: alle, advarsler };
}
