// Forsiden bygges bare fra modulregisteret. En ny modul krever ingen endring her.
// Avgjørelse 056: favorittene og kategoriene er grupper som kan lukkes og sorteres («Tilpass forsiden»), og forsiden
// kan vise bare favorittene, fordelt under kategoriene sine. Valgene lagres på enheten.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { Sorterbar } from '../../components/Sorterbar.tsx';
import { flytt, modulForFavoritt, ordneGrupper } from '../../core/forside/ordning.ts';
import { MAKS_PER_KATEGORI_PAA_FORSIDEN } from '../../modules/kategorier.ts';
import { kategorierMedModuler } from '../../modules/register.ts';
import { Favorittliste, useFavorittbare } from '../Favorittliste.tsx';
import { Innganger } from '../Innganger.tsx';
import { erAktivtSok, Sokeboks } from '../Sokeboks.tsx';
import { Stedmerknad } from '../Stedmerknad.tsx';
import { flyttFavorittTil, nullstillForside, settBareFavoritter, settGrupperekkefolge, useTekst, useTilstand, vekslFavoritt, vekslGruppe } from '../tilstand.ts';

const FAVORITTER = 'favoritter';

/** En gruppe med overskrift som åpner og lukker den. */
function Gruppe({ id, tittel, kategori, lukket, children }: { id: string; tittel: string; kategori?: string; lukket: boolean; children: ComponentChildren }) {
  const innhold = `forside-gruppe-${id}`;
  return (
    <section class="kategori forsidegruppe" data-gruppe={id} data-kategori={kategori} aria-labelledby={`${innhold}-tittel`}>
      <h2 id={`${innhold}-tittel`}>
        <button type="button" class="gruppeknapp" aria-expanded={!lukket} aria-controls={innhold} onClick={() => vekslGruppe(id)}>
          <span>{tittel}</span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
        </button>
      </h2>
      <div id={innhold} hidden={lukket}>
        {children}
      </div>
    </section>
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

/** Rekkefølgen på gruppene og favorittene, med dra og slipp og piler. */
function Tilpasning({ grupper, navn }: { grupper: string[]; navn: (id: string) => string }) {
  const { t, malform } = useTekst();
  const { favoritter } = useTilstand();
  const kjente = useFavorittbare(favoritter);
  const favorittnavn = (id: string) => kjente?.get(id)?.tittel[malform] ?? id;
  return (
    <section class="tilpasning" aria-labelledby="tilpass-tittel">
      <h2 id="tilpass-tittel">{t('forside.tilpass.tittel')}</h2>
      <p class="dempet liten">{t('forside.tilpass.hjelp')}</p>
      <h3 class="liten-overskrift">{t('forside.tilpass.grupper')}</h3>
      <Sorterbar
        etikett={t('forside.tilpass.grupper')}
        elementer={grupper.map((id) => ({ id, navn: navn(id), innhold: <span class="sorterbar-navn">{navn(id)}</span> }))}
        onFlytt={(fra, til) => settGrupperekkefolge(flytt(grupper, fra, til))}
      />
      <h3 class="liten-overskrift">{t('forside.favoritter')}</h3>
      {favoritter.length === 0 ? (
        <TomFavoritter />
      ) : (
        <Sorterbar
          etikett={t('forside.favoritter')}
          elementer={favoritter.map((id) => ({
            id,
            navn: favorittnavn(id),
            innhold: (
              <span class="sorterbar-navn">
                {favorittnavn(id)}
                {kjente && !kjente.has(id) && <span class="listelenke-under"> {t('favoritter.utilgjengelig')}</span>}
              </span>
            ),
            ekstra: (
              <button type="button" class="ikonknapp" aria-label={t('favoritter.fjern', { navn: favorittnavn(id) })} onClick={() => vekslFavoritt(id)}>
                <Ikon navn="lukk" />
              </button>
            ),
          }))}
          onFlytt={flyttFavorittTil}
        />
      )}
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
  const kategorier = kategorierMedModuler();
  const grupper = ordneGrupper([FAVORITTER, ...kategorier.map((k) => k.id)], forside.rekkefolge);
  const kategoriForModul = new Map(kategorier.flatMap((k) => k.moduler.map((m) => [m.id, k.id] as const)));
  const navn = (id: string) => {
    const k = kategorier.find((x) => x.id === id);
    return k ? t(k.navn) : t('forside.favoritter');
  };
  const bare = forside.bareFavoritter;

  const gruppe = (id: string) => {
    const lukket = forside.lukket.includes(id);
    if (id === FAVORITTER) {
      if (bare) return null;
      return (
        <Gruppe key={id} id={id} tittel={navn(id)} lukket={lukket}>
          {favoritter.length === 0 ? <TomFavoritter /> : <Favorittliste ider={favoritter} />}
        </Gruppe>
      );
    }
    const k = kategorier.find((x) => x.id === id);
    if (!k) return null;
    if (bare) {
      const ider = favoritter.filter((f) => kategoriForModul.get(modulForFavoritt(f)) === k.id);
      if (ider.length === 0) return null;
      return (
        <Gruppe key={id} id={id} kategori={k.id} tittel={navn(id)} lukket={lukket}>
          <Favorittliste ider={ider} />
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
      <div class="forside-topp">
        <Sokeboks etikett={t('forside.sokEtikett', { app: app.navn })} plassholder={t('forside.sokPlassholder')} onEndring={settSporring} />
      </div>

      {!erAktivtSok(sporring) && (
        <>
          <Stedmerknad />
          <div class="forside-verktoy">
            <Bryter
              legend={t('forside.vis')}
              skjultLegend
              kompakt
              verdi={bare ? 'favoritter' : 'alt'}
              valg={[
                { verdi: 'alt', tekst: t('forside.visAlt') },
                { verdi: 'favoritter', tekst: t('forside.visFavoritter') },
              ]}
              onEndring={(v) => settBareFavoritter(v === 'favoritter')}
            />
            <button type="button" class="knapp knapp-sekundaer knapp-liten" aria-pressed={tilpass} onClick={() => settTilpass(!tilpass)}>
              <Ikon navn={tilpass ? 'hake' : 'dra'} />
              {tilpass ? t('forside.tilpass.ferdig') : t('forside.tilpass.knapp')}
            </button>
          </div>

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
