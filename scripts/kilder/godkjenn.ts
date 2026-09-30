// Godkjenning fra en kontrollsak (avgjørelse 021). Kjøres av .github/workflows/godkjenning.yml når eier skriver
// /godkjent i en kommentar på en sak med etiketten «kontroll» eller «kontrollrunde». Leser punktene eier har
// krysset av og id-ene etter /godkjent, setter datoen og lagrer på main når testene består. Ellers lages en PR.
// Miljø: SAK, SAKSTEKST, KOMMENTAR, GITHUB_TOKEN og GITHUB_REPOSITORY. Uten GITHUB_TOKEN endres filene lokalt,
// men ingenting lagres eller sendes (for å prøve lokalt).
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Innholdselement, Praksisfil } from '../../src/core/innhold/skjema.ts';
import { lesKildestatus } from '../../src/core/kildestatus/kildestatus.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { lesFil } from '../innhold/last.ts';
import {
  avkryssede,
  beskriv,
  kommandoIder,
  settBekreftet,
  settFingeravtrykk,
  settKontrollertInnhold,
  settKontrollertVerdi,
  type Godkjenning,
} from './godkjenning.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const sak = process.env.SAK ?? '?';
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const api = process.env.GITHUB_API_URL ?? 'https://api.github.com';
const idag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
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

const regelfiler = yamlFiler(join(rot, 'rules')).map((fil) => ({ fil, r: lesFil(rot, fil) as Regelsett }));
const spesielle = new Set(['kilder.yaml', 'fylker.yaml', 'synonymer.yaml', 'praksis.yaml']);
const innholdsfiler = yamlFiler(join(rot, 'content'))
  .filter((f) => !spesielle.has(f.split('/').pop() ?? ''))
  .map((fil) => ({ fil, ider: (lesFil(rot, fil, false) as Innholdselement[]).map((e) => e.id) }));
const praksisfil = join(rot, 'content/kontroll/praksis.yaml');
const praksisIder = new Set((lesFil(rot, praksisfil) as Praksisfil).praksis.map((p) => p.id));
const kildestatus = lesKildestatus(existsSync(join(rot, 'data/status/kildestatus.json')) ? JSON.parse(readFileSync(join(rot, 'data/status/kildestatus.json'), 'utf8')) : null);

/** Gjør en id eier har skrevet, om til en godkjenning: innhold, regelverdi, praksis eller kilde. */
function tolk(id: string): Godkjenning | null {
  if (praksisIder.has(id)) return { type: 'praksis', id };
  if (innholdsfiler.some((f) => f.ider.includes(id))) return { type: 'innhold', id };
  const [regelsett, nokkel] = id.includes('/') ? id.split('/') : [null, id];
  const treff = regelfiler.filter(({ r }) => (regelsett === null || r.id === regelsett) && nokkel !== undefined && nokkel in r.verdier);
  if (treff.length === 1 && treff[0]) return { type: 'verdi', id: `${treff[0].r.id}/${nokkel}` };
  const post = kildestatus?.kilder[id];
  if (post?.status === 'endret' && post.fingeravtrykk) return { type: 'kilde', id, fingeravtrykk: post.fingeravtrykk };
  return null;
}

const ider = kommandoIder(process.env.KOMMENTAR ?? '');
const ukjente = ider.filter((id) => tolk(id) === null);
const alle = [...avkryssede(process.env.SAKSTEKST ?? ''), ...ider.map(tolk).filter((g): g is Godkjenning => g !== null)];
const godkjenninger = alle.filter((g, i) => alle.findIndex((h) => h.type === g.type && h.id === g.id) === i);

function endre(fil: string, f: (tekst: string) => string | null): boolean {
  const ny = f(readFileSync(fil, 'utf8'));
  if (ny === null) return false;
  writeFileSync(fil, ny);
  return true;
}

const utfort: string[] = [];
const ikkeFunnet: string[] = [...ukjente];
/** Setter datoen for én godkjenning. Gir false hvis elementet ikke finnes i filene. */
function godkjenn(g: Godkjenning): boolean {
  if (g.type === 'kilde') return endre(join(rot, 'content/kilder.yaml'), (t) => settFingeravtrykk(t, g.id, g.fingeravtrykk, idag, sak));
  if (g.type === 'praksis') return endre(praksisfil, (t) => settBekreftet(t, g.id, idag));
  if (g.type === 'innhold') return innholdsfiler.filter((f) => f.ider.includes(g.id)).some((f) => endre(f.fil, (t) => settKontrollertInnhold(t, g.id, idag)));
  const [regelsett, nokkel = ''] = g.id.split('/');
  return regelfiler.filter(({ r }) => r.id === regelsett && nokkel in r.verdier).some(({ fil }) => endre(fil, (t) => settKontrollertVerdi(t, nokkel, idag)));
}

for (const g of godkjenninger) {
  if (godkjenn(g)) utfort.push(beskriv(g));
  else ikkeFunnet.push(g.id);
}

const ukjentTekst = ikkeFunnet.length > 0 ? `\n\nFant ikke: ${ikkeFunnet.map((i) => `\`${i}\``).join(', ')}. Bruk id-ene fra kontrolloversikten (docs/KONTROLL.md).` : '';

if (!token || !repo) {
  console.log(`[tørrkjøring] ${utfort.length > 0 ? utfort.join('\n') : 'Ingenting å godkjenne.'}${ukjentTekst}`);
  process.exit(0);
}

if (utfort.length === 0) {
  await github('POST', `/issues/${sak}/comments`, {
    body: `Fant ingenting å godkjenne. Kryss av punktene i saken først, eller skriv id-ene etter /godkjent, for eksempel \`/godkjent arsverk planleggingsdager\`.${ukjentTekst}`,
  });
  process.exit(0);
}

let testerOk = true;
try {
  execFileSync('npx', ['vitest', 'run'], { cwd: rot, stdio: 'inherit' });
} catch {
  testerOk = false;
}
const melding = `Godkjent av eier i sak #${sak}\n\n${utfort.map((u) => `- ${u}`).join('\n')}`;
git('add', '-A', 'content', 'rules');
git('commit', '-m', melding);
let hvor: string;
if (testerOk) {
  git('push', 'origin', 'HEAD:main');
  hvor = `Lagret på main (${git('rev-parse', '--short', 'HEAD')}). Merkene «Kontrollert» vises i appen fra neste versjon.`;
} else {
  const gren = `kontroll/godkjenning-${sak}`;
  git('push', '--force', 'origin', `HEAD:refs/heads/${gren}`);
  const pr = await github<{ html_url: string }>('POST', '/pulls', { title: `Godkjenning fra sak #${sak}`, head: gren, base: 'main', body: `${melding}\n\nTestene feilet med endringene, så de er ikke lagret på main. Se loggen for jobben «Godkjenning».` });
  await github('POST', '/actions/workflows/ci.yml/dispatches', { ref: gren }).catch(() => undefined);
  hvor = `Testene feilet, så endringene ligger i ${pr.html_url} i stedet for på main.`;
}
await github('POST', `/issues/${sak}/comments`, { body: `Godkjent ${idag.split('-').reverse().join('.')}:\n\n${utfort.map((u) => `- ${u}`).join('\n')}\n\n${hvor}${ukjentTekst}` });
console.log(hvor);
