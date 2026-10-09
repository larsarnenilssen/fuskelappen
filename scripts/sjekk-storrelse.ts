// Sjekker at startpakken (det index.html laster med en gang) er under grensen i DRIFT.md («Grenser»).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const GRENSE_KB = 150;
const rot = fileURLToPath(new URL('..', import.meta.url));
const mappe = join(rot, process.argv[2] ?? 'dist');
const html = readFileSync(join(mappe, 'index.html'), 'utf8');
const filer = [...html.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css))"/g)].map((m) => (m[1] ?? '').replace(/^[a-z-]+\/(?=assets\/)/, ''));

let sum = gzipSync(html).length;
for (const fil of new Set(filer)) {
  const storrelse = gzipSync(readFileSync(join(mappe, fil))).length;
  sum += storrelse;
  console.log(`${(storrelse / 1024).toFixed(1).padStart(7)} kB  ${fil}`);
}
// Tekstene for én målform lastes også ved oppstart (avgjørelse 083). Den største av de to regnes med.
const tekstbiter = readdirSync(join(mappe, 'assets'))
  .filter((f) => /^n[bn]-[\w-]+\.js$/.test(f))
  .map((f) => ({ fil: `assets/${f}`, storrelse: gzipSync(readFileSync(join(mappe, 'assets', f))).length }));
if (tekstbiter.length !== 2) {
  console.error(`Fant ${tekstbiter.length} tekstbiter for målformene, ventet 2 (nb og nn).`);
  process.exit(1);
}
const storst = tekstbiter.reduce((a, b) => (b.storrelse > a.storrelse ? b : a));
sum += storst.storrelse;
console.log(`${(storst.storrelse / 1024).toFixed(1).padStart(7)} kB  ${storst.fil} (tekstene, den største målformen)`);
const kb = sum / 1024;
console.log(`Startpakke: ${kb.toFixed(1)} kB gzip (grense ${GRENSE_KB} kB)`);
if (kb > GRENSE_KB) {
  console.error('Startpakken er for stor.');
  process.exit(1);
}
