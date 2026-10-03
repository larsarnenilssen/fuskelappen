// Bygger løpene fra utdanning.no (data/utdanning/lop.json) fra API-et, kontrollerer dem og finner endringene siden
// forrige henting (avgjørelse 052). Rene funksjoner, testes i tests/unit/utdanning.test.ts.
import type { Utdanningslop } from '../../src/modules/fag/utdanning/skjema.ts';

/** Et barn i løpet slik API-et gir det (`/vgs/lop?parent_path=…`). Bare feltene som brukes. */
export interface Lopsbarn {
  programomradekode10: string;
  programomrade_tittel?: string | null;
  is_krysslop?: boolean | null;
}

const sortert = <V>(o: Record<string, V>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

/** Løpene fra kantene (fra → barn) og titlene som er hentet. */
export function byggUtdanningslop(kanter: readonly { fra: string; barn: Lopsbarn }[], titler: Readonly<Record<string, string>>, hentet: string): Utdanningslop {
  const videre: Record<string, Set<string>> = {};
  const kryss: Record<string, Set<string>> = {};
  const noder: Record<string, string> = { ...titler };
  for (const { fra, barn } of kanter) {
    const til = barn.programomradekode10;
    if (!til || til === fra) continue;
    (videre[fra] ??= new Set()).add(til);
    if (barn.is_krysslop) (kryss[fra] ??= new Set()).add(til);
    if (barn.programomrade_tittel) noder[til] = barn.programomrade_tittel;
  }
  const liste = (o: Record<string, Set<string>>) => sortert(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [...v].sort()])));
  return { kilde: 'utdanning-no', hentet, noder: sortert(noder), videre: liste(videre), kryss: liste(kryss) };
}

/** Feil som gjør at de nye dataene ikke tas inn (forrige fil blir stående). */
export function validerUtdanningslop(l: Utdanningslop): string[] {
  const feil: string[] = [];
  const kanter = Object.values(l.videre).flat().length;
  if (Object.keys(l.noder).length < 200) feil.push(`Fant bare ${Object.keys(l.noder).length} programområder.`);
  if (kanter < 400) feil.push(`Fant bare ${kanter} koblinger i løpene.`);
  if (!Object.keys(l.videre).some((k) => k.startsWith('STUSP1'))) feil.push('Fant ikke løpet fra Vg1 studiespesialisering.');
  return feil;
}

/** Endringene mellom to hentinger, én linje per endring, til kildesjekken og kontrollsaken. */
export function sammenlignUtdanningslop(gammel: Utdanningslop | null, ny: Utdanningslop): string[] {
  if (!gammel) return [];
  const par = (l: Utdanningslop) => new Set(Object.entries(l.videre).flatMap(([a, t]) => t.map((b) => `${a} → ${b}`)));
  const g = par(gammel);
  const n = par(ny);
  const nye = [...n].filter((p) => !g.has(p));
  const borte = [...g].filter((p) => !n.has(p));
  const ut: string[] = [];
  if (nye.length > 0) ut.push(`Nye koblinger (${nye.length}): ${nye.slice(0, 10).join(', ')}${nye.length > 10 ? ' …' : ''}`);
  if (borte.length > 0) ut.push(`Fjernede koblinger (${borte.length}): ${borte.slice(0, 10).join(', ')}${borte.length > 10 ? ' …' : ''}`);
  return ut;
}
