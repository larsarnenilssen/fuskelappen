// Den ukentlige kontrollsaken: én GitHub-sak med alt eier bør se på etter kildesjekken, med avkrysningsliste.
// Saken oppdateres hver mandag, får en kommentar (og dermed e-post) når noe nytt har kommet til, og lukkes når
// alt er i orden. Ren logikk, testes i tests/unit/ukesrapport.test.ts (avgjørelse 018).
import { createHash } from 'node:crypto';
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import type { Kildestatusfil } from '../../src/core/kildestatus/kildestatus.ts';
import type { Kildekontroll } from '../../src/core/kontroll/indeks.ts';
import type { Verdistatusfil } from '../../src/core/kontroll/verdisjekk.ts';
import type { Tekstendring } from './avsnitt.ts';
import type { Grependringer } from './grep.ts';

export const KONTROLLETIKETT = 'kontroll';
/** Etiketten de gamle sakene per kilde hadde. De lukkes og erstattes av kontrollsaken. */
export const GAMMEL_ETIKETT = 'kilde';

const MAKS_BITER = 3;
const MAKS_TEGN_PER_BIT = 400;
const MAKS_DETALJER = 20;
const MAKS_SPORSMAL = 8;

export interface Ukesgrunnlag {
  register: Kilderegister;
  kildestatus: Kildestatusfil;
  verdistatus: Verdistatusfil | null;
  endringer: Readonly<Record<string, Tekstendring[] | null>>;
  indeks: readonly Kildekontroll[];
  repo: string;
  /** Endringsforslagene (PR) fra lag-forslag.ts, hvis noen. */
  forslag?: { verdier: string | null; grep: string | null };
  /** Endringene i Grep denne uken (.generert/grep-endringer.json): læreplaner og fag listes i saken. */
  grep?: Grependringer | null;
  /** Endringer i fag- og timefordelingen denne uken (.generert/udir-endringer.json). */
  udir?: { endringer: string[]; nyVersjon: string | null } | null;
  /** Nye fag uten kobling til årsramme og nye avvik i koblingen (.generert/kobling-endringer.json). */
  kobling?: { nyeUkoblede: string[]; nyeAvvik: string[] } | null;
}

/** Endrede læreplaner og fag fra Grep, til orientering i kontrollsaken (avgjørelse 022). */
export function grepLaereplanlinjer(e: Grependringer | null | undefined, maks = MAKS_DETALJER): string[] {
  if (!e) return [];
  const lenke = (k: string) => `[${k}](https://www.udir.no/lk20/${k.toLowerCase()})`;
  const linjer = [
    ...(e.laereplaner?.endret ?? []).map((k) => `Endret læreplan: ${lenke(k)}`),
    ...(e.laereplaner?.nye ?? []).map((k) => `Ny læreplan: ${lenke(k)}`),
    ...(e.laereplaner?.fjernet ?? []).map((k) => `Læreplan fjernet: ${k}`),
    ...(e.fag?.endret ?? []).map((l) => `Endret fag: ${l}`),
    ...(e.fag?.nye ?? []).map((l) => `Nytt fag: ${l}`),
    ...(e.fag?.fjernet ?? []).map((l) => `Fag fjernet: ${l}`),
    ...(e.tilbud?.nye ?? []).map((l) => `Nytt programområde: ${l}`),
    ...(e.tilbud?.fjernet ?? []).map((l) => `Programområde lagt ned: ${l}`),
    ...(e.tilbud?.endret ?? []).map((l) => `Endret programområde: ${l}`),
  ];
  const ut = linjer.slice(0, maks).map((l) => `  - ${l}`);
  if (linjer.length > maks) ut.push(`  - … og ${linjer.length - maks} til. Se jobbsammendraget.`);
  return ut;
}

