// Skjemaet i Arbeidsplan og utregningen av det: stillingsplanen, fordelingen av arbeidstiden og lønnen.
// Samme utregning brukes på siden og når to varianter sammenlignes (fase 3), så tallene alltid er de samme.
// Rene funksjoner uten avhengighet til grensesnittet.
import {
  beregnFordeling,
  beregnLonn,
  beregnStillingsplan,
  type Arsrammerad,
  type FordelingsdelId,
  type Fordelingsresultat,
  type Funksjon,
  funksjonsprosentFor,
  type Gruppe,
  type Hent,
  type LonnResultat,
  type Lonnsperiode,
  lonnsperiode,
  type Periode,
  periodenokkel,
  type StillingsplanResultat,
  type Trinn,
} from './beregning/index.ts';
import { type Funksjonstilstand, type Livsfase, livsfaseregler, tilFunksjon, tilleggsforslag, utvider } from './komponenter/Funksjoner.tsx';
import { prov } from './komponenter/Kalkulatorside.tsx';
import { type Lonnstilstand, nyLonnstilstand, tilLonnsgrunnlag } from './komponenter/Lonnsskjema.tsx';
import { type Gruppetilstand, nyGruppe, tilGruppe } from './komponenter/Skjema.tsx';

export interface Arbeidsplanskjema {
  stilling: number | null;
  grupper: Gruppetilstand[];
  funksjoner: Funksjonstilstand[];
  timerIGruppe: number | null;
  moter: number | null;
  visLonn: boolean;
  lonn: Lonnstilstand;
  over60: boolean;
  livsfase: Livsfase;
  /** Redusert undervisning i prosent, eller null for den største reduksjonen i tiltaket. */
  livsfaseProsent: number | null;
  /** Arbeidsplanen gjelder en periode av skoleåret. Mangler i skjema lagret før 0.7.0. */
  periode?: boolean | undefined;
  dager?: number | null | undefined;
  dagerSkolear?: number | null | undefined;
  /** Vis prosentene på årsbasis i stedet for i perioden. */
  arsbasis?: boolean | undefined;
  /** Timer på planleggingsdager, eller null for 6 dager × 7,5 timer (som for hel stilling). */
  planlegging?: number | null | undefined;
  /** Første og siste dag i perioden (ÅÅÅÅ-MM-DD), til lønnen for perioden. */
  fraDato?: string | undefined;
  tilDato?: string | undefined;
}

export function nyttArbeidsplanskjema(): Arbeidsplanskjema {
  return {
    stilling: 100,
    grupper: [nyGruppe()],
    // Ingen funksjon før brukeren trykker «Legg til funksjon» (eier 02.10.2026).
    funksjoner: [],
    timerIGruppe: null,
    moter: null,
    visLonn: false,
    lonn: nyLonnstilstand(),
    over60: false,
    livsfase: 'ingen',
    livsfaseProsent: null,
    periode: false,
    dager: null,
    dagerSkolear: null,
    arsbasis: false,
    planlegging: null,
    fraDato: '',
    tilDato: '',
  };
}

/** Tallverdi fra regelverket, eller null når den mangler. */
export function regeltall(hent: Hent, nokkel: string): number | null {
  try {
    const v = hent(nokkel).verdi;
    return typeof v === 'number' ? v : null;
  } catch {
    return null;
  }
}

/** Satsene for tillegg til funksjoner (minstegodtgjøringen i SFS 2213 punkt 9.1). */
export function tilleggssatser(hent: Hent): Record<string, number | null> {
  return {
    'sfs2213.godtgjoring_kontaktlaerer': regeltall(hent, 'sfs2213.godtgjoring_kontaktlaerer'),
    'sfs2213.godtgjoring_radgiver': regeltall(hent, 'sfs2213.godtgjoring_radgiver'),
  };
}

export interface Arbeidsplanberegning {
  iPeriode: boolean;
  periode: Periode | undefined;
  /** Sann når alt som trengs for perioden, er fylt ut (alltid sann for hele skoleåret). */
  periodeKlar: boolean;
  nokkel: Trinn['resultat'] | null;
  /** Gruppene som er fylt ut, med tilstanden, så navn og valg følger riktig gruppe. */
  fylte: { g: Gruppetilstand; inn: Gruppe }[];
  valgtIndeks: number;
  /** Prosenten for hver funksjon, også dem som er oppgitt i årsrammetimer. */
  prosenter: number[];
  livsfaseMaks: number | null;
  reduksjon: number;
  over60: boolean;
  resultat: StillingsplanResultat | null;
  feil: string | null;
  harStilling: boolean;
  /** Funksjoner og redusert undervisning som ikke utvider planfestet tid. */
  utenUtvidelse: number;
  fordeling: Fordelingsresultat | null;
  /** Tillegg per funksjon som gir tillegg: indeksen i funksjonslisten og beløpet per år. */
  tilleggene: { i: number; kr: number }[];
  lonnPeriode: Lonnsperiode | null;
  datoFeil: boolean;
  lonn: { resultat: LonnResultat | null; feil: string | null } | null;
  /** Variabel lønn og overtid regnes om med et fag. Sann når det trengs, men ikke finnes. */
  overtidUtenFag: boolean;
}

