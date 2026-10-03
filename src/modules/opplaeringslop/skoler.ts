// Skolene og tilbudene deres (avgjørelse 053): skolene fra utdanning.no, koblet til skoleregisteret med
// skolenummeret i VIGO, så appen vet hvilke tilbud skolen brukeren har valgt, har. Rene funksjoner.
import type { Skole } from '../fag/utdanning/skjema.ts';

/** En skole i registeret, med organisasjonsnummeret (som i innstillingene) når VIGO har det. */
export type Skoleoppforing = Skole & { orgnr: string | null };

export function kobleSkoler(skoler: readonly Skole[], orgnr: Readonly<Record<string, string>>): Skoleoppforing[] {
  return skoler.map((s) => ({ ...s, orgnr: s.nr ? (orgnr[s.nr] ?? null) : null }));
}

export interface Skolefilter {
  fylke: string | null;
  tilbud: string | null;
  sok: string;
}

const normaliser = (s: string) => s.toLocaleLowerCase('nb').normalize('NFKD').replace(/[̀-ͯ]/g, '');

/** Skolene som passer filteret: fylket, tilbudet og søketeksten (navn eller sted). */
export function filtrerSkoler(skoler: readonly Skoleoppforing[], f: Skolefilter): Skoleoppforing[] {
  const ord = normaliser(f.sok).split(/\s+/).filter(Boolean);
  return skoler.filter(
    (s) =>
      (!f.fylke || s.fylke === f.fylke) &&
      (!f.tilbud || s.tilbud.includes(f.tilbud)) &&
      ord.every((o) => normaliser(`${s.navn} ${s.sted ?? ''}`).includes(o)),
  );
}

/** Skolen brukeren har valgt i innstillingene, funnet med organisasjonsnummeret. */
export function valgtSkole(skoler: readonly Skoleoppforing[], orgnr: string | null | undefined): Skoleoppforing | null {
  return orgnr ? (skoler.find((s) => s.orgnr === orgnr) ?? null) : null;
}

/** Antall skoler med tilbudet, i fylket eller i hele landet (fylke null). */
export function antallMedTilbud(skoler: readonly Skoleoppforing[], kode: string, fylke: string | null): number {
  return skoler.reduce((n, s) => n + (s.tilbud.includes(kode) && (!fylke || s.fylke === fylke) ? 1 : 0), 0);
}