export interface Ukesrapport {
  /** Antall punkter med avkrysning (det eier må gjøre noe med). */
  punkter: number;
  /** Sann når saken bør være åpen: noe å gjøre eller noe til orientering. */
  aapen: boolean;
  tittel: string;
  tekst: string;
  /** Fingeravtrykk av innholdet (uten datoer). Endres det, får saken en kommentar. */
  tilstand: string;
}

function dato(iso: string): string {
  const [aar, mnd, dag] = iso.slice(0, 10).split('-');
  return `${dag}.${mnd}.${aar}`;
}

/** Tall på norsk: mellomrom som tusenskille og desimalkomma (15 000, 1687,5). */
export function norskTall(n: number): string {
  const [heltall = '', desimaler] = String(n).split('.');
  const gruppert = heltall.length > 4 ? heltall.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : heltall;
  return desimaler ? `${gruppert},${desimaler}` : gruppert;
}

function sitat(tekst: string): string {
  const kort = tekst.length > MAKS_TEGN_PER_BIT ? `${tekst.slice(0, MAKS_TEGN_PER_BIT)} …` : tekst;
  return `> ${kort}`;
}

/** Tallene i et punkt, f.eks. «Kap. 1 § 12.4» → [«1», «12.4»] og «7.3 b» → [«7.3»]. */
function punkttall(punkt: string): string[] {
  return [...punkt.matchAll(/\d+(?:\.\d+)*(?:-\d+)?/g)].map((m) => m[0]);
}

/**
 * Om innhold som viser til «punkt» kan være berørt av en endring i «endret». Samme punkt, et underpunkt
 * eller et overordnet punkt teller («7.3» og «7.3 b», «4» og «4 a»). Heller for mye enn for lite.
 */
export function punktTreff(endret: string, punkt: string): boolean {
  const e = punkttall(endret);
  const p = punkttall(punkt);
  return e.some((a) => p.some((b) => a === b || b.startsWith(`${a}.`) || a.startsWith(`${b}.`)));
}

function kildeseksjon(g: Ukesgrunnlag, id: string, navn: string, url: string, endretSiden: string | null, fingeravtrykk: string | null): string[] {
  const linjer = [`### ${navn}`, '', `Endret siden ${endretSiden ? dato(endretSiden) : 'ukjent dato'}. [Åpne kilden](${url})`, ''];
  const liste = g.endringer[id];
  const kontroll = g.indeks.find((k) => k.kilde === id);
  if (liste === undefined || liste === null) {
    linjer.push('Endringene kan ikke vises, fordi det ikke finnes lagret tekst fra forrige godkjenning. Åpne kilden og se etter selv.', '');
  } else if (liste.length === 0) {
    linjer.push('Teksten er den samme som ved forrige godkjenning. Det er bare formatering eller filen som er endret.', '');
  } else {
    for (const e of liste) {
      const hva = e.ny.length === 0 ? `${e.fjernet} ${e.fjernet === 1 ? 'setning' : 'setninger'} fjernet` : e.fjernet > 0 ? 'endret tekst' : 'ny tekst';
      linjer.push(`**${e.punkt ? `Punkt ${e.punkt}` : 'Ukjent punkt'}** (${hva}):`, '');
      for (const bit of e.ny.slice(0, MAKS_BITER)) linjer.push(sitat(bit), '');
      if (e.ny.length > MAKS_BITER) linjer.push(`… og ${e.ny.length - MAKS_BITER} setninger til.`, '');
      const verdier = e.punkt && kontroll ? kontroll.verdier.filter((v) => v.punkt && punktTreff(e.punkt as string, v.punkt)) : [];
      const innhold = e.punkt && kontroll ? kontroll.innhold.filter((i) => i.punkter.some((p) => punktTreff(e.punkt as string, p))) : [];
      const berort = [...verdier.map((v) => `regelverdien \`${v.nokkel}\``), ...innhold.map((i) => `«${i.tittel}» (${i.elementtype})`)];
      if (berort.length > 0) linjer.push(`Kan berøre: ${berort.join(', ')}.`, '');
      const sporsmal = innhold.flatMap((i) => i.sporsmal.map((s) => `- ${i.tittel}: ${s}`));
      if (sporsmal.length > 0) {
        linjer.push('Kontrollspørsmål for det som kan være berørt:', '', ...sporsmal.slice(0, MAKS_SPORSMAL), ...(sporsmal.length > MAKS_SPORSMAL ? [`- … og ${sporsmal.length - MAKS_SPORSMAL} til i docs/KONTROLL.md.`] : []), '');
      }
    }
  }
  linjer.push(`- [ ] Jeg har sett på endringene i ${navn}, og det nye fingeravtrykket kan godkjennes. <!-- godkjenn-kilde:${id}:${fingeravtrykk ?? '-'} -->`, '');
  return linjer;
}

