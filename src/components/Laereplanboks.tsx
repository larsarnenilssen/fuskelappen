// Læreplanene til et steg i en veiviser, i en boks som er lukket til brukeren åpner den (eier 03.10.2026). Hver
// læreplan har tittel og kode, om den er kompetansegivende, vurderingsuttrykket fra Grep og en kort merknad. Fagkodene
// står lukket under hver læreplan, gruppert etter trinn, med lenke til fagarket.
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import type { Malform } from '../core/i18n/tekst.ts';
import { formaterTall } from '../core/i18n/tekst.ts';
import type { Stegelement } from '../core/innhold/skjema.ts';
import { lastFagindeks, lastFagroller } from '../modules/fag/data.ts';
import type { Fagindeks, Trinn } from '../modules/fag/skjema.ts';
import { koTekst, trinnTekst } from '../modules/fag/visning.ts';
import { Forklaring } from './Forklaring.tsx';
import { Ikon } from './Ikon.tsx';

type Laereplan = Stegelement['laereplaner'][number];

const TRINN: readonly Trinn[] = ['Vg1', 'Vg2', 'Vg3', 'Bedrift'];

/**
 * Fagkodene til en læreplan, gruppert etter trinnene de gjelder for («Vg1», «Vg2–Vg3»). Gruppene står i rekkefølge
 * etter første trinn, og kodene sortert i hver gruppe.
 */
export function fagPerTrinn(indeks: Fagindeks, laereplan: string): [Trinn[], string[]][] {
  const grupper = new Map<string, { trinn: Trinn[]; koder: string[] }>();
  for (const [kode, fag] of Object.entries(indeks.fag)) {
    if (fag.lp !== laereplan) continue;
    const trinn = [...fag.trinn].sort((a, b) => TRINN.indexOf(a) - TRINN.indexOf(b));
    const nokkel = trinn.join(',');
    const g = grupper.get(nokkel) ?? { trinn, koder: [] };
    g.koder.push(kode);
    grupper.set(nokkel, g);
  }
  const forst = (t: Trinn[]) => (t[0] === undefined ? TRINN.length : TRINN.indexOf(t[0]));
  return [...grupper.values()]
    .sort((a, b) => forst(a.trinn) - forst(b.trinn) || a.trinn.length - b.trinn.length)
    .map((g) => [g.trinn, g.koder.sort()]);
}

/** «Grunnleggende norsk for språklige minoriteter, nivå 1, vg1 …» → «Nivå 1, vg1 …». Læreplanen står allerede over. */
export function kortFagnavn(navn: string): string {
  const i = navn.indexOf(', ');
  if (i < 0) return navn;
  const rest = navn.slice(i + 2);
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

export function Laereplanboks({ laereplaner }: { laereplaner: readonly Laereplan[] }) {
  const { t } = useTekst();
  const [data, settData] = useState<{ indeks: Fagindeks; titler: Readonly<Record<string, string>> } | null>(null);
  useEffect(() => {
    let aktiv = true;
    void Promise.all([lastFagindeks(), lastFagroller()]).then(
      ([indeks, roller]) => aktiv && settData({ indeks, titler: roller.laereplaner }),
      () => undefined,
    );
    return () => {
      aktiv = false;
    };
  }, []);
  if (laereplaner.length === 0) return null;
  return (
    <div class="laereplanboks">
      <Forklaring tittel={t('komponenter.veiviser.laereplaner', { antall: String(laereplaner.length) })} ikon="bok">
        <ul class="laereplanboks-liste">
          {laereplaner.map((lp) => (
            <li key={lp.kode}>
              <Laereplanrad laereplan={lp} data={data} />
            </li>
          ))}
        </ul>
      </Forklaring>
    </div>
  );
}

function Laereplanrad({ laereplan, data }: { laereplan: Laereplan; data: { indeks: Fagindeks; titler: Readonly<Record<string, string>> } | null }) {
  const { t, malform } = useTekst();
  const grupper = data ? fagPerTrinn(data.indeks, laereplan.kode) : [];
  const koder = grupper.flatMap(([, k]) => k);
  // Vurderingsuttrykkene for elevene i fagene, f.eks. «Deltatt» eller «Tallkarakter».
  const uttrykk = data
    ? [...new Set(koder.flatMap((k) => (data.indeks.fag[k]?.elev?.uttrykk ? [koTekst(t, data.indeks, 'uttrykk', data.indeks.fag[k]?.elev?.uttrykk ?? '')] : [])))]
    : [];
  return (
    <>
      <h3 class="laereplanboks-tittel">
        {data?.titler[laereplan.kode] ?? laereplan.kode} <span class="fagliste-kode">{laereplan.kode}</span>
      </h3>
      <p class="merker laereplanboks-merker">
        <span class={`merke ${laereplan.kompetansegivende ? 'merke-kompetansegivende' : 'merke-ikke-kompetansegivende'}`}>
          {laereplan.kompetansegivende && <Ikon navn="ok" class="ikon-liten" />}
          {laereplan.kompetansegivende ? t('komponenter.veiviser.kompetansegivende') : t('komponenter.veiviser.ikkeKompetansegivende')}
        </span>
        {uttrykk.length > 0 && <span class="merke">{t('komponenter.veiviser.vurdering', { uttrykk: uttrykk.join(' / ') })}</span>}
      </p>
      <p class="laereplanboks-merknad">{laereplan.merknad[malform]}</p>
      {data && koder.length > 0 && <Fagkoder grupper={grupper} indeks={data.indeks} malform={malform} />}
    </>
  );
}

function Fagkoder({ grupper, indeks, malform }: { grupper: [Trinn[], string[]][]; indeks: Fagindeks; malform: Malform }) {
  const { t } = useTekst();
  const [vis, settVis] = useState(false);
  const id = useId();
  const antall = grupper.reduce((n, [, k]) => n + k.length, 0);
  return (
    <div class="faggruppe-valg laereplanboks-fag">
      <button type="button" class="faggruppe-valg-knapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
        <span>
          {t('komponenter.veiviser.fagkodene', { antall: formaterTall(antall) })}
          <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten fagrad-pil" />
        </span>
      </button>
      <div id={id} class="faggruppe-innhold" hidden={!vis}>
        {grupper.map(([trinn, koder]) => (
          <div key={trinn.join(',')} class="laereplanboks-trinn">
            <p class="laereplanboks-trinnnavn">{trinn.map((x) => trinnTekst(t, x)).join('–')}</p>
            <ul class="tilbud-fagliste">
              {koder.map((k) => {
                const fag = indeks.fag[k];
                return (
                  <li key={k}>
                    <span class="fagliste-navn">
                      <a href={`#/fag/${k}`}>{fag ? kortFagnavn(fag.navn[malform]) : k}</a> <span class="fagliste-kode">{k}</span>
                    </span>
                    {fag?.timer != null && <span class="fagliste-timer tall">{formaterTall(fag.timer)}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
