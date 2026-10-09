// Skisse av fag- og funksjonskortene i Arbeidsplan (eier 09.10.2026): feltet for faget og navnet på funksjonen står
// der «Fag 1» og «Funksjon 1» står i dag, og kortnavnet står der når kortet er lukket. Bare i utvikling og i
// testversjonen. Kortene bruker klassene og fargene fra Arbeidsplan, men regner ingenting og lagrer ingenting.
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { Tallfelt } from '../../components/Tallfelt.tsx';
import { fyllInn } from '../../core/i18n/tekst.ts';
import { Stillingsmaaler } from '../../modules/arbeidstid/komponenter/Grafikk.tsx';
import { Skjemadel } from '../../modules/arbeidstid/komponenter/Skjemadel.tsx';
import { Vippe } from '../../modules/arbeidstid/komponenter/Skjema.tsx';
import { skisseArbeidsplanNb as s } from '../../strings/skisse-arbeidsplan.nb.ts';
import '../../styles/skisse-arbeidsplan.css';

interface Fageksempel {
  kort: string;
  rad: string;
  kode: string;
  koder?: string;
}

/** Overskriften i kortet: prikken, feltet (åpent) eller kortnavnet (lukket), pilen og krysset. */
function Hode({
  lukket,
  onVeksle,
  navn,
  resultat,
  felt,
  fjern,
}: {
  lukket: boolean;
  onVeksle: () => void;
  navn: string;
  resultat: string | null;
  felt: ComponentChildren;
  fjern: string;
}) {
  return (
    <div class="skisse-hode">
      <span class="skisse-prikk" aria-hidden="true" />
      {lukket ? (
        <button type="button" class="kortknapp skisse-navn" aria-expanded="false" onClick={onVeksle}>
          <span class="kortknapp-tekst">
            {navn}
            {resultat && <span class="fagkort-resultat tall"> · {resultat}</span>}
          </span>
        </button>
      ) : (
        felt
      )}
      <button
        type="button"
        class="ikonknapp skisse-ikon"
        aria-expanded={!lukket}
        aria-label={fyllInn(lukket ? s.aapne : s.lukk, { navn })}
        onClick={onVeksle}
      >
        <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
      </button>
      <button type="button" class="ikonknapp skisse-ikon" aria-label={fjern}>
        <Ikon navn="lukk" class="ikon-liten" />
      </button>
    </div>
  );
}

function Fagkort({ nr, fag, resultat, startLukket = false }: { nr: number; fag: Fageksempel | null; resultat: string | null; startLukket?: boolean }) {
  const [lukket, settLukket] = useState(startLukket);
  const [modus, settModus] = useState<'arstimer' | 'okter'>('arstimer');
  const [arstimer, settArstimer] = useState<number | null>(fag ? 140 : null);
  const navn = fag?.kort ?? fyllInn(s.fagPlassholder, { nr }).split(':')[0] ?? '';
  return (
    <fieldset class={`fagkort skisse-kort${lukket ? ' lukket' : ''}`}>
      <legend class="skjult-visuelt">{navn}</legend>
      <Hode
        lukket={lukket}
        onVeksle={() => settLukket(!lukket)}
        navn={navn}
        resultat={resultat}
        fjern={fyllInn(s.fjernFag, { nr })}
        felt={
          <div class="sokefelt skisse-felt">
            <Ikon navn="sok" class="sokefelt-ikon" />
            <input type="search" autoComplete="off" aria-label={navn} placeholder={fyllInn(s.fagPlassholder, { nr })} value={fag?.kort ?? ''} />
          </div>
        }
      />
      {!lukket && (
        <div class="skisse-innhold">
          {fag ? (
            <p class="fagvalg">
              <span class="fagvalg-navn">{fag.rad}</span>
              <span class="fagvalg-ramme tall">{s.arsrammeKort}</span>
              <button type="button" class="lenkeknapp liten">
                {s.endre}
              </button>
              {fag.koder && <span class="fagvalg-kode">{fag.koder}</span>}
            </p>
          ) : (
            <p class="skisse-lenkerad">
              <span class="dempet liten">{s.fagSokHjelp}</span>
              <button type="button" class="lenkeknapp liten">
                {s.manuell}
              </button>
            </p>
          )}
          <div class="inndatarad">
            <Bryter
              legend={`${navn}: ${s.arstimer}`}
              skjultLegend
              verdi={modus}
              valg={[
                { verdi: 'arstimer', tekst: s.arstimer },
                { verdi: 'okter', tekst: s.okter },
              ]}
              onEndring={settModus}
            />
            <Tallfelt class="felt-kompakt" skjultEtikett etikett={`${navn}: ${s.arstimer}`} verdi={arstimer} min={0} maks={2000} onEndring={settArstimer} />
          </div>
          {fag && <p class="felt-hjelp">{fyllInn(s.arstimerHjelp, { kode: fag.kode })}</p>}
        </div>
      )}
    </fieldset>
  );
}

