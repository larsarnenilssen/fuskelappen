// Bygger søkeindeksen fra modulregisteret før publisering.
// Registeret lastes gjennom Vite, så det er nøyaktig det samme registeret som appen bruker.
// Bruk: tsx scripts/bygg-sokeindeks.ts [--mode e2e]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Synonymer } from '../src/core/innhold/skjema.ts';
import type * as Sokemodul from '../src/core/sok/sok.ts';
import type { Sokeoppforing } from '../src/core/sok/sok.ts';
import { lesFil } from './innhold/last.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const modusIndeks = process.argv.indexOf('--mode');
const mode = modusIndeks > -1 ? (process.argv[modusIndeks + 1] ?? 'production') : 'production';

const server = await createServer({
  root: rot,
  mode,
  configFile: join(rot, 'vite.config.ts'),
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  logLevel: 'warn',
});

try {
  // Søkeindeksen har begge målformene, så begge tekstbitene lastes først (avgjørelse 083).
  const tekst = (await server.ssrLoadModule('/src/core/i18n/tekst.ts')) as { lastAlleTekster: () => Promise<void> };
  await tekst.lastAlleTekster();
  const register = (await server.ssrLoadModule('/src/modules/register.ts')) as {
    samleSokeoppforinger: () => Promise<Sokeoppforing[]>;
  };
  const kjerne = (await server.ssrLoadModule('/src/app/kjerneoppforinger.ts')) as { kjerneoppforinger: () => Sokeoppforing[] };
  const sok = (await server.ssrLoadModule('/src/core/sok/sok.ts')) as typeof Sokemodul;
  const synonymer = lesFil(rot, join(rot, 'content/sok/synonymer.yaml')) as Synonymer;

  const oppforinger = [...kjerne.kjerneoppforinger(), ...(await register.samleSokeoppforinger())];
  const indeks = sok.byggIndeks(oppforinger, synonymer);
  mkdirSync(join(rot, '.generert'), { recursive: true });
  const fil = join(rot, `.generert/sokeindeks-${mode}.json`);
  writeFileSync(fil, sok.serialiser(indeks));
  console.log(`Søkeindeks (${mode}): ${oppforinger.length} oppføringer → ${fil}`);
} finally {
  await server.close();
}
