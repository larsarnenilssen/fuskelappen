// Delen «Lokale regler» i Innstillinger, rett under «Fylke og skole» (fase 9, avgjørelse 093): brukerens egne regler,
// knappen for en ny regel, beskjed når en regel brukeren meldte inn er godkjent, og de godkjente reglene for stedet
// med lenken til å endre eller melde inn en endring.
import { Ikon } from '../../components/Ikon.tsx';
import { lokalRegelAdresse } from '../../components/Lokalregel.tsx';
import { formaterDato } from '../../core/i18n/tekst.ts';
import { aktiveGodkjente, egenstatus, passerSted } from '../../core/lokale/regler.ts';
import type { EgenRegel, PublisertRegel } from '../../core/lokale/skjema.ts';
import { slettEgenRegel, useTekst } from '../tilstand.ts';
import { useLokale } from './bruk.ts';
import { Statuslinje, verdinavn, visVerdi, nasjonalVerdi } from './visning.tsx';

function tittelFor(t: ReturnType<typeof useTekst>['t'], r: Pick<EgenRegel, 'type' | 'nokkel'> & { tittel?: string | undefined }): string {
  return r.type === 'verdi' && r.nokkel ? t(verdinavn(r.nokkel)) : (r.tittel ?? '');
}

function Regelrad({ regel, godkjente, passer }: { regel: EgenRegel; godkjente: readonly PublisertRegel[]; passer: boolean }) {
  const { t } = useTekst();
  const linje =
    regel.type === 'verdi' && regel.nokkel
      ? t('lokaleRegler.rad.verdi', {
          sted: regel.stedsnavn,
          verdi: visVerdi(regel.nokkel, regel.verdi ?? 0),
          nasjonal: visVerdi(regel.nokkel, Number(nasjonalVerdi(regel.nokkel).verdi)),
        })
      : t('lokaleRegler.rad.regel', { sted: regel.stedsnavn, tema: t(`lokaleRegler.tema.${regel.tema}`) });
  return (
    <li>
      <a class="listelenke" href={lokalRegelAdresse({ kode: regel.kode })}>
        <span class="listelenke-tekst">
          <span class="listelenke-tittel">{tittelFor(t, regel)}</span>
          <span class="listelenke-under">{linje}</span>
          <span class="listelenke-under">
            <Statuslinje regel={regel} godkjente={godkjente} />
          </span>
          {!passer && <span class="listelenke-under">{t('lokaleRegler.andreSted', { sted: regel.stedsnavn })}</span>}
        </span>
        <Ikon navn="hoyre" class="ikon-liten" />
      </a>
    </li>
  );
}

export function LokaleReglerKort() {
  const { t, malform } = useTekst();
  const { egne, godkjente, sted, dato } = useLokale();
  const status = (r: EgenRegel) => egenstatus(r, godkjente, dato);
  // Regler brukeren meldte inn, som nå er godkjent: beskjed én gang, til brukeren lukker den (kopien slettes da).
  const erstattet = egne.filter((r) => status(r) === 'godkjent');
  const mine = egne.filter((r) => status(r) !== 'godkjent');
  const forStedet = aktiveGodkjente(godkjente, [], sted, dato);
  const stedsnavn = (r: { stedsnavn: string }) => r.stedsnavn;
  return (
    <fieldset class="valggruppe" data-testid="lokale-regler">
      <legend>{t('lokaleRegler.legend')}</legend>
      {erstattet.map((r) => (
        <div key={r.kode} class="merknad lokaleregler-melding" role="status">
          <Ikon navn="hake" class="ikon-liten" />
          <span>{t('lokaleRegler.godkjentMelding', { tittel: tittelFor(t, r), sted: stedsnavn(r) })}</span>
          <button type="button" class="lenkeknapp" onClick={() => slettEgenRegel(r.kode)}>
            {t('lokaleRegler.lukk')}
          </button>
        </div>
      ))}
      {!sted.fylke ? (
        <p class="dempet liten">{t('lokaleRegler.velgFylke')}</p>
      ) : (
        <p class="dempet liten">{t('lokaleRegler.forklaring')}</p>
      )}
      {(mine.length > 0 || sted.fylke) && (
        <>
          <h3 class="lokaleregler-under">{t('lokaleRegler.dine')}</h3>
          {mine.length === 0 ? (
            <p class="dempet liten">{t('lokaleRegler.ingen')}</p>
          ) : (
            <ul class="liste lokaleregler-liste">
              {mine.map((r) => (
                <Regelrad key={r.kode} regel={r} godkjente={godkjente} passer={passerSted(r, sted)} />
              ))}
            </ul>
          )}
        </>
      )}
      {sted.fylke && (
        <p>
          <a class="knapp knapp-sekundaer" href={lokalRegelAdresse()}>
            <Ikon navn="pluss" />
            {t('lokaleRegler.leggInn')}
          </a>
        </p>
      )}
      {forStedet.length > 0 && (
        <>
          <h3 class="lokaleregler-under">{t('lokaleRegler.godkjente')}</h3>
          <p class="dempet liten">{t('lokaleRegler.godkjenteTekst')}</p>
          <ul class="liste lokaleregler-liste">
            {forStedet.map((r) => (
              <li key={r.kode}>
                <a class="listelenke" href={lokalRegelAdresse({ fra: r.kode })}>
                  <span class="listelenke-tekst">
                    <span class="listelenke-tittel">{r.type === 'verdi' && r.nokkel ? t(verdinavn(r.nokkel)) : r.tittel?.[malform]}</span>
                    <span class="listelenke-under">
                      {r.stedsnavn} · {t(`lokaleRegler.tema.${r.tema}`)} · {t('lokaleRegler.status.godkjent', { dato: formaterDato(r.kontrollert?.dato ?? '', malform) })}
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
    </fieldset>
  );
}