function Funksjonskort({ nr, startNavn, startProsent, startLukket = false }: { nr: number; startNavn: string; startProsent: number | null; startLukket?: boolean }) {
  const [lukket, settLukket] = useState(startLukket);
  const [navn, settNavn] = useState(startNavn);
  const [prosent, settProsent] = useState<number | null>(startProsent);
  const [enhet, settEnhet] = useState<'prosent' | 'timer'>('prosent');
  const [utvider, settUtvider] = useState(true);
  const vist = navn.trim() || fyllInn(s.funksjonPlassholder, { nr }).split(':')[0] || '';
  return (
    <fieldset class={`fagkort funksjonskort skisse-kort${lukket ? ' lukket' : ''}`}>
      <legend class="skjult-visuelt">{vist}</legend>
      <Hode
        lukket={lukket}
        onVeksle={() => settLukket(!lukket)}
        navn={vist}
        resultat={prosent !== null ? `${prosent} %` : null}
        fjern={fyllInn(s.fjernFunksjon, { nr })}
        felt={
          <input
            class="tekstfelt skisse-felt"
            type="text"
            autoComplete="off"
            aria-label={vist}
            placeholder={fyllInn(s.funksjonPlassholder, { nr })}
            value={navn}
            onInput={(e) => settNavn(e.currentTarget.value)}
          />
        }
      />
      {!lukket && (
        <div class="skisse-innhold">
          <div class="inndatarad">
            <Tallfelt class="felt-kompakt" skjultEtikett etikett={`${vist}: %`} verdi={prosent} min={0} maks={100} onEndring={settProsent} />
            <Bryter
              legend={`${vist}: ${s.timer}`}
              skjultLegend
              kompakt
              verdi={enhet}
              valg={[
                { verdi: 'prosent', tekst: '%' },
                { verdi: 'timer', tekst: s.timer },
              ]}
              onEndring={settEnhet}
            />
          </div>
          <Vippe tekst={s.utvider} pa={utvider} onEndring={settUtvider} />
        </div>
      )}
    </fieldset>
  );
}

export default function SkisseArbeidsplan() {
  const { engelsk, matematikk, kontaktlaerer } = s.eksempler;
  return (
    <div class="side kalkulator" data-kalkulator="arbeidsplan">
      <h1 tabIndex={-1}>{s.tittel}</h1>
      <p>{s.ingress}</p>
      <p class="merknad">{s.bareHer}</p>
      <Skjemadel del="undervisning" tittel={s.undervisning} sum="53,33 %">
        <section class="fagkortliste" aria-label={s.undervisning}>
          <Fagkort nr={1} fag={engelsk} resultat="26,67 %" />
          <Fagkort nr={2} fag={matematikk} resultat="26,67 %" startLukket />
          <Fagkort nr={3} fag={null} resultat={null} />
        </section>
        <button type="button" class="knapp knapp-sekundaer">
          <Ikon navn="pluss" />
          {s.leggTilFag}
        </button>
      </Skjemadel>
      <Skjemadel del="funksjoner" tittel={s.funksjoner} sum="10 %">
        <Funksjonskort nr={1} startNavn={kontaktlaerer} startProsent={10} startLukket />
        <Funksjonskort nr={2} startNavn="" startProsent={null} />
        <button type="button" class="knapp knapp-sekundaer">
          <Ikon navn="pluss" />
          {s.leggTilFunksjon}
        </button>
      </Skjemadel>
      <h2 class="liten-overskrift">{s.stolpe}</h2>
      <Stillingsmaaler
        deler={[
          { navn: engelsk.kort, prosent: 26.67 },
          { navn: matematikk.kort, prosent: 26.67 },
          { navn: kontaktlaerer, prosent: 10, type: 'funksjon' },
        ]}
      />
    </div>
  );
}
