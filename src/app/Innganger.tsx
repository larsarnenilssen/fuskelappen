// Boksene for modulene i en kategori på forsiden (avgjørelse 030): hovedboksene først, og innganger merket
// «flere» i en boks som er lukket til brukeren åpner den. Hvilke bokser som er åpne, huskes for siden.
import { useId } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { useSammenlagt } from '../components/Sammenlegg.tsx';
import { visTekst } from '../core/i18n/tekst.ts';
import { innganger } from '../modules/register.ts';
import type { Inngang, Modulmanifest } from '../modules/typer.ts';
import { useTekst } from './tilstand.ts';

function Lenke({ inngang, modul }: { inngang: Inngang; modul: string }) {
  const { malform } = useTekst();
  return (
    <a class="listelenke" href={`#${inngang.rute}`} data-modul={modul}>
      <Ikon navn={inngang.ikon} />
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{visTekst(inngang.tittel, malform)}</span>
        {inngang.beskrivelse && <span class="listelenke-under">{visTekst(inngang.beskrivelse, malform)}</span>}
      </span>
      <Ikon navn="hoyre" class="ikon-liten" />
    </a>
  );
}

function Flere({ modul, tittel, under, liste }: { modul: Modulmanifest; tittel: string; under?: string; liste: Inngang[] }) {
  const { malform } = useTekst();
  const [lukket, veksle] = useSammenlagt(`forside-flere-${modul.id}`, true);
  const id = useId();
  const navn = liste.map((i) => visTekst(i.tittel, malform));
  return (
    <li class="flere">
      <button type="button" class="listelenke flere-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
        <Ikon navn={liste[0]?.ikon ?? modul.ikon} />
        <span class="listelenke-tekst">
          <span class="listelenke-tittel">{tittel}</span>
          <span class="listelenke-under">{under ?? `${navn.join(', ')}.`}</span>
        </span>
        <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
      </button>
      <ul id={id} class="liste flere-liste" hidden={lukket}>
        {liste.map((i) => (
          <li key={i.id}>
            <Lenke inngang={i} modul={modul.id} />
          </li>
        ))}
      </ul>
    </li>
  );
}

/** Boksene for modulene, i rekkefølge: hver moduls hovedbokser, så boksen med resten. */
export function Innganger({ moduler }: { moduler: readonly Modulmanifest[] }) {
  const { t, malform } = useTekst();
  return (
    <ul class="liste">
      {moduler.flatMap((m) => {
        const alle = innganger(m);
        const hoved = alle.filter((i) => !i.flere);
        const flere = alle.filter((i) => i.flere);
        return [
          ...hoved.map((i) => (
            <li key={i.id}>
              <Lenke inngang={i} modul={m.id} />
            </li>
          )),
          ...(flere.length > 0
            ? [<Flere key={`${m.id}-flere`} modul={m} tittel={m.flereTittel ? visTekst(m.flereTittel, malform) : t('forside.flere')} under={m.flereUnder ? visTekst(m.flereUnder, malform) : undefined} liste={flere} />]
            : []),
        ];
      })}
    </ul>
  );
}
