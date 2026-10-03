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
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentSupplerende, type Oppslag } from '../../../core/regler/index.ts';
import { Skjemadel } from '../../arbeidstid/komponenter/Skjemadel.tsx';
import { useHent, useRegelkontekst, useSkjematilstand } from '../../arbeidstid/kontekst.ts';
import type { SideProps } from '../../typer.ts';
import { GRUNNSKOLEFAG, GRUNNSKOLEFAG_KILDER, type Grunnskolefag } from '../beregning/grunnskolefag.ts';
import { beregnVg1, beregnVg2Vg3, type Karakterrad, type Karaktertype, type Poengresultat, type Poengsteg, type Vurdering } from '../beregning/poeng.ts';
import { hentInnhold, poengRute, type Inntaksinnhold } from '../innhold.ts';
import { Lokalmerknad } from './Lokalmerknad.tsx';

type Trinn = 'vg1' | 'vg2' | 'vg3';
const TRINN: readonly Trinn[] = ['vg1', 'vg2', 'vg3'];

/** Tilleggspoengene i fylkets regelsett (Vestland § 2-7 og § 2-8), i rekkefølgen de vises. */
const TILLEGG = ['tilleggspoeng_mdd_1', 'tilleggspoeng_mdd_2', 'tilleggspoeng_mdd_3', 'tilleggspoeng_idrett_1', 'tilleggspoeng_idrett_2', 'tilleggspoeng_idrett_3'] as const;

/** En karakter i skjemaet: '' er tomt, ellers «1»–«6», «IV», «IM», «fritak» eller «deltatt». */
type Felt = string;

interface Rad {
  type: Karaktertype;
  v: Felt;
  /** Annen karakter i samme fag, eller null når den ikke er lagt til. */
  annen: Felt | null;
  erstattet: boolean;
}

interface Skjema {
  standpunkt: Partial<Record<Grunnskolefag, Felt>>;
  eksamen: Felt[];
  valgfag: Felt[];
  valgfagErstattet: boolean;
  tillegg: string;
  vg1: Rad[];
  vg2: Rad[];
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
});

function lesFelt(f: Felt | null | undefined): Vurdering | null {
  if (!f) return null;
  const n = Number(f);
  return Number.isInteger(n) && n >= 1 && n <= 6 ? (n as Vurdering) : (f as Vurdering);
}

const tilRad = (r: Rad, trinn: 'Vg1' | 'Vg2'): Karakterrad => ({ type: r.type, vurdering: lesFelt(r.v), annen: lesFelt(r.annen), trinn, erstattet: r.erstattet });

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

  // Tilleggspoengene finnes bare i fylker som har dem (Vestland), og bare til Vg1.
  const tillegg = useMemo(
    () =>
      TILLEGG.flatMap((nokkel) => {
        try {
          const o = hentSupplerende(`inntak.${nokkel}`, kontekst).fylke[0];
          return o ? [{ nokkel, oppslag: o }] : [];
        } catch {
          return [];
        }
      }),
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
      <p class="ingress">{t('inntak.poeng.innledning')}</p>
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

function tilleggsnavn(t: T, nokkel: string, o: Oppslag): string {
  const poeng = String(o.verdi);
  if (nokkel.includes('_mdd_')) return t('inntak.poeng.tilleggMdd', { poeng });
  const niva = nokkel.slice(-1) as '1' | '2' | '3';
  return t('inntak.poeng.tilleggIdrett', { poeng, niva: t(`inntak.poeng.idrettNiva.${niva}`) });
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
              {vg3 && trinn === 'Vg1' && r.type === 'halvar' && (
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
