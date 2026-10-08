// Figurer for Videregående i tall (SKISSE 08.10.2026, tallene fra SSB): linjediagram med historikk og framskriving,
// punktskala for fylkene, stablet stolpe og rangering. Tegnet i SVG og CSS med fargene fra tokens.css. Tallene står
// alltid også som tekst, så figuren er pynt for den som ser den, og teksten er for skjermleseren.
import { formaterTall } from '../../core/i18n/tekst.ts';

export interface Serie {
  navn: string;
  verdier: readonly (number | null)[];
  /** Den valgte serien: seriefargen og tykkere strek. Ellers grå. */
  valgt?: boolean;
}

/**
 * Linjediagram over år. Fra `framskrevetFra` (indeks i `aar`) er linjen stiplet og flaten lysere: det er SSBs
 * framskriving, ikke registrerte tall. Siste verdi står ved enden av linjen.
 */
export function Linjediagram({
  aar,
  serier,
  framskrevetFra,
  desimaler = 0,
  etikett,
  indeks = false,
}: {
  aar: readonly number[];
  serier: readonly Serie[];
  framskrevetFra?: number;
  desimaler?: number;
  etikett: string;
  /** Vis serien som indeks (første år = 100), så fylket og landet kan sammenlignes. */
  indeks?: boolean;
}) {
  const B = 320;
  const H = 150;
  const v = { l: 34, r: 46, t: 12, b: 22 };
  const data = serier.map((s) => {
    const forste = s.verdier.find((x): x is number => typeof x === 'number') ?? 1;
    return { ...s, verdier: indeks ? s.verdier.map((x) => (typeof x === 'number' ? (x / forste) * 100 : null)) : s.verdier };
  });
  const alle = data.flatMap((s) => s.verdier.filter((x): x is number => typeof x === 'number'));
  const min0 = Math.min(...alle);
  const maks0 = Math.max(...alle);
  // Runde tall på aksen: steget er en tierpotens under spennet, så aksen får to eller tre hele tall.
  const spenn = maks0 - min0 || Math.abs(maks0) || 1;
  let steg = indeks ? 5 : 10 ** Math.floor(Math.log10(spenn));
  const avrund = (st: number) => [Math.floor((min0 - spenn * 0.05) / st) * st, Math.ceil((maks0 + spenn * 0.05) / st) * st] as const;
  while ((avrund(steg)[1] - avrund(steg)[0]) / steg > 4) steg *= 2;
  const [min, maks] = avrund(steg);
  const x = (i: number) => v.l + (i / Math.max(1, aar.length - 1)) * (B - v.l - v.r);
  const y = (n: number) => v.t + (1 - (n - min) / (maks - min || 1)) * (H - v.t - v.b);
  const linje = (vals: readonly (number | null)[], fra: number, til: number) =>
    vals
      .map((n, i) => (i < fra || i > til || typeof n !== 'number' ? null : `${x(i).toFixed(1)},${y(n).toFixed(1)}`))
      .filter(Boolean)
      .join(' ');
  const delt = framskrevetFra ?? aar.length;
  const hake = Array.from({ length: Math.round((maks - min) / steg) + 1 }, (_, i) => min + i * steg);
  // Sluttverdiene flyttes fra hverandre når de ville stått oppå hverandre.
  const slutt = new Map<string, number>();
  const ender = data
    .map((s) => ({ navn: s.navn, n: s.verdier.at(-1) }))
    .filter((e): e is { navn: string; n: number } => typeof e.n === 'number')
    .sort((a, b) => y(a.n) - y(b.n));
  ender.forEach((e, i) => {
    const forrige = i > 0 ? (slutt.get(ender[i - 1]?.navn ?? '') ?? -99) : -99;
    slutt.set(e.navn, Math.max(y(e.n) + 3, forrige + 10));
  });
  const forsteIndeks = (vals: readonly (number | null)[]) => Math.max(0, vals.findIndex((n) => typeof n === 'number'));
  const fmt = (n: number) => formaterTall(n, desimaler, desimaler);
  const valgt = data.find((s) => s.valgt) ?? data[0];
  return (
    <svg class="fg-linje" viewBox={`0 0 ${B} ${H}`} role="img" aria-label={etikett} preserveAspectRatio="xMidYMid meet">
      {framskrevetFra !== undefined && (
        <rect class="fg-framskrevet" x={x(delt)} y={v.t} width={x(aar.length - 1) - x(delt)} height={H - v.t - v.b} />
      )}
      {hake.map((h) => (
        <g key={h}>
          <line class="fg-rutenett" x1={v.l} x2={B - v.r} y1={y(h)} y2={y(h)} />
          <text class="fg-akse" x={v.l - 4} y={y(h) + 3} text-anchor="end">
            {formaterTall(h, steg < 1 ? 1 : 0)}
          </text>
        </g>
      ))}
      {[0, delt, aar.length - 1]
        .filter((i, n, a) => i < aar.length && a.indexOf(i) === n)
        .map((i) => (
          <text key={i} class="fg-akse" x={x(i)} y={H - 6} text-anchor={i === 0 ? 'start' : i === aar.length - 1 ? 'end' : 'middle'}>
            {aar[i]}
          </text>
        ))}
      {valgt && (
        <polygon
          class="fg-flate"
          points={`${x(forsteIndeks(valgt.verdier))},${y(min)} ${linje(valgt.verdier, 0, aar.length - 1)} ${x(aar.length - 1)},${y(min)}`}
        />
      )}
      {[...data].sort((a, b) => Number(!!a.valgt) - Number(!!b.valgt)).map((s) => (
        <g key={s.navn} class={s.valgt ? 'fg-serie fg-valgt' : 'fg-serie'}>
          <polyline points={linje(s.verdier, 0, delt)} />
          {framskrevetFra !== undefined && <polyline class="fg-stiplet" points={linje(s.verdier, delt, aar.length - 1)} />}
          {(() => {
            const i = s.verdier.length - 1;
            const n = s.verdier[i];
            return typeof n === 'number' ? (
              <>
                <circle cx={x(i)} cy={y(n)} r={s.valgt ? 3.5 : 2.5} />
                <text class="fg-sluttverdi" x={x(i) + 6} y={slutt.get(s.navn) ?? y(n) + 3}>
                  {fmt(n)}
                </text>
              </>
            ) : null;
          })()}
        </g>
      ))}
    </svg>
  );
}

