// Feilgrensen rundt siden (avgjørelse 097). Kaster en side en feil når den tegnes, vises en melding med «Last siden på
// nytt» og «Til forsiden» i stedet for en blank side. Toppfeltet står utenfor og virker som før. Feilen nullstilles når
// adressen endres.
import { Component, type ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { useTekst } from './tilstand.ts';

function Sidefeil() {
  const { t } = useTekst();
  const tittel = useRef<HTMLHeadingElement>(null);
  useEffect(() => tittel.current?.focus({ preventScroll: true }), []);
  return (
    <div class="side" role="alert">
      <h1 tabIndex={-1} ref={tittel}>
        {t('sidefeil.tittel')}
      </h1>
      <p>{t('sidefeil.tekst')}</p>
      <p>
        <button type="button" class="knapp" onClick={() => window.location.reload()}>
          {t('sidefeil.lastPaNytt')}
        </button>
      </p>
      {/* Veien videre som rad med ikon og pil, som på «Fant ikke siden» (docs/DESIGN.md). */}
      <ul class="liste">
        <li>
          <a class="listelenke" href="#/">
            <Ikon navn="hjem" />
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('sidefeil.tilForsiden')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
    </div>
  );
}

interface Props {
  /** Adressen siden står på. Når den endres, nullstilles feilen, så brukeren kan gå videre. */
  adresse: string;
  children: ComponentChildren;
}

export class Feilgrense extends Component<Props, { feil: boolean }> {
  override state = { feil: false };

  static override getDerivedStateFromError(): { feil: boolean } {
    return { feil: true };
  }

  override componentDidCatch(feil: unknown): void {
    // Til utviklerverktøyene. Ingenting sendes noe sted.
    console.error(feil);
  }

  override componentDidUpdate(forrige: Props): void {
    if (forrige.adresse !== this.props.adresse && this.state.feil) this.setState({ feil: false });
  }

  render() {
    return this.state.feil ? <Sidefeil /> : this.props.children;
  }
}
