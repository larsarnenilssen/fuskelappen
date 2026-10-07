// Kortet med dagens jukselapp (fase 8). Lastes når jukselappen vises, med faktaene, så Kortfot og kildene ikke kommer
// med i startpakken.
import { Ikon } from '../components/Ikon.tsx';
import { Kortfot } from '../components/Kortfot.tsx';
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

/** Kortet: typen og modulen, knappen for ny jukselapp, faktumet, lenken videre og kildene. */
export function Jukselappkort({ f, onNy }: { f: Faktum | undefined; onNy: () => void }) {
  const { t, malform } = useTekst();
  if (!f) return <p class="dempet">{t('forside.jukselapp.tom')}</p>;
  return (
    <article class="kort jukselapp" aria-live="polite">
      <div class="jukselapp-topp">
        <p class="jukselapp-type">
          <Ikon navn={f.ikon} class="ikon-liten" />
          <span>{[f.type[malform], f.sted].filter(Boolean).join(' · ')}</span>
        </p>
        <button type="button" class="ikonknapp jukselapp-ny" aria-label={t('forside.jukselapp.ny')} title={t('forside.jukselapp.ny')} onClick={onNy}>
          <Ikon navn="igjen" class="ikon-liten" />
        </button>
      </div>
      <p class="jukselapp-tekst">{f.tekst[malform]}</p>
      <a class="panel-videre jukselapp-videre" href={`#${f.rute}`}>
        <span class="panel-videre-tekst">{f.lenke[malform]}</span>
        <Ikon navn="hoyre" class="ikon-liten" />
      </a>
      <Kortfot kilder={f.kilder} nokkel={`jukselapp:${f.id}`} />
    </article>
  );
}
