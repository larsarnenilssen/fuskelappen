// Skjemadeler som brukes av flere kalkulatorer: valgknapper, årsrammevalg og grupper av fag.
import { useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { type Arsrammerad, type Arsrammevalg, type Gruppe, radNavn } from '../beregning/index.ts';

export function Valgknapper<V extends string>({
  legend,
  navn,
  verdi,
  valg,
  onEndring,
}: {
  legend: string;
  navn: string;
  verdi: V;
  valg: { verdi: V; tekst: string }[];
  onEndring: (v: V) => void;
}) {
  const id = useId();
  return (
    <fieldset class="valggruppe">
      <legend>{legend}</legend>
      {valg.map((v) => (
        <label class="valg" key={v.verdi}>
          <input type="radio" name={`${navn}-${id}`} checked={verdi === v.verdi} onChange={() => onEndring(v.verdi)} />
          <span>{v.tekst}</span>
        </label>
      ))}
    </fieldset>
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

function grupperEtterRamme(rader: readonly Arsrammerad[]): { t60: number; t45: number; rader: Arsrammerad[] }[] {
  const grupper = new Map<number, { t60: number; t45: number; rader: Arsrammerad[] }>();
  for (const r of rader) {
    const g = grupper.get(r.t60) ?? { t60: r.t60, t45: r.t45, rader: [] };
    g.rader.push(r);
    grupper.set(r.t60, g);
  }
  return [...grupper.values()].sort((a, b) => b.t60 - a.t60);
}

export function Arsrammevelger({
  etikett,
  plass,
  rader,
  onEndring,
}: {
  etikett: string;
  plass: Arsrammeplass;
  rader: readonly Arsrammerad[];
  onEndring: (p: Arsrammeplass) => void;
}) {
  const { t } = useTekst();
  const id = useId();
  return (
    <>
      <div class="felt">
        <label for={id}>{etikett}</label>
        <select id={id} value={plass.valg} onChange={(e) => onEndring({ ...plass, valg: e.currentTarget.value })}>
          <option value="">{t('arbeidstid.felles.velgArsramme')}</option>
          {grupperEtterRamme(rader).map((g) => (
            <optgroup key={g.t60} label={t('arbeidstid.felles.optgruppe', { t60: formaterTall(g.t60), t45: formaterTall(g.t45) })}>
              {g.rader.map((r) => (
                <option key={r.nr} value={String(r.nr)}>
                  {radNavn(r)}
                  {r.stjerne ? ` ${t('arbeidstid.felles.stjerne')}` : ''}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="manuell">{t('arbeidstid.felles.manuellValg')}</option>
        </select>
      </div>
      {plass.valg === 'manuell' && (
        <>
          <Tallfelt etikett={t('arbeidstid.felles.manuellEtikett')} verdi={plass.t60} min={1} maks={2000} onEndring={(v) => onEndring({ ...plass, t60: v })} />
          <label class="valg">
            <input type="checkbox" checked={plass.stjerne} onChange={(e) => onEndring({ ...plass, stjerne: e.currentTarget.checked })} />
            <span>{t('arbeidstid.felles.manuellStjerne')}</span>
          </label>
        </>
      )}
    </>
  );
}

export interface Gruppetilstand {
  id: number;
  arsrammer: Arsrammeplass[];
  elever: number | null;
  modus: 'arstimer' | 'okter';
  arstimer: number | null;
  okter: number | null;
  minutter: number | null;
  uker: number | null;
}

let nesteId = 1;

export function nyGruppe(): Gruppetilstand {
  return { id: nesteId++, arsrammer: [tomArsrammeplass()], elever: null, modus: 'arstimer', arstimer: null, okter: null, minutter: 45, uker: null };
}

function harStjerne(g: Gruppetilstand, rader: readonly Arsrammerad[]): boolean {
  return g.arsrammer.some((p) => {
    const v = tilArsrammevalg(p, rader);
    return v !== null && (v.type === 'rad' ? v.rad.stjerne : v.stjerne);
  });
}

/** Gjør gruppeskjemaet om til inndata for beregningen, eller null hvis noe mangler. */
export function tilGruppe(g: Gruppetilstand, rader: readonly Arsrammerad[], periode: boolean): Gruppe | null {
  const valg = g.arsrammer.map((p) => tilArsrammevalg(p, rader));
  if (valg.length === 0 || valg.some((v) => v === null)) return null;
  const arsrammer = valg as Arsrammevalg[];
  if (g.modus === 'arstimer') {
    if (g.arstimer === null) return null;
    return { arsrammer, elever: g.elever, undervisning: { type: 'arstimer', arstimer: g.arstimer } };
  }
  if (g.okter === null || g.minutter === null || (periode && g.uker === null)) return null;
  return { arsrammer, elever: g.elever, undervisning: { type: 'okter', okterPerUke: g.okter, minutter: g.minutter, uker: g.uker } };
}

export function Gruppeskjema({
  gruppe,
  nr,
  rader,
  periode,
  standardUker,
  kanFjernes,
  onEndring,
  onFjern,
}: {
  gruppe: Gruppetilstand;
  nr: number;
  rader: readonly Arsrammerad[];
  periode: boolean;
  standardUker: number;
  kanFjernes: boolean;
  onEndring: (g: Gruppetilstand) => void;
  onFjern: () => void;
}) {
  const { t } = useTekst();
  const sett = (endring: Partial<Gruppetilstand>) => onEndring({ ...gruppe, ...endring });
  const flere = gruppe.arsrammer.length > 1;
  return (
    <fieldset class="valggruppe gruppe" data-gruppe={nr}>
      <legend>{t('arbeidstid.felles.gruppe', { nr })}</legend>
      {gruppe.arsrammer.map((p, i) => (
        <div class={flere ? 'arsramme-plass' : undefined} key={i}>
          <Arsrammevelger
            etikett={flere ? t('arbeidstid.felles.arsrammeNr', { nr: i + 1 }) : t('arbeidstid.felles.arsramme')}
            plass={p}
            rader={rader}
            onEndring={(ny) => sett({ arsrammer: gruppe.arsrammer.map((x, j) => (j === i ? ny : x)) })}
          />
          {flere && (
            <button type="button" class="lenkeknapp" onClick={() => sett({ arsrammer: gruppe.arsrammer.filter((_, j) => j !== i) })}>
              {t('arbeidstid.felles.fjernArsramme', { nr: i + 1 })}
            </button>
          )}
        </div>
      ))}
      <p class="felt-hjelp">{t('arbeidstid.felles.blandetForklaring')}</p>
      <p>
        <button type="button" class="knapp knapp-sekundaer" onClick={() => sett({ arsrammer: [...gruppe.arsrammer, tomArsrammeplass()] })}>
          {t('arbeidstid.felles.leggTilArsramme')}
        </button>
      </p>
      {harStjerne(gruppe, rader) && (
        <Tallfelt etikett={t('arbeidstid.felles.elever')} hjelpetekst={t('arbeidstid.felles.eleverHjelp')} verdi={gruppe.elever} min={0} maks={100} onEndring={(v) => sett({ elever: v })} />
      )}
      <Valgknapper
        legend={t('arbeidstid.felles.undervisning')}
        navn="modus"
        verdi={gruppe.modus}
        valg={[
          { verdi: 'arstimer', tekst: periode ? t('arbeidstid.felles.modusTimerPeriode') : t('arbeidstid.felles.modusArstimer') },
          { verdi: 'okter', tekst: t('arbeidstid.felles.modusOkter') },
        ]}
        onEndring={(modus) => sett({ modus })}
      />
      {gruppe.modus === 'arstimer' ? (
        <Tallfelt
          etikett={periode ? t('arbeidstid.felles.timerIPerioden') : t('arbeidstid.felles.arstimer')}
          {...(periode ? {} : { hjelpetekst: t('arbeidstid.felles.arstimerHjelp') })}
          verdi={gruppe.arstimer}
          min={0}
          maks={2000}
          onEndring={(v) => sett({ arstimer: v })}
        />
      ) : (
        <>
          <Tallfelt etikett={t('arbeidstid.felles.okter')} verdi={gruppe.okter} min={0} maks={50} onEndring={(v) => sett({ okter: v })} />
          <Tallfelt etikett={t('arbeidstid.felles.minutter')} verdi={gruppe.minutter} min={1} maks={600} onEndring={(v) => sett({ minutter: v })} />
          <Tallfelt
            etikett={periode ? t('arbeidstid.felles.ukerPeriode') : t('arbeidstid.felles.uker')}
            {...(periode ? {} : { hjelpetekst: t('arbeidstid.felles.ukerHjelp', { uker: formaterTall(standardUker) }) })}
            verdi={gruppe.uker}
            min={0}
            maks={60}
            onEndring={(v) => sett({ uker: v })}
          />
        </>
      )}
      {kanFjernes && (
        <p>
          <button type="button" class="lenkeknapp" onClick={onFjern}>
            {t('arbeidstid.felles.fjernGruppe', { nr })}
          </button>
        </p>
      )}
    </fieldset>
  );
}

/** Liste av grupper med knapp for å legge til flere. */
export function Grupper({
  grupper,
  rader,
  periode,
  standardUker,
  onEndring,
}: {
  grupper: Gruppetilstand[];
  rader: readonly Arsrammerad[];
  periode: boolean;
  standardUker: number;
  onEndring: (g: Gruppetilstand[]) => void;
}) {
  const { t } = useTekst();
  return (
    <section aria-label={t('arbeidstid.felles.grupper')}>
      {grupper.map((g, i) => (
        <Gruppeskjema
          key={g.id}
          gruppe={g}
          nr={i + 1}
          rader={rader}
          periode={periode}
          standardUker={standardUker}
          kanFjernes={grupper.length > 1}
          onEndring={(ny) => onEndring(grupper.map((x) => (x.id === g.id ? ny : x)))}
          onFjern={() => onEndring(grupper.filter((x) => x.id !== g.id))}
        />
      ))}
      <p>
        <button type="button" class="knapp knapp-sekundaer" onClick={() => onEndring([...grupper, nyGruppe()])}>
          {t('arbeidstid.felles.leggTilGruppe')}
        </button>
      </p>
    </section>
  );
}
