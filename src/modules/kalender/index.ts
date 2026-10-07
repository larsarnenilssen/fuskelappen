// Kalenderen (fase 6, pakke 5, avgjørelse 066): fristene og datoene fra alle modulene på én side, med filter på tema og
// hvem det gjelder. Kalender for inntak og Kalender for eksamen er lenker hit, ferdig filtrert.
import { bareSpurte, oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { kalenderLenke, kalenderRute } from './adresse.ts';
import { KALENDERTEMAER, type Kalendertema } from '../../core/innhold/kalendertema.ts';
import { hentTekst, type Malform } from '../../core/i18n/tekst.ts';

/** Søkeordene for kalenderen filtrert på hvert tema. Inntak og eksamen har ordene fra de gamle kalenderne. */
const STIKKORD: Record<Kalendertema, string[]> = {
  inntak: ['frist', 'søknadsfrist', 'inntak', '1. mars', '1. februar'],
  vurdering: ['frist', 'halvårsvurdering', 'standpunkt', 'varsel'],
  eksamen: ['frist', 'eksamensdato', 'trekk', 'sensur', 'klage', 'klagefrist', 'oppmelding', 'privatist'],
  skolerute: ['skolerute', 'ferie', 'skolestart', 'fridag'],
  regelverk: ['endringer', 'ikrafttredelse', 'ny forskrift'],
};

export const manifest: Modulmanifest = {
  id: 'kalender',
  navn: 'moduler.kalender.navn',
  beskrivelse: 'moduler.kalender.beskrivelse',
  ikon: 'kalender',
  kategori: 'felles',
  rekkefolge: 5,
  stikkord: ['frister', 'datoer', 'årshjul', 'skolerute', 'ferie', 'eksamen', 'inntak'],
  ruter: [{ sti: kalenderRute, tittel: 'kalender.tittel', side: () => import('./sider/Kalender.tsx') }],
  // Søket (eier 06.10.2026): selve modulen er ett treff, med søkeordene under. I tillegg kommer kalenderen filtrert på
  // hvert tema, f.eks. «Kalender – eksamen», i stedet for de gamle kalenderne for inntak og eksamen.
  async sokeoppforinger() {
    const navn = (m: Malform, tema: Kalendertema) => hentTekst(m, `kalender.temaer.${tema}`).toLowerCase();
    return KALENDERTEMAER.map((tema) => ({
      id: `kalender:${tema}`,
      type: 'tidslinje' as const,
      tittel: { nb: hentTekst('nb', 'kalender.sokTema', { tema: navn('nb', tema) }), nn: hentTekst('nn', 'kalender.sokTema', { tema: navn('nn', tema) }) },
      tekst: { nb: hentTekst('nb', 'kalender.sokTemaTekst', { tema: navn('nb', tema) }), nn: hentTekst('nn', 'kalender.sokTemaTekst', { tema: navn('nn', tema) }) },
      stikkord: STIKKORD[tema],
      rute: kalenderLenke(tema),
      modul: 'kalender',
      // Lavere enn selve kalenderen, så søk på «kalender» gir den først.
      vekt: 0.5,
    }));
  },
  async favorittbare(ider) {
    return bareSpurte([oversiktsfavoritt(manifest)], ider);
  },
  async frister() {
    return [];
  },
  kilder: ['eksamensdatoer', 'lovdata-lokale', 'udir-administrere-eksamen'],
  // Står i panelet øverst på forsiden, ikke under «Oppslag» (eier 07.10.2026).
  paaForsiden: false,
  status: 'aktiv',
};
