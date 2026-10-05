// Tolker skoleruta i fylkenes lokale forskrifter fra Lovdata (lokaltype skolerute, avgjørelse 061) til datoer for
// kalenderen (fase 6, pakke 5). Tabellene er fri tekst, så alt her er rene funksjoner med strenge kontroller:
// - Datoene leses som ukedag (valgfri), dag og måned. Mangler måneden, hentes den fra datoen ved siden av i samme
//   uttrykk («onsdag 24.–fredag 26. februar»), ellers fra måneden i raden.
// - Spenn skrives med «–», «-», «til», «til og med» og «fra og med … til og med …». Lister med «og» blir ett spenn når
//   dagene følger etter hverandre, ellers én hendelse per dag.
// - Året følger skoleåret (august–juli).
// - Ukedagen må stemme med kalenderen, datoen må ligge i skoleåret, og et spenn må gå framover. Står det «veke 41»
//   eller «uke 41», må datoen ligge i den uken.
// - Typen avgjøres av ord på bokmål og nynorsk. Helligdager (Kristi himmelfartsdag, grunnlovsdag …) får typen helligdag.
// - Det som ikke kan leses sikkert, havner i `ulest`, med grunnen. Ingenting gjettes. «… fastsett lokalt» er ikke en
//   dato og hoppes over.
// - Har tabellen én kolonne for dato og én for hending (Vestland), pares linjene i cellene én og én når antallet er
//   likt. Ellers blir raden ulest.
import { alleParagrafer, type Lovdokument, type Segment } from '../../src/modules/lov/typer.ts';

export type Hendelsestype =
  | 'forste-skoledag'
  | 'siste-skoledag'
  | 'hostferie'
  | 'juleferie'
  | 'vinterferie'
  | 'paskeferie'
  | 'forste-etter-jul'
  | 'forste-etter-paske'
  | 'elevfri'
  | 'planlegging'
  | 'helligdag'
  | 'annet';

export interface Skoleruteinfo {
  id: string;
  refid: string;
  /** «2026-2027». */
  skolear: string;
  malform: 'nb' | 'nn';
  /** Forskriften sier at skolene følger skoleruta i vertskommunen (Vestland). */
  vertskommune: boolean;
}

export interface Hendelse {
  type: Hendelsestype;
  /** ÅÅÅÅ-MM-DD. */
  fra: string;
  /** Siste dag i et spenn. Mangler for én dag. */
  til?: string;
  /** Teksten i kilden for hendelsen, uendret. */
  tekst: string;
  dokument: string;
  skolear: string;
}

export interface Ulest {
  dokument: string;
  skolear: string;
  tekst: string;
  grunn: string;
}

export interface Skoleruter {
  lest: string;
  fylker: Record<string, { dokumenter: Skoleruteinfo[]; hendelser: Hendelse[] }>;
  ulest: Ulest[];
}

const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
/** Ukedagene på bokmål og nynorsk, med søndag som 0 (som Date.getUTCDay). */
const UKEDAGER: Record<string, number> = {
  søndag: 0,
  sundag: 0,
  mandag: 1,
  måndag: 1,
  tirsdag: 2,
  tysdag: 2,
  onsdag: 3,
  torsdag: 4,
  fredag: 5,
  lørdag: 6,
  laurdag: 6,
};
const UKEDAG = Object.keys(UKEDAGER).join('|');
const MANED = MANEDER.join('|');
/** Et spenn mellom to datoer: «–», «-», «til», «til og med», «– til og med», «t.o.m.». */
const SPENN = /^\s*(?:(?:[–—-]\s*)?(?:til og med|til|t\.o\.m\.?|tom)|[–—-])\s*$/i;
const LISTE = /^\s*(?:og|,)\s*$/i;
/** Lengste spenn som godtas (juleferie og påskeferie er kortere). Lengre spenn er trolig feillest. */
const MAKS_DAGER = 21;

interface Token {
  start: number;
  slutt: number;
  ukedag: number | null;
  dag: number;
  maned: number | null;
}

