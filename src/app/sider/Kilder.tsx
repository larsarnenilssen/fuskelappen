// Detaljside for kilder og kildestatus.
import { Kildelenke } from '../../components/Kildelenke.tsx';
import { formaterDato } from '../../core/i18n/tekst.ts';
import kilderegister from '../../../content/kilder.yaml';
import type { Kilderegister } from '../../core/innhold/skjema.ts';
import { erUtdatert, samletStatus, UTDATERT_ETTER_DAGER } from '../../core/kildestatus/kildestatus.ts';
import { useKildestatus } from '../kildestatus.ts';
import { useTekst } from '../tilstand.ts';

const register = kilderegister as Kilderegister;

export default function Kilder() {
  const { t, malform } = useTekst();
  const status = useKildestatus();
  const fil = status.tilstand === 'ok' ? status.data : null;
  const naa = new Date();
  const samlet = status.tilstand === 'laster' ? null : samletStatus(fil, naa);

  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('kildestatus.tittel')}</h1>
      <p>{t('kildestatus.forklaring')}</p>
      {samlet && (
        <div class={`kort kort-${samlet}`} data-testid="samlet-kildestatus" data-status={samlet}>
          <p>
            <strong>{t('kildestatus.indikator', { status: t(`kildestatus.status.${samlet}`) })}</strong>
          </p>
          {fil && <p>{t('kildestatus.sistKjort', { dato: formaterDato(fil.kjort, malform) })}</p>}
          {fil && erUtdatert(fil.kjort, naa) && <p>{t('kildestatus.utdatertForklaring', { dager: UTDATERT_ETTER_DAGER })}</p>}
          {!fil && <p>{t('kildestatus.ingenData')}</p>}
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
    </div>
  );
}
