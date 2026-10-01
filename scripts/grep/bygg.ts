// Gjør rådata fra Grep (Udir, NLOD 2.0) om til fagindeksen og filene per læreplan (avgjørelse 022).
// Rene funksjoner uten nettverk, testes i tests/unit/grep-fag.test.ts. Hentingen står i scripts/hent-grep.ts.
//
// Grep kobler sammen slik: fagkode (NOR1260) → opplæringsfag (NOR1Z63) → programområder (STUSP1----),
// læreplan (NOR01-07) og kompetansemålsett (KV…). Opplæringsfaget har fagtype, trinn og opplæringsnivå.
import type { Fag, Fagindeks, Fagtype, Kompetansemalsett, Laereplan, Programomrade, Trinn, Vurdering } from '../../src/modules/fag/skjema.ts';

export interface Tekst {
  spraak: string;
  verdi: string;
}

/** Et element i Grep slik API-et gir det. Bare feltene vi bruker, er typet. */
export interface Grepelement {
  kode: string;
  status: string;
  tittel?: Tekst[] | { tekst: Tekst[] } | string;
  [felt: string]: unknown;
}

export interface Raadata {
  utdanningsprogram: Grepelement[];
  programomrader: Grepelement[];
  opplaeringsfag: Grepelement[];
  fagkoder: Map<string, Grepelement>;
  laereplaner: Map<string, Grepelement>;
  kompetansemaalsett: Map<string, Grepelement>;
}

export const erPublisert = (e: { status?: unknown }): boolean => typeof e.status === 'string' && e.status.endsWith('status_publisert');

const liste = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? (v.filter((x) => typeof x === 'object' && x !== null) as Record<string, unknown>[]) : []);
const objekt = (v: unknown): Record<string, unknown> | null => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null);
const kode = (v: unknown): string | null => {
  const o = objekt(v);
  return o && typeof o.kode === 'string' ? o.kode : null;
};

/** Tekstene i et tittel- eller tekstfelt, uansett om Grep pakker dem i { tekst: [...] } eller ikke. */
function tekster(v: unknown): Tekst[] {
  const o = objekt(v);
  const l = o && Array.isArray(o.tekst) ? o.tekst : v;
  return liste(l).filter((t): t is Record<string, unknown> & Tekst => typeof t.spraak === 'string' && typeof t.verdi === 'string') as Tekst[];
}

/** Teksten på ett språk, ellers «default», ellers den første. */
export function paSpraak(v: unknown, spraak: string): string | null {
  if (typeof v === 'string') return v.trim() || null;
  const t = tekster(v);
  const funnet = t.find((x) => x.spraak === spraak) ?? t.find((x) => x.spraak === 'default') ?? t[0];
  return funnet ? funnet.verdi.trim() || null : null;
}

/** Bokmål og nynorsk. Mangler nynorsk, brukes bokmål (og omvendt). */
export function navn(v: unknown, reserve: string): { nb: string; nn: string } {
  const nb = paSpraak(v, 'nob') ?? reserve;
  const nn = tekster(v).find((x) => x.spraak === 'nno')?.verdi.trim() || nb;
  return { nb, nn };
}

/**
 * HTML fra Grep (bare <p>, <br>, <strong>, <em>, <s> og <span>) som avsnitt i ren tekst.
 * Linjeskift (<br>) blir \n. Tegnreferanser gjøres om til tegn.
 */
export function htmlTilAvsnitt(html: string | null): string[] {
  if (!html) return [];
  const tegn: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '' };
  const dekod = (s: string) =>
    s
      .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&([a-z]+);/gi, (m, n: string) => tegn[n.toLowerCase()] ?? m);
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/<\/p>|<p[^>]*>/i)
    .map((a) =>
      dekod(a.replace(/<[^>]+>/g, ''))
        .split('\n')
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n'),
    )
    .filter((a) => a !== '');
}

const TRINN: Record<string, Trinn> = { vg1: 'Vg1', vg2: 'Vg2', vg3: 'Vg3', opplaering_bedrift: 'Bedrift' };

