// Overordnet del (pakke 6, avgjørelse 037): søket øverst, så hele teksten i rubrikker som er lukket til brukeren
// åpner dem, med delene inni som nye lukkede bokser, og til slutt de grunnleggende ferdighetene og de tverrfaglige
// temaene (eier 02.10.2026). De lukkede rubrikkene er innholdsregisteret. En adresse til en del (f.eks. «2.5.1» eller
// koden til et tverrfaglig tema) åpner delen og boksene rundt den, og ruller dit. Teksten er forskriftstekst fra
// udir.no og vises uendret, på valgt målform.
import { useEffect, useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { formaterDato, formaterTall } from '../../../core/i18n/tekst.ts';
import type { SideProps } from '../../typer.ts';
import { type Element, delfavoritt, elementRute, finnDel, sti } from '../data.ts';
import type { Del } from '../typer.ts';
import { Blokker, Lasting, Sok, delnavn, useLaereplanverket } from './felles.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

function Innhold({ del, apne }: { del: Del; apne: ReadonlySet<string> }) {
  const { t, malform } = useTekst();
  return (
    <>
      <Blokker blokker={del.ingress[malform]} klasse="od-ingress" />
      <Blokker blokker={del.tekst[malform]} />
      {del.deler.map((d) => (
        <Underdel key={d.id} del={d} apne={apne} />
      ))}
      <p class="liten">
        <a class="ekstern-lenke" href={malform === 'nn' ? `${del.url}?lang=nno` : del.url} target="_blank" rel="noopener noreferrer">
          {t('laereplanverket.udir')}
          <Ikon navn="ekstern" class="ikon-liten" />
        </a>
      </p>
    </>
  );
}

/** En del inni en annen: en rad som åpnes, med teksten innrykket under, som gruppene i Opplæringsløp. */
function Underdel({ del, apne }: { del: Del; apne: ReadonlySet<string> }) {
  const { malform } = useTekst();
  const [lukket, veksle] = useSammenlagt(`od-${del.id}`, !apne.has(del.id));
  const id = useId();
  return (
    <div class="od-underdel" data-rubrikk={`od-${del.id}`}>
      <div class="med-stjerne">
        <h3 class="od-underdel-tittel">
          <button type="button" class="od-underdel-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
            <span>{delnavn(del, malform)}</span>
            <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
          </button>
        </h3>
        <FavorittKnapp id={delfavoritt(del)} navn={delnavn(del, malform)} liten />
      </div>
      <div id={id} class="od-underdel-innhold" hidden={lukket}>
        <Innhold del={del} apne={apne} />
      </div>
    </div>
  );
}

/** Ferdighetene eller temaene, med lenke til omtalen i overordnet del. */
function Elementliste({ elementer }: { elementer: readonly Element[] }) {
  const { malform } = useTekst();
  return (
    <ul class="liste">
      {elementer.map((e) => (
        <li key={e.kode}>
          <a class="listelenke" href={`#${elementRute(e.kode)}`}>
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{e.navn[malform]}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Ruller til delen adressen peker på, så overskriften står synlig under toppfeltet. Det rulles på nytt når
 * skriftene er lastet, siden teksten over kan bryte annerledes da, men bare hvis brukeren ikke har rullet selv.
 */
function useRullTil(id: string | undefined) {
  useEffect(() => {
    if (!id) return;
    let rullet: number | null = null;
    const rull = () => {
      if (rullet !== null && Math.abs(window.scrollY - rullet) > 2) return;
      document.querySelector(`[data-rubrikk="od-${id}"]`)?.scrollIntoView({ block: 'start' });
      rullet = window.scrollY;
    };
    const ramme = requestAnimationFrame(rull);
    void document.fonts?.ready.then(() => requestAnimationFrame(rull));
    return () => cancelAnimationFrame(ramme);
  }, [id]);
}

export default function OverordnetDel({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useLaereplanverket();
  const nokkel = parametre.del ?? null;
  const mal = typeof data !== 'string' && nokkel ? finnDel(data.od.deler, nokkel, data.lv) : null;
  const apne = new Set(typeof data !== 'string' && mal ? sti(data.od.deler, mal).map((d) => d.id) : []);
  useRullTil(mal?.id);
  return (
    <div class="side">
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('laereplanverket.tittel')}</h1>
        <FavorittKnapp id="laereplanverket:overordnet-del" navn={t('laereplanverket.tittel')} />
      </div>
      <p class="dempet">
        <Begrepstekst tekst={t('laereplanverket.innledning')} />
      </p>
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : (
        <>
          {nokkel && !mal && (
            <p class="merknad" role="alert">
              {t('laereplanverket.ikkeFunnet')}
            </p>
          )}
          <Sok od={data.od}>
            {data.od.deler.map((d) => (
              <Rubrikk key={d.id} nokkel={`od-${d.id}`} tittel={delnavn(d, malform)} lukket={!apne.has(d.id)} stjerne={<FavorittKnapp id={delfavoritt(d)} navn={delnavn(d, malform)} liten />}>
                <Innhold del={d} apne={apne} />
              </Rubrikk>
            ))}
            <Rubrikk nokkel="lv-ferdigheter" tittel={t('laereplanverket.ferdigheter')} hoyre={formaterTall(data.lv.ferdigheter.length)} lukket>
              <p class="liten dempet">
                {t('laereplanverket.ferdigheterHjelp')} <a href="#/begreper/grunnleggende-ferdigheter">{t('laereplanverket.omBegrep.ferdigheter')}</a>
              </p>
              <Elementliste elementer={data.lv.ferdigheter} />
            </Rubrikk>
            <Rubrikk nokkel="lv-temaer" tittel={t('laereplanverket.temaer')} hoyre={formaterTall(data.lv.temaer.length)} lukket>
              <p class="liten dempet">
                {t('laereplanverket.temaerHjelp')} <a href="#/begreper/tverrfaglige-temaer">{t('laereplanverket.omBegrep.temaer')}</a>
              </p>
              <Elementliste elementer={data.lv.temaer} />
            </Rubrikk>
          </Sok>
          <p class="liten dempet">{t('laereplanverket.hentet', { dato: formaterDato(data.od.hentet, malform) })}</p>
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-overordnet-del' }, { id: 'udir-grep' }]} />
    </div>
  );
}
