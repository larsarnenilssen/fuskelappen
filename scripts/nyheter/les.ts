// Leser sakene fra kildene: RSS og Atom, og nyhetslistene til Udir og Utdanningsforbundet (én side hver). Bare
// tittel, dato, lenke og ingress. Rene funksjoner, testet i tests/unit/nyheter-les.test.ts.
import { parse } from 'node-html-parser';

export interface RaSak {
  tittel: string;
  /** YYYY-MM-DD, eller null når datoen mangler eller ikke kan leses. */
  dato: string | null;
  url: string;
  ingress: string | null;
  /** Kategorier eller stikkord fra kilden, til filteret. */
  stikkord: string[];
  /** Tittel og ingress på nynorsk, når saken er laget av appen (Lovdata) og er ulik på nynorsk. */
  tittelNn?: string;
  ingressNn?: string;
}

const ENTITETER: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '' };

/** Tekst uten HTML og med tegnene skrevet ut (også &oslash; og &#229;). */
export function rensTekst(html: string): string {
  const utenCdata = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  const utenTagger = utenCdata.replace(/<[^>]*>/g, ' ');
  const tekst = parse(`<p>${utenTagger.replace(/&(amp|lt|gt|quot|apos|nbsp|shy);/g, (_, n: string) => ENTITETER[n] ?? '')}</p>`).text;
  return tekst.replace(/\s+/g, ' ').trim();
}

/** Ingressen kortet til om lag `maks` tegn, ved et ord. */
export function kortIngress(tekst: string, maks = 300): string {
  if (tekst.length <= maks) return tekst;
  const kuttet = tekst.slice(0, maks);
  return `${kuttet.slice(0, Math.max(kuttet.lastIndexOf(' '), maks - 40)).replace(/[\s,.;:–-]+$/, '')} …`;
}

const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

/** Dato i norsk tid fra RFC 822 (RSS), ISO 8601 (Atom), dd.mm.åååå eller «30. september 2026» (listene). */
export function lesDato(tekst: string | null | undefined): string | null {
  if (!tekst) return null;
  const s = tekst.trim();
  const norsk = /^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(s);
  if (norsk) return `${norsk[3]}-${norsk[2]?.padStart(2, '0')}-${norsk[1]?.padStart(2, '0')}`;
  const medNavn = /^(\d{1,2})\.\s*([a-zæøå]+)\s+(\d{4})/i.exec(s);
  const maned = medNavn ? MANEDER.indexOf((medNavn[2] ?? '').toLowerCase()) + 1 : 0;
  if (medNavn && maned > 0) return `${medNavn[3]}-${String(maned).padStart(2, '0')}-${medNavn[1]?.padStart(2, '0')}`;
  const tid = Date.parse(s);
  if (Number.isNaN(tid)) return null;
  // Datoen i Norge, så en sak publisert kl. 00.30 norsk tid får riktig dag.
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(tid));
}

function felt(blokk: string, ...navn: string[]): string | null {
  for (const n of navn) {
    const m = new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i').exec(blokk);
    if (m?.[1] !== undefined) return m[1];
  }
  return null;
}

/** Sakene i en RSS- eller Atom-feed. */
export function lesFeed(xml: string): RaSak[] {
  const rss = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((m) => m[1] ?? '');
  if (rss.length > 0) {
    return rss.flatMap((b) => {
      const url = rensTekst(felt(b, 'link', 'guid') ?? '');
      const tittel = rensTekst(felt(b, 'title') ?? '');
      if (!url.startsWith('http') || !tittel) return [];
      const ingress = rensTekst(felt(b, 'description', 'content:encoded') ?? '');
      const stikkord = [...b.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)].map((m) => rensTekst(m[1] ?? ''));
      return [{ tittel, url, dato: lesDato(rensTekst(felt(b, 'pubDate', 'dc:date', 'atom:updated') ?? '')), ingress: ingress || null, stikkord }];
    });
  }
  return [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].flatMap((m) => {
    const b = m[1] ?? '';
    const lenke = /<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i.exec(b) ?? /<link[^>]*href="([^"]+)"/i.exec(b);
    const url = rensTekst(lenke?.[1] ?? '');
    const tittel = rensTekst(felt(b, 'title') ?? '');
    if (!url.startsWith('http') || !tittel) return [];
    const ingress = rensTekst(felt(b, 'summary', 'content') ?? '');
    const stikkord = [...b.matchAll(/<category[^>]*term="([^"]+)"/gi)].map((k) => rensTekst(k[1] ?? ''));
    return [{ tittel, url, dato: lesDato(rensTekst(felt(b, 'published', 'updated') ?? '')), ingress: ingress || null, stikkord }];
  });
}

function absolutt(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return '';
  }
}

/** «Siste nytt» hos Udir: kort med merke, tittel, ingress og dato. */
export function lesUdir(html: string, base: string): RaSak[] {
  return parse(html)
    .querySelectorAll('.news-element')
    .flatMap((kort) => {
      const lenke = kort.querySelector('.news-element__title a');
      const url = absolutt(lenke?.getAttribute('href') ?? '', base);
      const tittel = rensTekst(lenke?.innerHTML ?? '');
      if (!url || !tittel) return [];
      const ingress = rensTekst(kort.querySelector('.news-element__excerpt')?.innerHTML ?? '');
      const merke = rensTekst(kort.querySelector('.news-element__tag')?.innerHTML ?? '');
      return [{ tittel, url, dato: lesDato(kort.querySelector('time')?.text), ingress: ingress || null, stikkord: merke ? [merke] : [] }];
    });
}

