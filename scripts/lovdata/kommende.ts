// Kommende endringer i lovene og forskriftene i content/lovverk.yaml (fase 6, pakke 5, avgjørelse 061), i
// data/lovdata/kommende.json. Kalenderen viser når en vedtatt endring tar til å gjelde. To kilder:
// 1. Notatene om endringer i datasettene fra Lovdata: «Vert endra ved lov 12 juni 2026 nr. 22 (i kraft 1 juli 2028).»
//    og «Endres ved lov 19 juni 2026 nr. 48 (i kraft fra den tid Kongen bestemmer).». De gir paragrafene. I Actions
//    leses notatene fra hele dokumentet, før utvalget av kapitler.
// 2. Norsk Lovtidend avdeling I, hver uke, som avdeling II for de lokale forskriftene: kunngjøringene siden forrige
//    gang fra departementene som eier dokumentene (eller med dokumentet i tittelen) hentes. En kunngjøring tas med når
//    «Endrer» (metaField_endrer) har et av dokumentene, eller en endringslov som venter på dato. Da fanges også
//    «Ikrafttredelse av …», som kommer senere og gir datoen.
// Endringer som har tatt til å gjelde, fjernes. Teksten i Regelverk endres først når datasettet har den nye teksten.
// Alt unntatt lesLovtidendAvd1 er rene funksjoner, testet i tests/unit/kommende.test.ts.
import { parse } from 'node-html-parser';
import { z } from 'zod';
import { alleParagrafer, type Lovdokument, type Segment } from '../../src/modules/lov/typer.ts';
import { erElement, klasse, rydd, segmenter, tag } from './les.ts';
import { hentTekst, IkkeFunnet, pause } from './lokale.ts';
import { type Kunngjoring, lesKunngjoringstidspunkter, lesLovtidendside, lesMetadata, tidspunkt } from './register.ts';

const LOVDATA = 'https://lovdata.no';

const endringSkjema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** Dokumentet i content/lovverk.yaml (og data/lovdata/<id>.json). */
    dokument: z.string().regex(/^[a-z0-9-]+$/),
    /** Paragrafene som endres («6-6»). Tom når kunngjøringen ikke sier hvilke. */
    paragrafer: z.array(z.string()),
    endretVed: z.object({ refid: z.string().regex(/^(?:lov|forskrift)\/\d{4}-\d{2}-\d{2}(?:-\d+)?$/), tittel: z.string().min(1) }).strict(),
    /** Datoen endringen tar til å gjelde (ÅÅÅÅ-MM-DD), eller null når den ikke er satt («Kongen bestemmer»). */
    iKraft: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    /** Teksten om ikrafttredelsen i kilden, uendret. */
    iKraftTekst: z.string(),
    /** Kunngjøringen hos Lovdata. */
    kunngjoring: z.string().url().nullable(),
    kilde: z.enum(['datasett', 'lovtidend']),
  })
  .strict();
export type KommendeEndring = z.infer<typeof endringSkjema>;

export const kommendeSkjema = z
  .object({
    lest: z.string(),
    /** Tidspunktet for den nyeste kunngjøringen i Lovtidend avdeling I som er lest («2026-10-02T15:00»). */
    lovtidendAvd1: z.string().nullable(),
    endringer: z.array(endringSkjema),
  })
  .strict();
export type KommendeEndringer = z.infer<typeof kommendeSkjema>;

/** Et dokument i lovverk.yaml, med det som trengs her. */
export interface Lovverkdokument {
  id: string;
  refid: string;
  korttittel: string;
  tittel: string;
  /** Paragrafene med notatene om endringer. */
  paragrafer: { nr: string; endringer: Segment[][] }[];
}

const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
/** Månedene slik Lovdata forkorter dem i notatene («1 jan 2026», «1 sep 2027»). */
const KORT: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, des: 12 };

/** «lov/2026-06-12-22» → «lov 12. juni 2026 nr. 22». */
export function lovtittel(refid: string): string {
  const m = /^(lov|forskrift)\/(\d{4})-(\d{2})-(\d{2})(?:-(\d+))?/.exec(refid);
  if (!m) return refid;
  return `${m[1]} ${Number(m[4])}. ${MANEDER[Number(m[3]) - 1]} ${m[2]}${m[5] ? ` nr. ${m[5]}` : ''}`;
}

