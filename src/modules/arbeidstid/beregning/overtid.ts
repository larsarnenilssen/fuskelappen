// Fast overtid: beskjeftigelse ut over 100 % betales som overtid.
// SFS 2213 punkt 5.2: overtidsbetaling gis for det antall timer årsrammen for undervisning er økt med.
// Hovedtariffavtalen § 6.4 og § 12.4: tillegget regnes ut fra timelønn for undervisning; § 6.5.3: 50 % tillegg.
// Overtidsbetaling = overtidstimer × kalkulert tid per time × timelønn × (100 + 50) ÷ 100.
import { type Arsrammevalg, type Elevtall, velgArsramme } from './arsrammer.ts';
import type { AdvarselId, Hent, Operand, Trinn, Utregning } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';
import { type Lonnsgrunnlag, timelonnForUndervisning } from './vikar.ts';

export interface Overtid {
  /** Samlet beskjeftigelse i prosent, f.eks. 110. */
  beskjeftigelse: number;
  /** Faget overtiden gjelder (årsrammen timene regnes om med). */
  arsrammer: Arsrammevalg[];
  elever: Elevtall;
  lonn: Lonnsgrunnlag;
}

export interface OvertidResultat extends Utregning {
  /** Undervisningstimer i overtid: overtidsprosenten regnet om med fagets årsramme. */
  overtidstimer: Operand;
  /** Arbeidstimene det betales for (HTA § 12.4). */
  kalkulertTid: Operand;
  timelonn: Operand;
  betaling: Operand;
}

export function beregnOvertid(hent: Hent, o: Overtid): OvertidResultat {
  const valg = velgArsramme(hent, o.arsrammer, o.elever);
  const advarsler: AdvarselId[] = valg.manglerElevtall ? ['mangler_elevtall'] : [];
  const b = inndata('beskjeftigelse', o.beskjeftigelse, 'prosent');
  const prosent = trinn('overtidsprosent', { beskjeftigelse: b }, 'overtidsprosent', 'prosent', Math.max(0, o.beskjeftigelse - 100));
  const timer = trinn('overtidstimer', { overtidsprosent: prosent.resultat, arsramme: valg.arsramme }, 'overtidstimer', 'arsrammetimer', (prosent.resultat.verdi * valg.arsramme.verdi) / 100);
  const konstant = regel(hent, 'hta.timelonn_konstant', 'timelonn_konstant', 'tall');
  const kalkulert = trinn(
    'kalkulert_tid_overtid',
    { timer: timer.resultat, konstant, arsramme: valg.arsramme },
    'kalkulert_tid',
    'timer',
    (timer.resultat.verdi * konstant.verdi) / valg.arsramme.verdi,
  );
  const tl = timelonnForUndervisning(hent, o.lonn);
  const tillegg = regel(hent, 'hta.overtidstillegg_prosent', 'overtidstillegg', 'prosent');
  const betaling = trinn(
    'overtidsbetaling',
    { kalkulert_tid: kalkulert.resultat, timelonn: tl.resultat, tillegg },
    'overtidsbetaling',
    'kroner',
    (kalkulert.resultat.verdi * tl.resultat.verdi * (100 + tillegg.verdi)) / 100,
  );
  const alle: Trinn[] = [...valg.trinn, prosent, timer, kalkulert, tl, betaling];
  return { overtidstimer: timer.resultat, kalkulertTid: kalkulert.resultat, timelonn: tl.resultat, betaling: betaling.resultat, trinn: alle, advarsler };
}
