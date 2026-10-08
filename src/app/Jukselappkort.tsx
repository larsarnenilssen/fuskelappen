// Kortet med dagens jukselapp (fase 8). Lastes når jukselappen vises, med faktaene, så Kortfot og kildene ikke kommer
// med i startpakken.
import { Ikon } from '../components/Ikon.tsx';
import { KortfotRader } from '../components/Kortfot.tsx';
import type { Faktum } from './jukselappSkisse.ts';
import { useTekst } from './tilstand.ts';

export { SKISSEFAKTA } from './jukselappSkisse.ts';

/** Dagen som tall, så samme dato gir samme faktum for alle (og ingenting må lagres). */
function dagnummer(dato: string): number {
  return Math.floor(Date.parse(`${dato}T12:00:00Z`) / 86_400_000);
}

/**
 * Faktumet for i dag. `ekstra` er antall trykk på knappen for ny jukselapp. Hoppet gjennom listen er et primtall, så
 * dagene etter hverandre gir fakta fra ulike moduler, og alle kommer før noe gjentas.
 */
export function velgFaktum<T>(fakta: readonly T[], dato: string, ekstra = 0): T | undefined {
  if (fakta.length === 0) return undefined;
  const hopp = fakta.length % 7 === 0 ? 11 : 7;
  return fakta[((((dagnummer(dato) + ekstra) * hopp) % fakta.length) + fakta.length) % fakta.length];
}

/** Faktaene som gjelder for brukeren: nasjonale, og fylkets og skolens når de er valgt. */
export function synligeFakta(fakta: readonly Faktum[], fylke: string | null, skole: string | null): Faktum[] {
  return fakta.filter((f) => !f.fylke || (f.fylke === fylke && (!f.skole || f.skole === skole)));
}

/**
 * Jukselappen i panelet, med samme oppsett som kalenderen, nyhetene og tallene (eier 08.10.2026): en boks med tittelen
 * og faktumet i liten skrift, typen under, regelverket og kildene som lukkede rader, og den blå linjen nederst med
 * knappen for ny jukselapp og lenken til stedet i appen.
 */
export function Jukselappkort({ f, onNy }: { f: Faktum | undefined; onNy: () => void }) {
  const { t, malform } = useTekst();
  return (
    <div class="panel-boks jl-panel">
      {f ? (
        <div class="jl-innhold" aria-live="polite">
          <h3 class="jl-tittel">{f.tittel[malform]}</h3>
          <p class="jl-tekst">{f.tekst[malform]}</p>
          <p class="jl-under">{[f.type[malform], f.sted].filter(Boolean).join(' · ')}</p>
        </div>
      ) : (
        <p class="dempet panel-tom">{t('forside.jukselapp.tom')}</p>
      )}
      {f && (
        <div class="jl-rader">
          <KortfotRader kilder={f.kilder} nokkel={`jukselapp:${f.id}`} />
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
