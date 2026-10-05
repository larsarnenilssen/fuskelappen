// Lokale forskrifter fra Lovdata for alle fylker og skoler (fase 6, pakke 4, avgjørelse 061). Eier 05.10.2026: alt
// bygges likt for alle fylker, også typer bare ett fylke har i dag (skolenes egne skoleregler).
//
// - Registeret https://lovdata.no/register/lokaleForskrifter har de gjeldende lokale forskriftene, 20 per side, nyeste
//   først. Hver forskrift er en <article> med lenken /dokument/LF/forskrift/<dato-nr> og tittelen.
// - Kandidatene velges på tittelen: skoleregler, ordensregler, tilleggsregler, inntak og skolerute, fra en
//   fylkeskommune (eller Oslo kommune, som også er fylkeskommune).
// - Dokumentsiden avgjør typen ut fra hjemmelen i metadataene (<td id="metaField_hjemmel">):
//   opplæringslova § 10-7 er skoleregler, § 14-1 er skolerute, og opplæringsforskrifta kapittel 4 og § 7-2 er inntak.
//   Fylket står i «Gjelder for» (metaField_gjelder). Skolen finnes ved navnet i tittelen, i skoleregisteret.
// Alt her er rene funksjoner, testet i tests/unit/lokale-forskrifter.test.ts.
import { parse } from 'node-html-parser';

export interface Registertreff {
  /** Dokumentet hos Lovdata, f.eks. «forskrift/2025-08-18-2220». */
  refid: string;
  tittel: string;
}

/** Én side i registeret: treffene, antallet i alt og om det finnes en side til. */
export function lesRegisterside(html: string): { treff: Registertreff[]; antall: number | null; neste: boolean } {
  const rot = parse(html);
  const treff = rot.querySelectorAll('article').flatMap((a) => {
    const lenke = a.querySelector('h3 a');
    const m = /\/dokument\/LF\/(forskrift\/\d{4}-\d{2}-\d{2}-\d+)/.exec(lenke?.getAttribute('href') ?? '');
    return m && lenke ? [{ refid: m[1] as string, tittel: lenke.text.replace(/\s+/g, ' ').trim() }] : [];
  });
  const antall = /(\d+)\s*treff/.exec(rot.querySelector('#doclistheader')?.parentNode?.text ?? rot.text);
  return { treff, antall: antall ? Number(antall[1]) : null, neste: rot.querySelector('.pager .next a') !== null };
}

/**
 * Norsk Lovtidend (https://lovdata.no/register/lovtidend): kunngjøringene, nyeste først, gruppert etter tidspunktet
 * for kunngjøringen. Avdeling II er de lokale forskriftene (/dokument/LTII/…), også endringer og opphevinger, med
 * forskriftene de endrer i «Endrer» (metaField_endrer). Lokale forskrifter skal kunngjøres her (sjekket 05.10.2026:
 * alle 124 forskriftene i registeret som appen vurderte, er kunngjort i avdeling II).
 */
export interface Kunngjoring {
  /** «forskrift/2026-09-29-1985». */
  refid: string;
  avdeling: 'LTI' | 'LTII';
  tittel: string;
}

/** Tidspunktene for kunngjøringene i menyen på siden, nyeste først: «02.10.2026 kl. 15.00». */
export function lesKunngjoringstidspunkter(html: string): string[] {
  const rot = parse(html);
  return rot
    .querySelectorAll('select[name="kunngjortDato"] option')
    .map((o) => o.text.replace(/\s+/g, ' ').trim())
    .filter((t) => /^\d{2}\.\d{2}\.\d{4} kl\. \d{2}\.\d{2}$/.test(t));
}

/** «02.10.2026 kl. 15.00» → «2026-10-02T15:00», som kan sammenlignes som tekst. */
export function tidspunkt(tekst: string): string {
  const m = /(\d{2})\.(\d{2})\.(\d{4})(?:\s+kl\.\s+(\d{2})\.(\d{2}))?/.exec(tekst);
  if (!m) throw new Error(`Ukjent tidspunkt: ${tekst}`);
  return `${m[3]}-${m[2]}-${m[1]}T${m[4] ?? '00'}:${m[5] ?? '00'}`;
}

