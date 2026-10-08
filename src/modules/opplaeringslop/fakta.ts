// Fakta til dagens jukselapp fra Opplæringsløp (avgjørelse 086): veiene til fag- og svennebrev, og tilbudene ved
// skolen brukeren har valgt, fra utdanning.no. Lastes bare når modulen har dagen.
import { formaterTall, hentTekst, latBegge } from '../../core/i18n/tekst.ts';
import { faktaFraElementer } from '../../core/jukselapp/fakta.ts';
import { lastSkoler } from '../../data/utdanning.ts';
import type { Faktum } from '../typer.ts';
import { hentVeier, veiRute } from './fagbrev/data.ts';
import { skolerute } from './favoritter.ts';
import type { Skoleoppforing } from './skoler.ts';

/** Tilbudene ved hver skole med organisasjonsnummer, synlig bare når skolen er valgt. */
export function faktaFraSkoler(skoler: readonly Skoleoppforing[]): Faktum[] {
  return skoler.flatMap((s): Faktum[] => {
    if (!s.orgnr || !s.nr || !s.sted || s.tilbud.length === 0) return [];
    const verdier = { skole: s.navn, sted: s.sted, antall: formaterTall(s.tilbud.length, 0), programmer: formaterTall(new Set(s.tilbud.map((t) => t.slice(0, 2))).size, 0) };
    return [
      {
        id: `opplaeringslop:skole:${s.nr}`,
        tittel: { nb: s.navn, nn: s.navn },
        tekst: latBegge((m) => hentTekst(m, 'jukselapp.skoletilbud', verdier)),
        under: 'moduler.opplaeringslop.navn',
        lenke: latBegge((m) => hentTekst(m, 'opplaeringslop.tilbudVedSkolen', { skole: s.navn })),
        rute: skolerute(s.nr),
        kilder: [{ id: 'utdanning-no', punkt: 'Skoler' }],
        gyldighet: { niva: 'skole', fylke: s.fylke, skole: s.orgnr, forhold: 'supplerer' },
      },
    ];
  });
}

export async function fakta(): Promise<Faktum[]> {
  const [{ veier }, { skoler }] = await Promise.all([hentVeier(), lastSkoler()]);
  const fraVeier = faktaFraElementer(veier, { modul: 'opplaeringslop', under: 'moduler.opplaeringslop.navn', rute: (e) => veiRute(e.id), lenke: (e) => e.tittel });
  return [...fraVeier, ...faktaFraSkoler(skoler)];
}
