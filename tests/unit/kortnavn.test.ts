import { describe, expect, it } from 'vitest';
import { kortnavn, unikeNavn } from '../../src/modules/arbeidstid/kortnavn.ts';

describe('kortnavn for fagene (eier 09.10.2026)', () => {
  it('beholder navn med høyst tre ord', () => {
    expect(kortnavn('Engelsk')).toBe('Engelsk');
    expect(kortnavn('Matematikk R1')).toBe('Matematikk R1');
    expect(kortnavn('Norsk hovedmål, skriftlig')).toBe('Norsk hovedmål, skriftlig');
    expect(kortnavn('  Kroppsøving  ')).toBe('Kroppsøving');
  });

  it('korter inn lengre navn til tre ord og «…», uten tegn foran', () => {
    expect(kortnavn('Kommunikasjon og samhandling i yrket')).toBe('Kommunikasjon og samhandling…');
    expect(kortnavn('Historie og filosofi, fordypning')).toBe('Historie og filosofi…');
    expect(kortnavn('Teknologi og forskningslære 1, programfag')).toBe('Teknologi og forskningslære…');
  });

  it('gir like navn et nummer etter det første', () => {
    expect(unikeNavn(['Engelsk', 'Matematikk R1', 'Engelsk', 'Engelsk'])).toEqual(['Engelsk', 'Matematikk R1', 'Engelsk (2)', 'Engelsk (3)']);
  });
});
