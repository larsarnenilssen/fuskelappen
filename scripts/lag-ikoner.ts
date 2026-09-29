// Lager alle ikonstørrelser fra én kildefil: ikon/ikon.svg.
// Bytt ikon: legg inn ny ikon.svg (kvadratisk, motivet innenfor midtre 80 %) og kjør «npm run lag:ikoner».
// Filnavnene er faste, så manifest, index.html og kode trenger ingen endring.
// Logoen i topplinjen (logo.svg) er ikonet uten elementet med id="bakgrunn", beskåret til motivet.
// Har ikonet ikke noe slikt element, brukes ikonet som det er.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const rot = fileURLToPath(new URL('..', import.meta.url));
const kilde = join(rot, 'ikon/ikon.svg');
const ut = join(rot, 'public/ikoner');

export const ikonfiler = [
  { fil: 'ikon-192.png', storrelse: 192 },
  { fil: 'ikon-512.png', storrelse: 512 },
  { fil: 'ikon-maskable-512.png', storrelse: 512 },
  { fil: 'apple-touch-icon.png', storrelse: 180 },
  { fil: 'favicon-32.png', storrelse: 32 },
] as const;

const svg = readFileSync(kilde, 'utf8');
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

mkdirSync(ut, { recursive: true });
const nettleser = await chromium.launch();
try {
  for (const { fil, storrelse } of ikonfiler) {
    const side = await nettleser.newPage({ viewport: { width: storrelse, height: storrelse }, deviceScaleFactor: 1 });
    await side.setContent(
      `<html><body style="margin:0"><img src="${dataUrl}" width="${storrelse}" height="${storrelse}" style="display:block"></body></html>`,
    );
    await side.waitForLoadState('load');
    await side.screenshot({ path: join(ut, fil), clip: { x: 0, y: 0, width: storrelse, height: storrelse } });
    await side.close();
    console.log(`Laget ${fil}`);
  }

  // Logo: fjern bakgrunnen og beskjær til motivet, med litt luft rundt.
  const logoSide = await nettleser.newPage();
  await logoSide.setContent(`<html><body>${svg}</body></html>`);
  const logo = await logoSide.evaluate(() => {
    const rotSvg = document.querySelector('svg');
    const bakgrunn = rotSvg?.querySelector('#bakgrunn');
    if (!rotSvg || !bakgrunn) return null;
    bakgrunn.remove();
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const el of Array.from(rotSvg.querySelectorAll<SVGGraphicsElement>('rect, path, circle, ellipse, polygon, polyline, line, text, image, use'))) {
      const b = el.getBBox();
      x1 = Math.min(x1, b.x);
      y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.width);
      y2 = Math.max(y2, b.y + b.height);
    }
    const side = Math.max(x2 - x1, y2 - y1) * 1.06;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    rotSvg.setAttribute('viewBox', [cx - side / 2, cy - side / 2, side, side].map((v) => Math.round(v)).join(' '));
    return rotSvg.outerHTML;
  });
  await logoSide.close();
  if (logo) {
    writeFileSync(join(ut, 'logo.svg'), `${logo}\n`);
    console.log('Laget logo.svg (uten bakgrunn)');
  } else {
    copyFileSync(kilde, join(ut, 'logo.svg'));
    console.log('Fant ikke id="bakgrunn" i ikonet. logo.svg er en kopi av ikonet.');
  }
} finally {
  await nettleser.close();
}
copyFileSync(kilde, join(ut, 'favicon.svg'));
console.log('Kopierte favicon.svg');
