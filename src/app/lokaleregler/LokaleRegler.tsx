// Delen «Lokale regler for {sted}» på siden for et tema (fase 9, avgjørelse 093): de godkjente reglene for fylket og
// skolen brukeren har valgt, brukerens egne, og lenken til en ny regel under temaet. Står bare når fylket er valgt.
import { Ikon } from '../../components/Ikon.tsx';
import { lokalRegelAdresse } from '../../components/Lokalregel.tsx';
import { reglerForTema } from '../../core/lokale/regler.ts';
import type { Tema } from '../../core/lokale/skjema.ts';
import { fylkesnavn } from '../Stedmerknad.tsx';
import { useTekst, useTilstand } from '../tilstand.ts';
import { useLokale } from './bruk.ts';
import { Egenregelkort, Godkjentkort, Verdikort } from './visning.tsx';

export function LokaleRegler({ tema }: { tema: Tema }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const { egne, godkjente, sted, dato } = useLokale();
  if (!sted.fylke) return null;
  const regler = reglerForTema(tema, egne, godkjente, sted, dato);
  const navn = innstillinger.skole?.navn ?? fylkesnavn(sted.fylke) ?? sted.fylke;
  return (
    <section class="lokaleregler-del" data-testid="lokale-regler-side">
      <h2 class="liten-overskrift">{t('lokaleRegler.side.tittel', { sted: navn })}</h2>
      {regler.godkjente.map((r) => (r.type === 'verdi' ? <Verdikort key={r.kode} regel={r} egen={false} /> : <Godkjentkort key={r.kode} regel={r} />))}
      {regler.egne.map((r) => (r.type === 'verdi' ? <Verdikort key={r.kode} regel={r} egen /> : <Egenregelkort key={r.kode} regel={r} godkjente={godkjente} />))}
      <ul class="liste">
        <li>
          <a class="listelenke" href={lokalRegelAdresse({ tema })}>
            <Ikon navn="pluss" />
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('lokaleRegler.side.leggInn')}</span>
              <span class="listelenke-under">{t('lokaleRegler.side.leggInnTekst')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
    </section>
  );
}
