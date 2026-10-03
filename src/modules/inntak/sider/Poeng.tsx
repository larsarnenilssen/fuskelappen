// Poengberegning ved inntak (fase 5, pakke 3, avgjørelse 047). Trinnet søkeren søker til står i adressen
// (`?trinn=vg2`). Til Vg1 står fagene på vitnemålet fra grunnskolen ferdig. Til Vg2 og Vg3 legges karakterene inn
// rad for rad, med en annen karakter i samme fag (privatist eller omvalg) når det trengs. Resultatet viser
// utregningen trinn for trinn med kilde, og reglene står under, lukket til brukeren åpner dem.
import { useEffect, useMemo, useState } from 'preact/hooks';
import { beholdRullingVedNesteNavigasjon, lenke } from '../../../app/ruter.ts';
import { type T, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Resultatkort, type Utregningssteg } from '../../../components/Resultatkort.tsx';
import { formaterTall, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { KildeRef } from '../../../core/innhold/skjema.ts';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentLokaleNokler, hentSupplerende, type Oppslag } from '../../../core/regler/index.ts';
import { Skjemadel } from '../../arbeidstid/komponenter/Skjemadel.tsx';
import { useHent, useRegelkontekst, useSkjematilstand } from '../../arbeidstid/kontekst.ts';
import type { SideProps } from '../../typer.ts';
import { GRUNNSKOLEFAG, GRUNNSKOLEFAG_KILDER, type Grunnskolefag } from '../beregning/grunnskolefag.ts';
import { beregnVg1, beregnVg2Vg3, type Karakterrad, type Karaktertype, type Poengresultat, type Poengsteg, type Vurdering } from '../beregning/poeng.ts';
import { type Fellesfag, lopsrader, type Lopsrad, programomraderVg2, UTDANNINGSPROGRAM } from '../beregning/lop.ts';
import { lastFagfordeling } from '../../../data/fagfordeling.ts';
import { hentInnhold, poengRute, type Inntaksinnhold } from '../innhold.ts';
import type { Fagfordeling } from '../../fag/tilbud/skjema.ts';
import { Lokalmerknad } from './Lokalmerknad.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

type Trinn = 'vg1' | 'vg2' | 'vg3';
const TRINN: readonly Trinn[] = ['vg1', 'vg2', 'vg3'];

/**
 * Tilleggspoengene står som tilleggspoeng_<gruppe>_<nr> i fylkets regelfil (Vestland: rules/inntak/vestland-2024.yaml).
 * Kalkulatoren finner dem selv, så et nytt fylke trenger bare en regelfil.
 */
const TILLEGG_PREFIKS = 'inntak.tilleggspoeng_';

/** En karakter i skjemaet: '' er tomt, ellers «1»–«6», «IV», «IM», «fritak» eller «deltatt». */
type Felt = string;

interface Rad {
  type: Karaktertype;
  v: Felt;
  /** Annen karakter i samme fag, eller null når den ikke er lagt til. */
  annen: Felt | null;
  erstattet: boolean;
  /** Faget når raden er fylt inn fra et løp: et fellesfag (navnet står i strings) eller et programfag fra Udir-1. */
  fellesfag?: Fellesfag | null;
  programfag?: string | null;
}

interface Skjema {
  standpunkt: Partial<Record<Grunnskolefag, Felt>>;
  eksamen: Felt[];
  valgfag: Felt[];
  valgfagErstattet: boolean;
  tillegg: string;
  vg1: Rad[];
  vg2: Rad[];
  /** Utdanningsprogrammet på Vg1 (kode) og programområdet på Vg2 (yrkesfag), eller '' for blankt ark. */
  lop1: string;
  lop2: string;
}

const tomRad = (type: Karaktertype = 'standpunkt'): Rad => ({ type, v: '', annen: null, erstattet: false });
const nyeRader = (n: number) => Array.from({ length: n }, () => tomRad());

const start = (): Skjema => ({
  standpunkt: {},
  eksamen: ['', ''],
  valgfag: ['', '', ''],
  valgfagErstattet: false,
  tillegg: '',
  vg1: nyeRader(8),
  vg2: nyeRader(8),
  lop1: '',
  lop2: '',
});

