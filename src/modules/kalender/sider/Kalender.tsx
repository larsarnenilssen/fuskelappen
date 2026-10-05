// Kalenderen (fase 6, pakke 5, avgjørelse 066): fristene og datoene fra alle modulene på en loddrett tidslinje, de neste
// tolv månedene eller et skoleår. Filteret på tema og hvem det gjelder står i en boks som er lukket fra start, og alle
// valgene står i adressen. Passerte datoer er dempet, og en strek viser i dag. På stor skjerm står tre eller fire
// deler av året side om side.
import { Fragment } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Bryter } from '../../../components/Bryter.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kortfot } from '../../../components/Kortfot.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { formaterDato, type Malform } from '../../../core/i18n/tekst.ts';
import { FRISTGRUPPER, KALENDERTEMAER, type Fristgruppe, type Kalendertema } from '../../../core/innhold/kalendertema.ts';
import { kortManed, manedsnavn } from '../../../core/tidslinje.ts';
import { iDag } from '../../../data/skolear.ts';
import { oversiktsid } from '../../favoritter.ts';
import type { SideProps } from '../../typer.ts';
import { EKSAMENSPLAN } from '../../vurdering/innhold.ts';
import { kalenderRute, lesValg, sporringFor, type Kalendervalg } from '../adresse.ts';
import {
  delInn,
  idagIndeks,
  pagar,
  passer,
  passert,
  perManed,
  rullendeVindu,
  skolearStart,
  skolearVindu,
  velgPoster,
  type Kalenderoppforing,
  type Kalenderpost,
} from '../beregning/kalender.ts';
import { harEksamensdatoer } from '../beregning/oppforinger.ts';
import { folgerVertskommunen, harSkolerute } from '../datakilder.ts';
import { ENDRINGER_REGJERINGEN, NYTT_UDIR } from '../oversikter.ts';
import { hentKalenderdata, samle, type Kalenderdata } from '../samle.ts';
import { finnLenker, type Kalenderlenke } from '../lenker.ts';
import { datocelle, datoLang, manedTittel, periodeTekst } from '../visning.ts';

/** Hvor mange deler av året som står side om side: tre fra 56rem, fire fra 80rem (eier 04.10.2026). */
function useDeler(): number {
  const beregn = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return 1;
    if (window.matchMedia('(min-width: 80rem)').matches) return 4;
    return window.matchMedia('(min-width: 56rem)').matches ? 3 : 1;
  };
  const [deler, settDeler] = useState(beregn);
  useEffect(() => {
    const lytt = () => settDeler(beregn());
    window.addEventListener('resize', lytt);
    return () => window.removeEventListener('resize', lytt);
  }, []);
  return deler;
}

const manedId = (maned: string) => `kal-${maned}`;

function tilManed(maned: string) {
  const overskrift = document.getElementById(manedId(maned));
  if (!overskrift) return;
  const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  overskrift.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'start' });
  overskrift.focus({ preventScroll: true });
}

