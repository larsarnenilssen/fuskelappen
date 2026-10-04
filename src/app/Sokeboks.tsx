// Søkefelt med resultater. Brukes på forsiden og på søkesiden.
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { filtrerTreff, tellGrupper, type Sokegruppe } from '../core/sok/grupper.ts';
import type { Sokeresultat } from '../core/sok/sok.ts';
import { synligeTreff } from '../core/sok/synlige.ts';
import { hentSok } from './sokeklient.ts';
import { useTekst, useTilstand } from './tilstand.ts';

interface Props {
  etikett: string;
  plassholder: string;
  startverdi?: string;
  autofokus?: boolean;
  onEndring?: (sporring: string) => void;
}

type Indekstilstand = 'ikke-lastet' | 'laster' | 'klar' | 'feil';

/** Så mange treff vises om gangen. «Vis flere» viser like mange til. */
const PER_SIDE = 50;

export function Sokeboks({ etikett, plassholder, startverdi = '', autofokus = false, onEndring }: Props) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const id = useId();
  const felt = useRef<HTMLInputElement>(null);
  const [sporring, settSporring] = useState(startverdi);
  const [indeks, settIndeks] = useState<Indekstilstand>('ikke-lastet');
  const [treff, settTreff] = useState<Sokeresultat[]>([]);
  // Filteret på gruppe (avgjørelse 058). Det står til brukeren velger et annet, også når søket endres.
  const [filter, settFilter] = useState<Sokegruppe | 'alle'>('alle');
  const [antall, settAntall] = useState(PER_SIDE);
  const sokRef = useRef<((s: string) => Sokeresultat[]) | null>(null);

  const lastIndeks = () => {
    if (indeks === 'laster' || indeks === 'klar') return;
    settIndeks('laster');
    hentSok()
      .then((sok) => {
        sokRef.current = sok;
        settIndeks('klar');
      })
      .catch(() => settIndeks('feil'));
  };

  useEffect(() => {
    if (startverdi) lastIndeks();
    if (autofokus) felt.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    // Fylkesinnhold (f.eks. begreper som bare gjelder Vestland) vises bare når fylket er valgt.
    if (indeks === 'klar' && sokRef.current) settTreff(synligeTreff(sokRef.current(sporring), innstillinger.fylke));
    settAntall(PER_SIDE);
  }, [sporring, indeks, innstillinger.fylke]);

  const grupper = tellGrupper(treff);
  // Har ikke den valgte gruppen treff i dette søket, vises alle.
  const gjeldende = filter !== 'alle' && grupper.some((g) => g.gruppe === filter) ? filter : 'alle';
  const filtrert = filtrerTreff(treff, gjeldende);

  const aktiv = sporring.trim().length >= 2;
  const status = !aktiv
    ? ''
    : indeks === 'feil'
      ? t('sok.indeksFeil')
      : indeks !== 'klar'
        ? t('sok.lasterIndeks')
        : treff.length === 0
          ? t('sok.ingenTreff', { sok: sporring.trim() })
          : treff.length === 1
            ? t('sok.etTreff')
            : t('sok.antallTreff', { antall: treff.length });

  return (
    <div class="sokeboks">
      <form
        role="search"
        class="sokefelt"
        onSubmit={(e) => {
          e.preventDefault();
          felt.current?.blur();
        }}
      >
        <label for={id} class="skjult-visuelt">
          {etikett}
        </label>
        <Ikon navn="sok" class="sokefelt-ikon" />
        <input
          ref={felt}
          id={id}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          spellcheck={false}
          placeholder={plassholder}
          value={sporring}
          aria-describedby={`${id}-status`}
          data-autofokus={autofokus ? '' : undefined}
          onFocus={lastIndeks}
          onInput={(e) => {
            const ny = e.currentTarget.value;
            settSporring(ny);
            lastIndeks();
            onEndring?.(ny);
          }}
        />
        {/* Krysset tømmer feltet, så brukeren slipper å slette tegn for tegn for å komme tilbake (eier 04.10.2026). */}
        {sporring !== '' && (
          <button
            type="button"
            class="ikonknapp sokefelt-tom"
            aria-label={t('sok.tom')}
            onClick={() => {
              settSporring('');
              onEndring?.('');
              felt.current?.focus();
            }}
          >
            <Ikon navn="lukk" />
          </button>
        )}
      </form>
      <p id={`${id}-status`} class="sokestatus" role="status" aria-live="polite">
        {status}
      </p>
      {/* Filtrene vises når treffene er fra minst to grupper (eier 04.10.2026, avgjørelse 058). */}
      {aktiv && indeks === 'klar' && grupper.length > 1 && (
        <div class="sokefilter" role="group" aria-label={t('sok.filter.etikett')}>
          {[{ gruppe: 'alle' as const, antall: treff.length }, ...grupper].map((g) => (
            <button
              key={g.gruppe}
              type="button"
              class="sokefilter-valg"
              aria-pressed={gjeldende === g.gruppe}
              onClick={() => {
                settFilter(g.gruppe);
                settAntall(PER_SIDE);
              }}
            >
              {t(`sok.filter.${g.gruppe}`)} <span class="sokefilter-antall tall">{g.antall}</span>
            </button>
          ))}
        </div>
      )}
      {aktiv && indeks === 'klar' && filtrert.length > 0 && (
        <ul class="liste sokeresultater">
          {filtrert.slice(0, antall).map((r) => (
            <li key={r.id}>
              <a class="listelenke" href={`#${r.rute}`}>
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{r.tittel[malform]}</span>
                  <span class="listelenke-under">{t(`sok.typer.${r.type}`)}</span>
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {aktiv && indeks === 'klar' && filtrert.length > antall && (
        <button type="button" class="knapp knapp-sekundaer knapp-liten sokeresultater-flere" onClick={() => settAntall(antall + PER_SIDE)}>
          {t('sok.visFlere', { antall: String(filtrert.length - antall) })}
        </button>
      )}
    </div>
  );
}

/** Er søket i bruk? Forsiden skjuler resten av innholdet mens det vises treff. */
export function erAktivtSok(sporring: string): boolean {
  return sporring.trim().length >= 2;
}
