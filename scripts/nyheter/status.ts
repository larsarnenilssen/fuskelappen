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

/** Nyhetskildene i saken: navnet, adressen og fylkene fra kildelisten. */
export interface Nyhetskildeinfo {
  id: string;
  navn: { nb: string };
  url: string;
}

/**
 * Teksten i saken om nyhetskilder som ikke har kunnet hentes på mer enn GRENSE_DAGER dager (etikett «nyheter»,
 * avgjørelse 085), eller null når alle virker. Saken oppdateres hver dag av arbeidsflyten Nyheter.
 */
export function nyhetsvarsel(nyheter: Nyheter, kilder: readonly Nyhetskildeinfo[], naa: string): string | null {
  const grense = new Date(Date.parse(naa) - GRENSE_DAGER * 86_400_000).toISOString().slice(0, 10);
  const dato = (iso: string) => iso.split('-').reverse().join('.');
  const linjer = kilder.flatMap((k) => {
    const s = nyheter.kilder[k.id];
    if (!s || s.status === 'ok' || !s.feilSiden || s.feilSiden > grense) return [];
    const hva =
      s.status === 'tom'
        ? `har ikke gitt noen saker siden ${dato(s.feilSiden)}. Siden kan ha fått nytt oppsett, eller filteret slipper ikke gjennom noe.`
        : `har ikke kunnet hentes siden ${dato(s.feilSiden)}${s.melding ? ` (${s.melding})` : ''}.`;
    return [`- **${k.navn.nb}** (\`${k.id}\`) ${hva} [Kilden](${k.url})`];
  });
  if (linjer.length === 0) return null;
  return [
    `Nyhetene hentes hver morgen. Kildene under har ikke kunnet hentes på mer enn ${GRENSE_DAGER} dager. Appen viser sakene som ble hentet før, men ingen nye fra dem.`,
    '',
    ...linjer,
    '',
    '**Hva du gjør:** En kilde som er nede noen dager, kommer ofte tilbake av seg selv. Da lukkes saken automatisk. Står en kilde her i mer enn en uke, har den trolig fått ny adresse eller nytt oppsett. Gi Claude lenken til denne saken, så kan kilden rettes, eller tas ut og føres i `docs/KILDER-IKKE-MED.md`.',
  ].join('\n');
}
