// En avtale i Regelverk (eier 02.10.2026, avgjørelse 039): som et dokument fra Lovdata, med søket øverst og kapitlene i
// rubrikker, men bestemmelsene er skrevet med egne ord. Hver bestemmelse har lenke til punktet i avtaleteksten.
import { useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { finnKilde } from '../../../components/Kildelenke.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { KortfotRader } from '../../../components/Kortfot.tsx';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';
import { type Avtaleinfo, avtaleSomDokument, lastBestemmelser } from '../avtaler.ts';
import { paragraffavoritt } from '../data.ts';
import { Lasting, Sok, useLast, useRullTil } from './felles.tsx';

/** En bestemmelse som en boks som er lukket til brukeren åpner den. Adressen til bestemmelsen åpner den. */
function Bestemmelse({ avtale, element, apen }: { avtale: Avtaleinfo; element: Innholdselement; apen: boolean }) {
  const { malform } = useTekst();
  const [lukket, veksle] = useSammenlagt(`lov-${avtale.id}-${element.id}`, !apen);
  const id = useId();
  return (
    <div class="od-underdel lov-paragraf" data-rubrikk={`lov-${element.id}`}>
      <div class="med-stjerne">
        <h3 class="od-underdel-tittel">
          <button type="button" class="od-underdel-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
            <span>{element.tittel[malform]}</span>
            <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
          </button>
        </h3>
        <FavorittKnapp id={paragraffavoritt(avtale.id, element.id)} navn={`${element.tittel[malform]} (${avtale.korttittel[malform]})`} liten />
      </div>
      <div id={id} class="od-underdel-innhold" hidden={lukket}>
        <div class="brodtekst" dangerouslySetInnerHTML={{ __html: element.tekst[malform] }} />
        {/* Kildene som en lukket rad under teksten, som i kortene ellers i appen (eier 06.10.2026, avgjørelse 071). */}
        <KortfotRader kilder={element.kilder} />
      </div>
    </div>
  );
}

export function Avtale({ avtale, nokkel }: { avtale: Avtaleinfo; nokkel: string | null }) {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useLast(lastBestemmelser, 'avtaler');
  const lastet = typeof data !== 'string';
  const mal = nokkel && avtale.kapitler.some((k) => k.elementer.includes(nokkel)) ? nokkel : null;
  useRullTil(lastet && mal ? `lov-${mal}` : null);
  const url = finnKilde(avtale.kilde)?.url;
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('lov.tittel'), href: '#/lov' }]} />
      <Sidetopp tittel={avtale.korttittel[malform]} favoritt={`lov:${avtale.id}`} />
      <p class="dempet">{avtale.tittel[malform]}</p>
      <p class="merknad">
        {t('lov.avtaleMerknad')}{' '}
        {url && (
          <a class="ekstern-lenke" href={url} target="_blank" rel="noopener noreferrer">
            {t('lov.lesAvtalen')}
            <Ikon navn="ekstern" class="ikon-liten" />
          </a>
        )}
      </p>
      {nokkel && !mal && (
        <p class="merknad" role="alert">
          {t('lov.bestemmelseIkkeFunnet', { navn: avtale.korttittel[malform] })}
        </p>
      )}
      {!lastet ? (
        <Lasting feil={data === 'feil'} provIgjen={provIgjen} />
      ) : (
        <Sok etikett={t('lov.sok', { navn: avtale.korttittel[malform] })} dokumenter={() => Promise.resolve([avtaleSomDokument(avtale, data, malform)])} visDokument={false}>
          {avtale.kapitler.map((k, i) => {
            const elementer = k.elementer.flatMap((id) => data.get(id) ?? []);
            return (
              <Rubrikk
                key={i}
                nokkel={`lov-${avtale.id}-kap${i + 1}`}
                tittel={k.overskrift[malform]}
                hoyre={formaterTall(elementer.length)}
                lukket={!k.elementer.includes(mal ?? '')}
              >
                {elementer.map((e) => (
                  <Bestemmelse key={e.id} avtale={avtale} element={e} apen={e.id === mal} />
                ))}
              </Rubrikk>
            );
          })}
        </Sok>
      )}
      <Kildeboks kilder={[{ id: avtale.kilde }]} nokkel={`avtale-${avtale.id}`} />
    </div>
  );
}
