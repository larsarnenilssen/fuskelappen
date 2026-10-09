// Små visuelle hjelpemidler: stillingsmåler, tidslinje for perioder og måler for planfestet tid.
// Stolper i HTML uten diagrambibliotek. Hver figur har en tekstbeskrivelse, og tallene står også som tekst.
import type { ComponentChildren } from 'preact';
import { useTekst } from '../../../app/tilstand.ts';
import { medEnhet, tallTekst } from './Utregning.tsx';

export interface Stolpedel {
  navn: string;
  prosent: number;
  /** Fag får farger etter tur. Funksjoner står i fargen til funksjoner, som i årsverket. */
  type?: 'fag' | 'funksjon';
}

/** En del av en stolpe: verdien og fargen (`fordeling-del-<farge>`). */
export interface Stolpebit {
  verdi: number;
  farge: string;
}

/**
 * Felles stolpe for figurene i kalkulatorene (forslag 09.10.2026): HTML med fast høyde i stedet for en SVG som skaleres
 * med bredden, så stolpen og tekstene har samme størrelse på mobil og skrivebord. Delene har 2 px mellomrom i
 * flatefargen og avrundede hjørner. En strek med tekst under kan markere en grense, f.eks. stillingen.
 */
export function Stolpe({
  deler,
  skala,
  spor,
  merke,
  markert = [],
  bred = false,
  etikett,
  children,
}: {
  deler: readonly Stolpebit[];
  /** Verdien som tilsvarer hele bredden. */
  skala: number;
  /** Et lyst spor bak delene, fra 0 til denne verdien. Uten verdi går sporet over hele bredden. */
  spor?: number;
  merke?: { verdi: number; tekst: string };
  /** Deler som legges over stolpen, f.eks. det som går ut over stillingen. */
  markert?: readonly { fra: number; til: number; farge: string }[];
  /** Høyere stolpe, til årsverket. */
  bred?: boolean;
  etikett: string;
  /** Mer under stolpen, f.eks. klammen over planfestet tid. */
  children?: ComponentChildren;
}) {
  const andel = (v: number) => (skala > 0 ? (Math.max(0, v) / skala) * 100 : 0);
  const synlige = deler.filter((d) => d.verdi > 0);
  let x = 0;
  return (
    <div class={`stolpe${bred ? ' stolpe-bred' : ''}`}>
      <div class="stolpe-spor" role="img" aria-label={etikett}>
        <span class="stolpe-bakgrunn" style={{ width: `${spor === undefined ? 100 : andel(spor)}%` }} />
        {synlige.map((d, i) => {
          const venstre = andel(x);
          x += d.verdi;
          const bredde = andel(d.verdi);
          // Mellomrommet tas fra delen til venstre, så delene står der verdien sier.
          const siste = i === synlige.length - 1;
          return <span key={i} class={`stolpe-del fordeling-del-${d.farge}`} style={{ left: `${venstre}%`, width: siste ? `${bredde}%` : `max(0px, calc(${bredde}% - 2px))` }} />;
        })}
        {markert.map((m, i) => (
          <span key={`m${i}`} class={`stolpe-del stolpe-markert fordeling-del-${m.farge}`} style={{ left: `${andel(m.fra)}%`, width: `${andel(m.til - m.fra)}%` }} />
        ))}
        {merke && <span class="stolpe-merke" style={{ left: `${andel(merke.verdi)}%` }} />}
      </div>
      {merke && (
        <span class={`stolpe-merketekst stolpe-tekst tall${andel(merke.verdi) > 50 ? ' stolpe-merketekst-hoyre' : ''}`} style={{ '--merke': `${andel(merke.verdi)}%` }}>
          {merke.tekst}
        </span>
      )}
      {children}
    </div>
  );
}

/** Fargene til fagene etter tur: de fire første i paletten for figurene, som prikken i fagkortene (eier 09.10.2026). */
const fagfarger = ['serie-1', 'serie-2', 'serie-3', 'serie-4'] as const;

/**
 * Stolpe for beskjeftigelsen mot stillingen, med strek ved stillingen. Hvert fag har sin farge etter tur, og
 * funksjonene står i fargen til funksjoner, som i årsverket, skilt med mellomrom og navngitt i forklaringen. Delen ut over
 * stillingen er markert: opp til hel stilling (100 %) som variabel lønn når stillingen er mindre, og over hel stilling
 * som overtid.
 */
