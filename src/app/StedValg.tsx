// Valget av fylke og skole, med bryteren «Privatskole» (avgjørelse 075). Står i Innstillinger og i velkomsten
// (fase 10), så valget ser likt ut og virker likt begge steder. `id` skiller feltene når velkomsten er åpen over
// Innstillinger.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { velgFylke, type Innstillinger } from '../core/lagring/lagring.ts';
import { fylker } from './Stedmerknad.tsx';
import { tilstand, useTekst, useTilstand } from './tilstand.ts';

interface Skole {
  id: string;
  navn: string;
  fylke: string;
  kommune: string;
  /** Privat skole i Nasjonalt skoleregister (ErPrivatskole). Mangler for offentlige skoler. */
  privat?: boolean;
}

type Skoleliste = { tilstand: 'laster' } | { tilstand: 'ok'; skoler: Skole[] } | { tilstand: 'feil' };

let skolerHentet: Promise<Skole[] | null> | null = null;

function hentSkoler(): Promise<Skole[] | null> {
  skolerHentet ??= fetch(`${import.meta.env.BASE_URL}data/skoler/vgs.json`)
    .then((s) => (s.ok ? (s.json() as Promise<{ skoler: Skole[] }>) : null))
    .then((d) => (d && Array.isArray(d.skoler) && d.skoler.length > 0 ? d.skoler : null))
    .catch(() => null);
  return skolerHentet;
}

export function StedValg({ id = 'velg', forklaring, etter }: { id?: string; forklaring?: string; etter?: ComponentChildren }) {
  const { t } = useTekst();
  const inn = useTilstand().innstillinger;
  const [skoler, settSkoler] = useState<Skoleliste>({ tilstand: 'laster' });

  useEffect(() => {
    void hentSkoler().then((s) => settSkoler(s ? { tilstand: 'ok', skoler: s } : { tilstand: 'feil' }));
  }, []);

  const sett = (endring: Partial<Innstillinger>) => tilstand.oppdaterInnstillinger(endring);
  const skolensFylke = (skoleId: string) => (skoler.tilstand === 'ok' ? (skoler.skoler.find((s) => s.id === skoleId)?.fylke ?? null) : null);
  const skolerIFylket = skoler.tilstand === 'ok' ? skoler.skoler.filter((s) => s.fylke === inn.fylke) : [];
  const valgtSkole = skoler.tilstand === 'ok' && inn.skole?.id ? skoler.skoler.find((s) => s.id === inn.skole?.id) : undefined;

  return (
    <fieldset class="valggruppe">
      <legend>{t('innstillinger.sted.legend')}</legend>
      <p class="dempet liten">{forklaring ?? t('innstillinger.sted.forklaring')}</p>
      <div class="felt">
        <label for={`${id}-fylke`}>{t('innstillinger.sted.fylke')}</label>
        <select
          id={`${id}-fylke`}
          value={inn.fylke ?? ''}
          onChange={(e) => {
            const v = e.currentTarget.value;
            tilstand.oppdaterInnstillinger(velgFylke(inn, v === '' ? null : v, skolensFylke));
          }}
        >
          <option value="">{t('innstillinger.sted.ikkeValgt')}</option>
          {fylker.map((f) => (
            <option key={f.nummer} value={f.nummer}>
              {f.navn}
            </option>
          ))}
        </select>
      </div>
      <div class="felt">
        <label for={`${id}-skole`}>{t('innstillinger.sted.skole')}</label>
        {skoler.tilstand === 'feil' && inn.fylke ? (
          <>
            <p id={`${id}-skole-hjelp`} class="felt-hjelp">
              {t('innstillinger.sted.skoleFritekstHjelp')}
            </p>
            <input
              id={`${id}-skole`}
              type="text"
              autoComplete="off"
              aria-describedby={`${id}-skole-hjelp`}
              value={inn.skole?.navn ?? ''}
              onChange={(e) => {
                const navn = e.currentTarget.value.trim();
                sett({ skole: navn ? { id: null, navn } : null });
              }}
            />
          </>
        ) : (
          <select
            id={`${id}-skole`}
            disabled={!inn.fylke || skoler.tilstand !== 'ok'}
            value={inn.skole?.id ?? ''}
            onChange={(e) => {
              const skoleId = e.currentTarget.value;
              const skole = skolerIFylket.find((s) => s.id === skoleId);
              // En privat skole slår på reglene for privatskoler, og en offentlig slår dem av. Bryteren under kan
              // endre valget (avgjørelse 075).
              sett(
                skole
                  ? {
                      skole: { id: skole.id, navn: skole.navn },
                      privatskole: skole.privat === true,
                    }
                  : { skole: null },
              );
            }}
          >
            <option value="">{inn.fylke ? t('innstillinger.sted.ikkeValgt') : t('innstillinger.sted.velgFylkeForst')}</option>
            {skolerIFylket.map((s) => (
              <option key={s.id} value={s.id}>
                {s.navn}
              </option>
            ))}
          </select>
        )}
      </div>
      {/* Privatskole (avgjørelse 075): også uten valgt skole, for den som vil se reglene for privatskoler. */}
      <div class="vippe">
        <input
          id={`${id}-privatskole`}
          type="checkbox"
          role="switch"
          aria-describedby={`${id}-privatskole-hjelp`}
          checked={inn.privatskole === true}
          onChange={(e) => sett({ privatskole: e.currentTarget.checked })}
        />
        <label for={`${id}-privatskole`}>{t('innstillinger.sted.privatskole')}</label>
      </div>
      <p id={`${id}-privatskole-hjelp`} class="dempet liten">
        {valgtSkole?.privat === true
          ? t('innstillinger.sted.privatskoleNsr')
          : valgtSkole && inn.privatskole !== true
            ? t('innstillinger.sted.privatskoleOffentlig')
            : t('innstillinger.sted.privatskoleHjelp')}
      </p>
      {inn.fylke ? (
        <button type="button" class="knapp knapp-sekundaer" onClick={() => sett({ fylke: null, skole: null })}>
          <Ikon navn="lukk" />
          {t('innstillinger.sted.fjern')}
        </button>
      ) : (
        <p class="merknad">{t('innstillinger.sted.bareNasjonalt')}</p>
      )}
      {etter}
      <p class="dempet liten">{t('innstillinger.sted.kilde')}</p>
    </fieldset>
  );
}
