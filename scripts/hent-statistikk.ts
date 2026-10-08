// Henter nøkkeltall for videregående opplæring fra Udirs statistikkbank (NLOD, eier 07.10.2026, avgjørelse 080) til
// data/statistikk/statistikk.json. Kjøres hver uke av kildesjekken.
//
// - Kilden er rapport-API-et bak statistikkbanken på udir.no (statistikkportalen.udir.no/api/rapportering). Udir
//   skriver at det ikke er ment for ekstern bruk ennå og kan endres uten varsel. Eier har bestemt at appen bruker det.
//   Adressen til hver tabell slås opp fra rapportsiden hver gang, så en ny versjon av tabellen følges av seg selv.
//   Ser svaret feil ut, kastes en feil før noe skrives, og forrige fil blir stående.
// - Periodene er de siste i hver tabell (fra filterVerdier): søkere og elever tre år, formidlingen tre desembere og
//   høsten i år, lærekontrakter to år, fravær og eksamen det siste skoleåret, gjennomføring de to siste kullene.
// - Gjennomføringen i skole står på fylkene fra før 2020 for kullene til og med 2019. Tellerne og nevnerne summeres
//   til dagens fylker (scripts/statistikk/udir.ts).
// Bruk: npm run hent:statistikk
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Statistikk, statistikkSkjema, type Verdi } from '../src/core/statistikk/skjema.ts';
import { USER_AGENT } from './kilder/metoder.ts';
import { hentJson, lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import { enhetsrader, kolonne, lesCsv, regnOmTilNyeFylker, type Tabell, verdierPerEnhet } from './statistikk/udir.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const RAPPORT_API = 'https://statistikkportalen.udir.no/api/rapportering/';

interface Filterverdi {
  id: number;
  navn: string;
}
type Filter = Record<string, readonly (number | string)[]>;

interface Rapport {
  ende: string;
  radSti: string;
  verdier: Record<string, Filterverdi[]>;
  /** Filterverdiene statistikkbanken viser fra start, f.eks. det kullet Udir viser først. */
  standard: Record<string, number[]>;
}

/** Adressen til dataene for en rapportside, standardstien for radene og filterverdiene. */
async function rapport(kode: string): Promise<Rapport> {
  const r = (await hentJson(`${RAPPORT_API}rest/v1/Rapportside/${kode}`)) as {
    rappside?: { rapportElementer?: { dataEndepunkt?: string; defaultRadsti?: string }[]; filterDefaultVerdier?: Record<string, number[]> };
  };
  const el = r.rappside?.rapportElementer?.[0];
  if (!el?.dataEndepunkt) throw new Error(`Fant ikke tabellen for rapportsiden ${kode} i statistikkbanken.`);
  const verdier = (await hentJson(`${RAPPORT_API}${el.dataEndepunkt.replace(/\/data$/, '/filterVerdier')}`)) as Record<string, Filterverdi[]>;
  if (!Array.isArray(verdier.TidID) && !Array.isArray(verdier.Aarskull_KalenderAarID)) throw new Error(`Rapportsiden ${kode} mangler periodene.`);
  return { ende: el.dataEndepunkt, radSti: el.defaultRadsti ?? '*', verdier, standard: r.rappside?.filterDefaultVerdier ?? {} };
}

/** De siste periodene i tabellen (TidID), eldste først. `velg` kan filtrere, f.eks. bort foreløpige tall. */
function siste(r: Rapport, antall: number, velg: (v: Filterverdi) => boolean = () => true): Filterverdi[] {
  return [...(r.verdier.TidID ?? [])]
    .filter(velg)
    .sort((a, b) => b.id - a.id)
    .slice(0, antall)
    .reverse();
}

/** Tabellen for filteret, som CSV (UTF-16). Flere verdier i ett filter skilles med «_». */
async function tabell(r: Rapport, filter: Filter, radSti = r.radSti): Promise<Tabell> {
  const f = Object.entries(filter)
    .map(([k, v]) => `${k}(${v.join('_')})`)
    .join('_');
  const url = `${RAPPORT_API}${r.ende}.csv?radSti=${encodeURIComponent(radSti)}&filter=${encodeURIComponent(f)}`;
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(90_000) });
      if (!svar.ok) throw new Error(`${url} svarte ${svar.status}`);
      const t = lesCsv(new TextDecoder('utf-16').decode(new Uint8Array(await svar.arrayBuffer())));
      if (process.env.STATISTIKK_DEBUG) console.log(r.ende, '\n  ', t.kolonner.join('\n   '), '\n  ', t.rader[0]?.join(' | '));
      return t;
    } catch (e) {
      feil = e;
      await new Promise((v) => setTimeout(v, 2000 * forsok));
    }
  }
  throw feil;
}

