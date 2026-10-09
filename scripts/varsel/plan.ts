// Når en sak til eier gir e-post (eier 07.10.2026, avgjørelse 085). Eier skal få vite det hver gang noe har gått
// galt eller bør ses på, men ikke når alt virker. Hver e-post skal ha hele listen over det som står åpent, så den kan
// leses alene, og det som ikke løser seg selv, skal komme igjen til det er løst.
//
// - Ingenting galt: en åpen sak lukkes med en kommentar. Ellers skjer ingenting.
// - Noe er galt, og det finnes ingen åpen sak: saken lages. Det gir e-post med hele teksten.
// - Nye punkter siden sist: en kommentar med de nye punktene og hele listen.
// - Ingen nye punkter, men saken har stått i `paminnelseDager` dager siden forrige e-post: en påminnelse med hele
//   listen.
// - Ellers oppdateres bare teksten, uten kommentar.
//
// Et punkt er en linje som begynner med «- ». Datoer og «N ganger på rad» teller ikke, så «3 ganger på rad» og «4
// ganger på rad» er samme punkt. Merket nederst i saken husker når den ble laget, når eier sist fikk e-post og punktene da.
// Ren logikk, testet i tests/unit/varsel.test.ts.
import { createHash } from 'node:crypto';

export interface Varsel {
  tittel: string;
  /** Teksten i saken uten merket. null når ingenting er galt. */
  tekst: string | null;
  /** Datoen for kjøringen, ÅÅÅÅ-MM-DD. */
  idag: string;
  /** Dager mellom påminnelsene når ingenting nytt har kommet til. */
  paminnelseDager: number;
  /** Kommentaren når saken lukkes, med datoen saken ble laget. */
  lukk: (siden: string) => string;
}

export interface AapenSak {
  nummer: number;
  tekst: string | null;
}

export type Varselhandling =
  | { type: 'opprett'; tittel: string; tekst: string }
  | { type: 'oppdater'; nummer: number; tittel: string; tekst: string; kommentar: string | null }
  | { type: 'lukk'; nummer: number; kommentar: string };

/** GitHub tar høyst 65 536 tegn i en kommentar. */
const MAKS_KOMMENTAR = 60_000;

const MERKE = /\n*<!-- varsel siden:(\d{4}-\d{2}-\d{2}) varslet:(\d{4}-\d{2}-\d{2}) punkter:([0-9a-f,]*) -->\s*$/;

/** Punktlinjene i teksten: linjer som begynner med «- », med eller uten innrykk. */
export function punktlinjer(tekst: string): string[] {
  return tekst.split('\n').filter((l) => /^\s*- /.test(l));
}

/** Nøkkelen for et punkt: linjen uten avkrysning, datoer og «N ganger på rad», som endres fra gang til gang. */
export function punktnokkel(linje: string): string {
  const normal = linje
    .replace(/^\s*- \[[ xX]\] /, '- ')
    .replace(/\d{4}-\d{2}-\d{2}(T[\d:.]+Z)?|\d{1,2}\.\d{1,2}\.\d{4}/g, '#')
    .replace(/\d+ ganger på rad/g, '# ganger på rad')
    .trim();
  return createHash('sha256').update(normal, 'utf8').digest('hex').slice(0, 8);
}

export function lesMerke(tekst: string | null): { siden: string; varslet: string; punkter: Set<string> } | null {
  const m = MERKE.exec(tekst ?? '');
  if (!m) return null;
  return { siden: m[1] as string, varslet: m[2] as string, punkter: new Set((m[3] ?? '').split(',').filter(Boolean)) };
}

function medMerke(tekst: string, siden: string, varslet: string): string {
  const punkter = [...new Set(punktlinjer(tekst).map(punktnokkel))].join(',');
  return `${tekst.trimEnd()}\n\n<!-- varsel siden:${siden} varslet:${varslet} punkter:${punkter} -->`;
}

function dagerMellom(fra: string, til: string): number {
  return Math.round((Date.parse(til) - Date.parse(fra)) / 86_400_000);
}

/** «2026-10-07» → «07.10.2026». */
export function norskDato(iso: string): string {
  const [aar, mnd, dag] = iso.slice(0, 10).split('-');
  return `${dag}.${mnd}.${aar}`;
}

function kortet(tekst: string): string {
  return tekst.length <= MAKS_KOMMENTAR ? tekst : `${tekst.slice(0, MAKS_KOMMENTAR)}\n\n… Resten står i beskrivelsen øverst i saken.`;
}

export function planleggVarsel(v: Varsel, aapen: AapenSak | null): Varselhandling[] {
  if (v.tekst === null) {
    if (!aapen) return [];
    const siden = lesMerke(aapen.tekst)?.siden ?? v.idag;
    return [{ type: 'lukk', nummer: aapen.nummer, kommentar: v.lukk(siden) }];
  }
  if (!aapen) return [{ type: 'opprett', tittel: v.tittel, tekst: medMerke(v.tekst, v.idag, v.idag) }];

  // En sak fra før merket fantes, regnes som laget i dag, med alle punktene nye.
  const forrige = lesMerke(aapen.tekst) ?? { siden: v.idag, varslet: v.idag, punkter: new Set<string>() };
  const nye = punktlinjer(v.tekst).filter((l) => !forrige.punkter.has(punktnokkel(l)));
  const hele = v.tekst.trimEnd();
  let kommentar: string | null = null;
  if (nye.length > 0) {
    kommentar = kortet(
      [`**Nytt siden sist (${norskDato(v.idag)}):**`, '', ...nye.map((l) => l.trimStart()), '', '---', '', `**Alt som står åpent nå** (saken ble laget ${norskDato(forrige.siden)}):`, '', hele].join('\n'),
    );
  } else if (dagerMellom(forrige.varslet, v.idag) >= v.paminnelseDager) {
    kommentar = kortet(
      [`**Påminnelse:** Dette har stått åpent siden ${norskDato(forrige.siden)}, og noe av det har ikke løst seg selv. Her er alt som står åpent nå:`, '', hele].join('\n'),
    );
  }
  const varslet = kommentar ? v.idag : forrige.varslet;
  return [{ type: 'oppdater', nummer: aapen.nummer, tittel: v.tittel, tekst: medMerke(v.tekst, forrige.siden, varslet), kommentar }];
}
