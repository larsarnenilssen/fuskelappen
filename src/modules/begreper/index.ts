// Begrepsbanken: felles modul som alle moduler legger sine begreper i.
// Aktiv fra fase 1, med begrepene om arbeidstid.
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { hentBegreper } from './innhold.ts';
import { lastMerknader, merknadsoppforinger } from './merknader.ts';

/**
 * Ett begrep per id. Samme id kan finnes på flere nivåer (nasjonal, fylke, skole); siden velger riktig
 * nivå for brukeren, så søk og favoritter trenger bare én oppføring. Den nasjonale teksten brukes når den finnes.
 * Et begrep som bare finnes for et fylke, får fylket i søket og vises bare når det fylket er valgt.
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
    // Fagmerknadene og vitnemålsmerknadene er søkbare hver for seg. Feiler lastingen, søkes det uten dem.
    const koder = await lastMerknader().then(merknadsoppforinger, () => []);
    const begreper = (await unikeBegreper()).map((b) => ({
      id: `begrep:${b.id}`,
      type: 'begrep' as const,
      tittel: b.tittel,
      tekst: b.tekst,
      stikkord: b.stikkord,
      rute: `/begreper/${b.id}`,
      modul: 'begreper',
      ...(b.gyldighet.niva === 'nasjonal' ? {} : { fylke: b.gyldighet.fylke }),
    }));
    // Kodene i kodegruppene (f.eks. karakterer og vurderingsuttrykk) er søkbare hver for seg (eier 04.10.2026).
    const kodegrupper = (await unikeBegreper()).flatMap((b) =>
      'kodegrupper' in b && b.kodegrupper
        ? b.kodegrupper.flatMap((g) =>
            g.koder.map((k) => ({
              id: `kode:${b.id}:${g.id}:${k.kode}`,
              type: 'kode' as const,
              tittel: { nb: `${k.kode} ${k.navn.nb}`, nn: `${k.kode} ${k.navn.nn}` },
              tekst: k.tekst,
              stikkord: [k.kode, g.tittel.nb, g.tittel.nn],
              rute: `/begreper/${b.id}?q=${encodeURIComponent(k.kode)}`,
              modul: 'begreper',
            })),
          )
        : [],
    );
    return [...begreper, ...koder, ...kodegrupper];
  },
  async favorittbare() {
    const begreper = (await unikeBegreper()).map((b) => ({
      id: `begreper:${b.id}`,
      type: 'begrep' as const,
      tittel: b.tittel,
      rute: `/begreper/${b.id}`,
    }));
    return [oversiktsfavoritt(manifest), ...begreper];
  },
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 085).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: ['ks-sfs2213-avtaletekst', 'vigo-kodeverk'],
  status: 'aktiv',
};
