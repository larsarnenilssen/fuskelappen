// Tilbudsstrukturen: utdanningsprogram → vg1 → vg2-retninger → vg3 og lærefag, med fagsammensetning og timer
// for hvert tilbud (programområde). Bygges fra Grep (programområder, «bygger på», fagkoder) og fag- og
// timefordelingen i rundskrivet Udir-1. Ren logikk, uten avhengighet til grensesnittet (avgjørelse 024).
//
// Ingenting her er skrevet inn for hånd per program eller fag: når Grep eller rundskrivet endres, endres
// tilbudene. Det eneste faste er hvordan linjene i rundskrivet tolkes (LINJETYPER og FELLESFAG nedenfor).
import type { Fag, Fagindeks, Programomrade, Trinn } from '../skjema.ts';
import type { Fagfordeling, Fordelingstabell } from './skjema.ts';

export type Programgruppe = 'studieforberedende' | 'yrkesfaglig' | 'pabygging';

export const STUDIEFORBEREDENDE = ['ST', 'ID', 'MD', 'KD', 'ME'] as const;

export function programgruppe(program: string): Programgruppe {
  if (program === 'PB') return 'pabygging';
  return (STUDIEFORBEREDENDE as readonly string[]).includes(program) ? 'studieforberedende' : 'yrkesfaglig';
}

export type Linjetype = 'fellesfag' | 'felles_programfag' | 'fordypning' | 'valgfritt' | 'yff' | 'opphenting' | 'sum' | 'totalt';

/** Hva en linje i tabellen er. Rekkefølgen betyr noe: den første som passer, gjelder. */
const LINJETYPER: [RegExp, Linjetype][] = [
  [/^totalt/i, 'totalt'],
  [/^sum\b/i, 'sum'],
  [/opphenting/i, 'opphenting'],
  [/yrkesfaglig fordypning/i, 'yff'],
  [/felles programfag/i, 'felles_programfag'],
  [/programfag fra eget programområde \(fordypning\)/i, 'fordypning'],
  [/programfag fra eget programområde eller/i, 'valgfritt'],
  [/programfag fra/i, 'valgfritt'],
];

export function linjetype(linje: string): Linjetype {
  return LINJETYPER.find(([r]) => r.test(linje))?.[1] ?? 'fellesfag';
}

/**
 * Hvilke fagkoder i Grep som hører til en fellesfaglinje i rundskrivet. Brukes bare til å sortere fagene i
 * tilbudet, ikke til årsrammen (den kobles eksplisitt, avgjørelse 023).
 */
const FELLESFAG: [RegExp, RegExp][] = [
  [/^norsk tegnspråk/i, /^NOR/],
  [/^norsk/i, /^NOR/],
  [/^matematikk/i, /^MAT/],
  [/^naturfag/i, /^NAT/],
  [/^engelsk/i, /^ENG/],
  [/^fremmedspråk/i, /^FSP/],
  [/^samfunnskunnskap/i, /^SAK/],
  [/^geografi/i, /^GEO/],
  [/^historie/i, /^HIS/],
  [/^kroppsøving/i, /^KRO/],
  [/^religion/i, /^(REL|KRI)/],
  [/^(førstespråk|andrespråk)/i, /^(SFS|SAS|KEF|NOR)/],
];

/**
 * Fag for særskilte grupper elever, som erstatter et ordinært fag: samisk plan, tegnspråk, kort botid,
 * grunnleggende norsk, styrket opplæring, morsmål, katolske skoler. De vises som alternativer, ikke som tilbudet.
 */
const ALTERNATIV = /tegnspråk|samisk|kvensk|finsk som andrespråk|kort botid|grunnleggende norsk|minoritet|styrket|morsmål|katolske|for døve/i;

export type Rolle = 'ordinar' | 'alternativ' | 'vurdering';

export interface Tilbudskode {
  kode: string;
  rolle: Rolle;
  timer: number | null;
}

