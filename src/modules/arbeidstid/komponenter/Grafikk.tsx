// Små visuelle hjelpemidler: stillingsmåler, tidslinje for perioder og måler for planfestet tid.
// Egne SVG-er uten diagrambibliotek. Hver figur har en tekstbeskrivelse, og tallene står også som tekst.
import { useTekst } from '../../../app/tilstand.ts';
import { tallTekst } from './Utregning.tsx';

const B = 320;
const H = 18;
const farger = ['undervisning', 'annen_planfestet', 'funksjonstid', 'motetid', 'selvdisponert'] as const;

/** Beskjeftigelse per fag som deler av en stolpe, med strek ved 100 %. */
export function Stillingsmaaler({ deler }: { deler: { navn: string; prosent: number }[] }) {
  const { t } = useTekst();
  const sum = deler.reduce((s, d) => s + d.prosent, 0);
  const skala = Math.max(100, sum);
  const x100 = (100 / skala) * B;
  let x = 0;
  const beskrivelse = t('arbeidstid.grafikk.stilling', { sum: tallTekst(sum), deler: deler.map((d) => `${d.navn} ${tallTekst(d.prosent)} %`).join(', ') });
  return (
    <figure class="figur">
      <svg class="diagram" viewBox={`0 0 ${B} ${H + 14}`} role="img" aria-label={beskrivelse}>
        <rect class="figur-bakgrunn" x={0} y={0} width={x100} height={H} rx={3} />
        {deler.map((d, i) => {
          const w = (d.prosent / skala) * B;
          const r = <rect key={i} class={`fordeling-del-${farger[i % farger.length]}`} x={x} y={0} width={Math.max(0, w)} height={H} />;
          x += w;
          return r;
        })}
        <line class="figur-grense" x1={x100} x2={x100} y1={-2} y2={H + 2} />
        <text class="figur-tekst" x={Math.min(x100, B - 2)} y={H + 12} text-anchor="end">
          100 %
        </text>
      </svg>
      {deler.length > 1 && (
        <ul class="fordeling-forklaring fordeling-forklaring-rad">
          {deler.map((d, i) => (
            <li key={i}>
              <span class={`fordeling-farge fordeling-del-${farger[i % farger.length]}`} aria-hidden="true" />
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

/** Planfestet tid mot grensen på 37,5 timer i uka gjennom arbeidsåret. Det som går over, utvider arbeidsåret. */
export function Planfestetmaaler({ grunn, okning, maks }: { grunn: number; okning: number; maks: number }) {
  const { t } = useTekst();
  const total = grunn + okning;
  const skala = Math.max(maks, total);
  const s = (v: number) => (v / skala) * B;
  const over = Math.max(0, total - maks);
  const tekst = t('arbeidstid.grafikk.planfestet', { grunn: tallTekst(grunn), okning: tallTekst(okning), maks: tallTekst(maks), over: tallTekst(over) });
  return (
    <figure class="figur">
      <svg class="diagram" viewBox={`0 0 ${B} ${H + 14}`} role="img" aria-label={tekst}>
        <rect class="figur-bakgrunn" x={0} y={0} width={s(maks)} height={H} rx={3} />
        <rect class="fordeling-del-undervisning" x={0} y={0} width={s(grunn)} height={H} />
        <rect class="fordeling-del-funksjonstid" x={s(grunn)} y={0} width={s(Math.min(okning, Math.max(0, maks - grunn)))} height={H} />
        {over > 0 && <rect class="figur-over" x={s(maks)} y={0} width={s(over)} height={H} />}
        <line class="figur-grense" x1={s(maks)} x2={s(maks)} y1={-2} y2={H + 2} />
        <text class="figur-tekst" x={Math.min(s(maks), B - 2)} y={H + 12} text-anchor="end">
          {t('arbeidstid.felles.timerKort', { timer: tallTekst(maks) })}
        </text>
      </svg>
      <figcaption class="liten dempet">{tekst}</figcaption>
    </figure>
  );
}
