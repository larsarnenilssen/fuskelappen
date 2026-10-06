// Henter resultatene fra Elevundersøkelsen i videregående fra Udirs statistikkbank (NLOD, avgjørelse 077) til
// data/elevundersokelsen/resultater.json. Kjøres hver uke av kildesjekken. Undersøkelsen kommer én gang i året, så
// filen endres bare når det er nye tall.
//
// - Tabell 152 har indeksene (skala 1–5) og tabell 154 mobbing (andel i prosent). Udir skriver at API-et ikke er
//   ment for ekstern bruk ennå og kan endres uten varsel. Ser svaret feil ut, kastes en feil før noe skrives, og
//   forrige fil blir stående.
// - De to siste skoleårene, alle trinn, alle kjønn og alle utdanningsprogram. Landet og fylkene for alle, offentlige
//   og private skoler, skolene for alle eierformer.
// - Flere verdier i ett filter skilles med «_» (ikke komma, som dokumentasjonen sier).
// Bruk: npm run hent:elevundersokelsen
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { type Elevundersokelsen, elevundersokelsenSkjema } from '../src/modules/skolemiljo/elevundersokelsen/skjema.ts';
import { hentJson, lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import { byggResultater, type Rad, sammenlignResultater, type Sporsmal, validerResultater } from './elevundersokelsen/bygg.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const STATISTIKKBANKEN = 'https://api.statistikkbanken.udir.no/api/rest/v2/Eksport';
const INDEKSER = 152;
const MOBBING = 154;

interface Filterverdi {
  id: number;
  kode: string;
  navn: string;
}

async function filterverdier(tabell: number): Promise<Record<string, Filterverdi[]>> {
  const d = (await hentJson(`${STATISTIKKBANKEN}/${tabell}/filterVerdier`)) as Record<string, Filterverdi[]>;
  if (!Array.isArray(d.TidID) || !Array.isArray(d.SpoersmaalID)) throw new Error(`Uventet svar fra statistikkbanken (tabell ${tabell}, filterVerdier).`);
  return d;
}

/** Alle radene for et filter, side for side. Antallet sider kommer fra sideData, fordi en side for mye gir siste side på nytt. */
async function rader(tabell: number, filter: string): Promise<Rad[]> {
  const svar = (await hentJson(`${STATISTIKKBANKEN}/${tabell}/sideData?filter=${filter}`)) as { JSONSider?: number }[];
  const sider = Array.isArray(svar) ? svar[0]?.JSONSider : undefined;
  if (sider === undefined || !Number.isInteger(sider) || sider < 1 || sider > 50) throw new Error(`Uventet antall sider fra statistikkbanken: ${JSON.stringify(svar).slice(0, 200)}`);
  const ut: Rad[] = [];
  for (let s = 1; s <= sider; s++) {
    const side = (await hentJson(`${STATISTIKKBANKEN}/${tabell}/data?filter=${filter}&sideNummer=${s}&format=0`)) as Rad[];
    if (!Array.isArray(side)) throw new Error(`Uventet svar fra statistikkbanken (tabell ${tabell}, side ${s}).`);
    ut.push(...side);
  }
  return ut;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hentet = new Date().toISOString();
  const fylker = new Set((parse(readFileSync(join(rot, 'content/fylker.yaml'), 'utf8')) as { fylker: { nummer: string }[] }).fylker.map((f) => f.nummer));
  const [fi, fm] = await Promise.all([filterverdier(INDEKSER), filterverdier(MOBBING)]);
  // De to siste skoleårene (TidID 202512 er 2025–26).
  const tider = [...(fi.TidID ?? [])].sort((a, b) => b.id - a.id).slice(0, 2).reverse();
  const indekser = (fi.SpoersmaalID ?? []).filter((s) => s.kode.startsWith('EUIndeks_'));
  const mobbing = (fm.SpoersmaalID ?? []).filter((s) => s.id !== -10);
  if (tider.length < 2 || indekser.length < 5 || mobbing.length < 1) throw new Error('Statistikkbanken har ikke skoleårene, indeksene eller mobbing som ventet.');
  const sporsmal: Sporsmal[] = [
    ...mobbing.map((s) => ({ kode: s.kode, navn: s.navn.trim(), type: 'mobbing' as const })),
    ...indekser.map((s) => ({ kode: s.kode, navn: s.navn.trim(), type: 'indeks' as const })),
  ];
  const felles = 'KjoennID(-10)_ProgramomraadeID(-10)_EierformID(-10_2_8)';
  const alle: Rad[] = [];
  for (const t of tider) {
    alle.push(...(await rader(INDEKSER, `TidID(${t.id})_SpoersmaalID(${indekser.map((s) => s.id).join('_')})_${felles}`)));
    alle.push(...(await rader(MOBBING, `TidID(${t.id})_SpoersmaalID(${mobbing.map((s) => s.id).join('_')})_${felles}`)));
  }
  const data = byggResultater(alle, { skolear: tider.map((t) => t.navn), sporsmal, fylker, kilde: 'udir-elevundersokelsen', hentet });
  elevundersokelsenSkjema.parse(data);
  const feil = validerResultater(data);
  if (feil.length > 0) throw new Error(`Resultatene fra Elevundersøkelsen ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige fil.`);
  const fil = join(rot, 'data/elevundersokelsen/resultater.json');
  const forrige = lesForrige<Elevundersokelsen>(fil);
  const endringer = sammenlignResultater(forrige, data);
  const endret = skrivHvisEndret(fil, forrige, data);
  skrivEndringer(rot, 'elevundersokelsen', { endret, forste: !forrige, endringer });
  const skoler = Object.keys(data.enheter).filter((k) => k.startsWith('S')).length;
  console.log(`Elevundersøkelsen: ${data.skolear.join(' og ')}, ${sporsmal.length} indekser og spørsmål, ${skoler} skoler. ${forrige ? `${endringer.length} endringer.` : 'Første henting.'}`);
}
