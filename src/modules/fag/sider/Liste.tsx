// Søk og filter i fagene fra Grep. Søket og filteret står i adressen (#/fag?q=…&program=…), så tilbake-knappen
// og lenker gir samme utvalg. Adressen oppdateres uten ny navigasjon mens brukeren skriver.
// Som standard vises de vanlige fagene i tilbudene. Varianter, opplæring i bedrift og andre fagkoder slås på under
// «Vis også». Uten fritekst grupperes treffene etter fagtype, og store grupper etter læreplan (avgjørelse 031).
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { formaterDato, formaterTall, type Malform } from '../../../core/i18n/tekst.ts';
import type { SideProps } from '../../typer.ts';
import { type Fagroller, lastFagindeks, lastFagrelasjoner, lastFagroller } from '../data.ts';
import { etterLaereplan, type Fagklasse, fagklasser, gruppeRekkefolge, SKJULTE } from '../klasser.ts';
import { type Fagfilter, type Fagtreff, filterFraAdresse, filterTilAdresse, filtervalg, sokFag, tilbudForLikeNavn, tomtFilter, visteKlasser } from '../oppslag.ts';
import type { Fag, Fagindeks, Fagtype } from '../skjema.ts';
import { programgruppe } from '../tilbud/modell.ts';
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

/**
 * Linjen under fagnavnet i listen: «NOR1260 · Fellesfag · Vg1 · 113 årstimer». Har flere fag samme navn, står
 * tilbudet etter koden: «HEA2005 · Helsearbeiderfag · Felles programfag · Vg2 · 197 årstimer».
 */
export function fagUndertekst(t: T, kode: string, fag: Fag, tilbud: readonly string[] = []): string {
  const tilbudTekst = tilbud.length === 0 ? null : tilbud.length <= 2 ? tilbud.join(', ') : t('fag.flereTilbud', { tilbud: tilbud[0] ?? '', antall: tilbud.length - 1 });
  return [kode, tilbudTekst, fagtypeTekst(t, fag.type), fag.trinn.map((x) => trinnTekst(t, x)).join(', '), fag.timer !== null ? t('fag.arstimerKort', { timer: formaterTall(fag.timer) }) : null]
    .filter((x) => x)
    .join(' · ');
}

function Faglenke({ kode, fag, tilbud }: Fagtreff & { tilbud?: readonly string[] }) {
  const { t, malform } = useTekst();
  return (
    <a class="listelenke" href={`#/fag/${kode}`}>
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{fag.navn[malform]}</span>
        <span class="listelenke-under">{fagUndertekst(t, kode, fag, tilbud)}</span>
      </span>
      <Ikon navn="hoyre" class="ikon-liten" />
    </a>
  );
}

/** Fagene i en liste, 50 om gangen. */
function Fagliste({ treff }: { treff: readonly (Fagtreff & { tilbud?: readonly string[] })[] }) {
  const { t } = useTekst();
  const [antall, settAntall] = useState(PER_SIDE);
  return (
    <>
      <ul class="liste">
        {treff.slice(0, antall).map((tr) => (
          <li key={tr.kode}>
            <Faglenke {...tr} />
          </li>
        ))}
      </ul>
      {treff.length > antall && (
        <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => settAntall(antall + PER_SIDE)}>
          {t('fag.visFlere', { antall: formaterTall(treff.length - antall) })}
        </button>
      )}
    </>
  );
}

/** En gruppe med overskrift som åpner og lukker den. Innholdet tegnes først når gruppen er åpen. */
function Gruppe({ tittel, aapen: start, nivaa, children }: { tittel: string; aapen: boolean; nivaa: 2 | 3; children: () => preact.ComponentChildren }) {
  const [aapen, settAapen] = useState(start);
  const id = useId();
  const Overskrift = nivaa === 2 ? 'h2' : 'h3';
  return (
    <section class={`faggruppe faggruppe-${nivaa}`}>
      <Overskrift class="faggruppe-tittel">
        <button type="button" class="kortknapp" aria-expanded={aapen} aria-controls={id} onClick={() => settAapen(!aapen)}>
          <span class="kortknapp-tekst">{tittel}</span>
          <Ikon navn={aapen ? 'opp' : 'ned'} class="ikon-liten kortknapp-pil" />
        </button>
      </Overskrift>
      <div id={id} hidden={!aapen}>
        {aapen && children()}
      </div>
    </section>
  );
}