export function Stillingsmaaler({
  deler,
  grense = 100,
  hel = 100,
  beskrivelse,
}: {
  deler: Stolpedel[];
  grense?: number;
  /** Hel stilling i samme enhet som delene (100, eller 100 × periodenøkkelen når en periode vises på årsbasis). */
  hel?: number;
  beskrivelse?: string;
}) {
  const { t } = useTekst();
  const sum = deler.reduce((s, d) => s + d.prosent, 0);
  const skala = Math.max(grense, sum, 1);
  // Fagene telles for seg, så funksjonene ikke tar en farge fra fagene.
  let fag = 0;
  const farger = deler.map((d) => (d.type === 'funksjon' ? 'funksjonstid' : fagfarger[fag++ % fagfarger.length]));
  const tekst = beskrivelse ?? t('arbeidstid.grafikk.stilling', { sum: tallTekst(sum), deler: deler.map((d) => `${d.navn} ${tallTekst(d.prosent)} %`).join(', '), grense: tallTekst(grense) });
  // Det som går ut over stillingen, legges over delene: variabel lønn opp til hel stilling, og overtid over den.
  const markert: { fra: number; til: number; farge: string }[] = [];
  if (sum > grense && grense < hel) markert.push({ fra: grense, til: Math.min(sum, hel), farge: 'variabel' });
  if (sum > Math.max(grense, hel)) markert.push({ fra: Math.max(grense, hel), til: sum, farge: 'over' });
  return (
    <figure class="figur">
      <Stolpe
        deler={deler.map((d, i) => ({ verdi: d.prosent, farge: farger[i] ?? 'serie-1' }))}
        skala={skala}
        spor={grense}
        markert={markert}
        merke={{ verdi: grense, tekst: `${tallTekst(grense)} %` }}
        etikett={tekst}
      />
      {deler.length > 1 && (
        <ul class="fordeling-forklaring fordeling-forklaring-rad">
          {deler.map((d, i) => (
            <li key={i}>
              <span class={`fordeling-farge fordeling-del-${farger[i] ?? 'serie-1'}`} aria-hidden="true" />
              <span>
                {d.navn}: {tallTekst(d.prosent)} %
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

/** Perioden som del av skoleåret. */
export function Periodelinje({ dager, skolear }: { dager: number; skolear: number }) {
  const { t } = useTekst();
  const andel = skolear > 0 ? Math.min(1, dager / skolear) : 0;
  const tekst = t('arbeidstid.grafikk.periode', { dager: tallTekst(dager), skolear: tallTekst(skolear), prosent: tallTekst(andel * 100, 1) });
  return (
    <figure class="figur">
      <Stolpe deler={[{ verdi: andel, farge: 'undervisning' }]} skala={1} etikett={tekst} />
      <figcaption class="liten dempet">{tekst}</figcaption>
    </figure>
  );
}

/** Delene av et beløp. Hver del har fast farge, så en del beholder fargen når en annen faller bort. */
export type Belopsdel = 'lonn' | 'tillegg' | 'variabel' | 'overtid' | 'feriepenger';
const belopsfarger: Record<Belopsdel, string> = { lonn: 'serie-1', tillegg: 'serie-2', variabel: 'serie-3', overtid: 'serie-4', feriepenger: 'serie-5' };

/** Beløp som deler av en stolpe, f.eks. lønn og feriepenger. Beløpene står også som tekst. */
export function Belopsstolpe({ deler }: { deler: { id: Belopsdel; navn: string; verdi: number }[] }) {
  const { t } = useTekst();
  const sum = deler.reduce((s, d) => s + Math.max(0, d.verdi), 0);
  const tekst = t('arbeidstid.grafikk.belop', { deler: deler.map((d) => `${d.navn} ${medEnhet(t, d.verdi, 'kroner')}`).join(', '), sum: medEnhet(t, sum, 'kroner') });
  return (
    <figure class="figur">
      <Stolpe deler={deler.map((d) => ({ verdi: d.verdi, farge: belopsfarger[d.id] }))} skala={sum} etikett={tekst} />
      <ul class="fordeling-forklaring fordeling-forklaring-rad">
        {deler.map((d) => (
          <li key={d.id}>
            <span class={`fordeling-farge fordeling-del-${belopsfarger[d.id]}`} aria-hidden="true" />
            <span>
              {d.navn}: {medEnhet(t, d.verdi, 'kroner')}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/**
 * En gjennomsnittlig uke i arbeidsåret: planfestet tid og tid læreren disponerer selv, mot grensen for
 * planfestet tid i en enkelt uke. Teksten forklarer snittet per dag og grensen for en enkelt dag.
 */
export function Ukemaaler({ planfestet, total, maksUke, maksDag, dagerPerUke }: { planfestet: number; total: number; maksUke: number; maksDag: number; dagerPerUke: number }) {
  const { t } = useTekst();
  const skala = Math.max(total, maksUke, 1);
  const selv = Math.max(0, total - planfestet);
  const verdier = {
    planfestet: tallTekst(planfestet, 1),
    selv: tallTekst(selv, 1),
    total: tallTekst(total, 1),
    perDag: tallTekst(dagerPerUke > 0 ? planfestet / dagerPerUke : 0, 1),
    maksUke: tallTekst(maksUke, 1),
    maksDag: tallTekst(maksDag, 1),
  };
  return (
    <figure class="figur">
      <Stolpe
        deler={[
          { verdi: planfestet, farge: 'undervisning' },
          { verdi: selv, farge: 'selvdisponert' },
        ]}
        skala={skala}
        merke={{ verdi: maksUke, tekst: t('arbeidstid.felles.timerKort', { timer: verdier.maksUke }) }}
        etikett={t('arbeidstid.grafikk.uke', verdier)}
      />
      <ul class="fordeling-forklaring fordeling-forklaring-rad">
        <li>
          <span class="fordeling-farge fordeling-del-undervisning" aria-hidden="true" />
          <span>{t('arbeidstid.grafikk.ukePlanfestet', verdier)}</span>
        </li>
        <li>
          <span class="fordeling-farge fordeling-del-selvdisponert" aria-hidden="true" />
          <span>{t('arbeidstid.grafikk.ukeSelv', verdier)}</span>
        </li>
      </ul>
      <figcaption class="liten dempet">{t('arbeidstid.grafikk.ukeTekst', verdier)}</figcaption>
    </figure>
  );
}
