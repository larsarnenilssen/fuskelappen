// Henter tallene fra SSBs statistikkbank til Videregående i tall (CC BY 4.0, eier 08.10.2026, avgjørelse 090) til
// data/statistikk/ssb.json. Kjøres hver uke av kildesjekken, etter tallene fra Udir.
//
// - API-et er PxWebApi v2 (data.ssb.no/api/pxwebapi/v2), json-stat2. SSB tillater 30 kall i minuttet. Skriptet gjør
//   13 kall med minst 2,5 sekunder mellom.
// - Årene velges med top(n), så nye årganger kommer med av seg selv når SSB publiserer dem. Tabellene oppdateres en
//   gang i året på ulike tidspunkter (befolkningen i februar, KOSTRA i mars og juni, lærerne i juli, grunnskolepoengene
//   i august og unge utenfor i september). Den ukentlige hentingen tar dem inn innen en uke.
// - Ser svaret feil ut, kastes en feil før noe skrives, og forrige fil blir stående.
// - Fylkene med sammenhengende serier bakover (agg_KommFylker) finnes bare i tabellene på kommunenivå (07459 og
//   13563). I de andre har de nye fylkene fra 2024 tall bare fra 2024.
// Bruk: npm run hent:ssb
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { type Ssb, ssbSkjema } from '../src/core/statistikk/ssb-skjema.ts';
import { hentJson, lesForrige, skrivEndringer, skrivHvisEndret } from './data/hent.ts';
import { andel, harForelopigSisteAar, kostraKode, lesJsonStat, type SsbTabell, sporring, sum } from './statistikk/ssb.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
export const SSB_API = 'https://data.ssb.no/api/pxwebapi/v2';

/** Tabellene skriptet henter, med navnet de har i `bygg`. */
export const TABELLER = {
  befolkning: '07459',
  befolkningLandet: '07459',
  framskriving: '14746',
  utenforHistorikk: '13563',
  utenforHistorikkLandet: '13563',
  utenfor: '13556',
  grunnskolepoeng: '07495',
  utgifter: '12399',
  kostra: '12609',
  laerereUtdanning: '12091',
  laerereKjonn: '12697',
  deltakelse: '12274',
  deltakelseLandet: '09382',
} as const;
export type Tabellnavn = keyof typeof TABELLER;

const ALDER_16_18 = ['016', '017', '018'];
const KOMPETANSE = ['FC011', 'FC012', 'FC02', 'FC031', 'FC032', 'FC04', 'FC05'];

/** Spørringene, gitt fylkene og årene for framskrivingen (fra det siste registrerte året og 14 år fram). */
export function sporringer(fylker: readonly string[], framskrivingAar: readonly string[]): Record<Exclude<Tabellnavn, 'framskriving'>, string> & { framskriving: string } {
  const region = ['0', ...fylker];
  const kostra = ['EAFK', ...fylker.map((f) => `${f}00`)];
  const komm = { 'codelist[Region]': 'agg_KommFylker', Region: '*', 'outputValues[Region]': 'aggregated' };
  return {
    befolkning: sporring({ ...komm, Kjonn: ['1', '2'], Alder: ALDER_16_18, ContentsCode: 'Personer1', Tid: 'top(11)' }),
    befolkningLandet: sporring({ Region: '0', Kjonn: ['1', '2'], Alder: ALDER_16_18, ContentsCode: 'Personer1', Tid: 'top(11)' }),
    framskriving: sporring({ Region: region, Kjonn: ['1', '2'], Alder: ALDER_16_18, ContentsCode: 'Personer', Tid: framskrivingAar }),
    utenforHistorikk: sporring({ ...komm, HovArbStyrkStatus: ['NEET2', 'TOT'], Alder: '15-29', InnvandrKat: ['A-G', 'B', 'A_C-G'], ContentsCode: 'Bosatte', Tid: 'top(11)' }),
    utenforHistorikkLandet: sporring({ Region: '0', HovArbStyrkStatus: ['NEET2', 'TOT'], Alder: '15-29', InnvandrKat: ['A-G', 'B', 'A_C-G'], ContentsCode: 'Bosatte', Tid: 'top(11)' }),
    utenfor: sporring({ Region: region, Kjonn: '0', Alder: ['15-29', '15-19', '20-24', '25-29'], HovArbStyrkStatus: 'NEET', ContentsCode: ['Bosatte', 'BosatteProsent'], Tid: 'top(1)' }),
    grunnskolepoeng: sporring({ Region: region, Kjonn: ['0', '10', '11'], ForeldrUtd: '00', ContentsCode: 'Grunnskolepoeng', Tid: 'top(8)' }),
    utgifter: sporring({ KOKfylkesregion0000: kostra, KOKfunksjon0000: 'FGF7d', KOKart0000: 'AGD33', ContentsCode: 'KOSutgperbrukerv0000', Tid: 'top(5)' }),
    kostra: sporring({ KOKfylkesregion0000: kostra, ContentsCode: 'KOSelevperlarsv0000', Tid: 'top(5)' }),
    laerereUtdanning: sporring({ Region: region, PedagogiskUtd: ['00', '90'], Alder: ['999A', '029a', '30-39', '40-49', '50-59', '060+'], ContentsCode: 'Laerere', Tid: 'top(7)' }),
    laerereKjonn: sporring({ Region: region, Kjonn: ['0', '2'], Alder: '999A', Kompetanse: KOMPETANSE, ContentsCode: 'Laerere', Tid: 'top(1)' }),
    deltakelse: sporring({ KOKinnvandringka0000: ['0', 'J', 'N'], KOKutdstatus0000: 'I', KOKfylkesregion0000: kostra, ContentsCode: 'KOSand16180000', Tid: 'top(6)' }),
    deltakelseLandet: sporring({ InnvandrKat2008: ['B', 'C'], Kjonn: '0', ContentsCode: 'Elever', Tid: 'top(1)' }),
  };
}

