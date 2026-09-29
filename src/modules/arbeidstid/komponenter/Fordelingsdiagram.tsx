// Stolpediagram over årsverket i en tenkt stilling: planfestet tid (undervisning, møter, annen planfestet tid,
// funksjoner) og tid læreren disponerer selv. Egen SVG uten diagrambibliotek. Tallene står også i en tabell,
// med timer per uke i arbeidsåret, slik at fordelingen kan sammenlignes med en arbeidsplan.
import { useTekst } from '../../../app/tilstand.ts';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Fordelingsdel } from '../beregning/index.ts';
import { tallTekst } from './Utregning.tsx';

const BREDDE = 320;
const STOLPE = 40;
const HOYDE = STOLPE + 26;

export function Fordelingsdiagram({ deler, totalt }: { deler: readonly Fordelingsdel[]; totalt: number }) {
  const { t } = useTekst();
  const navn = (d: Fordelingsdel) => t(`arbeidstid.fordeling.deler.${d.id}` as Tekstnokkel);
  const synlige = deler.filter((d) => d.timer > 0);
  const andel = (timer: number) => (totalt > 0 ? (timer / totalt) * 100 : 0);
  let x = 0;
  const bokser = synlige.map((d) => {
    const b = totalt > 0 ? (d.timer / totalt) * BREDDE : 0;
    const boks = { d, x, b };
    x += b;
    return boks;
  });
  const planfestetSlutt = bokser.filter((b) => b.d.planfestet).reduce((s, b) => Math.max(s, b.x + b.b), 0);
  const planfestet = synlige.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
  const selv = synlige.filter((d) => !d.planfestet).reduce((s, d) => s + d.timer, 0);
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
        {bokser
          .filter(({ b }) => b >= 30)
          .map(({ d, x: bx, b }) => (
            <text key={`tekst-${d.id}`} class="fordeling-etikett" x={bx + b / 2} y={STOLPE / 2 + 4} text-anchor="middle">
              {tallTekst(andel(d.timer), 0)} %
            </text>
          ))}
        {planfestetSlutt > 0 && (
          <>
            <path class="fordeling-klamme" d={`M0.5 ${STOLPE + 3} V${STOLPE + 8} H${planfestetSlutt - 0.5} V${STOLPE + 3}`} />
            <text class="figur-tekst" x={planfestetSlutt / 2} y={STOLPE + 20} text-anchor="middle">
              {t('arbeidstid.fordeling.planfestet')} {t('arbeidstid.felles.timerKort', { timer: tallTekst(planfestet, 0) })}
            </text>
          </>
        )}
        {selv > 0 && planfestetSlutt < BREDDE - 40 && (
          <text class="figur-tekst" x={(planfestetSlutt + BREDDE) / 2} y={STOLPE + 20} text-anchor="middle">
            {t('arbeidstid.felles.timerKort', { timer: tallTekst(selv, 0) })}
          </text>
        )}
      </svg>
      <ul class="fordeling-forklaring fordeling-forklaring-rad">
        {synlige.map((d) => (
          <li key={d.id}>
            <span class={`fordeling-farge fordeling-del-${d.id}`} aria-hidden="true" />
            <span>{navn(d)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function Fordelingstabell({ deler, totalt, uker }: { deler: readonly Fordelingsdel[]; totalt: number; uker: number }) {
  const { t } = useTekst();
  const sum = (planfestet: boolean) => deler.filter((d) => d.planfestet === planfestet).reduce((s, d) => s + d.timer, 0);
  const rad = (id: string, tekst: string, timer: number, klasse?: string) => (
    <tr key={id} class={klasse}>
      <th scope="row">
        {!klasse && <span class={`fordeling-farge fordeling-del-${id}`} aria-hidden="true" />} {tekst}
      </th>
      <td class="tall">{tallTekst(timer, 1)}</td>
      <td class="tall">{uker > 0 ? tallTekst(timer / uker, 1) : '–'}</td>
      <td class="tall">{tallTekst(totalt > 0 ? (timer / totalt) * 100 : 0, 1)} %</td>
    </tr>
  );
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
            {t('arbeidstid.fordeling.perUke', { uker: tallTekst(uker, 1) })}
          </th>
          <th scope="col" class="tall">
            {t('arbeidstid.fordeling.andel')}
          </th>
        </tr>
      </thead>
      <tbody>
        {deler.map((d) => rad(d.id, t(`arbeidstid.fordeling.deler.${d.id}` as Tekstnokkel), d.timer))}
        {rad('sum-planfestet', t('arbeidstid.fordeling.planfestet'), sum(true), 'sumrad')}
        {rad('sum-alt', t('arbeidstid.fordeling.sum'), totalt, 'sumrad')}
      </tbody>
    </table>
  );
}
