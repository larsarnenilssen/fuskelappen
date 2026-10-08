// Appens tilstand: innstillinger og favoritter, lagret lokalt via lagringsmodulen.
import { useEffect, useMemo, useState } from 'preact/hooks';
import { hentTekst, lastTekster, teksterLastet, type Malform, type Tekstnokkel, type Verdier } from '../core/i18n/tekst.ts';
import type { EgenRegel } from '../core/lokale/skjema.ts';
import {
  egneRegler,
  lesLagret,
  lesValg,
  skrivValg,
  type Valg,
  skrivLagret,
  slettLagret,
  standard,
  type Innstillinger,
  type Lager,
  type Lagret,
} from '../core/lagring/lagring.ts';

function finnLager(): Lager | null {
  try {
    const lager = window.localStorage;
    const test = 'jukselappen-lagringstest';
    lager.setItem(test, '1');
    lager.removeItem(test);
    return lager;
  } catch {
    return null;
  }
}

function foretrukketMalform(): Malform {
  const spraak = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];
  const forste = spraak.find((s) => /^(nb|nn|no)\b/i.test(s));
  return forste?.toLowerCase().startsWith('nn') ? 'nn' : 'nb';
}

type Lytter = (data: Lagret) => void;

class Tilstand {
  private lager: Lager | null;
  private lyttere = new Set<Lytter>();
  data: Lagret;
  /** false når data bare ligger i minnet (privat nettlesing, fullt lager). */
  kanLagre: boolean;

  constructor() {
    this.lager = finnLager();
    const { data, status } = lesLagret(this.lager, foretrukketMalform());
    this.data = data;
    this.kanLagre = status !== 'utilgjengelig';
  }

  lytt(lytter: Lytter): () => void {
    this.lyttere.add(lytter);
    return () => this.lyttere.delete(lytter);
  }

  sett(data: Lagret): void {
    this.data = data;
    this.kanLagre = skrivLagret(this.lager, data);
    // Bytter brukeren målform, vises endringen først når tekstene er lastet (avgjørelse 083).
    const malform = data.innstillinger.malform;
    if (teksterLastet(malform)) this.varsle();
    else void lastTekster(malform).then(() => this.varsle(), () => this.varsle());
  }

  private varsle(): void {
    anvendInnstillinger(this.data.innstillinger);
    for (const l of this.lyttere) l(this.data);
  }

  oppdater(endring: (data: Lagret) => Lagret): void {
    this.sett(endring(this.data));
  }

  oppdaterInnstillinger(endring: Partial<Innstillinger>): void {
    this.oppdater((d) => ({ ...d, innstillinger: { ...d.innstillinger, ...endring } }));
  }

  /** Et lite valg i visningen, lagret for seg (lesValg i lagringsmodulen). */
  lesValg(valg: Valg): string | null {
    return lesValg(this.lager, valg);
  }

  skrivValg(valg: Valg, verdi: string): void {
    skrivValg(this.lager, valg, verdi);
  }

  slettAlt(): void {
    slettLagret(this.lager);
    const ny = standard(this.data.innstillinger.malform);
    this.sett(ny);
    slettLagret(this.lager);
  }
}

export const tilstand = new Tilstand();

function lesToken(navn: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(navn).trim();
}

/** Setter tema, språk og theme-color på dokumentet. */
export function anvendInnstillinger(inn: Innstillinger): void {
  const rot = document.documentElement;
  if (inn.tema === 'system') delete rot.dataset.tema;
  else rot.dataset.tema = inn.tema;
  rot.lang = inn.malform;
  const metaer = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  const lys = lesToken('--meta-temafarge-lys');
  const mork = lesToken('--meta-temafarge-mork');
  metaer.forEach((meta) => {
    const erMork = meta.media.includes('dark');
    if (inn.tema === 'system') meta.content = erMork ? mork : lys;
    else meta.content = inn.tema === 'mork' ? mork : lys;
  });
}

export function useTilstand(): Lagret {
  const [data, settData] = useState(tilstand.data);
  useEffect(() => {
    settData(tilstand.data);
    return tilstand.lytt(settData);
  }, []);
  return data;
}

/** Om brukeren har valgt å se reglene for privatskoler (avgjørelse 075). */
export function usePrivatskole(): boolean {
  return useTilstand().innstillinger.privatskole === true;
}

export type T = (nokkel: Tekstnokkel, verdier?: Verdier) => string;

