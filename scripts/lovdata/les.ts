// Leser en lov eller forskrift fra Lovdatas gratis datasett (NLOD 2.0) til dataene i appen (fase 3, avgjørelse 039).
//
// Strukturen i filene hos Lovdata:
// - <main class="documentBody"> har deler og kapitler som <section class="section" data-name="del3|kap11|kapI">,
//   med overskriften som første <h2>–<h5>. Kapitler kan ha avsnitt inni («I. Fellesreglar» i opplæringsforskrifta).
// - En paragraf er <article class="legalArticle" data-name="§11-1"> med <h? class="legalArticleHeader"> (nummer og
//   tittel), ledd som <article class="legalP">, merknader om endringer (<article class="changesToParent">) og
//   fotnoter (<footer class="footnotes">).
// - Lister er <ol class="defaultList"> med <li data-name="a."><article class="listArticle"><article class="legalP">.
//   Tekst etter en liste i samme ledd er <p class="leddfortsettelse">.
// - Heimelen for et kapittel i en forskrift står som <article class="defaultP"> under overskriften.
//
// Står det noe annet i teksten (f.eks. en tabell), kastes en feil, så ingen tekst blir borte uten at det merkes.
import { type HTMLElement, type Node, NodeType, parse } from 'node-html-parser';
import type { Ledd, Lovdokument, Paragraf, Punkt, Seksjon, Segment } from '../../src/modules/lov/typer.ts';

const klasse = (el: HTMLElement, k: string) => (el.getAttribute('class') ?? '').split(/\s+/).includes(k);
const tag = (el: HTMLElement) => el.tagName.toLowerCase();
const erElement = (n: Node): n is HTMLElement => n.nodeType === NodeType.ELEMENT_NODE;
const overskrift = /^h[1-6]$/;

/** Beskrivelse av et element til feilmeldinger: «table», «div.noe». */
function beskriv(el: HTMLElement): string {
  const k = el.getAttribute('class');
  return `${tag(el)}${k ? `.${k.split(/\s+/).join('.')}` : ''}`;
}

class Ukjent extends Error {}

