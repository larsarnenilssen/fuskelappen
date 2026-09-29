// Lager alle ikonstørrelser fra én kildefil: ikon/ikon.svg.
// Bytt ikon: legg inn ny ikon.svg (kvadratisk, motivet innenfor midtre 80 %) og kjør «npm run lag:ikoner».
// Filnavnene er faste, så manifest, index.html og kode trenger ingen endring.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
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
} finally {
  await nettleser.close();
}
copyFileSync(kilde, join(ut, 'favicon.svg'));
console.log('Kopierte favicon.svg');
