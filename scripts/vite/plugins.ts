// Lokale Vite-plugins: innhold (YAML), tokenfarger, testoppsett og data.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { Innholdsfeil, lesFil } from '../innhold/last.ts';
import { beregnFagroller, byggStruktur, byggTilbud, velgFordeling } from '../../src/modules/fag/tilbud/modell.ts';
import type { Fagrelasjoner } from '../../src/modules/fag/vigo/skjema.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import type { Fagfordeling } from '../../src/modules/fag/tilbud/skjema.ts';

/** Gjør YAML under content/, rules/ og testdata om til validerte moduler. */
export function innholdPlugin(rot: string): Plugin {
  return {
    name: 'fuskelappen:innhold',
    enforce: 'pre',
    load(id) {
      const [sti] = id.split('?');
      if (sti === undefined || !sti.endsWith('.yaml')) return null;
      try {
        const data = lesFil(rot, sti);
        return { code: `export default ${JSON.stringify(data)};`, map: null };
      } catch (e) {
        if (e instanceof Innholdsfeil) this.error(e.message);
        throw e;
      }
    },
  };
}

/** Leser en CSS-variabel fra tokens.css. Farger defineres bare der. */
export function lesToken(rot: string, navn: string): string {
  const css = readFileSync(join(rot, 'src/styles/tokens.css'), 'utf8');
  const treff = new RegExp(`--${navn}:\\s*([^;]+);`).exec(css);
  if (!treff?.[1]) throw new Error(`Fant ikke --${navn} i tokens.css`);
  return treff[1].trim();
}

/** Setter inn appnavn fra app.ts og temafarger fra tokens.css i index.html. */
export function htmlPlugin(rot: string, navn: string, kortnavn: string): Plugin {
  return {
    name: 'fuskelappen:html',
    transformIndexHtml(html) {
      return html
        .replaceAll('%APP_NAVN%', navn)
        .replaceAll('%APP_KORTNAVN%', kortnavn)
        .replaceAll('%TEMAFARGE_LYS%', lesToken(rot, 'meta-temafarge-lys'))
        .replaceAll('%TEMAFARGE_MORK%', lesToken(rot, 'meta-temafarge-mork'));
    },
  };
}

/**
 * Virtuell modul med testmoduler og testinnhold. Tas bare med utenfor
 * produksjonsbygget, slik at ingenting av dette når brukerne.
 */
export function testoppsettPlugin(mode: string): Plugin {
  const id = 'virtual:testoppsett';
  const medTest = mode !== 'production';
  return {
    name: 'fuskelappen:testoppsett',
    resolveId(kilde) {
      return kilde === id ? '\0' + id : null;
    },
    load(lastId) {
      if (lastId !== '\0' + id) return null;
      if (!medTest) {
        return 'export const ekstraModuler = {}; export const ekstraBegreper = {}; export const ekstraRegelsett = {}; export const utvikling = false;';
      }
      return [
        `export const ekstraModuler = import.meta.glob('/tests/fixtures/moduler/*/index.ts', { eager: true, import: 'manifest' });`,
        `export const ekstraBegreper = import.meta.glob('/tests/fixtures/innhold/begreper/*.yaml', { import: 'default' });`,
        `export const ekstraRegelsett = import.meta.glob('/tests/fixtures/regler/*.yaml', { eager: true, import: 'default' });`,
        `export const utvikling = true;`,
      ].join('\n');
    },
  };
}

/**
 * Rollen til hver fagkode i tilbudene (ordinært fag, alternativ eller vurderingskode), regnet ut fra fagindeksen og
 * fag- og timefordelingen som gjelder når appen bygges (avgjørelse 031), og titlene på læreplanene. Appen laster modulen når fagsøket trenger
 * den. Rollene følger dataene hver gang appen bygges, uten en egen fil i data/.
 */
export function fagrollerPlugin(rot: string): Plugin {
  const id = 'virtual:fagroller';
  return {
    name: 'fuskelappen:fagroller',
    resolveId(kilde) {
      return kilde === id ? '\0' + id : null;
    },
    load(lastId) {
      if (lastId !== '\0' + id) return null;
      const indeks = lesFagindeks(rot);
      const fordeling = lesFordeling(rot);
      const roller = Object.fromEntries([...beregnFagroller(indeks, fordeling)].sort(([a], [b]) => a.localeCompare(b)));
      // Titlene på læreplanene, til grupperingen i fagsøket. «Læreplan i fremmedspråk» → «Fremmedspråk».
      const planer = join(rot, 'data/grep/laereplaner');
      const titler: Record<string, string> = {};
      if (existsSync(planer)) {
        for (const f of readdirSync(planer).filter((x) => x.endsWith('.json')).sort()) {
          const lp = JSON.parse(readFileSync(join(planer, f), 'utf8')) as { kode: string; tittel: string; spraak: string };
          // Titler på samisk brukes ikke som gruppenavn. Da brukes det fagnavnene har felles.
          if (lp.spraak !== 'nob' && lp.spraak !== 'nno') continue;
          const t = lp.tittel.replace(/^(læreplan|læreplanen)\s+i\s+/i, '');
          titler[lp.kode] = t.charAt(0).toUpperCase() + t.slice(1);
        }
      }
      return `export default ${JSON.stringify(roller)};\nexport const laereplaner = ${JSON.stringify(titler)};`;
    },
  };
}

