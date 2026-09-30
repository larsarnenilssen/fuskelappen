// Funksjoner og redusert undervisning (livsfasetiltak) i Arbeidsplan.
// En funksjon oppgis i prosent av full stilling eller i årsrammetimer. Den kan utvide planfestet tid eller ikke,
// og kan gi tillegg i lønnen. Redusert undervisning etter SFS 2213 punkt 6 regnes som en funksjon som ikke
// utvider planfestet tid (eier 30.09.2026).
import { useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sammenleggbartkort } from '../../../components/Sammenlegg.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Funksjon } from '../beregning/index.ts';
import { Bryter, Vippe } from './Skjema.tsx';
import { tallTekst } from './Utregning.tsx';

export interface Funksjonstilstand {
  id: number;
  navn: string;
  prosent: number | null;
  /** Hvordan funksjonen er oppgitt. Mangler i skjema lagret før 0.6.0, og er da prosent. */
  enhet?: 'prosent' | 'arsrammetimer';
  /** Funksjonen i årsrammetimer, når den er oppgitt slik. */
  timer?: number | null;
  /** Om funksjonen utvider planfestet tid (punkt 5.3). Mangler i skjema lagret før 0.5.0, og regnes da som på. */
  utvider?: boolean;
  /** Om funksjonen gir tillegg i lønnen (godtgjøring, SFS 2213 punkt 9.1). */
  tillegg?: boolean;
  /** Tillegget i kroner per år, eller null når beløpet fra SFS 2213 skal brukes. */
  tilleggKr?: number | null;
}

let nesteFunksjon = 1;
export const nyFunksjon = (): Funksjonstilstand => ({ id: nesteFunksjon++, navn: '', prosent: 0, enhet: 'prosent', timer: null, utvider: true });

/** Sørger for at nye funksjoner får id-er som ikke er brukt i et lagret skjema. */
export function reserverFunksjonsider(funksjoner: readonly Funksjonstilstand[]): void {
  for (const f of funksjoner) nesteFunksjon = Math.max(nesteFunksjon, f.id + 1);
}

export const utvider = (f: Funksjonstilstand) => f.utvider !== false;
const iTimer = (f: Funksjonstilstand) => f.enhet === 'arsrammetimer';

/** Funksjonen slik beregningen tar den imot, eller null når feltet er tomt. */
export function tilFunksjon(f: Funksjonstilstand): Funksjon | null {
  if (iTimer(f)) return f.timer == null ? null : { navn: f.navn, prosent: 0, arsrammetimer: f.timer };
  return f.prosent === null ? null : { navn: f.navn, prosent: f.prosent };
}

/** Funksjoner med fast minstegodtgjøring i SFS 2213 punkt 9.1, kjent igjen på navnet brukeren har gitt funksjonen. */
const godtgjorteFunksjoner = [
  { nokkel: 'sfs2213.godtgjoring_kontaktlaerer', navn: /kontakt/i, hjelp: 'arbeidstid.stillingsplan.tilleggKontaktlaerer' },
  { nokkel: 'sfs2213.godtgjoring_radgiver', navn: /r[åa]dgiv|sosiall[æa]/i, hjelp: 'arbeidstid.stillingsplan.tilleggRadgiver' },
] as const;

/**
 * Forslag til tillegg for en funksjon: minstegodtgjøringen i SFS 2213 punkt 9.1 for funksjonen som kjennes igjen på
 * navnet, eller for kontaktlærer, som er den vanligste, når navnet ikke kjennes igjen.
 */
export function tilleggsforslag(f: Funksjonstilstand, satser: Readonly<Record<string, number | null>>): { verdi: number; hjelp: Tekstnokkel } {
  const kjent = godtgjorteFunksjoner.find((g) => g.navn.test(f.navn));
  const verdi = satser[(kjent ?? godtgjorteFunksjoner[0]).nokkel] ?? 0;
  return { verdi, hjelp: kjent ? kjent.hjelp : 'arbeidstid.stillingsplan.tilleggUkjent' };
}

