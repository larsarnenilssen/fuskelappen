// Forsiden bygges bare fra modulregisteret. En ny modul krever ingen endring her.
import { app } from '../../config/app.ts';
import { useState } from 'preact/hooks';
import { MAKS_PER_KATEGORI_PAA_FORSIDEN } from '../../modules/kategorier.ts';
import { kategorierMedModuler } from '../../modules/register.ts';
import { Ikon } from '../../components/Ikon.tsx';
import { Favorittliste } from '../Favorittliste.tsx';
import { Innganger } from '../Innganger.tsx';
import { erAktivtSok, Sokeboks } from '../Sokeboks.tsx';
import { Stedmerknad } from '../Stedmerknad.tsx';
import { useTekst, useTilstand } from '../tilstand.ts';

export default function Forside() {
  const { t } = useTekst();
  const { favoritter } = useTilstand();
  const [sporring, settSporring] = useState('');
  const kategorier = kategorierMedModuler();

  return (
    <div class="side forside">
      <h1 class="skjult-visuelt" tabIndex={-1}>
        {t('forside.tittel')}
      </h1>
      <div class="forside-topp">
        <p class="forside-slagord">{t('forside.slagord')}</p>
        <Sokeboks etikett={t('forside.sokEtikett', { app: app.navn })} plassholder={t('forside.sokPlassholder')} onEndring={settSporring} />
      </div>

      {!erAktivtSok(sporring) && (
        <>
          <Stedmerknad />

          <section aria-labelledby="forside-favoritter">
            <h2 id="forside-favoritter">{t('forside.favoritter')}</h2>
            {favoritter.length === 0 ? (
              <p class="tom-favoritter">
                <Ikon navn="stjerne" class="ikon-liten" />
                <span>{t('forside.ingenFavoritter')}</span>
              </p>
            ) : (
              <>
                <Favorittliste kompakt />
                <p>
                  <a href="#/favoritter">{t('forside.alleFavoritter')}</a>
                </p>
              </>
            )}
          </section>

          <section aria-labelledby="forside-moduler">
            <h2 id="forside-moduler">{t('forside.moduler')}</h2>
            {kategorier.length === 0 && <p class="dempet">{t('forside.ingenModuler')}</p>}
            {kategorier.map((k) => {
              const navn = t(k.navn);
              const vises = k.moduler.slice(0, MAKS_PER_KATEGORI_PAA_FORSIDEN);
              return (
                <div class="kategori" key={k.id} data-kategori={k.id}>
                  <h3>{navn}</h3>
                  <Innganger moduler={vises} />
                  {k.moduler.length > vises.length && (
                    <p>
                      <a href={`#/kategori/${k.id}`}>{t('forside.seAlle', { kategori: navn.toLowerCase() })}</a>
                    </p>
                  )}
                </div>
              );
            })}
          </section>

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
