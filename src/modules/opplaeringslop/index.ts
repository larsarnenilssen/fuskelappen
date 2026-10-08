// Opplæringstilbud (id opplaeringslop, eier 03.10.2026): tilbudsstrukturen i videregående i appen (pakke 5, avgjørelse 035). Program → tilbud → fag og timer,
// med lenker til fagarkene og til Vilbli for skolene som har tilbudet (avgjørelse 027). Skoleregisteret og
// opplæringskontorene (avgjørelse 053).
import { lastFagindeks } from '../fag/data.ts';
import { bareSpurte, oversiktsfavoritt } from '../favoritter.ts';
import type { Favorittbar, Modulmanifest } from '../typer.ts';
import { kontorfavoritt, kontorrute, skolefavoritt, skolerute, UNDERSIDER } from './favoritter.ts';
import { kortKode, tilbudRute } from './data.ts';
import { hentVeier, veiAdresse, veiRute } from './fagbrev/data.ts';
import { lastSkoler } from '../../data/utdanning.ts';
import { lastOpplaeringskontor } from '../../data/udir.ts';
import { begge } from '../../core/i18n/tekst.ts';
import { fylker } from '../../app/Stedmerknad.tsx';

export const manifest: Modulmanifest = {
  id: 'opplaeringslop',
  navn: 'moduler.opplaeringslop.navn',
  beskrivelse: 'moduler.opplaeringslop.beskrivelse',
  ikon: 'veiviser',
  kategori: 'inntak',
  rekkefolge: 20,
  ruter: [
    { sti: '/opplaeringslop', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Registrene står før /:program, så adressene ikke leses som et utdanningsprogram (avgjørelse 053).
    { sti: '/opplaeringslop/lop', tittel: 'opplaeringslop.lop.tittel', side: () => import('./sider/Lop.tsx') },
    { sti: '/opplaeringslop/skoler', tittel: 'opplaeringslop.skoler.tittel', side: () => import('./sider/Skoler.tsx') },
    { sti: '/opplaeringslop/laerlinger-og-kandidater', tittel: 'opplaeringslop.fagbrev.tittel', side: () => import('./sider/Fagbrev.tsx') },
    { sti: '/opplaeringslop/laerlinger-og-kandidater/:vei', tittel: 'opplaeringslop.fagbrev.tittel', side: () => import('./sider/Vei.tsx') },
    { sti: '/opplaeringslop/opplaeringskontor', tittel: 'opplaeringslop.kontor.tittel', side: () => import('./sider/Kontor.tsx') },
    { sti: '/opplaeringslop/:program', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Program.tsx') },
    { sti: '/opplaeringslop/:program/:tilbud', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Tilbud.tsx') },
  ],
  async sokeoppforinger() {
    // Søket trenger bare navnene, som står i fagindeksen. Tilbudene lastes først når et tilbud åpnes.
    const indeks = await lastFagindeks();
    // Skolene kan søkes på navn, sted og fylke, og åpnes i skoleoppslaget (eier 03.10.2026).
    const [skoler, kontor, veier] = await Promise.all([lastSkoler().then((s) => s.skoler), lastOpplaeringskontor().then((k) => k.kontor), hentVeier().then((v) => v.veier)]);
    const fylkenavn = (nr: string) => fylker.find((f) => f.nummer === nr)?.navn ?? '';
    return [
      {
        id: 'opplaeringslop:lop',
        type: 'side' as const,
        tittel: begge('opplaeringslop.lop.tittel'),
        tekst: begge('opplaeringslop.inngang.programTekst'),
        stikkord: ['utdanningsprogram', 'løp', 'tilbudsstruktur', 'vg1', 'vg2', 'vg3'],
        rute: '/opplaeringslop/lop',
        modul: 'opplaeringslop',
      },
      // Lærlinger og kandidater og hver vei (fase 6, pakke 6). «Fag- og svennebrev» finner siden (eier 06.10.2026).
      {
        id: 'opplaeringslop:laerlinger-og-kandidater',
        type: 'side' as const,
        tittel: begge('opplaeringslop.fagbrev.tittel'),
        tekst: begge('opplaeringslop.fagbrev.sokTekst'),
        stikkord: ['fag- og svennebrev', 'fagbrev', 'svennebrev', 'lærling', 'lærekandidat', 'praksisbrevkandidat', 'praksiskandidat', 'fagbrev på jobb', 'praksisbrev', 'kompetansebevis'],
        rute: UNDERSIDER.fagbrev.rute,
        modul: 'opplaeringslop',
      },
      ...veier.map((v) => ({
        id: `opplaeringslop:vei:${veiAdresse(v.id)}`,
        type: 'side' as const,
        tittel: v.tittel,
        tekst: v.kort,
        stikkord: v.stikkord,
        rute: veiRute(v.id),
        modul: 'opplaeringslop',
      })),
      ...skoler.map((s) => ({
        vekt: 0.6,
        id: `skole:${s.nr ?? s.navn}`,
        type: 'skole' as const,
        tittel: { nb: s.navn, nn: s.navn },
        tekst: { nb: [s.sted, fylkenavn(s.fylke)].filter(Boolean).join(', '), nn: [s.sted, fylkenavn(s.fylke)].filter(Boolean).join(', ') },
        stikkord: [s.sted ?? '', fylkenavn(s.fylke)].filter(Boolean),
        rute: s.nr ? skolerute(s.nr) : `/opplaeringslop/skoler?fylke=alle&q=${encodeURIComponent(s.navn)}`,
        modul: 'opplaeringslop',
        // Med valgt fylke vises bare skolene i fylket, til brukeren slår av knappen med fylket (eier 05.10.2026).
        sted: [s.fylke],
      })),
      // Opplæringskontorene, med fylkene de er godkjent i (eier 05.10.2026).
      ...kontor.map((k) => ({
        vekt: 0.6,
        id: kontorfavoritt(k.orgnr),
        type: 'kontor' as const,
        tittel: { nb: k.navn, nn: k.navn },
        tekst: { nb: k.kommune ?? '', nn: k.kommune ?? '' },
        rute: kontorrute(k.orgnr),
        modul: 'opplaeringslop',
        sted: k.godkjentI,
      })),
      ...Object.entries(indeks.utdanningsprogram).map(([program, navn]) => ({
        id: `opplaeringslop:${program}`,
        type: 'tilbud' as const,
        tittel: navn,
        stikkord: [program],
        rute: `/opplaeringslop/${program}`,
        modul: 'opplaeringslop',
      })),
      ...Object.entries(indeks.programomrader).map(([kode, po]) => ({
        // Varianter for særskilte skoler og opplæring i bedrift kommer lenger ned.
        ...(po.sted === 'bedrift' || /^[A-Z]{5}\d[A-Z]{2}/.test(kode) ? { vekt: 0.5 } : {}),
        id: `opplaeringslop:${kortKode(kode)}`,
        type: 'tilbud' as const,
        tittel: po.navn,
        stikkord: [kortKode(kode)],
        rute: tilbudRute(po.program, kode),
        modul: 'opplaeringslop',
      })),
    ];
  },
  undersider: Object.values(UNDERSIDER),
  async favorittbare(ider) {
    // Oversikten, registrene og løpet, programmene og tilbudene, og skolene og kontorene (avgjørelse 058). Dataene
    // lastes bare når brukeren har en favoritt som trenger dem.
    const sider: Favorittbar[] = [
      oversiktsfavoritt(manifest),
      { id: 'opplaeringslop:lop', type: 'side', tittel: begge('opplaeringslop.lop.tittel'), rute: UNDERSIDER.lop.rute },
      { id: 'opplaeringslop:laerlinger-og-kandidater', type: 'side', tittel: begge('opplaeringslop.fagbrev.tittel'), rute: UNDERSIDER.fagbrev.rute },
      { id: 'opplaeringslop:skoler', type: 'side', tittel: begge('opplaeringslop.skoler.tittel'), rute: UNDERSIDER.skoler.rute },
      { id: 'opplaeringslop:opplaeringskontor', type: 'side', tittel: begge('opplaeringslop.kontor.tittel'), rute: UNDERSIDER.kontor.rute },
    ];
    // Veiene for lærlinger og kandidater lastes bare når en av dem er spurt etter.
    if (!ider || ider.some((id) => id.startsWith('opplaeringslop:vei:'))) {
      const { veier } = await hentVeier();
      sider.push(...veier.map((v): Favorittbar => ({ id: `opplaeringslop:vei:${veiAdresse(v.id)}`, type: 'side', tittel: v.tittel, rute: veiRute(v.id) })));
    }
    const egne = ider?.filter((id) => id.startsWith('opplaeringslop:') && !sider.some((f) => f.id === id));
    if (egne?.length === 0) return bareSpurte(sider, ider);
    const trengs = (prefiks: string) => !egne || egne.some((id) => id.startsWith(prefiks));
    const skolerSpurt = trengs('opplaeringslop:skole:');
    const kontorSpurt = trengs('opplaeringslop:kontor:');
    const tilbudSpurt = !egne || egne.some((id) => !id.startsWith('opplaeringslop:skole:') && !id.startsWith('opplaeringslop:kontor:'));
    const [indeks, skoler, kontor] = await Promise.all([
      tilbudSpurt ? lastFagindeks() : null,
      skolerSpurt ? lastSkoler() : null,
      kontorSpurt ? lastOpplaeringskontor() : null,
    ]);
    const program: Favorittbar[] = Object.entries(indeks?.utdanningsprogram ?? {}).map(([kode, navn]) => ({ id: `opplaeringslop:${kode}`, type: 'side', tittel: navn, rute: `/opplaeringslop/${kode}` }));
    const tilbud: Favorittbar[] = Object.entries(indeks?.programomrader ?? {}).map(([kode, po]) => ({
      id: `opplaeringslop:${kortKode(kode)}`,
      type: 'side',
      tittel: { nb: `${po.navn.nb} (${kortKode(kode)})`, nn: `${po.navn.nn} (${kortKode(kode)})` },
      rute: tilbudRute(po.program, kode),
    }));
    const skolefavoritter: Favorittbar[] = (skoler?.skoler ?? []).flatMap((s) => (s.nr ? [{ id: skolefavoritt(s.nr), type: 'element' as const, tittel: { nb: s.navn, nn: s.navn }, rute: skolerute(s.nr) }] : []));
    const kontorfavoritter: Favorittbar[] = (kontor?.kontor ?? []).map((k) => ({ id: kontorfavoritt(k.orgnr), type: 'element', tittel: { nb: k.navn, nn: k.navn }, rute: kontorrute(k.orgnr) }));
    return bareSpurte([...sider, ...program, ...tilbud, ...skolefavoritter, ...kontorfavoritter], ider);
  },
  lokaleRegler: [],
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 086).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: ['udir-grep', 'udir-fag-og-timefordeling', 'utdanning-no', 'udir-nor'],
  status: 'aktiv',
};