/**
 * Datoen i en tekst om ikrafttredelse: «i kraft 1 juli 2028» (notatene), «01.10.2026» og «01.10.2026, for 01.08.2026 –
 * 31.07.2027» (Lovtidend). Den første datoen gjelder. Uten dato («Kongen bestemmer», «Byrådet bestemmer») gir null.
 */
export function tolkIkraft(tekst: string): string | null {
  const norsk = /(\d{2})\.(\d{2})\.(\d{4})/.exec(tekst);
  const ord = /(\d{1,2})\.?\s+([a-zæøå]+)\.?\s+(\d{4})/i.exec(tekst);
  const fraOrd = ord ? (KORT[(ord[2] as string).toLowerCase().slice(0, 3)] ?? null) : null;
  const kandidater = [
    ...(norsk ? [{ i: norsk.index, d: `${norsk[3]}-${norsk[2]}-${norsk[1]}` }] : []),
    ...(ord && fraOrd ? [{ i: ord.index, d: `${ord[3]}-${String(fraOrd).padStart(2, '0')}-${String(ord[1]).padStart(2, '0')}` }] : []),
  ].sort((a, b) => a.i - b.i);
  return kandidater[0]?.d ?? null;
}

/** Notatene som gjelder en kommende endring: «Endres ved», «Oppheves ved», «Vert endra ved», «Vert oppheva ved» … */
const FRAMTID = /\b(?:Endres|Oppheves|Tilføyes|Blir (?:endret|endra|opphevet|oppheva)|Vert (?:endra|oppheva|tilføydd|tilføyd))\s+ved\b/g;
const ENDRINGSLOV = /^(?:lov|forskrift)\/\d{4}-\d{2}-\d{2}(?:-\d+)?$/;

/**
 * De kommende endringene i ett notat: endringsloven (lenken) og teksten om ikrafttredelsen i parentesen etter den.
 * «Endra ved lov A (i kraft …). Vert endra ved lov B (i kraft 1 juli 2028).» gir bare B.
 */
export function lesNotat(notat: readonly Segment[]): { refid: string; iKraft: string | null; iKraftTekst: string }[] {
  const ut: { refid: string; iKraft: string | null; iKraftTekst: string }[] = [];
  // Teksten med plassen til hver lenke, så markøren kan finnes i teksten og lenkene etter den leses i rekkefølge.
  let tekst = '';
  const lenker: { start: number; slutt: number; l: string }[] = [];
  for (const s of notat) {
    if (typeof s === 'string') tekst += s;
    else if ('t' in s) {
      lenker.push({ start: tekst.length, slutt: tekst.length + s.t.length, l: s.l });
      tekst += s.t;
    }
  }
  for (const m of tekst.matchAll(FRAMTID)) {
    let dybde = 0;
    let gjeldende: { refid: string; tekst: string } | null = null;
    const ferdig = () => {
      if (gjeldende) ut.push({ refid: gjeldende.refid, iKraft: tolkIkraft(gjeldende.tekst), iKraftTekst: gjeldende.tekst.trim() });
      gjeldende = null;
    };
    for (let i = (m.index ?? 0) + m[0].length; i < tekst.length; i++) {
      const lenke = lenker.find((x) => x.start === i)?.l;
      if (lenke && dybde === 0 && ENDRINGSLOV.test(lenke)) {
        ferdig();
        gjeldende = { refid: lenke, tekst: '' };
      }
      const c = tekst[i] as string;
      if (c === '(') {
        dybde++;
        if (dybde === 1) continue;
      } else if (c === ')') {
        dybde--;
        if (dybde === 0) continue;
      }
      if (dybde > 0 && gjeldende) (gjeldende as { tekst: string }).tekst += c;
      // Punktum etter parentesen avslutter setningen. Punktum i lenketeksten («nr. 22») teller ikke.
      else if (dybde === 0 && c === '.' && !lenker.some((x) => x.start <= i && i < x.slutt)) break;
    }
    ferdig();
  }
  return ut;
}