export function useTekst(): { t: T; malform: Malform } {
  const malform = useTilstand().innstillinger.malform;
  return useMemo(() => ({ t: (nokkel, verdier) => hentTekst(malform, nokkel, verdier), malform }), [malform]);
}

export function erFavoritt(id: string): boolean {
  return tilstand.data.favoritter.includes(id);
}

export function vekslFavoritt(id: string): void {
  tilstand.oppdater((d) => ({
    ...d,
    favoritter: d.favoritter.includes(id) ? d.favoritter.filter((f) => f !== id) : [...d.favoritter, id],
  }));
}

/** Ny rekkefølge på favorittene (dra og slipp eller pilene på forsiden). */
export function settFavorittrekkefolge(favoritter: string[]): void {
  tilstand.oppdater((d) => ({ ...d, favoritter }));
}

/** Rekkefølgen på gruppene på forsiden (avgjørelse 056). */
export function settGrupperekkefolge(rekkefolge: string[]): void {
  tilstand.oppdater((d) => ({ ...d, forside: { ...d.forside, rekkefolge } }));
}

/**
 * Åpner eller lukker en gruppe på forsiden. `erLukket` er om gruppen er lukket nå. En gruppe som er lukket fra start på
 * mobil («Neste datoer»), huskes som åpnet i `apnet` (avgjørelse 066).
 */
export function vekslGruppe(id: string, erLukket?: boolean): void {
  tilstand.oppdater((d) => {
    const f = d.forside;
    const lukkes = erLukket === undefined ? !f.lukket.includes(id) : !erLukket;
    const lukket = lukkes ? [...f.lukket.filter((g) => g !== id), id] : f.lukket.filter((g) => g !== id);
    const apnet = (f.apnet ?? []).filter((g) => g !== id);
    return { ...d, forside: { ...f, lukket, ...(erLukket === undefined ? {} : { apnet: lukkes ? apnet : [...apnet, id] }) } };
  });
}

/** Visningen i panelet øverst på forsiden: kalenderen, nyhetene eller tallene (avgjørelse 081). */
export function settForsidevisning(visning: string): void {
  tilstand.oppdater((d) => ({ ...d, forside: { ...d.forside, visning } }));
}

/** Slår en gruppe på forsiden av eller på (avgjørelse 066). */
export function vekslSkjultGruppe(id: string): void {
  tilstand.oppdater((d) => {
    const skjult = d.forside.skjult ?? [];
    return { ...d, forside: { ...d.forside, skjult: skjult.includes(id) ? skjult.filter((g) => g !== id) : [...skjult, id] } };
  });
}

/**
 * Slår dagens jukselapp av eller på (fase 8). Slått på står den i panelet øverst på forsiden som dagens jukselapp, med
 * «Tilbake til …» brukerens egen visning, så brukeren ser den med en gang.
 */
export function settJukselapp(jukselapp: boolean): void {
  tilstand.oppdater((d) => ({ ...d, forside: { ...d.forside, jukselapp } }));
}

/** «Tilbake til …» fra dagens jukselapp: panelet står på brukerens egen visning resten av dagen. */
export function forlatJukselapp(dato: string): void {
  tilstand.oppdater((d) => ({ ...d, forside: { ...d.forside, jukselappForlatt: dato } }));
}

/** Bare favorittene, fordelt under kategoriene, eller hele forsiden. */
export function settBareFavoritter(bareFavoritter: boolean): void {
  tilstand.oppdater((d) => ({ ...d, forside: { ...d.forside, bareFavoritter } }));
}

/** Standard rekkefølge, og alle gruppene åpne. */
export function nullstillForside(): void {
  tilstand.oppdater((d) => ({ ...d, forside: { ...d.forside, rekkefolge: [], lukket: [], apnet: [], skjult: [] } }));
}

/** Brukerens egne lokale regler (fase 9, avgjørelse 093). Ugyldige regler hoppes over. */
export function useEgneRegler(): EgenRegel[] {
  const data = useTilstand();
  return useMemo(() => egneRegler(data), [data]);
}

/** Lagrer en egen lokal regel, ny eller endret (samme kode). */
export function lagreEgenRegel(regel: EgenRegel): void {
  tilstand.oppdater((d) => ({ ...d, egneRegler: [...egneRegler(d).filter((r) => r.kode !== regel.kode), regel] }));
}

export function slettEgenRegel(kode: string): void {
  tilstand.oppdater((d) => ({ ...d, egneRegler: egneRegler(d).filter((r) => r.kode !== kode) }));
}
