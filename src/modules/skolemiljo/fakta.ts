// Fakta til dagens jukselapp fra Skolemiljø (avgjørelse 085): kapittel 12, skolereglene og aktivitetsplikten fra
// innholdet, og mobbing og læringsmiljøet for Vg1 i Elevundersøkelsen for landet, fylket og skolen brukeren har valgt.
// Lastes bare når modulen har dagen.
import eu from 'virtual:jukselappeu';
import fylkerFil from '../../../content/fylker.yaml';
import { formaterTall, hentTekst, latBegge, type Malform } from '../../core/i18n/tekst.ts';
import type { Fylker, Innholdselement } from '../../core/innhold/skjema.ts';
import { faktaFraModul } from '../../core/jukselapp/innhold.ts';
import type { Faktum } from '../typer.ts';
import type { JukselappEu } from './elevundersokelsen/jukselapp.ts';
import { elevundersokelsenRute, kapittel12Rute, skolereglerRute, veiviserRute } from './innhold.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/skolemiljo/*.yaml', { import: 'default' });
const fylker = (fylkerFil as Fylker).fylker;

/** Mobbing og indeksene for Vg1 i Elevundersøkelsen, for landet, fylkene og skolene. */
export function faktaFraElevundersokelsen(d: JukselappEu): Faktum[] {
  const fakta: Faktum[] = [];
  for (const [enhet, rad] of Object.entries(d.verdier)) {
    const skole = enhet.startsWith('S') ? d.skoler[enhet] : undefined;
    const fylke = enhet === 'L' ? null : skole ? skole[1] : enhet.slice(1);
    if (enhet.startsWith('S') && !skole) continue;
    const navn = skole ? skole[0] : fylke ? (fylker.find((f) => f.nummer === fylke)?.navn ?? fylke) : null;
    const hvor = (m: Malform) =>
      skole ? hentTekst(m, 'jukselapp.vedSkole', { sted: navn ?? '' }) : hentTekst(m, 'jukselapp.iSted', { sted: navn ?? hentTekst(m, 'jukselapp.landet') });
    const gyldighet: Faktum['gyldighet'] =
      skole && fylke ? { niva: 'skole', fylke, skole: enhet.slice(1), forhold: 'supplerer' } : fylke ? { niva: 'fylke', fylke, forhold: 'supplerer' } : undefined;
    for (const s of d.sporsmal) {
      const verdi = rad[s.kode];
      if (!verdi) continue;
      const [naa, foer] = verdi;
      const mobbing = s.type === 'mobbing';
      const verdier = { navn: s.navn, verdi: formaterTall(naa, 1), forrige: foer === null ? '' : formaterTall(foer, 1), skolear: d.skolear[0] };
      const tekst = mobbing ? (foer === null ? 'jukselapp.euMobbing' : 'jukselapp.euMobbingForrige') : 'jukselapp.euIndeks';
      fakta.push({
        id: `skolemiljo:eu:${s.kode}:${enhet}`,
        tittel: latBegge((m) => hentTekst(m, 'jukselapp.euTittel', verdier)),
        tekst: latBegge((m) => hentTekst(m, tekst, { ...verdier, hvor: hvor(m) })),
        under: 'skolemiljo.elevundersokelsen.tittel',
        lenke: latBegge((m) => hentTekst(m, 'skolemiljo.elevundersokelsen.tittel')),
        rute: elevundersokelsenRute,
        kilder: [{ id: 'udir-elevundersokelsen' }],
        ...(gyldighet ? { gyldighet } : {}),
      });
    }
  }
  return fakta;
}

export async function fakta(): Promise<Faktum[]> {
  const innhold = await faktaFraModul(filer, {
    modul: 'skolemiljo',
    under: 'moduler.skolemiljo.navn',
    veiviserRute,
    sider: {
      'kapittel-12': { rute: kapittel12Rute, lenke: 'skolemiljo.kapittel12.tittel' },
      skoleregler: { rute: skolereglerRute, lenke: 'skolemiljo.skoleregler.tittel' },
      'skoleregler-fylker': { rute: skolereglerRute, lenke: 'skolemiljo.skoleregler.tittel' },
    },
  });
  return [...innhold, ...(eu ? faktaFraElevundersokelsen(eu) : [])];
}
