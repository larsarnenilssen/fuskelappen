// Henter lovene og forskriftene i content/lovverk.yaml fra Lovdatas gratis datasett (NLOD 2.0) til data/lovdata/
// (fase 3, avgjørelse 039). Kjøres hver uke av kildesjekken, sammen med Grep og overordnet del. Lovdata kan bare nås
// fra GitHub Actions, ikke fra utviklingsmiljøet.
//
// - Datasettene (gjeldende lover og gjeldende sentrale forskrifter) lastes ned én gang og pakkes ut med systemets tar.
// - Hvert dokument leses med scripts/lovdata/les.ts og valideres. Feiler et dokument, beholdes forrige fil for det,
//   og de andre hentes som vanlig. Skriptet avslutter da med feil, så kildesjekken sier fra.
// - Endrede, nye og fjernede paragrafer lagres i .generert/lovdata-endringer.json, som kildesjekken tar med i
//   kontrollsaken. Teksten er lov- og forskriftstekst og vises uendret i appen.
//
// Bruk: npm run hent:lovdata [-- --fra=<mappe>]
//   --fra leser filene fra en mappe i stedet for å laste ned (filnavn som i datasettet, f.eks. nl-20230609-030.xml).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Kilderegister } from '../src/core/innhold/skjema.ts';
import {
  alleParagrafer,
  alleSeksjoner,
  kapittelliste,
  type Ledd,
  type Lovdokument,
  lovdokumentSkjema,
  type Lovoversikt,
  lovoversiktSkjema,
  type Lovutvalg,
  type Paragraf,
  type Seksjon,
  type Segment,
} from '../src/modules/lov/skjema.ts';
import { lesFil } from './innhold/last.ts';
import { USER_AGENT } from './kilder/metoder.ts';
import { datasettnavn, lesLovdokument } from './lovdata/les.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const MAPPE = join(rot, 'data/lovdata');
const DATASETT = {
  lov: 'https://api.lovdata.no/v1/publicData/get/gjeldende-lover.tar.bz2',
  forskrift: 'https://api.lovdata.no/v1/publicData/get/gjeldende-sentrale-forskrifter.tar.bz2',
} as const;
/** Faller antallet paragrafer i et dokument med mer enn dette, beholdes forrige henting (noe kan ha gått galt). */
const MAKS_FALL = 0.2;

/** Laster ned og pakker ut et datasett. Gir mappen filene ligger i. */
async function hentDatasett(url: string): Promise<string> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(300_000) });
      if (!svar.ok) throw new Error(`${url} svarte ${svar.status} ${svar.statusText}`);
      const mappe = mkdtempSync(join(tmpdir(), 'lovdata-'));
      const fil = join(mappe, 'datasett.tar.bz2');
      writeFileSync(fil, Buffer.from(await svar.arrayBuffer()));
      execFileSync('tar', ['-xjf', fil, '-C', mappe], { maxBuffer: 256 * 1024 * 1024 });
      return mappe;
    } catch (e) {
      feil = e;
      await new Promise((r) => setTimeout(r, 5000 * forsok));
    }
  }
  throw feil;
}

/** Finner filen til et dokument (f.eks. nl-20230609-030.xml) i en mappe med undermapper. */
function finnFil(mappe: string, navn: string): string | null {
  for (const n of readdirSync(mappe, { withFileTypes: true })) {
    const sti = join(mappe, n.name);
    if (n.isDirectory()) {
      const treff = finnFil(sti, navn);
      if (treff) return treff;
    } else if (n.name === `${navn}.xml` || n.name.startsWith(`${navn}.`)) return sti;
  }
  return null;
}

/** JSON uten lenkene i appen, til sammenligning av tekst. */
const utenAppLenker = (json: string) => json.replace(/,"a":"[^"]*"/g, '');

const paragrafnavn = (p: Paragraf) => `${p.visNr}${p.tittel ? ` ${p.tittel}` : ''}`;

