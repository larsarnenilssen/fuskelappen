// Sjekk av tabeller rad for rad mot kilden: vedlegg 1 til SFS 2213 (årsrammene i videregående) fra
// dokumentet hos KF Infoserie, og garantilønnen fra teksten i hovedtariffavtalen. Ren logikk, testes i
// tests/unit/tabeller.test.ts (avgjørelse 018).
import { parse } from 'node-html-parser';
import type { Tabellrad } from '../../src/core/regler/skjema.ts';
import { lesTall, normaliserTekst, TALL } from '../../src/core/kontroll/tekst.ts';

function antallRader(n: number): string {
  return n === 1 ? '1 rad' : `${n} rader`;
}

export interface Tabellresultat {
  status: 'samsvarer' | 'avvik';
  melding: string | null;
  /** Én linje per rad som ikke stemmer. */
  detaljer: string[];
}

// ---------- Vedlegg 1 ----------

export interface Vedleggsrad {
  t60: number;
  t45: number;
  kategori: string;
  fag: string | null;
  program: string;
  trinn: string;
  stjerne: boolean;
}

/**
 * Leser tabellen for videregående i vedlegg 1: overskrifter «Årsramme 607,5/810» gir årsrammen, rader med
 * «Utd.program» gir kategorien (Fellesfag, Felles programfag …), og de andre radene er fag, program og trinn.
 * Fag merket * har stjerne.
 */
export function lesVedlegg1(html: string): Vedleggsrad[] {
  const tabell = parse(html)
    .querySelectorAll('table')
    .find((t) => t.text.includes('Utd.program'));
  if (!tabell) throw new Error('Fant ikke tabellen for videregående i vedlegg 1.');
  const rader: Vedleggsrad[] = [];
  let ramme: [number, number] | null = null;
  let kategori: string | null = null;
  for (const tr of tabell.querySelectorAll('tr')) {
    const celler = tr.querySelectorAll('td').map((td) => normaliserTekst(td.text));
    if (celler.every((c) => c === '')) continue;
    const overskrift = /^Årsramme\s+([\d,]+)\/([\d,]+)/.exec(celler.join(' '));
    if (overskrift) {
      ramme = [lesTall(overskrift[1] as string), lesTall(overskrift[2] as string)];
      continue;
    }
    if (celler[1] === 'Utd.program') {
      kategori = celler[0] ?? null;
      continue;
    }
    if (!ramme || !kategori || celler.length < 3) throw new Error(`Uventet rad i vedlegg 1: ${celler.join(' | ')}`);
    const fag = (celler[0] ?? '').trim();
    rader.push({
      t60: ramme[0],
      t45: ramme[1],
      kategori,
      fag: fag === '' ? null : fag.replace(/\s*\*$/, ''),
      program: celler[1] ?? '',
      trinn: celler[2] ?? '',
      stjerne: fag.endsWith('*'),
    });
  }
  return rader;
}

function radnokkel(r: Pick<Vedleggsrad, 'kategori' | 'fag' | 'program' | 'trinn'>): string {
  return `${r.kategori} · ${r.fag ?? '(felles programfag)'} · ${r.program} · ${r.trinn}`;
}

function radverdi(r: Pick<Vedleggsrad, 't60' | 't45' | 'stjerne'>): string {
  return `${String(r.t60).replace('.', ',')}/${String(r.t45).replace('.', ',')}${r.stjerne ? ' *' : ''}`;
}

/** Sammenligner radene i regelsettet med radene i kilden. Rekkefølgen spiller ingen rolle. */
export function sammenlignVedlegg1(regel: readonly Tabellrad[], kilde: readonly Vedleggsrad[]): Tabellresultat {
  const iRegel = new Map<string, string[]>();
  for (const r of regel) {
    const rad = r as unknown as Vedleggsrad;
    const n = radnokkel(rad);
    iRegel.set(n, [...(iRegel.get(n) ?? []), radverdi(rad)]);
  }
  const iKilde = new Map<string, string[]>();
  for (const r of kilde) {
    const n = radnokkel(r);
    iKilde.set(n, [...(iKilde.get(n) ?? []), radverdi(r)]);
  }
  const detaljer: string[] = [];
  for (const [n, verdier] of iKilde) {
    const gamle = iRegel.get(n);
    if (!gamle) detaljer.push(`Ny rad i kilden: ${n}: ${verdier.join(', ')}`);
    else if ([...gamle].sort().join() !== [...verdier].sort().join()) detaljer.push(`Endret: ${n}: ${gamle.join(', ')} → ${verdier.join(', ')}`);
  }
  for (const [n, verdier] of iRegel) if (!iKilde.has(n)) detaljer.push(`Ikke lenger i kilden: ${n}: ${verdier.join(', ')}`);
  return detaljer.length === 0
    ? { status: 'samsvarer', melding: `Alle ${kilde.length} radene stemmer.`, detaljer: [] }
    : { status: 'avvik', melding: `${antallRader(detaljer.length)} stemmer ikke med kilden.`, detaljer };
}

// ---------- Garantilønn ----------

/** «545400» → mønster som tåler «545 400» og «545.400». */
function belop(n: number): string {
  const tekst = String(n);
  return tekst.replace(/\B(?=(\d{3})+(?!\d))/g, '[\\s.]?');
}

/**
 * Hver rad i garantilønnstabellen står i hovedtariffavtalen som «Tillegg for ansiennitet <0 år> <fire tillegg>
 * Laveste årslønn <6 år> <8 år> <10 år> <16 år>». Raden stemmer når den står slik i teksten.
 */
export function sjekkGarantilonn(rader: readonly Tabellrad[], trinn: readonly number[], kildetekst: string): Tabellresultat {
  const tekst = normaliserTekst(kildetekst);
  const [forste, ...resten] = trinn;
  const detaljer: string[] = [];
  for (const rad of rader) {
    const verdi = (t: number) => rad[`ar_${t}`] as number;
    const monster = new RegExp(
      `ansiennitet\\s+${belop(verdi(forste as number))}\\s+(?:${TALL}\\s+){${resten.length}}Laveste\\s+årslønn\\s+${resten.map((t) => belop(verdi(t))).join('\\s+')}(?!\\d)`,
    );
    if (!monster.test(tekst)) detaljer.push(`Stemmer ikke: ${String(rad.navn ?? rad.id)}: ${trinn.map((t) => verdi(t)).join(', ')}`);
  }
  return detaljer.length === 0
    ? { status: 'samsvarer', melding: `Alle ${rader.length} radene stemmer.`, detaljer: [] }
    : { status: 'avvik', melding: `${antallRader(detaljer.length)} stemmer ikke med kilden.`, detaljer };
}
