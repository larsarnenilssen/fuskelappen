// Aktuelt øverst på forsiden (avgjørelse 081 og 102): kalenderen, nyhetene, Videregående i tall og dagens jukselapp
// er alternative visninger på samme plass, øverst i sidekolonnen på skrivebord og øverst på mobil.
//
// - Aktuelt er en gruppe som de andre på forsiden: overskriften lukker og åpner den, og valget lagres i `lukket` og
//   `apnet`. Det står på den myke flaten i temafargen, med «Aktuelt» som merkelapp (eier 09.10.2026).
// - Brukeren veksler mellom visningene med fanene under overskriften. Menyen (filterknappen) i overskriften velger hvilke
//   visninger som er med, slår dagens jukselapp av og på, og skjuler Aktuelt. «Tilpass» henter det tilbake.
// - Åpent fra start på skrivebord, lukket på mobil (avgjørelse 066). Lukket viser overskriften visningen og den neste
//   datoen, nyheten, tallet eller faktumet.
// - Med «Bare favoritter» står hver visning som er favoritt, som sin egen gruppe (eier 07.10.2026). Gruppene har da et
//   kryss i overskriften som fjerner favoritten eller dagens jukselapp, etter et lite kort som spør (eier 10.10.2026,
//   avgjørelse 108). Kalenderen og nyhetene heter det samme i fanen og som egen gruppe: «Kalender» og «Nyheter» (eier 10.10.2026).
// - Visningene har hvert sitt oppsett: datoene som en liste, tallene som fliser og en figur.
// - Nyhetene (fase 7b) og tallene lastes når visningen vises, så de ikke er med i startpakken.
import type { ComponentChildren, JSX } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
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
import { AKTUELT_SKJULT, settForsidevisning, settJukselapp, useTekst, useTilstand, vekslFavoritt, vekslGruppe, vekslSkjultGruppe } from './tilstand.ts';

/** Gruppen med Aktuelt i rekkefølgen på forsiden. Id-en er den samme som panelet hadde før avgjørelse 102. */
export const PANEL = 'panel';

/** Bryteren for sidekolonnen før avgjørelse 102. Den som hadde slått den av, får Aktuelt lukket på skrivebord. */
const SIDEKOLONNE = 'sidekolonne';

/** Visningene i Aktuelt. Id-ene er de samme som gruppene hadde før, så valget om å slå dem av beholdes. */
export type Visning = 'neste' | 'nyheter' | 'itall' | 'jukselapp';

export const VISNINGER: readonly { id: Visning; ikon: Ikonnavn; favoritt: string | null }[] = [
  { id: 'neste', ikon: 'kalender', favoritt: oversiktsid('kalender') },
  { id: 'nyheter', ikon: 'dokument', favoritt: oversiktsid('nyheter') },
  { id: 'itall', ikon: 'sammenlign', favoritt: oversiktsid('statistikk') },
];

/** Dagens jukselapp (avgjørelse 086): med når brukeren har slått den på. Den har ingen side, så den kan ikke være favoritt. */
export const JUKSELAPPVISNING: { id: Visning; ikon: Ikonnavn; favoritt: string | null } = { id: 'jukselapp', ikon: 'skriv', favoritt: null };

/** Rammen rundt en visning: en egen gruppe, eller Aktuelt med fanene. */
type Ramme = (p: { tittel: string; sammendrag: string; children: ComponentChildren }) => JSX.Element;

function Innhold({ id, ramme }: { id: Visning; ramme: Ramme }) {
  if (id === 'neste') return <NesteDatoer ramme={ramme} />;
  if (id === 'nyheter') return <Nyheter ramme={ramme} />;
  if (id === 'jukselapp') return <JukselappVisning ramme={ramme} />;
  return <ITall ramme={ramme} />;
}

/**
 * Visningene brukeren har med i Aktuelt, i fast rekkefølge, og om Aktuelt er skjult. Det er skjult når brukeren har
 * valgt «Skjul Aktuelt», eller når ingen visning er med.
 */
export function useAktuelt(): { paa: Visning[]; skjult: boolean } {
  const { forside } = useTilstand();
  const skjult = forside.skjult ?? [];
  const paa: Visning[] = [...VISNINGER.filter((v) => !skjult.includes(v.id)).map((v) => v.id), ...(forside.jukselapp ? (['jukselapp'] as const) : [])];
  return { paa, skjult: skjult.includes(AKTUELT_SKJULT) || paa.length === 0 };
}

