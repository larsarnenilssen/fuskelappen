// UI-tekstar for modulen Inntak på nynorsk. Må ha dei same nøklane som inntak.nb.ts.
import type { inntakNb } from './inntak.nb.ts';

export const inntakNn: typeof inntakNb = {
  tittel: 'Inntak',
  innledning: 'Rettar og søkjarkategoriar ved inntak til vidaregåande opplæring, etter opplæringslova og opplæringsforskrifta. Kvart steg viser fristane og paragrafane i regelverket.',
  veivisere: 'Vegvisarar',
  bareNasjonalt: 'Viser dei nasjonale reglane. Fylket kan ha lokale reglar om inntak.',
  velgFylke: 'Vel fylke',
  lokaleMed: 'Viser også dei lokale reglane om inntak i {fylke}.',
  lokaleMangler: 'Viser dei nasjonale reglane. Appen har ikkje lokale reglar om inntak for {fylke} enno. Sjå den lokale forskrifta om inntak i fylket.',
  ikkeFunnet: 'Fann ikkje vegvisaren.',
};
