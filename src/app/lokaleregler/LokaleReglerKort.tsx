// Skissen til fase 9: delen «Lokale regler» i Innstillinger, rett under «Fylke og skole». Se skisse.ts.
import { Ikon } from '../../components/Ikon.tsx';
import { formaterDato } from '../../core/i18n/tekst.ts';
import { useTekst } from '../tilstand.ts';
import { type EgenRegel, GODKJENT_VERDI, nasjonalVerdi, status } from './skisse.ts';
import { medEnhet, Statuslinje, useEgneRegler, useSted, verdinavn } from './visning.tsx';

function Regelrad({ regel, sted }: { regel: EgenRegel; sted: string }) {
  const { t } = useTekst();
  const tittel = regel.type === 'verdi' && regel.nokkel ? t(`lokaleRegler.verdier.${verdinavn(regel.nokkel)}`) : (regel.tittel ?? '');
  const linje =
    regel.type === 'verdi' && regel.nokkel
      ? t('lokaleRegler.rad.verdi', {
          sted,
          verdi: medEnhet(regel.nokkel, regel.verdi ?? 0),
          nasjonal: medEnhet(regel.nokkel, Number(nasjonalVerdi(regel.nokkel).verdi)),
        })
      : t('lokaleRegler.rad.regel', { sted, tema: t(`lokaleRegler.tema.${regel.tema}`) });
  return (
    <li>
      <a class="listelenke" href={`#/innstillinger/lokal-regel?kode=${regel.kode}`}>
        <span class="listelenke-tekst">
          <span class="listelenke-tittel">{tittel}</span>
          <span class="listelenke-under">{linje}</span>
          <span class="listelenke-under">
            <Statuslinje regel={regel} />
          </span>
        </span>
        <Ikon navn="hoyre" class="ikon-liten" />
      </a>
    </li>
  );
}

export function LokaleReglerKort() {
  const { t, malform } = useTekst();
  const sted = useSted();
  const regler = useEgneRegler();
  const egne = regler.filter((r) => status(r) !== 'godkjent');
  const godkjente = regler.filter((r) => status(r) === 'godkjent');
  // Alle godkjente regler for skolen eller fylket, også dem andre har meldt inn.
  const alleGodkjente = [GODKJENT_VERDI, ...godkjente];
  const stedsnavn = (r: EgenRegel) => (r.niva === 'skole' && sted.skole ? sted.skole.navn : (sted.fylkesnavn ?? ''));
  return (
    <fieldset class="valggruppe" data-testid="lokale-regler">
      <legend>{t('lokaleRegler.legend')}</legend>
      {!sted.fylke ? (
        <p class="dempet liten">{t('lokaleRegler.velgFylke')}</p>
      ) : (
        <>
          <p class="dempet liten">{t('lokaleRegler.forklaring')}</p>
          {godkjente.map((r) => (
            <p key={r.kode} class="merknad merknad-ok lokaleregler-melding" role="status">
              <Ikon navn="hake" class="ikon-liten" />
              <span>{t('lokaleRegler.godkjentMelding', { tittel: r.tittel ?? '', sted: stedsnavn(r) })}</span>
            </p>
          ))}
          <h3 class="lokaleregler-under">{t('lokaleRegler.dine')}</h3>
          {egne.length === 0 ? (
            <p class="dempet">{t('lokaleRegler.ingen')}</p>
          ) : (
            <ul class="liste lokaleregler-liste">
              {egne.map((r) => (
                <Regelrad key={r.kode} regel={r} sted={stedsnavn(r)} />
              ))}
            </ul>
          )}
          <p>
            <a class="knapp knapp-sekundaer" href="#/innstillinger/lokal-regel">
              <Ikon navn="pluss" />
              {t('lokaleRegler.leggInn')}
            </a>
          </p>
          {alleGodkjente.length > 0 && (
            <>
              <h3 class="lokaleregler-under">{t('lokaleRegler.godkjente', { sted: sted.navn ?? '' })}</h3>
              <p class="dempet liten">{t('lokaleRegler.godkjenteTekst', { sted: sted.navn ?? '' })}</p>
              <ul class="liste lokaleregler-liste">
                {alleGodkjente.map((r) => (
                  <li key={r.kode}>
                    <a class="listelenke" href={`#/innstillinger/lokal-regel?fra=${r.kode}`}>
                      <span class="listelenke-tekst">
                        <span class="listelenke-tittel">{r.type === 'verdi' && r.nokkel ? t(`lokaleRegler.verdier.${verdinavn(r.nokkel)}`) : r.tittel}</span>
                        <span class="listelenke-under">
                          {t(`lokaleRegler.tema.${r.tema}`)} · {t('lokaleRegler.status.godkjent', { dato: formaterDato(r.godkjent ?? '', malform) })}
                        </span>
                        <span class="listelenke-under">
                          {t('lokaleRegler.lokalfot.sporsmal')} {t('lokaleRegler.lokalfot.lenke')}
                        </span>
                      </span>
                      <Ikon navn="hoyre" class="ikon-liten" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </fieldset>
  );
}
