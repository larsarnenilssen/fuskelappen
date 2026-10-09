// Lager oversikten over avgjørelsene, docs/avgjorelser/README.md, fra notatene i samme mappe (avgjørelse 105).
// En test sjekker at oversikten er oppdatert. Kjør: npm run avgjorelser
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const AVGJORELSER = 'docs/avgjorelser';
export const OVERSIKT = 'README.md';

export interface Notat {
  fil: string;
  tekst: string;
}

export interface Avgjorelse {
  nummer: string;
  tittel: string;
  fil: string;
  status: 'gjeldende' | 'endret' | 'erstattet';
  /** Avgjørelsene som har endret eller erstattet denne. */
  av: string[];
}

/** Numrene i «avgjørelse 056», «avgjørelse 080 og 090» og «avgjørelsene 045, 058 og 065». */
function numre(linje: string): string[] {
  const funnet: string[] = [];
  for (const m of linje.matchAll(/avgjørelse(?:ne)?\s+(\d{3}(?:(?:,\s*|\s+og\s+)\d{3})*)/giu)) {
    funnet.push(...((m[1] ?? '').match(/\d{3}/g) ?? []));
  }
  return funnet;
}

/**
 * Status for ett notat:
 * - erstattet: en linje begynner med «**Erstattet av avgjørelse NNN**».
 * - endret: en linje begynner med «**Endret …**», eller en del er «(Erstattet i avgjørelse NNN …)».
 * - gjeldende: ellers.
 */
export function lesAvgjorelse({ fil, tekst }: Notat): Avgjorelse {
  const linjer = tekst.split('\n').map((l) => l.replace(/\r$/, ''));
  const overskrift = /^# (\d{3}) – (.+)$/.exec(linjer[0] ?? '');
  const nummer = fil.slice(0, 3);
  if (!overskrift || overskrift[1] !== nummer) throw new Error(`${fil}: første linje skal være «# ${nummer} – Tittel»`);
  const tittel = (overskrift[2] ?? '').trim();
  const andre = (liste: string[]) => [...new Set(liste)].filter((n) => n !== nummer).sort();

  const erstattet = linjer.filter((l) => /^\*\*Erstattet av avgjørelse \d{3}/.test(l));
  if (erstattet.length > 0) return { nummer, tittel, fil, status: 'erstattet', av: andre(erstattet.flatMap(numre)) };

  const endret = linjer.filter((l) => l.startsWith('**Endret') || /\(Erstattet i avgjørelse \d{3}/.test(l));
  if (endret.length > 0) return { nummer, tittel, fil, status: 'endret', av: andre(endret.flatMap(numre)) };

  return { nummer, tittel, fil, status: 'gjeldende', av: [] };
}

/** Notatene i mappen, sortert på nummer. Oversikten selv er ikke med. */
export function lesNotater(rot: string): Notat[] {
  const mappe = join(rot, AVGJORELSER);
  return readdirSync(mappe)
    .filter((f) => /^\d{3}-.+\.md$/.test(f))
    .sort()
    .map((fil) => ({ fil, tekst: readFileSync(join(mappe, fil), 'utf8') }));
}

function statustekst(a: Avgjorelse): string {
  if (a.status === 'gjeldende' || a.av.length === 0) return a.status;
  return `${a.status} av ${a.av.join(', ')}`;
}

export function lagAvgjorelserMd(notater: readonly Notat[]): string {
  const avgjorelser = notater.map(lesAvgjorelse);
  const rader = avgjorelser.map((a) => `| ${a.nummer} | [${a.tittel.replace(/\|/g, '\\|')}](${a.fil}) | ${statustekst(a)} |`);
  const antall = (s: Avgjorelse['status']) => avgjorelser.filter((a) => a.status === s).length;
  return [
    '# Avgjørelser',
    '',
    '<!-- Generert fra notatene i denne mappen med `npm run avgjorelser`. Ikke rediger for hånd. -->',
    '',
    'Korte notater om valg av betydning: kontekst, valg og konsekvens. Et nytt notat får neste ledige nummer (`NNN-tittel.md`), og første linje er `# NNN – Tittel`. Endres noe et eldre notat sier, får det eldre en linje nederst: `**Endret dd.mm.åååå:** … (avgjørelse NNN)`. Er hele notatet erstattet, står det øverst: `**Erstattet av avgjørelse NNN**`. Kjør `npm run avgjorelser` etterpå, ellers feiler testene.',
    '',
    'Status:',
    '',
    '- **gjeldende:** notatet gjelder slik det står.',
    '- **endret:** notatet har minst én linje «**Endret …**» nederst, eller en del som sier «(Erstattet i avgjørelse NNN …)». Avgjørelsene disse linjene viser til, står etter «av». Det som står nederst, gjelder foran det over.',
    '- **erstattet:** notatet gjelder ikke lenger. Se avgjørelsen som erstattet det.',
    '',
    `${avgjorelser.length} avgjørelser: ${antall('gjeldende')} gjeldende, ${antall('endret')} endret og ${antall('erstattet')} erstattet.`,
    '',
    '| Nr. | Avgjørelse | Status |',
    '|---|---|---|',
    ...rader,
    '',
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rot = fileURLToPath(new URL('..', import.meta.url));
  writeFileSync(join(rot, AVGJORELSER, OVERSIKT), lagAvgjorelserMd(lesNotater(rot)));
  console.log(`Skrev ${AVGJORELSER}/${OVERSIKT}`);
}
