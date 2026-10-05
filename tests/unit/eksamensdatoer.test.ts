// Eksamensdatoene (fase 6, pakke 3, avgjørelse 059): lesingen av datoene fra teksten, sammenslåingen etter eiers regler
// (Udir går foran, ellers minst to fylker), når datoene hentes, og hvordan de settes inn i fristene for skoleåret.
import { describe, expect, it } from 'vitest';
import type { Frist } from '../../src/core/innhold/skjema.ts';
import { finnDato, medEksamensdatoer, stidatoer } from '../../src/modules/vurdering/eksamen/datoer.ts';
import type { Eksamensdatoer } from '../../src/modules/vurdering/eksamen/skjema.ts';
import { eksamensdatoerSkjema } from '../../src/modules/vurdering/eksamen/skjema.ts';
import { EKSAMENSKILDER } from '../../scripts/eksamen/kilder.ts';
import { type Eksamenskilde, type Kandidat, lesDatoer, lesKilde, slaSammen } from '../../scripts/eksamen/les.ts';
import { sammenlign, sidetekst } from '../../scripts/hent-eksamen.ts';
import data from '../../data/eksamen/datoer.json';

describe('lesDatoer', () => {
  it('leser dag, måned, år og klokkeslett', () => {
    expect(lesDatoer('Høsten 2026: 12. november kl. 09:00')).toEqual([{ dag: 12, maned: 11, aar: null, kl: '09.00' }]);
    expect(lesDatoer('onsdag 28. april 2027 kl. 9')).toEqual([{ dag: 28, maned: 4, aar: 2027, kl: '09.00' }]);
    expect(lesDatoer('18.juni 2027')).toEqual([{ dag: 18, maned: 6, aar: 2027, kl: null }]);
    expect(lesDatoer('publiseres 20 mars')).toEqual([{ dag: 20, maned: 3, aar: null, kl: null }]);
  });

  it('leser perioder og forkortede måneder', () => {
    expect(lesDatoer('1.–15. september').map((d) => [d.dag, d.maned])).toEqual([[1, 9], [15, 9]]);
    expect(lesDatoer('15. januar–1. februar').map((d) => [d.dag, d.maned])).toEqual([[15, 1], [1, 2]]);
    expect(lesDatoer('fra og med 1. september til og med 15. september').map((d) => [d.dag, d.maned])).toEqual([[1, 9], [15, 9]]);
    expect(lesDatoer('16. nov.–27. nov.').map((d) => [d.dag, d.maned])).toEqual([[16, 11], [27, 11]]);
  });
});

const kilde = (fylke: string | null, regler: Eksamenskilde['regler']): Eksamenskilde => ({ id: `k${fylke ?? 'udir'}`, navn: 'Test', url: 'https://example.no/', fylke, selektor: 'main', regler });

describe('lesKilde', () => {
  it('finner året fra mønsteret, fra datoen eller fra skoleåret', () => {
    const k = kilde('50', [
      { felt: 'trekk', periode: 'host', kl: true, moenster: /Høsten (?<aar>\d{4}): (?<dato>[^\n]+)/ },
      { felt: 'sensur', periode: 'host', moenster: /Sensur: ([^\n]+)/ },
      { felt: 'privatister-datoer', periode: 'var', fylke: true, moenster: /Fra (\d+\. \w+)/ },
    ]);
    const { kandidater, mangler } = lesKilde(k, 'Høsten 2026: 12. november kl. 09:00\nSensur: 4. januar 2027\nFra 24. mars', '2026-10-04');
    expect(mangler).toEqual([]);
    expect(kandidater).toEqual([
      { kilde: 'k50', fylke: '50', egen: false, periode: 'host-2026', felt: 'trekk', fra: '2026-11-12', kl: '09.00' },
      { kilde: 'k50', fylke: '50', egen: false, periode: 'host-2026', felt: 'sensur', fra: '2027-01-04' },
      { kilde: 'k50', fylke: '50', egen: true, periode: 'var-2027', felt: 'privatister-datoer', fra: '2027-03-24' },
    ]);
  });

  it('melder mønstre som ikke finner noe, så en endret side blir oppdaget', () => {
    const k = kilde(null, [
      { felt: 'trekk', periode: 'host', moenster: /Trekk: (\d+\. \w+)/ },
      { felt: 'eksamen', periode: 'var', valgfri: true, moenster: /Vår: (\d+\. \w+)/ },
    ]);
    expect(lesKilde(k, 'Ingenting her', '2026-10-04').mangler).toEqual(['trekk (høst)']);
  });

  it('en dato som er en frist, er sluttdatoen', () => {
    const k = kilde(null, [{ felt: 'skoler-oppmelding', periode: 'host', del: 'til', moenster: /fristen (\d+\. \w+)/ }]);
    expect(lesKilde(k, 'fristen 1. oktober', '2026-08-10').kandidater[0]).toMatchObject({ periode: 'host-2026', til: '2026-10-01' });
  });
});

