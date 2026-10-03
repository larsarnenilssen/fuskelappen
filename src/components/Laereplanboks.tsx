// Læreplanene til et steg i en veiviser, i en boks som er lukket til brukeren åpner den (eier 03.10.2026). Hver
// læreplan har tittel og kode, om den er kompetansegivende, vurderingsuttrykket fra Grep og en kort merknad. Fagkodene
// står under hver læreplan i én lukket rad per trinn, med lenke til fagarket. Læreplaner for voksne står i en egen
// gruppe nederst (eier 03.10.2026).
import { Fragment } from 'preact';
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
type Malgruppe = Laereplan['malgruppe'];

const MALGRUPPER: readonly Malgruppe[] = ['elever', 'voksne'];

/** Læreplanene gruppert etter målgruppe, elever først. Grupper uten læreplaner er utelatt. */
export function laereplanerPerMalgruppe(laereplaner: readonly Laereplan[]): [Malgruppe, Laereplan[]][] {
  return MALGRUPPER.map((m): [Malgruppe, Laereplan[]] => [m, laereplaner.filter((lp) => lp.malgruppe === m)]).filter(([, l]) => l.length > 0);
}

const TRINN: readonly Trinn[] = ['Vg1', 'Vg2', 'Vg3', 'Bedrift'];

/**
 * Fagkodene til en læreplan per trinn (Vg1, Vg2, Vg3), i rekkefølge og sortert. Et fag som gjelder for flere trinn,
 * står under hvert av dem.
 */
export function fagPerTrinn(indeks: Fagindeks, laereplan: string): [Trinn, string[]][] {
  const grupper = new Map<Trinn, string[]>();
  for (const [kode, fag] of Object.entries(indeks.fag)) {
    if (fag.lp !== laereplan) continue;
    for (const trinn of fag.trinn) grupper.set(trinn, [...(grupper.get(trinn) ?? []), kode]);
  }
  return [...grupper]
    .sort(([a], [b]) => TRINN.indexOf(a) - TRINN.indexOf(b))
    .map(([trinn, koder]) => [trinn, koder.sort()]);
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
  const grupper = laereplanerPerMalgruppe(laereplaner);
  // Overskrifter for målgruppene trengs bare når det er mer enn én.
  const medGrupper = grupper.length > 1;
  return (
    <div class="laereplanboks">
      <Forklaring tittel={t('komponenter.veiviser.laereplaner', { antall: String(laereplaner.length) })} ikon="bok">
        {grupper.map(([malgruppe, planer]) => (
          <Fragment key={malgruppe}>
            {medGrupper && <h3 class="laereplanboks-gruppe">{t(`komponenter.veiviser.malgruppe.${malgruppe}`)}</h3>}
            <ul class="laereplanboks-liste">
              {planer.map((lp) => (
                <li key={lp.kode}>
                  <Laereplanrad laereplan={lp} data={data} nivaa={medGrupper ? 4 : 3} />
                </li>
              ))}
            </ul>
          </Fragment>
        ))}
      </Forklaring>
    </div>
  );
}

function Laereplanrad({
  laereplan,
  data,
  nivaa,
}: {
  laereplan: Laereplan;
  data: { indeks: Fagindeks; titler: Readonly<Record<string, string>> } | null;
  nivaa: 3 | 4;
}) {
  const { t, malform } = useTekst();
  const grupper = data ? fagPerTrinn(data.indeks, laereplan.kode) : [];
  const koder = [...new Set(grupper.flatMap(([, k]) => k))];
  // Vurderingsuttrykkene for elevene i fagene, f.eks. «Deltatt» eller «Tallkarakter».
  const uttrykk = data
    ? [...new Set(koder.flatMap((k) => (data.indeks.fag[k]?.elev?.uttrykk ? [koTekst(t, data.indeks, 'uttrykk', data.indeks.fag[k]?.elev?.uttrykk ?? '')] : [])))]
    : [];
  const Tittel = nivaa === 4 ? 'h4' : 'h3';
  return (
    <>
      <Tittel class="laereplanboks-tittel">
        {data?.titler[laereplan.kode] ?? laereplan.kode} <span class="fagliste-kode">{laereplan.kode}</span>
      </Tittel>
      <p class="merker laereplanboks-merker">
        {laereplan.kompetansegivende !== undefined && (
          <span class={`merke ${laereplan.kompetansegivende ? 'merke-kompetansegivende' : 'merke-ikke-kompetansegivende'}`}>
            {laereplan.kompetansegivende && <Ikon navn="ok" class="ikon-liten" />}
            {laereplan.kompetansegivende ? t('komponenter.veiviser.kompetansegivende') : t('komponenter.veiviser.ikkeKompetansegivende')}
          </span>
        )}
        {uttrykk.length > 0 && <span class="merke">{t('komponenter.veiviser.vurdering', { uttrykk: uttrykk.join(' / ') })}</span>}
      </p>
      <p class="laereplanboks-merknad">{laereplan.merknad[malform]}</p>
      {data && koder.length > 0 && <Fagkoder grupper={grupper} indeks={data.indeks} malform={malform} />}
    </>
  );
}

/** Fagkodene per trinn. Hvert trinn er en rad som er lukket til brukeren åpner den (eier 03.10.2026). */
function Fagkoder({ grupper, indeks, malform }: { grupper: [Trinn, string[]][]; indeks: Fagindeks; malform: Malform }) {
  const { t } = useTekst();
  return (
    <div class="laereplanboks-fag">
      <p class="laereplanboks-trinnnavn">{t('komponenter.veiviser.fagkodene')}</p>
      {grupper.map(([trinn, koder]) => (
        <Trinngruppe key={trinn} navn={trinnTekst(t, trinn)} koder={koder} indeks={indeks} malform={malform} />
      ))}
    </div>
  );
}

function Trinngruppe({ navn, koder, indeks, malform }: { navn: string; koder: string[]; indeks: Fagindeks; malform: Malform }) {
  const { t } = useTekst();
  const [vis, settVis] = useState(false);
  const id = useId();
  return (
    <div class="faggruppe-valg">
      <button type="button" class="faggruppe-valg-knapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
        <span>
          {navn}
          <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten fagrad-pil" />
        </span>
        <span class="fagliste-timer tall">{t('komponenter.veiviser.antallFag', { antall: formaterTall(koder.length) })}</span>
      </button>
      <div id={id} class="faggruppe-innhold" hidden={!vis}>
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
    </div>
  );
}
