// Lenkesjekken (avgjørelse 062): sjekker lenkene, fører status per lenke fra gang til gang, og lager rapporten.
// Alt utenom sjekkUrl og sjekkAlle er rene funksjoner, testet i tests/unit/lenkesjekk.test.ts.
import { feilmelding, USER_AGENT } from '../kilder/metoder.ts';
import type { Lenke } from './samle.ts';

/** Svaret fra én sjekk. */
export type Svar = 'ok' | 'flyttet' | 'borte' | 'feil';

export interface Resultat {
  url: string;
  svar: Svar;
  /** HTTP-status, eller null ved feil i nettverket. */
  status: number | null;
  /** Adressen etter videresendinger, når den er en annen. */
  til: string | null;
  melding: string | null;
}

const sti = (u: URL) => u.pathname.replace(/\/+$/, '').toLowerCase();
/** Nettstedet for en lenke, uten www. */
const vert = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** En kort adresse hos Lovdata som er sendt videre til den lange adressen under /dokument/. */
function erLovdataKortadresse(fra: URL, etter: URL): boolean {
  const lovdata = (u: URL) => u.hostname.replace(/^www\./, '') === 'lovdata.no';
  return lovdata(fra) && lovdata(etter) && !fra.pathname.startsWith('/dokument/') && etter.pathname.startsWith('/dokument/');
}

/**
 * Vurderer svaret: 404 og 410 er borte. En videresending til forsiden fra en dypere side er trolig en side som er
 * borte. En videresending til en annen side er flyttet. 401, 403, 429, 5xx og feil i nettverket er usikre (feil),
 * fordi nettstedet kan stenge for automatiske forespørsler. Lovdatas korte adresser («lovdata.no/lov/…/§5-1») sendes
 * alltid videre til den lange adressen under /dokument/. De er Lovdatas faste adresser, som Lovdata selv bruker i
 * teksten, og regnes som ok (avgjørelse 062).
 */
export function vurderSvar(url: string, status: number | null, til: string | null): Svar {
  if (status === null) return 'feil';
  if (status === 404 || status === 410) return 'borte';
  if (status >= 400) return 'feil';
  if (!til) return 'ok';
  const fra = new URL(url);
  const etter = new URL(til);
  if (fra.hostname.replace(/^www\./, '') === etter.hostname.replace(/^www\./, '') && sti(fra) === sti(etter)) return 'ok';
  if (sti(etter) === '' && sti(fra) !== '') return 'borte';
  if (erLovdataKortadresse(fra, etter)) return 'ok';
  return 'flyttet';
}

export async function sjekkUrl(url: string): Promise<Resultat> {
  try {
    const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*;q=0.8' }, redirect: 'follow', signal: AbortSignal.timeout(20_000) });
    await svar.body?.cancel().catch(() => undefined);
    const til = svar.url && svar.url !== url ? svar.url : null;
    return { url, svar: vurderSvar(url, svar.status, til), status: svar.status, til, melding: null };
  } catch (e) {
    return { url, svar: 'feil', status: null, til: null, melding: feilmelding(e) };
  }
}

/**
 * Sjekker lenkene: nettstedene parallelt (høyst `parallelt` om gangen), og lenkene til samme nettsted etter
 * hverandre med en pause imellom, av hensyn til nettstedene.
 */
export async function sjekkAlle(urler: readonly string[], valg: { parallelt?: number; pauseMs?: number; sjekk?: (u: string) => Promise<Resultat> } = {}): Promise<Resultat[]> {
  const { parallelt = 6, pauseMs = 1000, sjekk = sjekkUrl } = valg;
  const perVert = new Map<string, string[]>();
  for (const u of urler) {
    const v = vert(u);
    perVert.set(v, [...(perVert.get(v) ?? []), u]);
  }
  const koer = [...perVert.values()].sort((a, b) => b.length - a.length);
  const ut: Resultat[] = [];
  const arbeider = async () => {
    for (let ko = koer.shift(); ko; ko = koer.shift()) {
      for (const [i, u] of ko.entries()) {
        ut.push(await sjekk(u));
        if (i < ko.length - 1) await new Promise((r) => setTimeout(r, pauseMs));
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(parallelt, koer.length) }, arbeider));
  return ut;
}

export interface Lenkestatus {
  /** Datoen for siste sjekk (ÅÅÅÅ-MM-DD). */
  sjekket: string;
  lenker: Record<
    string,
    {
      svar: Svar;
      /** Hvor mange sjekker på rad lenken har hatt dette svaret. */
      ganger: number;
      sist: string;
      til: string | null;
      melding: string | null;
    }
  >;
}