function trinnliste(v: unknown): Trinn[] {
  const ut = new Set<Trinn>();
  for (const t of liste(v)) {
    const k = typeof t.kode === 'string' ? TRINN[t.kode] : undefined;
    if (k) ut.add(k);
  }
  return (['Vg1', 'Vg2', 'Vg3', 'Bedrift'] as const).filter((t) => ut.has(t));
}

function fagtype(v: unknown): Fagtype {
  const k = kode(v)?.replace(/^fagtype_/, '');
  const kjente: readonly Fagtype[] = ['fellesfag', 'felles_programfag', 'valgfritt_programfag', 'yrkesfaglig_fordypning', 'individuell_opplaeringsplan'];
  return kjente.includes(k as Fagtype) ? (k as Fagtype) : 'annet';
}

const ELEV = 'http://psi.udir.no/ontologi/eksamen_vurdering_elev';
const PRIVATIST = 'http://psi.udir.no/ontologi/eksamen_vurdering_privatist';

function vurdering(fk: Grepelement, elevtype: string, koder: Map<string, string>): Vurdering | null {
  const v = liste(fk.vurderingsordning).find((x) => x.elevtype === elevtype);
  if (!v) return null;
  const felt = (navn: string): string | null => {
    const o = objekt(v[navn]);
    if (!o || typeof o.kode !== 'string') return null;
    if (typeof o.tittel === 'string') koder.set(o.kode, o.tittel.trim());
    return o.kode;
  };
  return {
    standpunkt: v.standpunktvurdering === true,
    trekk: felt('trekkordning'),
    eksamensordning: felt('type-eksamensordning'),
    eksamensform: felt('eksamensform-paa-vitnemaalet'),
    uttrykk: felt('vurderingsuttrykk'),
  };
}

function programomrade(p: Grepelement): Programomrade | null {
  const trinn = TRINN[kode(p.aarstrinn) ?? ''] ?? (kode(p.aarstrinn) === 'paabygning_generell_studiekompetanse' ? 'Vg3' : undefined);
  if (!trinn) return null;
  const sted = liste(p.opplaeringssted).map((o) => String(o.uri ?? ''));
  return {
    navn: navn(p.tittel, p.kode),
    program: p.kode.slice(0, 2),
    trinn,
    sted: sted.some((s) => s.endsWith('_bedrift')) ? 'bedrift' : sted.some((s) => s.endsWith('_skole')) ? 'skole' : 'ukjent',
    // Grep kan ha samme programområde flere ganger (f.eks. HSPOR3).
    bygger: [
      ...new Set(
        liste(p['bygger-paa-programomraade'])
          .filter(erPublisert)
          .map((b) => String(b.kode)),
      ),
    ].sort(),
    timer: Number.isFinite(Number(p.aarstimer)) && Number(p.aarstimer) > 0 ? Number(p.aarstimer) : null,
  };
}

/**
 * Gjeldende LK20-læreplan for et opplæringsfag, med kompetansemålsettene. Planen som gjelder på datoen
 * (gyldighet på referansen) velges først, deretter publiserte planer, og så den med senest gyldig-fra.
 */
function laereplanFor(of: Grepelement, planer: ReadonlyMap<string, Grepelement>, idag: string): { lp: string; km: string[] } | null {
  const lk20 = liste(of['laereplan-referanse']).filter((l) => typeof l['url-data'] === 'string' && (l['url-data'] as string).includes('/laereplaner-lk20/'));
  const fra = (l: Record<string, unknown>) => String(objekt(l.gyldighet)?.['gyldig-fra'] ?? '').slice(0, 10);
  const til = (l: Record<string, unknown>) => String(objekt(l.gyldighet)?.['gyldig-til'] ?? '').slice(0, 10);
  const gjelder = (l: Record<string, unknown>) => fra(l) <= idag && (til(l) === '' || til(l) >= idag);
  const kandidater = lk20
    .map((l) => ({ l, plan: planer.get(String(l.kode)) }))
    .filter((x): x is { l: Record<string, unknown>; plan: Grepelement } => x.plan !== undefined)
    .sort((a, b) => Number(gjelder(b.l)) - Number(gjelder(a.l)) || Number(erPublisert(b.plan)) - Number(erPublisert(a.plan)) || fra(b.l).localeCompare(fra(a.l)));
  const valgt = kandidater[0];
  if (!valgt) return null;
  const km = liste(valgt.l['tilhoerende-kompetansemaalsett'])
    .map((k) => String(k.kode))
    .filter(Boolean);
  return { lp: String(valgt.l.kode), km };
}

