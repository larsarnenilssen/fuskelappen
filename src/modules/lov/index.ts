// Regelverk (fase 3, avgjørelse 039): opplæringslova, opplæringsforskrifta og andre regler fra Lovdata, med søk i hele
// teksten, kapitlene i rubrikker og paragrafene i bokser, og avtaler (Hovedtariffavtalen, SFS 2213) med egne ord. Hver
// paragraf og bestemmelse har egen adresse, så begreper og andre moduler kan lenke rett til den. Dokumentene og
// utvalget står i content/lovverk.yaml.
import utvalgFil from '../../../content/lovverk.yaml';
import { bareSpurte, oversiktsfavoritt } from '../favoritter.ts';
import type { Favorittbar, Modulmanifest } from '../typer.ts';
import { avtaler, lastBestemmelser } from './avtaler.ts';
import { dokumentnavn, dokumentRute, lastDokument, lastOversikt, paragraffavoritt, paragraffavorittnavn, paragrafRute } from './data.ts';
import { alleParagrafer } from './typer.ts';

/** Kildene følger utvalget i content/lovverk.yaml, så et nytt dokument ikke krever kodeendring. */
const utvalg = utvalgFil as { dokumenter: { kilde: string }[]; avtaler?: { kilde: string }[] };

/** Avtalene og bestemmelsene i søket på forsiden, med tittel og tekst på begge målformer. Bare nasjonale avtaler. */
async function avtaleoppforinger() {
  const bestemmelser = await lastBestemmelser();
  return avtaler
    .filter((a) => a.gyldighet.niva === 'nasjonal')
    .flatMap((a) => [
      { id: `lov:${a.id}`, type: 'lov' as const, tittel: a.korttittel, tekst: a.tittel, stikkord: ['avtale', 'tariffavtale'], rute: dokumentRute(a.id), modul: 'lov' },
      ...a.kapitler.flatMap((k) =>
        k.elementer.flatMap((id) => {
          const e = bestemmelser.get(id);
          if (!e) return [];
          return [
            {
              id: paragraffavoritt(a.id, id),
              type: 'lov' as const,
              tittel: { nb: `${e.tittel.nb} (${a.korttittel.nb})`, nn: `${e.tittel.nn} (${a.korttittel.nn})` },
              tekst: e.tekst,
              stikkord: e.stikkord,
              rute: paragrafRute(a.id, id),
              modul: 'lov',
            },
          ];
        }),
      ),
    ]);
}

