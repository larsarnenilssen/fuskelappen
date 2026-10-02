// Lagrede varianter av en kalkulator: brukeren lagrer det utfylte med hovedresultatet, og kan sammenligne
// og hente det fram igjen, f.eks. før og etter en endring. Brukeren kan gi hver variant et navn.
// Lagres bare på enheten (scenarier i lagringen).
// Fase 3: to varianter kan sammenlignes side om side, og en variant kan deles som lenke. Lenken har det utfylte og
// navnet komprimert i adressen (src/core/deling.ts). Ingenting sendes noe sted.
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { erstattAdresse, lesHash } from '../../../app/ruter.ts';
import { useTekst, useTilstand, tilstand } from '../../../app/tilstand.ts';
import { pakk, pakkUt } from '../../../core/deling.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import type { Enhet } from '../beregning/index.ts';
import type { KalkulatorId } from './Kalkulatorside.tsx';
import { Vippe } from './Skjema.tsx';
import { medEnhet, tallTekst } from './Utregning.tsx';

/** Høyst så mange varianter per kalkulator. */
const MAKS = 3;
/** Høyst så mange tegn i navnet på en variant. */
const MAKS_NAVN = 40;

export interface Hovedresultat {
  tittel: string;
  verdi: number;
  enhet: Enhet;
}

interface Variant {
  lagret: string;
  /** Navnet brukeren har gitt varianten. Mangler det, heter den «Variant 1» osv. */
  navn?: string;
  skjema: Record<string, unknown>;
  resultat: Hovedresultat;
}

function erVariant(v: unknown): v is Variant {
  if (typeof v !== 'object' || v === null) return false;
  const x = v as Partial<Variant>;
  return (
    typeof x.lagret === 'string' &&
    (x.navn === undefined || typeof x.navn === 'string') &&
    typeof x.skjema === 'object' &&
    x.skjema !== null &&
    typeof x.resultat?.tittel === 'string' &&
    typeof x.resultat.verdi === 'number' &&
    typeof x.resultat.enhet === 'string'
  );
}

const nokkel = (id: KalkulatorId) => `arbeidstid:${id}`;

