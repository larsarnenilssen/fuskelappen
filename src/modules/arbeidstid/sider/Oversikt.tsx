// Oversikt over kalkulatorene i arbeidstidsmodulen.
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { kalkulatorer } from '../kalkulatorer.ts';

export default function Oversikt() {
  const { t } = useTekst();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('arbeidstid.tittel')}</h1>
      <p class="ingress">{t('arbeidstid.innledning')}</p>
      <h2>{t('arbeidstid.kalkulatorer.tittel')}</h2>
      <ul class="liste">
        {kalkulatorer.map((k) => (
          <li key={k.id}>
            <a class="listelenke" href={`#${k.rute}`}>
              <Ikon navn={k.ikon} />
              <span class="listelenke-tekst">
                <span class="listelenke-tittel">{t(k.tittel)}</span>
                <span class="listelenke-under">{t(k.beskrivelse)}</span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
