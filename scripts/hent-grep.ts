// Henter data fra Grep (Udir, NLOD 2.0). Fase 1: programområdene og fagnavnene, som fagsøket i
// arbeidstidskalkulatorene bruker for å kjenne igjen koder som BAT (Bygg- og anleggsteknikk Vg1),
// HEA (helsearbeiderfag Vg2) og fagnavn som «Helsefremmende arbeid» (HEA2005).
// Programområdekoden er utdanningsprogram (2 bokstaver) + fagkodeprefiks (3 bokstaver) + trinn, f.eks. BABAT1----.
// Årstimetallet (omfang-totalt) for fagkodene i rules/sfs2213/arstimer-*.yaml og for alle fagkodene fagsøket kjenner,
// hentes til data/grep/arstimer.json. En test ser om Grep har endret tallene i tabellen, og kalkulatorene fyller inn
// årstimer for en fagkode brukeren har søkt fram (f.eks. HEA2005). Resten av Grep-hentingen (læreplaner) kommer i fase 2.
// Filene skrives bare når innholdet er endret. Endringene lagres i .generert/grep-endringer.json, som
// kildesjekken tar med i rapporten (avgjørelse 018).
// Bruk: npm run hent:grep
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Regelsett } from '../src/core/regler/skjema.ts';
import { lesFil } from './innhold/last.ts';
import { antallEndringer, grepsammendrag, sammenlignGrep, type Grepdata } from './kilder/grep.ts';
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

/**
 * Fagkoder i videregående (tre bokstaver + fire sifre, første siffer 1–3) med norsk navn, gruppert på prefiks.
 * Bare prefiksene fagsøket bruker, tas med: programområdene og fellesfagene i søketabellen.
 */
export function grupperFagkoder(liste: readonly Grepelement[], prefikser: ReadonlySet<string>): Record<string, [string, string][]> {
  const ut: Record<string, [string, string][]> = {};
  for (const f of liste) {
    if (!f.status.endsWith('status_publisert') || !/^[A-Z]{3}[123]\d{3}$/.test(f.kode)) continue;
    const prefiks = f.kode.slice(0, 3);
    if (!prefikser.has(prefiks)) continue;
    (ut[prefiks] ??= []).push([f.kode, tittel(f, 'nob')]);
  }
  for (const l of Object.values(ut)) l.sort((a, b) => a[0].localeCompare(b[0]));
  return Object.fromEntries(Object.entries(ut).sort(([a], [b]) => a.localeCompare(b)));
}

/** Fagkodene i årstimetabellen (rules/sfs2213/arstimer-*.yaml). */
function arstimeFagkoder(): string[] {
  const r = lesFil(rot, join(rot, 'rules/sfs2213/arstimer-2026-2027.yaml')) as Regelsett;
  const rader = (r.verdier.arstimer?.verdi ?? []) as { fagkoder?: string[] }[];
  return [...new Set(rader.flatMap((rad) => rad.fagkoder ?? []))].sort();
}

