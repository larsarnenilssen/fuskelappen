// Nyhetene i panelet på forsiden og på nyhetssiden. Hver sak er en lenke ut til kilden, med kildens navn og hvem som
// står bak under tittelen. Ingressen står under tittelen når den vises (skissen i testversjonen lar eier se begge).
import { useEffect, useState } from 'preact/hooks';
import { tilstand, useTekst, type T } from '../../app/tilstand.ts';
import { Ikon } from '../../components/Ikon.tsx';
import type { Malform } from '../../core/i18n/tekst.ts';
import { kortManed } from '../../core/tidslinje.ts';
import type { Nyhet } from './skjema.ts';
import { finnKilde } from './utvalg.ts';
import '../../styles/nyheter.css';

/** Skissen i testversjonen: ingressen vises eller ikke. Valget gjelder både forsiden og siden. */
export const INGRESS_SKISSE = __TESTVERSJON__ || import.meta.env.MODE !== 'production';

const lyttere = new Set<(v: boolean) => void>();

export function useVisIngress(): [boolean, (v: boolean) => void] {
  const [vis, settVis] = useState(() => tilstand.lesValg('nyhetsingress') !== 'uten');
  useEffect(() => {
    lyttere.add(settVis);
    return () => {
      lyttere.delete(settVis);
    };
  }, []);
  return [
    vis,
    (v: boolean) => {
      tilstand.skrivValg('nyhetsingress', v ? 'med' : 'uten');
      for (const l of lyttere) l(v);
    },
  ];
}

/** «I dag», «I går» eller «mandag 5. oktober» (med år når det ikke er i år). */
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

/** Kilden og hvem som står bak, f.eks. «Udir · Myndighet», med datoen først på forsiden. */
function kildelinje(s: Nyhet, t: T, malform: Malform, dato: boolean): string {
  const k = finnKilde(s.kilde);
  const deler = k ? [(k.kortnavn ?? k.navn)[malform], t(`nyheter.typer.${k.type}`)] : [s.kilde];
  return (dato ? [`${Number(s.dato.slice(8, 10))}. ${kortManed(Number(s.dato.slice(5, 7)), malform)}`, ...deler] : deler).join(' · ');
}

/** Én sak. Med `dato` står datoen først i linjen under tittelen (forsiden, der sakene ikke står per dag). */
export function Sak({ sak, ingress, dato = false }: { sak: Nyhet; ingress: boolean; dato?: boolean }) {
  const { t, malform } = useTekst();
  const kilde = finnKilde(sak.kilde)?.navn[malform] ?? sak.kilde;
  return (
    <a class="listelenke nyh-sak" href={sak.url} target="_blank" rel="noopener noreferrer">
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{sak.tittel}</span>
        {ingress && sak.ingress && <span class="nyh-ingress">{sak.ingress}</span>}
        <span class="listelenke-under">
          {kildelinje(sak, t, malform, dato)}
          <span class="skjult-visuelt"> ({t('nyheter.apnesHos', { kilde })})</span>
        </span>
      </span>
      <Ikon navn="ekstern" class="ikon-liten" />
    </a>
  );
}

/** Overskriften når visningen er lukket: den nyeste saken. */
export { nyesteSaker } from './utvalg.ts';

export function forsideSammendrag(t: T, malform: Malform, saker: readonly Nyhet[]): string {
  const forste = saker[0];
  if (!forste) return t('nyheter.ingenNye');
  return t('nyheter.sammendrag', { dato: `${Number(forste.dato.slice(8, 10))}. ${kortManed(Number(forste.dato.slice(5, 7)), malform)}`, tittel: forste.tittel });
}

/** Visningen «Nyheter» i panelet på forsiden (avgjørelse 081): de nyeste sakene og lenken til alle. */
export function ForsideNyheter({ saker, rute }: { saker: readonly Nyhet[]; rute: string }) {
  const { t } = useTekst();
  const [visIngress] = useVisIngress();
  return (
    <ul class="liste nyh-forside">
      {saker.length === 0 && <li class="dempet">{t('nyheter.ingenNye')}</li>}
      {saker.map((s) => (
        <li key={s.url}>
          <Sak sak={s} ingress={visIngress} dato />
        </li>
      ))}
      <li>
        <a class="listelenke nyh-alle" href={`#${rute}`}>
          <Ikon navn="dokument" />
          <span class="listelenke-tekst">
            <span class="listelenke-tittel">{t('nyheter.alle')}</span>
          </span>
          <Ikon navn="hoyre" class="ikon-liten" />
        </a>
      </li>
    </ul>
  );
}
