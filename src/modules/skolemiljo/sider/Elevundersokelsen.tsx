// Elevundersøkelsen (fase 7, eier 06.10.2026, avgjørelse 077): mobbing og læringsmiljøet for opptil tre serier side om
// side (en skole, et fylke eller hele landet, for alle, offentlige eller private skoler), for et trinn, med året før.
// Fra start står skolen og fylket brukeren har valgt, og hele landet (privatskolene i landet med «Privatskole» valgt).
// Valgene står i adressen (?s=S974557584,F46,L&trinn=1&vis=tabell), så siden kan deles og tilbake virker.
//
// Formen (dataviz-metoden): nøkkeltall for «Mobbing på skolen», liggende stolper fra null for mobbing (andel i
// prosent) og punkter på én akse fra 1 til 5 for indeksene. Hver serie har sin farge og sin form (sirkel, firkant,
// rute), så fargen aldri står alene, og tallene står som tekst ved siden av. Året før er en strek (mobbing) eller en
// ring (indeksene). Skjermede tall vises som «Skjermet», aldri som et tall. Tabellen viser alle tallene.
//
// Runde 5 (eier 06.10.2026): «Kort om» skolen (ellers fylket) øverst, med mobbing og de tre sterkeste og svakeste
// indeksene mot landet. Delene har overskrifter som kan lukkes, og boksene under «Mobbing» er lukket fra start. På
// skrivebord står mobbingen og «Om tallene» til venstre og læringsmiljøet til høyre. Bedre og svakere enn året før er
// grønt og rødt, med pil og tekst, så fargen aldri står alene.
import { useEffect, useId, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { fylker as alleFylker, fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { type T, usePrivatskole, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Bryter } from '../../../components/Bryter.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { useHusketApen } from '../../../components/husket.ts';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Seksjon } from '../../../components/Seksjon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { lastElevundersokelsen } from '../../../data/elevundersokelsen.ts';
import type { Eierform, Elevundersokelsen as Data, Verdi } from '../elevundersokelsen/skjema.ts';
import {
  antall,
  egenSerie,
  endring,
  type Fakta,
  MAKS_SERIER,
  mobbeskala,
  retning,
  type Serie,
  serieFra,
  serieTekst,
  skolerIFylket,
  standardSerier,
  standardTrinn,
  sterkestOgSvakest,
  verdi,
} from '../elevundersokelsen/visning.ts';
import { elevundersokelsenRute } from '../innhold.ts';

const UDIR_SKJERMING = 'https://www.udir.no/tall-og-forskning/brukerundersokelser/elevundersokelsen/visning-av-resultater-og-skjermingsregler/';
const UDIR_STATISTIKK = 'https://www.udir.no/tall-og-forskning/brukerundersokelser/elevundersokelsen/resultater/offentlige-resultater-vgs/';
const FORMER = ['sirkel', 'firkant', 'rute'] as const;

/** «4,2», «5,5 %». */
const tallTekst = (v: number) => formaterTall(v, 1, 1);

/** Navnet på serien: skolen, «Vestland, private skoler» eller «Hele landet». */
function seriensNavn(d: Data, s: Serie, t: T): string {
  // Alle eierformer står uten tillegg: «Hele landet», ikke «Hele landet, alle skoler».
  const eier = s.eierform === 'a' ? '' : `, ${t(`skolemiljo.elevundersokelsen.eierformKort.${s.eierform}` as Tekstnokkel)}`;
  if (s.enhet === 'L') return `${t('skolemiljo.elevundersokelsen.landet')}${eier}`;
  if (s.enhet.startsWith('F')) return `${fylkesnavn(s.enhet.slice(1)) ?? d.enheter[s.enhet]?.navn ?? s.enhet}${eier}`;
  return d.enheter[s.enhet]?.navn ?? s.enhet;
}

/** Merket til serien: farge og form, så fargen aldri står alene. */
function Merke({ nr, hul = false }: { nr: number; hul?: boolean }) {
  return <span class={`eu-merke eu-merke-${FORMER[nr]}${hul ? ' eu-merke-hul' : ''}`} data-serie={nr + 1} aria-hidden="true" />;
}

/** Ett valg for en serie: hele landet, et fylke eller en skole, og eierformen for landet og fylkene. */
function Seriesvalg({ d, nr, serie, onEndring }: { d: Data; nr: number; serie: Serie | null; onEndring: (s: Serie | null) => void }) {
  const { t } = useTekst();
  const id = useId();
  const eierformer: Eierform[] = ['a', 'o', 'p'];
  return (
    <div class="eu-seriesvalg">
      <label for={id} class="eu-seriesvalg-etikett">
        <Merke nr={nr} />
        {t('skolemiljo.elevundersokelsen.serie', { nr: String(nr + 1) })}
      </label>
      <select id={id} value={serie ? serieTekst(serie) : ''} onChange={(e) => onEndring(serieFra(e.currentTarget.value))}>
        {nr > 0 && <option value="">{t('skolemiljo.elevundersokelsen.ingen')}</option>}
        <optgroup label={t('skolemiljo.elevundersokelsen.landet')}>
          {eierformer.map((e) => (
            <option key={e} value={serieTekst({ enhet: 'L', eierform: e })}>
              {seriensNavn(d, { enhet: 'L', eierform: e }, t)}
            </option>
          ))}
        </optgroup>
        <optgroup label={t('skolemiljo.elevundersokelsen.fylker')}>
          {alleFylker
            .filter((f) => d.enheter[`F${f.nummer}`])
            .flatMap((f) =>
              eierformer.map((e) => (
                <option key={`${f.nummer}${e}`} value={serieTekst({ enhet: `F${f.nummer}`, eierform: e })}>
                  {seriensNavn(d, { enhet: `F${f.nummer}`, eierform: e }, t)}
                </option>
              )),
            )}
        </optgroup>
        {alleFylker.map((f) => {
          const skoler = skolerIFylket(d, f.nummer);
          return skoler.length === 0 ? null : (
            <optgroup key={f.nummer} label={t('skolemiljo.elevundersokelsen.skolerI', { fylke: f.navn })}>
              {skoler.map((s) => (
                <option key={s.enhet} value={s.enhet}>
                  {s.navn}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}

/** Teksten for en verdi: tallet, «Skjermet» eller «Ingen tall». */
function Verditekst({ v, prosent = false }: { v: Verdi; prosent?: boolean }) {
  const { t } = useTekst();
  if (v === '*') return <span class="eu-skjermet" title={t('skolemiljo.elevundersokelsen.skjermetTekst')}>{t('skolemiljo.elevundersokelsen.skjermet')}</span>;
  if (v === null) return <span class="eu-ingen" title={t('skolemiljo.elevundersokelsen.ingenTallTekst')}>{t('skolemiljo.elevundersokelsen.ingenTall')}</span>;
  return <span class="tall">{prosent ? t('skolemiljo.elevundersokelsen.prosent', { verdi: tallTekst(v) }) : tallTekst(v)}</span>;
}

/** Pil opp eller ned, grønn for bedre og rød for svakere, med teksten for skjermlesere. Ingen pil uten endring. */
function Pil({ r, tekst }: { r: 'bedre' | 'svakere' | null; tekst: string }) {
  if (!r) return null;
  return (
    <span class={`eu-pil eu-${r}`}>
      <span aria-hidden="true">{r === 'bedre' ? '▲' : '▼'}</span>
      <span class="skjult-visuelt"> {tekst}</span>
    </span>
  );
}

/** «▲ +0,4 fra året før» eller «som året før». Bedre er grønt og svakere rødt; for mobbing er nedgang bedre. */
function Endring({ naa, foer, type, kort = false }: { naa: Verdi; foer: Verdi; type: 'mobbing' | 'indeks'; kort?: boolean }) {
  const { t } = useTekst();
  const e = endring(naa, foer);
  if (e === null) return null;
  if (e === 0) return <span class="eu-endring">{t('skolemiljo.elevundersokelsen.uendret')}</span>;
  const r = retning(type, e);
  // Kort under stolpene: bare pilen og tallet («▲ −0,6»). Pilen har teksten for skjermlesere.
  if (kort) {
    return (
      <span class={`eu-endring eu-${r ?? 'lik'}`}>
        <Pil r={r} tekst={t(r === 'bedre' ? 'skolemiljo.elevundersokelsen.bedreFjor' : 'skolemiljo.elevundersokelsen.svakereFjor')} /> {`${e > 0 ? '+' : '−'}${tallTekst(Math.abs(e))}`}
      </span>
    );
  }
  // Endringen i en andel er prosentpoeng, ikke prosent.
  const verdiTekst = type === 'mobbing' ? t('skolemiljo.elevundersokelsen.prosentpoeng', { verdi: tallTekst(Math.abs(e)) }) : tallTekst(Math.abs(e));
  return (
    <span class={`eu-endring eu-${r ?? 'lik'}`}>
      <Pil r={r} tekst={t(r === 'bedre' ? 'skolemiljo.elevundersokelsen.bedreFjor' : 'skolemiljo.elevundersokelsen.svakereFjor')} />{' '}
      {t('skolemiljo.elevundersokelsen.endring', { tegn: e > 0 ? '+' : '−', verdi: verdiTekst })}
    </span>
  );
}

/** Forskjellen mot det serien sammenlignes med: «▲ +0,2», grønn når den er bedre, rød når den er svakere. */
function Forskjell({ forskjell, type, mot }: { forskjell: number; type: 'mobbing' | 'indeks'; mot: string }) {
  const { t } = useTekst();
  const r = retning(type, forskjell);
  const tall = `${forskjell > 0 ? '+' : forskjell < 0 ? '−' : '±'}${tallTekst(Math.abs(forskjell))}`;
  return (
    <span class={`eu-forskjell eu-${r ?? 'lik'}`}>
      <Pil r={r} tekst={t(r === 'bedre' ? 'skolemiljo.elevundersokelsen.bedreEnn' : 'skolemiljo.elevundersokelsen.svakereEnn', { mot })} />{' '}
      {type === 'mobbing' ? t('skolemiljo.elevundersokelsen.prosentpoeng', { verdi: tall }) : tall}
    </span>
  );
}

const nokkelFor = (s: Serie) => `${s.enhet}|${s.eierform}`;

/**
 * Én boks under «Mobbing»: tittelen og tallene for seriene står i knappen, og stolpene vises når boksen åpnes. Boksene
 * er lukket fra start (eier 06.10.2026) og husker om de er åpne (avgjørelse 072).
 */
function Mobbeboks({ d, serier, trinn, kode, maks }: { d: Data; serier: readonly Serie[]; trinn: number; kode: string; maks: number }) {
  const { t } = useTekst();
  const [apen, settApen] = useHusketApen(`eu-mobbing:${kode}`, false);
  const id = useId();
  const naa = d.skolear.length - 1;
  const pst = (v: number) => `${(v / maks) * 100}%`;
  return (
    <div class="eu-figur eu-mobbeboks">
      <h3 class="eu-boks-overskrift">
        <button type="button" class="eu-boks-knapp" aria-expanded={apen} aria-controls={id} onClick={() => settApen(!apen)}>
          <span class="eu-figur-tittel">{kortnavn(d, kode, t)}</span>
          <span class="eu-sammendrag">
            {serier.map((s, i) => (
              <span key={nokkelFor(s)} class="eu-sammendrag-verdi">
                <Merke nr={i} />
                <span class="skjult-visuelt">{seriensNavn(d, s, t)}: </span>
                <Verditekst v={verdi(d, s, kode, naa, trinn)} prosent />
              </span>
            ))}
          </span>
          <Ikon navn={apen ? 'opp' : 'ned'} class="ikon-liten eu-boks-pil" />
        </button>
      </h3>
      <ul id={id} class="eu-stolper" hidden={!apen}>
        {serier.map((s, i) => {
          const v = verdi(d, s, kode, naa, trinn);
          const f = verdi(d, s, kode, naa - 1, trinn);
          return (
            <li key={nokkelFor(s)} class="eu-stolperad">
              <span class="eu-stolpe-navn">
                <Merke nr={i} />
                <span class="eu-stolpe-navn-tekst">{seriensNavn(d, s, t)}</span>
              </span>
              <span class="eu-spor" aria-hidden="true" title={`${seriensNavn(d, s, t)}: ${typeof v === 'number' ? tallTekst(v) : ''}`}>
                {typeof v === 'number' && <span class="eu-stolpe" data-serie={i + 1} style={{ width: pst(v) }} />}
                {typeof f === 'number' && <span class="eu-fjor" style={{ left: pst(f) }} />}
              </span>
              <span class="eu-stolpe-tall">
                <Verditekst v={v} prosent />
                {typeof f === 'number' && <span class="eu-fjor-tekst">{t('skolemiljo.elevundersokelsen.iFjor', { verdi: tallTekst(f) })}</span>}
                <Endring naa={v} foer={f} type="mobbing" kort />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Mobbing: en boks per spørsmål med tallene i overskriften og liggende stolper fra null når den åpnes. */
function Mobbing({ d, serier, trinn, koder }: { d: Data; serier: readonly Serie[]; trinn: number; koder: readonly string[] }) {
  const { t } = useTekst();
  const maks = mobbeskala(d, serier, koder, trinn);
  return (
    <Seksjon id="eu-mobbing" tittel={t('skolemiljo.elevundersokelsen.mobbing')} apen>
      <p class="dempet liten">{t('skolemiljo.elevundersokelsen.mobbingTekst')}</p>
      {koder.map((kode) => (
        <Mobbeboks key={kode} d={d} serier={serier} trinn={trinn} kode={kode} maks={maks} />
      ))}
    </Seksjon>
  );
}

/** Navnet på det serien sammenlignes med, midt i en setning: «hele landet», men «Vestland». */
const iSetning = (navn: string, s: Serie) => (s.enhet === 'L' ? navn.charAt(0).toLowerCase() + navn.slice(1) : navn);

/** En indeks i «Kort om»: navnet, tallet, tallet for landet og forskjellen. */
function Faktarad({ d, f, mot }: { d: Data; f: Fakta; mot: string }) {
  const { t } = useTekst();
  return (
    <li class="eu-faktarad">
      <span class="eu-faktarad-navn">{kortnavn(d, f.kode, t)}</span>
      <span class="eu-faktarad-tall">
        <span class="tall">{tallTekst(f.verdi)}</span> <Forskjell forskjell={f.forskjell} type="indeks" mot={mot} />
      </span>
      <span class="eu-faktarad-mot">{t('skolemiljo.elevundersokelsen.sammenlignetMed', { mot, verdi: tallTekst(f.mot) })}</span>
    </li>
  );
}

/**
 * «Kort om» skolen brukeren har valgt, ellers fylket (eier 06.10.2026): mobbing på skolen og de tre indeksene der
 * tallene ligger mest over og mest under landet (privatskolene i landet med «Privatskole» valgt), for trinnet.
 */
function KortOm({ d, egen, mot, trinn, mobbekode, indekskoder }: { d: Data; egen: Serie | null; mot: Serie; trinn: number; mobbekode: string | undefined; indekskoder: readonly string[] }) {
  const { t } = useTekst();
  if (!egen) {
    return (
      <p class="eu-kort-tom">
        {t('skolemiljo.elevundersokelsen.velgSkole')} <a href="#/innstillinger">{t('skolemiljo.elevundersokelsen.tilInnstillinger')}</a>
      </p>
    );
  }
  const naa = d.skolear.length - 1;
  const navn = seriensNavn(d, egen, t);
  const motNavn = seriensNavn(d, mot, t);
  const trinnTekst = t(`skolemiljo.elevundersokelsen.trinnValg.t${trinn}` as Tekstnokkel);
  const { sterkest, svakest } = sterkestOgSvakest(d, egen, mot, indekskoder, trinn);
  const mobbing = mobbekode ? verdi(d, egen, mobbekode, naa, trinn) : null;
  const mobbingMot = mobbekode ? verdi(d, mot, mobbekode, naa, trinn) : null;
  const mobbingFoer = mobbekode ? verdi(d, egen, mobbekode, naa - 1, trinn) : null;
  const tom = sterkest.length === 0 && typeof mobbing !== 'number';
  return (
    <Seksjon id="eu-kort" tittel={t('skolemiljo.elevundersokelsen.kortOm', { navn })} apen>
      <p class="dempet liten">{t('skolemiljo.elevundersokelsen.kortOmTekst', { trinn: trinnTekst, naa: d.skolear[naa]?.replace('-', '–') ?? '', mot: iSetning(motNavn, mot) })}</p>
      {tom ? (
        <p>{t('skolemiljo.elevundersokelsen.ingenFakta', { navn, trinn: trinnTekst })}</p>
      ) : (
        <div class="eu-kort">
          {mobbekode && (
            <div class="eu-kort-del eu-kort-mobbing">
              <h3 class="eu-undertittel">{kortnavn(d, mobbekode, t)}</h3>
              <p class="eu-flis-tall">
                <Verditekst v={mobbing} prosent />
              </p>
              {typeof mobbing === 'number' && typeof mobbingMot === 'number' && (
                <p class="eu-flis-under">
                  {t('skolemiljo.elevundersokelsen.sammenlignetMed', { mot: motNavn, verdi: t('skolemiljo.elevundersokelsen.prosent', { verdi: tallTekst(mobbingMot) }) })} ·{' '}
                  <Forskjell forskjell={Math.round((mobbing - mobbingMot) * 10) / 10} type="mobbing" mot={iSetning(motNavn, mot)} />
                </p>
              )}
              <p class="eu-flis-under">
                <Endring naa={mobbing} foer={mobbingFoer} type="mobbing" />
              </p>
            </div>
          )}
          {sterkest.length > 0 && (
            <div class="eu-kort-del">
              <h3 class="eu-undertittel">{t('skolemiljo.elevundersokelsen.sterkest')}</h3>
              <ol class="eu-faktaliste">
                {sterkest.map((f) => (
                  <Faktarad key={f.kode} d={d} f={f} mot={motNavn} />
                ))}
              </ol>
            </div>
          )}
          {svakest.length > 0 && (
            <div class="eu-kort-del">
              <h3 class="eu-undertittel">{t('skolemiljo.elevundersokelsen.svakest')}</h3>
              <ol class="eu-faktaliste">
                {svakest.map((f) => (
                  <Faktarad key={f.kode} d={d} f={f} mot={motNavn} />
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </Seksjon>
  );
}

/**
 * Indeksene: én boks med en rad per indeks. Punktene står på én akse fra 1 til 5, med en ring for året før og en tynn
 * strek mellom, og tallene står ved navnet.
 */
function Indekser({ d, serier, trinn, koder }: { d: Data; serier: readonly Serie[]; trinn: number; koder: readonly string[] }) {
  const { t } = useTekst();
  const naa = d.skolear.length - 1;
  const x = (v: number) => `${((v - 1) / 4) * 100}%`;
  const y = (i: number) => `${8 + i * 11}px`;
  const akse = (
    <div class="eu-akse" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ left: x(n) }}>
          {n}
        </span>
      ))}
    </div>
  );
  return (
    <Seksjon id="eu-indekser" tittel={t('skolemiljo.elevundersokelsen.indekser')} apen>
      <p class="dempet liten">{t('skolemiljo.elevundersokelsen.indekserTekst')}</p>
      <figure class="eu-figur eu-indekser">
        <div class="eu-indeksrad eu-indeksrad-akse">
          <span />
          {akse}
        </div>
        {koder.map((kode) => (
          <div key={kode} class="eu-indeksrad">
            <div class="eu-indeks-tekst">
              <p class="eu-figur-tittel">{kortnavn(d, kode, t)}</p>
              {beskrivelse(kode, t) && <p class="eu-beskrivelse">{beskrivelse(kode, t)}</p>}
              <ul class="eu-punktverdier">
                {serier.map((s, i) => {
                  const v = verdi(d, s, kode, naa, trinn);
                  const f = verdi(d, s, kode, naa - 1, trinn);
                  return (
                    <li key={nokkelFor(s)}>
                      <Merke nr={i} />
                      <span class="skjult-visuelt">{seriensNavn(d, s, t)}: </span>
                      <Verditekst v={v} />
                      {typeof f === 'number' && <span class="eu-fjor-tekst"> ({tallTekst(f)})</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div class="eu-punktspor" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} class="eu-gitter" style={{ left: x(n) }} />
              ))}
              {serier.map((s, i) => {
                const v = verdi(d, s, kode, naa, trinn);
                const f = verdi(d, s, kode, naa - 1, trinn);
                const navn = seriensNavn(d, s, t);
                return (
                  <span key={nokkelFor(s)}>
                    {typeof v === 'number' && typeof f === 'number' && (
                      <span class="eu-strek" data-serie={i + 1} style={{ left: x(Math.min(v, f)), width: `${(Math.abs(v - f) / 4) * 100}%`, top: y(i) }} />
                    )}
                    {typeof f === 'number' && (
                      <span class="eu-punkt" style={{ left: x(f), top: y(i) }} title={`${navn}: ${t('skolemiljo.elevundersokelsen.iFjor', { verdi: tallTekst(f) })}`}>
                        <Merke nr={i} hul />
                      </span>
                    )}
                    {typeof v === 'number' && (
                      <span class="eu-punkt" style={{ left: x(v), top: y(i) }} title={`${navn}: ${tallTekst(v)}`}>
                        <Merke nr={i} />
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </figure>
    </Seksjon>
  );
}

/** Kortnavnet på et spørsmål fra tekstene, ellers navnet fra Udir. */
function kortnavn(d: Data, kode: string, t: T): string {
  const nokkel = `skolemiljo.elevundersokelsen.kortnavn.${kode}` as Tekstnokkel;
  const tekst = t(nokkel);
  return tekst !== nokkel ? tekst : (d.sporsmal.find((s) => s.kode === kode)?.navn ?? kode);
}

/** Udirs korte forklaring av indeksen, med egne ord, eller null. */
function beskrivelse(kode: string, t: T): string | null {
  const nokkel = `skolemiljo.elevundersokelsen.beskrivelser.${kode}` as Tekstnokkel;
  const tekst = t(nokkel);
  return tekst !== nokkel ? tekst : null;
}

/**
 * Alle tallene i en tabell: en rad per spørsmål og en kolonne per serie, med året før i parentes og en pil for bedre
 * eller svakere. Kolonnene for seriene er like brede (eier 06.10.2026), og radene har ledelinjer.
 */
function Tabellvisning({ d, serier, trinn }: { d: Data; serier: readonly Serie[]; trinn: number }) {
  const { t } = useTekst();
  const naa = d.skolear.length - 1;
  return (
    <div class="tabell-ramme">
      <table class="eu-tabell">
        <caption>
          {t('skolemiljo.elevundersokelsen.tabellTittel', { trinn: t(`skolemiljo.elevundersokelsen.trinnValg.t${trinn}` as Tekstnokkel), naa: d.skolear[naa]?.replace('-', '–') ?? '' })}
        </caption>
        <colgroup>
          <col class="eu-tabell-forste" />
          {serier.map((s) => (
            <col key={nokkelFor(s)} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{t('skolemiljo.elevundersokelsen.sporsmal')}</th>
            {serier.map((s, i) => (
              <th key={nokkelFor(s)} scope="col">
                <Merke nr={i} /> {seriensNavn(d, s, t)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.sporsmal.map((q) => (
            <tr key={q.kode}>
              <th scope="row">{kortnavn(d, q.kode, t)}</th>
              {serier.map((s) => {
                const v = verdi(d, s, q.kode, naa, trinn);
                const f = verdi(d, s, q.kode, naa - 1, trinn);
                const n = antall(d, s, q.kode, naa, trinn);
                const r = retning(q.type, endring(v, f));
                return (
                  <td key={nokkelFor(s)} class={`tall${r ? ` eu-${r}` : ''}`}>
                    <Verditekst v={v} prosent={q.type === 'mobbing'} />
                    <Pil r={r} tekst={t(r === 'bedre' ? 'skolemiljo.elevundersokelsen.bedreFjor' : 'skolemiljo.elevundersokelsen.svakereFjor')} />
                    {typeof f === 'number' && <span class="eu-fjor-tekst"> ({tallTekst(f)})</span>}
                    {typeof n === 'number' && <span class="eu-antall">{t('skolemiljo.elevundersokelsen.antall', { antall: formaterTall(n, 0) })}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p class="dempet liten eu-tabell-forklaring">{t('skolemiljo.elevundersokelsen.tabellForklaring')}</p>
    </div>
  );
}

export default function Elevundersokelsen({ sporring }: { sporring: URLSearchParams }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const privatskole = usePrivatskole();
  const [d, settD] = useState<Data | 'feil' | null>(null);
  useEffect(() => {
    lastElevundersokelsen().then(settD, () => settD('feil'));
  }, []);
  const [valgt, settValgt] = useState<(Serie | null)[] | null>(() => {
    const fra = sporring.get('s');
    return fra ? fra.split(',').map(serieFra).slice(0, MAKS_SERIER) : null;
  });
  const [trinnValg, settTrinnValg] = useState<number | null>(() => (sporring.get('trinn') ? Number(sporring.get('trinn')) - 1 : null));
  const [vis, settVis] = useState<'diagram' | 'tabell'>(sporring.get('vis') === 'tabell' ? 'tabell' : 'diagram');

  const data = d && d !== 'feil' ? d : null;
  const standard = data ? standardSerier(data, { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null, privatskole }) : [];
  const valg: (Serie | null)[] = valgt ?? standard;
  const serier = valg.filter((s): s is Serie => s !== null && !!data?.verdier[nokkelFor(s)]);
  const trinn = trinnValg ?? (data ? standardTrinn(data, serier[0]) : 0);

  // Valgene står i adressen, så siden kan deles og tilbake viser det samme.
  const lagre = (nyeSerier: (Serie | null)[], nyttTrinn: number, nyVis: 'diagram' | 'tabell') => {
    erstattAdresse(elevundersokelsenRute, {
      s: nyeSerier.map((s) => (s ? serieTekst(s) : '')).join(','),
      trinn: String(nyttTrinn + 1),
      ...(nyVis === 'tabell' ? { vis: 'tabell' } : {}),
    });
  };
  const endreSerie = (nr: number, s: Serie | null) => {
    const ny = [...valg];
    while (ny.length < MAKS_SERIER) ny.push(null);
    ny[nr] = s;
    settValgt(ny);
    lagre(ny, trinn, vis);
  };

  const mobbekoder = data?.sporsmal.filter((q) => q.type === 'mobbing').map((q) => q.kode) ?? [];
  const indekskoder = data?.sporsmal.filter((q) => q.type === 'indeks').map((q) => q.kode) ?? [];
  const naa = data ? data.skolear.length - 1 : 0;
  // «Kort om»: skolen brukeren har valgt, ellers fylket, mot landet (privatskolene i landet med «Privatskole» valgt).
  const egen = data ? egenSerie(data, { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null }) : null;
  const mot: Serie = { enhet: 'L', eierform: privatskole && egen?.enhet.startsWith('S') ? 'p' : 'a' };

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('skolemiljo.tittel'), href: '#/skolemiljo' }]} />
      <Sidetopp tittel={t('skolemiljo.elevundersokelsen.tittel')} favoritt="skolemiljo:elevundersokelsen" />
      <p class="ingress">{t('skolemiljo.elevundersokelsen.innledning')}</p>
      {d === null ? (
        <p class="dempet">{t('skolemiljo.elevundersokelsen.laster')}</p>
      ) : d === 'feil' || !data ? (
        <p role="alert">{t('skolemiljo.elevundersokelsen.feil')}</p>
      ) : (
        <>
          {/* Valgene i én rad over diagrammene (dataviz: filtre over figurene). */}
          <section class="eu-valg" aria-label={t('skolemiljo.elevundersokelsen.sammenlign')}>
            <h2 class="liten-overskrift">{t('skolemiljo.elevundersokelsen.sammenlign')}</h2>
            <div class="eu-serievalg">
              {[0, 1, 2].map((nr) => (
                <Seriesvalg key={nr} d={data} nr={nr} serie={valg[nr] ?? null} onEndring={(s) => endreSerie(nr, s)} />
              ))}
            </div>
            <div class="eu-valgrad">
              <Bryter
                legend={t('skolemiljo.elevundersokelsen.trinn')}
                kompakt
                verdi={String(trinn)}
                valg={[0, 1, 2].map((n) => ({ verdi: String(n), tekst: t(`skolemiljo.elevundersokelsen.trinnValg.t${n}` as Tekstnokkel) }))}
                onEndring={(v) => {
                  settTrinnValg(Number(v));
                  lagre(valg, Number(v), vis);
                }}
              />
              <Bryter
                legend={t('skolemiljo.elevundersokelsen.visning')}
                kompakt
                verdi={vis}
                valg={[
                  { verdi: 'diagram', tekst: t('skolemiljo.elevundersokelsen.diagram') },
                  { verdi: 'tabell', tekst: t('skolemiljo.elevundersokelsen.tabell') },
                ]}
                onEndring={(v) => {
                  settVis(v);
                  lagre(valg, trinn, v);
                }}
              />
            </div>
            <p class="dempet liten">
              {t('skolemiljo.elevundersokelsen.skolear', { naa: data.skolear[naa]?.replace('-', '–') ?? '', foer: data.skolear[naa - 1]?.replace('-', '–') ?? '' })}
            </p>
          </section>
          {/*
            Delene i et rutenett (eier 06.10.2026): på mobil under hverandre i rekkefølgen her, på skrivebord «Kort om»
            over hele bredden, mobbingen og «Om tallene» til venstre, og læringsmiljøet og kildene til høyre. Tabellen
            står over hele bredden.
          */}
          <div class={`eu-oppsett${vis === 'tabell' ? ' eu-oppsett-tabell' : ''}`}>
            <div class="eu-del eu-del-kort">
              <KortOm d={data} egen={egen} mot={mot} trinn={trinn} mobbekode={mobbekoder[0]} indekskoder={indekskoder} />
            </div>
            {vis === 'tabell' ? (
              <div class="eu-del eu-del-tabell">
                <Tabellvisning d={data} serier={serier} trinn={trinn} />
              </div>
            ) : (
              <>
                <div class="eu-del eu-del-mobbing">
                  <Mobbing d={data} serier={serier} trinn={trinn} koder={mobbekoder} />
                </div>
                <div class="eu-del eu-del-indekser">
                  <Indekser d={data} serier={serier} trinn={trinn} koder={indekskoder} />
                </div>
              </>
            )}
            <div class="eu-del eu-del-om">
              <Seksjon id="eu-om" tittel={t('skolemiljo.elevundersokelsen.omTallene')}>
                <ul class="eu-om">
                  <li>{t('skolemiljo.elevundersokelsen.om.kilde')}</li>
                  <li>{t('skolemiljo.elevundersokelsen.om.trinn')}</li>
                  <li>{t('skolemiljo.elevundersokelsen.om.skjermet')}</li>
                  <li>{t('skolemiljo.elevundersokelsen.om.eierform')}</li>
                  <li>{t('skolemiljo.elevundersokelsen.om.ingenEnkeltelever')}</li>
                </ul>
                <p>
                  <a class="ekstern-lenke" href={UDIR_SKJERMING} target="_blank" rel="noopener noreferrer">
                    {t('skolemiljo.elevundersokelsen.skjermingsregler')}
                    <Ikon navn="ekstern" class="ikon-liten" />
                  </a>
                </p>
                <p>
                  <a class="ekstern-lenke" href={UDIR_STATISTIKK} target="_blank" rel="noopener noreferrer">
                    {t('skolemiljo.elevundersokelsen.statistikkbanken')}
                    <Ikon navn="ekstern" class="ikon-liten" />
                  </a>
                </p>
              </Seksjon>
            </div>
            <div class="eu-del eu-del-kilder">
              <Kildeboks kilder={[{ id: 'udir-elevundersokelsen', punkt: `${data.skolear.map((a) => a.replace('-', '–')).join(' og ')}` }]} nokkel="elevundersokelsen" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