export type Tilbudsdel =
  | {
      type: 'fag';
      linje: string;
      kategori: 'fellesfag' | 'felles_programfag';
      /** Timer etter rundskrivet. */
      timer: number;
      /** Ordinære fagkoder. Er det flere, velger eleven én (f.eks. 1P eller 1T, eller et fremmedspråk). */
      koder: string[];
      /** Fagkoder for vurdering (muntlig, eksamen) som hører til samme opplæring. */
      vurdering: string[];
      /** Fag for særskilte grupper som kan erstatte faget. */
      alternativer: string[];
      /** Avvik mellom rundskrivet og Grep, f.eks. ulike timer. */
      avvik: string[];
    }
  | {
      type: 'plass';
      linje: string;
      kategori: 'fordypning' | 'valgfritt' | 'yff' | 'opphenting';
      timer: number;
      /** Antall fag à 140 timer, når plassen fylles med programfag. */
      antall: number | null;
      /** Fagkodene som kan legges inn (for YFF: kodene med ulike timetall). */
      kandidater: string[];
      /** Fagkoden som passer timetallet (YFF). */
      anbefalt: string | null;
    };

export interface Tilpasning {
  /** Kolonnen i rundskrivet, f.eks. «Samisk», «Elever med tegnspråk», «Med stud.spes vg1». */
  navn: string;
  /** Linjene der timene er annerledes enn i den ordinære kolonnen, med fagkodene når linjen er en plass (opphenting). */
  linjer: { linje: string; ordinar: number | null; timer: number | null; koder: string[] }[];
  total: number | null;
}

export interface Tilbud {
  kode: string;
  programomrade: Programomrade;
  gruppe: Programgruppe;
  /** Særskilte skoler (Steiner, Montessori, tysk skole) har egne programområder i Grep. */
  variant: boolean;
  /** Tabellen i rundskrivet, eller null (f.eks. opplæring i bedrift). */
  tabell: { nr: string; omfang: string } | null;
  deler: Tilbudsdel[];
  /** Summen av timene i delene, og totalt omfang i rundskrivet. */
  sum: number;
  totalt: number | null;
  tilpasninger: Tilpasning[];
  /**
   * Fellesfag i Grep for programområdet som ikke står i den ordinære kolonnen: fag for særskilte grupper
   * (samisk, kvensk, grunnleggende norsk, tegnspråk, styrket opplæring) og fag i tilpasningene (f.eks.
   * fremmedspråk I+II for elever uten fremmedspråk fra grunnskolen).
   */
  alternativer: string[];
  /** Andre fag i Grep for programområdet som ikke passer noen linje i rundskrivet. */
  andreFag: string[];
  /** Programområdene tilbudet bygger på, i samme program (forrige trinn) og fra andre program (kryssløp). */
  fra: string[];
  kryssFra: string[];
  /** Videre løp: neste trinn i samme program, påbygging og kryssløp til andre program. */
  videre: string[];
  pabygging: string[];
  kryssTil: string[];
  avvik: string[];
}

const trinnFraOmfang = (omfang: string): Trinn | null => {
  const m = /vg\s*([123])/i.exec(omfang);
  return m ? (`Vg${m[1]}` as Trinn) : null;
};

/** Er programområdet en variant for særskilte skoler (kode som STUSP1RS--, STREA2MO--, STUSP1TY--)? */
export const erVariant = (kode: string) => /^[A-Z]{5}\d[A-Z]{2}/.test(kode);

