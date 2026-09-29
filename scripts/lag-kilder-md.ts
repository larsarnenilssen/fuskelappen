// Genererer docs/KILDER.md fra content/kilder.yaml. Kjør: npm run kilder:dokumenter
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Kilderegister } from '../src/core/innhold/skjema.ts';
import { lesFil } from './innhold/last.ts';

export function lagKilderMd(register: Kilderegister): string {
  const rader = register.kilder.map((k) => {
    const niva = k.niva === 'nasjonal' ? 'nasjonal' : `${k.niva} (${k.fylke ?? ''})`;
    const faser = k.faser.length > 0 ? k.faser.join(', ') : '–';
    const sjekk = k.sjekkmetode === 'ingen' ? 'ingen' : `${k.sjekkmetode}${k.aktiv ? '' : ' (ikke aktiv)'}`;
    return `| [${k.navn}](${k.url}) | ${k.utgiver} | ${niva} | ${k.type} | ${k.lisens} | ${sjekk} | ${faser} |`;
  });
  const merknader = register.kilder.filter((k) => k.merknad).map((k) => `- **${k.id}:** ${k.merknad?.trim()}`);
  return [
    '# Kilder',
    '',
    '<!-- Generert fra content/kilder.yaml med `npm run kilder:dokumenter`. Ikke rediger for hånd. -->',
    '',
    'Kildene appen bygger på. Kildejobben (`.github/workflows/kilder.yml`) sjekker de aktive kildene hver uke og varsler eier ved endring eller feil. Se `docs/ARKITEKTUR.md`.',
    '',
    '| Kilde | Utgiver | Nivå | Type | Lisens | Sjekk | Faser |',
    '|---|---|---|---|---|---|---|',
    ...rader,
    '',
    ...(merknader.length > 0 ? ['## Merknader', '', ...merknader, ''] : []),
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rot = fileURLToPath(new URL('..', import.meta.url));
  const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
  writeFileSync(join(rot, 'docs/KILDER.md'), lagKilderMd(register));
  console.log('Skrev docs/KILDER.md');
}