/** Datoene i en tekst: ukedag (valgfri), dag og måned (valgfri). Tall etter «veke» eller «uke» er ikke datoer. */
export function finnDatoer(tekst: string): Token[] {
  const re = new RegExp(`(?:\\b(${UKEDAG})\\s+)?(?<![\\d.,])\\b(\\d{1,2})(?:\\.|(?=\\s+(?:${MANED})\\b))(?:\\s*(${MANED})\\b)?`, 'giu');
  const ut: Token[] = [];
  for (const m of tekst.matchAll(re)) {
    const start = m.index;
    const slutt = start + m[0].length;
    if (!m[1] && /\b(?:veke|uke)\s*$/i.test(tekst.slice(0, start))) continue;
    const ukedag = m[1] ? (UKEDAGER[m[1].toLowerCase()] ?? null) : null;
    const maned = m[3] ? MANEDER.indexOf(m[3].toLowerCase()) + 1 : null;
    // En dag uten måned må følges av et spenn, en liste, tegn eller slutten. «2. pinsedag» er ikke en dato.
    if (maned === null) {
      const etter = tekst.slice(slutt);
      if (/^\s*[\p{L}]/u.test(etter) && !/^\s*(?:til\b|og\b|t\.o\.m|tom\b)/i.test(etter)) continue;
    }
    ut.push({ start, slutt, ukedag, dag: Number(m[2]), maned });
  }
  return ut;
}

/** Et datouttrykk: én dato, et spenn eller en liste, med plassen i teksten. */
interface Uttrykk {
  start: number;
  slutt: number;
  art: 'en' | 'spenn' | 'liste';
  tokens: Token[];
}

/** Datoene gruppert i uttrykk etter teksten mellom dem. Dager uten ukedag eller måned står ikke alene. */
export function grupper(tekst: string, tokens: readonly Token[]): Uttrykk[] {
  const ut: Uttrykk[] = [];
  for (const t of tokens) {
    const forrige = ut[ut.length - 1];
    const mellom = forrige ? tekst.slice(forrige.slutt, t.start) : '';
    if (forrige && SPENN.test(mellom) && forrige.art !== 'liste') {
      forrige.art = forrige.tokens.length === 1 ? 'spenn' : forrige.art;
      forrige.tokens.push(t);
      forrige.slutt = t.slutt;
    } else if (forrige && LISTE.test(mellom) && forrige.art !== 'spenn') {
      forrige.art = 'liste';
      forrige.tokens.push(t);
      forrige.slutt = t.slutt;
    } else ut.push({ start: t.start, slutt: t.slutt, art: 'en', tokens: [t] });
  }
  return ut.filter((u) => u.tokens.some((t) => t.maned !== null || t.ukedag !== null));
}

const iso = (aar: number, mnd: number, dag: number) => `${aar}-${String(mnd).padStart(2, '0')}-${String(dag).padStart(2, '0')}`;
const dato = (s: string) => new Date(`${s}T00:00:00Z`);
const nesteDag = (s: string) => new Date(dato(s).getTime() + 86_400_000).toISOString().slice(0, 10);

/** Ukenummeret etter ISO 8601. */
export function isoUke(s: string): number {
  const d = dato(s);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const forste = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - forste.getTime()) / 86_400_000 + 1) / 7);
}