/** Fordelingstabellen i rundskrivet for et programområde (program og trinn), eller null. */
export function finnTabell(f: Fagfordeling, kode: string, po: Programomrade, programnavn: string): Fordelingstabell | null {
  const tabeller = f.tabeller.filter((t): t is Fordelingstabell => t.type === 'fordeling' && trinnFraOmfang(t.omfang) === po.trinn);
  const tittel = (t: Fordelingstabell) => t.tittel.toLowerCase();
  if (po.program === 'PB') return kode.startsWith('PBPBY3') ? (tabeller.find((t) => /påbygging til generell studiekompetanse for yrkesfaglige/.test(tittel(t))) ?? null) : null;
  if (programgruppe(po.program) === 'studieforberedende') return tabeller.find((t) => tittel(t).includes(`for ${programnavn.toLowerCase()}`)) ?? null;
  if (po.sted === 'bedrift') return null;
  if (po.trinn === 'Vg3' && /^studieforberedende/i.test(po.navn.nb)) return tabeller.find((t) => /studieforberedende vg3/.test(tittel(t)) && tittel(t).includes(programnavn.toLowerCase())) ?? null;
  if (po.trinn === 'Vg3') return tabeller.find((t) => /yrkesfaglige utdanningsprogram.*vg3 i skole/.test(tittel(t))) ?? null;
  return tabeller.find((t) => /yrkesfaglige utdanningsprogram/.test(tittel(t)) && /vg1 og vg2/.test(tittel(t))) ?? null;
}

const harPo = (fag: Fag, kode: string) => fag.po.includes(kode);
const erOpphenting = (fag: Fag) => /opphenting/i.test(fag.navn.nb);

function fellesfagdel(linje: string, timer: number, kode: string, indeks: Fagindeks): Tilbudsdel | null {
  const prefiks = FELLESFAG.find(([r]) => r.test(linje))?.[1];
  if (!prefiks) return null;
  const alle = Object.entries(indeks.fag).filter(([k, f]) => f.type === 'fellesfag' && prefiks.test(k) && harPo(f, kode));
  // Samisk og tegnspråk er vanlige valg som fremmedspråk, ikke alternativer.
  const erAlternativ = (f: Fag) => !/^fremmedspråk/i.test(linje) && ALTERNATIV.test(f.navn.nb);
  const alternativer = alle.filter(([, f]) => erAlternativ(f)).map(([k]) => k);
  const ordinare = alle.filter(([, f]) => !erAlternativ(f));
  const medTimer = ordinare.filter(([, f]) => f.timer !== null);
  const riktige = medTimer.filter(([, f]) => f.timer === timer);
  const avvik: string[] = [];
  let koder = riktige.map(([k]) => k);
  if (koder.length === 0 && medTimer.length > 0) {
    koder = medTimer.map(([k]) => k);
    avvik.push(`${linje}: rundskrivet har ${timer} timer, Grep har ${[...new Set(medTimer.map(([, f]) => f.timer))].join(', ')} (${koder.slice(0, 3).join(', ')}).`);
  }
  if (koder.length === 0) avvik.push(`${linje}: fant ingen fagkode i Grep for programområdet.`);
  // Vurderingskoder: ordinære koder uten timer, med samme læreplan som en av kodene.
  const lp = new Set(koder.map((k) => indeks.fag[k]?.lp));
  const vurdering = ordinare.filter(([, f]) => f.timer === null && lp.has(f.lp)).map(([k]) => k);
  return { type: 'fag', linje, kategori: 'fellesfag', timer, koder: koder.sort(), vurdering: vurdering.sort(), alternativer: alternativer.sort(), avvik };
}

function programfagdel(linje: string, timer: number, kode: string, indeks: Fagindeks): Tilbudsdel {
  // Opphenting (f.eks. YFO2002) er felles programfag i Grep, men en egen linje i rundskrivet.
  const alle = Object.entries(indeks.fag).filter(([, f]) => f.type === 'felles_programfag' && harPo(f, kode) && !erOpphenting(f));
  const koder = alle.filter(([, f]) => f.timer !== null).map(([k]) => k);
  const vurdering = alle.filter(([, f]) => f.timer === null).map(([k]) => k);
  const sum = koder.reduce((s, k) => s + (indeks.fag[k]?.timer ?? 0), 0);
  const avvik = sum !== timer && koder.length > 0 ? [`${linje}: rundskrivet har ${timer} timer, fagene i Grep har til sammen ${sum}.`] : koder.length === 0 ? [`${linje}: fant ingen felles programfag i Grep.`] : [];
  return { type: 'fag', linje, kategori: 'felles_programfag', timer, koder: koder.sort(), vurdering: vurdering.sort(), alternativer: [], avvik };
}

