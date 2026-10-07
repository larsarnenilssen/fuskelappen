// Panelet øverst på forsiden (eier 07.10.2026, avgjørelse 081): Kalender, Nyheter og Videregående i tall er
// alternative visninger på samme plass, i sidekolonnen på skrivebord og øverst på mobil.
//
// - Brukeren veksler mellom visningene med tekstknapper i overskriften, som er borte når panelet er lukket. Under «Tilpass» velger brukeren hvilke visninger som
//   er med. Er bare én med, står den uten valg, som en vanlig gruppe.
// - Med «Bare favoritter» står hver visning som er favoritt, som sin egen gruppe (som kalenderen gjorde før).
// - Visningene har hvert sitt oppsett: datoene som en liste, tallene som fliser og en figur.
// - Nyhetene (fase 7b) og tallene lastes når visningen vises, så de ikke er med i startpakken.
import type { ComponentChildren, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Ikon, type Ikonnavn } from '../components/Ikon.tsx';
import { kortManed } from '../core/tidslinje.ts';
import { iDag } from '../data/skolear.ts';
import { oversiktsid } from '../modules/favoritter.ts';
import { kalenderRute } from '../modules/kalender/adresse.ts';
import type { Kalenderpost } from '../modules/kalender/beregning/kalender.ts';
import { datoKort } from '../modules/kalender/visning.ts';
import type { Statistikk } from '../core/statistikk/skjema.ts';
import { lastStatistikk } from '../data/statistikk.ts';
import type * as Komponenter from '../modules/statistikk/komponenter.tsx';
import type * as Nyhetskomponenter from '../modules/nyheter/komponenter.tsx';
import { NYHETER_RUTE } from '../modules/nyheter/adresse.ts';
import type { Nyheter as Nyhetsfil } from '../modules/nyheter/skjema.ts';
import { Gruppe, SIDEKOLONNE_FRA, useMinstBredde } from './Forsidegruppe.tsx';
import { useTilpassetListe } from './tilpassListe.ts';
import { useDagensJukselapp } from './Jukselapp.tsx';
import { fylkesnavn } from './Stedmerknad.tsx';
import { settForsidevisning, useTekst, useTilstand, vekslGruppe } from './tilstand.ts';

/** Gruppen med panelet i rekkefølgen på forsiden. */
export const PANEL = 'panel';

/** Visningene i panelet. Id-ene er de samme som gruppene hadde før, så valget om å slå dem av beholdes. */
export type Visning = 'neste' | 'nyheter' | 'itall' | 'jukselapp';

export const VISNINGER: readonly { id: Visning; ikon: Ikonnavn; favoritt: string | null }[] = [
  { id: 'neste', ikon: 'kalender', favoritt: oversiktsid('kalender') },
  { id: 'nyheter', ikon: 'dokument', favoritt: oversiktsid('nyheter') },
  { id: 'itall', ikon: 'sammenlign', favoritt: oversiktsid('statistikk') },
];

/** Rammen rundt en visning: en egen gruppe, eller gruppen i panelet med valgene i overskriften. */
type Ramme = (p: { tittel: string; sammendrag: string; children: ComponentChildren }) => JSX.Element;