const lesFagindeks = (rot: string) => JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')) as Fagindeks;

/** Fag- og timefordelingen (Udir-1) som gjelder når appen bygges. */
function lesFordeling(rot: string): Fagfordeling | null {
  const mappe = join(rot, 'data/udir');
  const fordelinger = existsSync(mappe)
    ? readdirSync(mappe)
        .filter((f) => /^fagfordeling-\d{4}-\d{4}\.json$/.test(f))
        .map((f) => JSON.parse(readFileSync(join(mappe, f), 'utf8')) as Fagfordeling)
    : [];
  return velgFordeling(fordelinger, new Date().toISOString().slice(0, 10));
}

/**
 * Tilbudene i videregående til modulen Opplæringsløp (pakke 5, avgjørelse 035): programmene med inngang, og hvert
 * programområde med fag, timer og plasser etter rundskrivet Udir-1. Regnes ut når appen bygges, fordi det tar om
 * lag ett sekund. Appen laster modulen når brukeren åpner Opplæringsløp eller et fagark.
 */
export function tilbudPlugin(rot: string): Plugin {
  const id = 'virtual:tilbud';
  return {
    name: 'fuskelappen:tilbud',
    resolveId(kilde) {
      return kilde === id ? '\0' + id : null;
    },
    load(lastId) {
      if (lastId !== '\0' + id) return null;
      const indeks = lesFagindeks(rot);
      const fordeling = lesFordeling(rot);
      const relasjoner = join(rot, 'data/vigo/fagrelasjoner.json');
      const fagBygger = existsSync(relasjoner) ? (JSON.parse(readFileSync(relasjoner, 'utf8')) as Fagrelasjoner).byggerPaa : {};
      const tilbud: Record<string, unknown> = {};
      for (const kode of Object.keys(indeks.programomrader).sort()) {
        // Programområdet står i fagindeksen, som appen har fra før.
        const resten: Record<string, unknown> = { ...byggTilbud(kode, indeks, fordeling, fagBygger) };
        delete resten.programomrade;
        tilbud[kode] = resten;
      }
      const data = { skolear: fordeling?.skolear ?? null, struktur: byggStruktur(indeks), tilbud };
      return `export default ${JSON.stringify(data)};`;
    },
  };
}

/**
 * Serverer og publiserer data/ (kildestatus, skoler, læreplaner fra Grep) og den ferdigbygde
 * søkeindeksen. Filene hentes av appen som egne statiske filer.
 */
export function dataPlugin(rot: string, mode: string): Plugin {
  const filer: Record<string, string> = {
    'data/status/kildestatus.json': join(rot, 'data/status/kildestatus.json'),
    'data/skoler/vgs.json': join(rot, 'data/skoler/vgs.json'),
    'sok/indeks.json': join(rot, `.generert/sokeindeks-${mode}.json`),
  };
  // Én fil per læreplan (avgjørelse 022). Lastes når brukeren åpner et fag.
  const planer = join(rot, 'data/grep/laereplaner');
  if (existsSync(planer)) {
    for (const f of readdirSync(planer)) if (f.endsWith('.json')) filer[`data/grep/laereplaner/${f}`] = join(planer, f);
  }
  let base = '/';
  return {
    name: 'fuskelappen:data',
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0] ?? '';
        const rel = url.startsWith(base) ? url.slice(base.length) : null;
        const fil = rel === null ? undefined : filer[rel];
        if (fil === undefined || !existsSync(fil)) return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(readFileSync(fil));
      });
    },
    generateBundle() {
      for (const [navn, fil] of Object.entries(filer)) {
        if (!existsSync(fil)) {
          if (navn === 'sok/indeks.json') this.error(`Søkeindeksen mangler (${fil}). Kjør scripts/bygg-sokeindeks.ts først.`);
          this.warn(`Mangler ${fil}`);
          continue;
        }
        this.emitFile({ type: 'asset', fileName: navn, source: readFileSync(fil) });
      }
    },
  };
}
