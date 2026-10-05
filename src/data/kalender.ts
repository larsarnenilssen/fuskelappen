// Datafilene kalenderen leser i tillegg til fristene (fase 6, pakke 5, avgjørelse 066): skoleruta fra fylkenes
// forskrifter (scripts/hent-skolerute.ts), fylkenes datoer for inntak (scripts/hent-inntak.ts) og vedtatte endringer i
// regelverket (scripts/lovdata/kommende.ts). Hentes
// hver uke i GitHub Actions. Se src/data/README.md.
import type { Inntaksdatoer, KommendeEndringer, Skoleruter } from '../modules/kalender/datatyper.ts';
import { enGang } from './enGang.ts';

export const lastSkoleruter = enGang(() => import('../../data/skolerute/skolerute.json').then((m) => m.default as unknown as Skoleruter));

/** Fylkenes datoer for svar og inntak (scripts/hent-inntak.ts). */
export const lastInntaksdatoer = enGang(() => import('../../data/inntak/datoer.json').then((m) => m.default as unknown as Inntaksdatoer));

export const lastKommende = enGang(() => import('../../data/lovdata/kommende.json').then((m) => m.default as unknown as KommendeEndringer));
