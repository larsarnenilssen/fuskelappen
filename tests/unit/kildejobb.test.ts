import { describe, expect, it } from 'vitest';
import { lagFingeravtrykk, normaliserTekst, nyPost, vurderMotGodkjent } from '../../scripts/kilder/logikk.ts';
import { kfTekst } from '../../scripts/kilder/kf-infoserie.ts';
import { filtrerSkoler, lovdataFilnavn, skoleendringer, strukturhint, trekkUt } from '../../scripts/kilder/metoder.ts';

const A = lagFingeravtrykk('a');
const B = lagFingeravtrykk('b');

describe('fingeravtrykk og status', () => {
  it('normaliserer tekst før fingeravtrykk', () => {
    expect(normaliserTekst('  Hei \n\t verden ')).toBe('Hei verden');
    expect(lagFingeravtrykk('x')).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('sammenligner med godkjent fingeravtrykk', () => {
    expect(vurderMotGodkjent(A, A).status).toBe('ok');
    expect(vurderMotGodkjent(A, B).status).toBe('endret');
    expect(vurderMotGodkjent(A, null)).toMatchObject({ status: 'endret', melding: 'Ingen godkjent fingeravtrykk ennå.' });
  });

  it('husker når en endring først ble oppdaget', () => {
    const forste = nyPost(undefined, { status: 'endret', fingeravtrykk: A, melding: null }, 't1');
    expect(forste.endret_siden).toBe('t1');
    const andre = nyPost(forste, { status: 'endret', fingeravtrykk: A, melding: null }, 't2');
    expect(andre.endret_siden).toBe('t1');
    const ny = nyPost(andre, { status: 'endret', fingeravtrykk: B, melding: null }, 't3');
    expect(ny.endret_siden).toBe('t3');
    const ok = nyPost(ny, { status: 'ok', fingeravtrykk: B, melding: null }, 't4');
    expect(ok.endret_siden).toBeNull();
  });

  it('beholder forrige fingeravtrykk når sjekken feiler', () => {
    const forrige = nyPost(undefined, { status: 'ok', fingeravtrykk: A, melding: null }, 't1');
    const feil = nyPost(forrige, { status: 'feilet', fingeravtrykk: null, melding: 'Tidsavbrudd' }, 't2');
    expect(feil).toMatchObject({ status: 'feilet', fingeravtrykk: A, melding: 'Tidsavbrudd', sjekket: 't2' });
  });
});

describe('uttrekk fra nettsider', () => {
  const html = `<html><body><nav>Meny</nav><main>
    <article class="kort"><h3>Nyheter</h3><p>Dato 1. mai</p></article>
    <article class="kort"><h3>Oversikt</h3><ul><li>SFS 2213  Arbeidstid</li><li>SFS 2214</li></ul><script>var x=1</script></article>
  </main></body></html>`;

  it('henter bare valgt del av siden', () => {
    expect(trekkUt(html, { selektor: 'article.kort', inneholder: 'SFS 2213', fjern: [] })).toBe('Oversikt SFS 2213 Arbeidstid SFS 2214');
    expect(trekkUt(html, { selektor: 'main', fjern: ['nav', 'article:first-child'] })).not.toContain('Nyheter');
  });

  it('feiler tydelig når siden har fått ny struktur', () => {
    expect(() => trekkUt(html, { selektor: 'section.finnes-ikke', fjern: [] })).toThrow(/Fant ikke innholdet/);
  });
});

describe('skoleregisteret', () => {
  const enhet = (id: string, navn: string, fylke: string, vgs = true, aktiv = true) => ({
    Organisasjonsnummer: id,
    Navn: navn,
    Fylkesnummer: fylke,
    Kommunenummer: `${fylke}01`,
    ErAktiv: aktiv,
    ErSkole: true,
    ErVideregaaendeSkole: vgs,
  });

  it('beholder bare aktive videregående skoler i kjente fylker', () => {
    const skoler = filtrerSkoler(
      [enhet('3', 'Å vgs', '46'), enhet('1', 'B vgs', '46'), enhet('2', 'Grunnskule', '46', false), enhet('4', 'Nedlagt', '46', true, false), enhet('5', 'Utlandet', '25')],
      new Set(['46']),
    );
    expect(skoler.map((s) => s.navn)).toEqual(['B vgs', 'Å vgs']);
  });

  it('lager endringsrapport', () => {
    const a = { id: '1', navn: 'A', fylke: '46', kommune: '4601' };
    const b = { id: '2', navn: 'B', fylke: '46', kommune: '4601' };
    const r = skoleendringer([a, b], [{ ...a, navn: 'A2' }, { id: '3', navn: 'C', fylke: '11', kommune: '1101' }]);
    expect(r.nye.map((s) => s.id)).toEqual(['3']);
    expect(r.fjernet.map((s) => s.id)).toEqual(['2']);
    expect(r.endret.map((s) => s.id)).toEqual(['1']);
  });
});

describe('sjekkmetoder for fase 1', () => {
  it('finner filnavnet til en lov i Lovdatas datasett', () => {
    expect(lovdataFilnavn('https://lovdata.no/lov/2005-06-17-62')).toBe('nl-20050617-062');
    expect(lovdataFilnavn('https://lovdata.no/lov/2023-06-09-30')).toBe('nl-20230609-030');
    expect(() => lovdataFilnavn('https://lovdata.no/')).toThrow(/Kjenner ikke igjen/);
  });

  it('trekker ut kapittel 10 etter data-name, ikke løpenummeret i id', () => {
    const html =
      '<main><section id="kapittel-10" data-name="kap9"><h2>Kapittel 9. Kontrolltiltak</h2></section>' +
      '<section id="kapittel-11" data-name="kap10"><h2>Kapittel 10. Arbeidstid</h2><p>§ 10-1</p></section></main>';
    expect(trekkUt(html, { selektor: '[data-name="kap10"]', inneholder: 'Kapittel 10. Arbeidstid', fjern: [] })).toBe('Kapittel 10. Arbeidstid § 10-1');
    expect(strukturhint(html)).toContain('section[data-name="kap10"]');
  });

  it('normaliserer teksten fra KF Infoserie og fjerner skript', () => {
    expect(kfTekst('<section><h1>SFS 2213</h1><script>x()</script><p>4.  Arbeidsåret</p></section>')).toBe('SFS 2213 4. Arbeidsåret');
  });
});
