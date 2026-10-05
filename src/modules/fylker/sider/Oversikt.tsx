// Fylkene (avgjørelse 061): listen over fylkene, med fylket brukeren har valgt øverst. Hvert fylke har egen side.
import { fylker } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { fylkeFor, fylkeRute } from '../innhold.ts';

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const liste = fylker
    .flatMap((f) => {
      const o = fylkeFor(f.nummer);
      return o ? [{ nummer: f.nummer, navn: o.navn }] : [];
    })
    .sort((a, b) => Number(b.nummer === innstillinger.fylke) - Number(a.nummer === innstillinger.fylke) || a.navn.localeCompare(b.navn, 'nb'));
  return (
    <div class="side">
      <Sidetopp tittel={t('fylker.tittel')} favoritt={oversiktsid('fylker')} />
      <p class="ingress">{t('fylker.innledning')}</p>
      <ul class="liste">
        {liste.map((f) => (
          <li key={f.nummer}>
            <a class="listelenke" href={`#${fylkeRute(f.nummer)}`}>
              <Ikon navn="kontor" />
              <span class="listelenke-tekst">
                <span class="listelenke-tittel">{f.navn}</span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
