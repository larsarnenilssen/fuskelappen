// Kortnavn for fagene i Arbeidsplan og Beskjeftigelse (eier 09.10.2026): navnet i overskriften på et lukket fagkort, i
// søkefeltet øverst i kortet og i stolpen over stillingen, i stedet for «Fag 1», «Fag 2» osv. Grep har ikke egne
// kortnavn, så navnet kortes inn til høyst tre ord.

/** Så mange ord kan et kortnavn ha. Står det flere, vises de første og «…». */
export const MAKS_ORD = 3;

/** Navnet med høyst `maksOrd` ord, f.eks. «Norsk hovedmål, skriftlig» eller «Kommunikasjon og samhandling …». */
export function kortnavn(navn: string, maksOrd = MAKS_ORD): string {
  const ord = navn.trim().split(/\s+/).filter(Boolean);
  if (ord.length <= maksOrd) return ord.join(' ');
  return `${ord
    .slice(0, maksOrd)
    .join(' ')
    .replace(/[,;:·-]+$/, '')}…`;
}

/** Navn som er like, får et nummer etter det første: «Engelsk», «Engelsk (2)». */
export function unikeNavn(navn: readonly string[]): string[] {
  const telling = new Map<string, number>();
  return navn.map((n) => {
    const nr = (telling.get(n) ?? 0) + 1;
    telling.set(n, nr);
    return nr > 1 ? `${n} (${nr})` : n;
  });
}
