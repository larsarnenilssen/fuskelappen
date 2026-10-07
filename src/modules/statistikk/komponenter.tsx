// Felles visning av nøkkeltallene fra Udirs statistikkbank (avgjørelse 080): nøkkeltall i fliser, fylkene rangert med
// det valgte fylket markert, og en liten tallboks som står på sidene der tallet hører hjemme. Brukes av siden
// «Videregående i tall», fylkessiden, Inntak, Lærlinger og kandidater, fraværsgrensen, eksamen og skolene.
//
// Formen følger dataviz-metoden, som Elevundersøkelsen: tallene står som tekst, stolpene går fra null, det valgte
// fylket har seriefargen og de andre er grå, og landet er en stiplet strek. Fargen står aldri alene.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { type T, useTekst } from '../../app/tilstand.ts';
import { Ikon } from '../../components/Ikon.tsx';
import type { Statistikk, Verdi } from '../../core/statistikk/skjema.ts';
import { formaterTall, type Tekstnokkel } from '../../core/i18n/tekst.ts';
import { lastStatistikk } from '../../data/statistikk.ts';
import { endringPoeng, endringProsent, forrigeVerdi, ranger, sisteFor, sisteVerdi } from './visning.ts';

import { statistikkLenke } from './adresse.ts';
// Stilene lastes med komponentene, ikke i startpakken.
import '../../styles/statistikk.css';

export { STATISTIKK_RUTE, statistikkLenke } from './adresse.ts';

/** Tallene, lastet første gang de trengs. null mens de lastes, «feil» når de ikke kunne lastes. */
export function useStatistikk(): Statistikk | null | 'feil' {
  const [d, settD] = useState<Statistikk | null | 'feil'>(null);
  useEffect(() => {
    lastStatistikk().then(settD, () => settD('feil'));
  }, []);
  return d;
}

/** «22 706», «84,0 %», «7 dager», «Skjermet» eller «Ingen tall». */
export function tekstFor(t: T, v: Verdi, form: 'antall' | 'prosent' | 'dager' | 'karakter' = 'antall'): string {
  if (v === '*') return t('statistikk.skjermet');
  if (v === null) return t('statistikk.ingenTall');
  if (form === 'prosent') return t('statistikk.prosent', { verdi: formaterTall(v, 1, 1) });
  if (form === 'dager') return t('statistikk.dager', { verdi: formaterTall(v, 0) });
  if (form === 'karakter') return formaterTall(v, 1, 1);
  return formaterTall(v, 0);
}

/** «+1,2 % fra 2025» eller «+4,5 prosentpoeng fra 2024». */
export function endringTekst(t: T, naa: Verdi, foer: Verdi, aar: number | string, poeng = false): string | null {
  const e = poeng ? endringPoeng(naa, foer) : endringProsent(naa, foer);
  if (e === null) return null;
  if (e === 0) return t('statistikk.somIFjor', { aar: String(aar) });
  return t(poeng ? 'statistikk.poeng' : 'statistikk.endring', { tegn: e > 0 ? '+' : '−', verdi: formaterTall(Math.abs(e), 1, 1), aar: String(aar) });
}

/** Stedsnavnet: fylket uten «fylkeskommune», eller «Hele landet». */
export const stedsnavn = (d: Statistikk, enhet: string, t: T) => (enhet === 'L' ? t('statistikk.landet') : (d.enheter[enhet]?.navn ?? enhet));

function Flis({ etikett, verdi, under }: { etikett: string; verdi: string; under: ComponentChildren }) {
  return (
    <li class="st-flis">
      <span class="st-flis-etikett">{etikett}</span>
      <span class="st-flis-tall">{verdi}</span>
      <span class="st-flis-under">{under}</span>
    </li>
  );
}

