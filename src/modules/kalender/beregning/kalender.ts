// Kalenderen (fase 6, pakke 5, avgjørelse 066): fristene og datoene fra alle modulene i ett vindu, enten de neste tolv
// månedene eller et skoleår (august–juli). Rene funksjoner, uten avhengighet til grensesnittet.
//
// - En oppføring er en frist fra innholdet (eller en dato fra dataene, f.eks. skoleruta) med tema, grupper og lenker.
// - Oppføringene foldes ut til poster i vinduet: en årlig frist får en post per år, en frist med måned en post i
//   måneden, og en frist over en periode (juli–august) en post i hver måned. Frister som gjelder hele året, står for seg.
// - Poster uten fast dag vises bare når kalenderen er filtrert på tema (eier 04.10.2026).
import type { Flerspraak, Fristgruppe, Kalendertema, KildeRef } from '../../../core/innhold/skjema.ts';
import type { Sokeoppforingstype } from '../../../core/sok/sok.ts';

export interface Kalenderoppforing {
  /** Unik blant oppføringene. */
  id: string;
  tittel: Flerspraak;
  /** HTML, som teksten i innholdet. */
  tekst?: Flerspraak;
  /** Tidspunktet med ord når det ikke er en dato («Udir fastsetter datoen»). */
  naar?: Flerspraak;
  tema: readonly Kalendertema[];
  grupper: readonly Fristgruppe[];
  /** Adresser i appen, f.eks. `/vurdering/klage-pa-karakter`. Tittelen hentes fra søkeoppføringene. */
  lenker: readonly string[];
  /** Lenker i appen med tittel og type, når de ikke skal slås opp (f.eks. en paragraf i Regelverk). */
  ferdigeLenker?: readonly { rute: string; tittel: Flerspraak; type: Sokeoppforingstype }[];
  paragrafer: readonly string[];
  kilder: readonly KildeRef[];
  /** Fylket når oppføringen bare gjelder ett fylke. */
  fylke: string | null;
  /** Lenke ut av appen, f.eks. kunngjøringen hos Lovdata. */
  ekstern?: { url: string; tekst: Flerspraak };
  /** En bestemt dato (ÅÅÅÅ-MM-DD), med sluttdato og klokkeslett. */
  dato?: string;
  til?: string;
  kl?: string;
  /** Uten `dato`: regelen fra innholdet. */
  regel?:
    | { type: 'arlig'; dag: number; maned: number }
    | { type: 'maned'; maned: number }
    | { type: 'perioden'; fra: number; til: number }
    | { type: 'lopende' };
}

export interface Kalenderpost {
  /** Unik i kalenderen: oppføringen og måneden eller datoen. */
  nokkel: string;
  oppforing: Kalenderoppforing;
  /** Måneden posten står i, ÅÅÅÅ-MM. */
  maned: string;
  /** Datoen, eller null når posten ikke har fast dag. */
  fra: string | null;
  til?: string;
  kl?: string;
  /** For en periode uten fast dag: månedene, f.eks. 7 og 8 (juli–august). */
  periode?: { fra: number; til: number };
}

export interface Vindu {
  /** Første dag, ÅÅÅÅ-MM-DD. */
  fra: string;
  /** Siste dag, ÅÅÅÅ-MM-DD. */
  til: string;
}

const to = (n: number) => String(n).padStart(2, '0');
const iso = (aar: number, maned: number, dag: number) => `${aar}-${to(maned)}-${to(dag)}`;
const manedAv = (dato: string) => dato.slice(0, 7);

/** Siste dag i måneden. */
function sisteDag(aar: number, maned: number): number {
  return new Date(Date.UTC(aar, maned, 0)).getUTCDate();
}

/** De neste tolv månedene fra måneden datoen ligger i. */
export function rullendeVindu(idag: string): Vindu {
  const aar = Number(idag.slice(0, 4));
  const maned = Number(idag.slice(5, 7));
  const sluttManed = ((maned + 10) % 12) + 1;
  const sluttAar = maned === 1 ? aar : aar + 1;
  return { fra: iso(aar, maned, 1), til: iso(sluttAar, sluttManed, sisteDag(sluttAar, sluttManed)) };
}

/** Skoleåret som starter i august `aar`. */
export function skolearVindu(aar: number): Vindu {
  return { fra: iso(aar, 8, 1), til: iso(aar + 1, 7, 31) };
}

/** Skoleåret (året det starter) for en dato. */
export function skolearStart(dato: string): number {
  const aar = Number(dato.slice(0, 4));
  return Number(dato.slice(5, 7)) >= 8 ? aar : aar - 1;
}

/** Skoleårene vinduet berører, f.eks. [2026, 2027] for oktober 2026–september 2027. */
export function skolearIVindu(v: Vindu): number[] {
  const ut: number[] = [];
  for (let s = skolearStart(v.fra); s <= skolearStart(v.til); s++) ut.push(s);
  return ut;
}

/** Månedene i vinduet, ÅÅÅÅ-MM. */
export function manederIVindu(v: Vindu): string[] {
  const ut: string[] = [];
  let aar = Number(v.fra.slice(0, 4));
  let maned = Number(v.fra.slice(5, 7));
  while (iso(aar, maned, 1) <= v.til) {
    ut.push(`${aar}-${to(maned)}`);
    maned += 1;
    if (maned > 12) {
      maned = 1;
      aar += 1;
    }
  }
  return ut;
}

/** Månedene fra og med `fra` til og med `til`, også over nyttår (11–2 gir 11, 12, 1, 2). */
function manederIPerioden(fra: number, til: number): number[] {
  const ut = [fra];
  for (let m = fra; m !== til; ) {
    m = (m % 12) + 1;
    ut.push(m);
  }
  return ut;
}

