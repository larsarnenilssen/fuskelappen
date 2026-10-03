// Appens tilstand: innstillinger og favoritter, lagret lokalt via lagringsmodulen.
import { useEffect, useMemo, useState } from 'preact/hooks';
import { hentTekst, type Malform, type Tekstnokkel, type Verdier } from '../core/i18n/tekst.ts';
import {
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
    const test = 'fuskelappen-test';
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
    anvendInnstillinger(data.innstillinger);
    for (const l of this.lyttere) l(data);
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

export function flyttFavoritt(id: string, retning: -1 | 1): void {
  tilstand.oppdater((d) => {
    const liste = [...d.favoritter];
    const i = liste.indexOf(id);
    const j = i + retning;
    if (i < 0 || j < 0 || j >= liste.length) return d;
    [liste[i], liste[j]] = [liste[j] as string, liste[i] as string];
    return { ...d, favoritter: liste };
  });
}