/** Slår sammen tekst ved siden av hverandre og fjerner overflødige mellomrom. */
function rydd(segmenter: Segment[]): Segment[] {
  const ut: Segment[] = [];
  for (const s of segmenter) {
    const forrige = ut[ut.length - 1];
    if (typeof s === 'string' && typeof forrige === 'string') ut[ut.length - 1] = forrige + s;
    else ut.push(s);
  }
  const renset = ut
    .map((s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ') : 't' in s ? { ...s, t: s.t.replace(/\s+/g, ' ').trim() } : s))
    .filter((s) => s !== '');
  const forste = renset[0];
  if (typeof forste === 'string') renset[0] = forste.trimStart();
  const siste = renset[renset.length - 1];
  if (typeof siste === 'string') renset[renset.length - 1] = siste.trimEnd();
  return renset.filter((s) => s !== '');
}

/**
 * Teksten i et element som segmenter: tekst, lenker og fotnotehenvisninger. Elementene i `hopp` (lister og tekst
 * etter lister) leses for seg og hoppes over her.
 */
function segmenter(el: HTMLElement, hopp: (e: HTMLElement) => boolean = () => false): Segment[] {
  const ut: Segment[] = [];
  for (const n of el.childNodes) {
    if (n.nodeType === NodeType.TEXT_NODE) {
      ut.push(n.text);
      continue;
    }
    if (!erElement(n) || hopp(n)) continue;
    const t = tag(n);
    if (t === 'a') {
      const href = n.getAttribute('href');
      const tekst = n.text.replace(/\s+/g, ' ');
      if (href && !href.startsWith('#') && tekst.trim()) ut.push({ t: tekst, l: href });
      else ut.push(tekst);
    } else if (t === 'sup' && klasse(n, 'footnotereference')) {
      ut.push({ f: n.text.trim() });
    } else if (t === 'i' || t === 'em' || t === 'strong' || t === 'b' || t === 'span' || t === 'sub' || t === 'sup') {
      ut.push(...segmenter(n));
    } else if (t === 'br') {
      ut.push(' ');
    } else {
      throw new Ukjent(beskriv(n));
    }
  }
  return ut;
}

const erListe = (e: HTMLElement) => tag(e) === 'ol' || tag(e) === 'ul';
const erFortsettelse = (e: HTMLElement) => tag(e) === 'p' && klasse(e, 'leddfortsettelse');

/** Et ledd (article.legalP), med lister og tekst etter listene. */
function lesLedd(el: HTMLElement): Ledd {
  const ledd: Ledd = { tekst: rydd(segmenter(el, (e) => erListe(e) || erFortsettelse(e))) };
  for (const barn of el.childNodes.filter(erElement)) {
    if (erListe(barn)) (ledd.liste ??= []).push(...lesListe(barn));
    else if (erFortsettelse(barn)) (ledd.etter ??= []).push(rydd(segmenter(barn)));
  }
  return ledd;
}

function lesListe(el: HTMLElement): Punkt[] {
  return el.childNodes.filter(erElement).map((li) => {
    if (tag(li) !== 'li') throw new Ukjent(`${beskriv(li)} i en liste`);
    const merke = li.getAttribute('data-name') ?? '';
    const ledd: Ledd[] = [];
    for (const barn of li.childNodes.filter(erElement)) {
      if (tag(barn) === 'article' && klasse(barn, 'listArticle')) {
        for (const l of barn.childNodes.filter(erElement)) {
          if (tag(l) === 'article' && (klasse(l, 'legalP') || klasse(l, 'numberedLegalP'))) ledd.push(lesLedd(l));
          else if (erListe(l)) ledd.push({ tekst: [], liste: lesListe(l) });
          else throw new Ukjent(`${beskriv(l)} i et listepunkt`);
        }
      } else if (tag(barn) === 'article' && klasse(barn, 'legalP')) {
        ledd.push(lesLedd(barn));
      } else {
        throw new Ukjent(`${beskriv(barn)} i et listepunkt`);
      }
    }
    // Punkter uten egne elementer har teksten rett i <li>.
    if (ledd.length === 0) ledd.push({ tekst: rydd(segmenter(li)) });
    return { merke, ledd };
  });
}

function lesParagraf(el: HTMLElement): Paragraf {
  const navn = el.getAttribute('data-name') ?? '';
  const hode = el.childNodes.filter(erElement).find((e) => klasse(e, 'legalArticleHeader'));
  const p: Paragraf = {
    nr: navn.replace(/^§\s*/, ''),
    visNr: (hode?.querySelector('.legalArticleValue')?.text ?? navn).replace(/\s+/g, ' ').trim(),
    tittel: (hode?.querySelector('.legalArticleTitle')?.text ?? '').replace(/\s+/g, ' ').trim(),
    ledd: [],
    endringer: [],
    fotnoter: [],
  };
  if (!p.nr) throw new Error(`En paragraf mangler nummer (${el.getAttribute('id') ?? 'uten id'}).`);
  for (const barn of el.childNodes.filter(erElement)) {
    if (barn === hode) continue;
    if (tag(barn) === 'article' && (klasse(barn, 'legalP') || klasse(barn, 'numberedLegalP'))) p.ledd.push(lesLedd(barn));
    else if (tag(barn) === 'article' && klasse(barn, 'changesToParent')) p.endringer.push(rydd(segmenter(barn)));
    else if (tag(barn) === 'footer' && klasse(barn, 'footnotes')) {
      for (const f of barn.childNodes.filter(erElement)) {
        const nr = f.getAttribute('data-name') ?? f.querySelector('.footnoteLabel')?.text.trim() ?? '';
        p.fotnoter.push({ nr, tekst: rydd(segmenter(f, (e) => klasse(e, 'footnoteLabel'))) });
      }
    } else if (erListe(barn)) {
      // Lister rett i paragrafen hører til leddet foran.
      const forrige = p.ledd[p.ledd.length - 1] ?? (p.ledd[p.ledd.push({ tekst: [] }) - 1] as Ledd);
      (forrige.liste ??= []).push(...lesListe(barn));
    } else if (tag(barn) === 'article' && klasse(barn, 'defaultP')) {
      p.ledd.push({ tekst: rydd(segmenter(barn)) });
    } else throw new Ukjent(`${beskriv(barn)} i ${p.visNr}`);
  }
  return p;
}

/** Overskriften «Kapittel 11 Tilpassa …» eller «Kapittel IV. Om …» gir type og nummer. */
export function tolkOverskrift(id: string, tekst: string): { type: Seksjon['type']; nr: string | null } {
  // Et kapittelnummer kan ha bokstav («Kapittel 5 A»), men ikke første bokstav i tittelen («Kapittel 16 Rådgiving»).
  const kap = /^Kapittel\s+(\d+(?:\s?[A-Z](?=[\s.]|$))?|[IVXLC]+(?=[\s.]|$))/.exec(tekst);
  if (kap) return { type: 'kapittel', nr: (kap[1] as string).replace(/\s+/g, '') };
  if (/^del\d/.test(id) || /^\S+\s+del(en)?\b/i.test(tekst)) return { type: 'del', nr: null };
  return { type: 'avsnitt', nr: null };
}

/**
 * Leser en seksjon. Med et utvalg leses bare kapitlene i utvalget (og delene og avsnittene rundt dem). Resten hoppes
 * over uten å leses, så f.eks. vedlegg med tabeller ikke stopper hentingen. Alle kapittelnumre legges i `funnet`.
 */
function lesSeksjon(el: HTMLElement, utvalg: ReadonlySet<string> | null, funnet: Set<string>, iUtvalg: boolean): Seksjon | null {
  const id = el.getAttribute('data-name') ?? el.getAttribute('id') ?? '';
  const barn = el.childNodes.filter(erElement);
  const hode = barn.find((e) => overskrift.test(tag(e)));
  const tekst = (hode?.text ?? '').replace(/\s+/g, ' ').trim();
  const { type, nr } = tolkOverskrift(id, tekst);
  if (type === 'kapittel' && nr !== null) funnet.add(nr);
  const med = utvalg === null || iUtvalg || (type === 'kapittel' && nr !== null && utvalg.has(nr));
  const s: Seksjon = { id, type, nr, overskrift: tekst || id, merknader: [], seksjoner: [], paragrafer: [] };
  for (const b of barn) {
    if (b === hode) continue;
    if (tag(b) === 'section' && klasse(b, 'section')) {
      const under = lesSeksjon(b, utvalg, funnet, med);
      if (under) s.seksjoner.push(under);
    } else if (!med) continue;
    else if (tag(b) === 'article' && klasse(b, 'legalArticle')) s.paragrafer.push(lesParagraf(b));
    else if (tag(b) === 'article' && (klasse(b, 'defaultP') || klasse(b, 'changesToParent'))) s.merknader.push(rydd(segmenter(b)));
    else throw new Ukjent(`${beskriv(b)} i «${s.overskrift}»`);
  }
  // Utenfor utvalget beholdes bare deler og avsnitt som har kapitler i utvalget, uten egen tekst.
  if (!med) return s.seksjoner.length > 0 ? { ...s, merknader: [] } : null;
  return s;
}

/** Feltene i hodet på dokumentet (<dl class="data-document-key-info">), f.eks. titleShort og lastChangeInForce. */
function hodefelt(rot: HTMLElement, navn: string): string | null {
  const t = rot.querySelector(`header.documentHeader dd.${navn}`)?.text.replace(/\s+/g, ' ').trim();
  return t ? t : null;
}

/** Kapittelnumrene i dokumentet, i rekkefølge. */
export function kapittelnumre(seksjoner: readonly Seksjon[]): string[] {
  return seksjoner.flatMap((s) => [...(s.type === 'kapittel' && s.nr !== null ? [s.nr] : []), ...kapittelnumre(s.seksjoner)]);
}

export interface Leseoppsett {
  id: string;
  kilde: string;
  /** Kapitlene som tas med (utskrevet, uten spenn), eller null for hele dokumentet. */
  kapitler: readonly string[] | null;
  korttittel?: string | undefined;
  gyldighet: Lovdokument['gyldighet'];
  hentet: string;
}

/** Leser et dokument fra Lovdata. Kaster en feil når noe ikke kan leses, eller når et kapittel i utvalget mangler. */
export function lesLovdokument(html: string, oppsett: Leseoppsett): Lovdokument {
  const rot = parse(html);
  const hoved = rot.querySelector('main.documentBody');
  if (!hoved) throw new Error(`${oppsett.id}: fant ikke <main class="documentBody">. Filen kan ha fått ny struktur.`);
  const refid = hodefelt(rot, 'refid') ?? '';
  const tittel = hodefelt(rot, 'title') ?? rot.querySelector('title')?.text.trim() ?? '';
  // «Forvaltningsloven – fvl» blir «Forvaltningsloven».
  const kort = hodefelt(rot, 'titleShort')?.split(' – ')[0]?.trim();
  const lang = rot.querySelector('html')?.getAttribute('lang');
  const utvalg = oppsett.kapitler ? new Set(oppsett.kapitler) : null;
  const funnet = new Set<string>();
  let seksjoner: Seksjon[];
  try {
    seksjoner = hoved.childNodes.filter(erElement).flatMap((e): Seksjon[] => {
      if (tag(e) === 'h1') return [];
      if (tag(e) === 'section' && klasse(e, 'section')) {
        const s = lesSeksjon(e, utvalg, funnet, false);
        return s ? [s] : [];
      }
      // Med et utvalg av kapitler tas ikke tekst utenfor kapitlene med.
      if (utvalg) return [];
      // Paragrafer rett i dokumentet (uten kapitler) samles i én seksjon uten overskrift.
      if (tag(e) === 'article' && klasse(e, 'legalArticle')) return [{ id: 'dokument', type: 'avsnitt' as const, nr: null, overskrift: tittel, merknader: [], seksjoner: [], paragrafer: [lesParagraf(e)] }];
      if (tag(e) === 'article' && (klasse(e, 'defaultP') || klasse(e, 'changesToParent'))) return [];
      throw new Ukjent(`${beskriv(e)} i dokumentet`);
    });
  } catch (e) {
    if (e instanceof Ukjent) throw new Error(`${oppsett.id}: teksten har innhold appen ikke leser: ${e.message}. Forrige henting beholdes.`, { cause: e });
    throw e;
  }
  // Paragrafer rett i dokumentet følger etter hverandre i én seksjon.
  seksjoner = seksjoner.reduce<Seksjon[]>((acc, s) => {
    const forrige = acc[acc.length - 1];
    if (s.id === 'dokument' && forrige?.id === 'dokument') forrige.paragrafer.push(...s.paragrafer);
    else acc.push(s);
    return acc;
  }, []);
  if (oppsett.kapitler) {
    const mangler = oppsett.kapitler.filter((k) => !funnet.has(k));
    if (mangler.length > 0) throw new Error(`${oppsett.id}: fant ikke kapittel ${mangler.join(', ')} i teksten. Utvalget i content/lovverk.yaml må kanskje endres.`);
  }
  return {
    id: oppsett.id,
    kilde: oppsett.kilde,
    type: refid.startsWith('forskrift/') ? 'forskrift' : 'lov',
    tittel,
    korttittel: oppsett.korttittel ?? kort ?? tittel,
    malform: lang === 'nn' ? 'nn' : 'nb',
    refid,
    sistEndret: hodefelt(rot, 'lastChangeInForce'),
    hentet: oppsett.hentet,
    gyldighet: oppsett.gyldighet,
    utvalg: oppsett.kapitler ? [...oppsett.kapitler] : null,
    seksjoner,
  };
}

/** Filnavnet til et dokument i datasettet: lov/2023-06-09-30 → nl-20230609-030, forskrift/2024-06-03-900 → sf-20240603-0900. */
export function datasettnavn(url: string): string {
  const m = /\/(lov|forskrift)\/(\d{4})-(\d{2})-(\d{2})(?:-(\d+))?/.exec(url);
  if (!m) throw new Error(`Kjenner ikke igjen adressen ${url}. Forventet https://lovdata.no/lov/ÅÅÅÅ-MM-DD-nr eller …/forskrift/ÅÅÅÅ-MM-DD-nr.`);
  const [, type, aar, mnd, dag, nr = '0'] = m as unknown as [string, string, string, string, string, string | undefined];
  return type === 'lov' ? `nl-${aar}${mnd}${dag}-${nr.padStart(3, '0')}` : `sf-${aar}${mnd}${dag}-${nr.padStart(4, '0')}`;
}

