// Den ukentlige kontrollsaken på GitHub (etikett «kontroll»): oppretter, oppdaterer eller lukker den ut fra
// kildesjekken, verdisjekken og endringene i kildene. Lukker de gamle sakene per kilde (etikett «kilde»).
// Kjøres i kilder.yml etter sjekk.ts og kontrollrapporten. Uten GITHUB_TOKEN skrives saken bare ut.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Kilderegister, Praksisfil } from '../../src/core/innhold/skjema.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { kontrollenker } from '../../src/modules/fag/tilbud/vilbli.ts';
import { lesKildestatus } from '../../src/core/kildestatus/kildestatus.ts';
import { lagKontrollindeks } from '../../src/core/kontroll/indeks.ts';
import { lesVerdistatus } from '../../src/core/kontroll/verdisjekk.ts';
import { lesInnhold, lesRegelsett } from '../innhold/alt.ts';
import { lesFil } from '../innhold/last.ts';
import type { Tekstendring } from './avsnitt.ts';
import type { Grependringer } from './grep.ts';
import { lagKontrollrunde, praksisTilBekreftelse, RUNDEETIKETT, rundemerke, rundeperiode } from './kontrollrunde.ts';
import { GAMMEL_ETIKETT, KONTROLLETIKETT, lagUkesrapport, planleggKontrollsak, type Sakshandling } from './ukesrapport.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const lesJson = (fil: string): unknown => (existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as unknown) : null);

const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
const kildestatus = lesKildestatus(lesJson(join(rot, 'data/status/kildestatus.json')));
if (!kildestatus) throw new Error('Ugyldig data/status/kildestatus.json');
const verdistatus = lesVerdistatus(lesJson(join(rot, 'data/status/verdistatus.json')));
const endringer = (lesJson(join(rot, '.generert/endringer.json')) ?? {}) as Record<string, Tekstendring[] | null>;
const idag = kildestatus.kjort.slice(0, 10);
const indeks = lagKontrollindeks(register.kilder, lesRegelsett(rot), lesInnhold(rot), kildestatus.kilder, verdistatus, idag);

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY ?? 'larsarnenilssen/fuskelappen';
const api = process.env.GITHUB_API_URL ?? 'https://api.github.com';

const forslag = (lesJson(join(rot, '.generert/forslag.json')) ?? undefined) as { verdier: string | null; grep: string | null } | undefined;
const grep = ((lesJson(join(rot, '.generert/grep-endringer.json')) ?? { endringer: null }) as { endringer: Grependringer | null }).endringer;
const kobling = lesJson(join(rot, '.generert/kobling-endringer.json')) as { nyeUkoblede: string[]; nyeAvvik: string[] } | null;
const udir = lesJson(join(rot, '.generert/udir-endringer.json')) as { endringer: string[]; nyVersjon: string | null } | null;
const rapport = lagUkesrapport({ register, kildestatus, verdistatus, endringer, indeks, repo, grep, kobling, udir, ...(forslag ? { forslag } : {}) });

// Kontrollrunden: første mandag i mai og august, eller når den startes manuelt (KONTROLLRUNDE=ja).
const praksis = (lesFil(rot, join(rot, 'content/kontroll/praksis.yaml')) as Praksisfil).praksis;
const periode = process.env.KONTROLLRUNDE === 'ja' ? idag.slice(0, 7) : rundeperiode(idag);
const fagindeks = lesJson(join(rot, 'data/grep/fagindeks.json')) as Fagindeks | null;
const runde = periode ? lagKontrollrunde(periode, praksisTilBekreftelse(praksis, idag), indeks, repo, fagindeks ? kontrollenker(fagindeks) : [], register) : null;

async function github<T>(metode: string, sti: string, kropp?: unknown): Promise<T> {
  const svar = await fetch(`${api}/repos/${repo}${sti}`, {
    method: metode,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    ...(kropp === undefined ? {} : { body: JSON.stringify(kropp) }),
  });
  if (!svar.ok) throw new Error(`GitHub ${metode} ${sti}: ${svar.status} ${await svar.text()}`);
  return (svar.status === 204 ? null : await svar.json()) as T;
}

type Sak = { number: number; body: string | null; pull_request?: unknown };

async function aapneSaker(etikett: string): Promise<Sak[]> {
  const saker = await github<Sak[]>('GET', `/issues?labels=${etikett}&state=open&per_page=100`);
  return saker.filter((s) => !s.pull_request);
}

async function sikreEtikett(navn: string, beskrivelse: string): Promise<void> {
  try {
    await github('GET', `/labels/${navn}`);
  } catch {
    await github('POST', '/labels', { name: navn, color: 'fbca04', description: beskrivelse });
  }
}

async function utfor(h: Sakshandling): Promise<void> {
  if (h.type === 'opprett') {
    await github('POST', '/issues', { title: h.tittel, body: h.tekst, labels: [KONTROLLETIKETT] });
  } else if (h.type === 'oppdater') {
    await github('PATCH', `/issues/${h.nummer}`, { title: h.tittel, body: h.tekst });
    if (h.kommentar) await github('POST', `/issues/${h.nummer}/comments`, { body: h.kommentar });
  } else {
    await github('POST', `/issues/${h.nummer}/comments`, { body: h.kommentar });
    await github('PATCH', `/issues/${h.nummer}`, { state: 'closed', state_reason: 'completed' });
  }
}

if (!token || !process.env.GITHUB_REPOSITORY) {
  console.log(`[tørrkjøring] ${rapport.aapen ? rapport.tittel : 'Ingen kontrollsak denne uken.'}\n`);
  if (rapport.aapen) console.log(rapport.tekst);
  if (runde) console.log(`\n[tørrkjøring] ${runde.tittel}\n\n${runde.tekst}`);
} else {
  const [kontroll] = await aapneSaker(KONTROLLETIKETT);
  const gamle = (await aapneSaker(GAMMEL_ETIKETT)).map((s) => s.number);
  const handlinger = planleggKontrollsak(rapport, kontroll ? { nummer: kontroll.number, tekst: kontroll.body } : null, gamle);
  if (handlinger.some((h) => h.type === 'opprett')) await sikreEtikett(KONTROLLETIKETT, 'Ukentlig kontrollsak fra kildesjekken');
  for (const h of handlinger) {
    await utfor(h);
    console.log(h.type === 'opprett' ? `Opprettet kontrollsak: ${h.tittel}` : `${h.type} sak #${h.nummer}`);
  }
  if (handlinger.length === 0) console.log('Ingen kontrollsak denne uken.');

  if (runde && periode) {
    // Bare én sak per runde, også om jobben kjøres flere ganger i uken.
    const finnes = (await github<Sak[]>('GET', `/issues?labels=${RUNDEETIKETT}&state=all&per_page=100`)).some((s) => s.body?.includes(rundemerke(periode)));
    if (finnes) {
      console.log(`Kontrollrunden for ${periode} finnes allerede.`);
    } else {
      await sikreEtikett(RUNDEETIKETT, 'Kontrollrunde i mai og august');
      await github('POST', '/issues', { title: runde.tittel, body: runde.tekst, labels: [RUNDEETIKETT] });
      console.log(`Opprettet kontrollrunde: ${runde.tittel}`);
    }
  }
}
