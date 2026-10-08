// Fakta til dagens jukselapp fra Elevundersøkelsen (avgjørelse 086): mobbing og indeksene for Vg1 for landet, fylket
// og skolen brukeren har valgt, fra utdraget som lages når appen bygges. Lastes bare når modulen har dagen.
import eu from 'virtual:jukselappeu';
import fylkerFil from '../../../content/fylker.yaml';
import { formaterTall, hentTekst, latBegge, type Malform } from '../../core/i18n/tekst.ts';
import type { Fylker } from '../../core/innhold/skjema.ts';
import type { Faktum } from '../typer.ts';
import { ELEVUNDERSOKELSEN_RUTE } from './adresse.ts';
import type { JukselappEu } from './jukselapp.ts';

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
        id: `elevundersokelsen:${s.kode}:${enhet}`,
        tittel: { nb: s.navn, nn: s.navn },
        tekst: latBegge((m) => hentTekst(m, tekst, { ...verdier, hvor: hvor(m) })),
        under: 'moduler.elevundersokelsen.navn',
        lenke: latBegge((m) => hentTekst(m, 'elevundersokelsen.tittel')),
        rute: ELEVUNDERSOKELSEN_RUTE,
        kilder: [{ id: 'udir-elevundersokelsen' }],
        ...(gyldighet ? { gyldighet } : {}),
      });
    }
  }
  return fakta;
}

export async function fakta(): Promise<Faktum[]> {
  return eu ? faktaFraElevundersokelsen(eu) : [];
}
