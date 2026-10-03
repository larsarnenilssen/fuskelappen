// Kontrolloversikten (docs/KONTROLL.md): for hver kilde, hvilke regelverdier og hvilket innhold som bygger på
// den, status for eiers kontroll og for den automatiske verdisjekken. Kildejobben lager den på nytt hver uke.
// Kjør: npm run kontroll:rapport
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Kilde, Kilderegister, Praksis, Praksisfil } from '../../src/core/innhold/skjema.ts';
import { lesKildestatus, type Kildestatusfil } from '../../src/core/kildestatus/kildestatus.ts';
import { lagKontrollindeks, tellKontroll, type Kildekontroll, type Kontrollinnhold, type Kontrollverdi } from '../../src/core/kontroll/indeks.ts';
import { lesVerdistatus, type Verdistatusfil } from '../../src/core/kontroll/verdisjekk.ts';
import type { Innholdsstatus } from '../../src/core/innhold/status.ts';
import { lesInnhold, lesRegelsett } from '../innhold/alt.ts';
import { praksisTilBekreftelse } from '../kilder/kontrollrunde.ts';
import { lesFil } from '../innhold/last.ts';
import { kildelenker, praksiskilder } from './kildelenker.ts';

function dato(iso: string): string {
  const [aar, mnd, dag] = iso.slice(0, 10).split('-');
  return `${dag}.${mnd}.${aar}`;
}

function tall(n: number): string {
  return String(n).replace('.', ',');
}

function visVerdi(v: Kontrollverdi): string {
  if (Array.isArray(v.verdi)) {
    const tabell = v.verdi.length > 0 && typeof v.verdi[0] === 'object';
    return tabell ? `tabell, ${v.verdi.length} rader` : `liste: ${v.verdi.map((x) => (typeof x === 'number' ? tall(x) : String(x))).join(', ')}`;
  }
  const verdi = typeof v.verdi === 'number' ? tall(v.verdi) : String(v.verdi);
  return v.enhet ? `${verdi} ${v.enhet}` : verdi;
}

function visAuto(v: Kontrollverdi): string {
  if (v.auto) {
    if (v.auto.status === 'samsvarer') return `✅ samsvarer (${dato(v.auto.sjekket)})${v.auto.melding ? `. ${v.auto.melding}` : ''}`;
    if (v.auto.status === 'avvik') return `⚠️ avvik siden ${dato(v.auto.siden)}. ${v.auto.melding ?? ''}`.trim();
    return `ikke sjekket. ${v.auto.melding ?? ''}`.trim();
  }
  if (v.grunnlag === 'praksis') return 'praksis, sjekkes ikke automatisk';
  if (v.grunnlag === 'avledet') return 'avledet av andre verdier';
  if (Array.isArray(v.verdi)) return 'tabell eller liste, sjekkes ikke automatisk ennå';
  if (v.harSitat) return 'ikke sjekket ennå';
  return 'mangler sitat';
}

function visEier(p: { eier: Innholdsstatus; kontrollert: string | null }): string {
  const d = p.kontrollert ? dato(p.kontrollert) : '';
  switch (p.eier) {
    case 'kontrollert':
      return `kontrollert ${d}`;
    case 'kilde_endret':
      return `⚠️ kilden er endret etter kontrollen ${d}`;
    case 'bor_kontrolleres':
      return `bør kontrolleres på nytt (kontrollert ${d})`;
    default:
      return 'ikke kontrollert';
  }
}

function visKildestatus(kilde: Kilde | undefined, status: Kildestatusfil | null): string {
  if (!kilde) return 'ukjent kilde';
  const post = status?.kilder[kilde.id];
  if (!kilde.aktiv || kilde.sjekkmetode === 'ingen' || !post) return 'sjekkes ikke automatisk';
  if (post.status === 'ok') return `i orden (${dato(post.sjekket)})`;
  if (post.status === 'endret') return `⚠️ endret siden ${dato(post.endret_siden ?? post.sjekket)}, venter på godkjenning`;
  return `⚠️ sjekken feilet (${dato(post.sjekket)}): ${post.melding ?? ''}`;
}

function celle(tekst: string): string {
  return tekst.replace(/\|/g, '\\|').replace(/\s+/g, ' ');
}

function verditabell(verdier: readonly Kontrollverdi[]): string[] {
  if (verdier.length === 0) return [];
  return [
    '**Regelverdier**',
    '',
    '| Verdi | Punkt | Tall | Automatisk sjekk | Din kontroll |',
    '|---|---|---|---|---|',
    ...verdier.map(
      (v) => `| \`${v.nokkel}\` (${v.regelsett}) | ${celle(v.punkt ?? '–')} | ${celle(visVerdi(v))} | ${celle(visAuto(v))} | ${celle(visEier(v))} |`,
    ),
    '',
  ];
}

