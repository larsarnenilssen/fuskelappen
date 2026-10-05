// Leser en lokal forskrift fra siden hos Lovdata (f.eks. https://lovdata.no/dokument/LF/forskrift/2020-09-29-3380)
// til dataene i appen (fase 3, avgjørelse 039). Lokale forskrifter er ikke i Lovdatas gratis datasett, og sidene har en
// annen struktur enn filene der (eier 02.10.2026):
// - Tittelen står i <div id="documentMeta"> som <h1>, og siste endring i <td id="metaField_endret"> («… fra 01.08.2026»).
// - Teksten står i <div id="documentBody">. Kapitler er <div class="kapittel"> med overskriften som <h2>.
// - En paragraf er <div class="paragraf"> med <h? class="paragrafHeader"> (<span class="paragrafValue">«§ 1-1.»</span>
//   og <span class="paragrafTittel">).
// - Ledd er <p class="avsnitt"> eller, når leddene er nummererte, <table class="numeral avsnitt"> med «(1)» foran.
// - Listepunkter er hver sin <table class="listeItem"> med nummeret i <td class="listeitemNummer">, og hører til leddet
//   foran. data-level sier hvor dypt punktet står.
// - Endringer står som fotnoter (<table class="fotnote">), under kapitteloverskriften eller i paragrafen.
// - Tabeller (f.eks. skoleruta) er <div class="… tabell"> med <table>, overskriftsraden i <thead> (avgjørelse 061).
// - Tekst før første paragraf (<p class="morTag_am …">) blir en merknad øverst i dokumentet.
// - Ikrafttredelsen står i <td id="metaField_ikraft">, for en skolerute som en periode («01.08.2026 – 31.07.2027»).
// - Ankere, «Del paragraf» og heimelen øverst hoppes over.
//
// Står det noe annet i teksten, kastes en feil, så ingen tekst blir borte uten at det merkes.
import { type HTMLElement, parse } from 'node-html-parser';
import { alleParagrafer, alleSeksjoner, type Ledd, type Lovdokument, type Paragraf, type Punkt, type Seksjon, type Segment } from '../../src/modules/lov/typer.ts';
import { beskriv, erElement, klasse, type Leseoppsett, rydd, ryddOverskrift, ryddTittel, segmenter, tag, tolkOverskrift, Ukjent } from './les.ts';

/** Elementer som ikke er tekst: ankere og knappen «Del paragraf». */
function hoppOver(e: HTMLElement): boolean {
  if (tag(e) === 'a' && (klasse(e, 'namedAnchor') || klasse(e, 'documentPart_scrollMargin') || klasse(e, 'share-paragraf') || (!e.getAttribute('href') && e.text.trim() === ''))) return true;
  return false;
}

/** Teksten i en fotnote om endringer. */
function fotnote(el: HTMLElement): Segment[] {
  const innhold = el.querySelector('td.fotnote');
  if (!innhold) throw new Ukjent(`${beskriv(el)} uten td.fotnote`);
  return rydd(segmenter(innhold));
}

/** Celle med teksten i et nummerert ledd eller et listepunkt. */
function celle(tabell: HTMLElement, velger: string): HTMLElement {
  const c = tabell.querySelector(velger);
  if (!c) throw new Ukjent(`${beskriv(tabell)} uten ${velger}`);
  return c;
}

/** Listepunktet i en <table class="listeItem">, med dybden. */
function punkt(tabell: HTMLElement): { niva: number; punkt: Punkt } {
  const nummer = celle(tabell, 'td.listeitemNummer');
  const tekst = tabell.querySelectorAll('td').find((td) => td !== nummer);
  if (!tekst) throw new Ukjent(`${beskriv(tabell)} uten tekst`);
  return {
    niva: Number(tabell.getAttribute('data-level') ?? '1'),
    punkt: { merke: nummer.text.trim(), ledd: [{ tekst: rydd(segmenter(tekst)) }] },
  };
}

/** En tabell i teksten: overskriftsraden (th i thead) for seg, og hver celle som tekst. */
function tabell(div: HTMLElement): Ledd {
  const t = div.querySelector('table');
  if (!t) throw new Ukjent(`${beskriv(div)} uten <table>`);
  const rad = (tr: HTMLElement) => tr.querySelectorAll('th, td').map((c) => rydd(segmenter(c, hoppOver)));
  const hode = t.querySelector('thead tr');
  const rader = t.querySelectorAll('tr').filter((tr) => tr !== hode);
  return { tekst: [], tabell: { hode: hode ? rad(hode) : null, rader: rader.map(rad) } };
}

/** Legger et listepunkt til siste ledd, eller inni siste punkt når det står dypere. */
function leggTilPunkt(ledd: Ledd[], niva: number, p: Punkt) {
  let mal: Ledd | undefined = ledd[ledd.length - 1];
  if (!mal) {
    mal = { tekst: [] };
    ledd.push(mal);
  }
  for (let n = 1; n < niva; n++) {
    const siste: Punkt | undefined = mal.liste?.[mal.liste.length - 1];
    const indre: Ledd | undefined = siste?.ledd[siste.ledd.length - 1];
    if (!indre) break;
    mal = indre;
  }
  (mal.liste ??= []).push(p);
}

