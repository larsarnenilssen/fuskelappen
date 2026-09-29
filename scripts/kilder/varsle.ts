// Oppretter, oppdaterer og lukker GitHub-issues ut fra kildestatus. Én sak per kilde, etikett «kilde».
// Kjøres i kilder.yml etter sjekk.ts. Uten GITHUB_TOKEN skrives bare hva som ville blitt gjort.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import { lesKildestatus } from '../../src/core/kildestatus/kildestatus.ts';
import { lesFil } from '../innhold/last.ts';
import { ETIKETT, lesMerke, planleggVarsler, type AapenSak, type Handling } from './logikk.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
const status = lesKildestatus(JSON.parse(readFileSync(join(rot, 'data/status/kildestatus.json'), 'utf8')));
if (!status) throw new Error('Ugyldig data/status/kildestatus.json');

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const api = process.env.GITHUB_API_URL ?? 'https://api.github.com';

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

async function aapneSaker(): Promise<AapenSak[]> {
  const saker = await github<{ number: number; body: string | null; pull_request?: unknown }[]>(
    'GET',
    `/issues?labels=${ETIKETT}&state=open&per_page=100`,
  );
  return saker
    .filter((s) => !s.pull_request)
    .flatMap((s) => {
      const merke = lesMerke(s.body);
      return merke ? [{ nummer: s.number, ...merke }] : [];
    });
}

async function sikreEtikett(): Promise<void> {
  try {
    await github('GET', `/labels/${ETIKETT}`);
  } catch {
    await github('POST', '/labels', { name: ETIKETT, color: 'c5def5', description: 'Varsel fra kildesjekken' });
  }
}

async function utfor(h: Handling): Promise<void> {
  if (h.type === 'opprett') {
    await github('POST', '/issues', { title: h.tittel, body: h.tekst, labels: [ETIKETT] });
  } else if (h.type === 'oppdater') {
    await github('PATCH', `/issues/${h.nummer}`, { body: h.tekst });
    await github('POST', `/issues/${h.nummer}/comments`, { body: h.kommentar });
  } else {
    await github('POST', `/issues/${h.nummer}/comments`, { body: h.kommentar });
    await github('PATCH', `/issues/${h.nummer}`, { state: 'closed', state_reason: 'completed' });
  }
}

const torrkjoring = !token || !repo;
const aapne = torrkjoring ? [] : await aapneSaker();
const handlinger = planleggVarsler(register.kilder, status.kilder, aapne);

if (handlinger.length === 0) console.log('Ingen varsler å sende.');
if (!torrkjoring && handlinger.some((h) => h.type === 'opprett')) await sikreEtikett();
for (const h of handlinger) {
  const beskrivelse = h.type === 'opprett' ? `opprett sak for ${h.kildeId}` : `${h.type} sak #${h.nummer} (${h.kildeId})`;
  if (torrkjoring) {
    console.log(`[tørrkjøring] ${beskrivelse}`);
    continue;
  }
  await utfor(h);
  console.log(beskrivelse);
}
