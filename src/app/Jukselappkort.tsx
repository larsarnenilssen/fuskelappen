// Kortet med dagens jukselapp (fase 8, avgjørelse 085). Lastes når jukselappen vises, så kortet, stilene og utvalget
// ikke er med i startpakken.
import { Ikon } from '../components/Ikon.tsx';
import { KortfotRader } from '../components/Kortfot.tsx';
import { visTekst } from '../core/i18n/tekst.ts';
import type { Faktum } from '../modules/typer.ts';
import { fylkesnavn } from './Stedmerknad.tsx';
import { useTekst } from './tilstand.ts';
import '../styles/jukselapp.css';

export { hentFaktum } from '../core/jukselapp/fakta.ts';

/**
 * Jukselappen i panelet, med samme oppsett som kalenderen, nyhetene og tallene (eier 08.10.2026): tittelen og faktumet
 * i liten skrift, hvor det kommer fra under, regelverket og kildene som lukkede rader, og den blå linjen nederst med
 * knappen for ny jukselapp og lenken til stedet i appen.
 */
export function Jukselappkort({ f, onNy }: { f: Faktum | null; onNy: () => void }) {
  const { t, malform } = useTekst();
  const sted = f?.gyldighet && f.gyldighet.niva !== 'nasjonal' ? fylkesnavn(f.gyldighet.fylke) : null;
  return (
    <div class="panel-boks jl-panel" data-faktum={f?.id}>
      {f ? (
        <div class="jl-innhold" aria-live="polite">
          <h3 class="jl-tittel">{f.tittel[malform]}</h3>
          <p class="jl-tekst">{f.tekst[malform]}</p>
          <p class="jl-under">{[visTekst(f.under, malform), f.naar?.[malform], sted].filter(Boolean).join(' · ')}</p>
        </div>
      ) : (
        <p class="dempet panel-tom">{t('forside.jukselapp.tom')}</p>
      )}
      {f && (
        <div class="jl-rader">
          <KortfotRader paragrafer={f.paragrafer} kilder={f.kilder} nokkel={`jukselapp:${f.id}`} />
        </div>
      )}
      <div class="panel-videre jl-videre">
        <button type="button" class="lenkeknapp liten jl-ny" onClick={onNy}>
          <Ikon navn="igjen" class="ikon-liten" />
          {t('forside.jukselapp.ny')}
        </button>
        {f && (
          <a class="jl-lenke" href={`#${f.rute}`}>
            <span>{f.lenke[malform]}</span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        )}
      </div>
    </div>
  );
}
