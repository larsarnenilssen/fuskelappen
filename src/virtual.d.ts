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

declare const __APP_VERSJON__: string;

declare module '*.yaml' {
  /** Validert innhold fra content/ eller rules/ (se scripts/vite/plugins.ts). */
  const data: unknown;
  export default data;
}