/** Fire nøkkeltall for fylket eller landet: søkere, elever, læreplass og lærekontrakter, med landet ved siden av. */
export function Nokkeltall({ d, enhet }: { d: Statistikk; enhet: string }) {
  const { t } = useTekst();
  const s = d.sokere;
  const sok = s.alle[enhet];
  const fo = d.formidling.desember[enhet];
  const aarFo = d.formidling.aar.at(-1) ?? '';
  const skoler = sisteVerdi(d.elever.skoler[enhet]);
  const iLandet = (v: Verdi, form: 'antall' | 'prosent' = 'antall') => (enhet === 'L' ? null : t('statistikk.landetVerdi', { verdi: tekstFor(t, v, form) }));
  const deler = (...x: (string | null)[]) => x.filter(Boolean).join(' · ');
  return (
    <ul class="st-fliser">
      <Flis
        etikett={t('statistikk.nokkeltall.sokere', { aar: String(s.aar.at(-1) ?? '') })}
        verdi={tekstFor(t, sisteVerdi(sok))}
        under={deler(endringTekst(t, sisteVerdi(sok), forrigeVerdi(sok), s.aar.at(-2) ?? ''), t('statistikk.nokkeltall.sokereUnder'))}
      />
      <Flis
        etikett={t('statistikk.nokkeltall.elever', { skolear: (d.elever.skolear.at(-1) ?? '').replace('-', '–') })}
        verdi={tekstFor(t, sisteVerdi(d.elever.elever[enhet]))}
        under={deler(typeof skoler === 'number' ? t('statistikk.nokkeltall.eleverUnder', { skoler: formaterTall(skoler, 0) }) : null, iLandet(sisteVerdi(d.elever.elever.L)))}
      />
      <Flis
        etikett={t('statistikk.nokkeltall.laereplass')}
        verdi={tekstFor(t, sisteVerdi(fo), 'prosent')}
        under={deler(t('statistikk.nokkeltall.laereplassUnder', { aar: String(aarFo) }), iLandet(sisteVerdi(d.formidling.desember.L), 'prosent'))}
      />
      <Flis
        etikett={t('statistikk.nokkeltall.kontrakter')}
        verdi={tekstFor(t, sisteVerdi(d.laerekontrakter.verdier[enhet]))}
        under={deler(t('statistikk.nokkeltall.kontrakterUnder', { aar: String(d.laerekontrakter.aar.at(-1) ?? '') }), iLandet(sisteVerdi(d.laerekontrakter.verdier.L)))}
      />
    </ul>
  );
}

/**
 * Fylkene rangert på andelen som fikk læreplass, som liggende stolper fra null. Det valgte fylket har seriefargen og
 * fet skrift, de andre er grå, og landet er en stiplet strek.
 */
export function Rangering({ d, enhet, medTittel = true }: { d: Statistikk; enhet: string; medTittel?: boolean }) {
  const { t } = useTekst();
  const verdier = sisteFor(d.formidling.desember);
  const rangert = ranger(d, verdier);
  const landet = verdier.L;
  const valgt = rangert.find((r) => r.enhet === enhet);
  const pst = (v: number) => `${v}%`;
  return (
    <figure class="st-figur">
      <figcaption>
        {medTittel && <span class="st-figur-tittel">{t('statistikk.rangering.tittel')}</span>}
        <span class="st-figur-tekst">
          {t('statistikk.rangering.tekst', { aar: String(d.formidling.aar.at(-1) ?? '') })}{' '}
          {valgt && t('statistikk.rangering.plass', { sted: valgt.navn, plass: String(valgt.plass), antall: String(rangert.length) })}
        </span>
      </figcaption>
      <ol class="st-rangering">
        {rangert.map((r) => (
          <li key={r.enhet} class={r.enhet === enhet ? 'st-rad st-valgt' : 'st-rad'}>
            <span class="st-rad-navn">{r.navn}</span>
            <span class="st-spor" aria-hidden="true">
              <span class="st-stolpe" style={{ width: pst(r.verdi) }} />
              {typeof landet === 'number' && <span class="st-landet" style={{ left: pst(landet) }} />}
            </span>
            <span class="st-rad-tall">{tekstFor(t, r.verdi, 'prosent')}</span>
          </li>
        ))}
      </ol>
      {typeof landet === 'number' && (
        <p class="st-forklaring">
          <span class="st-landet-merke" aria-hidden="true" /> {t('statistikk.rangering.landet', { verdi: tekstFor(t, landet, 'prosent') })}
        </p>
      )}
    </figure>
  );
}

/** En liten boks med ett tall der det hører hjemme, med lenke til «Videregående i tall» for fylket. */
export function Tallboks({ tittel, fylke, children }: { tittel: string; fylke: string | null; children: ComponentChildren }) {
  const { t } = useTekst();
  return (
    <aside class="st-boks" aria-label={tittel}>
      <p class="st-boks-tittel">
        <Ikon navn="vurdering" class="ikon-liten" />
        {tittel}
      </p>
      <div class="st-boks-innhold">{children}</div>
      <p class="st-boks-lenke">
        <a href={statistikkLenke(fylke)}>{t('statistikk.merLenke')}</a>
        <span class="st-boks-kilde"> · {t('statistikk.kilde')}</span>
      </p>
    </aside>
  );
}