/** Endringene i et dokument mellom to hentinger, én linje per paragraf. */
export function sammenlignLovdokument(gammel: Lovdokument, ny: Lovdokument): string[] {
  const g = new Map(alleParagrafer(gammel.seksjoner).map(({ paragraf }) => [paragraf.nr, paragraf]));
  const n = new Map(alleParagrafer(ny.seksjoner).map(({ paragraf }) => [paragraf.nr, paragraf]));
  // Lenkene i appen (`a`) settes av hentingen og er ikke en endring i teksten.
  const innhold = (p: Paragraf) => utenAppLenker(JSON.stringify([p.tittel, p.ledd, p.fotnoter]));
  const kapitler = (d: Lovdokument) => alleSeksjoner(d.seksjoner).map((s) => s.overskrift);
  const gk = new Set(kapitler(gammel));
  const nk = new Set(kapitler(ny));
  return [
    ...[...nk].filter((k) => !gk.has(k)).map((k) => `Ny eller endret overskrift: ${k}`),
    ...[...gk].filter((k) => !nk.has(k)).map((k) => `Overskrift fjernet eller endret: ${k}`),
    ...[...n.values()].filter((p) => !g.has(p.nr)).map((p) => `Ny paragraf: ${paragrafnavn(p)}`),
    ...[...g.values()].filter((p) => !n.has(p.nr)).map((p) => `Paragraf fjernet: ${paragrafnavn(p)}`),
    ...[...n.values()].filter((p) => g.has(p.nr) && innhold(g.get(p.nr) as Paragraf) !== innhold(p)).map((p) => `Endret: ${paragrafnavn(p)}`),
  ];
}

/** Sjekker at et dokument er fullstendig nok til å erstatte forrige henting. */
export function validerLovdokument(ny: Lovdokument, forrige: Lovdokument | null): string[] {
  const feil: string[] = [];
  const antall = alleParagrafer(ny.seksjoner).length;
  if (antall === 0) feil.push('Ingen paragrafer.');
  if (!ny.refid) feil.push('Mangler adressen hos Lovdata (refid).');
  const tomme = alleParagrafer(ny.seksjoner).filter(({ paragraf: p }) => p.ledd.length === 0 && p.endringer.length === 0 && !/oppheva|opphevet/i.test(p.tittel));
  if (tomme.length > 0) feil.push(`Paragrafer uten tekst: ${tomme.map(({ paragraf: p }) => p.visNr).join(', ')}.`);
  if (forrige) {
    const fra = alleParagrafer(forrige.seksjoner).length;
    if (fra > 0 && antall < fra * (1 - MAKS_FALL)) feil.push(`Antallet paragrafer falt fra ${fra} til ${antall}.`);
  }
  return feil;
}

/**
 * Lenker i teksten som peker på en paragraf i et dokument appen viser, får adressen i appen (`a`), f.eks. fra
 * opplæringsforskrifta til «opplæringslova § 5-1». Andre lenker går til Lovdata.
 */
export function lenkInternt(dokumenter: readonly Lovdokument[]): Lovdokument[] {
  const paragrafer = new Map(dokumenter.map((d) => [d.refid, { id: d.id, nr: new Set(alleParagrafer(d.seksjoner).map(({ paragraf }) => paragraf.nr)) }]));
  const lenk = (tekst: Segment[]): Segment[] =>
    tekst.map((s) => {
      if (typeof s === 'string' || !('l' in s)) return s;
      const m = /^((?:lov|forskrift)\/\d{4}-\d{2}-\d{2}(?:-\d+)?)\/§([^/]+)/.exec(s.l);
      const mal = m ? paragrafer.get(m[1] as string) : undefined;
      const nr = m?.[2];
      return mal && nr && mal.nr.has(nr) ? { t: s.t, l: s.l, a: `${mal.id}/${nr}` } : { t: s.t, l: s.l };
    });
  const ledd = (l: Ledd): Ledd => ({
    ...l,
    tekst: lenk(l.tekst),
    ...(l.liste ? { liste: l.liste.map((p) => ({ ...p, ledd: p.ledd.map(ledd) })) } : {}),
    ...(l.etter ? { etter: l.etter.map(lenk) } : {}),
  });
  const seksjon = (s: Seksjon): Seksjon => ({
    ...s,
    merknader: s.merknader.map(lenk),
    seksjoner: s.seksjoner.map(seksjon),
    paragrafer: s.paragrafer.map((p) => ({ ...p, ledd: p.ledd.map(ledd), endringer: p.endringer.map(lenk), fotnoter: p.fotnoter.map((f) => ({ ...f, tekst: lenk(f.tekst) })) })),
  });
  return dokumenter.map((d) => ({ ...d, seksjoner: d.seksjoner.map(seksjon) }));
}

export function lagOversikt(dokumenter: readonly Lovdokument[]): Lovoversikt {
  return {
    dokumenter: dokumenter.map((d) => ({
      id: d.id,
      kilde: d.kilde,
      type: d.type,
      tittel: d.tittel,
      korttittel: d.korttittel,
      malform: d.malform,
      refid: d.refid,
      gyldighet: d.gyldighet,
      utvalg: d.utvalg,
      antallKapitler: alleSeksjoner(d.seksjoner).filter((s) => s.type === 'kapittel').length,
      antallParagrafer: alleParagrafer(d.seksjoner).length,
    })),
  };
}

