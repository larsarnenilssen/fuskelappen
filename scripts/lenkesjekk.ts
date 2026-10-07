// Lenkesjekken (avgjørelse 062): sjekker alle faste lenker i appen og en del av de massegenererte (stikkprøver), fører
// status per lenke i .generert/lenkestatus.json (kildesjekken lagrer den på grenen lenkesjekk), og holder
// kontrollsaken for lenkene (etikett «lenker») oppdatert. Saken gjelder bare lenker som er borte eller flyttet.
// Nettstedene som stenger for automatisk sjekk, skrives til data/status/stengte-lenker.json og står i
// kontrolloversikten (sak #98). Kjøres hver uke av kildesjekken, før kontrolloversikten lages.
// Reglene for hvilke lenker som sjekkes, står i scripts/lenker/regler.ts.
// Bruk: npm run lenker:sjekk [-- --antall=<stikkprøver>]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { samleLenker } from './lenker/samle.ts';
import { type Lenkestatus, lagRapport, oppdaterStatus, sjekkAlle, stengteLenker, stengteNettsteder, velgStikkprove } from './lenker/sjekk.ts';
import { finnAapenSak, lagGithub, utforVarsel } from './varsel/github.ts';
import { norskDato, planleggVarsel } from './varsel/plan.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const statusfil = join(rot, '.generert/lenkestatus.json');
const stengtfil = join(rot, 'data/status/stengte-lenker.json');
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
writeFileSync(stengtfil, `${JSON.stringify(stengteLenker(stengte, lenker, idag), null, 2)}\n`);
const rapport = lagRapport(status, lenker);
writeFileSync(join(rot, '.generert/lenkerapport.md'), rapport);
const antall = (svar: string) => resultater.filter((r) => r.svar === svar).length;
console.log(
  `Lenkesjekk: ${resultater.length} lenker (${faste.length} faste, ${stikkprove.length} stikkprøver av ${lenker.length - faste.length}) på ${Math.round((Date.now() - start) / 1000)} s. ` +
    `OK ${antall('ok')}, flyttet ${antall('flyttet')}, borte ${antall('borte')}, feil ${antall('feil')}. Stengte nettsteder: ${stengte.join(', ') || 'ingen'}.`,
);

// Kontrollsaken for lenkene etter samme regel som de andre sakene til eier (avgjørelse 085): e-post når den lages,
// når nye lenker kommer til og som påminnelse annenhver uke, med hele listen. Uten GITHUB_TOKEN skrives den bare ut.
const token = process.env.GITHUB_TOKEN;
const gh = token ? lagGithub(token) : null;
const handlinger = planleggVarsel(
  {
    tittel: 'Lenker som ikke virker',
    tekst: rapport || null,
    idag,
    paminnelseDager: 14,
    lukk: (siden) => `Ingen lenker er borte eller flyttet lenger (sjekket ${norskDato(idag)}). Saken ble laget ${norskDato(siden)}. Lukker den.`,
  },
  gh ? await finnAapenSak(gh, ETIKETT) : null,
);
await utforVarsel(gh, handlinger, ETIKETT, 'Lenker i appen som er borte eller flyttet');
