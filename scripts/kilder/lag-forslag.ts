// Lager endringsforslag (PR) fra kildesjekken (avgjørelse 020):
// - kontroll/forslag: nye tall og sitater i regelfilene når tallene i kildene er endret
// - kontroll/grep: nye Grep-data når testene feiler med dem (ellers tas de inn automatisk)
// Kjøres i kilder.yml etter at statusfilene er lagret på main. Grenene lages fra main og skrives over hver uke.
// PR-er som lages med GITHUB_TOKEN, starter ikke CI av seg selv, så CI startes med workflow_dispatch, og
// testresultatet fra jobben står i beskrivelsen. Uten GITHUB_TOKEN skrives forslagene bare ut.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lesVerdistatus, sjekkbareVerdier } from '../../src/core/kontroll/verdisjekk.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { lesRegelsett } from '../innhold/alt.ts';
import { lesFil } from '../innhold/last.ts';
import { endreRegelfil, finnVerdiendringer, forslagstekst, grepforslagstekst, type Verdiendring } from './forslag.ts';
import { grepdetaljer, grepsammendrag, type Grependringer } from './grep.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const generert = join(rot, '.generert');
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const api = process.env.GITHUB_API_URL ?? 'https://api.github.com';
const ekte = Boolean(token && repo);

const lesJson = (fil: string): unknown => (existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as unknown) : null);
const git = (...args: string[]) => execFileSync('git', args, { cwd: rot, encoding: 'utf8' }).trim();

async function github<T>(metode: string, sti: string, kropp?: unknown): Promise<T> {
  const svar = await fetch(`${api}/repos/${repo}${sti}`, {
    method: metode,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    ...(kropp === undefined ? {} : { body: JSON.stringify(kropp) }),
  });
  if (!svar.ok) throw new Error(`GitHub ${metode} ${sti}: ${svar.status} ${await svar.text()}`);
  return (svar.status === 204 ? null : await svar.json()) as T;
}

function yamlFiler(mappe: string): string[] {
  return readdirSync(mappe).flatMap((navn) => {
    const sti = join(mappe, navn);
    return statSync(sti).isDirectory() ? yamlFiler(sti) : navn.endsWith('.yaml') ? [sti] : [];
  });
}

/** Regelfilen der en verdi står (regelsett kan være delt på flere filer). */
function regelfil(regelsett: string, nokkel: string): string {
  const fil = yamlFiler(join(rot, 'rules')).find((f) => {
    const r = lesFil(rot, f) as Regelsett;
    return r.id === regelsett && nokkel in r.verdier;
  });
  if (!fil) throw new Error(`Fant ikke regelfilen for ${regelsett}/${nokkel}.`);
  return fil;
}

