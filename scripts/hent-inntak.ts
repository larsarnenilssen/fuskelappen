// Henter datoene for svar, svarfrist og andre inntak fra fylkenes sider til data/inntak/datoer.json (fase 6, pakke 5,
// eier 05.10.2026). Kjøres hver uke av kildesjekken, ved siden av eksamensdatoene. Filen skrives bare når en dato er
// endret.
//
// - Sidene og mønstrene står i scripts/inntak/kilder.ts, og lesingen i scripts/inntak/les.ts.
// - Datoene er fylkets egne. Regelen fra eksamensdatoene, der to fylker må ha samme dato, brukes ikke.
// - Mønstre som ikke finner datoen (siden kan være endret), sider som ikke kan hentes, og sider i samme fylke som er
//   uenige, står i .generert/inntak-endringer.json, som kildesjekken tar med i kontrollsaken.
// - Kan en side ikke hentes, beholdes datoene fra den i forrige fil. Feiler alle sidene, kastes en feil før noe
//   skrives, og forrige fil blir stående.
//
// Bruk: npm run hent:inntak [-- --fra=<mappe>]
//   --fra leser sidene fra en mappe (<kilde-id>.html) i stedet for å laste ned.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Inntaksdatoer, inntaksdatoerSkjema, inntaksfelt } from '../src/modules/inntak/datoer-skjema.ts';
import { lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import { hentSide, sidetekst } from './hent-eksamen.ts';
import { INNTAKSKILDER } from './inntak/kilder.ts';
import { type Inntakskandidat, type Inntaksfylker, lesInntakskilde, samleInntak, sammenlignInntak } from './inntak/les.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const FIL = join(rot, 'data/inntak/datoer.json');

/**
 * Tar med datoene fra forrige fil for kildene som ikke kunne hentes, når den nye filen ikke har datoen fra før.
 * Gir id-ene til kildene som ble tatt med.
 */
export function behold(ny: Inntaksfylker, forrige: Inntaksfylker | null, feilet: ReadonlySet<string>): string[] {
  const brukt = new Set<string>();
  if (!forrige) return [];
  for (const [fylke, aarene] of Object.entries(forrige))
    for (const [aar, felter] of Object.entries(aarene))
      for (const [felt, v] of Object.entries(felter)) {
        if (!v || !v.kilder.some((k) => feilet.has(k))) continue;
        const mal = ((ny[fylke] ??= {})[aar] ??= {});
        if (mal[felt as keyof typeof mal]) continue;
        mal[felt as keyof typeof mal] = v;
        for (const k of v.kilder) brukt.add(k);
      }
  return [...brukt];
}

/** Fylkene, årene og feltene i fast rekkefølge, så filen ikke endres bare fordi en side ble lest i en annen rekkefølge. */
export function sorter(f: Inntaksfylker): Inntaksfylker {
  const ut: Inntaksfylker = {};
  for (const fylke of Object.keys(f).sort()) {
    const aarene = f[fylke] ?? {};
    ut[fylke] = {};
    for (const aar of Object.keys(aarene).sort()) {
      const felter = aarene[aar] ?? {};
      const sortert: (typeof aarene)[string] = {};
      for (const felt of inntaksfelt) if (felter[felt]) sortert[felt] = felter[felt];
      (ut[fylke] as Record<string, typeof sortert>)[aar] = sortert;
    }
  }
  return ut;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fra = process.argv.find((a) => a.startsWith('--fra='))?.slice(6);
  const hentet = new Date().toISOString();
  const forrige = lesForrige<Inntaksdatoer>(FIL);

  const kandidater: Inntakskandidat[] = [];
  const mangler: string[] = [];
  const feilet: string[] = [];
  const feiledeKilder = new Set<string>();
  for (const kilde of INNTAKSKILDER) {
    try {
      // Fire forsøk med lengre pauser, fordi noen fylker (Telemark) svarer ustabilt.
      const html = fra ? readFileSync(join(fra, `${kilde.id}.html`), 'utf8') : await hentSide(kilde.url, 4, 5000);
      const lest = lesInntakskilde(kilde, sidetekst(html, kilde.selektor), hentet.slice(0, 10));
      kandidater.push(...lest.kandidater);
      mangler.push(...lest.mangler.map((m) => `${kilde.navn}: fant ikke ${m}`));
    } catch (e) {
      feiledeKilder.add(kilde.id);
      feilet.push(`${kilde.navn}: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (!fra) await new Promise((v) => setTimeout(v, 1000));
  }
  if (feiledeKilder.size === INNTAKSKILDER.length) throw new Error(`Ingen av fylkenes sider kunne leses. Beholder forrige fil. ${feilet.join(' ')}`);

  const samlet = samleInntak(kandidater);
  const beholdt = behold(samlet.fylker, forrige?.fylker ?? null, feiledeKilder);
  const brukt = new Set([...kandidater.map((k) => k.kilde), ...beholdt]);
  const data: Inntaksdatoer = {
    hentet,
    kilder: Object.fromEntries(INNTAKSKILDER.filter((k) => brukt.has(k.id)).map((k) => [k.id, { navn: k.navn, url: k.url, fylke: k.fylke }])),
    fylker: sorter(samlet.fylker),
  };
  inntaksdatoerSkjema.parse(data);
  const endringer = sammenlignInntak(forrige?.fylker ?? null, data.fylker);
  const endret = skrivHvisEndret(FIL, forrige, data);
  skrivEndringer(rot, 'inntak', {
    endret,
    forste: !forrige,
    endringer,
    uenige: samlet.uenige,
    mangler: [...feilet.map((f) => `Kunne ikke hentes (forrige datoer beholdt): ${f}`), ...mangler],
    feil: null,
  });
  const antall = Object.values(data.fylker).reduce((n, aarene) => n + Object.values(aarene).reduce((m, f) => m + Object.keys(f).length, 0), 0);
  console.log(`Inntaksdatoer: ${antall} datoer i ${Object.keys(data.fylker).length} fylker. ${samlet.uenige.length} uenige, ${mangler.length + feilet.length} mangler.`);
}
