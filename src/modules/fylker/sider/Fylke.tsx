// Siden for ett fylke (avgjørelse 061, eier 05.10.2026): lenkene til fylkets egne sider per tema, de lokale
// forskriftene fra Lovdata (fylkets og skolenes egne), skolene og opplæringskontorene i fylket, og kalenderne og
// klagen. Skolenes regler merkes «Skolen din» når brukeren har valgt skolen. Lenkene til fylkets sider står lukket til
// brukeren åpner dem (eier 05.10.2026).
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Ikon, type Ikonnavn } from '../../../components/Ikon.tsx';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { fylketemaer } from '../../../core/innhold/skjema.ts';
import { formaterDato, formaterTall } from '../../../core/i18n/tekst.ts';
import { dokumentnavn, dokumentRute, lastOversikt } from '../../lov/data.ts';
import type { Lokaltype, Lovoversikt } from '../../lov/typer.ts';
import { useLast } from '../../lov/sider/felles.tsx';
import type { SideProps } from '../../typer.ts';
import { fylkeFor, nettsted } from '../innhold.ts';
import { kalenderLenke } from '../../kalender/adresse.ts';

const REKKEFOLGE: Lokaltype[] = ['skoleregler', 'skoleregler-voksne', 'inntak', 'skolerute', 'skyss'];

