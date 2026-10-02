// Stolpediagram over årsverket i en tenkt stilling: planfestet tid (undervisning, møter, annen planfestet tid,
// funksjoner) og tid læreren disponerer selv. Egen SVG uten diagrambibliotek. Tallene står også i en tabell,
// med timer per skoleuke (planleggingsdagene holdes utenfor), slik at fordelingen kan sammenlignes med en arbeidsplan. Tabellen har fargene
// ved hver del og er fargeforklaringen til diagrammet (eiers valg 30.09.2026).
// Fordelingsvisning samler diagram, tabell og forklaring, og kan vises i fullskjerm der nettleseren støtter det.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Nivamerke } from '../../../components/Merker.tsx';
import { Oppsummering, Sammenleggknapp, useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { formaterTall, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Fordelingsdel, Fordelingsresultat } from '../beregning/index.ts';
import { Ukemaaler } from './Grafikk.tsx';
import { brukteNiva, tallTekst } from './Utregning.tsx';

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

/**
 * Tabell over delene. Timer per uke er timene fordelt på skoleukene. Planleggingsdagene ligger utenom skoleukene,
 * så de har ikke timer per uke og trekkes fra summene før de deles på ukene.
 */
export function Fordelingstabell({ deler, totalt, uker, planlegging = 0 }: { deler: readonly Fordelingsdel[]; totalt: number; uker: number; planlegging?: number }) {
  const { t } = useTekst();
  const sum = (planfestet: boolean) => deler.filter((d) => d.planfestet === planfestet).reduce((s, d) => s + d.timer, 0);
  // Tallene har alltid én desimal, så de står på linje i kolonnene.
  const rad = (id: string, tekst: string, timer: number, klasse?: string, ukeTimer: number | null = timer) => (
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
      <td class="tall">{uker > 0 && ukeTimer !== null ? formaterTall(ukeTimer / uker, 1, 1) : '–'}</td>
      <td class="tall">{formaterTall(totalt > 0 ? (timer / totalt) * 100 : 0, 1, 1)} %</td>
    </tr>
  );
  const delrader = (planfestet: boolean) =>
    deler
      .filter((d) => d.planfestet === planfestet)
      .map((d) => rad(d.id, t(`arbeidstid.fordeling.deler.${d.id}` as Tekstnokkel), d.timer, undefined, d.id === 'planleggingsdager' ? null : d.timer));
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
        {/* De planfestede delene og summen av dem først, så tiden læreren disponerer selv, og til slutt årsverket.
            Da er det tydelig at selvdisponert tid ikke er en del av planfestet tid (eier 02.10.2026). */}
        {delrader(true)}
        {rad('sum-planfestet', t('arbeidstid.fordeling.planfestetIAlt'), sum(true), 'sumrad', sum(true) - planlegging)}
        {delrader(false)}
        {rad('sum-alt', t('arbeidstid.fordeling.sum'), totalt, 'sumrad', totalt - planlegging)}
      </tbody>
    </table>
  );
}

/** Diagram, tabell og forklaring av timene per uke, med knapp for stor visning (fullskjerm). */
/** Grensene for en gjennomsnittlig uke, til ukefiguren (fra regelverket). */
export interface Ukegrenser {
  maksUke: number;
  maksDag: number;
  dagerPerUke: number;
}

export function Fordelingsvisning({ resultat, uke, children }: { resultat: Fordelingsresultat; uke?: Ukegrenser; children?: ComponentChildren }) {
  // I en periode gjelder timene perioden, og ukene er periodens del av arbeidsåret.
  const iPeriode = resultat.periodenokkel !== null;
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
  // Timer per uke: timene utenom planleggingsdagene, fordelt på skoleukene.
  const uker = resultat.skoleuker.verdi;
  const planlegging = resultat.planleggingstimer.verdi;
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
            {iPeriode ? t('arbeidstid.fordeling.diagramTittelPeriode') : t('arbeidstid.fordeling.diagramTittel')}
          </Sammenleggknapp>
        </h2>
        {/* Lokale verdier (fylke eller skole), f.eks. lokalt avtalt planfestet tid, merkes med nivå. */}
        <Nivamerke niva={brukteNiva(resultat.trinn)} />
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
        <Fordelingstabell deler={resultat.deler} totalt={totalt} uker={uker} planlegging={planlegging} />
        <p class="liten dempet">
          {utvidet
            ? t('arbeidstid.fordeling.perUkeUtvidet', {
                maksUke: tallTekst(resultat.planfestetMaksUke.verdi, 1),
                dager: tallTekst(resultat.utvidelseDager.verdi, 1),
                uker: tallTekst(uker, 1),
                planlegging: tallTekst(planlegging, 1),
              })
            : iPeriode
              ? t('arbeidstid.fordeling.perUkePeriode', { uker: tallTekst(uker, 1), planlegging: tallTekst(planlegging, 1) })
              : t('arbeidstid.fordeling.perUkeForklaring', { uker: tallTekst(uker, 1), planlegging: tallTekst(planlegging, 1) })}
        </p>
        {uke && uker > 0 && (
          <Ukemaaler planfestet={(planfestet - planlegging) / uker} total={(totalt - planlegging) / uker} maksUke={uke.maksUke} maksDag={uke.maksDag} dagerPerUke={uke.dagerPerUke} />
        )}
        {children}
      </div>
    </div>
  );
}
