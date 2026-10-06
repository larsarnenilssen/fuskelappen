// Veiene for lærlinger og kandidater og utgangspunktene med overgangene (fase 6, pakke 6, avgjørelse 069), fra
// content/opplaeringslop/veier.yaml. Lastes først når siden eller søket trenger dem.
import { useEffect, useState } from 'preact/hooks';
import type { Flerspraak, Innholdselement, KildeRef, Utgangspunktelement, Vanligelement, Veielement } from '../../../core/innhold/skjema.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/opplaeringslop/*.yaml', { import: 'default' });

export const FAGBREV_RUTE = '/opplaeringslop/laerlinger-og-kandidater';
export const PROVE_RUTE = '/vurdering/fag-og-svenneproven';

export interface Veiinnhold {
  veier: Veielement[];
  utgangspunkter: Utgangspunktelement[];
  /** Teksten om oppsigelse og heving av kontrakten, på veiene med kontrakt i bedrift. */
  kontraktSlutt: Vanligelement | undefined;
  /** Linjen om kompetansebevis for elever under målet «Kompetansebevis». */
  kompetansebevis: Vanligelement | undefined;
}

let lopende: Promise<Veiinnhold> | null = null;

export function hentVeier(): Promise<Veiinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((deler) => {
    const alle = deler.flat();
    const etterPlass = <T extends { rekkefolge: number }>(a: T, b: T) => a.rekkefolge - b.rekkefolge;
    const forklaring = (id: string) => alle.find((e): e is Vanligelement => e.id === id && e.type === 'forklaring');
    return {
      veier: alle.filter((e): e is Veielement => e.type === 'vei').sort(etterPlass),
      utgangspunkter: alle.filter((e): e is Utgangspunktelement => e.type === 'utgangspunkt').sort(etterPlass),
      kontraktSlutt: forklaring('lk-kontrakt-slutt'),
      kompetansebevis: forklaring('lk-kompetansebevis-elever'),
    };
  });
  return lopende;
}

/** Veiene, eller null mens de lastes. */
export function useVeier(): Veiinnhold | null {
  const [data, settData] = useState<Veiinnhold | null>(null);
  useEffect(() => {
    let aktiv = true;
    void hentVeier().then((d) => aktiv && settData(d));
    return () => {
      aktiv = false;
    };
  }, []);
  return data;
}

/** Adressen til en vei: id-en uten «vei-», f.eks. `/opplaeringslop/laerlinger-og-kandidater/laerling`. */
export const veiAdresse = (id: string) => id.replace(/^vei-/, '');
export const veiRute = (id: string) => `${FAGBREV_RUTE}/${veiAdresse(id)}`;
/** Utgangspunktet i adressen til «Bytte vei»: id-en uten «fra-». */
export const fraAdresse = (id: string) => id.replace(/^fra-/, '');

export type Overgang = Utgangspunktelement['overganger'][number];

/** Om veien har kontrakt i bedrift, så teksten om oppsigelse og heving hører hjemme der. */
export const harKontrakt = (vei: Veielement) => vei.steg.some((s) => s.del === 'bedrift');

/** Utgangspunktene som har en overgang til veien («Kommer fra»). */
export function kommerFra(data: Veiinnhold, vei: Veielement): { fra: Utgangspunktelement; overgang: Overgang }[] {
  return data.utgangspunkter.flatMap((u) => u.overganger.filter((o) => o.til === vei.id).map((overgang) => ({ fra: u, overgang })));
}

/** Overgangene fra der brukeren står når veien er gått («Veien videre»). */
export function veienVidere(data: Veiinnhold, vei: Veielement): Overgang[] {
  return data.utgangspunkter.find((u) => u.id === vei.etter)?.overganger ?? [];
}

/** Tittelen og adressen overgangen går til: en vei eller en annen side. */
export function maal(data: Veiinnhold, o: Overgang): { tittel: Flerspraak; rute: string } {
  const v = o.til ? data.veier.find((x) => x.id === o.til) : undefined;
  if (v) return { tittel: v.tittel, rute: veiRute(v.id) };
  return o.side ?? { tittel: { nb: o.til ?? '', nn: o.til ?? '' }, rute: FAGBREV_RUTE };
}

export type { KildeRef, Utgangspunktelement, Veielement };
