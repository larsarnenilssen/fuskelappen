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

/** Om tittelen kan være skoleregler, inntak eller skolerute for videregående. Dokumentsiden avgjør. */
export function erKandidat(tittel: string): boolean {
  const t = tittel.toLowerCase();
  if (!/fylkeskommune|oslo kommune/.test(t)) return false;
  if (/grunnskule|grunnskole/.test(t) && !/vidaregåande|videregående/.test(t)) return false;
  return /(skule|skole)reg|ordensreg|tilleggsreg|inntak|(skule|skole)rute/.test(t);
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
    malform: nynorsk ? 'nn' : 'nb',
  };
}

export type Lokaltype = 'skoleregler' | 'skoleregler-voksne' | 'skoleregler-skole' | 'inntak' | 'skolerute';

const OPPLAERINGSLOVA = 'lov/2023-06-09-30';
const OPPLAERINGSFORSKRIFTA = 'forskrift/2024-06-03-900';

/**
 * Typen ut fra hjemmelen. Skoleregler er for en skole når tittelen har navnet på en skole (`skoler` er treffene i
 * skoleregisteret, se finnSkoler) eller hjemmelen også er fylkets skoleregler, og for voksne når tittelen nevner
 * voksne. Null når forskriften ikke er en av typene.
 */
export function klassifiser(meta: Metadata, skoler: readonly string[]): Lokaltype | null {
  const h = meta.hjemmel;
  const t = meta.tittel.toLowerCase();
  if (h.some((x) => x === `${OPPLAERINGSLOVA}/§10-7`)) {
    // Skolens egne regler er fastsatt med heimel også i fylkets skoleregler (en annen forskrift enn opplæringsforskrifta).
    const underFylket = h.some((x) => x.startsWith('forskrift/') && !x.startsWith(OPPLAERINGSFORSKRIFTA));
    if (skoler.length > 0 || underFylket) return 'skoleregler-skole';
    return /vaksne|voksne/.test(t) ? 'skoleregler-voksne' : 'skoleregler';
  }
  if (h.some((x) => x === `${OPPLAERINGSLOVA}/§14-1`)) return 'skolerute';
  if (h.some((x) => x.startsWith(`${OPPLAERINGSFORSKRIFTA}/§4-`) || x === `${OPPLAERINGSFORSKRIFTA}/§7-2`) || (h.some((x) => x.startsWith(OPPLAERINGSFORSKRIFTA)) && /inntak/.test(t))) return 'inntak';
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

/** Skoleåret en skolerute gjelder for, ut fra perioden: «2026-08-01–2027-07-31» → «2026-2027». */
export function skolearFor(fra: string | null, til: string | null): string | null {
  if (!fra) return null;
  const start = Number(fra.slice(0, 4)) - (Number(fra.slice(5, 7)) < 7 ? 1 : 0);
  return til && Number(til.slice(0, 4)) > start + 1 ? null : `${start}-${start + 1}`;
}
