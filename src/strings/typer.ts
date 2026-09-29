import type { nb } from './nb.ts';

type Tekstskjema<T> = { [K in keyof T]: T[K] extends string ? string : Tekstskjema<T[K]> };

/** Formen på tekstene. nn.ts typer mot denne, så manglende nøkler gir byggefeil. */
export type Tekster = Tekstskjema<typeof nb>;

type Stier<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Stier<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Alle gyldige tekstnøkler, f.eks. "forside.tittel". */
export type Tekstnokkel = Stier<Tekster>;

export type Malform = 'nb' | 'nn';
