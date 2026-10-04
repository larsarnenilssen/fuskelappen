// npm run test:e2e:berorte: kjører bare ende-til-ende-testene som berøres av endringene på grenen, i WebKit mobil
// (avgjørelse 055). Endringene er alt som skiller grenen fra origin/main, også det som ikke er committet. Hele suiten
// kjøres i CI. Valg: --alle-prosjekter kjører alle fire prosjektene, --vis viser bare utvalget.
import { execFileSync, spawnSync } from 'node:child_process';
import { grepFor, velgTester } from './velg.ts';

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();

function endredeFiler(): string[] {
  let base: string;
  try {
    base = git('merge-base', 'HEAD', 'origin/main');
  } catch {
    // Uten origin/main sammenlignes det med HEAD, altså bare det som ikke er committet.
    base = 'HEAD';
  }
  const filer = [
    ...git('diff', '--name-only', base).split('\n'),
    ...git('ls-files', '--others', '--exclude-standard').split('\n'),
  ].filter(Boolean);
  return [...new Set(filer)];
}

const args = process.argv.slice(2);
const utvalg = velgTester(endredeFiler());
const grep = grepFor(utvalg);

console.log('Berørte ende-til-ende-tester:');
for (const g of utvalg.grunner) console.log(`  ${g}`);
console.log(`  Spesifikasjoner: ${utvalg.speker.join(', ') || 'ingen'}`);
console.log(`  Overflyt for: ${utvalg.ruter === 'alle' ? 'alle rutene' : utvalg.ruter.join(', ') || 'ingen ruter'}`);

if (!grep) {
  console.log('Ingen endringer som berører appen i nettleseren. Hele suiten kjøres i CI.');
  process.exit(0);
}
if (args.includes('--vis')) process.exit(0);

const prosjekter = args.includes('--alle-prosjekter') ? [] : ['--project=webkit-mobil'];
const resten = args.filter((a) => a !== '--alle-prosjekter');
const svar = spawnSync('npx', ['playwright', 'test', ...prosjekter, '--grep', grep, ...resten], { stdio: 'inherit' });
process.exit(svar.status ?? 1);
