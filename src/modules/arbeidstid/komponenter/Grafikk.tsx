// Små visuelle hjelpemidler: stillingsmåler, tidslinje for perioder og måler for planfestet tid.
// Egne SVG-er uten diagrambibliotek. Hver figur har en tekstbeskrivelse, og tallene står også som tekst.
import { useTekst } from '../../../app/tilstand.ts';
import { medEnhet, tallTekst } from './Utregning.tsx';

const B = 320;
const H = 18;
// Farger for fag etter tur. Funksjonstid er holdt av til funksjoner.
const fagfarger = ['undervisning', 'annen_planfestet', 'motetid', 'selvdisponert'] as const;

export interface Stolpedel {
  navn: string;
  prosent: number;
  /** Funksjoner får egen farge. Fag får farger etter tur. */
  type?: 'fag' | 'funksjon';
}

/**
 * Beskjeftigelse per fag (og funksjon) som deler av en stolpe, med strek ved stillingen (standard 100 %).
 * Det som går over streken, er markert. Er stolpen kortere, viser den grå resten hva som mangler.
 */
/**
 * Stolpe for beskjeftigelsen mot stillingen. Delen ut over stillingen er markert: opp til hel stilling (100 %) som
 * variabel lønn når stillingen er mindre, og over hel stilling som overtid.
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
  const xGrense = (grense / skala) * B;
  const farge = (d: Stolpedel, i: number) => (d.type === 'funksjon' ? 'funksjonstid' : fagfarger[i % fagfarger.length]);
  let x = 0;
  const tekst = beskrivelse ?? t('arbeidstid.grafikk.stilling', { sum: tallTekst(sum), deler: deler.map((d) => `${d.navn} ${tallTekst(d.prosent)} %`).join(', '), grense: tallTekst(grense) });
  return (
    <figure class="figur">
      <svg class="diagram" viewBox={`0 0 ${B} ${H + 14}`} role="img" aria-label={tekst}>
        <rect class="figur-bakgrunn" x={0} y={0} width={xGrense} height={H} rx={3} />
        {deler.map((d, i) => {
          const w = (Math.max(0, d.prosent) / skala) * B;
          const r = <rect key={i} class={`fordeling-del-${farge(d, i)}`} x={x} y={0} width={w} height={H} />;
          x += w;
          return r;
        })}
        {sum > grense && grense < hel && <rect class="figur-variabel" x={xGrense} y={0} width={(Math.min(sum, hel) / skala) * B - xGrense} height={H} />}
        {sum > Math.max(grense, hel) && <rect class="figur-over" x={(Math.max(grense, hel) / skala) * B} y={0} width={B - (Math.max(grense, hel) / skala) * B} height={H} />}
        <line class="figur-grense" x1={xGrense} x2={xGrense} y1={-2} y2={H + 2} />
        <text class="figur-tekst" x={Math.min(Math.max(xGrense, 30), B - 2)} y={H + 12} text-anchor="end">
          {tallTekst(grense)} %
        </text>
      </svg>
      {deler.length > 1 && (
        <ul class="fordeling-forklaring fordeling-forklaring-rad">
          {deler.map((d, i) => (
            <li key={i}>
              <span class={`fordeling-farge fordeling-del-${farge(d, i)}`} aria-hidden="true" />
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
      <svg class="diagram" viewBox={`0 0 ${B} ${H}`} role="img" aria-label={tekst}>
        <rect class="figur-bakgrunn" x={0} y={0} width={B} height={H} rx={3} />
        <rect class="fordeling-del-undervisning" x={0} y={0} width={andel * B} height={H} rx={3} />
      </svg>
      <figcaption class="liten dempet">{tekst}</figcaption>
    </figure>
  );
}

/** Beløp som deler av en stolpe, f.eks. lønn og feriepenger. Beløpene står også som tekst. */
export function Belopsstolpe({ deler }: { deler: { navn: string; verdi: number }[] }) {
  const { t } = useTekst();
  const sum = deler.reduce((s, d) => s + Math.max(0, d.verdi), 0);
  const farge = (i: number) => fagfarger[i % fagfarger.length];
  let x = 0;
  const tekst = t('arbeidstid.grafikk.belop', { deler: deler.map((d) => `${d.navn} ${medEnhet(t, d.verdi, 'kroner')}`).join(', '), sum: medEnhet(t, sum, 'kroner') });
  return (
    <figure class="figur">
      <svg class="diagram" viewBox={`0 0 ${B} ${H}`} role="img" aria-label={tekst}>
        <rect class="figur-bakgrunn" x={0} y={0} width={B} height={H} rx={3} />
        {sum > 0 &&
          deler.map((d, i) => {
            const w = (Math.max(0, d.verdi) / sum) * B;
            const r = <rect key={i} class={`fordeling-del-${farge(i)}`} x={x} y={0} width={w} height={H} />;
            x += w;
            return r;
          })}
      </svg>
      <ul class="fordeling-forklaring fordeling-forklaring-rad">
        {deler.map((d, i) => (
          <li key={i}>
            <span class={`fordeling-farge fordeling-del-${farge(i)}`} aria-hidden="true" />
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
  const s = (v: number) => (Math.max(0, v) / skala) * B;
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
      <svg class="diagram" viewBox={`0 0 ${B} ${H + 14}`} role="img" aria-label={t('arbeidstid.grafikk.uke', verdier)}>
        <rect class="figur-bakgrunn" x={0} y={0} width={B} height={H} rx={3} />
        <rect class="fordeling-del-undervisning" x={0} y={0} width={s(planfestet)} height={H} />
        <rect class="fordeling-del-selvdisponert" x={s(planfestet)} y={0} width={s(selv)} height={H} />
        <line class="figur-grense" x1={s(maksUke)} x2={s(maksUke)} y1={-2} y2={H + 2} />
        <text class="figur-tekst" x={Math.min(s(maksUke), B - 2)} y={H + 12} text-anchor="end">
          {t('arbeidstid.felles.timerKort', { timer: verdier.maksUke })}
        </text>
      </svg>
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
