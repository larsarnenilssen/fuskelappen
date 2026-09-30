import { useEffect, useState } from 'preact/hooks';
import type { SideProps } from '../../modules/typer.ts';
import { erstattAdresse } from '../ruter.ts';
import { Sokeboks } from '../Sokeboks.tsx';
import { useTekst } from '../tilstand.ts';

/** Søket (q) i en adresse som #/sok?q=… */
function sokIAdresse(url: string): string {
  const hash = new URL(url).hash;
  const i = hash.indexOf('?');
  return new URLSearchParams(i >= 0 ? hash.slice(i + 1) : '').get('q') ?? '';
}

export default function Sok({ sporring }: SideProps) {
  const { t } = useTekst();
  // Søkefeltet leser søket fra adressen når det vises. Endres søket i adressen mens siden er åpen (lenke, tilbake,
  // eller adressefeltet), lages feltet på nytt med det nye søket. Når brukeren skriver, oppdateres adressen uten
  // navigasjon (erstattAdresse), så det gir ingen ny visning.
  const [versjon, settVersjon] = useState(0);
  useEffect(() => {
    const vedEndring = (e: HashChangeEvent) => {
      if (sokIAdresse(e.oldURL) !== sokIAdresse(e.newURL)) settVersjon((v) => v + 1);
    };
    window.addEventListener('hashchange', vedEndring);
    return () => window.removeEventListener('hashchange', vedEndring);
  }, []);
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('sok.tittel')}</h1>
      <p class="dempet">{t('sok.skrivForASoke')}</p>
      <Sokeboks
        key={versjon}
        etikett={t('sok.etikett')}
        plassholder={t('sok.plassholder')}
        startverdi={sporring.get('q') ?? ''}
        autofokus={!sporring.get('q')}
        onEndring={(q) => erstattAdresse('/sok', q ? { q } : undefined)}
      />
    </div>
  );
}
