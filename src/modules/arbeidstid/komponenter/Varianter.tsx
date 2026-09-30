// Lagrede varianter av en kalkulator: brukeren lagrer det utfylte med hovedresultatet, og kan sammenligne
// og hente det fram igjen, f.eks. før og etter en endring. Brukeren kan gi hver variant et navn.
// Lagres bare på enheten (scenarier i lagringen).
import { useEffect, useRef, useState } from 'preact/hooks';
import { useTekst, useTilstand, tilstand } from '../../../app/tilstand.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import type { Enhet } from '../beregning/index.ts';
import type { KalkulatorId } from './Kalkulatorside.tsx';
import { medEnhet } from './Utregning.tsx';

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
}: {
  id: KalkulatorId;
  skjema: T;
  /** Hovedresultatet for det som er fylt ut nå, eller null når det mangler noe. */
  resultat: Hovedresultat | null;
  /** Fyller ut skjemaet med en lagret variant. */
  onHent: (skjema: T) => void;
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
    const ny: Variant = { lagret: new Date().toISOString(), skjema: skjema as Record<string, unknown>, resultat };
    // Den eldste varianten erstattes når listen er full. Navnefeltet åpnes, så varianten kan få et navn med en gang.
    skrivVarianter(id, [...liste, ny].slice(-MAKS));
    settUtkast('');
    settRedigerer(ny.lagret);
  };

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
      <button type="button" class="knapp knapp-sekundaer knapp-liten" disabled={!resultat} onClick={lagre}>
        <Ikon navn="pluss" class="ikon-liten" />
        {t('arbeidstid.varianter.lagre')}
      </button>
    </section>
  );
}
