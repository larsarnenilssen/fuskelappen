// Reserve for sjekkmetoden «side»: henter en side med Chromium via Playwright når Nodes fetch ikke kommer fram
// (kildesjekken 04.10.2026: vestlandfylke.no brøt tilkoblingen fra GitHub Actions etter 0,25 s med «fetch failed»).
// Hypotesen er at nettstedet avviser klienter som ikke ser ut som en nettleser (TLS-avtrykk eller manglende
// mellomsertifikat, som nettlesere henter selv). Chromium er allerede installert for KF Infoserie og testene.
import { USER_AGENT } from './metoder.ts';

/** Sidens HTML slik Chromium ser den etter innlasting. */
export async function hentMedNettleser(url: string): Promise<string> {
  const { chromium, request } = await import('@playwright/test');
  const nettleser = await chromium.launch();
  try {
    const kontekst = await nettleser.newContext({ userAgent: `Mozilla/5.0 ${USER_AGENT}`, locale: 'nb-NO' });
    // Bak en proxy som Chromium ikke stoler på (utviklingsmiljøer), går trafikken via Playwrights HTTP-klient,
    // som i kf-infoserie.ts. I GitHub Actions er dette ikke satt.
    const proxy = process.env.HTTPS_PROXY;
    if (proxy) {
      const klient = await request.newContext({ proxy: { server: proxy } });
      await kontekst.route('**/*', async (rute) => {
        // En feil her må ikke stoppe hele kildesjekken. Forespørselen avbrytes, så goto feiler for denne kilden.
        try {
          await rute.fulfill({ response: await klient.fetch(rute.request(), { failOnStatusCode: false }) });
        } catch {
          await rute.abort('connectionreset').catch(() => undefined);
        }
      });
    }
    const side = await kontekst.newPage();
    const svar = await side.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (!svar) throw new Error(`${url} ga ikke noe svar i nettleseren`);
    if (!svar.ok()) throw new Error(`${url} svarte ${svar.status()} i nettleseren`);
    return await side.content();
  } finally {
    await nettleser.close();
  }
}
