// Regelverk (avgjørelse 039): søket i alle dokumentene øverst, og så dokumentene i grupper som kan legges sammen:
// lover, forskrifter, lokale forskrifter og avtaler (eier 02.10.2026). Lokale forskrifter vises bare når brukeren har
// valgt fylket, og skolens egne regler bare når skolen er valgt, merket «Skolen din» (avgjørelse 061). Alle dokumentene
// har dato for ikrafttredelse og siste endring (eier 05.10.2026).
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { usePrivatskole, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { PRIVATSKOLEDOKUMENTER } from '../../../core/privatskole.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { formaterDato, formaterTall } from '../../../core/i18n/tekst.ts';
import { avtaler, avtaleSomDokument, lastBestemmelser } from '../avtaler.ts';
import { dokumentnavn, dokumentRute, lastDokument, lastOversikt, utvalgstekst } from '../data.ts';
import type { Lokaltype, Lovdokument, Lovoversikt } from '../typer.ts';
import { Lasting, Sok, useLast } from './felles.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

type Dokumentinfo = Lovoversikt['dokumenter'][number];

interface Rad {
  id: string;
  tittel: string;
  under: string;
  lang?: 'nb' | 'nn';
  merke?: string;
}

/** Rekkefølgen på de lokale forskriftene: fylkets regler først, så skolens, inntak og skolerute. */
const LOKAL_REKKEFOLGE: Lokaltype[] = ['skoleregler', 'skoleregler-voksne', 'skoleregler-skole', 'inntak', 'skolerute', 'skyss', 'fagfordeling'];

/**
 * En gruppe dokumenter i en rubrikk som kan legges sammen, med antallet til høyre. Lukket fra start, på mobil og
 * skrivebord, så oversikten viser gruppene (eier 06.10.2026). Det som er åpnet, huskes for siden.
 */
function Gruppe({ nokkel, tittel, rader, children }: { nokkel: string; tittel: string; rader: readonly Rad[]; children?: preact.ComponentChildren }) {
  return (
    <Rubrikk nokkel={`lov-gruppe-${nokkel}`} tittel={tittel} lukket hoyre={rader.length > 0 ? formaterTall(rader.length) : null}>
      {rader.length > 0 && (
        <ul class="liste">
          {rader.map((r) => (
            <li key={r.id}>
              <a class="listelenke" href={`#${dokumentRute(r.id)}`}>
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel" lang={r.lang}>
                    {r.tittel}
                    {r.merke && <span class="merke merke-skole">{r.merke}</span>}
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
  const privatskole = usePrivatskole();
  const nasjonale = (o: Lovoversikt) => o.dokumenter.filter((d) => d.gyldighet.niva === 'nasjonal');
  // Privatskolelova og forskriften (avgjørelse 075): med «Privatskole» valgt står de først blant lovene og
  // forskriftene, merket «Privatskole». Ellers står de i en egen gruppe, lukket som de andre.
  const erPrivat = (d: Dokumentinfo) => PRIVATSKOLEDOKUMENTER.has(d.id);
  const avType = (o: Lovoversikt, type: string) => {
    const alle = nasjonale(o).filter((d) => d.type === type);
    return privatskole ? [...alle.filter(erPrivat), ...alle.filter((d) => !erPrivat(d))] : alle.filter((d) => !erPrivat(d));
  };
  const skole = innstillinger.skole?.id ?? null;
  const lokale = (o: Lovoversikt) =>
    o.dokumenter
      .filter((d) => (d.gyldighet.niva === 'fylke' && d.gyldighet.fylke === innstillinger.fylke) || (d.gyldighet.niva === 'skole' && skole !== null && d.gyldighet.skoler.includes(skole)))
      .sort((a, b) => (a.lokaltype ? LOKAL_REKKEFOLGE.indexOf(a.lokaltype) : 9) - (b.lokaltype ? LOKAL_REKKEFOLGE.indexOf(b.lokaltype) : 9));
  const synlige = (o: Lovoversikt) => [...nasjonale(o), ...lokale(o)];
  const alle = async () => {
    if (typeof data === 'string') return [];
    const [dokumenter, bestemmelser] = await Promise.all([Promise.all(synlige(data).map((d) => lastDokument(d.id))), lastBestemmelser()]);
    return [...dokumenter.filter((d): d is Lovdokument => d !== null), ...synligAvtale.map((a) => avtaleSomDokument(a, bestemmelser, malform))];
  };
  const dato = (iso: string) => formaterDato(iso, malform);
  const rad = (d: Dokumentinfo): Rad => ({
    id: d.id,
    tittel: dokumentnavn(d, malform),
    ...(d.korttittelNn ? {} : { lang: d.malform }),
    ...(d.gyldighet.niva === 'skole' ? { merke: t('lov.skolenDin') } : privatskole && erPrivat(d) ? { merke: t('lov.privatskoleMerke') } : {}),
    under: [
      ...(d.iKraft && d.iKraftTil ? [t('lov.iKraftPeriode', { fra: dato(d.iKraft), til: dato(d.iKraftTil) })] : d.iKraft ? [t('lov.iKraft', { dato: dato(d.iKraft) })] : []),
      ...(d.sistEndret && d.sistEndret !== d.iKraft ? [t('lov.endret', { dato: dato(d.sistEndret) })] : []),
      t(`lov.malform.${d.malform}`),
      d.utvalg ? t('lov.kapitler', { liste: utvalgstekst(d.utvalg, t('lov.og')) }) : t('lov.heleTeksten'),
      t('lov.antallParagrafer', { antall: formaterTall(d.antallParagrafer) }),
    ].join(' · '),
  });
  return (
    <div class="side">
      <Sidetopp tittel={t('lov.tittel')} favoritt={oversiktsid('lov')} />
      <p class="dempet">
        <Begrepstekst tekst={t('lov.innledning')} />
      </p>
      {typeof data === 'string' ? (
        <Lasting feil={data === 'feil'} provIgjen={provIgjen} />
      ) : (
        <Sok etikett={t('lov.sokAlle')} dokumenter={alle} visDokument>
          <Gruppe nokkel="lover" tittel={t('lov.lover')} rader={avType(data, 'lov').map(rad)} />
          <Gruppe nokkel="forskrifter" tittel={t('lov.forskrifter')} rader={avType(data, 'forskrift').map(rad)} />
          <Gruppe nokkel="lokale" tittel={fylke ? t('lov.lokale', { fylke }) : t('lov.lokaleUtenFylke')} rader={fylke ? lokale(data).map(rad) : []}>
            {!fylke ? (
              <p class="dempet">
                {t('lov.velgFylke')} <a href="#/innstillinger">{t('lov.velgFylkeLenke')}</a>
              </p>
            ) : (
              lokale(data).length === 0 && <p class="dempet">{t('lov.ingenLokale', { fylke })}</p>
            )}
            {privatskole && <p class="dempet">{t('lov.privatskoleSkoleregler')}</p>}
          </Gruppe>
          {!privatskole && nasjonale(data).some(erPrivat) && (
            <Gruppe nokkel="privatskoler" tittel={t('lov.privatskoler')} rader={nasjonale(data).filter(erPrivat).map(rad)}>
              <p class="dempet liten">{t('lov.privatskoleHjelp')}</p>
            </Gruppe>
          )}
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
    </div>
  );
}
