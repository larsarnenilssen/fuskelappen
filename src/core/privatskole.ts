// Privatskoler (fase 7, avgjørelse 075): appen er skrevet for fylkeskommunale skoler. Når brukeren har valgt
// «Privatskole» i innstillingene (eller en privat skole), viser appen privatskolelova og forskriften til den der reglene
// er ulike: en merknad i kortet eller steget (`privatskole` på innholdselementet), og paragrafene i
// privatskoleforskrifta i stedet for de samme reglene i opplæringsforskrifta (content/privatskole/paralleller.yaml).
// Rene funksjoner.
import lovverk from '../../content/lovverk.yaml';
import parallellerFil from '../../content/privatskole/paralleller.yaml';
import type { KildeRef } from './innhold/skjema.ts';

/** Lovene og forskriftene i Lov og forskrift som gjelder privatskoler (`privatskole: true` i content/lovverk.yaml). */
export const PRIVATSKOLEDOKUMENTER: ReadonlySet<string> = new Set(
  (lovverk as { dokumenter: { id: string; privatskole?: boolean }[] }).dokumenter.filter((d) => d.privatskole).map((d) => d.id),
);

interface Parallell {
  fra: string;
  til: string;
}

/** Parallellene: «opplaeringsforskrifta/9-3» → «privatskoleforskrifta/6-35». */
const PARALLELLER: ReadonlyMap<string, string> = new Map(
  ((parallellerFil as { paralleller: Parallell[] }).paralleller ?? []).map((p) => [p.fra, p.til]),
);

/** Dokumentet og paragrafene i en kilde: `{ id: 'opplaeringsforskrifta', punkt: '§ 9-3 andre ledd' }`. */
const dokumentParagraf = /^§\s*(\d+-\d+[a-z]?)(.*)$/;

/**
 * Kildene for en privatskole: en kilde med en paragraf i opplæringsforskrifta som har en parallell i
 * privatskoleforskrifta, får paragrafen i privatskoleforskrifta i stedet. Resten av punktet (f.eks. «andre ledd»)
 * tas ikke med, fordi leddene ikke alltid er like. Andre kilder står som før.
 */
export function privatskolekilder(kilder: readonly KildeRef[]): KildeRef[] {
  return kilder.map((k) => {
    const m = dokumentParagraf.exec(k.punkt ?? '');
    const til = m ? PARALLELLER.get(`${k.id}/${m[1] ?? ''}`) : undefined;
    if (!til) return k;
    const [dokument, nr] = til.split('/');
    return { id: dokument ?? k.id, punkt: `§ ${nr ?? ''}` };
  });
}

/** Parallellen til en paragraf, eller null: `opplaeringsforskrifta/9-3` → `privatskoleforskrifta/6-35`. */
export const parallellTil = (ref: string): string | null => PARALLELLER.get(ref) ?? null;
