// Stolpediagram over årsverket i en tenkt stilling: planfestet tid (undervisning, møter, annen planfestet tid,
// funksjoner) og tid læreren disponerer selv. Egen SVG uten diagrambibliotek. Tallene står også i en tabell,
// med timer per uke i arbeidsåret, slik at fordelingen kan sammenlignes med en arbeidsplan. Tabellen har fargene
// ved hver del og er fargeforklaringen til diagrammet (eiers valg 30.09.2026).
// Fordelingsvisning samler diagram, tabell og forklaring, og kan vises i fullskjerm der nettleseren støtter det.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Oppsummering, Sammenleggknapp, useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { formaterTall, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Fordelingsdel, Fordelingsresultat } from '../beregning/index.ts';
import { tallTekst } from './Utregning.tsx';

const BREDDE = 320;
const STOLPE = 56;
const HOYDE = STOLPE + 30;

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
      <svg class="diagram" viewBox={`0 0 ${BREDDE} ${HOYDE}`} role="img" aria-label={beskrivelse}>
        {bokser.map(({ d, x: bx, b }) => (
          <rect key={d.id} class={`fordeling-del-${d.id}`} x={bx} y={0} width={b} height={STOLPE} />
        ))}
        {bokser.slice(1).map(({ d, x: bx }) => (
          <line key={`skille-${d.id}`} class="fordeling-skille" x1={bx} x2={bx} y1={0} y2={STOLPE} />
        ))}
        {bokser
          .filter(({ b }) => b >= 34)
          .map(({ d, x: bx, b }) => (
            <text key={`tekst-${d.id}`} class="fordeling-etikett" x={bx + b / 2} y={STOLPE / 2 + 5} text-anchor="middle">
              {tallTekst(andel(d.timer), 0)} %
            </text>
          ))}
        {planfestetSlutt > 0 && (
          <>
            <path class="fordeling-klamme" d={`M0.5 ${STOLPE + 4} V${STOLPE + 10} H${planfestetSlutt - 0.5} V${STOLPE + 4}`} />
            <text class="figur-tekst" x={planfestetSlutt / 2} y={STOLPE + 25} text-anchor="middle">
              {t('arbeidstid.fordeling.planfestet')} {t('arbeidstid.felles.timerKort', { timer: tallTekst(planfestet, 0) })}
            </text>
          </>
        )}
        {selv > 0 && planfestetSlutt < BREDDE - 44 && (
          <text class="figur-tekst" x={(planfestetSlutt + BREDDE) / 2} y={STOLPE + 25} text-anchor="middle">
            {t('arbeidstid.felles.timerKort', { timer: tallTekst(selv, 0) })}
          </text>
        )}
      </svg>
    </figure>
  );
}

export function Fordelingstabell({ deler, totalt, uker }: { deler: readonly Fordelingsdel[]; totalt: number; uker: number }) {
  const { t } = useTekst();
  const sum = (planfestet: boolean) => deler.filter((d) => d.planfestet === planfestet).reduce((s, d) => s + d.timer, 0);
  // Tallene har alltid én desimal, så de står på linje i kolonnene.
  const rad = (id: string, tekst: string, timer: number, klasse?: string) => (
    <tr key={id} class={klasse}>
      <th scope="row">
        {klasse ? (
          tekst
        ) : (
          <span class="fordeling-del-navn">
            <span class={`fordeling-farge fordeling-del-${id}`} aria-hidden="true" />
            <span>{tekst}</span>
          </span>
        )}
      </th>
      <td class="tall">{formaterTall(timer, 1, 1)}</td>
      <td class="tall">{uker > 0 ? formaterTall(timer / uker, 1, 1) : '–'}</td>
      <td class="tall">{formaterTall(totalt > 0 ? (timer / totalt) * 100 : 0, 1, 1)} %</td>
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

/** Diagram, tabell og forklaring av timene per uke, med knapp for stor visning (fullskjerm). */
export function Fordelingsvisning({ resultat, children }: { resultat: Fordelingsresultat; children?: ComponentChildren }) {
  const { t } = useTekst();
  const ramme = useRef<HTMLDivElement>(null);
  const [stor, settStor] = useState(false);
  // Fullskjerm for andre elementer enn video finnes ikke i Safari på iPhone. Da vises ikke knappen.
  const kanVisesStor = typeof document !== 'undefined' && document.fullscreenEnabled === true;
  useEffect(() => {
    const endret = () => settStor(document.fullscreenElement !== null && document.fullscreenElement === ramme.current);
    document.addEventListener('fullscreenchange', endret);
    return () => document.removeEventListener('fullscreenchange', endret);
  }, []);
  const veksle = () => {
    if (stor) void document.exitFullscreen().catch(() => undefined);
    else void ramme.current?.requestFullscreen().catch(() => undefined);
  };
  const totalt = resultat.arsverk.verdi;
  const uker = resultat.arbeidsaarUker.verdi;
  const utvidet = resultat.utvidelseDager.verdi > 0;
  const [lukket, vekslLukket] = useSammenlagt('fordeling');
  const innhold = useId();
  const planfestet = resultat.deler.filter((d) => d.planfestet).reduce((s, d) => s + d.timer, 0);
  const selv = resultat.deler.filter((d) => !d.planfestet).reduce((s, d) => s + d.timer, 0);
  const oppsummering = t('arbeidstid.fordeling.oppsummering', { planfestet: tallTekst(planfestet, 1), selv: tallTekst(selv, 1) });
  return (
    <div class={`fordeling-visning${stor ? ' stor' : ''}${lukket ? ' lukket' : ''}`} ref={ramme}>
      <div class="fordeling-topp">
        <h2 class="liten-overskrift">
          <Sammenleggknapp
            lukket={lukket}
            onVeksle={vekslLukket}
            kontroll={innhold}
            oppsummering={oppsummering}
          >
            {t('arbeidstid.fordeling.diagramTittel')}
          </Sammenleggknapp>
        </h2>
        {kanVisesStor && !lukket && (
          <button type="button" class="lenkeknapp liten" onClick={veksle}>
            <Ikon navn={stor ? 'forminsk' : 'utvid'} class="ikon-liten" />
            {stor ? t('arbeidstid.fordeling.visMindre') : t('arbeidstid.fordeling.visStort')}
          </button>
        )}
      </div>
      <Oppsummering lukket={lukket} onVeksle={vekslLukket}>
        {oppsummering}
      </Oppsummering>
      <div id={innhold} hidden={lukket}>
        <Fordelingsdiagram deler={resultat.deler} totalt={totalt} />
        <Fordelingstabell deler={resultat.deler} totalt={totalt} uker={uker} />
        <p class="liten dempet">
          {utvidet
            ? t('arbeidstid.fordeling.perUkeUtvidet', {
                maksUke: tallTekst(resultat.planfestetMaksUke.verdi, 1),
                dager: tallTekst(resultat.utvidelseDager.verdi, 1),
                uker: tallTekst(uker, 1),
              })
            : t('arbeidstid.fordeling.perUkeForklaring', { uker: tallTekst(uker, 1) })}
        </p>
        {children}
      </div>
    </div>
  );
}
