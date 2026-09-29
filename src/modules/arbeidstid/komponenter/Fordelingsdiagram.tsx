// Stolpediagram over årsverket i en tenkt stilling: planfestet tid (undervisning, møter, annen planfestet tid,
// funksjoner) og tid læreren disponerer selv. Egen SVG uten diagrambibliotek. Tallene står også i en tabell.
import { useTekst } from '../../../app/tilstand.ts';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Fordelingsdel } from '../beregning/index.ts';
import { tallTekst } from './Utregning.tsx';

const BREDDE = 320;
const HOYDE = 40;
const STOLPE = 24;

export function Fordelingsdiagram({ deler, totalt }: { deler: readonly Fordelingsdel[]; totalt: number }) {
  const { t } = useTekst();
  const navn = (d: Fordelingsdel) => t(`arbeidstid.fordeling.deler.${d.id}` as Tekstnokkel);
  const synlige = deler.filter((d) => d.timer > 0);
  let x = 0;
  const bokser = synlige.map((d) => {
    const b = totalt > 0 ? (d.timer / totalt) * BREDDE : 0;
    const boks = { d, x, b };
    x += b;
    return boks;
  });
  const planfestetSlutt = bokser.filter((b) => b.d.planfestet).reduce((s, b) => Math.max(s, b.x + b.b), 0);
  const andel = (timer: number) => (totalt > 0 ? (timer / totalt) * 100 : 0);
  const beskrivelse = t('arbeidstid.fordeling.diagramBeskrivelse', {
    timer: tallTekst(totalt),
    deler: synlige.map((d) => `${navn(d)} ${tallTekst(d.timer)} (${tallTekst(andel(d.timer), 1)} %)`).join(', '),
  });

  return (
    <figure class="fordeling">
      <figcaption class="liten-overskrift">{t('arbeidstid.fordeling.diagramTittel')}</figcaption>
      <svg class="diagram" viewBox={`0 0 ${BREDDE} ${HOYDE}`} role="img" aria-label={beskrivelse}>
        {bokser.map(({ d, x: bx, b }) => (
          <rect key={d.id} class={`fordeling-del-${d.id}`} x={bx} y={0} width={b} height={STOLPE} />
        ))}
        {bokser.slice(1).map(({ d, x: bx }) => (
          <line key={`skille-${d.id}`} class="fordeling-skille" x1={bx} x2={bx} y1={0} y2={STOLPE} />
        ))}
        {planfestetSlutt > 0 && <path class="fordeling-klamme" d={`M0.5 ${STOLPE + 4} V${STOLPE + 10} H${planfestetSlutt - 0.5} V${STOLPE + 4}`} />}
      </svg>
      <ul class="fordeling-forklaring">
        {synlige.map((d) => (
          <li key={d.id}>
            <span class={`fordeling-farge fordeling-del-${d.id}`} aria-hidden="true" />
            <span>{navn(d)}</span>
            <span class="tall dempet">
              {tallTekst(d.timer)} {t('arbeidstid.enheter.timer')} ({tallTekst(andel(d.timer), 1)} %)
            </span>
          </li>
        ))}
      </ul>
      <p class="liten dempet">
        {t('arbeidstid.fordeling.planfestet')}: {tallTekst(synlige.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0))} {t('arbeidstid.enheter.timer')}.{' '}
        {t('arbeidstid.fordeling.selvdisponert')}: {tallTekst(synlige.filter((d) => !d.planfestet).reduce((s, d) => s + d.timer, 0))}{' '}
        {t('arbeidstid.enheter.timer')}.
      </p>
    </figure>
  );
}

export function Fordelingstabell({ deler, totalt }: { deler: readonly Fordelingsdel[]; totalt: number }) {
  const { t } = useTekst();
  return (
    <table class="fordeling-tabell">
      <caption class="skjult-visuelt">{t('arbeidstid.fordeling.tabell')}</caption>
      <thead>
        <tr>
          <th scope="col">{t('arbeidstid.fordeling.del')}</th>
          <th scope="col" class="tall">
            {t('arbeidstid.fordeling.timer')}
          </th>
          <th scope="col" class="tall">
            {t('arbeidstid.fordeling.andel')}
          </th>
        </tr>
      </thead>
      <tbody>
        {deler.map((d) => (
          <tr key={d.id}>
            <th scope="row">{t(`arbeidstid.fordeling.deler.${d.id}` as Tekstnokkel)}</th>
            <td class="tall">{tallTekst(d.timer)}</td>
            <td class="tall">{tallTekst(totalt > 0 ? (d.timer / totalt) * 100 : 0, 1)} %</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
