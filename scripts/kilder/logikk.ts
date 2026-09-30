// Ren logikk for kildejobben: fingeravtrykk, status og varsler. Testes i tests/unit/kilder.test.ts.
import { createHash } from 'node:crypto';
import type { Kilde } from '../../src/core/innhold/skjema.ts';
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

/** Sammenligner med fingeravtrykket eier har godkjent. Uten godkjent avtrykk regnes kilden som endret. */
export function vurderMotGodkjent(fingeravtrykk: string, godkjent: string | null): Sjekkresultat {
  if (godkjent === fingeravtrykk) return { status: 'ok', fingeravtrykk, melding: null };
  return {
    status: 'endret',
    fingeravtrykk,
    melding: godkjent === null ? 'Ingen godkjent fingeravtrykk ennå.' : 'Innholdet er endret siden forrige godkjenning.',
  };
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

// ---------- Varsler (GitHub-issues) ----------

export const ETIKETT = 'kilde';

export interface AapenSak {
  nummer: number;
  kildeId: string;
  tilstand: string;
}

export type Handling =
  | { type: 'opprett'; kildeId: string; tittel: string; tekst: string }
  | { type: 'oppdater'; nummer: number; kildeId: string; tekst: string; kommentar: string }
  | { type: 'lukk'; nummer: number; kildeId: string; kommentar: string };

export function tittelFor(kilde: Pick<Kilde, 'id' | 'navn'>): string {
  return `[kilde:${kilde.id}] ${kilde.navn}`;
}

function tilstandsmerke(post: KildestatusPost): string {
  return `${post.status}:${post.fingeravtrykk ?? '-'}:${post.melding ?? ''}`;
}

export function lesMerke(tekst: string | null | undefined): { kildeId: string; tilstand: string } | null {
  const treff = /<!-- protokollen-kilde:([a-z0-9-]+) tilstand:(.*?) -->/.exec(tekst ?? '');
  return treff?.[1] && treff[2] !== undefined ? { kildeId: treff[1], tilstand: treff[2] } : null;
}

export function saksTekst(kilde: Pick<Kilde, 'id' | 'navn' | 'url' | 'godkjent_fingeravtrykk'>, post: KildestatusPost): string {
  const linjer =
    post.status === 'feilet'
      ? [
          `Kildesjekken for **${kilde.navn}** feilet.`,
          '',
          `- Melding: ${post.melding ?? 'ukjent feil'}`,
          `- Sjekket: ${post.sjekket}`,
          `- Kilde: ${kilde.url}`,
          '',
          'Innholdet i appen er ikke endret. Saken lukkes automatisk når sjekken virker igjen.',
        ]
      : [
          `Kilden **${kilde.navn}** har et nytt fingeravtrykk som må godkjennes.`,
          '',
          `- Kilde: ${kilde.url}`,
          `- Nytt fingeravtrykk: \`${post.fingeravtrykk ?? '-'}\``,
          `- Godkjent fingeravtrykk: \`${kilde.godkjent_fingeravtrykk ?? 'ingen ennå'}\``,
          `- Oppdaget: ${post.endret_siden ?? post.sjekket}`,
          '',
          '**Slik behandles saken (se docs/EIER.md):**',
          '1. Åpne kilden og se hva som er endret.',
          '2. Vurder om innhold i appen må oppdateres.',
          '3. Gi beskjed om at fingeravtrykket er godkjent. Saken lukkes automatisk ved neste kjøring etter at `godkjent_fingeravtrykk` er oppdatert i `content/kilder.yaml`.',
        ];
  return [...linjer, '', `<!-- protokollen-kilde:${kilde.id} tilstand:${tilstandsmerke(post)} -->`].join('\n');
}

/**
 * Bestemmer hva som skal gjøres med sakene: én sak per kilde, opprettes ved endring
 * eller feil, oppdateres når tilstanden endrer seg, og lukkes når kilden er i orden.
 */
export function planleggVarsler(
  kilder: readonly Pick<Kilde, 'id' | 'navn' | 'url' | 'godkjent_fingeravtrykk'>[],
  status: Readonly<Record<string, KildestatusPost>>,
  aapne: readonly AapenSak[],
): Handling[] {
  const handlinger: Handling[] = [];
  for (const kilde of kilder) {
    const post = status[kilde.id];
    if (!post) continue;
    const sak = aapne.find((s) => s.kildeId === kilde.id);
    if (post.status === 'ok') {
      if (sak) {
        handlinger.push({
          type: 'lukk',
          nummer: sak.nummer,
          kildeId: kilde.id,
          kommentar: 'Kildesjekken er i orden igjen (fingeravtrykket stemmer med det godkjente, eller sjekken virker igjen). Lukker saken.',
        });
      }
      continue;
    }
    const tekst = saksTekst(kilde, post);
    if (!sak) {
      handlinger.push({ type: 'opprett', kildeId: kilde.id, tittel: tittelFor(kilde), tekst });
    } else if (sak.tilstand !== tilstandsmerke(post)) {
      handlinger.push({
        type: 'oppdater',
        nummer: sak.nummer,
        kildeId: kilde.id,
        tekst,
        kommentar: post.status === 'feilet' ? `Sjekken feilet igjen: ${post.melding ?? ''}` : 'Kilden er endret på nytt. Se oppdatert beskrivelse.',
      });
    }
  }
  return handlinger;
}
