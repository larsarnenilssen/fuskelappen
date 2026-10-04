// Appskallet: fast topplinje og ett scrollområde (dokumentet). Bunnmenyen er tatt bort (avgjørelse 056): toppfeltet
// har tilbake, appnavnet (til forsiden), søk og innstillinger, og kildestatus står under Innstillinger.
import type { ComponentType } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { app } from '../config/app.ts';
import { visTekst } from '../core/i18n/tekst.ts';
import { Ikon } from '../components/Ikon.tsx';
import type { SideProps } from '../modules/typer.ts';
import { Oppdateringsvarsel } from './Oppdateringsvarsel.tsx';
import { gaaTilbake, matchRute, usePlassering, utforScroll, type Navigasjonstype } from './ruter.ts';
import { ruter, type Rute } from './ruteliste.ts';
import { useTekst } from './tilstand.ts';

type Sidemodul = { default: ComponentType<SideProps> };
const lastet = new Map<Rute, Sidemodul>();

function finnRute(sti: string): { rute: Rute; parametre: Record<string, string> } | null {
  for (const rute of ruter) {
    const parametre = matchRute(rute.sti, sti);
    if (parametre) return { rute, parametre };
  }
  return null;
}

function IkkeFunnet() {
  const { t } = useTekst();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('ikkeFunnet.tittel')}</h1>
      <p>{t('ikkeFunnet.tekst')}</p>
      <p>
        <a href="#/">{t('ikkeFunnet.tilForsiden')}</a>
      </p>
    </div>
  );
}

function Side({ rute, props, type }: { rute: Rute; props: SideProps; type: Navigasjonstype }) {
  const { t } = useTekst();
  const [modul, settModul] = useState<Sidemodul | null>(() => lastet.get(rute) ?? null);
  const [feil, settFeil] = useState(false);
  const [forsok, settForsok] = useState(0);

  useEffect(() => {
    const ferdig = lastet.get(rute);
    if (ferdig) {
      settModul(ferdig);
      return;
    }
    let aktiv = true;
    settModul(null);
    settFeil(false);
    rute
      .side()
      .then((m) => {
        lastet.set(rute, m);
        if (aktiv) settModul(m);
      })
      .catch(() => aktiv && settFeil(true));
    return () => {
      aktiv = false;
    };
  }, [rute, forsok]);

  // Sidetittelen får fokus én gang når en ny side er tegnet. Endres bare spørringen i adressen (f.eks. et nytt steg
  // i en veiviser), er det samme side, og siden styrer fokus selv.
  // Sider som laster data først, får tittelen litt senere. Da venter vi på den.
  const fokusert = useRef(false);
  const venter = useRef<MutationObserver | null>(null);
  useEffect(() => () => venter.current?.disconnect(), []);
  useEffect(() => {
    if (!modul) return;
    utforScroll();
    if (type !== 'forste' && !fokusert.current) {
      const tittel = () => document.querySelector<HTMLElement>('main h1');
      const h1 = tittel();
      if (h1) h1.focus({ preventScroll: true });
      else {
        const main = document.querySelector('main');
        if (main) {
          const observator = new MutationObserver(() => {
            const h = tittel();
            if (!h) return;
            h.focus({ preventScroll: true });
            observator.disconnect();
          });
          observator.observe(main, { childList: true, subtree: true });
          venter.current = observator;
          setTimeout(() => observator.disconnect(), 3000);
        }
      }
    }
    fokusert.current = true;
  }, [modul, rute, props.parametre, type]);

  if (feil) {
    return (
      <div class="side" role="alert">
        <p>{t('app.lastefeil')}</p>
        <button type="button" class="knapp" onClick={() => settForsok((n) => n + 1)}>
          {t('app.provIgjen')}
        </button>
      </div>
    );
  }
  if (!modul) {
    return (
      <p class="side laster" aria-live="polite">
        {t('app.lasterInn')}
      </p>
    );
  }
  const Komponent = modul.default;
  return <Komponent {...props} />;
}

export function Skall() {
  const { t, malform } = useTekst();
  const plassering = usePlassering();
  const treff = finnRute(plassering.sti);
  const erForside = plassering.sti === '/';

  useEffect(() => {
    const side = treff ? visTekst(treff.rute.tittel, malform) : t('ikkeFunnet.tittel');
    document.title = erForside ? app.navn : t('app.tittelMal', { side, app: app.navn });
  }, [treff?.rute, malform, erForside]);

  const paaSok = plassering.sti === '/sok';
  const paaInnstillinger = plassering.sti === '/innstillinger';

  return (
    <div class="skall">
      <a
        class="hopp"
        href="#innhold"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('innhold')?.focus();
        }}
      >
        {t('app.hoppTilInnhold')}
      </a>
      <header class="topplinje">
        <div class="topplinje-innhold">
          {erForside ? (
            <span class="topplinje-plass" aria-hidden="true" />
          ) : (
            <button type="button" class="ikonknapp" onClick={gaaTilbake} aria-label={t('app.tilbake')}>
              <Ikon navn="tilbake" />
            </button>
          )}
          <a class="appnavn" href="#/">
            <span class="appnavn-tekst">{app.navn}</span>
          </a>
          {/* Søket står på forsiden, så knappen trengs bare på de andre sidene. Plassen holdes, så appnavnet står midt på. */}
          <nav class="topplinje-meny" aria-label={t('app.hovedmeny')}>
            {erForside || paaSok ? (
              <span class="topplinje-plass" aria-hidden="true" />
            ) : (
              <a class="ikonknapp" href="#/sok" aria-label={t('nav.sok')} title={t('nav.sok')}>
                <Ikon navn="sok" />
              </a>
            )}
            <a class="ikonknapp" href="#/innstillinger" aria-label={t('nav.innstillinger')} title={t('nav.innstillinger')} aria-current={paaInnstillinger ? 'page' : undefined}>
              <Ikon navn="innstillinger" />
            </a>
          </nav>
        </div>
      </header>
      {__TESTVERSJON__ && <p class="testversjon">{t('app.testversjon')}</p>}
      <main id="innhold" tabIndex={-1}>
        {treff ? (
          <Side
            key={`${treff.rute.sti}|${plassering.sti}`}
            rute={treff.rute}
            props={{ parametre: treff.parametre, sporring: plassering.sporring }}
            type={plassering.type}
          />
        ) : (
          <IkkeFunnet />
        )}
      </main>
      <Oppdateringsvarsel />
    </div>
  );
}
