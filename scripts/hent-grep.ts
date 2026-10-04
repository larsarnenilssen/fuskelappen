// Henter data fra Grep (Udir, NLOD 2.0) til data/grep/. Kjøres hver uke av kildesjekken (avgjørelse 018).
//
// Fase 2 (avgjørelse 022): alle gjeldende fagkoder og læreplaner i videregående.
// - data/grep/fagindeks.json: liten indeks over fagkodene med navn, type, trinn, programområder, årstimetall og
//   vurderingsordning. Brukes av fagoppslaget, fagvalget i kalkulatorene og koblingen til årsramme.
// - data/grep/laereplaner/<kode>.json: én fil per læreplan med kompetansemål, underveisvurdering og
//   vurderingsordning, på målformen planen er fastsatt i. Lastes når brukeren åpner et fag.
//
// Fase 1: programområdene, fagnavnene og årstimetallet fagsøket i kalkulatorene bruker, lages fra fagindeksen når
// appen bygges (virtual:fagsok, avgjørelse 049). Før sto de i programomrader.json, fagkoder.json og arstimer.json.
//
// Validering og tilbakefall: Feiler en henting, eller er dataene for små eller i feil form, kastes en feil før
// noe skrives, og forrige snapshot blir stående. Filene skrives bare når innholdet er endret. Endringene lagres
// i .generert/grep-endringer.json, som kildesjekken tar med i rapporten.
// Bruk: npm run hent:grep
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fagindeksSkjema, laereplanSkjema, type Fagindeks, type Laereplan } from '../src/modules/fag/skjema.ts';
import { byggFagindeks, byggLaereplan, byggLaereplanverket, erPublisert, laereplankoder, paSpraak, type Grepelement, type Raadata } from './grep/bygg.ts';
import { byggFagsokdata, fagsokgrunnlag } from '../src/modules/arbeidstid/fagsokdata.ts';
import { lesRegelsett } from './innhold/alt.ts';
import { antallEndringer, grepsammendrag, sammenlignGrep, type Fagspor, type Grepdata, type Programomradespor } from './kilder/grep.ts';
import { USER_AGENT } from './kilder/metoder.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const GREP = 'https://data.udir.no/kl06/v201906';
const SAMTIDIGE = 8;

/** Henter JSON fra Grep, med tre forsøk. */
async function hentJson<T>(sti: string): Promise<T> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const svar = await fetch(`${GREP}/${sti}`, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(120_000) });
      if (!svar.ok) throw new Error(`${GREP}/${sti} svarte ${svar.status}`);
      return (await svar.json()) as T;
    } catch (e) {
      feil = e;
      await new Promise((r) => setTimeout(r, 2000 * forsok));
    }
  }
  throw feil;
}

const hent = (sti: string) => hentJson<Grepelement[]>(sti);

/** Henter detaljene for mange koder, noen om gangen. */
async function hentAlle(type: string, koder: readonly string[]): Promise<Map<string, Grepelement>> {
  const ut = new Map<string, Grepelement>();
  const start = Date.now();
  for (let i = 0; i < koder.length; i += SAMTIDIGE) {
    const bolk = koder.slice(i, i + SAMTIDIGE);
    const svar = await Promise.all(bolk.map((k) => hentJson<Grepelement>(`${type}/${k}`)));
    bolk.forEach((k, j) => ut.set(k, svar[j] as Grepelement));
    // Fremdrift i loggen, så en treg henting kan skilles fra en som står (kildesjekken 04.10.2026).
    if ((i / SAMTIDIGE) % 50 === 49) console.log(`Grep ${type}: ${ut.size} av ${koder.length} (${Math.round((Date.now() - start) / 1000)} s)`);
  }
  console.log(`Grep ${type}: ${ut.size} hentet på ${Math.round((Date.now() - start) / 1000)} s`);
  return ut;
}

const tittel = (e: Grepelement, spraak: 'nob' | 'nno') => paSpraak(e.tittel, spraak) ?? e.kode;