/** Fylkene som punkter på en skala, med landet som stiplet strek og det valgte fylket markert. */
export function Punktskala({
  rader,
  landet,
  min,
  maks,
  desimaler = 1,
  etikett,
}: {
  rader: readonly { navn: string; verdi: number | null; valgt?: boolean }[];
  landet: number | null;
  min: number;
  maks: number;
  desimaler?: number;
  etikett: string;
}) {
  const pst = (n: number) => `${((n - min) / (maks - min)) * 100}%`;
  const sortert = [...rader].sort((a, b) => (b.verdi ?? -1) - (a.verdi ?? -1));
  return (
    <ol class="fg-punkter" aria-label={etikett}>
      {sortert.map((r) => (
        <li key={r.navn} class={r.valgt ? 'fg-punktrad fg-valgt' : 'fg-punktrad'}>
          <span class="fg-punktnavn">{r.navn}</span>
          <span class="fg-punktspor" aria-hidden="true">
            {landet !== null && <span class="fg-punktlandet" style={{ left: pst(landet) }} />}
            {r.verdi !== null && <span class="fg-punkt" style={{ left: pst(r.verdi) }} />}
          </span>
          <span class="fg-punkttall">{r.verdi === null ? '–' : formaterTall(r.verdi, desimaler, desimaler)}</span>
        </li>
      ))}
    </ol>
  );
}

/** Én stolpe delt i andeler som summerer til 100, med forklaring under. Den fremhevede delen har seriefargen. */
export function Stablet({ deler, etikett }: { deler: readonly { navn: string; andel: number; fremhevet?: boolean }[]; etikett: string }) {
  return (
    <div class="fg-stablet">
      <div class="fg-stablet-stolpe" role="img" aria-label={etikett}>
        {deler.map((d, i) => (
          <span key={d.navn} class={`fg-del fg-del-${i}${d.fremhevet ? ' fg-del-fremhevet' : ''}`} style={{ width: `${d.andel}%` }}>
            {d.andel >= 9 ? `${formaterTall(d.andel, 0)} %` : ''}
          </span>
        ))}
      </div>
      <ul class="fg-forklaring">
        {deler.map((d, i) => (
          <li key={d.navn}>
            <span class={`fg-farge fg-del-${i}${d.fremhevet ? ' fg-del-fremhevet' : ''}`} aria-hidden="true" />
            {d.navn} <b>{formaterTall(d.andel, 1, 1)} %</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Et stort tall med etikett og en liten tekst under, til toppen av en figur. */
export function Hovedtall({ tall, etikett, under, tone }: { tall: string; etikett: string; under?: string; tone?: 'opp' | 'ned' | 'noytral' }) {
  return (
    <div class={`fg-hovedtall${tone ? ` fg-${tone}` : ''}`}>
      <span class="fg-hovedtall-tall">{tall}</span>
      <span class="fg-hovedtall-etikett">{etikett}</span>
      {under && <span class="fg-hovedtall-under">{under}</span>}
    </div>
  );
}