/** Regner ut arbeidsplanen slik den vises: stillingsplanen, fordelingen av arbeidstiden og lønnen. */
export function beregnArbeidsplan(hent: Hent, rader: readonly Arsrammerad[], s: Arbeidsplanskjema): Arbeidsplanberegning {
  const iPeriode = s.periode === true;
  const dager = s.dager ?? null;
  const periode: Periode | undefined = iPeriode && dager !== null && dager > 0 ? { dagerIPerioden: dager, dagerISkolearet: s.dagerSkolear ?? null } : undefined;
  const fylte = s.grupper.map((g) => ({ g, inn: tilGruppe(g, rader, iPeriode) })).filter((x): x is { g: Gruppetilstand; inn: Gruppe } => x.inn !== null);
  const valgtIndeks = Math.max(0, fylte.findIndex((x) => x.g.id === s.timerIGruppe));
  const prosenter = s.funksjoner.map((f) => {
    const inn = tilFunksjon(f);
    return inn ? (prov(() => funksjonsprosentFor(hent, inn)).resultat ?? 0) : 0;
  });
  const funksjoner = s.funksjoner.map(tilFunksjon).filter((f): f is Funksjon => f !== null);
  // Redusert undervisning etter punkt 6: skrevet inn, eller den største reduksjonen i tiltaket.
  const livsfaseMaks = s.livsfase === 'ingen' ? null : regeltall(hent, livsfaseregler[s.livsfase]);
  const reduksjon = s.livsfase === 'ingen' ? 0 : (s.livsfaseProsent ?? livsfaseMaks ?? 0);
  const over60 = s.livsfase === 'fra60';
  // I en periode trengs dagene før noe kan regnes ut.
  const periodeKlar = !iPeriode || periode !== undefined;
  const nokkel = periode ? (prov(() => periodenokkel(hent, periode)).resultat?.resultat ?? null) : null;
  const { resultat, feil } = prov(() =>
    periodeKlar && s.stilling !== null && s.stilling > 0 && (fylte.length > 0 || prosenter.some((p) => p > 0) || reduksjon > 0)
      ? beregnStillingsplan(hent, {
          stilling: s.stilling,
          grupper: fylte.map((x) => x.inn),
          funksjoner,
          timerIGruppe: fylte.length > 0 ? valgtIndeks : null,
          reduksjon,
          ...(periode ? { periode } : {}),
        })
      : null,
  );
  // Fordelingen av arbeidstiden i stillingen vises alltid, også før noe er lagt inn: fagene, funksjonene og
  // den delen av stillingen som ikke er fylt ennå. Funksjonene som ikke utvider planfestet tid, fordeles som undervisningen.
  const sumFunksjoner = (utvid: boolean) => s.funksjoner.reduce((sum, f, i) => sum + (utvider(f) === utvid ? (prosenter[i] ?? 0) : 0), 0);
  // Redusert undervisning utvider ikke planfestet tid: den frigjorte tiden erstatter undervisning i planfestet tid.
  const utenUtvidelse = sumFunksjoner(false) + reduksjon;
  const harStilling = s.stilling !== null && s.stilling > 0;
  const fordeling =
    periodeKlar && (resultat || harStilling)
      ? prov(() =>
          beregnFordeling(hent, {
            grupper: fylte.map((x) => x.inn),
            ...(harStilling ? { stilling: s.stilling ?? 0 } : {}),
            funksjon: { type: 'prosent', prosent: sumFunksjoner(true) },
            funksjonUtenUtvidelse: utenUtvidelse,
            moterPerUke: s.moter ?? 0,
            planleggingstimer: s.planlegging ?? null,
            over60,
            ...(periode ? { periode } : {}),
          }),
        ).resultat
      : null;
  // Tillegg per funksjon. Forslaget er minstegodtgjøringen i SFS 2213 punkt 9.1 for funksjonen som er kjent igjen på
  // navnet, eller for kontaktlærer, som er den vanligste, når navnet ikke kjennes igjen. Brukeren kan skrive inn et annet beløp.
  const satser = tilleggssatser(hent);
  const tilleggene = s.funksjoner
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => f.tillegg === true)
    .map(({ f, i }) => ({ i, kr: f.tilleggKr ?? tilleggsforslag(f, satser).verdi }));
  const tillegg = tilleggene.length > 0 ? tilleggene.reduce((sum, x) => sum + x.kr, 0) : null;
  const lonnsgrunnlag = s.visLonn ? tilLonnsgrunnlag(s.lonn) : null;
  // I en periode regnes lønnen fra datoene: hele måneder, og arbeidsdager ÷ 21,67 i brutte måneder (som i lønnssystemet).
  const lonnPeriode = iPeriode && s.fraDato && s.tilDato ? (prov(() => lonnsperiode(hent, s.fraDato ?? '', s.tilDato ?? '')).resultat ?? null) : null;
  const datoFeil = iPeriode && !!s.fraDato && !!s.tilDato && lonnPeriode === null;
  // Variabel lønn og overtidsbetaling regnes som i overtidskalkulatoren, med faget som er valgt for årsrammetimer.
  const overtidsfag = fylte[valgtIndeks]?.inn;
  const lonn =
    lonnsgrunnlag && harStilling && periodeKlar && (!iPeriode || lonnPeriode)
      ? prov(() =>
          beregnLonn(hent, {
            lonn: lonnsgrunnlag,
            stilling: s.stilling ?? 0,
            tillegg,
            overtid: resultat && overtidsfag ? { beskjeftigelse: resultat.beskjeftigelse.verdi, arsrammer: overtidsfag.arsrammer, elever: overtidsfag.elever } : null,
            over60: s.over60 || over60,
            periodenokkel: nokkel,
            lonnsandel: lonnPeriode?.andel ?? null,
          }),
        )
      : null;
  const overtidUtenFag = s.visLonn && resultat !== null && (resultat.variabel.verdi > 0 || resultat.beskjeftigelse.verdi > 100) && !overtidsfag;
  return {
    iPeriode,
    periode,
    periodeKlar,
    nokkel,
    fylte,
    valgtIndeks,
    prosenter,
    livsfaseMaks,
    reduksjon,
    over60,
    resultat,
    feil,
    harStilling,
    utenUtvidelse,
    fordeling,
    tilleggene,
    lonnPeriode,
    datoFeil,
    lonn,
    overtidUtenFag,
  };
}

