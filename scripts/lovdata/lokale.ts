// Registeret over lokale forskrifter for videregående i alle fylker (avgjørelse 061), i data/lovdata/lokale.json.
// Lesingen av sidene hos Lovdata står i register.ts. Her er oppdateringen av registeret:
// - Hver uke leses kunngjøringene i Norsk Lovtidend avdeling II siden forrige gang: nye forskrifter, endringer og
//   opphevinger (eier 05.10.2026). Alle lokale forskrifter kunngjøres der.
// - Hele registeret hos Lovdata leses første gang, med --alle og én gang i året, fylke for fylke, som en kontroll.
// - Nye kandidater vurderes ut fra dokumentsiden. Vurderingen lagres, så siden hentes bare én gang.
// - Høyst én forespørsel i sekundet, av hensyn til Lovdata.
// velgForskrifter og tittelFor er rene funksjoner, testet i tests/unit/lokale-forskrifter.test.ts.
import { z } from 'zod';
import { USER_AGENT } from '../kilder/metoder.ts';
import {
  erKandidat,
  erKommunal,
  finnFylke,
  finnSkoler,
  type Fylke,
  klassifiser,
  KANDIDATREGLER,
  type Kunngjoring,
  kunngjoringstype,
  lesKunngjoringstidspunkter,
  lesLovtidendside,
  type Lokaltype,
  lesMetadata,
  lesRegisterside,
  type Metadata,
  type Skole,
  skolearFor,
  slug,
  tidspunkt,
} from './register.ts';

const LOVDATA = 'https://lovdata.no';
const PAUSE_MS = 1000;
/** Øvre grense for sider i registeret, i tilfelle siden endrer seg og «neste side» aldri tar slutt. */
const MAKS_SIDER = 1500;

const lokaltype = z.enum(['skoleregler', 'skoleregler-voksne', 'skoleregler-skole', 'inntak', 'skolerute', 'skyss', 'fagfordeling']);

/**
 * En kandidat fra registeret med metadataene fra dokumentsiden. Typen, fylket og skolen avgjøres på nytt ved hver
 * henting (velgForskrifter), så endrede regler gjelder uten at sidene hentes igjen.
 */
const vurderingSkjema = z
  .object({
    refid: z.string().regex(/^forskrift\/\d{4}-\d{2}-\d{2}-\d+$/),
    tittel: z.string().min(1),
    gjelderFor: z.string(),
    hjemmel: z.array(z.string()),
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
    /** Navnet i appen på bokmål og nynorsk (titlene i content/lovverk.yaml). */
    korttittel: z.string().min(1),
    // Mangler i registre fra før 05.10.2026. Navnene lages på nytt hver gang registeret oppdateres.
    korttittelNn: z.string().min(1).optional(),
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
    /** Versjonen av reglene for kandidatene da hele registeret sist ble lest (KANDIDATREGLER i register.ts). */
    kandidatregler: z.number().int().optional(),
    /** Sist registeret eller Lovtidend ble lest. */
    lest: z.string().nullable(),
    /** Tidspunktet for den nyeste kunngjøringen i Lovtidend avdeling II som er lest («2026-10-02T15:00»). */
    lovtidend: z.string().nullable().default(null),
    /**
     * Forskrifter som er opphevet fra en dato som ikke er kommet ennå (refid → dato). Null når datoen ikke er satt ennå
     * («Fylkestinget bestemmer»). Da venter opphevingen til en kunngjøring om ikrafttredelse gir datoen.
     */
    opphevinger: z.record(z.string(), z.string().nullable()).default({}),
    /** Forskrifter med en kunngjort endring som tar til å gjelde fra en dato som ikke er kommet ennå (refid → dato), eller null. */
    endringer: z.record(z.string(), z.string().nullable()).default({}),
    forskrifter: z.array(lokalForskriftSkjema),
    /** Alle kandidatene med vurderingen, også dem som ikke vises (type null eller uten fylke). */
    vurdert: z.array(vurderingSkjema),
  })
  .strict();
