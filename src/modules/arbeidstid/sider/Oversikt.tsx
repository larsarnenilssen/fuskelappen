// Oversikt over arbeidstidsmodulen: arbeidsplanen som hovedkalkulator øverst, og de andre kalkulatorene under.
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { kalkulatorer } from '../kalkulatorer.ts';

/** Pynt på hovedkortet: en arbeidsplan med to fag, en funksjon og strek ved stillingen. Uten tall. */
function Stolpeillustrasjon() {
  return (
    <svg class="diagram hovedkort-figur" viewBox="0 0 320 22" aria-hidden="true" focusable="false">
      <rect class="figur-bakgrunn" x={0} y={2} width={300} height={16} rx={3} />
      <rect class="fordeling-del-undervisning" x={0} y={2} width={150} height={16} />
      <rect class="fordeling-del-annen_planfestet" x={150} y={2} width={90} height={16} />
      <rect class="fordeling-del-funksjonstid" x={240} y={2} width={40} height={16} />
      <line class="figur-grense" x1={300} x2={300} y1={0} y2={20} />
    </svg>
  );
}

export default function Oversikt() {
  const { t } = useTekst();
  const [hoved, ...andre] = kalkulatorer;
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('arbeidstid.tittel')}</h1>
      <p class="ingress">{t('arbeidstid.innledning')}</p>
      {hoved && (
        <a class="hovedkort" href={`#${hoved.rute}`}>
          <span class="hovedkort-topp">
            <Ikon navn={hoved.ikon} />
            <span class="hovedkort-tittel">{t(hoved.tittel)}</span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </span>
          <span class="hovedkort-tekst">{t(hoved.beskrivelse)}</span>
          <Stolpeillustrasjon />
        </a>
      )}
      <h2>{t('arbeidstid.kalkulatorer.flere')}</h2>
      <ul class="liste">
        {andre.map((k) => (
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