/** Én side med kunngjøringer: treffene og om det finnes en side til. */
export function lesLovtidendside(html: string): { treff: Kunngjoring[]; neste: boolean } {
  const rot = parse(html);
  const treff = rot.querySelectorAll('article').flatMap((a) => {
    const lenke = a.querySelector('h3 a');
    const m = /\/dokument\/(LTII?)\/(forskrift\/\d{4}-\d{2}-\d{2}-\d+)/.exec(lenke?.getAttribute('href') ?? '');
    return m && lenke ? [{ refid: m[2] as string, avdeling: m[1] as 'LTI' | 'LTII', tittel: lenke.text.replace(/\s+/g, ' ').trim() }] : [];
  });
  return { treff, neste: rot.querySelector('.pager .next a') !== null };
}

/** Hva en kunngjøring i avdeling II gjør med forskriftene den endrer, ut fra tittelen. */
export function kunngjoringstype(tittel: string): 'ny' | 'endring' | 'oppheving' {
  const t = tittel.toLowerCase();
  if (/^(forskrift om )?(oppheving|opphevelse|oppheve|opphevning)\b/.test(t)) return 'oppheving';
  if (/\bendring(ar|er)? (i|av|til)\b|^ikrafttredelse|^ikraftsetjing|^ikraftsetting/.test(t)) return 'endring';
  return 'ny';
}

const VGS = /vidaregåande|videregående|vgs\b|gymnas/;

/**
 * Om forskriften er fra en kommune (et herad) og ikke gjelder videregående: «Gjelder for» nevner kommunen, og tittelen
 * nevner verken fylkeskommunen, Oslo kommune eller videregående (05.10.2026: skulerute i Kvam, Ulvik og Voss herad).
 */
export function erKommunal(tittel: string, gjelderFor: string): boolean {
  const t = tittel.toLowerCase();
  if (/fylkeskommune|oslo kommune/.test(t) || VGS.test(t)) return false;
  return /\b(kommune|herad)\b/i.test(gjelderFor) && !/^oslo kommune/i.test(gjelderFor);
}

/**
 * Om tittelen kan være en lokal forskrift for videregående appen viser: skoleregler (også for voksne og for en skole),
 * inntak, skolerute, skyss og fag- og timefordeling. Forskriften må være fra en fylkeskommune (eller Oslo kommune)
 * eller nevne videregående. Dokumentsiden avgjør.
 */
export function erKandidat(tittel: string): boolean {
  const t = tittel.toLowerCase();
  // Fylkets forskrifter har «fylkeskommune» i tittelen, eller bare fylket («…, Rogaland»). Kommunenes har «kommune».
  // Kommunenes har «kommune» eller «herad» (05.10.2026: skulereglar og skulerute i Kvam, Ulvik og Voss herad).
  if (!/fylkeskommune|oslo kommune/.test(t) && !VGS.test(t) && /\b(kommune|herad)\b/.test(t)) return false;
  if (/grunnsk[uo]l|barnesk[uo]l|ungdomssk[uo]l/.test(t) && !VGS.test(t)) return false;
  return /(skule|skole)reg|ordensreg|tilleggsreg|mobilreg|inntak|(skule|skole)rute|skyss|rabattordning|timefordeling|omfordeling|omdisponering|avvik(ande|ende) trinn/.test(t);
}

export interface Metadata {
  tittel: string;
  /** «FOR-2025-08-18-2220». */
  dato: string;
  /** Datoen forskriften tok til å gjelde (ÅÅÅÅ-MM-DD), og når den slutter, for skolerute. */
  iKraft: string | null;
  iKraftTil: string | null;
  sistEndret: string | null;
  gjelderFor: string;
  /** Hjemlene som adresser hos Lovdata, f.eks. «lov/2023-06-09-30/§10-7». */
  hjemmel: string[];
  /** Forskriftene en endring eller oppheving gjelder (metaField_endrer), som adresser hos Lovdata. */
  endrer: string[];
  /** Tidspunktet for kunngjøringen i Lovtidend, «2026-10-02T15:00». */
  kunngjort: string | null;
  malform: 'nb' | 'nn';
}

