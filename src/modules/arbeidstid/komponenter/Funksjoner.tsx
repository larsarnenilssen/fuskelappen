// Funksjoner og redusert undervisning (livsfasetiltak) i Arbeidsplan.
// En funksjon oppgis i prosent av full stilling eller i årsrammetimer. Den kan utvide planfestet tid eller ikke,
// og kan gi tillegg i lønnen. Redusert undervisning etter SFS 2213 punkt 6 regnes som en funksjon som ikke
// utvider planfestet tid (eier 30.09.2026).
import { useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Oppsummering, Sammenleggbartkort, Sammenleggknapp, useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Funksjon } from '../beregning/index.ts';
import type { Oppdater } from '../kontekst.ts';
import { Bryter, Vippe } from './Skjema.tsx';
import { tallTekst } from './Utregning.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

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
  { nokkel: 'sfs2213.godtgjoring_kontaktlaerer', navn: /kontakt/i, hjelp: 'arbeidstid.arbeidsplan.tilleggKontaktlaerer' },
  { nokkel: 'sfs2213.godtgjoring_radgiver', navn: /r[åa]dgiv|sosiall[æa]/i, hjelp: 'arbeidstid.arbeidsplan.tilleggRadgiver' },
] as const;

/**
 * Forslag til tillegg for en funksjon: minstegodtgjøringen i SFS 2213 punkt 9.1 for funksjonen som kjennes igjen på
 * navnet, eller for kontaktlærer, som er den vanligste, når navnet ikke kjennes igjen.
 */
export function tilleggsforslag(f: Funksjonstilstand, satser: Readonly<Record<string, number | null>>): { verdi: number; hjelp: Tekstnokkel } {
  const kjent = godtgjorteFunksjoner.find((g) => g.navn.test(f.navn));
  const verdi = satser[(kjent ?? godtgjorteFunksjoner[0]).nokkel] ?? 0;
  return { verdi, hjelp: kjent ? kjent.hjelp : 'arbeidstid.arbeidsplan.tilleggUkjent' };
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
  onEndring: Oppdater<Funksjonstilstand[]>;
}) {
  const { t } = useTekst();
  return (
    <>
      <div class="funksjonsliste">
        {funksjoner.map((f, i) => (
          <Funksjonskort
            key={f.id}
            f={f}
            i={i}
            prosent={prosenter[i] ?? 0}
            delresultat={funksjoner.length > 1 && (prosenter[i] ?? 0) > 0 ? tallTekst(prosenter[i] ?? 0) : null}
            satser={satser}
            visTillegg={visTillegg}
            kontaktlaererTimer={kontaktlaererTimer}
            arsrammeFunksjon={arsrammeFunksjon}
            onEndring={onEndring}
          />
        ))}
      </div>
      {/* Knappen er som «Legg til fag» (eier 02.10.2026). */}
      <div class="med-hjelp">
        <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => onEndring((gamle) => [...gamle, nyFunksjon()])}>
          <Ikon navn="pluss" class="ikon-liten" />
          {t('arbeidstid.arbeidsplan.leggTilFunksjon')}
        </button>
        <Hjelp tema={t('arbeidstid.arbeidsplan.funksjoner')}>
          <p class="felt-hjelp"><Begrepstekst tekst={t('arbeidstid.arbeidsplan.funksjonerHjelp')} /></p>
        </Hjelp>
      </div>
    </>
  );
}

/**
 * En funksjon som eget kort, som fagene: overskriften «Funksjon 1» legger kortet sammen, og fjern-knappen står på
 * rammen (eier 02.10.2026).
 */
