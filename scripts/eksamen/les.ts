// Leser eksamensdatoene fra teksten på udir.no og fylkenes sider, og slår dem sammen (fase 6, pakke 3, avgjørelse 059).
// Rene funksjoner, testet i tests/unit/eksamensdatoer.test.ts.
//
// - Hver kilde har regler (scripts/eksamen/kilder.ts): et mønster som finner datoen i teksten, feltet (f.eks. `trekk`)
//   og perioden (høst eller vår). Datoen leses med lesDatoer, som forstår «12. november kl. 09:00», «1.–15. september»,
//   «15. januar–1. februar», «18.juni 2027» og «16. nov.–27. nov.».
// - Året: står det i datoen, brukes det. Ellers brukes året i mønsteret (gruppen `aar`, f.eks. «Høsten 2026»), og
//   ellers skoleåret datoene er hentet i. Høsteksamen 2026 har datoer fra august 2026 til mars 2027, våreksamen 2027
//   fra januar til september 2027.
// - Sammenslåingen (eier 04.10.2026): Har Udir datoen, brukes Udirs dato, uten kontrollsak. Ellers tas en dato inn
//   når minst to fylker har den samme. Er fylkene uenige, blir det en kontrollsak. Har bare ett fylke datoen, tas den
//   ikke inn, men står i rapporten. Fylkenes egne datoer (`fylke: true` i regelen) tas inn for fylket.

export type Periode = 'host' | 'var';

const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

export interface Datotreff {
  dag: number;
  maned: number;
  aar: number | null;
  kl: string | null;
}

const MANED = '(jan(?:uar)?|feb(?:ruar)?|mar(?:s)?|apr(?:il)?|mai|jun(?:i)?|jul(?:i)?|aug(?:ust)?|sep(?:t(?:ember)?)?|okt(?:ober)?|nov(?:ember)?|des(?:ember)?)\\.?';
// «12. november 2026 kl. 09:00», «1.–15. september», «18.juni», «20 mars», «16. nov.».
const DATO = new RegExp(`(\\d{1,2})\\.?\\s?(?:[–-]\\s?(\\d{1,2})\\.?\\s?)?${MANED}(?:\\s+(\\d{4}))?(?:,?\\s*kl(?:okken|\\.)?\\s*(\\d{1,2})(?:[:.](\\d{2}))?)?`, 'gi');

/** Datoene i en tekst, i rekkefølge. «1.–15. september» gir to datoer. */
export function lesDatoer(tekst: string): Datotreff[] {
  const ut: Datotreff[] = [];
  for (const m of tekst.matchAll(DATO)) {
    const [, d1, d2, mnd, aar, time, minutt] = m;
    const maned = MANEDER.findIndex((n) => n.startsWith((mnd ?? '').toLowerCase().slice(0, 3))) + 1;
    if (maned === 0) continue;
    const kl = time ? `${time.padStart(2, '0')}.${minutt ?? '00'}` : null;
    const a = aar ? Number(aar) : null;
    if (d2) {
      ut.push({ dag: Number(d1), maned, aar: a, kl: null }, { dag: Number(d2), maned, aar: a, kl });
    } else ut.push({ dag: Number(d1), maned, aar: a, kl });
  }
  return ut;
}

/** Skoleåret (året det starter) for en dato: august og senere hører til skoleåret som starter det året. */
export function skolearFor(iso: string): number {
  const aar = Number(iso.slice(0, 4));
  return Number(iso.slice(5, 7)) >= 8 ? aar : aar - 1;
}

/** Året til eksamensperioden en dato hører til: høst etter august hører til samme år, ellers året før. */
function periodeAar(periode: Periode, dato: { maned: number; aar: number }): number {
  return periode === 'host' && dato.maned < 8 ? dato.aar - 1 : dato.aar;
}

/** Året datoen har i perioden: høsteksamen 2026 har datoer i august 2026 til mars 2027. */
function aarIPeriode(periode: Periode, periodeaar: number, maned: number): number {
  return periode === 'host' && maned < 8 ? periodeaar + 1 : periodeaar;
}

const iso = (aar: number, maned: number, dag: number) => `${aar}-${String(maned).padStart(2, '0')}-${String(dag).padStart(2, '0')}`;

export interface Regel {
  felt: string;
  periode: Periode;
  /**
   * Mønsteret som finner datoen. Gruppen `dato` (eller gruppe 1, eller hele treffet) er teksten med datoen. Gruppen
   * `aar` er året til perioden.
   */
  moenster: RegExp;
  /** `til`: én dato er sluttdatoen (f.eks. en frist). Standard: én dato er `fra`, to datoer er `fra` og `til`. */
  del?: 'til';
  /** Klokkeslettet tas med (f.eks. trekket kl. 09.00). */
  kl?: boolean;
  /** Fylkets egen dato, som bare gjelder fylket. */
  fylke?: boolean;
  /** Datoen står ikke alltid på siden (f.eks. våreksamen i Udirs kalender om høsten), så det er ikke en feil å ikke finne den. */
  valgfri?: boolean;
}

export interface Eksamenskilde {
  id: string;
  navn: string;
  url: string;
  /** Fylkesnummeret, eller null for Udir. */
  fylke: string | null;
  /** Selektoren for innholdet på siden. */
  selektor: string;
  regler: Regel[];
}

export interface Kandidat {
  kilde: string;
  fylke: string | null;
  egen: boolean;
  periode: string;
  felt: string;
  fra?: string;
  til?: string;
  kl?: string;
}

/**
 * Datoene en kilde gir, etter reglene. `hentet` (ÅÅÅÅ-MM-DD) gir skoleåret når verken datoen eller mønsteret har året.
 * Regler som ikke finner noe, står i `mangler`, så en side som er endret, blir oppdaget.
 */
