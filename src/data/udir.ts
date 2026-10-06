// Data fra udir.no, hentet hver uke (avgjørelse 024 og 037):
// - overordnet del (data/udir/overordnet-del.json),
// - tilbudene i videregående (virtual:tilbud), regnet ut fra Grep og Udir-1 når appen bygges,
// - opplæringskontorene fra NOR (data/udir/opplaeringskontor.json, avgjørelse 053).
// Fag- og timefordelingen står i fagfordeling.ts, så den ikke kommer med i startpakken. Se src/data/README.md.
import type { OverordnetDel } from '../modules/laereplanverket/typer.ts';
import type { Lopmerke } from '../modules/fag/tilbud/kildesamsvar.ts';
import type { Programstruktur, Tilbud } from '../modules/fag/tilbud/modell.ts';
import type { Opplaeringskontorer } from '../modules/opplaeringslop/nor/skjema.ts';
import { enGang } from './enGang.ts';

export const lastOverordnetDel = enGang(() => import('../../data/udir/overordnet-del.json').then((m) => m.default as unknown as OverordnetDel));

/**
 * Et tilbud uten programområdet, som står i fagindeksen. `uenig` er løpene der Grep, VIGO og utdanning.no er
 * uenige, med kildene som har og mangler dem, og `utdanning` koden for lenken til utdanning.no (avgjørelse 052).
 */
export type Tilbudsdata = Omit<Tilbud, 'programomrade'> & { uenig: Readonly<Record<string, Lopmerke>>; utdanning: string | null };

export interface Tilbudene {
  /** Skoleåret fag- og timefordelingen gjelder, f.eks. «2026-2027», eller null uten rundskriv. */
  skolear: string | null;
  struktur: Programstruktur[];
  tilbud: Readonly<Record<string, Tilbudsdata>>;
}

export const lastTilbud = enGang(() => import('virtual:tilbud').then((m) => m.default as Tilbudene));

export const lastOpplaeringskontor = enGang(() => import('../../data/udir/opplaeringskontor.json').then((m) => m.default as unknown as Opplaeringskontorer));
