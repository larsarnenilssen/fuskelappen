// Skolene og tilbudene deres (avgjørelse 053): skolene fra utdanning.no, koblet til skoleregisteret med
// skolenummeret i VIGO, så appen vet hvilke tilbud skolen brukeren har valgt, har. Rene funksjoner.
import type { Fagindeks } from '../fag/skjema.ts';
import type { Skole } from '../fag/utdanning/skjema.ts';
import type { Tilbudene } from './data.ts';

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

/**
 * Løpet til ett tilbud ved skolen: tilbudene ved skolen i samme utdanningsprogram som det bygger på, og som bygger på
 * det, så skolen bare viser treet til tilbudet det er søkt på (eier 03.10.2026).
 */
export function lopetTil(kode: string, ved: readonly string[], indeks: Fagindeks, tilbud: Tilbudene): string[] {
  const program = indeks.programomrader[kode]?.program;
  const iProgram = ved.filter((k) => indeks.programomrader[k]?.program === program);
  const med = new Set([kode]);
  // Oppover: tilbudene ved skolen som tilbudet bygger på.
  const opp = [kode];
  for (let k = opp.pop(); k !== undefined; k = opp.pop()) {
    for (const f of tilbud.tilbud[k]?.fra ?? []) {
      if (iProgram.includes(f) && !med.has(f)) {
        med.add(f);
        opp.push(f);
      }
    }
  }
  // Nedover: tilbudene ved skolen som bygger på tilbudet.
  const ned = [kode];
  for (let k = ned.pop(); k !== undefined; k = ned.pop()) {
    for (const v of iProgram) {
      if (!med.has(v) && (tilbud.tilbud[v]?.fra ?? []).includes(k)) {
        med.add(v);
        ned.push(v);
      }
    }
  }
  return iProgram.filter((k) => med.has(k));
}
