// Typer for virtuelle moduler og verdier som bygges inn av Vite.

declare module 'virtual:testoppsett' {
  /** Testmoduler fra tests/fixtures/moduler. Tom i produksjon. */
  export const ekstraModuler: Record<string, unknown>;
  /** Testbegreper fra tests/fixtures/innhold/begreper. Tom i produksjon. */
  export const ekstraBegreper: Record<string, () => Promise<unknown>>;
  /** Testregelsett fra tests/fixtures/regler (lokale testverdier). Tom i produksjon. */
  export const ekstraRegelsett: Record<string, unknown>;
  /** Sann i utvikling og testing. */
  export const utvikling: boolean;
}

declare module 'virtual:fagroller' {
  /** Rollen til hver fagkode i tilbudene, regnet ut når appen bygges (avgjørelse 031). */
  const roller: Record<string, 'ordinar' | 'alternativ' | 'vurdering'>;
  export default roller;
  /** Titlene på læreplanene uten «Læreplan i», f.eks. { «FSP01-04»: «Fremmedspråk» }. */
  export const laereplaner: Record<string, string>;
}

declare module 'virtual:tilbud' {
  /** Tilbudene i videregående, regnet ut når appen bygges (avgjørelse 035). Se src/modules/opplaeringslop/data.ts. */
  const data: unknown;
  export default data;
}

declare const __APP_VERSJON__: string;

declare module '*.yaml' {
  /** Validert innhold fra content/ eller rules/ (se scripts/vite/plugins.ts). */
  const data: unknown;
  export default data;
}