/** Programområder per utdanningsprogram og trinn: { BA: { "1": [["BAT", "Bygg- og anleggsteknikk"]] } }. */
export function grupperProgramomrader(liste: readonly Grepelement[]): Record<string, Record<string, [string, string][]>> {
  const ut: Record<string, Record<string, [string, string][]>> = {};
  for (const p of liste) {
    if (!erPublisert(p)) continue;
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
    if (!erPublisert(f) || !/^[A-Z]{3}[123]\d{3}$/.test(f.kode)) continue;
    const prefiks = f.kode.slice(0, 3);
    if (!prefikser.has(prefiks)) continue;
    (ut[prefiks] ??= []).push([f.kode, tittel(f, 'nob')]);
  }
  for (const l of Object.values(ut)) l.sort((a, b) => a[0].localeCompare(b[0]));
  return Object.fromEntries(Object.entries(ut).sort(([a], [b]) => a.localeCompare(b)));
}

/** Fagkodene i årstimetabellen og fellesfagprefiksene i søketabellen, fra regelsettene for SFS 2213 (alle perioder). */
const grunnlag = () => fagsokgrunnlag(lesRegelsett(rot));

const fingeravtrykk = (tekst: string) => createHash('sha256').update(tekst).digest('hex').slice(0, 16);

/** Det som sammenlignes per fag mellom to hentinger. */
export function fagspor(indeks: Fagindeks): Record<string, Fagspor> {
  return Object.fromEntries(
    Object.entries(indeks.fag).map(([k, f]) => {
      const v = f.elev;
      const vurdering = v ? [v.standpunkt ? 'standpunkt' : 'ikke standpunkt', v.trekk ?? '-', v.eksamensordning ?? '-', v.eksamensform ?? '-', v.uttrykk ?? '-'].join(', ') : 'ingen';
      return [k, { navn: f.navn.nb, timer: f.timer, vurdering, trinn: f.trinn.join(', ') }];
    }),
  );
}

/** Det som sammenlignes per programområde mellom to hentinger (tilbudsstrukturen). */
export function tilbudspor(indeks: Fagindeks): Record<string, Programomradespor> {
  return Object.fromEntries(
    Object.entries(indeks.programomrader).map(([k, p]) => [k, { navn: p.navn.nb, trinn: p.trinn, sted: p.sted, bygger: p.bygger.join(', '), timer: p.timer }]),
  );
}

/** Innholdet i en læreplanfil. Samme tekst gir samme fil, så endringer vises i git. */
export const laereplanJson = (lp: Laereplan) => `${JSON.stringify(lp, null, 1)}\n`;

/** Fagindeksen med ett fag per linje, så endringer er lette å lese i git. */
export function fagindeksJson(indeks: Fagindeks): string {
  const { fag, ...hode } = indeks;
  const linjer = Object.entries(fag).map(([k, f]) => `    ${JSON.stringify(k)}: ${JSON.stringify(f)}`);
  const topp = Object.entries(hode).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  return `{\n${topp.join(',\n')},\n  "fag": {\n${linjer.join(',\n')}\n  }\n}\n`;
}

/** Leser dataene fra forrige henting (fagindeksen og læreplanene), eller null hvis fagindeksen mangler. */
function lesForrige(): Grepdata | null {
  const indeksfil = join(rot, 'data/grep/fagindeks.json');
  if (!existsSync(indeksfil)) return null;
  const forrige = JSON.parse(readFileSync(indeksfil, 'utf8')) as Fagindeks;
  const data: Grepdata = { ...byggFagsokdata(forrige, grunnlag()), fag: fagspor(forrige) };
  // Programområdene fikk «bygger på» og timer i oktober 2026. Eldre data sammenlignes ikke for tilbudsstrukturen.
  if (Object.values(forrige.programomrader).every((p) => Array.isArray(p.bygger))) data.tilbud = tilbudspor(forrige);
  const mappe = join(rot, 'data/grep/laereplaner');
  if (existsSync(mappe)) {
    data.laereplaner = Object.fromEntries(
      readdirSync(mappe)
        .filter((f) => f.endsWith('.json'))
        .map((f) => [f.slice(0, -5), fingeravtrykk(readFileSync(join(mappe, f), 'utf8'))]),
    );
  }
  return data;
}

/**
 * Sjekker at dataene er store nok og har riktig form. Kaster en feil (og beholder forrige snapshot) hvis ikke.
 * Grensene er satt godt under det Grep har i dag (september 2026: 1978 fag, 402 publiserte læreplaner).
 */
