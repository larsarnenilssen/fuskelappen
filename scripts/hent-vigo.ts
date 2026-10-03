// Henter fra VIGO Kodeverksbase (kodeverk.vigo.no, Novari IKS for fylkeskommunene) til data/vigo/:
// - fagrelasjoner.json: utgåtte fagkoder og koden som erstatter dem, nye versjoner av læreplaner, og fag som brukes
//   sammen (f.eks. tverrfaglig eksamen og fagene den gjelder), og fag som bygger på andre fag (rekkefølgen på fag
//   over flere trinn). Brukes på fagsiden, i fagsøket og i tilbudsstrukturen.
//   Og hva et programområde gir grunnlag for å søke videre på (f.eks. lærefag → Vg4 påbygging), brukt i
//   tilbudsstrukturen.
// - merknader.json: fagmerknader (FAM-koder), vitnemålsmerknader (VMM-koder) og status på søkerønsker. Brukes i
//   begrepsbanken.
// Kjøres hver uke av kildesjekken, sammen med Grep og Udir-1 (avgjørelse 026). Kodebasen er offentlig og åpen for
// oppslag (eier 01.10.2026). Den har ikke dokumentert API; vi bruker det nettsiden selv bruker.
// Feiler hentingen, eller ser dataene feil ut, kastes en feil før noe skrives, og forrige filer blir stående.
// Endringene lagres i .generert/vigo-endringer.json, som kildesjekken tar med i rapporten.
// Bruk: npm run hent:vigo
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fagrelasjonerSkjema, merknaderSkjema, type Fagrelasjoner, type Merknader } from '../src/modules/fag/vigo/skjema.ts';
import { USER_AGENT } from './kilder/metoder.ts';
import { lesFagindeks } from './data/les.ts';
import { byggFagrelasjoner, byggMerknader, sammenlignVigo, validerVigo, type Vigorad } from './vigo/bygg.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const VIGO = 'https://kodeverk.vigo.no/api';
const SIDE = 2000;

/** Alle radene i en tabell eller kobling. API-et gir høyst 2000 rader per side. */
async function hentAlle(sti: string): Promise<Vigorad[]> {
  const ut: Vigorad[] = [];
  for (let side = 0; side < 100; side++) {
    let svar: { content?: Vigorad[]; totalElements?: number } | null = null;
    let feil: unknown;
    for (let forsok = 1; forsok <= 3 && !svar; forsok++) {
      try {
        const r = await fetch(`${VIGO}${sti}?page=${side}&size=${SIDE}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': USER_AGENT },
          body: '[]',
          signal: AbortSignal.timeout(120_000),
        });
        if (!r.ok) throw new Error(`${sti} svarte ${r.status}`);
        svar = (await r.json()) as { content?: Vigorad[]; totalElements?: number };
      } catch (e) {
        feil = e;
        await new Promise((v) => setTimeout(v, 2000 * forsok));
      }
    }
    if (!svar) throw feil;
    if (!Array.isArray(svar.content) || typeof svar.totalElements !== 'number') throw new Error(`Uventet svar fra ${sti}.`);
    ut.push(...svar.content);
    if (ut.length >= svar.totalElements || svar.content.length === 0) return ut;
  }
  throw new Error(`For mange sider i ${sti}.`);
}

/** Kompakt JSON med én linje per oppføring, så filen er liten og endringer er lette å lese i git. */
export function vigoJson(d: object): string {
  const deler = Object.entries(d).map(([k, v]) => {
    if (v && typeof v === 'object') {
      const linjer = Array.isArray(v) ? v.map((x) => JSON.stringify(x)) : Object.entries(v as object).map(([n, x]) => `${JSON.stringify(n)}:${JSON.stringify(x)}`);
      return `${JSON.stringify(k)}: ${Array.isArray(v) ? '[' : '{'}\n${linjer.join(',\n')}\n${Array.isArray(v) ? ']' : '}'}`;
    }
    return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
  });
  return `{\n${deler.join(',\n')}\n}\n`;
}
const utenTid = <T extends { hentet: string }>(d: T) => vigoJson({ ...d, hentet: '' });

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hentet = new Date().toISOString();
  const [erstatter, erstattesAv, brukesSammen, paabygning, fag, vitnemal, sokerstatuser, grunnlag] = await Promise.all([
    hentAlle('/relation/element-replaces-element'),
    hentAlle('/relation/replaced-by'),
    hentAlle('/relation/course-used-together-with'),
    hentAlle('/relation/course-paabygning'),
    hentAlle('/course-remarks'),
    hentAlle('/diploma-remarks'),
    hentAlle('/wish-statuses'),
    hentAlle('/entry-requirements'),
  ]);
  // Grunnlaget for inntak tas bare med for programområdene i fagindeksen, som hentes fra Grep i samme steg.
  const programomrader = new Set(Object.keys(lesFagindeks(rot).programomrader));
  const { data: rel, merknader: relmerknader } = byggFagrelasjoner({ erstatter, erstattesAv, brukesSammen, paabygning, grunnlag }, hentet, programomrader);
  const m = byggMerknader({ fag, vitnemal, sokerstatuser }, hentet);
  fagrelasjonerSkjema.parse(rel);
  merknaderSkjema.parse(m);
  const feil = validerVigo(rel, m);
  if (feil.length > 0) throw new Error(`Dataene fra VIGO Kodeverksbase ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige filer.`);

  const relfil = join(rot, 'data/vigo/fagrelasjoner.json');
  const mfil = join(rot, 'data/vigo/merknader.json');
  const forrigeRel = existsSync(relfil) ? (JSON.parse(readFileSync(relfil, 'utf8')) as Fagrelasjoner) : null;
  const forrigeM = existsSync(mfil) ? (JSON.parse(readFileSync(mfil, 'utf8')) as Merknader) : null;
  const forste = !forrigeRel || !forrigeM;
  const endringer = forste ? [] : sammenlignVigo({ rel: forrigeRel, m: forrigeM }, { rel, m });
  // Filene skrives bare når innholdet er endret, så tidspunktet alene ikke gir en ny versjon.
  const endret = forste || utenTid(forrigeRel) !== utenTid(rel) || utenTid(forrigeM) !== utenTid(m);
  if (endret) {
    mkdirSync(join(rot, 'data/vigo'), { recursive: true });
    writeFileSync(relfil, vigoJson(rel));
    writeFileSync(mfil, vigoJson(m));
  }
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/vigo-endringer.json'), `${JSON.stringify({ endret, forste, endringer, merknader: relmerknader }, null, 2)}\n`);
  console.log(
    `VIGO Kodeverksbase: ${Object.keys(rel.erstatninger).length} utgåtte fagkoder med erstatning, ${Object.keys(rel.laereplaner).length} læreplaner, ${Object.keys(rel.brukesSammen).length} koder i «brukes sammen», ${Object.keys(rel.byggerPaa).length} fag som bygger på andre, ${m.fagmerknader.length} fagmerknader, ${m.vitnemalsmerknader.length} vitnemålsmerknader, ${m.sokerstatuser.length} statuser på søkerønsker og ${Object.values(rel.grunnlag).flat().length} koblinger i grunnlaget for inntak. ${forste ? 'Første henting.' : `${endringer.length} endringer.`}`,
  );
}
