// Forsiden bygges bare fra modulregisteret. En ny modul krever ingen endring her.
// Avgjørelse 056: favorittene og kategoriene er grupper som kan lukkes og sorteres («Tilpass forsiden»), favorittene
// sorteres der de står, og forsiden kan vise bare favorittene, fordelt under kategoriene sine. Valgene lagres på enheten.
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { Sorterbar } from '../../components/Sorterbar.tsx';
import { flytt, flyttInnenfor, modulForFavoritt, ordneGrupper } from '../../core/forside/ordning.ts';
import { MAKS_PER_KATEGORI_PAA_FORSIDEN } from '../../modules/kategorier.ts';
import { kategorierMedModuler } from '../../modules/register.ts';
import { Favorittliste, useFavorittbare } from '../Favorittliste.tsx';
import { Innganger } from '../Innganger.tsx';
import { settForsidesokSynlig } from '../forsidesok.ts';
import { erAktivtSok, Sokeboks } from '../Sokeboks.tsx';
import { Stedmerknad } from '../Stedmerknad.tsx';
import { nullstillForside, settBareFavoritter, settFavorittrekkefolge, settGrupperekkefolge, useTekst, useTilstand, vekslFavoritt, vekslGruppe } from '../tilstand.ts';

const FAVORITTER = 'favoritter';

/**
 * En gruppe med overskrift som åpner og lukker den. `verktoy` (blyanten for favorittene) står i overskriften ved
 * siden av pilen, som egen knapp oppå raden, så resten av raden fortsatt åpner og lukker gruppen (eier 04.10.2026).
 */
function Gruppe({
  id,
  tittel,
  kategori,
  lukket,
  verktoy,
  children,
}: {
  id: string;
  tittel: string;
  kategori?: string;
  lukket: boolean;
  verktoy?: ComponentChildren;
  children: ComponentChildren;
}) {
  const innhold = `forside-gruppe-${id}`;
  return (
    <section class="kategori forsidegruppe" data-gruppe={id} data-kategori={kategori} aria-labelledby={`${innhold}-tittel`}>
      <h2 id={`${innhold}-tittel`} class={verktoy && !lukket ? 'med-verktoy' : undefined}>
        <button type="button" class="gruppeknapp" aria-expanded={!lukket} aria-controls={innhold} onClick={() => vekslGruppe(id)}>
          <span>{tittel}</span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
        </button>
        {!lukket && verktoy}
      </h2>
      <div id={innhold} hidden={lukket}>
        {children}
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
  return (
    <section class="tilpasning" aria-labelledby="tilpass-tittel">
      <h2 id="tilpass-tittel">{t('forside.tilpass.tittel')}</h2>
      <p class="dempet liten">{t('forside.tilpass.hjelp')}</p>
      <Sorterbar
        etikett={t('forside.tilpass.grupper')}
        elementer={grupper.map((id) => ({ id, navn: navn(id), innhold: <span class="sorterbar-navn">{navn(id)}</span> }))}
        onFlytt={(fra, til) => settGrupperekkefolge(flytt(grupper, fra, til))}
      />
      <button type="button" class="knapp knapp-sekundaer" onClick={nullstillForside}>
        {t('forside.tilpass.nullstill')}
      </button>
    </section>
  );
}

export default function Forside() {
  const { t } = useTekst();
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
  const grupper = ordneGrupper([FAVORITTER, ...kategorier.map((k) => k.id)], forside.rekkefolge);
  const kategoriForModul = new Map(kategorier.flatMap((k) => k.moduler.map((m) => [m.id, k.id] as const)));
  const navn = (id: string) => {
    const k = kategorier.find((x) => x.id === id);
    return k ? t(k.navn) : t('forside.favoritter');
  };
  const bare = forside.bareFavoritter;

  // Blyanten trengs bare når det er minst to favoritter å sortere.
  const endreknapp = (id: string, antall: number) =>
    antall > 1 || endrer === id ? <Endreknapp endre={endrer === id} gruppe={navn(id)} onEndre={() => settEndrer(endrer === id ? null : id)} /> : undefined;

  const gruppe = (id: string) => {
    const lukket = forside.lukket.includes(id);
    if (id === FAVORITTER) {
      if (bare) return null;
      return (
        <Gruppe key={id} id={id} tittel={navn(id)} lukket={lukket} verktoy={endreknapp(id, favoritter.length)}>
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
        <Gruppe key={id} id={id} kategori={k.id} tittel={navn(id)} lukket={lukket} verktoy={endreknapp(id, ider.length)}>
          <Favoritter ider={ider} merket={false} endre={endrer === id} />
        </Gruppe>
      );
    }
    const vises = k.moduler.slice(0, MAKS_PER_KATEGORI_PAA_FORSIDEN);
    return (
      <Gruppe key={id} id={id} kategori={k.id} tittel={navn(id)} lukket={lukket}>
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
              <Ikon navn={tilpass ? 'hake' : 'dra'} />
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
              {grupper.map(gruppe)}
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
