// Appen skriver «skule», ikke «skole», på nynorsk (eier 09.10.2026). Sjekker de egne nynorske tekstene i content
// (`nn`-feltene) og rules. Kildetekst (`kildetekst`, `sitat`, `punkt`) står i egne felt og sjekkes ikke. Lenkeord
// (lister under `nn`) har begge formene med vilje, så tekst med «skole» også lenkes. Lenkemål, adresser og
// plassholdere ({skolear}) hoppes over. content/versjoner.yaml er meldingene om tidligere versjoner og endres ikke.
// UI-tekstene i src/strings sjekkes ikke ennå.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { isScalar, LineCounter, parseDocument, visit } from 'yaml';
import { describe, expect, it } from 'vitest';

const rot = join(__dirname, '../..');

function filer(mappe: string): string[] {
  return readdirSync(mappe).flatMap((navn) => {
    const sti = join(mappe, navn);
    if (statSync(sti).isDirectory()) return filer(sti);
    return navn.endsWith('.yaml') ? [sti] : [];
  });
}

const utelatFiler = new Set(['content/versjoner.yaml']);

/** Egennavn og navn på lover og dokumenter som har «skole» også på nynorsk (en del av ordet, små bokstaver). */
const unntak = ['privatskolelov', 'privatskoleforskrift', 'skoleporten', 'skolelederforbundet', 'skoleregister'];

/** Ordene med «skole» eller «skolar» i en nynorsk tekst, uten lenkemål, adresser og plassholdere. */
function skoleord(tekst: string): string[] {
  const vasket = tekst
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/(https?:\/\/|#\/)\S*/g, '')
    .replace(/\{[^}]*\}/g, '');
  return [...vasket.matchAll(/[\p{L}-]*[sS]kol[ea][\p{L}-]*/gu)]
    .map(([ord]) => ord)
    .filter((ord) => !unntak.some((u) => ord.toLowerCase().includes(u)));
}

function brudd(): string[] {
  const funn: string[] = [];
  for (const sti of [...filer(join(rot, 'content')), ...filer(join(rot, 'rules'))]) {
    const fil = relative(rot, sti);
    if (utelatFiler.has(fil)) continue;
    const kilde = readFileSync(sti, 'utf8');
    const linjer = new LineCounter();
    visit(parseDocument(kilde, { lineCounter: linjer }), {
      Pair(_, par) {
        if (!isScalar(par.key) || par.key.value !== 'nn' || !isScalar(par.value)) return;
        const verdi = par.value;
        if (typeof verdi.value !== 'string' || !verdi.range) return;
        for (const ord of skoleord(verdi.value)) funn.push(`${fil}:${linjer.linePos(verdi.range[0]).line}: «${ord}»`);
      },
    });
  }
  return funn;
}

describe('nynorsk: «skule»', () => {
  it('kjenner igjen «skole» og hopper over egennavn, lenker og plassholdere', () => {
    expect(skoleord('Skolen og grunnskolen i skoleåret')).toEqual(['Skolen', 'grunnskolen', 'skoleåret']);
    expect(skoleord('privatskolar etter privatskolelova')).toEqual(['privatskolar']);
    expect(skoleord('Sjå [Skulereglar](#/skolemiljo/skoleregler) og Skoleporten.')).toEqual([]);
    expect(skoleord('Skulerute {skolear} i {sted}')).toEqual([]);
  });

  it('de nynorske tekstene i content og rules skriver «skule»', () => {
    expect(brudd()).toEqual([]);
  }, 30_000);
});
