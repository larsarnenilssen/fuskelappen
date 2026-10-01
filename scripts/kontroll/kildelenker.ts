// Lenker til kildene eier kan sjekke et kontrollspørsmål eller en praksis mot: navnet på kilden, punktet og
// adressen (avsnittets egen adresse når innholdet oppgir den). Brukes i kontrolloversikten og kontrollrundene.
import type { Kilderegister, Praksis } from '../../src/core/innhold/skjema.ts';
import type { Kildekontroll, Kontrollkilde } from '../../src/core/kontroll/indeks.ts';

/**
 * «[Navn](adresse), punkt 5.1 og 5.2; [Navn](adresse)». Punktene samles per kilde. Har en henvisning egen adresse
 * (et avsnitt), står den for seg. Ukjente kilder vises med id.
 */
export function kildelenker(kilder: readonly Kontrollkilde[], register: Pick<Kilderegister, 'kilder'>): string {
  const grupper = new Map<string, { id: string; url: string | null; punkter: string[] }>();
  for (const k of kilder) {
    const kilde = register.kilder.find((r) => r.id === k.id);
    const url = k.url ?? kilde?.url ?? null;
    const nokkel = `${k.id}|${url ?? ''}`;
    const g = grupper.get(nokkel) ?? { id: k.id, url, punkter: [] };
    grupper.set(nokkel, g);
    if (k.punkt && !g.punkter.includes(k.punkt)) g.punkter.push(k.punkt);
  }
  const punkt = (p: string) => (/^\d/.test(p) ? `punkt ${p}` : p);
  return [...grupper.values()]
    .map((g) => {
      const navn = register.kilder.find((r) => r.id === g.id)?.navn ?? g.id;
      const lenke = g.url ? `[${navn}](${g.url})` : navn;
      const p = g.punkter.map(punkt);
      return p.length === 0 ? lenke : `${lenke}: ${p.length === 1 ? p[0] : `${p.slice(0, -1).join(', ')} og ${p[p.length - 1]}`}`;
    })
    .join('; ');
}

/** Kildene bak det en praksis berører: kilden og punktet til hver regelverdi, og kildene til hvert innhold. */
export function praksiskilder(p: Pick<Praksis, 'berorer'>, indeks: readonly Kildekontroll[]): Kontrollkilde[] {
  const ut: Kontrollkilde[] = [];
  for (const b of p.berorer) {
    for (const k of indeks) {
      for (const v of k.verdier) if (v.id === b) ut.push({ id: k.kilde, punkt: v.punkt, url: null });
      for (const i of k.innhold) if (i.id === b) ut.push(...i.kilder);
    }
  }
  return ut;
}