function lesParagraf(el: HTMLElement): Paragraf {
  const hode = el.childNodes.filter(erElement).find((e) => klasse(e, 'paragrafHeader'));
  const verdi = (hode?.querySelector('.paragrafValue')?.text ?? '').replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  const nr = verdi.replace(/^§\s*/, '').replace(/\s+/g, '');
  if (!nr) throw new Error(`En paragraf mangler nummer (${el.getAttribute('id') ?? 'uten id'}).`);
  const p: Paragraf = { nr, visNr: verdi, tittel: ryddTittel(hode?.querySelector('.paragrafTittel')?.text ?? ''), ledd: [], endringer: [], fotnoter: [] };
  for (const barn of el.childNodes.filter(erElement)) {
    if (barn === hode || hoppOver(barn)) continue;
    if (tag(barn) === 'p' && klasse(barn, 'avsnitt')) {
      // Tomme avsnitt (Lovdata setter dem f.eks. foran en tabell) er ikke ledd.
      if (barn.text.trim()) p.ledd.push({ tekst: rydd(segmenter(barn, hoppOver)) });
    } else if (tag(barn) === 'div' && klasse(barn, 'tabell')) p.ledd.push(tabell(barn));
    else if (tag(barn) === 'table' && klasse(barn, 'fotnote')) p.endringer.push(fotnote(barn));
    else if (tag(barn) === 'table' && klasse(barn, 'listeItem')) {
      const { niva, punkt: pk } = punkt(barn);
      leggTilPunkt(p.ledd, niva, pk);
    } else if (tag(barn) === 'table' && klasse(barn, 'avsnitt')) p.ledd.push({ tekst: rydd(segmenter(celle(barn, 'td'), hoppOver)) });
    else throw new Ukjent(`${beskriv(barn)} i ${p.visNr}`);
  }
  return p;
}

/** Et kapittel (<div class="kapittel">) med paragrafene og eventuelle fotnoter om endringer under overskriften. */
function lesKapittel(el: HTMLElement): Seksjon {
  const hode = el.childNodes.filter(erElement).find((e) => /^h[1-6]$/.test(tag(e)));
  const tekst = ryddOverskrift(hode?.text ?? '');
  // Lovdata gir noen kapitler tom id; da brukes overskriften.
  const id = el.getAttribute('data-refID') || el.getAttribute('id') || tekst || 'kapittel';
  const { type, nr } = tolkOverskrift(id, tekst);
  const s: Seksjon = { id, type, nr, overskrift: tekst || id, merknader: [], seksjoner: [], paragrafer: [] };
  for (const barn of el.childNodes.filter(erElement)) {
    if (barn === hode || hoppOver(barn)) continue;
    if (tag(barn) === 'div' && klasse(barn, 'paragraf')) s.paragrafer.push(lesParagraf(barn));
    else if (tag(barn) === 'div' && klasse(barn, 'kapittel')) s.seksjoner.push(lesKapittel(barn));
    else if (tag(barn) === 'table' && klasse(barn, 'fotnote')) s.merknader.push(fotnote(barn));
    // Tekst rett under kapitteloverskriften (f.eks. en innledning eller et vedlegg) blir merknader til kapitlet.
    else if (tag(barn) === 'p' && klasse(barn, 'avsnitt')) {
      if (barn.text.trim()) s.merknader.push(rydd(segmenter(barn, hoppOver)));
    } else if (tag(barn) === 'table' && klasse(barn, 'listeItem')) {
      const { punkt: pk } = punkt(barn);
      s.merknader.push(rydd([`${pk.merke} `, ...pk.ledd.flatMap((l) => l.tekst)]));
    } else throw new Ukjent(`${beskriv(barn)} i «${s.overskrift}»`);
  }
  return s;
}