export type Lokale = z.infer<typeof lokaleSkjema>;

/** Titlene i appen per type, fra content/lovverk.yaml (lokale.titler). {sted} er fylket eller skolen. */
export type Titler = Record<Lokaltype, { nb: string; nn: string }> & { 'mobilregler-skole'?: { nb: string; nn: string } };

/** Skolens egne regler bare om mobil og smartklokke, f.eks. «mobilreglar for Askøy …» (eier 06.10.2026). */
export const erMobilregler = (tittel: string): boolean => /mobil|smartklokk/i.test(tittel);

export function tittelFor(titler: Titler, type: Lokaltype | 'mobilregler-skole', malform: 'nb' | 'nn', sted: string, skolear: string | null): string {
  const mal = type === 'mobilregler-skole' ? (titler['mobilregler-skole'] ?? titler['skoleregler-skole']) : titler[type];
  return mal[malform].replace('{sted}', sted).replace('{skolear}', skolear?.replace('-', '–') ?? '');
}

/** Typen, fylket og skolene for en kandidat, med reglene i register.ts. */
export function klassifiserVurdering(v: Vurdering, fylker: readonly Fylke[], skoler: readonly Skole[]): { type: Lokaltype | null; fylke: string | null; skoler: string[] } {
  const fylke = finnFylke(v.gjelderFor, fylker);
  const treff = fylke ? finnSkoler(v.tittel, fylke, skoler).map((s) => s.id) : [];
  const type = erKommunal(v.tittel, v.gjelderFor) ? null : klassifiser(v, treff);
  return { type, fylke, skoler: type === 'skoleregler-skole' || type === 'fagfordeling' ? treff : [] };
}

/**
 * Forskriftene appen viser, med faste id-er: <fylke>-skoleregler, <fylke>-skoleregler-voksne, <fylke>-inntak,
 * <fylke>-skyss, <fylke>-skolerute-<skoleår>, <skole>-skoleregler og <skole>-fagfordeling-<nr>. Har flere forskrifter
 * samme id, får den som gjelder i dag id-en, og en som tar til å gjelde senere, får «-fra-<dato>». Eldre forskrifter
 * og skoleruter for skoleår som er over, tas ikke med. Fag- og timefordeling gjelder én skole og ett løp, så hver
 * forskrift står for seg. Finnes ikke skolen i skoleregisteret, gjelder den fylket.
 */