/** Notatene om endringer per paragraf i hele dokumentet fra datasettet (XML), før utvalget av kapitler. */
export function lesNotaterFraXml(html: string): { nr: string; endringer: Segment[][] }[] {
  const rot = parse(html);
  return rot.querySelectorAll('article.legalArticle').flatMap((el) => {
    const nr = (el.getAttribute('data-name') ?? '').replace(/^§\s*/, '');
    const endringer = el.childNodes
      .filter(erElement)
      .filter((b) => tag(b) === 'article' && klasse(b, 'changesToParent'))
      .map((b) => rydd(segmenter(b)));
    return nr && endringer.length > 0 ? [{ nr, endringer }] : [];
  });
}

/**
 * Notatene fra datasettet for paragrafene i utvalget. Har dokumentet et utvalg av enkeltparagrafer (f.eks. straffeloven
 * § 196), gjelder bare de. Ellers leses hele dokumentet, også utenfor utvalget av kapitler.
 */
export function notaterIUtvalg(
  notater: { nr: string; endringer: Segment[][] }[],
  paragrafer: readonly string[] | undefined,
): { nr: string; endringer: Segment[][] }[] {
  if (!paragrafer) return notater;
  const valgte = new Set(paragrafer);
  return notater.filter((p) => valgte.has(p.nr));
}

