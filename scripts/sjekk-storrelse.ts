// Sjekker at startpakken (det index.html laster med en gang) er under grensen i OPPDRAG.md.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const GRENSE_KB = 150;
const rot = fileURLToPath(new URL('..', import.meta.url));
const mappe = join(rot, process.argv[2] ?? 'dist');
const html = readFileSync(join(mappe, 'index.html'), 'utf8');
const filer = [...html.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css))"/g)].map((m) => (m[1] ?? '').replace(/^protokollen\//, ''));

let sum = gzipSync(html).length;
for (const fil of new Set(filer)) {
  const storrelse = gzipSync(readFileSync(join(mappe, fil))).length;
  sum += storrelse;
  console.log(`${(storrelse / 1024).toFixed(1).padStart(7)} kB  ${fil}`);
}
const kb = sum / 1024;
console.log(`Startpakke: ${kb.toFixed(1)} kB gzip (grense ${GRENSE_KB} kB)`);
if (kb > GRENSE_KB) {
  console.error('Startpakken er for stor.');
  process.exit(1);
}
