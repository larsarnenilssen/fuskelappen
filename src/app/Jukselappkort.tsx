// Kortet med dagens jukselapp (fase 8, avgjørelse 085). Lastes når jukselappen vises, så kortet, stilene og utvalget
// ikke er med i startpakken.
import { Ikon } from '../components/Ikon.tsx';
import { visTekst } from '../core/i18n/tekst.ts';
import type { Faktum } from '../modules/typer.ts';
import { fylkesnavn } from './Stedmerknad.tsx';
import { useTekst } from './tilstand.ts';
import '../styles/jukselapp.css';

export { hentFaktum } from '../core/jukselapp/fakta.ts';

/**
 * Jukselappen i panelet, med samme oppsett som kalenderen, nyhetene og tallene (eier 08.10.2026): øverst hvor faktumet
 * kommer fra og knappen for ny jukselapp, så faktumet i liten skrift, og nederst den blå linjen med lenken til stedet i
 * appen over hele bredden. Tittelen, regelverket og kildene står ikke i kortet (eier 08.10.2026). De står på siden
 * lenken går til.
 */
export function Jukselappkort({ f, onNy }: { f: Faktum | null; onNy: () => void }) {
  const { t, malform } = useTekst();
  const sted = f?.gyldighet && f.gyldighet.niva !== 'nasjonal' ? fylkesnavn(f.gyldighet.fylke) : null;
  return (
    <div class="panel-boks jl-panel" data-faktum={f?.id}>
      <div class="jl-topp">
        <p class="jl-under">{f ? [visTekst(f.under, malform), f.naar?.[malform], sted].filter(Boolean).join(' · ') : ''}</p>
        <button type="button" class="lenkeknapp liten jl-ny" onClick={onNy}>
          <Ikon navn="igjen" class="ikon-liten" />
          {t('forside.jukselapp.ny')}
        </button>
      </div>
      {f ? (
        <p class="jl-tekst" aria-live="polite">
          {f.tekst[malform]}
        </p>
      ) : (
        <p class="dempet panel-tom">{t('forside.jukselapp.tom')}</p>
      )}
      {f && (
        <a class="panel-videre jl-videre" href={`#${f.rute}`}>
          <span class="jl-lenke">{f.lenke[malform]}</span>
          <Ikon navn="hoyre" class="ikon-liten" />
        </a>
      )}
    </div>
  );
}
