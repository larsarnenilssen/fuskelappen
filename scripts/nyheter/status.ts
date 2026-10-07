// Status for nyhetskildene i kildesjekken (sjekkmetoden «nyheter», avgjørelse 084). Hentingen skriver status for hver
// kilde i data/nyheter/nyheter.json hver dag. Kildesjekken melder en kilde som feilet når den har feilet eller gitt null
// saker i mer enn GRENSE_DAGER dager, så en enkelt dag med feil ikke gir et varsel. Ren funksjon, testet i
// tests/unit/nyheter.test.ts.
import type { Sjekkresultat } from '../kilder/logikk.ts';
import type { Nyheter } from '../../src/modules/nyheter/skjema.ts';

export const GRENSE_DAGER = 2;

/** Resultatet for én oppføring i kilderegisteret, ut fra nyhetskildene som viser til den (`ider`). */
export function nyhetsstatus(nyheter: Nyheter | null, ider: readonly string[], naa: string): Sjekkresultat {
  if (!nyheter) return { status: 'feilet', fingeravtrykk: null, melding: 'Fant ikke data/nyheter/nyheter.json.' };
  const grense = new Date(Date.parse(naa) - GRENSE_DAGER * 86_400_000).toISOString().slice(0, 10);
  const feil = ider.flatMap((id) => {
    const s = nyheter.kilder[id];
    if (!s) return [`${id}: ikke hentet`];
    if (s.status === 'ok' || (s.feilSiden && s.feilSiden > grense)) return [];
    return [`${id}: ${s.status === 'tom' ? 'ingen saker' : 'feilet'} siden ${s.feilSiden ?? '?'}${s.melding ? ` (${s.melding})` : ''}`];
  });
  return feil.length > 0
    ? { status: 'feilet', fingeravtrykk: null, melding: `${feil.join('; ')}. Appen viser sakene fra før.` }
    : { status: 'ok', fingeravtrykk: null, melding: null };
}
