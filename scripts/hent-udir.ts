// Henter fag- og timefordelingen fra rundskrivet Udir-1 («Fag- og timefordeling og tilbudsstruktur for
// Kunnskapsløftet») på udir.no til data/udir/fagfordeling-<skoleår>.json. Kjøres hver uke av kildesjekken,
// sammen med Grep (avgjørelse 024).
//
// - Adressen til rundskrivet står i kilderegisteret (udir-fag-og-timefordeling). Udir-1-2026 gjelder skoleåret
//   2026–2027. Hvert skoleår får egen fil, så appen kan bruke riktig fordeling for datoen.
// - Hentingen ser også etter rundskrivet for neste år (f.eks. Udir-1-2027). Finnes det, står det i kontrollsaken,
//   og adressen oppdateres i kilderegisteret. Da legges det nye skoleåret ved siden av det gamle.
// - Feiler hentingen, eller mangler tabeller, kastes en feil før noe skrives, og forrige fil blir stående.
// Endringene lagres i .generert/udir-endringer.json, som kildesjekken tar med i rapporten.
// Bruk: npm run hent:udir
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Kilderegister } from '../src/core/innhold/skjema.ts';
import { fagfordelingSkjema, type Fagfordeling, type Fagliste, type Fordelingstabell } from '../src/modules/fag/tilbud/skjema.ts';
import { lesFil } from './innhold/last.ts';
import { USER_AGENT } from './kilder/metoder.ts';
import { lesTabeller, validerFagfordeling } from './udir/fagfordeling.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const KILDE = 'udir-fag-og-timefordeling';

/** Sidene i vedlegg 1 med tabellene for videregående, relativt til adressen til rundskrivet. */
export const SIDER = ['vedlegg-1/3vgo/3.3studieforberedende/', 'vedlegg-1/3vgo/3.4-yrkesfaglig/', 'vedlegg-1/3vgo/3.5studieforberedende-i-yrkesfag/'];

/** Rundskrivet og skoleåret fra adressen: …/udir-1-2026/ → Udir-1-2026, 2026-2027. */
export function rundskrivFraAdresse(url: string): { rundskriv: string; aar: number; skolear: string } {
  const m = /udir-1-(\d{4})/i.exec(url);
  if (!m?.[1]) throw new Error(`Fant ikke rundskrivet (udir-1-ÅÅÅÅ) i adressen ${url}`);
  const aar = Number(m[1]);
  return { rundskriv: `Udir-1-${aar}`, aar, skolear: `${aar}-${aar + 1}` };
}

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

/** Linjene i en tabell som tekst, til sammenligning: «Tabell 17a (vg1) · Norsk · Ordinær» → 113. */
function celler(f: Fagfordeling): Map<string, string> {
  const ut = new Map<string, string>();
  for (const t of f.tabeller) {
    if (t.type === 'fordeling') {
      const ft = t as Fordelingstabell;
      for (const r of ft.rader) ft.kolonner.forEach((k, i) => ut.set(`Tabell ${ft.nr} (${ft.omfang}) · ${r.linje} · ${k.navn}`, r.timer[i] === null || r.timer[i] === undefined ? '–' : String(r.timer[i])));
    } else {
      const fl = t as Fagliste;
      for (const r of fl.rader) ut.set(`Tabell ${fl.nr} · ${r.gruppe}${r.del ? ` (${r.del})` : ''} · ${r.fag}`, r.timer === null ? '–' : String(r.timer));
    }
  }
  return ut;
}

/** Endringene i fag- og timefordelingen mellom to hentinger, én linje per celle. */
export function sammenlignFagfordeling(gammel: Fagfordeling, ny: Fagfordeling): string[] {
  const g = celler(gammel);
  const n = celler(ny);
  return [
    ...[...n].filter(([k]) => !g.has(k)).map(([k, v]) => `Ny: ${k}: ${v}`),
    ...[...g].filter(([k]) => !n.has(k)).map(([k, v]) => `Fjernet: ${k} (var ${v})`),
    ...[...n].filter(([k, v]) => g.has(k) && g.get(k) !== v).map(([k, v]) => `Endret: ${k}: ${g.get(k) ?? ''} → ${v}`),
  ];
}

export const fagfordelingJson = (f: Fagfordeling) => `${JSON.stringify(f, null, 1)}\n`;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
  const kilde = register.kilder.find((k) => k.id === KILDE);
  if (!kilde) throw new Error(`Kilden ${KILDE} mangler i kilderegisteret.`);
  const base = kilde.url.endsWith('/') ? kilde.url : `${kilde.url}/`;
  const { rundskriv, aar, skolear } = rundskrivFraAdresse(base);
  const sider = SIDER.map((s) => new URL(s, base).toString());
  const tabeller = (await Promise.all(sider.map(hentSide))).flatMap(lesTabeller);
  const ny: Fagfordeling = { kilde: KILDE, rundskriv, skolear, hentet: new Date().toISOString(), lisens: 'NLOD 2.0', sider, tabeller, merknader: [] };
  ny.merknader = validerFagfordeling(ny);
  fagfordelingSkjema.parse(ny);
  const strukturfeil = ny.merknader.filter((m) => /^Fant bare|mangler/.test(m));
  if (strukturfeil.length > 0) throw new Error(`Fag- og timefordelingen ser ikke ut som ventet: ${strukturfeil.join(' ')} Beholder forrige fil.`);

  // Rundskrivet for neste skoleår?
  const neste = base.replace(/udir-1-\d{4}/i, `udir-1-${aar + 1}`);
  const nyVersjon = await fetch(neste, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) })
    .then((s) => (s.ok ? `Udir-1-${aar + 1}` : null))
    .catch(() => null);

  const fil = join(rot, 'data/udir', `fagfordeling-${skolear}.json`);
  const forrige = existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as Fagfordeling) : null;
  const endringer = forrige ? sammenlignFagfordeling(forrige, ny) : [];
  const endret = !forrige || endringer.length > 0 || JSON.stringify(forrige.merknader) !== JSON.stringify(ny.merknader);
  if (endret) {
    mkdirSync(join(rot, 'data/udir'), { recursive: true });
    writeFileSync(fil, fagfordelingJson(ny));
  }
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/udir-endringer.json'), `${JSON.stringify({ rundskriv, skolear, endret, forste: !forrige, endringer, nyVersjon }, null, 2)}\n`);
  console.log(`${rundskriv} (${skolear}): ${tabeller.length} tabeller, ${ny.merknader.length} merknader. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}${nyVersjon ? ` Nytt rundskriv finnes: ${nyVersjon}.` : ''}`);
}