export function lagUkesrapport(g: Ukesgrunnlag): Ukesrapport {
  const kilder = new Map(g.register.kilder.map((k) => [k.id, k]));
  const deler: string[][] = [];
  let punkter = 0;
  let orientering = 0;

  // Registerdata (Grep og fag- og timefordelingen) har egne deler lenger ned.
  const endrede = Object.entries(g.kildestatus.kilder).filter(([id, p]) => p.status === 'endret' && !['grep', 'udir-fagfordeling'].includes(kilder.get(id)?.sjekkmetode ?? ''));
  if (endrede.length > 0) {
    deler.push([
      '## Endret i kildene',
      '',
      ...endrede.flatMap(([id, p]) => {
        const k = kilder.get(id);
        return kildeseksjon(g, id, k?.navn ?? id, k?.url ?? '', p.endret_siden, p.fingeravtrykk);
      }),
    ]);
    punkter += endrede.length;
  }

  const avvik = Object.entries(g.verdistatus?.verdier ?? {}).filter(([, p]) => p.status === 'avvik');
  if (avvik.length > 0) {
    deler.push([
      '## Tall og tabeller som ikke stemmer med kilden',
      '',
      ...(g.forslag?.verdier ? [`Forslag med de nye tallene, klart til å flettes når du har sjekket dem: ${g.forslag.verdier}`, ''] : []),
      ...avvik.flatMap(([nokkel, p]) => [
        `- [ ] \`${nokkel}\`: ${p.melding ?? 'Stemmer ikke med kilden.'}${p.forslag === null ? '' : ` Forslag: ${norskTall(p.forslag)}.`} <!-- verdi:${nokkel}:${p.forslag ?? '-'} -->`,
        ...(p.detaljer ?? []).slice(0, MAKS_DETALJER).map((d) => `  - ${d}`),
        ...((p.detaljer?.length ?? 0) > MAKS_DETALJER ? [`  - … og ${(p.detaljer?.length ?? 0) - MAKS_DETALJER} til.`] : []),
      ]),
      '',
    ]);
    punkter += avvik.length;
  }

  // Innhold og verdier eier har kontrollert, men der kilden er endret etterpå eller kontrollen er over 12 måneder.
  const sett = new Set<string>();
  const gamle = g.indeks.flatMap((k) =>
    [...k.verdier, ...k.innhold].filter((p) => {
      const nokkel = `${p.type}:${p.id}`;
      if ((p.eier !== 'kilde_endret' && p.eier !== 'bor_kontrolleres') || sett.has(nokkel)) return false;
      sett.add(nokkel);
      return true;
    }),
  );
  if (gamle.length > 0) {
    deler.push([
      '## Bør kontrolleres på nytt',
      '',
      ...gamle.map((p) => {
        const navn = p.type === 'verdi' ? `Regelverdien \`${p.id}\`` : `«${p.tittel}» (${p.elementtype})`;
        const hvorfor = p.eier === 'kilde_endret' ? `kilden er endret etter kontrollen ${dato(p.kontrollert ?? '')}` : `kontrollert ${dato(p.kontrollert ?? '')}, for mer enn 12 måneder siden`;
        return `- [ ] ${navn}: ${hvorfor}. <!-- kontroll:${p.type}:${p.id} -->`;
      }),
      '',
    ]);
    punkter += gamle.length;
  }

  const grep = Object.entries(g.kildestatus.kilder).filter(([id]) => kilder.get(id)?.sjekkmetode === 'grep');
  const grepLinjer = grep.flatMap(([id, p]) => {
    if (p.status === 'endret') {
      punkter += 1;
      return [`- [ ] ${p.melding ?? 'Grep er endret.'} Se jobbsammendraget for detaljer. <!-- grep:${id}:${p.fingeravtrykk ?? '-'} -->`];
    }
    if (p.melding) {
      orientering += 1;
      return [`- ${p.melding}`, ...grepLaereplanlinjer(g.grep)];
    }
    return [];
  });
  if (g.forslag?.grep) grepLinjer.push(`- Forslag med de nye Grep-dataene: ${g.forslag.grep}`);
  if (grepLinjer.length > 0) deler.push(['## Grep', '', ...grepLinjer, '']);

  // Fag- og timefordelingen fra rundskrivet Udir-1 (avgjørelse 024).
  const udir = Object.entries(g.kildestatus.kilder).filter(([id]) => kilder.get(id)?.sjekkmetode === 'udir-fagfordeling');
  const udirLinjer = udir.flatMap(([id, p]) => {
    if (p.status === 'endret') {
      punkter += 1;
      return [`- [ ] ${p.melding ?? 'Fag- og timefordelingen er endret.'} <!-- udir:${id}:${p.fingeravtrykk ?? '-'} -->`];
    }
    if (p.melding) {
      orientering += 1;
      return [`- ${p.melding}`];
    }
    return [];
  });
  if (udirLinjer.length > 0) {
    const detaljer = (g.udir?.endringer ?? []).slice(0, MAKS_DETALJER).map((l) => `  - ${l}`);
    if ((g.udir?.endringer.length ?? 0) > MAKS_DETALJER) detaljer.push(`  - … og ${(g.udir?.endringer.length ?? 0) - MAKS_DETALJER} til. Se jobbsammendraget.`);
    deler.push(['## Fag- og timefordeling', '', ...udirLinjer, ...detaljer, '']);
  }

  // Koblingen fra fagkode til årsramme (avgjørelse 023): nye avvik skal ses på, nye ukoblede fag til orientering.
  const kobling = g.kobling;
  if (kobling && (kobling.nyeAvvik.length > 0 || kobling.nyeUkoblede.length > 0)) {
    const lenke = `[docs/KOBLING.md](https://github.com/${g.repo}/blob/main/docs/KOBLING.md)`;
    const linjer: string[] = [];
    for (const a of kobling.nyeAvvik.slice(0, MAKS_DETALJER)) {
      punkter += 1;
      linjer.push(`- [ ] Nytt avvik i koblingen: ${a} <!-- kobling:${createHash('sha1').update(a).digest('hex').slice(0, 12)} -->`);
    }
    if (kobling.nyeUkoblede.length > 0) {
      orientering += 1;
      linjer.push(
        `- ${kobling.nyeUkoblede.length === 1 ? 'Ett nytt fag' : `${kobling.nyeUkoblede.length} nye fag`} i Grep uten kobling til årsramme. Si fra til Claude hvis de skal kobles.`,
        ...kobling.nyeUkoblede.slice(0, MAKS_DETALJER).map((l) => `  - ${l}`),
        ...(kobling.nyeUkoblede.length > MAKS_DETALJER ? [`  - … og ${kobling.nyeUkoblede.length - MAKS_DETALJER} til.`] : []),
      );
    }
    deler.push(['## Kobling fra fagkode til årsramme', '', ...linjer, '', `Hele rapporten: ${lenke}.`, '']);
  }

  const feilet = Object.entries(g.kildestatus.kilder).filter(([, p]) => p.status === 'feilet');
  if (feilet.length > 0) {
    orientering += feilet.length;
    deler.push([
      '## Kilder som ikke kunne sjekkes',
      '',
      'Det går ofte over av seg selv. Står en kilde her i flere uker, si fra til Claude.',
      '',
      ...feilet.map(([id, p]) => `- ${kilder.get(id)?.navn ?? id}: ${p.melding ?? 'ukjent feil'} (siden ${dato(p.sjekket)})`),
      '',
    ]);
  }

  const innhold = deler.flat();
  const tilstand = createHash('sha256').update(innhold.join('\n'), 'utf8').digest('hex').slice(0, 16);
  const tittel = punkter > 0 ? `Kontroll: ${punkter} ${punkter === 1 ? 'punkt' : 'punkter'} å se på` : 'Kontroll: til orientering';
  const tekst = [
    `Kildesjekken kjørte ${dato(g.kildestatus.kjort)}. Her er det du bør se på.`,
    '',
    'Kryss av punktene du godkjenner, og skriv `/godkjent` i en kommentar. Da legges datoen inn automatisk. Du kan også skrive id-er etter `/godkjent`, for eksempel `/godkjent arsverk`. Skal noe endres, skriv det til Claude.',
    '',
    'Saken oppdateres hver mandag. Du får e-post når noe nytt har kommet til, og saken lukkes når alt er i orden.',
    '',
    ...innhold,
    '---',
    '',
    `Hele oversikten: [docs/KONTROLL.md](https://github.com/${g.repo}/blob/main/docs/KONTROLL.md). Slik behandler du saken: [docs/EIER.md](https://github.com/${g.repo}/blob/main/docs/EIER.md), punkt 6.`,
    '',
    `<!-- protokollen-kontroll tilstand:${tilstand} -->`,
  ].join('\n');
  return { punkter, aapen: punkter + orientering > 0, tittel, tekst, tilstand };
}

