import { useEffect, useId, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { oversiktsid } from '../../favoritter.ts';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { velgSynlige } from '../../../core/innhold/status.ts';
import type { SideProps } from '../../typer.ts';
import { hentBegrepsbank, type Begrepsbank } from '../innhold.ts';
import { begrepstemaer, erBegrepstema, type Begrepstema } from '../tema.ts';

/** Filteret står i adressen, så tilbake og en delt lenke viser det samme (eier 05.10.2026). */
function adresse(tema: Begrepstema | null, filter: string): Record<string, string> {
  return { ...(tema ? { tema } : {}), ...(filter ? { q: filter } : {}) };
}

export default function Liste({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const id = useId();
  const [bank, settBank] = useState<Begrepsbank | null>(null);
  const [filter, settFilter] = useState(sporring.get('q') ?? '');
  const fraAdresse = sporring.get('tema');
  const [tema, settTema] = useState<Begrepstema | null>(erBegrepstema(fraAdresse) ? fraAdresse : null);

  useEffect(() => {
    void hentBegrepsbank().then(settBank);
  }, []);

  const begreper = bank?.begreper ?? null;
  const synlige = begreper ? velgSynlige(begreper, { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null }) : [];
  const f = filter.trim().toLowerCase();
  const iTeksten = f ? synlige.filter((b) => [b.tittel.nb, b.tittel.nn, ...b.stikkord].some((s) => s.toLowerCase().includes(f))) : synlige;
  const temaFor = (b: Innholdselement) => bank?.tema.get(b.id);
  const filtrert = tema ? iTeksten.filter((b) => temaFor(b) === tema) : iTeksten;
  const velgTema = (nytt: Begrepstema | null) => {
    settTema(nytt);
    erstattAdresse('/begreper', adresse(nytt, filter));
  };
  const skrivFilter = (ny: string) => {
    settFilter(ny);
    erstattAdresse('/begreper', adresse(tema, ny));
  };

  return (
    <div class="side">
      <Sidetopp tittel={t('begreper.tittel')} favoritt={oversiktsid('begreper')} />
      {begreper === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : begreper.length === 0 ? (
        <p class="dempet">{t('begreper.ingen')}</p>
      ) : (
        <>
          <div class="felt">
            <label for={id}>{t('begreper.filtrer')}</label>
            <input id={id} type="search" autoComplete="off" value={filter} onInput={(e) => skrivFilter(e.currentTarget.value)} />
          </div>
          {/* Temaene står i en boks som er lukket til brukeren åpner den. Overskriften viser temaet som er valgt (eier 05.10.2026). */}
          <details class="veiviser-kilder begrepsfilter">
            <summary class="forklaring-knapp">
              <Ikon navn="filter" />
              <span>{t('begreper.tema.vis', { tema: t(`begreper.tema.${tema ?? 'alle'}`) })}</span>
              <Ikon navn="ned" class="forklaring-pil" />
            </summary>
            <div class="sokefilter" role="group" aria-label={t('begreper.tema.etikett')}>
              {[null, ...begrepstemaer].map((valg) => (
                <button key={valg ?? 'alle'} type="button" class="sokefilter-valg" aria-pressed={tema === valg} onClick={() => velgTema(valg)}>
                  {t(`begreper.tema.${valg ?? 'alle'}`)}{' '}
                  <span class="sokefilter-antall tall">{formaterTall(valg ? iTeksten.filter((b) => temaFor(b) === valg).length : iTeksten.length)}</span>
                </button>
              ))}
            </div>
          </details>
          {filtrert.length === 0 && (
            <p role="status">{f ? t('begreper.ingenTreff', { filter }) : t('begreper.tema.ingen')}</p>
          )}
          <ul class="liste">
            {filtrert.map((b) => (
              <li key={`${b.id}-${b.gyldighet.niva}`}>
                <a class="listelenke" href={`#/begreper/${b.id}`}>
                  <span class="listelenke-tekst">
                    <span class="listelenke-tittel">{b.tittel[malform]}</span>
                  </span>
                  <Ikon navn="hoyre" class="ikon-liten" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
