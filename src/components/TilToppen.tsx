// Knapp som fører til toppen av siden, for lange lister som fagsøket (eier 02.10.2026).
// Den vises først når brukeren har rullet godt nedover, og flytter fokus til overskriften på siden.
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import { Ikon } from './Ikon.tsx';

/** Hvor mange skjermhøyder brukeren må ha rullet før knappen vises. */
const SKJERMER = 2;

export function TilToppen() {
  const { t } = useTekst();
  const [vis, settVis] = useState(false);
  useEffect(() => {
    const sjekk = () => settVis(window.scrollY > window.innerHeight * SKJERMER);
    sjekk();
    window.addEventListener('scroll', sjekk, { passive: true });
    return () => window.removeEventListener('scroll', sjekk);
  }, []);
  if (!vis) return null;
  const tilToppen = () => {
    const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: rolig ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  };
  return (
    <button type="button" class="til-toppen" onClick={tilToppen}>
      <Ikon navn="opp" class="ikon-liten" />
      {t('app.tilToppen')}
    </button>
  );
}
