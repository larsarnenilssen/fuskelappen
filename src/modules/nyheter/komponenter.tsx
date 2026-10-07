// Nyhetene i panelet på forsiden og på nyhetssiden (eier 07.10.2026):
// - Ingressen står ikke i listene. På siden viser et trykk på en sak ingressen, og neste trykk åpner saken hos kilden.
// - På forsiden tar nyhetene ikke mer plass enn kalenderen. Et trykk på en sak viser den alene i samme plass, med
//   ingressen, kilden og en knapp til saken hos kilden. Filteret på hvem eller kilde står øverst.
import { useEffect, useRef, useState } from 'preact/hooks';
import { tilstand, useTekst, type T } from '../../app/tilstand.ts';
import { Ikon } from '../../components/Ikon.tsx';
import { nokkelFra, useHusketApen } from '../../components/husket.ts';
import type { Malform } from '../../core/i18n/tekst.ts';
import { kortManed } from '../../core/tidslinje.ts';
import type { Nyhet, Nyheter } from './skjema.ts';
import {
  finnKilde,
  forsidefilterVerdi,
  lesForsidefilter,
  nyesteSaker,
  NYHETSKILDER,
  synligeKilder,
  typerMedKilder,
  type Nyhetsfilter,
} from './utvalg.ts';
import '../../styles/nyheter.css';

