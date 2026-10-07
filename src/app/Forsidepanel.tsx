// Panelet øverst på forsiden (eier 07.10.2026, avgjørelse 081): Kalender, Nyheter og Videregående i tall er
// alternative visninger på samme plass, i sidekolonnen på skrivebord og øverst på mobil.
//
// - Brukeren veksler mellom visningene med tekstknapper i overskriften, som er borte når panelet er lukket. Under «Tilpass» velger brukeren hvilke visninger som
//   er med. Er bare én med, står den uten valg, som en vanlig gruppe.
// - Med «Bare favoritter» står hver visning som er favoritt, som sin egen gruppe (som kalenderen gjorde før).
// - Visningene har hvert sitt oppsett: datoene som en liste, tallene som fliser og en figur.
// - Nyhetene kommer i fase 7b. Til da er visningen en skisse som bare finnes i testversjonen og i utvikling.
import type { ComponentChildren, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Ikon, type Ikonnavn } from '../components/Ikon.tsx';
import { kortManed } from '../core/tidslinje.ts';
import { iDag } from '../data/skolear.ts';
import { oversiktsid } from '../modules/favoritter.ts';
import { kalenderRute } from '../modules/kalender/adresse.ts';
import type { Kalenderpost } from '../modules/kalender/beregning/kalender.ts';
import { datoKort } from '../modules/kalender/visning.ts';
import { ForsideTall, forsideSammendrag, useStatistikk } from '../modules/statistikk/komponenter.tsx';
import { Gruppe, SIDEKOLONNE_FRA, useMinstBredde } from './Forsidegruppe.tsx';
import { fylkesnavn } from './Stedmerknad.tsx';
import { settForsidevisning, useTekst, useTilstand, vekslGruppe } from './tilstand.ts';

/** Gruppen med panelet i rekkefølgen på forsiden. */
export const PANEL = 'panel';

/** Visningene i panelet. Id-ene er de samme som gruppene hadde før, så valget om å slå dem av beholdes. */
export type Visning = 'neste' | 'nyheter' | 'itall';

const NYHETER_SKISSE = __TESTVERSJON__ || import.meta.env.MODE !== 'production';

export const VISNINGER: readonly { id: Visning; ikon: Ikonnavn; favoritt: string | null }[] = [
  { id: 'neste', ikon: 'kalender', favoritt: oversiktsid('kalender') },
  ...(NYHETER_SKISSE ? [{ id: 'nyheter' as const, ikon: 'dokument' as const, favoritt: null }] : []),
  { id: 'itall', ikon: 'sammenlign', favoritt: oversiktsid('statistikk') },
];

/** Rammen rundt en visning: en egen gruppe, eller gruppen i panelet med valgene i overskriften. */
type Ramme = (p: { tittel: string; sammendrag: string; children: ComponentChildren }) => JSX.Element;

function Innhold({ id, ramme }: { id: Visning; ramme: Ramme }) {
  if (id === 'neste') return <NesteDatoer ramme={ramme} />;
  if (id === 'nyheter') return <Nyheter ramme={ramme} />;
  return <ITall ramme={ramme} />;
}

/** Om en gruppe er lukket: lukket av brukeren, eller lukket fra start på mobil til brukeren åpner den (avgjørelse 066). */
function useLukket(id: string): boolean {
  const { forside } = useTilstand();
  const stor = useMinstBredde(SIDEKOLONNE_FRA);
  return forside.lukket.includes(id) || (!stor && !(forside.apnet ?? []).includes(id));
}

/** Én visning som egen gruppe: med «Bare favoritter», og når den er den eneste i panelet. */
export function Visningsgruppe({ id }: { id: Visning }) {
  const lukket = useLukket(id);
  const ramme: Ramme = ({ tittel, sammendrag, children }) => (
    <Gruppe id={id} tittel={tittel} sammendrag={sammendrag} lukket={lukket} onVeksle={() => vekslGruppe(id, lukket)}>
      {children}
    </Gruppe>
  );
  return <Innhold id={id} ramme={ramme} />;
}

/**
 * Panelet med visningen brukeren har valgt. Valgene står i overskriften når panelet er åpent, som rolige tekstknapper
 * (eier 07.10.2026). Lukket viser overskriften tittelen og oppsummeringen av visningen. Med én visning står den som en
 * vanlig gruppe.
 */
export function Forsidepanel({ visninger }: { visninger: readonly Visning[] }) {
  const { t } = useTekst();
  const { forside } = useTilstand();
  const lukket = useLukket(PANEL);
  const forste = visninger[0];
  if (!forste) return null;
  if (visninger.length === 1) return <Visningsgruppe id={forste} />;
  const aktiv = visninger.find((v) => v === forside.visning) ?? forste;
  const faner = (
    <div class="panel-faner" role="group" aria-label={t('forside.panel.legend')}>
      {visninger.map((v) => (
        <button key={v} type="button" class="panel-fane" aria-pressed={v === aktiv} onClick={() => settForsidevisning(v)}>
          {t(`forside.panel.${v}`)}
        </button>
      ))}
    </div>
  );
  const ramme: Ramme = ({ tittel, sammendrag, children }) => (
    <Gruppe id={PANEL} tittel={tittel} sammendrag={sammendrag} lukket={lukket} faner={faner} onVeksle={() => vekslGruppe(PANEL, lukket)}>
      {children}
    </Gruppe>
  );
  return <Innhold key={aktiv} id={aktiv} ramme={ramme} />;
}

