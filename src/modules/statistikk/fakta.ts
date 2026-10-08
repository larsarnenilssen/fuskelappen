// Fakta til dagens jukselapp fra Videregående i tall (avgjørelse 085): søkerne, læreplassen og gjennomføringen i hele
// landet og i hvert fylke. Fylkets tall vises bare når fylket er valgt. Lastes bare når modulen har dagen.
import { formaterTall, hentTekst, latBegge, type Malform } from '../../core/i18n/tekst.ts';
import type { Statistikk } from '../../core/statistikk/skjema.ts';
import { lastStatistikk } from '../../data/statistikk.ts';
import type { Faktum } from '../typer.ts';
import { STATISTIKK_RUTE } from './adresse.ts';

type Nokkel = Parameters<typeof hentTekst>[1];

/** Siste tall i en rekke, og tallet før, med plassen i rekken. Skjulte tall («*») hoppes over. */
const siste = (rekke: readonly unknown[] | undefined) => {
  const tall = (rekke ?? []).map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => typeof x.v === 'number');
  return { naa: tall.at(-1), forrige: tall.at(-2) };
};

export function faktaFraStatistikk(d: Statistikk): Faktum[] {
  const fylker = Object.keys(d.enheter).filter((e) => /^F\d{2}$/.test(e));
  const fakta: Faktum[] = [];
  for (const enhet of ['L', ...fylker]) {
    const fylke = enhet === 'L' ? null : enhet.slice(1);
    const sted = (m: Malform) => (fylke ? (d.enheter[enhet]?.navn ?? fylke) : hentTekst(m, 'jukselapp.landet'));
    const felles = {
      under: 'moduler.statistikk.navn' as const,
      lenke: latBegge((m) => hentTekst(m, 'statistikk.iTall', { sted: fylke ? sted(m) : hentTekst(m, 'statistikk.landet') })),
      rute: `${STATISTIKK_RUTE}${fylke ? `?fylke=${fylke}` : ''}`,
      kilder: [{ id: d.kilde }],
      ...(fylke ? { gyldighet: { niva: 'fylke' as const, fylke, forhold: 'supplerer' as const } } : {}),
    };
    const legg = (id: string, tittel: Nokkel, tekst: Nokkel, verdier: Record<string, string | number>) =>
      fakta.push({
        id: `statistikk:${id}:${enhet}`,
        tittel: latBegge((m) => hentTekst(m, tittel)),
        tekst: latBegge((m) => hentTekst(m, tekst, { ...verdier, sted: sted(m) })),
        ...felles,
      });
    const s = siste(d.sokere.alle[enhet]);
    // «Året før» bare når tallet før er fra året rett før.
    if (s.naa && s.forrige && s.forrige.i === s.naa.i - 1) {
      legg('sokere', 'jukselapp.sokereTittel', 'jukselapp.sokere', {
        antall: formaterTall(s.naa.v, 0),
        aar: d.sokere.aar[s.naa.i] ?? '',
        forrige: formaterTall(s.forrige.v, 0),
      });
    }
    const f = siste(d.formidling.desember[enhet]);
    if (f.naa) legg('formidling', 'jukselapp.formidlingTittel', 'jukselapp.formidling', { andel: formaterTall(f.naa.v, 1), aar: d.formidling.aar[f.naa.i] ?? '' });
    const g = siste(d.gjennomforing.verdier[enhet]);
    if (g.naa) legg('gjennomforing', 'jukselapp.gjennomforingTittel', 'jukselapp.gjennomforing', { andel: formaterTall(g.naa.v, 1), kull: d.gjennomforing.kull[g.naa.i] ?? '' });
  }
  return fakta;
}

export async function fakta(): Promise<Faktum[]> {
  return faktaFraStatistikk(await lastStatistikk());
}
