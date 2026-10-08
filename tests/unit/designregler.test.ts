// Sjekker regler fra docs/DESIGN.md som kan testes automatisk (fase 8b, eier 08.10.2026).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const stiler = join(__dirname, '../../src/styles');

/**
 * Tykke streker til venstre (3 px eller mer) brukes bare der de sier at innholdet kommer fra et annet sted eller
 * oppsummerer siden: sitert lov-, forskrifts- og læreplantekst, tallboksene fra Videregående i tall og «Kort fortalt».
 * En ny tykk strek skal heller være en myk flate, en tynn kant eller en prikk (docs/DESIGN.md, «Kort» og «Flater»).
 */
const TILLATT = new Set([
  '.kildetekst', // sitert lov- og forskriftstekst
  '.od-sitat', // sitat fra overordnet del
  '.kal-innhold blockquote', // sitat i kalenderen
  '.st-boks', // tallboksene fra Videregående i tall
  '.st-fylket',
  '.st-skolen',
  '.st-kort', // «Kort fortalt»
]);

/** Regler som `selektor { deklarasjoner }`, uten kommentarer. Regler inni @media kommer med som egne regler. */
function regler(css: string): { selektor: string; deklarasjoner: string }[] {
  const uten = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...uten.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selektor: (m[1] ?? '').trim().replace(/\s+/g, ' '), deklarasjoner: m[2] ?? '' }));
}

/** Bredden i px for en strek til venstre, eller null når regelen ikke har en. */
function venstrestrek(deklarasjoner: string): number | null {
  const m = /border-(?:left|inline-start)(?:-width)?\s*:\s*([\d.]+)(px|rem)/.exec(deklarasjoner);
  if (!m) return null;
  return Number(m[1]) * (m[2] === 'rem' ? 16 : 1);
}

describe('design', () => {
  it('ingen tykke streker til venstre utenfor sitater, tallboksene og «Kort fortalt»', () => {
    const brudd = readdirSync(stiler)
      .filter((f) => f.endsWith('.css'))
      .flatMap((f) =>
        regler(readFileSync(join(stiler, f), 'utf8'))
          .filter(({ deklarasjoner }) => (venstrestrek(deklarasjoner) ?? 0) >= 3)
          .filter(({ selektor }) => !TILLATT.has(selektor))
          .map(({ selektor }) => `${f}: ${selektor}`),
      );
    expect(brudd).toEqual([]);
  });

  it('testen finner en tykk strek', () => {
    const [regel] = regler('/* kort */ .x { padding: 0; border-left: 4px solid var(--farge-merke); }');
    expect(regel?.selektor).toBe('.x');
    expect(venstrestrek(regel?.deklarasjoner ?? '')).toBe(4);
    expect(venstrestrek('border-left: var(--strek) solid var(--farge-kant);')).toBeNull();
  });
});