export function Funksjoner({
  funksjoner,
  prosenter,
  satser,
  visTillegg,
  kontaktlaererTimer,
  arsrammeFunksjon,
  onEndring,
}: {
  funksjoner: Funksjonstilstand[];
  /** Prosenten for hver funksjon, også dem oppgitt i årsrammetimer. */
  prosenter: readonly number[];
  /** Godtgjøringene i SFS 2213 punkt 9.1, etter regelnøkkel. */
  satser: Readonly<Record<string, number | null>>;
  /** Tilleggene vises bare når lønnen regnes ut. */
  visTillegg: boolean;
  /** Minste reduksjon for kontaktlærer i årsrammetimer (punkt 7.3 b), eller null. */
  kontaktlaererTimer: number | null;
  /** Årsrammen for lærere med funksjon (607,5), som årsrammetimer gjøres om med. */
  arsrammeFunksjon: number | null;
  onEndring: (f: Funksjonstilstand[]) => void;
}) {
  const { t } = useTekst();
  const id = useId();
  const sett = (fid: number, endring: Partial<Funksjonstilstand>) => onEndring(funksjoner.map((f) => (f.id === fid ? { ...f, ...endring } : f)));
  const nr = (i: number) => t('arbeidstid.stillingsplan.funksjonNr', { nr: i + 1 });
  return (
    <Sammenleggbartkort
      nokkel="funksjoner"
      tittel={t('arbeidstid.stillingsplan.funksjoner')}
      oppsummering={t('arbeidstid.stillingsplan.funksjonerOppsummering', {
        antall: funksjoner.length,
        prosent: tallTekst(prosenter.reduce((sum, p) => sum + p, 0)),
      })}
    >
      {funksjoner.map((f, i) => {
        const forslag = tilleggsforslag(f, satser);
        // Kontaktlærer uten tid: forslag om minstereduksjonen i punkt 7.3 b, som brukeren kan velge.
        const kontaktlaererHint = kontaktlaererTimer !== null && /kontakt/i.test(f.navn) && (prosenter[i] ?? 0) === 0;
        return (
          <div key={f.id} class="inndatarad funksjonsrad">
            <label class="skjult-visuelt" for={`${id}-${f.id}`}>
              {`${nr(i)}: ${t('arbeidstid.stillingsplan.funksjonNavn')}`}
            </label>
            <input
              id={`${id}-${f.id}`}
              class="tekstfelt"
              type="text"
              autoComplete="off"
              placeholder={t('arbeidstid.stillingsplan.funksjonNavnPlassholder')}
              value={f.navn}
              onInput={(e) => sett(f.id, { navn: e.currentTarget.value })}
            />
            {iTimer(f) ? (
              <Tallfelt
                key="timer"
                class="felt-kompakt"
                skjultEtikett
                etikett={`${nr(i)}: ${t('arbeidstid.stillingsplan.funksjonTimer')}`}
                verdi={f.timer ?? null}
                min={0}
                maks={1000}
                onEndring={(timer) => sett(f.id, { timer })}
              />
            ) : (
              <Tallfelt
                key="prosent"
                class="felt-kompakt"
                skjultEtikett
                etikett={`${nr(i)}: ${t('arbeidstid.stillingsplan.funksjonProsent')}`}
                verdi={f.prosent}
                min={0}
                maks={100}
                onEndring={(prosent) => sett(f.id, { prosent })}
              />
            )}
            <Bryter
              legend={`${nr(i)}: ${t('arbeidstid.stillingsplan.funksjonEnhet')}`}
              skjultLegend
              kompakt
              verdi={f.enhet ?? 'prosent'}
              valg={[
                { verdi: 'prosent', tekst: '%' },
                { verdi: 'arsrammetimer', tekst: t('arbeidstid.stillingsplan.enhetTimer') },
              ]}
              onEndring={(enhet) => sett(f.id, { enhet })}
            />
            <button type="button" class="ikonknapp" aria-label={t('arbeidstid.stillingsplan.fjernFunksjon', { nr: i + 1 })} onClick={() => onEndring(funksjoner.filter((x) => x.id !== f.id))}>
              <Ikon navn="lukk" class="ikon-liten" />
            </button>
            {iTimer(f) && (prosenter[i] ?? 0) > 0 && (
              <p class="felt-hjelp funksjon-linje">{t('arbeidstid.stillingsplan.timerSomProsent', { arsramme: tallTekst(arsrammeFunksjon ?? 0), prosent: tallTekst(prosenter[i] ?? 0) })}</p>
            )}
            {kontaktlaererHint && (
              <p class="felt-hjelp funksjon-linje">
                {t('arbeidstid.stillingsplan.kontaktlaererHint', { timer: tallTekst(kontaktlaererTimer ?? 0) })}{' '}
                <button type="button" class="lenkeknapp liten" onClick={() => sett(f.id, { enhet: 'arsrammetimer', timer: kontaktlaererTimer })}>
                  {t('arbeidstid.stillingsplan.kontaktlaererBruk', { timer: tallTekst(kontaktlaererTimer ?? 0) })}
                </button>
              </p>
            )}
            <Vippe tekst={t('arbeidstid.stillingsplan.utvider')} skjultForan={`${nr(i)}:`} pa={utvider(f)} onEndring={(pa) => sett(f.id, { utvider: pa })} />
            {visTillegg && (
              <Vippe tekst={t('arbeidstid.stillingsplan.tilleggVippe')} skjultForan={`${nr(i)}:`} pa={f.tillegg === true} onEndring={(pa) => sett(f.id, { tillegg: pa })} />
            )}
            {visTillegg && f.tillegg && (
              <Tallfelt
                class="felt-kompakt funksjon-tillegg"
                etikett={t('arbeidstid.stillingsplan.tilleggFelt', { nr: i + 1 })}
                tusenskille
                hjelpetekst={f.tilleggKr == null ? t(forslag.hjelp, { kr: tallTekst(forslag.verdi) }) : t('arbeidstid.stillingsplan.tilleggEget')}
                enhet="kr"
                verdi={f.tilleggKr ?? forslag.verdi}
                min={0}
                maks={1000000}
                onEndring={(tilleggKr) => sett(f.id, { tilleggKr })}
              />
            )}
          </div>
        );
      })}
      <div class="med-hjelp">
        <button type="button" class="lenkeknapp liten" onClick={() => onEndring([...funksjoner, nyFunksjon()])}>
          <Ikon navn="pluss" class="ikon-liten" />
          {t('arbeidstid.stillingsplan.leggTilFunksjon')}
        </button>
        <Hjelp tema={t('arbeidstid.stillingsplan.funksjoner')}>
          <p class="felt-hjelp">{t('arbeidstid.stillingsplan.funksjonerHjelp')}</p>
        </Hjelp>
      </div>
    </Sammenleggbartkort>
  );
}