/** «Vestland i tall» på fylkessiden: nøkkeltallene og fylkene rangert på læreplass, med lenke til hele siden. */
export function FylketITall({ fylke, navn }: { fylke: string; navn: string }) {
  const { t } = useTekst();
  const d = useStatistikk();
  if (d === null || d === 'feil') return null;
  const enhet = `F${fylke}`;
  if (!d.enheter[enhet]) return null;
  // Bare plassen, ikke hele rangeringen: den står på siden Videregående i tall.
  const rangert = ranger(d, sisteFor(d.formidling.desember));
  const plass = rangert.find((r) => r.enhet === enhet);
  return (
    <section class="st-fylket" aria-labelledby="st-fylket-tittel">
      <h2 class="liten-overskrift" id="st-fylket-tittel">
        {t('statistikk.iTall', { sted: navn })}
      </h2>
      <Nokkeltall d={d} enhet={enhet} />
      <p class="st-boks-lenke">
        {plass && <>{t('statistikk.rangering.plassFylke', { sted: navn, plass: String(plass.plass), antall: String(rangert.length) })} </>}
        <a href={statistikkLenke(fylke)}>
          {t('statistikk.merLenke')} <Ikon navn="hoyre" class="ikon-liten" />
        </a>
        <span class="st-boks-kilde"> · {t('statistikk.kilde')}</span>
      </p>
    </section>
  );
}

/** Kortere navn på eksamensfagene der Udirs navn er lange (norsk og engelsk); ellers navnet fra Udir. */
const KORTE_FAGNAVN: Readonly<Record<string, Tekstnokkel>> = {
  NOR1267: 'statistikk.eksamen.kort.NOR1267',
  NOR1262: 'statistikk.eksamen.kort.NOR1262',
  ENG1007: 'statistikk.eksamen.kort.ENG1007',
  ENG1009: 'statistikk.eksamen.kort.ENG1009',
};

export function fagnavn(t: T, f: { id: string; navn: string }): string {
  const kort = KORTE_FAGNAVN[f.id];
  return kort ? t(kort) : f.navn;
}

/** «Gjennomsnittlig karakter …, skoleåret 2025–26 (foreløpige tall).» */
export function eksamenTekst(t: T, d: Statistikk): string {
  return t('statistikk.eksamen.tekst', { skolear: d.eksamen.skolear.replace('-', '–'), forelopig: d.eksamen.forelopig ? t('statistikk.eksamen.forelopig') : '' });
}

/** Stedet for boksene: fylket brukeren har valgt, ellers landet. */
function useSted(d: Statistikk | null | 'feil', fylke: string | null): { d: Statistikk; enhet: string } | null {
  if (d === null || d === 'feil') return null;
  const enhet = fylke && d.enheter[`F${fylke}`] ? `F${fylke}` : 'L';
  return { d, enhet };
}

/** Inntak: søkerne i fylket i år, endringen fra i fjor og hvor mange som søkte læreplass. */
export function SokereBoks({ fylke }: { fylke: string | null }) {
  const { t } = useTekst();
  const s = useSted(useStatistikk(), fylke);
  if (!s) return null;
  const { d, enhet } = s;
  const alle = d.sokere.alle[enhet];
  const aar = d.sokere.aar;
  return (
    <Tallboks tittel={t('statistikk.boks.inntak', { sted: stedsnavn(d, enhet, t) })} fylke={fylke}>
      <p>
        {t('statistikk.boks.inntakTekst', {
          antall: tekstFor(t, sisteVerdi(alle)),
          aar: String(aar.at(-1) ?? ''),
          endring: endringTekst(t, sisteVerdi(alle), forrigeVerdi(alle), aar.at(-2) ?? '') ?? '',
          laereplass: tekstFor(t, sisteVerdi(d.sokere.laereplass[enhet])),
        })}
      </p>
    </Tallboks>
  );
}

