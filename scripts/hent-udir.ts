// Henter fag- og timefordelingen fra rundskrivet Udir-1 («Fag- og timefordeling og tilbudsstruktur for
// Kunnskapsløftet») på udir.no til data/udir/fagfordeling-<skoleår>.json. Kjøres hver uke av kildesjekken,
// sammen med Grep (avgjørelse 024).
//
// - Adressen til rundskrivet står i kilderegisteret (udir-fag-og-timefordeling). Udir-1-2026 gjelder skoleåret
//   2026–2027. Hvert skoleår får egen fil, så appen kan bruke riktig fordeling for datoen.
// - Hentingen ser også etter rundskrivet for neste år (f.eks. Udir-1-2027). Finnes det, står det i kontrollsaken,
//   og adressen oppdateres i kilderegisteret. Da legges det nye skoleåret ved siden av det gamle.
// - Får et nytt rundskriv et annet navn eller en annen adresse, finner ikke sjekken over det. Men Udir flytter det
//   gamle til «tidligere rundskriv». Sender udir.no hentingen videre dit, står det i kontrollsaken (flyttetTil).
// - Teksten øverst i rundskrivet («Dette rundskrivet erstatter …») og datoen det sist ble endret, sjekkes som egen
//   kilde (udir-fag-og-timefordeling-forside). Den må ha samme adresse som denne (forsideAvvik).
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
export const FORSIDE = 'udir-fag-og-timefordeling-forside';

/** Sidene i vedlegg 1 med tabellene for videregående, relativt til adressen til rundskrivet. */
export const SIDER = ['vedlegg-1/3vgo/3.3studieforberedende/', 'vedlegg-1/3vgo/3.4-yrkesfaglig/', 'vedlegg-1/3vgo/3.5studieforberedende-i-yrkesfag/'];

/** Rundskrivet og skoleåret fra adressen: …/udir-1-2026/ → Udir-1-2026, 2026-2027. */
export function rundskrivFraAdresse(url: string): { rundskriv: string; aar: number; skolear: string } {
  const m = /udir-1-(\d{4})/i.exec(url);
  if (!m?.[1]) throw new Error(`Fant ikke rundskrivet (udir-1-ÅÅÅÅ) i adressen ${url}`);
  const aar = Number(m[1]);
  return { rundskriv: `Udir-1-${aar}`, aar, skolear: `${aar}-${aar + 1}` };
}

/**
 * Adressen udir.no sendte hentingen videre til, eller null om siden lå der den skulle. Når et nytt rundskriv kommer,
 * flytter Udir det gamle til …/tidligere-rundskriv/udir-1-ÅÅÅÅ/. Innholdet står der uendret, så uten denne sjekken
 * ville hentingen gå uten feil og melde «ingen endringer».
 */
export function flyttetTil(adresse: string, endelig: string): string | null {
  const sti = (u: string) => new URL(u).pathname.replace(/\/+$/, '').toLowerCase();
  return sti(adresse) === sti(endelig) ? null : endelig;
}

/** Melding hvis forsiden av rundskrivet sjekkes på en annen adresse enn tabellene hentes fra. */
export function forsideAvvik(kilder: readonly { id: string; url: string }[]): string | null {
  const tabeller = kilder.find((k) => k.id === KILDE);
  const forside = kilder.find((k) => k.id === FORSIDE);
  if (!tabeller) return null;
  if (!forside) return `Kilden ${FORSIDE} mangler i kilderegisteret, så teksten øverst i rundskrivet sjekkes ikke.`;
  const sti = (u: string) => new URL(u).pathname.replace(/\/+$/, '').toLowerCase();
  return sti(forside.url) === sti(tabeller.url)
    ? null
    : `Teksten øverst i rundskrivet sjekkes på ${forside.url}, men tabellene hentes fra ${tabeller.url}. Adressen til ${FORSIDE} må oppdateres.`;
}

async function hentSide(url: string): Promise<{ html: string; url: string }> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, signal: AbortSignal.timeout(60_000) });
      if (!svar.ok) throw new Error(`${url} svarte ${svar.status}`);
      return { html: await svar.text(), url: svar.url || url };
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
  const adresser = [base, ...sider];
  const svar = await Promise.all(adresser.map(hentSide));
  const tabeller = svar.slice(1).flatMap((h) => lesTabeller(h.html));
  // Er rundskrivet flyttet (f.eks. til «tidligere rundskriv»)? Forsiden og tabellsidene sjekkes.
  const flyttet = svar.map((h, i) => flyttetTil(adresser[i] ?? base, h.url)).find((u) => u !== null) ?? null;
  const varsler = [
    ...(flyttet ? [`${rundskriv} ligger ikke lenger på adressen i kilderegisteret. udir.no sender videre til ${flyttet}. Det betyr som regel at et nytt rundskriv har erstattet det, også om det har fått et annet navn. Det nye må finnes og legges inn.`] : []),
    ...[forsideAvvik(register.kilder)].filter((m): m is string => m !== null),
  ];
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
  writeFileSync(join(rot, '.generert/udir-endringer.json'), `${JSON.stringify({ rundskriv, skolear, endret, forste: !forrige, endringer, nyVersjon, varsler }, null, 2)}\n`);
  console.log(`${rundskriv} (${skolear}): ${tabeller.length} tabeller, ${ny.merknader.length} merknader. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}${nyVersjon ? ` Nytt rundskriv finnes: ${nyVersjon}.` : ''}${varsler.map((v) => ` ${v}`).join('')}`);
}
