// Gangen gjennom en veiviser (avgjørelse 041). Rene funksjoner uten avhengighet til grensesnittet.
//
// Tilstanden står i adressen: `steg` er steget brukeren står på, og `svar` er svarene på spørsmålene på veien dit,
// i rekkefølge. Veien regnes ut fra starten hver gang, så en delt adresse gir samme vei. Steg uten spørsmål går
// rett videre til `neste`. Et steg kan komme flere ganger på veien (f.eks. «følge med» etter nye tiltak), og
// brukeren står da på stedet der alle svarene er brukt.

export interface Svaralternativ {
  id: string;
  neste: string;
}

export interface Stegnode {
  id: string;
  fase?: string | undefined;
  neste?: string | undefined;
  sporsmal?: { svar: readonly Svaralternativ[] } | undefined;
}

export interface Veiviserkart<T extends Stegnode = Stegnode> {
  start: string;
  steg: ReadonlyMap<string, T>;
}

/** Et steg på veien brukeren har gått, med svaret som ble valgt der. */
export interface Veipunkt {
  steg: string;
  svar?: string;
}

export interface Vei {
  /** Stegene før det gjeldende, i rekkefølge. */
  bak: Veipunkt[];
  gjeldende: string;
  /** Svarene som ble brukt. Kortere enn svarene i adressen når adressen ikke stemmer med veiviseren. */
  svar: string[];
  /** Adressen stemte ikke helt, og brukeren er satt på det siste steget som kunne nås. */
  korrigert: boolean;
}

/** Øvre grense for antall steg på en vei, så en feil i veiviseren ikke gir en evig løkke. */
const MAKS_STEG = 500;

export function lagKart<T extends Stegnode>(start: string, steg: readonly T[]): Veiviserkart<T> {
  return { start, steg: new Map(steg.map((s) => [s.id, s])) };
}

/** Er steget et utfall (slutten av veien)? */
export function erUtfall(node: Stegnode): boolean {
  return node.neste === undefined && node.sporsmal === undefined;
}

/**
 * Veien fra starten til `steg`, med `svar` på spørsmålene underveis. Uten `steg` står brukeren på starten (eller,
 * når det er svar, der svarene slutter).
 */
export function finnVei(kart: Veiviserkart, svar: readonly string[], steg?: string | null): Vei {
  const bak: Veipunkt[] = [];
  const brukt: string[] = [];
  let gjeldende = kart.start;
  let korrigert = false;
  for (let i = 0; i < MAKS_STEG; i++) {
    const ferdig = brukt.length === svar.length;
    if (ferdig && (steg === undefined || steg === null || steg === gjeldende)) break;
    const node = kart.steg.get(gjeldende);
    if (!node) {
      korrigert = true;
      break;
    }
    if (node.sporsmal) {
      const valgt = ferdig ? undefined : node.sporsmal.svar.find((a) => a.id === svar[brukt.length]);
      if (!valgt) {
        korrigert = true;
        break;
      }
      bak.push({ steg: gjeldende, svar: valgt.id });
      brukt.push(valgt.id);
      gjeldende = valgt.neste;
    } else if (node.neste !== undefined) {
      bak.push({ steg: gjeldende });
      gjeldende = node.neste;
    } else {
      // Utfall før adressens steg er nådd.
      korrigert = true;
      break;
    }
  }
  return { bak, gjeldende, svar: brukt, korrigert };
}

/** Adresseparametrene for et steg på veien: `steg` og svarene fram dit. Starten har ingen parametre. */
export function tilstand(kart: Veiviserkart, steg: string, svar: readonly string[]): Record<string, string> {
  if (steg === kart.start && svar.length === 0) return {};
  return svar.length > 0 ? { steg, svar: svar.join('.') } : { steg };
}

/** Leser svarene fra adressen («tvil.nei» → ["tvil", "nei"]). */
export function lesSvar(verdi: string | null): string[] {
  return verdi ? verdi.split('.').filter(Boolean) : [];
}

/** Tilstanden for å gå tilbake til punkt nr. `indeks` på veien. */
export function tilbakeTil(kart: Veiviserkart, vei: Vei, indeks: number): Record<string, string> {
  const punkt = vei.bak[indeks];
  if (!punkt) return tilstand(kart, vei.gjeldende, vei.svar);
  const svar = vei.bak.slice(0, indeks).flatMap((p) => (p.svar ? [p.svar] : []));
  return tilstand(kart, punkt.steg, svar);
}

/** Tilstanden etter at brukeren har gått videre fra det gjeldende steget, eventuelt med et svar. */
export function videre(kart: Veiviserkart, vei: Vei, svarId?: string): Record<string, string> | null {
  const node = kart.steg.get(vei.gjeldende);
  if (!node) return null;
  if (node.sporsmal) {
    const valgt = node.sporsmal.svar.find((a) => a.id === svarId);
    return valgt ? tilstand(kart, valgt.neste, [...vei.svar, valgt.id]) : null;
  }
  return node.neste !== undefined ? tilstand(kart, node.neste, vei.svar) : null;
}

/** Feil i en veiviser: steg som ikke finnes, steg som ikke kan nås, og løkker uten spørsmål. Brukes i testene. */
export function finnFeil(kart: Veiviserkart): string[] {
  const feil: string[] = [];
  if (!kart.steg.has(kart.start)) feil.push(`Startsteget «${kart.start}» finnes ikke`);
  for (const node of kart.steg.values()) {
    const videre = [...(node.neste !== undefined ? [node.neste] : []), ...(node.sporsmal?.svar.map((a) => a.neste) ?? [])];
    for (const id of videre) if (!kart.steg.has(id)) feil.push(`«${node.id}» peker på «${id}», som ikke finnes`);
  }
  // Alle steg skal kunne nås fra starten.
  const naadd = new Set<string>();
  const ko = [kart.start];
  while (ko.length > 0) {
    const id = ko.pop() as string;
    if (naadd.has(id)) continue;
    naadd.add(id);
    const node = kart.steg.get(id);
    if (!node) continue;
    if (node.neste !== undefined) ko.push(node.neste);
    for (const a of node.sporsmal?.svar ?? []) ko.push(a.neste);
  }
  for (const id of kart.steg.keys()) if (!naadd.has(id)) feil.push(`«${id}» kan ikke nås fra starten`);
  // En kjede av steg uten spørsmål må ende i et spørsmål eller et utfall.
  for (const node of kart.steg.values()) {
    const sett = new Set<string>();
    let n: Stegnode | undefined = node;
    while (n && !n.sporsmal && n.neste !== undefined) {
      if (sett.has(n.id)) {
        feil.push(`Løkke uten spørsmål fra «${node.id}»`);
        break;
      }
      sett.add(n.id);
      n = kart.steg.get(n.neste);
    }
  }
  return [...new Set(feil)];
}

/** Fasene på veien: ferdig, gjeldende eller senere, ut fra fasen til det gjeldende steget. */
export function fasestatus(faser: readonly string[], gjeldendeFase: string | undefined): ('ferdig' | 'gjeldende' | 'senere')[] {
  const i = gjeldendeFase === undefined ? -1 : faser.indexOf(gjeldendeFase);
  return faser.map((_, j) => (j < i ? 'ferdig' : j === i ? 'gjeldende' : 'senere'));
}