const sisteAv = (t: SsbTabell) => t.koder('Tid').at(-1) ?? '';
const tilAar = (koder: readonly string[]) => koder.map(Number);
const enRad = <T>(enheter: readonly string[], f: (e: string) => T): Record<string, T> => Object.fromEntries(enheter.map((e) => [e, f(e)]));

/** Lager dataene fra tabellene. Ren funksjon, testet med små tabeller i tests/unit/ssb.test.ts. */
export function bygg(t: Record<Tabellnavn, SsbTabell>, fylker: readonly string[], hentet: string): Ssb {
  const enheter = ['L', ...fylker.map((f) => `F${f}`)];
  const regionKode = (e: string) => (e === 'L' ? '0' : e.slice(1));
  const kommKode = (e: string) => (e === 'L' ? '0' : `F-${e.slice(1)}`);

  // 1. Ungdomskullene: registrert (07459) og framskrevet (14746) etter det siste registrerte året.
  const regAar = t.befolkning.koder('Tid');
  const sisteReg = regAar.at(-1) ?? '';
  const framAar = t.framskriving.koder('Tid').filter((a) => Number(a) > Number(sisteReg));
  const kull = (tab: SsbTabell, region: string, tid: string, innhold: string) =>
    sum(['1', '2'].flatMap((k) => ALDER_16_18.map((a) => tab.verdi({ Region: region, Kjonn: k, Alder: a, ContentsCode: innhold, Tid: tid }))));
  const ungdomskull = {
    aar: tilAar([...regAar, ...framAar]),
    framskrevetFra: Number(sisteReg),
    verdier: enRad(enheter, (e) => [
      ...regAar.map((tid) => (e === 'L' ? kull(t.befolkningLandet, '0', tid, 'Personer1') : kull(t.befolkning, kommKode(e), tid, 'Personer1'))),
      ...framAar.map((tid) => kull(t.framskriving, regionKode(e), tid, 'Personer')),
    ]),
  };

  // 2. Unge utenfor arbeid og utdanning: serien fra 13563 (sammenhengende for dagens fylker), aldersgruppene og
  //    antallet det siste året fra 13556.
  const uAar = t.utenforHistorikk.koder('Tid');
  const uSiste = uAar.at(-1) ?? '';
  const neet = (e: string, kat: string, tid: string) => {
    const tab = e === 'L' ? t.utenforHistorikkLandet : t.utenforHistorikk;
    const v = (s: string) => tab.verdi({ Region: kommKode(e), HovArbStyrkStatus: s, Alder: '15-29', InnvandrKat: kat, ContentsCode: 'Bosatte', Tid: tid });
    return andel(v('NEET2'), v('TOT'));
  };
  const u = t.utenfor;
  const uTid = sisteAv(u);
  const uVerdi = (e: string, alder: string, innhold: string) => u.verdi({ Region: regionKode(e), Kjonn: '0', Alder: alder, HovArbStyrkStatus: 'NEET', ContentsCode: innhold, Tid: uTid });
  const utenfor = {
    aar: tilAar(uAar),
    forelopig: harForelopigSisteAar(t.utenforHistorikk),
    prosent: enRad(enheter, (e) => uAar.map((tid) => neet(e, 'A-G', tid))),
    antall: enRad(enheter, (e) => uVerdi(e, '15-29', 'Bosatte')),
    alder: enRad(enheter, (e) => ({ '15-19': uVerdi(e, '15-19', 'BosatteProsent'), '20-24': uVerdi(e, '20-24', 'BosatteProsent'), '25-29': uVerdi(e, '25-29', 'BosatteProsent') })),
    innvandrere: enRad(enheter, (e) => neet(e, 'B', uSiste)),
    ovrige: enRad(enheter, (e) => neet(e, 'A_C-G', uSiste)),
  };

  // 3. Grunnskolepoeng. Et fylke som ikke fantes et år, har 0 hos SSB.
  const gAar = t.grunnskolepoeng.koder('Tid');
  const poeng = (e: string, kjonn: string, tid: string) => {
    const v = t.grunnskolepoeng.verdi({ Region: regionKode(e), Kjonn: kjonn, ForeldrUtd: '00', ContentsCode: 'Grunnskolepoeng', Tid: tid });
    return v === 0 ? null : v;
  };
  const gSiste = gAar.at(-1) ?? '';
  const grunnskolepoeng = {
    aar: tilAar(gAar),
    poeng: enRad(enheter, (e) => gAar.map((tid) => poeng(e, '0', tid))),
    jenter: enRad(enheter, (e) => poeng(e, '11', gSiste)),
    gutter: enRad(enheter, (e) => poeng(e, '10', gSiste)),
  };

  // 4. KOSTRA: utgifter per elev i skole (12399) og elever per lærerårsverk (12609).
  const kAar = t.utgifter.koder('Tid');
  const kostnad = {
    aar: tilAar(kAar),
    perElev: enRad(enheter, (e) =>
      kAar.map((tid) => t.utgifter.verdi({ KOKfylkesregion0000: kostraKode(e), KOKfunksjon0000: 'FGF7d', KOKart0000: 'AGD33', ContentsCode: 'KOSutgperbrukerv0000', Tid: tid })),
    ),
    elevPerLaerer: enRad(enheter, (e) => kAar.map((tid) => (t.kostra.koder('Tid').includes(tid) ? t.kostra.verdi({ KOKfylkesregion0000: kostraKode(e), ContentsCode: 'KOSelevperlarsv0000', Tid: tid }) : null))),
  };

  // 5. Lærerne: antall, alder og pedagogisk utdanning fra 12091 (totalen er oppgitt der), kjønn fra 12697, der
  //    kompetansen ikke har noen total og summeres.
  const lAar = t.laerereUtdanning.koder('Tid');
  const lSiste = lAar.at(-1) ?? '';
  const lv = (e: string, utd: string, alder: string, tid: string) => t.laerereUtdanning.verdi({ Region: regionKode(e), PedagogiskUtd: utd, Alder: alder, ContentsCode: 'Laerere', Tid: tid });
  const kjonn = (e: string, k: string) => sum(KOMPETANSE.map((kp) => t.laerereKjonn.verdi({ Region: regionKode(e), Kjonn: k, Alder: '999A', Kompetanse: kp, ContentsCode: 'Laerere', Tid: sisteAv(t.laerereKjonn) })));
  const laerere = {
    aar: tilAar(lAar),
    antall: enRad(enheter, (e) => lAar.map((tid) => lv(e, '00', '999A', tid))),
    andel60: enRad(enheter, (e) => lAar.map((tid) => andel(lv(e, '00', '060+', tid), lv(e, '00', '999A', tid)))),
    alder: enRad(enheter, (e) => {
      const alle = lv(e, '00', '999A', lSiste);
      return {
        under30: andel(lv(e, '00', '029a', lSiste), alle),
        fra30til49: andel(sum([lv(e, '00', '30-39', lSiste), lv(e, '00', '40-49', lSiste)]), alle),
        fra50til59: andel(lv(e, '00', '50-59', lSiste), alle),
        fra60: andel(lv(e, '00', '060+', lSiste), alle),
      };
    }),
    kvinner: enRad(enheter, (e) => andel(kjonn(e, '2'), kjonn(e, '0'))),
    pedagogisk: enRad(enheter, (e) => {
      const uten = andel(lv(e, '90', '999A', lSiste), lv(e, '00', '999A', lSiste));
      return uten === null ? null : Math.round((100 - uten) * 10) / 10;
    }),
  };

  // 6. Deltakelsen: andelen 16–18-åringer i videregående (12274), og innvandrere og norskfødte for landet (09382).
  const dAar = t.deltakelse.koder('Tid');
  const dSiste = dAar.at(-1) ?? '';
  const dv = (e: string, kat: string, tid: string) => t.deltakelse.verdi({ KOKinnvandringka0000: kat, KOKutdstatus0000: 'I', KOKfylkesregion0000: kostraKode(e), ContentsCode: 'KOSand16180000', Tid: tid });
  const dl = (kat: string) => t.deltakelseLandet.verdi({ InnvandrKat2008: kat, Kjonn: '0', ContentsCode: 'Elever', Tid: sisteAv(t.deltakelseLandet) });
  const deltakelse = {
    aar: tilAar(dAar),
    alle: enRad(enheter, (e) => dAar.map((tid) => dv(e, '0', tid))),
    innvandringsbakgrunn: enRad(enheter, (e) => dv(e, 'J', dSiste)),
    ovrige: enRad(enheter, (e) => dv(e, 'N', dSiste)),
    landet: { innvandrere: dl('B'), norskfodte: dl('C') },
  };

  const tabeller: Record<string, string | null> = {};
  for (const [navn, id] of Object.entries(TABELLER)) tabeller[id] ??= t[navn as Tabellnavn].oppdatert;
  return { kilde: 'ssb-statistikkbanken', hentet, tabeller, ungdomskull, utenfor, grunnskolepoeng, kostnad, laerere, deltakelse };
}

