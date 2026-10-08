// Lesing av tabellene fra SSBs statistikkbank (PxWebApi v2, json-stat2) til hent-ssb.ts (avgjørelse 090). Ren logikk
// uten nettverk, testet i tests/unit/ssb.test.ts.
//
// - Et svar i json-stat2 har dimensjonene i `id`, antallet koder i hver i `size` og verdiene i én liste i samme
//   rekkefølge (siste dimensjon varierer raskest). Verdier SSB ikke viser (`..`, `.` og `:`), er null.
// - Fylkene har nøklene appen bruker ellers: «L» er landet og «F46» et fylke. Befolknings- og utdanningstabellene
//   koder fylket «46» og landet «0». Kodelisten agg_KommFylker gir «F-46». KOSTRA koder fylkeskommunen «4600» og
//   landet «EAFK».

export interface JsonStat2 {
  id: string[];
  size: number[];
  value: (number | null)[] | Record<string, number | null>;
  dimension: Record<string, { category: { index: Record<string, number> | string[]; label?: Record<string, string> } }>;
  updated?: string;
  note?: string[];
  label?: string;
}

export interface SsbTabell {
  /** Verdien for kodene, én per dimensjon. Null når SSB ikke viser tallet. */
  verdi(koder: Record<string, string>): number | null;
  /** Kodene i en dimensjon, i SSBs rekkefølge (årene eldste først). */
  koder(dimensjon: string): string[];
  oppdatert: string | null;
  merknader: string[];
}

function sorterteKoder(index: Record<string, number> | string[]): string[] {
  if (Array.isArray(index)) return index;
  return Object.entries(index)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k);
}

export function lesJsonStat(svar: unknown): SsbTabell {
  const j = svar as JsonStat2;
  if (!Array.isArray(j?.id) || !Array.isArray(j.size) || !j.dimension || j.value === undefined) throw new Error('Svaret fra SSB er ikke json-stat2.');
  const koder = j.id.map((d) => sorterteKoder(j.dimension[d]?.category.index ?? []));
  const posisjon = koder.map((k) => new Map(k.map((kode, i) => [kode, i])));
  return {
    verdi(valg) {
      let indeks = 0;
      for (let d = 0; d < j.id.length; d++) {
        const navn = j.id[d] ?? '';
        const kode = valg[navn];
        // En dimensjon med én kode trenger ikke å oppgis.
        const p = kode === undefined && j.size[d] === 1 ? 0 : kode === undefined ? undefined : posisjon[d]?.get(kode);
        if (p === undefined) throw new Error(`Koden ${kode ?? '(mangler)'} for ${navn} finnes ikke i tabellen ${j.label ?? ''}.`);
        indeks = indeks * (j.size[d] ?? 1) + p;
      }
      const v = Array.isArray(j.value) ? j.value[indeks] : j.value[String(indeks)];
      return typeof v === 'number' ? v : null;
    },
    koder(dimensjon) {
      const d = j.id.indexOf(dimensjon);
      if (d < 0) throw new Error(`Tabellen ${j.label ?? ''} har ikke dimensjonen ${dimensjon}.`);
      return koder[d] ?? [];
    },
    oppdatert: j.updated ?? null,
    merknader: j.note ?? [],
  };
}

/** Spørringen til PxWebApi v2: `valueCodes[Region]=0,46` osv. `+` i koder (f.eks. «060+») må skrives %2B. */
export function sporring(valg: Record<string, string | readonly string[]>): string {
  return Object.entries(valg)
    .map(([k, v]) => `${k.includes('[') ? k : `valueCodes[${k}]`}=${(typeof v === 'string' ? v : v.join(',')).replace(/\+/g, '%2B')}`)
    .join('&');
}

/** Fylkesnøkkelen appen bruker («F46», «L») fra SSBs kode i befolkningstabellene («46», «F-46», «0»). */
export const enhetFraKode = (kode: string): string => (kode === '0' ? 'L' : `F${kode.replace(/^F-/, '')}`);

/** KOSTRA-koden for fylkeskommunen («4600», Oslo «0300») eller landet («EAFK»). */
export const kostraKode = (enhet: string): string => (enhet === 'L' ? 'EAFK' : `${enhet.slice(1)}00`);

/** Prosent med én desimal, eller null når nevneren mangler. */
export function andel(teller: number | null, nevner: number | null): number | null {
  if (teller === null || nevner === null || nevner === 0) return null;
  return Math.round((teller / nevner) * 1000) / 10;
}

/** Summen av verdiene, eller null når alle mangler. */
export function sum(verdier: readonly (number | null)[]): number | null {
  return verdier.every((v) => v === null) ? null : verdier.reduce<number>((s, v) => s + (v ?? 0), 0);
}

/** SSB skriver i merknadene når det siste året er foreløpig. */
export const harForelopigSisteAar = (t: SsbTabell): boolean => t.merknader.some((m) => /siste årgang er foreløpige/i.test(m));
