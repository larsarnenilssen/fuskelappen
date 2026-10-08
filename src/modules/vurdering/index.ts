// Vurdering (fase 6): grunnlag for vurdering (veiviser, avgjørelse 041), underveis- og sluttvurdering, og orden og
// oppførsel, etter opplæringsforskrifta kapittel 9, og fraværsgrensen (pakke 2). Innholdet står i content/vurdering/
// og tallene for fraværsgrensen i rules/vurdering/. Eksamen, prøvene og klage på karakter er egen modul, Eksamen og
// klage (avgjørelse 078).
import { begge } from '../../core/i18n/tekst.ts';
import type { Modulmanifest } from '../typer.ts';
import { FLYTTET_TIL_EKSAMEN, fravaerRute, gammelFristerRute, hentInnhold, ordenRute, underveisSluttRute, UNDERSIDER, veiviserRute } from './innhold.ts';
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
    // Den gamle adressen sender videre til kalenderen, filtrert på eksamen (avgjørelse 066).
    { sti: gammelFristerRute, tittel: 'kalender.tittel', side: () => import('../kalender/sider/TilKalender.tsx') },
    // Eksamen, prøvene og klage sender videre til Eksamen og klage (avgjørelse 078).
    ...Object.keys(FLYTTET_TIL_EKSAMEN).map((sti) => ({ sti, tittel: 'eksamen.tittel' as const, side: () => import('./sider/TilEksamen.tsx') })),
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
      ...veivisere
        .filter((v) => v.gyldighet.niva === 'nasjonal')
        .map((v) => ({ id: `vurdering:${v.id}`, type: 'veiviser' as const, tittel: v.tittel, tekst: v.tekst, stikkord: v.stikkord, rute: veiviserRute(v.id), modul: 'vurdering' })),
    ];
  },
  undersider: Object.values(UNDERSIDER),
  async favorittbare() {
    const { veivisere } = await hentInnhold();
    // Ikonene kommer fra kortene på oversikten (undersider, avgjørelse 058).
    return [
      oversiktsfavoritt(manifest),
      { id: 'vurdering:underveis-og-slutt', type: 'funksjon' as const, tittel: begge('vurdering.underveisSlutt.tittel'), rute: underveisSluttRute },
      { id: 'vurdering:orden-og-oppforsel', type: 'funksjon' as const, tittel: begge('vurdering.orden.tittel'), rute: ordenRute },
      { id: 'vurdering:fravaer', type: 'funksjon' as const, tittel: begge('vurdering.fravaer.tittel'), rute: fravaerRute },
      ...veivisere.map((v) => ({ id: `vurdering:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) })),
    ];
  },
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 085).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: ['opplaeringsforskrifta', 'udir-merknader-ofo-kap9', 'udir-merknader-ofo-kap10', 'udir-rundskriv-fravarsgrensen', 'udir-standpunktvurdering', 'udir-grep', 'vigo-kodeverk'],
  status: 'aktiv',
};