/** Datoene i et uttrykk som ÅÅÅÅ-MM-DD, kontrollert. Gir grunnen når noe ikke stemmer. */
export function tilDatoer(u: Uttrykk, skolear: string, radmaned: number | null): { datoer: string[] } | { grunn: string } {
  const start = Number(skolear.slice(0, 4));
  if (u.art === 'spenn' && u.tokens.length !== 2) return { grunn: 'Spennet har mer enn to datoer.' };
  const datoer: string[] = [];
  for (const [i, t] of u.tokens.entries()) {
    // Måneden fra neste dato i uttrykket, ellers forrige, ellers raden.
    const maned = t.maned ?? u.tokens.slice(i + 1).find((x) => x.maned !== null)?.maned ?? u.tokens.slice(0, i).reverse().find((x) => x.maned !== null)?.maned ?? radmaned;
    if (maned === null) return { grunn: 'Fant ikke måneden.' };
    const aar = maned >= 8 ? start : start + 1;
    const d = new Date(Date.UTC(aar, maned - 1, t.dag));
    if (d.getUTCMonth() !== maned - 1 || t.dag < 1) return { grunn: `${t.dag}. ${MANEDER[maned - 1]} finnes ikke.` };
    const s = iso(aar, maned, t.dag);
    if (t.ukedag !== null && d.getUTCDay() !== t.ukedag) return { grunn: `${s} er ikke en ${Object.keys(UKEDAGER).find((k) => UKEDAGER[k] === t.ukedag)}.` };
    if (s < `${start}-08-01` || s > `${start + 1}-07-31`) return { grunn: `${s} er utenfor skoleåret ${skolear}.` };
    datoer.push(s);
  }
  if (u.art === 'spenn') {
    const [fra, til] = datoer as [string, string];
    if (fra > til) return { grunn: `Spennet går bakover (${fra}–${til}).` };
    if ((dato(til).getTime() - dato(fra).getTime()) / 86_400_000 > MAKS_DAGER) return { grunn: `Spennet er lengre enn ${MAKS_DAGER} dager (${fra}–${til}).` };
  }
  if (u.art === 'liste' && datoer.some((d, i) => i > 0 && d <= (datoer[i - 1] as string))) return { grunn: 'Datoene i listen kommer ikke i rekkefølge.' };
  return { datoer };
}

const FASTSETT_LOKALT = /fastsett(?:es|ast|e)?\s+lokalt|blir fastsett lokalt|bestemmes lokalt|vert fastsett lokalt/i;
const HELLIGDAG = /kristi himmelfart|grunnlovsdag|pinsedag|påskedag|skjærtorsdag|langfredag|nyttårsdag|juledag|høytidsdag|høgtidsdag|arbeid(?:ar|er)anes dag|arbeidernes dag/i;

/** Typen ut fra teksten og måneden datoen ligger i. */
export function klassifiser(tekst: string, maned: number): Hendelsestype {
  const t = tekst.toLowerCase();
  if (HELLIGDAG.test(t)) return 'helligdag';
  if (/planlegging/.test(t)) return 'planlegging';
  if (/h(?:ø|au)stferie/.test(t)) return 'hostferie';
  if (/juleferie/.test(t)) return 'juleferie';
  if (/vinterferie/.test(t)) return 'vinterferie';
  if (/påskeferie/.test(t)) return 'paskeferie';
  const forste = /(?:første|fyrste) sk[uo]ledag|oppstart/.test(t);
  if (forste && /etter påske/.test(t)) return 'forste-etter-paske';
  if (forste && (/etter jul/.test(t) || maned === 1)) return 'forste-etter-jul';
  if (forste && !/etter/.test(t) && (maned === 8 || maned === 9)) return 'forste-skoledag';
  if (/siste sk[uo]ledag/.test(t) && !/før (?:jul|påske|vinter|haust|høst)/.test(t) && maned >= 5 && maned <= 7) return 'siste-skoledag';
  if (/elevfri|fri for elev|fridag/.test(t)) return 'elevfri';
  return 'annet';
}

/** Ord som viser en hendelse. Brukes for å se om en celle uten linjeskift har flere hendelser. */
const HENDELSESORD = /(?:første|fyrste|siste) sk[uo]ledag|oppstart|ferie|elevfri|fri for elev|fridag|planlegging|kristi himmelfart|grunnlovsdag|pinsedag|høytidsdag|høgtidsdag/i;
const antallHendelsesord = (tekst: string) => (tekst.match(new RegExp(HENDELSESORD.source, 'gi')) ?? []).length;

/**
 * Deler en celle i linjer: linjeskift, setninger («… mai. Fredag …») og der en ny linje må ha forsvunnet («… høytidsdag
 * Onsdag 17. mai …», fordi <br> ble mellomrom før 05.10.2026).
 */
export function linjer(tekst: string): string[] {
  return tekst
    .split('\n')
    .flatMap((l) => l.split(/(?<=[\p{Ll}\d.)])\s+(?=\p{Lu}\p{Ll})/u))
    .map((l) => l.trim())
    .filter(Boolean);
}

interface Kontekst {
  dokument: string;
  skolear: string;
  radmaned: number | null;
}

type Resultat = { hendelser: Hendelse[]; ulest: Ulest[] };

