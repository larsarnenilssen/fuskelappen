// Bygger koblingen fra fagkode til faget på NDLA (data/ndla/fag.json) fra taksonomien til NDLA, kontrollerer den og
// finner endringene siden forrige henting (avgjørelse 053). Rene funksjoner, testes i tests/unit/ndla.test.ts.
import type { Ndla, Ndlafag } from '../../src/modules/fag/ndla/skjema.ts';

/** Et fag i taksonomien slik API-et gir det (`/taxonomy/v1/nodes?nodeType=SUBJECT`). Bare feltene som brukes. */
export interface Ndlanode {
  name: string;
  url?: string | null;
  translations?: { name: string; language: string }[] | null;
  metadata?: { grepCodes?: string[] | null; visible?: boolean | null; customFields?: Record<string, string> | null } | null;
}

/**
 * Fagkodene i fagindeksen som et aktivt, synlig fag på NDLA oppgir i grepCodes. NDLA oppgir også kompetansemålsett
 * (KV…) og læreplaner; bare fagkodene brukes, fordi fagarkene i appen er per fagkode. Arkiverte fag (eldre
 * læreplaner) og fag som ikke vises på ndla.no, tas ikke med.
 */
export function byggNdla(noder: readonly Ndlanode[], fagkoder: ReadonlySet<string>, hentet: string): Ndla {
  const fag: Record<string, Ndlafag[]> = {};
  for (const n of noder) {
    const md = n.metadata;
    if (!md?.visible || md.customFields?.subjectCategory !== 'active') continue;
    const sti = n.url ?? '';
    if (!/^\/f\/\S+$/.test(sti)) continue;
    const navn = (sprak: string) => n.translations?.find((t) => t.language === sprak)?.name || n.name;
    for (const kode of new Set(md.grepCodes ?? [])) {
      if (!fagkoder.has(kode)) continue;
      (fag[kode] ??= []).push({ navn: { nb: navn('nb'), nn: navn('nn') }, sti });
    }
  }
  const sortert = Object.entries(fag)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => [k, v.sort((a, b) => a.navn.nb.localeCompare(b.navn.nb, 'nb'))] as const);
  return { kilde: 'ndla', hentet, lisens: 'CC BY 4.0', fag: Object.fromEntries(sortert) };
}

/** Feil som gjør at de nye dataene ikke tas inn (forrige fil blir stående). */
export function validerNdla(d: Ndla): string[] {
  const feil: string[] = [];
  const antall = Object.keys(d.fag).length;
  if (antall < 100) feil.push(`Fant bare ${antall} fagkoder med fag på NDLA.`);
  if (!d.fag.SAK1001) feil.push('Fant ikke samfunnskunnskap (SAK1001).');
  return feil;
}

/** Endringene mellom to hentinger, én linje per endring, til kildesjekken og kontrollsaken. */
export function sammenlignNdla(gammel: Ndla | null, ny: Ndla): string[] {
  if (!gammel) return [];
  const par = (d: Ndla) => new Set(Object.entries(d.fag).flatMap(([k, v]) => v.map((f) => `${k} → ${f.navn.nb}`)));
  const g = par(gammel);
  const n = par(ny);
  const nye = [...n].filter((p) => !g.has(p));
  const borte = [...g].filter((p) => !n.has(p));
  const ut: string[] = [];
  if (nye.length > 0) ut.push(`Nye koblinger (${nye.length}): ${nye.slice(0, 10).join(', ')}${nye.length > 10 ? ' …' : ''}`);
  if (borte.length > 0) ut.push(`Fjernede koblinger (${borte.length}): ${borte.slice(0, 10).join(', ')}${borte.length > 10 ? ' …' : ''}`);
  return ut;
}