export function lesTilstand(tekst: string | null | undefined): string | null {
  return /<!-- protokollen-kontroll tilstand:([0-9a-f]+) -->/.exec(tekst ?? '')?.[1] ?? null;
}

export type Sakshandling =
  | { type: 'opprett'; tittel: string; tekst: string }
  | { type: 'oppdater'; nummer: number; tittel: string; tekst: string; kommentar: string | null }
  | { type: 'lukk'; nummer: number; kommentar: string };

/**
 * Bestemmer hva som skal skje med kontrollsaken. Er innholdet det samme som sist, oppdateres bare teksten
 * (datoen), uten kommentar, så eier ikke får e-post uten grunn. Gamle saker per kilde lukkes.
 */
export function planleggKontrollsak(
  rapport: Ukesrapport,
  aapen: { nummer: number; tekst: string | null } | null,
  gamleSaker: readonly number[],
): Sakshandling[] {
  const handlinger: Sakshandling[] = [];
  if (rapport.aapen) {
    if (!aapen) {
      handlinger.push({ type: 'opprett', tittel: rapport.tittel, tekst: rapport.tekst });
    } else {
      const nytt = lesTilstand(aapen.tekst) !== rapport.tilstand;
      handlinger.push({
        type: 'oppdater',
        nummer: aapen.nummer,
        tittel: rapport.tittel,
        tekst: rapport.tekst,
        kommentar: nytt ? 'Kildesjekken har funnet noe nytt. Se den oppdaterte beskrivelsen øverst i saken.' : null,
      });
    }
  } else if (aapen) {
    handlinger.push({ type: 'lukk', nummer: aapen.nummer, kommentar: 'Kildesjekken fant ingenting å se på denne uken. Lukker saken.' });
  }
  for (const nummer of gamleSaker) {
    handlinger.push({ type: 'lukk', nummer, kommentar: 'Varsler om kildene samles nå i én ukentlig kontrollsak med etiketten «kontroll». Lukker denne saken.' });
  }
  return handlinger;
}