/** Kjører testene og gir navnene på testene som feiler. */
function feiledeTester(): string[] {
  const fil = join(generert, 'forslag-tester.json');
  try {
    execFileSync('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${fil}`], { cwd: rot, stdio: 'ignore' });
  } catch {
    // Feilende tester gir feilkode; resultatet står i filen.
  }
  const r = lesJson(fil) as { testResults?: { name: string; assertionResults: { fullName: string; status: string }[] }[] } | null;
  if (!r?.testResults) return ['Testene kunne ikke kjøres. Se loggen for steget «Endringsforslag».'];
  return r.testResults.flatMap((f) => f.assertionResults.filter((a) => a.status === 'failed').map((a) => `${relative(rot, f.name)}: ${a.fullName}`));
}

/** Lager grenen fra main med endringene, pusher den og lager eller oppdaterer PR-en. Går tilbake til main. */
async function lagPr(gren: string, tittel: string, endre: () => void, beskrivelse: (feilet: string[]) => string): Promise<string | null> {
  git('checkout', '-B', gren);
  try {
    endre();
    const feilet = feiledeTester();
    git('add', '-A', 'rules', 'data/grep');
    git('commit', '-m', tittel);
    git('push', '--force', 'origin', gren);
    const eier = repo?.split('/')[0] ?? '';
    const [aapen] = await github<{ number: number; html_url: string }[]>('GET', `/pulls?head=${eier}:${gren}&state=open`);
    const tekst = beskrivelse(feilet);
    const pr = aapen
      ? await github<{ number: number; html_url: string }>('PATCH', `/pulls/${aapen.number}`, { title: tittel, body: tekst })
      : await github<{ number: number; html_url: string }>('POST', '/pulls', { title: tittel, head: gren, base: 'main', body: tekst });
    await github('POST', '/actions/workflows/ci.yml/dispatches', { ref: gren }).catch((e: unknown) => console.warn(`Kunne ikke starte CI: ${String(e)}`));
    console.log(`${aapen ? 'Oppdaterte' : 'Opprettet'} PR #${pr.number}: ${pr.html_url}`);
    return pr.html_url;
  } finally {
    git('checkout', '--force', 'main');
  }
}

// ---------- Nye tall og sitater ----------

const tekstmappe = join(generert, 'kildetekster');
const tekster: Record<string, string> = {};
if (existsSync(tekstmappe)) for (const f of readdirSync(tekstmappe)) tekster[f.replace(/\.txt$/, '')] = readFileSync(join(tekstmappe, f), 'utf8');
const endringer: Verdiendring[] = finnVerdiendringer(
  sjekkbareVerdier(lesRegelsett(rot)),
  lesVerdistatus(lesJson(join(rot, 'data/status/verdistatus.json'))),
  tekster,
);

function endreTall(): void {
  for (const e of endringer) {
    const fil = regelfil(e.regelsett, e.nokkel);
    writeFileSync(fil, endreRegelfil(readFileSync(fil, 'utf8'), e.nokkel, e));
  }
}

const resultat: { verdier: string | null; grep: string | null } = { verdier: null, grep: null };

if (endringer.length > 0) {
  const tittel = `Kildesjekken: ${endringer.length} ${endringer.length === 1 ? 'tall eller sitat' : 'tall og sitater'} å oppdatere`;
  if (ekte) {
    resultat.verdier = await lagPr('kontroll/forslag', tittel, endreTall, (feilet) => forslagstekst(endringer, feilet, null));
  } else {
    console.log(`[tørrkjøring] ${tittel}`);
    for (const e of endringer) console.log(`- ${e.id}: ${e.fra} → ${e.til ?? '(bare sitatet)'}: «${e.nyttSitat}»`);
  }
} else {
  console.log('Ingen tall å oppdatere.');
}

// ---------- Grep når testene feiler ----------

const grepNy = join(generert, 'grep-ny');
const grepTester = existsSync(join(generert, 'grep-tester.txt')) ? readFileSync(join(generert, 'grep-tester.txt'), 'utf8').trim() : '';
if (grepTester === 'feilet' && existsSync(grepNy)) {
  const { endringer: g } = (lesJson(join(generert, 'grep-endringer.json')) ?? { endringer: null }) as { endringer: Grependringer | null };
  const sammendrag = g ? grepsammendrag(g) : 'Første henting.';
  if (ekte) {
    resultat.grep = await lagPr(
      'kontroll/grep',
      `Grep er endret: ${sammendrag}`,
      () => {
        // Læreplanmappen erstattes helt, så læreplaner som er fjernet i Grep, forsvinner også her.
        rmSync(join(rot, 'data/grep/laereplaner'), { recursive: true, force: true });
        cpSync(grepNy, join(rot, 'data/grep'), { recursive: true });
      },
      (feilet) => grepforslagstekst(sammendrag, g ? grepdetaljer(g) : [], feilet),
    );
  } else {
    console.log(`[tørrkjøring] Grep er endret: ${sammendrag}`);
  }
}

mkdirSync(generert, { recursive: true });
writeFileSync(join(generert, 'forslag.json'), `${JSON.stringify(resultat, null, 2)}\n`);
