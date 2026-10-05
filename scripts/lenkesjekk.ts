// Lenkesjekken (avgjørelse 062): sjekker alle faste lenker i appen og en del av de massegenererte (stikkprøver), fører
// status per lenke i .generert/lenkestatus.json (kildesjekken lagrer den på grenen lenkesjekk), og holder
// kontrollsaken for lenkene (etikett «lenker») oppdatert. Kjøres hver uke av kildesjekken.
// Reglene for hvilke lenker som sjekkes, står i scripts/lenker/regler.ts.
// Bruk: npm run lenker:sjekk [-- --antall=<stikkprøver>]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { samleLenker } from './lenker/samle.ts';
import { type Lenkestatus, lagRapport, oppdaterStatus, sjekkAlle, stengteNettsteder, velgStikkprove } from './lenker/sjekk.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const statusfil = join(rot, '.generert/lenkestatus.json');
/** Stikkprøver per sjekk: med om lag 2 500 massegenererte lenker er alle sjekket i løpet av et par måneder. */
const STIKKPROVER = Number(process.argv.find((a) => a.startsWith('--antall='))?.split('=')[1] ?? 300);
const ETIKETT = 'lenker';

const idag = new Date().toISOString().slice(0, 10);
const forrige = existsSync(statusfil) ? (JSON.parse(readFileSync(statusfil, 'utf8')) as Lenkestatus) : null;
const lenker = samleLenker(rot);
const faste = lenker.filter((l) => l.type === 'fast').map((l) => l.url);
const stikkprove = velgStikkprove(lenker, forrige, STIKKPROVER);
const start = Date.now();
const resultater = await sjekkAlle([...faste, ...stikkprove]);
const status = oppdaterStatus(forrige, resultater, new Set(lenker.map((l) => l.url)), idag);
mkdirSync(join(rot, '.generert'), { recursive: true });
writeFileSync(statusfil, `${JSON.stringify(status, null, 1)}\n`);
const stengte = stengteNettsteder(resultater);
const rapport = lagRapport(status, lenker, stengte);
writeFileSync(join(rot, '.generert/lenkerapport.md'), rapport);
const antall = (svar: string) => resultater.filter((r) => r.svar === svar).length;
console.log(
  `Lenkesjekk: ${resultater.length} lenker (${faste.length} faste, ${stikkprove.length} stikkprøver av ${lenker.length - faste.length}) på ${Math.round((Date.now() - start) / 1000)} s. ` +
    `OK ${antall('ok')}, flyttet ${antall('flyttet')}, borte ${antall('borte')}, feil ${antall('feil')}. Stengte nettsteder: ${stengte.join(', ') || 'ingen'}.`,
);

// Kontrollsaken for lenkene: opprettes, oppdateres eller lukkes. Uten GITHUB_TOKEN skrives rapporten bare ut.
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY ?? 'larsarnenilssen/jukselappen';
const api = process.env.GITHUB_API_URL ?? 'https://api.github.com';
if (!token) {
  console.log(rapport || 'Ingen lenker trenger tilsyn.');
} else {
  const kall = async (sti: string, metode = 'GET', kropp?: unknown) => {
    const svar = await fetch(`${api}/repos/${repo}${sti}`, {
      method: metode,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      ...(kropp ? { body: JSON.stringify(kropp) } : {}),
    });
    if (!svar.ok) throw new Error(`GitHub svarte ${svar.status} på ${metode} ${sti}`);
    return svar.json() as Promise<unknown>;
  };
  const apne = (await kall(`/issues?state=open&labels=${ETIKETT}&per_page=10`)) as { number: number }[];
  const sak = apne[0];
  if (!rapport) {
    if (sak) {
      await kall(`/issues/${sak.number}`, 'PATCH', { state: 'closed', state_reason: 'completed' });
      console.log(`Lukket sak #${sak.number}: ingen lenker trenger tilsyn.`);
    }
  } else if (sak) {
    await kall(`/issues/${sak.number}`, 'PATCH', { body: rapport });
    console.log(`Oppdaterte sak #${sak.number}.`);
  } else {
    const ny = (await kall('/issues', 'POST', { title: 'Lenker som ikke virker', body: rapport, labels: [ETIKETT] })) as { number: number };
    console.log(`Opprettet sak #${ny.number}.`);
  }
}
