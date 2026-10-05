// Registeret over lokale forskrifter for videregående i alle fylker (avgjørelse 061), i data/lovdata/lokale.json.
// Lesingen av sidene hos Lovdata står i register.ts. Her er oppdateringen av registeret:
// - Hele registeret hos Lovdata leses første gang, med --alle, og hver 13. uke. Forskrifter som ikke står der lenger
//   (opphevet), fjernes da.
// - Hver 4. uke leses bare inneværende og forrige år (en forskrift kan kunngjøres måneder etter datoen den har).
// - Nye kandidater vurderes ut fra dokumentsiden. Vurderingen lagres, så siden hentes bare én gang.
// - Høyst én forespørsel i sekundet, av hensyn til Lovdata.
// velgForskrifter og tittelFor er rene funksjoner, testet i tests/unit/lokale-forskrifter.test.ts.
import { z } from 'zod';
import { USER_AGENT } from '../kilder/metoder.ts';
import { erKandidat, finnFylke, finnSkoler, type Fylke, klassifiser, type Lokaltype, lesMetadata, lesRegisterside, type Metadata, type Skole, skolearFor, slug } from './register.ts';

const LOVDATA = 'https://lovdata.no';
const PAUSE_MS = 1000;
/** Øvre grense for sider i registeret, i tilfelle siden endrer seg og «neste side» aldri tar slutt. */
const MAKS_SIDER = 1500;

const lokaltype = z.enum(['skoleregler', 'skoleregler-voksne', 'skoleregler-skole', 'inntak', 'skolerute']);

/** En kandidat fra registeret, vurdert ut fra dokumentsiden. */
const vurderingSkjema = z
  .object({
    refid: z.string().regex(/^forskrift\/\d{4}-\d{2}-\d{2}-\d+$/),
    tittel: z.string().min(1),
    type: lokaltype.nullable(),
    fylke: z.string().regex(/^\d{2}$/).nullable(),
    skoler: z.array(z.string()),
    malform: z.enum(['nb', 'nn']),
    iKraft: z.string().nullable(),
    iKraftTil: z.string().nullable(),
    sistEndret: z.string().nullable(),
    vurdert: z.string(),
  })
  .strict();
export type Vurdering = z.infer<typeof vurderingSkjema>;

/** En forskrift appen viser, med fast id (adressen i appen). */
const lokalForskriftSkjema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    refid: z.string(),
    type: lokaltype,
    fylke: z.string().regex(/^\d{2}$/),
    skoler: z.array(z.string()),
    korttittel: z.string().min(1),
    malform: z.enum(['nb', 'nn']),
    iKraft: z.string().nullable(),
    iKraftTil: z.string().nullable(),
  })
  .strict();
export type LokalForskrift = z.infer<typeof lokalForskriftSkjema>;

export const lokaleSkjema = z
  .object({
    /** Sist hele registeret ble lest (ÅÅÅÅ-MM-DD). */
    fullstendig: z.string().nullable(),
    /** Sist registeret ble lest, helt eller delvis. */
    lest: z.string().nullable(),
    forskrifter: z.array(lokalForskriftSkjema),
    /** Alle kandidatene med vurderingen, også dem som ikke vises (type null eller uten fylke). */
    vurdert: z.array(vurderingSkjema),
  })
  .strict();
export type Lokale = z.infer<typeof lokaleSkjema>;

/** Titlene i appen per type, fra content/lovverk.yaml (lokale.titler). {sted} er fylket eller skolen. */
export type Titler = Record<Lokaltype, { nb: string; nn: string }>;

export function tittelFor(titler: Titler, type: Lokaltype, malform: 'nb' | 'nn', sted: string, skolear: string | null): string {
  return titler[type][malform].replace('{sted}', sted).replace('{skolear}', skolear?.replace('-', '–') ?? '');
}