export function lesKilde(kilde: Eksamenskilde, tekst: string, hentet: string): { kandidater: Kandidat[]; mangler: string[] } {
  const kandidater: Kandidat[] = [];
  const mangler: string[] = [];
  const skolear = skolearFor(hentet);
  for (const r of kilde.regler) {
    const m = r.moenster.exec(tekst);
    const datoer = m ? lesDatoer(m.groups?.['dato'] ?? m[1] ?? m[0]) : [];
    if (!m || datoer.length === 0) {
      if (!r.valgfri) mangler.push(`${r.felt} (${r.periode === 'host' ? 'høst' : 'vår'})`);
      continue;
    }
    const gruppeaar = m.groups?.['aar'] ? Number(m.groups['aar']) : null;
    const forste = datoer[0] as Datotreff;
    // Året til perioden: fra året i datoen, ellers fra mønsteret, ellers skoleåret.
    const paar = forste.aar !== null ? periodeAar(r.periode, { maned: forste.maned, aar: forste.aar }) : (gruppeaar ?? (r.periode === 'host' ? skolear : skolear + 1));
    const somIso = (d: Datotreff) => iso(d.aar ?? aarIPeriode(r.periode, paar, d.maned), d.maned, d.dag);
    const k: Kandidat = { kilde: kilde.id, fylke: kilde.fylke, egen: r.fylke ?? false, periode: `${r.periode}-${paar}`, felt: r.felt };
    const siste = datoer[1];
    if (siste) {
      k.fra = somIso(forste);
      k.til = somIso(siste);
    } else if (r.del === 'til') k.til = somIso(forste);
    else k.fra = somIso(forste);
    if (r.kl && forste.kl) k.kl = forste.kl;
    kandidater.push(k);
  }
  return { kandidater, mangler };
}

export interface Datoverdi {
  fra?: string;
  til?: string;
  kl?: string;
  kilder: string[];
}

export interface Sammenslatt {
  nasjonal: Record<string, Record<string, Datoverdi>>;
  fylker: Record<string, Record<string, Record<string, Datoverdi>>>;
  /** Fylkene er uenige, og Udir har ikke datoen: kontrollsak. */
  uenige: string[];
  /** Bare ett fylke har datoen, så den er ikke tatt inn. */
  enKilde: string[];
}

const verdi = (k: Kandidat, del: 'fra' | 'til') => (k[del] ? `${k[del]}${del === 'fra' && k.kl ? ` kl. ${k.kl}` : ''}` : null);

/** Slår sammen datoene fra alle kildene etter reglene over. Udir-kildene har `fylke: null`. */
export function slaSammen(kandidater: readonly Kandidat[]): Sammenslatt {
  const ut: Sammenslatt = { nasjonal: {}, fylker: {}, uenige: [], enKilde: [] };
  const sett = (mal: Record<string, Record<string, Datoverdi>>, periode: string, felt: string, del: 'fra' | 'til', k: Kandidat[]) => {
    const forste = k[0] as Kandidat;
    const p = (mal[periode] ??= {});
    const d = (p[felt] ??= { kilder: [] });
    d[del] = forste[del];
    if (del === 'fra' && forste.kl) d.kl = forste.kl;
    for (const x of k) if (!d.kilder.includes(x.kilde)) d.kilder.push(x.kilde);
  };

  // Fylkenes egne datoer: for fylket, fra den første kilden som har dem.
  for (const k of kandidater.filter((x) => x.egen && x.fylke)) {
    const fylke = (ut.fylker[k.fylke as string] ??= {});
    for (const del of ['fra', 'til'] as const) if (k[del] && !fylke[k.periode]?.[k.felt]?.[del]) sett(fylke, k.periode, k.felt, del, [k]);
  }

  // Nasjonale datoer: per periode, felt og del (fra eller til).
  const nasjonale = kandidater.filter((x) => !x.egen);
  const nokler = new Set(nasjonale.flatMap((k) => (['fra', 'til'] as const).filter((d) => k[d]).map((d) => `${k.periode}|${k.felt}|${d}`)));
  for (const nokkel of [...nokler].sort()) {
    const [periode = '', felt = '', del = 'fra'] = nokkel.split('|') as [string, string, 'fra' | 'til'];
    const alle = nasjonale.filter((k) => k.periode === periode && k.felt === felt && k[del]);
    const udir = alle.filter((k) => k.fylke === null);
    if (udir.length > 0) {
      sett(ut.nasjonal, periode, felt, del, udir);
      continue;
    }
    // Grupper på verdien, og tell fylkene (ikke sidene) som har den.
    const grupper = new Map<string, Kandidat[]>();
    for (const k of alle) {
      const v = verdi(k, del) as string;
      grupper.set(v, [...(grupper.get(v) ?? []), k]);
    }
    const fylker = (g: Kandidat[]) => new Set(g.map((k) => k.fylke)).size;
    const sortert = [...grupper.entries()].sort((a, b) => fylker(b[1]) - fylker(a[1]));
    const [beste, liste = []] = sortert[0] ?? [];
    const beskriv = () => sortert.map(([v, g]) => `${v} (${g.map((k) => k.kilde).join(', ')})`).join(' mot ');
    const navn = `${felt} ${periode}${del === 'til' ? ' (til)' : ''}`;
    if (sortert.length > 1) ut.uenige.push(`${navn}: ${beskriv()}`);
    if (beste && fylker(liste) >= 2 && (sortert.length === 1 || fylker(liste) > fylker(sortert[1]?.[1] ?? []))) sett(ut.nasjonal, periode, felt, del, liste);
    else if (sortert.length === 1) ut.enKilde.push(`${navn}: ${beskriv()}`);
  }
  return ut;
}
