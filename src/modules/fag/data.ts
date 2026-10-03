// Fagdataene fra Grep og VIGO lastes i datalaget (src/data/, avgjørelse 049). Denne filen gir dem videre til
// modulene som har brukt den.
export { lastFagindeks, lastFagroller, lastLaereplan } from '../../data/grep.ts';
export { lastFagrelasjoner } from '../../data/vigo.ts';
export type { Fagroller } from '../../data/grep.ts';
