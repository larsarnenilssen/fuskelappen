// Forsiden bygges bare fra modulregisteret. En ny modul krever ingen endring her.
// Avgjørelse 056: favorittene og kategoriene er grupper som kan lukkes og sorteres («Tilpass forsiden»), favorittene
// sorteres der de står, og forsiden kan vise bare favorittene, fordelt under kategoriene sine. Valgene lagres på enheten.
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { Sorterbar } from '../../components/Sorterbar.tsx';
import { visTekst } from '../../core/i18n/tekst.ts';
import { flytt, flyttInnenfor, modulForFavoritt, ordneGrupper } from '../../core/forside/ordning.ts';
import { MAKS_PER_KATEGORI_PAA_FORSIDEN } from '../../modules/kategorier.ts';
import { kategorierMedModuler } from '../../modules/register.ts';
import { Favorittliste, useFavorittbare } from '../Favorittliste.tsx';
import { Innganger } from '../Innganger.tsx';
import { settForsidesokSynlig } from '../forsidesok.ts';
import { erAktivtSok, Sokeboks } from '../Sokeboks.tsx';
import { fylkesnavn, Stedmerknad } from '../Stedmerknad.tsx';
import { iDag } from '../../data/skolear.ts';
import { kortManed } from '../../core/tidslinje.ts';
import { kalenderRute } from '../../modules/kalender/adresse.ts';
import type { Kalenderpost } from '../../modules/kalender/beregning/kalender.ts';
import { datoKort } from '../../modules/kalender/visning.ts';
import { nullstillForside, settBareFavoritter, settFavorittrekkefolge, settGrupperekkefolge, useTekst, useTilstand, vekslFavoritt, vekslGruppe, vekslSkjultGruppe } from '../tilstand.ts';

const FAVORITTER = 'favoritter';
/** Gruppen med de tre neste datoene fra kalenderen (forslag D, eier 05.10.2026, avgjørelse 066). */
const NESTE = 'neste';

/** Hvor lenge åpning og lukking tar. Samme som --varighet-lang i tokens.css. */
const ANIMASJON_MS = 220;

/**
 * En gruppe med overskrift som åpner og lukker den, med en myk animasjon (ikke ved redusert bevegelse). Lukket viser
 * overskriften hva som er inni (`sammendrag`). `verktoy` (blyanten for favorittene) står i overskriften ved siden av
 * pilen, som egen knapp oppå raden, så resten av raden fortsatt åpner og lukker gruppen (eier 04.10.2026).
 */
function Gruppe({
  id,
  tittel,
  sammendrag,
  kategori,
  lukket,
  verktoy,
  onVeksle,
  children,
}: {
  id: string;
  tittel: string;
  sammendrag: string;
  kategori?: string;
  lukket: boolean;
  verktoy?: ComponentChildren;
  /** Uten: gruppen åpnes og lukkes med vekslGruppe. */
  onVeksle?: () => void;
  children: ComponentChildren;
}) {
  const innhold = `forside-gruppe-${id}`;
  // Innholdet er i DOM-en (vis) til lukkingen er ferdig animert, og utvidet når det skal ha full høyde.
  const [vis, settVis] = useState(!lukket);
  const [utvidet, settUtvidet] = useState(!lukket);
  const [animerer, settAnimerer] = useState(false);
  const forste = useRef(true);
  useEffect(() => {
    if (forste.current) {
      forste.current = false;
      return;
    }
    const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    settAnimerer(!rolig);
    let ramme = 0;
    if (lukket) settUtvidet(false);
    else {
      settVis(true);
      ramme = requestAnimationFrame(() => requestAnimationFrame(() => settUtvidet(true)));
    }
    const ferdig = setTimeout(() => {
      if (lukket) settVis(false);
      settAnimerer(false);
    }, rolig ? 0 : ANIMASJON_MS);
    return () => {
      cancelAnimationFrame(ramme);
      clearTimeout(ferdig);
    };
  }, [lukket]);
  return (
    <section class="kategori forsidegruppe" data-gruppe={id} data-kategori={kategori} aria-labelledby={`${innhold}-tittel`}>
      <h2 id={`${innhold}-tittel`} class={verktoy && !lukket ? 'med-verktoy' : undefined}>
        <button type="button" class="gruppeknapp" aria-expanded={!lukket} aria-controls={innhold} onClick={onVeksle ?? (() => vekslGruppe(id))}>
          <span class="gruppeknapp-tekst">
            <span>{tittel}</span>
            {lukket && <span class="gruppe-sammendrag">{sammendrag}</span>}
          </span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
        </button>
        {!lukket && verktoy}
      </h2>
      <div id={innhold} class={`gruppe-innhold${utvidet ? ' utvidet' : ''}${animerer ? ' animerer' : ''}`} hidden={!vis}>
        <div class="gruppe-innhold-indre">{children}</div>
      </div>
    </section>
  );
}

