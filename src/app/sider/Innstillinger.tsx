import { useEffect, useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Ikon } from '../../components/Ikon.tsx';
import { eksportfilnavn, lagEksport, lesEksport, type Innstillinger as Inn } from '../../core/lagring/lagring.ts';
import { KildestatusIndikator } from '../Kildestatusindikator.tsx';
import { StedValg } from '../StedValg.tsx';
import { tilstand, useTekst, useTilstand } from '../tilstand.ts';
import { Jukselappbryter } from '../Jukselapp.tsx';
import { Tilbakemelding } from '../Tilbakemelding.tsx';
import { FLYTTEPARAMETER, lesFlytting } from '../flytting.ts';
import { erstattAdresse } from '../ruter.ts';
import type { SideProps } from '../../modules/typer.ts';
import { LokaleReglerKort } from '../lokaleregler/LokaleReglerKort.tsx';
import { apneVelkomst } from '../velkomst/apne.ts';

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

export default function Innstillinger({ sporring }: SideProps) {
  const { t } = useTekst();
  const data = useTilstand();
  const inn = data.innstillinger;
  const [melding, settMelding] = useState<string | null>(null);

  // Innstillingene og favorittene fra den gamle adressen (avgjørelse 065). Adressen ryddes, så de ikke hentes inn på nytt.
  useEffect(() => {
    const verdi = sporring.get(FLYTTEPARAMETER);
    if (verdi === null) return;
    erstattAdresse('/innstillinger');
    const lest = lesFlytting(verdi);
    if (!lest) {
      settMelding(t('flytting.feil'));
      return;
    }
    if (!window.confirm(t('flytting.bekreft'))) return;
    tilstand.sett(lest);
    settMelding(t('flytting.ok'));
  }, []);

  const sett = (endring: Partial<Inn>) => tilstand.oppdaterInnstillinger(endring);

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
        <legend>{t('forside.jukselapp.legend')}</legend>
        <Jukselappbryter id="innst-jukselapp" />
      </fieldset>

      <StedValg />

      {/* Brukerens egne lokale regler og de godkjente for stedet (fase 9, avgjørelse 093). */}
      <LokaleReglerKort />

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

      <Tilbakemelding overskrift="legend" />

      {/* Velkomsten, kildesjekken og Om appen nederst, i den rekkefølgen (eier 09.10.2026). Kildestatusen sto i
          toppfeltet før avgjørelse 056. */}
      <ul class="liste">
        <li>
          {/* Velkomsten kan åpnes igjen her og fra forsiden (fase 10). */}
          <button type="button" class="listelenke listelenke-knapp" onClick={apneVelkomst}>
            <Ikon navn="flagg" />
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('velkomst.innstillinger')}</span>
              <span class="listelenke-under">{t('velkomst.innstillingerUnder')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </button>
        </li>
        <li>
          <KildestatusIndikator />
        </li>
        <li>
          <a class="listelenke" href="#/om">
            <Ikon navn="info" />
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('om.tittel')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
    </div>
  );
}
