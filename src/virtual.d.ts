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

declare module 'virtual:jukselappfag' {
  /** Fagene til dagens jukselapp: kode, navn på bokmål og nynorsk, årstimer og årsramme (t60, t45). Avgjørelse 085. */
  const fag: [string, string, string, number, number, number][];
  export default fag;
}

declare module 'virtual:fagsok' {
  /** Programområdene, fagkodene og årstimene til fagsøket i kalkulatorene, fra fagindeksen (avgjørelse 049). */
  const data: {
    programomrader: Record<string, Record<string, [string, string][]>>;
    fagkoder: Record<string, [string, string][]>;
    arstimer: Record<string, number | null>;
  };
  export default data;
}

declare module 'virtual:tilbud' {
  /** Tilbudene i videregående, regnet ut når appen bygges (avgjørelse 035). Se src/modules/opplaeringslop/data.ts. */
  const data: unknown;
  export default data;
}

declare const __APP_VERSJON__: string;
/** Sann i testversjonen som publiseres under test/ (avgjørelse 045). */
declare const __TESTVERSJON__: boolean;

declare module '*.yaml' {
  /** Validert innhold fra content/ eller rules/ (se scripts/vite/plugins.ts). */
  const data: unknown;
  export default data;
}

declare module 'virtual:begrepsord' {
  /** Lenkeordene til de nasjonale begrepene, til lenker i innledninger og hjelpetekster (avgjørelse 050). */
  const ord: { id: string; fylke: string | null; ord: { nb: string[]; nn: string[] } }[];
  export default ord;
}

declare module 'virtual:skoler' {
  /** Skolene og tilbudene deres, med organisasjonsnummeret fra VIGO (avgjørelse 053). Se src/data/utdanning.ts. */
  const data: unknown;
  export default data;
}