/** Blyanten for å sortere favorittene i en gruppe, og haken for å avslutte. */
function Endreknapp({ endre, onEndre, gruppe }: { endre: boolean; onEndre: () => void; gruppe: string }) {
  const { t } = useTekst();
  const etikett = endre ? t('forside.endreFerdig') : t('forside.endreRekkefolgeI', { gruppe });
  return (
    <button type="button" class="ikonknapp gruppe-endre" aria-pressed={endre} aria-label={etikett} title={etikett} onClick={onEndre}>
      <Ikon navn={endre ? 'hake' : 'blyant'} class="ikon-liten" />
    </button>
  );
}

function TomFavoritter() {
  const { t } = useTekst();
  return (
    <p class="tom-favoritter">
      <Ikon navn="stjerne" class="ikon-liten" />
      <span>{t('forside.ingenFavoritter')}</span>
    </p>
  );
}

/**
 * Favorittene i en gruppe: lenker, eller håndtak, piler og «Fjern» når brukeren trykker på blyanten i overskriften. De
 * sorteres der de står, så gruppen ikke flytter seg (eier 04.10.2026). Er `ider` bare en del av favorittene (under en kategori i
 * «Bare favoritter»), flyttes de innenfor delen, og de andre favorittene står der de sto.
 */
function Favoritter({ ider, merket, endre }: { ider: readonly string[]; merket: boolean; endre: boolean }) {
  const { t, malform } = useTekst();
  const { favoritter } = useTilstand();
  const kjente = useFavorittbare(ider);
  const navn = (id: string) => kjente?.get(id)?.tittel[malform] ?? id;
  return (
    <>
      {endre ? (
        <Sorterbar
          etikett={t('forside.favoritter')}
          elementer={ider.map((id) => ({
            id,
            navn: navn(id),
            innhold: (
              <span class="sorterbar-navn">
                {navn(id)}
                {kjente && !kjente.has(id) && <span class="listelenke-under"> {t('favoritter.utilgjengelig')}</span>}
              </span>
            ),
            ekstra: (
              <button type="button" class="ikonknapp" aria-label={t('favoritter.fjern', { navn: navn(id) })} onClick={() => vekslFavoritt(id)}>
                <Ikon navn="lukk" />
              </button>
            ),
          }))}
          onFlytt={(fra, til) => settFavorittrekkefolge(flyttInnenfor(favoritter, ider, fra, til))}
        />
      ) : (
        <Favorittliste ider={ider} merket={merket} />
      )}
    </>
  );
}

/** Rekkefølgen på gruppene, med dra og slipp og piler. */
function Tilpasning({ grupper, navn }: { grupper: string[]; navn: (id: string) => string }) {
  const { t } = useTekst();
  const { forside } = useTilstand();
  return (
    <section class="tilpasning" aria-labelledby="tilpass-tittel">
      <h2 id="tilpass-tittel">{t('forside.tilpass.tittel')}</h2>
      <p class="dempet liten">{t('forside.tilpass.hjelp')}</p>
      <Sorterbar
        etikett={t('forside.tilpass.grupper')}
        elementer={grupper.map((id) => ({ id, navn: navn(id), innhold: <span class="sorterbar-navn">{navn(id)}</span> }))}
        onFlytt={(fra, til) => settGrupperekkefolge(flytt(grupper, fra, til))}
      />
      <label class="avkrysning tilpass-neste">
        <input type="checkbox" checked={!(forside.skjult ?? []).includes(NESTE)} onChange={() => vekslSkjultGruppe(NESTE)} />
        {t('forside.tilpass.visNeste')}
      </label>
      <button type="button" class="knapp knapp-sekundaer" onClick={nullstillForside}>
        {t('forside.tilpass.nullstill')}
      </button>
    </section>
  );
}

