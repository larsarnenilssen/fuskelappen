// Delene som går igjen på sidene om lærlinger og kandidater (MOCKUP, fase 6, pakke 6): stegene i en vei med fargen til
// delen (skole, kontrakt i bedrift, praksis, prøven), fargeforklaringen, faktaene om veien, lukkede kort og
// overgangene. Stegene står som en loddrett sti på mobil og som en rad med like brede steg på stor skjerm (eier
// 06.10.2026, runde 2).
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon, type Ikonnavn } from '../../../components/Ikon.tsx';
import { type Del, harKontrakt, KONTRAKT_SLUTT, type Vei } from '../fagbrev/mockup.ts';

export { FAGBREV_RUTE, veiRute } from '../fagbrev/mockup.ts';

const DELER: readonly Del[] = ['skole', 'bedrift', 'praksis', 'prove'];

/** Fra denne bredden står sidene om lærlinger og kandidater i to kolonner (eier 06.10.2026, svar 6). Samme verdi i base.css. */
const TO_KOLONNER = '(min-width: 64rem)';

/** Om skjermen er bred nok til to kolonner. Følger med når vinduet endrer størrelse. */
export function useBred(): boolean {
  const [bred, settBred] = useState(() => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(TO_KOLONNER).matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia(TO_KOLONNER);
    const endret = () => settBred(m.matches);
    m.addEventListener('change', endret);
    return () => m.removeEventListener('change', endret);
  }, []);
  return bred;
}

/** Stegene i veien. Hvert steg lenker til tilbudet, begrepet eller prøven, og viser delen og tiden under navnet. */
export function Stegrad({ vei }: { vei: Vei }) {
  const { t } = useTekst();
  // Rammen er en container: stegene står på rad når det er plass i kolonnen, ellers som en sti.
  return (
    <div class="fb-steg-ramme">
      <ol class="fb-steg" aria-label={t('opplaeringslop.fagbrev.stegene')}>
        {vei.steg.map((s, i) => (
          <li key={i} data-del={s.del}>
            <a class="fb-steg-knapp" href={`#${s.rute}`}>
              <span class="fb-steg-merke" aria-hidden="true" />
              <span class="fb-steg-tekst">
                <span class="fb-steg-navn">{s.tekst}</span>
                <span class="fb-steg-meta">{[t(`opplaeringslop.fagbrev.del.${s.del}`), s.tid].filter(Boolean).join(' · ')}</span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten fb-steg-pil" />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Fargene i stegene med navn. Delen står også i teksten under hvert steg, så fargen er aldri det eneste som skiller. */
export function Fargeforklaring() {
  const { t } = useTekst();
  return (
    <ul class="fb-forklaring" aria-hidden="true">
      {DELER.map((d) => (
        <li key={d} data-del={d}>
          {t(`opplaeringslop.fagbrev.del.${d}`)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Hvem som melder opp, fellesfagene, voksne og kilden. Med `alt` også kontrakten, prøven, dokumentasjonen og hva som
 * skjer når kontrakten sies opp eller heves (eier 06.10.2026, svar 4: der det er naturlig å skrive om kontrakten).
 */
export function Fakta({ vei, med = 'kort' }: { vei: Vei; med?: 'kort' | 'alt' }) {
  const { t } = useTekst();
  const alt = med === 'alt';
  const slutt = alt && harKontrakt(vei);
  const rader: [string, string | undefined, boolean][] = [
    [t('opplaeringslop.fagbrev.kontrakt'), vei.kontrakt, alt],
    [t('opplaeringslop.fagbrev.prove'), vei.prove, alt],
    [t('opplaeringslop.fagbrev.melderOpp'), vei.melderOpp, true],
    [t('opplaeringslop.fagbrev.fellesfag'), vei.fellesfagTekst, true],
    [t('opplaeringslop.fagbrev.dokumentasjon'), vei.dokumentasjon, alt],
    [t('opplaeringslop.fagbrev.voksne'), vei.voksne, true],
    [t('opplaeringslop.fagbrev.kontraktSlutt'), KONTRAKT_SLUTT.tekst, slutt],
  ];
  return (
    <>
      <dl class="fb-fakta">
        {rader.map(([dt, dd, vis]) =>
          vis && dd ? (
            <div key={dt} class={dd.length > 160 ? 'fb-fakta-bred' : undefined}>
              <dt>{dt}</dt>
              <dd>{dd}</dd>
            </div>
          ) : null,
        )}
      </dl>
      <Kilder kilder={slutt ? [...vei.kilder, ...KONTRAKT_SLUTT.kilder] : vei.kilder} />
    </>
  );
}

export function Kilder({ kilder }: { kilder: readonly string[] }) {
  const { t } = useTekst();
  return (
    <p class="fb-kilde">
      <Ikon navn="paragraf" class="ikon-liten" />
      <span class="skjult-visuelt">{t('opplaeringslop.fagbrev.kilde')}: </span>
      {kilder.join(' · ')}
    </p>
  );
}

/** Et kort som er lukket fra start, med tittel og én linje, som innholdskortene i Vurdering. */
export function Lukketkort({ tittel, smakebit, children, klasse }: { tittel: string; smakebit: string; children: ComponentChildren; klasse?: string }) {
  const [aapen, settAapen] = useState(false);
  const id = useId();
  return (
    <div class={`innholdskort${klasse ? ` ${klasse}` : ''}`}>
      <button type="button" class="innholdskort-knapp" aria-expanded={aapen} aria-controls={id} onClick={() => settAapen(!aapen)}>
        <span class="innholdskort-topp">
          <span class="innholdskort-tittel">{tittel}</span>
          <span class="innholdskort-smakebit">{smakebit}</span>
        </span>
        <Ikon navn={aapen ? 'opp' : 'ned'} class="innholdskort-pil" />
      </button>
      <div id={id} class="innholdskort-innhold" hidden={!aapen}>
        {children}
      </div>
    </div>
  );
}

/** En overgang som kort med vilkåret, og kilden under. */
export function Overgangskort({ rute, ikon, tittel, vilkar, kilder }: { rute: string; ikon: Ikonnavn; tittel: string; vilkar: string; kilder: readonly string[] }) {
  return (
    <li>
      <a class="frist-inngang" href={rute}>
        <span class="frist-inngang-tittel">
          <Ikon navn={ikon} />
          {tittel}
        </span>
        <span class="frist-inngang-neste">{vilkar}</span>
        <Ikon navn="hoyre" class="frist-inngang-pil" />
      </a>
      <Kilder kilder={kilder} />
    </li>
  );
}

