// Begrepsbanken: felles modul som alle moduler legger sine begreper i.
// Aktiv fra fase 1, med begrepene om arbeidstid.
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import type { Modulmanifest } from '../typer.ts';
import { hentBegreper } from './innhold.ts';

/**
 * Ett begrep per id. Samme id kan finnes på flere nivåer (nasjonal, fylke, skole); siden velger riktig
 * nivå for brukeren, så søk og favoritter trenger bare én oppføring. Den nasjonale teksten brukes når den finnes.
 */
async function unikeBegreper(): Promise<Innholdselement[]> {
  const perId = new Map<string, Innholdselement>();
  for (const b of await hentBegreper()) {
    const forrige = perId.get(b.id);
    if (!forrige || b.gyldighet.niva === 'nasjonal') perId.set(b.id, b);
  }
  return [...perId.values()];
}

export const manifest: Modulmanifest = {
  id: 'begreper',
  navn: 'moduler.begreper.navn',
  beskrivelse: 'moduler.begreper.beskrivelse',
  ikon: 'bok',
  kategori: 'felles',
  rekkefolge: 10,
  ruter: [
    { sti: '/begreper', tittel: 'begreper.tittel', side: () => import('./sider/Liste.tsx') },
    { sti: '/begreper/:id', tittel: 'begreper.tittel', side: () => import('./sider/Begrep.tsx') },
  ],
  async sokeoppforinger() {
    return (await unikeBegreper()).map((b) => ({
      id: `begrep:${b.id}`,
      type: 'begrep' as const,
      tittel: b.tittel,
      tekst: b.tekst,
      stikkord: b.stikkord,
      rute: `/begreper/${b.id}`,
      modul: 'begreper',
    }));
  },
  async favorittbare() {
    return (await unikeBegreper()).map((b) => ({
      id: `begreper:${b.id}`,
      type: 'begrep' as const,
      tittel: b.tittel,
      rute: `/begreper/${b.id}`,
    }));
  },
  async frister() {
    return [];
  },
  kilder: ['ks-sfs2213-avtaletekst'],
  status: 'aktiv',
};