/** Departementet i hodet på dokumentet fra datasettet (<dd class="ministry">), ett eller flere. */
export function lesDepartementer(html: string): string[] {
  const dd = parse(html).querySelector('header.documentHeader dd.ministry');
  if (!dd) return [];
  const li = dd.querySelectorAll('li').map((l) => l.text.replace(/\s+/g, ' ').trim());
  return (li.length > 0 ? li : dd.text.split(/,|\n/)).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

/** Notatene i et dokument fra data/lovdata (etter utvalget av kapitler), når hele dokumentet ikke er lest. */
export function notaterIDokument(d: Lovdokument): { nr: string; endringer: Segment[][] }[] {
  return alleParagrafer(d.seksjoner)
    .map(({ paragraf }) => ({ nr: paragraf.nr, endringer: paragraf.endringer }))
    .filter((p) => p.endringer.length > 0);
}

const lagId = (dokument: string, refid: string) => `${dokument}-${refid.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
const kunngjoringFor = (refid: string) => `${LOVDATA}/dokument/LTI/${refid}`;

/**
 * De kommende endringene fra notatene i datasettene: bare endringer som ikke gjelder ennå (dato etter i dag, eller
 * ingen dato), gruppert per dokument og endringslov.
 */
export function endringerFraNotater(dokumenter: readonly Lovverkdokument[], idag: string): KommendeEndring[] {
  const ut = new Map<string, KommendeEndring>();
  for (const d of dokumenter) {
    for (const p of d.paragrafer) {
      for (const notat of p.endringer) {
        for (const e of lesNotat(notat)) {
          if (e.iKraft !== null && e.iKraft <= idag) continue;
          const id = lagId(d.id, e.refid);
          const x = ut.get(id);
          if (x) {
            if (!x.paragrafer.includes(p.nr)) x.paragrafer.push(p.nr);
            continue;
          }
          ut.set(id, {
            id,
            dokument: d.id,
            paragrafer: [p.nr],
            endretVed: { refid: e.refid, tittel: lovtittel(e.refid) },
            iKraft: e.iKraft,
            iKraftTekst: e.iKraftTekst,
            kunngjoring: kunngjoringFor(e.refid),
            kilde: 'datasett',
          });
        }
      }
    }
  }
  return [...ut.values()];
}

/** En linje til kontrollsaken, med dokumentet den gjelder. */
export interface Rapportlinje {
  dokument: string;
  tekst: string;
}

/** En kunngjøring i Lovtidend avdeling I med det som står i metadataene. */
export interface Avd1kunngjoring {
  refid: string;
  tittel: string;
  /** «Endrer»: adressene hos Lovdata, f.eks. «lov/2023-06-09-30» eller «lov/2023-06-09-30/§6-6». */
  endrer: string[];
  /** Teksten i «Ikrafttredelse», uendret. */
  iKraftTekst: string;
}

/** Metadataene på siden til en kunngjøring i avdeling I. */
export function lesAvd1kunngjoring(html: string, k: Pick<Kunngjoring, 'refid' | 'tittel'>): Avd1kunngjoring {
  const meta = lesMetadata(html);
  const ikraft = (parse(html).querySelector('#metaField_ikraft')?.text ?? '').replace(/\s+/g, ' ').trim();
  return { refid: k.refid, tittel: meta.tittel || k.tittel, endrer: meta.endrer, iKraftTekst: ikraft };
}

/** Dokumentet i lovverk.yaml en adresse i «Endrer» gjelder, og paragrafen når adressen har en. */
function iLovverk(adresse: string, lovverk: readonly Pick<Lovverkdokument, 'id' | 'refid'>[]): { id: string; nr: string | null } | null {
  for (const d of lovverk) {
    if (adresse === d.refid) return { id: d.id, nr: null };
    if (adresse.startsWith(`${d.refid}/`)) {
      const nr = /\/§([^/]+)/.exec(adresse.slice(d.refid.length));
      return { id: d.id, nr: nr ? (nr[1] as string) : null };
    }
  }
  return null;
}

/**
 * Tar kunngjøringene fra avdeling I inn i listen:
 * - En ikrafttredelse (tittelen, eller «Endrer» har en endringslov som venter på dato) gir datoen til endringene som
 *   venter på den. Finnes ingen, men «Endrer» har et dokument i lovverk.yaml, blir det en ny endring.
 * - En endringslov eller -forskrift med et dokument i «Endrer» blir en ny endring, eller gir datoen til en som finnes.
 * Gir den nye listen og en linje per endring til rapporten.
 */
export function brukKunngjoringer(
  endringer: readonly KommendeEndring[],
  kunngjoringer: readonly Avd1kunngjoring[],
  lovverk: readonly Pick<Lovverkdokument, 'id' | 'refid'>[],
): { endringer: KommendeEndring[]; rapport: Rapportlinje[] } {
  const ut = endringer.map((e) => ({ ...e, paragrafer: [...e.paragrafer], endretVed: { ...e.endretVed } }));
  const rapport: Rapportlinje[] = [];
  for (const k of kunngjoringer) {
    const iKraft = tolkIkraft(k.iKraftTekst);
    const url = `${LOVDATA}/dokument/LTI/${k.refid}`;
    const dokumenter = new Map<string, Set<string>>();
    const andre: string[] = [];
    for (const a of k.endrer) {
      const treff = iLovverk(a, lovverk);
      if (treff) {
        const p = dokumenter.get(treff.id) ?? new Set<string>();
        if (treff.nr) p.add(treff.nr);
        dokumenter.set(treff.id, p);
      } else if (ENDRINGSLOV.test(a.split('/§')[0] as string)) andre.push(a.split('/§')[0] as string);
    }
    const venter = andre.filter((r) => ut.some((e) => e.endretVed.refid === r && e.iKraft === null));
    const ikrafttredelse = /^(?:ikrafttredelse|ikraftsetjing|ikraftsetting|delvis ikraft)/i.test(k.tittel) || venter.length > 0;
    if (ikrafttredelse) {
      let funnet = false;
      for (const r of andre) {
        for (const e of ut.filter((x) => x.endretVed.refid === r)) {
          funnet = true;
          if (iKraft === null || e.iKraft === iKraft) continue;
          e.iKraft = iKraft;
          e.iKraftTekst = k.iKraftTekst;
          e.kunngjoring = url;
          rapport.push({ dokument: e.dokument, tekst: `Dato satt: ${e.dokument} endret ved ${e.endretVed.tittel} gjelder fra ${iKraft} (${k.tittel}).` });
        }
      }
      if (funnet) continue;
    }
    for (const [dokument, paragrafer] of dokumenter) {
      const endretVed = ikrafttredelse && andre.length === 1 ? (andre[0] as string) : k.refid;
      const id = lagId(dokument, endretVed);
      const finnes = ut.find((e) => e.id === id);
      if (finnes) {
        for (const p of paragrafer) if (!finnes.paragrafer.includes(p)) finnes.paragrafer.push(p);
        if (finnes.iKraft === null && iKraft !== null) {
          finnes.iKraft = iKraft;
          finnes.iKraftTekst = k.iKraftTekst;
          rapport.push({ dokument, tekst: `Dato satt: ${dokument} endret ved ${finnes.endretVed.tittel} gjelder fra ${iKraft} (${k.tittel}).` });
        }
        finnes.kunngjoring = url;
        continue;
      }
      ut.push({
        id,
        dokument,
        paragrafer: [...paragrafer],
        endretVed: { refid: endretVed, tittel: lovtittel(endretVed) },
        iKraft,
        iKraftTekst: k.iKraftTekst,
        kunngjoring: url,
        kilde: 'lovtidend',
      });
      rapport.push({ dokument, tekst: `Ny: ${dokument} endres ved ${lovtittel(endretVed)}, ${iKraft ? `gjelder fra ${iKraft}` : `uten dato (${k.iKraftTekst || 'ikke oppgitt'})`} (${k.tittel}).` });
    }
  }
  return { endringer: ut, rapport };
}

/**
 * Den nye listen: endringene fra notatene, endringene fra Lovtidend fra forrige gang og de nye kunngjøringene.
 * - En endring fra notatene som forrige gang fikk dato fra Lovtidend, beholder datoen til datasettet har den.
 * - En endring fra notatene som ikke står i notatene lenger, er tatt inn i teksten og fjernes. En fra Lovtidend
 *   blir stående til datoen er passert.
 * - Endringer som har tatt til å gjelde (dato før i dag), fjernes.
 */
export function oppdaterKommende(
  forrige: KommendeEndringer | null,
  fraNotater: readonly KommendeEndring[],
  kunngjoringer: readonly Avd1kunngjoring[],
  lovverk: readonly Pick<Lovverkdokument, 'id' | 'refid'>[],
  valg: { idag: string; lovtidendAvd1: string | null },
): { kommende: KommendeEndringer; rapport: Rapportlinje[] } {
  const gamle = new Map((forrige?.endringer ?? []).map((e) => [e.id, e]));
  const dokumenter = new Set(lovverk.map((d) => d.id));
  const notater = fraNotater.map((e) => {
    const g = gamle.get(e.id);
    return g && e.iKraft === null && g.iKraft !== null ? { ...e, iKraft: g.iKraft, iKraftTekst: g.iKraftTekst, kunngjoring: g.kunngjoring } : e;
  });
  const ider = new Set(notater.map((e) => e.id));
  const fraLovtidend = [...gamle.values()].filter((e) => e.kilde === 'lovtidend' && !ider.has(e.id));
  const { endringer, rapport } = brukKunngjoringer([...notater, ...fraLovtidend], kunngjoringer, lovverk);
  const gjeldende = endringer
    .filter((e) => dokumenter.has(e.dokument) && (e.iKraft === null || e.iKraft >= valg.idag))
    .sort((a, b) => (a.iKraft ?? '9999').localeCompare(b.iKraft ?? '9999') || a.id.localeCompare(b.id));
  const nye = new Set(gjeldende.map((e) => e.id));
  for (const e of fraNotater) {
    if (!gamle.has(e.id)) rapport.push({ dokument: e.dokument, tekst: `Ny i datasettet: ${e.dokument} §§ ${e.paragrafer.join(', ')} endres ved ${e.endretVed.tittel}, ${e.iKraft ? `gjelder fra ${e.iKraft}` : 'uten dato'}.` });
  }
  for (const g of gamle.values()) {
    if (!nye.has(g.id)) rapport.push({ dokument: g.dokument, tekst: `Borte: ${g.dokument} endret ved ${g.endretVed.tittel}${g.iKraft ? ` (gjelder fra ${g.iKraft})` : ''}.` });
  }
  return { kommende: { lest: valg.idag, lovtidendAvd1: valg.lovtidendAvd1, endringer: gjeldende }, rapport };
}

/** Stammen i navnet på et dokument, så bokmål og nynorsk treffer likt: «Opplæringslova» → «opplæringslov». */
export function navnestamme(navn: string): string {
  return navn.toLowerCase().replace(/(?:a|en|et|e)$/, '');
}

/**
 * Om en kunngjøring i listen i avdeling I kan gjelde dokumentene: fra et av departementene, med navnet på et dokument i
 * tittelen, eller med en endringslov som venter på dato i tittelen («Ikrafttredelse av lov 19. juni 2026 nr. 36 …»).
 */
export function erAktuell(k: Kunngjoring, departementer: ReadonlySet<string>, navn: readonly string[], venter: readonly string[]): boolean {
  if (k.avdeling !== 'LTI') return false;
  if (k.departement && k.departement.split(',').some((d) => departementer.has(d.trim()))) return true;
  const t = k.tittel.toLowerCase();
  return navn.some((n) => t.includes(n)) || venter.some((v) => t.includes(lovtittel(v).replace(/^(?:lov|forskrift) /, '')));
}

/** Når Lovtidend leses første gang, leses kunngjøringene de siste fire ukene. Notatene i datasettet dekker resten. */
const FORSTE_GANG_DAGER = 28;

/**
 * Kunngjøringene i Lovtidend avdeling I siden forrige lesing (`fra`, «2026-10-02T15:00»), som avdeling II
 * (avgjørelse 061): ett tidspunkt om gangen, og sidene bare for de aktuelle kunngjøringene. Gir de nyeste tidspunktet.
 */
export async function lesLovtidendAvd1(
  fra: string | null,
  valg: { departementer: ReadonlySet<string>; navn: readonly string[]; venter: readonly string[]; idag: string; pauseMs?: number },
): Promise<{ kunngjoringer: Avd1kunngjoring[]; nyeste: string | null; rapport: string[] }> {
  const ms = valg.pauseMs ?? 1000;
  const start = fra ?? `${new Date(Date.parse(valg.idag) - FORSTE_GANG_DAGER * 86_400_000).toISOString().slice(0, 10)}T00:00`;
  const meny = lesKunngjoringstidspunkter(await hentTekst(`${LOVDATA}/register/lovtidend?avdeling=LTI`));
  await pause(ms);
  if (meny.length === 0) throw new Error('Fant ingen tidspunkter for kunngjøring i Lovtidend avdeling I. Siden kan ha fått ny struktur.');
  const rapport: string[] = [];
  if (fra && tidspunkt(meny.at(-1) as string) > fra) rapport.push(`Lovtidend avdeling I: menyen går ikke tilbake til ${fra} (årsskiftet). Kunngjøringer fra før ${tidspunkt(meny.at(-1) as string)} kan mangle.`);
  const kunngjoringer: Avd1kunngjoring[] = [];
  for (const t of meny.filter((x) => tidspunkt(x) > start).reverse()) {
    const side = lesLovtidendside(await hentTekst(`${LOVDATA}/register/lovtidend?avdeling=LTI&kunngjortDato=${encodeURIComponent(t)}`));
    await pause(ms);
    if (side.neste) rapport.push(`Lovtidend avdeling I: ${t} har flere kunngjøringer enn én side viser. Noen kan mangle.`);
    for (const k of side.treff.filter((x) => erAktuell(x, valg.departementer, valg.navn, valg.venter))) {
      try {
        kunngjoringer.push(lesAvd1kunngjoring(await hentTekst(`${LOVDATA}/dokument/LTI/${k.refid}`), k));
      } catch (e) {
        if (!(e instanceof IkkeFunnet)) throw e;
        rapport.push(`Fant ikke kunngjøringen i Lovtidend avdeling I: ${k.tittel} (${k.refid}).`);
      } finally {
        await pause(ms);
      }
    }
  }
  return { kunngjoringer, nyeste: meny[0] ? tidspunkt(meny[0]) : fra, rapport };
}