/** Om en gruppe er lukket: lukket av brukeren, eller lukket fra start på mobil til brukeren åpner den (avgjørelse 066). */
function useLukket(id: string): boolean {
  const { forside } = useTilstand();
  const stor = useMinstBredde(SIDEKOLONNE_FRA);
  const apnet = (forside.apnet ?? []).includes(id);
  // Den som hadde slått av sidekolonnen før avgjørelse 102, får Aktuelt lukket, ikke skjult, til det åpnes.
  const kolonneAv = id === PANEL && (forside.skjult ?? []).includes(SIDEKOLONNE);
  return forside.lukket.includes(id) || ((!stor || kolonneAv) && !apnet);
}

/**
 * Krysset i overskriften på en visning med «Bare favoritter», og kortet under som fjerner den (avgjørelse 108):
 * dagens jukselapp slås av, og kalenderen, nyhetene og tallene fjernes fra favorittene. Krysset fjerner ikke med en
 * gang, fordi det står tett ved pilen som lukker gruppen. Kortet og knappen ser ut som menyen i Aktuelt.
 */
function useFjern(v: Visning, tittel: string): { knapp: JSX.Element; kort: JSX.Element | false } {
  const { t } = useTekst();
  const [apen, settApen] = useState(false);
  const id = `${useId()}-fjern`;
  const favoritt = VISNINGER.find((x) => x.id === v)?.favoritt ?? null;
  const tekst =
    v === 'jukselapp' || !favoritt
      ? { meny: t('forside.jukselapp.fjernMeny'), fjern: t('forside.jukselapp.fjern'), hjelp: t('forside.jukselapp.fjernHjelp') }
      : { meny: t('forside.panel.fjernMeny', { navn: tittel }), fjern: t('forside.panel.fjern'), hjelp: t('forside.panel.fjernHjelp') };
  const fjern = () => (favoritt ? vekslFavoritt(favoritt) : settJukselapp(false));
  const knapp = (
    <button
      type="button"
      class="ikonknapp gruppe-endre aktuelt-menyknapp"
      aria-expanded={apen}
      aria-controls={apen ? id : undefined}
      aria-label={tekst.meny}
      title={tekst.meny}
      onClick={() => settApen(!apen)}
    >
      <Ikon navn="lukk" class="ikon-liten" />
    </button>
  );
  const kort = apen && (
    <div id={id} class="aktuelt-meny">
      <button type="button" class="lenkeknapp aktuelt-skjul" onClick={fjern}>
        <Ikon navn="lukk" class="ikon-liten" />
        {tekst.fjern}
      </button>
      <p class="dempet liten">{tekst.hjelp}</p>
    </div>
  );
  return { knapp, kort };
}

/** Rammen for én visning som egen gruppe, med krysset i overskriften. */
function Visningsramme({ id, tittel, sammendrag, children }: { id: Visning; tittel: string; sammendrag: string; children: ComponentChildren }) {
  const lukket = useLukket(id);
  const fjern = useFjern(id, tittel);
  return (
    <Gruppe id={id} tittel={tittel} sammendrag={sammendrag} lukket={lukket} verktoy={fjern.knapp} verktoyAlltid foran={fjern.kort} onVeksle={() => vekslGruppe(id, lukket)}>
      {children}
    </Gruppe>
  );
}

/** Én visning som egen gruppe: med «Bare favoritter». */
export function Visningsgruppe({ id }: { id: Visning }) {
  const ramme: Ramme = (p) => <Visningsramme id={id} {...p} />;
  return <Innhold id={id} ramme={ramme} />;
}

/** Navnet på en visning i fanene og i overskriften når Aktuelt er lukket. */
function useVisningsnavn(): (v: Visning) => string {
  const { t } = useTekst();
  return (v) => (v === 'jukselapp' ? t('forside.jukselapp.tittel') : t(`forside.panel.${v}`));
}

