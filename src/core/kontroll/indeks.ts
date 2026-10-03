// Kontrollindeksen: for hver kilde, hvilke regelverdier og hvilket innhold som bygger på den, og status for
// eiers kontroll og for den automatiske verdisjekken. Grunnlaget for kontrolloversikten (docs/KONTROLL.md).
import type { KildeEndring } from '../innhold/status.ts';
import { beregnStatus, type Innholdsstatus } from '../innhold/status.ts';
import type { Innholdselement, Kilde } from '../innhold/skjema.ts';
import type { Regelsett, Regelverdi } from '../regler/skjema.ts';
import { verdinokkel, type Verdistatusfil, type VerdistatusPost } from './verdisjekk.ts';

export interface Kontrollverdi {
  type: 'verdi';
  /** «regelsett/nøkkel», samme nøkkel som i verdistatus. */
  id: string;
  regelsett: string;
  nokkel: string;
  punkt: string | null;
  verdi: Regelverdi['verdi'];
  enhet: string | null;
  grunnlag: 'kilde' | 'avledet' | 'praksis';
  harSitat: boolean;
  eier: Innholdsstatus;
  kontrollert: string | null;
  auto: VerdistatusPost | null;
}

/** En kilde et innhold viser til: id i kilderegisteret, punktet og eventuelt avsnittets egen adresse. */
export interface Kontrollkilde {
  id: string;
  punkt: string | null;
  url: string | null;
}

export interface Kontrollinnhold {
  type: 'innhold';
  id: string;
  tittel: string;
  elementtype: Innholdselement['type'];
  fil: string;
  /** Punktene i kilden elementet viser til. Tom når det viser til kilden som helhet. */
  punkter: string[];
  eier: Innholdsstatus;
  kontrollert: string | null;
  /** Spørsmål til eier om det som er usikkert i teksten (avgjørelse 019). */
  sporsmal: string[];
  /** Alle kildene elementet viser til, med punkt. Eier sjekker kontrollspørsmålene mot dem. */
  kilder: Kontrollkilde[];
  /** Paragrafene i Regelverk elementet lenker til («opplaeringsforskrifta/4-19»), for steg og frister. */
  paragrafer?: string[];
}

export interface Kildekontroll {
  kilde: string;
  verdier: Kontrollverdi[];
  innhold: Kontrollinnhold[];
}

/**
 * Bygger indeksen. En regelverdi hører til kilden den oppgir. Et innholdselement hører til hver kilde det
 * oppgir, med punktene det viser til. Kilder uten noe som bygger på dem, er ikke med.
 */
export function lagKontrollindeks(
  kilder: readonly Pick<Kilde, 'id'>[],
  regelsett: readonly Regelsett[],
  innhold: readonly { fil: string; element: Innholdselement }[],
  kildestatus: Readonly<Record<string, KildeEndring | undefined>>,
  verdistatus: Verdistatusfil | null,
  idag: string,
): Kildekontroll[] {
  const perKilde = new Map<string, Kildekontroll>(kilder.map((k) => [k.id, { kilde: k.id, verdier: [], innhold: [] }]));
  const hent = (id: string) => {
    let k = perKilde.get(id);
    if (!k) {
      k = { kilde: id, verdier: [], innhold: [] };
      perKilde.set(id, k);
    }
    return k;
  };

  for (const r of regelsett) {
    for (const [nokkel, v] of Object.entries(r.verdier)) {
      const id = verdinokkel(r.id, nokkel);
      hent(v.kilde.id).verdier.push({
        type: 'verdi',
        id,
        regelsett: r.id,
        nokkel,
        punkt: v.kilde.punkt ?? null,
        verdi: v.verdi,
        enhet: v.enhet ?? null,
        grunnlag: v.grunnlag ?? 'kilde',
        harSitat: v.sitat !== undefined,
        eier: beregnStatus({ kontrollert: v.kontrollert, kilder: [v.kilde] }, kildestatus, idag),
        kontrollert: v.kontrollert?.dato ?? null,
        auto: verdistatus?.verdier[id] ?? null,
      });
    }
  }

  for (const { fil, element } of innhold) {
    const eier = beregnStatus(element, kildestatus, idag);
    for (const ref of element.kilder) {
      const liste = hent(ref.id).innhold;
      let post = liste.find((i) => i.id === element.id && i.fil === fil);
      if (!post) {
        post = {
          type: 'innhold',
          id: element.id,
          tittel: element.tittel.nb,
          elementtype: element.type,
          fil,
          punkter: [],
          eier,
          kontrollert: element.kontrollert?.dato ?? null,
          sporsmal: element.kontrollsporsmal ?? [],
          kilder: element.kilder.map((r) => ({ id: r.id, punkt: r.punkt ?? null, url: r.url ?? null })),
          paragrafer: 'paragrafer' in element ? [...element.paragrafer] : [],
        };
        liste.push(post);
      }
      if (ref.punkt && !post.punkter.includes(ref.punkt)) post.punkter.push(ref.punkt);
    }
  }

  return [...perKilde.values()].filter((k) => k.verdier.length + k.innhold.length > 0);
}

export interface Kontrolltall {
  kontrollert: number;
  kildeEndret: number;
  borKontrolleres: number;
  ikkeKontrollert: number;
  samsvarer: number;
  avvik: number;
  ikkeSjekket: number;
  utenSitat: number;
}

/** Tall for sammendraget. Et innholdselement med flere kilder telles én gang. */
export function tellKontroll(indeks: readonly Kildekontroll[]): Kontrolltall {
  const unike = new Map<string, Kontrollverdi | Kontrollinnhold>();
  for (const k of indeks) for (const p of [...k.verdier, ...k.innhold]) unike.set(`${p.type}:${p.id}`, p);
  const alle = [...unike.values()];
  const verdier = alle.filter((p): p is Kontrollverdi => p.type === 'verdi');
  const eier = (s: Innholdsstatus) => alle.filter((p) => p.eier === s).length;
  return {
    kontrollert: eier('kontrollert'),
    kildeEndret: eier('kilde_endret'),
    borKontrolleres: eier('bor_kontrolleres'),
    ikkeKontrollert: eier('utkast'),
    samsvarer: verdier.filter((v) => v.auto?.status === 'samsvarer').length,
    avvik: verdier.filter((v) => v.auto?.status === 'avvik').length,
    ikkeSjekket: verdier.filter((v) => v.auto?.status === 'ikke_sjekket').length,
    utenSitat: verdier.filter((v) => !v.harSitat && v.grunnlag === 'kilde' && !Array.isArray(v.verdi)).length,
  };
}
