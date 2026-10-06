// Delene som går igjen på sidene om lærlinger og kandidater (fase 6, pakke 6, avgjørelse 069): stegene i en vei med
// fargen til delen (skole, kontrakt i bedrift, praksis, prøven), fargeforklaringen, faktaene om veien, regelverket og
// kildene som lukkede rader nederst, og overgangene. Stegene står som en loddrett sti når kolonnen er smal, og som en rad med like brede steg når
// det er plass (eier 06.10.2026, runde 2).
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon, type Ikonnavn } from '../../../components/Ikon.tsx';
import { Kortfot, KortfotRader } from '../../../components/Kortfot.tsx';
import { unikeKilder } from '../../../components/kilderader.ts';
import type { KildeRef, Veidel, Veielement } from '../../../core/innhold/skjema.ts';
import { harKontrakt, type Veiinnhold } from '../fagbrev/data.ts';
import { faktaoppstilling } from './faktaoppstilling.ts';

const DELER: readonly Veidel[] = ['skole', 'bedrift', 'praksis', 'prove'];

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

/** Teksten om oppsigelse og heving, når den hører til veien og alt skal med. */
function kontraktSlutt(vei: Veielement, data: Veiinnhold, med: 'kort' | 'alt') {
  return med === 'alt' && harKontrakt(vei) ? data.kontraktSlutt : undefined;
}

/** Kildene til faktaene om veien: veiens egne, og kildene til teksten om oppsigelse og heving når den står med. */
export function faktakilder(vei: Veielement, data: Veiinnhold, med: 'kort' | 'alt' = 'kort'): KildeRef[] {
  const slutt = kontraktSlutt(vei, data, med);
  return slutt ? [...vei.kilder, ...slutt.kilder] : [...vei.kilder];
}

/**
 * Hvem som melder opp, fellesfagene og voksne. Med `alt` også kontrakten, prøven, dokumentasjonen og hva som skjer når
 * kontrakten sies opp eller heves (eier 06.10.2026, svar 4: der det er naturlig å skrive om kontrakten). Kildene står i
 * kortet rundt, som lukkede rader nederst (Kildefot).
 */
export function Fakta({ vei, data, med = 'kort' }: { vei: Veielement; data: Veiinnhold; med?: 'kort' | 'alt' }) {
  const { t, malform } = useTekst();
  const alt = med === 'alt';
  const slutt = kontraktSlutt(vei, data, med);
  const rader: [string, string, string | undefined, boolean][] = [
    ['kontrakt', t('opplaeringslop.fagbrev.kontrakt'), vei.kontrakt[malform], alt],
    ['prove', t('opplaeringslop.fagbrev.prove'), vei.prove[malform], alt],
    ['melderOpp', t('opplaeringslop.fagbrev.melderOpp'), vei.melderOpp[malform], true],
    ['fellesfag', t('opplaeringslop.fagbrev.fellesfag'), vei.fellesfagTekst[malform], true],
    ['dokumentasjon', t('opplaeringslop.fagbrev.dokumentasjon'), vei.dokumentasjon[malform], alt],
    ['voksne', t('opplaeringslop.fagbrev.voksne'), vei.voksne?.[malform], true],
  ];
  const synlige = rader.filter(([, , dd, vis]) => vis && dd);
  // I «Om veien» fyller feltene hele bredden eller deler den to og to, uten tomrom (eier 06.10.2026).
  const plass = faktaoppstilling(synlige.map(([felt]) => felt));
  const KLASSE = { hoy: 'fb-fakta-hoy', bred: 'fb-fakta-bred' } as const;
  return (
    <dl class="fb-fakta">
      {synlige.map(([felt, dt, dd]) => {
        const p = plass[felt];
        return (
          <div key={felt} class={p ? KLASSE[p] : undefined}>
            <dt>{dt}</dt>
            <dd>{dd}</dd>
          </div>
        );
      })}
      {slutt && (
        <div class="fb-fakta-bred">
          <dt>{slutt.tittel[malform]}</dt>
          <dd dangerouslySetInnerHTML={{ __html: slutt.tekst[malform] }} />
        </div>
      )}
    </dl>
  );
}

/**
 * Regelverket og kildene som lukkede rader nederst i et kort eller en boks, som ellers i appen (Kortfot, eier
 * 06.10.2026): «I regelverket» med paragrafene i Lov og forskrift, og «Kilder» med alle kildene. `fot` når radene står
 * nederst i en ramme, fra kant til kant. Uten `fot` står radene under en liste, f.eks. under overgangene.
 */
export function Kildefot({ kilder, fot = false }: { kilder: readonly KildeRef[]; fot?: boolean }) {
  const unike = unikeKilder(kilder);
  return fot ? <Kortfot kilder={unike} /> : <KortfotRader kilder={unike} />;
}

/**
 * En overgang som kort med vilkåret. Kortet er en lenke, så kildene står samlet under listen med overgangene
 * (Kildefot), ikke i hvert kort (eier 06.10.2026).
 */
export function Overgangskort({ rute, ikon, tittel, vilkar }: { rute: string; ikon: Ikonnavn; tittel: string; vilkar: string }) {
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
    </li>
  );
}
