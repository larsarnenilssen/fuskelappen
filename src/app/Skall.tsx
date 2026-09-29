// Appskallet: fast topplinje, ett scrollområde (dokumentet) og fast bunnmeny.
import type { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { app } from '../config/app.ts';
import { visTekst } from '../core/i18n/tekst.ts';
import { samletStatus } from '../core/kildestatus/kildestatus.ts';
import { Ikon, type Ikonnavn } from '../components/Ikon.tsx';
import type { SideProps } from '../modules/typer.ts';
import { useKildestatus } from './kildestatus.ts';
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

  useEffect(() => {
    if (!modul) return;
    utforScroll();
    if (type !== 'forste') {
      document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    }
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

function KildestatusIndikator() {
  const { t } = useTekst();
  const status = useKildestatus();
  const samlet = status.tilstand === 'ok' ? samletStatus(status.data, new Date()) : status.tilstand === 'feil' ? 'ukjent' : null;
  if (samlet === null) return <span class="indikator-plass" aria-hidden="true" />;
  const ikon: Record<typeof samlet, Ikonnavn> = { ok: 'ok', endret: 'info', feilet: 'advarsel', utdatert: 'klokke', ukjent: 'info' };
  const etikett = t('kildestatus.indikator', { status: t(`kildestatus.status.${samlet}`) });
  return (
    <a class={`indikator indikator-${samlet}`} href="#/om/kilder" aria-label={etikett} title={etikett} data-status={samlet}>
      <Ikon navn={ikon[samlet]} />
    </a>
  );
}

const menypunkter: { sti: string; ikon: Ikonnavn; tekst: 'nav.hjem' | 'nav.sok' | 'nav.favoritter' | 'nav.innstillinger' }[] = [
  { sti: '/', ikon: 'hjem', tekst: 'nav.hjem' },
  { sti: '/sok', ikon: 'sok', tekst: 'nav.sok' },
  { sti: '/favoritter', ikon: 'stjerne', tekst: 'nav.favoritter' },
  { sti: '/innstillinger', ikon: 'innstillinger', tekst: 'nav.innstillinger' },
];

export function Skall() {
  const { t, malform } = useTekst();
  const plassering = usePlassering();
  const treff = finnRute(plassering.sti);
  const erForside = plassering.sti === '/';

  useEffect(() => {
    const side = treff ? visTekst(treff.rute.tittel, malform) : t('ikkeFunnet.tittel');
    document.title = erForside ? app.navn : t('app.tittelMal', { side, app: app.navn });
  }, [treff?.rute, malform, erForside]);

  const aktivMeny = menypunkter.find((m) => (m.sti === '/' ? erForside : plassering.sti.startsWith(m.sti)))?.sti;

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
            {app.navn}
          </a>
          <KildestatusIndikator />
        </div>
      </header>
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
      <nav class="bunnmeny" aria-label={t('app.hovedmeny')}>
        <ul>
          {menypunkter.map((m) => (
            <li key={m.sti}>
              <a href={`#${m.sti}`} aria-current={aktivMeny === m.sti ? 'page' : undefined}>
                <Ikon navn={m.ikon} fylt={aktivMeny === m.sti && m.ikon === 'stjerne'} />
                <span>{t(m.tekst)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Oppdateringsvarsel />
    </div>
  );
}
