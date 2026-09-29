// Henter data fra Grep (Udir, NLOD 2.0). Fase 1: programområdene, som fagsøket i arbeidstidskalkulatorene bruker
// for å kjenne igjen koder som BAT (Bygg- og anleggsteknikk Vg1) og HEA (helsearbeiderfag Vg2).
// Programområdekoden er utdanningsprogram (2 bokstaver) + fagkodeprefiks (3 bokstaver) + trinn, f.eks. BABAT1----.
// Resten av Grep-hentingen (fag, læreplaner, årstimer) kommer i fase 2.
// Bruk: npm run hent:grep
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { USER_AGENT } from './kilder/metoder.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const GREP = 'https://data.udir.no/kl06/v201906';

interface Grepelement {
  kode: string;
  status: string;
  tittel: { spraak: string; verdi: string }[];
}

async function hent(sti: string): Promise<Grepelement[]> {
  const svar = await fetch(`${GREP}/${sti}`, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(120_000) });
  if (!svar.ok) throw new Error(`${GREP}/${sti} svarte ${svar.status}`);
  return (await svar.json()) as Grepelement[];
}

const tittel = (e: Grepelement, spraak: 'nob' | 'nno') =>
  (e.tittel.find((t) => t.spraak === spraak) ?? e.tittel.find((t) => t.spraak === 'default') ?? e.tittel[0])?.verdi.trim() ?? e.kode;

/** Programområder per utdanningsprogram og trinn: { BA: { "1": [["BAT", "Bygg- og anleggsteknikk"]] } }. */
export function grupperProgramomrader(liste: readonly Grepelement[]): Record<string, Record<string, [string, string][]>> {
  const ut: Record<string, Record<string, [string, string][]>> = {};
  for (const p of liste) {
    if (!p.status.endsWith('status_publisert')) continue;
    const m = /^([A-Z]{2})([A-Z]{3})(\d)/.exec(p.kode);
    if (!m) continue;
    const [, program, prefiks, trinn] = m as unknown as [string, string, string, string];
    const navn = tittel(p, 'nob');
    const trinnliste = ((ut[program] ??= {})[trinn] ??= []);
    if (!trinnliste.some(([k, n]) => k === prefiks && n === navn)) trinnliste.push([prefiks, navn]);
  }
  for (const program of Object.values(ut)) for (const liste2 of Object.values(program)) liste2.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1], 'nb'));
  return Object.fromEntries(Object.entries(ut).sort(([a], [b]) => a.localeCompare(b)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const programomrader = grupperProgramomrader(await hent('programomraader'));
  const antall = Object.values(programomrader).reduce((s, p) => s + Object.values(p).reduce((t, l) => t + l.length, 0), 0);
  if (antall < 100) throw new Error(`Fikk bare ${antall} programområder fra Grep. Beholder forrige fil.`);
  mkdirSync(join(rot, 'data/grep'), { recursive: true });
  const fil = join(rot, 'data/grep/programomrader.json');
  const hode = `"kilde": "udir-grep", "hentet": ${JSON.stringify(new Date().toISOString())}, "lisens": "NLOD 2.0"`;
  const linjer = Object.entries(programomrader).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  writeFileSync(fil, `{\n  ${hode},\n  "programomrader": {\n${linjer.join(',\n')}\n  }\n}\n`);
  console.log(`Skrev ${fil} (${antall} programområder).`);
}