const TYPENAVN: Record<Kontrollinnhold['elementtype'], string> = {
  begrep: 'begrep',
  regel: 'regel',
  forklaring: 'forklaring',
  steg: 'steg',
  veiviser: 'veiviser',
  frist: 'frist',
  kildeomtale: 'kildeomtale',
};

function innholdstabell(innhold: readonly Kontrollinnhold[]): string[] {
  if (innhold.length === 0) return [];
  return [
    '**Innhold som bygger på kilden**',
    '',
    '| Innhold | Type | Punkt | Fil | Din kontroll |',
    '|---|---|---|---|---|',
    ...innhold.map(
      (i) => `| ${celle(i.tittel)} (\`${i.id}\`) | ${TYPENAVN[i.elementtype]} | ${celle(i.punkter.join(', ') || '–')} | \`${i.fil}\` | ${celle(visEier(i))} |`,
    ),
    '',
  ];
}

/** Det som bør ses på nå: avvik, endrede eller feilede kilder og kontroller som er gamle eller utdatert. */
function maaSesPaa(indeks: readonly Kildekontroll[], register: Kilderegister, status: Kildestatusfil | null): string[] {
  const linjer: string[] = [];
  for (const k of register.kilder) {
    const post = status?.kilder[k.id];
    if (post && post.status !== 'ok') linjer.push(`- **${k.navn}:** ${visKildestatus(k, status)}`);
  }
  const sett = new Set<string>();
  for (const k of indeks) {
    for (const v of k.verdier) {
      if (v.auto?.status === 'avvik') linjer.push(`- \`${v.id}\`: ${visAuto(v)}`);
      if ((v.eier === 'kilde_endret' || v.eier === 'bor_kontrolleres') && !sett.has(v.id)) {
        sett.add(v.id);
        linjer.push(`- \`${v.id}\`: ${visEier(v)}`);
      }
    }
    for (const i of k.innhold) {
      if ((i.eier === 'kilde_endret' || i.eier === 'bor_kontrolleres') && !sett.has(i.id)) {
        sett.add(i.id);
        linjer.push(`- ${i.tittel} (${TYPENAVN[i.elementtype]}): ${visEier(i)}`);
      }
    }
  }
  return linjer;
}

function praksisdel(praksis: readonly Praksis[], indeks: readonly Kildekontroll[], register: Kilderegister): string[] {
  if (praksis.length === 0) return [];
  return [
    '## Praksis og tolkninger',
    '',
    'Dette bygger appen på uten at det står i kildene. Du bekrefter punktene i kontrollrundene i mai og august. «Kilder å sjekke mot» er kildene bak det praksisen berører.',
    '',
    '| Praksis | Spørsmål | Grunnlag | Kilder å sjekke mot | Bekreftet |',
    '|---|---|---|---|---|',
    ...praksis.map((p) => `| **${celle(p.tittel)}** | ${celle(p.sporsmal)} | ${celle(p.grunnlag)} | ${celle(kildelenker(praksiskilder(p, indeks), register) || '–')} | ${p.bekreftet ? dato(p.bekreftet.dato) : 'ikke bekreftet'} |`),
    '',
  ];
}

/** Kontrollspørsmålene til innholdet, én gang per element, med de som ikke er kontrollert først. */
function sporsmalsdel(indeks: readonly Kildekontroll[], register: Kilderegister): string[] {
  const unike = new Map<string, Kontrollinnhold>();
  for (const k of indeks) for (const i of k.innhold) if (!unike.has(i.id)) unike.set(i.id, i);
  const med = [...unike.values()].filter((i) => i.sporsmal.length > 0).sort((a, b) => Number(a.eier === 'kontrollert') - Number(b.eier === 'kontrollert'));
  if (med.length === 0) return [];
  return [
    '## Kontrollspørsmål',
    '',
    'Spørsmål om det som er usikkert i hver tekst: om noe kan misforstås, og om praksisen stemmer. Under hvert spørsmål står kildene teksten bygger på, med punkt, så du kan sjekke svaret der. Svar gjerne i en kommentar i kontrollsaken, eller skriv til Claude.',
    '',
    ...med.flatMap((i) => [`**${i.tittel}** (\`${i.id}\`, ${TYPENAVN[i.elementtype]}, ${visEier(i)})`, '', ...i.sporsmal.map((s) => `- ${s}`), '', `Kilder å sjekke mot: ${kildelenker(i.kilder, register)}`, '']),
  ];
}

