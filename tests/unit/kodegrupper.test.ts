// Søket i kodegruppene i begrepsbanken (fase 6): kode, navn og tekst, og en kode som er lik søket, står først.
import { describe, expect, it } from 'vitest';
import { sokKoder } from '../../src/modules/begreper/Kodegrupper.tsx';

const koder = [
  { kode: 'IM', navn: { nb: 'Ikke møtt', nn: 'Ikkje møtt' }, tekst: { nb: 'Møtte ikke til eksamen. IV brukes ikke her.', nn: 'Møtte ikkje til eksamen.' } },
  { kode: 'IV', navn: { nb: 'Ikke vurderingsgrunnlag', nn: 'Ikkje vurderingsgrunnlag' }, tekst: { nb: 'Ikke grunnlag for karakter.', nn: 'Ikkje grunnlag for karakter.' } },
  { kode: 'VO', navn: { nb: 'Vurdert etter individuell opplæringsplan', nn: 'Vurdert etter individuell opplæringsplan' }, tekst: { nb: 'Kompetansebevis.', nn: 'Kompetansebevis.' } },
];

describe('sokKoder', () => {
  it('uten søk gir alle kodene i rekkefølge', () => {
    expect(sokKoder(koder, '', 'nb').map((k) => k.kode)).toEqual(['IM', 'IV', 'VO']);
  });
  it('en kode som er lik søket, står først, foran koder der søket står i teksten', () => {
    expect(sokKoder(koder, 'iv', 'nb').map((k) => k.kode)).toEqual(['IV', 'IM']);
  });
  it('korte søk treffer bare starten av ord, lengre søk også inni ord', () => {
    expect(sokKoder(koder, 'ind', 'nb').map((k) => k.kode)).toEqual(['VO']);
    expect(sokKoder(koder, 'dividuell', 'nb').map((k) => k.kode)).toEqual(['VO']);
    expect(sokKoder(koder, 'ivi', 'nb')).toEqual([]);
  });
  it('søker i navnet på målformen', () => {
    expect(sokKoder(koder, 'ikkje møtt', 'nn').map((k) => k.kode)).toEqual(['IM']);
    expect(sokKoder(koder, 'opplæringsplan', 'nb').map((k) => k.kode)).toEqual(['VO']);
  });
});