/** Hendelser fra ett datouttrykk og teksten som beskriver det. */
function hendelser(u: Uttrykk, beskrivelse: string, tekst: string, k: Kontekst): Resultat {
  const r = tilDatoer(u, k.skolear, k.radmaned);
  if ('grunn' in r) return { hendelser: [], ulest: [{ dokument: k.dokument, skolear: k.skolear, tekst, grunn: r.grunn }] };
  const uke = /\b(?:veke|uke)\s*(\d{1,2})\b/i.exec(tekst);
  if (uke && isoUke(r.datoer[0] as string) !== Number(uke[1])) {
    return { hendelser: [], ulest: [{ dokument: k.dokument, skolear: k.skolear, tekst, grunn: `${r.datoer[0]} er ikke i uke ${uke[1]}.` }] };
  }
  const type = klassifiser(beskrivelse, Number((r.datoer[0] as string).slice(5, 7)));
  const ny = (fra: string, til?: string): Hendelse => ({ type, fra, ...(til && til !== fra ? { til } : {}), tekst, dokument: k.dokument, skolear: k.skolear });
  if (u.art === 'spenn') return { hendelser: [ny(r.datoer[0] as string, r.datoer[1])], ulest: [] };
  if (u.art === 'liste') {
    const sammenhengende = r.datoer.every((d, i) => i === 0 || d === nesteDag(r.datoer[i - 1] as string));
    return { hendelser: sammenhengende ? [ny(r.datoer[0] as string, r.datoer.at(-1))] : r.datoer.map((d) => ny(d)), ulest: [] };
  }
  return { hendelser: [ny(r.datoer[0] as string)], ulest: [] };
}

/**
 * En celle med merknader (Troms, Finnmark og Rogaland): hver linje har høyst én dato og teksten om den. Linjer uten
 * dato hører til linjen foran («… planleggingsdager VGS. Fri for elevene.»), eller hoppes over når de er fastsatt lokalt.
 */
export function tolkMerknad(celle: string, k: Kontekst): Resultat {
  const ut: Resultat = { hendelser: [], ulest: [] };
  const deler: { tekst: string; uttrykk: Uttrykk[]; tokens: number }[] = [];
  let ventende = '';
  for (const linje of linjer(celle)) {
    const tokens = finnDatoer(linje);
    const uttrykk = grupper(linje, tokens);
    if (uttrykk.length === 0) {
      if (FASTSETT_LOKALT.test(linje)) continue;
      const forrige = deler[deler.length - 1];
      if (forrige) forrige.tekst += ` ${linje}`;
      else ventende += `${linje} `;
      continue;
    }
    deler.push({ tekst: `${ventende}${linje}`, uttrykk, tokens: tokens.length });
    ventende = '';
  }
  if (ventende.trim() && !FASTSETT_LOKALT.test(ventende) && HENDELSESORD.test(ventende)) {
    ut.ulest.push({ dokument: k.dokument, skolear: k.skolear, tekst: ventende.trim(), grunn: 'Fant ingen dato.' });
  }
  for (const g of deler) {
    if (FASTSETT_LOKALT.test(g.tekst)) continue;
    if (g.uttrykk.length > 1) {
      ut.ulest.push({ dokument: k.dokument, skolear: k.skolear, tekst: g.tekst, grunn: 'Flere datoer på samme linje.' });
      continue;
    }
    const r = hendelser(g.uttrykk[0] as Uttrykk, g.tekst, g.tekst, k);
    ut.hendelser.push(...r.hendelser);
    ut.ulest.push(...r.ulest);
  }
  return ut;
}

