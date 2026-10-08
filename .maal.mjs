import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [w, h] of [[390, 844], [320, 700], [1366, 900]]) {
  const ut = [];
  for (const v of ['neste', 'nyheter', 'itall', 'jukselapp']) {
    const s = await b.newPage({ viewport: { width: w, height: h } });
    await s.addInitScript((d) => localStorage.setItem('jukselappen', JSON.stringify(d)), { skjemaversjon: 3, innstillinger: { malform: 'nb', tema: 'lys', fylke: '46', skole: null }, favoritter: [], scenarier: {}, skjultKildevarsel: null, forside: { rekkefolge: [], lukket: [], bareFavoritter: false, apnet: ['panel'], visning: v, jukselapp: true, jukselappVist: '2026-10-08' } });
    await s.goto('http://localhost:5173/jukselappen/#/');
    await s.waitForTimeout(2500);
    const boks = await s.evaluate(() => { const p = document.querySelector('[data-gruppe="panel"] .gruppe-innhold-indre'); const f = p?.firstElementChild; return [p?.getBoundingClientRect().height, f?.className, f?.getBoundingClientRect().height]; });
    ut.push(`${v}: ${JSON.stringify(boks)}`);
    await s.close();
  }
  console.log(w, ut.join(' | '));
}
await b.close();