const kand = (kilde: string, fylke: string | null, fra: string, felt = 'sensur'): Kandidat => ({ kilde, fylke, egen: false, periode: 'host-2026', felt, fra });

describe('slaSammen (eier 04.10.2026)', () => {
  it('Udirs dato går foran, uten kontrollsak', () => {
    const s = slaSammen([kand('a', '50', '2027-01-04'), kand('b', '32', '2027-01-04'), kand('udir', null, '2027-01-05')]);
    expect(s.nasjonal['host-2026']?.['sensur']).toEqual({ fra: '2027-01-05', kilder: ['udir'] });
    expect(s.uenige).toEqual([]);
  });

  it('to fylker med samme dato tas inn', () => {
    const s = slaSammen([kand('a', '50', '2027-01-04'), kand('b', '32', '2027-01-04')]);
    expect(s.nasjonal['host-2026']?.['sensur']).toEqual({ fra: '2027-01-04', kilder: ['a', 'b'] });
  });

  it('to sider fra samme fylke teller som ett fylke', () => {
    const s = slaSammen([kand('a', '50', '2027-01-04'), kand('b', '50', '2027-01-04')]);
    expect(s.nasjonal['host-2026']).toBeUndefined();
    expect(s.enKilde).toHaveLength(1);
  });

  it('fylker som er uenige, gir kontrollsak, og ingen dato uten flertall', () => {
    const s = slaSammen([kand('a', '50', '2027-01-04'), kand('b', '32', '2027-01-05')]);
    expect(s.nasjonal['host-2026']).toBeUndefined();
    expect(s.uenige).toHaveLength(1);
  });

  it('fylkets egne datoer lagres for fylket', () => {
    const s = slaSammen([{ kilde: 'a', fylke: '32', egen: true, periode: 'var-2027', felt: 'privatister-datoer', fra: '2027-03-24' }]);
    expect(s.fylker['32']?.['var-2027']?.['privatister-datoer']).toEqual({ fra: '2027-03-24', kilder: ['a'] });
    expect(s.nasjonal).toEqual({});
  });
});

describe('hentingen', () => {
  it('teksten har én linje per avsnitt', () => {
    expect(sidetekst('<main><h2>Fellessensur</h2><p>Høsten 2026:  4. januar 2027</p><script>x</script></main>', 'main')).toBe('Fellessensur\nHøsten 2026: 4. januar 2027');
  });

  it('endringene sammenlignes dato for dato', () => {
    const a: Eksamensdatoer = { hentet: '', nasjonal: { 'host-2026': { sensur: { fra: '2027-01-04', kilder: ['a'] } } }, fylker: {}, kilder: {} };
    const b: Eksamensdatoer = { ...a, nasjonal: { 'host-2026': { sensur: { fra: '2027-01-05', kilder: ['a'] } } } };
    expect(sammenlign(a, b)).toEqual(['nasjonal host-2026 sensur: 2027-01-04– → 2027-01-05–']);
  });

  it('kildene har unike id-er og gyldige fylker, og Udir er med', () => {
    expect(new Set(EKSAMENSKILDER.map((k) => k.id)).size).toBe(EKSAMENSKILDER.length);
    expect(EKSAMENSKILDER.some((k) => k.fylke === null)).toBe(true);
    for (const k of EKSAMENSKILDER) expect(k.fylke === null || /^\d{2}$/.test(k.fylke), k.id).toBe(true);
  });

  it('datafilen følger skjemaet', () => {
    expect(() => eksamensdatoerSkjema.parse(data)).not.toThrow();
  });
});

