// Byggeklosser for beregningene: operander fra regler, tabeller og inndata, og trinn i utregningen.
import { somTall } from '../../../core/regler/motor.ts';
import type { Enhet, Hent, Operand, Storrelse, Trinn, TrinnId } from './typer.ts';

/** En regelverdi som operand. Alle tariff- og lovverdier kommer inn her, aldri som tall i koden. */
export function regel(hent: Hent, nokkel: string, navn: Storrelse, enhet: Enhet): Operand {
  const oppslag = hent(nokkel);
  return { navn, verdi: somTall(oppslag, nokkel), enhet, opprinnelse: 'regel', oppslag };
}

export function inndata(navn: Storrelse, verdi: number, enhet: Enhet): Operand {
  return { navn, verdi, enhet, opprinnelse: 'inndata' };
}

/** Lager et trinn. Formelen for trinnet står i src/strings (arbeidstid.trinn.<id>.formel). */
export function trinn(
  id: TrinnId,
  operander: Record<string, Operand>,
  navn: Storrelse,
  enhet: Enhet,
  verdi: number,
  ekstra: Partial<Pick<Operand, 'liste'>> & { gruppe?: number } = {},
): Trinn {
  const { gruppe, ...resten } = ekstra;
  return {
    id,
    operander,
    resultat: { navn, verdi, enhet, opprinnelse: 'trinn', ...resten },
    ...(gruppe !== undefined ? { gruppe } : {}),
  };
}

/** Avrunding til visning og fasit. Beregningene bruker alltid uavrundede mellomregninger. */
export function rund(verdi: number, desimaler = 2): number {
  const faktor = 10 ** desimaler;
  return Math.round((verdi + Number.EPSILON * Math.sign(verdi)) * faktor) / faktor;
}
