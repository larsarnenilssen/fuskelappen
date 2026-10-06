// Favorittene i Opplæringsløp (avgjørelse 058): sidene, og skolene og opplæringskontorene i registrene med den
// diskré stjernen. Id-ene til programmene og tilbudene er de samme som i søket.
import type { Underside } from '../typer.ts';

export const skolefavoritt = (nr: string) => `opplaeringslop:skole:${nr}`;
export const kontorfavoritt = (orgnr: string) => `opplaeringslop:kontor:${orgnr}`;
export const skolerute = (nr: string) => `/opplaeringslop/skoler?fylke=alle&skole=${nr}`;
export const kontorrute = (orgnr: string) => `/opplaeringslop/opplaeringskontor?fylke=alle&kontor=${orgnr}`;

/** Lenkene med ikon på oversiktssiden. Oversikten og favorittene henter ikonet herfra (`undersider`). */
export const UNDERSIDER = {
  lop: { rute: '/opplaeringslop/lop', ikon: 'veiviser' },
  fagbrev: { rute: '/opplaeringslop/fag-og-svennebrev', ikon: 'vei' },
  skoler: { rute: '/opplaeringslop/skoler', ikon: 'skole' },
  kontor: { rute: '/opplaeringslop/opplaeringskontor', ikon: 'kontor' },
} as const satisfies Record<string, Underside>;
