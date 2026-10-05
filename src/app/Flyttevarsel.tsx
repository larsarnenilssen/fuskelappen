// Varsel på den gamle adressen når appen har flyttet til jukselappen.no (avgjørelse 065). Lenken tar med
// innstillingene og favorittene. Varselet vises igjen hver gang appen åpnes på den gamle adressen.
import { useEffect, useState } from 'preact/hooks';
import { app } from '../config/app.ts';
import { erFlyttet, flyttelenke } from './flytting.ts';
import { tilstand, useTekst, useTilstand } from './tilstand.ts';

export function Flyttevarsel() {
  const { t } = useTekst();
  useTilstand();
  const [flyttet, settFlyttet] = useState(false);

  useEffect(() => {
    void erFlyttet(location.hostname).then(settFlyttet);
  }, []);

  if (!flyttet) return null;
  const ny = `${app.adresse}${__TESTVERSJON__ ? 'test/' : ''}`;
  return (
    <div class="varsel" role="status">
      <p>{t('flytting.tekst', { app: app.navn, adresse: ny.replace(/^https:\/\//, '').replace(/\/$/, '') })}</p>
      <div class="varsel-knapper">
        <a class="knapp" href={flyttelenke(ny, tilstand.data, __APP_VERSJON__, new Date())}>
          {t('flytting.apne')}
        </a>
        <button type="button" class="knapp knapp-sekundaer" onClick={() => settFlyttet(false)}>
          {t('oppdatering.lukk')}
        </button>
      </div>
    </div>
  );
}