/** Redusert undervisning etter SFS 2213 punkt 6. */
export type Livsfase = 'ingen' | 'nyutdannet' | 'fra57' | 'fra60';

/** Regelnøkkelen for den største reduksjonen i hvert livsfasetiltak. */
export const livsfaseregler: Record<Exclude<Livsfase, 'ingen'>, string> = {
  nyutdannet: 'sfs2213.livsfase_nyutdannet_prosent',
  fra57: 'sfs2213.livsfase_57_prosent',
  fra60: 'sfs2213.livsfase_60_prosent',
};

export function Livsfasekort({
  livsfase,
  prosent,
  maks,
  satser,
  arsverk60,
  onEndring,
}: {
  livsfase: Livsfase;
  /** Reduksjonen brukeren har skrevet inn, eller null for den største reduksjonen. */
  prosent: number | null;
  /** Den største reduksjonen for valgt tiltak, fra regelverket. */
  maks: number | null;
  /** Den største reduksjonen i hvert tiltak, til forklaringen. */
  satser: Readonly<Record<Exclude<Livsfase, 'ingen'>, number | null>>;
  /** Årsverket for lærere som er 60 år og eldre. */
  arsverk60: number | null;
  onEndring: (livsfase: Livsfase, prosent: number | null) => void;
}) {
  const { t } = useTekst();
  const id = useId();
  const valgt = livsfase !== 'ingen';
  const brukt = prosent ?? maks ?? 0;
  return (
    <Sammenleggbartkort
      nokkel="livsfase"
      tittel={t('arbeidstid.livsfase.tittel')}
      oppsummering={valgt ? t('arbeidstid.livsfase.oppsummering', { tiltak: t(`arbeidstid.livsfase.valg.${livsfase}`), prosent: tallTekst(brukt) }) : t('arbeidstid.livsfase.valg.ingen')}
    >
      <div class="felt felt-liten">
        <div class="med-hjelp">
          <label for={id}>{t('arbeidstid.livsfase.velg')}</label>
          <Hjelp tema={t('arbeidstid.livsfase.tittel')}>
            <p class="felt-hjelp">
              {t('arbeidstid.livsfase.hjelp', {
                nyutdannet: tallTekst(satser.nyutdannet ?? 0),
                fra57: tallTekst(satser.fra57 ?? 0),
                fra60: tallTekst(satser.fra60 ?? 0),
              })}
            </p>
            <p class="felt-hjelp">{t('arbeidstid.livsfase.planfestet')}</p>
            {livsfase === 'fra57' && <p class="felt-hjelp">{t('arbeidstid.livsfase.fra57')}</p>}
            {livsfase === 'fra60' && <p class="felt-hjelp">{t('arbeidstid.livsfase.fra60', { arsverk: tallTekst(arsverk60 ?? 0) })}</p>}
          </Hjelp>
        </div>
        <select id={id} value={livsfase} onChange={(e) => onEndring(e.currentTarget.value as Livsfase, null)}>
          {(['ingen', 'nyutdannet', 'fra57', 'fra60'] as const).map((v) => (
            <option key={v} value={v}>
              {t(`arbeidstid.livsfase.valg.${v}`)}
            </option>
          ))}
        </select>
      </div>
      {valgt && maks !== null && (
        <>
          <Tallfelt
            class="felt-kompakt"
            etikett={t('arbeidstid.livsfase.prosent')}
            hjelpetekst={t('arbeidstid.livsfase.prosentHjelp', { maks: tallTekst(maks) })}
            plassholder={tallTekst(maks)}
            enhet="%"
            verdi={prosent}
            min={0}
            maks={maks}
            onEndring={(p) => onEndring(livsfase, p)}
          />
        </>
      )}
    </Sammenleggbartkort>
  );
}
