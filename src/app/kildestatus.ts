// Henter kildestatus én gang per økt. Appen henter bare sine egne statiske filer.
import { useEffect, useState } from 'preact/hooks';
import { lesKildestatus, type Kildestatusfil } from '../core/kildestatus/kildestatus.ts';

export type Lastet<T> = { tilstand: 'laster' } | { tilstand: 'ok'; data: T } | { tilstand: 'feil' };

let lopende: Promise<Kildestatusfil | null> | null = null;

export function hentKildestatus(): Promise<Kildestatusfil | null> {
  lopende ??= fetch(`${import.meta.env.BASE_URL}data/status/kildestatus.json`, { cache: 'no-cache' })
    .then((svar) => (svar.ok ? svar.json() : null))
    .then((data: unknown) => (data === null ? null : lesKildestatus(data)))
    .catch(() => null);
  return lopende;
}

export function useKildestatus(): Lastet<Kildestatusfil> {
  const [verdi, settVerdi] = useState<Lastet<Kildestatusfil>>({ tilstand: 'laster' });
  useEffect(() => {
    let aktiv = true;
    void hentKildestatus().then((fil) => {
      if (aktiv) settVerdi(fil ? { tilstand: 'ok', data: fil } : { tilstand: 'feil' });
    });
    return () => {
      aktiv = false;
    };
  }, []);
  return verdi;
}
