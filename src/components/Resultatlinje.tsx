// Smal linje over bunnmenyen med hovedresultatet, synlig bare når resultatkortet er utenfor skjermen.
// Et trykk ruller til resultatkortet. Slik ser brukeren svaret mens skjemaet fylles ut.
import type { RefObject } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';

interface Props {
  /** Resultatkortet linjen viser til. */
  mal: RefObject<HTMLElement>;
  tittel: string;
  verdi: string;
  enhet?: string;
}

export function Resultatlinje({ mal, tittel, verdi, enhet }: Props) {
  const { t } = useTekst();
  const [kortSynlig, settKortSynlig] = useState(true);

  useEffect(() => {
    const el = mal.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observator = new IntersectionObserver(([oppforing]) => settKortSynlig(oppforing?.isIntersecting ?? true), { threshold: 0 });
    observator.observe(el);
    return () => observator.disconnect();
  }, [mal]);

  if (kortSynlig) return null;

  const gaaTil = () => {
    const el = mal.current;
    if (!el) return;
    const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'start', behavior: rolig ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
  };

  return (
    <div class="resultatlinje">
      <button type="button" onClick={gaaTil} aria-label={`${t('komponenter.resultat.tilResultat')}: ${tittel} ${verdi}${enhet ? ` ${enhet}` : ''}`}>
        <span class="resultatlinje-tittel">{tittel}</span>
        <span class="resultatlinje-verdi tall">
          {verdi}
          {enhet && <span class="resultatlinje-enhet"> {enhet}</span>}
        </span>
      </button>
    </div>
  );
}
