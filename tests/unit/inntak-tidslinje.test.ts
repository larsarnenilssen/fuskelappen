import { describe, expect, it } from 'vitest';
import type { Frist } from '../../src/core/innhold/skjema.ts';
import { gjelder, heleAret, lesFilter, nesteFrist, perManed, sorter, tidspunkt } from '../../src/modules/inntak/tidslinje.ts';

const frist = (id: string, regel: Frist['regel'], grupper: string[] = [], naar?: string): Frist =>
  ({
    id,
    type: 'frist',
    modul: 'inntak',
    malgruppe: ['skoleleder'],
    regel,
    grupper,
    paragrafer: [],
    tittel: { nb: id, nn: id },
    tekst: { nb: id, nn: id },
    kilder: [{ id: 'x' }],
    kontrollert: null,
    gyldighet: { niva: 'nasjonal' },
    stikkord: [],
    relatert: [],
    ...(naar ? { naar: { nb: naar, nn: naar } } : {}),
  }) as Frist;

const okt = frist('okt', { type: 'arlig', dag: 1, maned: 10 }, ['fortrinn']);
const feb = frist('feb', { type: 'arlig', dag: 1, maned: 2 }, ['fortrinn']);
const mars = frist('mars', { type: 'arlig', dag: 1, maned: 3 }, ['ungdom']);
const juli = frist('juli', { type: 'maned', maned: 7 }, ['ungdom'], 'Juli – se Vilbli');
const klage = frist('klage', { type: 'maned', maned: 7 }, [], 'Tre uker etter svaret');
const nov = frist('nov', { type: 'arlig', dag: 1, maned: 11 }, ['ungdom']);
const voksne = frist('voksne', { type: 'lopende' }, ['voksne'], 'Hele året');

describe('tidslinjen for inntak', () => {
  it('sorterer gjennom inntaksåret fra oktober, og frister uten fast dag sist i måneden', () => {
    expect(sorter([klage, mars, juli, nov, feb, okt]).map((f) => f.id)).toEqual(['okt', 'nov', 'feb', 'mars', 'klage', 'juli']);
    expect(sorter([juli, klage]).map((f) => f.id)).toEqual(['juli', 'klage']);
  });

  it('gir alle tolv månedene fra oktober, også de uten frister', () => {
    const maneder = perManed([feb, okt]);
    expect(maneder.map((m) => m.maned)).toEqual([10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(maneder[0]?.frister.map((f) => f.id)).toEqual(['okt']);
    expect(maneder[1]?.frister).toEqual([]);
  });

  it('filtrerer på grupper, og frister uten grupper gjelder alle', () => {
    expect([okt, mars, klage].filter((f) => gjelder(f, 'ungdom')).map((f) => f.id)).toEqual(['mars', 'klage']);
    expect([okt, mars, klage].filter((f) => gjelder(f, 'alle'))).toHaveLength(3);
    expect(lesFilter('voksne')).toBe('voksne');
    expect(lesFilter('ukjent')).toBe('alle');
  });

  it('viser dagen og måneden, eller tidspunktet med ord', () => {
    expect(tidspunkt(feb, 'nb')).toBe('1. februar');
    expect(tidspunkt(juli, 'nb')).toBe('Juli – se Vilbli');
  });

  it('setter frister som gjelder hele året først, og ikke i en måned', () => {
    expect(heleAret(voksne)).toBe(true);
    expect(sorter([feb, voksne]).map((f) => f.id)).toEqual(['voksne', 'feb']);
    expect(perManed([voksne, feb]).flatMap((m) => m.frister.map((f) => f.id))).toEqual(['feb']);
    expect(nesteFrist([voksne, feb], '2026-01-15')?.id).toBe('feb');
    expect(tidspunkt(voksne, 'nb')).toBe('Hele året');
  });

  it('finner den neste fristen, også over nyttår', () => {
    expect(nesteFrist([okt, feb, mars], '2026-01-15')?.id).toBe('feb');
    expect(nesteFrist([okt, feb, mars], '2026-03-02')?.id).toBe('okt');
    expect(nesteFrist([okt, feb, mars], '2026-12-01')?.id).toBe('feb');
  });
});
