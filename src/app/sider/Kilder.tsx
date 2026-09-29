// Detaljside for kilder og kildestatus.
import { Kildelenke } from '../../components/Kildelenke.tsx';
import { app } from '../../config/app.ts';
import { formaterTidspunkt } from '../../core/i18n/tekst.ts';
import kilderegister from '../../../content/kilder.yaml';
import type { Kilderegister } from '../../core/innhold/skjema.ts';
import {
  erUtdatert,
  nesteKildesjekk,
  samletStatus,
  UTDATERT_ETTER_DAGER,
  varselnokkel,
} from '../../core/kildestatus/kildestatus.ts';
import { useKildestatus } from '../kildestatus.ts';
import { tilstand, useTekst, useTilstand } from '../tilstand.ts';

const register = kilderegister as Kilderegister;

export default function Kilder() {
  const { t, malform } = useTekst();
  const { skjultKildevarsel } = useTilstand();
  const status = useKildestatus();
  const fil = status.tilstand === 'ok' ? status.data : null;
  const naa = new Date();
  const samlet = status.tilstand === 'laster' ? null : samletStatus(fil, naa);
  const nokkel = samlet ? varselnokkel(fil, samlet) : null;
  const erSkjult = nokkel !== null && nokkel === skjultKildevarsel;
  const neste = nesteKildesjekk(naa, app.kildesjekk);

  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('kildestatus.tittel')}</h1>
      <p>{t('kildestatus.forklaring')}</p>
      {samlet && (
        <div class={`kort kort-${samlet}`} data-testid="samlet-kildestatus" data-status={samlet}>
          <p>
            <strong>{t('kildestatus.indikator', { status: t(`kildestatus.status.${samlet}`) })}</strong>
          </p>
          {fil && <p>{t('kildestatus.sistKjort', { dato: formaterTidspunkt(fil.kjort, malform) })}</p>}
          {fil && erUtdatert(fil.kjort, naa) && <p>{t('kildestatus.utdatertForklaring', { dager: UTDATERT_ETTER_DAGER })}</p>}
          {!fil && <p>{t('kildestatus.ingenData')}</p>}
          <p data-testid="neste-kildesjekk">{t('kildestatus.nesteSjekk', { dato: formaterTidspunkt(neste.toISOString(), malform) })}</p>
          {nokkel !== null && (
            <>
              {erSkjult && <p class="liten">{t('kildestatus.skjultForklaring')}</p>}
              <button
                type="button"
                class="knapp knapp-sekundaer"
                onClick={() => tilstand.oppdater((d) => ({ ...d, skjultKildevarsel: erSkjult ? null : nokkel }))}
              >
                {erSkjult ? t('kildestatus.visVarsel') : t('kildestatus.skjulVarsel')}
              </button>
            </>
          )}
        </div>
      )}
      <ul class="liste kilder">
        {register.kilder.map((k) => {
          const post = fil?.kilder[k.id];
          const s = post ? post.status : 'ikkeSjekket';
          return (
            <li key={k.id} class="kilde" data-kilde={k.id}>
              <div class="kilde-innhold">
                <Kildelenke kilde={{ id: k.id }} />
                <p class="dempet liten">
                  {t('kildestatus.utgiver', { utgiver: k.utgiver })} · {t('kildestatus.lisens', { lisens: k.lisens })}
                </p>
                <p class="liten">
                  <span class={`merke merke-kilde-${s}`}>{t(`kildestatus.status.${s}`)}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <section aria-labelledby="kilder-eier">
        <h2 id="kilder-eier" class="liten-overskrift">
          {t('kildestatus.eier.tittel')}
        </h2>
        <p class="liten">{t('kildestatus.eier.tekst')}</p>
        <p>
          <a href={app.kildesjekkUrl} target="_blank" rel="noopener noreferrer">
            {t('kildestatus.eier.lenke')}
          </a>
        </p>
      </section>
    </div>
  );
}