/** Kort tidspunkt, f.eks. «29. sep. 21:10». */
function kortTidspunkt(iso: string, malform: 'nb' | 'nn'): string {
  const dato = new Date(iso);
  if (Number.isNaN(dato.getTime())) return iso;
  return new Intl.DateTimeFormat(malform === 'nn' ? 'nn-NO' : 'nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(dato);
}

function lesVarianter(scenarier: Record<string, unknown>, id: KalkulatorId): Variant[] {
  const liste = scenarier[nokkel(id)];
  return Array.isArray(liste) ? liste.filter(erVariant) : [];
}

function skrivVarianter(id: KalkulatorId, liste: Variant[]): void {
  tilstand.oppdater((d) => ({ ...d, scenarier: { ...d.scenarier, [nokkel(id)]: liste } }));
}

/** Lagrer en ny variant. Den eldste erstattes når listen er full. Gir tidspunktet varianten fikk som nøkkel. */
function lagreVariant(id: KalkulatorId, skjema: object, resultat: Hovedresultat, navn?: string): string {
  const ny: Variant = { lagret: new Date().toISOString(), skjema: skjema as Record<string, unknown>, resultat };
  const kort = navn?.trim().slice(0, MAKS_NAVN);
  if (kort) ny.navn = kort;
  tilstand.oppdater((d) => {
    const liste = lesVarianter(d.scenarier, id);
    return { ...d, scenarier: { ...d.scenarier, [nokkel(id)]: [...liste, ny].slice(-MAKS) } };
  });
  return ny.lagret;
}

/** Parameteren i adressen med en delt variant: #/arbeidstid/arbeidsplan?del=… */
export const DELT_PARAMETER = 'del';

interface Deltinnhold {
  /** Formatet på innholdet. Øk når innholdet endres så eldre lenker må leses annerledes. */
  v: 1;
  navn?: string;
  skjema: unknown;
}

/** Lenken til en variant: hele adressen til kalkulatoren med skjemaet og navnet pakket i parameteren «del». */
export async function lagDeltLenke(sti: string, skjema: object, navn?: string): Promise<string> {
  const innhold: Deltinnhold = { v: 1, ...(navn?.trim() ? { navn: navn.trim().slice(0, MAKS_NAVN) } : {}), skjema };
  const del = await pakk(innhold);
  return `${location.origin}${location.pathname}#${sti}?${DELT_PARAMETER}=${del}`;
}

/** Leser innholdet i en delt lenke. Skjemaet sjekkes av kalkulatoren (lesSkjema). */
export async function lesDeltLenke<T>(del: string, lesSkjema: (v: unknown) => T | null): Promise<{ navn: string | null; skjema: T } | null> {
  const innhold = await pakkUt(del);
  if (typeof innhold !== 'object' || innhold === null) return null;
  const x = innhold as Partial<Deltinnhold>;
  if (x.v !== 1 || (x.navn !== undefined && typeof x.navn !== 'string')) return null;
  const skjema = lesSkjema(x.skjema);
  if (!skjema) return null;
  return { navn: x.navn?.trim().slice(0, MAKS_NAVN) || null, skjema };
}

type Delt = { status: 'leser' } | { status: 'feil' } | { status: 'apnet' | 'lagret'; navn: string | null };

/**
 * Åpner en delt variant når adressen har parameteren «del»: skjemaet fylles ut, og parameteren fjernes fra adressen,
 * så skjemaet ikke fylles ut på nytt når siden lastes igjen. Gir status til merknaden øverst i skjemaet.
 */
export function useDeltVariant<T>(sti: string, del: string | null, lesSkjema: (v: unknown) => T | null, onHent: (skjema: T) => void): [Delt | null, (d: Delt | null) => void] {
  const [delt, settDelt] = useState<Delt | null>(del ? { status: 'leser' } : null);
  const hent = useRef(onHent);
  hent.current = onHent;
  const les = useRef(lesSkjema);
  les.current = lesSkjema;
  useEffect(() => {
    if (!del) return;
    let aktiv = true;
    settDelt({ status: 'leser' });
    void lesDeltLenke(del, les.current).then((r) => {
      if (!aktiv) return;
      if (r) hent.current(r.skjema);
      settDelt(r ? { status: 'apnet', navn: r.navn } : { status: 'feil' });
      // Resten av adressen beholdes. Parameteren fjernes uten ny oppføring i historikken.
      const sporring = lesHash(location.hash).sporring;
      sporring.delete(DELT_PARAMETER);
      erstattAdresse(sti, Object.fromEntries(sporring));
    });
    return () => {
      aktiv = false;
    };
  }, [del, sti]);
  return [delt, settDelt];
}

/** Merknaden øverst i skjemaet når det er fylt ut fra en delt lenke, med knapp for å lagre det som variant. */
export function DeltMerknad({ id, delt, settDelt, skjema, resultat }: { id: KalkulatorId; delt: Delt | null; settDelt: (d: Delt | null) => void; skjema: object; resultat: Hovedresultat | null }) {
  const { t } = useTekst();
  if (!delt || delt.status === 'leser') return null;
  if (delt.status === 'feil') {
    return (
      <div class="merknad merknad-advarsel delt-merknad" role="alert">
        <p>{t('arbeidstid.varianter.deltFeil')}</p>
        <button type="button" class="ikonknapp" aria-label={t('arbeidstid.varianter.lukkMerknad')} onClick={() => settDelt(null)}>
          <Ikon navn="lukk" class="ikon-liten" />
        </button>
      </div>
    );
  }
  return (
    <div class="merknad delt-merknad" role="status">
      <div>
        <p class="delt-tittel">{delt.navn ? t('arbeidstid.varianter.deltTittelNavn', { navn: delt.navn }) : t('arbeidstid.varianter.deltTittel')}</p>
        <p class="liten">{delt.status === 'lagret' ? t('arbeidstid.varianter.deltLagret') : t('arbeidstid.varianter.deltTekst')}</p>
        {delt.status === 'apnet' && (
          <button
            type="button"
            class="knapp knapp-sekundaer knapp-liten"
            disabled={!resultat}
            onClick={() => {
              if (!resultat) return;
              lagreVariant(id, skjema, resultat, delt.navn ?? undefined);
              settDelt({ status: 'lagret', navn: delt.navn });
            }}
          >
            <Ikon navn="pluss" class="ikon-liten" />
            {t('arbeidstid.varianter.lagreDelt')}
          </button>
        )}
      </div>
      <button type="button" class="ikonknapp" aria-label={t('arbeidstid.varianter.lukkMerknad')} onClick={() => settDelt(null)}>
        <Ikon navn="lukk" class="ikon-liten" />
      </button>
    </div>
  );
}

/** Ett tall i sammenligningen av to varianter, f.eks. undervisningen i prosent. */
export interface Nokkeltall {
  id: string;
  navn: string;
  verdi: number | null;
  /** Overskriften over tallene som hører sammen, med enheten, f.eks. «Arbeidstiden, timer per år». */
  gruppe: string;
  /** Fargen tallet har i diagrammene (en del av arbeidstiden), som et lite merke foran navnet. */
  farge?: string;
  /** Vises bare når minst én av variantene har et tall som ikke er 0. */
  valgfri?: boolean;
  /** Desimaler i visningen (2 når det ikke er oppgitt). */
  desimaler?: number;
}

export interface Sammenligning {
  tall: Nokkeltall[];
  /** Merknad under tabellen, f.eks. at tallene for en periode gjelder perioden. */
  merknad?: string | null;
}

/** Merket for den første (1) og den andre (2) varianten i sammenligningen. */
function Merke({ nr }: { nr: 1 | 2 }) {
  return (
    <span class={`sammenligning-merke sammenligning-merke-${nr}`} aria-hidden="true">
      {nr}
    </span>
  );
}

/**
 * Sammenligning av to varianter: én rad per tall med begge verdiene og endringen (den andre minus den første).
 * Enheten står i gruppeoverskriften, så tallene får plass på smale skjermer. Rader som er endret, er uthevet,
 * og endringen har pil opp eller ned. Rader uten endring er dempet.
 */
function Sammenligningstabell({ a, b, navnA, navnB, bareEndret }: { a: Sammenligning; b: Sammenligning; navnA: string; navnB: string; bareEndret: boolean }) {
  const { t } = useTekst();
  const tallB = new Map(b.tall.map((x) => [x.id, x]));
  const endring = (x: number | null, y: number | null) => (x === null || y === null ? null : y - x);
  const erEndret = (d: number | null) => d !== null && Math.abs(d) >= 0.005;
  const rader = a.tall
    .map((x) => ({ x, y: tallB.get(x.id)?.verdi ?? null }))
    .filter(({ x, y }) => x.verdi !== null || y !== null)
    .filter(({ x, y }) => !x.valgfri || Math.abs(x.verdi ?? 0) >= 0.005 || Math.abs(y ?? 0) >= 0.005)
    .filter(({ x, y }) => !bareEndret || erEndret(endring(x.verdi, y)));
  const grupper = [...new Set(rader.map((r) => r.x.gruppe))];
  const merknader = [...new Set([a.merknad, b.merknad].filter((m): m is string => !!m))];
  if (rader.length === 0) return <p class="felt-hjelp">{t('arbeidstid.varianter.ingenEndring')}</p>;
  return (
    <>
      <table class="sammenligning">
        <caption class="skjult-visuelt">{t('arbeidstid.varianter.sammenlignTittel')}</caption>
        <thead>
          <tr>
            <td />
            <th scope="col">
              <Merke nr={1} />
              <span class="sammenligning-kolonnenavn">{navnA}</span>
            </th>
            <th scope="col">
              <Merke nr={2} />
              <span class="sammenligning-kolonnenavn">{navnB}</span>
            </th>
            <th scope="col" class="sammenligning-endring">
              {t('arbeidstid.varianter.endring')}
            </th>
          </tr>
        </thead>
        {grupper.map((g) => (
          <tbody key={g}>
            <tr class="sammenligning-gruppe">
              <th colSpan={4} scope="colgroup">
                {g}
              </th>
            </tr>
            {rader
              .filter((r) => r.x.gruppe === g)
              .map(({ x, y }) => {
                const d = endring(x.verdi, y);
                const endret = erEndret(d);
                // Endringen står i egen kolonne, eller under navnet på smale skjermer (der kolonnen er skjult).
                const endringstekst =
                  d === null ? (
                    '–'
                  ) : endret ? (
                    <span class="sammenligning-pil">
                      <Ikon navn={d > 0 ? 'opp' : 'ned'} class="ikon-liten" />
                      <span class="skjult-visuelt">{d > 0 ? t('arbeidstid.varianter.okning') : t('arbeidstid.varianter.reduksjon')} </span>
                      {tallTekst(Math.abs(d), x.desimaler)}
                    </span>
                  ) : (
                    <span title={t('arbeidstid.varianter.likt')}>
                      <span aria-hidden="true">=</span>
                      <span class="skjult-visuelt">{t('arbeidstid.varianter.likt')}</span>
                    </span>
                  );
                return (
                  <tr key={x.id} class={endret ? 'endret' : 'uendret'} data-nokkeltall={x.id}>
                    <th scope="row">
                      <span class="sammenligning-radnavn">
                        {x.farge && <span class={`fordeling-farge fordeling-del-${x.farge}`} aria-hidden="true" />}
                        <span>{x.navn}</span>
                      </span>
                      {endret && <span class="sammenligning-endring-under">{endringstekst}</span>}
                    </th>
                    <td class="tall">{x.verdi === null ? '–' : tallTekst(x.verdi, x.desimaler)}</td>
                    <td class="tall">{y === null ? '–' : tallTekst(y, x.desimaler)}</td>
                    <td class="tall sammenligning-endring">{endringstekst}</td>
                  </tr>
                );
              })}
          </tbody>
        ))}
      </table>
      {merknader.map((m) => (
        <p key={m} class="felt-hjelp">
          {m}
        </p>
      ))}
    </>
  );
}

/** Valget «det som er fylt ut nå» i sammenligningen. */
const NAA = 'naa';

/** Navnet på en variant i listen og i sammenligningen: navnet brukeren har gitt den, eller «Variant 1» osv. */
function useVisningsnavn() {
  const { t } = useTekst();
  return (v: Variant, i: number) => v.navn?.trim() || t('arbeidstid.varianter.variant', { nr: i + 1 });
}

/** Kan to varianter sammenlignes: minst to lagrede, eller én lagret og et utfylt skjema som kan regnes ut. */
function kanSammenlignes(antall: number, harResultat: boolean): boolean {
  return antall + (harResultat ? 1 : 0) >= 2;
}

/**
 * Sammenligningen av to varianter, i full bredde under kalkulatoren. Brukeren velger to av variantene eller det som er
 * fylt ut nå. Åpnes med «Sammenlign» under lagrede varianter.
 */
export function Sammenligningsvisning<T extends object>({
  id,
  skjema,
  harResultat,
  sammenlign,
  aapen,
  onLukk,
}: {
  id: KalkulatorId;
  skjema: T;
  /** Sann når det som er fylt ut nå, kan regnes ut. Da kan det velges i sammenligningen. */
  harResultat: boolean;
  sammenlign: (skjema: T) => Sammenligning;
  aapen: boolean;
  onLukk: () => void;
}) {
  const { t } = useTekst();
  const { scenarier } = useTilstand();
  const liste = lesVarianter(scenarier, id);
  const visningsnavn = useVisningsnavn();
  const valg = [
    ...liste.map((v, i) => ({ nokkel: v.lagret, navn: visningsnavn(v, i), skjema: { ...skjema, ...(v.skjema as Partial<T>) } as T })),
    ...(harResultat ? [{ nokkel: NAA, navn: t('arbeidstid.varianter.fyltUtNaa'), skjema }] : []),
  ];
  const [valgA, settValgA] = useState<string | null>(null);
  const [valgB, settValgB] = useState<string | null>(null);
  const [bareEndret, settBareEndret] = useState(false);
  const a = valg.find((x) => x.nokkel === valgA) ?? valg[0];
  const b = valg.find((x) => x.nokkel === valgB) ?? valg.find((x) => x.nokkel === NAA && x !== a) ?? valg.find((x) => x !== a);
  const idA = useId();
  const idB = useId();
  const idTittel = useId();
  const boks = useRef<HTMLElement>(null);
  // Når sammenligningen åpnes, rulles den fram med overskriften synlig.
  useEffect(() => {
    if (aapen) requestAnimationFrame(() => boks.current?.scrollIntoView({ block: 'start' }));
  }, [aapen]);
  if (!aapen || !a || !b || !kanSammenlignes(liste.length, harResultat)) return null;
  const velger = (nr: 1 | 2, idValg: string, verdi: string, sett: (v: string) => void) => (
    <div class="felt felt-liten">
      <label for={idValg}>
        <Merke nr={nr} /> {nr === 1 ? t('arbeidstid.varianter.forste') : t('arbeidstid.varianter.andre')}
      </label>
      <select id={idValg} value={verdi} onChange={(e) => sett(e.currentTarget.value)}>
        {valg.map((x) => (
          <option key={x.nokkel} value={x.nokkel}>
            {x.navn}
          </option>
        ))}
      </select>
    </div>
  );
  return (
    <section class="kort sammenligning-kort" ref={boks} aria-labelledby={idTittel}>
      <div class="sammenligning-topp">
        <h2 id={idTittel} class="liten-overskrift">
          {t('arbeidstid.varianter.sammenlignTittel')}
        </h2>
        <button type="button" class="ikonknapp" aria-label={t('arbeidstid.varianter.lukkSammenligning')} onClick={onLukk}>
          <Ikon navn="lukk" class="ikon-liten" />
        </button>
      </div>
      <p class="felt-hjelp">{t('arbeidstid.varianter.sammenlignHjelp')}</p>
      <div class="sammenligning-valg">
        {velger(1, idA, a.nokkel, settValgA)}
        {velger(2, idB, b.nokkel, settValgB)}
      </div>
      {a.nokkel === b.nokkel ? (
        <p class="felt-hjelp">{t('arbeidstid.varianter.likeValg')}</p>
      ) : (
        <>
          <Vippe tekst={t('arbeidstid.varianter.bareEndret')} pa={bareEndret} onEndring={settBareEndret} />
          <Sammenligningstabell a={sammenlign(a.skjema)} b={sammenlign(b.skjema)} navnA={a.navn} navnB={b.navn} bareEndret={bareEndret} />
        </>
      )}
    </section>
  );
}

/** Differansen mot en lagret variant, med fortegn: «+2,77 %». */
function differanse(t: ReturnType<typeof useTekst>['t'], naa: number, da: number, enhet: Enhet): string {
  const d = naa - da;
  if (Math.abs(d) < 0.005) return '±0';
  return `${d > 0 ? '+' : '−'}${medEnhet(t, Math.abs(d), enhet)}`;
}

export function Varianter<T extends object>({
  id,
  skjema,
  resultat,
  onHent,
  onSammenlign,
  sti,
}: {
  id: KalkulatorId;
  skjema: T;
  /** Hovedresultatet for det som er fylt ut nå, eller null når det mangler noe. */
  resultat: Hovedresultat | null;
  /** Fyller ut skjemaet med en lagret variant. */
  onHent: (skjema: T) => void;
  /** Åpner sammenligningen av to varianter (Sammenligningsvisning). Uten den vises ikke knappen «Sammenlign». */
  onSammenlign?: () => void;
  /** Adressen til kalkulatoren. Med den kan en variant deles som lenke. */
  sti?: string;
}) {
  const { t, malform } = useTekst();
  const { scenarier } = useTilstand();
  const liste = lesVarianter(scenarier, id);
  // Varianten som får nytt navn nå (nøkkelen er tidspunktet den ble lagret), og teksten i feltet.
  const [redigerer, settRedigerer] = useState<string | null>(null);
  const [utkast, settUtkast] = useState('');
  const felt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (redigerer) felt.current?.focus();
  }, [redigerer]);

  const visningsnavn = useVisningsnavn();
  const startNavn = (v: Variant) => {
    settUtkast(v.navn ?? '');
    settRedigerer(v.lagret);
  };
  const lagreNavn = () => {
    if (!redigerer) return;
    const navn = utkast.trim().slice(0, MAKS_NAVN);
    skrivVarianter(
      id,
      liste.map((v) => {
        if (v.lagret !== redigerer) return v;
        const ny: Variant = { ...v };
        if (navn) ny.navn = navn;
        else delete ny.navn;
        return ny;
      }),
    );
    settRedigerer(null);
  };

  const lagre = () => {
    if (!resultat) return;
    // Den eldste varianten erstattes når listen er full. Navnefeltet åpnes, så varianten kan få et navn med en gang.
    const lagret = lagreVariant(id, skjema, resultat);
    settUtkast('');
    settRedigerer(lagret);
  };

  // Deling: lenken til varianten som sist ble delt, og om den ble kopiert.
  const [deling, settDeling] = useState<{ lagret: string; navn: string; lenke: string; status: 'kopiert' | 'delt' | 'vis' } | null>(null);
  const lenkefelt = useRef<HTMLInputElement>(null);
  const del = async (v: Variant, navn: string) => {
    if (!sti) return;
    const lenke = await lagDeltLenke(sti, { ...skjema, ...(v.skjema as Partial<T>) }, v.navn);
    // Telefonen har egen deling (meldinger, e-post). Ellers kopieres lenken. Lenken vises uansett, så den kan kopieres selv.
    try {
      if (typeof navigator.share === 'function' && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: navn, url: lenke });
        settDeling({ lagret: v.lagret, navn, lenke, status: 'delt' });
        return;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        settDeling({ lagret: v.lagret, navn, lenke, status: 'vis' });
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(lenke);
      settDeling({ lagret: v.lagret, navn, lenke, status: 'kopiert' });
    } catch {
      settDeling({ lagret: v.lagret, navn, lenke, status: 'vis' });
    }
  };
  useEffect(() => {
    if (deling?.status === 'vis') lenkefelt.current?.select();
  }, [deling]);

  const kanSammenligne = !!onSammenlign && kanSammenlignes(liste.length, resultat !== null);
  const idLenke = useId();

  return (
    <section class="varianter" aria-label={t('arbeidstid.varianter.tittel')}>
      <div class="med-hjelp">
        <h2 class="liten-overskrift">{t('arbeidstid.varianter.tittel')}</h2>
        <Hjelp tema={t('arbeidstid.varianter.tittel')}>
          <p class="felt-hjelp">{t('arbeidstid.varianter.hjelp', { maks: MAKS })}</p>
        </Hjelp>
      </div>
      {liste.length > 0 && (
        <ol class="variantliste">
          {liste.map((v, i) => (
            <li key={v.lagret}>
              {/* Linje 1: navnet med blyant og slett, og resultatet. Linje 2: tidspunktet, Hent og Del, og forskjellen fra nå. */}
              {redigerer === v.lagret ? (
                <span class="variant-navn">
                  <input
                    ref={felt}
                    class="tekstfelt variant-navnfelt"
                    type="text"
                    autoComplete="off"
                    maxLength={MAKS_NAVN}
                    aria-label={t('arbeidstid.varianter.navn', { nr: i + 1 })}
                    placeholder={t('arbeidstid.varianter.variant', { nr: i + 1 })}
                    value={utkast}
                    onInput={(e) => settUtkast(e.currentTarget.value)}
                    onBlur={lagreNavn}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') lagreNavn();
                      if (e.key === 'Escape') settRedigerer(null);
                    }}
                  />
                </span>
              ) : (
                <span class="variant-navn">
                  <span class="variant-tittel">{visningsnavn(v, i)}</span>
                  <button type="button" class="ikonknapp variant-navnknapp" aria-label={t('arbeidstid.varianter.endreNavn', { navn: visningsnavn(v, i) })} onClick={() => startNavn(v)}>
                    <Ikon navn="blyant" class="ikon-liten" />
                  </button>
                  <button
                    type="button"
                    class="ikonknapp variant-navnknapp"
                    aria-label={t('arbeidstid.varianter.slett', { navn: visningsnavn(v, i) })}
                    onClick={() => skrivVarianter(id, liste.filter((x) => x.lagret !== v.lagret))}
                  >
                    <Ikon navn="lukk" class="ikon-liten" />
                  </button>
                </span>
              )}
              <span class="variant-verdi tall">{medEnhet(t, v.resultat.verdi, v.resultat.enhet)}</span>
              <span class="variant-under variant-dato">{kortTidspunkt(v.lagret, malform)}</span>
              <span class="variant-knapper">
                <button type="button" class="lenkeknapp liten" onClick={() => onHent({ ...skjema, ...(v.skjema as Partial<T>) })}>
                  {t('arbeidstid.varianter.hent')}
                  <span class="skjult-visuelt"> {visningsnavn(v, i)}</span>
                </button>
                {sti && (
                  <button type="button" class="ikonknapp" aria-label={t('arbeidstid.varianter.del', { navn: visningsnavn(v, i) })} title={t('arbeidstid.varianter.delKort')} onClick={() => void del(v, visningsnavn(v, i))}>
                    <Ikon navn="del" class="ikon-liten" />
                  </button>
                )}
              </span>
              <span class="variant-under variant-naa tall">
                {resultat && resultat.enhet === v.resultat.enhet && t('arbeidstid.varianter.naa', { differanse: differanse(t, resultat.verdi, v.resultat.verdi, v.resultat.enhet) })}
              </span>
            </li>
          ))}
        </ol>
      )}
      {deling && liste.some((v) => v.lagret === deling.lagret) && (
        <div class="delt-lenke">
          <label for={idLenke} class="liten">
            {t('arbeidstid.varianter.lenke', { navn: deling.navn })}
          </label>
          <input ref={lenkefelt} id={idLenke} class="tekstfelt" type="url" readOnly value={deling.lenke} onFocus={(e) => e.currentTarget.select()} />
          <p class="felt-hjelp" role="status">
            {deling.status === 'kopiert' ? t('arbeidstid.varianter.kopiert') : deling.status === 'delt' ? t('arbeidstid.varianter.delt') : t('arbeidstid.varianter.kopierSelv')}{' '}
            {t('arbeidstid.varianter.delHjelp')}
          </p>
        </div>
      )}
      <div class="variant-handlinger">
        <button type="button" class="knapp knapp-sekundaer knapp-liten" disabled={!resultat} onClick={lagre}>
          <Ikon navn="pluss" class="ikon-liten" />
          {t('arbeidstid.varianter.lagre')}
        </button>
        {kanSammenligne && (
          <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={onSammenlign}>
            <Ikon navn="kategori" class="ikon-liten" />
            {t('arbeidstid.varianter.sammenlign')}
          </button>
        )}
      </div>
    </section>
  );
}
