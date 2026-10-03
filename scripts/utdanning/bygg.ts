// Bygger løpene fra utdanning.no (data/utdanning/lop.json) fra API-et, kontrollerer dem og finner endringene siden
// forrige henting (avgjørelse 052). Skolene og yrkene (avgjørelse 053) bygges på samme måte. Rene funksjoner, testes i tests/unit/utdanning.test.ts.
import type { Skole, Skoler, Utdanningsbeskrivelse, Utdanningslop, Yrker } from '../../src/modules/fag/utdanning/skjema.ts';
import { nettside } from '../nor/bygg.ts';

/** Et barn i løpet slik API-et gir det (`/vgs/lop?parent_path=…`). Bare feltene som brukes. */
export interface Lopsbarn {
  programomradekode10: string;
  programomrade_tittel?: string | null;
  is_krysslop?: boolean | null;
}

const sortert = <V>(o: Record<string, V>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

/** Løpene fra kantene (fra → barn) og titlene som er hentet. */
export function byggUtdanningslop(kanter: readonly { fra: string; barn: Lopsbarn }[], titler: Readonly<Record<string, string>>, hentet: string): Utdanningslop {
  const videre: Record<string, Set<string>> = {};
  const kryss: Record<string, Set<string>> = {};
  const noder: Record<string, string> = { ...titler };
  for (const { fra, barn } of kanter) {
    const til = barn.programomradekode10;
    if (!til || til === fra) continue;
    (videre[fra] ??= new Set()).add(til);
    if (barn.is_krysslop) (kryss[fra] ??= new Set()).add(til);
    if (barn.programomrade_tittel) noder[til] = barn.programomrade_tittel;
  }
  const liste = (o: Record<string, Set<string>>) => sortert(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [...v].sort()])));
  return { kilde: 'utdanning-no', hentet, noder: sortert(noder), videre: liste(videre), kryss: liste(kryss) };
}

/** Feil som gjør at de nye dataene ikke tas inn (forrige fil blir stående). */
export function validerUtdanningslop(l: Utdanningslop): string[] {
  const feil: string[] = [];
  const kanter = Object.values(l.videre).flat().length;
  if (Object.keys(l.noder).length < 200) feil.push(`Fant bare ${Object.keys(l.noder).length} programområder.`);
  if (kanter < 400) feil.push(`Fant bare ${kanter} koblinger i løpene.`);
  if (!Object.keys(l.videre).some((k) => k.startsWith('STUSP1'))) feil.push('Fant ikke løpet fra Vg1 studiespesialisering.');
  return feil;
}

/** Endringene mellom to hentinger, én linje per endring, til kildesjekken og kontrollsaken. */
export function sammenlignUtdanningslop(gammel: Utdanningslop | null, ny: Utdanningslop): string[] {
  if (!gammel) return [];
  const par = (l: Utdanningslop) => new Set(Object.entries(l.videre).flatMap(([a, t]) => t.map((b) => `${a} → ${b}`)));
  const g = par(gammel);
  const n = par(ny);
  const nye = [...n].filter((p) => !g.has(p));
  const borte = [...g].filter((p) => !n.has(p));
  const ut: string[] = [];
  if (nye.length > 0) ut.push(`Nye koblinger (${nye.length}): ${nye.slice(0, 10).join(', ')}${nye.length > 10 ? ' …' : ''}`);
  if (borte.length > 0) ut.push(`Fjernede koblinger (${borte.length}): ${borte.slice(0, 10).join(', ')}${borte.length > 10 ? ' …' : ''}`);
  return ut;
}

/** En skole slik API-et gir den (`/vgs/skole`). Bare feltene som brukes. */
export interface Skolerad {
  skolenummer?: string | null;
  skolenavn: string;
  sektor?: string | null;
  lenke?: string | null;
  studieplasser?: number | null;
  kommunenr?: string | null;
  by?: string | null;
  fylkenr?: string | null;
  tilbyr_programmer?: string[] | null;
}

/**
 * Programområdet i Grep for en kode fra utdanning.no: koden selv, eller programområdet med de samme seks første
 * tegnene og bindestreker (lokale varianter som STUSP1--T- og PBPBY4YK--). null når Grep ikke har det.
 */
export function grepkode(kode: string, programomrader: Readonly<Record<string, unknown>>): string | null {
  if (programomrader[kode]) return kode;
  const grunn = `${kode.slice(0, 6)}----`;
  return programomrader[grunn] ? grunn : null;
}

/** Skolene med fylke, og programområdene i Grep de tilbyr. Skoler uten fylke (nettskoler o.l.) tas ikke med. */
export function byggSkoler(rader: readonly Skolerad[], programomrader: Readonly<Record<string, unknown>>, hentet: string): Skoler {
  const skoler: Skole[] = [];
  for (const r of rader) {
    const fylke = r.fylkenr?.trim() ?? '';
    if (!/^\d{2}$/.test(fylke)) continue;
    const tilbud = [...new Set((r.tilbyr_programmer ?? []).map((k) => grepkode(k, programomrader)).filter((k): k is string => !!k))].sort();
    skoler.push({
      nr: /^\d{5}$/.test(r.skolenummer ?? '') ? (r.skolenummer as string) : null,
      navn: r.skolenavn.trim(),
      fylke,
      kommune: /^\d{4}$/.test(r.kommunenr ?? '') ? (r.kommunenr as string) : null,
      sted: r.by?.trim() || null,
      privat: r.sektor === 'Privat',
      nettside: nettside(r.lenke),
      plasser: typeof r.studieplasser === 'number' ? r.studieplasser : null,
      tilbud,
    });
  }
  skoler.sort((a, b) => a.navn.localeCompare(b.navn, 'nb') || (a.nr ?? '').localeCompare(b.nr ?? ''));
  return { kilde: 'utdanning-no', hentet, skoler };
}