/** Radene for et løp, med tomme rader under til programfag og annet som ikke står i løpet. */
const fraLop = (rader: readonly Lopsrad[]): Rad[] => [
  ...rader.map((r): Rad => ({ ...tomRad(r.type), fellesfag: r.fag, programfag: r.programfag })),
  ...nyeRader(3),
];

function lesFelt(f: Felt | null | undefined): Vurdering | null {
  if (!f) return null;
  const n = Number(f);
  return Number.isInteger(n) && n >= 1 && n <= 6 ? (n as Vurdering) : (f as Vurdering);
}

// Faget følger med, så halvårsvurderingen fra Vg1 i et fag med halvår også på Vg2 ikke teller til Vg3 (poeng.ts).
const tilRad = (r: Rad, trinn: 'Vg1' | 'Vg2'): Karakterrad => {
  const fag = r.fellesfag ?? r.programfag ?? null;
  return { type: r.type, vurdering: lesFelt(r.v), annen: lesFelt(r.annen), trinn, erstattet: r.erstattet, ...(fag ? { fag } : {}) };
};

/** Valgene i en karaktervelger. Tallene først, så det som ikke er en karakter. */
const VALG = {
  standpunkt: ['6', '5', '4', '3', '2', '1', 'IV', 'fritak'],
  eksamen: ['6', '5', '4', '3', '2', '1', 'IM', 'fritak'],
  valgfag: ['6', '5', '4', '3', '2', '1', 'IV'],
  vgs: ['6', '5', '4', '3', '2', '1', 'IV', 'IM', 'fritak', 'deltatt'],
} as const;

function Karaktervelger({ verdi, valg, etikett, onEndre }: { verdi: Felt; valg: readonly string[]; etikett: string; onEndre: (v: Felt) => void }) {
  const { t } = useTekst();
  return (
    <select class="poeng-velger tall" value={verdi} aria-label={etikett} onChange={(e) => onEndre((e.target as HTMLSelectElement).value)}>
      <option value="">{t('inntak.poeng.vurdering.tom')}</option>
      {valg.map((v) => (
        <option key={v} value={v}>
          {/^\d$/.test(v) ? v : t(`inntak.poeng.vurderingLang.${v as 'IV' | 'IM' | 'fritak' | 'deltatt'}`)}
        </option>
      ))}
    </select>
  );
}

/** Antall utfylte felt, til summen i overskriften på en del. */
const utfylt = (felt: readonly (Felt | null | undefined)[]) => felt.filter((f) => f).length;