/** Menyen i Aktuelt: hvilke visninger som er med, dagens jukselapp og «Skjul Aktuelt» (avgjørelse 102). */
function Meny({ id }: { id: string }) {
  const { t } = useTekst();
  const { forside } = useTilstand();
  const skjult = forside.skjult ?? [];
  return (
    <div id={id} class="aktuelt-meny">
      <fieldset>
        <legend>{t('forside.aktuelt.menyTittel')}</legend>
        {VISNINGER.map((v) => (
          <label key={v.id} class="avkrysning">
            <input type="checkbox" checked={!skjult.includes(v.id)} onChange={() => vekslSkjultGruppe(v.id)} />
            {t(`forside.tilpass.visning.${v.id}`)}
          </label>
        ))}
        <label class="avkrysning">
          <input type="checkbox" checked={!!forside.jukselapp} onChange={() => settJukselapp(!forside.jukselapp)} />
          {t('forside.tilpass.visning.jukselapp')}
        </label>
      </fieldset>
      <button type="button" class="lenkeknapp aktuelt-skjul" onClick={() => vekslSkjultGruppe(AKTUELT_SKJULT)}>
        <Ikon navn="lukk" class="ikon-liten" />
        {t('forside.aktuelt.skjul')}
      </button>
      <p class="dempet liten">{t('forside.aktuelt.skjulHjelp')}</p>
    </div>
  );
}

/**
 * Aktuelt (avgjørelse 102): en gruppe med overskriften «Aktuelt», menyen og pilen, og fanene mellom visningene under.
 * Visningen brukeren valgte sist, står. Lukket viser overskriften visningen og oppsummeringen av den.
 */
export function Aktuelt() {
  const { t } = useTekst();
  const { forside } = useTilstand();
  const navn = useVisningsnavn();
  const { paa, skjult } = useAktuelt();
  const lukket = useLukket(PANEL);
  const [meny, settMeny] = useState(false);
  const id = useId();
  const forste = paa[0];
  if (skjult || !forste) return null;
  const aktiv = paa.find((v) => v === forside.visning) ?? forste;
  const menyId = `${id}-meny`;
  // Visningen tegnes på nytt når brukeren bytter, så fokuset settes tilbake på fanen.
  const velg = (v: Visning) => {
    settForsidevisning(v);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-gruppe="${PANEL}"] [data-visning="${v}"]`)?.focus());
  };
  const menyknapp = (
    <button
      type="button"
      class="ikonknapp gruppe-endre aktuelt-menyknapp"
      aria-expanded={meny}
      aria-controls={meny ? menyId : undefined}
      aria-label={t('forside.aktuelt.meny')}
      title={t('forside.aktuelt.meny')}
      onClick={() => settMeny(!meny)}
    >
      <Ikon navn={meny ? 'lukk' : 'filter'} class="ikon-liten" />
    </button>
  );
  const ramme: Ramme = ({ tittel, sammendrag, children }) => (
    <Gruppe
      id={PANEL}
      klasse="aktuelt"
      tittel={t('forside.aktuelt.navn')}
      sammendrag={`${navn(aktiv)} · ${sammendrag}`}
      lukket={lukket}
      verktoy={menyknapp}
      verktoyAlltid
      foran={meny && <Meny id={menyId} />}
      onVeksle={() => vekslGruppe(PANEL, lukket)}
    >
      {paa.length > 1 && (
        <div class="aktuelt-faner" role="group" aria-label={t('forside.panel.legend')}>
          {paa.map((v) => (
            <button key={v} type="button" class="panel-fane" data-visning={v} aria-pressed={v === aktiv} onClick={() => velg(v)}>
              {t(`forside.panel.${v}`)}
            </button>
          ))}
        </div>
      )}
      <h3 class="skjult-visuelt">{tittel}</h3>
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
    tittel: t('forside.panel.neste'),
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
    return ramme({ tittel: t('forside.panel.nyheter'), sammendrag: melding, children: <p class="dempet">{melding}</p> });
  }
  const { ForsideNyheter, forsideSammendrag } = lastet.m;
  return ramme({
    tittel: t('forside.panel.nyheter'),
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

/** Dagens jukselapp som en fjerde visning i Aktuelt (eier 08.10.2026, avgjørelse 086 og 102). */
function JukselappVisning({ ramme }: { ramme: Ramme }) {
  const { t } = useTekst();
  const { sammendrag, innhold } = useDagensJukselapp();
  return ramme({ tittel: t('forside.jukselapp.tittel'), sammendrag, children: innhold });
}
