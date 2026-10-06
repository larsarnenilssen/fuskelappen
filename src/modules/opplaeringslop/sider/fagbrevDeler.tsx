// Delene som går igjen på sidene om lærlinger og kandidater (fase 6, pakke 6, avgjørelse 069): stegene i en vei med
// fargen til delen (skole, kontrakt i bedrift, praksis, prøven), fargeforklaringen, faktaene om veien, kildene, lukkede
// kort og overgangene. Stegene står som en loddrett sti når kolonnen er smal, og som en rad med like brede steg når
// det er plass (eier 06.10.2026, runde 2).
import { Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon, type Ikonnavn } from '../../../components/Ikon.tsx';
import { Kildelenke } from '../../../components/Kildelenke.tsx';
import type { KildeRef, Veidel, Veielement } from '../../../core/innhold/skjema.ts';
import { harKontrakt, type Veiinnhold } from '../fagbrev/data.ts';

const DELER: readonly Veidel[] = ['skole', 'bedrift', 'praksis', 'prove'];

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
export function Stegrad({ vei }: { vei: Veielement }) {
  const { t, malform } = useTekst();
  // Rammen er en container: stegene står på rad når det er plass i kolonnen, ellers som en sti.
  return (
    <div class="fb-steg-ramme">
      <ol class="fb-steg" aria-label={t('opplaeringslop.fagbrev.stegene')}>
        {vei.steg.map((s, i) => (
          <li key={i} data-del={s.del}>
            <a class="fb-steg-knapp" href={`#${s.rute}`}>
              <span class="fb-steg-merke" aria-hidden="true" />
              <span class="fb-steg-tekst">
                <span class="fb-steg-navn">{s.tekst[malform]}</span>
                <span class="fb-steg-meta">{[t(`opplaeringslop.fagbrev.del.${s.del}`), s.tid?.[malform]].filter(Boolean).join(' · ')}</span>
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
 * Hvem som melder opp, fellesfagene, voksne og kildene. Med `alt` også kontrakten, prøven, dokumentasjonen og hva som
 * skjer når kontrakten sies opp eller heves (eier 06.10.2026, svar 4: der det er naturlig å skrive om kontrakten).
 */
export function Fakta({ vei, data, med = 'kort' }: { vei: Veielement; data: Veiinnhold; med?: 'kort' | 'alt' }) {
  const { t, malform } = useTekst();
  const alt = med === 'alt';
  const slutt = alt && harKontrakt(vei) ? data.kontraktSlutt : undefined;
  const rader: [string, string | undefined, boolean][] = [
    [t('opplaeringslop.fagbrev.kontrakt'), vei.kontrakt[malform], alt],
    [t('opplaeringslop.fagbrev.prove'), vei.prove[malform], alt],
    [t('opplaeringslop.fagbrev.melderOpp'), vei.melderOpp[malform], true],
    [t('opplaeringslop.fagbrev.fellesfag'), vei.fellesfagTekst[malform], true],
    [t('opplaeringslop.fagbrev.dokumentasjon'), vei.dokumentasjon[malform], alt],
    [t('opplaeringslop.fagbrev.voksne'), vei.voksne?.[malform], true],
  ];
  return (
    <>
      <dl class="fb-fakta">
        {rader.map(([dt, dd, vis]) =>
          vis && dd ? (
            <div key={dt}>
              <dt>{dt}</dt>
              <dd>{dd}</dd>
            </div>
          ) : null,
        )}
        {slutt && (
          <div class="fb-fakta-bred">
            <dt>{slutt.tittel[malform]}</dt>
            <dd dangerouslySetInnerHTML={{ __html: slutt.tekst[malform] }} />
          </div>
        )}
      </dl>
      <Kilder kilder={slutt ? [...vei.kilder, ...slutt.kilder] : vei.kilder} />
    </>
  );
}

/** Kildene på én linje, med kortnavn og punkt. En paragraf som står i Lov og forskrift, lenker dit. */
export function Kilder({ kilder }: { kilder: readonly KildeRef[] }) {
  const { t } = useTekst();
  return (
    <p class="fb-kilde">
      <Ikon navn="paragraf" class="ikon-liten" />
      <span>
        <span class="skjult-visuelt">{t('opplaeringslop.fagbrev.kilde')}: </span>
        {kilder.map((k, i) => (
          <Fragment key={`${k.id}-${k.punkt ?? ''}`}>
            {i > 0 && ' · '}
            <Kildelenke kilde={k} kort />
          </Fragment>
        ))}
      </span>
    </p>
  );
}

/** En overgang som kort med vilkåret, og kildene under. */
export function Overgangskort({ rute, ikon, tittel, vilkar, kilder }: { rute: string; ikon: Ikonnavn; tittel: string; vilkar: string; kilder: readonly KildeRef[] }) {
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