/** Lærlinger og kandidater: andelen som fikk læreplass og de løpende lærekontraktene. */
export function LaereplassBoks({ fylke }: { fylke: string | null }) {
  const { t } = useTekst();
  const s = useSted(useStatistikk(), fylke);
  if (!s) return null;
  const { d, enhet } = s;
  return (
    <Tallboks tittel={t('statistikk.boks.laerling', { sted: stedsnavn(d, enhet, t) })} fylke={fylke}>
      <p>
        {t('statistikk.boks.laerlingTekst', {
          andel: tekstFor(t, sisteVerdi(d.formidling.desember[enhet]), 'prosent'),
          aar: String(d.formidling.aar.at(-1) ?? ''),
          landet: tekstFor(t, sisteVerdi(d.formidling.desember.L), 'prosent'),
          kontrakter: tekstFor(t, sisteVerdi(d.laerekontrakter.verdier[enhet])),
        })}
      </p>
    </Tallboks>
  );
}

/** Fraværsgrensen: median fravær i fylket og landet, og på skolen når brukeren har valgt en. */
export function FravaerBoks({ fylke, skole }: { fylke: string | null; skole: { id: string | null; navn: string } | null }) {
  const { t } = useTekst();
  const s = useSted(useStatistikk(), fylke);
  if (!s) return null;
  const { d, enhet } = s;
  const skolens = skole?.id ? (d.fravaer.total[`S${skole.id}`] ?? null) : null;
  return (
    <Tallboks tittel={t('statistikk.boks.fravaer', { sted: stedsnavn(d, enhet, t) })} fylke={fylke}>
      <p>
        {t('statistikk.boks.fravaerTekst', {
          dager: tekstFor(t, d.fravaer.total[enhet] ?? null, 'dager'),
          skolear: d.fravaer.skolear.replace('-', '–'),
          landet: tekstFor(t, d.fravaer.total.L ?? null, 'dager'),
        })}{' '}
        {skole && skolens !== null && t('statistikk.boks.fravaerSkole', { skole: skole.navn, dager: tekstFor(t, skolens, 'dager') })}
      </p>
    </Tallboks>
  );
}

