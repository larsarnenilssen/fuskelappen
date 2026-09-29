// Skjemadeler for kalkulatorene: brytere, fagsøk med årsramme fra vedlegg 1, og kort for hvert fag.
import type { ComponentChildren } from 'preact';
import { useId, useMemo, useState } from 'preact/hooks';
import fagkoder from '../../../../data/grep/fagkoder.json';
import programomrader from '../../../../data/grep/programomrader.json';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { somTabell } from '../../../core/regler/motor.ts';
import type { Arsrammerad, Arsrammevalg, Gruppe, Hent } from '../beregning/index.ts';
import { type Fagkoder, lagFagindeks, type Programomrader, sokFag } from '../fagsok.ts';

/** Segmentert bryter: et lite utvalg valg side om side (radioknapper). */
export function Bryter<V extends string>({
  legend,
  verdi,
  valg,
  onEndring,
  skjultLegend = false,
}: {
  legend: string;
  verdi: V;
  valg: { verdi: V; tekst: string }[];
  onEndring: (v: V) => void;
  skjultLegend?: boolean;
}) {
  const id = useId();
  return (
    <fieldset class="bryter">
      <legend class={skjultLegend ? 'skjult-visuelt' : 'bryter-legend'}>{legend}</legend>
      <div class="bryter-valg">
        {valg.map((v) => (
          <label key={v.verdi} class={verdi === v.verdi ? 'valgt' : undefined}>
            <input type="radio" name={id} checked={verdi === v.verdi} onChange={() => onEndring(v.verdi)} />
            <span>{v.tekst}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Av/på-bryter (avkrysning med rollen «switch»). */
export function Vippe({ tekst, hjelp, pa, onEndring }: { tekst: string; hjelp?: string; pa: boolean; onEndring: (pa: boolean) => void }) {
  const id = useId();
  return (
    <div class="vippe">
      <input id={id} type="checkbox" role="switch" checked={pa} aria-describedby={hjelp ? `${id}-hjelp` : undefined} onChange={(e) => onEndring(e.currentTarget.checked)} />
      <label for={id}>{tekst}</label>
      {hjelp && (
        <p id={`${id}-hjelp`} class="felt-hjelp">
          {hjelp}
        </p>
      )}
    </div>
  );
}

/** Ett valg av årsramme: en rad i vedlegg 1 (nr), «manuell», eller ikke valgt (''). */
export interface Arsrammeplass {
  valg: string;
  t60: number | null;
  stjerne: boolean;
}

export function tomArsrammeplass(): Arsrammeplass {
  return { valg: '', t60: null, stjerne: false };
}

/** Gjør et utfylt valg om til inndata for beregningen, eller null hvis det mangler noe. */
export function tilArsrammevalg(p: Arsrammeplass, rader: readonly Arsrammerad[]): Arsrammevalg | null {
  if (p.valg === 'manuell') return p.t60 !== null && p.t60 > 0 ? { type: 'manuell', t60: p.t60, stjerne: p.stjerne } : null;
  const rad = rader.find((r) => String(r.nr) === p.valg);
  return rad ? { type: 'rad', rad } : null;
}

export function erStjernefag(plasser: readonly Arsrammeplass[], rader: readonly Arsrammerad[]): boolean {
  return plasser.some((p) => {
    const v = tilArsrammevalg(p, rader);
    if (v === null) return false;
    return v.type === 'rad' ? v.rad.stjerne : v.type === 'manuell' && v.stjerne;
  });
}

/** Årsrammenivåene i vedlegg 1 (f.eks. 525/700), med noen eksempelfag på hvert nivå. */
export function arsrammenivaer(indeks: Fagindeks): { t60: number; t45: number; eksempler: string[] }[] {
  const nivaer = new Map<number, { t60: number; t45: number; eksempler: string[] }>();
  for (const { treff } of indeks) {
    const n = nivaer.get(treff.rad.t60) ?? { t60: treff.rad.t60, t45: treff.rad.t45, eksempler: [] };
    const navn = treff.fag ?? treff.program;
    if (!n.eksempler.includes(navn)) n.eksempler.push(navn);
    nivaer.set(treff.rad.t60, n);
  }
  return [...nivaer.values()].sort((a, b) => b.t60 - a.t60);
}

/** Velger et årsrammenivå fra vedlegg 1 uten å velge fag. */
export function Nivavelger({ etikett, t60, indeks, onEndring }: { etikett: string; t60: number | null; indeks: Fagindeks; onEndring: (t60: number | null, t45: number | null) => void }) {
  const { t } = useTekst();
  const id = useId();
  const nivaer = useMemo(() => arsrammenivaer(indeks), [indeks]);
  return (
    <div class="felt">
      <label for={id}>{etikett}</label>
      <select
        id={id}
        value={t60 === null ? '' : String(t60)}
        onChange={(e) => {
          const n = nivaer.find((x) => String(x.t60) === e.currentTarget.value);
          onEndring(n?.t60 ?? null, n?.t45 ?? null);
        }}
      >
        <option value="">{t('arbeidstid.fordeling.velgNiva')}</option>
        {nivaer.map((n) => (
          <option key={n.t60} value={String(n.t60)}>
            {t('arbeidstid.fordeling.nivaValg', { t60: formaterTall(n.t60), t45: formaterTall(n.t45), eksempler: n.eksempler.slice(0, 3).join(', ') })}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Søkeindeksen for vedlegg 1, med søkeord fra regelsettet og programområdene fra Grep. */
export function useFagindeks(hent: Hent, rader: readonly Arsrammerad[]) {
  return useMemo(() => {
    const tabell = (n: string) => {
      try {
        return somTabell(hent(n), n);
      } catch {
        return [];
      }
    };
    return lagFagindeks(rader, {
      programnavn: tabell('sfs2213.programnavn'),
      fagnavn: tabell('sfs2213.fagnavn'),
      kallenavn: tabell('sfs2213.kallenavn'),
      programomrader: (programomrader as unknown as { programomrader: Programomrader }).programomrader,
      fagkoder: (fagkoder as unknown as { fagkoder: Fagkoder }).fagkoder,
    });
  }, [hent, rader]);
}

type Fagindeks = ReturnType<typeof useFagindeks>;

/** Kort visning av en valgt rad: «Engelsk · Studiespesialisering Vg1». */
function radTekst(indeks: Fagindeks, nr: string): { navn: string; t60: number; t45: number; stjerne: boolean } | null {
  const post = indeks.find((p) => String(p.treff.rad.nr) === nr);
  if (!post) return null;
  const { rad, fag, program } = post.treff;
  return { navn: `${fag ?? rad.kategori} · ${program} ${rad.trinn}`, t60: rad.t60, t45: rad.t45, stjerne: rad.stjerne };
}

/** Velger en årsramme: søk i vedlegg 1, eller skriv inn årsrammen selv. */
export function Fagvelger({
  etikett,
  plass,
  indeks,
  onEndring,
  ekstra,
}: {
  etikett: string;
  plass: Arsrammeplass;
  indeks: Fagindeks;
  onEndring: (p: Arsrammeplass) => void;
  ekstra?: ComponentChildren;
}) {
  const { t } = useTekst();
  const id = useId();
  const [sok, settSok] = useState('');
  const treff = useMemo(() => sokFag(indeks, sok, 6), [indeks, sok]);

  if (plass.valg === 'manuell') {
    return (
      <div class="fagvelger">
        <Tallfelt etikett={t('arbeidstid.felles.manuellEtikett')} verdi={plass.t60} min={1} maks={2000} onEndring={(v) => onEndring({ ...plass, t60: v })} />
        <Vippe tekst={t('arbeidstid.felles.manuellStjerne')} pa={plass.stjerne} onEndring={(stjerne) => onEndring({ ...plass, stjerne })} />
        <button type="button" class="lenkeknapp liten" onClick={() => onEndring(tomArsrammeplass())}>
          {t('arbeidstid.felles.tilbakeTilSok')}
        </button>
        {ekstra}
      </div>
    );
  }

  const valgt = plass.valg ? radTekst(indeks, plass.valg) : null;
  if (valgt) {
    return (
      <div class="fagvelger">
        <p class="fagvalg" aria-label={`${etikett}: ${valgt.navn}`}>
          <span class="fagvalg-navn">
            {valgt.navn}
            {valgt.stjerne && <span aria-hidden="true"> {t('arbeidstid.felles.stjerne')}</span>}
          </span>
          <span class="fagvalg-ramme tall">{t('arbeidstid.felles.arsrammeKort', { t60: formaterTall(valgt.t60), t45: formaterTall(valgt.t45) })}</span>
          <button type="button" class="lenkeknapp liten" onClick={() => onEndring(tomArsrammeplass())} aria-label={`${t('arbeidstid.felles.endreFag')}: ${valgt.navn}`}>
            {t('arbeidstid.felles.endreFag')}
          </button>
        </p>
        {ekstra}
      </div>
    );
  }

  return (
    <div class="fagvelger">
      <div class="felt">
        <label for={id}>{etikett}</label>
        <div class="sokefelt">
          <Ikon navn="sok" class="sokefelt-ikon" />
          <input
            id={id}
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            placeholder={t('arbeidstid.felles.fagSok')}
            aria-describedby={`${id}-hjelp`}
            aria-controls={`${id}-treff`}
            value={sok}
            onInput={(e) => settSok(e.currentTarget.value)}
          />
        </div>
        <p id={`${id}-hjelp`} class="felt-hjelp">
          {t('arbeidstid.felles.fagSokHjelp')}
        </p>
      </div>
      <ul id={`${id}-treff`} class="fagtreff" aria-live="polite">
        {treff.map((tr) => (
          <li key={tr.rad.nr}>
            <button type="button" onClick={() => onEndring({ valg: String(tr.rad.nr), t60: null, stjerne: false })}>
              <span class="fagtreff-navn">
                {tr.fag ?? tr.rad.kategori} · {tr.program} {tr.rad.trinn}
                {tr.rad.stjerne && <span aria-hidden="true"> {t('arbeidstid.felles.stjerne')}</span>}
              </span>
              <span class="fagtreff-under tall">
                {t('arbeidstid.felles.arsrammeKort', { t60: formaterTall(tr.rad.t60), t45: formaterTall(tr.rad.t45) })}
                {tr.ekstra.length > 0 && ` · ${tr.ekstra.join(', ')}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {sok.trim() !== '' && treff.length === 0 && <p class="felt-hjelp">{t('arbeidstid.felles.ingenFagTreff')}</p>}
      <button type="button" class="lenkeknapp liten" onClick={() => onEndring({ valg: 'manuell', t60: null, stjerne: false })}>
        {t('arbeidstid.felles.manuellValg')}
      </button>
      {ekstra}
    </div>
  );
}

/** Fag med årsramme: hovedfaget, eventuelt flere program eller nivåer i samme time, og bryter for små klasser. */
export function Fagfelt({
  plasser,
  faaElever,
  indeks,
  rader,
  onPlasser,
  onFaaElever,
}: {
  plasser: Arsrammeplass[];
  faaElever: boolean;
  indeks: Fagindeks;
  rader: readonly Arsrammerad[];
  onPlasser: (p: Arsrammeplass[]) => void;
  onFaaElever: (v: boolean) => void;
}) {
  const { t } = useTekst();
  const sett = (i: number, ny: Arsrammeplass) => onPlasser(plasser.map((x, j) => (j === i ? ny : x)));
  return (
    <>
      {plasser.map((p, i) => (
        <div key={i} class={i > 0 ? 'fag-blandet' : undefined}>
          <Fagvelger
            etikett={i === 0 ? t('arbeidstid.felles.fag') : t('arbeidstid.felles.blandetEtikett')}
            plass={p}
            indeks={indeks}
            onEndring={(ny) => sett(i, ny)}
            ekstra={
              i > 0 ? (
                <button type="button" class="lenkeknapp liten" onClick={() => onPlasser(plasser.filter((_, j) => j !== i))}>
                  {t('arbeidstid.felles.fjernArsramme')}
                </button>
              ) : undefined
            }
          />
        </div>
      ))}
      {plasser[0]?.valg && (
        <button type="button" class="lenkeknapp liten" onClick={() => onPlasser([...plasser, tomArsrammeplass()])}>
          <Ikon navn="pluss" class="ikon-liten" />
          {t('arbeidstid.felles.leggTilArsramme')}
        </button>
      )}
      {erStjernefag(plasser, rader) && <Vippe tekst={t('arbeidstid.felles.faaElever')} hjelp={t('arbeidstid.felles.faaEleverHjelp')} pa={faaElever} onEndring={onFaaElever} />}
    </>
  );
}

/** Minutter per økt: 45, 60, 90 eller annet. */
export function Minuttvelger({ minutter, fritt, onEndring }: { minutter: number | null; fritt: boolean; onEndring: (m: number | null, fritt: boolean) => void }) {
  const { t } = useTekst();
  const valg = fritt ? 'annet' : String(minutter ?? 45);
  return (
    <>
      <Bryter
        legend={t('arbeidstid.felles.minutter')}
        verdi={valg}
        valg={[
          { verdi: '45', tekst: '45' },
          { verdi: '60', tekst: '60' },
          { verdi: '90', tekst: '90' },
          { verdi: 'annet', tekst: t('arbeidstid.felles.minutterAnnet') },
        ]}
        onEndring={(v) => (v === 'annet' ? onEndring(minutter, true) : onEndring(Number(v), false))}
      />
      {fritt && <Tallfelt etikett={t('arbeidstid.felles.minutterFritt')} verdi={minutter} min={1} maks={600} onEndring={(m) => onEndring(m, true)} />}
    </>
  );
}

export interface Gruppetilstand {
  id: number;
  arsrammer: Arsrammeplass[];
  faaElever: boolean;
  modus: 'arstimer' | 'okter';
  arstimer: number | null;
  okter: number | null;
  minutter: number | null;
  minutterFritt: boolean;
  uker: number | null;
  endreUker: boolean;
}

let nesteId = 1;

export function nyGruppe(): Gruppetilstand {
  return { id: nesteId++, arsrammer: [tomArsrammeplass()], faaElever: false, modus: 'arstimer', arstimer: null, okter: null, minutter: 45, minutterFritt: false, uker: null, endreUker: false };
}

/** Sørger for at nye grupper får id-er som ikke er brukt (etter at tilstanden er hentet fra historikken). */
export function reserverIder(grupper: readonly Gruppetilstand[]): void {
  for (const g of grupper) nesteId = Math.max(nesteId, g.id + 1);
}

/** Gjør gruppeskjemaet om til inndata for beregningen, eller null hvis noe mangler. */
export function tilGruppe(g: Gruppetilstand, rader: readonly Arsrammerad[], periode: boolean): Gruppe | null {
  const valg = g.arsrammer.map((p) => tilArsrammevalg(p, rader));
  if (valg.length === 0 || valg.some((v) => v === null)) return null;
  const arsrammer = valg as Arsrammevalg[];
  if (g.modus === 'arstimer') {
    if (g.arstimer === null) return null;
    return { arsrammer, elever: g.faaElever, undervisning: { type: 'arstimer', arstimer: g.arstimer } };
  }
  const uker = g.endreUker || periode ? g.uker : null;
  if (g.okter === null || g.minutter === null || (periode && uker === null)) return null;
  return { arsrammer, elever: g.faaElever, undervisning: { type: 'okter', okterPerUke: g.okter, minutter: g.minutter, uker } };
}

export function Gruppekort({
  gruppe,
  nr,
  rader,
  indeks,
  periode,
  standardUker,
  delresultat,
  kanFjernes,
  onEndring,
  onFjern,
}: {
  gruppe: Gruppetilstand;
  nr: number;
  rader: readonly Arsrammerad[];
  indeks: Fagindeks;
  periode: boolean;
  standardUker: number;
  delresultat: string | null;
  kanFjernes: boolean;
  onEndring: (g: Gruppetilstand) => void;
  onFjern: () => void;
}) {
  const { t } = useTekst();
  const sett = (endring: Partial<Gruppetilstand>) => onEndring({ ...gruppe, ...endring });
  return (
    <fieldset class="fagkort" data-gruppe={nr}>
      <legend class="fagkort-tittel">
        <span>{t('arbeidstid.felles.gruppe', { nr })}</span>
      </legend>
      {kanFjernes && (
        <button type="button" class="ikonknapp fagkort-fjern" aria-label={t('arbeidstid.felles.fjernGruppe', { nr })} onClick={onFjern}>
          <Ikon navn="lukk" class="ikon-liten" />
        </button>
      )}
      <Fagfelt
        plasser={gruppe.arsrammer}
        faaElever={gruppe.faaElever}
        indeks={indeks}
        rader={rader}
        onPlasser={(arsrammer) => sett({ arsrammer })}
        onFaaElever={(faaElever) => sett({ faaElever })}
      />
      <Bryter
        legend={t('arbeidstid.felles.undervisning')}
        skjultLegend
        verdi={gruppe.modus}
        valg={[
          { verdi: 'arstimer', tekst: periode ? t('arbeidstid.felles.modusTimerPeriode') : t('arbeidstid.felles.modusArstimer') },
          { verdi: 'okter', tekst: t('arbeidstid.felles.modusOkter') },
        ]}
        onEndring={(modus) => sett({ modus })}
      />
      {gruppe.modus === 'arstimer' ? (
        <Tallfelt
          key="timer"
          etikett={periode ? t('arbeidstid.felles.timerIPerioden') : t('arbeidstid.felles.arstimer')}
          verdi={gruppe.arstimer}
          min={0}
          maks={2000}
          onEndring={(v) => sett({ arstimer: v })}
        />
      ) : (
        <>
          <div class="feltrad">
            <Tallfelt key="okter" etikett={t('arbeidstid.felles.okter')} verdi={gruppe.okter} min={0} maks={50} onEndring={(v) => sett({ okter: v })} />
            {(periode || gruppe.endreUker) && (
              <Tallfelt key="uker" etikett={periode ? t('arbeidstid.felles.ukerPeriode') : t('arbeidstid.felles.uker')} verdi={gruppe.uker} min={0} maks={60} onEndring={(v) => sett({ uker: v })} />
            )}
          </div>
          <Minuttvelger minutter={gruppe.minutter} fritt={gruppe.minutterFritt} onEndring={(minutter, minutterFritt) => sett({ minutter, minutterFritt })} />
          {!periode && !gruppe.endreUker && (
            <p class="felt-hjelp">
              {t('arbeidstid.felles.ukerStandard', { uker: formaterTall(standardUker) })}{' '}
              <button type="button" class="lenkeknapp liten" onClick={() => sett({ endreUker: true, uker: standardUker })}>
                {t('arbeidstid.felles.endreUker')}
              </button>
            </p>
          )}
        </>
      )}
      {delresultat && (
        <p class="fagkort-resultat tall" aria-live="polite">
          = {t('arbeidstid.felles.delresultat', { verdi: delresultat })}
        </p>
      )}
    </fieldset>
  );
}

/** Kort for hvert fag, med knapp for å legge til flere. */
export function Grupper({
  grupper,
  rader,
  indeks,
  periode,
  standardUker,
  delresultater,
  onEndring,
}: {
  grupper: Gruppetilstand[];
  rader: readonly Arsrammerad[];
  indeks: Fagindeks;
  periode: boolean;
  standardUker: number;
  /** Beskjeftigelse per gruppe (prosent), vises på kortet når det finnes flere. */
  delresultater?: (number | null)[];
  onEndring: (g: Gruppetilstand[]) => void;
}) {
  const { t } = useTekst();
  return (
    <section aria-label={t('arbeidstid.felles.grupper')} class="fagkortliste">
      {grupper.map((g, i) => {
        const del = delresultater?.[i];
        return (
          <Gruppekort
            key={g.id}
            gruppe={g}
            nr={i + 1}
            rader={rader}
            indeks={indeks}
            periode={periode}
            standardUker={standardUker}
            delresultat={grupper.length > 1 && del != null ? formaterTall(del) : null}
            kanFjernes={grupper.length > 1}
            onEndring={(ny) => onEndring(grupper.map((x) => (x.id === g.id ? ny : x)))}
            onFjern={() => onEndring(grupper.filter((x) => x.id !== g.id))}
          />
        );
      })}
      <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => onEndring([...grupper, nyGruppe()])}>
        <Ikon navn="pluss" class="ikon-liten" />
        {t('arbeidstid.felles.leggTilGruppe')}
      </button>
    </section>
  );
}
