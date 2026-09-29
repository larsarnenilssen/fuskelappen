import { useEffect, useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Ikon } from '../../components/Ikon.tsx';
import { eksportfilnavn, lagEksport, lesEksport, velgFylke, type Innstillinger as Inn } from '../../core/lagring/lagring.ts';
import { fylker } from '../Stedmerknad.tsx';
import { tilstand, useTekst, useTilstand } from '../tilstand.ts';

interface Skole {
  id: string;
  navn: string;
  fylke: string;
  kommune: string;
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

function Valg<V extends string>({
  navn,
  legend,
  verdi,
  valg,
  onVelg,
}: {
  navn: string;
  legend: string;
  verdi: V;
  valg: { verdi: V; tekst: string }[];
  onVelg: (v: V) => void;
}) {
  return (
    <fieldset class="valggruppe">
      <legend>{legend}</legend>
      {valg.map((v) => (
        <label key={v.verdi} class="valg">
          <input type="radio" name={navn} value={v.verdi} checked={verdi === v.verdi} onChange={() => onVelg(v.verdi)} />
          <span>{v.tekst}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default function Innstillinger() {
  const { t } = useTekst();
  const data = useTilstand();
  const inn = data.innstillinger;
  const [skoler, settSkoler] = useState<Skoleliste>({ tilstand: 'laster' });
  const [melding, settMelding] = useState<string | null>(null);

  useEffect(() => {
    void hentSkoler().then((s) => settSkoler(s ? { tilstand: 'ok', skoler: s } : { tilstand: 'feil' }));
  }, []);

  const sett = (endring: Partial<Inn>) => tilstand.oppdaterInnstillinger(endring);
  const skolensFylke = (id: string) => (skoler.tilstand === 'ok' ? (skoler.skoler.find((s) => s.id === id)?.fylke ?? null) : null);
  const skolerIFylket = skoler.tilstand === 'ok' ? skoler.skoler.filter((s) => s.fylke === inn.fylke) : [];

  const eksporter = () => {
    const naa = new Date();
    const blob = new Blob([lagEksport(tilstand.data, __APP_VERSJON__, naa)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = eksportfilnavn(naa);
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importer = async (fil: File | undefined) => {
    if (!fil) return;
    const lest = lesEksport(await fil.text());
    if (!lest) {
      settMelding(t('innstillinger.data.importFeil', { app: app.navn }));
      return;
    }
    if (!window.confirm(t('innstillinger.data.importBekreft'))) return;
    tilstand.sett(lest);
    settMelding(t('innstillinger.data.importOk'));
  };

  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('innstillinger.tittel')}</h1>
      {!tilstand.kanLagre && <p class="merknad merknad-advarsel">{t('innstillinger.lagring.bareMinne')}</p>}

      <Valg
        navn="malform"
        legend={t('innstillinger.malform.legend')}
        verdi={inn.malform}
        valg={[
          { verdi: 'nb', tekst: t('innstillinger.malform.nb') },
          { verdi: 'nn', tekst: t('innstillinger.malform.nn') },
        ]}
        onVelg={(malform) => sett({ malform })}
      />
      <p class="dempet liten">{t('innstillinger.malform.merknad')}</p>

      <Valg
        navn="tema"
        legend={t('innstillinger.tema.legend')}
        verdi={inn.tema}
        valg={[
          { verdi: 'system', tekst: t('innstillinger.tema.system') },
          { verdi: 'lys', tekst: t('innstillinger.tema.lys') },
          { verdi: 'mork', tekst: t('innstillinger.tema.mork') },
        ]}
        onVelg={(tema) => sett({ tema })}
      />

      <fieldset class="valggruppe">
        <legend>{t('innstillinger.sted.legend')}</legend>
        <p class="dempet liten">{t('innstillinger.sted.forklaring')}</p>
        <div class="felt">
          <label for="velg-fylke">{t('innstillinger.sted.fylke')}</label>
          <select
            id="velg-fylke"
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
          <label for="velg-skole">{t('innstillinger.sted.skole')}</label>
          {skoler.tilstand === 'feil' && inn.fylke ? (
            <>
              <p id="skole-hjelp" class="felt-hjelp">
                {t('innstillinger.sted.skoleFritekstHjelp')}
              </p>
              <input
                id="velg-skole"
                type="text"
                autoComplete="off"
                aria-describedby="skole-hjelp"
                value={inn.skole?.navn ?? ''}
                onChange={(e) => {
                  const navn = e.currentTarget.value.trim();
                  sett({ skole: navn ? { id: null, navn } : null });
                }}
              />
            </>
          ) : (
            <select
              id="velg-skole"
              disabled={!inn.fylke || skoler.tilstand !== 'ok'}
              value={inn.skole?.id ?? ''}
              onChange={(e) => {
                const id = e.currentTarget.value;
                const skole = skolerIFylket.find((s) => s.id === id);
                sett({ skole: skole ? { id: skole.id, navn: skole.navn } : null });
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
        {inn.fylke ? (
          <button type="button" class="knapp knapp-sekundaer" onClick={() => sett({ fylke: null, skole: null })}>
            <Ikon navn="lukk" />
            {t('innstillinger.sted.fjern')}
          </button>
        ) : (
          <p class="merknad">{t('innstillinger.sted.bareNasjonalt')}</p>
        )}
        <p class="dempet liten">{t('innstillinger.sted.kilde')}</p>
      </fieldset>

      <fieldset class="valggruppe">
        <legend>{t('innstillinger.data.legend')}</legend>
        <p class="dempet liten">{t('innstillinger.data.forklaring')}</p>
        <div class="knapperad">
          <button type="button" class="knapp knapp-sekundaer" onClick={eksporter}>
            <Ikon navn="last" />
            {t('innstillinger.data.eksporter')}
          </button>
          <label class="knapp knapp-sekundaer filknapp">
            <Ikon navn="hent" />
            {t('innstillinger.data.importer')}
            <input
              type="file"
              accept="application/json,.json"
              class="skjult-visuelt"
              onChange={(e) => {
                const fil = e.currentTarget.files?.[0];
                e.currentTarget.value = '';
                void importer(fil);
              }}
            />
          </label>
          <button
            type="button"
            class="knapp knapp-fare"
            onClick={() => {
              if (!window.confirm(t('innstillinger.data.slettBekreft'))) return;
              tilstand.slettAlt();
              settMelding(t('innstillinger.data.slettet'));
            }}
          >
            <Ikon navn="slett" />
            {t('innstillinger.data.slett')}
          </button>
        </div>
        <p role="status" class="liten">
          {melding}
        </p>
      </fieldset>

      <p>
        <a href="#/om">{t('om.tittel')}</a>
      </p>
    </div>
  );
}
