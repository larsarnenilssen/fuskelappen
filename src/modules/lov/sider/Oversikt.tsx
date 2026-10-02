// Lov og forskrift (avgjørelse 039): søket i alle dokumentene øverst, og så dokumentene. Fylkes- og skoleinnhold vises
// bare når brukeren har valgt fylket.
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { TilToppen } from '../../../components/TilToppen.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { dokumentRute, lastDokument, lastOversikt, utvalgstekst } from '../data.ts';
import type { Lovdokument, Lovoversikt } from '../typer.ts';
import { Lasting, Sok, useLast } from './felles.tsx';

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [data, provIgjen] = useLast(lastOversikt, 'oversikt');
  const synlige = (o: Lovoversikt) => o.dokumenter.filter((d) => d.gyldighet.niva === 'nasjonal' || d.gyldighet.fylke === innstillinger.fylke);
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
          <h2 class="liten-overskrift">{t('lov.dokumenter')}</h2>
          <ul class="liste">
            {synlige(data).map((d) => (
              <li key={d.id}>
                <a class="listelenke" href={`#${dokumentRute(d.id)}`}>
                  <span class="listelenke-tekst">
                    <span class="listelenke-tittel" lang={d.malform}>
                      {d.korttittel}
                    </span>
                    <span class="listelenke-under">
                      {[
                        d.type === 'lov' ? t('lov.lov') : t('lov.forskrift'),
                        t('lov.fastsatt', { malform: t(`lov.malform.${d.malform}`) }).toLowerCase(),
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
        </Sok>
      )}
      <TilToppen />
      {typeof data !== 'string' && <Kildeliste kilder={synlige(data).map((d) => ({ id: d.kilde }))} />}
    </div>
  );
}