/** Eksamen: gjennomsnittet i de største fellesfagene, fylket mot landet. */
export function EksamenBoks({ fylke }: { fylke: string | null }) {
  const { t } = useTekst();
  const s = useSted(useStatistikk(), fylke);
  if (!s) return null;
  const { d, enhet } = s;
  return (
    <Tallboks tittel={t('statistikk.boks.eksamen', { sted: stedsnavn(d, enhet, t) })} fylke={fylke}>
      <table class="st-tabell st-tabell-liten">
        <caption class="skjult-visuelt">{eksamenTekst(t, d)}</caption>
        <thead>
          <tr>
            <th scope="col">{t('statistikk.eksamen.fag')}</th>
            {enhet !== 'L' && <th scope="col">{stedsnavn(d, enhet, t)}</th>}
            <th scope="col">{t('statistikk.landet')}</th>
          </tr>
        </thead>
        <tbody>
          {d.eksamen.fag.slice(0, 5).map((f) => (
            <tr key={f.id}>
              <th scope="row">{fagnavn(t, f)}</th>
              {enhet !== 'L' && <td>{tekstFor(t, d.eksamen.snitt[enhet]?.[f.id] ?? null, 'karakter')}</td>}
              <td>{tekstFor(t, d.eksamen.snitt.L?.[f.id] ?? null, 'karakter')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p class="st-figur-tekst">{eksamenTekst(t, d)}</p>
    </Tallboks>
  );
}

/**
 * Skolen i tall, i skolekortet: elevene de siste årene, fraværet og lenken til Elevundersøkelsen. Knappene til nettsiden
 * og skolens egne regler står i samme ramme, til høyre på stor skjerm og under tallene på mobil, så kortet ikke får en
 * egen rad med knapper (eier 07.10.2026).
 */
export function SkolenITall({ orgnr, d, children }: { orgnr: string; d: Statistikk; children?: ComponentChildren }) {
  const { t } = useTekst();
  const enhet = `S${orgnr}`;
  const elever = d.elever.elever[enhet];
  const fravaer = d.fravaer.total[enhet] ?? null;
  if (!elever && fravaer === null) return null;
  return (
    <div class="st-skolen">
      <div class="st-skolen-hoved">
        <p class="st-skolen-tittel">{t('statistikk.skolen.tittel')}</p>
        {/* Etiketten, tallet og teksten under står i hver sin rad, så tallene står på samme linje. */}
        <ul class="st-skolen-tall">
          {elever && (
            <li>
              <span class="st-flis-etikett">{t('statistikk.skolen.elever', { skolear: (d.elever.skolear.at(-1) ?? '').replace('-', '–') })}</span>
              <b>{tekstFor(t, sisteVerdi(elever))}</b>
              <span class="st-flis-under">{endringTekst(t, sisteVerdi(elever), forrigeVerdi(elever), (d.elever.skolear.at(-2) ?? '').replace('-', '–')) ?? ''}</span>
            </li>
          )}
          {fravaer !== null && (
            <li>
              <span class="st-flis-etikett">{t('statistikk.skolen.fravaer', { skolear: d.fravaer.skolear.replace('-', '–') })}</span>
              <b>{t('statistikk.skolen.fravaerVerdi', { dager: tekstFor(t, fravaer, 'dager') })}</b>
              <span class="st-flis-under">{t('statistikk.skolen.fravaerUnder')}</span>
            </li>
          )}
        </ul>
        <p class="st-boks-lenke">
          <a href={`#/skolemiljo/elevundersokelsen?s=S${orgnr}`}>{t('statistikk.skolen.elevundersokelsen')}</a>
        </p>
      </div>
      {children && <div class="st-skolen-snarveier">{children}</div>}
    </div>
  );
}

/** Oppsummeringen av tallene på forsiden når gruppen er lukket: «25 090 søkere · 84,0 % fikk læreplass». */
export function forsideSammendrag(t: T, d: Statistikk, enhet: string): string {
  return t('statistikk.forside.sammendrag', { sokere: tekstFor(t, sisteVerdi(d.sokere.alle[enhet])), laereplass: tekstFor(t, sisteVerdi(d.formidling.desember[enhet]), 'prosent') });
}

/**
 * Tallene på forsiden, i panelet øverst (eier 07.10.2026, avgjørelse 081). Et annet oppsett enn datoene:
 * - fire fliser med søkere, elever, læreplass og lærekontrakter
 * - en stripe der hvert fylke er en prikk etter andelen som fikk læreplass, med fylket brukeren har valgt i
 *   seriefargen og landet som en stiplet strek. Prikkene er plassert, ikke stolper, så skalaen trenger ikke starte på null.
 *   Uten valgt fylke står en lenke til innstillingene i stedet.
 * - elevtallet på skolen brukeren har valgt, og lenken til Videregående i tall
 */
export function ForsideTall({ d, enhet, skole }: { d: Statistikk; enhet: string; skole: { orgnr: string; navn: string } | null }) {
  const { t } = useTekst();
  const fylke = enhet === 'L' ? null : enhet.slice(1);
  const sok = d.sokere.alle[enhet];
  const skoler = sisteVerdi(d.elever.skoler[enhet]);
  const desember = sisteFor(d.formidling.desember);
  const rangert = ranger(d, desember);
  const plass = rangert.find((r) => r.enhet === enhet);
  const landet = desember.L;
  const aarFo = String(d.formidling.aar.at(-1) ?? '');
  // Skalaen går fra femmeren under det laveste fylket til femmeren over det høyeste.
  const verdier = rangert.map((r) => r.verdi);
  const min = Math.floor(Math.min(...verdier) / 5) * 5;
  const maks = Math.ceil(Math.max(...verdier) / 5) * 5;
  const pos = (v: number) => `${((v - min) / Math.max(1, maks - min)) * 100}%`;
  const prosent = (v: number) => tekstFor(t, v, 'prosent');
  const skolensElever = skole ? d.elever.elever[`S${skole.orgnr}`] : undefined;
  return (
    <div class="st-forside">
      {/* Stedet står her, fordi overskriften viser valgene i panelet når det er åpent. */}
      <p class="st-forside-sted">{enhet === 'L' ? t('statistikk.forside.stedLandet') : t('statistikk.forside.sted', { sted: stedsnavn(d, enhet, t) })}</p>
      <ul class="st-fliser st-fliser-kompakt">
        <Flis etikett={t('statistikk.nokkeltall.sokere', { aar: String(d.sokere.aar.at(-1) ?? '') })} verdi={tekstFor(t, sisteVerdi(sok))} under={endringTekst(t, sisteVerdi(sok), forrigeVerdi(sok), d.sokere.aar.at(-2) ?? '') ?? ''} />
        <Flis
          etikett={t('statistikk.nokkeltall.elever', { skolear: (d.elever.skolear.at(-1) ?? '').replace('-', '–') })}
          verdi={tekstFor(t, sisteVerdi(d.elever.elever[enhet]))}
          under={typeof skoler === 'number' ? t('statistikk.nokkeltall.eleverUnder', { skoler: formaterTall(skoler, 0) }) : ''}
        />
        <Flis etikett={t('statistikk.nokkeltall.laereplass')} verdi={tekstFor(t, sisteVerdi(d.formidling.desember[enhet]), 'prosent')} under={enhet === 'L' ? t('statistikk.nokkeltall.laereplassUnder', { aar: aarFo }) : t('statistikk.landetVerdi', { verdi: tekstFor(t, landet ?? null, 'prosent') })} />
        <Flis etikett={t('statistikk.nokkeltall.kontrakter')} verdi={tekstFor(t, sisteVerdi(d.laerekontrakter.verdier[enhet]))} under={t('statistikk.nokkeltall.kontrakterUnder', { aar: String(d.laerekontrakter.aar.at(-1) ?? '') })} />
      </ul>
      {/* Uten valgt fylke sier stripen lite, så i stedet står en lenke til innstillingene (eier 07.10.2026). */}
      {enhet === 'L' && (
        <a class="st-forside-skole" href="#/innstillinger">
          <Ikon navn="sted" class="ikon-liten" />
          <span>{t('statistikk.forside.velgFylke')}</span>
          <Ikon navn="hoyre" class="ikon-liten" />
        </a>
      )}
      {enhet !== 'L' && rangert.length > 0 && (
        <figure class="st-stripe-figur">
          <figcaption class="st-figur-tekst">
            {t('statistikk.forside.stripe', { aar: aarFo })}
            {plass && ` ${t('statistikk.forside.stripePlass', { sted: plass.navn, plass: String(plass.plass), antall: String(rangert.length) })}`}
          </figcaption>
          <div
            class="st-stripe"
            role="img"
            aria-label={t('statistikk.forside.stripeBeskrivelse', { antall: String(rangert.length), min: prosent(Math.min(...verdier)), maks: prosent(Math.max(...verdier)), landet: tekstFor(t, landet ?? null, 'prosent') })}
          >
            {typeof landet === 'number' && <span class="st-stripe-landet" style={{ left: pos(landet) }} />}
            {/* Det valgte fylket tegnes sist, så prikken står over de andre. */}
            {[...rangert.filter((r) => r.enhet !== enhet), ...rangert.filter((r) => r.enhet === enhet)].map((r) => (
              <span key={r.enhet} class={r.enhet === enhet ? 'st-stripe-prikk st-valgt' : 'st-stripe-prikk'} style={{ left: pos(r.verdi) }} title={`${r.navn}: ${prosent(r.verdi)}`} />
            ))}
          </div>
          <div class="st-stripe-skala" aria-hidden="true">
            <span>{prosent(min)}</span>
            <span>{prosent(maks)}</span>
          </div>
          {/* Forklaringen: fylket er den blå prikken og landet streken, med tallene, så fargen ikke står alene. */}
          <p class="st-stripe-forklaring" aria-hidden="true">
            {plass && (
              <span>
                <span class="st-stripe-merke st-valgt" />
                {plass.navn} {prosent(plass.verdi)}
              </span>
            )}
            {typeof landet === 'number' && (
              <span>
                <span class="st-stripe-merke-landet" />
                {t('statistikk.rangering.landet', { verdi: prosent(landet) })}
              </span>
            )}
          </p>
        </figure>
      )}
      {skole && skolensElever && (
        <a class="st-forside-skole" href={`#/opplaeringslop/skoler?fylke=alle&q=${encodeURIComponent(skole.navn)}`}>
          <Ikon navn="skole" class="ikon-liten" />
          <span>{t('statistikk.forside.skole', { antall: tekstFor(t, sisteVerdi(skolensElever)), skole: skole.navn })}</span>
          <Ikon navn="hoyre" class="ikon-liten" />
        </a>
      )}
      <a class="listelenke st-forside-mer" href={statistikkLenke(fylke)}>
        <Ikon navn="sammenlign" />
        <span class="listelenke-tekst">
          <span class="listelenke-tittel">{t('statistikk.forside.mer')}</span>
        </span>
        <Ikon navn="hoyre" class="ikon-liten" />
      </a>
    </div>
  );
}
