// Søk og filter i fagene fra Grep. Søket og filteret står i adressen (#/fag?q=…&program=…), så tilbake-knappen
// og lenker gir samme utvalg. Adressen oppdateres uten ny navigasjon mens brukeren skriver.
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { formaterDato, formaterTall, type Malform } from '../../../core/i18n/tekst.ts';
import type { SideProps } from '../../typer.ts';
import { lastFagindeks, lastFagrelasjoner } from '../data.ts';
import { type Fagfilter, filterFraAdresse, filterTilAdresse, filtervalg, filtrerFag, tomtFilter } from '../oppslag.ts';
import type { Fag, Fagindeks } from '../skjema.ts';
import { fagtypeTekst, koTekst, programTekst, trinnTekst } from '../visning.ts';
import { gjeldendeKoder } from '../vigo/oppslag.ts';
import type { Fagrelasjoner } from '../vigo/skjema.ts';

/** Søket ser ut som én fagkode, f.eks. «psp5596». */
const FAGKODE = /^[A-Za-z]{3}[A-Za-z0-9]{2}\d{2}$/;

/**
 * Er søket en utgått fagkode, vises kodene som erstatter den (VIGO Kodeverksbase, avgjørelse 026). Dataene lastes
 * bare når søket ser ut som en fagkode som ikke finnes i fagindeksen.
 */
