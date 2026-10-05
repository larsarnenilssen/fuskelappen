// Datoene fra datafilene som oppføringer i kalenderen (avgjørelse 066): skoleruta fra fylkenes forskrifter, fylkenes
// datoer for inntak og vedtatte endringer i regelverket. Rene funksjoner. Titlene står i src/strings.
import { hentTekst, type Malform } from '../../core/i18n/tekst.ts';
import type { Flerspraak } from '../../core/innhold/skjema.ts';
import { datoLang } from './visning.ts';
import type { Kalenderoppforing } from './beregning/kalender.ts';
import type { Inntaksdatoer, Inntaksfelt, KommendeEndringer, Skoleruter, Skolerutetype } from './datatyper.ts';

/** Teksten på begge målformene. */
function begge(lag: (m: Malform) => string): Flerspraak {
  return { nb: lag('nb'), nn: lag('nn') };
}

function escape(tekst: string): string {
  return tekst.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const lovdataUrl = (refid: string) => `https://lovdata.no/${refid}`;

/** Helligdagene slik de står i skolerutene. Navnet fra forskriften brukes som tittel. */
const HELLIGDAGER = /(kristi himmelfartsdag|grunnlovsdag(?:en)?|andre pinsedag|andre påskedag|skjærtorsdag|langfredag|arbeidernes dag|offentle(?:g|ig) hø(?:g|y)tidsdag)/i;

/** Tittelen på en hendelse i skoleruta: navnet på typen, eller navnet på helligdagen. «Annet» får en tittel når det er siste skoledag før jul eller påske. */
function skolerutetittel(type: string, tekst: string): Flerspraak {
  if (type === 'helligdag') {
    const navn = HELLIGDAGER.exec(tekst)?.[1];
    if (navn) return { nb: navn.charAt(0).toUpperCase() + navn.slice(1), nn: navn.charAt(0).toUpperCase() + navn.slice(1) };
  }
  if (type === 'annet' && /siste\s+sk[uo]ledag/i.test(tekst)) {
    if (/jul/i.test(tekst)) return begge((m) => hentTekst(m, 'kalender.skolerute.sisteForJul'));
    if (/påske/i.test(tekst)) return begge((m) => hentTekst(m, 'kalender.skolerute.sisteForPaske'));
  }
  if (type === 'annet') return { nb: tekst, nn: tekst };
  return begge((m) => hentTekst(m, `kalender.skolerute.typer.${type as Exclude<Skolerutetype, 'annet'>}`));
}

/**
 * Skoleruta i fylket som oppføringer. Bare når fylket er valgt. Teksten fra forskriften står uendret, merket med
 * målformen, under kortets egen tekst.
 */
export function skoleruteOppforinger(data: Skoleruter | null, fylke: string | null): Kalenderoppforing[] {
  const f = fylke && data ? data.fylker[fylke] : undefined;
  if (!f || !fylke) return [];
  return f.hendelser.map((h, i) => {
    const dok = f.dokumenter.find((d) => d.id === h.dokument);
    const tittel = skolerutetittel(h.type, h.tekst);
    return {
      id: `skolerute-${fylke}-${h.fra}-${h.type}-${i}`,
      tittel,
      tekst: begge(
        (m) =>
          `<p>${escape(hentTekst(m, 'kalender.skolerute.fraForskriften', { skolear: h.skolear.replace('-', '–') }))}</p><blockquote lang="${dok?.malform ?? m}"><p>${escape(h.tekst)}</p></blockquote>`,
      ),
      tema: ['skolerute'],
      grupper: [],
      lenker: [],
      ferdigeLenker: dok ? [{ rute: `/lov/${dok.id}`, tittel: begge((m) => hentTekst(m, 'kalender.skolerute.forskrift', { skolear: dok.skolear.replace('-', '–') })), type: 'lov' }] : [],
      paragrafer: [],
      kilder: dok ? [{ id: 'lovdata-lokale', punkt: dok.refid, url: lovdataUrl(dok.refid) }] : [{ id: 'lovdata-lokale' }],
      fylke,
      dato: h.fra,
      ...(h.til && h.til !== h.fra ? { til: h.til } : {}),
    };
  });
}

/** Følger skolene i fylket vertskommunen, ifølge forskriften? Da står en merknad over kalenderen. */
export function folgerVertskommunen(data: Skoleruter | null, fylke: string | null): boolean {
  return !!(fylke && data?.fylker[fylke]?.dokumenter.some((d) => d.vertskommune));
}

/** Har fylket skolerute i Lovdata? */
export function harSkolerute(data: Skoleruter | null, fylke: string | null): boolean {
  return !!(fylke && (data?.fylker[fylke]?.hendelser.length ?? 0) > 0);
}

const INNTAKSGRUPPE: Partial<Record<Inntaksfelt, 'fortrinnsrett'>> = { fortrinnsinntak: 'fortrinnsrett', 'svarfrist-fortrinn': 'fortrinnsrett' };

/**
 * Fylkets datoer for svar og inntak (grunnlag: praksis). Bare når fylket er valgt. En dato som er omtrentlig eller
 * bare gitt som uke, står med «ca.» eller uken ved tittelen. Frister som bare er gitt relativt («5 dager etter
 * svaret»), står i teksten til datoen de regnes fra.
 */
export function inntakOppforinger(data: Inntaksdatoer | null, fylke: string | null): Kalenderoppforing[] {
  const aar = fylke && data ? data.fylker[fylke] : undefined;
  if (!aar || !fylke || !data) return [];
  return Object.entries(aar).flatMap(([inntaksaar, felter]) =>
    (Object.entries(felter) as [Inntaksfelt, NonNullable<(typeof felter)[Inntaksfelt]>][]).flatMap(([felt, d]) => {
      if (!d.fra) return [];
      const kilder = d.kilder.flatMap((k) => {
        const kilde = data.kilder[k];
        return kilde ? [{ id: 'inntaksdatoer', punkt: kilde.navn, url: kilde.url }] : [];
      });
      const naar = d.uke ? begge((m) => hentTekst(m, 'kalender.inntak.uke', { uke: d.uke ?? '' })) : d.omtrent ? begge((m) => hentTekst(m, 'kalender.inntak.omtrent')) : undefined;
      return [
        {
          id: `inntak-${fylke}-${inntaksaar}-${felt}`,
          tittel: begge((m) => hentTekst(m, `kalender.inntak.felt.${felt}`)),
          tekst: begge((m) => `<p>${escape(hentTekst(m, 'kalender.inntak.fraFylket'))}</p><blockquote><p>${escape(d.tekst)}</p></blockquote>`),
          ...(naar ? { naar } : {}),
          tema: ['inntak'],
          grupper: [INNTAKSGRUPPE[felt] ?? 'elever'],
          lenker: ['/inntak/rett-inntak-soknad'],
          paragrafer: [],
          kilder: kilder.length > 0 ? kilder : [{ id: 'inntaksdatoer' }],
          fylke,
          dato: d.fra,
          ...(d.til && d.til !== d.fra ? { til: d.til } : {}),
        } satisfies Kalenderoppforing,
      ];
    }),
  );
}

/** «§ 6-6» eller «§§ 2, 6, 7, 8 og 30». */
export function paragraftekst(nr: readonly string[], og: string): string {
  if (nr.length === 0) return '';
  if (nr.length === 1) return `§ ${nr[0]}`;
  return `§§ ${nr.slice(0, -1).join(', ')} ${og} ${nr.at(-1)}`;
}

/**
 * Vedtatte endringer i regelverket appen har (eier 05.10.2026). Med dato står de i kalenderen på datoen. Uten dato
 * («Kongen bestemmer») står de i boksen «Vedtatt, ikke satt i kraft ennå» når det er filtrert på Regelverk.
 * `navn` gir navnet på dokumentet («opplæringslova»), eller null når appen ikke har dokumentet.
 */
export function regelverkOppforinger(data: KommendeEndringer | null, navn: (dokument: string, m: Malform) => string | null): { datert: Kalenderoppforing[]; udatert: Kalenderoppforing[] } {
  const datert: Kalenderoppforing[] = [];
  const udatert: Kalenderoppforing[] = [];
  for (const e of data?.endringer ?? []) {
    if (!navn(e.dokument, 'nb')) continue;
    const hva = (m: Malform) => [navn(e.dokument, m) ?? e.dokument, paragraftekst(e.paragrafer, hentTekst(m, 'kalender.regelverk.og'))].filter(Boolean).join(' ');
    const o: Kalenderoppforing = {
      id: `regelverk-${e.id}`,
      tittel: begge((m) => hentTekst(m, 'kalender.regelverk.tittel', { hva: hva(m) })),
      tekst: begge((m) =>
        `<p>${escape(
          e.iKraft
            ? hentTekst(m, 'kalender.regelverk.tekstDato', { hva: hva(m), lov: e.endretVed.tittel, dato: datoLang(e.iKraft, m) })
            : hentTekst(m, 'kalender.regelverk.tekstUtenDato', { hva: hva(m), lov: e.endretVed.tittel, naar: e.iKraftTekst }),
        )}</p><p>${escape(hentTekst(m, 'kalender.regelverk.teksten'))}</p>`,
      ),
      ...(e.iKraft ? {} : { naar: begge((m) => hentTekst(m, 'kalender.regelverk.ikkeSatt')) }),
      tema: ['regelverk'],
      grupper: [],
      lenker: [],
      ferdigeLenker: (e.paragrafer.length > 0 ? e.paragrafer : ['']).map((nr) => ({
        rute: nr ? `/lov/${e.dokument}/${encodeURIComponent(nr)}` : `/lov/${e.dokument}`,
        tittel: begge((m) => (nr ? `§ ${nr} (${navn(e.dokument, m) ?? e.dokument})` : (navn(e.dokument, m) ?? e.dokument))),
        type: 'lov' as const,
      })),
      paragrafer: [],
      // Kilden er dokumentet selv i kilderegisteret (f.eks. opplaeringslova), med endringsloven som punkt.
      kilder: [{ id: e.dokument, punkt: e.endretVed.tittel, url: e.kunngjoring ?? lovdataUrl(e.endretVed.refid) }],
      fylke: null,
      ekstern: { url: e.kunngjoring ?? lovdataUrl(e.endretVed.refid), tekst: begge((m) => hentTekst(m, 'kalender.regelverk.kunngjoring', { lov: e.endretVed.tittel })) },
      ...(e.iKraft ? { dato: e.iKraft } : { regel: { type: 'lopende' as const } }),
    };
    (e.iKraft ? datert : udatert).push(o);
  }
  return { datert, udatert };
}

