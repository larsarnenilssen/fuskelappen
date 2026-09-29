// Vikartimer: endret beskjeftigelse for ansatte i stilling, og lønn for timevikarer.
// Timelønn etter hovedtariffavtalen kap. 1 § 12.4: (årslønn × 1400 × 100) ÷ (årsramme × 1687,5 × 112),
// her delt i kalkulert tid (1400 ÷ årsramme per time) og timelønn (årslønn ÷ 1687,5 × 100 ÷ 112).
import { Regelfeil, somTabell } from '../../../core/regler/motor.ts';
import { type Arsrammevalg, type Elevtall, velgArsramme } from './arsrammer.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

export interface Vikartimer {
  arsrammer: Arsrammevalg[];
  elever: Elevtall;
  okter: number;
  minutter: number;
}

function timerOgRamme(hent: Hent, v: Vikartimer) {
  const valg = velgArsramme(hent, v.arsrammer, v.elever);
  const timer = trinn(
    'vikartimer',
    { okter: inndata('antall_okter', v.okter, 'okter'), minutter: inndata('minutter_per_okt', v.minutter, 'minutter') },
    'vikartimer',
    'timer',
    (v.okter * v.minutter) / 60,
  );
  const advarsler: AdvarselId[] = valg.manglerElevtall ? ['mangler_elevtall'] : [];
  return { valg, timer, advarsler };
}

export interface VikarFastResultat extends Utregning {
  endring: Operand;
}

/** Hvor mye beskjeftigelsen øker når en ansatt i stilling tar vikartimer: timer ÷ årsramme × 100. */
export function beregnVikarFast(hent: Hent, v: Vikartimer): VikarFastResultat {
  const { valg, timer, advarsler } = timerOgRamme(hent, v);
  const endring = trinn(
    'endring_beskjeftigelse',
    { vikartimer: timer.resultat, arsramme: valg.arsramme },
    'endring_beskjeftigelse',
    'prosent',
    (timer.resultat.verdi / valg.arsramme.verdi) * 100,
  );
  return { endring: endring.resultat, trinn: [...valg.trinn, timer, endring], advarsler };
}

export type Lonnsgrunnlag =
  | { type: 'garantilonn'; stillingsgruppe: string; ansiennitet: number }
  | { type: 'manuell'; arslonn: number };

export interface Timevikar extends Vikartimer {
  lonn: Lonnsgrunnlag;
  over60: boolean;
}

export interface TimevikarResultat extends Utregning {
  kalkulertTid: Operand;
  timelonn: Operand;
  lonn: Operand;
  feriepenger: Operand;
  samlet: Operand;
}

export interface Garantilonnsrad {
  id: string;
  navn: string;
  lonn: Record<number, number>;
}

/** Leser tabellen «hta.garantilonn» (kolonner ar_0, ar_6 …). */
export function lesGarantilonn(hent: Hent): Garantilonnsrad[] {
  return somTabell(hent('hta.garantilonn'), 'hta.garantilonn').map((r) => {
    if (typeof r.id !== 'string' || typeof r.navn !== 'string') throw new Regelfeil('Ugyldig rad i hta.garantilonn');
    const lonn: Record<number, number> = {};
    for (const [k, v] of Object.entries(r)) {
      const m = /^ar_(\d+)$/.exec(k);
      if (m && typeof v === 'number') lonn[Number(m[1])] = v;
    }
    return { id: r.id, navn: r.navn, lonn };
  });
}

function arslonn(hent: Hent, l: Lonnsgrunnlag): Operand {
  if (l.type === 'manuell') return inndata('arslonn', l.arslonn, 'kroner');
  const rad = lesGarantilonn(hent).find((r) => r.id === l.stillingsgruppe);
  const verdi = rad?.lonn[l.ansiennitet];
  if (!rad || verdi === undefined) throw new Regelfeil(`Fant ikke garantilønn for ${l.stillingsgruppe}, ${l.ansiennitet} år`);
  return { navn: 'arslonn', verdi, enhet: 'kroner', opprinnelse: 'tabell', oppslag: hent('hta.garantilonn'), rad: rad.navn };
}

/** Timelønn for undervisning uten feriepenger: årslønn ÷ 1687,5 × 100 ÷ 112 (§ 12.4), per time kalkulert tid. */
export function timelonnForUndervisning(hent: Hent, l: Lonnsgrunnlag): Trinn {
  const o = {
    arslonn: arslonn(hent, l),
    arsverk: regel(hent, 'hta.timelonn_arsverk_timer', 'arsverk', 'timer'),
    teller: regel(hent, 'hta.timelonn_ferie_teller', 'ferie_teller', 'tall'),
    nevner: regel(hent, 'hta.timelonn_ferie_nevner', 'ferie_nevner', 'tall'),
  };
  return trinn('timelonn', o, 'timelonn', 'kroner_per_time', ((o.arslonn.verdi / o.arsverk.verdi) * o.teller.verdi) / o.nevner.verdi);
}

/** Lønn for timevikar: kalkulert tid × timelønn, med feriepenger i tillegg. */
export function beregnTimevikar(hent: Hent, v: Timevikar): TimevikarResultat {
  const { valg, timer, advarsler } = timerOgRamme(hent, v);
  const konstant = regel(hent, 'hta.timelonn_konstant', 'timelonn_konstant', 'tall');
  const kalkulert = trinn(
    'kalkulert_tid',
    { vikartimer: timer.resultat, konstant, arsramme: valg.arsramme },
    'kalkulert_tid',
    'timer',
    (timer.resultat.verdi * konstant.verdi) / valg.arsramme.verdi,
  );

  const timelonn = timelonnForUndervisning(hent, v.lonn);
  const lonn = trinn('lonn', { kalkulert_tid: kalkulert.resultat, timelonn: timelonn.resultat }, 'lonn', 'kroner', kalkulert.resultat.verdi * timelonn.resultat.verdi);
  const sats = regel(hent, v.over60 ? 'hta.feriepenger_prosent_over_60' : 'hta.feriepenger_prosent', 'feriepengesats', 'prosent');
  const ferie = trinn('feriepenger', { lonn: lonn.resultat, sats }, 'feriepenger', 'kroner', (lonn.resultat.verdi * sats.verdi) / 100);
  const samlet = trinn('samlet_lonn', { lonn: lonn.resultat, feriepenger: ferie.resultat }, 'samlet_lonn', 'kroner', lonn.resultat.verdi + ferie.resultat.verdi);
  const alle: Trinn[] = [...valg.trinn, timer, kalkulert, timelonn, lonn, ferie, samlet];
  return {
    kalkulertTid: kalkulert.resultat,
    timelonn: timelonn.resultat,
    lonn: lonn.resultat,
    feriepenger: ferie.resultat,
    samlet: samlet.resultat,
    trinn: alle,
    advarsler,
  };
}
