// Søknad og frister gjennom året (fase 5, pakke 2, avgjørelse 046). Øverst en stripe med de tolv månedene, så året
// kan leses med ett blikk. Under står fristene per måned, lukket til brukeren åpner dem. Filteret står i adressen
// (`?vis=voksne`), så en lenke kan peke rett til fristene for en gruppe.
import { useEffect, useState } from 'preact/hooks';
import { beholdRullingVedNesteNavigasjon, lenke } from '../../../app/ruter.ts';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Paragraflenker } from '../../../components/Paragraflenker.tsx';
import type { Frist } from '../../../core/innhold/skjema.ts';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { iDag } from '../../../data/skolear.ts';
import type { SideProps } from '../../typer.ts';
import { fristerRute, hentInnhold, type Inntaksinnhold } from '../innhold.ts';
import { FILTRE, gjelder, heleAret, kortManed, lesFilter, manedsnavn, manedsoverskrift, perManed, sorter, tidspunkt, type Filter } from '../tidslinje.ts';
import { Lokalmerknad } from './Lokalmerknad.tsx';

const manedId = (m: number) => `frister-${m}`;

/** Ruller til måneden og flytter fokus til overskriften, uten å endre adressen. */
function tilManed(m: number) {
  const overskrift = document.getElementById(manedId(m));
  if (!overskrift) return;
  const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  overskrift.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'start' });
  overskrift.focus({ preventScroll: true });
}