export function validerFagdata(indeks: Fagindeks, planer: ReadonlyMap<string, Laereplan>): void {
  fagindeksSkjema.parse(indeks);
  const fag = Object.values(indeks.fag);
  if (fag.length < 1500) throw new Error(`Fikk bare ${fag.length} fagkoder i videregående fra Grep.`);
  if (Object.keys(indeks.programomrader).length < 200) throw new Error(`Fikk bare ${Object.keys(indeks.programomrader).length} programområder fra Grep.`);
  if (planer.size < 300) throw new Error(`Fikk bare ${planer.size} læreplaner fra Grep.`);
  for (const [kode, plan] of planer) {
    laereplanSkjema.parse(plan);
    if (plan.kode !== kode) throw new Error(`Læreplanen ${kode} har koden ${plan.kode}.`);
  }
  const utenMal = [...planer.values()].filter((p) => p.kompetansemaalsett.every((s) => s.maal.length === 0));
  if (utenMal.length > planer.size * 0.1) throw new Error(`${utenMal.length} læreplaner mangler kompetansemål.`);
  const mangler = fag.filter((f) => f.lp !== null && !planer.has(f.lp));
  if (mangler.length > 0) throw new Error(`Læreplanen mangler for ${mangler.length} fag, f.eks. ${mangler[0]?.lp}.`);
  const utenTimer = fag.filter((f) => f.timer !== null).length;
  if (utenTimer < 700) throw new Error(`Bare ${utenTimer} fag har årstimetall.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const start = Date.now();
  const [utdanningsprogram, programliste, fagliste, oppliste, planliste, ferdighetsliste, temaliste] = await Promise.all([
    hent('utdanningsprogram'),
    hent('programomraader'),
    hent('fagkoder'),
    hent('opplaeringsfag'),
    hent('laereplaner-lk20'),
    hent('grunnleggende-ferdigheter-lk20'),
    hent('tverrfaglige-temaer-lk20'),
  ]);
  // Grunnleggende ferdigheter og tverrfaglige temaer (pakke 6, avgjørelse 037).
  const laereplanverket = byggLaereplanverket(ferdighetsliste, temaliste);
  if (laereplanverket.ferdigheter.length < 5 || laereplanverket.temaer.length < 3) {
    throw new Error(`Fikk ${laereplanverket.ferdigheter.length} grunnleggende ferdigheter og ${laereplanverket.temaer.length} tverrfaglige temaer fra Grep. Beholder forrige fil.`);
  }

  // Fase 1-dataene (fagsøket i kalkulatorene).
  const programomrader = grupperProgramomrader(programliste);
  const antall = Object.values(programomrader).reduce((s, p) => s + Object.values(p).reduce((t, l) => t + l.length, 0), 0);
  if (antall < 100) throw new Error(`Fikk bare ${antall} programområder fra Grep. Beholder forrige fil.`);
  const prefikser = new Set([...Object.values(programomrader).flatMap((p) => Object.values(p).flatMap((l) => l.map(([k]) => k))), ...grunnlag().fellesfagprefikser]);
  const fagkoder = grupperFagkoder(fagliste, prefikser);
  const antallFag = Object.values(fagkoder).reduce((s, l) => s + l.length, 0);
  if (antallFag < 300) throw new Error(`Fikk bare ${antallFag} fagkoder fra Grep. Beholder forrige fil.`);

  // Detaljer: programområder, opplæringsfag, fagkoder, læreplaner og kompetansemålsett.
  const publisert = (l: readonly Grepelement[]) => l.filter(erPublisert).map((e) => e.kode);
  const programdetaljer = await hentAlle('programomraader', publisert(programliste));
  const oppdetaljer = await hentAlle('opplaeringsfag', publisert(oppliste));
  const vgs = [...oppdetaljer.values()].filter((o) => (o.opplaeringsnivaa as { kode?: string } | null)?.kode === 'opplaeringsnivaa_videregaaende');
  const referanser = (o: Grepelement, felt: string) => ((o[felt] ?? []) as { kode: string; status: string }[]).filter(erPublisert).map((r) => r.kode);
  const planerIBruk = [...new Set(vgs.flatMap((o) => ((o['laereplan-referanse'] ?? []) as { kode: string; 'url-data'?: string }[]).filter((l) => l['url-data']?.includes('/laereplaner-lk20/')).map((l) => l.kode)))];
  const kjentePlaner = new Set(planliste.map((p) => p.kode));
  const fagkodeliste = [...new Set([...vgs.flatMap((o) => referanser(o, 'fagkode-referanser')), ...grunnlag().arstimeKoder, ...Object.values(fagkoder).flatMap((l) => l.map(([k]) => k))])].sort();
  const fagdetaljer = await hentAlle('fagkoder', fagkodeliste);
  const planer = await hentAlle('laereplaner-lk20', planerIBruk.filter((k) => kjentePlaner.has(k)).sort());

  const raa: Raadata = {
    utdanningsprogram,
    programomrader: [...programdetaljer.values()],
    opplaeringsfag: [...oppdetaljer.values()],
    fagkoder: fagdetaljer,
    laereplaner: planer,
    kompetansemaalsett: new Map(),
  };
  const hentet = new Date().toISOString();
  const indeks = byggFagindeks(raa, hentet);
  raa.kompetansemaalsett = await hentAlle('kompetansemaalsett-lk20', laereplankoder(indeks).kompetansemaalsett);
  const laereplaner = new Map(laereplankoder(indeks).laereplaner.map((k) => [k, byggLaereplan(planer.get(k) as Grepelement, raa.kompetansemaalsett)]));
  validerFagdata(indeks, laereplaner);

  // Fagsøket i kalkulatorene bygges fra fagindeksen (virtual:fagsok). Årstimene sjekkes her, så en henting uten
  // tall ikke tas inn. Eksamenskoder og fag i læretiden har ikke årstimer i Grep, så omtrent halvparten mangler tall.
  const fagsok = byggFagsokdata(indeks, grunnlag());
  const medTall = Object.values(fagsok.arstimer).filter((v) => v !== null).length;
  if (medTall < 300) throw new Error(`Fikk årstimer for bare ${medTall} av ${Object.keys(fagsok.arstimer).length} fagkoder. Beholder forrige fil.`);

  const planfiler = new Map([...laereplaner].map(([k, p]) => [k, laereplanJson(p)]));
  const ny: Grepdata = { ...fagsok, fag: fagspor(indeks), tilbud: tilbudspor(indeks), laereplaner: Object.fromEntries([...planfiler].map(([k, t]) => [k, fingeravtrykk(t)])) };
  const forrige = lesForrige();
  const endringer = forrige ? sammenlignGrep(forrige, ny) : null;
  // Også endringer som ikke står i rapporten (f.eks. navn på programområder), gir nye filer.
  const indeksfil = join(rot, 'data/grep/fagindeks.json');
  const utenTid = (i: Fagindeks) => fagindeksJson({ ...i, hentet: '' });
  const indeksEndret = !existsSync(indeksfil) || utenTid(JSON.parse(readFileSync(indeksfil, 'utf8')) as Fagindeks) !== utenTid(indeks);
  const endret = endringer === null || antallEndringer(endringer) > 0 || indeksEndret;
  if (endret) {
    mkdirSync(join(rot, 'data/grep'), { recursive: true });
    if (indeksEndret) writeFileSync(indeksfil, fagindeksJson(indeks));
    // Læreplanene skrives til en ny mappe som så erstatter den gamle, så fjernede planer forsvinner.
    const ny2 = join(rot, 'data/grep/laereplaner.ny');
    rmSync(ny2, { recursive: true, force: true });
    mkdirSync(ny2);
    for (const [k, tekst] of planfiler) writeFileSync(join(ny2, `${k}.json`), tekst);
    rmSync(join(rot, 'data/grep/laereplaner'), { recursive: true, force: true });
    renameSync(ny2, join(rot, 'data/grep/laereplaner'));
  }
  // Ferdighetene og temaene skrives når de er endret, uavhengig av resten.
  const lvFil = join(rot, 'data/grep/laereplanverket.json');
  const lvTekst = `${JSON.stringify({ kilde: 'udir-grep', lisens: 'NLOD 2.0', ...laereplanverket }, null, 1)}\n`;
  if (!existsSync(lvFil) || readFileSync(lvFil, 'utf8') !== lvTekst) writeFileSync(lvFil, lvTekst);
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/grep-endringer.json'), `${JSON.stringify({ endret, endringer }, null, 2)}\n`);
  const sek = Math.round((Date.now() - start) / 1000);
  console.log(
    `Grep: ${antall} programområder, ${antallFag} fagkoder i fagsøket, ${Object.keys(indeks.fag).length} fag i fagindeksen, ${laereplaner.size} læreplaner (${sek} s). ${endringer ? grepsammendrag(endringer) : 'Første henting.'}`,
  );
}
