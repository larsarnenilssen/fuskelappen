// Vedtatte endringer i regelverket appen har, som nyheter (K2, eier 07.10.2026). De leses fra data/lovdata/kommende.json,
// som hentingen fra Lovdata skriver hver uke (Norsk Lovtidend og Lovdatas datasett), så nyhetene gjør ingen nye
// forespørsler til Lovdata. Tittelen og ingressen lages på bokmål og nynorsk med tekstene fra Kalender.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fyllInn, type Malform } from '../../src/core/i18n/tekst.ts';
import { manedsnavn } from '../../src/core/tidslinje.ts';
import { paragraftekst } from '../../src/modules/kalender/datakilder.ts';
import { nb } from '../../src/strings/nb.ts';
import { nn } from '../../src/strings/nn.ts';
import type { KommendeEndringer } from '../lovdata/kommende.ts';
import type { RaSak } from './les.ts';

interface Oversikt {
  dokumenter: { id: string; korttittel: string; korttittelNn?: string | null }[];
}

const tekster = { nb, nn } as const;

/** «1. juli 2028». */
function dato(iso: string, m: Malform): string {
  return `${Number(iso.slice(8, 10))}. ${manedsnavn(Number(iso.slice(5, 7)), m)} ${iso.slice(0, 4)}`;
}

/**
 * Sakene fra endringene. Datoen er datoen endringen ble vedtatt (i adressen hos Lovdata, f.eks. «lov/2026-06-12-22»),
 * så en endring fra i sommer ikke står som dagens nyhet. Uten dato i adressen brukes `idag`.
 */
export function lesLovdata(rot: string, idag: string): RaSak[] {
  const fil = join(rot, 'data/lovdata/kommende.json');
  if (!existsSync(fil)) return [];
  const kommende = JSON.parse(readFileSync(fil, 'utf8')) as KommendeEndringer;
  const oversikt = JSON.parse(readFileSync(join(rot, 'data/lovdata/oversikt.json'), 'utf8')) as Oversikt;
  const dokumenter = new Map(oversikt.dokumenter.map((d) => [d.id, d]));
  const navn = (id: string, m: Malform) => {
    const d = dokumenter.get(id);
    const tittel = d ? (m === 'nn' && d.korttittelNn ? d.korttittelNn : d.korttittel) : id;
    return tittel.charAt(0).toLowerCase() + tittel.slice(1);
  };
  return kommende.endringer.map((e) => {
    const lag = (m: Malform) => {
      const t = tekster[m];
      const hva = [navn(e.dokument, m), paragraftekst(e.paragrafer, t.kalender.regelverk.og)].filter(Boolean).join(' ');
      const ingress = e.iKraft
        ? fyllInn(t.kalender.regelverk.tekstDato, { hva, lov: e.endretVed.tittel, dato: dato(e.iKraft, m) })
        : fyllInn(t.kalender.regelverk.tekstUtenDato, { hva, lov: e.endretVed.tittel, naar: e.iKraftTekst });
      return { tittel: fyllInn(t.nyheter.lovdata, { hva }), ingress };
    };
    const [b, n] = [lag('nb'), lag('nn')];
    return {
      tittel: b.tittel,
      ingress: b.ingress,
      ...(n.tittel !== b.tittel ? { tittelNn: n.tittel } : {}),
      ...(n.ingress !== b.ingress ? { ingressNn: n.ingress } : {}),
      dato: /\d{4}-\d{2}-\d{2}/.exec(e.endretVed.refid)?.[0] ?? idag,
      url: e.kunngjoring ?? `https://lovdata.no/${e.endretVed.refid}`,
      stikkord: [],
    };
  });
}
