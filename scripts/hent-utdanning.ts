// Henter fra utdanning.no (HK-dir) til data/utdanning/. Kjøres hver uke av kildesjekken, sammen med Grep og VIGO.
// - lop.json: løpene i videregående (avgjørelse 052). Brukes bare til kontroll mot Grep og VIGO
//   (src/modules/fag/tilbud/kildesamsvar.ts) og til lenker til utdanning.no.
// - skoler.json: skolene og programområdene de tilbyr (avgjørelse 053). Vises i appen etter beskjed fra eier.
// - yrker.json: utdanningsbeskrivelsen og yrkene for programområdene (avgjørelse 053), åpne data (NLOD).
// API-et er «åpent api for interne tjenester på utdanning.no», uten lisens, ikke versjonert og kan endres uten
// forvarsel. Hver fil hentes for seg; feiler én, blir forrige versjon av den stående.
// Hentingen går gjennom treet fra hvert Vg1 (`/vgs/lop?parent_path=Vg1;Vg2;…`), fordi barna avhenger av veien dit.
// Bruk: npm run hent:utdanning
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skolerSkjema, utdanningslopSkjema, type Utdanningslop, yrkerSkjema } from '../src/modules/fag/utdanning/skjema.ts';
import { lesFagindeks } from './data/les.ts';
import { hentJson, iRunder, lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import {
  byggSkoler,
  byggUtdanningslop,
  byggYrker,
  type Lopsbarn,
  type Programinfo,
  sammenlignSkoler,
  sammenlignUtdanningslop,
  sammenlignYrker,
  type Skolerad,
  validerSkoler,
  validerUtdanningslop,
  validerYrker,
} from './utdanning/bygg.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const UTDANNING_API = 'https://v3.api.utdanning.no';
/** Vg1 → Vg2 → Vg3 → Vg4 og ett trinn til for påbygging. */
const MAKS_DYBDE = 5;
const SAMTIDIGE = 6;

async function barn(sti: readonly string[]): Promise<Lopsbarn[]> {
  const url = `${UTDANNING_API}/vgs/lop${sti.length > 0 ? `?parent_path=${encodeURIComponent(sti.join(';'))}` : ''}`;
  const data = await hentJson(url);
  if (!Array.isArray(data)) throw new Error(`Uventet svar fra ${url}.`);
  return data as Lopsbarn[];
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

/** Henter og skriver én datafil. Feiler den, blir forrige fil stående, og feilen står i endringene. */
async function del<T extends { hentet: string }>(
  navn: string,
  fil: string,
  lag: () => Promise<T>,
  valider: (d: T) => string[],
  sammenlign: (g: T | null, n: T) => string[],
): Promise<{ endret: boolean; forste: boolean; endringer: string[]; feil: string | null }> {
  try {
    const data = await lag();
    const feil = valider(data);
    if (feil.length > 0) throw new Error(`${navn} fra utdanning.no ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige fil.`);
    const forrige = lesForrige<T>(join(rot, fil));
    const endringer = sammenlign(forrige, data);
    return { endret: skrivHvisEndret(join(rot, fil), forrige, data), forste: !forrige, endringer, feil: null };
  } catch (e) {
    console.error(e);
    return { endret: false, forste: false, endringer: [], feil: e instanceof Error ? e.message : String(e) };
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hentet = new Date().toISOString();
  const programomrader = lesFagindeks(rot).programomrader;
  const lop = await del(
    'Løpene',
    'data/utdanning/lop.json',
    async () => {
      const { kanter, titler } = await hentTre();
      return utdanningslopSkjema.parse(byggUtdanningslop(kanter, titler, hentet));
    },
    validerUtdanningslop,
    sammenlignUtdanningslop,
  );
  const skoler = await del(
    'Skolene',
    'data/utdanning/skoler.json',
    async () => {
      const rader = await hentJson(`${UTDANNING_API}/vgs/skole`);
      if (!Array.isArray(rader)) throw new Error('Uventet svar fra /vgs/skole.');
      return skolerSkjema.parse(byggSkoler(rader as Skolerad[], programomrader, hentet));
    },
    validerSkoler,
    sammenlignSkoler,
  );
  // Yrkene hentes for programområdene i løpene, som utdanning.no har en side for.
  const noder = Object.keys(lesForrige<Utdanningslop>(join(rot, 'data/utdanning/lop.json'))?.noder ?? {});
  const yrker = await del(
    'Yrkene',
    'data/utdanning/yrker.json',
    async () => {
      const info = await iRunder(noder, SAMTIDIGE, (k) => hentJson(`${UTDANNING_API}/vgs/programomrade_info/${encodeURIComponent(k)}`));
      return yrkerSkjema.parse(byggYrker(info as Programinfo[], hentet));
    },
    validerYrker,
    sammenlignYrker,
  );
  skrivEndringer(rot, 'utdanning', { ...lop, skoler, yrker });
  for (const [navn, d] of [['Løpene', lop], ['Skolene', skoler], ['Yrkene', yrker]] as const) {
    console.log(`utdanning.no – ${navn}: ${d.feil ? `feilet (${d.feil})` : d.forste ? 'første henting' : `${d.endringer.length} endringer`}.`);
  }
  if (lop.feil || skoler.feil || yrker.feil) process.exitCode = 1;
}
