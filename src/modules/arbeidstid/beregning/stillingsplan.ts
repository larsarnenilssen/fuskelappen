// Stillingsplan for én lærer: undervisning i fag og funksjoner i prosent av stillingen, sammenlignet med
// stillingsprosenten. Differansen er teknisk undertid (negativ) eller teknisk overtid (positiv), og kan
// regnes om til årsrammetimer i et valgt fag: differanse × årsramme ÷ 100 (eiers beslutning 29.09.2026).
import { beregnBeskjeftigelse, type Gruppe, type Gruppeberegning } from './beskjeftigelse.ts';
import type { Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, trinn } from './verdier.ts';
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

export interface ArslonnResultat extends Utregning {
  arslonn: Operand;
}

/** Årslønn i stillingen: årslønn i hel stilling × stillingsprosent ÷ 100. */
export function beregnArslonn(hent: Hent, lonn: Lonnsgrunnlag, stilling: number): ArslonnResultat {
  const hel = arslonn(hent, lonn);
  const t = trinn('arslonn_stilling', { arslonn: hel, stilling: inndata('stilling', stilling, 'prosent') }, 'arslonn_stilling', 'kroner', (hel.verdi * stilling) / 100);
  return { arslonn: t.resultat, trinn: [t], advarsler: [] };
}
