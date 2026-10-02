// Grunnleggende ferdigheter og tverrfaglige temaer i et fag, til fagarket (pakke 6, avgjørelse 037). Hver ferdighet
// og hvert tema er en rad som åpnes, med teksten fra læreplanen (uoversatt, på målformen planen er fastsatt i) og en
// lenke til omtalen i overordnet del.
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
import type { Laereplan } from '../../fag/skjema.ts';
import { elementRute, type Laereplanverket, lastLaereplanverket } from '../data.ts';

type Omtale = Laereplan['ferdigheter'][number];

function Rad({ omtale, navn, lenke, lang, plan }: { omtale: Omtale; navn: string; lenke: string; lang: string; plan: string }) {
  const { t } = useTekst();
  const [lukket, veksle] = useSammenlagt(`fag-lv-${plan}-${omtale.kode}`, true);
  const id = useId();
  return (
    <div class="od-underdel">
      <h3 class="od-underdel-tittel">
        <button type="button" class="od-underdel-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
          <span>{navn}</span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
        </button>
      </h3>
      <div id={id} class="od-underdel-innhold" hidden={lukket}>
        <div lang={lang}>
          {omtale.tekst.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
        <p class="liten">
          <a href={`#${elementRute(omtale.kode)}`}>{t('laereplanverket.fagark.lenke', { navn: lenke })}</a>
        </p>
      </div>
    </div>
  );
}

export function FerdigheterOgTemaer({ plan, lang }: { plan: Laereplan; lang: string }) {
  const { t, malform } = useTekst();
  const [lv, settLv] = useState<Laereplanverket | null>(null);
  useEffect(() => {
    lastLaereplanverket().then(settLv, () => undefined);
  }, []);
  const navn = (liste: Laereplanverket['ferdigheter'] | undefined, kode: string) => liste?.find((e) => e.kode === kode)?.navn[malform] ?? kode;
  return (
    <>
      {plan.ferdigheter.length > 0 && (
        <>
          <p class="liten-overskrift">{t('laereplanverket.fagark.ferdigheter')}</p>
          <p class="liten">
            <a href="#/begreper/grunnleggende-ferdigheter">{t('laereplanverket.omBegrep.ferdigheter')}</a>
          </p>
          {plan.ferdigheter.map((o) => (
            // Ferdighetene er omtalt samlet i overordnet del.
            <Rad key={o.kode} omtale={o} navn={navn(lv?.ferdigheter, o.kode)} lenke={t('laereplanverket.ferdigheter')} lang={lang} plan={plan.kode} />
          ))}
        </>
      )}
      {plan.temaer.length > 0 && (
        <>
          <p class="liten-overskrift">{t('laereplanverket.fagark.temaer')}</p>
          <p class="liten">
            <a href="#/begreper/tverrfaglige-temaer">{t('laereplanverket.omBegrep.temaer')}</a>
          </p>
          {plan.temaer.map((o) => (
            <Rad key={o.kode} omtale={o} navn={navn(lv?.temaer, o.kode)} lenke={navn(lv?.temaer, o.kode)} lang={lang} plan={plan.kode} />
          ))}
        </>
      )}
    </>
  );
}
