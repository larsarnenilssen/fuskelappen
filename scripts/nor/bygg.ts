// Bygger listen over opplæringskontorer (data/udir/opplaeringskontor.json) fra NOR, kontrollerer den og finner
// endringene siden forrige henting (avgjørelse 053). Rene funksjoner, testes i tests/unit/nor.test.ts.
import type { Opplaeringskontor, Opplaeringskontorer } from '../../src/modules/opplaeringslop/nor/skjema.ts';

/** En enhet slik NOR gir den (`/v4/enhet/{orgnr}`). Bare feltene som brukes. */
export interface Norenhet {
  Organisasjonsnummer: string;
  Navn: string;
  ErAktiv?: boolean | null;
  ErOpplaeringskontor?: boolean | null;
  Fylke?: { Fylkesnummer: string; Organisasjonsnummer?: string | null } | null;
  Kommune?: { Navn: string; Kommunenummer: string } | null;
  Internettadresse?: string | null;
  AntallLaerlinger?: number | null;
  ForeldreRelasjoner?: { Enhet: { Organisasjonsnummer: string }; Relasjonstype: { Id: string } }[] | null;
}

/** Relasjonstypen i NOR for fylkene et opplæringskontor er godkjent i. */
export const GODKJENT_I_FYLKE = '21';

export function nettside(adresse: string | null | undefined): string | null {
  const a = (adresse ?? '').trim();
  if (!a || /\s/.test(a)) return null;
  const url = /^https?:\/\//i.test(a) ? a : `https://${a}`;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

/**
 * De aktive opplæringskontorene. Fylkene kontoret er godkjent i, finnes fra fylkeskommunene i relasjonen
 * «Godkjent i fylker struktur»; organisasjonsnummeret til fylkeskommunen står i fylket til hver enhet.
 */
export function byggOpplaeringskontor(enheter: readonly Norenhet[], hentet: string): Opplaeringskontorer {
  const fylkeskommune = new Map<string, string>();
  for (const e of enheter) if (e.Fylke?.Organisasjonsnummer) fylkeskommune.set(e.Fylke.Organisasjonsnummer, e.Fylke.Fylkesnummer);
  const kontor: Opplaeringskontor[] = [];
  for (const e of enheter) {
    if (!e.ErAktiv || !e.ErOpplaeringskontor || !e.Fylke || !e.Kommune) continue;
    const godkjent = (e.ForeldreRelasjoner ?? [])
      .filter((r) => r.Relasjonstype.Id === GODKJENT_I_FYLKE)
      .map((r) => fylkeskommune.get(r.Enhet.Organisasjonsnummer))
      .filter((f): f is string => !!f);
    kontor.push({
      orgnr: e.Organisasjonsnummer,
      navn: e.Navn.trim(),
      fylke: e.Fylke.Fylkesnummer,
      kommune: e.Kommune.Navn,
      nettside: nettside(e.Internettadresse),
      laerlinger: typeof e.AntallLaerlinger === 'number' ? e.AntallLaerlinger : null,
      godkjentI: [...new Set(godkjent.length > 0 ? godkjent : [e.Fylke.Fylkesnummer])].sort(),
    });
  }
  kontor.sort((a, b) => a.navn.localeCompare(b.navn, 'nb') || a.orgnr.localeCompare(b.orgnr));
  return { kilde: 'udir-nor', hentet, lisens: 'NLOD', kontor };
}

/** Feil som gjør at de nye dataene ikke tas inn (forrige fil blir stående). */
export function validerOpplaeringskontor(d: Opplaeringskontorer): string[] {
  const feil: string[] = [];
  if (d.kontor.length < 200) feil.push(`Fant bare ${d.kontor.length} aktive opplæringskontorer.`);
  const fylker = new Set(d.kontor.flatMap((k) => k.godkjentI));
  if (fylker.size < 10) feil.push(`Opplæringskontorene er godkjent i bare ${fylker.size} fylker.`);
  return feil;
}

/** Endringene mellom to hentinger, én linje per endring. Antall lærlinger endres ofte og regnes ikke med. */
export function sammenlignOpplaeringskontor(gammel: Opplaeringskontorer | null, ny: Opplaeringskontorer): string[] {
  if (!gammel) return [];
  const g = new Map(gammel.kontor.map((k) => [k.orgnr, k]));
  const n = new Map(ny.kontor.map((k) => [k.orgnr, k]));
  const nye = ny.kontor.filter((k) => !g.has(k.orgnr)).map((k) => k.navn);
  const borte = gammel.kontor.filter((k) => !n.has(k.orgnr)).map((k) => k.navn);
  const nokkel = (k: Opplaeringskontor) => JSON.stringify({ ...k, laerlinger: null });
  const endret = ny.kontor.filter((k) => g.has(k.orgnr) && nokkel(g.get(k.orgnr) as Opplaeringskontor) !== nokkel(k)).map((k) => k.navn);
  const linje = (tittel: string, l: string[]) => (l.length > 0 ? [`${tittel} (${l.length}): ${l.slice(0, 10).join(', ')}${l.length > 10 ? ' …' : ''}`] : []);
  return [...linje('Nye opplæringskontorer', nye), ...linje('Ikke lenger aktive', borte), ...linje('Endret', endret)];
}
