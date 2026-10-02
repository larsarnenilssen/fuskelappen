// Lov og forskrift (fase 3, avgjørelse 039): opplæringslova, opplæringsforskrifta og andre regler fra Lovdatas gratis
// datasett, med søk i hele teksten, kapitlene i rubrikker og paragrafene i bokser. Hver paragraf har egen adresse, så
// begreper og andre moduler kan lenke rett til den. Dokumentene og utvalget står i content/lovverk.yaml.
import utvalgFil from '../../../content/lovverk.yaml';
import type { Modulmanifest } from '../typer.ts';
import { dokumentRute, lastDokument, lastOversikt, paragrafRute } from './data.ts';
import { alleParagrafer } from './typer.ts';

/** Kildene følger utvalget i content/lovverk.yaml, så et nytt dokument ikke krever kodeendring. */
const utvalg = utvalgFil as { dokumenter: { kilde: string }[] };

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
    // Lokale forskrifter vises bare for dem som har valgt fylket, og tas derfor ikke med i søket på forsiden.
    const nasjonale = dokumenter.filter((d) => d.gyldighet.niva === 'nasjonal');
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
        const tittel = `${p.visNr} ${p.tittel} (${d.korttittel.toLowerCase()})`;
        return {
          id: `lov:${d.id}:${p.nr}`,
          type: 'lov' as const,
          tittel: { nb: tittel, nn: tittel },
          stikkord: [p.nr, p.visNr, `§${p.nr}`, d.korttittel],
          rute: paragrafRute(d.id, p.nr),
          modul: 'lov',
        };
      }),
    ]);
  },
  async favorittbare() {
    return [];
  },
  async frister() {
    return [];
  },
  kilder: [...new Set(utvalg.dokumenter.map((d) => d.kilde))],
  status: 'aktiv',
};