export default function Forside() {
  const { t, malform } = useTekst();
  const { favoritter, forside } = useTilstand();
  const [sporring, settSporring] = useState('');
  const [tilpass, settTilpass] = useState(false);
  const [endrer, settEndrer] = useState<string | null>(null);
  const topp = useRef<HTMLDivElement>(null);

  // Toppfeltet viser en søkeknapp når søkefeltet er rullet ut av syne (avgjørelse 056).
  useEffect(() => {
    const felt = topp.current?.querySelector('.sokefelt');
    if (!felt || typeof IntersectionObserver === 'undefined') return;
    const hoyde = parseFloat(getComputedStyle(document.documentElement).fontSize) * 3.25;
    const observator = new IntersectionObserver(([e]) => settForsidesokSynlig(e?.isIntersecting ?? true), { rootMargin: `-${hoyde}px 0px 0px 0px` });
    observator.observe(felt);
    return () => {
      observator.disconnect();
      settForsidesokSynlig(true);
    };
  }, []);
  const kategorier = kategorierMedModuler();
  const grupper = ordneGrupper([NESTE, FAVORITTER, ...kategorier.map((k) => k.id)], forside.rekkefolge);
  const kategoriForModul = new Map(kategorier.flatMap((k) => k.moduler.map((m) => [m.id, k.id] as const)));
  const navn = (id: string) => {
    const k = kategorier.find((x) => x.id === id);
    if (id === NESTE) return t('kalender.neste');
    return k ? t(k.navn) : t('forside.favoritter');
  };
  const bare = forside.bareFavoritter;

  const antallFavoritter = (n: number) => (n === 1 ? t('forside.enFavoritt') : t('forside.antallFavoritter', { antall: String(n) }));
  // Blyanten trengs bare når det er minst to favoritter å sortere.
  const endreknapp = (id: string, antall: number) =>
    antall > 1 || endrer === id ? <Endreknapp endre={endrer === id} gruppe={navn(id)} onEndre={() => settEndrer(endrer === id ? null : id)} /> : undefined;

  const gruppe = (id: string) => {
    const lukket = forside.lukket.includes(id);
    if (id === NESTE) return bare || (forside.skjult ?? []).includes(NESTE) ? null : <NesteDatoer key={id} />;
    if (id === FAVORITTER) {
      if (bare) return null;
      return (
        <Gruppe key={id} id={id} tittel={navn(id)} sammendrag={antallFavoritter(favoritter.length)} lukket={lukket} verktoy={endreknapp(id, favoritter.length)}>
          {favoritter.length === 0 ? <TomFavoritter /> : <Favoritter ider={favoritter} merket endre={endrer === id} />}
        </Gruppe>
      );
    }
    const k = kategorier.find((x) => x.id === id);
    if (!k) return null;
    if (bare) {
      const ider = favoritter.filter((f) => kategoriForModul.get(modulForFavoritt(f)) === k.id);
      if (ider.length === 0) return null;
      return (
        <Gruppe key={id} id={id} kategori={k.id} tittel={navn(id)} sammendrag={antallFavoritter(ider.length)} lukket={lukket} verktoy={endreknapp(id, ider.length)}>
          <Favoritter ider={ider} merket={false} endre={endrer === id} />
        </Gruppe>
      );
    }
    const vises = k.moduler.slice(0, MAKS_PER_KATEGORI_PAA_FORSIDEN);
    return (
      <Gruppe key={id} id={id} kategori={k.id} tittel={navn(id)} sammendrag={k.moduler.map((m) => visTekst(m.navn, malform)).join(', ')} lukket={lukket}>
        <Innganger moduler={vises} />
        {k.moduler.length > vises.length && (
          <p>
            <a href={`#/kategori/${k.id}`}>{t('forside.seAlle', { kategori: navn(id).toLowerCase() })}</a>
          </p>
        )}
      </Gruppe>
    );
  };

  return (
    <div class="side forside">
      <h1 class="skjult-visuelt" tabIndex={-1}>
        {t('forside.tittel')}
      </h1>
      <div class="forside-topp" ref={topp}>
        <Sokeboks etikett={t('forside.sokEtikett', { app: app.navn })} plassholder={t('forside.sokPlassholder')} onEndring={settSporring} />
        {/* Visningen og «Tilpass» står i det blå feltet under søket (eier 04.10.2026), og er borte mens brukeren søker. */}
        {!erAktivtSok(sporring) && (
          <div class="forside-verktoy">
            <Bryter
              legend={t('forside.vis')}
              skjultLegend
              kompakt
              verdi={bare ? 'favoritter' : 'alt'}
              valg={[
                { verdi: 'alt', tekst: t('forside.visAlt'), tekstKort: t('forside.visAltKort') },
                { verdi: 'favoritter', tekst: t('forside.visFavoritter'), tekstKort: t('forside.visFavoritterKort') },
              ]}
              onEndring={(v) => settBareFavoritter(v === 'favoritter')}
            />
            <button type="button" class="knapp knapp-sekundaer knapp-liten" aria-pressed={tilpass} onClick={() => settTilpass(!tilpass)}>
              <Ikon navn={tilpass ? 'hake' : 'kategori'} />
              {tilpass ? t('forside.tilpass.ferdig') : t('forside.tilpass.knapp')}
            </button>
          </div>
        )}
      </div>

      {!erAktivtSok(sporring) && (
        <>
          <Stedmerknad />

          {tilpass ? (
            <Tilpasning grupper={grupper} navn={navn} />
          ) : (
            <>
              {kategorier.length === 0 && <p class="dempet">{t('forside.ingenModuler')}</p>}
              {bare && favoritter.length === 0 && <TomFavoritter />}
              {/* To spalter på stor skjerm, rad for rad, så overskriftene i en rad står likt (eier 04.10.2026). */}
              <div class="forsidegrupper">{grupper.map(gruppe)}</div>
            </>
          )}

          <div class="bunntekst">
            <p data-testid="forbehold">{t('forside.forbehold', { app: app.navn })}</p>
            <p>
              <a href="#/om">{t('om.tittel')}</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Gruppen «Neste datoer»: de tre neste datoene fra kalenderen. Lukket fra start på mobil, der overskriften viser den
 * neste datoen, og åpen på stor skjerm (forslag D, avgjørelse 066). Datoene lastes etter at forsiden er tegnet.
 */
function NesteDatoer() {
  const { t, malform } = useTekst();
  const { innstillinger, forside } = useTilstand();
  const [poster, settPoster] = useState<Kalenderpost[] | null>(null);
  const [stor, settStor] = useState(() => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(min-width: 64rem)').matches);
  const fylke = innstillinger.fylke;
  const skole = innstillinger.skole?.id ?? null;
  useEffect(() => {
    let aktiv = true;
    void import('../../modules/kalender/neste.ts')
      .then((m) => m.hentNeste({ fylke, skole }, iDag()))
      .then((p) => aktiv && settPoster(p))
      .catch(() => aktiv && settPoster([]));
    return () => {
      aktiv = false;
    };
  }, [fylke, skole]);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 64rem)');
    const lytt = () => settStor(mq.matches);
    mq.addEventListener('change', lytt);
    return () => mq.removeEventListener('change', lytt);
  }, []);
  const lukket = forside.lukket.includes(NESTE) || (!stor && !(forside.apnet ?? []).includes(NESTE));
  const forste = poster?.[0];
  const sammendrag = forste?.fra ? t('kalender.nesteSammendrag', { dato: datoKort(forste.fra, forste.til, malform), tittel: forste.oppforing.tittel[malform] }) : poster ? t('kalender.ingenNeste') : t('app.lasterInn');
  return (
    <Gruppe id={NESTE} tittel={t('kalender.neste')} sammendrag={sammendrag} lukket={lukket} onVeksle={() => vekslGruppe(NESTE, lukket)}>
      <ul class="liste kal-neste">
        {poster === null && <li class="dempet">{t('app.lasterInn')}</li>}
        {poster?.length === 0 && <li class="dempet">{t('kalender.ingenNeste')}</li>}
        {poster?.map((p) => {
          const fra = p.fra as string;
          const til = p.til && p.til !== fra ? p.til : undefined;
          const sted = p.oppforing.fylke ? fylkesnavn(p.oppforing.fylke) : null;
          return (
            <li key={p.nokkel}>
              <a class="listelenke" href={`#${kalenderRute}`}>
                {/* Datoen på én linje: «5.–9. okt» (eier 05.10.2026). */}
                <span class="kal-neste-dato" aria-hidden="true">
                  {til && fra.slice(0, 7) === til.slice(0, 7) ? `${Number(fra.slice(8, 10))}.–${Number(til.slice(8, 10))}.` : `${Number(fra.slice(8, 10))}.`}
                  <small>{kortManed(Number(fra.slice(5, 7)), malform)}</small>
                </span>
                <span class="listelenke-tekst">
                  <span class="skjult-visuelt">{datoKort(fra, til, malform)}: </span>
                  <span class="listelenke-tittel">{p.oppforing.tittel[malform]}</span>
                  <span class="listelenke-under">{[...p.oppforing.tema.map((tema) => t(`kalender.temaer.${tema}`)), sted].filter(Boolean).join(' · ')}</span>
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </li>
          );
        })}
        <li>
          <a class="listelenke kal-neste-alle" href={`#${kalenderRute}`}>
            <span class="kal-neste-dato" aria-hidden="true">
              <Ikon navn="kalender" />
            </span>
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('kalender.heleKalenderen')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
    </Gruppe>
  );
}