/** Nyhetslisten til Utdanningsforbundet: kort med tittel, ingress og «Publisert dd.mm.åååå». */
export function lesUtdanningsforbundet(html: string, base: string): RaSak[] {
  return parse(html)
    .querySelectorAll('article')
    .flatMap((kort) => {
      const lenke = kort.querySelector('a[href]');
      const url = absolutt(lenke?.getAttribute('href') ?? '', base);
      const tittel = rensTekst(kort.querySelector('[class*="_title"]')?.innerHTML ?? '');
      if (!url || !tittel) return [];
      const ingress = rensTekst(kort.querySelector('[class*="_ingress"]')?.innerHTML ?? '');
      const dato = lesDato(rensTekst(kort.querySelector('[class*="_publishDate"]')?.innerHTML ?? '').replace(/^\D+/, ''));
      return [{ tittel, url, dato, ingress: ingress || null, stikkord: [] }];
    });
}

/**
 * «Aktuelt» hos HKdir: hver sak er en lenke til /aktuelt/… med tittelen, «Publisert: 30. september 2026» og ingressen
 * i hvert sitt avsnitt.
 */
export function lesHkdir(html: string, base: string): RaSak[] {
  return parse(html)
    .querySelectorAll('a[href^="/aktuelt/"]')
    .flatMap((lenke) => {
      const avsnitt = lenke.querySelectorAll('p').map((p) => rensTekst(p.innerHTML));
      const publisert = /Publisert\s*:\s*(\d{1,2}\.\s*[a-zæøå]+\s+\d{4})/i.exec(rensTekst(lenke.innerHTML));
      const tittel = avsnitt[0];
      const url = absolutt(lenke.getAttribute('href') ?? '', base);
      if (!tittel || !url || !publisert) return [];
      return [{ tittel, url, dato: lesDato(publisert[1]), ingress: avsnitt[1] || null, stikkord: [] }];
    });
}

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const tekstfelt = (o: Record<string, Json>, ...navn: string[]) => {
  for (const n of navn) {
    const v = o[n];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
};

/** Alle objekter i JSON-en som har en tittel og en adresse. */
function sakerIJson(j: Json, base: string, ut: RaSak[]): void {
  if (Array.isArray(j)) {
    for (const x of j) sakerIJson(x, base, ut);
    return;
  }
  if (!j || typeof j !== 'object') return;
  const tittel = tekstfelt(j, 'title', 'Title', 'tittel', 'name', 'heading');
  const url = tekstfelt(j, 'url', 'Url', 'URL', 'link', 'href');
  if (tittel && url) {
    ut.push({
      tittel: rensTekst(tittel),
      url: absolutt(url, base),
      dato: lesDato(tekstfelt(j, 'published', 'publishDate', 'publishedDate', 'date', 'startPublish', 'created', 'updatedDateTime', 'changed')),
      ingress: rensTekst(tekstfelt(j, 'ingress', 'description', 'lead', 'summary', 'intro') ?? '') || null,
      stikkord: [],
    });
    return;
  }
  for (const v of Object.values(j)) sakerIJson(v, base, ut);
}

/**
 * Saker fra en nyhetsliste som er JSON, eller en side med JSON i et attributt (f.eks. ng-init) eller i et skript. Brukes
 * av prøvehentingen for Vestland og Trøndelag.
 */
export function lesJsonliste(tekst: string, base: string): RaSak[] {
  const ut: RaSak[] = [];
  const forsok = (s: string) => {
    try {
      sakerIJson(JSON.parse(s) as Json, base, ut);
    } catch {
      // Ikke JSON.
    }
  };
  forsok(tekst);
  if (ut.length > 0) return ut;
  const dok = parse(tekst);
  for (const el of dok.querySelectorAll('[ng-init], [data-props], [data-model], script[type="application/json"], script#__NEXT_DATA__')) {
    const verdi = el.getAttribute('ng-init') ?? el.getAttribute('data-props') ?? el.getAttribute('data-model') ?? el.text;
    // Fra første [ eller { til siste ] eller }, så et funksjonskall rundt JSON-en (vm.init(…)) faller bort.
    const start = verdi.search(/[[{]/);
    const slutt = Math.max(verdi.lastIndexOf(']'), verdi.lastIndexOf('}'));
    if (start >= 0 && slutt > start) forsok(verdi.slice(start, slutt + 1));
  }
  return ut;
}

/** En nyhetsliste uten kjent oppbygning: lenker med en dato i nærheten. Brukes av prøvehentingen. */
export function lesLenkeliste(html: string, base: string): RaSak[] {
  const ut: RaSak[] = [];
  const sett = new Set<string>();
  for (const a of parse(html).querySelectorAll('a[href]')) {
    // Tittelen er overskriften i lenken (kortet), ellers hele lenketeksten. Ingressen er første avsnitt.
    const overskrift = a.querySelector('h1, h2, h3, h4');
    const tittel = rensTekst((overskrift ?? a).innerHTML);
    const url = absolutt(a.getAttribute('href') ?? '', base);
    if (tittel.length < 15 || !url.startsWith('http') || sett.has(url)) continue;
    const rundt = rensTekst((a.parentNode?.parentNode ?? a.parentNode ?? a).innerHTML ?? '');
    const dato = /\b(\d{1,2}\.\d{1,2}\.\d{4})\b/.exec(rundt)?.[1] ?? /\b(\d{1,2}\.\s*[a-zæøå]+\s+\d{4})\b/i.exec(rundt)?.[1] ?? null;
    if (!dato) continue;
    sett.add(url);
    const ingress = overskrift ? rensTekst(a.querySelector('p')?.innerHTML ?? '') : '';
    ut.push({ tittel, url, dato: lesDato(dato), ingress: ingress || null, stikkord: [] });
  }
  return ut;
}