// Kontroll av et skjema fra en delt lenke. Lenken kan komme fra hvem som helst, så hvert felt sjekkes før skjemaet
// fylles ut. Felt som mangler, får standardverdien (som for varianter lagret med en eldre versjon). Er noe feil,
// avvises hele skjemaet.

type Sjekk = (v: unknown) => boolean;

const MAKS_TEKST = 200;
const MAKS_LISTE = 50;

const tall: Sjekk = (v) => typeof v === 'number' && Number.isFinite(v);
const tallEllerNull: Sjekk = (v) => v === null || tall(v);
const tekst: Sjekk = (v) => typeof v === 'string' && v.length <= MAKS_TEKST;
const sannhet: Sjekk = (v) => typeof v === 'boolean';
const enAv =
  (...lov: readonly unknown[]): Sjekk =>
  (v) =>
    lov.includes(v);
const valgfri =
  (sjekk: Sjekk): Sjekk =>
  (v) =>
    v === undefined || sjekk(v);
const liste =
  (sjekk: Sjekk): Sjekk =>
  (v) =>
    Array.isArray(v) && v.length <= MAKS_LISTE && v.every(sjekk);
const objekt =
  (felt: Record<string, Sjekk>): Sjekk =>
  (v) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
    const o = v as Record<string, unknown>;
    // Ukjente felt avvises, så ingenting annet enn skjemaet kommer inn.
    return Object.keys(o).every((k) => k in felt) && Object.entries(felt).every(([k, sjekk]) => sjekk(o[k]));
  };