/** Feil i tallene som betyr at tabellene er endret: landet og alle fylkene må ha tall det siste året, og andelene må være prosent. */
export function validerSsb(d: Ssb, fylker: readonly string[]): string[] {
  const feil: string[] = [];
  const enheter = ['L', ...fylker.map((f) => `F${f}`)];
  const sjekk = (navn: string, verdier: Record<string, readonly (number | null)[] | number | null>, min: number, maks: number) => {
    for (const e of enheter) {
      const v = verdier[e];
      const siste = Array.isArray(v) ? v.at(-1) : v;
      if (typeof siste !== 'number') feil.push(`${navn} mangler for ${e}.`);
      else if (siste < min || siste > maks) feil.push(`${navn} for ${e} er ${siste}, utenfor ${min}–${maks}.`);
    }
  };
  const fram = d.ungdomskull.aar.indexOf(d.ungdomskull.framskrevetFra);
  if (fram < 5 || fram >= d.ungdomskull.aar.length - 5) feil.push(`Ungdomskullene har ${fram + 1} registrerte år av ${d.ungdomskull.aar.length}.`);
  sjekk('Ungdomskullene', d.ungdomskull.verdier, 1000, 400_000);
  sjekk('Unge utenfor', d.utenfor.prosent, 1, 40);
  sjekk('Grunnskolepoengene', d.grunnskolepoeng.poeng, 30, 55);
  sjekk('Utgiftene per elev', d.kostnad.perElev, 50_000, 600_000);
  sjekk('Elever per lærerårsverk', d.kostnad.elevPerLaerer, 2, 30);
  sjekk('Lærerne', d.laerere.antall, 100, 60_000);
  sjekk('Lærerne 60 år og eldre', d.laerere.andel60, 1, 50);
  sjekk('Deltakelsen', d.deltakelse.alle, 50, 100);
  // Fylkene skal til sammen være omtrent like mange 16–18-åringer som landet (registrert det siste året).
  const sumFylker = fylker.reduce((s, f) => s + (d.ungdomskull.verdier[`F${f}`]?.[fram] ?? 0), 0);
  const landet = d.ungdomskull.verdier.L?.[fram] ?? 0;
  if (Math.abs(sumFylker - landet) > landet * 0.01) feil.push(`Fylkene har ${sumFylker} 16–18-åringer, landet ${landet}.`);
  return feil;
}