const frist = (id: string, eksamensdato: Frist['eksamensdato']): Frist =>
  ({
    id,
    type: 'frist',
    modul: 'vurdering',
    malgruppe: ['skoleleder'],
    regel: { type: 'maned', maned: 11 },
    grupper: [],
    paragrafer: [],
    tittel: { nb: id, nn: id },
    tekst: { nb: id, nn: id },
    kilder: [{ id: 'x' }],
    kontrollert: null,
    gyldighet: { niva: 'nasjonal' },
    stikkord: [],
    relatert: [],
    eksamensdato,
  }) as Frist;

const eksempel: Eksamensdatoer = {
  hentet: '2026-10-04T00:00:00Z',
  nasjonal: {
    'host-2026': { trekk: { fra: '2026-11-12', kl: '09.00', kilder: ['t'] }, eksamen: { fra: '2026-11-16', til: '2026-11-27', kilder: ['u'] } },
    'var-2027': { trekk: { fra: '2027-04-28', kl: '09.00', kilder: ['t'] } },
  },
  fylker: { '32': { 'var-2027': { 'privatister-datoer': { fra: '2027-03-24', kilder: ['a'] } } } },
  kilder: { t: { navn: 'T', url: 'https://t.no/', fylke: '50' }, u: { navn: 'U', url: 'https://u.no/', fylke: null }, a: { navn: 'A', url: 'https://a.no/', fylke: '32' } },
};

describe('datoene i fristene', () => {
  it('finner datoen i skoleåret', () => {
    expect(finnDato(eksempel.nasjonal, 'host', 'trekk', 2026)?.fra).toBe('2026-11-12');
    expect(finnDato(eksempel.nasjonal, 'host', 'trekk', 2027)).toBeNull();
  });

  it('setter inn dato, sluttdato, klokkeslett og kilde, og lar fristen stå uten data', () => {
    const [trekk, eksamen, uten] = medEksamensdatoer(
      [frist('t', { felt: 'trekk', periode: 'host', fylke: false }), frist('e', { felt: 'eksamen', periode: 'host', fylke: false }), frist('s', { felt: 'sensur', periode: 'host', fylke: false })],
      eksempel,
      2026,
      null,
    );
    expect(trekk).toMatchObject({ dato: '2026-11-12', kl: '09.00', aar: true });
    expect(trekk?.regel).toBeUndefined();
    expect(trekk?.kilder.at(-1)).toEqual({ id: 'eksamensdatoer', punkt: 'T', url: 'https://t.no/' });
    expect(eksamen).toMatchObject({ dato: '2026-11-16', til: '2026-11-27' });
    expect(uten?.regel).toEqual({ type: 'maned', maned: 11 });
  });

  it('fylkets dato vises bare når fylket er valgt, og merkes med fylket', () => {
    const f = frist('p', { felt: 'privatister-datoer', periode: 'var', fylke: true });
    expect(medEksamensdatoer([f], eksempel, 2026, null)[0]?.dato).toBeUndefined();
    expect(medEksamensdatoer([f], eksempel, 2026, '46')[0]?.dato).toBeUndefined();
    expect(medEksamensdatoer([f], eksempel, 2026, '32')[0]).toMatchObject({ dato: '2027-03-24', gyldighet: { niva: 'fylke', fylke: '32' } });
  });

  it('datoene i stien står per periode', () => {
    expect(stidatoer(eksempel, 'trekk', 2026, 'nb', { host: 'Høst', var: 'Vår' })).toEqual(['Høst: 12. november 2026 kl. 09.00', 'Vår: 28. april 2027 kl. 09.00']);
  });
});
