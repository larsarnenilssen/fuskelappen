// Flytting til jukselappen.no (eier 05.10.2026, avgjørelse 065). Når appen får eget domene, sender GitHub Pages den
// gamle adressen videre. En app som er lagt på hjemskjermen fra den gamle adressen, får ikke nye versjoner etter det
// (service workeren kan ikke oppdateres gjennom en videresending), og innstillingene og favorittene ligger igjen der,
// fordi lagringen hører til adressen. Appen på den gamle adressen ser derfor etter videresendingen og viser en lenke
// til den nye adressen med innstillingene og favorittene i lenken. Ingenting sendes andre steder.
import { lagEksport, lesEksport, type Lagret } from '../core/lagring/lagring.ts';

/** Parameteren i adressen på den nye adressen, under Innstillinger. */
export const FLYTTEPARAMETER = 'flytt';

function tilBase64url(tekst: string): string {
  const bytes = new TextEncoder().encode(tekst);
  let binar = '';
  for (const b of bytes) binar += String.fromCharCode(b);
  return btoa(binar).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fraBase64url(verdi: string): string {
  const b64 = verdi.replace(/-/g, '+').replace(/_/g, '/');
  const binar = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binar, (c) => c.charCodeAt(0)));
}

/** Lenken til Innstillinger på den nye adressen, med innstillingene og favorittene. */
export function flyttelenke(nyAdresse: string, data: Lagret, appversjon: string, naa: Date): string {
  const kopi = JSON.stringify(JSON.parse(lagEksport(data, appversjon, naa)));
  return `${nyAdresse}#/innstillinger?${FLYTTEPARAMETER}=${tilBase64url(kopi)}`;
}

/** Leser innstillingene og favorittene fra en flyttelenke. Null hvis verdien ikke kan leses. */
export function lesFlytting(verdi: string): Lagret | null {
  try {
    return lesEksport(fraBase64url(verdi));
  } catch {
    return null;
  }
}

/**
 * Er den gamle adressen sendt videre til den nye? Spør etter en fil som ikke finnes, uten å følge videresendingen:
 * før flyttingen gir det «ikke funnet», etter flyttingen en videresending. Bare på github.io, ellers aldri.
 */
export async function erFlyttet(vert: string): Promise<boolean> {
  if (!vert.endsWith('.github.io')) return false;
  try {
    const svar = await fetch(`${import.meta.env.BASE_URL}flyttet.txt?${Date.now()}`, { redirect: 'manual', cache: 'no-store' });
    return svar.type === 'opaqueredirect' || (svar.status >= 300 && svar.status < 400);
  } catch {
    return false;
  }
}
