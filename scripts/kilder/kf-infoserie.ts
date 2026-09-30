// Sjekkmetode «kf-infoserie»: avtaletekster hos KF Infoserie (f.eks. SFS 2213). Siden er en JavaScript-app, så
// teksten hentes med Chromium via Playwright (finnes allerede for ende-til-ende-testene). Appen laster dokumentet
// fra et eget API-kall (Documents/LocalPrimaryVariant); det svaret brukes, normalisert, til fingeravtrykket.
// Metadata (versjon og gyldighet) tas med i rapporten. Se docs/avgjorelser/008.
import type { Kilde } from '../../src/core/innhold/skjema.ts';
import { lagFingeravtrykk, normaliserTekst } from './logikk.ts';
import { USER_AGENT } from './metoder.ts';
import { parse } from 'node-html-parser';

export interface KfResultat {
  fingeravtrykk: string;
  tittel: string | null;
  versjon: string | null;
  gyldig: string | null;
  tegn: number;
  /** Den normaliserte teksten, til verdisjekken. */
  tekst: string;
  /** Dokumentet som HTML, til sjekken av tabeller (vedlegg 1). */
  html: string;
}

/** Normalisert tekst fra dokumentets HTML. Ren funksjon, testes i tests/unit/kildejobb.test.ts. */
export function kfTekst(html: string): string {
  const rot = parse(html);
  for (const el of rot.querySelectorAll('script, style, noscript, template')) el.remove();
  return normaliserTekst(rot.structuredText);
}

export async function sjekkKfInfoserie(kilde: Kilde): Promise<KfResultat> {
  const { chromium, request } = await import('@playwright/test');
  const nettleser = await chromium.launch();
  try {
    const kontekst = await nettleser.newContext({ userAgent: `Mozilla/5.0 ${USER_AGENT}` });
    // I utviklingsmiljøer bak en proxy som Chromium ikke stoler på, går trafikken via Playwrights
    // HTTP-klient, som bruker Nodes sertifikater. I GitHub Actions er dette ikke satt.
    const proxy = process.env.HTTPS_PROXY;
    if (proxy) {
      const klient = await request.newContext({ proxy: { server: proxy } });
      await kontekst.route('**/*', async (rute) => rute.fulfill({ response: await klient.fetch(rute.request(), { failOnStatusCode: false }) }));
    }
    const side = await kontekst.newPage();
    let metadata: Record<string, unknown> | null = null;
    side.on('response', async (svar) => {
      if (/\/Documents\/FieldSetValues\(DefaultPortalFields\)\//.test(svar.url()) && svar.ok()) {
        const data = (await svar.json().catch(() => null)) as Record<string, unknown> | null;
        if (data && data.status === 'Effective') metadata = data;
      }
    });
    const dokument = side.waitForResponse((s) => /\/Documents\/LocalPrimaryVariant\//.test(s.url()) && s.ok(), { timeout: 120_000 });
    await side.goto(kilde.url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    const html = await (await dokument).text();
    const tekst = kfTekst(html);
    if (tekst.length < 1000) throw new Error(`Dokumentet var uventet kort (${tekst.length} tegn). Siden kan ha fått ny struktur.`);
    await side.waitForTimeout(1000);
    const m = metadata as Record<string, unknown> | null;
    const dato = (v: unknown) => (typeof v === 'string' ? v.slice(0, 10) : '?');
    return {
      fingeravtrykk: lagFingeravtrykk(tekst),
      tittel: m && typeof m.title === 'string' ? m.title : null,
      versjon: m ? String(m.DocumentRevisionNumber ?? '') || null : null,
      gyldig: m ? `${dato(m.date_effect)}–${dato(m.date_expired)}` : null,
      tegn: tekst.length,
      tekst,
      html,
    };
  } finally {
    await nettleser.close();
  }
}
