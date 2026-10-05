// Finner alle lenker i appen (avgjørelse 062): i innholdet og kilderegisteret (content/), i koden (src/), i de genererte
// dataene (data/) og fra lenkebyggerne. Reglene står i regler.ts. Rene funksjoner over filene i repoet.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { DATAFILER, IKKE_SJEKK, LENKEBYGGERE, type Lenketype } from './regler.ts';

export interface Lenke {
  url: string;
  type: Lenketype;
  /** Hvor lenken står: filene, eller lenkebyggeren. */
  brukt: string[];
}

const URL_MONSTER = /https?:\/\/[^\s"'<>`\])}]+/g;

/** Lenkene i en tekst, uten tegn som avslutter en setning. */
export function finnUrler(tekst: string): string[] {
  return [...tekst.matchAll(URL_MONSTER)].map((m) => m[0].replace(/[.,;:!?]+$/, '')).filter((u) => !u.includes('${'));
}

function filer(mappe: string, endelser: readonly string[]): string[] {
  if (!existsSync(mappe)) return [];
  return readdirSync(mappe).flatMap((n) => {
    const sti = join(mappe, n);
    if (statSync(sti).isDirectory()) return filer(sti, endelser);
    return endelser.some((e) => n.endsWith(e)) ? [sti] : [];
  });
}

const rel = (rot: string, fil: string) => relative(rot, fil).split(sep).join('/');

/**
 * Kodefilene som bygger eksterne lenker av data: en mal med https:// og ${…}, eller en konstant med en adresse som
 * brukes i en mal («`${NDLA}${f.sti}`»). Hver av dem må stå i LENKEBYGGERE.
 */
export function finnLenkebyggere(rot: string): string[] {
  return filer(join(rot, 'src'), ['.ts', '.tsx'])
    .filter((f) => {
      const tekst = readFileSync(f, 'utf8');
      if (/`[^`]*https?:\/\/[^`]*\$\{/.test(tekst)) return true;
      const konstanter = [...tekst.matchAll(/const ([A-Za-z_]\w*) = ['"]https?:\/\/[^'"]+['"]/g)].map((m) => m[1] as string);
      return konstanter.some((k) => tekst.includes(`\${${k}}`));
    })
    .map((f) => rel(rot, f));
}

/** Datafilene med lenker (utenom statusfilene og teksten fra Lovdata, som lenkebyggerne tar). */
export function finnDatafiler(rot: string): string[] {
  return filer(join(rot, 'data'), ['.json'])
    .map((f) => rel(rot, f))
    .filter((f) => !f.startsWith('data/status/') && !f.startsWith('data/lovdata/'))
    .filter((f) => finnUrler(readFileSync(join(rot, f), 'utf8')).length > 0);
}

/** Alle lenkene i appen, med typen og hvor de står. En lenke som står både fast og i data, sjekkes hver gang. */
export function samleLenker(rot: string): Lenke[] {
  const lenker = new Map<string, Lenke>();
  const legg = (url: string, type: Lenketype, brukt: string) => {
    if (IKKE_SJEKK.some((r) => r.test(url))) return;
    const l = lenker.get(url) ?? { url, type, brukt: [] };
    if (type === 'fast') l.type = 'fast';
    if (!l.brukt.includes(brukt)) l.brukt.push(brukt);
    lenker.set(url, l);
  };
  for (const f of [...filer(join(rot, 'content'), ['.yaml']), ...filer(join(rot, 'src'), ['.ts', '.tsx'])]) {
    for (const url of finnUrler(readFileSync(f, 'utf8'))) legg(url, 'fast', rel(rot, f));
  }
  for (const f of finnDatafiler(rot)) {
    const regel = DATAFILER.find((r) => r.fil.test(f));
    if (!regel) throw new Error(`${f} har lenker, men står ikke i DATAFILER i scripts/lenker/regler.ts.`);
    for (const url of finnUrler(readFileSync(join(rot, f), 'utf8'))) legg(url, regel.type, f);
  }
  for (const b of LENKEBYGGERE) for (const url of b.lenker(rot)) legg(url, 'stikkprove', b.navn);
  return [...lenker.values()].sort((a, b) => a.url.localeCompare(b.url));
}