/**
 * Forskriftene appen viser, med faste id-er: <fylke>-skoleregler, <fylke>-skoleregler-voksne, <fylke>-inntak,
 * <fylke>-skolerute-<skoleår> og <skole>-skoleregler. Har flere forskrifter samme id, får den som gjelder i dag id-en,
 * og en som tar til å gjelde senere, får «-fra-<dato>». Eldre forskrifter og skoleruter for skoleår som er over,
 * tas ikke med.
 */
export function velgForskrifter(vurdert: readonly Vurdering[], fylker: readonly Fylke[], skoler: readonly Skole[], titler: Titler, idag: string): LokalForskrift[] {
  const fylkesnavn = new Map(fylker.map((f) => [f.nummer, f.navn]));
  const skolenavn = new Map(skoler.map((s) => [s.id, s.navn]));
  const iAar = Number(idag.slice(0, 4)) - (Number(idag.slice(5, 7)) < 8 ? 1 : 0);
  const grupper = new Map<string, { v: Vurdering; sted: string; skolear: string | null }[]>();
  for (const v of vurdert) {
    if (!v.type || !v.fylke) continue;
    const fylke = fylkesnavn.get(v.fylke);
    if (!fylke) continue;
    const skolear = v.type === 'skolerute' ? skolearFor(v.iKraft, v.iKraftTil) : null;
    if (v.type === 'skolerute' && (!skolear || Number(skolear.slice(0, 4)) < iAar)) continue;
    const navn = v.skoler.map((s) => skolenavn.get(s)).filter((n): n is string => !!n);
    if (v.type === 'skoleregler-skole' && navn.length === 0) continue;
    const grunn =
      v.type === 'skoleregler-skole'
        ? `${navn.map(slug).join('-og-')}-skoleregler`
        : v.type === 'skolerute'
          ? `${slug(fylke)}-skolerute-${skolear}`
          : `${slug(fylke)}-${v.type}`;
    const sted = v.type === 'skoleregler-skole' ? navn.join(' og ') : fylke;
    grupper.set(grunn, [...(grupper.get(grunn) ?? []), { v, sted, skolear }]);
  }
  const ut: LokalForskrift[] = [];
  for (const [grunn, liste] of grupper) {
    const sortert = [...liste].sort((a, b) => (b.v.iKraft ?? '').localeCompare(a.v.iKraft ?? ''));
    const gjeldende = sortert.find((x) => !x.v.iKraft || x.v.iKraft <= idag) ?? null;
    const senere = sortert.filter((x) => x.v.iKraft && x.v.iKraft > idag);
    for (const x of [...(gjeldende ? [gjeldende] : []), ...senere]) {
      ut.push({
        id: x === gjeldende ? grunn : `${grunn}-fra-${x.v.iKraft}`,
        refid: x.v.refid,
        type: x.v.type as Lokaltype,
        fylke: x.v.fylke as string,
        skoler: x.v.skoler,
        korttittel: tittelFor(titler, x.v.type as Lokaltype, x.v.malform, x.sted, x.skolear),
        malform: x.v.malform,
        iKraft: x.v.iKraft,
        iKraftTil: x.v.iKraftTil,
      });
    }
  }
  return ut.sort((a, b) => a.fylke.localeCompare(b.fylke) || a.id.localeCompare(b.id));
}

const pause = () => new Promise((r) => setTimeout(r, PAUSE_MS));

async function hentTekst(url: string): Promise<string> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, signal: AbortSignal.timeout(60_000) });
      if (!svar.ok) throw new Error(`${url} svarte ${svar.status} ${svar.statusText}`);
      return await svar.text();
    } catch (e) {
      feil = e;
      await new Promise((r) => setTimeout(r, 10_000 * forsok));
    }
  }
  throw feil;
}

