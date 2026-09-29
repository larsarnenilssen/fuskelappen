// Kildejobben: sjekker aktive kilder og skriver data/status/kildestatus.json.
// Bruk: npm run kilder:sjekk [-- --simuler-feil=<kilde-id>]
// Varsler (GitHub-issues) sendes av scripts/kilder/varsle.ts etterpå.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Fylker, Kilde, Kilderegister } from '../../src/core/innhold/skjema.ts';
import { lesKildestatus, type Kildestatusfil, type KildestatusPost } from '../../src/core/kildestatus/kildestatus.ts';
import { lesFil } from '../innhold/last.ts';
import { lagFingeravtrykk, nyPost, vurderMotGodkjent, type Sjekkresultat } from './logikk.ts';
import { hentSkoler, sjekkSide, skoleendringer, type Skole } from './metoder.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const statusfil = join(rot, 'data/status/kildestatus.json');
const skolefil = join(rot, 'data/skoler/vgs.json');
const generert = join(rot, '.generert');

const simulertFeil = process.argv.find((a) => a.startsWith('--simuler-feil='))?.split('=')[1]?.trim() || null;

const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
const fylker = new Set((lesFil(rot, join(rot, 'content/fylker.yaml')) as Fylker).fylker.map((f) => f.nummer));

if (simulertFeil && !register.kilder.some((k) => k.id === simulertFeil && k.aktiv)) {
  console.error(`Ukjent eller inaktiv kilde for simulert feil: ${simulertFeil}`);
  process.exit(1);
}

function lesJson(fil: string): unknown {
  return existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as unknown) : null;
}

const forrige: Kildestatusfil | null = lesKildestatus(lesJson(statusfil));
const naa = new Date().toISOString();
const rapport: string[] = [];

async function sjekkNsr(kilde: Kilde): Promise<Sjekkresultat> {
  const skoler = await hentSkoler(fylker);
  const tidligere = (lesJson(skolefil) as { skoler?: Skole[] } | null)?.skoler ?? [];
  const endring = skoleendringer(tidligere, skoler);
  const endret = endring.nye.length + endring.fjernet.length + endring.endret.length > 0 || tidligere.length === 0;
  if (endret) {
    mkdirSync(join(rot, 'data/skoler'), { recursive: true });
    // Én skole per linje gir lesbare endringer i git.
    const linjer = skoler.map((s) => `    ${JSON.stringify(s)}`).join(',\n');
    const hode = `"kilde": ${JSON.stringify(kilde.id)}, "hentet": ${JSON.stringify(naa)}, "antall": ${skoler.length}`;
    writeFileSync(skolefil, `{\n  ${hode},\n  "skoler": [\n${linjer}\n  ]\n}\n`);
  }
  rapport.push(
    `### ${kilde.navn}`,
    `${skoler.length} aktive videregående skoler. Nye: ${endring.nye.length}, fjernet: ${endring.fjernet.length}, endret: ${endring.endret.length}.`,
    ...[
      ...endring.nye.map((s) => `- Ny: ${s.navn} (${s.id}, fylke ${s.fylke})`),
      ...endring.fjernet.map((s) => `- Fjernet: ${s.navn} (${s.id}, fylke ${s.fylke})`),
      ...endring.endret.map((s) => `- Endret: ${s.navn} (${s.id}, fylke ${s.fylke})`),
    ].slice(0, 50),
    '',
  );
  // Strukturerte data oppdateres automatisk; status er ok så lenge hentingen lykkes.
  return { status: 'ok', fingeravtrykk: lagFingeravtrykk(JSON.stringify(skoler)), melding: null };
}

async function sjekk(kilde: Kilde): Promise<Sjekkresultat> {
  if (kilde.id === simulertFeil) {
    return { status: 'feilet', fingeravtrykk: null, melding: 'Simulert feil (manuell test av varsling).' };
  }
  try {
    switch (kilde.sjekkmetode) {
      case 'side': {
        const { fingeravtrykk } = await sjekkSide(kilde);
        return vurderMotGodkjent(fingeravtrykk, kilde.godkjent_fingeravtrykk);
      }
      case 'nsr':
        return await sjekkNsr(kilde);
      default:
        return { status: 'feilet', fingeravtrykk: null, melding: `Sjekkmetoden «${kilde.sjekkmetode}» er ikke laget ennå.` };
    }
  } catch (e) {
    return { status: 'feilet', fingeravtrykk: null, melding: e instanceof Error ? e.message : String(e) };
  }
}

const kilder: Record<string, KildestatusPost> = {};
for (const kilde of register.kilder.filter((k) => k.aktiv && k.sjekkmetode !== 'ingen')) {
  const resultat = await sjekk(kilde);
  kilder[kilde.id] = nyPost(forrige?.kilder[kilde.id], resultat, naa);
  console.log(`${kilde.id}: ${resultat.status}${resultat.melding ? ` – ${resultat.melding}` : ''}`);
}

const fil: Kildestatusfil = { skjema: 1, kjort: naa, kilder };
mkdirSync(join(rot, 'data/status'), { recursive: true });
writeFileSync(statusfil, `${JSON.stringify(fil, null, 2)}\n`);

const tabell = [
  '## Kildesjekk',
  '',
  `Kjørt ${naa}${simulertFeil ? ` (simulert feil for ${simulertFeil})` : ''}.`,
  '',
  '| Kilde | Status | Melding |',
  '|---|---|---|',
  ...Object.entries(kilder).map(([id, p]) => `| ${id} | ${p.status} | ${p.melding ?? ''} |`),
  '',
  ...rapport,
];
mkdirSync(generert, { recursive: true });
writeFileSync(join(generert, 'kilderapport.md'), `${tabell.join('\n')}\n`);
console.log(`Skrev ${statusfil}`);
