// «Veiene hit» på siden om prøvene i Vurdering (fase 6, pakke 6, eier 06.10.2026): et lukket kort under prøvene med
// lenker tilbake til hver vei i Opplæringstilbud, gruppert etter prøven veien fører til.
import { Fragment } from 'preact';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Lukketkort } from '../../../components/Lukketkort.tsx';
import type { Veimal } from '../../../core/innhold/skjema.ts';
import { useVeier, veiRute } from '../fagbrev/data.ts';

const MAL: readonly Veimal[] = ['fagbrev', 'praksisbrev', 'kompetansebevis'];

export function VeieneHit() {
  const { t, malform } = useTekst();
  const data = useVeier();
  if (!data) return null;
  return (
    <Lukketkort tittel={t('opplaeringslop.fagbrev.veieneHit')} smakebit={t('opplaeringslop.fagbrev.veieneHitTekst', { antall: String(data.veier.length) })} klasse="fb-hit">
      <p class="fag-ifaget-i">{t('opplaeringslop.fagbrev.iOpplaeringstilbud')}</p>
      {MAL.map((mal) => (
        <Fragment key={mal}>
          <h3 class="fb-hit-prove">{t(`opplaeringslop.fagbrev.proveFor.${mal}`)}</h3>
          <ul class="fag-ifaget-lenker">
            {data.veier
              .filter((v) => v.mal === mal)
              .map((v) => (
                <li key={v.id}>
                  <a class="lenke-pil" href={`#${veiRute(v.id)}`}>
                    {v.tittel[malform]}
                    <Ikon navn="hoyre" class="ikon-liten" />
                  </a>
                </li>
              ))}
          </ul>
        </Fragment>
      ))}
    </Lukketkort>
  );
}
