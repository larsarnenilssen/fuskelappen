// Forsiden bygges bare fra modulregisteret. En ny modul krever ingen endring her.
// Avgjørelse 056: favorittene og kategoriene er grupper som kan lukkes og sorteres («Tilpass forsiden»), favorittene
// sorteres der de står, og forsiden kan vise bare favorittene, fordelt under kategoriene sine. Valgene lagres på enheten.
// Avgjørelse 102: Aktuelt (kalenderen, nyhetene, tallene og dagens jukselapp) står øverst, i sidekolonnen på skrivebord.
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
import { Gruppe, SIDEKOLONNE_FRA, useMinstBredde } from '../Forsidegruppe.tsx';
import { Innganger } from '../Innganger.tsx';
import { settForsidesokSynlig } from '../forsidesok.ts';
import { erAktivtSok, Sokeboks } from '../Sokeboks.tsx';
import { Aktuelt, PANEL, useAktuelt, VISNINGER, Visningsgruppe } from '../Forsidepanel.tsx';
import { Stedmerknad } from '../Stedmerknad.tsx';
import { apneVelkomst } from '../velkomst/apne.ts';
import { nullstillForside, settAktueltVist, settBareFavoritter, settFavorittrekkefolge, settGrupperekkefolge, useTekst, useTilstand, vekslFavoritt } from '../tilstand.ts';

const FAVORITTER = 'favoritter';

/**
 * Sidekolonnen (eier 05.10.2026): står fast mens siden rulles og ruller selv når den er for lang, uten synlig
 * rullefelt. En toning øverst og nederst viser at det er mer over eller under. Bryteren som slo den av, er tatt bort
 * (avgjørelse 102): Aktuelt lukkes med pilen i overskriften, som de andre gruppene.
 */