function Erstatning({ sok, indeks, malform, t }: { sok: string; indeks: Fagindeks; malform: Malform; t: T }) {
  const kode = sok.trim().toUpperCase();
  const aktuell = FAGKODE.test(kode) && !indeks.fag[kode];
  const [rel, settRel] = useState<Fagrelasjoner | null>(null);
  useEffect(() => {
    if (aktuell && !rel) lastFagrelasjoner().then(settRel, () => undefined);
  }, [aktuell, rel]);
  if (!aktuell || !rel) return null;
  const nye = gjeldendeKoder(kode, rel, (k) => indeks.fag[k] !== undefined).filter((k) => indeks.fag[k]);
  if (nye.length === 0) return null;
  return (
    <div class="merknad" data-erstatning={kode}>
      <p>{t('fag.erstattetSok', { kode })}</p>
      <ul>
        {nye.map((k) => (
          <li key={k}>
            <a href={`#/fag/${k}`}>
              {k} {indeks.fag[k]?.navn[malform]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PER_SIDE = 50;

function Valgfelt({ etikett, verdi, valg, onEndring }: { etikett: string; verdi: string; valg: { verdi: string; tekst: string }[]; onEndring: (v: string) => void }) {
  const { t } = useTekst();
  const id = useId();
  return (
    <div class="felt">
      <label for={id}>{etikett}</label>
      <select id={id} value={verdi} onChange={(e) => onEndring(e.currentTarget.value)}>
        <option value="">{t('fag.alle')}</option>
        {valg.map((v) => (
          <option key={v.verdi} value={v.verdi}>
            {v.tekst}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Linjen under fagnavnet i listen: «NOR1260 · Fellesfag · Vg1 · 113 årstimer». */
export function fagUndertekst(t: T, kode: string, fag: Fag): string {
  return [kode, fagtypeTekst(t, fag.type), fag.trinn.map((x) => trinnTekst(t, x)).join(', '), fag.timer !== null ? t('fag.arstimerKort', { timer: formaterTall(fag.timer) }) : null]
    .filter((x) => x)
    .join(' · ');
}

function Filterfelt({ indeks, filter, sett, t, malform }: { indeks: Fagindeks; filter: Fagfilter; sett: (f: Partial<Fagfilter>) => void; t: T; malform: Malform }) {
  const valg = useMemo(() => filtervalg(indeks), [indeks]);
  return (
    <div class="fagfilter-felt">
      <Valgfelt etikett={t('fag.felt.program')} verdi={filter.program} valg={valg.program.map((p) => ({ verdi: p, tekst: programTekst(indeks, p, malform) }))} onEndring={(program) => sett({ program })} />
      <Valgfelt etikett={t('fag.felt.trinn')} verdi={filter.trinn} valg={valg.trinn.map((x) => ({ verdi: x, tekst: trinnTekst(t, x) }))} onEndring={(trinn) => sett({ trinn: trinn as Fagfilter['trinn'] })} />
      <Valgfelt etikett={t('fag.felt.type')} verdi={filter.type} valg={valg.type.map((x) => ({ verdi: x, tekst: fagtypeTekst(t, x) }))} onEndring={(type) => sett({ type: type as Fagfilter['type'] })} />
      <Valgfelt etikett={t('fag.felt.vurdering')} verdi={filter.vurdering} valg={valg.vurdering.map((x) => ({ verdi: x, tekst: koTekst(t, indeks, 'vurdering', x) }))} onEndring={(vurdering) => sett({ vurdering })} />
      <Valgfelt etikett={t('fag.felt.eksamensform')} verdi={filter.eksamensform} valg={valg.eksamensform.map((x) => ({ verdi: x, tekst: koTekst(t, indeks, 'eksamensform', x) }))} onEndring={(eksamensform) => sett({ eksamensform })} />
      <Valgfelt etikett={t('fag.felt.timer')} verdi={filter.timer} valg={valg.timer.map((x) => ({ verdi: String(x), tekst: formaterTall(x) }))} onEndring={(timer) => sett({ timer })} />
    </div>
  );
}

export default function Liste({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const sokId = useId();
  const filterId = useId();
  const [indeks, settIndeks] = useState<Fagindeks | null>(null);
  const [feil, settFeil] = useState(false);
  const [filter, settFilter] = useState<Fagfilter>(() => filterFraAdresse(sporring));
  const antallAktive = Object.entries(filter).filter(([k, v]) => k !== 'tekst' && v !== '').length;
  const [visFilter, settVisFilter] = useState(antallAktive > 0);
  const [antall, settAntall] = useState(PER_SIDE);

  useEffect(() => {
    lastFagindeks().then(settIndeks, () => settFeil(true));
  }, []);

  const sett = (endring: Partial<Fagfilter>) => {
    const ny = { ...filter, ...endring };
    settFilter(ny);
    settAntall(PER_SIDE);
    erstattAdresse('/fag', filterTilAdresse(ny));
  };

  const treff = useMemo(() => (indeks ? filtrerFag(indeks, filter) : []), [indeks, filter]);

  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('fag.tittel')}</h1>
      <p class="dempet">{t('fag.innledning')}</p>
      {feil ? (
        <p role="alert">{t('fag.lasterFeil')}</p>
      ) : indeks === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <div class="felt">
            <label for={sokId}>{t('fag.sok')}</label>
            <div class="sokefelt">
              <Ikon navn="sok" class="sokefelt-ikon" />
              <input id={sokId} type="search" autoComplete="off" enterKeyHint="search" placeholder={t('fag.sokPlassholder')} value={filter.tekst} onInput={(e) => sett({ tekst: e.currentTarget.value })} />
            </div>
          </div>
          <div class="fagfilter">
            <button type="button" class="lenkeknapp" aria-expanded={visFilter} aria-controls={filterId} onClick={() => settVisFilter(!visFilter)}>
              <Ikon navn={visFilter ? 'opp' : 'ned'} class="ikon-liten" />
              {antallAktive > 0 ? t('fag.filterAktive', { antall: antallAktive }) : t('fag.filter')}
            </button>
            {antallAktive > 0 && (
              <button type="button" class="lenkeknapp liten" onClick={() => sett({ ...tomtFilter, tekst: filter.tekst })}>
                {t('fag.nullstill')}
              </button>
            )}
          </div>
          <div id={filterId} hidden={!visFilter}>
            <Filterfelt indeks={indeks} filter={filter} sett={sett} t={t} malform={malform} />
          </div>
          <Erstatning sok={filter.tekst} indeks={indeks} malform={malform} t={t} />
          <p role="status" class="dempet liten">
            {treff.length === 0 ? t('fag.ingenTreff') : treff.length === 1 ? t('fag.ettFag') : t('fag.antall', { antall: formaterTall(treff.length) })}
          </p>
          {treff.length > 0 && (
            <ul class="liste">
              {treff.slice(0, antall).map(({ kode, fag }) => (
                <li key={kode}>
                  <a class="listelenke" href={`#/fag/${kode}`}>
                    <span class="listelenke-tekst">
                      <span class="listelenke-tittel">{fag.navn[malform]}</span>
                      <span class="listelenke-under">{fagUndertekst(t, kode, fag)}</span>
                    </span>
                    <Ikon navn="hoyre" class="ikon-liten" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {treff.length > antall && (
            <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => settAntall(antall + PER_SIDE)}>
              {t('fag.visFlere', { antall: formaterTall(treff.length - antall) })}
            </button>
          )}
          <p class="dempet liten">{t('fag.hentet', { dato: formaterDato(indeks.hentet, malform) })}</p>
        </>
      )}
    </div>
  );
}