/** Omfanget (årstimer) for én fagkode, eller null hvis Grep ikke oppgir det. */
async function omfang(kode: string): Promise<number | null> {
  const svar = await fetch(`${GREP}/fagkoder/${kode}`, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
  if (!svar.ok) throw new Error(`${GREP}/fagkoder/${kode} svarte ${svar.status}`);
  const data = (await svar.json()) as { 'omfang-totalt'?: string | null };
  const tall = Number(data['omfang-totalt']);
  return Number.isFinite(tall) && tall > 0 ? tall : null;
}

/** Fellesfagprefiksene i søketabellen (rules/sfs2213/fagsok-*.yaml) som bare ett fag bruker. */
function fellesfagprefikser(): string[] {
  const fil = join(rot, 'rules/sfs2213/fagsok-2026-2027.yaml');
  const r = lesFil(rot, fil) as Regelsett;
  const rader = (r.verdier.fagnavn?.verdi ?? []) as { prefikser?: string[] }[];
  const antall = new Map<string, number>();
  for (const rad of rader) for (const p of rad.prefikser ?? []) antall.set(p, (antall.get(p) ?? 0) + 1);
  return [...antall].filter(([, n]) => n === 1).map(([p]) => p);
}

/** Leser dataene fra forrige henting, eller null hvis en fil mangler. */
function lesForrige(): Grepdata | null {
  const les = <T>(navn: string, felt: string): T | null => {
    const fil = join(rot, 'data/grep', navn);
    return existsSync(fil) ? ((JSON.parse(readFileSync(fil, 'utf8')) as Record<string, unknown>)[felt] as T) : null;
  };
  const programomrader = les<Grepdata['programomrader']>('programomrader.json', 'programomrader');
  const fagkoder = les<Grepdata['fagkoder']>('fagkoder.json', 'fagkoder');
  const arstimer = les<Grepdata['arstimer']>('arstimer.json', 'arstimer');
  return programomrader && fagkoder && arstimer ? { programomrader, fagkoder, arstimer } : null;
}

function skriv(navn: string, felt: string, data: Record<string, unknown>, hode: string): void {
  const linjer = Object.entries(data).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  writeFileSync(join(rot, 'data/grep', navn), `{\n  ${hode},\n  ${JSON.stringify(felt)}: {\n${linjer.join(',\n')}\n  }\n}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const programomrader = grupperProgramomrader(await hent('programomraader'));
  const antall = Object.values(programomrader).reduce((s, p) => s + Object.values(p).reduce((t, l) => t + l.length, 0), 0);
  if (antall < 100) throw new Error(`Fikk bare ${antall} programområder fra Grep. Beholder forrige fil.`);

  const prefikser = new Set([...Object.values(programomrader).flatMap((p) => Object.values(p).flatMap((l) => l.map(([k]) => k))), ...fellesfagprefikser()]);
  const fagkoder = grupperFagkoder(await hent('fagkoder'), prefikser);
  const antallFag = Object.values(fagkoder).reduce((s, l) => s + l.length, 0);
  if (antallFag < 300) throw new Error(`Fikk bare ${antallFag} fagkoder fra Grep. Beholder forrige fil.`);

  // Årstimer for fagkodene i årstimetabellen og for alle fagkodene fagsøket kjenner (programfag på yrkesfag o.l.).
  const koder = [...new Set([...arstimeFagkoder(), ...Object.values(fagkoder).flatMap((l) => l.map(([k]) => k))])].sort();
  const arstimer: Record<string, number | null> = {};
  for (let i = 0; i < koder.length; i += 8) {
    const bolk = koder.slice(i, i + 8);
    const svar = await Promise.all(bolk.map((k) => omfang(k)));
    bolk.forEach((k, j) => (arstimer[k] = svar[j] ?? null));
  }
  const medTall = Object.values(arstimer).filter((v) => v !== null).length;
  // Eksamenskoder og fag i læretiden har ikke årstimer i Grep, så omtrent halvparten mangler tall.
  if (medTall < 300) throw new Error(`Fikk årstimer for bare ${medTall} av ${koder.length} fagkoder. Beholder forrige fil.`);

  const ny: Grepdata = { programomrader, fagkoder, arstimer };
  const forrige = lesForrige();
  const endringer = forrige ? sammenlignGrep(forrige, ny) : null;
  const endret = endringer === null || antallEndringer(endringer) > 0;
  if (endret) {
    mkdirSync(join(rot, 'data/grep'), { recursive: true });
    const hode = `"kilde": "udir-grep", "hentet": ${JSON.stringify(new Date().toISOString())}, "lisens": "NLOD 2.0"`;
    skriv('programomrader.json', 'programomrader', programomrader, hode);
    skriv('fagkoder.json', 'fagkoder', fagkoder, hode);
    skriv('arstimer.json', 'arstimer', arstimer, hode);
  }
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/grep-endringer.json'), `${JSON.stringify({ endret, endringer }, null, 2)}\n`);
  console.log(`Grep: ${antall} programområder, ${antallFag} fagkoder, ${koder.length} fagkoder med årstimer. ${endringer ? grepsammendrag(endringer) : 'Første henting.'}`);
}
