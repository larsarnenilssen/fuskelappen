// Henter de aktive opplæringskontorene fra Nasjonalt organisasjonsregister for fag- og yrkesopplæring (NOR, Udir)
// til data/udir/opplaeringskontor.json (avgjørelse 053). Kjøres hver uke av kildesjekken. Dataene er åpne
// (NLOD). NOR sier ikke hvilke lærefag et kontor har, så appen viser kontorene per fylke.
// Feiler hentingen, eller ser dataene feil ut, kastes en feil før noe skrives, og forrige fil blir stående.
// Bruk: npm run hent:nor
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { opplaeringskontorerSkjema, type Opplaeringskontorer } from '../src/modules/opplaeringslop/nor/skjema.ts';
import { hentJson, iRunder, lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import { byggOpplaeringskontor, type Norenhet, sammenlignOpplaeringskontor, validerOpplaeringskontor } from './nor/bygg.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const NOR_API = 'https://data-nor.udir.no/v4';

interface Side {
  AntallSider: number;
  EnhetListe: (Norenhet & { ErAktiv: boolean; ErOpplaeringskontor: boolean })[];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hentet = new Date().toISOString();
  const forste = (await hentJson(`${NOR_API}/enheter?sidenummer=1`)) as Side;
  if (!Array.isArray(forste.EnhetListe) || typeof forste.AntallSider !== 'number') throw new Error('Uventet svar fra NOR.');
  const sider = [forste];
  for (let s = 2; s <= Math.min(forste.AntallSider, 20); s++) sider.push((await hentJson(`${NOR_API}/enheter?sidenummer=${s}`)) as Side);
  const aktive = sider.flatMap((s) => s.EnhetListe).filter((e) => e.ErAktiv && e.ErOpplaeringskontor);
  // Detaljene (fylke, kommune, nettside, godkjenning) står bare på hver enhet.
  const enheter = (await iRunder(aktive, 6, (e) => hentJson(`${NOR_API}/enhet/${e.Organisasjonsnummer}`))) as Norenhet[];
  const data = byggOpplaeringskontor(enheter, hentet);
  opplaeringskontorerSkjema.parse(data);
  const feil = validerOpplaeringskontor(data);
  if (feil.length > 0) throw new Error(`Opplæringskontorene fra NOR ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige fil.`);
  const fil = join(rot, 'data/udir/opplaeringskontor.json');
  const forrige = lesForrige<Opplaeringskontorer>(fil);
  const endringer = sammenlignOpplaeringskontor(forrige, data);
  const endret = skrivHvisEndret(fil, forrige, data);
  skrivEndringer(rot, 'nor', { endret, forste: !forrige, endringer });
  console.log(`NOR: ${data.kontor.length} aktive opplæringskontorer. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}`);
}
