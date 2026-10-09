// Skiller feil som går over av seg selv (nett, tidsavbrudd, serveren er nede) fra feil som tyder på at kilden har
// endret format eller at leseren har en feil (avgjørelse 099). Brukes i kontrollsaken og i saken om feil i
// automatikken. Ren logikk uten avhengigheter, så varsle.yml kan kjøre den med Node uten npm ci. Testet i
// tests/unit/varsel.test.ts.

export type Feiltype = 'format' | 'nett' | 'ukjent';

/** Programfeil, uventet svar og valideringsfeil i leserne. Slike feil går ikke over av seg selv. */
const FORMAT = new RegExp(
  [
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'RangeError',
    'Cannot read propert',
    'Cannot destructure',
    'is not a function',
    'is not iterable',
    'is not defined',
    'Unexpected token',
    'Unexpected end of JSON',
    'not valid JSON',
    'ZodError',
    'invalid_type',
    'passer ikke skjemaet',
    'Uvente(t|de)',
    'ikke ut som ventet',
    'ser ufullstendig ut',
    'innhold appen ikke leser',
    'Fant ikke (innholdet|tabell|rundskrivet)',
    'ny struktur',
    'Formatet kan være endret',
    'har ikke dimensjonen',
    'finnes ikke i tabellen',
    'Ugyldig',
    'svarte 40[45]\\b',
    'svarte 410\\b',
  ].join('|'),
  'i',
);

/** Nett, tidsavbrudd, for mange forespørsler og feil hos serveren. */
const NETT =
  /fetch failed|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|UND_ERR|socket hang up|other side closed|timeout|timed out|tidsavbrudd|aborted|svarte (408|429|5\d\d)\b|certificate|network/i;

/**
 * Hva slags feil en melding eller et loggutdrag ser ut til å være. «TypeError: fetch failed» er Nodes melding for en
 * nettverksfeil og regnes ikke som programfeil.
 */
export function feiltype(tekst: string): Feiltype {
  const renset = tekst.replace(/TypeError: fetch failed/gi, 'fetch failed');
  if (FORMAT.test(renset)) return 'format';
  if (NETT.test(renset)) return 'nett';
  return 'ukjent';
}

/** Teksten eier får når en kilde ser ut til å ha endret format (oppdraget fra eier 09.10.2026). */
export const FORMATRAD = 'Kilden ser ut til å ha endret format – send lenken til denne saken til Claude.';