const metode = enAv('eksplisitt', 'regel', null);
const grepfag = objekt({
  kode: tekst,
  navn: objekt({ nb: tekst, nn: tekst }),
  timer: tallEllerNull,
  nr: tallEllerNull,
  metode,
  kandidater: liste(objekt({ nr: tall, program: tekst, trinn: tekst, t60: tall, t45: tall, metode: enAv('eksplisitt', 'regel') })),
  overstyr: valgfri(sannhet),
});
const arsrammeplass = objekt({
  valg: tekst,
  t60: tallEllerNull,
  stjerne: sannhet,
  fagkoder: valgfri((v) => v === null || liste(tekst)(v)),
  fag: valgfri((v) => v === null || grepfag(v)),
});
const gruppe = objekt({
  id: tall,
  arsrammer: liste(arsrammeplass),
  faaElever: sannhet,
  modus: enAv('arstimer', 'okter'),
  arstimer: tallEllerNull,
  arstimerAuto: sannhet,
  okter: tallEllerNull,
  minutter: tallEllerNull,
  minutterFritt: sannhet,
  uker: tallEllerNull,
  endreUker: sannhet,
});
const funksjon = objekt({
  id: tall,
  navn: tekst,
  prosent: tallEllerNull,
  enhet: valgfri(enAv('prosent', 'arsrammetimer')),
  timer: valgfri(tallEllerNull),
  utvider: valgfri(sannhet),
  tillegg: valgfri(sannhet),
  tilleggKr: valgfri(tallEllerNull),
});
const skjemafelt: Record<keyof Arbeidsplanskjema, Sjekk> = {
  stilling: tallEllerNull,
  grupper: liste(gruppe),
  funksjoner: liste(funksjon),
  timerIGruppe: tallEllerNull,
  moter: tallEllerNull,
  visLonn: sannhet,
  lonn: objekt({ type: enAv('garantilonn', 'manuell'), gruppe: tekst, ansiennitet: tall, arslonn: tallEllerNull }),
  over60: sannhet,
  livsfase: enAv('ingen', 'nyutdannet', 'fra57', 'fra60'),
  livsfaseProsent: tallEllerNull,
  periode: sannhet,
  dager: tallEllerNull,
  dagerSkolear: tallEllerNull,
  arsbasis: sannhet,
  planlegging: tallEllerNull,
  fraDato: tekst,
  tilDato: tekst,
};
const deltSkjema = objekt(Object.fromEntries(Object.entries(skjemafelt).map(([k, sjekk]) => [k, valgfri(sjekk)])));

/** Skjemaet fra en delt lenke når alle feltene er gyldige, ellers null. Felt som mangler, får standardverdien. */
export function lesDeltArbeidsplan(verdi: unknown): Arbeidsplanskjema | null {
  if (!deltSkjema(verdi)) return null;
  const skjema = { ...nyttArbeidsplanskjema(), ...(verdi as Partial<Arbeidsplanskjema>) };
  // Minst én gruppe, som når skjemaet er nytt.
  return skjema.grupper.length > 0 ? skjema : { ...skjema, grupper: [nyGruppe()] };
}

export type NokkeltallId =
  | 'stilling'
  | 'undervisning'
  | 'funksjoner'
  | 'reduksjon'
  | 'beskjeftigelse'
  | 'differanse'
  | `del_${FordelingsdelId}`
  | 'planfestet'
  | 'lonn';

/** Rekkefølgen på delene av arbeidstiden i sammenligningen, som i diagrammet. */
const fordelingsdeler: FordelingsdelId[] = ['undervisning', 'motetid', 'annen_planfestet', 'planleggingsdager', 'funksjonstid', 'selvdisponert'];

/**
 * Nøkkeltallene for en arbeidsplan, til sammenligning av to varianter: stillingen, arbeidstiden i timer og lønnen.
 * Tall som ikke kan regnes ut, er null. For en periode gjelder tallene perioden.
 */
export function nokkeltallForArbeidsplan(
  b: Arbeidsplanberegning,
  s: Arbeidsplanskjema,
): { id: NokkeltallId; verdi: number | null; enhet: 'prosent' | 'timer' | 'kroner'; gruppe: 'stillingen' | 'arbeidstid' | 'lonn'; valgfri?: boolean }[] {
  const r = b.resultat;
  const del = (id: FordelingsdelId) => b.fordeling?.deler.find((d) => d.id === id)?.timer ?? null;
  return [
    { id: 'stilling', verdi: s.stilling, enhet: 'prosent', gruppe: 'stillingen' },
    { id: 'undervisning', verdi: r?.undervisning.verdi ?? null, enhet: 'prosent', gruppe: 'stillingen' },
    { id: 'funksjoner', verdi: r?.funksjon.verdi ?? null, enhet: 'prosent', gruppe: 'stillingen' },
    { id: 'reduksjon', verdi: r ? (r.reduksjon?.verdi ?? 0) : null, enhet: 'prosent', gruppe: 'stillingen', valgfri: true },
    { id: 'beskjeftigelse', verdi: r?.beskjeftigelse.verdi ?? null, enhet: 'prosent', gruppe: 'stillingen' },
    { id: 'differanse', verdi: r?.differanse.verdi ?? null, enhet: 'prosent', gruppe: 'stillingen' },
    ...fordelingsdeler.map((id) => ({ id: `del_${id}` as const, verdi: del(id), enhet: 'timer' as const, gruppe: 'arbeidstid' as const })),
    { id: 'planfestet', verdi: b.fordeling ? b.fordeling.deler.filter((d) => d.planfestet).reduce((sum, d) => sum + d.timer, 0) : null, enhet: 'timer', gruppe: 'arbeidstid' },
    { id: 'lonn', verdi: b.lonn?.resultat?.samlet.verdi ?? null, enhet: 'kroner', gruppe: 'lonn', valgfri: true },
  ];
}
