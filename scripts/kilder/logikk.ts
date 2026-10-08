// Ren logikk for kildejobben: fingeravtrykk og status. Testes i tests/unit/kildejobb.test.ts.
// Varslene (den ukentlige kontrollsaken) lages i ukesrapport.ts.
import { createHash } from 'node:crypto';
import type { KildestatusPost } from '../../src/core/kildestatus/kildestatus.ts';

export interface Sjekkresultat {
  status: 'ok' | 'endret' | 'feilet';
  fingeravtrykk: string | null;
  melding: string | null;
  /** Grunnlaget endringer sammenlignes med, for kilder som sjekkes med fingeravtrykk. */
  grunnlag?: string | null;
}

export { normaliserTekst } from '../../src/core/kontroll/tekst.ts';

export function lagFingeravtrykk(tekst: string): string {
  return `sha256:${createHash('sha256').update(tekst, 'utf8').digest('hex')}`;
}

/**
 * Sammenligner med grunnlaget (avgjørelse 089): fingeravtrykket eier har gått gjennom (`godkjent_fingeravtrykk`),
 * ellers det kildesjekken så første gang. Første sjekk av en ny kilde blir grunnlaget, så en ny kilde står ikke som
 * endret. «endret» betyr at eier ikke har gått gjennom endringen ennå, og kommer i kontrollsaken.
 */
export function vurderMotGrunnlag(fingeravtrykk: string, grunnlag: string | null): Sjekkresultat {
  if (grunnlag === null || grunnlag === fingeravtrykk) return { status: 'ok', fingeravtrykk, melding: null, grunnlag: grunnlag ?? fingeravtrykk };
  return { status: 'endret', fingeravtrykk, melding: 'Innholdet er endret siden det sist ble gått gjennom.', grunnlag };
}

/**
 * Det kildesjekken husker om en kilde utenom kildestatusen (data/status/kildegrunnlag.json): fingeravtrykket endringer
 * sammenlignes med når eier ikke har gått gjennom noe, og hvor mange sjekker på rad som har feilet.
 */
export interface Grunnlagspost {
  grunnlag: string | null;
  feil_pa_rad: number;
}

export interface Grunnlagsfil {
  skjema: 1;
  kilder: Record<string, Grunnlagspost>;
}

/** Grunnlaget for en kilde: det eier har gått gjennom, ellers det som ble lagret ved forrige sjekk. */
export function grunnlagFor(kilde: { godkjent_fingeravtrykk?: string | null }, forrige: Grunnlagspost | undefined): string | null {
  return kilde.godkjent_fingeravtrykk ?? forrige?.grunnlag ?? null;
}

/** En kilde eier ikke har godkjent for bruk i appen (avgjørelse 089). */
export function erIkkeGodkjent(kilde: { godkjent?: string | null } | undefined): boolean {
  return kilde !== undefined && !kilde.godkjent;
}

/** Meldingen kildesjekken brukte for nye kilder før avgjørelse 089. Datoen i slike poster er ikke en endring. */
const GAMMEL_NY_KILDE = 'Ny kilde, ikke godkjent ennå.';

/**
 * Lager ny statuspost og grunnlagspost. En feil vises først når kilden har feilet to sjekker på rad, så en kort feil
 * hos kilden ikke vises i appen. `straks` gir feilen med en gang, for nyhetskildene, som har sin egen regel om mer enn
 * to dager. `endret_siden` er når fingeravtrykket sist ble et annet enn ved forrige sjekk.
 */
export function nyPost(
  forrige: KildestatusPost | undefined,
  forrigeGrunnlag: Grunnlagspost | undefined,
  r: Sjekkresultat,
  naa: string,
  { straks = false }: { straks?: boolean } = {},
): { post: KildestatusPost; grunnlag: Grunnlagspost } {
  const gammelNy = forrige?.melding === GAMMEL_NY_KILDE;
  const endretSiden = gammelNy ? null : (forrige?.endret_siden ?? null);
  if (r.status === 'feilet') {
    const paRad = (forrigeGrunnlag?.feil_pa_rad ?? (forrige?.status === 'feilet' ? 1 : 0)) + 1;
    const tidligere = forrige && forrige.status !== 'feilet' && !gammelNy ? forrige.status : 'ok';
    return {
      post: {
        status: straks || paRad >= 2 || !forrige ? 'feilet' : tidligere,
        sjekket: naa,
        fingeravtrykk: forrige?.fingeravtrykk ?? null,
        endret_siden: endretSiden,
        melding: r.melding,
      },
      grunnlag: { grunnlag: forrigeGrunnlag?.grunnlag ?? null, feil_pa_rad: paRad },
    };
  }
  const endret = !gammelNy && forrige?.fingeravtrykk && r.fingeravtrykk && forrige.fingeravtrykk !== r.fingeravtrykk;
  return {
    post: { status: r.status, sjekket: naa, fingeravtrykk: r.fingeravtrykk, endret_siden: endret ? naa : endretSiden, melding: r.melding },
    grunnlag: { grunnlag: r.grunnlag !== undefined ? r.grunnlag : (forrigeGrunnlag?.grunnlag ?? null), feil_pa_rad: 0 },
  };
}