/**
 * «Neste datoer»: de tre neste datoene fra kalenderen, og lenken til hele kalenderen (forslag D, avgjørelse 066).
 * Datoene lastes etter at forsiden er tegnet.
 */
function NesteDatoer({ ramme }: { ramme: Ramme }) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [poster, settPoster] = useState<Kalenderpost[] | null>(null);
  const fylke = innstillinger.fylke;
  const skole = innstillinger.skole?.id ?? null;
  useEffect(() => {
    let aktiv = true;
    void import('../modules/kalender/neste.ts')
      .then((m) => m.hentNeste({ fylke, skole }, iDag()))
      .then((p) => aktiv && settPoster(p))
      .catch(() => aktiv && settPoster([]));
    return () => {
      aktiv = false;
    };
  }, [fylke, skole]);
  const forste = poster?.[0];
  const sammendrag = forste?.fra ? t('kalender.nesteSammendrag', { dato: datoKort(forste.fra, forste.til, malform), tittel: forste.oppforing.tittel[malform] }) : poster ? t('kalender.ingenNeste') : t('app.lasterInn');
  return ramme({
    tittel: t('kalender.neste'),
    sammendrag,
    children: (
      <ul class="liste kal-neste">
        {poster === null && <li class="dempet">{t('app.lasterInn')}</li>}
        {poster?.length === 0 && <li class="dempet">{t('kalender.ingenNeste')}</li>}
        {poster?.map((p) => {
          const fra = p.fra as string;
          const til = p.til && p.til !== fra ? p.til : undefined;
          const sted = p.oppforing.fylke ? fylkesnavn(p.oppforing.fylke) : null;
          return (
            <li key={p.nokkel}>
              <a class="listelenke" href={`#${kalenderRute}`}>
                {/* Datoen på én linje: «5.–9. okt» (eier 05.10.2026). */}
                <span class="kal-neste-dato" aria-hidden="true">
                  {til && fra.slice(0, 7) === til.slice(0, 7) ? `${Number(fra.slice(8, 10))}.–${Number(til.slice(8, 10))}.` : `${Number(fra.slice(8, 10))}.`}
                  <small>{kortManed(Number(fra.slice(5, 7)), malform)}</small>
                </span>
                <span class="listelenke-tekst">
                  <span class="skjult-visuelt">{datoKort(fra, til, malform)}: </span>
                  <span class="listelenke-tittel">{p.oppforing.tittel[malform]}</span>
                  <span class="listelenke-under">{[...p.oppforing.tema.map((tema) => t(`kalender.temaer.${tema}`)), sted].filter(Boolean).join(' · ')}</span>
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </li>
          );
        })}
        <li>
          <a class="listelenke kal-neste-alle" href={`#${kalenderRute}`}>
            <span class="kal-neste-dato" aria-hidden="true">
              <Ikon navn="kalender" />
            </span>
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('kalender.heleKalenderen')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
    ),
  });
}

/** Nyhetene (fase 7b). Til da en skisse som viser hvor de kommer. */
function Nyheter({ ramme }: { ramme: Ramme }) {
  const { t } = useTekst();
  return ramme({
    tittel: t('forside.panel.nyheterTittel'),
    sammendrag: t('forside.panel.nyheterSammendrag'),
    children: (
      <p class="forside-nyheter-skisse">
        <Ikon navn="info" class="ikon-liten" />
        <span>{t('forside.panel.nyheterSkisse')}</span>
      </p>
    ),
  });
}

/**
 * Tallene fra Videregående i tall (avgjørelse 080): «Vestland i tall» for fylket brukeren har valgt, ellers «Hele landet
 * i tall». Lukket viser overskriften søkerne og læreplassen. Tallene lastes etter at forsiden er tegnet.
 */
function ITall({ ramme }: { ramme: Ramme }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const d = useStatistikk();
  const fylke = innstillinger.fylke;
  const enhet = d && d !== 'feil' && fylke && d.enheter[`F${fylke}`] ? `F${fylke}` : 'L';
  const sted = enhet === 'L' ? t('statistikk.landet') : (fylkesnavn(fylke) ?? t('statistikk.landet'));
  const skole = innstillinger.skole?.id ? { orgnr: innstillinger.skole.id, navn: innstillinger.skole.navn } : null;
  const melding = d === 'feil' ? t('statistikk.feil') : t('app.lasterInn');
  return ramme({
    tittel: t('statistikk.iTall', { sted }),
    sammendrag: d && d !== 'feil' ? forsideSammendrag(t, d, enhet) : melding,
    children: d && d !== 'feil' ? <ForsideTall d={d} enhet={enhet} skole={skole} /> : <p class="dempet">{melding}</p>,
  });
}
