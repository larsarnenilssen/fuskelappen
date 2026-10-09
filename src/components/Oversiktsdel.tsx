// En del på oversiktene i modulene: overskrift med strek over og inngangene under (fase 8b, docs/DESIGN.md).
// Har delen bare én inngang, står den uten overskrift, så tittelen på inngangen sier hva det er, og flere slike deler
// etter hverandre står som én liste (avgjørelse 100).
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';

export function Oversiktsdel({ tittel, antall, children }: { tittel: string; antall: number; children: ComponentChildren }) {
  const id = useId();
  if (antall <= 1) return <div class="lop-del lop-del-enkel">{children}</div>;
  return (
    <section class="lop-del" aria-labelledby={id}>
      <h2 class="liten-overskrift" id={id}>
        {tittel}
      </h2>
      {children}
    </section>
  );
}