/** Én linje fra datokolonnen og én fra hendingskolonnen (Vestland). */
function tolkPar(datolinje: string, hending: string, tekst: string, k: Kontekst): Resultat {
  const fra = grupper(datolinje, finnDatoer(datolinje));
  const iHending = grupper(hending, finnDatoer(hending));
  const ulest = (grunn: string): Resultat => ({ hendelser: [], ulest: [{ dokument: k.dokument, skolear: k.skolear, tekst, grunn }] });
  if (!datolinje.trim() && !hending.trim()) return { hendelser: [], ulest: [] };
  if (FASTSETT_LOKALT.test(`${datolinje} ${hending}`)) return { hendelser: [], ulest: [] };
  if (antallHendelsesord(hending) > 1) return ulest('Hendingen ser ut til å ha flere hendelser, men cellen har ikke linjeskift.');
  if (fra.length === 1 && iHending.length === 0) return hendelser(fra[0] as Uttrykk, hending, tekst, k);
  if (fra.length === 0 && iHending.length === 1 && !datolinje.trim()) return hendelser(iHending[0] as Uttrykk, hending, tekst, k);
  if (fra.length === 0 && iHending.length === 0) return HENDELSESORD.test(hending) ? ulest('Fant ingen dato.') : { hendelser: [], ulest: [] };
  return ulest('Datoene og hendingene i cellene kan ikke pares sikkert.');
}

/** En rad med dato og hending i hver sin kolonne. Linjene pares én og én når antallet er likt. */
export function tolkDatoOgHending(datocelle: string, hendingscelle: string, k: Kontekst): Resultat {
  const d = datocelle.replace(/\s+$/, '').split('\n').map((l) => l.trim());
  const h = hendingscelle.replace(/\s+$/, '').split('\n').map((l) => l.trim());
  const tekst = (dl: string, hl: string) => [hl, dl].filter(Boolean).join(': ');
  if (d.length !== h.length) {
    return { hendelser: [], ulest: [{ dokument: k.dokument, skolear: k.skolear, tekst: tekst(datocelle.replace(/\n/g, ' / '), hendingscelle.replace(/\n/g, ' / ')), grunn: `${d.length} linjer med dato og ${h.length} med hending.` }] };
  }
  const ut: Resultat = { hendelser: [], ulest: [] };
  for (const [i, dl] of d.entries()) {
    const r = tolkPar(dl, h[i] as string, tekst(dl, h[i] as string), k);
    ut.hendelser.push(...r.hendelser);
    ut.ulest.push(...r.ulest);
  }
  return ut;
}

const rentekst = (segmenter: readonly Segment[]) => segmenter.map((s) => (typeof s === 'string' ? s : 't' in s ? s.t : '')).join('').trim();

/** Skoleåret i en tekst («skoleåret 2025–2026», «2026/2027»). */
export function skolearI(tekst: string): string | null {
  const m = /(20\d\d)\s*[–/-]\s*(20\d\d)/.exec(tekst);
  return m && Number(m[2]) === Number(m[1]) + 1 ? `${m[1]}-${m[2]}` : null;
}

/** Skoleåret for hele forskriften, når den gjelder ett skoleår (1. august–31. juli). */
function skolearForDokument(d: Lovdokument): string | null {
  if (!d.iKraft || !d.iKraftTil) return skolearI(d.tittel);
  const start = Number(d.iKraft.slice(0, 4)) - (Number(d.iKraft.slice(5, 7)) < 7 ? 1 : 0);
  const slutt = Number(d.iKraftTil.slice(0, 4)) + (Number(d.iKraftTil.slice(5, 7)) >= 8 ? 1 : 0);
  return slutt === start + 1 ? `${start}-${slutt}` : skolearI(d.tittel);
}

const manedI = (tekst: string): number | null => {
  const i = MANEDER.indexOf(tekst.trim().toLowerCase());
  return i >= 0 ? i + 1 : null;
};