function Innhold({ id, ramme }: { id: Visning; ramme: Ramme }) {
  if (id === 'neste') return <NesteDatoer ramme={ramme} />;
  if (id === 'nyheter') return <Nyheter ramme={ramme} />;
  if (id === 'jukselapp') return <JukselappVisning ramme={ramme} />;
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
 * «Neste datoer»: inntil fire neste datoer fra kalenderen, og lenken til hele kalenderen (forslag D, avgjørelse 066).
 * Datoene lastes etter at forsiden er tegnet. Boksen har samme oppsett som nyhetene (eier 07.10.2026): liten skrift, en
 * lav lenkelinje nederst, og så mange datoer som får plass uten luft under den siste.
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
      .then((m) => m.hentNeste({ fylke, skole }, iDag(), 4))
      .then((p) => aktiv && settPoster(p))
      .catch(() => aktiv && settPoster([]));
    return () => {
      aktiv = false;
    };
  }, [fylke, skole]);
  const { boks, liste } = useTilpassetListe([poster, malform]);
  const forste = poster?.[0];
  const sammendrag = forste?.fra ? t('kalender.nesteSammendrag', { dato: datoKort(forste.fra, forste.til, malform), tittel: forste.oppforing.tittel[malform] }) : poster ? t('kalender.ingenNeste') : t('app.lasterInn');
  return ramme({
    tittel: t('kalender.neste'),
    sammendrag,
    children: (
      <div ref={boks} class="panel-boks kal-panel">
        <ul ref={liste} class="panel-liste">
          {poster === null && <li class="dempet panel-tom">{t('app.lasterInn')}</li>}
          {poster?.length === 0 && <li class="dempet panel-tom">{t('kalender.ingenNeste')}</li>}
          {poster?.map((p) => {
            const fra = p.fra as string;
            const til = p.til && p.til !== fra ? p.til : undefined;
            const sted = p.oppforing.fylke ? fylkesnavn(p.oppforing.fylke) : null;
            return (
              <li key={p.nokkel}>
                <a class="listelenke kal-panel-rad" href={`#${kalenderRute}`}>
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
        </ul>
        <a class="panel-videre" href={`#${kalenderRute}`}>
          <span class="panel-videre-tekst">
            <Ikon navn="kalender" class="ikon-liten" />
            {t('kalender.heleKalenderen')}
          </span>
          <Ikon navn="hoyre" class="ikon-liten" />
        </a>
      </div>
    ),
  });
}

/** De nyeste nyhetene (fase 7b). Komponentene og nyhetene lastes når visningen vises. */
function Nyheter({ ramme }: { ramme: Ramme }) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [lastet, settLastet] = useState<{ m: typeof Nyhetskomponenter; d: Nyhetsfil } | null | 'feil'>(null);
  useEffect(() => {
    let aktiv = true;
    Promise.all([import('../modules/nyheter/komponenter.tsx'), import('../data/nyheter.ts').then((n) => n.lastNyheter())])
      .then(([m, d]) => aktiv && settLastet({ m, d }))
      .catch(() => aktiv && settLastet('feil'));
    return () => {
      aktiv = false;
    };
  }, []);
  if (!lastet || lastet === 'feil') {
    const melding = lastet === 'feil' ? t('nyheter.feil') : t('app.lasterInn');
    return ramme({ tittel: t('forside.panel.nyheterTittel'), sammendrag: melding, children: <p class="dempet">{melding}</p> });
  }
  const { ForsideNyheter, forsideSammendrag } = lastet.m;
  return ramme({
    tittel: t('forside.panel.nyheterTittel'),
    sammendrag: forsideSammendrag(t, malform, lastet.d, innstillinger.fylke),
    children: <ForsideNyheter d={lastet.d} fylke={innstillinger.fylke} rute={NYHETER_RUTE} />,
  });
}

/**
 * Tallene fra Videregående i tall (avgjørelse 080): «Vestland i tall» for fylket brukeren har valgt, ellers «Hele landet
 * i tall». Lukket viser overskriften søkerne og læreplassen. Tallene lastes etter at forsiden er tegnet.
 */
function ITall({ ramme }: { ramme: Ramme }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  // Komponentene og tallene lastes når visningen vises, så de ikke er med i startpakken (grensen på 150 kB).
  const [lastet, settLastet] = useState<{ m: typeof Komponenter; d: Statistikk } | null | 'feil'>(null);
  useEffect(() => {
    let aktiv = true;
    Promise.all([import('../modules/statistikk/komponenter.tsx'), lastStatistikk()])
      .then(([m, d]) => aktiv && settLastet({ m, d }))
      .catch(() => aktiv && settLastet('feil'));
    return () => {
      aktiv = false;
    };
  }, []);
  const d = lastet && lastet !== 'feil' ? lastet.d : null;
  const fylke = innstillinger.fylke;
  const enhet = d && fylke && d.enheter[`F${fylke}`] ? `F${fylke}` : 'L';
  const sted = enhet === 'L' ? t('statistikk.landet') : (fylkesnavn(fylke) ?? t('statistikk.landet'));
  const skole = innstillinger.skole?.id ? { orgnr: innstillinger.skole.id, navn: innstillinger.skole.navn } : null;
  const melding = lastet === 'feil' ? t('statistikk.feil') : t('app.lasterInn');
  if (!lastet || lastet === 'feil') return ramme({ tittel: t('statistikk.iTall', { sted }), sammendrag: melding, children: <p class="dempet">{melding}</p> });
  const { ForsideTall, forsideSammendrag } = lastet.m;
  return ramme({
    tittel: t('statistikk.iTall', { sted }),
    sammendrag: forsideSammendrag(t, lastet.d, enhet),
    children: <ForsideTall d={lastet.d} enhet={enhet} skole={skole} />,
  });
}

/** SKISSE (fase 8, variant B): dagens jukselapp som en fjerde visning i panelet. */
function JukselappVisning({ ramme }: { ramme: Ramme }) {
  const { t } = useTekst();
  const { sammendrag, innhold } = useDagensJukselapp();
  return ramme({ tittel: t('forside.jukselapp.tittel'), sammendrag, children: innhold });
}
