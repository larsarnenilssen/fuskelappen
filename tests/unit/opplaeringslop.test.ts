// Tilbudsdataene til Opplæringsløp (avgjørelse 035), regnet ut fra de ekte dataene slik appen bygges.
import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { tilbudPlugin } from '../../scripts/vite/plugins.ts';
import { fullKode, kortKode, type Tilbudene, tilbudRute } from '../../src/modules/opplaeringslop/data.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const kilde = (tilbudPlugin(rot) as unknown as { load: (id: string) => string }).load('\0virtual:tilbud');
const data = JSON.parse(kilde.replace(/^export default /, '').replace(/;$/, '')) as Tilbudene;

describe('tilbudene til Opplæringsløp', () => {
  it('har programmene med inngang og hvert tilbud uten programområdet', () => {
    expect(data.struktur.find((p) => p.program === 'HS')?.inngang).toContain('HSHSF1----');
    const hea2 = data.tilbud['HSHEA2----'];
    expect(hea2).toBeDefined();
    expect(hea2 && 'programomrade' in hea2).toBe(false);
    expect(hea2?.sum).toBe(982);
    expect(hea2?.videre).toContain('HSHEA3----');
    expect(hea2?.pabygging.length).toBeGreaterThan(0);
  });

  it('korte koder i adressen', () => {
    expect(kortKode('HSHEA2----')).toBe('HSHEA2');
    expect(fullKode('hshea2')).toBe('HSHEA2----');
    expect(tilbudRute('PB', 'PBPBY3----', 'HSHEA2----')).toBe('/opplaeringslop/PB/PBPBY3?via=HSHEA2');
  });
});
