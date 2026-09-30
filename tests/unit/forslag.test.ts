// Endringsforslag fra kildesjekken: nye tall og sitater i regelfilene (avgjørelse 020).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { endreRegelfil, finnVerdiendringer, forslagstekst } from '../../scripts/kilder/forslag.ts';
import { sjekkVerdier, type Sjekkbar } from '../../src/core/kontroll/verdisjekk.ts';

const sitat = 'utføres innenfor et årsverk på 1687,5 timer (1650 timer for lærere som er 60 år og eldre)';
const kilde = `4. Arbeidsåret Lærernes samlede arbeidsoppgaver skal ${sitat}. a) Arbeidsårets lengde`;
const verdier: Sjekkbar[] = [
  { nokkel: 'sfs2213-2026-2027/arsverk_timer', regelsett: 'sfs2213-2026-2027', kilde: 'k', verdi: 1687.5, sitat },
  { nokkel: 'sfs2213-2026-2027/arsverk_timer_60_ar', regelsett: 'sfs2213-2026-2027', kilde: 'k', verdi: 1650, sitat },
];

describe('endringsforslag', () => {
  it('foreslår nytt tall og nytt sitat, og bare nytt sitat for tall som er uendret', () => {
    const ny = kilde.replace('1687,5', '1700');
    const status = sjekkVerdier(verdier, { k: { tekst: ny } }, null, '2026-10-05T04:17:00Z');
    const nyttSitat = 'utføres innenfor et årsverk på 1700 timer (1650 timer for lærere som er 60 år og eldre)';
    expect(finnVerdiendringer(verdier, status, { k: ny })).toEqual([
      { id: 'sfs2213-2026-2027/arsverk_timer', regelsett: 'sfs2213-2026-2027', nokkel: 'arsverk_timer', kilde: 'k', fra: 1687.5, til: 1700, sitat, nyttSitat },
      { id: 'sfs2213-2026-2027/arsverk_timer_60_ar', regelsett: 'sfs2213-2026-2027', nokkel: 'arsverk_timer_60_ar', kilde: 'k', fra: 1650, til: null, sitat, nyttSitat },
    ]);
    const uendret = sjekkVerdier(verdier, { k: { tekst: kilde } }, null, '2026-10-05T04:17:00Z');
    expect(finnVerdiendringer(verdier, uendret, { k: kilde })).toEqual([]);
  });

  it('endrer bare verdi, sitat og kontrollert for verdien i regelfilen', () => {
    const fil = readFileSync(join(__dirname, '../../rules/sfs2213/2026-2027.yaml'), 'utf8');
    const ny = endreRegelfil(fil.replace('  arsverk_timer:\n    verdi: 1687.5', '  arsverk_timer:\n    verdi: 1687.5').replace(/(arsverk_timer:[\s\S]*?kontrollert: )null/, '$1{ dato: "2026-10-01" }'), 'arsverk_timer', {
      til: 1700,
      nyttSitat: 'et årsverk på 1700 timer',
    });
    const data = parse(ny) as { verdier: Record<string, { verdi: unknown; sitat?: string; kontrollert: unknown }> };
    expect(data.verdier.arsverk_timer).toMatchObject({ verdi: 1700, sitat: 'et årsverk på 1700 timer', kontrollert: null });
    expect(data.verdier.arsverk_timer_60_ar?.verdi).toBe(1650);
    expect(ny.split('\n').length).toBe(fil.split('\n').length);
    expect(() => endreRegelfil(fil, 'finnes_ikke', { til: 1, nyttSitat: 'x' })).toThrow('Fant ikke verdien');
  });

  it('beskriver forslaget og testene som feiler', () => {
    const tekst = forslagstekst(
      [{ id: 's/a', regelsett: 's', nokkel: 'a', kilde: 'k', fra: 1687.5, til: 1700, sitat: 'x', nyttSitat: 'årsverk på 1700 timer' }],
      ['tests/fasit/fasit.test.ts: fasit 001'],
      null,
    );
    expect(tekst).toContain('| `s/a` | 1687,5 | 1700 | årsverk på 1700 timer |');
    expect(tekst).toContain('- tests/fasit/fasit.test.ts: fasit 001');
    expect(tekst).toContain('ny avtaleperiode');
  });
});
