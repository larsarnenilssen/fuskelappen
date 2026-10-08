// Aktivitetsplikt og skoleregler (modulen skolemiljo, fase 7, nytt navn 08.10.2026, avgjørelse 087): opplæringslova kapittel 12 som egen side, aktivitetsplikten som veiviser (avgjørelse 041), og
// skolereglene: reglene i loven, paragrafene om reaksjoner og saksbehandling i skolereglene for fylket (fylkesinnhold)
// og skolens egne regler (skoleinnhold). Innholdet står i content/skolemiljo/, og skolereglene i data/lovdata/.
import { begge } from '../../core/i18n/tekst.ts';
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { GAMMEL_RUTE as gammelElevundersokelsen } from '../elevundersokelsen/adresse.ts';
import { hentInnhold, kapittel12Rute, skolereglerRute, UNDERSIDER, veiviserRute } from './innhold.ts';

export const manifest: Modulmanifest = {
  id: 'skolemiljo',
  navn: 'moduler.skolemiljo.navn',
  beskrivelse: 'moduler.skolemiljo.beskrivelse',
  ikon: 'person',
  kategori: 'skolemiljo',
  rekkefolge: 10,
  ruter: [
    { sti: '/skolemiljo', tittel: 'skolemiljo.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Sidene må stå før veiviseren, fordi rutene prøves i rekkefølge.
    { sti: kapittel12Rute, tittel: 'skolemiljo.kapittel12.tittel', side: () => import('./sider/Kapittel12.tsx') },
    { sti: skolereglerRute, tittel: 'skolemiljo.skoleregler.tittel', side: () => import('./sider/Skoleregler.tsx') },
    // Elevundersøkelsen er egen modul (avgjørelse 087). Den gamle adressen sender videre.
    { sti: gammelElevundersokelsen, tittel: 'elevundersokelsen.tittel', side: () => import('../elevundersokelsen/sider/TilElevundersokelsen.tsx') },
    { sti: '/skolemiljo/:veiviser', tittel: 'skolemiljo.tittel', side: () => import('./sider/Veiviserside.tsx') },
  ],
  async sokeoppforinger() {
    const { veivisere } = await hentInnhold();
    return [
      {
        id: 'skolemiljo:kapittel-12',
        type: 'side' as const,
        tittel: begge('skolemiljo.kapittel12.tittel'),
        tekst: begge('skolemiljo.kapittel12.beskrivelse'),
        stikkord: ['kapittel 12', 'skolemiljø', 'trygt og godt', 'mobbing', 'krenkelser', 'nulltoleranse', 'aktivitetsplikt', 'statsforvalteren', 'håndhevingsordningen', 'tvangsmulkt', 'fysisk skolemiljø', 'fysiske inngrep'],
        rute: kapittel12Rute,
        modul: 'skolemiljo',
      },
      {
        id: 'skolemiljo:skoleregler',
        type: 'side' as const,
        tittel: begge('skolemiljo.skoleregler.tittel'),
        tekst: begge('skolemiljo.skoleregler.beskrivelse'),
        stikkord: ['skoleregler', 'ordensreglement', 'reaksjoner', 'sanksjoner', 'bortvisning', 'skolebytte', 'saksbehandling'],
        rute: skolereglerRute,
        modul: 'skolemiljo',
      },
      ...veivisere
        .filter((v) => v.gyldighet.niva === 'nasjonal')
        .map((v) => ({ id: `skolemiljo:${v.id}`, type: 'veiviser' as const, tittel: v.tittel, tekst: v.tekst, stikkord: v.stikkord, rute: veiviserRute(v.id), modul: 'skolemiljo' })),
    ];
  },
  undersider: Object.values(UNDERSIDER),
  async favorittbare() {
    const { veivisere } = await hentInnhold();
    return [
      oversiktsfavoritt(manifest),
      { id: 'skolemiljo:kapittel-12', type: 'funksjon' as const, tittel: begge('skolemiljo.kapittel12.tittel'), rute: kapittel12Rute },
      { id: 'skolemiljo:skoleregler', type: 'funksjon' as const, tittel: begge('skolemiljo.skoleregler.tittel'), rute: skolereglerRute },
      ...veivisere.map((v) => ({ id: `skolemiljo:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) })),
    ];
  },
  lokaleRegler: ['skoleregler'],
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 086).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: ['opplaeringslova', 'opplaeringsforskrifta', 'forskrift-helse-miljo-skoler', 'udir-rundskriv-skolemiljo', 'udir-rundskriv-skolemiljo-hvem', 'udir-rundskriv-skolemiljo-retten', 'udir-rundskriv-skolemiljo-nulltoleranse', 'udir-rundskriv-skolemiljo-informasjon', 'lovdata-lokale', 'privatskolelova'],
  status: 'aktiv',
};