/** Første dato i teksten, «01.08.2026» gir «2026-08-01». */
function dato(tekst: string): string | null {
  const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(tekst);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** «FOR-2026-06-16-1344 fra 01.08.2026» gir «2026-08-01». */
function sisteEndring(rot: HTMLElement): string | null {
  return dato(rot.querySelector('#metaField_endret')?.text ?? '');
}

/** Ikrafttredelsen, og for en periode («01.08.2026 – 31.07.2027») når den slutter. */
function ikraft(rot: HTMLElement): { iKraft: string | null; iKraftTil: string | null } {
  const [fra, til] = (rot.querySelector('#metaField_ikraft')?.text ?? '').split(/\s+[–-]\s+/);
  return { iKraft: fra ? dato(fra) : null, iKraftTil: til ? dato(til) : null };
}

/** Leser en lokal forskrift fra siden hos Lovdata. Kaster en feil når noe ikke kan leses. */
export function lesLovdataside(html: string, oppsett: Leseoppsett): Lovdokument {
  if (oppsett.kapitler) throw new Error(`${oppsett.id}: utvalg av kapitler støttes ikke for sider hos Lovdata. Ta med hele forskriften.`);
  if (!oppsett.refid) throw new Error(`${oppsett.id}: mangler adressen hos Lovdata (refid).`);
  const rot = parse(html);
  const hoved = rot.querySelector('#documentBody');
  if (!hoved) throw new Error(`${oppsett.id}: fant ikke <div id="documentBody">. Siden kan ha fått ny struktur.`);
  const tittel = (rot.querySelector('#documentMeta h1')?.text ?? '').replace(/\s+/g, ' ').trim();
  if (!tittel) throw new Error(`${oppsett.id}: fant ikke tittelen (<div id="documentMeta"> <h1>). Siden kan ha fått ny struktur.`);
  let seksjoner: Seksjon[];
  try {
    seksjoner = hoved.childNodes.filter(erElement).flatMap((e): Seksjon[] => {
      if (hoppOver(e)) return [];
      if (tag(e) === 'div' && klasse(e, 'kapittel')) return [lesKapittel(e)];
      // Paragrafer rett i forskriften (uten kapitler) samles i én seksjon uten overskrift.
      if (tag(e) === 'div' && klasse(e, 'paragraf')) return [{ id: 'dokument', type: 'avsnitt' as const, nr: null, overskrift: tittel, merknader: [], seksjoner: [], paragrafer: [lesParagraf(e)] }];
      // Heimelen og kunngjøringen øverst står på siden hos Lovdata.
      if (tag(e) === 'p' && klasse(e, 'morTag_mf')) return [];
      // Annen tekst før første paragraf, også en fotnote, blir en merknad øverst.
      if (tag(e) === 'p' && klasse(e, 'avsnitt')) return e.text.trim() ? [{ id: 'dokument', type: 'avsnitt' as const, nr: null, overskrift: tittel, merknader: [rydd(segmenter(e, hoppOver))], seksjoner: [], paragrafer: [] }] : [];
      if (tag(e) === 'table' && klasse(e, 'fotnote')) return [{ id: 'dokument', type: 'avsnitt' as const, nr: null, overskrift: tittel, merknader: [fotnote(e)], seksjoner: [], paragrafer: [] }];
      throw new Ukjent(`${beskriv(e)} i dokumentet`);
    });
  } catch (e) {
    if (e instanceof Ukjent) throw new Error(`${oppsett.id}: teksten har innhold appen ikke leser: ${e.message}. Forrige henting beholdes.`, { cause: e });
    throw e;
  }
  seksjoner = seksjoner.reduce<Seksjon[]>((acc, s) => {
    const forrige = acc[acc.length - 1];
    if (s.id === 'dokument' && forrige?.id === 'dokument') {
      forrige.merknader.push(...s.merknader);
      forrige.paragrafer.push(...s.paragrafer);
    }
    else acc.push(s);
    return acc;
  }, []);
  // Noen skoler skriver reglene som kapitler med tekst, uten paragrafer. Da blir hvert kapittel en paragraf, så
  // teksten kan vises, søkes i og lenkes til som i de andre forskriftene.
  if (alleParagrafer(seksjoner).length === 0) {
    const alle = alleSeksjoner(seksjoner);
    // Teksten i det ytterste kapitlet, før kapitlene inni, står som innledning når det har kapitler inni.
    const innledning = alle.filter((s) => s.seksjoner.length > 0).flatMap((s) => s.merknader);
    seksjoner = [
      {
        id: 'dokument',
        type: 'avsnitt',
        nr: null,
        overskrift: tittel,
        merknader: innledning,
        seksjoner: [],
        paragrafer: alle
          .filter((s) => s.seksjoner.length === 0 && s.merknader.length > 0)
          .map((s, i) => {
            const m = /^(\d+)\.?\s*(.*)$/.exec(s.overskrift);
            const nr = s.nr ?? m?.[1] ?? String(i + 1);
            return { nr, visNr: `${nr}.`, tittel: m ? (m[2] ?? '') : s.overskrift, ledd: s.merknader.map((t) => ({ tekst: t })), endringer: [], fotnoter: [] };
          }),
      },
    ];
  }
  return {
    id: oppsett.id,
    kilde: oppsett.kilde,
    type: 'forskrift',
    tittel,
    korttittel: oppsett.korttittel ?? tittel,
    malform: oppsett.malform ?? 'nb',
    refid: oppsett.refid,
    sistEndret: sisteEndring(rot),
    ...ikraft(rot),
    ...(oppsett.lokaltype ? { lokaltype: oppsett.lokaltype } : {}),
    hentet: oppsett.hentet,
    gyldighet: oppsett.gyldighet,
    utvalg: null,
    seksjoner,
  };
}
