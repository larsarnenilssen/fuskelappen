import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [w, h] of [[390, 844], [320, 700], [1366, 900]]) {
  const s = await b.newPage({ viewport: { width: w, height: h } });
  await s.addInitScript((d) => localStorage.setItem('jukselappen', JSON.stringify(d)), { skjemaversjon: 3, innstillinger: { malform: 'nn', tema: 'lys', fylke: '46', skole: { id: '816031982', navn: 'Voss gymnas' } }, favoritter: [], scenarier: {}, skjultKildevarsel: null, forside: { rekkefolge: [], lukket: [], bareFavoritter: false, apnet: ['panel'], visning: 'jukselapp', jukselapp: true, jukselappVist: '2026-10-08' } });
  await s.goto('http://localhost:5173/jukselappen/#/');
  await s.waitForTimeout(2500);
  const hoyder = [];
  let maks = { h: 0, id: '' };
  for (let i = 0; i < 60; i++) {
    const r = await s.evaluate(() => { const p = document.querySelector('.jl-panel'); return { h: p?.getBoundingClientRect().height ?? 0, id: p?.getAttribute('data-faktum') ?? '' }; });
    hoyder.push(Math.round(r.h));
    if (r.h > maks.h) maks = r;
    await s.getByRole('button', { name: 'Ny jukselapp' }).click();
    await s.waitForTimeout(250);
  }
  const over = hoyder.filter((x) => x > 270).length;
  console.log(w, 'maks', Math.round(maks.h), maks.id, 'over 270:', over, 'av', hoyder.length);
  await s.close();
}
await b.close();