/** Grupper med mer enn så mange fag deles etter læreplan. */
const STOR_GRUPPE = 12;

/** Treffene gruppert etter fagtype, og store grupper etter læreplan (lukket til brukeren åpner dem). */
function Grupper({ treff, program, titler }: { treff: readonly (Fagtreff & { tilbud?: readonly string[] })[]; program: string; titler: Readonly<Record<string, string>> }) {
  const { t, malform } = useTekst();
  const rekkefolge = gruppeRekkefolge(program !== '' && programgruppe(program) === 'yrkesfaglig');
  const grupper = rekkefolge.map((type) => ({ type, treff: treff.filter((x) => x.fag.type === type) })).filter((g) => g.treff.length > 0);
  return (
    <div class="faggrupper">
      {grupper.map((g) => (
        <Gruppe key={g.type} nivaa={2} aapen tittel={t('fag.gruppe', { navn: t(`fag.gruppenavn.${g.type}` as `fag.gruppenavn.${Fagtype}`), antall: formaterTall(g.treff.length) })}>
          {() =>
            g.treff.length <= STOR_GRUPPE ? (
              <Fagliste treff={g.treff} />
            ) : (
              <ul class="liste">
                {etterLaereplan(g.treff, malform, titler).map((u) =>
                  u.treff.length === 1 && u.treff[0] ? (
                    <li key={u.treff[0].kode}>
                      <Faglenke {...u.treff[0]} />
                    </li>
                  ) : (
                    <li key={u.laereplan ?? u.tittel}>
                      <Gruppe nivaa={3} aapen={false} tittel={t('fag.gruppe', { navn: u.laereplan ? u.tittel : t('fag.utenLaereplan'), antall: formaterTall(u.treff.length) })}>
                        {() => <Fagliste treff={u.treff} />}
                      </Gruppe>
                    </li>
                  ),
                )}
              </ul>
            )
          }
        </Gruppe>
      ))}
    </div>
  );
}

/**
 * «Vis også»: hvilke grupper av fag søket viser. Lukket til brukeren åpner den. De vanlige fagene kan også tas bort,
 * så søket bare viser f.eks. variantene (eier 01.10.2026).
 */