function plassdel(linje: string, kategori: 'fordypning' | 'valgfritt' | 'yff' | 'opphenting', timer: number, kode: string, po: Programomrade, indeks: Fagindeks): Tilbudsdel {
  const fag = Object.entries(indeks.fag);
  let kandidater: string[];
  let anbefalt: string | null = null;
  if (kategori === 'yff') {
    kandidater = fag.filter(([, f]) => f.type === 'yrkesfaglig_fordypning' && harPo(f, kode)).map(([k]) => k);
    anbefalt = kandidater.find((k) => indeks.fag[k]?.timer === timer) ?? null;
  } else if (kategori === 'opphenting') {
    kandidater = fag.filter(([, f]) => harPo(f, kode) && erOpphenting(f)).map(([k]) => k);
  } else if (kategori === 'fordypning') {
    kandidater = fag.filter(([, f]) => f.type === 'valgfritt_programfag' && f.timer !== null && harPo(f, kode)).map(([k]) => k);
  } else {
    // Programfag fra studieforberedende utdanningsprogram: valgfrie programfag på trinnet i alle studieforberedende program.
    kandidater = fag
      .filter(([, f]) => f.type === 'valgfritt_programfag' && f.timer !== null && f.po.some((p) => indeks.programomrader[p]?.trinn === po.trinn && programgruppe(indeks.programomrader[p]?.program ?? '') === 'studieforberedende'))
      .map(([k]) => k);
  }
  const antall = kategori === 'fordypning' || kategori === 'valgfritt' ? Math.round(timer / 140) : null;
  return { type: 'plass', linje, kategori, timer, antall: antall && antall > 0 ? antall : null, kandidater: kandidater.sort(), anbefalt };
}