/** Status etter sjekken: svaret og hvor mange ganger på rad. Lenker som ikke finnes i appen lenger, tas ut. */
export function oppdaterStatus(forrige: Lenkestatus | null, resultater: readonly Resultat[], alle: ReadonlySet<string>, idag: string): Lenkestatus {
  const lenker: Lenkestatus['lenker'] = {};
  for (const [url, s] of Object.entries(forrige?.lenker ?? {})) if (alle.has(url)) lenker[url] = s;
  for (const r of resultater) {
    const f = lenker[r.url];
    lenker[r.url] = { svar: r.svar, ganger: f && f.svar === r.svar ? f.ganger + 1 : 1, sist: idag, til: r.til, melding: r.melding };
  }
  return { sjekket: idag, lenker };
}

/** Stikkprøvene: lenkene som ikke er sjekket, så dem som er sjekket for lengst siden. */
export function velgStikkprove(lenker: readonly Lenke[], status: Lenkestatus | null, antall: number): string[] {
  return lenker
    .filter((l) => l.type === 'stikkprove')
    .map((l) => ({ url: l.url, sist: status?.lenker[l.url]?.sist ?? '' }))
    .sort((a, b) => a.sist.localeCompare(b.sist) || a.url.localeCompare(b.url))
    .slice(0, antall)
    .map((x) => x.url);
}

/** Nettsteder der ingen av lenkene svarte, bare med feil: de stenger trolig for automatiske forespørsler. */
export function stengteNettsteder(resultater: readonly Resultat[]): string[] {
  const perVert = new Map<string, Resultat[]>();
  for (const r of resultater) {
    const v = vert(r.url);
    perVert.set(v, [...(perVert.get(v) ?? []), r]);
  }
  return [...perVert].filter(([, rs]) => rs.every((r) => r.svar === 'feil')).map(([v]) => v).sort();
}

/** Grensen for varsel: lenker som har vært borte eller flyttet så mange sjekker på rad (eier: to uker på rad). */
export const VARSEL_ETTER = 2;

/**
 * Rapporten i Markdown, til kontrollsaken for lenkene. Tom når ingen lenker er borte eller flyttet. Nettstedene som
 * stenger for automatisk sjekk, står i kontrolloversikten (stengteLenker), ikke i saken (sak #98).
 */
export function lagRapport(status: Lenkestatus, lenker: readonly Lenke[]): string {
  const brukt = new Map(lenker.map((l) => [l.url, l.brukt]));
  const varsle = Object.entries(status.lenker).filter(([, s]) => (s.svar === 'borte' || s.svar === 'flyttet') && s.ganger >= VARSEL_ETTER);
  if (varsle.length === 0) return '';
  const linje = ([url, s]: [string, Lenkestatus['lenker'][string]]) =>
    `- [ ] ${url}${s.til ? ` → ${s.til}` : ''} (${s.ganger} ganger på rad). Står i: ${(brukt.get(url) ?? []).join(', ')}`;
  return [
    `Lenkesjekken ${status.sjekket}. Lenkene under har vært borte eller flyttet to uker på rad. Den som trykker på dem i appen, kommer til en side som ikke finnes, eller til en annen side enn den skal.`,
    '',
    'Gi Claude lenken til denne saken, så finner Claude de nye adressene og retter dem. Kryss gjerne av lenker du har sjekket selv. Saken lukkes av seg selv når alle virker igjen (avgjørelse 062 og 085).',
    '',
    ...(varsle.some(([, s]) => s.svar === 'borte') ? ['## Borte', '', ...varsle.filter(([, s]) => s.svar === 'borte').map(linje), ''] : []),
    ...(varsle.some(([, s]) => s.svar === 'flyttet') ? ['## Flyttet', '', ...varsle.filter(([, s]) => s.svar === 'flyttet').map(linje), ''] : []),
  ].join('\n');
}

/**
 * Nettstedene som stenger for automatisk sjekk, med lenkene dit og hvor de står. Lagres i
 * data/status/stengte-lenker.json og vises i kontrolloversikten (docs/KONTROLL.md, sak #98).
 */
export interface StengteLenker {
  /** Datoen for lenkesjekken (ÅÅÅÅ-MM-DD), eller null før første sjekk. */
  sjekket: string | null;
  nettsteder: {
    vert: string;
    /** Lenkene i innholdet, kilderegisteret og koden, som sjekkes hver gang. */
    lenker: { url: string; brukt: string[] }[];
    /** Antall massegenererte lenker til nettstedet (stikkprøver). */
    stikkprover: number;
  }[];
}


/** Lenkene i appen til de stengte nettstedene: de faste lenkene med hvor de står, og antallet stikkprøver. */
export function stengteLenker(stengte: readonly string[], lenker: readonly Lenke[], sjekket: string): StengteLenker {
  return {
    sjekket,
    nettsteder: stengte.map((v) => {
      const dit = lenker.filter((l) => vert(l.url) === v);
      return {
        vert: v,
        lenker: dit.filter((l) => l.type === 'fast').map((l) => ({ url: l.url, brukt: [...l.brukt] })),
        stikkprover: dit.filter((l) => l.type === 'stikkprove').length,
      };
    }),
  };
}
