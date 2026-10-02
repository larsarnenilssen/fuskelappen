// Felles for sidene i Læreplanverket: lasting, søk i overordnet del og tekstene (pakke 6, avgjørelse 037).
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { delRute, type Laereplanverket, lastLaereplanverket, lastOverordnetDel, sokIDeler } from '../data.ts';
import type { Blokk, Del, OverordnetDel } from '../typer.ts';

export type Lastet = { od: OverordnetDel; lv: Laereplanverket } | 'laster' | 'feil';

/** Overordnet del og ferdighetene og temaene. Begge lastes første gang de trengs. */
export function useLaereplanverket(): [Lastet, () => void] {
  const [data, settData] = useState<Lastet>('laster');
  const [forsok, settForsok] = useState(0);
  useEffect(() => {
    settData('laster');
    Promise.all([lastOverordnetDel(), lastLaereplanverket()]).then(
      ([od, lv]) => settData({ od, lv }),
      () => settData('feil'),
    );
  }, [forsok]);
  return [data, () => settForsok((n) => n + 1)];
}

/** Laster inn, eller feilmelding med «Prøv igjen». */
export function Lasting({ data, provIgjen }: { data: 'laster' | 'feil'; provIgjen: () => void }) {
  const { t } = useTekst();
  if (data === 'laster') return <p class="dempet">{t('app.lasterInn')}</p>;
  return (
    <p role="alert">
      {t('laereplanverket.lasterFeil')}{' '}
      <button type="button" class="lenkeknapp" onClick={provIgjen}>
        {t('app.provIgjen')}
      </button>
    </p>
  );
}

/** «1.1 Menneskeverdet», eller bare tittelen når delen ikke har nummer. */
export const delnavn = (d: Del, malform: 'nb' | 'nn') => (d.nr ? `${d.nr} ${d.tittel[malform]}` : d.tittel[malform]);

/** Avsnitt og punktlister fra overordnet del. */
export function Blokker({ blokker, klasse }: { blokker: readonly Blokk[]; klasse?: string }) {
  return (
    <>
      {blokker.map((b, i) =>
        b.type === 'avsnitt' ? (
          <p key={i} class={klasse}>
            {b.tekst}
          </p>
        ) : (
          <ul key={i} class={klasse}>
            {b.punkter.map((p, j) => (
              <li key={j}>{p}</li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

/**
 * Søket i overordnet del: feltet og, når det er søkt, delene som passer med et utdrag. `barn` vises når det ikke er
 * søkt (innholdsregisteret eller boksene).
 */
export function Sok({ od, children }: { od: OverordnetDel; children: preact.ComponentChildren }) {
  const { t, malform } = useTekst();
  const [sok, settSok] = useState('');
  const aktivt = sok.trim().length >= 2;
  const treff = aktivt ? sokIDeler(od.deler, sok.trim(), malform) : [];
  return (
    <>
      <div class="sokeboks lv-sok">
        <div class="sokefelt">
          <input
            type="search"
            class="tekstfelt"
            aria-label={t('laereplanverket.sok')}
            placeholder={t('laereplanverket.sok')}
            value={sok}
            onInput={(e) => settSok(e.currentTarget.value)}
          />
          <Ikon navn="sok" class="sokefelt-ikon" />
        </div>
        <p class="sokestatus" role="status" aria-live="polite">
          {aktivt
            ? treff.length === 0
              ? t('laereplanverket.ingenTreff')
              : treff.length === 1
                ? t('laereplanverket.ettTreff')
                : t('laereplanverket.antallTreff', { antall: formaterTall(treff.length) })
            : ''}
        </p>
      </div>
      {aktivt ? (
        <ul class="liste lv-treff">
          {treff.map(({ del, utdrag }) => (
            <li key={del.id}>
              <a class="listelenke" href={`#${delRute(del)}`}>
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{delnavn(del, malform)}</span>
                  {utdrag && (
                    <span class="listelenke-under">
                      {utdrag.for}
                      <mark>{utdrag.treff}</mark>
                      {utdrag.etter}
                    </span>
                  )}
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        children
      )}
    </>
  );
}