export function velgForskrifter(vurdert: readonly Vurdering[], fylker: readonly Fylke[], skoler: readonly Skole[], titler: Titler, idag: string): LokalForskrift[] {
  const fylkesnavn = new Map(fylker.map((f) => [f.nummer, f.navn]));
  const skolenavn = new Map(skoler.map((s) => [s.id, s.navn]));
  const iAar = Number(idag.slice(0, 4)) - (Number(idag.slice(5, 7)) < 8 ? 1 : 0);
  const grupper = new Map<string, { v: Vurdering; type: Lokaltype; fylke: string; skoler: string[]; sted: string; skolear: string | null; mobil: boolean }[]>();
  for (const v of vurdert) {
    const k = klassifiserVurdering(v, fylker, skoler);
    if (!k.type || !k.fylke) continue;
    const fylke = fylkesnavn.get(k.fylke);
    if (!fylke) continue;
    const skolear = k.type === 'skolerute' ? skolearFor(v.iKraft, v.iKraftTil) : null;
    if (k.type === 'skolerute' && (!skolear || Number(skolear.slice(5)) <= iAar)) continue;
    const navn = k.skoler.map((s) => skolenavn.get(s)).filter((n): n is string => !!n);
    // Skolens egne regler tas bare med når skolen finnes. Fag- og timefordeling uten skole gjelder hele fylket.
    if (k.type === 'skoleregler-skole' && navn.length === 0) continue;
    // Regler bare om mobil står ved siden av skolens skoleregler, ikke i stedet for dem (eier 06.10.2026).
    const mobil = k.type === 'skoleregler-skole' && erMobilregler(v.tittel);
    const grunn =
      k.type === 'skoleregler-skole'
        ? `${navn.map(slug).join('-og-')}-${mobil ? 'mobilregler' : 'skoleregler'}`
        : k.type === 'fagfordeling'
          ? `${(navn.length > 0 ? navn : [fylke]).map(slug).join('-og-')}-fagfordeling-${v.refid.split('-').at(-1)}`
          : k.type === 'skolerute'
            ? `${slug(fylke)}-skolerute-${skolear}`
            : `${slug(fylke)}-${k.type}`;
    const sted = navn.length > 0 && (k.type === 'skoleregler-skole' || k.type === 'fagfordeling') ? navn.join(' og ') : fylke;
    grupper.set(grunn, [...(grupper.get(grunn) ?? []), { v, type: k.type, fylke: k.fylke, skoler: k.skoler, sted, skolear, mobil }]);
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
        type: x.type,
        fylke: x.fylke,
        skoler: x.skoler,
        korttittel: tittelFor(titler, x.mobil ? 'mobilregler-skole' : x.type, 'nb', x.sted, x.skolear),
        korttittelNn: tittelFor(titler, x.mobil ? 'mobilregler-skole' : x.type, 'nn', x.sted, x.skolear),
        malform: x.v.malform,
        iKraft: x.v.iKraft,
        iKraftTil: x.v.iKraftTil,
      });
    }
  }
  return ut.sort((a, b) => a.fylke.localeCompare(b.fylke) || a.id.localeCompare(b.id));
}

let pauseMs = PAUSE_MS;
/** Pausen mellom forespørslene til Lovdata. Kan settes kortere i testene. */
export const pause = (ms: number = pauseMs) => new Promise((r) => setTimeout(r, ms));

/** Siden finnes ikke (404 eller 410). Prøves ikke igjen. */
export class IkkeFunnet extends Error {}