/** Endringene fra forrige henting til kildesjekken: nye årganger per del. */
export function endringerSsb(forrige: Ssb, ny: Ssb): string[] {
  const deler = [
    ['Ungdomskullene', forrige.ungdomskull.framskrevetFra, ny.ungdomskull.framskrevetFra],
    ['Unge utenfor', forrige.utenfor.aar.at(-1), ny.utenfor.aar.at(-1)],
    ['Grunnskolepoengene', forrige.grunnskolepoeng.aar.at(-1), ny.grunnskolepoeng.aar.at(-1)],
    ['Utgiftene per elev', forrige.kostnad.aar.at(-1), ny.kostnad.aar.at(-1)],
    ['Lærerne', forrige.laerere.aar.at(-1), ny.laerere.aar.at(-1)],
    ['Deltakelsen', forrige.deltakelse.aar.at(-1), ny.deltakelse.aar.at(-1)],
  ] as const;
  const ut = deler.filter(([, f, n]) => f !== n).map(([navn, , n]) => `${navn}: nye tall for ${n}.`);
  const tabeller = Object.entries(ny.tabeller).filter(([id, tid]) => forrige.tabeller[id] !== tid);
  if (ut.length === 0 && tabeller.length > 0) ut.push(`SSB har oppdatert tabell ${tabeller.map(([id]) => id).join(', ')}.`);
  return ut;
}

