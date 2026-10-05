// Ett dokument i Lov og forskrift (avgjørelse 039), som overordnet del (avgjørelse 037, «Én side»): søket øverst, så
// kapitlene i rubrikker som er lukket, med paragrafene inni som lukkede bokser. Delene («Tredje del – …») står som
// overskrifter mellom rubrikkene, og avsnitt inni et kapittel som mellomoverskrifter. En adresse til en paragraf
// (#/lov/opplaeringslova/11-1) åpner kapitlet og paragrafen og ruller dit. Teksten vises uendret, på målformen den er
// fastsatt på.
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { formaterDato, formaterTall } from '../../../core/i18n/tekst.ts';
import type { SideProps } from '../../typer.ts';
import { dokumentnavn, finnParagraf, kildeFor, lastDokument, lovdataUrl, utvalgstekst } from '../data.ts';
import { alleParagrafer, type Lovdokument, type Seksjon } from '../typer.ts';
import { finnAvtale } from '../avtaler.ts';
import { Avtale } from './Avtale.tsx';
import { Lasting, Paragrafboks, Sok, Tekst, useLast, useRullTil } from './felles.tsx';

/** Et kapittel eller avsnitt: merknadene under overskriften, avsnittene inni og paragrafene. */
function Innhold({ dokument, seksjon, apne }: { dokument: Lovdokument; seksjon: Seksjon; apne: ReadonlySet<string> }) {
  return (
    <div lang={dokument.malform}>
      {seksjon.merknader.map((m, i) => (
        <p key={i} class="liten dempet">
          <Tekst tekst={m} />
        </p>
      ))}
      {seksjon.paragrafer.map((p) => (
        <Paragrafboks key={p.nr} dokument={dokument} paragraf={p} apen={apne.has(p.nr)} />
      ))}
      {seksjon.seksjoner.map((s) => (
        <div key={s.id} class="lov-avsnitt">
          <h3 class="lov-avsnitt-tittel">{s.overskrift}</h3>
          <Innhold dokument={dokument} seksjon={s} apne={apne} />
        </div>
      ))}
    </div>
  );
}

/** Delene som overskrifter, og kapitlene (og avsnitt utenfor kapitler) som rubrikker. */
function Seksjoner({ dokument, seksjoner, apne }: { dokument: Lovdokument; seksjoner: readonly Seksjon[]; apne: ReadonlySet<string> }) {
  return (
    <>
      {seksjoner.map((s) =>
        s.type === 'del' ? (
          <div key={s.id} class="lov-del">
            <h2 class="lov-del-tittel" lang={dokument.malform}>
              {s.overskrift}
            </h2>
            <Seksjoner dokument={dokument} seksjoner={s.seksjoner} apne={apne} />
          </div>
        ) : (
          <Rubrikk
            key={s.id}
            nokkel={`lov-${dokument.id}-${s.id}`}
            tittel={s.overskrift}
            hoyre={formaterTall(alleParagrafer([s]).length)}
            lukket={!alleParagrafer([s]).some(({ paragraf }) => apne.has(paragraf.nr))}
          >
            <Innhold dokument={dokument} seksjon={s} apne={apne} />
          </Rubrikk>
        ),
      )}
    </>
  );
}

function Lovside({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const id = parametre.dokument ?? '';
  const [data, provIgjen] = useLast(() => lastDokument(id), id);
  const nokkel = parametre.paragraf ?? null;
  const mal = data && typeof data !== 'string' && nokkel ? finnParagraf(data, nokkel) : null;
  useRullTil(mal ? `lov-${mal.paragraf.nr}` : null);
  if (data === null) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('lov.tittel')}</h1>
        <p class="merknad" role="alert">
          {t('lov.ikkeFunnet')} <a href="#/lov">{t('lov.tittel')}</a>
        </p>
      </div>
    );
  }
  const apne = new Set(mal ? [mal.paragraf.nr] : []);
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('lov.tittel'), href: '#/lov' }]} />
      {typeof data === 'string' ? (
        <>
          <h1 tabIndex={-1}>{t('lov.tittel')}</h1>
          <Lasting feil={data === 'feil'} provIgjen={provIgjen} />
        </>
      ) : (
        <>
          <Sidetopp tittel={dokumentnavn(data, malform)} {...(data.korttittelNn ? {} : { lang: data.malform })} favoritt={`lov:${data.id}`} />
          <p class="dempet">
            <span lang={data.malform}>{data.tittel}</span>. {t('lov.fastsatt', { malform: t(`lov.malform.${data.malform}`) })}.{' '}
            {data.utvalg ? t('lov.utvalgEnkel', { liste: t('lov.kapitler', { liste: utvalgstekst(data.utvalg, t('lov.og')) }) }) : t('lov.heleDokumentet')}
            {data.gyldighet.niva === 'fylke' && ` ${t('lov.gjelderFylke', { fylke: fylkesnavn(data.gyldighet.fylke) ?? data.gyldighet.fylke })}`}
            {data.gyldighet.niva === 'skole' && ` ${t('lov.gjelderSkole')}`}
            {data.iKraft && ` ${data.iKraftTil ? `${t('lov.iKraftPeriode', { fra: formaterDato(data.iKraft, malform), til: formaterDato(data.iKraftTil, malform) })}.` : t('lov.iKraftSetning', { dato: formaterDato(data.iKraft, malform) })}`}
          </p>
          {nokkel && !mal && (
            <p class="merknad" role="alert">
              {t('lov.paragrafIkkeFunnet', { paragraf: `§ ${nokkel}`, navn: dokumentnavn(data, malform) })}{' '}
              <a class="ekstern-lenke" href={lovdataUrl(data.refid, nokkel.replace(/^§\s*/, ''))} target="_blank" rel="noopener noreferrer">
                {t('lov.lovdata')}
                <Ikon navn="ekstern" class="ikon-liten" />
              </a>
            </p>
          )}
          <Sok etikett={t('lov.sok', { navn: dokumentnavn(data, malform) })} dokumenter={() => Promise.resolve([data])} visDokument={false}>
            <Seksjoner dokument={data} seksjoner={data.seksjoner} apne={apne} />
          </Sok>
          <p class="liten dempet">
            {t('lov.hentet', { dato: formaterDato(data.hentet, malform) })}
            {data.sistEndret && ` ${t('lov.sistEndret', { dato: formaterDato(data.sistEndret, malform) })}`}{' '}
            <a class="ekstern-lenke" href={lovdataUrl(data.refid)} target="_blank" rel="noopener noreferrer">
              {t('lov.lovdata')}
              <Ikon navn="ekstern" class="ikon-liten" />
            </a>
          </p>
          <Kildeliste kilder={[kildeFor(data)]} />
        </>
      )}
    </div>
  );
}

/** En lov eller forskrift fra Lovdata, eller en avtale med egne ord (avtaler.ts). Adressene har samme form. */
export default function Dokument(props: SideProps) {
  const avtale = finnAvtale(props.parametre.dokument ?? '');
  return avtale ? <Avtale key={avtale.id} avtale={avtale} nokkel={props.parametre.paragraf ?? null} /> : <Lovside {...props} />;
}