/** Teksten på en side hos Lovdata, med inntil tre forsøk. */
export async function hentTekst(url: string): Promise<string> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, signal: AbortSignal.timeout(60_000) });
      if (svar.status === 404 || svar.status === 410) throw new IkkeFunnet(`${url} svarte ${svar.status}`);
      if (!svar.ok) throw new Error(`${url} svarte ${svar.status} ${svar.statusText}`);
      return await svar.text();
    } catch (e) {
      if (e instanceof IkkeFunnet) throw e;
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

export function vurder(refid: string, meta: Metadata, idag: string): Vurdering {
  return {
    refid,
    tittel: meta.tittel,
    gjelderFor: meta.gjelderFor,
    hjemmel: meta.hjemmel,
    malform: meta.malform,
    iKraft: meta.iKraft,
    iKraftTil: meta.iKraftTil,
    sistEndret: meta.sistEndret,
    vurdert: idag,
  };
}

/**
 * Nye kandidater fra registeret eller Lovtidend: siden hentes én gang, og metadataene lagres. En ny forskrift som
 * endrer en forskrift appen har (metaField_endrer), erstatter den: den gamle fjernes når den nye tar til å gjelde.
 * Gir forskriftene som ikke finnes blant de lokale forskriftene hos Lovdata (f.eks. en oppheving).
 */
async function vurderNye(
  refider: Iterable<string>,
  tidligere: Map<string, Vurdering>,
  sider: Map<string, string>,
  opphevinger: Map<string, string | null>,
  rapport: string[],
  valg: { fylker: readonly Fylke[]; skoler: readonly Skole[]; idag: string },
): Promise<string[]> {
  const ikkeFunnet: string[] = [];
  const erstatter: { refid: string; endrer: string[]; fra: string | null }[] = [];
  for (const refid of refider) {
    if (tidligere.has(refid)) continue;
    let html: string;
    try {
      html = await hentTekst(`${LOVDATA}/dokument/LF/${refid}`);
    } catch (e) {
      if (!(e instanceof IkkeFunnet)) throw e;
      ikkeFunnet.push(refid);
      continue;
    } finally {
      await pause();
    }
    sider.set(refid, html);
    const meta = lesMetadata(html);
    const v = vurder(refid, meta, valg.idag);
    tidligere.set(refid, v);
    rapport.push(`Ny: ${v.tittel} (${klassifiserVurdering(v, valg.fylker, valg.skoler).type ?? 'ikke tatt med'})`);
    // Uten dato for ikrafttredelse («Fylkestinget bestemmer») er datoen ukjent, ikke i dag.
    erstatter.push({ refid, endrer: meta.endrer, fra: meta.iKraft });
  }
  // Etter at alle er lest, så rekkefølgen ikke betyr noe.
  for (const n of erstatter) {
    for (const e of n.endrer.filter((x) => tidligere.has(x) && x !== n.refid)) {
      opphevinger.set(e, n.fra);
      rapport.push(`Erstattes fra ${n.fra ?? 'en dato som ikke er satt ennå'}: ${tidligere.get(e)?.tittel}`);
    }
  }
  return ikkeFunnet;
}

/** Leser registeret fylke for fylke: hele, eller bare årene i `aar`. */
async function lesRegisterPerFylke(fylker: readonly Fylke[], aar: readonly number[] | null): Promise<{ refid: string; tittel: string }[]> {
  // Kommer det en ny forskrift mens registeret leses, forskyves sidene, og en forskrift kan falle mellom to sider. Med
  // ett fylke om gangen er det kort tid til det skjer (05.10.2026).
  const treff: { refid: string; tittel: string }[] = [];
  for (const f of fylker) {
    const fylke = `county=${encodeURIComponent(f.navn)}`;
    if (!aar) treff.push(...(await lesRegister(fylke)));
    else for (const a of aar) treff.push(...(await lesRegister(`${fylke}&year=${a}`)));
  }
  return treff;
}

/**
 * Kunngjøringene i Lovtidend avdeling II siden forrige lesing (avgjørelse 061, eier 05.10.2026): nye forskrifter,
 * endringer og opphevinger. Gir det nyeste tidspunktet som er lest, og om noe kan ha falt ut (`hull`): når tidspunktet
 * for forrige lesing ikke lenger står i menyen (ved årsskiftet), eller ett tidspunkt har flere kunngjøringer enn én
 * side viser (Lovtidend blar ikke). Da leses registeret for årene i tillegg.
 */
async function lesLovtidend(fra: string): Promise<{ kunngjoringer: Kunngjoring[]; nyeste: string; hull: boolean }> {
  const meny = lesKunngjoringstidspunkter(await hentTekst(`${LOVDATA}/register/lovtidend?avdeling=LTII`));
  await pause();
  if (meny.length === 0) throw new Error('Fant ingen tidspunkter for kunngjøring i Lovtidend. Siden kan ha fått ny struktur.');
  const nye = meny.filter((t) => tidspunkt(t) > fra).reverse();
  let hull = tidspunkt(meny.at(-1) as string) > fra;
  const kunngjoringer: Kunngjoring[] = [];
  for (const t of nye) {
    const html = await hentTekst(`${LOVDATA}/register/lovtidend?avdeling=LTII&kunngjortDato=${encodeURIComponent(t)}`);
    await pause();
    const side = lesLovtidendside(html);
    if (side.neste) hull = true;
    kunngjoringer.push(...side.treff.filter((k) => k.avdeling === 'LTII'));
  }
  return { kunngjoringer, nyeste: tidspunkt(meny[0] as string), hull };
}

/**
 * Oppdaterer registeret over lokale forskrifter (avgjørelse 061):
 * - `full`: hele registeret hos Lovdata, fylke for fylke (første gang, med --alle og én gang i året). En forskrift som
 *   ikke står der lenger, fjernes når siden hos Lovdata viser at den ikke er gjeldende.
 * - Ellers: kunngjøringene i Lovtidend avdeling II siden forrige gang. En ny forskrift vurderes, en endring gir ny
 *   henting av siden når endringen har tatt til å gjelde, og en oppheving fjerner forskriften fra samme tid. Kan noe ha
 *   falt ut, leses registeret for inneværende og forrige år i tillegg (et parallelt løp bare når det trengs).
 * Gir det nye registeret og sidene som ble hentet (refid → HTML). Teksten til dem brukes uten ny henting.
 */
export async function oppdaterLokale(
  forrige: Lokale | null,
  valg: { full: boolean; fylker: readonly Fylke[]; skoler: readonly Skole[]; titler: Titler; idag: string; pauseMs?: number },
): Promise<{ lokale: Lokale; sider: Map<string, string>; rapport: string[] }> {
  const { full, fylker, skoler, titler, idag } = valg;
  pauseMs = valg.pauseMs ?? PAUSE_MS;
  const aar = Number(idag.slice(0, 4));
  const tidligere = new Map((forrige?.vurdert ?? []).map((v) => [v.refid, v]));
  const sider = new Map<string, string>();
  const rapport: string[] = [];
  const opphevinger = new Map(Object.entries(forrige?.opphevinger ?? {}));
  const endringer = new Map(Object.entries(forrige?.endringer ?? {}));
  let lovtidend = forrige?.lovtidend ?? null;

  if (full) {
    // Tidspunktet i Lovtidend før registeret leses, så det som kunngjøres mens registeret leses, tas neste gang.
    const meny = lesKunngjoringstidspunkter(await hentTekst(`${LOVDATA}/register/lovtidend?avdeling=LTII`));
    if (meny[0]) lovtidend = tidspunkt(meny[0]);
    const treff = await lesRegisterPerFylke(fylker, null);
    const kandidater = new Set(treff.filter((t) => erKandidat(t.tittel)).map((t) => t.refid));
    for (const refid of await vurderNye(kandidater, tidligere, sider, opphevinger, rapport, { fylker, skoler, idag })) rapport.push(`Står i registeret, men siden finnes ikke: ${refid}`);
    for (const refid of [...tidligere.keys()]) {
      if (kandidater.has(refid)) continue;
      const finnes = await fetch(`${LOVDATA}/dokument/LF/${refid}`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) })
        .then(async (svar) => svar.ok && /\/dokument\/LF\//.test(svar.url) && (await svar.text()).includes('id="documentMeta"'))
        .catch(() => true);
      await pause();
      if (finnes) continue;
      rapport.push(`Ikke lenger i registeret: ${tidligere.get(refid)?.tittel}`);
      tidligere.delete(refid);
    }
    console.log(`Lokale forskrifter: ${treff.length} i registeret, ${kandidater.size} kandidater, ${sider.size} nye.`);
  } else {
    const fra = lovtidend ?? `${aar - 1}-01-01T00:00`;
    const lt = await lesLovtidend(fra);
    lovtidend = lt.nyeste;
    const relevante = lt.kunngjoringer.filter((k) => erKandidat(k.tittel));
    const ikkeFunnet = await vurderNye(
      relevante.filter((k) => kunngjoringstype(k.tittel) === 'ny').map((k) => k.refid),
      tidligere,
      sider,
      opphevinger,
      rapport,
      { fylker, skoler, idag },
    );
    // Endringer og opphevinger, og «nye» som ikke er blant de lokale forskriftene (en tittel som ikke sier hva
    // kunngjøringen gjør): «Endrer» på siden i Lovtidend viser hvilke forskrifter de gjelder.
    for (const k of relevante.filter((x) => kunngjoringstype(x.tittel) !== 'ny' || ikkeFunnet.includes(x.refid))) {
      let meta: ReturnType<typeof lesMetadata>;
      try {
        meta = lesMetadata(await hentTekst(`${LOVDATA}/dokument/LTII/${k.refid}`));
      } catch (e) {
        if (!(e instanceof IkkeFunnet)) throw e;
        rapport.push(`Fant ikke kunngjøringen i Lovtidend: ${k.tittel} (${k.refid})`);
        continue;
      } finally {
        await pause();
      }
      const oppheving = kunngjoringstype(k.tittel) === 'oppheving' || /opphev/i.test(meta.tittel);
      // Uten dato for ikrafttredelse er datoen ukjent (null), ikke i dag. En senere kunngjøring om ikrafttredelse
      // («Ikrafttredelse av …») har forskriften i «Endrer» og gir datoen.
      const fra = meta.iKraft;
      const naar = fra ?? 'en dato som ikke er satt ennå';
      const ikraft = /^ikraft/i.test(k.tittel);
      for (const e of meta.endrer.filter((x) => tidligere.has(x))) {
        if (oppheving || (ikraft && opphevinger.has(e) && opphevinger.get(e) === null)) {
          opphevinger.set(e, fra);
          rapport.push(`Oppheves fra ${naar}: ${tidligere.get(e)?.tittel}`);
        } else {
          endringer.set(e, fra === null ? null : fra > idag ? fra : idag);
          rapport.push(`Endret fra ${naar}: ${tidligere.get(e)?.tittel} (${k.tittel})`);
        }
      }
    }
    if (lt.hull) {
      rapport.push('Lovtidend dekket ikke hele perioden (årsskifte eller mange kunngjøringer samtidig). Registeret for inneværende og forrige år er lest i tillegg.');
      const treff = await lesRegisterPerFylke(fylker, [aar, aar - 1]);
      const mangler = await vurderNye(treff.filter((t) => erKandidat(t.tittel)).map((t) => t.refid), tidligere, sider, opphevinger, rapport, { fylker, skoler, idag });
      for (const refid of mangler) rapport.push(`Står i registeret, men siden finnes ikke: ${refid}`);
    }
    console.log(`Lokale forskrifter: ${lt.kunngjoringer.length} kunngjøringer i Lovtidend avdeling II siden ${fra}, ${relevante.length} for videregående, ${sider.size} nye.`);
  }
  // Endringer som har tatt til å gjelde: siden hentes på nytt, så teksten og datoene blir oppdatert.
  for (const [refid, dato] of endringer) {
    if (dato === null || dato > idag) continue;
    endringer.delete(refid);
    if (!tidligere.has(refid) || sider.has(refid)) continue;
    const html = await hentTekst(`${LOVDATA}/dokument/LF/${refid}`);
    await pause();
    sider.set(refid, html);
    tidligere.set(refid, vurder(refid, lesMetadata(html), idag));
  }
  // Opphevinger som har tatt til å gjelde.
  for (const [refid, dato] of opphevinger) {
    if (dato === null || dato > idag) continue;
    if (tidligere.has(refid)) rapport.push(`Opphevet: ${tidligere.get(refid)?.tittel}`);
    tidligere.delete(refid);
    opphevinger.delete(refid);
  }
  const vurdert = [...tidligere.values()].sort((a, b) => a.refid.localeCompare(b.refid));
  for (const v of vurdert) {
    const k = klassifiserVurdering(v, fylker, skoler);
    if (k.type === 'skoleregler-skole' && k.skoler.length === 0) rapport.push(`Fant ikke skolen i skoleregisteret: ${v.tittel}`);
    if (k.type && !k.fylke) rapport.push(`Fant ikke ett fylke for: ${v.tittel} (${v.gjelderFor})`);
  }
  return {
    lokale: {
      fullstendig: full ? idag : (forrige?.fullstendig ?? null),
      kandidatregler: full ? KANDIDATREGLER : forrige?.kandidatregler,
      lest: idag,
      lovtidend,
      opphevinger: Object.fromEntries(opphevinger),
      endringer: Object.fromEntries(endringer),
      forskrifter: velgForskrifter(vurdert, fylker, skoler, titler, idag),
      vurdert,
    },
    sider,
    rapport,
  };
}
