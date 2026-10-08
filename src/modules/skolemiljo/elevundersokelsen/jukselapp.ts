// Utdraget fra Elevundersøkelsen til dagens jukselapp (avgjørelse 085): mobbing på skolen og indeksene for Vg1, i år og
// året før, for landet, fylkene og skolene (alle skoler samlet for landet og fylkene). Lages når appen bygges
// (virtual:jukselappeu), så hele filen (600 kB) ikke lastes. Vg1 fordi undersøkelsen er obligatorisk der. Skjermede tall
// er ikke med. Ren funksjon, så den kan testes.
import type { Elevundersokelsen } from './skjema.ts';

export interface JukselappEu {
  /** Skoleåret i år og året før. */
  skolear: [naa: string, foer: string];
  /** Indeksene og «Mobbing på skolen», med navnet fra Udir. */
  sporsmal: { kode: string; navn: string; type: 'mobbing' | 'indeks' }[];
  /** Navnet og fylket til hver skole. Landet og fylkene får navnet i appen. */
  skoler: Record<string, [navn: string, fylke: string]>;
  /** Vg1 i år og året før, per enhet («L», «F46», «S…») og spørsmål. */
  verdier: Record<string, Record<string, [naa: number, foer: number | null]>>;
}

const MOBBING = 'EUIndeks_1398';

export function byggJukselappEu(d: Elevundersokelsen): JukselappEu {
  const naa = d.skolear.length - 1;
  const sporsmal = d.sporsmal.filter((s) => s.type === 'indeks' || s.kode === MOBBING).map((s) => ({ kode: s.kode, navn: s.navn, type: s.type }));
  const skoler: JukselappEu['skoler'] = {};
  const verdier: JukselappEu['verdier'] = {};
  for (const [nokkel, perKode] of Object.entries(d.verdier)) {
    const [enhet, eierform] = nokkel.split('|') as [string, string];
    if (eierform !== 'a') continue;
    const rad: Record<string, [number, number | null]> = {};
    for (const s of sporsmal) {
      const aar = perKode[s.kode];
      const v = aar?.[naa]?.[0];
      const f = aar?.[naa - 1]?.[0];
      if (typeof v === 'number') rad[s.kode] = [v, typeof f === 'number' ? f : null];
    }
    if (Object.keys(rad).length === 0) continue;
    verdier[enhet] = rad;
    const info = d.enheter[enhet];
    if (enhet.startsWith('S') && info?.fylke) skoler[enhet] = [info.navn, info.fylke];
  }
  return { skolear: [d.skolear[naa] ?? '', d.skolear[naa - 1] ?? ''], sporsmal, skoler, verdier };
}
