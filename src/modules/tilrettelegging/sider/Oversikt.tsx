import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentInnhold, veiviserRute, type Veiviserinnhold } from '../innhold.ts';

export default function Oversikt() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Veiviserinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('tilrettelegging.tittel')}</h1>
      <p class="ingress">{t('tilrettelegging.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <section>
          <h2 class="liten-overskrift">{t('tilrettelegging.veivisere')}</h2>
          <ul class="liste">
            {velgSynlige(innhold.veivisere, sted).map((v) => (
              <li key={v.id}>
                <a class="listelenke veiviser-inngang" href={`#${veiviserRute(v.id)}`}>
                  <span class="listelenke-tekst">
                    <span class="listelenke-tittel">{v.tittel[malform]}</span>
                    {v.faser.length > 0 && (
                      <span class="veiviser-inngang-faser" aria-hidden="true">
                        {v.faser.map((f) => (
                          <span key={f.id}>{f.tittel[malform]}</span>
                        ))}
                      </span>
                    )}
                  </span>
                  <Ikon navn="hoyre" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
