// Lov og forskrift (avgjørelse 039): søket i alle dokumentene øverst, og så dokumentene i tre grupper: lover,
// forskrifter og lokale forskrifter (eier 02.10.2026). Lokale forskrifter vises bare når brukeren har valgt fylket.
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { TilToppen } from '../../../components/TilToppen.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { dokumentRute, lastDokument, lastOversikt, utvalgstekst } from '../data.ts';
import type { Lovdokument, Lovoversikt } from '../typer.ts';
import { Lasting, Sok, useLast } from './felles.tsx';

type Dokumentinfo = Lovoversikt['dokumenter'][number];

/** En gruppe dokumenter med overskrift. */
function Gruppe({ tittel, dokumenter }: { tittel: string; dokumenter: readonly Dokumentinfo[] }) {
  const { t } = useTekst();
  if (dokumenter.length === 0) return null;
  return (
    <>
      <h2 class="liten-overskrift">{tittel}</h2>
      <ul class="liste">
        {dokumenter.map((d) => (
          <li key={d.id}>
            <a class="listelenke" href={`#${dokumentRute(d.id)}`}>
              <span class="listelenke-tekst">
                <span class="listelenke-tittel" lang={d.malform}>
                  {d.korttittel}
                </span>
                <span class="listelenke-under">
                  {[
                    t('lov.fastsatt', { malform: t(`lov.malform.${d.malform}`) }),
                    d.utvalg ? t('lov.kapitler', { liste: utvalgstekst(d.utvalg, t('lov.og')) }) : t('lov.heleTeksten'),
                    t('lov.antallParagrafer', { antall: formaterTall(d.antallParagrafer) }),
                  ].join(' · ')}
                </span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [data, provIgjen] = useLast(lastOversikt, 'oversikt');
  const fylke = fylkesnavn(innstillinger.fylke);
  const nasjonale = (o: Lovoversikt) => o.dokumenter.filter((d) => d.gyldighet.niva === 'nasjonal');
  const lokale = (o: Lovoversikt) => o.dokumenter.filter((d) => d.gyldighet.niva === 'fylke' && d.gyldighet.fylke === innstillinger.fylke);
  const synlige = (o: Lovoversikt) => [...nasjonale(o), ...lokale(o)];
  const alle = async () => {
    if (typeof data === 'string') return [];
    return (await Promise.all(synlige(data).map((d) => lastDokument(d.id)))).filter((d): d is Lovdokument => d !== null);
  };
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('lov.tittel')}</h1>
      <p class="dempet">
        {t('lov.innledning')} <a href="#/begreper/lov">{t('lov.omBegrep.lov')}</a>
      </p>
      {typeof data === 'string' ? (
        <Lasting feil={data === 'feil'} provIgjen={provIgjen} />
      ) : (
        <Sok etikett={t('lov.sokAlle')} dokumenter={alle} visDokument>
          <Gruppe tittel={t('lov.lover')} dokumenter={nasjonale(data).filter((d) => d.type === 'lov')} />
          <Gruppe tittel={t('lov.forskrifter')} dokumenter={nasjonale(data).filter((d) => d.type === 'forskrift')} />
          {fylke ? (
            lokale(data).length > 0 ? (
              <Gruppe tittel={t('lov.lokale', { fylke })} dokumenter={lokale(data)} />
            ) : (
              <>
                <h2 class="liten-overskrift">{t('lov.lokale', { fylke })}</h2>
                <p class="dempet">{t('lov.ingenLokale', { fylke })}</p>
              </>
            )
          ) : (
            <>
              <h2 class="liten-overskrift">{t('lov.lokaleUtenFylke')}</h2>
              <p class="dempet">
                {t('lov.velgFylke')} <a href="#/innstillinger">{t('lov.velgFylkeLenke')}</a>
              </p>
            </>
          )}
        </Sok>
      )}
      <TilToppen />
      {typeof data !== 'string' && <Kildeliste kilder={synlige(data).map((d) => ({ id: d.kilde }))} />}
    </div>
  );
}
