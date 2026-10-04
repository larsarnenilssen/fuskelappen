// Søkefelt med resultater. Brukes på forsiden og på søkesiden.
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
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

export function Sokeboks({ etikett, plassholder, startverdi = '', autofokus = false, onEndring }: Props) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const id = useId();
  const felt = useRef<HTMLInputElement>(null);
  const [sporring, settSporring] = useState(startverdi);
  const [indeks, settIndeks] = useState<Indekstilstand>('ikke-lastet');
  const [treff, settTreff] = useState<Sokeresultat[]>([]);
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
  }, [sporring, indeks, innstillinger.fylke]);

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
      {aktiv && indeks === 'klar' && treff.length > 0 && (
        <ul class="liste sokeresultater">
          {treff.map((r) => (
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
    </div>
  );
}

/** Er søket i bruk? Forsiden skjuler resten av innholdet mens det vises treff. */
export function erAktivtSok(sporring: string): boolean {
  return sporring.trim().length >= 2;
}
