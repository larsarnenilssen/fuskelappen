// To kolonner på skrivebord (eier 06.10.2026, avgjørelse 074): hovedregelen for nye sider med flere deler. Fra 64rem
// står hoveddelen til venstre (3/5) og sidedelen til høyre (2/5), og siden er opptil 72rem bred. Under 64rem står
// delene under hverandre, hoveddelen først. Mønsteret er det samme som på Mer opplæring og sidene for lærlinger og
// kandidater (avgjørelse 069 og 073). Siden som bruker komponenten, får klassen `side-bred` (`<div class="side side-bred">`).
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';

/** Fra denne bredden står sidene i to kolonner. Samme verdi i base.css (`.to-kolonner` og `.fb-to`). */
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

export function ToKolonner({ hoved, side }: { hoved: ComponentChildren; side: ComponentChildren }) {
  return (
    <div class="to-kolonner">
      <div class="to-kolonner-hoved">{hoved}</div>
      <div class="to-kolonner-side">{side}</div>
    </div>
  );
}
