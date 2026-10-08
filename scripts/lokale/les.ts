// Leser og sjekker de godkjente lokale reglene i lokale/regler.yaml (fase 9, avgjørelse 093). Brukes av bygget
// (data/lokale/regler.json) og av testene.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { finnFeil } from '../../src/core/lokale/regler.ts';
import { lokalefilSkjema, type GodkjentRegel } from '../../src/core/lokale/skjema.ts';
import { lesRegelsett } from '../innhold/alt.ts';

export const LOKALEFIL = 'lokale/regler.yaml';
/** Reglene ende-til-ende-testene bruker (bygget med --mode e2e), så testene ikke avhenger av ekte regler. */
export const TESTFIL = 'tests/fixtures/lokale/regler.yaml';

/** Nøklene til verdiene som kan være lokale (`lokal: true` i rules/), f.eks. «sfs2213.planfestet_timer». */
export function lokaleNokler(rot: string): Set<string> {
  const nokler = new Set<string>();
  for (const r of lesRegelsett(rot)) {
    if (r.gyldighet.niva !== 'nasjonal') continue;
    for (const [navn, v] of Object.entries(r.verdier)) if (v.lokal === true) nokler.add(`${r.regelverk}.${navn}`);
  }
  return nokler;
}

/** De godkjente reglene. Kaster en feil med alle feilene når filen ikke passer skjemaet eller reglene over. */
export function lesLokaleRegler(rot: string, relfil: string = LOKALEFIL): GodkjentRegel[] {
  const fil = join(rot, relfil);
  if (!existsSync(fil)) return [];
  const resultat = lokalefilSkjema.safeParse(parse(readFileSync(fil, 'utf8')));
  if (!resultat.success) throw new Error(`${relfil} passer ikke skjemaet: ${resultat.error.message}`);
  const feil = finnFeil(resultat.data.regler, lokaleNokler(rot));
  if (feil.length > 0) throw new Error(`${relfil}:\n${feil.join('\n')}`);
  return resultat.data.regler;
}
