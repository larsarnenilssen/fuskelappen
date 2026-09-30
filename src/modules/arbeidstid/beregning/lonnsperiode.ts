// Lønn for en periode, slik lønnssystemet gjør det (Visma InSchool sender lønnsprosenten og datoene for perioden):
// hele måneder gir hel månedslønn, og en brutt måned gir arbeidsdagene i perioden den måneden ÷ 21,67 av månedslønnen
// (eier 30.09.2026). Andelen av årslønnen er summen ÷ 12. Arbeidsdager er mandag–fredag, også offentlige fridager,
// slik Vestland fylkeskommune regner (eier 30.09.2026).
import type { Hent, Operand, Trinn } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

/** Dato som ÅÅÅÅ-MM-DD. */
export type Dato = string;

const MANEDER_PER_AR = 12;

function tilDato(d: Dato): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return null;
  const dato = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(dato.getTime()) ? null : dato;
}

/** Arbeidsdager (mandag–fredag) fra og med fra til og med til. */
function arbeidsdager(fra: Date, til: Date): number {
  let n = 0;
  for (const d = new Date(fra); d <= til; d.setUTCDate(d.getUTCDate() + 1)) {
    const u = d.getUTCDay();
    if (u !== 0 && u !== 6) n++;
  }
  return n;
}

export interface Lonnsperiode {
  /** Hele måneder i perioden. */
  heleManeder: number;
  /** Arbeidsdager i perioden i brutte måneder. */
  arbeidsdager: number;
  /** Andelen av årslønnen perioden gir. */
  andel: Operand;
  trinn: Trinn[];
}

/** Andelen av årslønnen for perioden fra og med fra til og med til, eller null når datoene mangler eller er ugyldige. */
export function lonnsperiode(hent: Hent, fra: Dato, til: Dato): Lonnsperiode | null {
  const start = tilDato(fra);
  const slutt = tilDato(til);
  if (!start || !slutt || slutt < start) return null;
  const perManed = regel(hent, 'hta.arbeidsdager_per_maned', 'arbeidsdager_per_maned', 'dager');
  let hele = 0;
  let brutte = 0;
  let sum = 0;
  // Hver måned perioden berører: hel måned, eller arbeidsdagene i den delen av måneden perioden dekker.
  for (let ar = start.getUTCFullYear(), mnd = start.getUTCMonth(); ar < slutt.getUTCFullYear() || (ar === slutt.getUTCFullYear() && mnd <= slutt.getUTCMonth()); ) {
    const forste = new Date(Date.UTC(ar, mnd, 1));
    const siste = new Date(Date.UTC(ar, mnd + 1, 0));
    const fraDag = start > forste ? start : forste;
    const tilDag = slutt < siste ? slutt : siste;
    if (fraDag.getTime() === forste.getTime() && tilDag.getTime() === siste.getTime()) {
      hele++;
      sum += 1;
    } else {
      const dager = arbeidsdager(fraDag, tilDag);
      brutte += dager;
      sum += Math.min(1, dager / perManed.verdi);
    }
    mnd++;
    if (mnd === 12) {
      mnd = 0;
      ar++;
    }
  }
  const andel = trinn(
    'lonnsandel_periode',
    { hele_maneder: inndata('hele_maneder', hele, 'tall'), arbeidsdager: inndata('arbeidsdager_brutte', brutte, 'dager'), per_maned: perManed },
    'lonnsandel',
    'faktor',
    sum / MANEDER_PER_AR,
  );
  return { heleManeder: hele, arbeidsdager: brutte, andel: andel.resultat, trinn: [andel] };
}
