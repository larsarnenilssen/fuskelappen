// Regelverk (avgjørelse 039): søket i alle dokumentene øverst, og så dokumentene i grupper som kan legges sammen:
// lover, forskrifter, lokale forskrifter og avtaler (eier 02.10.2026). Lokale forskrifter vises bare når brukeren har
// valgt fylket.
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { avtaler, avtaleSomDokument, lastBestemmelser } from '../avtaler.ts';
import { dokumentRute, lastDokument, lastOversikt, utvalgstekst } from '../data.ts';
import type { Lovdokument, Lovoversikt } from '../typer.ts';
import { Lasting, Sok, useLast } from './felles.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

type Dokumentinfo = Lovoversikt['dokumenter'][number];

interface Rad {
  id: string;
  tittel: string;
  under: string;
  lang?: 'nb' | 'nn';
}

/** En gruppe dokumenter i en rubrikk som kan legges sammen, med antallet til høyre. Åpen fra start. */
function Gruppe({ nokkel, tittel, rader, children }: { nokkel: string; tittel: string; rader: readonly Rad[]; children?: preact.ComponentChildren }) {
  return (
    <Rubrikk nokkel={`lov-gruppe-${nokkel}`} tittel={tittel} hoyre={rader.length > 0 ? formaterTall(rader.length) : null}>
      {rader.length > 0 && (
        <ul class="liste">
          {rader.map((r) => (
            <li key={r.id}>
              <a class="listelenke" href={`#${dokumentRute(r.id)}`}>
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel" lang={r.lang}>
                    {r.tittel}
                  </span>
                  <span class="listelenke-under">{r.under}</span>
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
    </Rubrikk>
  );
}

export default function Oversikt() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [data, provIgjen] = useLast(lastOversikt, 'oversikt');
  const fylke = fylkesnavn(innstillinger.fylke);
  const synligAvtale = avtaler.filter((a) => a.gyldighet.niva === 'nasjonal' || a.gyldighet.fylke === innstillinger.fylke);
  const nasjonale = (o: Lovoversikt) => o.dokumenter.filter((d) => d.gyldighet.niva === 'nasjonal');
  const lokale = (o: Lovoversikt) => o.dokumenter.filter((d) => d.gyldighet.niva === 'fylke' && d.gyldighet.fylke === innstillinger.fylke);
  const synlige = (o: Lovoversikt) => [...nasjonale(o), ...lokale(o)];
  const alle = async () => {
    if (typeof data === 'string') return [];
    const [dokumenter, bestemmelser] = await Promise.all([Promise.all(synlige(data).map((d) => lastDokument(d.id))), lastBestemmelser()]);
    return [...dokumenter.filter((d): d is Lovdokument => d !== null), ...synligAvtale.map((a) => avtaleSomDokument(a, bestemmelser, malform))];
  };
  const rad = (d: Dokumentinfo): Rad => ({
    id: d.id,
    tittel: d.korttittel,
    lang: d.malform,
    under: [
      t('lov.fastsatt', { malform: t(`lov.malform.${d.malform}`) }),
      d.utvalg ? t('lov.kapitler', { liste: utvalgstekst(d.utvalg, t('lov.og')) }) : t('lov.heleTeksten'),
      t('lov.antallParagrafer', { antall: formaterTall(d.antallParagrafer) }),
    ].join(' · '),
  });
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('lov.tittel')}</h1>
      <p class="dempet">
        <Begrepstekst tekst={t('lov.innledning')} />
      </p>
      {typeof data === 'string' ? (
        <Lasting feil={data === 'feil'} provIgjen={provIgjen} />
      ) : (
        <Sok etikett={t('lov.sokAlle')} dokumenter={alle} visDokument>
          <Gruppe nokkel="lover" tittel={t('lov.lover')} rader={nasjonale(data).filter((d) => d.type === 'lov').map(rad)} />
          <Gruppe nokkel="forskrifter" tittel={t('lov.forskrifter')} rader={nasjonale(data).filter((d) => d.type === 'forskrift').map(rad)} />
          <Gruppe nokkel="lokale" tittel={fylke ? t('lov.lokale', { fylke }) : t('lov.lokaleUtenFylke')} rader={fylke ? lokale(data).map(rad) : []}>
            {!fylke ? (
              <p class="dempet">
                {t('lov.velgFylke')} <a href="#/innstillinger">{t('lov.velgFylkeLenke')}</a>
              </p>
            ) : (
              lokale(data).length === 0 && <p class="dempet">{t('lov.ingenLokale', { fylke })}</p>
            )}
          </Gruppe>
          <Gruppe
            nokkel="avtaler"
            tittel={t('lov.avtaler')}
            rader={synligAvtale.map((a) => ({
              id: a.id,
              tittel: a.korttittel[malform],
              under: [t('lov.egneOrd'), t('lov.antallBestemmelser', { antall: formaterTall(a.kapitler.reduce((s, k) => s + k.elementer.length, 0)) })].join(' · '),
            }))}
          />
        </Sok>
      )}
      {typeof data !== 'string' && <Kildeliste kilder={[...synlige(data).map((d) => ({ id: d.kilde })), ...synligAvtale.map((a) => ({ id: a.kilde }))]} />}
    </div>
  );
}
