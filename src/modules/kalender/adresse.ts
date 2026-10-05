// Valgene i kalenderen står i adressen (avgjørelse 066), så sidene kan lenke til en ferdig filtrert kalender, f.eks.
// `#/kalender?tema=eksamen&vis=privatister`. Gamle gruppenavn fra Inntak (`ungdom`, `fortrinn`) virker fortsatt.
import { FRISTGRUPPER, KALENDERTEMAER, type Fristgruppe, type Kalendertema } from '../../core/innhold/kalendertema.ts';

export const kalenderRute = '/kalender';

export type Visning = 'rullende' | 'skolear';

export interface Kalendervalg {
  visning: Visning;
  /** Skoleåret (året det starter) når visningen er skoleår. Null: inneværende. */
  aar: number | null;
  tema: Kalendertema | null;
  gruppe: Fristgruppe | null;
}

const GAMLE_GRUPPER: Record<string, Fristgruppe> = { ungdom: 'elever', fortrinn: 'fortrinnsrett' };

export function lesValg(sporring: URLSearchParams): Kalendervalg {
  const tema = sporring.get('tema');
  const vis = sporring.get('vis') ?? '';
  const gruppe = GAMLE_GRUPPER[vis] ?? vis;
  const aar = Number(sporring.get('aar'));
  return {
    visning: sporring.get('visning') === 'skolear' ? 'skolear' : 'rullende',
    aar: Number.isInteger(aar) && aar > 2000 ? aar : null,
    tema: (KALENDERTEMAER as readonly string[]).includes(tema ?? '') ? (tema as Kalendertema) : null,
    gruppe: (FRISTGRUPPER as readonly string[]).includes(gruppe) ? (gruppe as Fristgruppe) : null,
  };
}

/** Spørringen for valgene, uten det som er standard. */
export function sporringFor(v: Kalendervalg): Record<string, string> {
  return {
    ...(v.visning === 'skolear' ? { visning: 'skolear' } : {}),
    ...(v.visning === 'skolear' && v.aar !== null ? { aar: String(v.aar) } : {}),
    ...(v.tema ? { tema: v.tema } : {}),
    ...(v.gruppe ? { vis: v.gruppe } : {}),
  };
}

/** Adressen til kalenderen med et filter, f.eks. `/kalender?tema=inntak`, til lenker og bokser i modulene. */
export function kalenderLenke(tema: Kalendertema | null, gruppe: Fristgruppe | null = null): string {
  const q = new URLSearchParams(sporringFor({ visning: 'rullende', aar: null, tema, gruppe })).toString();
  return q ? `${kalenderRute}?${q}` : kalenderRute;
}
