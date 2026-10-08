// Detaljside for kilder og kildestatus.
import { Kildelenke } from '../../components/Kildelenke.tsx';
import { app } from '../../config/app.ts';
import { formaterDato, formaterTidspunkt } from '../../core/i18n/tekst.ts';
import kilderegister from '../../../content/kilder.yaml';
import type { Kilderegister } from '../../core/innhold/skjema.ts';
import {
  ENDRET_NYLIG_DAGER,
  erUtdatert,
  kildevisning,
  nesteKildesjekk,
  samletStatus,
  tellKilder,
  UTDATERT_ETTER_DAGER,
  varselnokkel,
} from '../../core/kildestatus/kildestatus.ts';
import { useKildestatus } from '../kildestatus.ts';
import { tilstand, useTekst, useTilstand } from '../tilstand.ts';
import { Brodsmuler } from '../../components/Brodsmuler.tsx';

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
      <Brodsmuler ledd={[{ tekst: t('om.tittel'), href: '#/om' }]} />
      <h1 tabIndex={-1}>{t('kildestatus.tittel')}</h1>
      <p>{t('kildestatus.forklaring')}</p>
      {samlet && (
        <div class={`kort kort-${samlet}`} data-testid="samlet-kildestatus" data-status={samlet}>
          <p>
            <strong>{t('kildestatus.indikator', { status: t(`kildestatus.status.${samlet}`) })}</strong>
          </p>
          {fil && <p>{t('kildestatus.sistKjort', { dato: formaterTidspunkt(fil.kjort, malform) })}</p>}
          {fil && (
            <p data-testid="kildetelling">
              {(() => {
                const n = tellKilder(fil, naa);
                return t('kildestatus.telling', { virker: n.virker, endret: n.endretNylig, svarerIkke: n.svarerIkke, dager: ENDRET_NYLIG_DAGER });
              })()}
            </p>
          )}
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
          // Brukerne ser om kilden virker, er endret nylig eller ikke svarer, ikke om eier har godkjent den
          // (avgjørelse 089). Merkefargene er de samme som før: ok, endret og feilet.
          const post = fil?.kilder[k.id];
          const visning = post ? kildevisning(post, naa) : null;
          const klasse = visning === 'svarerIkke' ? 'feilet' : visning === 'endretNylig' ? 'endret' : visning === 'virker' ? 'ok' : 'ikkeSjekket';
          const tekst =
            visning === 'endretNylig' && post?.endret_siden
              ? t('kildestatus.kilde.endretNylig', { dato: formaterDato(post.endret_siden.slice(0, 10), malform) })
              : t(`kildestatus.kilde.${visning ?? 'forHand'}`);
          return (
            <li key={k.id} class="kilde" data-kilde={k.id}>
              <div class="kilde-innhold">
                <Kildelenke kilde={{ id: k.id }} />
                <p class="dempet liten">
                  {t('kildestatus.utgiver', { utgiver: k.utgiver })} · {t('kildestatus.lisens', { lisens: k.lisens })}
                </p>
                <p class="liten">
                  <span class={`merke merke-kilde-${klasse}`} data-visning={visning ?? 'forHand'}>
                    {tekst}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <section class="lop-del" aria-labelledby="kilder-eier">
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
