// Skoleregler (fase 7): reglene i loven om skoleregler, bortvisning og pålagt skolebytte (nasjonalt), paragrafene om
// reaksjoner, saksbehandling og klage i skolereglene for fylket brukeren har valgt (fylkesinnhold), og skolens egne
// regler når de står i Lovdata (skoleinnhold). For privatskoler gjelder privatskolelova § 5A-7 i stedet for fylkets
// skoleregler (avgjørelse 075). To kolonner på skrivebord (avgjørelse 074).
import { useEffect, useState } from 'preact/hooks';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { usePrivatskole, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Kortfot } from '../../../components/Kortfot.tsx';
import { Paragraflenker } from '../../../components/Paragraflenker.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { dokumentnavn, dokumentRute, lastOversikt } from '../../lov/data.ts';
import type { Lovoversikt } from '../../lov/typer.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { type Forklaringselement, hentInnhold, medPrefiks, veiviserRute } from '../innhold.ts';
// Stilene lastes med siden, ikke i startpakken.
import '../../../styles/skolemiljo.css';

type Dokumentinfo = Lovoversikt['dokumenter'][number];

/** Skolereglene i fylket: paragrafene om reaksjoner, saksbehandling og klage, åpne, med lenke til hele forskriften. */
function Fylkesboks({ element, dokumenter }: { element: Forklaringselement; dokumenter: readonly Dokumentinfo[] }) {
  const { t, malform } = useTekst();
  const paragrafer = element.paragrafer ?? [];
  const dokument = paragrafer[0]?.split('/')[0];
  const fylke = element.gyldighet.niva === 'nasjonal' ? null : element.gyldighet.fylke;
  // Skolereglene for voksne i samme fylke, når fylket har egne (avgjørelse 061).
  const voksne = dokumenter.find((d) => d.lokaltype === 'skoleregler-voksne' && d.gyldighet.niva === 'fylke' && d.gyldighet.fylke === fylke);
  return (
    <div class="sr-boks">
      <h3 class="sr-boks-tittel">{element.tittel[malform]}</h3>
      <div class="brodtekst" dangerouslySetInnerHTML={{ __html: element.tekst[malform] }} />
      <Paragraflenker paragrafer={paragrafer} overskrift={element.tittel[malform]} utenOverskrift />
      <ul class="sr-lenker">
        {dokument && (
          <li>
            <a href={`#${dokumentRute(dokument)}`}>{t('skolemiljo.skoleregler.lesHele')}</a>
          </li>
        )}
        {voksne && (
          <li>
            <a href={`#${dokumentRute(voksne.id)}`}>{t('skolemiljo.skoleregler.voksne', { fylke: fylkesnavn(fylke) ?? '' })}</a>
          </li>
        )}
      </ul>
      <Kortfot kilder={element.kilder} nokkel={element.id} />
    </div>
  );
}

export default function Skoleregler() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const privat = usePrivatskole();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  const [oversikt, settOversikt] = useState<Lovoversikt | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
    lastOversikt().then(settOversikt, () => settOversikt(null));
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const fylke = fylkesnavn(innstillinger.fylke);
  const skole = innstillinger.skole;
  const alle = innhold ?? [];
  const loven = medPrefiks(alle, 'sr-loven-');
  const iFylket = velgSynlige(medPrefiks(alle, 'sr-fylke-'), sted).filter((e) => e.gyldighet.niva !== 'nasjonal');
  const dokumenter = oversikt?.dokumenter ?? [];
  const skolens = skole?.id ? dokumenter.filter((d) => d.gyldighet.niva === 'skole' && d.gyldighet.skoler.includes(skole.id ?? '')) : [];
  const kilder = [...loven, ...iFylket].flatMap((e) => e.kilder);

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('skolemiljo.tittel'), href: '#/skolemiljo' }]} />
      <Sidetopp tittel={t('skolemiljo.skoleregler.tittel')} favoritt="skolemiljo:skoleregler" />
      <p class="ingress">{t('skolemiljo.skoleregler.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <ToKolonner
          hoved={
            <section>
              <h2 class="liten-overskrift">{t('skolemiljo.skoleregler.iLoven')}</h2>
              {loven.map((e) => (
                <Innholdskort key={e.id} element={e} />
              ))}
            </section>
          }
          side={
            <>
              <section>
                <h2 class="liten-overskrift">{fylke ? t('skolemiljo.skoleregler.iFylket', { fylke }) : t('skolemiljo.skoleregler.iFylketUten')}</h2>
                {privat ? (
                  // Fylkets skoleregler gjelder ikke for privatskoler (privatskolelova § 5A-7).
                  <p class="privatskolemerknad">
                    <span class="privatskolemerknad-topp">
                      <Ikon navn="skole" class="ikon-liten" />
                      {t('komponenter.privatskole.tittel')}
                    </span>
                    {t('lov.privatskoleSkoleregler')}
                  </p>
                ) : !fylke ? (
                  <p class="dempet">
                    {t('skolemiljo.skoleregler.velgFylke')} <a href="#/innstillinger">{t('skolemiljo.skoleregler.velgFylkeLenke')}</a>
                  </p>
                ) : iFylket.length === 0 ? (
                  <p class="dempet">{t('skolemiljo.skoleregler.ingenFylke', { fylke })}</p>
                ) : (
                  iFylket.map((e) => <Fylkesboks key={e.id} element={e} dokumenter={dokumenter} />)
                )}
              </section>
              {!privat && (
                <section>
                  <h2 class="liten-overskrift">{t('skolemiljo.skoleregler.skolensRegler')}</h2>
                  {!skole ? (
                    <p class="dempet">{t('skolemiljo.skoleregler.velgSkole')}</p>
                  ) : skolens.length === 0 ? (
                    <p class="dempet">{t('skolemiljo.skoleregler.skolenHarIkke', { skole: skole.navn })}</p>
                  ) : (
                    <ul class="liste">
                      {skolens.map((d) => (
                        <li key={d.id}>
                          <a class="listelenke" href={`#${dokumentRute(d.id)}`}>
                            <span class="listelenke-tekst">
                              <span class="listelenke-tittel">{dokumentnavn(d, malform)}</span>
                              <span class="listelenke-under">{t('skolemiljo.skoleregler.skolensReglerTekst')}</span>
                            </span>
                            <Ikon navn="hoyre" class="ikon-liten" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              <section>
                <h2 class="liten-overskrift">{t('skolemiljo.skoleregler.videre')}</h2>
                <ul class="vu-videre">
                  <li>
                    <Inngang rute={veiviserRute('aktivitetsplikten')} ikon="veiviser" tittel={t('skolemiljo.skoleregler.aktivitetsplikten')} tekst={t('skolemiljo.skoleregler.aktivitetspliktenTekst')} />
                  </li>
                  <li>
                    <Inngang rute="/vurdering/orden-og-oppforsel" ikon="person" tittel={t('skolemiljo.skoleregler.ordenOgOppforsel')} tekst={t('skolemiljo.skoleregler.ordenOgOppforselTekst')} />
                  </li>
                  {innstillinger.fylke && (
                    <li>
                      <Inngang rute={`/fylker/${innstillinger.fylke}`} ikon="sted" tittel={t('skolemiljo.skoleregler.alleForskrifter')} tekst={t('skolemiljo.skoleregler.alleForskrifterTekst')} />
                    </li>
                  )}
                </ul>
              </section>
              <Kildeboks kilder={kilder} nokkel="skoleregler" />
            </>
          }
        />
      )}
    </div>
  );
}