function lesForrige(id: string): Lovdokument | null {
  const fil = join(MAPPE, `${id}.json`);
  if (!existsSync(fil)) return null;
  try {
    return lovdokumentSkjema.parse(JSON.parse(readFileSync(fil, 'utf8')));
  } catch {
    return null;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fra = process.argv.find((a) => a.startsWith('--fra='))?.slice('--fra='.length) ?? null;
  const utvalg = lesFil(rot, join(rot, 'content/lovverk.yaml')) as Lovutvalg;
  const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
  const idag = new Date().toISOString().slice(0, 10);

  const oppgaver = utvalg.dokumenter.map((d) => {
    const kilde = register.kilder.find((k) => k.id === d.kilde);
    if (!kilde) throw new Error(`${d.id}: kilden ${d.kilde} finnes ikke i content/kilder.yaml.`);
    const navn = datasettnavn(kilde.url);
    return { d, navn, type: navn.startsWith('nl-') ? ('lov' as const) : ('forskrift' as const) };
  });

  // Datasettene lastes ned bare når de trengs, og bare én gang.
  const mapper: Partial<Record<'lov' | 'forskrift', string>> = {};
  const datasettfeil: Partial<Record<'lov' | 'forskrift', string>> = {};
  for (const type of new Set(oppgaver.map((o) => o.type))) {
    try {
      mapper[type] = fra ?? (await hentDatasett(DATASETT[type]));
    } catch (e) {
      datasettfeil[type] = `Kunne ikke hente datasettet med ${type === 'lov' ? 'lover' : 'forskrifter'}: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  const resultater: { id: string; kilde: string; endringer: string[]; feil: string | null; forste: boolean }[] = [];
  const dokumenter: Lovdokument[] = [];
  for (const { d, navn, type } of oppgaver) {
    const forrige = lesForrige(d.id);
    try {
      const mappe = mapper[type];
      if (!mappe) throw new Error(datasettfeil[type] ?? 'Datasettet mangler.');
      const fil = finnFil(mappe, navn);
      if (!fil) throw new Error(`Fant ikke ${navn} i datasettet. Er adressen i kilderegisteret riktig?`);
      const ny = lovdokumentSkjema.parse(
        lesLovdokument(readFileSync(fil, 'utf8'), {
          id: d.id,
          kilde: d.kilde,
          kapitler: d.kapitler ? kapittelliste(d.kapitler) : null,
          korttittel: d.korttittel,
          gyldighet: d.gyldighet,
          hentet: idag,
        }),
      );
      const feil = validerLovdokument(ny, forrige);
      if (feil.length > 0) throw new Error(`Teksten ser ufullstendig ut, og forrige henting beholdes. ${feil.join(' ')}`);
      const endringer = forrige ? sammenlignLovdokument(forrige, ny) : [];
      // Dato for henting endres bare når teksten er endret, så filen ikke endres hver uke.
      const ut = forrige && endringer.length === 0 && utenAppLenker(JSON.stringify({ ...forrige, hentet: '' })) === utenAppLenker(JSON.stringify({ ...ny, hentet: '' })) ? forrige : ny;
      dokumenter.push(ut);
      resultater.push({ id: d.id, kilde: d.kilde, endringer, feil: null, forste: !forrige });
      console.log(`${d.id}: ${alleParagrafer(ut.seksjoner).length} paragrafer. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}`);
    } catch (e) {
      const melding = e instanceof Error ? e.message : String(e);
      console.error(`${d.id}: ${melding}`);
      resultater.push({ id: d.id, kilde: d.kilde, endringer: [], feil: melding, forste: !forrige });
      if (forrige) dokumenter.push(forrige);
    }
  }

  mkdirSync(MAPPE, { recursive: true });
  for (const d of lenkInternt(dokumenter)) writeFileSync(join(MAPPE, `${d.id}.json`), `${JSON.stringify(d, null, 1)}\n`);
  // Dokumenter som er tatt ut av utvalget, fjernes.
  const ider = new Set(utvalg.dokumenter.map((d) => d.id));
  for (const f of readdirSync(MAPPE)) {
    if (f.endsWith('.json') && f !== 'oversikt.json' && !ider.has(f.replace(/\.json$/, ''))) rmSync(join(MAPPE, f));
  }
  writeFileSync(join(MAPPE, 'oversikt.json'), `${JSON.stringify(lovoversiktSkjema.parse(lagOversikt(dokumenter)), null, 1)}\n`);
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/lovdata-endringer.json'), `${JSON.stringify({ dokumenter: resultater }, null, 2)}\n`);
  if (resultater.some((r) => r.feil)) process.exit(1);
}
