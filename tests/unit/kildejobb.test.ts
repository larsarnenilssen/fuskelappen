import { describe, expect, it } from 'vitest';
import {
  lagFingeravtrykk,
  lesMerke,
  normaliserTekst,
  nyPost,
  planleggVarsler,
  saksTekst,
  vurderMotGodkjent,
} from '../../scripts/kilder/logikk.ts';
import { filtrerSkoler, skoleendringer, trekkUt } from '../../scripts/kilder/metoder.ts';

const kilde = { id: 'ks-sfs2213', navn: 'SFS 2213', url: 'https://www.ks.no/', godkjent_fingeravtrykk: null };
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

describe('varsler', () => {
  const feilet = nyPost(undefined, { status: 'feilet', fingeravtrykk: null, melding: 'Simulert feil' }, 't1');
  const endret = nyPost(undefined, { status: 'endret', fingeravtrykk: A, melding: null }, 't1');
  const ok = nyPost(undefined, { status: 'ok', fingeravtrykk: A, melding: null }, 't1');

  it('oppretter én sak ved feil eller endring', () => {
    const h = planleggVarsler([kilde], { [kilde.id]: feilet }, []);
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ type: 'opprett', kildeId: 'ks-sfs2213', tittel: '[kilde:ks-sfs2213] SFS 2213' });
  });

  it('gjør ingenting når tilstanden er den samme', () => {
    const merke = lesMerke(saksTekst(kilde, feilet));
    expect(merke?.kildeId).toBe('ks-sfs2213');
    const h = planleggVarsler([kilde], { [kilde.id]: feilet }, [{ nummer: 7, kildeId: kilde.id, tilstand: merke?.tilstand ?? '' }]);
    expect(h).toEqual([]);
  });

  it('oppdaterer saken når tilstanden endres', () => {
    const merke = lesMerke(saksTekst(kilde, feilet));
    const h = planleggVarsler([kilde], { [kilde.id]: endret }, [{ nummer: 7, kildeId: kilde.id, tilstand: merke?.tilstand ?? '' }]);
    expect(h[0]).toMatchObject({ type: 'oppdater', nummer: 7 });
  });

  it('lukker saken når kilden er i orden', () => {
    const h = planleggVarsler([kilde], { [kilde.id]: ok }, [{ nummer: 7, kildeId: kilde.id, tilstand: 'x' }]);
    expect(h[0]).toMatchObject({ type: 'lukk', nummer: 7 });
    expect(planleggVarsler([kilde], { [kilde.id]: ok }, [])).toEqual([]);
  });

  it('ignorerer kilder uten status', () => {
    expect(planleggVarsler([kilde], {}, [])).toEqual([]);
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