function VisOgsaa({ filter, antall, skjult, sett }: { filter: Fagfilter; antall: Record<Fagklasse, number>; skjult: Record<Fagklasse, number>; sett: (f: Partial<Fagfilter>) => void }) {
  const { t } = useTekst();
  const [aapen, settAapen] = useState(false);
  const id = useId();
  const vis = visteKlasser(filter);
  const klasser: Fagklasse[] = ['vanlig', ...SKJULTE.filter((k) => vis.has(k) || antall[k] > 0)];
  if (klasser.length === 1 && vis.has('vanlig')) return null;
  const veksle = (k: Fagklasse) => {
    if (k === 'vanlig') return sett({ vanlige: vis.has('vanlig') ? 'nei' : '' });
    const ny = new Set(vis);
    if (ny.has(k)) ny.delete(k);
    else ny.add(k);
    sett({ vis: SKJULTE.filter((x) => ny.has(x)).join(',') });
  };
  const antallSkjult = SKJULTE.reduce((sum, k) => sum + skjult[k], 0) + skjult.vanlig;
  return (
    <div class="vis-ogsaa">
      <button type="button" class="kortknapp vis-ogsaa-knapp" aria-expanded={aapen} aria-controls={id} onClick={() => settAapen(!aapen)}>
        <span class="kortknapp-tekst">
          <strong>{t('fag.visOgsaa')}</strong>
          {antallSkjult > 0 && <span class="dempet liten blokk">{t('fag.skjulte', { antall: formaterTall(antallSkjult) })}</span>}
        </span>
        <Ikon navn={aapen ? 'opp' : 'ned'} class="ikon-liten kortknapp-pil" />
      </button>
      <fieldset id={id} hidden={!aapen}>
        <legend class="skjult-visuelt">{t('fag.visOgsaa')}</legend>
        {klasser.map((k) => (
          <label key={k} class="avkrysning">
            <input type="checkbox" checked={vis.has(k)} onChange={() => veksle(k)} data-klasse={k} />
            <span>
              {t(`fag.klasse.${k}`, { antall: formaterTall(antall[k]) })}
              <span class="dempet liten blokk">{t(`fag.klasseHjelp.${k}`)}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  );
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
  const [roller, settRoller] = useState<Fagroller | null>(null);
  const [feil, settFeil] = useState(false);
  const [filter, settFilter] = useState<Fagfilter>(() => filterFraAdresse(sporring));
  const antallAktive = Object.entries(filter).filter(([k, v]) => k !== 'tekst' && k !== 'vis' && k !== 'vanlige' && v !== '').length;
  const [visFilter, settVisFilter] = useState(antallAktive > 0);
  // Ny nøkkel for listen når filteret endres, så «vis flere» og åpne grupper begynner på nytt.
  const [utgave, settUtgave] = useState(0);

  // En lenke til et annet søk mens siden er åpen (f.eks. #/fag?q=KEF1001) gir nytt søk og filter.
  const adresse = sporring.toString();
  useEffect(() => {
    const ny = filterFraAdresse(new URLSearchParams(adresse));
    if (new URLSearchParams(filterTilAdresse(ny)).toString() !== new URLSearchParams(filterTilAdresse(filter)).toString()) {
      settFilter(ny);
      settUtgave((u) => u + 1);
    }
    // Bare når adressen endres utenfra. Når brukeren endrer filteret, er adressen og filteret like.
  }, [adresse]);

  useEffect(() => {
    lastFagindeks().then(settIndeks, () => settFeil(true));
    // Uten rollene vises alle fagene, som før (avgjørelse 031).
    lastFagroller().then(settRoller, () => undefined);
  }, []);

  const sett = (endring: Partial<Fagfilter>) => {
    const ny = { ...filter, ...endring };
    settFilter(ny);
    settUtgave((u) => u + 1);
    erstattAdresse('/fag', filterTilAdresse(ny));
  };

  const klasser = useMemo(() => (indeks && roller ? fagklasser(indeks, roller.roller) : undefined), [indeks, roller]);
  const tomt = { vanlig: 0, variant: 0, bedrift: 0, andre: 0 };
  const { treff, skjult, antall } = useMemo(() => (indeks ? sokFag(indeks, filter, klasser) : { treff: [], skjult: tomt, antall: tomt }), [indeks, filter, klasser]);
  const gruppert = filter.tekst.trim() === '' && treff.length > 0;
  // Fag med samme navn får tilbudet i linjen under navnet.
  const visteTreff = useMemo(() => {
    if (!indeks) return treff;
    const tilbud = tilbudForLikeNavn(treff, indeks, malform);
    return treff.map((x) => ({ ...x, tilbud: tilbud.get(x.kode) }));
  }, [treff, indeks, malform]);

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
              <button type="button" class="lenkeknapp liten" onClick={() => sett({ ...tomtFilter, tekst: filter.tekst, vis: filter.vis, vanlige: filter.vanlige })}>
                {t('fag.nullstill')}
              </button>
            )}
          </div>
          <div id={filterId} hidden={!visFilter}>
            <Filterfelt indeks={indeks} filter={filter} sett={sett} t={t} malform={malform} />
          </div>
          <Erstatning sok={filter.tekst} indeks={indeks} malform={malform} t={t} />
          <p role="status" class="dempet liten">
            {treff.length === 0 ? (visteKlasser(filter).size === 0 ? t('fag.ingenValgt') : skjult.variant + skjult.bedrift + skjult.andre + skjult.vanlig > 0 ? (visteKlasser(filter).has('vanlig') ? t('fag.ingenVanlige') : t('fag.ingenIValgte')) : t('fag.ingenTreff')) : treff.length === 1 ? t('fag.ettFag') : t('fag.antall', { antall: formaterTall(treff.length) })}
          </p>
          {klasser && <VisOgsaa filter={filter} antall={antall} skjult={skjult} sett={sett} />}
          {gruppert ? <Grupper key={utgave} treff={visteTreff} program={filter.program} titler={roller?.laereplaner ?? {}} /> : visteTreff.length > 0 && <Fagliste key={utgave} treff={visteTreff} />}
          <p class="dempet liten">{t('fag.hentet', { dato: formaterDato(indeks.hentet, malform) })}</p>
        </>
      )}
    </div>
  );
}
