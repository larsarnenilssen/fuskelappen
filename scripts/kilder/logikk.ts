// Ren logikk for kildejobben: fingeravtrykk og status. Testes i tests/unit/kildejobb.test.ts.
// Varslene (den ukentlige kontrollsaken) lages i ukesrapport.ts.
import { createHash } from 'node:crypto';
import type { KildestatusPost } from '../../src/core/kildestatus/kildestatus.ts';

export interface Sjekkresultat {
  status: 'ok' | 'endret' | 'feilet';
  fingeravtrykk: string | null;
  melding: string | null;
}

export { normaliserTekst } from '../../src/core/kontroll/tekst.ts';

export function lagFingeravtrykk(tekst: string): string {
  return `sha256:${createHash('sha256').update(tekst, 'utf8').digest('hex')}`;
}

/**
 * Sammenligner med fingeravtrykket eier har godkjent. Uten godkjent avtrykk får kilden status «endret», så den
 * kommer med i kontrollsaken og kan godkjennes. Saken og kontrolloversikten viser den som ny (erNyKilde).
 */
export function vurderMotGodkjent(fingeravtrykk: string, godkjent: string | null): Sjekkresultat {
  if (godkjent === fingeravtrykk) return { status: 'ok', fingeravtrykk, melding: null };
  return {
    status: 'endret',
    fingeravtrykk,
    melding: godkjent === null ? 'Ny kilde, ikke godkjent ennå.' : 'Innholdet er endret siden forrige godkjenning.',
  };
}

/**
 * En kilde uten godkjent fingeravtrykk i kilderegisteret er ny. Det finnes ingen godkjent tekst å sammenligne
 * med, så den merkes «Ny kilde, ikke godkjent ennå» og ikke «Endret siden …» (sak #92).
 */
export function erNyKilde(kilde: { godkjent_fingeravtrykk?: string | null } | undefined): boolean {
  return kilde !== undefined && !kilde.godkjent_fingeravtrykk;
}

/** Lager ny statuspost og tar vare på når en endring først ble oppdaget. */
export function nyPost(forrige: KildestatusPost | undefined, r: Sjekkresultat, naa: string): KildestatusPost {
  if (r.status === 'feilet') {
    return {
      status: 'feilet',
      sjekket: naa,
      fingeravtrykk: forrige?.fingeravtrykk ?? null,
      endret_siden: forrige?.endret_siden ?? null,
      melding: r.melding,
    };
  }
  const sammeEndring = forrige?.status === 'endret' && forrige.fingeravtrykk === r.fingeravtrykk && forrige.endret_siden;
  return {
    status: r.status,
    sjekket: naa,
    fingeravtrykk: r.fingeravtrykk,
    endret_siden: r.status === 'endret' ? (sammeEndring ? forrige.endret_siden : naa) : null,
    melding: r.melding,
  };
}