export function validerSkoler(d: Skoler): string[] {
  const feil: string[] = [];
  if (d.skoler.length < 300) feil.push(`Fant bare ${d.skoler.length} skoler.`);
  const tilbud = d.skoler.reduce((n, s) => n + s.tilbud.length, 0);
  if (tilbud < 4000) feil.push(`Fant bare ${tilbud} tilbud ved skolene.`);
  if (new Set(d.skoler.map((s) => s.fylke)).size < 10) feil.push('Skolene er i færre enn ti fylker.');
  return feil;
}

/** Endringene i skolene og tilbudene deres, én linje per endring. */
export function sammenlignSkoler(gammel: Skoler | null, ny: Skoler): string[] {
  if (!gammel) return [];
  const id = (s: Skole) => s.nr ?? s.navn;
  const g = new Map(gammel.skoler.map((s) => [id(s), s]));
  const n = new Map(ny.skoler.map((s) => [id(s), s]));
  const nye = ny.skoler.filter((s) => !g.has(id(s))).map((s) => s.navn);
  const borte = gammel.skoler.filter((s) => !n.has(id(s))).map((s) => s.navn);
  const tilbud: string[] = [];
  for (const s of ny.skoler) {
    const f = g.get(id(s));
    if (!f) continue;
    const pluss = s.tilbud.filter((k) => !f.tilbud.includes(k));
    const minus = f.tilbud.filter((k) => !s.tilbud.includes(k));
    if (pluss.length + minus.length > 0) tilbud.push(`${s.navn}: ${[...pluss.map((k) => `+${k}`), ...minus.map((k) => `−${k}`)].join(' ')}`);
  }
  const linje = (tittel: string, l: string[]) => (l.length > 0 ? [`${tittel} (${l.length}): ${l.slice(0, 10).join(', ')}${l.length > 10 ? ' …' : ''}`] : []);
  return [...linje('Nye skoler', nye), ...linje('Skoler borte', borte), ...linje('Endrede tilbud', tilbud)];
}

/** Informasjonen om et programområde slik API-et gir den (`/vgs/programomrade_info/{kode}`). Bare feltene som brukes. */
export interface Programinfo {
  programomradekode10: string;
  sluttkompetanse?: string | null;
  utdanningsbeskrivelse?: {
    utdanningsbeskrivelse_tittel?: string | null;
    utdanningsbeskrivelse_lenke?: string | null;
    utdanningsbeskrivelse_body?: string | null;
    yrker?: { yrkesbeskrivelse_tittel?: string | null; yrkesbeskrivelse_lenke?: string | null }[] | null;
  } | null;
}

/** Teksten uten HTML og med enkle mellomrom. */
const rentekst = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Utdanningsbeskrivelsene med yrker for programområdene. Bare programområder med yrker tas med. Teksten tas med når
 * den er kort (sluttkompetansen og yrkestittelen); lengre tekster står på utdanning.no.
 */
export function byggYrker(info: readonly Programinfo[], hentet: string): Yrker {
  const ut: Record<string, Utdanningsbeskrivelse> = {};
  for (const i of info) {
    const u = i.utdanningsbeskrivelse;
    const yrker = (u?.yrker ?? [])
      .filter((y) => y.yrkesbeskrivelse_tittel && y.yrkesbeskrivelse_lenke?.startsWith('/yrker/'))
      .map((y) => ({ tittel: (y.yrkesbeskrivelse_tittel as string).trim(), sti: y.yrkesbeskrivelse_lenke as string }))
      .sort((a, b) => a.tittel.localeCompare(b.tittel, 'nb'));
    if (!u?.utdanningsbeskrivelse_tittel || !u.utdanningsbeskrivelse_lenke?.startsWith('/') || yrker.length === 0) continue;
    const tekst = rentekst(u.utdanningsbeskrivelse_body ?? '');
    ut[i.programomradekode10] = {
      sluttkompetanse: i.sluttkompetanse?.trim() || null,
      tittel: u.utdanningsbeskrivelse_tittel.trim(),
      sti: u.utdanningsbeskrivelse_lenke,
      tekst: tekst && tekst.length <= 300 ? tekst : null,
      yrker: [...new Map(yrker.map((y) => [y.sti, y])).values()],
    };
  }
  return { kilde: 'utdanning-no', hentet, lisens: 'NLOD', programomrader: sortert(ut) };
}

export function validerYrker(d: Yrker): string[] {
  const antall = Object.keys(d.programomrader).length;
  const feil: string[] = [];
  if (antall < 100) feil.push(`Fant yrker for bare ${antall} programområder.`);
  if (!d.programomrader['HSHEA3----']) feil.push('Fant ikke yrkene for helsearbeiderfaget (HSHEA3).');
  return feil;
}

/** Endringene i yrkene, én linje per programområde som er endret. */
export function sammenlignYrker(gammel: Yrker | null, ny: Yrker): string[] {
  if (!gammel) return [];
  const koder = [...new Set([...Object.keys(gammel.programomrader), ...Object.keys(ny.programomrader)])].sort();
  const endret = koder.filter((k) => JSON.stringify(gammel.programomrader[k] ?? null) !== JSON.stringify(ny.programomrader[k] ?? null));
  return endret.length > 0 ? [`Endrede yrker eller beskrivelser (${endret.length}): ${endret.slice(0, 10).join(', ')}${endret.length > 10 ? ' …' : ''}`] : [];
}