/** Alle sidene i registeret med filteret (f.eks. «year=2026»), eller hele registeret uten filter. */
async function lesRegister(filter: string): Promise<{ refid: string; tittel: string }[]> {
  const treff: { refid: string; tittel: string }[] = [];
  for (let side = 0; side < MAKS_SIDER; side++) {
    const html = await hentTekst(`${LOVDATA}/register/lokaleForskrifter?${filter}${filter ? '&' : ''}offset=${side * 20}`);
    const s = lesRegisterside(html);
    treff.push(...s.treff);
    if (side % 50 === 49) console.log(`Registeret${filter ? ` (${filter})` : ''}: ${treff.length} av ${s.antall ?? '?'}`);
    await pause();
    if (!s.neste || s.treff.length === 0) break;
  }
  return treff;
}

export function vurder(refid: string, meta: Metadata, fylker: readonly Fylke[], skoler: readonly Skole[], idag: string): Vurdering {
  const fylke = finnFylke(meta.gjelderFor, fylker);
  const treff = fylke ? finnSkoler(meta.tittel, fylke, skoler) : [];
  const type = klassifiser(meta, treff.map((s) => s.id));
  return {
    refid,
    tittel: meta.tittel,
    type,
    fylke,
    skoler: type === 'skoleregler-skole' ? treff.map((s) => s.id) : [],
    malform: meta.malform,
    iKraft: meta.iKraft,
    iKraftTil: meta.iKraftTil,
    sistEndret: meta.sistEndret,
    vurdert: idag,
  };
}

/**
 * Oppdaterer registeret. `full` leser hele registeret hos Lovdata, ellers inneværende og forrige år. Gir det nye
 * registeret og sidene som ble hentet (refid → HTML), så teksten ikke hentes en gang til.
 */
export async function oppdaterLokale(forrige: Lokale | null, valg: { full: boolean; fylker: readonly Fylke[]; skoler: readonly Skole[]; titler: Titler; idag: string }): Promise<{ lokale: Lokale; sider: Map<string, string>; rapport: string[] }> {
  const { full, fylker, skoler, titler, idag } = valg;
  const aar = Number(idag.slice(0, 4));
  const treff = full ? await lesRegister('') : [...(await lesRegister(`year=${aar}`)), ...(await lesRegister(`year=${aar - 1}`))];
  const kandidater = new Map(treff.filter((t) => erKandidat(t.tittel)).map((t) => [t.refid, t]));
  const tidligere = new Map((forrige?.vurdert ?? []).map((v) => [v.refid, v]));
  const sider = new Map<string, string>();
  const rapport: string[] = [];
  for (const k of kandidater.values()) {
    if (tidligere.has(k.refid)) continue;
    const html = await hentTekst(`${LOVDATA}/dokument/LF/${k.refid}`);
    await pause();
    sider.set(k.refid, html);
    const v = vurder(k.refid, lesMetadata(html), fylker, skoler, idag);
    tidligere.set(k.refid, v);
    rapport.push(`Ny: ${v.tittel} (${v.type ?? 'ikke tatt med'})`);
  }
  // Etter en full lesing er det som ikke står i registeret lenger, opphevet.
  if (full) {
    for (const refid of [...tidligere.keys()]) {
      if (!kandidater.has(refid)) {
        rapport.push(`Ikke lenger i registeret: ${tidligere.get(refid)?.tittel}`);
        tidligere.delete(refid);
      }
    }
  }
  const vurdert = [...tidligere.values()].sort((a, b) => a.refid.localeCompare(b.refid));
  for (const v of vurdert) {
    if (v.type === 'skoleregler-skole' && v.skoler.length === 0) rapport.push(`Fant ikke skolen i skoleregisteret: ${v.tittel}`);
    if (v.type && !v.fylke) rapport.push(`Fant ikke ett fylke for: ${v.tittel}`);
  }
  console.log(`Lokale forskrifter: ${treff.length} i registeret${full ? '' : ` (${aar - 1}–${aar})`}, ${kandidater.size} kandidater, ${sider.size} nye.`);
  return {
    lokale: { fullstendig: full ? idag : (forrige?.fullstendig ?? null), lest: idag, forskrifter: velgForskrifter(vurdert, fylker, skoler, titler, idag), vurdert },
    sider,
    rapport,
  };
}
