// Forsiden bygges bare fra modulregisteret. En ny modul krever ingen endring her.
import { app } from '../../config/app.ts';
import { useState } from 'preact/hooks';
import { Ikon } from '../../components/Ikon.tsx';
import { visTekst } from '../../core/i18n/tekst.ts';
import { MAKS_PER_KATEGORI_PAA_FORSIDEN } from '../../modules/kategorier.ts';
import { aktiveModuler, kategorierMedModuler } from '../../modules/register.ts';
import { Favorittliste } from '../Favorittliste.tsx';
import { erAktivtSok, Sokeboks } from '../Sokeboks.tsx';
import { Stedmerknad } from '../Stedmerknad.tsx';
import { useTekst, useTilstand } from '../tilstand.ts';

export default function Forside() {
  const { t, malform } = useTekst();
  const { favoritter } = useTilstand();
  const [sporring, settSporring] = useState('');
  const hurtig = aktiveModuler.flatMap((m) => m.hurtigfunksjoner ?? []);
  const kategorier = kategorierMedModuler();

  return (
    <div class="side forside">
      <h1 class="skjult-visuelt" tabIndex={-1}>
        {t('forside.tittel')}
      </h1>
      <Sokeboks etikett={t('forside.sokEtikett', { app: app.navn })} plassholder={t('forside.sokPlassholder')} onEndring={settSporring} />

      {!erAktivtSok(sporring) && (
        <>
          <Stedmerknad />

          <section aria-labelledby="forside-favoritter">
            <h2 id="forside-favoritter">{t('forside.favoritter')}</h2>
            {favoritter.length === 0 ? (
              <p class="dempet">{t('forside.ingenFavoritter')}</p>
            ) : (
              <>
                <Favorittliste kompakt />
                <p>
                  <a href="#/favoritter">{t('forside.alleFavoritter')}</a>
                </p>
              </>
            )}
          </section>

          {hurtig.length > 0 && (
            <section aria-labelledby="forside-hurtig">
              <h2 id="forside-hurtig">{t('forside.hurtig')}</h2>
              <ul class="flis-rutenett">
                {hurtig.map((h) => (
                  <li key={h.id}>
                    <a class="flis" href={`#${h.rute}`}>
                      <Ikon navn={h.ikon} />
                      <span class="flis-tittel">{visTekst(h.tittel, malform)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="forside-moduler">
            <h2 id="forside-moduler">{t('forside.moduler')}</h2>
            {kategorier.length === 0 && <p class="dempet">{t('forside.ingenModuler')}</p>}
            {kategorier.map((k) => {
              const navn = t(k.navn);
              const vises = k.moduler.slice(0, MAKS_PER_KATEGORI_PAA_FORSIDEN);
              return (
                <div class="kategori" key={k.id} data-kategori={k.id}>
                  <h3>{navn}</h3>
                  <ul class="liste">
                    {vises.map((m) => (
                      <li key={m.id}>
                        <a class="listelenke" href={`#${m.ruter[0]?.sti ?? '/'}`} data-modul={m.id}>
                          <Ikon navn={m.ikon} />
                          <span class="listelenke-tekst">
                            <span class="listelenke-tittel">{visTekst(m.navn, malform)}</span>
                            {m.beskrivelse && <span class="listelenke-under">{visTekst(m.beskrivelse, malform)}</span>}
                          </span>
                          <Ikon navn="hoyre" class="ikon-liten" />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {k.moduler.length > vises.length && (
                    <p>
                      <a href={`#/kategori/${k.id}`}>{t('forside.seAlle', { kategori: navn.toLowerCase() })}</a>
                    </p>
                  )}
                </div>
              );
            })}
          </section>

          <p class="bunntekst">
            <a href="#/om">{t('om.tittel')}</a>
          </p>
        </>
      )}
    </div>
  );
}