/** Gjelder oppføringen hele året (løpende, uten dato)? Den står da for seg, ikke i en måned. */
export function heleAret(o: Kalenderoppforing): boolean {
  return !o.dato && o.regel?.type === 'lopende';
}

/**
 * Oppføringene som poster i vinduet. Oppføringer med dato er med når de overlapper vinduet, og står i måneden de
 * starter i, eller i første måned i vinduet når de startet før. Årlige frister får en post per år. Frister med
 * måned eller periode får en post uten dag i hver måned.
 */
export function utvid(oppforinger: readonly Kalenderoppforing[], v: Vindu): Kalenderpost[] {
  const maneder = manederIVindu(v);
  const ut: Kalenderpost[] = [];
  for (const o of oppforinger) {
    if (o.dato) {
      const slutt = o.til ?? o.dato;
      if (slutt < v.fra || o.dato > v.til) continue;
      const maned = o.dato < v.fra ? manedAv(v.fra) : manedAv(o.dato);
      ut.push({ nokkel: `${o.id}|${o.dato}`, oppforing: o, maned, fra: o.dato, ...(o.til ? { til: o.til } : {}), ...(o.kl ? { kl: o.kl } : {}) });
      continue;
    }
    const r = o.regel;
    if (!r || r.type === 'lopende') continue;
    for (const m of maneder) {
      const aar = Number(m.slice(0, 4));
      const maned = Number(m.slice(5, 7));
      if (r.type === 'arlig') {
        if (r.maned !== maned) continue;
        const dato = iso(aar, maned, Math.min(r.dag, sisteDag(aar, maned)));
        if (dato >= v.fra && dato <= v.til) ut.push({ nokkel: `${o.id}|${dato}`, oppforing: o, maned: m, fra: dato });
      } else if (r.type === 'maned') {
        if (r.maned === maned) ut.push({ nokkel: `${o.id}|${m}`, oppforing: o, maned: m, fra: null });
      } else if (manederIPerioden(r.fra, r.til).includes(maned)) {
        ut.push({ nokkel: `${o.id}|${m}`, oppforing: o, maned: m, fra: null, periode: { fra: r.fra, til: r.til } });
      }
    }
  }
  return ut;
}

export interface Kalenderfilter {
  tema: Kalendertema | null;
  gruppe: Fristgruppe | null;
}

/** Gjelder oppføringen filteret? Uten grupper gjelder den alle. */
export function passer(o: Kalenderoppforing, f: Kalenderfilter): boolean {
  if (f.tema && !o.tema.includes(f.tema)) return false;
  if (f.gruppe && o.grupper.length > 0 && !o.grupper.includes(f.gruppe)) return false;
  return true;
}

/**
 * Postene som vises med filteret, sortert: etter måned, så datoene i rekkefølge (nasjonale først samme dag), og
 * postene uten fast dag sist i måneden. Uten tema i filteret er postene uten fast dag ikke med.
 */
export function velgPoster(poster: readonly Kalenderpost[], f: Kalenderfilter): Kalenderpost[] {
  return poster
    .filter((p) => passer(p.oppforing, f) && (p.fra !== null || f.tema !== null))
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      if (a.p.maned !== b.p.maned) return a.p.maned < b.p.maned ? -1 : 1;
      const da = a.p.fra ?? '9999';
      const db = b.p.fra ?? '9999';
      if (da !== db) return da < db ? -1 : 1;
      const la = a.p.oppforing.fylke ? 1 : 0;
      const lb = b.p.oppforing.fylke ? 1 : 0;
      return la - lb || a.i - b.i;
    })
    .map(({ p }) => p);
}

/** Postene per måned i vinduet, også måneder uten poster. */
export function perManed(poster: readonly Kalenderpost[], v: Vindu): { maned: string; poster: Kalenderpost[] }[] {
  return manederIVindu(v).map((m) => ({ maned: m, poster: poster.filter((p) => p.maned === m) }));
}

/** Er posten passert? Poster uten fast dag er passert når måneden er passert. */
export function passert(p: Kalenderpost, idag: string): boolean {
  if (p.fra === null) return p.maned < manedAv(idag);
  return (p.til ?? p.fra) < idag;
}

/** Pågår posten i dag (en periode som har startet, men ikke sluttet)? */
export function pagar(p: Kalenderpost, idag: string): boolean {
  return p.fra !== null && p.fra <= idag && (p.til ?? p.fra) >= idag;
}

/**
 * Hvor streken for i dag står i en måned: indeksen til den første posten som starter etter i dag. Streken står bare
 * i måneden for i dag; ellers null. Poster uten fast dag står etter streken.
 */
export function idagIndeks(poster: readonly Kalenderpost[], maned: string, idag: string): number | null {
  if (maned !== manedAv(idag)) return null;
  const i = poster.findIndex((p) => p.fra === null || p.fra > idag);
  return i === -1 ? poster.length : i;
}

/** De neste postene med fast dag som ikke er passert, f.eks. de tre på forsiden. */
export function nestePoster(poster: readonly Kalenderpost[], idag: string, antall: number): Kalenderpost[] {
  return poster
    .filter((p) => p.fra !== null && (p.til ?? p.fra) >= idag)
    .sort((a, b) => ((a.fra as string) < (b.fra as string) ? -1 : (a.fra as string) > (b.fra as string) ? 1 : 0))
    .slice(0, antall);
}

/** Deler månedene i `deler` like store deler for stor skjerm, f.eks. tolv måneder i tre deler med fire. */
export function delInn<T>(maneder: readonly T[], deler: number): T[][] {
  const storrelse = Math.ceil(maneder.length / deler);
  const ut: T[][] = [];
  for (let i = 0; i < maneder.length; i += storrelse) ut.push(maneder.slice(i, i + storrelse));
  return ut;
}
