// Søk i årsrammene i vedlegg 1 på fag, program, trinn, fagkoder (f.eks. ENG1007, REA3036), prefikser
// (ENG, BAT, HEA) og kallenavn (1P, R1, Fysikk 1). Ren funksjon; dataene kommer fra rules/ og data/grep/.
import type { Tabellrad } from '../../core/regler/skjema.ts';
import type { Arsrammerad } from './beregning/index.ts';

export type Programomrader = Record<string, Record<string, [string, string][]>>;

export interface Sokedata {
  programnavn: readonly Tabellrad[];
  fagnavn: readonly Tabellrad[];
  kallenavn: readonly Tabellrad[];
  programomrader: Programomrader;
}

export interface Fagtreff {
  rad: Arsrammerad;
  /** Fullt fagnavn, eller null for felles programfag. */
  fag: string | null;
  program: string;
  /** Kallenavn og programområder som passet søket, til visning. */
  ekstra: string[];
}

interface Indekspost {
  treff: Omit<Fagtreff, 'ekstra'>;
  hoved: string[];
  /** Koder, programområder og kallenavn. frase er hele navnet normalisert, for eksakte treff på hele søket. */
  andre: { ord: string[]; vis: string; frase: string }[];
}

const tekster = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Små bokstaver, uten tegnsetting. «Rest. og mat» → «rest og mat», «1P-Y» → «1p y». */
export function normaliser(tekst: string): string {
  return tekst
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const ord = (tekst: string): string[] => normaliser(tekst).split(' ').filter(Boolean);

export function lagFagindeks(rader: readonly Arsrammerad[], data: Sokedata): Indekspost[] {
  const program = new Map(data.programnavn.map((p) => [p.vedlegg as string, p]));
  const fag = new Map(data.fagnavn.map((f) => [f.vedlegg as string, f]));
  return rader.map((rad) => {
    const p = program.get(rad.program);
    const f = rad.fag ? fag.get(rad.fag) : undefined;
    const programNavn = typeof p?.navn === 'string' ? p.navn : rad.program;
    const fagNavn = rad.fag ? (typeof f?.navn === 'string' ? f.navn : rad.fag) : null;
    const trinn = rad.trinn.replace(/\D/g, '');
    const andre: Indekspost['andre'] = [];
    for (const kode of tekster(p?.grep)) {
      andre.push({ ord: [kode.toLowerCase()], vis: kode, frase: normaliser(kode) });
      // Programområdene gjelder programfagene på trinnet (felles programfag i vedlegget).
      if (rad.fag === null) for (const [prefiks, navn] of data.programomrader[kode]?.[trinn] ?? []) andre.push({ ord: [prefiks.toLowerCase(), ...ord(navn)], vis: `${prefiks} ${navn}`, frase: normaliser(prefiks) });
    }
    for (const prefiks of tekster(f?.prefikser)) andre.push({ ord: [prefiks.toLowerCase()], vis: prefiks, frase: normaliser(prefiks) });
    for (const k of data.kallenavn) {
      if (k.fag !== rad.fag || k.program !== rad.program || k.trinn !== rad.trinn) continue;
      if (typeof k.kategori === 'string' && k.kategori !== rad.kategori) continue;
      for (const s of tekster(k.sokeord)) andre.push({ ord: ord(s), vis: s, frase: normaliser(s) });
    }
    return {
      treff: { rad, fag: fagNavn, program: programNavn },
      hoved: [...ord(fagNavn ?? rad.kategori), ...ord(rad.fag ?? ''), ...ord(programNavn), ...ord(rad.program), ...ord(rad.trinn), ...ord(rad.kategori)],
      andre,
    };
  });
}

/** Alle søkeordene må passe (som begynnelsen av et ord). Treff i fag og program rangeres foran koder og kallenavn. */
export function sokFag(indeks: readonly Indekspost[], sporring: string, maks = 8): Fagtreff[] {
  const sok = ord(sporring);
  if (sok.length === 0) return [];
  const hele = normaliser(sporring);
  // Eksakt ord gir flere poeng enn begynnelsen av et ord, så «2P» rangeres foran «2P-Y».
  const poengFor = (s: string, liste: readonly string[]) => (liste.includes(s) ? 2 : liste.some((o) => o.startsWith(s)) ? 1 : 0);
  const treff: { t: Fagtreff; poeng: number }[] = [];
  for (const post of indeks) {
    let poeng = 0;
    const ekstra = new Set<string>();
    let alle = true;
    for (const s of sok) {
      const hoved = poengFor(s, post.hoved);
      if (hoved > 0) {
        poeng += 2 + hoved;
        continue;
      }
      const andre = post.andre.map((a) => ({ a, p: poengFor(s, a.ord) })).filter((x) => x.p > 0);
      if (andre.length === 0) {
        alle = false;
        break;
      }
      poeng += Math.max(...andre.map((x) => x.p));
      for (const x of andre.slice(0, 2)) ekstra.add(x.a.vis);
    }
    const eksakt = post.andre.find((a) => a.frase === hele);
    if (eksakt) {
      poeng += 5;
      ekstra.add(eksakt.vis);
    }
    if (alle) treff.push({ t: { ...post.treff, ekstra: [...ekstra] }, poeng });
  }
  return treff
    .sort((a, b) => b.poeng - a.poeng || b.t.rad.t60 - a.t.rad.t60 || a.t.rad.nr - b.t.rad.nr)
    .slice(0, maks)
    .map((x) => x.t);
}
