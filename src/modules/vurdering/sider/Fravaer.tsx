// Fraværsgrensen (fase 6, pakke 2), med samme oppbygning som poengberegningen i Inntak (avgjørelse 047): faget (søk
// på navn eller kode, eller årstimetallet skrevet inn) og øktene til venstre, grensen i klokketimer og økter med
// utregningen og kilde på hver linje til høyre. «Sjekk fraværet» er valgfritt og lukket til brukeren åpner det: fire
// felt og en stolpe med merker ved 10 og 15 prosent, med utfallet i tekst. Reglene står under, lukket til de åpnes.
// Faget står i adressen (?fag=ENG1007), så fagarket kan lenke rett hit. Ingenting lagres; skjemaet huskes i
// nettleserhistorikken som i de andre kalkulatorene.
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import { huskOktlengde, lesOktlengde } from '../../../app/kalkulatorvalg.ts';
import { erstattAdresse } from '../../../app/ruter.ts';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Bryter } from '../../../components/Bryter.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kortfot } from '../../../components/Kortfot.tsx';
import { Resultatkort, type Utregningssteg } from '../../../components/Resultatkort.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { KildeRef } from '../../../core/innhold/skjema.ts';
import { lastFagindeks, lastFagroller } from '../../../data/grep.ts';
import { lastMerknader } from '../../../data/vigo.ts';
import { Skjemadel } from '../../arbeidstid/komponenter/Skjemadel.tsx';
import { useHent, useSkjematilstand } from '../../arbeidstid/kontekst.ts';
import { type Fagklasse, fagklasser } from '../../fag/klasser.ts';
import { sokFag, tomtFilter } from '../../fag/oppslag.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { Merknad } from '../../fag/vigo/skjema.ts';
import type { SideProps } from '../../typer.ts';
import { beregnGrenser, type Fravaersresultat, type Fravaerssteg, type Grenseresultat, sjekkFravaer } from '../beregning/fravaer.ts';
import { fravaerRute, hentInnhold, veiviserRute } from '../innhold.ts';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';

type Oktvalg = '45' | '60' | '90' | 'annen';
const OKTER: readonly Oktvalg[] = ['45', '60', '90', 'annen'];

/** Fagmerknaden som føres når eleven er over grensen, med navnet fra VIGO (eier 04.10.2026: koden i parentes). */
const FAM_OVER_GRENSEN = 'FAM51';

interface Skjema {
  /** Årstimetallet skrevet inn, når faget ikke er valgt eller brukeren vil bruke et annet tall. */
  timer: number | null;
  /** Brukeren har valgt å skrive inn timene selv selv om faget er valgt. */
  egneTimer: boolean;
  okt: Oktvalg;
  annen: number | null;
  udokumentert: number | null;
  /** Alt helsefraværet, før og etter at grensen ble nådd. */
  helse: number | null;
  /** Brukeren har krysset av for at noe av helsefraværet kom etter grensen og er dokumentert av helsepersonell. */
  delHelse: boolean;
  /** Av helsefraværet: det som kom etter at grensen ble nådd og er dokumentert av helsepersonell. */
  helseEtter: number | null;
  andre: number | null;
}

/** Øktlengden er den brukeren sist valgte i en kalkulator (eier 04.10.2026), ellers 60 minutter. */
function startokt(): Pick<Skjema, 'okt' | 'annen'> {
  const o = lesOktlengde();
  if (!o) return { okt: '60', annen: null };
  const okt = String(o.minutter) as Oktvalg;
  return !o.fritt && OKTER.includes(okt) ? { okt, annen: null } : { okt: 'annen', annen: o.minutter };
}

const start = (): Skjema => ({ timer: null, egneTimer: false, ...startokt(), udokumentert: null, helse: null, delHelse: false, helseEtter: null, andre: null });

const tall = (n: number, d = 2) => formaterTall(n, d);

