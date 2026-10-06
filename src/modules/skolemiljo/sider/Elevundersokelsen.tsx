// Elevundersøkelsen (fase 7, eier 06.10.2026, avgjørelse 077): mobbing og læringsmiljøet for opptil tre serier side om
// side (en skole, et fylke eller hele landet, for alle, offentlige eller private skoler), for et trinn, med året før.
// Fra start står skolen og fylket brukeren har valgt, og hele landet (privatskolene i landet med «Privatskole» valgt).
// Valgene står i adressen (?s=S974557584,F46,L&trinn=1&vis=tabell), så siden kan deles og tilbake virker.
//
// Formen (dataviz-metoden): nøkkeltall for «Mobbing på skolen», liggende stolper fra null for mobbing (andel i
// prosent) og punkter på én akse fra 1 til 5 for indeksene. Hver serie har sin farge og sin form (sirkel, firkant,
// rute), så fargen aldri står alene, og tallene står som tekst ved siden av. Året før er en strek (mobbing) eller en
// ring (indeksene). Skjermede tall vises som «Skjermet», aldri som et tall. Tabellen viser alle tallene.
import { useEffect, useId, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { fylker as alleFylker, fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { type T, usePrivatskole, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Bryter } from '../../../components/Bryter.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { lastElevundersokelsen } from '../../../data/elevundersokelsen.ts';
import type { Eierform, Elevundersokelsen as Data, Verdi } from '../elevundersokelsen/skjema.ts';
import { antall, endring, MAKS_SERIER, mobbeskala, type Serie, serieFra, serieTekst, skolerIFylket, standardSerier, standardTrinn, verdi } from '../elevundersokelsen/visning.ts';
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

/** «+0,4 fra året før» eller «som året før». For mobbing er nedgang bra, men endringen står uten farge. */
function Endring({ naa, foer, prosent = false }: { naa: Verdi; foer: Verdi; prosent?: boolean }) {
  const { t } = useTekst();
  const e = endring(naa, foer);
  if (e === null) return null;
  if (e === 0) return <span class="eu-endring">{t('skolemiljo.elevundersokelsen.uendret')}</span>;
  // Endringen i en andel er prosentpoeng, ikke prosent.
  const verdiTekst = prosent ? t('skolemiljo.elevundersokelsen.prosentpoeng', { verdi: tallTekst(Math.abs(e)) }) : tallTekst(Math.abs(e));
  return <span class="eu-endring">{t('skolemiljo.elevundersokelsen.endring', { tegn: e > 0 ? '+' : '−', verdi: verdiTekst })}</span>;
}

/** Nøkkeltallene: «Mobbing på skolen» for hver serie, med endringen fra året før. */
function Nokkeltall({ d, serier, trinn, kode, navn }: { d: Data; serier: readonly Serie[]; trinn: number; kode: string; navn: string }) {
  const { t } = useTekst();
  const naa = d.skolear.length - 1;
  return (
    <section class="eu-nokkeltall" aria-label={navn}>
      <h2 class="liten-overskrift">{navn}</h2>
      <ul class="eu-fliser">
        {serier.map((s, i) => {
          const v = verdi(d, s, kode, naa, trinn);
          const f = verdi(d, s, kode, naa - 1, trinn);
          return (
            <li key={nokkelFor(s)} class="eu-flis">
              <span class="eu-flis-navn">
                <Merke nr={i} />
                {seriensNavn(d, s, t)}
              </span>
              <span class="eu-flis-tall">
                <Verditekst v={v} prosent />
              </span>
              <span class="eu-flis-under">
                {typeof f === 'number' && <>{t('skolemiljo.elevundersokelsen.iFjor', { verdi: t('skolemiljo.elevundersokelsen.prosent', { verdi: tallTekst(f) }) })} · </>}
                <Endring naa={v} foer={f} prosent />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const nokkelFor = (s: Serie) => `${s.enhet}|${s.eierform}`;

/** Mobbing: liggende stolper fra null, en per serie, med en strek for året før og tallet ved siden av. */
function Mobbing({ d, serier, trinn, koder }: { d: Data; serier: readonly Serie[]; trinn: number; koder: readonly string[] }) {
  const { t } = useTekst();
  const naa = d.skolear.length - 1;
  const maks = mobbeskala(d, serier, koder, trinn);
  const pst = (v: number) => `${(v / maks) * 100}%`;
  return (
    <section>
      <h2 class="liten-overskrift">{t('skolemiljo.elevundersokelsen.mobbing')}</h2>
      <p class="dempet liten">{t('skolemiljo.elevundersokelsen.mobbingTekst')}</p>
      {koder.map((kode) => (
        <figure key={kode} class="eu-figur">
          <figcaption class="eu-figur-tittel">{kortnavn(d, kode, t)}</figcaption>
          <ul class="eu-stolper">
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
                  </span>
                </li>
              );
            })}
          </ul>
        </figure>
      ))}
    </section>
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
    <section>
      <h2 class="liten-overskrift">{t('skolemiljo.elevundersokelsen.indekser')}</h2>
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
    </section>
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

/** Alle tallene i en tabell: en rad per spørsmål og en kolonne per serie, med året før i parentes. */
function Tabellvisning({ d, serier, trinn }: { d: Data; serier: readonly Serie[]; trinn: number }) {
  const { t } = useTekst();
  const naa = d.skolear.length - 1;
  return (
    <div class="tabell-ramme">
      <table class="eu-tabell">
        <caption>
          {t('skolemiljo.elevundersokelsen.tabellTittel', { trinn: t(`skolemiljo.elevundersokelsen.trinnValg.t${trinn}` as Tekstnokkel), naa: d.skolear[naa]?.replace('-', '–') ?? '' })}
        </caption>
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
                return (
                  <td key={nokkelFor(s)} class="tall">
                    <Verditekst v={v} prosent={q.type === 'mobbing'} />
                    {typeof f === 'number' && <span class="eu-fjor-tekst"> ({tallTekst(f)})</span>}
                    {typeof n === 'number' && <span class="eu-antall">{t('skolemiljo.elevundersokelsen.antall', { antall: formaterTall(n, 0) })}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
          {mobbekoder[0] && <Nokkeltall d={data} serier={serier} trinn={trinn} kode={mobbekoder[0]} navn={kortnavn(data, mobbekoder[0], t)} />}
          <ToKolonner
            hoved={
              vis === 'tabell' ? (
                <Tabellvisning d={data} serier={serier} trinn={trinn} />
              ) : (
                <>
                  <Mobbing d={data} serier={serier} trinn={trinn} koder={mobbekoder} />
                  <Indekser d={data} serier={serier} trinn={trinn} koder={indekskoder} />
                </>
              )
            }
            side={
              <>
                <section>
                  <h2 class="liten-overskrift">{t('skolemiljo.elevundersokelsen.omTallene')}</h2>
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
                </section>
                <Kildeboks kilder={[{ id: 'udir-elevundersokelsen', punkt: `${data.skolear.map((a) => a.replace('-', '–')).join(' og ')}` }]} nokkel="elevundersokelsen" />
              </>
            }
          />
        </>
      )}
    </div>
  );
}
