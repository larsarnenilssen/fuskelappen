// Regelmotoren: velger periode og nivå for en regelverdi.
// Rene funksjoner uten avhengighet til grensesnittet. Se docs/ARKITEKTUR.md.
import type { KildeRef, Kontrollert, Niva } from '../innhold/skjema.ts';
import type { Regelsett, Regelverdi, Tabellrad } from './skjema.ts';

export interface Regelkontekst {
  /** Datoen verdien skal gjelde for, ÅÅÅÅ-MM-DD. */
  dato: string;
  /** Id for en nasjonal periode brukeren har valgt i stedet for dagens. */
  periode?: string | null;
  fylke?: string | null;
  skole?: string | null;
}

export interface Oppslag {
  verdi: Regelverdi['verdi'];
  enhet: string | undefined;
  niva: Niva;
  fylke: string | null;
  skole: string | null;
  kilde: KildeRef;
  kontrollert: Kontrollert;
  regelsett: string;
  periode: string;
}

export class Regelfeil extends Error {}

function gjelder(r: Regelsett, dato: string): boolean {
  return r.gyldig_fra <= dato && dato <= r.gyldig_til;
}

function klem(dato: string, fra: string, til: string): string {
  if (dato < fra) return fra;
  if (dato > til) return til;
  return dato;
}

/** Nasjonal periode for et regelverk: valgt periode, ellers den som gjelder på datoen. */
export function velgPeriode(alle: readonly Regelsett[], regelverk: string, kontekst: Regelkontekst): Regelsett {
  const nasjonale = alle.filter((r) => r.regelverk === regelverk && r.gyldighet.niva === 'nasjonal');
  if (kontekst.periode) {
    const valgt = nasjonale.find((r) => r.id === kontekst.periode);
    if (!valgt) throw new Regelfeil(`Fant ikke perioden ${kontekst.periode} for ${regelverk}`);
    return valgt;
  }
  const treff = nasjonale.filter((r) => gjelder(r, kontekst.dato));
  if (treff.length > 1) throw new Regelfeil(`Overlappende perioder for ${regelverk} på ${kontekst.dato}`);
  const periode = treff[0];
  if (!periode) throw new Regelfeil(`Ingen periode for ${regelverk} gjelder på ${kontekst.dato}`);
  return periode;
}

/** Datoen lokale regelsett vurderes mot: konteksten, holdt innenfor valgt periode. */
function referansedato(periode: Regelsett, kontekst: Regelkontekst): string {
  return klem(kontekst.dato, periode.gyldig_fra, periode.gyldig_til);
}

function lokale(alle: readonly Regelsett[], regelverk: string, dato: string, kontekst: Regelkontekst) {
  const aktuelle = alle.filter((r) => r.regelverk === regelverk && gjelder(r, dato));
  const skole = aktuelle.filter(
    (r) => r.gyldighet.niva === 'skole' && kontekst.skole && r.gyldighet.skole === kontekst.skole && r.gyldighet.fylke === kontekst.fylke,
  );
  const fylke = aktuelle.filter((r) => r.gyldighet.niva === 'fylke' && kontekst.fylke && r.gyldighet.fylke === kontekst.fylke);
  return { skole, fylke };
}

function tilOppslag(r: Regelsett, periode: Regelsett, v: Regelverdi): Oppslag {
  const g = r.gyldighet;
  return {
    verdi: v.verdi,
    enhet: v.enhet,
    niva: g.niva,
    fylke: g.niva === 'nasjonal' ? null : g.fylke,
    skole: g.niva === 'skole' ? g.skole : null,
    kilde: v.kilde,
    kontrollert: v.kontrollert,
    regelsett: r.id,
    periode: periode.id,
  };
}

function delNokkel(nokkel: string): [string, string] {
  const punkt = nokkel.indexOf('.');
  if (punkt < 1) throw new Regelfeil(`Nøkkelen må ha formen regelverk.verdi: ${nokkel}`);
  return [nokkel.slice(0, punkt), nokkel.slice(punkt + 1)];
}

/**
 * Finner verdien som gjelder. Lokale verdier som erstatter, velges i rekkefølgen
 * skole → fylke → nasjonal. Nøkkel: "regelverk.verdi", f.eks. "sfs2213.arsverk_timer".
 */
export function finnVerdi(alle: readonly Regelsett[], nokkel: string, kontekst: Regelkontekst): Oppslag {
  const [regelverk, navn] = delNokkel(nokkel);
  const periode = velgPeriode(alle, regelverk, kontekst);
  const dato = referansedato(periode, kontekst);
  const { skole, fylke } = lokale(alle, regelverk, dato, kontekst);
  for (const r of [...skole, ...fylke]) {
    if (r.gyldighet.niva !== 'nasjonal' && r.gyldighet.forhold === 'erstatter') {
      const v = r.verdier[navn];
      if (v) return tilOppslag(r, periode, v);
    }
  }
  const v = periode.verdier[navn];
  if (!v) throw new Regelfeil(`Fant ikke ${navn} i ${periode.id}`);
  return tilOppslag(periode, periode, v);
}

