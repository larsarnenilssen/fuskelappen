// Lokale Vite-plugins: innhold (YAML), tokenfarger, testoppsett og data.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { Innholdsfeil, lesFil } from '../innhold/last.ts';

/** Gjør YAML under content/, rules/ og testdata om til validerte moduler. */
export function innholdPlugin(rot: string): Plugin {
  return {
    name: 'protokollen:innhold',
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
    name: 'protokollen:html',
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
    name: 'protokollen:testoppsett',
    resolveId(kilde) {
      return kilde === id ? '\0' + id : null;
    },
    load(lastId) {
      if (lastId !== '\0' + id) return null;
      if (!medTest) {
        return 'export const ekstraModuler = {}; export const ekstraBegreper = {}; export const utvikling = false;';
      }
      return [
        `export const ekstraModuler = import.meta.glob('/tests/fixtures/moduler/*/index.ts', { eager: true, import: 'manifest' });`,
        `export const ekstraBegreper = import.meta.glob('/tests/fixtures/innhold/begreper/*.yaml', { import: 'default' });`,
        `export const utvikling = true;`,
      ].join('\n');
    },
  };
}

/**
 * Serverer og publiserer data/ (kildestatus, skoler) og den ferdigbygde
 * søkeindeksen. Filene hentes av appen som egne statiske filer.
 */
export function dataPlugin(rot: string, mode: string): Plugin {
  const filer: Record<string, string> = {
    'data/status/kildestatus.json': join(rot, 'data/status/kildestatus.json'),
    'data/skoler/vgs.json': join(rot, 'data/skoler/vgs.json'),
    'sok/indeks.json': join(rot, `.generert/sokeindeks-${mode}.json`),
  };
  let base = '/';
  return {
    name: 'protokollen:data',
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
