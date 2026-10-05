// Fylkene (fase 6, pakke 4, avgjørelse 061): én side per fylke med lenker til fylkets egne sider per tema, de lokale
// forskriftene fra Lovdata (også skolenes egne regler), og skolene, opplæringskontorene og kalenderne for fylket.
// Står under Oppslag på forsiden med navnet på fylket brukeren har valgt (eier 05.10.2026). Boksen «Hos
// fylkeskommunen» i veiviserne lenker hit.
import { fylker } from '../../app/Stedmerknad.tsx';
import { bareSpurte, oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { fylkeFor, fylkeRute } from './innhold.ts';

export const manifest: Modulmanifest = {
  id: 'fylker',
  navn: 'moduler.fylker.navn',
  beskrivelse: 'moduler.fylker.beskrivelse',
  ikon: 'kontor',
  kategori: 'felles',
  rekkefolge: 30,
  ruter: [
    { sti: '/fylker', tittel: 'fylker.tittel', side: () => import('./sider/Oversikt.tsx') },
    { sti: '/fylker/:fylke', tittel: 'fylker.tittel', side: () => import('./sider/Fylke.tsx') },
  ],
  innganger: [
    {
      id: 'fylker',
      tittel: 'moduler.fylker.navn',
      beskrivelse: 'moduler.fylker.beskrivelse',
      rute: '/fylker',
      ikon: 'kontor',
      etterFylke: (fylke) => {
        const f = fylkeFor(fylke);
        return f ? { tittel: f.navn, rute: fylkeRute(f.fylke) } : null;
      },
    },
  ],
  async sokeoppforinger() {
    return [
      { id: 'fylker:oversikt', type: 'modul' as const, tittel: { nb: 'Fylkene', nn: 'Fylka' }, stikkord: ['fylkeskommune', 'fylke', 'lokale forskrifter'], rute: '/fylker', modul: 'fylker' },
      ...fylker.flatMap((f) => {
        const o = fylkeFor(f.nummer);
        return o ? [{ id: `fylker:${f.nummer}`, type: 'side' as const, tittel: { nb: o.navn, nn: o.navn }, stikkord: [f.navn, 'fylkeskommune'], rute: fylkeRute(f.nummer), modul: 'fylker', sted: [f.nummer] }] : [];
      }),
    ];
  },
  async favorittbare(ider) {
    return bareSpurte(
      [
        oversiktsfavoritt(manifest),
        ...fylker.flatMap((f) => {
          const o = fylkeFor(f.nummer);
          return o ? [{ id: `fylker:${f.nummer}`, type: 'side' as const, tittel: { nb: o.navn, nn: o.navn }, rute: fylkeRute(f.nummer) }] : [];
        }),
      ],
      ider,
    );
  },
  async frister() {
    return [];
  },
  kilder: ['lovdata-lokale'],
  status: 'aktiv',
};
