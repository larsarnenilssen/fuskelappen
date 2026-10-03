// Henter fagene på NDLA (Nasjonal digital læringsarena) til data/ndla/fag.json (avgjørelse 053): hvilke fag på
// ndla.no som oppgir en fagkode i Grep, med navn og sti. Fagarket lenker til faget på NDLA. Kjøres hver uke av
// kildesjekken. Taksonomien er åpen (api.ndla.no), og innholdet er lisensiert CC BY 4.0. Appen bruker bare navnet og
// lenken. Feiler hentingen, eller ser dataene feil ut, kastes en feil før noe skrives, og forrige fil blir stående.
// Bruk: npm run hent:ndla
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ndlaSkjema, type Ndla } from '../src/modules/fag/ndla/skjema.ts';
import { lesFagindeks } from './data/les.ts';
import { hentJson, lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import { byggNdla, type Ndlanode, sammenlignNdla, validerNdla } from './ndla/bygg.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const NDLA_API = 'https://api.ndla.no/taxonomy/v1/nodes?nodeType=SUBJECT&language=nb';

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hentet = new Date().toISOString();
  const noder = await hentJson(NDLA_API);
  if (!Array.isArray(noder)) throw new Error(`Uventet svar fra ${NDLA_API}.`);
  const ndla = byggNdla(noder as Ndlanode[], new Set(Object.keys(lesFagindeks(rot).fag)), hentet);
  ndlaSkjema.parse(ndla);
  const feil = validerNdla(ndla);
  if (feil.length > 0) throw new Error(`Fagene fra NDLA ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige fil.`);
  const fil = join(rot, 'data/ndla/fag.json');
  const forrige = lesForrige<Ndla>(fil);
  const endringer = sammenlignNdla(forrige, ndla);
  const endret = skrivHvisEndret(fil, forrige, ndla);
  skrivEndringer(rot, 'ndla', { endret, forste: !forrige, endringer });
  console.log(`NDLA: ${Object.keys(ndla.fag).length} fagkoder med fag på NDLA. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}`);
}
