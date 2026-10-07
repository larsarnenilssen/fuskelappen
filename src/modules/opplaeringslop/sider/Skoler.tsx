// Skoleregisteret: skolene i videregående og tilbudene de har, etter utdanning.no (avgjørelse 053). Søk og filter
// (fylke, utdanningsprogram, tilbud) står i adressen (#/opplaeringslop/skoler?fylke=46&tilbud=HSHEA2), så lenkene
// fra tilbudene gir et ferdig utvalg. Uten fylke i adressen brukes fylket brukeren har valgt.
import { dokumentRute, lastOversikt } from '../../lov/data.ts';
import type { Lokaltype } from '../../lov/typer.ts';
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { fylker, fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { skolefavoritt } from '../favoritter.ts';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterDato, formaterTall } from '../../../core/i18n/tekst.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { SideProps } from '../../typer.ts';
import { fullKode, kortKode, type Tilbudene } from '../data.ts';
import { filtrerSkoler, lopetTil, type Skoleoppforing } from '../skoler.ts';
import { sokTilbud } from '../sok.ts';
import { Brodsmuler, DinSkole, Lasting, Tilbudslenke, tilbudsnavn, useSkoler, useTilbudsdata } from './felles.tsx';
import { SkolenITall, useStatistikk } from '../../statistikk/komponenter.tsx';
import type { Statistikk } from '../../../core/statistikk/skjema.ts';

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
function Skolegren({ kode, ved, indeks, tilbud, sett, valgt }: { kode: string; ved: readonly string[]; indeks: Fagindeks; tilbud: Tilbudene; sett: ReadonlySet<string>; valgt: string }) {
  const neste = new Set([...sett, kode]);
  const videre = ved.filter((k) => !neste.has(k) && (tilbud.tilbud[k]?.fra ?? []).includes(kode));
  return (
    <li>
      <div class="lop-kort" data-sted={indeks.programomrader[kode]?.sted} data-valgt={kode === valgt ? 'ja' : undefined}>
        <Tilbudslenke indeks={indeks} kode={kode} merk={false} />
      </div>
      {videre.length > 0 && (
        <ul class="lop-videre">
          {videre.map((k) => (
            <Skolegren key={k} kode={k} ved={ved} indeks={indeks} tilbud={tilbud} sett={neste} valgt={valgt} />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Tilbudene ved skolen som vises når skolen åpnes: med et tilbud i filteret bare løpet til det tilbudet, ellers med et
 * utdanningsprogram i filteret bare det programmet (eier 03.10.2026). Tilbudet gjelder foran programmet.
 */
function utvalgVedSkolen(vedSkolen: readonly string[], indeks: Fagindeks, tilbud: Tilbudene, valgt: string, program: string): readonly string[] {
  if (valgt && vedSkolen.includes(valgt)) return lopetTil(valgt, vedSkolen, indeks, tilbud);
  if (program) {
    const iProgram = vedSkolen.filter((k) => indeks.programomrader[k]?.program === program);
    if (iProgram.length > 0) return iProgram;
  }
  return vedSkolen;
}

/**
 * Tilbudene ved skolen, gruppert etter utdanningsprogram i samme rekkefølge som Opplæringsløp, hvert som et løp.
 * `koder` er tilbudene som vises; tilbudet i `valgt` er merket.
 */
function Skoletilbud({ koder, indeks, tilbud, valgt }: { koder: readonly string[]; indeks: Fagindeks; tilbud: Tilbudene; valgt: string }) {
  const { malform } = useTekst();
  const kjente = [...koder];
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
                <Skolegren key={k} kode={k} ved={ved} indeks={indeks} tilbud={tilbud} sett={new Set()} valgt={valgt} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

/** Én skole: navnet og stedet, og tilbudene når den er åpnet. */
function Skolekort({
  skole,
  indeks,
  tilbud,
  dinSkole,
  apen,
  valgt,
  program,
  regler,
  statistikk,
}: {
  skole: Skoleoppforing;
  indeks: Fagindeks;
  tilbud: Tilbudene;
  dinSkole: boolean;
  apen: boolean;
  valgt: string;
  program: string;
  /** Skolens egne regler fra Lovdata (avgjørelse 061). */
  regler: readonly Skoleregel[];
  /** Nøkkeltallene fra Udirs statistikkbank (avgjørelse 080), når de er lastet. */
  statistikk: Statistikk | null;
}) {
  const { t, malform } = useTekst();
  const [vist, settVist] = useState(apen);
  const [alle, settAlle] = useState(false);
  const id = useId();
  // Korte navn, så knappen får plass på én linje på mobil. Flere av samme type får nummer.
  const regelnavn = (r: Skoleregel) => {
    const type = r.lokaltype === 'fagfordeling' ? 'fagfordeling' : 'skoleregler';
    const like = regler.filter((x) => (x.lokaltype === 'fagfordeling' ? 'fagfordeling' : 'skoleregler') === type);
    const navn = t(`opplaeringslop.skoler.${type === 'fagfordeling' ? 'fagfordelingKort' : 'skolereglerKort'}`);
    return like.length > 1 ? `${navn} ${like.indexOf(r) + 1}` : navn;
  };
  const vedSkolen = skole.tilbud.filter((k) => indeks.programomrader[k]);
  const antall = vedSkolen.length;
  // Knappen for alle tilbudene trengs bare når utvalget etter filteret er en del av dem.
  const utvalg = utvalgVedSkolen(vedSkolen, indeks, tilbud, valgt, program);
  const delvis = utvalg.length < antall;
  const bareTekst =
    valgt && vedSkolen.includes(valgt)
      ? t('opplaeringslop.skoler.bareLopet', { tilbud: tilbudsnavn(t, indeks, valgt, malform) })
      : t('opplaeringslop.skoler.bareProgram', { program: tilbud.struktur.find((p) => p.program === program)?.navn[malform] ?? program });
  const under = [skole.sted, fylkesnavn(skole.fylke), skole.privat ? t('opplaeringslop.skoler.privat') : null, t('opplaeringslop.skoler.antallTilbud', { antall: formaterTall(antall) })].filter(Boolean).join(' · ');
  return (
    <li class={vist ? 'skolekort apen' : 'skolekort'} data-skole={skole.nr ?? undefined}>
      <div class="skolekort-hode">
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
        {/* Skoler uten skolenummer har ingen adresse å lenke til, og kan ikke favorittmerkes. */}
        {skole.nr && <FavorittKnapp id={skolefavoritt(skole.nr)} navn={skole.navn} liten />}
      </div>
      <div id={id} class="skolekort-innhold" hidden={!vist}>
        {/* Nettsiden og skolens egne regler som knapper øverst, og en strek før tilbudene (eier 05.10.2026). */}
        {/* Skolen i tall øverst i kortet (skisse til eier 07.10.2026, avgjørelse 080). */}
        {vist && statistikk && skole.orgnr && <SkolenITall orgnr={skole.orgnr} d={statistikk} />}
        {vist && (skole.nettside || regler.length > 0) && (
          <>
            <p class="skolekort-snarveier">
              {skole.nettside && (
                <a class="knapp knapp-sekundaer knapp-liten" href={skole.nettside} target="_blank" rel="noopener noreferrer">
                  {t('opplaeringslop.skoler.nettsideKort')}
                  <Ikon navn="ekstern" class="ikon-liten" />
                </a>
              )}
              {regler.map((r) => (
                <a key={r.id} class="knapp knapp-sekundaer knapp-liten" href={`#${dokumentRute(r.id)}`}>
                  {/* Tegnet i samme skrift som teksten står på grunnlinjen. Ikonet ble smalt og skjevt (eier 05.10.2026). */}
                  <span class="skolekort-paragraf" aria-hidden="true">
                    §
                  </span>
                  {regelnavn(r)}
                </a>
              ))}
            </p>
            <p class="skolekort-skille">{t('opplaeringslop.skoler.tilbudVedSkolen', { antall: formaterTall(antall) })}</p>
          </>
        )}
        {vist && delvis && (
          <p class="skolekort-alle">
            <button type="button" class="lenkeknapp liten" onClick={() => settAlle(!alle)}>
              {alle ? bareTekst : t('opplaeringslop.skoler.alleVedSkolen', { antall: formaterTall(antall) })}
            </button>
          </p>
        )}
        {vist && (antall === 0 ? <p class="dempet">{t('opplaeringslop.skoler.utenTilbud')}</p> : <Skoletilbud koder={alle ? vedSkolen : utvalg} indeks={indeks} tilbud={tilbud} valgt={valgt} />)}
      </div>
    </li>
  );
}

const MAKS_TILBUD = 8;

/**
 * Søk etter et tilbud, så oppslaget viser skolene som har det (eier 03.10.2026). Treffene er knapper; det valgte
 * tilbudet står som filter over listen.
 */
function TilbudSok({ id, sok, settSok, treff, indeks, velg }: { id: string; sok: string; settSok: (s: string) => void; treff: string[]; indeks: Fagindeks; velg: (k: string) => void }) {
  const { t, malform } = useTekst();
  const aktivt = sok.trim().length >= 2;
  return (
    <div class="felt tilbudsok">
      <label for={id}>{t('opplaeringslop.skoler.tilbudSok')}</label>
      <div class="sokefelt">
        <Ikon navn="sok" class="sokefelt-ikon" />
        <input id={id} type="search" autoComplete="off" enterKeyHint="search" placeholder={t('opplaeringslop.skoler.tilbudPlassholder')} value={sok} onInput={(e) => settSok(e.currentTarget.value)} />
      </div>
      {aktivt && (
        <>
          <p class="liten dempet" role="status">
            {treff.length === 0 ? t('opplaeringslop.skoler.tilbudIngen') : t('opplaeringslop.oversikt.antallTreff', { antall: formaterTall(treff.length) })}
          </p>
          {treff.length > 0 && (
            <ul class="liste tilbudsok-treff">
              {treff.slice(0, MAKS_TILBUD).map((k) => (
                <li key={k}>
                  <button type="button" class="listelenke tilbudsok-valg" onClick={() => velg(k)}>
                    <span class="listelenke-tekst">
                      <span class="listelenke-tittel">{tilbudsnavn(t, indeks, k, malform)}</span>
                      <span class="listelenke-under">{kortKode(k)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {treff.length > MAKS_TILBUD && <p class="liten dempet">{t('opplaeringslop.tilbud.opphenting.flere', { antall: formaterTall(treff.length - MAKS_TILBUD) })}</p>}
        </>
      )}
    </div>
  );
}

/** En lokal forskrift som gjelder skolen: skolens egne regler eller fag- og timefordeling (avgjørelse 061). */
interface Skoleregel {
  id: string;
  lokaltype?: Lokaltype;
}

/** Skolenes egne regler fra Lovdata per organisasjonsnummer (avgjørelse 061). */
function useSkoleregler(): Map<string, Skoleregel[]> {
  const [regler, settRegler] = useState(new Map<string, Skoleregel[]>());
  useEffect(() => {
    lastOversikt().then((o) => {
      const m = new Map<string, Skoleregel[]>();
      for (const d of o.dokumenter) {
        if (d.gyldighet.niva !== 'skole') continue;
        for (const s of d.gyldighet.skoler) m.set(s, [...(m.get(s) ?? []), { id: d.id, ...(d.lokaltype ? { lokaltype: d.lokaltype } : {}) }]);
      }
      settRegler(m);
    }, () => undefined);
  }, []);
  return regler;
}

export default function Skoler({ sporring }: SideProps) {
  const skoleregler = useSkoleregler();
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const statistikk = useStatistikk();
  const [data, provIgjen] = useTilbudsdata();
  const register = useSkoler();
  const sokId = useId();
  const fylkeId = useId();
  const programId = useId();
  const tilbudId = useId();
  const [tilbudSok, settTilbudSok] = useState('');
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
  // Tilbudssøket foreslår bare tilbud som minst én skole har.
  const tilbudVedSkoler = useMemo(() => new Set(register?.skoler.flatMap((s) => s.tilbud) ?? []), [register]);
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
      <Sidetopp tittel={t('opplaeringslop.skoler.tittel')} favoritt="opplaeringslop:skoler" />
      <p class="dempet">
        <Begrepstekst tekst={t('opplaeringslop.skoler.innledning')} />
      </p>
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
          <TilbudSok
            id={tilbudId}
            sok={tilbudSok}
            settSok={settTilbudSok}
            treff={tilbudSok.trim().length >= 2 ? sokTilbud(data.indeks, tilbudSok, malform).filter((k) => tilbudVedSkoler.has(k)) : []}
            indeks={data.indeks}
            velg={(k) => {
              settTilbudSok('');
              sett({ tilbud: k, skole: '' });
            }}
          />
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
              <Skolekort
                key={`${s.nr ?? s.navn}-${filter.tilbud}-${filter.program}`}
                skole={s}
                indeks={data.indeks}
                tilbud={data.tilbud}
                dinSkole={!!minSkole && s.orgnr === minSkole}
                apen={treff.length === 1}
                valgt={filter.tilbud}
                program={filter.program}
                regler={s.orgnr ? (skoleregler.get(s.orgnr) ?? []) : []}
                statistikk={statistikk === 'feil' ? null : statistikk}
              />
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