function Funksjonskort({
  f,
  i,
  prosent,
  delresultat,
  satser,
  visTillegg,
  kontaktlaererTimer,
  arsrammeFunksjon,
  onEndring,
}: {
  f: Funksjonstilstand;
  i: number;
  prosent: number;
  /** Prosenten i overskriften, når det finnes flere funksjoner. */
  delresultat: string | null;
  satser: Readonly<Record<string, number | null>>;
  visTillegg: boolean;
  kontaktlaererTimer: number | null;
  arsrammeFunksjon: number | null;
  onEndring: Oppdater<Funksjonstilstand[]>;
}) {
  const { t } = useTekst();
  const id = useId();
  const innhold = useId();
  const [lukket, veksle] = useSammenlagt(`funksjon-${f.id}`);
  const sett = (fid: number, endring: Partial<Funksjonstilstand>) => onEndring((gamle) => gamle.map((x) => (x.id === fid ? { ...x, ...endring } : x)));
  const nr = (n: number) => t('arbeidstid.arbeidsplan.funksjonNr', { nr: n + 1 });
  const forslag = tilleggsforslag(f, satser);
  // Kontaktlærer uten tid: forslag om minstereduksjonen i punkt 7.3 b, som brukeren kan velge.
  const kontaktlaererHint = kontaktlaererTimer !== null && /kontakt/i.test(f.navn) && prosent === 0;
  return (
    <fieldset class={`fagkort funksjonskort${lukket ? ' lukket' : ''}`}>
      <legend class="fagkort-tittel">
        <Sammenleggknapp lukket={lukket} onVeksle={veksle} kontroll={innhold} oppsummering={f.navn || undefined}>
          <span>{nr(i)}</span>
          {delresultat && <span class="fagkort-resultat tall"> · {t('arbeidstid.felles.delresultat', { verdi: delresultat })}</span>}
        </Sammenleggknapp>
      </legend>
      <button type="button" class="ikonknapp fagkort-fjern" aria-label={t('arbeidstid.arbeidsplan.fjernFunksjon', { nr: i + 1 })} onClick={() => onEndring((gamle) => gamle.filter((x) => x.id !== f.id))}>
        <Ikon navn="lukk" class="ikon-liten" />
      </button>
      <Oppsummering lukket={lukket} onVeksle={veksle}>
        {f.navn}
      </Oppsummering>
      <div id={innhold} class="inndatarad funksjonsrad" hidden={lukket}>
        <label class="skjult-visuelt" for={id}>
          {`${nr(i)}: ${t('arbeidstid.arbeidsplan.funksjonNavn')}`}
        </label>
        <input
          id={id}
          class="tekstfelt"
          type="text"
          autoComplete="off"
          placeholder={t('arbeidstid.arbeidsplan.funksjonNavnPlassholder')}
          value={f.navn}
          onInput={(e) => sett(f.id, { navn: e.currentTarget.value })}
        />
        {iTimer(f) ? (
          <Tallfelt
            key="timer"
            class="felt-kompakt"
            skjultEtikett
            etikett={`${nr(i)}: ${t('arbeidstid.arbeidsplan.funksjonTimer')}`}
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
            etikett={`${nr(i)}: ${t('arbeidstid.arbeidsplan.funksjonProsent')}`}
            verdi={f.prosent}
            min={0}
            maks={100}
            onEndring={(verdi) => sett(f.id, { prosent: verdi })}
          />
        )}
        <Bryter
          legend={`${nr(i)}: ${t('arbeidstid.arbeidsplan.funksjonEnhet')}`}
          skjultLegend
          kompakt
          verdi={f.enhet ?? 'prosent'}
          valg={[
            { verdi: 'prosent', tekst: '%' },
            { verdi: 'arsrammetimer', tekst: t('arbeidstid.arbeidsplan.enhetTimer') },
          ]}
          onEndring={(enhet) => sett(f.id, { enhet })}
        />
        {iTimer(f) && prosent > 0 && (
          <p class="felt-hjelp funksjon-linje">{t('arbeidstid.arbeidsplan.timerSomProsent', { arsramme: tallTekst(arsrammeFunksjon ?? 0), prosent: tallTekst(prosent) })}</p>
        )}
        {kontaktlaererHint && (
          <p class="felt-hjelp funksjon-linje">
            {t('arbeidstid.arbeidsplan.kontaktlaererHint', { timer: tallTekst(kontaktlaererTimer ?? 0) })}{' '}
            <button type="button" class="lenkeknapp liten" onClick={() => sett(f.id, { enhet: 'arsrammetimer', timer: kontaktlaererTimer })}>
              {t('arbeidstid.arbeidsplan.kontaktlaererBruk', { timer: tallTekst(kontaktlaererTimer ?? 0) })}
            </button>
          </p>
        )}
        <Vippe tekst={t('arbeidstid.arbeidsplan.utvider')} skjultForan={`${nr(i)}:`} pa={utvider(f)} onEndring={(pa) => sett(f.id, { utvider: pa })} />
        {visTillegg && (
          // Beløpet står på linjen med vippen, og forklaringen under begge.
          <div class="funksjon-tillegg">
            <Vippe tekst={t('arbeidstid.arbeidsplan.tilleggVippe')} skjultForan={`${nr(i)}:`} pa={f.tillegg === true} onEndring={(pa) => sett(f.id, { tillegg: pa })} />
            {f.tillegg && (
              <Tallfelt
                class="felt-kompakt"
                skjultEtikett
                etikett={t('arbeidstid.arbeidsplan.tilleggFelt', { nr: i + 1 })}
                tusenskille
                hjelpetekst={f.tilleggKr == null ? t(forslag.hjelp, { kr: tallTekst(forslag.verdi) }) : t('arbeidstid.arbeidsplan.tilleggEget')}
                enhet="kr"
                verdi={f.tilleggKr ?? forslag.verdi}
                min={0}
                maks={1000000}
                onEndring={(tilleggKr) => sett(f.id, { tilleggKr })}
              />
            )}
          </div>
        )}
      </div>
    </fieldset>
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
  feriedager60,
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
  /** Arbeidsdagene årsverket er kortere med fra 60 år (ekstra ferie). */
  feriedager60: number | null;
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
              <Begrepstekst
                tekst={t('arbeidstid.livsfase.hjelp', {
                  nyutdannet: tallTekst(satser.nyutdannet ?? 0),
                  fra57: tallTekst(satser.fra57 ?? 0),
                  fra60: tallTekst(satser.fra60 ?? 0),
                })}
              />
            </p>
            <p class="felt-hjelp">
              <Begrepstekst tekst={t('arbeidstid.livsfase.planfestet')} />
            </p>
            {livsfase === 'fra57' && (
              <p class="felt-hjelp">
                <Begrepstekst tekst={t('arbeidstid.livsfase.fra57')} />
              </p>
            )}
            {livsfase === 'fra60' && (
              <p class="felt-hjelp">
                <Begrepstekst tekst={t('arbeidstid.livsfase.fra60', { arsverk: tallTekst(arsverk60 ?? 0), dager: tallTekst(feriedager60 ?? 0) })} />
              </p>
            )}
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