/** Velg fag med søk, eller vis faget som er valgt. Bare fag med årstimetall i Grep kan velges. */
function Fagvelger({ indeks, klasser, kode, onVelg }: { indeks: Fagindeks; klasser: Map<string, Fagklasse>; kode: string; onVelg: (kode: string) => void }) {
  const { t, malform } = useTekst();
  const id = useId();
  const [sok, settSok] = useState('');
  const fag = kode ? indeks.fag[kode] : undefined;
  if (fag) {
    return (
      <div class="fr-fag">
        <p class="fr-fag-navn">
          <a href={`#/fag/${kode}`}>{fag.navn[malform]}</a> <span class="dempet">{kode}</span>
        </p>
        <p class="fr-fag-timer tall">{t('vurdering.fravaer.fraGrep', { timer: tall(fag.timer ?? 0) })}</p>
        <button type="button" class="lenkeknapp" onClick={() => onVelg('')}>
          {t('vurdering.fravaer.annetFag')}
        </button>
      </div>
    );
  }
  const treff = sok.trim() ? sokFag(indeks, { ...tomtFilter, tekst: sok }, klasser).treff.filter((f) => f.fag.timer !== null).slice(0, 8) : [];
  return (
    <div>
      <div class="felt">
        <label for={id}>{t('vurdering.fravaer.sokFag')}</label>
        <div class="sokefelt">
          <Ikon navn="sok" class="sokefelt-ikon" />
          <input
            id={id}
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            placeholder={t('vurdering.fravaer.sokPlassholder')}
            value={sok}
            onInput={(e) => settSok(e.currentTarget.value)}
          />
        </div>
      </div>
      {sok.trim() !== '' && treff.length === 0 && <p class="dempet">{t('vurdering.fravaer.ingenFag')}</p>}
      {treff.length > 0 && (
        <ul class="vu-fag-treff">
          {treff.map((f) => (
            <li key={f.kode}>
              <button type="button" class="vu-fag-valg" onClick={() => onVelg(f.kode)}>
                <span>{f.fag.navn[malform]}</span>
                <span class="dempet liten">
                  {f.kode} · {t('vurdering.fravaer.timerEnhet', { antall: tall(f.fag.timer ?? 0) })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Ett trinn i utregningen som tekst, med tallene satt inn. */
function stegTekst(t: T, s: Fravaerssteg, enhet: (n: number) => string): Utregningssteg {
  const v = s.verdier;
  const kilde: KildeRef | undefined = s.kilder[0];
  const med = (x: Omit<Utregningssteg, 'kilde'>): Utregningssteg => (kilde ? { ...x, kilde } : x);
  const timer = (n: number | undefined) => t('vurdering.fravaer.timerEnhet', { antall: tall(n ?? 0) });
  switch (s.id) {
    case 'arstimer':
      return med({ tekst: t('vurdering.fravaer.steg.arstimer'), verdi: timer(v.arstimer) });
    case 'grense':
    case 'skjonn':
      return med({ tekst: t(`vurdering.fravaer.steg.${s.id}`), innsatt: `${tall(v.arstimer ?? 0)} × ${tall(v.prosent ?? 0)} %`, verdi: timer(v.timer) });
    case 'okter':
    case 'skjonnOkter':
      return med({
        tekst: t(`vurdering.fravaer.steg.${s.id}`, { minutter: tall(v.minutter ?? 0) }),
        innsatt: `${tall(v.timer ?? 0)} × ${tall(v.klokketime ?? 0)} ÷ ${tall(v.minutter ?? 0)}`,
        verdi: t('vurdering.fravaer.oktEnhet', { antall: tall(v.okter ?? 0) }),
      });
    case 'innenfor':
      return med({ tekst: t('vurdering.fravaer.steg.innenfor'), verdi: t('vurdering.fravaer.steg.innenforVerdi', { innenfor: enhet(v.innenfor ?? 0), over: enhet(v.over ?? 0) }) });
    case 'skjonnInnenfor':
      return med({ tekst: t('vurdering.fravaer.steg.skjonnInnenfor'), verdi: enhet(v.innenfor ?? 0) });
  }
}

/** Grensen ved 10 og 15 prosent i klokketimer og, når øktene ikke er 60 minutter, i økter. */
function Grensetabell({ g }: { g: Grenseresultat }) {
  const { t } = useTekst();
  const iOkter = g.minutter !== g.klokketime;
  // Enheten står i radnavnet, så tallene får plass på én linje også på 320 px.
  const enhetNavn = t(iOkter ? 'vurdering.fravaer.resultat.okter' : 'vurdering.fravaer.resultat.timer');
  return (
    <table class="fr-tabell">
      <caption class="skjult-visuelt">{t('vurdering.fravaer.resultat.tabell')}</caption>
      <thead>
        <tr>
          <td />
          <th scope="col">{t('vurdering.fravaer.resultat.grense')}</th>
          <th scope="col">{t('vurdering.fravaer.resultat.skjonn')}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">{t('vurdering.fravaer.resultat.klokketimer')}</th>
          <td class="tall">{tall(g.grense.timer)}</td>
          <td class="tall">{tall(g.skjonn.timer)}</td>
        </tr>
        {iOkter && (
          <tr>
            <th scope="row">{t('vurdering.fravaer.steg.okter', { minutter: tall(g.minutter) })}</th>
            <td class="tall">{tall(g.grense.okter)}</td>
            <td class="tall">{tall(g.skjonn.okter)}</td>
          </tr>
        )}
        <tr class="fr-tabell-svar">
          <th scope="row">{t('vurdering.fravaer.resultat.innenfor', { enhet: enhetNavn })}</th>
          <td class="tall">{tall(g.grense.innenfor)}</td>
          <td class="tall">{tall(g.skjonn.innenfor)}</td>
        </tr>
        <tr>
          <th scope="row">{t('vurdering.fravaer.resultat.over', { enhet: enhetNavn })}</th>
          <td class="tall">{tall(g.grense.over)}</td>
          <td class="tall">{tall(g.skjonn.over)}</td>
        </tr>
      </tbody>
    </table>
  );
}

/** Stolpen fra 0 til litt over 15 prosent, med merker ved 10 og 15 prosent og utfallet i tekst (WCAG 1.4.1). */
function Fravaersstolpe({ g, r, fam, enhet, timer }: { g: Grenseresultat; r: Fravaersresultat; fam: Merknad | null; enhet: (n: number) => string; timer: boolean }) {
  const { t, malform } = useTekst();
  // Stolpen går til litt over 15 prosent, eller lenger når alt fraværet er større.
  const maks = Math.max((g.skjonn.prosent * 4) / 3, r.samletProsent * 1.05);
  const plass = (p: number) => `${Math.min(100, (p / maks) * 100)}%`;
  const prosent = tall(r.prosent, 1);
  const samletProsent = tall(r.samletProsent, 1);
  // Fraværet som teller, og alt fraværet, med prosent av årstimetallet (eier 04.10.2026).
  const rad = (okter: number, klokketimer: number, p: string) => (
    <dd class="tall">
      {enhet(okter)}
      {!timer && <span class="dempet"> · {t('vurdering.fravaer.sjekk.iTimer', { timer: tall(klokketimer) })}</span>}
      <span class="fr-tall-prosent"> · {t('vurdering.fravaer.sjekk.prosentKort', { prosent: p })}</span>
    </dd>
  );
  return (
    <div class={`fr-sjekk-svar fr-${r.utfall}`}>
      <dl class="fr-tall">
        <div>
          <dt>
            <span class="fr-tegn fr-tegn-teller" aria-hidden="true" />
            {t('vurdering.fravaer.sjekk.teller')}
          </dt>
          {rad(r.teller, r.timer, prosent)}
        </div>
        <div>
          <dt>
            <span class="fr-tegn fr-tegn-samlet" aria-hidden="true" />
            {t('vurdering.fravaer.sjekk.samlet')}
          </dt>
          {rad(r.samlet, r.samletTimer, samletProsent)}
        </div>
      </dl>
      <div class="fr-stolpe" role="img" aria-label={t('vurdering.fravaer.sjekk.stolpe', { prosent, samlet: samletProsent })}>
        <span class="fr-stolpe-samlet" style={{ width: plass(r.samletProsent) }} />
        <span class="fr-stolpe-fyll" style={{ width: plass(r.prosent) }} />
        <span class="fr-stolpe-merke" style={{ left: plass(g.grense.prosent) }} />
        <span class="fr-stolpe-merke fr-stolpe-merke-15" style={{ left: plass(g.skjonn.prosent) }} />
      </div>
      <div class="fr-stolpe-etiketter" aria-hidden="true">
        <span style={{ left: plass(g.grense.prosent) }}>{t('vurdering.fravaer.resultat.grense')}</span>
        <span style={{ left: plass(g.skjonn.prosent) }}>{t('vurdering.fravaer.resultat.skjonn')}</span>
      </div>
      <div class="fr-utfall" role="status">
        <p class="fr-utfall-tittel">
          <Ikon navn={r.utfall === 'innenfor' ? 'ok' : r.utfall === 'skjonn' ? 'advarsel' : 'feil'} />
          {t(`vurdering.fravaer.sjekk.utfall.${r.utfall}`)}
        </p>
        <p>{t(`vurdering.fravaer.sjekk.utfallTekst.${r.utfall}`)}</p>
        {r.utfall === 'over' && (
          <p>
            {/* Koden står i parentes bak navnet (eier 04.10.2026), med lenke til oppslaget over fagmerknadene. */}
            {fam ? t('vurdering.fravaer.sjekk.iv', { navn: fam[malform] }) : t('vurdering.fravaer.sjekk.iv', { navn: '…' })} (
            <a href={`#/begreper/fagmerknader?q=${FAM_OVER_GRENSEN}`}>{FAM_OVER_GRENSEN}</a>).
          </p>
        )}
        {r.utfall !== 'innenfor' && <p class="liten">{t('vurdering.fravaer.sjekk.varsel')}</p>}
      </div>
      {r.helseEtterTeller > 0 && (
        <p class="merknad">
          {t(timer ? 'vurdering.fravaer.sjekk.helseEtterTellerTimer' : 'vurdering.fravaer.sjekk.helseEtterTeller', { antall: tall(r.helseEtterTeller) })}
        </p>
      )}
      <Kortfot kilder={r.kilder} />
    </div>
  );
}

export default function Fravaer({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const hent = useHent();
  const [s, sett] = useSkjematilstand<Skjema>('vurdering-fravaer', start);
  const endre = (del: Partial<Skjema>) => sett((g) => ({ ...g, ...del }));
  const [kode, settKode] = useState(sporring.get('fag') ?? '');
  const [indeks, settIndeks] = useState<Fagindeks | null>(null);
  const [klasser, settKlasser] = useState<Map<string, Fagklasse> | null>(null);
  const [regler, settRegler] = useState<Innholdselement[] | null>(null);
  const [fam, settFam] = useState<Merknad | null>(null);
  useEffect(() => {
    void Promise.all([lastFagindeks(), lastFagroller()]).then(([i, r]) => {
      settIndeks(i);
      settKlasser(fagklasser(i, r.roller));
    });
    void hentInnhold().then((i) => settRegler(i.regler));
  }, []);
  // Faget i adressen kan endres av en lenke (f.eks. fra fagarket) mens siden er åpen.
  const fraAdressen = sporring.get('fag') ?? '';
  useEffect(() => settKode(fraAdressen), [fraAdressen]);

  const velg = (ny: string) => {
    settKode(ny);
    endre({ egneTimer: false });
    erstattAdresse(fravaerRute, ny ? { fag: ny } : undefined);
  };

  const fag = indeks && kode ? indeks.fag[kode] : undefined;
  const fraGrep = fag && fag.timer !== null && !s.egneTimer ? fag.timer : null;
  const arstimer = fraGrep ?? s.timer;
  const minutter = s.okt === 'annen' ? s.annen : Number(s.okt);
  const iTimer = minutter === 60;
  const enhet = (n: number) => (iTimer ? t('vurdering.fravaer.timerEnhet', { antall: tall(n) }) : t('vurdering.fravaer.oktEnhet', { antall: tall(n) }));

  const grenser = useMemo((): Grenseresultat | { feil: string } | null => {
    if (arstimer === null || minutter === null || arstimer <= 0 || minutter <= 0) return null;
    try {
      return beregnGrenser(hent, { arstimer, minutter, arstimerKilde: fraGrep !== null ? { id: 'udir-grep', punkt: kode } : null });
    } catch (e) {
      return { feil: e instanceof Error ? e.message : String(e) };
    }
  }, [hent, arstimer, minutter, fraGrep, kode]);
  const g = grenser && !('feil' in grenser) ? grenser : null;

  const fyltInn = [s.udokumentert, s.helse, s.helseEtter, s.andre].some((x) => x !== null);
  // Helsefraværet står i én boks. Bare når brukeren har krysset av, deles det i før og etter grensen: rekkefølgen
  // avgjør om det teller (FR5 og FR8), og den kan ikke kalkulatoren vite selv (eier 04.10.2026).
  const helse = s.helse ?? 0;
  const helseEtter = s.delHelse ? Math.min(s.helseEtter ?? 0, helse) : 0;
  const sjekk = g && fyltInn ? sjekkFravaer(g, { udokumentert: s.udokumentert ?? 0, helse: helse - helseEtter, helseEtter, andre: s.andre ?? 0 }) : null;
  const unntak = regler?.find((r) => r.id === 'fr-unntak');
  // Navnet på fagmerknaden hentes fra VIGO bare når eleven er over grensen.
  const over = sjekk?.utfall === 'over';
  useEffect(() => {
    if (over && !fam) void lastMerknader().then((m) => settFam(m.fagmerknader.find((x) => x.kode === FAM_OVER_GRENSEN) ?? null), () => undefined);
  }, [over, fam]);

  const tittel = t('vurdering.fravaer.tittel');
  const oktTekst = minutter !== null && !iTimer ? t('vurdering.fravaer.sjekk.hjelp', { minutter: tall(minutter) }) : t('vurdering.fravaer.sjekk.hjelpTimer');

  return (
    <div class="side kalkulator fravaer">
      <Brodsmuler ledd={[{ tekst: t('vurdering.tittel'), href: '#/vurdering' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{tittel}</h1>
        <FavorittKnapp id="vurdering:fravaer" navn={tittel} />
      </div>
      <p class="ingress">{t('vurdering.fravaer.innledning')}</p>

      <div class="kalkulator-flate">
        <div class="kalkulator-skjema">
          <Skjemadel tittel={t('vurdering.fravaer.faget')} del="undervisning" sum={arstimer !== null ? t('vurdering.fravaer.timerEnhet', { antall: tall(arstimer) }) : null}>
            {indeks === null || klasser === null ? (
              <p class="dempet">{t('app.lasterInn')}</p>
            ) : (
              <Fagvelger indeks={indeks} klasser={klasser} kode={fag ? kode : ''} onVelg={velg} />
            )}
            {fag && !s.egneTimer ? (
              <button type="button" class="lenkeknapp" onClick={() => endre({ egneTimer: true, timer: s.timer ?? fag.timer })}>
                {t('vurdering.fravaer.endreTimer')}
              </button>
            ) : (
              <Tallfelt
                etikett={fag ? t('vurdering.fravaer.timer') : t('vurdering.fravaer.ellerTimer')}
                verdi={s.timer}
                onEndring={(timer) => endre({ timer })}
                enhet={t('vurdering.fravaer.timerEnhet', { antall: '' }).trim()}
                hjelpetekst={t('vurdering.fravaer.timerHjelp')}
                min={1}
                maks={2000}
                {...(fag
                  ? {
                      etikettHoyre: (
                        <button type="button" class="lenkeknapp" onClick={() => endre({ egneTimer: false })}>
                          {t('vurdering.fravaer.brukGrep')}
                        </button>
                      ),
                    }
                  : {})}
              />
            )}
            <p class="felt-hjelp fr-hele-aaret">{t('vurdering.fravaer.heleAaret')}</p>
          </Skjemadel>

          <Skjemadel tittel={t('vurdering.fravaer.okter')} del="tid" sum={minutter !== null ? t('vurdering.fravaer.minutter', { antall: tall(minutter) }) : null}>
            <Bryter
              legend={t('vurdering.fravaer.oktlengde')}
              verdi={s.okt}
              valg={OKTER.map((o) => ({ verdi: o, tekst: o === 'annen' ? t('vurdering.fravaer.annen') : t('vurdering.fravaer.minutter', { antall: o }) }))}
              onEndring={(okt) => {
                endre({ okt });
                if (okt !== 'annen') huskOktlengde(Number(okt), false);
                else huskOktlengde(s.annen, true);
              }}
            />
            {s.okt === 'annen' && (
              <Tallfelt etikett={t('vurdering.fravaer.annenEtikett')} verdi={s.annen} onEndring={(annen) => {
                  endre({ annen });
                  huskOktlengde(annen, true);
                }} enhet="min" min={1} maks={600} />
            )}
          </Skjemadel>

          <Skjemadel
            tittel={t('vurdering.fravaer.sjekk.tittel')}
            del="funksjoner"
            standardLukket
            sum={sjekk ? t(`vurdering.fravaer.sjekk.utfall.${sjekk.utfall}`) : null}
          >
            <p class="felt-hjelp">{oktTekst}</p>
            <div class="fr-felt">
              <Tallfelt etikett={t('vurdering.fravaer.sjekk.udokumentert')} verdi={s.udokumentert} onEndring={(udokumentert) => endre({ udokumentert })} hjelpetekst={t('vurdering.fravaer.sjekk.udokumentertHjelp')} min={0} />
              <Tallfelt etikett={t('vurdering.fravaer.sjekk.helse')} verdi={s.helse} onEndring={(helse) => endre({ helse })} hjelpetekst={t('vurdering.fravaer.sjekk.helseHjelp')} min={0} />
              <label class="poeng-avkryssing fr-del-helse">
                <input type="checkbox" checked={s.delHelse} onChange={(e) => endre({ delHelse: (e.target as HTMLInputElement).checked })} />
                {t('vurdering.fravaer.sjekk.delHelse')}
              </label>
              {s.delHelse && (
                <Tallfelt
                  class="fr-helse-etter"
                  etikett={t('vurdering.fravaer.sjekk.helseEtter')}
                  verdi={s.helseEtter}
                  onEndring={(helseEtter) => endre({ helseEtter })}
                  hjelpetekst={t('vurdering.fravaer.sjekk.helseEtterHjelp')}
                  min={0}
                  maks={helse}
                />
              )}
              <Tallfelt etikett={t('vurdering.fravaer.sjekk.andre')} verdi={s.andre} onEndring={(andre) => endre({ andre })} hjelpetekst={t('vurdering.fravaer.sjekk.andreHjelp')} min={0} />
              {/* Grunnene som gjelder, fra samme innhold som reglene under kalkulatoren (eier 04.10.2026). */}
              {unntak && (
                <Forklaring tittel={t('vurdering.fravaer.sjekk.andreListe')}>
                  <div class="brodtekst" dangerouslySetInnerHTML={{ __html: unntak.tekst[malform] }} />
                  <Kortfot kilder={unntak.kilder} />
                </Forklaring>
              )}
            </div>
            {g && sjekk && <Fravaersstolpe g={g} r={sjekk} fam={fam} enhet={enhet} timer={iTimer} />}
          </Skjemadel>
        </div>

        <div class="kalkulator-resultat">
          {grenser && 'feil' in grenser ? (
            <p class="merknad merknad-advarsel" role="alert">
              {grenser.feil}
            </p>
          ) : g ? (
            <Resultatkort
              tittel={t('vurdering.fravaer.resultat.tittel')}
              verdi={enhet(g.grense.innenfor)}
              sammendrag={t('vurdering.fravaer.resultat.sammendrag', { innenfor: enhet(g.grense.innenfor), over: enhet(g.grense.over) })}
              steg={g.steg.map((x) => stegTekst(t, x, enhet))}
              fast
            >
              <Grensetabell g={g} />
            </Resultatkort>
          ) : (
            <p class="dempet fr-tomt">{t('vurdering.fravaer.resultat.tom')}</p>
          )}
        </div>
        {/* Til steget om fravær i veiviseren (eier 04.10.2026): under utregningen på mobil, og nederst i venstre spalte
            på stor skjerm, så den ikke står alene øverst til høyre før grensen er regnet ut. */}
        <a class="frist-inngang fr-veiviserkort" href={`#${veiviserRute('grunnlag-for-vurdering')}?steg=vu-fravaer&svar=elev.vanlig.nei`}>
          <span class="frist-inngang-tittel">
            <Ikon navn="veiviser" />
            {t('vurdering.fravaer.veiviserKort')}
          </span>
          <span class="frist-inngang-neste">{t('vurdering.fravaer.veiviserKortTekst')}</span>
          <Ikon navn="hoyre" class="frist-inngang-pil" />
        </a>
      </div>

      {regler && regler.length > 0 && (
        <section class="poeng-regler">
          <h2 class="liten-overskrift">{t('vurdering.fravaer.regler')}</h2>
          {regler.map((r) => (
            <Forklaring key={r.id} tittel={r.tittel[malform]}>
              <div class="brodtekst" dangerouslySetInnerHTML={{ __html: r.tekst[malform] }} />
              <Kortfot kilder={r.kilder} />
            </Forklaring>
          ))}
        </section>
      )}
    </div>
  );
}
