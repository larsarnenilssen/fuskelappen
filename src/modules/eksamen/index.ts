// Eksamen og klage (eier 06.10.2026, avgjørelse 078): eksamen, fag- og svenneprøven og de andre prøvene, veiviseren
// for klage på karakter og kalenderen for eksamen. Sidene stod i Vurdering (fase 6, pakke 3, avgjørelse 059).
// Innholdet står i content/eksamen/ og eksamensdatoene i data/eksamen/.
import { begge } from '../../core/i18n/tekst.ts';
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { eksamenRute, fristerRute, hentInnhold, proveneRute, UNDERSIDER, veiviserRute } from './innhold.ts';

export const manifest: Modulmanifest = {
  id: 'eksamen',
  navn: 'moduler.eksamen.navn',
  beskrivelse: 'moduler.eksamen.beskrivelse',
  ikon: 'dokument',
  kategori: 'elev',
  rekkefolge: 25,
  ruter: [
    { sti: '/eksamen', tittel: 'eksamen.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Sidene må stå før veiviseren, fordi rutene prøves i rekkefølge.
    { sti: eksamenRute, tittel: 'eksamen.eksamen.tittel', side: () => import('./sider/Eksamen.tsx') },
    { sti: proveneRute, tittel: 'eksamen.provene.tittel', side: () => import('./sider/Provene.tsx') },
    { sti: '/eksamen/:veiviser', tittel: 'eksamen.tittel', side: () => import('./sider/Veiviserside.tsx') },
  ],
  async sokeoppforinger() {
    const { veivisere } = await hentInnhold();
    return [
      {
        id: 'eksamen:eksamen',
        type: 'side' as const,
        tittel: begge('eksamen.eksamen.tittel'),
        tekst: begge('eksamen.eksamen.beskrivelse'),
        stikkord: ['eksamen', 'trekk', 'trekkfag', 'oppmelding', 'sensur', 'tilrettelegging', 'utsatt eksamen', 'ny eksamen', 'særskilt eksamen', 'bortvisning', 'annullering', 'juks'],
        rute: eksamenRute,
        modul: 'eksamen',
      },
      {
        id: 'eksamen:fag-og-svenneproven',
        type: 'side' as const,
        tittel: begge('eksamen.provene.tittel'),
        tekst: begge('eksamen.provene.beskrivelse'),
        stikkord: ['fagprøve', 'svenneprøve', 'fagbrev', 'svennebrev', 'prøvenemnd', 'lærling', 'praksisbrev', 'kompetanseprøve', 'praksiskandidat'],
        rute: proveneRute,
        modul: 'eksamen',
      },
      ...veivisere
        .filter((v) => v.gyldighet.niva === 'nasjonal')
        .map((v) => ({ id: `eksamen:${v.id}`, type: 'veiviser' as const, tittel: v.tittel, tekst: v.tekst, stikkord: v.stikkord, rute: veiviserRute(v.id), modul: 'eksamen' })),
    ];
  },
  undersider: Object.values(UNDERSIDER),
  async favorittbare() {
    const { veivisere } = await hentInnhold();
    // Ikonene kommer fra kortene på oversikten (undersider, avgjørelse 058).
    return [
      oversiktsfavoritt(manifest),
      { id: 'eksamen:eksamen', type: 'funksjon' as const, tittel: begge('eksamen.eksamen.tittel'), rute: eksamenRute },
      { id: 'eksamen:frister', type: 'funksjon' as const, tittel: begge('eksamen.frister.tittel'), rute: fristerRute },
      { id: 'eksamen:fag-og-svenneproven', type: 'funksjon' as const, tittel: begge('eksamen.provene.tittel'), rute: proveneRute },
      ...veivisere.map((v) => ({ id: `eksamen:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) })),
    ];
  },
  async frister() {
    return (await hentInnhold()).frister;
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 085).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: ['opplaeringsforskrifta', 'udir-merknader-ofo-kap9', 'udir-merknader-ofo-kap10', 'udir-klage-standpunkt', 'udir-sarskilt-tilrettelegging-eksamen', 'udir-administrere-eksamen', 'udir-klageinstanser', 'udir-fag-og-svenneprover', 'eksamensdatoer'],
  status: 'aktiv',
};