/** Bygger tilbudet for ett programområde. */
export function byggTilbud(kode: string, indeks: Fagindeks, fordeling: Fagfordeling | null): Tilbud {
  const po = indeks.programomrader[kode];
  if (!po) throw new Error(`Ukjent programområde ${kode}`);
  const programnavn = indeks.utdanningsprogram[po.program]?.nb ?? po.program;
  const tabell = fordeling ? finnTabell(fordeling, kode, po, programnavn) : null;
  const deler: Tilbudsdel[] = [];
  const tilpasninger: Tilpasning[] = [];
  let totalt: number | null = null;
  const avvik: string[] = [];
  // Varianter for særskilte skoler har ofte ingen fellesfag i Grep. Da holder det med én merknad.
  const harFellesfag = Object.values(indeks.fag).some((f) => f.type === 'fellesfag' && harPo(f, kode));
  if (tabell) {
    if (!harFellesfag) avvik.push('Grep kobler ingen fellesfag til programområdet.');
    const ord = tabell.kolonner.findIndex((k) => /^ordinær/i.test(k.navn));
    const i = ord < 0 ? 0 : ord;
    for (const r of tabell.rader) {
      const t = r.timer[i] ?? null;
      const type = linjetype(r.linje);
      if (type === 'totalt') totalt = t;
      if (t === null || t === 0 || type === 'sum' || type === 'totalt') continue;
      if (type === 'fellesfag') {
        const d = fellesfagdel(r.linje, t, kode, indeks);
        if (d?.type === 'fag' && !harFellesfag) d.avvik = [];
        if (d) deler.push(d);
        else avvik.push(`Linjen «${r.linje}» i rundskrivet er ikke kjent.`);
      } else if (type === 'felles_programfag') deler.push(programfagdel(r.linje, t, kode, indeks));
      else deler.push(plassdel(r.linje, type, t, kode, po, indeks));
    }
    tabell.kolonner.forEach((k, j) => {
      if (j === i) return;
      const linjer = tabell.rader
        .filter((r) => !['sum', 'totalt'].includes(linjetype(r.linje)) && (r.timer[j] ?? null) !== (r.timer[i] ?? null))
        .map((r) => ({
          linje: r.linje,
          ordinar: r.timer[i] ?? null,
          timer: r.timer[j] ?? null,
          koder: linjetype(r.linje) === 'opphenting' ? Object.entries(indeks.fag).filter(([, f]) => harPo(f, kode) && erOpphenting(f)).map(([k]) => k).sort() : [],
        }));
      const tot = tabell.rader.find((r) => linjetype(r.linje) === 'totalt')?.timer[j] ?? null;
      tilpasninger.push({ navn: k.navn, linjer, total: tot });
    });
  } else if (po.sted === 'bedrift') {
    const koder = Object.entries(indeks.fag)
      .filter(([, f]) => harPo(f, kode))
      .map(([k]) => k)
      .sort();
    if (koder.length > 0) deler.push({ type: 'fag', linje: 'Opplæring i bedrift', kategori: 'felles_programfag', timer: 0, koder, vurdering: [], alternativer: [], avvik: [] });
  }
  const sum = deler.reduce((s, d) => s + d.timer, 0);
  if (tabell && totalt !== null && sum !== totalt) avvik.push(`Summen av delene er ${sum} timer, rundskrivet sier ${totalt}.`);
  for (const d of deler) if (d.type === 'fag') avvik.push(...d.avvik);
  const brukt = new Set([
    ...deler.flatMap((d) => (d.type === 'fag' ? [...d.koder, ...d.vurdering, ...d.alternativer] : [...d.kandidater])),
    ...tilpasninger.flatMap((t) => t.linjer.flatMap((l) => l.koder)),
  ]);
  const rest = Object.entries(indeks.fag).filter(([k, f]) => harPo(f, kode) && !brukt.has(k) && f.type !== 'valgfritt_programfag');
  const alternativer = rest.filter(([, f]) => f.type === 'fellesfag').map(([k]) => k).sort();
  const andreFag = rest.filter(([, f]) => f.type !== 'fellesfag').map(([k]) => k).sort();
  const alle = Object.entries(indeks.programomrader);
  const fra = po.bygger.filter((b) => indeks.programomrader[b]?.program === po.program);
  const kryssFra = po.bygger.filter((b) => indeks.programomrader[b]?.program !== po.program);
  const barn = alle.filter(([, p]) => p.bygger.includes(kode)).map(([k]) => k);
  return {
    kode,
    programomrade: po,
    gruppe: programgruppe(po.program),
    variant: erVariant(kode),
    tabell: tabell ? { nr: tabell.nr, omfang: tabell.omfang } : null,
    deler,
    sum,
    totalt,
    tilpasninger,
    alternativer,
    andreFag,
    fra,
    kryssFra,
    videre: barn.filter((b) => indeks.programomrader[b]?.program === po.program).sort(),
    pabygging: barn.filter((b) => indeks.programomrader[b]?.program === 'PB').sort(),
    kryssTil: barn.filter((b) => !['PB', po.program].includes(indeks.programomrader[b]?.program ?? '')).sort(),
    avvik,
  };
}

export interface Programstruktur {
  program: string;
  navn: { nb: string; nn: string };
  gruppe: Programgruppe;
  /**
   * Inngangen til programmet: vg1, eller laveste trinn når programmet ikke har vg1 (påbygging). Hovedløp først,
   * varianter for særskilte skoler sist.
   */
  inngang: string[];
  /** Programområder i programmet som ikke kan nås fra vg1 i samme program (mangler «bygger på» i Grep). */
  utenfor: string[];
}

