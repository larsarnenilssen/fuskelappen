// Et tilbud (programområde): timene og hvordan de fordeler seg, fagene i rubrikker for fellesfag, felles programfag,
// programfag til valg og yrkesfaglig fordypning, hva tilbudet bygger på og fører videre til, og lenker til Vilbli for
// skolene som har det (avgjørelse 027). Skolene med tilbudet, yrkene etter lærefaget og opplæringskontorene i
// fylket kommer fra utdanning.no og NOR (avgjørelse 053). Alt kan legges sammen (eier 02.10.2026, avgjørelse 036).
// Linjenavnene fra rundskrivet («Norsk», «Fremmedspråk») står på valgt målform (navn.ts). Avvik mellom rundskrivet og
// Grep vises som en nøytral merknad der de gjelder (eier 02.10.2026).
import { useEffect, useId, useState } from 'preact/hooks';
import { lenke, naviger } from '../../../app/ruter.ts';
import { type T, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { finnKobling } from '../../arbeidstid/beregning/index.ts';
import { fagvalgFraKobling } from '../../arbeidstid/fagvalg.ts';
import { nyGruppe, useKoblingsdata } from '../../arbeidstid/komponenter/Skjema.tsx';
import { overforSkjema } from '../../arbeidstid/kontekst.ts';
import { lastFagroller } from '../../fag/data.ts';
import { fellesStart } from '../../fag/klasser.ts';
import { normaliser } from '../../fag/oppslag.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { Lopkilde } from '../../fag/tilbud/kildesamsvar.ts';
import type { Avvik, Tilbudsdel, Tilpasning } from '../../fag/tilbud/modell.ts';
import { vilbliLenke } from '../../fag/tilbud/vilbli.ts';
import { visningstrinnTekst } from '../../fag/visning.ts';
import type { SideProps } from '../../typer.ts';
import { fullKode, kortKode, skoleForst, type Tilbudsdata } from '../data.ts';
import { linjenavn, ordning } from '../navn.ts';
import { Brodsmuler, Fagvalgrad, Lasting, Rubrikk, Tilbudslenke, tilbudsnavn, useSkoler, useTilbudsdata } from './felles.tsx';
import { lastYrker } from '../../../data/utdanning.ts';
import { lastOpplaeringskontor } from '../../../data/udir.ts';
import type { Yrker } from '../../fag/utdanning/skjema.ts';
import type { Opplaeringskontorer } from '../nor/skjema.ts';
import { antallMedTilbud, valgtSkole } from '../skoler.ts';

type Kategori = Tilbudsdel['kategori'];
type Fagdel = Extract<Tilbudsdel, { type: 'fag' }>;
type Plassdel = Extract<Tilbudsdel, { type: 'plass' }>;

/** Rekkefølgen på rubrikkene, og fargen til fagtypen hver rubrikk har (som i fagsøket og på fagarket). */
const KATEGORIER: readonly { kategori: Kategori; farge: string }[] = [
  { kategori: 'fellesfag', farge: 'fellesfag' },
  { kategori: 'felles_programfag', farge: 'felles_programfag' },
  { kategori: 'fordypning', farge: 'valgfritt_programfag' },
  { kategori: 'valgfritt', farge: 'valgfritt_programfag' },
  { kategori: 'yff', farge: 'yrkesfaglig_fordypning' },
  { kategori: 'opphenting', farge: 'andre' },
];

/** Så mange fagkoder vises med en gang. Flere står i en liste med søk. */
const FAA = 4;
/** Så mange tilbud vises med rubrikken åpen. Flere (f.eks. kryssløp fra vg1 studiespesialisering) er lukket. */
const MANGE_TILBUD = 6;

/** «Norsk/norsk for elever med samisk/…» → «Norsk». Resten står i rundskrivet og gjelder tilpassede ordninger. */
const kortLinje = (linje: string, malform: 'nb' | 'nn') => {
  const tekst = linjenavn(linje, malform).tekst;
  return tekst.split('/')[0]?.trim() ?? tekst;
};

/**
 * Ett fag på én linje: navnet er lenken til fagarket, timene står til høyre. Alle radene i en rubrikk har samme
 * høyde og avstand til skillelinjene. Valg (f.eks. «velg én: 1P · 1T») står dempet etter navnet (eier 02.10.2026).
 */
function Fagrad({ navn, timer, href, under, dempet = false }: { navn: string; timer: number | null; href?: string | null; under?: preact.ComponentChildren; dempet?: boolean }) {
  return (
    <li class="fagrad" data-dempet={dempet || undefined}>
      <div class="fagrad-topp">
        <span class="fagrad-navn">
          {href ? <a href={href}>{navn}</a> : navn}
          {under && <span class="fagrad-under"> · {under}</span>}
        </span>
        {timer !== null && <span class="fagrad-timer tall">{formaterTall(timer)}</span>}
      </div>
    </li>
  );
}

function Fellesfag({ del, indeks, laereplaner }: { del: Fagdel; indeks: Fagindeks; laereplaner: Readonly<Record<string, string>> }) {
  const { t, malform } = useTekst();
  const en = del.koder.length === 1 ? del.koder[0] : null;
  if (del.koder.length > FAA)
    return (
      <Fagvalgrad
        indeks={indeks}
        koder={del.koder}
        laereplaner={laereplaner}
        tittel={kortLinje(del.linje, malform)}
        under={t('opplaeringslop.tilbud.velgEn', { antall: formaterTall(del.koder.length) })}
        hoyre={formaterTall(del.timer)}
      />
    );
  // «Matematikk 1P» og «Matematikk 1T» blir «1P» og «1T»: det navnene har felles, står alt i linjen.
  const felles = fellesStart(del.koder.map((k) => indeks.fag[k]?.navn[malform] ?? k));
  const kortnavn = (k: string) => {
    const navn = indeks.fag[k]?.navn[malform] ?? k;
    return navn.slice(felles.length).trim() || navn;
  };
  // Programfag eleven kan velge i stedet for fellesfaget, f.eks. S1 og R1 i stedet for 2P (Udir-1 punkt 3.3.1.4).
  const erstatning = del.erstatning ?? [];
  const fellesfag = del.koder.filter((k) => !erstatning.includes(k));
  const timerErstatning = [...new Set(erstatning.map((k) => indeks.fag[k]?.timer).filter((x): x is number => typeof x === 'number'))];
  return (
    <Fagrad
      navn={kortLinje(del.linje, malform)}
      timer={del.timer}
      href={en ? `#/fag/${en}` : null}
      under={
        del.koder.length > 1 && (
          <>
            {t('opplaeringslop.tilbud.velgEnKort')}{' '}
            {del.koder.map((k, i) => (
              <span key={k}>
                {i > 0 && ' · '}
                <a href={`#/fag/${k}`}>{kortnavn(k)}</a>
              </span>
            ))}
            {erstatning.length > 0 && timerErstatning.length === 1 && (
              <span class="fagrad-merknad">
                {' '}
                {t('opplaeringslop.tilbud.erstatning', {
                  fag: erstatning.map(kortnavn).join(` ${t('opplaeringslop.tilbud.og')} `),
                  timer: formaterTall(timerErstatning[0] ?? 0),
                  fellesfag: fellesfag.map(kortnavn).join(', '),
                })}
              </span>
            )}
          </>
        )
      }
    />
  );
}

/** Felles programfag: hvert fag med timene sine. Utvalg over flere trinn eller blant fag i samme læreplan er en rad som åpnes. */
function Programfag({ del, indeks, laereplaner }: { del: Fagdel; indeks: Fagindeks; laereplaner: Readonly<Record<string, string>> }) {
  const { t, malform } = useTekst();
  const u = del.utvalg;
  return (
    <>
      {del.koder.map((k) => (
        <Fagrad key={k} navn={indeks.fag[k]?.navn[malform] ?? k} timer={indeks.fag[k]?.timer ?? null} href={`#/fag/${k}`} />
      ))}
      {u && (
        <Fagvalgrad
          indeks={indeks}
          koder={u.koder}
          laereplaner={laereplaner}
          tittel={
            u.grunn === 'flere_trinn'
              ? t('opplaeringslop.tilbud.utvalgFlereTrinnKort')
              : u.antall
                ? t('opplaeringslop.tilbud.velgAntall', { antall: formaterTall(u.antall) })
                : t('opplaeringslop.tilbud.utvalgValgKort')
          }
          under={t('opplaeringslop.tilbud.blantFag', { antall: formaterTall(u.koder.length) })}
          hoyre={u.timer > 0 ? formaterTall(u.timer) : undefined}
        >
          {u.rekker.length > 0 && (
            <p class="fagrad-merknad">
              {t('opplaeringslop.tilbud.rekkefolge')}: {u.rekker.map((r) => r.join(' → ')).join('; ')}
            </p>
          )}
        </Fagvalgrad>
      )}
      {del.lantFra && <li class="fagrad fagrad-merknad">{t('opplaeringslop.tilbud.lantFra', { tilbud: tilbudsnavn(t, indeks, del.lantFra, malform) })}</li>}
    </>
  );
}

function Plass({ del, indeks, laereplaner, trinn }: { del: Plassdel; indeks: Fagindeks; laereplaner: Readonly<Record<string, string>>; trinn: string }) {
  const { t, malform } = useTekst();
  if (del.kategori === 'yff') {
    const andre = del.kandidater.filter((k) => k !== del.anbefalt);
    return (
      <>
        <Fagrad
          navn={del.anbefalt ? (indeks.fag[del.anbefalt]?.navn[malform] ?? del.anbefalt) : kortLinje(del.linje, malform)}
          timer={del.timer}
          href={del.anbefalt ? `#/fag/${del.anbefalt}` : null}
        />
        <Fagvalgrad indeks={indeks} koder={andre} laereplaner={laereplaner} tittel={t('opplaeringslop.tilbud.andreKoder')} hoyre={formaterTall(andre.length)} dempet />
      </>
    );
  }
  return (
    <Fagvalgrad
      indeks={indeks}
      koder={del.kandidater}
      laereplaner={laereplaner}
      // Programfag til valg kan tas fra hele utdanningsprogrammet. De grupperes etter programområde.
      {...(del.kategori === 'valgfritt' ? { trinn } : {})}
      tittel={del.antall ? t('opplaeringslop.tilbud.velgAntall', { antall: formaterTall(del.antall) }) : kortLinje(del.linje, malform)}
      under={t('opplaeringslop.tilbud.blantFag', { antall: formaterTall(del.kandidater.length) })}
      hoyre={formaterTall(del.timer)}
    />
  );
}

/**
 * En tilpasset ordning (en kolonne i rundskrivet) med fagene delt i tre: fag som ikke er med, fag som kommer til,
 * og fag med andre timer enn i den ordinære fordelingen. «–» i rundskrivet betyr at faget ikke er med (eier 02.10.2026).
 * Linjenavnene står på valgt målform når de er oversatt (se navn.ts).
 */
function Tilpasningen({ tilpasning, ordinart }: { tilpasning: Tilpasning; ordinart: number | null }) {
  const { t, malform } = useTekst();
  const navn = ordning(tilpasning.navn);
  const ln = (l: Tilpasning['linjer'][number]) => linjenavn(l.linje, malform).tekst;
  const med = (n: number | null) => n !== null && n > 0;
  const grupper = [
    { nokkel: 'ikkeMed', linjer: tilpasning.linjer.filter((l) => med(l.ordinar) && !med(l.timer)), tekst: (l: Tilpasning['linjer'][number]) => t('opplaeringslop.tilbud.tilpasningFag', { linje: ln(l), timer: formaterTall(l.ordinar ?? 0) }) },
    { nokkel: 'kommerTil', linjer: tilpasning.linjer.filter((l) => !med(l.ordinar) && med(l.timer)), tekst: (l: Tilpasning['linjer'][number]) => t('opplaeringslop.tilbud.tilpasningFag', { linje: ln(l), timer: formaterTall(l.timer ?? 0) }) },
    {
      nokkel: 'endret',
      linjer: tilpasning.linjer.filter((l) => med(l.ordinar) && med(l.timer)),
      tekst: (l: Tilpasning['linjer'][number]) => t('opplaeringslop.tilbud.tilpasningEndret', { linje: ln(l), fra: formaterTall(l.ordinar ?? 0), til: formaterTall(l.timer ?? 0) }),
    },
  ] as const;
  return (
    <section class="tilpasning">
      <h3 class="tilpasning-tittel">
        {navn ? <span>{t(`opplaeringslop.tilbud.tilpasningNavn.${navn}`)}</span> : <span lang="nb">{tilpasning.navn}</span>}
        {tilpasning.total !== null && (
          <span class="tilpasning-total tall">
            {ordinart !== null && ordinart !== tilpasning.total
              ? t('opplaeringslop.tilbud.tilpasningTotalOrdinart', { timer: formaterTall(tilpasning.total), ordinart: formaterTall(ordinart) })
              : t('opplaeringslop.tilbud.tilpasningTotal', { timer: formaterTall(tilpasning.total) })}
          </span>
        )}
      </h3>
      <dl class="tilpasning-grupper">
        {grupper.map(
          (g) =>
            g.linjer.length > 0 && (
              <div key={g.nokkel}>
                <dt>{t(`opplaeringslop.tilbud.tilpasningGruppe.${g.nokkel}`)}</dt>
                {g.linjer.map((l) => (
                  <dd key={l.linje} {...(linjenavn(l.linje, malform).kilde ? { lang: 'nb' } : {})}>
                    {g.tekst(l)}
                  </dd>
                ))}
              </div>
            ),
        )}
      </dl>
    </section>
  );
}

/** Avvik mellom rundskrivet og Grep som en nøytral merknad (eier 02.10.2026). Teksten følger dataene. */
function Avviksmerknad({ avvik }: { avvik: readonly Avvik[] }) {
  const { t, malform } = useTekst();
  const tekster = avvik.flatMap((a) => {
    switch (a.type) {
      case 'fellesfagTimer':
        return [t('opplaeringslop.tilbud.avvik.fellesfagTimer', { linje: linjenavn(a.linje, malform).tekst, rundskriv: formaterTall(a.rundskriv), grep: a.grep.map((n) => formaterTall(n)).join(', ') })];
      case 'ingenFagkode':
        return [t('opplaeringslop.tilbud.avvik.ingenFagkode', { linje: linjenavn(a.linje, malform).tekst })];
      case 'ingenProgramfag':
        return [t('opplaeringslop.tilbud.avvik.ingenProgramfag')];
      case 'programfagTimer':
        return [t('opplaeringslop.tilbud.avvik.programfagTimer', { rundskriv: formaterTall(a.rundskriv), grep: formaterTall(a.grep) })];
      // Når kodene er hentet fra et annet tilbud, står det allerede under fagene.
      case 'ingenFellesfag':
        return a.lant ? [] : [t('opplaeringslop.tilbud.avvik.ingenFellesfag')];
      case 'sum':
        return [t('opplaeringslop.tilbud.avvik.sum', { sum: formaterTall(a.sum), totalt: formaterTall(a.totalt) })];
      // Ukjente linjer fanges av testene og kontrollsaken.
      case 'ukjentLinje':
        return [];
    }
  });
  if (tekster.length === 0) return null;
  return (
    <div class="merknad tilbud-avvik">
      {tekster.map((tekst) => (
        <p key={tekst}>{tekst}</p>
      ))}
    </div>
  );
}

/** Fordelingen av timene som en stolpe i fargene til fagtypene, med tallene i en forklaring under. */
function Sammensetning({ tb }: { tb: Tilbudsdata }) {
  const { t } = useTekst();
  const deler = KATEGORIER.map((k) => ({ ...k, timer: tb.deler.filter((d) => d.kategori === k.kategori).reduce((s, d) => s + d.timer, 0) })).filter((k) => k.timer > 0);
  if (tb.sum <= 0) return null;
  const tekst = deler.map((d) => `${t(`opplaeringslop.tilbud.kategori.${d.kategori}`)} ${formaterTall(d.timer)}`).join(', ');
  return (
    <section class="nokkeltall-kort tilbud-sammensetning" aria-label={t('opplaeringslop.tilbud.sammensetning')}>
      <div class="tilbud-totalt">
        <span class="nokkeltall-verdi tall">{formaterTall(tb.sum)}</span>
        <span class="nokkeltall-enhet">{t('opplaeringslop.tilbud.timerHjelp')}</span>
      </div>
      <div class="tilbud-stolpe" role="img" aria-label={tekst}>
        {deler.map((d) => (
          <span key={d.kategori} data-fagtype={d.farge} style={{ flexGrow: d.timer }} />
        ))}
      </div>
      <ul class="tilbud-forklaring">
        {deler.map((d) => (
          <li key={d.kategori} data-fagtype={d.farge}>
            <span class="tilbud-forklaring-farge" aria-hidden="true" />
            {t(`opplaeringslop.tilbud.kategori.${d.kategori}`)} <span class="tall">{formaterTall(d.timer)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Fagene i rubrikker per kategori. Vurderingskoder (muntlig, tverrfaglig eksamen) og alternativer står nederst i rubrikken. */
function Fagrubrikker({ kode, tb, indeks, laereplaner }: { kode: string; tb: Tilbudsdata; indeks: Fagindeks; laereplaner: Readonly<Record<string, string>> }) {
  const { t, malform } = useTekst();
  return (
    <>
      {KATEGORIER.map(({ kategori, farge }) => {
        const deler = tb.deler.filter((d) => d.kategori === kategori);
        if (deler.length === 0) return null;
        const timer = deler.reduce((s, d) => s + d.timer, 0);
        const fagdeler = deler.filter((d): d is Fagdel => d.type === 'fag');
        const vurdering = fagdeler.flatMap((d) => d.vurdering);
        const alternativer = fagdeler.flatMap((d) => d.alternativer);
        return (
          <Rubrikk
            key={kategori}
            nokkel={`lop-${kortKode(kode)}-${kategori}`}
            tittel={t(`opplaeringslop.tilbud.kategori.${kategori}`)}
            // Opplæring i bedrift har ikke timer i rundskrivet. Da står det ingenting i stedet for «0 timer».
            hoyre={timer > 0 ? t('opplaeringslop.tilbud.timer', { timer: formaterTall(timer) }) : undefined}
            farge={farge}
          >
            <Avviksmerknad avvik={fagdeler.flatMap((d) => d.avvik)} />
            <ul class="fagrader">
              {deler.map((d, i) =>
                d.type === 'plass' ? (
                  <Plass key={i} del={d} indeks={indeks} laereplaner={laereplaner} trinn={indeks.programomrader[kode]?.trinn ?? ''} />
                ) : kategori === 'fellesfag' ? (
                  <Fellesfag key={i} del={d} indeks={indeks} laereplaner={laereplaner} />
                ) : (
                  <Programfag key={i} del={d} indeks={indeks} laereplaner={laereplaner} />
                ),
              )}
              {/* Tverrfaglig eksamen og muntlige koder står dempet nederst, som egne rader: få vises med en gang. */}
              {kategori === 'felles_programfag' && vurdering.length <= 3
                ? vurdering.map((k) => <Fagrad key={k} navn={indeks.fag[k]?.navn[malform] ?? k} timer={null} href={`#/fag/${k}`} under={k} dempet />)
                : vurdering.length > 0 && (
                    <Fagvalgrad indeks={indeks} koder={vurdering} laereplaner={laereplaner} tittel={t('opplaeringslop.tilbud.vurderingskoder')} hoyre={formaterTall(vurdering.length)} dempet />
                  )}
              {alternativer.length > 0 && (
                <Fagvalgrad indeks={indeks} koder={alternativer} laereplaner={laereplaner} tittel={t('opplaeringslop.tilbud.alternativer')} hoyre={formaterTall(alternativer.length)} dempet />
              )}
            </ul>
          </Rubrikk>
        );
      })}
    </>
  );
}

/**
 * Fagene med fast fagkode (fellesfag og felles programfag) til en ny, ulagret arbeidsplan, hvert fag som egen gruppe
 * med årstimene. Velger eleven ett av noen få fag (f.eks. 1P eller 1T, eller 2P, R1 eller S1), legges bare det første
 * inn (eier 03.10.2026). Fremmedspråk og andre fag eleven velger, må brukeren legge inn selv (eier 02.10.2026).
 */
function faglinjerTilArbeidsplan(tb: Tilbudsdata, kode: string, indeks: Fagindeks, koblingsdata: NonNullable<ReturnType<typeof useKoblingsdata>>) {
  const po = indeks.programomrader[kode];
  const faste = tb.deler.flatMap((d) => {
    if (d.type !== 'fag') return [];
    if (d.kategori === 'fellesfag') return d.koder.length <= FAA && d.koder[0] ? [{ kode: d.koder[0], timer: d.koder.length === 1 ? d.timer : (indeks.fag[d.koder[0]]?.timer ?? d.timer) }] : [];
    return d.koder.map((k) => ({ kode: k, timer: indeks.fag[k]?.timer ?? null }));
  });
  return faste.flatMap(({ kode: k, timer }) => {
    const fag = indeks.fag[k];
    if (!fag) return [];
    const valg = po ? { program: po.program, trinn: po.trinn } : {};
    const r = finnKobling(k, indeks, koblingsdata.tabeller, koblingsdata.rader, valg);
    return [{ ...nyGruppe(), arsrammer: [fagvalgFraKobling(k, fag.navn, timer, r)], arstimer: timer, arstimerAuto: timer !== null }];
  });
}

function TilArbeidsplan({ kode, tb, indeks }: { kode: string; tb: Tilbudsdata; indeks: Fagindeks }) {
  const { t } = useTekst();
  const koblingsdata = useKoblingsdata();
  if (!koblingsdata || !tb.deler.some((d) => d.type === 'fag')) return null;
  return (
    <div class="tilbud-arbeidsplan">
      <a
        class="knapp knapp-sekundaer knapp-liten"
        href="#/arbeidstid/arbeidsplan"
        onClick={(e) => {
          e.preventDefault();
          overforSkjema('arbeidsplan', { grupper: faglinjerTilArbeidsplan(tb, kode, indeks, koblingsdata) });
          naviger('/arbeidstid/arbeidsplan');
        }}
      >
        <Ikon navn="kalkulator" class="ikon-liten" />
        {t('opplaeringslop.tilbud.tilArbeidsplan')}
      </a>
      <p class="liten dempet">{t('opplaeringslop.tilbud.tilArbeidsplanHjelp')}</p>
    </div>
  );
}

/** Kildene som mangler et løp, som tekst: «Står ikke i VIGO og utdanning.no» (avgjørelse 052). */
function ikkeI(t: T, kilder: readonly Lopkilde[]): string {
  const navn = kilder.map((k) => t(`opplaeringslop.tilbud.lopkilde.${k}`));
  const liste = navn.length > 1 ? `${navn.slice(0, -1).join(', ')} ${t('opplaeringslop.tilbud.og')} ${navn.at(-1)}` : (navn[0] ?? '');
  return t('opplaeringslop.tilbud.ikkeI', { kilder: liste });
}

/**
 * Tilbudene under en overskrift som kan legges sammen, f.eks. «Videre». Lange lister er lukket fra start. Et løp som
 * Grep, VIGO og utdanning.no ikke er enige om, får en merknad om hvilke kilder som mangler det (avgjørelse 052).
 */
function Tilbudsliste({
  nokkel,
  tittel,
  koder,
  indeks,
  via,
  uenig = {},
}: {
  nokkel: string;
  tittel: string;
  koder: readonly string[];
  indeks: Fagindeks;
  via?: string;
  uenig?: Readonly<Record<string, readonly Lopkilde[]>>;
}) {
  const { t } = useTekst();
  if (koder.length === 0) return null;
  return (
    <Rubrikk nokkel={nokkel} tittel={tittel} hoyre={formaterTall(koder.length)} lukket={koder.length > MANGE_TILBUD}>
      <ul class="liste">
        {koder.map((k) => (
          <li key={k}>
            <Tilbudslenke
              indeks={indeks}
              kode={k}
              {...(via ? { via } : {})}
              {...(uenig[k] ? { under: <span class="lop-uenig"> · {ikkeI(t, uenig[k] ?? [])}</span> } : {})}
            />
          </li>
        ))}
      </ul>
    </Rubrikk>
  );
}

/** Høyst så mange treff i søket etter Vg2 med opphentingsfag. */
const MAKS_TREFF = 8;

/**
 * Overgang fra et studieforberedende Vg1 til Vg2 på yrkesfag med et opphentingsfag (Yrkesfaglig opphenting, eier
 * 03.10.2026). Mange Vg2 kan følge, så de står ikke som liste, men kan søkes fram.
 */
function Opphenting({ tb, indeks, via }: { tb: Tilbudsdata; indeks: Fagindeks; via: string }) {
  const { t, malform } = useTekst();
  const id = useId();
  const [sok, settSok] = useState('');
  if (tb.opphenting.til.length === 0) return null;
  const ord = normaliser(sok).split(' ').filter(Boolean);
  const treff =
    ord.length === 0
      ? []
      : tb.opphenting.til.filter((k) => {
          const tekst = normaliser(`${tilbudsnavn(t, indeks, k, malform)} ${indeks.utdanningsprogram[indeks.programomrader[k]?.program ?? '']?.[malform] ?? ''} ${kortKode(k)}`);
          return ord.every((o) => tekst.includes(o));
        });
  return (
    <section class="merknad opphenting" aria-labelledby={`${id}-tittel`}>
      <h2 id={`${id}-tittel`} class="liten-overskrift">
        {t('opplaeringslop.tilbud.opphenting.tittel')}
      </h2>
      <p>
        {t('opplaeringslop.tilbud.opphenting.tekst', { antall: formaterTall(tb.opphenting.til.length) })}{' '}
        {tb.opphenting.fag.map((f, i) => (
          <span key={f}>
            {i > 0 && ', '}
            <a href={`#/fag/${f}`}>{indeks.fag[f]?.navn[malform] ?? f}</a>
          </span>
        ))}
        .
      </p>
      <div class="felt">
        <label for={id}>{t('opplaeringslop.tilbud.opphenting.sok')}</label>
        <div class="sokefelt">
          <Ikon navn="sok" class="sokefelt-ikon" />
          <input id={id} type="search" autoComplete="off" enterKeyHint="search" value={sok} onInput={(e) => settSok(e.currentTarget.value)} />
        </div>
      </div>
      {ord.length > 0 && (
        <p role="status" class="dempet liten">
          {treff.length === 0 ? t('opplaeringslop.tilbud.opphenting.ingenTreff') : t('opplaeringslop.tilbud.opphenting.antall', { antall: formaterTall(treff.length) })}
        </p>
      )}
      {treff.length > 0 && (
        <ul class="liste">
          {treff.slice(0, MAKS_TREFF).map((k) => (
            <li key={k}>
              <Tilbudslenke indeks={indeks} kode={k} via={via} />
            </li>
          ))}
        </ul>
      )}
      {treff.length > MAKS_TREFF && <p class="dempet liten">{t('opplaeringslop.tilbud.opphenting.flere', { antall: formaterTall(treff.length - MAKS_TREFF) })}</p>}
    </section>
  );
}

/**
 * Skolene med tilbudet etter utdanning.no: om skolen brukeren har valgt, har det, og lenker til skoleregisteret for
 * fylket og hele landet (avgjørelse 053).
 */
function Skoler({ kode }: { kode: string }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const register = useSkoler();
  if (!register || register.skoler.length === 0) return null;
  const fylke = fylkesnavn(innstillinger.fylke) ? innstillinger.fylke : null;
  const valgt = valgtSkole(register.skoler, innstillinger.skole?.id);
  const iFylket = fylke ? antallMedTilbud(register.skoler, kode, fylke) : null;
  const iLandet = antallMedTilbud(register.skoler, kode, null);
  const k = kortKode(kode);
  const fylkenavn = fylkesnavn(fylke) ?? '';
  const har = valgt?.tilbud.includes(kode) ?? false;
  return (
    <Rubrikk nokkel={`lop-${k}-skoler`} tittel={t('opplaeringslop.tilbud.skolerOverskrift')} hoyre={formaterTall(iFylket ?? iLandet)}>
      {valgt && (
        <p class={`lop-skolestatus${har ? ' lop-skolestatus-ja' : ''}`}>
          <Ikon navn={har ? 'hake' : 'info'} class="ikon-liten" />
          {t(har ? 'opplaeringslop.tilbud.dinSkoleHar' : 'opplaeringslop.tilbud.dinSkoleHarIkke', { skole: valgt.navn })}
        </p>
      )}
      {iLandet === 0 ? (
        <p>{t('opplaeringslop.tilbud.ingenSkoler')}</p>
      ) : (
        <ul class="liste">
          {fylke && iFylket === 0 && (
            <li>
              <p class="dempet">{t('opplaeringslop.tilbud.ingenSkolerFylke', { fylke: fylkenavn })}</p>
            </li>
          )}
          {fylke && iFylket !== null && iFylket > 0 && (
            <li>
              <a class="listelenke" href={lenke('/opplaeringslop/skoler', { tilbud: k, fylke })}>
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">
                    {iFylket === 1 ? t('opplaeringslop.tilbud.skolerFylkeEn', { fylke: fylkenavn }) : t('opplaeringslop.tilbud.skolerFylke', { antall: formaterTall(iFylket), fylke: fylkenavn })}
                  </span>
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </li>
          )}
          <li>
            <a class="listelenke" href={lenke('/opplaeringslop/skoler', { tilbud: k })}>
              <span class="listelenke-tekst">
                <span class="listelenke-tittel">
                  {iLandet === 1 ? t('opplaeringslop.tilbud.skolerLandetEn') : t('opplaeringslop.tilbud.skolerLandet', { antall: formaterTall(iLandet) })}
                </span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        </ul>
      )}
      <p class="liten dempet">{t('opplaeringslop.tilbud.skolerHjelp')}</p>
    </Rubrikk>
  );
}

/** Yrkene utdanning.no knytter til tilbudet, med den korte teksten om sluttkompetansen (avgjørelse 053). */
function Yrkene({ kode }: { kode: string }) {
  const { t } = useTekst();
  const [yrker, settYrker] = useState<Yrker | null>(null);
  useEffect(() => {
    lastYrker().then(settYrker, () => undefined);
  }, []);
  const u = yrker?.programomrader[kode];
  if (!u) return null;
  return (
    <Rubrikk nokkel={`lop-${kortKode(kode)}-yrker`} tittel={t('opplaeringslop.tilbud.yrkerOverskrift')} hoyre={formaterTall(u.yrker.length)}>
      {/* Teksten er fra utdanning.no og finnes bare på bokmål. */}
      {u.tekst && <p lang="nb">{u.tekst}</p>}
      <ul class="lop-yrker">
        {u.yrker.map((y) => (
          <li key={y.sti}>
            <a class="ekstern-lenke" href={`${UTDANNING}${y.sti}`} target="_blank" rel="noopener noreferrer" lang="nb">
              {y.tittel}
              <Ikon navn="ekstern" class="ikon-liten" />
              <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted: 'utdanning.no' })}</span>
            </a>
          </li>
        ))}
      </ul>
      <p>
        <a class="ekstern-lenke" href={`${UTDANNING}${u.sti}`} target="_blank" rel="noopener noreferrer">
          {t('opplaeringslop.tilbud.utdanningsbeskrivelse', { tittel: u.tittel })}
          <Ikon navn="ekstern" class="ikon-liten" />
        </a>
      </p>
      <p class="liten dempet">{t('opplaeringslop.tilbud.yrkerHjelp')}</p>
    </Rubrikk>
  );
}

/** Opplæringskontorene i fylket brukeren har valgt, eller i hele landet, etter NOR (avgjørelse 053). */
function Kontorene({ kode }: { kode: string }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [data, settData] = useState<Opplaeringskontorer | null>(null);
  useEffect(() => {
    lastOpplaeringskontor().then(settData, () => undefined);
  }, []);
  if (!data) return null;
  const fylke = fylkesnavn(innstillinger.fylke) ? innstillinger.fylke : null;
  const antall = fylke ? data.kontor.filter((k) => k.godkjentI.includes(fylke)).length : data.kontor.length;
  return (
    <Rubrikk nokkel={`lop-${kortKode(kode)}-kontor`} tittel={t('opplaeringslop.tilbud.kontorOverskrift')} hoyre={formaterTall(antall)} lukket>
      <ul class="liste">
        <li>
          <a class="listelenke" href={lenke('/opplaeringslop/opplaeringskontor', fylke ? { fylke } : undefined)}>
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">
                {fylke ? t('opplaeringslop.tilbud.kontorFylke', { antall: formaterTall(antall), fylke: fylkesnavn(fylke) ?? '' }) : t('opplaeringslop.tilbud.kontorLandet', { antall: formaterTall(antall) })}
              </span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
      <p class="liten dempet">{t('opplaeringslop.tilbud.kontorHjelp')}</p>
    </Rubrikk>
  );
}

const UTDANNING = 'https://utdanning.no';

function Vilbli({ kode, indeks, via, bygger, utdanning }: { kode: string; indeks: Fagindeks; via: string | null; bygger: readonly string[]; utdanning: string | null }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const fylke = fylkesnavn(innstillinger.fylke);
  const skoler = vilbliLenke(kode, indeks, { side: 'p5', fylke, via, bygger });
  const fordeling = vilbliLenke(kode, indeks, { side: 'p2', via, bygger });
  if (!skoler) return null;
  return (
    <Rubrikk nokkel={`lop-${kortKode(kode)}-vilbli`} tittel={utdanning ? t('opplaeringslop.tilbud.vilbliUtdanningOverskrift') : t('opplaeringslop.tilbud.vilbliOverskrift')}>
      <p>
        <a class="ekstern-lenke" href={skoler} target="_blank" rel="noopener noreferrer">
          {fylke ? t('opplaeringslop.tilbud.vilbliFylke', { fylke }) : t('opplaeringslop.tilbud.vilbli')}
          <Ikon navn="ekstern" class="ikon-liten" />
        </a>
      </p>
      {fordeling && (
        <p>
          <a class="ekstern-lenke" href={fordeling} target="_blank" rel="noopener noreferrer">
            {t('opplaeringslop.tilbud.vilbliFordeling')}
            <Ikon navn="ekstern" class="ikon-liten" />
          </a>
        </p>
      )}
      {utdanning && (
        <p>
          <a class="ekstern-lenke" href={`${UTDANNING}/utdanning/vgs/${encodeURIComponent(utdanning)}`} target="_blank" rel="noopener noreferrer">
            {t('opplaeringslop.tilbud.utdanningLenke')}
            <Ikon navn="ekstern" class="ikon-liten" />
          </a>
        </p>
      )}
      <p class="liten dempet">{t('opplaeringslop.tilbud.vilbliHjelp')}</p>
    </Rubrikk>
  );
}

export default function Tilbud({ parametre, sporring }: SideProps) {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const [laereplaner, settLaereplaner] = useState<Readonly<Record<string, string>>>({});
  useEffect(() => {
    lastFagroller().then(
      (r) => settLaereplaner(r.laereplaner),
      () => undefined,
    );
  }, []);
  const kode = fullKode(parametre.tilbud ?? '');
  const via = sporring.get('via');
  const viaKode = via ? fullKode(via) : null;
  if (typeof data === 'string') {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('opplaeringslop.tittel')}</h1>
        <Lasting data={data} provIgjen={provIgjen} />
      </div>
    );
  }
  const { indeks } = data;
  const po = indeks.programomrader[kode];
  const tb = data.tilbud.tilbud[kode];
  if (!po || !tb) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('opplaeringslop.ikkeFunnet')}</h1>
      </div>
    );
  }
  const k = kortKode(kode);
  // Påbygging står under programmet brukeren kom fra.
  const program = (viaKode && indeks.programomrader[viaKode]?.program) || po.program;
  return (
    <article class="side tilbudsside" data-sted={po.sted}>
      <Brodsmuler
        ledd={[
          { tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' },
          { tekst: indeks.utdanningsprogram[program]?.[malform] ?? program, href: `#/opplaeringslop/${program}` },
        ]}
      />
      <h1 tabIndex={-1}>{po.navn[malform]}</h1>
      <ul class="merker fagark-merker" aria-label={t('opplaeringslop.tittel')}>
        <li class="merke merke-kode">{k}</li>
        <li class="merke">{visningstrinnTekst(t, kode, po.trinn)}</li>
        <li class="merke">{t(`opplaeringslop.sted.${po.sted}`)}</li>
      </ul>

      {tb.deler.length > 0 ? (
        <>
          <Sammensetning tb={tb} />
          <Avviksmerknad avvik={tb.avvik.filter((a) => a.type === 'ingenFellesfag' || a.type === 'sum')} />
          <Fagrubrikker kode={kode} tb={tb} indeks={indeks} laereplaner={laereplaner} />
          <TilArbeidsplan kode={kode} tb={tb} indeks={indeks} />
        </>
      ) : (
        <p class="merknad">{po.sted === 'bedrift' ? t('opplaeringslop.tilbud.bedrift') : t('opplaeringslop.tilbud.utenTabell')}</p>
      )}

      {tb.tilpasninger.length > 0 && (
        <Rubrikk nokkel={`lop-${k}-tilpasninger`} tittel={t('opplaeringslop.tilbud.tilpasningerTittel')} hoyre={formaterTall(tb.tilpasninger.length)} lukket>
          <p class="liten dempet">{t('opplaeringslop.tilbud.tilpasningHjelp')}</p>
          {tb.tilpasninger.map((p) => (
            <Tilpasningen key={p.navn} tilpasning={p} ordinart={tb.totalt} />
          ))}
        </Rubrikk>
      )}

      <Tilbudsliste nokkel={`lop-${k}-bygger`} tittel={t('opplaeringslop.tilbud.byggerPaa')} koder={tb.fra} indeks={indeks} uenig={tb.uenig} />
      <Tilbudsliste nokkel={`lop-${k}-videre`} tittel={t('opplaeringslop.tilbud.videre')} koder={skoleForst(tb.videre, indeks)} indeks={indeks} uenig={tb.uenig} />
      <Tilbudsliste nokkel={`lop-${k}-pabygging`} tittel={t('opplaeringslop.tilbud.pabygging')} koder={tb.pabygging} indeks={indeks} via={kode} uenig={tb.uenig} />
      <Tilbudsliste nokkel={`lop-${k}-kryssfra`} tittel={t('opplaeringslop.tilbud.kryssFra')} koder={tb.kryssFra} indeks={indeks} uenig={tb.uenig} />
      <Tilbudsliste nokkel={`lop-${k}-kryss`} tittel={t('opplaeringslop.tilbud.kryssTil')} koder={tb.kryssTil} indeks={indeks} uenig={tb.uenig} />
      <Tilbudsliste
        nokkel={`lop-${k}-opphenting-fra`}
        tittel={t('opplaeringslop.tilbud.opphenting.fra', { fag: tb.opphenting.fag.map((f) => indeks.fag[f]?.navn[malform] ?? f).join(', ') })}
        koder={tb.opphenting.fra}
        indeks={indeks}
      />
      <Opphenting tb={tb} indeks={indeks} via={kode} />
      {Object.keys(tb.uenig).length > 0 && (
        <Forklaring tittel={t('opplaeringslop.tilbud.uenigTittel')}>
          <p>{t('opplaeringslop.tilbud.uenigTekst')}</p>
        </Forklaring>
      )}

      {po.sted === 'bedrift' ? (
        <>
          <Yrkene kode={kode} />
          <Kontorene kode={kode} />
        </>
      ) : (
        <>
          <Skoler kode={kode} />
          <Yrkene kode={kode} />
        </>
      )}
      <Vilbli kode={kode} indeks={indeks} via={viaKode} bygger={[...tb.fra, ...tb.kryssFra]} utdanning={tb.utdanning} />

      <p class="liten">
        <a href="#/begreper/programomrade">{t('opplaeringslop.tilbud.omProgramomrade')}</a>
      </p>
      <Kildeliste
        kilder={[
          { id: 'udir-grep', punkt: k },
          ...(tb.tabell ? [{ id: 'udir-fag-og-timefordeling', punkt: `Tabell ${tb.tabell.nr}` }] : []),
          ...(tb.fraVigo ? [{ id: 'vigo-kodeverk', punkt: 'Grunnlag for inntak (entry-requirements)' }] : []),
          po.sted === 'bedrift' ? { id: 'udir-nor' } : { id: 'utdanning-no', punkt: 'Skoler' },
        ]}
      />
    </article>
  );
}
