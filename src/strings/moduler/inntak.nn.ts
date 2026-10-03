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
  frister: {
    tittel: 'Søknad og fristar gjennom året',
    kort: 'Fristar',
    beskrivelse: 'Søknadsfristar, svar, ventelister og klage ved inntak til vidaregåande.',
    innledning: 'Fristane ved inntak til vidaregåande opplæring, frå oktober til september. Trykk på ein frist for å lese meir.',
    filter: 'Vis fristane for',
    filtre: { alle: 'Alle', ungdom: 'Ungdom', voksne: 'Vaksne', fortrinn: 'Fortrinnsrett og individuell behandling' },
    grupper: { ungdom: 'Ungdom', voksne: 'Vaksne', fortrinn: 'Fortrinnsrett' },
    aaret: 'Året med eitt blikk',
    ingen: 'ingen fristar',
    enFrist: '1 frist',
    flereFrister: '{antall} fristar',
    naa: 'No',
    nasjonal: 'Nasjonal',
    heleAret: 'Heile året',
    neste: 'Neste frist',
    alle: 'Alle fristane gjennom året',
    tomt: 'Ingen fristar for dette valet.',
  },
};
