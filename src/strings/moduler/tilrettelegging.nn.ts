// UI-tekstar for modulen Tilrettelegging på nynorsk. Må ha dei same nøklane som tilrettelegging.nb.ts.
import type { tilretteleggingNb } from './tilrettelegging.nb.ts';

export const tilretteleggingNn: typeof tilretteleggingNb = {
  tittel: 'Tilrettelegging',
  innledning: 'Vegvisarar for tilpassa opplæring, individuell tilrettelegging og særskild språkopplæring i vidaregåande opplæring. Kvart steg viser kven som har ansvaret, kva som skal dokumenterast, fristane og paragrafane i regelverket.',
  veivisere: 'Vegvisarar',
  antallSteg: '{antall} steg',
  figur: {
    tittel: 'Kven får kva',
    alle: 'Alle elevar',
    tilpasset: 'Tilpassa opplæring',
    alleTekst: 'Skolen tilpassar opplæringa i fellesskapet. Det blir ikkje gjort vedtak.',
    noen: 'Nokre få elevar i tillegg',
    individuell: 'Individuell tilrettelegging',
    noenTekst: 'Rettar etter vedtak frå fylkeskommunen:',
    ito: 'Individuelt tilrettelagd opplæring',
    assistanse: 'Personleg assistanse',
    fysisk: 'Fysisk tilrettelegging og hjelpemiddel',
  },
  ikkeFunnet: 'Fann ikkje vegvisaren.',
};