/** Programmene med inngang (vg1). Resten av løpet følger «videre» i hvert tilbud. */
export function byggStruktur(indeks: Fagindeks): Programstruktur[] {
  const po = Object.entries(indeks.programomrader);
  return Object.entries(indeks.utdanningsprogram)
    .map(([program, navn]) => {
      const egne = po.filter(([, p]) => p.program === program);
      const laveste = ['Vg1', 'Vg2', 'Vg3', 'Bedrift'].find((t) => egne.some(([, p]) => p.trinn === t));
      const inngang = egne
        .filter(([, p]) => p.trinn === laveste)
        .map(([k]) => k)
        .sort((a, b) => Number(erVariant(a)) - Number(erVariant(b)) || a.localeCompare(b));
      // Alt som kan nås fra inngangen i programmet, ved å følge «bygger på».
      const naadd = new Set(inngang);
      let endret = true;
      while (endret) {
        endret = false;
        for (const [k, p] of egne) {
          if (!naadd.has(k) && p.bygger.some((b) => naadd.has(b))) {
            naadd.add(k);
            endret = true;
          }
        }
      }
      const utenfor = egne
        .filter(([k]) => !naadd.has(k))
        .map(([k]) => k)
        .sort();
      return { program, navn, gruppe: programgruppe(program), inngang, utenfor };
    })
    .sort((a, b) => ['studieforberedende', 'yrkesfaglig', 'pabygging'].indexOf(a.gruppe) - ['studieforberedende', 'yrkesfaglig', 'pabygging'].indexOf(b.gruppe) || a.navn.nb.localeCompare(b.navn.nb, 'nb'));
}

/**
 * Rollen til hver fagkode i tilbudene: ordinært fag (i minst ett tilbud), alternativ (erstatter et fag for
 * særskilte grupper) eller vurderingskode. Fag som ikke står i noe tilbud, får ingen rolle her.
 */
export function fagroller(tilbud: readonly Tilbud[]): Map<string, Rolle> {
  const ut = new Map<string, Rolle>();
  const sett = (k: string, r: Rolle) => {
    const n = ut.get(k);
    if (n === 'ordinar' || (n === 'alternativ' && r === 'vurdering')) return;
    ut.set(k, r);
  };
  for (const t of tilbud) {
    for (const d of t.deler) {
      if (d.type === 'fag') {
        d.koder.forEach((k) => sett(k, 'ordinar'));
        d.vurdering.forEach((k) => sett(k, 'vurdering'));
        d.alternativer.forEach((k) => sett(k, 'alternativ'));
      } else d.kandidater.forEach((k) => sett(k, 'ordinar'));
    }
    t.alternativer.forEach((k) => sett(k, 'alternativ'));
    t.tilpasninger.forEach((p) => p.linjer.forEach((l) => l.koder.forEach((k) => sett(k, 'alternativ'))));
  }
  return ut;
}

/** Skoleåret for en dato (ÅÅÅÅ-MM-DD): skoleåret begynner 1. august. 2026-10-01 → 2026-2027. */
export function skolearFor(dato: string): string {
  const aar = Number(dato.slice(0, 4));
  const start = Number(dato.slice(5, 7)) >= 8 ? aar : aar - 1;
  return `${start}-${start + 1}`;
}

/**
 * Fag- og timefordelingen som gjelder på datoen: skoleåret datoen ligger i, ellers det siste skoleåret før.
 * Finnes bare senere skoleår, brukes det første av dem.
 */
export function velgFordeling<T extends { skolear: string }>(fordelinger: readonly T[], dato: string): T | null {
  const naa = skolearFor(dato);
  const sortert = [...fordelinger].sort((a, b) => a.skolear.localeCompare(b.skolear));
  return sortert.filter((f) => f.skolear <= naa).at(-1) ?? sortert[0] ?? null;
}
