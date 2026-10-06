// Kildene til en hel side i en lukket boks (eier 06.10.2026, avgjørelse 074): på sider i to kolonner står de nederst i
// høyre kolonne, ikke alene nederst på siden rett på bakgrunnen. Raden er den samme som nederst i kortene (Kortfot),
// og den huskes som åpen for siden. På mobil står boksen nederst på siden.
import type { KildeRef } from '../core/innhold/skjema.ts';
import { Kortfot } from './Kortfot.tsx';
import { unikeKilder } from './kilderader.ts';

export function Kildeboks({ kilder, nokkel }: { kilder: readonly KildeRef[]; nokkel: string }) {
  if (kilder.length === 0) return null;
  return (
    <div class="kildeboks">
      <Kortfot kilder={unikeKilder(kilder)} nokkel={nokkel} />
    </div>
  );
}