export function lagKontrollrapport(
  indeks: readonly Kildekontroll[],
  register: Kilderegister,
  kildestatus: Kildestatusfil | null,
  verdistatus: Verdistatusfil | null,
  idag: string,
  praksis: readonly Praksis[] = [],
  kobling: KoblingsstatusKort | null = null,
): string {
  const t = tellKontroll(indeks);
  const sesPaa = maaSesPaa(indeks, register, kildestatus);
  const ubekreftet = praksisTilBekreftelse(praksis, idag);
  const kilder = new Map(register.kilder.map((k) => [k.id, k]));
  const deler = indeks.flatMap((k) => {
    const kilde = kilder.get(k.kilde);
    return [
      `### ${kilde?.navn ?? k.kilde}`,
      '',
      `\`${k.kilde}\` · Kildesjekk: ${visKildestatus(kilde, kildestatus)}${kilde ? ` · [Åpne kilden](${kilde.url})` : ''}`,
      '',
      ...verditabell(k.verdier),
      ...innholdstabell(k.innhold),
    ];
  });
  return [
    '# Kontrolloversikt',
    '',
    '<!-- Generert av `npm run kontroll:rapport`. Kildesjekken lager den på nytt hver uke. Ikke rediger for hånd. -->',
    '',
    `Oppdatert ${dato(idag)}. Kildesjekken kjørte sist ${kildestatus ? dato(kildestatus.kjort) : 'aldri'}, verdisjekken ${verdistatus ? dato(verdistatus.kjort) : 'aldri'}.`,
    '',
    'Oversikten viser hva som bygger på hver kilde, og hvor langt kontrollen er kommet. «Automatisk sjekk» betyr at sitatet med tallet fortsatt står i kilden. Det er ikke det samme som din kontroll. Se `docs/EIER.md`, punkt 10–12.',
    '',
    'Når du har kontrollert noe, skriver du `/godkjent` og id-ene i en kommentar i kontrollsaken, for eksempel `/godkjent arsverk planleggingsdager feriepenger_prosent`. Id-ene står i `kodeskrift` i tabellene.',
    '',
    '## Sammendrag',
    '',
    '| Din kontroll | Antall |',
    '|---|---|',
    `| Kontrollert | ${t.kontrollert} |`,
    `| Kilden er endret etter kontrollen | ${t.kildeEndret} |`,
    `| Bør kontrolleres på nytt (over 12 måneder) | ${t.borKontrolleres} |`,
    `| Ikke kontrollert | ${t.ikkeKontrollert} |`,
    ...(praksis.length > 0 ? [`| Praksis og tolkninger som bør bekreftes | ${ubekreftet.length} av ${praksis.length} |`] : []),
    '',
    '| Automatisk sjekk av regelverdier | Antall |',
    '|---|---|',
    `| Samsvarer med kilden | ${t.samsvarer} |`,
    `| Avvik fra kilden | ${t.avvik} |`,
    `| Ikke sjekket (kilden kunne ikke leses eller sjekkes ikke) | ${t.ikkeSjekket} |`,
    `| Enkeltverdier fra kilden uten sitat | ${t.utenSitat} |`,
    '',
    ...(kobling
      ? [
          `**Kobling fra fagkode til årsramme** (fase 2): ${kobling.antall.koblet + kobling.antall.flertydig} av ${kobling.antall.fag} fagkoder er koblet, ${kobling.antall.ukoblet} er ikke koblet, og det er ${kobling.avvik.length} avvik. Se [docs/KOBLING.md](KOBLING.md) for avviksrapporten, tabellen over programnavn, et utvalg koblinger til kontroll og listen over ukoblede fag.`,
          '',
        ]
      : []),
    '## Må ses på',
    '',
    ...(sesPaa.length > 0 ? sesPaa : ['Ingenting akkurat nå.']),
    '',
    ...praksisdel(praksis, indeks, register),
    '## Per kilde',
    '',
    ...deler,
    ...sporsmalsdel(indeks, register),
  ].join('\n');
}

/** Det kontrolloversikten trenger fra data/status/kobling.json (scripts/kobling/rapport.ts). */
export interface KoblingsstatusKort {
  antall: { fag: number; koblet: number; flertydig: number; ukoblet: number };
  avvik: unknown[];
}

function lesJson(fil: string): unknown {
  return existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as unknown) : null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rot = fileURLToPath(new URL('../..', import.meta.url));
  const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
  const kildestatus = lesKildestatus(lesJson(join(rot, 'data/status/kildestatus.json')));
  const verdistatus = lesVerdistatus(lesJson(join(rot, 'data/status/verdistatus.json')));
  const idag = new Date().toISOString().slice(0, 10);
  const indeks = lagKontrollindeks(register.kilder, lesRegelsett(rot), lesInnhold(rot), kildestatus?.kilder ?? {}, verdistatus, idag);
  const praksis = (lesFil(rot, join(rot, 'content/kontroll/praksis.yaml')) as Praksisfil).praksis;
  const kobling = lesJson(join(rot, 'data/status/kobling.json')) as KoblingsstatusKort | null;
  writeFileSync(join(rot, 'docs/KONTROLL.md'), `${lagKontrollrapport(indeks, register, kildestatus, verdistatus, idag, praksis, kobling)}\n`);
  console.log('Skrev docs/KONTROLL.md');
}
