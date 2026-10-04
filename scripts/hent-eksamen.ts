// Henter eksamensdatoene fra udir.no og fylkenes sider til data/eksamen/datoer.json (fase 6, pakke 3, avgjørelse 059).
// Kjøres av kildesjekken, men henter bare hvert halvår (eier 04.10.2026): i januar og august, når forrige henting er
// mer enn 45 dager gammel. Mellom hentingene blir forrige fil stående.
//
// - Sidene og mønstrene står i scripts/eksamen/kilder.ts, og lesingen og sammenslåingen i scripts/eksamen/les.ts.
// - eksamensplan.udir.no brukes ikke, fordi robots.txt stenger for alle andre enn søkemotorene.
// - Har Udir datoen, brukes den. Ellers må minst to fylker ha samme dato. Uenighet og mønstre som ikke finner noe,
//   står i .generert/eksamen-endringer.json, som kildesjekken tar med i kontrollsaken.
// - Feiler alle Udirs sider, eller ser dataene feil ut, kastes en feil før noe skrives, og forrige fil blir stående.
//
// Bruk: npm run hent:eksamen [-- --alle] [-- --fra=<mappe>]
//   --alle henter uansett måned.
//   --fra leser sidene fra en mappe (<kilde-id>.html) i stedet for å laste ned.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Eksamensdatoer, eksamensdatoerSkjema } from '../src/modules/vurdering/eksamen/skjema.ts';
import { lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import { EKSAMENSKILDER } from './eksamen/kilder.ts';
import { type Kandidat, lesKilde, slaSammen } from './eksamen/les.ts';
import { parse } from 'node-html-parser';
import { USER_AGENT } from './kilder/metoder.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const FIL = join(rot, 'data/eksamen/datoer.json');

/** Skal datoene hentes nå? I januar og august, når forrige henting er mer enn 45 dager gammel. */
export function skalHente(idag: string, forrige: string | null): boolean {
  if (!forrige) return true;
  const maned = Number(idag.slice(5, 7));
  const dager = (Date.parse(idag) - Date.parse(forrige.slice(0, 10))) / 86_400_000;
  return (maned === 1 || maned === 8) && dager > 45;
}

/** Endringene fra forrige fil, én linje per dato. */
export function sammenlign(forrige: Eksamensdatoer | null, ny: Eksamensdatoer): string[] {
  if (!forrige) return [];
  const flat = (d: Eksamensdatoer) => {
    const ut = new Map<string, string>();
    const legg = (sted: string, perioder: Eksamensdatoer['nasjonal']) => {
      for (const [p, felter] of Object.entries(perioder)) for (const [f, v] of Object.entries(felter)) ut.set(`${sted} ${p} ${f}`, `${v.fra ?? ''}–${v.til ?? ''}${v.kl ? ` kl. ${v.kl}` : ''}`);
    };
    legg('nasjonal', d.nasjonal);
    for (const [fylke, perioder] of Object.entries(d.fylker)) legg(`fylke ${fylke}`, perioder);
    return ut;
  };
  const a = flat(forrige);
  const b = flat(ny);
  const ut: string[] = [];
  for (const [k, v] of b) if (a.get(k) !== v) ut.push(a.has(k) ? `${k}: ${a.get(k)} → ${v}` : `${k}: ny (${v})`);
  for (const [k, v] of a) if (!b.has(k)) ut.push(`${k}: borte (${v})`);
  return ut;
}

/** Teksten i innholdet på siden, med én linje per avsnitt, så mønstrene kan skille linjene. */
export function sidetekst(html: string, selektor: string): string {
  const rot = parse(html);
  for (const fjern of ['script', 'style', 'noscript', 'template']) for (const el of rot.querySelectorAll(fjern)) el.remove();
  const treff = rot.querySelectorAll(selektor);
  if (treff.length === 0) throw new Error(`Fant ikke innholdet (selektor «${selektor}»). Siden kan ha fått ny struktur.`);
  return treff
    .map((el) => el.structuredText)
    .join('\n')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

async function hentSide(url: string): Promise<string> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`${url} svarte ${r.status}`);
      return await r.text();
    } catch (e) {
      feil = e;
      await new Promise((v) => setTimeout(v, 2000 * forsok));
    }
  }
  throw feil;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const alle = process.argv.includes('--alle');
  const fra = process.argv.find((a) => a.startsWith('--fra='))?.slice(6);
  const hentet = new Date().toISOString();
  const forrige = lesForrige<Eksamensdatoer>(FIL);
  if (!alle && !fra && !skalHente(hentet.slice(0, 10), forrige?.hentet ?? null)) {
    skrivEndringer(rot, 'eksamen', { endret: false, forste: false, hoppetOver: true, endringer: [], uenige: [], enKilde: [], mangler: [], feil: null });
    console.log('Eksamensdatoene hentes i januar og august. Beholder forrige henting.');
    process.exit(0);
  }

  const kandidater: Kandidat[] = [];
  const mangler: string[] = [];
  const feilet: string[] = [];
  for (const kilde of EKSAMENSKILDER) {
    try {
      const html = fra ? readFileSync(join(fra, `${kilde.id}.html`), 'utf8') : await hentSide(kilde.url);
      const lest = lesKilde(kilde, sidetekst(html, kilde.selektor), hentet.slice(0, 10));
      kandidater.push(...lest.kandidater);
      mangler.push(...lest.mangler.map((m) => `${kilde.navn}: fant ikke ${m}`));
    } catch (e) {
      feilet.push(`${kilde.navn}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const udirFeilet = EKSAMENSKILDER.filter((k) => k.fylke === null).every((k) => feilet.some((f) => f.startsWith(`${k.navn}:`)));
  if (udirFeilet) throw new Error(`Ingen av Udirs sider kunne leses. Beholder forrige fil. ${feilet.join(' ')}`);

  const sammen = slaSammen(kandidater);
  const brukt = new Set(kandidater.map((k) => k.kilde));
  const data: Eksamensdatoer = {
    hentet,
    nasjonal: sammen.nasjonal,
    fylker: sammen.fylker,
    kilder: Object.fromEntries(EKSAMENSKILDER.filter((k) => brukt.has(k.id)).map((k) => [k.id, { navn: k.navn, url: k.url, fylke: k.fylke }])),
  };
  eksamensdatoerSkjema.parse(data);
  const endringer = sammenlign(forrige, data);
  const endret = skrivHvisEndret(FIL, forrige, data);
  skrivEndringer(rot, 'eksamen', {
    endret,
    forste: !forrige,
    endringer,
    uenige: sammen.uenige,
    enKilde: sammen.enKilde,
    mangler: [...feilet.map((f) => `Kunne ikke hentes: ${f}`), ...mangler],
    feil: null,
  });
  const antall = Object.values(data.nasjonal).reduce((n, p) => n + Object.keys(p).length, 0);
  console.log(`Eksamensdatoer: ${antall} nasjonale datoer, ${Object.keys(data.fylker).length} fylker. ${sammen.uenige.length} uenige, ${mangler.length + feilet.length} mangler.`);
}
