// Fakta til dagens jukselapp fra Videregående i tall (avgjørelse 086): søkerne, elevene, læreplassen, gjennomføringen,
// fag- og svennebrevene, fraværet og snittkarakteren til skriftlig eksamen i hele landet og i hvert fylke, og elevene og
// fraværet på hver skole. Fylkets tall vises bare når fylket er valgt, og skolens bare når skolen er valgt. Lastes bare
// når modulen har dagen.
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

/** Et tall, eller null når det er skjult («*») eller mangler. */
const tall = (v: unknown): number | null => (typeof v === 'number' ? v : null);

export function faktaFraStatistikk(d: Statistikk): Faktum[] {
  const fylker = Object.keys(d.enheter).filter((e) => /^F\d{2}$/.test(e));
  const skoler = Object.keys(d.enheter).filter((e) => e.startsWith('S') && d.enheter[e]?.fylke);
  const fakta: Faktum[] = [];
  for (const enhet of ['L', ...fylker, ...skoler]) {
    const info = d.enheter[enhet];
    const skole = enhet.startsWith('S') ? enhet.slice(1) : null;
    const fylke = enhet === 'L' ? null : skole ? (info?.fylke ?? null) : enhet.slice(1);
    const sted = (m: Malform) => (enhet === 'L' ? hentTekst(m, 'jukselapp.landet') : (info?.navn ?? enhet));
    const lenkested = (m: Malform) => (fylke ? (d.enheter[`F${fylke}`]?.navn ?? fylke) : hentTekst(m, 'statistikk.landet'));
    const gyldighet: Faktum['gyldighet'] = skole && fylke
      ? { niva: 'skole', fylke, skole, forhold: 'supplerer' }
      : fylke
        ? { niva: 'fylke', fylke, forhold: 'supplerer' }
        : undefined;
    type Verdier = Record<string, string | number>;
    const legg = (id: string, tittel: Nokkel, tekst: Nokkel, verdier: Verdier | ((m: Malform) => Verdier)) =>
      fakta.push({
        id: `statistikk:${id}:${enhet}`,
        tittel: latBegge((m) => hentTekst(m, tittel, typeof verdier === 'function' ? verdier(m) : verdier)),
        tekst: latBegge((m) => hentTekst(m, tekst, { ...(typeof verdier === 'function' ? verdier(m) : verdier), sted: sted(m) })),
        under: 'moduler.statistikk.navn',
        lenke: latBegge((m) => hentTekst(m, 'statistikk.iTall', { sted: lenkested(m) })),
        rute: `${STATISTIKK_RUTE}${fylke ? `?fylke=${fylke}` : ''}`,
        kilder: [{ id: d.kilde }],
        ...(gyldighet ? { gyldighet } : {}),
      });

    // Elevene, og for landet og fylkene skolene.
    const e = siste(d.elever.elever[enhet]);
    const antallSkoler = e.naa ? tall(d.elever.skoler[enhet]?.[e.naa.i]) : null;
    if (e.naa) {
      const skolear = d.elever.skolear[e.naa.i] ?? '';
      if (skole) legg('elever', 'jukselapp.eleverTittel', 'jukselapp.eleverSkole', { antall: formaterTall(e.naa.v, 0), skolear });
      else if (antallSkoler) legg('elever', 'jukselapp.eleverTittel', 'jukselapp.elever', { antall: formaterTall(e.naa.v, 0), skoler: formaterTall(antallSkoler, 0), skolear });
    }
    const fravaer = tall(d.fravaer.total[enhet]);
    if (fravaer !== null) legg('fravaer', 'jukselapp.fravaerTittel', skole ? 'jukselapp.fravaerSkole' : 'jukselapp.fravaer', { dager: formaterTall(fravaer, 1), skolear: d.fravaer.skolear });
    if (skole) continue;

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
    const fagbrev = tall(d.fagbrev.verdier[enhet]);
    if (fagbrev !== null) legg('fagbrev', 'jukselapp.fagbrevTittel', 'jukselapp.fagbrev', { andel: formaterTall(fagbrev, 1), kull: d.fagbrev.kull });
    for (const fag of d.eksamen.fag) {
      const snitt = tall(d.eksamen.snitt[enhet]?.[fag.id]);
      if (snitt === null) continue;
      // Det korte navnet på faget fra siden, på begge målformer. Fag uten kort navn får navnet fra Udir.
      const kort = `statistikk.eksamen.kort.${fag.id}` as Nokkel;
      legg(`eksamen:${fag.id}`, 'jukselapp.eksamenTittel', d.eksamen.forelopig ? 'jukselapp.eksamenForelopig' : 'jukselapp.eksamen', (m) => {
        const navn = hentTekst(m, kort);
        return { fag: navn === kort ? fag.navn : navn, snitt: formaterTall(snitt, 1), skolear: d.eksamen.skolear };
      });
    }
  }
  return fakta;
}

export async function fakta(): Promise<Faktum[]> {
  return faktaFraStatistikk(await lastStatistikk());
}
