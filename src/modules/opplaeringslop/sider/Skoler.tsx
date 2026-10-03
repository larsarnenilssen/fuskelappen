// Skoleregisteret: skolene i videregående og tilbudene de har, etter utdanning.no (avgjørelse 053). Søk og filter
// (fylke, utdanningsprogram, tilbud) står i adressen (#/opplaeringslop/skoler?fylke=46&tilbud=HSHEA2), så lenkene
// fra tilbudene gir et ferdig utvalg. Uten fylke i adressen brukes fylket brukeren har valgt.
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { fylker, fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterDato, formaterTall } from '../../../core/i18n/tekst.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { SideProps } from '../../typer.ts';
import { fullKode, kortKode, type Tilbudene } from '../data.ts';
import { filtrerSkoler, type Skoleoppforing } from '../skoler.ts';
import { Brodsmuler, DinSkole, Lasting, Tilbudslenke, tilbudsnavn, useSkoler, useTilbudsdata } from './felles.tsx';

const PER_SIDE = 30;
const TRINN = ['Vg1', 'Vg2', 'Vg3', 'Bedrift'];

interface Filter {
  fylke: string;
  program: string;
  tilbud: string;
  /** Skolenummeret, når siden viser én skole (lenken «Tilbudene ved …»). */
  skole: string;
  sok: string;
}

function filterTilAdresse(f: Filter): Record<string, string> {
  return Object.fromEntries(Object.entries({ fylke: f.fylke || 'alle', program: f.program, tilbud: f.tilbud ? kortKode(f.tilbud) : '', skole: f.skole, q: f.sok }).filter(([, v]) => v));
}

/**
 * Tilbudene ved skolen i ett utdanningsprogram som et løp, som i Opplæringsløp: hvert tilbud med tilbudene ved skolen
 * som bygger på det, under seg (eier 03.10.2026). `sett` hindrer at et tilbud står to ganger i samme gren.
 */
