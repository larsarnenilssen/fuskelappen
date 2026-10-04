// Testmodul. Tas bare med i utvikling og testing (se testoppsettPlugin).
// Brukes til å vise at en ny modul dukker opp på forsiden og i søket uten endring i forsidekoden.
import type { Modulmanifest } from '../../../../src/modules/typer.ts';

export const manifest: Modulmanifest = {
  id: 'testmodul',
  navn: { nb: 'Testmodul for skolemiljø', nn: 'Testmodul for skulemiljø' },
  beskrivelse: { nb: 'Finnes bare i testene.', nn: 'Finst berre i testane.' },
  ikon: 'skole',
  kategori: 'skolemiljo',
  ruter: [
    {
      sti: '/testmodul',
      tittel: { nb: 'Testmodul', nn: 'Testmodul' },
      side: () => import('./Side.tsx'),
    },
  ],
  async sokeoppforinger() {
    return [
      {
        id: 'testmodul:skoleregler',
        type: 'side',
        tittel: { nb: 'Skoleregler i testfylket', nn: 'Skulereglar i testfylket' },
        tekst: { nb: 'Eksempel på en funksjon om skoleregler.', nn: 'Døme på ein funksjon om skulereglar.' },
        rute: '/testmodul',
        modul: 'testmodul',
      },
      // Samme tekst i nb og nn, slik at testene viser at søket normaliserer mellom målformene.
      { id: 'testmodul:bibliotek', type: 'side', tittel: { nb: 'Skolebibliotek', nn: 'Skolebibliotek' }, rute: '/testmodul', modul: 'testmodul' },
      { id: 'testmodul:skyss', type: 'side', tittel: { nb: 'Skuleskyss', nn: 'Skuleskyss' }, rute: '/testmodul', modul: 'testmodul' },
    ];
  },
  async favorittbare() {
    return [
      {
        id: 'testmodul:funksjon',
        type: 'funksjon',
        tittel: { nb: 'Testfunksjon', nn: 'Testfunksjon' },
        rute: '/testmodul',
      },
    ];
  },
  async frister() {
    return [];
  },
  innganger: [
    {
      id: 'testmodul:hoved',
      tittel: { nb: 'Testmodul for skolemiljø', nn: 'Testmodul for skulemiljø' },
      beskrivelse: { nb: 'Finnes bare i testene.', nn: 'Finst berre i testane.' },
      rute: '/testmodul',
      ikon: 'skole',
    },
    {
      id: 'testmodul:hurtig',
      tittel: { nb: 'Testkalkulator', nn: 'Testkalkulator' },
      rute: '/testmodul',
      ikon: 'kalkulator',
      flere: true,
    },
  ],
  flereTittel: { nb: 'Flere testfunksjoner', nn: 'Fleire testfunksjonar' },
  kilder: ['ks-sfs2213'],
  status: 'aktiv',
};