const datoFra = (tekst: string): string | null => {
  const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(tekst);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

/** Metadataene øverst på dokumentsiden. */
export function lesMetadata(html: string): Metadata {
  const rot = parse(html);
  const felt = (navn: string) => rot.querySelector(`#metaField_${navn}`);
  const tekst = (navn: string) => (felt(navn)?.text ?? '').replace(/\s+/g, ' ').trim();
  const ikraft = tekst('ikraft');
  const [fra, til] = ikraft.split(/\s+[–-]\s+/);
  // Lovdata oppgir ikke målformen. Heimelen øverst i teksten står på forskriftens målform («Heimel:» er nynorsk).
  const hode = rot.querySelector('#documentBody')?.text.slice(0, 400) ?? '';
  const nynorsk = /\bHeimel\b|\bFastsett\b/.test(hode) || (!/\bHjemmel\b|\bFastsatt\b/.test(hode) && /\b(ikkje|dei|vere|skulen)\b/.test(hode));
  return {
    tittel: (rot.querySelector('#documentMeta h1')?.text ?? '').replace(/\s+/g, ' ').trim(),
    dato: tekst('dato'),
    iKraft: fra ? datoFra(fra) : null,
    iKraftTil: til ? datoFra(til) : null,
    sistEndret: datoFra(tekst('endret')),
    gjelderFor: tekst('gjelder'),
    hjemmel: (felt('hjemmel')?.querySelectorAll('a') ?? []).map((a) => a.getAttribute('data-id') ?? '').filter(Boolean),
    endrer: (felt('endrer')?.querySelectorAll('a') ?? []).map((a) => a.getAttribute('data-id') ?? '').filter(Boolean),
    kunngjort: tekst('kunngjort') ? tidspunkt(tekst('kunngjort')) : null,
    malform: nynorsk ? 'nn' : 'nb',
  };
}

export type Lokaltype = 'skoleregler' | 'skoleregler-voksne' | 'skoleregler-skole' | 'inntak' | 'skolerute' | 'skyss' | 'fagfordeling';

const OPPLAERINGSLOVA = 'lov/2023-06-09-30';
const OPPLAERINGSFORSKRIFTA = 'forskrift/2024-06-03-900';
/**
 * Opplæringslova og -forskrifta fra før 1.8.2024. Forskrifter med hjemmel i dem som Lovdata fortsatt har som
 * gjeldende, tas med (eier 05.10.2026: det som står i Lovdata, regnes som gjeldende). Finnes det en nyere forskrift av
 * samme type for fylket, går den foran (velgForskrifter).
 */
const GAMLE = ['lov/1998-07-17-61', 'forskrift/2006-06-23-724'];

/**
 * Typen ut fra hjemmelen og tittelen (eier 05.10.2026). Hjemmelen må være opplæringslova eller opplæringsforskrifta.
 * - Opplæringslova § 10-7 er skoleregler: for voksne når tittelen nevner voksne, og for en skole når tittelen har
 *   navnet på en skole (`skoler` er treffene i skoleregisteret, se finnSkoler) eller hjemmelen også er fylkets
 *   skoleregler.
 * - Opplæringslova § 14-1 er skolerute.
 * - Ellers avgjør tittelen: inntak, ordens- og skoleregler (for voksne har de ofte en annen hjemmel), skolerute, skyss
 *   og rabattordning, og fag- og timefordeling.
 * Null når forskriften ikke er en av typene.
 */
export function klassifiser(meta: Pick<Metadata, 'tittel' | 'hjemmel'>, skoler: readonly string[]): Lokaltype | null {
  const h = meta.hjemmel;
  const t = meta.tittel.toLowerCase();
  const voksne = /vaksne|voksne/.test(t);
  if (!h.some((x) => [OPPLAERINGSLOVA, OPPLAERINGSFORSKRIFTA, ...GAMLE].some((lov) => x.startsWith(lov)))) return null;
  if (h.some((x) => x === `${OPPLAERINGSLOVA}/§10-7`)) {
    // Skolens egne regler er fastsatt med heimel også i fylkets skoleregler (en annen forskrift enn opplæringsforskrifta).
    const underFylket = h.some((x) => x.startsWith('forskrift/') && !x.startsWith(OPPLAERINGSFORSKRIFTA));
    if (skoler.length > 0 || underFylket) return 'skoleregler-skole';
    return voksne ? 'skoleregler-voksne' : 'skoleregler';
  }
  if (h.some((x) => x === `${OPPLAERINGSLOVA}/§14-1`) || /(skule|skole)rute/.test(t)) return 'skolerute';
  if (/inntak/.test(t)) return 'inntak';
  if (/timefordeling|omfordeling|omdisponering|avvik(ande|ende) trinn/.test(t)) return 'fagfordeling';
  if (/skyss|rabattordning/.test(t)) return 'skyss';
  if (/(skule|skole|ordens)reg/.test(t)) return voksne ? 'skoleregler-voksne' : skoler.length > 0 ? 'skoleregler-skole' : 'skoleregler';
  return null;
}

export interface Fylke {
  nummer: string;
  navn: string;
}

/** Fylket forskriften gjelder for («Vestland», «Oslo kommune, Oslo»), eller null når det ikke er nøyaktig ett. */
export function finnFylke(gjelderFor: string, fylker: readonly Fylke[]): string | null {
  const deler = gjelderFor.split(',').map((d) => d.trim().toLowerCase());
  const treff = fylker.filter((f) => deler.includes(f.navn.toLowerCase()));
  return treff.length === 1 ? (treff[0] as Fylke).nummer : null;
}

/** Skolenavn til sammenligning: små bokstaver, og «vidaregåande skule», «videregående skole» og «vgs» likt. */
export function normaliserSkolenavn(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/\b(vidaregåande|videregående)\s+(skule|skole)\b/g, 'vgs')
    .replace(/\b(vidaregåande|videregående)\b/g, 'vgs')
    .replace(/\b(as|avd\.?)\b/g, '')
    .replace(/[^a-zæøå0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface Skole {
  id: string;
  navn: string;
  fylke: string;
}

/**
 * Skolene i fylket som tittelen nevner ved navn. Et lengre navn går foran et kortere som står inni det («Bergen
 * katedralskole» før «Bergen»). En forskrift kan gjelde flere skoler («Førde og Høyanger»).
 */
export function finnSkoler(tittel: string, fylke: string, skoler: readonly Skole[]): Skole[] {
  const t = ` ${normaliserSkolenavn(tittel)} `;
  const kandidater = skoler
    .filter((s) => s.fylke === fylke)
    .map((s) => ({ s, n: normaliserSkolenavn(s.navn) }))
    .filter(({ n }) => n.length > 3 && t.includes(` ${n} `))
    .sort((a, b) => b.n.length - a.n.length);
  const valgt: { s: Skole; n: string }[] = [];
  for (const k of kandidater) if (!valgt.some((v) => v.n.includes(k.n))) valgt.push(k);
  // «Førde og Høyanger vidaregåande skular»: stedsnavnene foran «vgs» i tittelen, slått opp hver for seg.
  const m = / ([a-zæøå]+) og ([a-zæøå]+) vgs /.exec(t);
  const steder = m ? [m[1], m[2]] : [];
  for (const s of skoler) {
    if (s.fylke === fylke && steder.some((st) => normaliserSkolenavn(s.navn) === `${st} vgs`) && !valgt.some((v) => v.s.id === s.id)) valgt.push({ s, n: '' });
  }
  return valgt.map((v) => v.s).sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
}

/** Adresse-delen av et navn: «Møre og Romsdal» → «more-og-romsdal». */
export function slug(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Skoleårene en skolerute gjelder for, ut fra perioden: «2026-08-01–2027-07-31» → «2026-2027», og for flere skoleår
 * «2025-08-01–2028-07-31» → «2025-2028».
 */
export function skolearFor(fra: string | null, til: string | null): string | null {
  if (!fra) return null;
  const start = Number(fra.slice(0, 4)) - (Number(fra.slice(5, 7)) < 7 ? 1 : 0);
  const slutt = til ? Number(til.slice(0, 4)) + (Number(til.slice(5, 7)) >= 8 ? 1 : 0) : start + 1;
  return `${start}-${Math.max(slutt, start + 1)}`;
}
