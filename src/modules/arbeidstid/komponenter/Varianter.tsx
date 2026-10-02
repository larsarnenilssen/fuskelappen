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
  enhet: Enhet;
  /** Overskriften over tallene som hører sammen, f.eks. «Arbeidstiden i timer». */
  gruppe: string;
  /** Vises bare når minst én av variantene har et tall som ikke er 0. */
  valgfri?: boolean;
}

export interface Sammenligning {
  tall: Nokkeltall[];
  /** Merknad under tabellen, f.eks. at tallene for en periode gjelder perioden. */
  merknad?: string | null;
}

/** Sammenligning av to varianter side om side, med forskjellen (den andre minus den første). */
function Sammenligningstabell({ a, b, navnA, navnB }: { a: Sammenligning; b: Sammenligning; navnA: string; navnB: string }) {
  const { t } = useTekst();
  const id = useId();
  const tallB = new Map(b.tall.map((x) => [x.id, x]));
  const rader = a.tall
    .map((x) => ({ x, y: tallB.get(x.id) }))
    .filter(({ x, y }) => (x.verdi !== null || (y?.verdi ?? null) !== null) && (!x.valgfri || Math.abs(x.verdi ?? 0) > 0.005 || Math.abs(y?.verdi ?? 0) > 0.005));
  const merknader = [...new Set([a.merknad, b.merknad].filter((m): m is string => !!m))];
  let gruppe = '';
  // Timene står uten enhet, fordi gruppen sier «i timer». Da får tallene plass på én linje på smale skjermer.
  const vis = (verdi: number, enhet: Enhet) => (enhet === 'timer' ? tallTekst(verdi) : medEnhet(t, verdi, enhet));
  const forskjell = (b: number, a: number, enhet: Enhet) => {
    if (enhet !== 'timer') return differanse(t, b, a, enhet);
    const d = b - a;
    return Math.abs(d) < 0.005 ? '±0' : `${d > 0 ? '+' : '−'}${tallTekst(Math.abs(d))}`;
  };
  return (
    <>
      <table class="sammenligning">
        <caption class="skjult-visuelt">{t('arbeidstid.varianter.sammenlignTittel')}</caption>
        <thead>
          <tr>
            <th scope="col" id={`${id}-a`}>
              {navnA}
            </th>
            <th scope="col" id={`${id}-b`}>
              {navnB}
            </th>
            <th scope="col" id={`${id}-d`}>
              {t('arbeidstid.varianter.forskjell')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rader.flatMap(({ x, y }, i) => {
            const ut = [];
            if (x.gruppe !== gruppe) {
              gruppe = x.gruppe;
              ut.push(
                <tr key={`g${i}`} class="sammenligning-gruppe">
                  <th colSpan={3} scope="colgroup">
                    {x.gruppe}
                  </th>
                </tr>,
              );
            }
            const navnId = `${id}-${x.id}`;
            const vb = y?.verdi ?? null;
            ut.push(
              <tr key={`n${i}`} class="sammenligning-navn">
                <th colSpan={3} scope="colgroup" id={navnId}>
                  {x.navn}
                </th>
              </tr>,
              <tr key={`t${i}`} class="sammenligning-tall" data-nokkeltall={x.id}>
                <td class="tall" headers={`${navnId} ${id}-a`}>
                  {x.verdi === null ? '–' : vis(x.verdi, x.enhet)}
                </td>
                <td class="tall" headers={`${navnId} ${id}-b`}>
                  {vb === null ? '–' : vis(vb, x.enhet)}
                </td>
                <td class="tall sammenligning-forskjell" headers={`${navnId} ${id}-d`}>
                  {x.verdi === null || vb === null ? '–' : forskjell(vb, x.verdi, x.enhet)}
                </td>
              </tr>,
            );
            return ut;
          })}
        </tbody>
      </table>
      {merknader.map((m) => (
        <p key={m} class="felt-hjelp">
          {m}
        </p>
      ))}
    </>
  );
}

/** Differansen mot en lagret variant, med fortegn: «+2,77 %». */
function differanse(t: ReturnType<typeof useTekst>['t'], naa: number, da: number, enhet: Enhet): string {
  const d = naa - da;
  if (Math.abs(d) < 0.005) return '±0';
  return `${d > 0 ? '+' : '−'}${medEnhet(t, Math.abs(d), enhet)}`;
}

/** Valget «det som er fylt ut nå» i sammenligningen. */
const NAA = 'naa';

