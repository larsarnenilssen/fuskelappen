// Henter overordnet del av læreplanverket fra udir.no på bokmål og nynorsk til data/udir/overordnet-del.json
// (pakke 6, avgjørelse 037). Kjøres hver uke av kildesjekken, sammen med Grep og fag- og timefordelingen.
//
// - Innholdsregisteret leses fra menyen på udir.no, og hver side hentes på begge målformer (?lang=nno).
// - Feiler hentingen, eller ser innholdet ufullstendig ut, kastes en feil før noe skrives, og forrige fil blir stående.
// - Endrede, nye og fjernede deler lagres i .generert/overordnet-endringer.json, som kildesjekken tar med i
//   kontrollsaken. Teksten er forskriftstekst og vises uendret i appen.
// Bruk: npm run hent:overordnet
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alleDeler, type Del, type OverordnetDel, overordnetDelSkjema } from '../src/modules/laereplanverket/skjema.ts';
import { USER_AGENT } from './kilder/metoder.ts';
import { lagTre, lesMeny, lesTekst, lesTittel, type Tre, type Menypunkt } from './udir/overordnet.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const UDIR = 'https://www.udir.no';
export const START = `${UDIR}/lk20/overordnet-del/`;
const FIL = join(rot, 'data/udir/overordnet-del.json');

async function hentSide(url: string): Promise<string> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, signal: AbortSignal.timeout(60_000) });
      if (!svar.ok) throw new Error(`${url} svarte ${svar.status}`);
      return await svar.text();
    } catch (e) {
      feil = e;
      await new Promise((r) => setTimeout(r, 2000 * forsok));
    }
  }
  throw feil;
}

async function lagDel(p: Tre<Menypunkt>): Promise<Del> {
  const url = `${UDIR}${p.href}`;
  const [nb, nn] = await Promise.all([hentSide(url), hentSide(`${url}?lang=nno`)]);
  const tb = lesTekst(nb);
  const tn = lesTekst(nn);
  const deler: Del[] = [];
  // Én side om gangen, så udir.no ikke får mange forespørsler samtidig.
  for (const d of p.deler) deler.push(await lagDel(d));
  return {
    id: p.href.replace(/\/$/, '').split('/').pop() ?? p.href,
    nr: p.nr,
    tittel: { nb: lesTittel(nb) || p.tittel, nn: lesTittel(nn) || p.tittel },
    url,
    ingress: { nb: tb.ingress, nn: tn.ingress },
    tekst: { nb: tb.tekst, nn: tn.tekst },
    deler,
  };
}

/** Sjekker at innholdet er fullstendig nok til å erstatte forrige henting. */
export function validerOverordnetDel(o: OverordnetDel): string[] {
  const feil: string[] = [];
  const alle = alleDeler(o.deler);
  if (alle.length < 15) feil.push(`Bare ${alle.length} deler (ventet minst 15).`);
  for (const d of alle) {
    const ord = (b: Del['tekst']['nb']) => b.length;
    if (ord(d.ingress.nb) + ord(d.tekst.nb) === 0) feil.push(`${d.nr ?? ''} ${d.tittel.nb}: mangler tekst på bokmål.`);
    if (ord(d.ingress.nn) + ord(d.tekst.nn) === 0) feil.push(`${d.nr ?? ''} ${d.tittel.nb}: mangler tekst på nynorsk.`);
  }
  for (const nr of ['1', '2', '3']) if (!alle.some((d) => d.nr === nr)) feil.push(`Mangler kapittel ${nr}.`);
  return feil;
}

/** Endringene mellom to hentinger, én linje per del. */
export function sammenlignOverordnetDel(gammel: OverordnetDel, ny: OverordnetDel): string[] {
  const navn = (d: Del) => `${d.nr ? `${d.nr} ` : ''}${d.tittel.nb}`;
  const innhold = (d: Del) => JSON.stringify([d.tittel, d.ingress, d.tekst]);
  const g = new Map(alleDeler(gammel.deler).map((d) => [d.id, d]));
  const n = new Map(alleDeler(ny.deler).map((d) => [d.id, d]));
  return [
    ...[...n.values()].filter((d) => !g.has(d.id)).map((d) => `Ny del: ${navn(d)}`),
    ...[...g.values()].filter((d) => !n.has(d.id)).map((d) => `Del fjernet: ${navn(d)}`),
    ...[...n.values()].filter((d) => g.has(d.id) && innhold(g.get(d.id) as Del) !== innhold(d)).map((d) => `Endret tekst: ${navn(d)}`),
  ];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const meny = lesMeny(await hentSide(START));
  if (meny.length === 0) throw new Error('Fant ikke innholdsregisteret på udir.no. Siden kan ha fått ny struktur.');
  const deler: Del[] = [];
  for (const p of lagTre(meny)) deler.push(await lagDel(p));
  const ny = overordnetDelSkjema.parse({ kilde: 'udir-overordnet-del', url: START, hentet: new Date().toISOString().slice(0, 10), deler });
  const feil = validerOverordnetDel(ny);
  if (feil.length > 0) throw new Error(`Overordnet del ser ufullstendig ut. Forrige henting beholdes.\n${feil.join('\n')}`);
  const forrige = existsSync(FIL) ? overordnetDelSkjema.parse(JSON.parse(readFileSync(FIL, 'utf8'))) : null;
  const endringer = forrige ? sammenlignOverordnetDel(forrige, ny) : [];
  // Dato for henting endres bare når teksten er endret, så filen ikke endres hver uke.
  const ut = forrige && endringer.length === 0 ? { ...ny, hentet: forrige.hentet } : ny;
  mkdirSync(join(rot, 'data/udir'), { recursive: true });
  writeFileSync(FIL, `${JSON.stringify(ut, null, 1)}\n`);
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/overordnet-endringer.json'), `${JSON.stringify({ forste: !forrige, endringer }, null, 2)}\n`);
  console.log(`Overordnet del: ${alleDeler(ut.deler).length} deler. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}`);
}