export default function Kalender({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [valg, settValg] = useState<Kalendervalg>(() => lesValg(sporring));
  const [alt, settAlt] = useState<Kalenderdata | null>(null);
  const deler = useDeler();

  useEffect(() => {
    // En datafil som ikke kan lastes, gir null. Uten eksamensdatoene står eksamen med måneden.
    void hentKalenderdata().then(settAlt);
  }, []);
  const frister = alt?.frister ?? null;
  const data = alt?.eksamen ?? null;

  const endre = (ny: Partial<Kalendervalg>) => {
    const neste = { ...valg, ...ny };
    settValg(neste);
    erstattAdresse(kalenderRute, sporringFor(neste));
  };

  const idag = iDag();
  const fylke = innstillinger.fylke;
  const sted = { fylke, skole: innstillinger.skole?.id ?? null };
  const iAar = skolearStart(idag);
  const skolear = valg.aar !== null && valg.aar >= iAar && valg.aar <= iAar + 1 ? valg.aar : iAar;
  const vindu = valg.visning === 'rullende' ? rullendeVindu(idag) : skolearVindu(skolear);
  const filter = { tema: valg.tema, gruppe: valg.gruppe };

  const innhold = useMemo(() => (alt ? samle(alt, sted, vindu) : null), [alt, sted.fylke, sted.skole, vindu.fra, vindu.til]);
  const valgte = velgPoster(innhold?.poster ?? [], filter);
  const maneder = perManed(valgte, vindu);
  // Frister som gjelder hele året, og vedtatte endringer uten dato, står øverst når det er filtrert på tema.
  const hele: Kalenderoppforing[] = valg.tema ? (innhold?.heleAret ?? []).filter((o) => passer(o, filter)) : [];
  const udatert: Kalenderoppforing[] = valg.tema ? (innhold?.udatert ?? []).filter((o) => passer(o, filter)) : [];
  const skolerute = harSkolerute(alt?.skolerute ?? null, fylke) && (valg.tema === null || valg.tema === 'skolerute');
  const fylkenavn = fylke ? (fylkesnavn(fylke) ?? fylke) : null;
  const ukjentEksamen = valg.visning === 'skolear' && data !== null && !harEksamensdatoer(data, skolear);

  const valgtekst = [
    valg.visning === 'rullende' ? t('kalender.visning.rullende') : t('kalender.visning.skolearAar', { aar: `${skolear}–${skolear + 1}` }),
    valg.tema ? t(`kalender.temaer.${valg.tema}`) : t('kalender.filter.alleTemaer'),
    valg.gruppe ? t(`kalender.grupper.${valg.gruppe}`) : t('kalender.filter.alleGrupper'),
  ].join(' · ');
  const antall = (n: number) => (n === 0 ? t('kalender.ingen') : n === 1 ? t('kalender.enDato') : t('kalender.flereDatoer', { antall: n }));

  return (
    <div class="side kalender">
      <Sidetopp tittel={t('kalender.tittel')} favoritt={oversiktsid('kalender')} />
      <p class="ingress">
        <Begrepstekst tekst={t('kalender.innledning')} />
      </p>

      {/* Visningen, skoleåret og filtrene står i én boks som er lukket fra start. Overskriften viser alle valgene, så
          brukeren ser hva som er aktivt uten å åpne den, og kalenderen begynner høyt oppe på siden (eier 05.10.2026). */}
      <details class="veiviser-kilder kal-filter">
        <summary class="forklaring-knapp">
          <Ikon navn="filter" />
          <span class="kal-valgt">{valgtekst}</span>
          <Ikon navn="ned" class="forklaring-pil" />
        </summary>
        {/* Tre grupper med overskrift og like avstander. På stor skjerm står de side om side (eier 05.10.2026). */}
        <div class="kal-filter-innhold">
          <div class="kal-filtergruppe">
            <h2 class="kal-filtertittel" id="kal-filter-vis">
              {t('kalender.visning.etikett')}
            </h2>
            <div class="kal-filtervalg">
              <Bryter
                legend={t('kalender.visning.etikett')}
                skjultLegend
                kompakt
                verdi={valg.visning}
                valg={[
                  { verdi: 'rullende', tekst: t('kalender.visning.rullende'), tekstKort: t('kalender.visning.rullendeKort') },
                  { verdi: 'skolear', tekst: t('kalender.visning.skolear') },
                ]}
                onEndring={(v) => endre({ visning: v })}
              />
              {valg.visning === 'skolear' && (
                <div class="sokefilter" role="group" aria-label={t('kalender.skolearEtikett')}>
                  {[iAar, iAar + 1].map((s) => (
                    <button key={s} type="button" class="sokefilter-valg" aria-pressed={skolear === s} onClick={() => endre({ aar: s === iAar ? null : s })}>
                      {s}–{s + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div class="kal-filtergruppe">
            <h2 class="kal-filtertittel" id="kal-filter-tema">
              {t('kalender.filter.tema')}
            </h2>
            <div class="sokefilter" role="group" aria-labelledby="kal-filter-tema">
              {[null, ...KALENDERTEMAER].map((tema: Kalendertema | null) => (
                <button key={tema ?? 'alle'} type="button" class="sokefilter-valg" aria-pressed={valg.tema === tema} onClick={() => endre({ tema })}>
                  {tema ? t(`kalender.temaer.${tema}`) : t('kalender.filter.alle')}
                </button>
              ))}
            </div>
          </div>
          <div class="kal-filtergruppe">
            <h2 class="kal-filtertittel" id="kal-filter-hvem">
              {t('kalender.filter.hvem')}
            </h2>
            <div class="sokefilter" role="group" aria-labelledby="kal-filter-hvem">
              {[null, ...FRISTGRUPPER].map((g: Fristgruppe | null) => (
                <button key={g ?? 'alle'} type="button" class="sokefilter-valg" aria-pressed={valg.gruppe === g} onClick={() => endre({ gruppe: g })}>
                  {g ? t(`kalender.grupper.${g}`) : t('kalender.filter.alle')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>

      {frister === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <section class="frist-aar" aria-labelledby="kal-aaret">
            <h2 id="kal-aaret" class="skjult-visuelt">
              {valg.visning === 'rullende' ? t('kalender.aaretRullende') : t('kalender.aaretSkolear', { aar: `${skolear}–${skolear + 1}` })}
            </h2>
            <ol class="frist-stripe">
              {maneder.map(({ maned, poster: liste }) => {
                const naa = maned === idag.slice(0, 7);
                const m = Number(maned.slice(5, 7));
                const innhold = (
                  <>
                    <span class="frist-stripe-navn" aria-hidden="true">
                      {kortManed(m, malform)}
                    </span>
                    <span class="frist-stripe-prikker" aria-hidden="true">
                      {liste.slice(0, 4).map((p) => (
                        <span key={p.nokkel} class="frist-prikk" data-tema={p.oppforing.tema[0]} />
                      ))}
                    </span>
                    <span class="skjult-visuelt">
                      {manedsnavn(m, malform)}: {antall(liste.length)}
                    </span>
                  </>
                );
                return (
                  <li key={maned} class={naa ? 'frist-stripe-naa' : undefined} aria-current={naa ? 'date' : undefined}>
                    {liste.length > 0 ? (
                      <button type="button" class={`frist-stripe-celle${maned < idag.slice(0, 7) ? ' kal-stripe-passert' : ''}`} onClick={() => tilManed(maned)}>
                        {innhold}
                      </button>
                    ) : (
                      <span class="frist-stripe-celle frist-stripe-tom">{innhold}</span>
                    )}
                  </li>
                );
              })}
            </ol>
            <p class="kal-tegn" aria-hidden="true">
              {KALENDERTEMAER.map((tema) => (
                <span key={tema}>
                  <span class="frist-prikk" data-tema={tema} />
                  {t(`kalender.temaer.${tema}`)}
                </span>
              ))}
            </p>
          </section>

          {ukjentEksamen && <p class="kal-merknad">{t('kalender.ikkeKjent', { aar: `${skolear}–${skolear + 1}` })}</p>}

          {/* Kort merknad på én linje om skoleruta, så tidslinjen kommer raskt (eier 05.10.2026). */}
          {skolerute && fylkenavn && (
            <p class="kal-notis">
              <Ikon navn="skole" class="ikon-liten" />
              <span>
                {t('kalender.skolerute.merknad', { fylke: fylkenavn })} {folgerVertskommunen(alt?.skolerute ?? null, fylke) && t('kalender.skolerute.vertskommune')}
              </span>
            </p>
          )}
          {valg.tema === 'skolerute' && fylkenavn && !harSkolerute(alt?.skolerute ?? null, fylke) && <p class="kal-merknad">{t('kalender.skolerute.ingen', { fylke: fylkenavn })}</p>}

          {udatert.length > 0 && (
            <section class="kal-hele">
              <h2 class="kal-maned-tittel">{t('kalender.regelverk.udatert')}</h2>
              <p class="liten dempet">{t('kalender.regelverk.udatertUnder')}</p>
              <ul class="kal-hele-liste">
                {udatert.map((o) => (
                  <li key={o.id}>
                    <Kort oppforing={o} tid={o.naar?.[malform] ?? ''} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hele.length > 0 && (
            <section class="kal-hele">
              <h2 class="kal-maned-tittel">{t('kalender.heleAret')}</h2>
              <p class="liten dempet">{t('kalender.heleAretUnder')}</p>
              <ul class="kal-hele-liste">
                {hele.map((o) => (
                  <li key={o.id}>
                    <Kort oppforing={o} tid={o.naar?.[malform] ?? ''} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {valgte.length === 0 && hele.length === 0 && udatert.length === 0 && <p class="dempet">{t('kalender.tomt')}</p>}

          <div class="kal-kolonner" data-deler={deler}>
            {delInn(maneder, deler).map((del, i) => (
              <div key={i} class="kal-kolonne">
                {del.map(({ maned, poster: liste }) => (
                  <Maned key={maned} maned={maned} poster={liste} idag={idag} />
                ))}
              </div>
            ))}
          </div>

          <p class="liten dempet kal-kilde">
            {t('kalender.kilde')} {data && t('kalender.hentet', { dato: formaterDato(data.hentet, malform) })}
          </p>
          <ul class="kal-kontroll liten">
            <li>
              <a class="ekstern-lenke" href={EKSAMENSPLAN} target="_blank" rel="noopener noreferrer">
                {t('kalender.eksamensplan')}
                <Ikon navn="ekstern" class="ikon-liten" />
              </a>
            </li>
            <li>
              <a class="ekstern-lenke" href={ENDRINGER_REGJERINGEN.url} target="_blank" rel="noopener noreferrer">
                {t('kalender.endringerRegjeringen')}
                <Ikon navn="ekstern" class="ikon-liten" />
              </a>
            </li>
            <li>
              <a class="ekstern-lenke" href={NYTT_UDIR.url} target="_blank" rel="noopener noreferrer">
                {t('kalender.nyttUdir')}
                <Ikon navn="ekstern" class="ikon-liten" />
              </a>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

/** En måned: overskriften, postene på tidslinjen og streken for i dag. */
function Maned({ maned, poster, idag }: { maned: string; poster: readonly Kalenderpost[]; idag: string }) {
  const { t, malform } = useTekst();
  const strek = idagIndeks(poster, maned, idag);
  const idagLinje = (
    <li class="kal-idag" aria-current="date">
      <span>{t('kalender.idag', { dato: datoLang(idag, malform) })}</span>
    </li>
  );
  return (
    <section class={`kal-maned${maned < idag.slice(0, 7) ? ' kal-passert-maned' : ''}`} aria-labelledby={manedId(maned)}>
      <h2 id={manedId(maned)} class="kal-maned-tittel" tabIndex={-1}>
        {manedTittel(maned, malform)} <span class="kal-aar">{maned.slice(0, 4)}</span>
      </h2>
      {poster.length === 0 && strek === null ? (
        <p class="kal-tom">{t('kalender.ingenDatoer')}</p>
      ) : (
        <ol class="kal-liste">
          {poster.map((p, i) => (
            <Fragment key={p.nokkel}>
              {strek === i && idagLinje}
              <Rad post={p} idag={idag} malform={malform} />
            </Fragment>
          ))}
          {strek === poster.length && idagLinje}
        </ol>
      )}
    </section>
  );
}

/** En post på tidslinjen: datoen til venstre, et punkt i temafargen og kortet. */
function Rad({ post: p, idag, malform }: { post: Kalenderpost; idag: string; malform: Malform }) {
  const { t } = useTekst();
  const celle = p.fra ? datocelle(p.fra, p.til, p.maned, malform) : null;
  const tid = p.fra
    ? [p.kl ? `kl. ${p.kl}` : '', p.oppforing.naar?.[malform] ?? ''].filter(Boolean).join(', ')
    : p.periode
      ? periodeTekst(p.periode.fra, p.periode.til, malform)
      : t('kalender.iLopetAv', { maned: manedsnavn(Number(p.maned.slice(5, 7)), malform) });
  const klasser = ['kal-rad', p.fra === null ? 'kal-uten-dag' : '', passert(p, idag) ? 'kal-passert' : '', pagar(p, idag) ? 'kal-naa' : ''].filter(Boolean).join(' ');
  return (
    <li class={klasser} data-tema={p.oppforing.tema[0]}>
      <div class="kal-dato" aria-hidden={celle ? undefined : 'true'}>
        {celle && (
          <>
            <span class="kal-dag">{celle.dag}</span>
            <span class="kal-uke">{celle.til ? t('kalender.til', { dato: celle.til }) : celle.ukedag}</span>
          </>
        )}
      </div>
      <div class="kal-punkt" aria-hidden="true" />
      <Kort oppforing={p.oppforing} tid={tid} dato={p.fra ? datoLang(p.fra, malform) + (p.til && p.til !== p.fra ? `–${datoLang(p.til, malform)}` : '') : null} />
    </li>
  );
}

/** Kortet: tittelen, temaet, fylket og hvem det gjelder. Teksten, lenkene, regelverket og kildene står inni, lukket. */
function Kort({ oppforing: o, tid, dato = null }: { oppforing: Kalenderoppforing; tid: string; dato?: string | null }) {
  const { t, malform } = useTekst();
  const [funnet, settFunnet] = useState<Kalenderlenke[] | null>(null);
  const ferdige = o.ferdigeLenker ?? [];
  const lenker = o.lenker.length > 0 ? (funnet === null ? null : [...ferdige, ...funnet]) : ferdige;
  const sted = o.fylke ? (fylkesnavn(o.fylke) ?? o.fylke) : null;
  const apnet = (e: Event) => {
    if ((e.currentTarget as HTMLDetailsElement).open && funnet === null && o.lenker.length > 0) void finnLenker(o.lenker).then(settFunnet);
  };
  return (
    <details class={`kal-kort${sted ? ' kal-kort-lokal' : ''}`} onToggle={apnet}>
      <summary class="kal-topp">
        <span class="kal-tittel">
          {dato && <span class="skjult-visuelt">{dato}: </span>}
          {o.tittel[malform]}
          {tid && <span class="kal-tid"> {tid}</span>}
        </span>
        <span class="kal-merker">
          {o.tema.map((tema) => (
            <span key={tema} class="merke kal-tema" data-tema={tema}>
              {t(`kalender.temaer.${tema}`)}
            </span>
          ))}
          {sted && (
            <span class="merke merke-fylke">
              <Ikon navn="skole" class="ikon-liten" />
              {sted}
            </span>
          )}
          {o.grupper.map((g) => (
            <span key={g} class="merke frist-gruppe">
              {t(`kalender.grupper.${g}`)}
            </span>
          ))}
        </span>
        <Ikon navn="ned" class="forklaring-pil kal-pil" />
      </summary>
      <div class="kal-innhold">
        {o.tekst && <div class="brodtekst" dangerouslySetInnerHTML={{ __html: o.tekst[malform] }} />}
        {(o.lenker.length > 0 || ferdige.length > 0) && (
          <>
            {lenker === null ? (
              <p class="liten dempet">{t('kalender.lasterLenker')}</p>
            ) : (
              <ul class="kal-lenker">
                {lenker.map((l) => (
                  <li key={l.rute}>
                    <a href={`#${l.rute}`}>
                      <span>
                        {l.tittel[malform]}
                        <small>{t(`sok.typer.${l.type}`)}</small>
                      </span>
                      <Ikon navn="hoyre" class="ikon-liten" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {o.ekstern && (
          <p>
            <a class="ekstern-lenke" href={o.ekstern.url} target="_blank" rel="noopener noreferrer">
              {o.ekstern.tekst[malform]}
              <Ikon navn="ekstern" class="ikon-liten" />
            </a>
          </p>
        )}
        <Kortfot paragrafer={[...o.paragrafer]} kilder={[...o.kilder]} />
      </div>
    </details>
  );
}
