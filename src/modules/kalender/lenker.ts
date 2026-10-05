// Lenkene fra en dato i kalenderen til sider, veivisere og begreper i appen (avgjørelse 066). Tittelen og typen hentes
// fra søkeoppføringene til modulen adressen hører til, så teksten bare står ett sted. Lastes når et kort åpnes.
import type { Flerspraak } from '../../core/innhold/skjema.ts';
import type { Sokeoppforing, Sokeoppforingstype } from '../../core/sok/sok.ts';
import { aktiveModuler } from '../register.ts';

export interface Kalenderlenke {
  rute: string;
  tittel: Flerspraak;
  type: Sokeoppforingstype;
}

const lastet = new Map<string, Promise<Sokeoppforing[]>>();

function oppforingerFor(modulId: string): Promise<Sokeoppforing[]> {
  let p = lastet.get(modulId);
  if (!p) {
    const m = aktiveModuler.find((x) => x.id === modulId);
    p = m ? m.sokeoppforinger() : Promise.resolve([]);
    lastet.set(modulId, p);
  }
  return p;
}

/** Lenkene med tittel og type. Adresser uten søkeoppføring er ikke med (testen krever at alle finnes). */
export async function finnLenker(ruter: readonly string[]): Promise<Kalenderlenke[]> {
  const funnet = await Promise.all(
    ruter.map(async (rute) => {
      const modulId = rute.split(/[/?]/)[1] ?? '';
      const o = (await oppforingerFor(modulId)).find((x) => x.rute === rute);
      return o ? { rute, tittel: o.tittel, type: o.type } : null;
    }),
  );
  return funnet.filter((l): l is Kalenderlenke => l !== null);
}