const erVgs = (of: Grepelement) => kode(of.opplaeringsnivaa) === 'opplaeringsnivaa_videregaaende';

/** Fagindeksen: alle publiserte fagkoder i videregående med navn, type, trinn, programområder, årstimer og vurdering. */
export function byggFagindeks(r: Raadata, hentet: string): Fagindeks {
  const utdanningsprogram: Fagindeks['utdanningsprogram'] = {};
  for (const u of r.utdanningsprogram) if (erPublisert(u)) utdanningsprogram[u.kode] = navn(u.tittel, u.kode);

  const programomrader: Fagindeks['programomrader'] = {};
  for (const p of r.programomrader) {
    if (!erPublisert(p)) continue;
    const po = programomrade(p);
    if (po) programomrader[p.kode] = po;
  }
  // Påbygging (PB) har ikke eget utdanningsprogram i Grep. Navnet hentes fra programområdet.
  for (const [k, p] of Object.entries(programomrader)) {
    if (!utdanningsprogram[p.program] && k.startsWith('PB')) utdanningsprogram[p.program] = { nb: 'Påbygging til generell studiekompetanse', nn: 'Påbygging til generell studiekompetanse' };
  }
  // Programområder uten gjeldende utdanningsprogram (f.eks. Reform 94) tas ikke med.
  for (const [k, p] of Object.entries(programomrader)) if (!utdanningsprogram[p.program]) delete programomrader[k];
  for (const p of Object.values(programomrader)) p.bygger = p.bygger.filter((b) => programomrader[b] !== undefined);

  const koder = new Map<string, string>();
  const fag: Fagindeks['fag'] = {};
  const opplaeringsfag = r.opplaeringsfag.filter((o) => erPublisert(o) && erVgs(o)).sort((a, b) => a.kode.localeCompare(b.kode));
  for (const of of opplaeringsfag) {
    const plan = laereplanFor(of, r.laereplaner, hentet.slice(0, 10));
    const po = liste(of['programomraader-referanse'])
      .map((p) => String(p.kode))
      .filter((p) => programomrader[p] !== undefined);
    for (const ref of liste(of['fagkode-referanser'])) {
      const fk = r.fagkoder.get(String(ref.kode));
      if (!fk || !erPublisert(fk) || !erPublisert(ref)) continue;
      const tidligere = fag[fk.kode];
      const timer = Number(fk['omfang-totalt']);
      const ny: Fag = tidligere ?? {
        navn: navn(fk.tittel, fk.kode),
        type: fagtype(fk.fagtype ?? of.fagtype),
        trinn: [],
        po: [],
        timer: Number.isFinite(timer) && timer > 0 ? timer : null,
        lp: null,
        km: [],
        elev: vurdering(fk, ELEV, koder),
        privatist: vurdering(fk, PRIVATIST, koder),
      };
      // En fagkode kan høre til flere opplæringsfag. Da slås trinn, programområder og kompetansemål sammen.
      ny.trinn = (['Vg1', 'Vg2', 'Vg3', 'Bedrift'] as const).filter((t) => ny.trinn.includes(t) || trinnliste(of['for-aarstrinn']).includes(t));
      ny.po = [...new Set([...ny.po, ...po])].sort();
      if (plan && ny.lp === null) ny.lp = plan.lp;
      if (plan && ny.lp === plan.lp) ny.km = [...new Set([...ny.km, ...plan.km])];
      fag[fk.kode] = ny;
    }
  }
  const sortert = Object.fromEntries(Object.entries(fag).sort(([a], [b]) => a.localeCompare(b)));
  return {
    kilde: 'udir-grep',
    hentet,
    lisens: 'NLOD 2.0',
    utdanningsprogram: Object.fromEntries(Object.entries(utdanningsprogram).sort(([a], [b]) => a.localeCompare(b))),
    programomrader: Object.fromEntries(Object.entries(programomrader).sort(([a], [b]) => a.localeCompare(b))),
    koder: Object.fromEntries([...koder].sort(([a], [b]) => a.localeCompare(b))),
    fag: sortert,
  };
}