function Sidekolonne({ children }: { children: ComponentChildren }) {
  const kolonne = useRef<HTMLDivElement>(null);
  const rull = useRef<HTMLDivElement>(null);
  const [mer, settMer] = useState({ over: false, under: false });
  // Kolonnen er aldri høyere enn den synlige delen av skjermen under toppen sin, også før den har festet seg øverst.
  // Da synes toningen nederst med en gang.
  useEffect(() => {
    const el = kolonne.current;
    if (!el) return;
    let ramme = 0;
    const mal = () => {
      ramme = 0;
      const fast = parseFloat(getComputedStyle(el).top) || 0;
      const luft = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.75;
      const topp = Math.max(el.getBoundingClientRect().top, fast);
      // Nederst på siden slutter kolonnen der gruppene slutter, så den blir stående øverst i stedet for å skyves opp.
      const bunn = Math.min(window.innerHeight - luft, el.parentElement?.getBoundingClientRect().bottom ?? Infinity);
      el.style.setProperty('--kolonne-hoyde', `${Math.max(160, bunn - topp)}px`);
    };
    const planlegg = () => {
      if (!ramme) ramme = requestAnimationFrame(mal);
    };
    mal();
    window.addEventListener('scroll', planlegg, { passive: true });
    window.addEventListener('resize', planlegg);
    // Gruppene ved siden av blir høyere og lavere når de åpnes og lukkes.
    const observator = typeof ResizeObserver === 'undefined' || !el.parentElement ? null : new ResizeObserver(planlegg);
    if (el.parentElement) observator?.observe(el.parentElement);
    return () => {
      cancelAnimationFrame(ramme);
      window.removeEventListener('scroll', planlegg);
      window.removeEventListener('resize', planlegg);
      observator?.disconnect();
    };
  }, []);
  useEffect(() => {
    const el = rull.current;
    if (!el) return;
    const sjekk = () => {
      const over = el.scrollTop > 1;
      const under = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      settMer((m) => (m.over === over && m.under === under ? m : { over, under }));
    };
    sjekk();
    el.addEventListener('scroll', sjekk, { passive: true });
    // Høyden endres når grupper åpnes og lukkes, og når vinduet endres.
    const observator = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sjekk);
    observator?.observe(el);
    if (el.firstElementChild) observator?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', sjekk);
      observator?.disconnect();
    };
  }, []);
  return (
    <div class="forside-sidekolonne" ref={kolonne}>
      <div class={`sidekolonne-ramme${mer.over ? ' mer-over' : ''}${mer.under ? ' mer-under' : ''}`}>
        <div class="sidekolonne-rull" ref={rull}>
          <div class="sidekolonne-innhold">{children}</div>
        </div>
      </div>
    </div>
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

/**
 * «Tilpass»: rekkefølgen på gruppene, og om Aktuelt står på forsiden (avgjørelse 102). Hva som står i Aktuelt, velges i
 * menyen i Aktuelt selv. Når sidekolonnen brukes (skrivebord), står Aktuelt og favorittene i en egen del, og hopper ut
 * av rekkefølgen for de andre gruppene. Plassen deres i den felles rekkefølgen beholdes, så de står der brukeren satte
 * dem når vinduet blir smalt (eier 05.10.2026).
 */
function Tilpasning({ grupper, navn, sidekolonne }: { grupper: string[]; navn: (id: string) => string; sidekolonne: boolean }) {
  const { t } = useTekst();
  const { skjult } = useAktuelt();
  const iKolonnen = (id: string) => id === PANEL || id === FAVORITTER;
  const sorterbar = (utvalg: string[], etikett: string) => (
    <Sorterbar
      etikett={etikett}
      elementer={utvalg.map((id) => ({ id, navn: navn(id), innhold: <span class="sorterbar-navn">{navn(id)}</span> }))}
      onFlytt={(fra, til) => settGrupperekkefolge(utvalg.length === grupper.length ? flytt(grupper, fra, til) : flyttInnenfor(grupper, utvalg, fra, til))}
    />
  );
  // Aktuelt kan skjules i menyen sin. Her kommer det tilbake.
  const aktuelt = (
    <fieldset class="tilpass-visninger">
      <legend class="tilpass-del">{t('forside.aktuelt.navn')}</legend>
      <p class="dempet liten" id="tilpass-aktuelt-hjelp">
        {t('forside.aktuelt.visHjelp')}
      </p>
      <div class="vippe">
        <input id="tilpass-aktuelt" type="checkbox" role="switch" checked={!skjult} aria-describedby="tilpass-aktuelt-hjelp" onChange={() => settAktueltVist(skjult)} />
        <label for="tilpass-aktuelt">{t('forside.aktuelt.vis')}</label>
      </div>
    </fieldset>
  );
  return (
    <section class="tilpasning" aria-labelledby="tilpass-tittel">
      <h2 id="tilpass-tittel">{t('forside.tilpass.tittel')}</h2>
      <p class="dempet liten">{t('forside.tilpass.hjelp')}</p>
      {sidekolonne ? (
        <>
          {sorterbar(
            grupper.filter((id) => !iKolonnen(id)),
            t('forside.tilpass.grupper'),
          )}
          <h3 class="tilpass-del">{t('forside.tilpass.sidekolonne')}</h3>
          <p class="dempet liten">{t('forside.tilpass.sidekolonneHjelp')}</p>
          {sorterbar(grupper.filter(iKolonnen), t('forside.tilpass.sidekolonne'))}
        </>
      ) : (
        sorterbar(grupper, t('forside.tilpass.grupper'))
      )}
      {aktuelt}
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
  const skrivebord = useMinstBredde(SIDEKOLONNE_FRA);


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
  const grupper = ordneGrupper([PANEL, FAVORITTER, ...kategorier.map((k) => k.id)], forside.rekkefolge);
  const kategoriForModul = new Map(kategorier.flatMap((k) => k.moduler.map((m) => [m.id, k.id] as const)));
  const navn = (id: string) => {
    const k = kategorier.find((x) => x.id === id);
    if (id === PANEL) return t('forside.aktuelt.navn');
    return k ? t(k.navn) : t('forside.favoritter');
  };
  const bare = forside.bareFavoritter;
  // Visningene i Aktuelt som brukeren har med (avgjørelse 081 og 102). Er Aktuelt skjult, er ingen med.
  const aktuelt = useAktuelt();
  const paa = aktuelt.skjult ? [] : aktuelt.paa;
  // Sidekolonnen brukes på skrivebord, med alt innhold, når det er noe i den: Aktuelt eller favoritter. Ellers får
  // gruppene hele bredden (avgjørelse 102). Med «Bare favoritter» står favorittene under gruppene.
  const medKolonne = skrivebord && !bare && (!aktuelt.skjult || favoritter.length > 0);
  const fullBredde = skrivebord && !bare && !medKolonne;

  const antallFavoritter = (n: number) => (n === 1 ? t('forside.enFavoritt') : t('forside.antallFavoritter', { antall: String(n) }));
  // Blyanten trengs bare når det er minst to favoritter å sortere.
  const endreknapp = (id: string, antall: number) =>
    antall > 1 || endrer === id ? <Endreknapp endre={endrer === id} gruppe={navn(id)} onEndre={() => settEndrer(endrer === id ? null : id)} /> : undefined;

  // Med «Bare favoritter» står visningene som er favoritter, hver for seg, i stedet for kortene sine. Jukselappen har
  // ingen side å være favoritt, og står likevel når den er slått på.
  const favorittFor = (v: string) => VISNINGER.find((x) => x.id === v)?.favoritt ?? null;
  const somFavoritt = paa.filter((v) => v === 'jukselapp' || favoritter.includes(favorittFor(v) ?? ''));
  const visesSomVisning = (f: string) => somFavoritt.some((v) => favorittFor(v) === f);
  const iSidekolonnen = (id: string) => id === PANEL || id === FAVORITTER;
  const sidegrupper = grupper.filter(iSidekolonnen);
  const hovedgrupper = grupper.filter((id) => !iSidekolonnen(id));

  const gruppe = (id: string) => {
    const lukket = forside.lukket.includes(id);
    // Aktuelt øverst. Med «Bare favoritter» står visningene som er favoritter, hver som sin egen gruppe (eier 07.10.2026).
    if (id === PANEL) return bare ? somFavoritt.map((v) => <Visningsgruppe key={v} id={v} />) : <Aktuelt key={id} />;
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
      const ider = favoritter.filter((f) => kategoriForModul.get(modulForFavoritt(f)) === k.id && !visesSomVisning(f));
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
    <div class={`side forside${medKolonne || fullBredde ? ' forside-bred' : ''}`}>
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
            <div class="forside-verktoy-hoyre">
              <button type="button" class="knapp knapp-sekundaer knapp-liten" aria-pressed={tilpass} onClick={() => settTilpass(!tilpass)}>
                <Ikon navn={tilpass ? 'hake' : 'kategori'} />
                {tilpass ? t('forside.tilpass.ferdig') : t('forside.tilpass.knapp')}
              </button>
            </div>
          </div>
        )}
      </div>

      {!erAktivtSok(sporring) && (
        <>
          <Stedmerknad />

          {tilpass ? (
            <Tilpasning grupper={grupper} navn={navn} sidekolonne={medKolonne} />
          ) : (
            <>
              {kategorier.length === 0 && <p class="dempet">{t('forside.ingenModuler')}</p>}
              {bare && favoritter.length === 0 && <TomFavoritter />}
              {fullBredde ? (
                // Skrivebord uten noe i sidekolonnen (Aktuelt skjult og ingen favoritter): gruppene får hele bredden, i
                // så mange spalter som får plass (avgjørelse 102).
                <div class="forside-oppsett forside-full">
                  <div class="forsidegrupper">{grupper.map(gruppe)}</div>
                </div>
              ) : !medKolonne ? (
                // To spalter på stor skjerm, rad for rad, så overskriftene i en rad står likt (eier 04.10.2026).
                <div class="forsidegrupper">{grupper.map(gruppe)}</div>
              ) : (
                // Skrivebord (eier 05.10.2026): Aktuelt og favorittene står i en egen kolonne til høyre, i rekkefølgen
                // fra «Tilpass». Kolonnene er like brede: gruppene i én kolonne ved siden av, og i to når det er plass
                // til tre.
                <div class="forside-oppsett">
                  <div class="forsidegrupper">{hovedgrupper.map(gruppe)}</div>
                  <Sidekolonne>{sidegrupper.map(gruppe)}</Sidekolonne>
                </div>
              )}
            </>
          )}

          <div class="bunntekst">
            <p data-testid="forbehold">{t('forside.forbehold', { app: app.navn })}</p>
            {/* Velkomsten kan åpnes igjen herfra og fra Innstillinger (fase 10). */}
            <p>
              <button type="button" class="lenkeknapp" onClick={apneVelkomst}>
                {t('velkomst.lenke')}
              </button>
            </p>
            <p>
              <a href="#/om">{t('om.tittel')}</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
