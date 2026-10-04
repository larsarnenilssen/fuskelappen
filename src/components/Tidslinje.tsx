// En tidslinje med frister gjennom året (avgjørelse 046), felles for Inntak og Vurdering. Øverst et filter og en
// stripe med månedene, så året kan leses med ett blikk. Under står fristene per måned, lukket til brukeren åpner dem.
// Filteret står i adressen, så en lenke kan peke rett til fristene for en gruppe.
import { beholdRullingVedNesteNavigasjon } from '../app/ruter.ts';
import { fylkesnavn } from '../app/Stedmerknad.tsx';
import { useTekst } from '../app/tilstand.ts';
import { heleAret, kortManed, manedsnavn, manedsoverskrift, perManed, type Tidslinjefrist, tidspunkt } from '../core/tidslinje.ts';
import { Ikon } from './Ikon.tsx';
import { KortfotRader } from './Kortfot.tsx';

export interface Tidslinjetekster {
  filter: string;
  aaret: string;
  ingen: string;
  enFrist: string;
  /** Med {antall}. */
  flereFrister: string;
  nasjonal: string;
  tomt: string;
  heleAret: string;
  naa: string;
}

interface Props {
  frister: readonly Tidslinjefrist[];
  /** Månedene i året, i rekkefølge, f.eks. august–juli. */
  maneder: readonly number[];
  /** Måneden i dag, som merkes «Nå». */
  naa: number;
  /** Prefiks til id-ene på månedene (`<prefiks>-<måned>`). */
  idPrefiks: string;
  filtre: readonly { id: string; tekst: string; href: string }[];
  filter: string;
  gruppenavn: (gruppe: string) => string;
  tekster: Tidslinjetekster;
}

/** Ruller til måneden og flytter fokus til overskriften, uten å endre adressen. */
function tilManed(id: string) {
  const overskrift = document.getElementById(id);
  if (!overskrift) return;
  const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  overskrift.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'start' });
  overskrift.focus({ preventScroll: true });
}

export function Tidslinje({ frister, maneder, naa, idPrefiks, filtre, filter, gruppenavn, tekster }: Props) {
  const { malform } = useTekst();
  const manedId = (m: number) => `${idPrefiks}-${m}`;
  const perM = perManed(frister, maneder);
  const hele = frister.filter(heleAret);
  // Tegnforklaringen for prikkene vises bare når fylkets frister er med.
  const lokal = frister.find((f) => f.gyldighet.niva !== 'nasjonal');
  const lokalt = lokal && lokal.gyldighet.niva !== 'nasjonal' ? (fylkesnavn(lokal.gyldighet.fylke) ?? lokal.gyldighet.fylke) : null;
  const antall = (n: number) => (n === 0 ? tekster.ingen : n === 1 ? tekster.enFrist : tekster.flereFrister.replace('{antall}', String(n)));

  return (
    <>
      <nav class="frist-filter" aria-label={tekster.filter}>
        <p class="liten-overskrift">{tekster.filter}</p>
        <ul>
          {filtre.map((f) => (
            <li key={f.id}>
              <a href={f.href} aria-current={f.id === filter ? 'page' : undefined} onClick={beholdRullingVedNesteNavigasjon}>
                {f.tekst}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section class="frist-aar" aria-labelledby={`${idPrefiks}-aaret`}>
        <h2 id={`${idPrefiks}-aaret`} class="liten-overskrift">
          {tekster.aaret}
        </h2>
        <ol class="frist-stripe">
          {perM.map(({ maned: m, frister: liste }) => {
            const innhold = (
              <>
                <span class="frist-stripe-navn" aria-hidden="true">
                  {kortManed(m, malform)}
                </span>
                <span class="frist-stripe-prikker" aria-hidden="true">
                  {liste.slice(0, 4).map((f) => (
                    <span key={`${f.gyldighet.niva}-${f.id}`} class={`frist-prikk${f.gyldighet.niva === 'nasjonal' ? '' : ' frist-prikk-lokal'}`} />
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
                  <button type="button" class="frist-stripe-celle" onClick={() => tilManed(manedId(m))}>
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
              <span class="frist-prikk" /> {tekster.nasjonal}
            </span>
            <span>
              <span class="frist-prikk frist-prikk-lokal" /> {lokalt}
            </span>
          </p>
        )}
      </section>

      {frister.length === 0 && <p class="dempet">{tekster.tomt}</p>}

      {hele.length > 0 && (
        <section class="frist-maned">
          <h2 class="frist-maned-tittel">{tekster.heleAret}</h2>
          <ul class="frist-liste">
            {hele.map((f) => (
              <li key={`${f.gyldighet.niva}-${f.id}`}>
                <Fristkort frist={f} gruppenavn={gruppenavn} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {perM
        .filter((m) => m.frister.length > 0)
        .map(({ maned: m, frister: liste }) => (
          <section key={m} class="frist-maned">
            <h2 id={manedId(m)} class="frist-maned-tittel" tabIndex={-1}>
              {manedsoverskrift(m, malform)}
              {m === naa && <span class="merke frist-naa">{tekster.naa}</span>}
            </h2>
            <ul class="frist-liste">
              {liste.map((f) => (
                <li key={`${f.gyldighet.niva}-${f.id}`}>
                  <Fristkort frist={f} gruppenavn={gruppenavn} />
                </li>
              ))}
            </ul>
          </section>
        ))}
    </>
  );
}

/** Én frist: tidspunktet, tittelen og hvem den gjelder. Teksten, paragrafene og kildene står inni, lukket. */
function Fristkort({ frist: f, gruppenavn }: { frist: Tidslinjefrist; gruppenavn: (g: string) => string }) {
  const { malform } = useTekst();
  const sted = f.gyldighet.niva === 'nasjonal' ? null : (fylkesnavn(f.gyldighet.fylke) ?? f.gyldighet.fylke);
  const tid = tidspunkt(f, malform);
  return (
    <details class={`frist-kort${sted ? ' frist-kort-lokal' : ''}`} id={`frist-${f.gyldighet.niva === 'nasjonal' ? '' : `${f.gyldighet.fylke}-`}${f.id}`}>
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
              {gruppenavn(g)}
            </span>
          ))}
        </span>
        <Ikon navn="ned" class="forklaring-pil" />
      </summary>
      <div class="frist-kort-innhold">
        <div class="brodtekst frist-kort-tekst" dangerouslySetInnerHTML={{ __html: f.tekst[malform] }} />
        {/* Paragrafene og kildene står i lukkede rader, med samme utseende som i veiviserne (eier 03.10.2026). */}
        <div class="frist-kort-mer">
          <KortfotRader paragrafer={f.paragrafer} kilder={f.kilder} />
        </div>
      </div>
    </details>
  );
}