function Lenkerad({ href, tittel, under, ikon, ekstern = false, merke }: { href: string; tittel: string; under?: string; ikon?: Ikonnavn; ekstern?: boolean; merke?: string }) {
  return (
    <li>
      <a class="listelenke" href={href} {...(ekstern ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {ikon && <Ikon navn={ikon} />}
        <span class="listelenke-tekst">
          <span class="listelenke-tittel">
            {tittel}
            {merke && <span class="merke merke-skole">{merke}</span>}
          </span>
          {under && <span class="listelenke-under">{under}</span>}
        </span>
        <Ikon navn={ekstern ? 'ekstern' : 'hoyre'} class="ikon-liten" />
      </a>
    </li>
  );
}

export default function Fylke({ parametre, sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const nr = parametre.fylke ?? '';
  const fylke = fylkeFor(nr);
  const [oversikt] = useLast(lastOversikt, 'oversikt');
  if (!fylke) {
    return (
      <div class="side">
        <Brodsmuler ledd={[{ tekst: t('fylker.tittel'), href: '#/fylker' }]} />
        <h1 tabIndex={-1}>{t('fylker.tittel')}</h1>
        <p class="merknad">{t('fylker.ukjent')}</p>
      </div>
    );
  }
  const kort = fylke.navn.replace(/ (fylkeskommune|kommune)$/, '');
  const temaer = fylketemaer.filter((tema) => fylke.lenker[tema]);
  const dokumenter: Lovoversikt['dokumenter'] = typeof oversikt === 'string' ? [] : oversikt.dokumenter;
  const iKraft = (d: Lovoversikt['dokumenter'][number]) => (d.iKraft ? t('lov.iKraft', { dato: formaterDato(d.iKraft, malform) }) : t(`lov.malform.${d.malform}`));
  const fylkets = dokumenter
    .filter((d) => d.gyldighet.niva === 'fylke' && d.gyldighet.fylke === nr)
    .sort((a, b) => (a.lokaltype ? REKKEFOLGE.indexOf(a.lokaltype) : 9) - (b.lokaltype ? REKKEFOLGE.indexOf(b.lokaltype) : 9));
  const skolenes = dokumenter.filter((d) => d.gyldighet.niva === 'skole' && d.gyldighet.fylke === nr).sort((a, b) => dokumentnavn(a, malform).localeCompare(dokumentnavn(b, malform), 'nb'));
  const minSkole = innstillinger.skole?.id ?? null;
  // Skolens egne regler står rett under fylkets, og de andre skolenes i en lukket gruppe (eier 05.10.2026).
  const erMin = (d: Lovoversikt['dokumenter'][number]) => minSkole !== null && d.gyldighet.niva === 'skole' && d.gyldighet.skoler.includes(minSkole);
  const mine = skolenes.filter(erMin);
  const andre = skolenes.filter((d) => !erMin(d));
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('fylker.tittel'), href: '#/fylker' }]} />
      <Sidetopp tittel={fylke.navn} favoritt={`fylker:${nr}`} />
      <p class="ingress">{t('fylker.fylkeInnledning')}</p>
      {/* Lukket fra start, men åpen når brukeren kommer fra kalenderen for å lese mer hos fylket (eier 05.10.2026). */}
      <Rubrikk nokkel="fylke-lenker" tittel={t('fylker.hosFylket')} hoyre={formaterTall(temaer.length)} lukket={sporring.get('apne') !== 'fylket'}>
        {temaer.length === 0 ? (
          <p class="dempet">{t('fylker.ingenLenker')}</p>
        ) : (
          <ul class="liste">
            {temaer.map((tema) => {
              const l = fylke.lenker[tema];
              return l ? <Lenkerad key={tema} href={l.url} ekstern tittel={t(`fylker.temaer.${tema}`)} under={nettsted(l.url)} /> : null;
            })}
          </ul>
        )}
      </Rubrikk>
      <Rubrikk nokkel="fylke-lokale" tittel={t('fylker.lokale')} hoyre={fylkets.length + skolenes.length > 0 ? formaterTall(fylkets.length + skolenes.length) : null}>
        {fylkets.length + skolenes.length === 0 ? (
          <p class="dempet">{t('fylker.ingenLokale')}</p>
        ) : (
          <>
            {fylkets.length + mine.length > 0 && (
              <ul class="liste">
                {fylkets.map((d) => (
                  <Lenkerad key={d.id} href={`#${dokumentRute(d.id)}`} tittel={dokumentnavn(d, malform)} under={iKraft(d)} />
                ))}
                {mine.map((d) => (
                  <Lenkerad key={d.id} href={`#${dokumentRute(d.id)}`} tittel={dokumentnavn(d, malform)} under={iKraft(d)} merke={t('lov.skolenDin')} />
                ))}
              </ul>
            )}
            {andre.length > 0 && (
              <details class="veiviser-kilder fylke-skolegruppe">
                <summary class="forklaring-knapp">
                  <Ikon navn="skole" />
                  <span>{t('fylker.skolenesReglerAntall', { antall: formaterTall(andre.length) })}</span>
                  <Ikon navn="ned" class="forklaring-pil" />
                </summary>
                <ul class="liste">
                  {andre.map((d) => (
                    <Lenkerad key={d.id} href={`#${dokumentRute(d.id)}`} tittel={dokumentnavn(d, malform)} under={iKraft(d)} />
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </Rubrikk>
      <Rubrikk nokkel="fylke-skoler" tittel={t('fylker.skolerOgKontor')}>
        <ul class="liste">
          <Lenkerad href={`#/opplaeringslop/skoler?fylke=${nr}`} ikon="skole" tittel={t('fylker.skoler', { fylke: kort })} under={t('fylker.skolerTekst')} />
          <Lenkerad href={`#/opplaeringslop/opplaeringskontor?fylke=${nr}`} ikon="kontor" tittel={t('fylker.kontor', { fylke: kort })} under={t('fylker.kontorTekst')} />
        </ul>
      </Rubrikk>
      <Rubrikk nokkel="fylke-datoer" tittel={t('fylker.datoer')}>
        <ul class="liste">
          <Lenkerad href={`#${kalenderLenke('inntak')}`} ikon="klokke" tittel={t('fylker.kalenderInntak')} under={t('fylker.kalenderInntakTekst')} />
          <Lenkerad href={`#${kalenderLenke('eksamen')}`} ikon="flagg" tittel={t('fylker.kalenderEksamen')} under={t('fylker.kalenderEksamenTekst')} />
          <Lenkerad href="#/vurdering/klage-pa-karakter" ikon="veiviser" tittel={t('fylker.klage')} under={t('fylker.klageTekst')} />
        </ul>
      </Rubrikk>
      <p class="liten dempet">{t('fylker.sjekket')}</p>
    </div>
  );
}
