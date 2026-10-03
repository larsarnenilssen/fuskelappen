// Lenker til begrepsbanken i brødtekst (avgjørelse 050).
import { describe, expect, it } from 'vitest';
import { type Begrepsord, lenkBegreper, monsterFor } from '../../src/core/innhold/begrepslenker.ts';

const b = (id: string, nb: string[], nn = nb, fylke: string | null = null): Begrepsord => ({ id, fylke, ord: { nb, nn } });
const ORD = [
  b('arbeidstid', ['arbeidstid']),
  b('planfestet-arbeidstid', ['planfestet arbeidstid'], ['planfesta arbeidstid']),
  b('privatist', ['privatist']),
  b('utdanningsprogram', ['utdanningsprogram']),
  b('lov', ['lov', 'loven']),
  b('tilleggspoeng', ['tilleggspoeng'], ['tilleggspoeng'], '46'),
];
const lenk = (html: string, valg: Partial<Parameters<typeof lenkBegreper>[2]> = {}) => lenkBegreper(html, ORD, { malform: 'nb', fylke: null, ...valg });
const a = (id: string, tekst: string) => `<a class="begrepslenke" href="#/begreper/${id}">${tekst}</a>`;

describe('monsterFor', () => {
  it('treffer hele ord med vanlig bøyning, uansett store og små bokstaver', () => {
    const m = monsterFor('privatist');
    for (const ord of ['privatist', 'Privatisten', 'privatister', 'privatistane', 'privatistens']) expect(m.test(ord), ord).toBe(true);
    for (const ord of ['privatistordning', 'ikkeprivatist']) expect(m.test(ord), ord).toBe(false);
  });

  it('dobler m-en i ord på -m', () => {
    const m = monsterFor('utdanningsprogram');
    for (const ord of ['utdanningsprogrammet', 'utdanningsprogrammene', 'utdanningsprogramma']) expect(m.test(ord), ord).toBe(true);
  });

  it('korte ord treffes bare slik de står', () => {
    expect(monsterFor('lov').test('lov')).toBe(true);
    expect(monsterFor('lov').test('love')).toBe(false);
  });

  it('flere ord kan stå med linjeskift mellom', () => {
    expect(monsterFor('planfestet arbeidstid').test('planfestet\narbeidstiden')).toBe(true);
  });
});

describe('lenkBegreper', () => {
  it('lenker første forekomst av hvert begrep, ikke de neste', () => {
    expect(lenk('<p>En privatist er ikke elev. Privatisten melder seg opp selv.</p>')).toBe(`<p>En ${a('privatist', 'privatist')} er ikke elev. Privatisten melder seg opp selv.</p>`);
  });

  it('lengste treff vinner', () => {
    expect(lenk('<p>Den planfestet arbeidstid er en del av arbeidstiden.</p>')).toBe(
      `<p>Den ${a('planfestet-arbeidstid', 'planfestet arbeidstid')} er en del av ${a('arbeidstid', 'arbeidstiden')}.</p>`,
    );
  });

  it('lenker ikke i overskrifter, uthevede ledetekster eller andre lenker', () => {
    expect(lenk('<h2>Privatist</h2><p><strong>Lov:</strong> <a href="https://lovdata.no">loven</a></p>')).toBe('<h2>Privatist</h2><p><strong>Lov:</strong> <a href="https://lovdata.no">loven</a></p>');
  });

  it('lenker som går til begrepsbanken fra før, får klassen og teller som første forekomst', () => {
    expect(lenk('<p><a href="#/begreper/privatist">Privatister</a> og privatisten.</p>')).toBe('<p><a class="begrepslenke" href="#/begreper/privatist">Privatister</a> og privatisten.</p>');
  });

  it('lenker ikke til begrepet teksten handler om, og ikke til deler av det', () => {
    expect(lenk('<p>Planfestet arbeidstid er en del av arbeidstiden.</p>', { egenId: 'planfestet-arbeidstid' })).toBe(`<p>Planfestet arbeidstid er en del av ${a('arbeidstid', 'arbeidstiden')}.</p>`);
  });

  it('fylkesbegreper lenkes bare fra tekst for samme fylke', () => {
    expect(lenk('<p>Tilleggspoeng</p>')).toBe('<p>Tilleggspoeng</p>');
    expect(lenk('<p>Tilleggspoeng</p>', { fylke: '03' })).toBe('<p>Tilleggspoeng</p>');
    expect(lenk('<p>Tilleggspoeng</p>', { fylke: '46' })).toBe(`<p>${a('tilleggspoeng', 'Tilleggspoeng')}</p>`);
  });

  it('bruker ordene for målformen', () => {
    expect(lenk('<p>Planfesta arbeidstid</p>', { malform: 'nn' })).toBe(`<p>${a('planfestet-arbeidstid', 'Planfesta arbeidstid')}</p>`);
  });

  it('beholder tegn som er gjort om til HTML', () => {
    expect(lenk('<p>«loven» &amp; privatist</p>')).toBe(`<p>«${a('lov', 'loven')}» &amp; ${a('privatist', 'privatist')}</p>`);
  });
});
