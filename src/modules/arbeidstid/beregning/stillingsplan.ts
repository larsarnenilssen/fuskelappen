// Stillingsplan for én lærer: undervisning i fag og funksjoner i prosent av stillingen, sammenlignet med
// stillingsprosenten. Differansen er teknisk undertid (negativ) eller teknisk overtid (positiv), og kan
// regnes om til årsrammetimer i et valgt fag: differanse × årsramme ÷ 100 (eiers beslutning 29.09.2026).
import { beregnBeskjeftigelse, type Gruppe, type Gruppeberegning } from './beskjeftigelse.ts';
import type { Arsrammevalg, Elevtall } from './arsrammer.ts';
import { beregnOvertid } from './overtid.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';
import { arslonn, type Lonnsgrunnlag } from './vikar.ts';

export interface Funksjon {
  /** Fritt navn, f.eks. «kontaktlærer». Brukes bare i visningen. */
  navn: string;
  /** Funksjonen i prosent av full stilling. */
  prosent: number;
}

export interface Stillingsplan {
  /** Stillingsprosenten læreren er ansatt i, f.eks. 100. */
  stilling: number;
  grupper: readonly Gruppe[];
  funksjoner: readonly Funksjon[];
  /** Gruppen (0, 1, …) med årsrammen differansen regnes om til timer med. null gir bare prosent. */
  timerIGruppe: number | null;
}

export interface StillingsplanResultat extends Utregning {
  grupper: Gruppeberegning[];
  undervisning: Operand;
  funksjon: Operand;
  beskjeftigelse: Operand;
  stilling: Operand;
  /** Beskjeftigelse − stilling. Negativ er teknisk undertid, positiv er teknisk overtid. */
  differanse: Operand;
  /** Differansen i årsrammetimer i valgt fag (med fortegn), eller null når fag ikke er valgt. */
  differanseTimer: Operand | null;
}

export function beregnStillingsplan(hent: Hent, s: Stillingsplan): StillingsplanResultat {
  const alle: Trinn[] = [];
  const b =
    s.grupper.length > 0
      ? beregnBeskjeftigelse(hent, s.grupper)
      : { grupper: [], sum: inndata('sum_beskjeftigelse', 0, 'prosent'), trinn: [], advarsler: [] };
  alle.push(...b.trinn);
  const undervisning: Operand = { ...b.sum, navn: 'undervisningsprosent' };

  const prosenter = s.funksjoner.map((f) => f.prosent);
  let funksjon: Operand = inndata('funksjon', prosenter[0] ?? 0, 'prosent');
  if (prosenter.length > 1) {
    const liste: Operand = { navn: 'funksjoner', verdi: 0, enhet: 'prosent', opprinnelse: 'inndata', liste: prosenter };
    const t = trinn('sum_funksjon', { funksjoner: liste }, 'funksjon', 'prosent', prosenter.reduce((a, p) => a + p, 0));
    alle.push(t);
    funksjon = t.resultat;
  }

  const total = trinn('samlet_beskjeftigelse', { undervisning, funksjon }, 'samlet_beskjeftigelse', 'prosent', undervisning.verdi + funksjon.verdi);
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

  return {
    grupper: b.grupper,
    undervisning,
    funksjon,
    beskjeftigelse: total.resultat,
    stilling,
    differanse: differanse.resultat,
    differanseTimer,
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
  /** Fast overtid: samlet beskjeftigelse over 100 % og faget timene regnes om med. null gir ingen overtid. */
  overtid: { beskjeftigelse: number; arsrammer: Arsrammevalg[]; elever: Elevtall } | null;
  /** Høyere feriepengesats for arbeidstakere over 60 år. */
  over60: boolean;
}

export interface LonnResultat extends Utregning {
  /** Årslønn i stillingen: årslønn i hel stilling × stillingsprosent ÷ 100. */
  arslonn: Operand;
  tillegg: Operand | null;
  overtid: Operand | null;
  /** Lønn, tillegg og overtid i alt. Det er det som utbetales i året. */
  samlet: Operand;
  /** Feriepenger av det som utbetales. Kommer i tillegg, og er ikke med i det samlede beløpet. */
  feriepenger: Operand;
}

/**
 * Lønn i stillingen: årslønn × stillingsprosent ÷ 100, med tillegg og overtidsbetaling (som i beregnOvertid) når de
 * er valgt. Feriepengene regnes som vanlig i prosent av det som utbetales (hovedtariffavtalen § 7.4.2).
 */
export function beregnLonn(hent: Hent, inn: Lonnsinndata): LonnResultat {
  const hel = arslonn(hent, inn.lonn);
  const lonn = trinn('arslonn_stilling', { arslonn: hel, stilling: inndata('stilling', inn.stilling, 'prosent') }, 'arslonn_stilling', 'kroner', (hel.verdi * inn.stilling) / 100);
  const alle: Trinn[] = [lonn];
  const advarsler: AdvarselId[] = [];
  const tillegg = inn.tillegg !== null ? inndata('funksjonstillegg', inn.tillegg, 'kroner') : null;
  let overtid: Operand | null = null;
  if (inn.overtid && inn.overtid.beskjeftigelse > 100) {
    const o = beregnOvertid(hent, { ...inn.overtid, lonn: inn.lonn, over60: inn.over60 });
    // Feriepengene regnes av det samlede beløpet under, ikke av overtiden alene.
    alle.push(...o.trinn.filter((t) => t.id !== 'feriepenger'));
    advarsler.push(...o.advarsler);
    overtid = o.betaling;
  }
  let samlet = lonn.resultat;
  if (tillegg || overtid) {
    const t = trinn(
      'lonn_i_alt',
      { arslonn: lonn.resultat, tillegg: tillegg ?? inndata('funksjonstillegg', 0, 'kroner'), overtid: overtid ?? inndata('overtidsbetaling', 0, 'kroner') },
      'lonn_i_alt',
      'kroner',
      lonn.resultat.verdi + (tillegg?.verdi ?? 0) + (overtid?.verdi ?? 0),
    );
    alle.push(t);
    samlet = t.resultat;
  }
  const sats = regel(hent, inn.over60 ? 'hta.feriepenger_prosent_over_60' : 'hta.feriepenger_prosent', 'feriepengesats', 'prosent');
  const ferie = trinn('feriepenger', { lonn: samlet, sats }, 'feriepenger', 'kroner', (samlet.verdi * sats.verdi) / 100);
  alle.push(ferie);
  return { arslonn: lonn.resultat, tillegg, overtid, samlet, feriepenger: ferie.resultat, trinn: alle, advarsler };
}
