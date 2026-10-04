// Læreplanverket (pakke 6, avgjørelse 037): overordnet del fra udir.no, med søk og tekstene i rubrikker og
// bokser, og de grunnleggende ferdighetene og tverrfaglige temaene fra Grep. Fagarket lenker hit.
import { begge } from '../../core/i18n/tekst.ts';
import { bareSpurte } from '../favoritter.ts';
import type { Favorittbar, Modulmanifest } from '../typer.ts';
import { delfavoritt, delRute, elementRute, lastLaereplanverket, lastOverordnetDel } from './data.ts';
import { alleDeler } from './typer.ts';

export const manifest: Modulmanifest = {
  id: 'laereplanverket',
  navn: 'moduler.laereplanverket.navn',
  beskrivelse: 'moduler.laereplanverket.beskrivelse',
  ikon: 'lag',
  kategori: 'fag',
  rekkefolge: 10,
  ruter: [
    // Én side for hele overordnet del (eier 02.10.2026). Adressene til delene åpner og ruller til delen.
    { sti: '/laereplanverket', tittel: 'laereplanverket.tittel', side: () => import('./sider/OverordnetDel.tsx') },
    { sti: '/laereplanverket/overordnet-del', tittel: 'laereplanverket.overordnetDel', side: () => import('./sider/OverordnetDel.tsx') },
    { sti: '/laereplanverket/overordnet-del/:del', tittel: 'laereplanverket.overordnetDel', side: () => import('./sider/OverordnetDel.tsx') },
  ],
  async sokeoppforinger() {
    const [od, lv] = await Promise.all([lastOverordnetDel(), lastLaereplanverket()]);
    // Søket finner delene i overordnet del på tittel, nummer og ingress, og ferdighetene og temaene på navn.
    const ingress = (d: (typeof od.deler)[number], m: 'nb' | 'nn') =>
      d.ingress[m].map((b) => (b.type === 'liste' ? b.punkter.join(' ') : b.tekst)).join(' ');
    return [
      ...alleDeler(od.deler).map((d) => ({
        id: `laereplanverket:${d.nr ?? d.id}`,
        type: 'laereplanverk' as const,
        tittel: d.tittel,
        tekst: { nb: ingress(d, 'nb'), nn: ingress(d, 'nn') },
        stikkord: ['overordnet del', ...(d.nr ? [d.nr] : [])],
        rute: delRute(d),
        modul: 'laereplanverket',
      })),
      ...[...lv.ferdigheter.map((e) => ({ e, stikkord: 'grunnleggende ferdigheter' })), ...lv.temaer.map((e) => ({ e, stikkord: 'tverrfaglige temaer' }))].map(({ e, stikkord }) => ({
        id: `laereplanverket:${e.kode}`,
        type: 'laereplanverk' as const,
        tittel: e.navn,
        stikkord: [stikkord, e.kode],
        rute: elementRute(e.kode),
        modul: 'laereplanverket',
      })),
    ];
  },
  async favorittbare(ider) {
    const side: Favorittbar = { id: 'laereplanverket:overordnet-del', type: 'funksjon', tittel: begge('laereplanverket.tittel'), rute: '/laereplanverket' };
    // Delene av overordnet del kan favorittmerkes med den diskré stjernen (avgjørelse 058). Teksten lastes bare når
    // brukeren har en slik favoritt.
    const delerSpurt = !ider || ider.some((id) => id.startsWith('laereplanverket:') && id !== side.id);
    if (!delerSpurt) return bareSpurte([side], ider);
    const od = await lastOverordnetDel();
    const navn = (d: (typeof od.deler)[number], m: 'nb' | 'nn') => (d.nr ? `${d.nr} ${d.tittel[m]}` : d.tittel[m]);
    const deler: Favorittbar[] = alleDeler(od.deler).map((d) => ({ id: delfavoritt(d), type: 'element', tittel: { nb: navn(d, 'nb'), nn: navn(d, 'nn') }, rute: delRute(d) }));
    return bareSpurte([side, ...deler], ider);
  },
  async frister() {
    return [];
  },
  kilder: ['udir-overordnet-del', 'udir-grep'],
  status: 'aktiv',
};