export function Varianter<T extends object>({
  id,
  skjema,
  resultat,
  onHent,
  sammenlign,
  sti,
}: {
  id: KalkulatorId;
  skjema: T;
  /** Hovedresultatet for det som er fylt ut nå, eller null når det mangler noe. */
  resultat: Hovedresultat | null;
  /** Fyller ut skjemaet med en lagret variant. */
  onHent: (skjema: T) => void;
  /** Nøkkeltallene for et skjema. Med den kan to varianter sammenlignes side om side. */
  sammenlign?: (skjema: T) => Sammenligning;
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

  const visningsnavn = (v: Variant, i: number) => v.navn?.trim() || t('arbeidstid.varianter.variant', { nr: i + 1 });
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

  // Sammenligning: to valg blant variantene og det som er fylt ut nå.
  const [visSammenligning, settVisSammenligning] = useState(false);
  const valg = [...liste.map((v, i) => ({ nokkel: v.lagret, navn: visningsnavn(v, i), skjema: { ...skjema, ...(v.skjema as Partial<T>) } as T })), ...(resultat ? [{ nokkel: NAA, navn: t('arbeidstid.varianter.fyltUtNaa'), skjema }] : [])];
  const [valgA, settValgA] = useState<string | null>(null);
  const [valgB, settValgB] = useState<string | null>(null);
  const a = valg.find((x) => x.nokkel === valgA) ?? valg[0];
  const b = valg.find((x) => x.nokkel === valgB) ?? valg.find((x) => x.nokkel === NAA && x !== a) ?? valg.find((x) => x !== a);
  const kanSammenligne = !!sammenlign && valg.length >= 2;
  const idA = useId();
  const idB = useId();

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
                  <span class="variant-under"> {kortTidspunkt(v.lagret, malform)}</span>
                </span>
              ) : (
                <span class="variant-navn">
                  <span class="variant-tittel">{visningsnavn(v, i)}</span>
                  <button type="button" class="ikonknapp variant-navnknapp" aria-label={t('arbeidstid.varianter.endreNavn', { navn: visningsnavn(v, i) })} onClick={() => startNavn(v)}>
                    <Ikon navn="blyant" class="ikon-liten" />
                  </button>
                  <span class="variant-under"> {kortTidspunkt(v.lagret, malform)}</span>
                </span>
              )}
              <span class="variant-verdi tall">
                {medEnhet(t, v.resultat.verdi, v.resultat.enhet)}
                {resultat && resultat.enhet === v.resultat.enhet && (
                  <span class="variant-under"> {t('arbeidstid.varianter.naa', { differanse: differanse(t, resultat.verdi, v.resultat.verdi, v.resultat.enhet) })}</span>
                )}
              </span>
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
                <button
                  type="button"
                  class="ikonknapp"
                  aria-label={t('arbeidstid.varianter.slett', { navn: visningsnavn(v, i) })}
                  onClick={() => skrivVarianter(id, liste.filter((x) => x.lagret !== v.lagret))}
                >
                  <Ikon navn="lukk" class="ikon-liten" />
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}
      {deling && liste.some((v) => v.lagret === deling.lagret) && (
        <div class="delt-lenke">
          <label for={`${idA}-lenke`} class="liten">
            {t('arbeidstid.varianter.lenke', { navn: deling.navn })}
          </label>
          <input ref={lenkefelt} id={`${idA}-lenke`} class="tekstfelt" type="url" readOnly value={deling.lenke} onFocus={(e) => e.currentTarget.select()} />
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
          <button type="button" class="knapp knapp-sekundaer knapp-liten" aria-expanded={visSammenligning} onClick={() => settVisSammenligning(!visSammenligning)}>
            <Ikon navn={visSammenligning ? 'opp' : 'ned'} class="ikon-liten" />
            {t('arbeidstid.varianter.sammenlign')}
          </button>
        )}
      </div>
      {kanSammenligne && visSammenligning && a && b && sammenlign && (
        <div class="sammenligning-boks">
          <h3 class="liten-overskrift">{t('arbeidstid.varianter.sammenlignTittel')}</h3>
          <p class="felt-hjelp">{t('arbeidstid.varianter.sammenlignHjelp')}</p>
          <div class="feltrad">
            <div class="felt felt-liten">
              <label for={idA}>{t('arbeidstid.varianter.forste')}</label>
              <select id={idA} value={a.nokkel} onChange={(e) => settValgA(e.currentTarget.value)}>
                {valg.map((x) => (
                  <option key={x.nokkel} value={x.nokkel}>
                    {x.navn}
                  </option>
                ))}
              </select>
            </div>
            <div class="felt felt-liten">
              <label for={idB}>{t('arbeidstid.varianter.andre')}</label>
              <select id={idB} value={b.nokkel} onChange={(e) => settValgB(e.currentTarget.value)}>
                {valg.map((x) => (
                  <option key={x.nokkel} value={x.nokkel}>
                    {x.navn}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {a.nokkel === b.nokkel ? (
            <p class="felt-hjelp">{t('arbeidstid.varianter.likeValg')}</p>
          ) : (
            <Sammenligningstabell a={sammenlign(a.skjema)} b={sammenlign(b.skjema)} navnA={a.navn} navnB={b.navn} />
          )}
        </div>
      )}
    </section>
  );
}