export default function Poeng({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const hent = useHent();
  const kontekst = useRegelkontekst();
  const [innhold, settInnhold] = useState<Inntaksinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const [s, sett] = useSkjematilstand<Skjema>('inntak-poeng', start);
  const endre = (del: Partial<Skjema>) => sett((g) => ({ ...g, ...del }));
  const trinn: Trinn = TRINN.includes(sporring.get('trinn') as Trinn) ? (sporring.get('trinn') as Trinn) : 'vg1';
  // Fag- og timefordelingen lastes når kalkulatoren regner til Vg2 eller Vg3.
  const [fordeling, settFordeling] = useState<Fagfordeling | null>(null);
  useEffect(() => {
    if (trinn !== 'vg1') void lastFagfordeling().then(settFordeling, () => undefined);
  }, [trinn]);

  // Tilleggspoengene finnes bare i fylker som har dem (Vestland), og bare til Vg1.
  const tillegg = useMemo(
    () =>
      (() => {
        try {
          return hentLokaleNokler(TILLEGG_PREFIKS, kontekst).flatMap((full) => {
            const g = hentSupplerende(full, kontekst);
            const o = g.skole[0] ?? g.fylke[0];
            return o ? [{ nokkel: full.slice('inntak.'.length), oppslag: o }] : [];
          });
        } catch {
          return [];
        }
      })(),
    [kontekst],
  );
  const valgtTillegg: Oppslag | null = tillegg.find((x) => x.nokkel === s.tillegg)?.oppslag ?? null;

  const resultat = useMemo((): { r: Poengresultat; tomt: boolean; feil: null } | { feil: string } => {
    try {
      if (trinn === 'vg1') {
        const standpunkt = GRUNNSKOLEFAG.map((f) => lesFelt(s.standpunkt[f]));
        const r = beregnVg1(hent, {
          standpunkt,
          eksamen: s.eksamen.map(lesFelt),
          valgfag: s.valgfag.map(lesFelt),
          valgfagErstattet: s.valgfagErstattet,
          tillegg: valgtTillegg,
        });
        const tomt = standpunkt.every((v) => v === null) && utfylt(s.eksamen) === 0 && (s.valgfagErstattet || utfylt(s.valgfag) === 0);
        return { r, tomt, feil: null };
      }
      // Til Vg2 teller karakterene fra Vg1, til Vg3 også fra Vg2.
      const rader = [...s.vg1.map((r) => tilRad(r, 'Vg1')), ...(trinn === 'vg3' ? s.vg2.map((r) => tilRad(r, 'Vg2')) : [])];
      const r = beregnVg2Vg3(hent, { trinn: trinn === 'vg3' ? 'Vg3' : 'Vg2', rader });
      return { r, tomt: rader.every((x) => x.vurdering === null), feil: null };
    } catch (e) {
      return { feil: e instanceof Error ? e.message : String(e) };
    }
  }, [s, trinn, hent, valgtTillegg]);

  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const regler = innhold ? velgSynlige(innhold.regler, sted) : [];
  const tittel = t('inntak.poeng.tittel');

  return (
    <div class="side kalkulator poeng">
      <Brodsmuler ledd={[{ tekst: t('inntak.tittel'), href: '#/inntak' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{tittel}</h1>
        <FavorittKnapp id="inntak:poeng" navn={tittel} />
      </div>
      <p class="ingress"><Begrepstekst tekst={t('inntak.poeng.innledning')} /></p>
      {innhold && <Lokalmerknad innhold={innhold} />}

      <nav class="frist-filter poeng-trinn" aria-label={t('inntak.poeng.sokerTil')}>
        <p class="liten-overskrift">{t('inntak.poeng.sokerTil')}</p>
        <ul>
          {TRINN.map((x) => (
            <li key={x}>
              <a href={lenke(poengRute, x === 'vg1' ? undefined : { trinn: x })} aria-current={x === trinn ? 'page' : undefined} onClick={beholdRullingVedNesteNavigasjon}>
                {x.toUpperCase().replace('VG', 'Vg')}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div class="kalkulator-flate">
        <div class="kalkulator-skjema">
          {trinn === 'vg1' ? (
            <Vg1Skjema s={s} endre={endre} tillegg={tillegg} />
          ) : (
            <>
              <Lopvelger s={s} sett={sett} fordeling={fordeling} vg3={trinn === 'vg3'} />
              <Radliste
                tittel={t('inntak.poeng.deler.vg1')}
                del="undervisning"
                rader={s.vg1}
                vg3={trinn === 'vg3'}
                trinn="Vg1"
                onEndre={(vg1) => endre({ vg1 })}
              />
              {trinn === 'vg3' && <Radliste tittel={t('inntak.poeng.deler.vg2')} del="tid" rader={s.vg2} vg3 trinn="Vg2" onEndre={(vg2) => endre({ vg2 })} />}
            </>
          )}
        </div>
        <div class="kalkulator-resultat">
          {'feil' in resultat && resultat.feil !== null ? (
            <p class="merknad merknad-advarsel" role="alert">
              {resultat.feil}
            </p>
          ) : (
            <Resultat r={resultat.r} tomt={resultat.tomt} trinn={trinn} tittel={valgtTillegg ? t('inntak.poeng.resultat.samlet') : t('inntak.poeng.resultat.tittel')} />
          )}
        </div>
      </div>

      {regler.length > 0 && (
        <section class="poeng-regler">
          <h2 class="liten-overskrift">{t('inntak.poeng.regler')}</h2>
          {regler.map((r) => (
            <Forklaring key={`${r.gyldighet.niva}-${r.id}`} tittel={r.tittel[malform]}>
              <div class="brodtekst" dangerouslySetInnerHTML={{ __html: r.tekst[malform] }} />
              <Kildeliste kilder={r.kilder} niva={3} />
            </Forklaring>
          ))}
        </section>
      )}
    </div>
  );
}

function Vg1Skjema({ s, endre, tillegg }: { s: Skjema; endre: (d: Partial<Skjema>) => void; tillegg: { nokkel: string; oppslag: Oppslag }[] }) {
  const { t } = useTekst();
  const settListe = (navn: 'eksamen' | 'valgfag', i: number, v: Felt) => endre({ [navn]: s[navn].map((x, n) => (n === i ? v : x)) });
  return (
    <>
      <Skjemadel tittel={t('inntak.poeng.deler.standpunkt')} del="undervisning" sum={String(utfylt(Object.values(s.standpunkt)))}>
        <ul class="poeng-fagliste">
          {GRUNNSKOLEFAG.map((f) => (
            <li key={f} class="poeng-fag">
              <span class="poeng-fagnavn">{t(`inntak.poeng.fag.${f}`)}</span>
              <Karaktervelger
                verdi={s.standpunkt[f] ?? ''}
                valg={VALG.standpunkt}
                etikett={t(`inntak.poeng.fag.${f}`)}
                onEndre={(v) => endre({ standpunkt: { ...s.standpunkt, [f]: v } })}
              />
            </li>
          ))}
        </ul>
        <details class="veiviser-kilder poeng-kilder">
          <summary class="forklaring-knapp">
            <Ikon navn="bok" />
            <span>{t('inntak.poeng.fagKilde')}</span>
            <Ikon navn="ned" class="forklaring-pil" />
          </summary>
          <Kildeliste kilder={GRUNNSKOLEFAG_KILDER} niva={3} utenOverskrift />
        </details>
      </Skjemadel>

      <Skjemadel tittel={t('inntak.poeng.deler.eksamen')} del="tid" sum={String(utfylt(s.eksamen))}>
        <ul class="poeng-fagliste">
          {s.eksamen.map((v, i) => (
            <li key={i} class="poeng-fag">
              <span class="poeng-fagnavn">{t('inntak.poeng.eksamenNr', { nr: String(i + 1) })}</span>
              <Karaktervelger verdi={v} valg={VALG.eksamen} etikett={t('inntak.poeng.eksamenNr', { nr: String(i + 1) })} onEndre={(x) => settListe('eksamen', i, x)} />
            </li>
          ))}
        </ul>
        {s.eksamen.length < 4 && (
          <button type="button" class="lenkeknapp poeng-legg-til" onClick={() => endre({ eksamen: [...s.eksamen, ''] })}>
            <Ikon navn="pluss" class="ikon-liten" />
            {t('inntak.poeng.leggTilEksamen')}
          </button>
        )}
      </Skjemadel>

      <Skjemadel tittel={t('inntak.poeng.deler.valgfag')} del="funksjoner" sum={s.valgfagErstattet ? '–' : String(utfylt(s.valgfag))}>
        <label class="poeng-avkryssing">
          <input type="checkbox" checked={s.valgfagErstattet} onChange={(e) => endre({ valgfagErstattet: (e.target as HTMLInputElement).checked })} />
          {t('inntak.poeng.valgfagErstattet')}
        </label>
        {!s.valgfagErstattet && (
          <ul class="poeng-fagliste">
            {s.valgfag.map((v, i) => (
              <li key={i} class="poeng-fag">
                <span class="poeng-fagnavn">{t('inntak.poeng.valgfagNr', { nr: String(i + 1) })}</span>
                <Karaktervelger verdi={v} valg={VALG.valgfag} etikett={t('inntak.poeng.valgfagNr', { nr: String(i + 1) })} onEndre={(x) => settListe('valgfag', i, x)} />
              </li>
            ))}
          </ul>
        )}
      </Skjemadel>

      {tillegg.length > 0 && (
        <Skjemadel tittel={t('inntak.poeng.deler.tillegg')} del="lonn">
          <div class="felt">
            <select value={s.tillegg} aria-label={t('inntak.poeng.deler.tillegg')} onChange={(e) => endre({ tillegg: (e.target as HTMLSelectElement).value })}>
              <option value="">{t('inntak.poeng.tilleggIngen')}</option>
              {tillegg.map(({ nokkel, oppslag }) => (
                <option key={nokkel} value={nokkel}>
                  {tilleggsnavn(t, nokkel, oppslag)}
                </option>
              ))}
            </select>
            <p class="felt-hjelp">{t('inntak.poeng.tilleggHjelp')}</p>
          </div>
        </Skjemadel>
      )}
    </>
  );
}

/** «Idrettsfag: 6 poeng». Grupper uten navn i strings får «Tilleggspoeng: 6 poeng». */
function tilleggsnavn(t: T, nokkel: string, o: Oppslag): string {
  const poeng = String(o.verdi);
  const gruppe = nokkel.replace(/^tilleggspoeng_/, '').replace(/_\d+$/, '');
  const tekstnokkel = `inntak.poeng.tilleggsgruppe.${gruppe}` as Tekstnokkel;
  const navn = t(tekstnokkel);
  return navn === tekstnokkel ? t('inntak.poeng.tilleggGenerell', { poeng }) : t('inntak.poeng.tilleggValg', { gruppe: navn, poeng });
}

const LOP_KILDER: readonly KildeRef[] = [
  { id: 'udir-fag-og-timefordeling', punkt: 'Vedlegg 1, kapittel 3 Videregående opplæring' },
  { id: 'udir-grep', punkt: 'Vurderingsordningen i læreplanene for fellesfagene' },
  { id: 'opplaeringsforskrifta', punkt: '§ 9-13 tredje ledd', url: 'https://lovdata.no/forskrift/2024-06-03-900/§9-13' },
];

/**
 * Valget av løp: utdanningsprogrammet på Vg1, og til Vg3 i yrkesfag programområdet på Vg2. Valget fyller inn
 * radene med fagene og typen karakter. «Blankt ark» gir tomme rader.
 */
function Lopvelger({ s, sett, fordeling, vg3 }: { s: Skjema; sett: (f: (g: Skjema) => Skjema) => void; fordeling: Fagfordeling | null; vg3: boolean }) {
  const { t } = useTekst();
  const program = UTDANNINGSPROGRAM.find((p) => p.kode === s.lop1);
  const programomrader = fordeling && program?.retning === 'yrkesfag' ? programomraderVg2(fordeling, program.kode) : [];
  const fyll = (lop1: string, lop2: string) =>
    sett((g) => {
      if (!fordeling || !lop1) return { ...g, lop1, lop2, vg1: nyeRader(8), vg2: nyeRader(8) };
      const yrkesfag = UTDANNINGSPROGRAM.find((p) => p.kode === lop1)?.retning === 'yrkesfag';
      return {
        ...g,
        lop1,
        lop2,
        vg1: fraLop(lopsrader(fordeling, lop1, 'Vg1')),
        vg2: yrkesfag && !lop2 ? nyeRader(8) : fraLop(lopsrader(fordeling, lop1, 'Vg2', lop2 || null)),
      };
    });
  return (
    <Skjemadel tittel={t('inntak.poeng.lop.tittel')} del="stilling">
      <div class="felt poeng-lop">
        <label for="poeng-lop1">{t('inntak.poeng.lop.vg1')}</label>
        <select id="poeng-lop1" value={s.lop1} disabled={!fordeling} onChange={(e) => fyll((e.target as HTMLSelectElement).value, '')}>
          <option value="">{t('inntak.poeng.lop.blankt')}</option>
          {UTDANNINGSPROGRAM.map((p) => (
            <option key={p.kode} value={p.kode}>
              {t(`inntak.poeng.lop.program.${p.kode as 'ST'}` as Tekstnokkel)}
            </option>
          ))}
        </select>
      </div>
      {vg3 && programomrader.length > 0 && (
        <div class="felt poeng-lop">
          <label for="poeng-lop2">{t('inntak.poeng.lop.vg2')}</label>
          <select id="poeng-lop2" value={s.lop2} onChange={(e) => fyll(s.lop1, (e.target as HTMLSelectElement).value)}>
            <option value="">{t('inntak.poeng.lop.blankt')}</option>
            {programomrader.map((po) => (
              <option key={po} value={po}>
                {po}
              </option>
            ))}
          </select>
        </div>
      )}
      <p class="felt-hjelp poeng-lop-hjelp">{t('inntak.poeng.lop.hjelp')}</p>
      <details class="veiviser-kilder poeng-kilder">
        <summary class="forklaring-knapp">
          <Ikon navn="bok" />
          <span>{t('inntak.poeng.lop.kilder')}</span>
          <Ikon navn="ned" class="forklaring-pil" />
        </summary>
        <Kildeliste kilder={LOP_KILDER} niva={3} utenOverskrift />
      </details>
    </Skjemadel>
  );
}

function Radliste({
  tittel,
  del,
  rader,
  vg3,
  trinn,
  onEndre,
}: {
  tittel: string;
  del: 'undervisning' | 'tid';
  rader: Rad[];
  vg3: boolean;
  trinn: 'Vg1' | 'Vg2';
  onEndre: (rader: Rad[]) => void;
}) {
  const { t } = useTekst();
  const settRad = (i: number, del: Partial<Rad>) => onEndre(rader.map((r, n) => (n === i ? { ...r, ...del } : r)));
  return (
    <Skjemadel tittel={tittel} del={del} sum={String(utfylt(rader.map((r) => r.v)))}>
      <ol class="poeng-rader">
        {rader.map((r, i) => {
          const nr = String(i + 1);
          return (
            <li key={i} class="poeng-rad">
              {(r.fellesfag || r.programfag) && (
                <span class="poeng-rad-navn">{r.fellesfag ? t(`inntak.poeng.lop.fellesfag.${r.fellesfag}`) : r.programfag}</span>
              )}
              <div class="poeng-rad-topp">
                <select class="poeng-type" value={r.type} aria-label={t('inntak.poeng.typeEtikett', { nr })} onChange={(e) => settRad(i, { type: (e.target as HTMLSelectElement).value as Karaktertype })}>
                  {(['standpunkt', 'eksamen', 'halvar'] as const).map((x) => (
                    <option key={x} value={x}>
                      {t(`inntak.poeng.type.${x}`)}
                    </option>
                  ))}
                </select>
                <Karaktervelger verdi={r.v} valg={VALG.vgs} etikett={t('inntak.poeng.karakterEtikett', { nr })} onEndre={(v) => settRad(i, { v })} />
                {r.annen === null ? (
                  <button type="button" class="ikonknapp poeng-annen-knapp" aria-label={t('inntak.poeng.annenEtikett', { nr })} title={t('inntak.poeng.annenHjelp')} onClick={() => settRad(i, { annen: '' })}>
                    <Ikon navn="pluss" />
                  </button>
                ) : (
                  <button type="button" class="ikonknapp poeng-annen-knapp" aria-label={t('inntak.poeng.fjernAnnen', { nr })} onClick={() => settRad(i, { annen: null })}>
                    <Ikon navn="lukk" />
                  </button>
                )}
              </div>
              {r.annen !== null && (
                <div class="poeng-annen">
                  <span class="poeng-annen-tekst">{t('inntak.poeng.annen')}</span>
                  <Karaktervelger verdi={r.annen} valg={VALG.vgs} etikett={t('inntak.poeng.annenEtikett', { nr })} onEndre={(annen) => settRad(i, { annen })} />
                </div>
              )}
              {/* Rader med fag fra et løp håndteres av beregningen. Tomme rader kan merkes her. */}
              {vg3 && trinn === 'Vg1' && r.type === 'halvar' && !r.fellesfag && !r.programfag && (
                <label class="poeng-avkryssing">
                  <input type="checkbox" checked={r.erstattet} onChange={(e) => settRad(i, { erstattet: (e.target as HTMLInputElement).checked })} />
                  {t('inntak.poeng.erstattet')}
                </label>
              )}
            </li>
          );
        })}
      </ol>
      <button type="button" class="lenkeknapp poeng-legg-til" onClick={() => onEndre([...rader, ...nyeRader(4)])}>
        <Ikon navn="pluss" class="ikon-liten" />
        {t('inntak.poeng.flereRader')}
      </button>
    </Skjemadel>
  );
}

const tall = (n: number, d = 2) => formaterTall(n, d);

/** Ett trinn i utregningen som tekst, med tallene satt inn. */
function stegTekst(t: T, s: Poengsteg): Utregningssteg {
  const v = s.verdier;
  const kilde = s.kilder[0];
  const med = (x: Omit<Utregningssteg, 'kilde'>): Utregningssteg => (kilde ? { ...x, kilde } : x);
  switch (s.id) {
    case 'karakterer':
      return med({ tekst: t('inntak.poeng.steg.karakterer'), verdi: t('inntak.poeng.steg.karaktererVerdi', { antall: String(v.antall), sum: tall(v.sum ?? 0) }) });
    case 'null':
      return med({ tekst: t('inntak.poeng.steg.null'), verdi: String(v.antall) });
    case 'utelatt':
      return med({
        tekst: t('inntak.poeng.steg.utelatt'),
        verdi: Object.entries(s.utelatt ?? {})
          .map(([grunn, antall]) => t(`inntak.poeng.utelatt.${grunn as 'fritak'}` as Tekstnokkel, { antall: String(antall) }))
          .join(', '),
      });
    case 'valgfag':
      return med({ tekst: t('inntak.poeng.steg.valgfag'), innsatt: `${tall(v.sum ?? 0)} ÷ ${v.antall}`, verdi: tall(v.snitt ?? 0) });
    case 'beste':
      return med({ tekst: t('inntak.poeng.steg.beste'), verdi: String(v.antall) });
    case 'snitt':
      return med({ tekst: t('inntak.poeng.steg.snitt'), innsatt: `${tall(v.sum ?? 0)} ÷ ${v.antall}`, verdi: tall(v.snitt ?? 0, 4) });
    case 'avrunding':
      return med({ tekst: t('inntak.poeng.steg.avrunding', { desimaler: String(v.desimaler) }), verdi: formaterTall(v.avrundet ?? 0, 2, 2) });
    case 'poeng':
      return med({ tekst: t('inntak.poeng.steg.poeng'), innsatt: `${formaterTall(v.avrundet ?? 0, 2, 2)} × ${v.faktor}`, verdi: formaterTall(v.poeng ?? 0, 1, 1) });
    case 'tillegg':
      return med({ tekst: t('inntak.poeng.steg.tillegg'), verdi: String(v.tillegg) });
    case 'samlet':
      return med({ tekst: t('inntak.poeng.steg.samlet'), innsatt: `${formaterTall(v.poeng ?? 0, 1, 1)} + ${v.tillegg}`, verdi: formaterTall(v.samlet ?? 0, 1, 1) });
  }
}

function Resultat({ r, tomt, trinn, tittel }: { r: Poengresultat; tomt: boolean; trinn: Trinn; tittel: string }) {
  const { t } = useTekst();
  if (tomt) return <p class="dempet poeng-tomt">{t('inntak.poeng.resultat.tom')}</p>;
  if (r.individuell) {
    return (
      <p class="merknad merknad-advarsel" role="status">
        {t(trinn === 'vg1' ? 'inntak.poeng.individuell.Vg1' : 'inntak.poeng.individuell.Vg2')}
      </p>
    );
  }
  const faktor = r.steg.find((x) => x.id === 'poeng')?.verdier.faktor ?? 0;
  return (
    <Resultatkort
      tittel={tittel}
      verdi={formaterTall(r.samlet, 1, 1)}
      sammendrag={t('inntak.poeng.resultat.sammendrag', { snitt: formaterTall(r.snittAvrundet, 2, 2), faktor: String(faktor) })}
      steg={r.steg.map((s) => stegTekst(t, s))}
      fast
    />
  );
}
