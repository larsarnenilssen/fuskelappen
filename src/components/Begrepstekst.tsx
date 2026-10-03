// Tekst fra src/strings med lenker til begrepsbanken, som brødteksten i content/ (avgjørelse 050). Brukes i
// innledninger og hjelpetekster. Teksten er nasjonal, så bare nasjonale begreper lenkes.
import begrepsord from 'virtual:begrepsord';
import { useTekst } from '../app/tilstand.ts';
import { lenkBegreper } from '../core/innhold/begrepslenker.ts';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function Begrepstekst({ tekst }: { tekst: string }) {
  const { malform } = useTekst();
  return <span dangerouslySetInnerHTML={{ __html: lenkBegreper(escapeHtml(tekst), begrepsord, { malform, fylke: null }) }} />;
}
