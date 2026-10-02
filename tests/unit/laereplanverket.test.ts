// Læreplanverket (pakke 6, avgjørelse 037): lesingen av overordnet del fra udir.no, dataene og oppslagene i appen.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sammenlignOverordnetDel, validerOverordnetDel } from '../../scripts/hent-overordnet-del.ts';
import { lagTre, lesMeny, lesTekst, lesTittel, ukjenteElementer } from '../../scripts/udir/overordnet.ts';
import { finnDel, type Laereplanverket, sokIDeler, sti } from '../../src/modules/laereplanverket/data.ts';
import { alleDeler, overordnetDelSkjema } from '../../src/modules/laereplanverket/skjema.ts';
import { laereplanSkjema } from '../../src/modules/fag/skjema.ts';

const fil = (sti: string) => JSON.parse(readFileSync(new URL(`../../${sti}`, import.meta.url), 'utf8')) as unknown;
const od = overordnetDelSkjema.parse(fil('data/udir/overordnet-del.json'));
const lv = fil('data/grep/laereplanverket.json') as Laereplanverket;

describe('lesing av overordnet del fra udir.no', () => {
  const forside = `<div class="curriculum-table-of-contents"><ol>
    <li><a href="/lk20/overordnet-del/om-overordnet-del/">Om overordnet del</a></li>
    <li><a href="/lk20/overordnet-del/verdi/">1.<span class="link__text-without-numbers">Verdigrunnlag</span></a>
      <ul><li><a href="/lk20/overordnet-del/verdi/1.1-menneskeverdet/">1.1<span class="link__text-without-numbers">Menneskeverdet</span></a></li></ul></li>
    <li><a href="/lk20/overordnet-del/prinsipper/">2.<span class="link__text-without-numbers">Prinsipper</span></a>
      <ul><li><a href="/lk20/overordnet-del/prinsipper/tema/">2.5<span class="link__text-without-numbers">Tverrfaglige temaer</span></a></li>
      <li><a href="/lk20/overordnet-del/prinsipper/tema/folkehelse/">2.5.1<span class="link__text-without-numbers">Folkehelse</span></a></li></ul></li>
  </ol></div>`;

  it('leser innholdsregisteret og lager treet etter kapittelnumrene', () => {
    const meny = lesMeny(forside);
    expect(meny.map((m) => m.nr)).toEqual([null, '1', '1.1', '2', '2.5', '2.5.1']);
    expect(meny[2]).toMatchObject({ href: '/lk20/overordnet-del/verdi/1.1-menneskeverdet/', tittel: 'Menneskeverdet' });
    const tre = lagTre(meny);
    expect(tre.map((d) => d.nr)).toEqual([null, '1', '2']);
    expect(tre[2]?.deler[0]?.deler[0]?.tittel).toBe('Folkehelse');
  });

  it('leser tittel, ingress og tekst, uten ressurslenker og navigasjon', () => {
    const side = `<h1><span>Overordnet del <br/></span><span>Menneskeverdet</span></h1>
      <div class="curriculum-general-article__ingress"><p>Skolen skal&nbsp;sørge for menneskeverdet.</p></div>
      <div class="curriculum-general-article__body"><p>Første avsnitt med <em>vekt</em>.</p><blockquote><em>Kompetanse er å kunne.</em></blockquote><ul><li>Ett</li><li>To</li></ul>
      <div class="accordion"><p>Ressurser</p></div></div><nav><p>Neste</p></nav>`;
    expect(lesTittel(side)).toBe('Menneskeverdet');
    expect(lesTekst(side)).toEqual({
      ingress: [{ type: 'avsnitt', tekst: 'Skolen skal sørge for menneskeverdet.' }],
      tekst: [
        { type: 'avsnitt', tekst: 'Første avsnitt med vekt.' },
        { type: 'sitat', tekst: 'Kompetanse er å kunne.' },
        { type: 'liste', punkter: ['Ett', 'To'] },
      ],
    });
  });

  it('finner innhold appen ikke leser, f.eks. tabeller', () => {
    expect(ukjenteElementer('<div class="curriculum-general-article__body"><p>Tekst</p><table><tr><td>1</td></tr></table></div>')).toEqual(['table', 'td', 'tr']);
    expect(ukjenteElementer('<div class="curriculum-general-article__body"><p>Tekst <em>uthevet</em></p></div>')).toEqual([]);
  });

  it('melder nye, fjernede og endrede deler', () => {
    const endret = structuredClone(od);
    const forste = endret.deler[0];
    if (forste) forste.tekst.nb = [{ type: 'avsnitt', tekst: 'Ny tekst.' }];
    expect(sammenlignOverordnetDel(od, endret)).toEqual([`Endret tekst: ${od.deler[0]?.tittel.nb}`]);
    expect(sammenlignOverordnetDel(od, { ...od, deler: od.deler.slice(1) })[0]).toMatch(/^Del fjernet:/);
  });
});

describe('dataene', () => {
  it('overordnet del er fullstendig på bokmål og nynorsk', () => {
    expect(validerOverordnetDel(od)).toEqual([]);
    expect(alleDeler(od.deler).length).toBeGreaterThanOrEqual(20);
  });

  it('Grep har fem grunnleggende ferdigheter og tre tverrfaglige temaer, og læreplanene viser bare til dem', () => {
    expect(lv.ferdigheter.map((e) => e.kode)).toEqual(['GF1', 'GF2', 'GF3', 'GF4', 'GF5']);
    expect(lv.temaer.map((e) => e.kode)).toEqual(['TT1', 'TT2', 'TT3']);
    const kjente = new Set([...lv.ferdigheter, ...lv.temaer].map((e) => e.kode));
    const mappe = new URL('../../data/grep/laereplaner/', import.meta.url);
    for (const f of readdirSync(mappe)) {
      const plan = laereplanSkjema.parse(JSON.parse(readFileSync(new URL(f, mappe), 'utf8')));
      for (const o of [...plan.ferdigheter, ...plan.temaer]) expect(kjente.has(o.kode), `${plan.kode}: ${o.kode}`).toBe(true);
    }
  });
});

describe('oppslag og søk', () => {
  it('finner delen fra kapittelnummer, id og koden til en ferdighet eller et tema', () => {
    expect(finnDel(od.deler, '2.5.1', lv)?.tittel.nb).toBe('Folkehelse og livsmestring');
    expect(finnDel(od.deler, 'TT3', lv)?.nr).toBe('2.5.3');
    expect(finnDel(od.deler, 'GF2', lv)?.tittel.nb).toBe('Grunnleggende ferdigheter');
    expect(finnDel(od.deler, 'om-overordnet-del', lv)?.nr).toBeNull();
    expect(finnDel(od.deler, '9.9', lv)).toBeNull();
    const mal = finnDel(od.deler, '2.5.1', lv);
    expect(mal && sti(od.deler, mal).map((d) => d.nr)).toEqual(['2', '2.5', '2.5.1']);
  });

  it('søket finner delene med alle ordene, med et utdrag rundt treffet', () => {
    const treff = sokIDeler(od.deler, 'menneskeverdets ukrenkelighet', 'nb');
    expect(treff.map((t) => t.del.nr)).toContain('1.1');
    const t = treff.find((x) => x.del.nr === '1.1');
    expect(t?.utdrag?.treff.toLowerCase()).toBe('menneskeverdets');
    expect(sokIDeler(od.deler, 'menneskeverdet', 'nn').length).toBeGreaterThan(0);
    expect(sokIDeler(od.deler, 'xyzzy', 'nb')).toEqual([]);
  });
});
