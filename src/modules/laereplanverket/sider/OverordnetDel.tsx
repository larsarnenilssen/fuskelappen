// Overordnet del (pakke 6, avgjørelse 037): hele teksten i bokser som er lukket til brukeren åpner dem, med delene
// inni som nye lukkede bokser. De lukkede boksene er innholdsregisteret. En adresse til en del (f.eks. «2.5.1» eller
// koden til et tverrfaglig tema) åpner delen og boksene rundt den, og ruller dit. Teksten er forskriftstekst fra
// udir.no og vises uendret, på valgt målform.
import { useEffect, useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { formaterDato } from '../../../core/i18n/tekst.ts';
import type { SideProps } from '../../typer.ts';
import { Brodsmuler } from '../../opplaeringslop/sider/felles.tsx';
import { finnDel, sti } from '../data.ts';
import type { Del } from '../typer.ts';
import { Blokker, Lasting, Sok, delnavn, useLaereplanverket } from './felles.tsx';

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
      <h3 class="od-underdel-tittel">
        <button type="button" class="od-underdel-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
          <span>{delnavn(del, malform)}</span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
        </button>
      </h3>
      <div id={id} class="od-underdel-innhold" hidden={lukket}>
        <Innhold del={del} apne={apne} />
      </div>
    </div>
  );
}

export default function OverordnetDel({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useLaereplanverket();
  const nokkel = parametre.del ?? null;
  const mal = typeof data !== 'string' && nokkel ? finnDel(data.od.deler, nokkel, data.lv) : null;
  const apne = new Set(typeof data !== 'string' && mal ? sti(data.od.deler, mal).map((d) => d.id) : []);
  // Rull til delen adressen peker på, når teksten er lastet.
  useEffect(() => {
    if (!mal) return;
    document.querySelector(`[data-rubrikk="od-${mal.id}"]`)?.scrollIntoView({ block: 'start' });
  }, [mal?.id]);
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('laereplanverket.tittel'), href: '#/laereplanverket' }]} />
      <h1 tabIndex={-1}>{t('laereplanverket.overordnetDel')}</h1>
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : (
        <>
          <p class="liten dempet">{t('laereplanverket.overordnetHjelp')}</p>
          {nokkel && !mal && (
            <p class="merknad" role="alert">
              {t('laereplanverket.ikkeFunnet')}
            </p>
          )}
          <Sok od={data.od}>
            {data.od.deler.map((d) => (
              <Rubrikk key={d.id} nokkel={`od-${d.id}`} tittel={delnavn(d, malform)} lukket={!apne.has(d.id)}>
                <Innhold del={d} apne={apne} />
              </Rubrikk>
            ))}
          </Sok>
          <p class="liten dempet">{t('laereplanverket.hentet', { dato: formaterDato(data.od.hentet, malform) })}</p>
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-overordnet-del' }]} />
    </div>
  );
}