/** Kompetansemålsettene og læreplanene fagindeksen viser til. */
export function laereplankoder(indeks: Fagindeks): { laereplaner: string[]; kompetansemaalsett: string[] } {
  const fag = Object.values(indeks.fag);
  return {
    laereplaner: [...new Set(fag.flatMap((f) => (f.lp ? [f.lp] : [])))].sort(),
    kompetansemaalsett: [...new Set(fag.flatMap((f) => f.km))].sort(),
  };
}

/** Målformen planen er fastsatt i (nob, nno, sme …). */
export function fastsattSpraak(plan: Grepelement): string {
  const f = objekt(plan.fastsettelsesinformasjon);
  return kode(f?.['fastsatt-spraak']) ?? 'nob';
}

/** Kompetansemålsett til visning, på planens målform. Kompetansemålene står i Grep bare på denne målformen. */
function byggSett(k: Grepelement, spraak: string): Kompetansemalsett {
  const tekst = (felt: string) => htmlTilAvsnitt(paSpraak(objekt(k[felt])?.beskrivelse, spraak));
  return {
    kode: k.kode,
    tittel: paSpraak(objekt(k.tittel)?.tekst ?? k.tittel, spraak) ?? k.kode,
    fag: liste(k['etter-fag']).map((f) => String(f.kode)),
    trinn: trinnliste(k['etter-aarstrinn']),
    ingress: paSpraak(objekt(k['kompetansemaal-ingress'])?.tekst, spraak),
    maal: liste(k.kompetansemaal)
      .filter((m) => erPublisert(m) && typeof m.tittel === 'string' && m.tittel.trim() !== '')
      .map((m) => ({ kode: String(m.kode), tekst: (m.tittel as string).replace(/\s+/g, ' ').trim() })),
    underveis: tekst('underveisvurdering'),
    standpunkt: tekst('standpunktvurdering'),
  };
}

/** Én læreplan med kompetansemål, underveisvurdering og vurderingsordning, på målformen den er fastsatt i. */
export function byggLaereplan(plan: Grepelement, sett: ReadonlyMap<string, Grepelement>): Laereplan {
  const spraak = fastsattSpraak(plan);
  const fast = objekt(plan.fastsettelsesinformasjon);
  const kapittel = objekt(plan['kompetansemaal-kapittel']);
  const koder = liste(kapittel?.kompetansemaalsett).map((k) => String(k.kode));
  const vurd = objekt(plan['vurderingsordninger-kapittel']);
  const gyldig = objekt(objekt(plan.gyldighetsperiode)?.['gyldig-fra']);
  return {
    kode: plan.kode,
    tittel: paSpraak(objekt(plan.tittel)?.tekst ?? plan.tittel, spraak) ?? plan.kode,
    spraak,
    fastsatt: typeof fast?.['fastsatt-dato'] === 'string' ? fast['fastsatt-dato'].slice(0, 10) : null,
    gyldigFra: typeof gyldig?.dato === 'string' ? gyldig.dato.slice(0, 10) : null,
    kompetansemaalsett: koder.flatMap((k) => {
      const s = sett.get(k);
      return s ? [byggSett(s, spraak)] : [];
    }),
    vurderingsordning: liste(vurd?.vurderingsordninger).map((v) => ({
      overskrift: paSpraak(objekt(v.overskrift)?.tekst, spraak) ?? '',
      tekst: htmlTilAvsnitt(paSpraak(objekt(v.beskrivelse)?.tekst, spraak)),
    })),
  };
}