/** «I dag», «I går» eller «Mandag 5. oktober» (med år når det ikke er i år). */
export function dagTittel(dato: string, idag: string, t: T, malform: Malform): string {
  if (dato === idag) return t('nyheter.iDag');
  const igaar = new Date(`${idag}T12:00:00Z`);
  igaar.setUTCDate(igaar.getUTCDate() - 1);
  if (dato === igaar.toISOString().slice(0, 10)) return t('nyheter.iGaar');
  const d = new Date(`${dato}T12:00:00Z`);
  const tekst = new Intl.DateTimeFormat(malform === 'nn' ? 'nn-NO' : 'nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(dato.slice(0, 4) === idag.slice(0, 4) ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  }).format(d);
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

const kortDato = (dato: string, malform: Malform) => `${Number(dato.slice(8, 10))}. ${kortManed(Number(dato.slice(5, 7)), malform)}`;

/** Kilden og hvem som står bak, f.eks. «Udir · Myndighet», med datoen først på forsiden. */
function kildelinje(s: Nyhet, t: T, malform: Malform, dato: boolean): string {
  const k = finnKilde(s.kilde);
  const deler = k ? [(k.kortnavn ?? k.navn)[malform], t(`nyheter.typer.${k.type}`)] : [s.kilde];
  return (dato ? [kortDato(s.dato, malform), ...deler] : deler).join(' · ');
}

const kildenavn = (s: Nyhet, malform: Malform) => finnKilde(s.kilde)?.navn[malform] ?? s.kilde;
/** Det korte navnet, f.eks. «KD», på knappen på forsiden, så den står på én linje. */
const kortKildenavn = (s: Nyhet, malform: Malform) => {
  const k = finnKilde(s.kilde);
  return k ? (k.kortnavn ?? k.navn)[malform] : s.kilde;
};

/**
 * Én sak på nyhetssiden. Lukket er saken en knapp som viser ingressen. Åpen er saken en lenke til kilden, med en egen
 * knapp som lukker den. Uten ingress er saken en lenke med en gang. Hva som er åpent, huskes for siden.
 */
export function Sak({ sak }: { sak: Nyhet }) {
  const { t, malform } = useTekst();
  const [apen, settApen] = useHusketApen(`nyhet:${nokkelFra(sak.url)}`);
  const lenke = useRef<HTMLAnchorElement>(null);
  const knapp = useRef<HTMLButtonElement>(null);
  const forrige = useRef(apen);
  useEffect(() => {
    // Fokus følger med: til lenken når saken åpnes, og tilbake til saken når den lukkes.
    if (forrige.current !== apen) (apen ? lenke : knapp).current?.focus();
    forrige.current = apen;
  }, [apen]);
  const under = <span class="listelenke-under">{kildelinje(sak, t, malform, false)}</span>;
  if (!sak.ingress || apen) {
    return (
      <div class={`nyh-sak-ramme${apen ? ' apen' : ''}`}>
        <a ref={lenke} class="listelenke nyh-sak" href={sak.url} target="_blank" rel="noopener noreferrer">
          <span class="listelenke-tekst">
            <span class="listelenke-tittel">{sak.tittel}</span>
            {apen && <span class="nyh-ingress">{sak.ingress}</span>}
            {under}
            {apen && (
              <span class="nyh-les">
                {t('nyheter.les', { kilde: kildenavn(sak, malform) })}
                <Ikon navn="ekstern" class="ikon-liten" />
              </span>
            )}
          </span>
          {!apen && <Ikon navn="ekstern" class="ikon-liten" />}
          {!apen && <span class="skjult-visuelt"> ({t('nyheter.apnesHos', { kilde: kildenavn(sak, malform) })})</span>}
        </a>
        {apen && (
          <button type="button" class="ikonknapp nyh-lukk" aria-label={t('nyheter.lukk', { tittel: sak.tittel })} title={t('nyheter.skjulIngress')} onClick={() => settApen(false)}>
            <Ikon navn="opp" class="ikon-liten" />
          </button>
        )}
      </div>
    );
  }
  return (
    <button ref={knapp} type="button" class="listelenke nyh-sak" aria-expanded={false} onClick={() => settApen(true)}>
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{sak.tittel}</span>
        {under}
      </span>
      <Ikon navn="ned" class="ikon-liten" />
    </button>
  );
}

/** Overskriften når visningen er lukket: den nyeste saken med filteret brukeren har valgt. */
export function forsideSammendrag(t: T, malform: Malform, d: Nyheter, fylke: string | null): string {
  const forste = nyesteSaker(d, fylke, lesForsidefilter(tilstand.lesValg('nyhetsfilter')))[0];
  if (!forste) return t('nyheter.ingenNye');
  return t('nyheter.sammendrag', { dato: kortDato(forste.dato, malform), tittel: forste.tittel });
}

/** Filteret på forsiden, husket på enheten. */
function useForsidefilter(): [Nyhetsfilter, (f: Nyhetsfilter) => void] {
  const [filter, settFilter] = useState(() => lesForsidefilter(tilstand.lesValg('nyhetsfilter')));
  return [
    filter,
    (f) => {
      tilstand.skrivValg('nyhetsfilter', forsidefilterVerdi(f));
      settFilter(f);
    },
  ];
}

/** Nedtrekkslisten på forsiden: hvem og kilde i én liste, med teksten i selve listen. */
function Forsidefilter({ filter, fylke, onEndring }: { filter: Nyhetsfilter; fylke: string | null; onEndring: (f: Nyhetsfilter) => void }) {
  const { t, malform } = useTekst();
  const kilder = synligeKilder(NYHETSKILDER, fylke);
  const verdi = forsidefilterVerdi(filter);
  return (
    <select class="nyh-forside-filter" aria-label={t('nyheter.filter.forsideEtikett')} value={verdi} onChange={(e) => onEndring(lesForsidefilter(e.currentTarget.value))}>
      <option value="">{verdi ? t('nyheter.filter.visAlle') : t('nyheter.filter.forside')}</option>
      <optgroup label={t('nyheter.filter.hvem')}>
        {typerMedKilder(kilder).map((ty) => (
          <option key={ty} value={`type:${ty}`}>
            {t(`nyheter.filter.${ty}`)}
          </option>
        ))}
      </optgroup>
      <optgroup label={t('nyheter.filter.kilde')}>
        {kilder.map((k) => (
          <option key={k.id} value={`kilde:${k.id}`}>
            {k.navn[malform]}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

/**
 * Visningen «Nyheter» i panelet på forsiden (avgjørelse 081). Høyden er fast og ikke større enn kalenderens, så like
 * mange favoritter står under. Et trykk på en sak viser den alene i samme plass.
 */
export function ForsideNyheter({ d, fylke, rute }: { d: Nyheter; fylke: string | null; rute: string }) {
  const { t, malform } = useTekst();
  const [filter, settFilter] = useForsidefilter();
  const saker = nyesteSaker(d, fylke, filter);
  const [valgt, settValgt] = useState<string | null>(null);
  const sak = saker.find((s) => s.url === valgt) ?? null;
  const tilbake = useRef<HTMLButtonElement>(null);
  const forrige = useRef<string | null>(null);
  const liste = useRef<HTMLUListElement>(null);
  useEffect(() => {
    // Fokus følger med: til «Tilbake» når en sak vises, og til saken igjen når brukeren går tilbake.
    if (valgt) tilbake.current?.focus();
    else if (forrige.current) liste.current?.querySelector<HTMLButtonElement>(`[data-url="${CSS.escape(forrige.current)}"]`)?.focus();
    forrige.current = valgt;
  }, [valgt]);

  if (sak) {
    return (
      <div class="nyh-forside nyh-forside-sak">
        <div class="nyh-forside-topp">
          <button ref={tilbake} type="button" class="lenkeknapp liten nyh-tilbake" onClick={() => settValgt(null)}>
            <Ikon navn="tilbake" class="ikon-liten" />
            {t('nyheter.tilbake')}
          </button>
        </div>
        <div class="nyh-forside-innhold">
          <h3 class="nyh-forside-tittel">{sak.tittel}</h3>
          {sak.ingress && <p class="nyh-ingress">{sak.ingress}</p>}
          <p class="nyh-forside-under">{kildelinje(sak, t, malform, true)}</p>
        </div>
        <a class="knapp knapp-liten nyh-forside-les" href={sak.url} target="_blank" rel="noopener noreferrer">
          {t('nyheter.les', { kilde: kortKildenavn(sak, malform) })}
          <Ikon navn="ekstern" class="ikon-liten" />
        </a>
      </div>
    );
  }
  return (
    <div class="nyh-forside">
      <div class="nyh-forside-topp">
        <Forsidefilter filter={filter} fylke={fylke} onEndring={settFilter} />
        <a class="nyh-forside-alle" href={`#${rute}`}>
          {t('nyheter.alleKort')}
          <Ikon navn="hoyre" class="ikon-liten" />
        </a>
      </div>
      <ul ref={liste} class="nyh-forside-liste">
        {saker.length === 0 && <li class="dempet nyh-forside-tom">{t('nyheter.ingen')}</li>}
        {saker.map((s) => (
          <li key={s.url}>
            <button type="button" class="nyh-forside-knapp" data-url={s.url} onClick={() => settValgt(s.url)}>
              <span class="nyh-forside-tittel">{s.tittel}</span>
              <span class="nyh-forside-under">{kildelinje(s, t, malform, true)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