/** Alle verdier som gjelder samtidig (nasjonal + lokale som supplerer), gruppert etter nivå. */
export function finnSupplerende(alle: readonly Regelsett[], nokkel: string, kontekst: Regelkontekst): Record<Niva, Oppslag[]> {
  const [regelverk, navn] = delNokkel(nokkel);
  const periode = velgPeriode(alle, regelverk, kontekst);
  const dato = referansedato(periode, kontekst);
  const { skole, fylke } = lokale(alle, regelverk, dato, kontekst);
  const grupper: Record<Niva, Oppslag[]> = { nasjonal: [], fylke: [], skole: [] };
  const nasjonal = periode.verdier[navn];
  if (nasjonal) grupper.nasjonal.push(tilOppslag(periode, periode, nasjonal));
  for (const r of [...fylke, ...skole]) {
    if (r.gyldighet.niva === 'nasjonal' || r.gyldighet.forhold !== 'supplerer') continue;
    const v = r.verdier[navn];
    if (v) grupper[r.gyldighet.niva].push(tilOppslag(r, periode, v));
  }
  return grupper;
}

/**
 * Slår sammen regelsett som er delt på flere filer (samme id, ulik «del»).
 * Delene må ha samme regelverk, periode og gyldighet, og ingen verdinøkkel kan stå i to deler.
 */
export function slaaSammen(filer: readonly Regelsett[]): Regelsett[] {
  const grupper = new Map<string, Regelsett[]>();
  for (const r of filer) grupper.set(r.id, [...(grupper.get(r.id) ?? []), r]);
  return [...grupper.values()].map((deler) => {
    const [forste, ...resten] = deler as [Regelsett, ...Regelsett[]];
    if (resten.length === 0) return forste;
    const verdier: Regelsett['verdier'] = { ...forste.verdier };
    for (const del of resten) {
      const ulik =
        del.regelverk !== forste.regelverk ||
        del.gyldig_fra !== forste.gyldig_fra ||
        del.gyldig_til !== forste.gyldig_til ||
        JSON.stringify(del.gyldighet) !== JSON.stringify(forste.gyldighet);
      if (ulik) throw new Regelfeil(`Delene av ${forste.id} har ulikt regelverk, periode eller gyldighet`);
      for (const [navn, v] of Object.entries(del.verdier)) {
        if (navn in verdier) throw new Regelfeil(`${navn} står i flere deler av ${forste.id}`);
        verdier[navn] = v;
      }
    }
    const samlet: Regelsett = { ...forste, verdier };
    delete samlet.del;
    return samlet;
  });
}

/** Verdien som tall. Kaster Regelfeil hvis regelsettet har en annen type. */
export function somTall(o: Oppslag, nokkel = o.regelsett): number {
  if (typeof o.verdi !== 'number') throw new Regelfeil(`${nokkel} er ikke et tall`);
  return o.verdi;
}

/** Verdien som tabell (liste av rader). Kaster Regelfeil hvis regelsettet har en annen type. */
export function somTabell(o: Oppslag, nokkel = o.regelsett): Tabellrad[] {
  const v = o.verdi;
  if (!Array.isArray(v) || v.some((rad) => typeof rad !== 'object' || rad === null || Array.isArray(rad))) {
    throw new Regelfeil(`${nokkel} er ikke en tabell`);
  }
  return v as Tabellrad[];
}

/** Nasjonale perioder for et regelverk som ikke må overlappe. Brukes i tester. */
export function finnOverlapp(alle: readonly Regelsett[]): string[] {
  const feil: string[] = [];
  const grupper = new Map<string, Regelsett[]>();
  for (const r of alle) {
    const g = r.gyldighet;
    const n = g.niva === 'nasjonal' ? 'nasjonal' : g.niva === 'fylke' ? `fylke:${g.fylke}` : `skole:${g.skole}`;
    const forhold = g.niva === 'nasjonal' ? '' : g.forhold;
    const nokkel = `${r.regelverk}|${n}|${forhold}`;
    grupper.set(nokkel, [...(grupper.get(nokkel) ?? []), r]);
  }
  for (const liste of grupper.values()) {
    const sortert = [...liste].sort((a, b) => a.gyldig_fra.localeCompare(b.gyldig_fra));
    for (let i = 1; i < sortert.length; i++) {
      const forrige = sortert[i - 1];
      const denne = sortert[i];
      if (forrige && denne && denne.gyldig_fra <= forrige.gyldig_til) feil.push(`${forrige.id} overlapper ${denne.id}`);
    }
  }
  return feil;
}