let sistKall = 0;
/** Én tabell fra SSB, med minst 2,5 sekunder mellom kallene (SSB tillater 30 i minuttet). */
async function hentTabell(id: string, sporsmal: string): Promise<SsbTabell> {
  const vent = sistKall + 2500 - Date.now();
  if (vent > 0) await new Promise((v) => setTimeout(v, vent));
  sistKall = Date.now();
  return lesJsonStat(await hentJson(`${SSB_API}/tables/${id}/data?lang=no&outputFormat=json-stat2&${sporsmal}`));
}

export async function hent(fylker: readonly string[]): Promise<Ssb> {
  // Framskrivingen hentes fra det siste registrerte året i befolkningen og 14 år fram.
  const befolkning = await hentTabell(TABELLER.befolkning, sporringer(fylker, []).befolkning);
  const siste = Number(sisteAv(befolkning));
  const framAar = Array.from({ length: 15 }, (_, i) => String(siste + i));
  const s = sporringer(fylker, framAar);
  const t = { befolkning } as Record<Tabellnavn, SsbTabell>;
  for (const navn of Object.keys(TABELLER) as Tabellnavn[]) {
    if (navn !== 'befolkning') t[navn] = await hentTabell(TABELLER[navn], s[navn]);
  }
  return bygg(t, fylker, new Date().toISOString());
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fylker = (parse(readFileSync(join(rot, 'content/fylker.yaml'), 'utf8')) as { fylker: { nummer: string }[] }).fylker.map((f) => f.nummer);
  const data = await hent(fylker);
  ssbSkjema.parse(data);
  const feil = validerSsb(data, fylker);
  if (feil.length > 0) throw new Error(`Tallene fra SSB ser ikke ut som ventet: ${feil.join(' ')} Beholder forrige fil.`);
  const fil = join(rot, 'data/statistikk/ssb.json');
  const forrige = lesForrige<Ssb>(fil);
  const endret = skrivHvisEndret(fil, forrige, data);
  skrivEndringer(rot, 'ssb', { endret, forste: !forrige, endringer: endret && forrige ? endringerSsb(forrige, data) : [] });
  console.log(
    `SSB: ungdomskull til ${data.ungdomskull.framskrevetFra}, unge utenfor ${data.utenfor.aar.at(-1)}, grunnskolepoeng ${data.grunnskolepoeng.aar.at(-1)}, KOSTRA ${data.kostnad.aar.at(-1)}, lærere ${data.laerere.aar.at(-1)}, deltakelse ${data.deltakelse.aar.at(-1)}. ${endret ? 'Endret.' : 'Uendret.'}`,
  );
}
