import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { oversiktsid } from '../../favoritter.ts';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentBegreper } from '../innhold.ts';

export default function Liste() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const id = useId();
  const [begreper, settBegreper] = useState<Innholdselement[] | null>(null);
  const [filter, settFilter] = useState('');

  useEffect(() => {
    void hentBegreper().then(settBegreper);
  }, []);

  const synlige = begreper ? velgSynlige(begreper, { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null }) : [];
  const f = filter.trim().toLowerCase();
  const filtrert = f
    ? synlige.filter((b) => [b.tittel.nb, b.tittel.nn, ...b.stikkord].some((s) => s.toLowerCase().includes(f)))
    : synlige;

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
            <input id={id} type="search" autoComplete="off" value={filter} onInput={(e) => settFilter(e.currentTarget.value)} />
          </div>
          {filtrert.length === 0 && <p role="status">{t('begreper.ingenTreff', { filter })}</p>}
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