const aarstall = (v: Filterverdi) => Number(String(v.id).slice(0, 4));

/** Bare landet og fylkene, ikke skolene. */
const utenSkoler = (r: Record<string, Verdi[]>) => Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith('S')));

async function hent(): Promise<Statistikk> {
  const enheter: Statistikk['enheter'] = {};
  const navngi = (rader: ReturnType<typeof enhetsrader>) => {
    for (const r of rader) if (r.enhet !== 'L' && !enheter[r.enhet]) enheter[r.enhet] = r.fylke && r.enhet.startsWith('S') ? { navn: r.navn, fylke: r.fylke } : { navn: r.navn };
  };

  // Søkere: alle, skole og læreplass, tre år, og per utdanningsprogram de to siste årene.
  const sok = await rapport('VGO_Soeker_FylkUtdprogAar');
  const sokAar = siste(sok, 3);
  const felles = { KjoennID: [-10], FylkeID: [-12] };
  const sokT = await tabell(sok, { ...felles, TidID: sokAar.map((t) => t.id), TrinnID: [-10, -11, -12], ProgramomraadeID: [-10] });
  const sokR = enhetsrader(sokT);
  navngi(sokR);
  const sokKol = (trinn: string) => sokAar.map((t) => kolonne(sokT, t.navn, trinn, 'Antall søkere'));
  // Utdanningsprogrammene er de negative id-ene under «Studieforberedende» (-12) og «Yrkesfaglig» (-13) i listen fra
  // Udir. Programmer fra før Fagfornyelsen («gammel») og programmer uten søkere i år tas ikke med.
  const programmer: (Filterverdi & { yrkesfag: boolean })[] = [];
  let gruppe: 'sf' | 'yf' | null = null;
  for (const p of sok.verdier.ProgramomraadeID ?? []) {
    if (p.id === -12) gruppe = 'sf';
    else if (p.id === -13) gruppe = 'yf';
    else if (p.id < 0 && p.id !== -10 && gruppe && !/gammel/i.test(p.navn)) programmer.push({ ...p, yrkesfag: gruppe === 'yf' });
  }
  const progAar = sokAar.slice(-2);
  const progT = await tabell(sok, { ...felles, TidID: progAar.map((t) => t.id), TrinnID: [-10], ProgramomraadeID: programmer.map((p) => p.id) });
  const progR = enhetsrader(progT);
  const progVerdier: Record<string, Record<string, Verdi[]>> = {};
  const brukte = programmer.filter((p) => kolonne(progT, progAar[0]?.navn ?? '', p.navn, 'Antall søkere') >= 0);
  for (const r of progR) {
    progVerdier[r.enhet] = Object.fromEntries(brukte.map((p) => [String(p.id), verdierPerEnhet([r], progAar.map((t) => kolonne(progT, t.navn, p.navn, 'Antall søkere')))[r.enhet] ?? []]));
  }

  // Elever og skoler, tre skoleår, landet, fylkene og skolene.
  const el = await rapport('VGO_Elev_FylkSkol');
  const elAar = siste(el, 3);
  const elT = await tabell(el, { ProgramomraadeID: [-10], VisAntallSkoler: [1], EnhetID: [-12], TidID: elAar.map((t) => t.id), TrinnID: [-10], EierformID: [-10], KjoennID: [-10] }, '*.*.*');
  const elR = enhetsrader(elT);
  navngi(elR);

  // Formidling: desember de tre siste årene, og august, oktober og desember det siste året.
  const fo = await rapport('FOY_SL_Fylker');
  const desember = siste(fo, 3, (t) => String(t.id).endsWith('12'));
  const sisteAar = Math.max(...(fo.verdier.TidID ?? []).map(aarstall));
  const hosten = (fo.verdier.TidID ?? []).filter((t) => aarstall(t) === sisteAar).sort((a, b) => a.id - b.id);
  const foFilter = { KontraktsTypeID: [1], UngdomsrettID: [-10], VisAntallSoekere: [0], VisAntallKontrakter: [0], Avgiver_FylkeID: [-12], KjoennID: [-10], SektorTypeGruppeID: [-10], ProgramomraadeID: [-10] };
  const foT = await tabell(fo, { ...foFilter, TidID: [...new Set([...desember, ...hosten].map((t) => t.id))].sort() });
  const foR = enhetsrader(foT);
  const foKol = (t: Filterverdi) => {
    const mnd = t.navn;
    const aar = String(aarstall(t));
    return kolonne(foT, aar, mnd, 'Andel kontrakter');
  };
  // I filterverdiene heter periodene bare «Desember» osv., og året står i kolonnenavnet.
  const desemberAar = desember.map(aarstall);

  // Løpende lærekontrakter, to år.
  const lk = await rapport('FOY_LK_FylkUtdprogAar');
  const lkAar = siste(lk, 2);
  const lkT = await tabell(lk, { VelgMaaltall: [0], KontraktsTypeID: [1], RettstypeID: [-10], Avgiver_FylkeID: [-12], TidID: lkAar.map((t) => t.id), AldersgruppeID: [-10], KjoennID: [-10], SektorTypeGruppeID: [-10], ProgramomraadeID: [-10] });
  // Tabellen har også en rad per opplæringskontor (med organisasjonsnummer). Bare fylkene og landet tas med.
  const lkR = enhetsrader(lkT).filter((r) => !r.enhet.startsWith('S'));
  const lkKol = lkAar.map((t) => kolonne(lkT, String(aarstall(t)), 'Løpende kontrakter'));

  // Fravær, median dager, det siste skoleåret, landet, fylkene og skolene.
  const fr = await rapport('VGO_fravaer');
  const frAar = siste(fr, 1)[0];
  if (!frAar) throw new Error('Fraværstabellen har ingen skoleår.');
  const frT = await tabell(fr, { TrinnID: [-10], VisAntallPersoner: [0], VisMaaltall: [0], EnhetID: [-12], TidID: [frAar.id], EierformID: [-10], KjoennID: [-10], ProgramomraadeID: [-10], FravaertypeID: [1, 2] }, '*.*.*');
  const frR = enhetsrader(frT);
  const frTotal = frT.kolonner.findIndex((k) => /Totalt fravær/i.test(k) && /Median dager/.test(k));
  const frVitnemal = frT.kolonner.findIndex((k) => /Vitnemålsfravær/i.test(k) && /Median dager/.test(k));

  // Gjennomføring i skole, de to siste kullene, regnet om til dagens fylker.
  const gj = await rapport('VGO_Gjennomfoering_Fylk');
  const gjKull = siste(gj, 2);
  const gjT = await tabell(gj, { VisTeller: [1], VisNevner: [1], EnhetID: [-12], TidID: gjKull.map((t) => t.id), ProgramomraadeID: [-10], KjoennID: [-10], IndikatorID: [-174] }, '*.*');
  const gjR = enhetsrader(gjT);
  const gjVerdier: Record<string, Verdi[]> = {};
  gjKull.forEach((t, i) => {
    const pst = kolonne(gjT, t.navn, 'Prosent');
    const tel = kolonne(gjT, t.navn, 'Teller');
    const nev = kolonne(gjT, t.navn, 'Nevner');
    const gamle: Record<string, { teller: Verdi; nevner: Verdi }> = {};
    for (const r of gjR) {
      if (r.enhet === 'L') ((gjVerdier.L ??= [])[i] = verdierPerEnhet([r], [pst]).L?.[0] ?? null);
      else if (r.fylke) gamle[r.fylke] = { teller: verdierPerEnhet([r], [tel])[r.enhet]?.[0] ?? null, nevner: verdierPerEnhet([r], [nev])[r.enhet]?.[0] ?? null };
    }
    for (const [f, v] of Object.entries(regnOmTilNyeFylker(gamle))) (gjVerdier[f] ??= [])[i] = v;
  });

  // Fag- og svennebrev fem år etter start i lære, for kullet statistikkbanken viser først (det siste med fem år).
  const fb = await rapport('FOY_Gjennomfoering_Fylk');
  const fbKull = fb.standard.Aarskull_KalenderAarID?.[0];
  if (!fbKull) throw new Error('Tabellen for gjennomføring i lære har ikke noe kull.');
  const fylkeIder = (fb.verdier.FylkeID ?? []).filter((f) => !/\(/.test(f.navn)).map((f) => f.id);
  const fbT = await tabell(fb, { ProgramomraadeID: [-10], VisAntallGjennomfoeringsstatus: [0], VisAntallPersoner: [0], Aarskull_KalenderAarID: [fbKull], AarEtterID: [4], KontraktsTypeID: [1], UngdomsrettID: [-10], FylkeID: fylkeIder }, '*.*');
  // En rad per status og fylke. Bare «Oppnådd fag-/svennebrev» (FS) tas med.
  const fbR = enhetsrader({ ...fbT, rader: fbT.rader.filter((r) => r[0] === 'FS') });
  const fbKol = fbT.kolonner.findIndex((k) => /Andel personer/.test(k));

  // Skriftlig eksamen i de største fellesfagene, det siste skoleåret med tall: norsk, engelsk og matematikk. Tabellen
  // har en rad per vurderingsfag (fagkode) og enhet.
  const ek = await rapport('VGO_VGOkarakterer');
  const ekAar = siste(ek, 1)[0];
  if (!ekAar) throw new Error('Karaktertabellen har ingen skoleår.');
  // Fagkodene til eksamenene (vurderingsfagene). Tabellen gir alle fagene uansett filter, så radene velges på koden.
  const FAG = ['NOR1267', 'NOR1262', 'ENG1007', 'ENG1009', 'MAT1019', 'MAT1021', 'MAT1023'];
  const ekT = await tabell(ek, { FagID: [-12], UtdanningsprogramvariantID: [-10], VisAntallPersoner: [1], VisKarakterfordeling: [0], TidID: [ekAar.id], KaraktertypeID: [3], EierformID: [-10], KjoennID: [-10], EnhetID: [-12] }, '*.*.*');
  const fagKol = ekT.kolonner.indexOf('Vurderingsfagkode');
  const fagNavnKol = ekT.kolonner.indexOf('Vurderingsfagnavn');
  const snittKol = kolonne(ekT, ekAar.navn, 'Snittkarakter');
  const antallKol = kolonne(ekT, ekAar.navn, 'Antall elever');
  if (fagKol < 0 || snittKol < 0) throw new Error('Karaktertabellen mangler fagkoden eller snittkarakteren.');
  const ekFag: { id: string; navn: string }[] = [];
  const ekSnitt: Record<string, Record<string, Verdi>> = {};
  const ekAntall: Record<string, Record<string, Verdi>> = {};
  for (const kode of FAG) {
    const rader = enhetsrader({ ...ekT, rader: ekT.rader.filter((r) => r[fagKol] === kode) }).filter((r) => !r.enhet.startsWith('S'));
    if (rader.length === 0) continue;
    ekFag.push({ id: kode, navn: (ekT.rader.find((r) => r[fagKol] === kode)?.[fagNavnKol] ?? kode).trim() });
    for (const r of rader) {
      (ekSnitt[r.enhet] ??= {})[kode] = verdierPerEnhet([r], [snittKol])[r.enhet]?.[0] ?? null;
      (ekAntall[r.enhet] ??= {})[kode] = verdierPerEnhet([r], [antallKol])[r.enhet]?.[0] ?? null;
    }
  }

  return {
    kilde: 'udir-statistikkbanken',
    hentet: new Date().toISOString(),
    enheter,
    sokere: {
      aar: sokAar.map(aarstall),
      alle: verdierPerEnhet(sokR, sokKol('Skole og læreplass')),
      skole: verdierPerEnhet(sokR, sokKol('Skole')),
      laereplass: verdierPerEnhet(sokR, sokKol('Læreplass')),
      utdanningsprogram: {
        aar: progAar.map(aarstall),
        programmer: brukte.filter((p) => typeof progVerdier.L?.[String(p.id)]?.at(-1) === 'number').map((p) => ({ id: String(p.id), navn: p.navn, yrkesfag: p.yrkesfag })),
        verdier: progVerdier,
      },
    },
    elever: {
      skolear: elAar.map((t) => t.navn),
      elever: verdierPerEnhet(elR, elAar.map((t) => kolonne(elT, t.navn, 'Antall elever'))),
      skoler: utenSkoler(verdierPerEnhet(elR, elAar.map((t) => kolonne(elT, t.navn, 'Antall skoler')))),
    },
    formidling: {
      aar: desemberAar,
      desember: verdierPerEnhet(foR, desember.map(foKol)),
      hosten: { aar: sisteAar, maneder: hosten.map((t) => t.navn), verdier: verdierPerEnhet(foR, hosten.map(foKol)) },
    },
    laerekontrakter: { aar: lkAar.map(aarstall), verdier: verdierPerEnhet(lkR, lkKol) },
    fravaer: {
      skolear: frAar.navn,
      total: Object.fromEntries(Object.entries(verdierPerEnhet(frR, [frTotal])).map(([k, v]) => [k, v[0] ?? null])),
      vitnemal: Object.fromEntries(Object.entries(verdierPerEnhet(frR, [frVitnemal])).map(([k, v]) => [k, v[0] ?? null])),
    },
    gjennomforing: { kull: gjKull.map(aarstall), verdier: gjVerdier, beregnet: true },
    fagbrev: { kull: fbKull, verdier: Object.fromEntries(Object.entries(verdierPerEnhet(fbR, [fbKol])).map(([k, v]) => [k, v[0] ?? null])) },
    // Skoleåret står i navnet, f.eks. «Foreløpige tall 2025-26», til tallene er endelige.
    eksamen: { skolear: ekAar.navn.match(/\d{4}-\d{2}/)?.[0] ?? ekAar.navn, forelopig: /foreløpig/i.test(ekAar.navn), fag: ekFag, snitt: ekSnitt, antall: ekAntall },
  };
}

/** Feil i tallene som betyr at tabellene er endret: landet må ha tall i alle delene, og fylkene må være med. */
export function validerStatistikk(d: Statistikk): string[] {
  const feil: string[] = [];
  const harTall = (v: readonly Verdi[] | undefined) => (v ?? []).some((x) => typeof x === 'number');
  if (!harTall(d.sokere.alle.L)) feil.push('Søkere mangler for landet.');
  if (!harTall(d.elever.elever.L)) feil.push('Elever mangler for landet.');
  if (!harTall(d.formidling.desember.L)) feil.push('Formidlingen mangler for landet.');
  if (!harTall(d.laerekontrakter.verdier.L)) feil.push('Lærekontraktene mangler for landet.');
  if (typeof d.fravaer.total.L !== 'number') feil.push('Fraværet mangler for landet.');
  if (!harTall(d.gjennomforing.verdier.L)) feil.push('Gjennomføringen mangler for landet.');
  if (typeof d.fagbrev.verdier.L !== 'number') feil.push('Fag- og svennebrev mangler for landet.');
  if (d.eksamen.fag.length === 0) feil.push('Eksamen mangler fag.');
  const fylker = Object.keys(d.enheter).filter((k) => k.startsWith('F'));
  if (fylker.length < 15) feil.push(`Bare ${fylker.length} fylker.`);
  for (const f of fylker) if (!harTall(d.gjennomforing.verdier[f])) feil.push(`Gjennomføringen mangler for ${d.enheter[f]?.navn ?? f}.`);
  const skoler = Object.keys(d.enheter).filter((k) => k.startsWith('S')).length;
  if (skoler < 300) feil.push(`Bare ${skoler} skoler.`);
  // Andelene er prosent, og fraværet dager.
  for (const v of Object.values(d.formidling.desember).flat()) if (typeof v === 'number' && (v < 0 || v > 100)) feil.push(`Andel utenfor 0–100: ${v}.`);
  return feil;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const data = await hent();
  statistikkSkjema.parse(data);
  const feil = validerStatistikk(data);
  if (feil.length > 0) throw new Error(`Tallene fra statistikkbanken ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige fil.`);
  const fil = join(rot, 'data/statistikk/statistikk.json');
  const forrige = lesForrige<Statistikk>(fil);
  const endret = skrivHvisEndret(fil, forrige, data);
  // Kildesjekken (sjekkHentet) leser `endringer` i endringsfilen. Uten listen feilet sjekken da tallene var uendret.
  skrivEndringer(rot, 'statistikk', { endret, forste: !forrige, endringer: endret && forrige ? ['Nøkkeltallene er oppdatert.'] : [] });
  const skoler = Object.keys(data.enheter).filter((k) => k.startsWith('S')).length;
  console.log(`Statistikk: søkere ${data.sokere.aar.at(-1)}, elever ${data.elever.skolear.at(-1)}, ${skoler} skoler, formidling ${data.formidling.hosten.maneder.join('/')} ${data.formidling.hosten.aar}. ${endret ? 'Endret.' : 'Uendret.'}`);
}