export const manifest: Modulmanifest = {
  id: 'lov',
  navn: 'moduler.lov.navn',
  beskrivelse: 'moduler.lov.beskrivelse',
  ikon: 'paragraf',
  kategori: 'felles',
  rekkefolge: 20,
  ruter: [
    { sti: '/lov', tittel: 'lov.tittel', side: () => import('./sider/Oversikt.tsx') },
    { sti: '/lov/:dokument', tittel: 'lov.tittel', side: () => import('./sider/Dokument.tsx') },
    { sti: '/lov/:dokument/:paragraf', tittel: 'lov.tittel', side: () => import('./sider/Dokument.tsx') },
  ],
  async sokeoppforinger() {
    const { dokumenter } = await lastOversikt();
    const nasjonale = dokumenter.filter((d) => d.gyldighet.niva === 'nasjonal');
    // De lokale forskriftene søkes på navn, med fylket de hører til. Med valgt fylke vises bare fylkets, til brukeren
    // slår av knappen med fylket (eier 05.10.2026). Teksten søkes det i inne i Regelverk.
    const lokale = dokumenter.flatMap((d) =>
      d.gyldighet.niva === 'nasjonal'
        ? []
        : [
            {
              vekt: 0.8,
              id: `lov:${d.id}`,
              type: 'lov' as const,
              tittel: { nb: dokumentnavn(d, 'nb'), nn: dokumentnavn(d, 'nn') },
              tekst: { nb: d.tittel, nn: d.tittel },
              stikkord: ['lokal forskrift'],
              rute: dokumentRute(d.id),
              modul: 'lov',
              sted: [d.gyldighet.fylke],
            },
          ],
    );
    const lastet = (await Promise.all(nasjonale.map((d) => lastDokument(d.id)))).filter((d) => d !== null);
    // Søket på forsiden finner dokumentene på navn og paragrafene på nummer («§ 11-1», «11-1») og tittel.
    // Teksten i paragrafene søkes det i inne i modulen, så søkeindeksen blir ikke stor.
    return lastet.flatMap((d) => [
      {
        id: `lov:${d.id}`,
        type: 'lov' as const,
        tittel: { nb: d.korttittel, nn: d.korttittel },
        tekst: { nb: d.tittel, nn: d.tittel },
        stikkord: [d.type === 'lov' ? 'lov' : 'forskrift'],
        rute: dokumentRute(d.id),
        modul: 'lov',
      },
      ...alleParagrafer(d.seksjoner).map(({ paragraf: p }) => {
        const tittel = paragraffavorittnavn(d, p);
        return {
          id: paragraffavoritt(d.id, p.nr),
          type: 'lov' as const,
          tittel: { nb: tittel, nn: paragraffavorittnavn(d, p, 'nn') },
          stikkord: [p.nr, p.visNr, `§${p.nr}`, d.korttittel],
          rute: paragrafRute(d.id, p.nr),
          modul: 'lov',
        };
      }),
    ]).concat(lokale, await avtaleoppforinger());
  },
  async favorittbare(ider) {
    // Oversikten, dokumentene og avtalene, og paragrafene og bestemmelsene med den diskré stjernen (avgjørelse 058).
    // Bare dokumentene brukeren har favoritter i, lastes.
    const { dokumenter } = await lastOversikt();
    const trengs = (dok: string) => !ider || ider.some((id) => id === `lov:${dok}` || id.startsWith(`lov:${dok}:`));
    const lastet = (await Promise.all(dokumenter.filter((d) => trengs(d.id)).map((d) => lastDokument(d.id)))).filter((d) => d !== null);
    const lov: Favorittbar[] = lastet.flatMap((d) => [
      { id: `lov:${d.id}`, type: 'side' as const, tittel: { nb: dokumentnavn(d, 'nb'), nn: dokumentnavn(d, 'nn') }, rute: dokumentRute(d.id) },
      ...alleParagrafer(d.seksjoner).map(({ paragraf: p }) => {
        const tittel = { nb: paragraffavorittnavn(d, p), nn: paragraffavorittnavn(d, p, 'nn') };
        return { id: paragraffavoritt(d.id, p.nr), type: 'element' as const, tittel, rute: paragrafRute(d.id, p.nr) };
      }),
    ]);
    const bestemmelser = avtaler.some((a) => trengs(a.id)) ? await lastBestemmelser() : new Map();
    const avtalefavoritter: Favorittbar[] = avtaler.filter((a) => trengs(a.id)).flatMap((a) => [
      { id: `lov:${a.id}`, type: 'side' as const, tittel: a.korttittel, rute: dokumentRute(a.id) },
      ...a.kapitler.flatMap((k) =>
        k.elementer.flatMap((id) => {
          const e = bestemmelser.get(id);
          if (!e) return [];
          return [{ id: paragraffavoritt(a.id, id), type: 'element' as const, tittel: { nb: `${e.tittel.nb} (${a.korttittel.nb})`, nn: `${e.tittel.nn} (${a.korttittel.nn})` }, rute: paragrafRute(a.id, id) }];
        }),
      ),
    ]);
    return bareSpurte([oversiktsfavoritt(manifest), ...lov, ...avtalefavoritter], ider);
  },
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 085).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: [...new Set([...utvalg.dokumenter, ...(utvalg.avtaler ?? [])].map((d) => d.kilde))],
  status: 'aktiv',
};
