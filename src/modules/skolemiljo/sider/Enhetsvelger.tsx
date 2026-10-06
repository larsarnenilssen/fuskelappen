// Valget av en serie i Elevundersøkelsen (eier 06.10.2026): et søkefelt med en liste under, så brukeren kan skrive
// navnet på en skole eller et fylke i stedet for å lete i en lang meny. Mønsteret er en combobox etter ARIA 1.2:
// piltastene flytter i listen, Enter velger og Esc lukker. Uten søk står landet og fylkene. Med søk står treffene blant
// landet, fylkene og skolene, med skolene sist. «vgs» i søket finner også «videregående».
import { useId, useMemo, useRef, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';

export interface Enhetsvalg {
  /** Verdien i adressen, f.eks. «F46|p» eller «S974557584». Tom: ingen serie. */
  verdi: string;
  navn: string;
  /** Under navnet, f.eks. fylket til en skole. */
  under?: string;
  gruppe: 'ingen' | 'landet' | 'fylker' | 'skoler';
}

/** Grensen for hvor mange skoler listen viser om gangen. Brukeren skriver mer for å finne resten. */
const MAKS_SKOLER = 40;

const ord = (tekst: string) =>
  tekst
    .toLocaleLowerCase('nb')
    .replace(/\bvgs\b/g, 'videregående')
    .split(/[\s,.-]+/)
    .filter(Boolean);

/** Valgene som passer med søket: alle ordene i søket må stå først i et ord i navnet eller undertittelen. */
export function filtrerEnheter(valg: readonly Enhetsvalg[], sok: string): Enhetsvalg[] {
  const sokeord = ord(sok);
  if (sokeord.length === 0) return valg.filter((v) => v.gruppe !== 'skoler');
  return valg.filter((v) => {
    const tekst = ord(`${v.navn} ${v.under ?? ''}`);
    return v.gruppe !== 'ingen' && sokeord.every((s) => tekst.some((t) => t.startsWith(s)));
  });
}

export function Enhetsvelger({ etikett, valg, verdi, onVelg }: { etikett: preact.ComponentChildren; valg: readonly Enhetsvalg[]; verdi: string; onVelg: (verdi: string) => void }) {
  const { t } = useTekst();
  const id = useId();
  const listeId = `${id}-liste`;
  const valgt = valg.find((v) => v.verdi === verdi);
  const [sok, settSok] = useState<string | null>(null);
  const [apen, settApen] = useState(false);
  const [aktiv, settAktiv] = useState(0);
  const felt = useRef<HTMLInputElement>(null);

  const treff = useMemo(() => filtrerEnheter(valg, sok ?? ''), [valg, sok]);
  const skoler = treff.filter((v) => v.gruppe === 'skoler');
  const synlige = [...treff.filter((v) => v.gruppe !== 'skoler'), ...skoler.slice(0, MAKS_SKOLER)];
  const flere = skoler.length - MAKS_SKOLER;
  const antallSkoler = valg.filter((v) => v.gruppe === 'skoler').length;

  const lukk = () => {
    settApen(false);
    settSok(null);
  };
  const velg = (v: Enhetsvalg) => {
    onVelg(v.verdi);
    lukk();
  };
  const flytt = (steg: number) => {
    if (!apen) settApen(true);
    settAktiv((a) => (synlige.length === 0 ? 0 : (a + steg + synlige.length) % synlige.length));
  };

  const grupper: { gruppe: Enhetsvalg['gruppe']; tittel: string }[] = [
    { gruppe: 'ingen', tittel: '' },
    { gruppe: 'landet', tittel: t('skolemiljo.elevundersokelsen.landet') },
    { gruppe: 'fylker', tittel: t('skolemiljo.elevundersokelsen.fylker') },
    { gruppe: 'skoler', tittel: t('skolemiljo.elevundersokelsen.skoler') },
  ];
  const aktivId = apen && synlige[aktiv] ? `${id}-v${aktiv}` : undefined;

  return (
    <div class="eu-velger">
      <label for={id} class="eu-seriesvalg-etikett">
        {etikett}
      </label>
      <div class="eu-velger-felt">
        <Ikon navn="sok" class="ikon-liten eu-velger-ikon" />
        <input
          ref={felt}
          id={id}
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck={false}
          aria-autocomplete="list"
          aria-expanded={apen}
          aria-controls={listeId}
          aria-activedescendant={aktivId}
          placeholder={t('skolemiljo.elevundersokelsen.sokPlassholder')}
          value={sok ?? valgt?.navn ?? ''}
          onFocus={(e) => {
            e.currentTarget.select();
            settAktiv(0);
            settApen(true);
          }}
          onClick={() => settApen(true)}
          onInput={(e) => {
            settSok(e.currentTarget.value);
            settAktiv(0);
            settApen(true);
          }}
          onBlur={lukk}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              flytt(1);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              flytt(-1);
            } else if (e.key === 'Enter') {
              const v = apen ? synlige[aktiv] : undefined;
              if (v) {
                e.preventDefault();
                velg(v);
              }
            } else if (e.key === 'Escape') {
              if (apen) e.preventDefault();
              lukk();
            }
          }}
        />
        <Ikon navn={apen ? 'opp' : 'ned'} class="ikon-liten eu-velger-pil" />
      </div>
      <div class="eu-velger-liste" hidden={!apen}>
        {synlige.length === 0 && <p class="eu-velger-tom">{t('skolemiljo.elevundersokelsen.ingenTreff')}</p>}
        <div id={listeId} role="listbox" aria-label={t('skolemiljo.elevundersokelsen.treff')}>
        {grupper.map(({ gruppe, tittel }) => {
          const iGruppen = synlige.filter((v) => v.gruppe === gruppe);
          if (iGruppen.length === 0) return null;
          const overskrift = `${id}-${gruppe}`;
          return (
            <div key={gruppe} role="group" aria-labelledby={tittel ? overskrift : undefined} aria-label={tittel ? undefined : t('skolemiljo.elevundersokelsen.ingen')}>
              {tittel && (
                <p id={overskrift} role="presentation" class="eu-velger-gruppe">
                  {tittel}
                </p>
              )}
              {iGruppen.map((v) => {
                const i = synlige.indexOf(v);
                return (
                  <div
                    key={v.verdi}
                    id={`${id}-v${i}`}
                    role="option"
                    aria-selected={v.verdi === verdi}
                    class={`eu-velger-valg${i === aktiv ? ' eu-velger-aktiv' : ''}`}
                    // Mus og trykk velger uten at feltet mister fokus først.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => velg(v)}
                    onMouseMove={() => i !== aktiv && settAktiv(i)}
                  >
                    <span class="eu-velger-navn">{v.navn}</span>
                    {v.under && <span class="eu-velger-under">{v.under}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
        </div>
        <p class="eu-velger-hint" aria-live="polite">
          {sok
            ? flere > 0
              ? t('skolemiljo.elevundersokelsen.flereTreff', { antall: String(flere) })
              : ''
            : t('skolemiljo.elevundersokelsen.skrivForSkoler', { antall: String(antallSkoler) })}
        </p>
      </div>
    </div>
  );
}