function Skolegren({ kode, ved, indeks, tilbud, sett }: { kode: string; ved: readonly string[]; indeks: Fagindeks; tilbud: Tilbudene; sett: ReadonlySet<string> }) {
  const neste = new Set([...sett, kode]);
  const videre = ved.filter((k) => !neste.has(k) && (tilbud.tilbud[k]?.fra ?? []).includes(kode));
  return (
    <li>
      <div class="lop-kort" data-sted={indeks.programomrader[kode]?.sted}>
        <Tilbudslenke indeks={indeks} kode={kode} merk={false} />
      </div>
      {videre.length > 0 && (
        <ul class="lop-videre">
          {videre.map((k) => (
            <Skolegren key={k} kode={k} ved={ved} indeks={indeks} tilbud={tilbud} sett={neste} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Tilbudene ved skolen, gruppert etter utdanningsprogram i samme rekkefølge som Opplæringsløp, hvert som et løp. */
function Skoletilbud({ skole, indeks, tilbud }: { skole: Skoleoppforing; indeks: Fagindeks; tilbud: Tilbudene }) {
  const { malform } = useTekst();
  const kjente = skole.tilbud.filter((k) => indeks.programomrader[k]);
  const sorter = (koder: string[]) =>
    koder.sort((a, b) => TRINN.indexOf(indeks.programomrader[a]?.trinn ?? '') - TRINN.indexOf(indeks.programomrader[b]?.trinn ?? '') || a.localeCompare(b));
  return (
    <>
      {tilbud.struktur.map((p) => {
        const ved = sorter(kjente.filter((k) => indeks.programomrader[k]?.program === p.program));
        if (ved.length === 0) return null;
        // Løpet starter fra tilbudene som ikke bygger på et annet tilbud ved skolen i programmet.
        const start = ved.filter((k) => !(tilbud.tilbud[k]?.fra ?? []).some((f) => ved.includes(f)));
        return (
          <section key={p.program} class="skoletilbud">
            <h3 class="liten-overskrift">{p.navn[malform]}</h3>
            <ul class="lop">
              {start.map((k) => (
                <Skolegren key={k} kode={k} ved={ved} indeks={indeks} tilbud={tilbud} sett={new Set()} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

/** Én skole: navnet og stedet, og tilbudene når den er åpnet. */
function Skolekort({ skole, indeks, tilbud, dinSkole, apen }: { skole: Skoleoppforing; indeks: Fagindeks; tilbud: Tilbudene; dinSkole: boolean; apen: boolean }) {
  const { t } = useTekst();
  const [vist, settVist] = useState(apen);
  const id = useId();
  const antall = skole.tilbud.filter((k) => indeks.programomrader[k]).length;
  const under = [skole.sted, fylkesnavn(skole.fylke), skole.privat ? t('opplaeringslop.skoler.privat') : null, t('opplaeringslop.skoler.antallTilbud', { antall: formaterTall(antall) })].filter(Boolean).join(' · ');
  return (
    <li class="skolekort" data-skole={skole.nr ?? undefined}>
      <button type="button" class="kortknapp skolekort-knapp" aria-expanded={vist} aria-controls={id} onClick={() => settVist(!vist)}>
        <span class="listelenke-tekst">
          <span class="listelenke-tittel">{skole.navn}</span>
          <span class="listelenke-under">
            {under}
            {dinSkole && <DinSkole />}
          </span>
        </span>
        <Ikon navn={vist ? 'opp' : 'ned'} class="ikon-liten kortknapp-pil" />
      </button>
      <div id={id} class="skolekort-innhold" hidden={!vist}>
        {vist && (antall === 0 ? <p class="dempet">{t('opplaeringslop.skoler.utenTilbud')}</p> : <Skoletilbud skole={skole} indeks={indeks} tilbud={tilbud} />)}
        {vist && skole.nettside && (
          <p>
            <a class="ekstern-lenke" href={skole.nettside} target="_blank" rel="noopener noreferrer">
              {t('opplaeringslop.skoler.nettside')}
              <Ikon navn="ekstern" class="ikon-liten" />
            </a>
          </p>
        )}
      </div>
    </li>
  );
}

export default function Skoler({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [data, provIgjen] = useTilbudsdata();
  const register = useSkoler();
  const sokId = useId();
  const fylkeId = useId();
  const programId = useId();
  const [filter, settFilter] = useState<Filter>(() => {
    const f = sporring.get('fylke');
    return {
      fylke: f === 'alle' ? '' : (f ?? (fylkesnavn(innstillinger.fylke) ? (innstillinger.fylke ?? '') : '')),
      program: (sporring.get('program') ?? '').toUpperCase(),
      tilbud: sporring.get('tilbud') ? fullKode(sporring.get('tilbud') ?? '') : '',
      skole: sporring.get('skole') ?? '',
      sok: sporring.get('q') ?? '',
    };
  });
  const [antall, settAntall] = useState(PER_SIDE);
  useEffect(() => erstattAdresse('/opplaeringslop/skoler', filterTilAdresse(filter)), []);
  const sett = (endring: Partial<Filter>) => {
    const ny = { ...filter, ...endring };
    settFilter(ny);
    settAntall(PER_SIDE);
    erstattAdresse('/opplaeringslop/skoler', filterTilAdresse(ny));
  };
  const minSkole = innstillinger.skole?.id ?? null;
  const { treff, iLandet } = useMemo(() => {
    if (!register || typeof data === 'string') return { treff: [], iLandet: 0 };
    const alle = filtrerSkoler(register.skoler, { fylke: null, tilbud: filter.tilbud || null, sok: filter.sok }).filter(
      (s) => (!filter.skole || s.nr === filter.skole) && (!filter.program || s.tilbud.some((k) => data.indeks.programomrader[k]?.program === filter.program)),
    );
    const ut = alle.filter((s) => !filter.fylke || s.fylke === filter.fylke);
    // Skolen brukeren har valgt, står først.
    return { treff: [...ut.filter((s) => s.orgnr === minSkole), ...ut.filter((s) => s.orgnr !== minSkole)], iLandet: alle.length };
  }, [register, data, filter, minSkole]);

  return (
    <div class="side skoleregister">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <h1 tabIndex={-1}>{t('opplaeringslop.skoler.tittel')}</h1>
      <p class="dempet">{t('opplaeringslop.skoler.innledning')}</p>
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : !register ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <div class="felt">
            <label for={sokId}>{t('opplaeringslop.skoler.sok')}</label>
            <div class="sokefelt">
              <Ikon navn="sok" class="sokefelt-ikon" />
              <input id={sokId} type="search" autoComplete="off" enterKeyHint="search" value={filter.sok} onInput={(e) => sett({ sok: e.currentTarget.value })} />
            </div>
          </div>
          <div class="skolefilter">
            <div class="felt">
              <label for={fylkeId}>{t('opplaeringslop.skoler.fylke')}</label>
              <select id={fylkeId} value={filter.fylke} onChange={(e) => sett({ fylke: e.currentTarget.value })}>
                <option value="">{t('opplaeringslop.skoler.alleFylker')}</option>
                {fylker.map((f) => (
                  <option key={f.nummer} value={f.nummer}>
                    {f.navn}
                  </option>
                ))}
              </select>
            </div>
            <div class="felt">
              <label for={programId}>{t('opplaeringslop.skoler.program')}</label>
              <select id={programId} value={filter.program} onChange={(e) => sett({ program: e.currentTarget.value })}>
                <option value="">{t('opplaeringslop.skoler.alleProgram')}</option>
                {data.tilbud.struktur.map((p) => (
                  <option key={p.program} value={p.program}>
                    {p.navn[malform]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {filter.skole && (
            <p class="skolefilter-tilbud">
              <span class="merke merke-skole">{register.skoler.find((x) => x.nr === filter.skole)?.navn ?? filter.skole}</span>{' '}
              <button type="button" class="lenkeknapp liten" onClick={() => sett({ skole: '' })}>
                {t('opplaeringslop.skoler.fjernTilbud')}
              </button>
            </p>
          )}
          {filter.tilbud && (
            <p class="skolefilter-tilbud">
              <span class="merke merke-skole">{t('opplaeringslop.skoler.tilbud', { tilbud: tilbudsnavn(t, data.indeks, filter.tilbud, malform) })}</span>{' '}
              <button type="button" class="lenkeknapp liten" onClick={() => sett({ tilbud: '' })}>
                {t('opplaeringslop.skoler.fjernTilbud')}
              </button>
            </p>
          )}
          <p role="status" class="dempet liten kontor-status">
            <span>{treff.length === 0 ? t('opplaeringslop.skoler.ingen') : treff.length === 1 ? t('opplaeringslop.skoler.en') : t('opplaeringslop.skoler.antall', { antall: formaterTall(treff.length) })}</span>
            {filter.fylke && iLandet > treff.length && (
              <button type="button" class="lenkeknapp" onClick={() => sett({ fylke: '' })}>
                {t('opplaeringslop.skoler.heleLandet', { antall: formaterTall(iLandet) })}
              </button>
            )}
          </p>
          <ul class="skoleliste">
            {treff.slice(0, antall).map((s) => (
              <Skolekort key={`${s.nr ?? s.navn}-${filter.tilbud}`} skole={s} indeks={data.indeks} tilbud={data.tilbud} dinSkole={!!minSkole && s.orgnr === minSkole} apen={treff.length === 1} />
            ))}
          </ul>
          {treff.length > antall && (
            <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => settAntall(antall + PER_SIDE)}>
              {t('opplaeringslop.skoler.visFlere')}
            </button>
          )}
          {register.hentet && <p class="dempet liten">{t('opplaeringslop.skoler.hentet', { dato: formaterDato(register.hentet, malform) })}</p>}
        </>
      )}
      <Kildeliste kilder={[{ id: 'utdanning-no', punkt: 'Skoler' }, { id: 'vigo-kodeverk', punkt: 'Skolenummer' }]} />
    </div>
  );
}
