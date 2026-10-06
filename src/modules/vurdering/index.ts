// Vurdering (fase 6): grunnlag for vurdering (veiviser, avgjørelse 041), underveis- og sluttvurdering, og orden og
// oppførsel, etter opplæringsforskrifta kapittel 9, fraværsgrensen (pakke 2), og eksamen, klage på karakter, prøvene
// og fristene gjennom året (pakke 3, avgjørelse 059). Innholdet står i content/vurdering/, tallene for fraværsgrensen
// i rules/vurdering/ og eksamensdatoene i data/eksamen/.
import { begge } from '../../core/i18n/tekst.ts';
import type { Modulmanifest } from '../typer.ts';
import { eksamenRute, fravaerRute, fristerRute, gammelFristerRute, hentInnhold, ordenRute, proveneRute, underveisSluttRute, UNDERSIDER, veiviserRute } from './innhold.ts';
import { oversiktsfavoritt } from '../favoritter.ts';

export const manifest: Modulmanifest = {
  id: 'vurdering',
  navn: 'moduler.vurdering.navn',
  beskrivelse: 'moduler.vurdering.beskrivelse',
  ikon: 'vurdering',
  kategori: 'elev',
  rekkefolge: 20,
  ruter: [
    { sti: '/vurdering', tittel: 'vurdering.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Sidene må stå før veiviseren, fordi rutene prøves i rekkefølge.
    { sti: underveisSluttRute, tittel: 'vurdering.underveisSlutt.tittel', side: () => import('./sider/UnderveisSlutt.tsx') },
    { sti: ordenRute, tittel: 'vurdering.orden.tittel', side: () => import('./sider/Orden.tsx') },
    { sti: fravaerRute, tittel: 'vurdering.fravaer.tittel', side: () => import('./sider/Fravaer.tsx') },
    { sti: eksamenRute, tittel: 'vurdering.eksamen.tittel', side: () => import('./sider/Eksamen.tsx') },
    { sti: proveneRute, tittel: 'vurdering.provene.tittel', side: () => import('./sider/Provene.tsx') },
    // Den gamle adressen sender videre til kalenderen, filtrert på eksamen (avgjørelse 066).
    { sti: gammelFristerRute, tittel: 'kalender.tittel', side: () => import('../kalender/sider/TilKalender.tsx') },
    { sti: '/vurdering/:veiviser', tittel: 'vurdering.tittel', side: () => import('./sider/Veiviserside.tsx') },
  ],
  async sokeoppforinger() {
    const { veivisere } = await hentInnhold();
    return [
      {
        id: 'vurdering:underveis-og-slutt',
        type: 'side' as const,
        tittel: begge('vurdering.underveisSlutt.tittel'),
        tekst: begge('vurdering.underveisSlutt.beskrivelse'),
        stikkord: ['underveisvurdering', 'sluttvurdering', 'standpunkt', 'halvårsvurdering', 'kompetansemål', 'vurdering'],
        rute: underveisSluttRute,
        modul: 'vurdering',
      },
      {
        id: 'vurdering:orden-og-oppforsel',
        type: 'side' as const,
        tittel: begge('vurdering.orden.tittel'),
        tekst: begge('vurdering.orden.beskrivelse'),
        stikkord: ['orden', 'oppførsel', 'atferd', 'skoleregler', 'Ng', 'Lg'],
        rute: ordenRute,
        modul: 'vurdering',
      },
      {
        id: 'vurdering:fravaer',
        type: 'kalkulator' as const,
        tittel: begge('vurdering.fravaer.tittel'),
        tekst: begge('vurdering.fravaer.beskrivelse'),
        stikkord: ['fravær', 'fraværsgrense', 'fraværsgrensen', '10 prosent', '15 prosent', 'egenmelding', 'legeerklæring', 'IV', 'kalkulator'],
        rute: fravaerRute,
        modul: 'vurdering',
      },
      {
        id: 'vurdering:eksamen',
        type: 'side' as const,
        tittel: begge('vurdering.eksamen.tittel'),
        tekst: begge('vurdering.eksamen.beskrivelse'),
        stikkord: ['eksamen', 'trekk', 'trekkfag', 'oppmelding', 'sensur', 'tilrettelegging', 'utsatt eksamen', 'ny eksamen', 'særskilt eksamen', 'bortvisning', 'annullering', 'juks'],
        rute: eksamenRute,
        modul: 'vurdering',
      },
      {
        id: 'vurdering:fag-og-svenneproven',
        type: 'side' as const,
        tittel: begge('vurdering.provene.tittel'),
        tekst: begge('vurdering.provene.beskrivelse'),
        stikkord: ['fagprøve', 'svenneprøve', 'fagbrev', 'svennebrev', 'prøvenemnd', 'lærling', 'praksisbrev', 'kompetanseprøve', 'praksiskandidat'],
        rute: proveneRute,
        modul: 'vurdering',
      },
      ...veivisere
        .filter((v) => v.gyldighet.niva === 'nasjonal')
        .map((v) => ({ id: `vurdering:${v.id}`, type: 'veiviser' as const, tittel: v.tittel, tekst: v.tekst, stikkord: v.stikkord, rute: veiviserRute(v.id), modul: 'vurdering' })),
    ];
  },
  // To bokser på forsiden (eier 06.10.2026): modulen og «Eksamen og klage», som mange leter etter for seg.
  innganger: [
    { id: 'modul:vurdering', tittel: 'moduler.vurdering.navn', beskrivelse: 'moduler.vurdering.beskrivelse', rute: '/vurdering', ikon: 'vurdering' },
    { id: 'vurdering:eksamen', tittel: 'vurdering.eksamenOgKlage.tittel', beskrivelse: 'vurdering.eksamenOgKlage.beskrivelse', rute: eksamenRute, ikon: UNDERSIDER.eksamen.ikon },
  ],
  undersider: Object.values(UNDERSIDER),
  async favorittbare() {
    const { veivisere } = await hentInnhold();
    // Ikonene kommer fra kortene på oversikten (undersider, avgjørelse 058).
    return [
      oversiktsfavoritt(manifest),
      { id: 'vurdering:underveis-og-slutt', type: 'funksjon' as const, tittel: begge('vurdering.underveisSlutt.tittel'), rute: underveisSluttRute },
      { id: 'vurdering:orden-og-oppforsel', type: 'funksjon' as const, tittel: begge('vurdering.orden.tittel'), rute: ordenRute },
      { id: 'vurdering:fravaer', type: 'funksjon' as const, tittel: begge('vurdering.fravaer.tittel'), rute: fravaerRute },
      { id: 'vurdering:eksamen', type: 'funksjon' as const, tittel: begge('vurdering.eksamen.tittel'), rute: eksamenRute },
      { id: 'vurdering:frister', type: 'funksjon' as const, tittel: begge('vurdering.frister.tittel'), rute: fristerRute },
      { id: 'vurdering:fag-og-svenneproven', type: 'funksjon' as const, tittel: begge('vurdering.provene.tittel'), rute: proveneRute },
      ...veivisere.map((v) => ({ id: `vurdering:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) })),
    ];
  },
  async frister() {
    return (await hentInnhold()).frister;
  },
  kilder: ['opplaeringsforskrifta', 'udir-merknader-ofo-kap9', 'udir-merknader-ofo-kap10', 'udir-rundskriv-fravarsgrensen', 'udir-standpunktvurdering', 'udir-klage-standpunkt', 'udir-sarskilt-tilrettelegging-eksamen', 'udir-administrere-eksamen', 'udir-klageinstanser', 'udir-grep', 'vigo-kodeverk'],
  status: 'aktiv',
};
