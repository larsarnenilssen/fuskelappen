// Henter løpene i videregående fra utdanning.no (HK-dir) til data/utdanning/lop.json (avgjørelse 052). Kjøres hver
// uke av kildesjekken, sammen med Grep og VIGO. Løpene brukes bare til kontroll mot Grep og VIGO
// (src/modules/fag/tilbud/kildesamsvar.ts) og til lenker til utdanning.no. API-et er «åpent api for interne
// tjenester på utdanning.no», uten lisens, ikke versjonert og kan endres uten forvarsel. Derfor vises ikke innholdet.
// Hentingen går gjennom treet fra hvert Vg1 (`/vgs/lop?parent_path=Vg1;Vg2;…`), fordi barna avhenger av veien dit.
// Feiler hentingen, eller ser dataene feil ut, kastes en feil før noe skrives, og forrige fil blir stående.
// Bruk: npm run hent:utdanning
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { utdanningslopSkjema, type Utdanningslop } from '../src/modules/fag/utdanning/skjema.ts';
import { USER_AGENT } from './kilder/metoder.ts';
import { byggUtdanningslop, type Lopsbarn, sammenlignUtdanningslop, validerUtdanningslop } from './utdanning/bygg.ts';
import { vigoJson } from './hent-vigo.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const UTDANNING_API = 'https://v3.api.utdanning.no';
/** Vg1 → Vg2 → Vg3 → Vg4 og ett trinn til for påbygging. */
const MAKS_DYBDE = 5;
const SAMTIDIGE = 6;

async function barn(sti: readonly string[]): Promise<Lopsbarn[]> {
  const url = `${UTDANNING_API}/vgs/lop${sti.length > 0 ? `?parent_path=${encodeURIComponent(sti.join(';'))}` : ''}`;
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`${url} svarte ${r.status}`);
      const data = (await r.json()) as unknown;
      if (!Array.isArray(data)) throw new Error(`Uventet svar fra ${url}.`);
      return data as Lopsbarn[];
    } catch (e) {
      feil = e;
      await new Promise((v) => setTimeout(v, 2000 * forsok));
    }
  }
  throw feil;
}

/** Går gjennom treet fra hvert Vg1, noen kall om gangen. */
async function hentTre(): Promise<{ kanter: { fra: string; barn: Lopsbarn }[]; titler: Record<string, string> }> {
  const kanter: { fra: string; barn: Lopsbarn }[] = [];
  const titler: Record<string, string> = {};
  const start = await barn([]);
  for (const b of start) if (b.programomrade_tittel) titler[b.programomradekode10] = b.programomrade_tittel;
  const ko: string[][] = start.map((b) => [b.programomradekode10]);
  const sett = new Set<string>();
  while (ko.length > 0) {
    const runde = ko.splice(0, SAMTIDIGE).filter((s) => !sett.has(s.join(';')) && s.length <= MAKS_DYBDE);
    for (const s of runde) sett.add(s.join(';'));
    const svar = await Promise.all(runde.map((s) => barn(s)));
    runde.forEach((s, i) => {
      for (const b of svar[i] ?? []) {
        kanter.push({ fra: s.at(-1) as string, barn: b });
        if (!s.includes(b.programomradekode10)) ko.push([...s, b.programomradekode10]);
      }
    });
  }
  return { kanter, titler };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hentet = new Date().toISOString();
  const { kanter, titler } = await hentTre();
  const lop = byggUtdanningslop(kanter, titler, hentet);
  utdanningslopSkjema.parse(lop);
  const feil = validerUtdanningslop(lop);
  if (feil.length > 0) throw new Error(`Løpene fra utdanning.no ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige fil.`);
  const fil = join(rot, 'data/utdanning/lop.json');
  const forrige = existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as Utdanningslop) : null;
  const endringer = sammenlignUtdanningslop(forrige, lop);
  const utenTid = (d: Utdanningslop) => vigoJson({ ...d, hentet: '' });
  // Filen skrives bare når innholdet er endret, så tidspunktet alene ikke gir en ny versjon.
  const endret = !forrige || utenTid(forrige) !== utenTid(lop);
  if (endret) {
    mkdirSync(join(rot, 'data/utdanning'), { recursive: true });
    writeFileSync(fil, vigoJson(lop));
  }
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/utdanning-endringer.json'), `${JSON.stringify({ endret, forste: !forrige, endringer }, null, 2)}\n`);
  console.log(`utdanning.no: ${Object.keys(lop.noder).length} programområder og ${Object.values(lop.videre).flat().length} koblinger i løpene. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}`);
}