export default function Frister({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Inntaksinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const filter = lesFilter(sporring.get('vis'));
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const frister = innhold ? sorter(velgSynlige(innhold.frister, sted).filter((f) => gjelder(f, filter))) : [];
  const maneder = perManed(frister);
  const naa = Number(iDag().slice(5, 7));
  const hele = frister.filter(heleAret);
  // Tegnforklaringen for prikkene vises bare når fylkets frister er med.
  const lokal = frister.find((f) => f.gyldighet.niva !== 'nasjonal');
  const lokalt = lokal && lokal.gyldighet.niva !== 'nasjonal' ? (fylkesnavn(lokal.gyldighet.fylke) ?? lokal.gyldighet.fylke) : null;
  const antall = (n: number) => (n === 0 ? t('inntak.frister.ingen') : n === 1 ? t('inntak.frister.enFrist') : t('inntak.frister.flereFrister', { antall: String(n) }));

  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('inntak.tittel'), href: '#/inntak' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('inntak.frister.tittel')}</h1>
        <FavorittKnapp id="inntak:frister" navn={t('inntak.frister.tittel')} />
      </div>
      <p class="ingress">{t('inntak.frister.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <Lokalmerknad innhold={innhold} />
          <nav class="frist-filter" aria-label={t('inntak.frister.filter')}>
            <p class="liten-overskrift">{t('inntak.frister.filter')}</p>
            <ul>
              {FILTRE.map((f) => (
                <li key={f}>
                  <a
                    href={lenke(fristerRute, f === 'alle' ? undefined : { vis: f })}
                    aria-current={f === filter ? 'page' : undefined}
                    onClick={beholdRullingVedNesteNavigasjon}
                  >
                    {t(`inntak.frister.filtre.${f}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section class="frist-aar" aria-labelledby="frister-aaret">
            <h2 id="frister-aaret" class="liten-overskrift">
              {t('inntak.frister.aaret')}
            </h2>
            <ol class="frist-stripe">
              {maneder.map(({ maned: m, frister: liste }) => {
                const innhold = (
                  <>
                    <span class="frist-stripe-navn" aria-hidden="true">
                      {kortManed(m, malform)}
                    </span>
                    <span class="frist-stripe-prikker" aria-hidden="true">
                      {liste.slice(0, 4).map((f) => (
                        <span key={f.id} class={`frist-prikk${f.gyldighet.niva === 'nasjonal' ? '' : ' frist-prikk-lokal'}`} />
                      ))}
                    </span>
                    <span class="skjult-visuelt">
                      {manedsnavn(m, malform)}: {antall(liste.length)}
                    </span>
                  </>
                );
                return (
                  <li key={m} class={m === naa ? 'frist-stripe-naa' : undefined} aria-current={m === naa ? 'date' : undefined}>
                    {liste.length > 0 ? (
                      <button type="button" class="frist-stripe-celle" onClick={() => tilManed(m)}>
                        {innhold}
                      </button>
                    ) : (
                      <span class="frist-stripe-celle frist-stripe-tom">{innhold}</span>
                    )}
                  </li>
                );
              })}
            </ol>
            {lokalt && (
              <p class="frist-tegn" aria-hidden="true">
                <span>
                  <span class="frist-prikk" /> {t('inntak.frister.nasjonal')}
                </span>
                <span>
                  <span class="frist-prikk frist-prikk-lokal" /> {lokalt}
                </span>
              </p>
            )}
          </section>

          {frister.length === 0 && <p class="dempet">{t('inntak.frister.tomt')}</p>}

          {hele.length > 0 && (
            <section class="frist-maned">
              <h2 class="frist-maned-tittel">{t('inntak.frister.heleAret')}</h2>
              <ul class="frist-liste">
                {hele.map((f) => (
                  <li key={`${f.gyldighet.niva}-${f.id}`}>
                    <Fristkort frist={f} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {maneder
            .filter((m) => m.frister.length > 0)
            .map(({ maned: m, frister: liste }) => (
              <section key={m} class="frist-maned">
                <h2 id={manedId(m)} class="frist-maned-tittel" tabIndex={-1}>
                  {manedsoverskrift(m, malform)}
                  {m === naa && <span class="merke frist-naa">{t('inntak.frister.naa')}</span>}
                </h2>
                <ul class="frist-liste">
                  {liste.map((f) => (
                    <li key={`${f.gyldighet.niva}-${f.id}`}>
                      <Fristkort frist={f} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </>
      )}
    </div>
  );
}

/** Én frist: tidspunktet, tittelen og hvem den gjelder. Teksten, paragrafene og kildene står inni, lukket. */
function Fristkort({ frist: f }: { frist: Frist }) {
  const { t, malform } = useTekst();
  const sted = f.gyldighet.niva === 'nasjonal' ? null : (fylkesnavn(f.gyldighet.fylke) ?? f.gyldighet.fylke);
  const tid = tidspunkt(f, malform);
  return (
    <details class={`frist-kort${sted ? ' frist-kort-lokal' : ''}`} id={`frist-${f.id}`}>
      <summary class="frist-kort-topp">
        {/* Frister som gjelder hele året, står under overskriften «Hele året» og har ikke eget tidspunkt. */}
        {tid && (
          <span class="frist-kort-tid">
            <Ikon navn="klokke" class="ikon-liten" />
            {tid}
          </span>
        )}
        <span class="frist-kort-tittel">{f.tittel[malform]}</span>
        <span class="frist-kort-grupper">
          {sted && (
            <span class="merke merke-fylke">
              <Ikon navn="skole" class="ikon-liten" />
              {sted}
            </span>
          )}
          {f.grupper.map((g) => (
            <span key={g} class={`merke frist-gruppe frist-gruppe-${g}`}>
              {t(`inntak.frister.grupper.${g as Exclude<Filter, 'alle'>}`)}
            </span>
          ))}
        </span>
        <Ikon navn="ned" class="forklaring-pil" />
      </summary>
      <div class="frist-kort-innhold">
        <div class="brodtekst frist-kort-tekst" dangerouslySetInnerHTML={{ __html: f.tekst[malform] }} />
        {/* Paragrafene og kildene står i lukkede rader, med samme utseende som i veiviserne (eier 03.10.2026). */}
        <div class="frist-kort-mer">
          {f.paragrafer.length > 0 && (
            <details class="veiviser-kilder veiviser-regelverk">
              <summary class="forklaring-knapp">
                <Ikon navn="paragraf" />
                <span>{t('komponenter.veiviser.regelverkAntall', { antall: String(f.paragrafer.length) })}</span>
                <Ikon navn="ned" class="forklaring-pil" />
              </summary>
              <Paragraflenker paragrafer={f.paragrafer} overskrift={t('komponenter.veiviser.regelverk')} utenOverskrift />
            </details>
          )}
          <details class="veiviser-kilder">
            <summary class="forklaring-knapp">
              <Ikon navn="bok" />
              <span>{t('komponenter.veiviser.kilder', { antall: String(f.kilder.length) })}</span>
              <Ikon navn="ned" class="forklaring-pil" />
            </summary>
            <Kildeliste kilder={f.kilder} niva={3} utenOverskrift />
          </details>
        </div>
      </div>
    </details>
  );
}