/** Leser en skolerute. Hver tabell tolkes for skoleåret i paragrafen den står i, ellers forskriftens skoleår. */
export function tolkSkolerute(d: Lovdokument): { dokumenter: Skoleruteinfo[]; hendelser: Hendelse[]; ulest: Ulest[] } {
  const hendelserUt: Hendelse[] = [];
  const ulest: Ulest[] = [];
  const skolear = new Set<string>();
  const tekster: string[] = [];
  for (const { paragraf } of alleParagrafer(d.seksjoner)) {
    const ar = skolearI(paragraf.tittel) ?? skolearForDokument(d);
    for (const ledd of paragraf.ledd) {
      tekster.push(rentekst(ledd.tekst));
      const t = ledd.tabell;
      if (!t) continue;
      const rader = [...(t.hode ? [t.hode] : []), ...t.rader].map((r) => r.map(rentekst));
      if (!ar) {
        ulest.push({ dokument: d.id, skolear: '', tekst: paragraf.tittel, grunn: 'Fant ikke skoleåret for tabellen.' });
        continue;
      }
      // Overskriftsraden kan stå under en rad med «Høst 2027» (Troms).
      const hodeIndeks = rader.findIndex((r) => /^(måned|månad)$/i.test(r[0] ?? ''));
      const hode = rader[hodeIndeks]?.map((c) => c.toLowerCase()) ?? [];
      const kolonne = (re: RegExp) => hode.findIndex((c, i) => i > 0 && re.test(c));
      const merknad = kolonne(/merknad/);
      const datoKol = kolonne(/dato|veke|uke/);
      const hending = kolonne(/hending|hendelse/);
      if (hodeIndeks < 0 || (merknad < 0 && (datoKol < 0 || hending < 0))) {
        ulest.push({ dokument: d.id, skolear: ar, tekst: rader[0]?.join(' | ') ?? '', grunn: 'Kjenner ikke igjen kolonnene i tabellen.' });
        continue;
      }
      skolear.add(ar);
      for (const rad of rader.slice(hodeIndeks + 1)) {
        const maned = manedI(rad[0] ?? '');
        // Rader som ikke er en måned, er summer («Antall skoledager …»).
        if (maned === null) continue;
        const k: Kontekst = { dokument: d.id, skolear: ar, radmaned: maned };
        const r = merknad >= 0 ? tolkMerknad(rad[merknad] ?? '', k) : tolkDatoOgHending(rad[datoKol] ?? '', rad[hending] ?? '', k);
        hendelserUt.push(...r.hendelser);
        ulest.push(...r.ulest);
      }
    }
  }
  const vertskommune = tekster.some((t) => /vertskommun/i.test(t));
  const ar = skolear.size > 0 ? [...skolear] : [skolearForDokument(d) ?? ''];
  return {
    dokumenter: ar.sort().map((s) => ({ id: d.id, refid: d.refid, skolear: s, malform: d.malform, vertskommune })),
    hendelser: hendelserUt,
    ulest,
  };
}

/** Samme hendelse to ganger (påskeferien står både i mars og april i Rogaland) tas med én gang. */
function unike<T>(liste: readonly T[], nokkel: (x: T) => string): T[] {
  const sett = new Set<string>();
  return liste.filter((x) => {
    const n = nokkel(x);
    if (sett.has(n)) return false;
    sett.add(n);
    return true;
  });
}

/** Skolerutene for alle fylkene, fra de lokale forskriftene med lokaltype skolerute. */
export function lagSkoleruter(dokumenter: readonly Lovdokument[], lest: string): Skoleruter {
  const fylker: Skoleruter['fylker'] = {};
  const ulest: Ulest[] = [];
  const ruter = dokumenter.filter((d) => d.lokaltype === 'skolerute' && d.gyldighet.niva !== 'nasjonal').sort((a, b) => a.id.localeCompare(b.id));
  for (const d of ruter) {
    const fylke = d.gyldighet.niva === 'nasjonal' ? '' : d.gyldighet.fylke;
    const r = tolkSkolerute(d);
    const f = (fylker[fylke] ??= { dokumenter: [], hendelser: [] });
    f.dokumenter.push(...r.dokumenter);
    f.hendelser.push(...r.hendelser);
    ulest.push(...r.ulest);
  }
  for (const f of Object.values(fylker)) {
    f.hendelser = unike(f.hendelser, (h) => `${h.skolear} ${h.type} ${h.fra} ${h.til ?? ''}`).sort((a, b) => a.fra.localeCompare(b.fra) || (a.til ?? a.fra).localeCompare(b.til ?? b.fra));
    f.dokumenter.sort((a, b) => a.skolear.localeCompare(b.skolear) || a.id.localeCompare(b.id));
  }
  return {
    lest,
    fylker: Object.fromEntries(Object.entries(fylker).sort(([a], [b]) => a.localeCompare(b))),
    ulest: unike(ulest, (u) => `${u.dokument} ${u.skolear} ${u.tekst}`),
  };
}
