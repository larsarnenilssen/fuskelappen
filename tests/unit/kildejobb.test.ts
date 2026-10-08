import { describe, expect, it } from 'vitest';
import { erIkkeGodkjent, grunnlagFor, lagFingeravtrykk, normaliserTekst, nyPost, vurderMotGrunnlag } from '../../scripts/kilder/logikk.ts';
import { kfTekst } from '../../scripts/kilder/kf-infoserie.ts';
import { ventetid } from '../../scripts/hent-grep.ts';
import { feilmelding, filtrerSkoler, lovdataFilnavn, skoleendringer, strukturhint, trekkUt } from '../../scripts/kilder/metoder.ts';

const A = lagFingeravtrykk('a');
const B = lagFingeravtrykk('b');

describe('fingeravtrykk og status', () => {
  it('normaliserer tekst før fingeravtrykk', () => {
    expect(normaliserTekst('  Hei \n\t verden ')).toBe('Hei verden');
    expect(lagFingeravtrykk('x')).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('sammenligner med grunnlaget, og første sjekk av en ny kilde blir grunnlaget (avgjørelse 089)', () => {
    expect(vurderMotGrunnlag(A, A)).toMatchObject({ status: 'ok', grunnlag: A });
    expect(vurderMotGrunnlag(A, B)).toMatchObject({ status: 'endret', grunnlag: B });
    expect(vurderMotGrunnlag(A, null)).toMatchObject({ status: 'ok', grunnlag: A, melding: null });
  });

  it('grunnlaget er det eier har gått gjennom, ellers det kildesjekken lagret', () => {
    const { grunnlag } = nyPost(undefined, undefined, vurderMotGrunnlag(A, null), 't1');
    expect(grunnlagFor({ godkjent_fingeravtrykk: B }, grunnlag)).toBe(B);
    expect(grunnlagFor({ godkjent_fingeravtrykk: null }, grunnlag)).toBe(A);
    expect(grunnlagFor({}, undefined)).toBeNull();
  });

  it('kjenner igjen en kilde eier ikke har godkjent for bruk', () => {
    expect(erIkkeGodkjent({ godkjent: null })).toBe(true);
    expect(erIkkeGodkjent({ godkjent: '2026-10-08' })).toBe(false);
    expect(erIkkeGodkjent(undefined)).toBe(false);
  });

  it('husker når innholdet sist ble endret, også etter at eier har gått gjennom det', () => {
    const forste = nyPost(undefined, undefined, vurderMotGrunnlag(A, null), 't1');
    expect(forste.post).toMatchObject({ status: 'ok', endret_siden: null });
    expect(forste.grunnlag).toEqual({ grunnlag: A, feil_pa_rad: 0 });
    const endret = nyPost(forste.post, forste.grunnlag, vurderMotGrunnlag(B, grunnlagFor({}, forste.grunnlag)), 't2');
    expect(endret.post).toMatchObject({ status: 'endret', endret_siden: 't2' });
    expect(endret.grunnlag.grunnlag).toBe(A);
    const uendret = nyPost(endret.post, endret.grunnlag, vurderMotGrunnlag(B, grunnlagFor({}, endret.grunnlag)), 't3');
    expect(uendret.post).toMatchObject({ status: 'endret', endret_siden: 't2' });
    // Eier har gått gjennom endringen (godkjent_fingeravtrykk = B): ok, men datoen for endringen står.
    const gjennomgatt = nyPost(uendret.post, uendret.grunnlag, vurderMotGrunnlag(B, grunnlagFor({ godkjent_fingeravtrykk: B }, uendret.grunnlag)), 't4');
    expect(gjennomgatt.post).toMatchObject({ status: 'ok', endret_siden: 't2' });
    expect(gjennomgatt.grunnlag.grunnlag).toBe(B);
  });

  it('statusposten har samme form som før, så versjonen som er publisert, kan lese den', () => {
    const { post } = nyPost(undefined, undefined, vurderMotGrunnlag(A, null), 't1');
    expect(Object.keys(post).sort()).toEqual(['endret_siden', 'fingeravtrykk', 'melding', 'sjekket', 'status']);
  });

  it('en kilde som var «ny, ikke godkjent» i gammel status, får ingen dato for endring', () => {
    const gammel = { status: 'endret' as const, sjekket: 't0', fingeravtrykk: A, endret_siden: 't0', melding: 'Ny kilde, ikke godkjent ennå.' };
    const r = nyPost(gammel, undefined, vurderMotGrunnlag(A, grunnlagFor({}, undefined)), 't1');
    expect(r.post).toMatchObject({ status: 'ok', endret_siden: null });
    expect(r.grunnlag.grunnlag).toBe(A);
  });

  it('en feil vises først når kilden har feilet to sjekker på rad, og forrige fingeravtrykk beholdes', () => {
    const forrige = nyPost(undefined, undefined, { status: 'ok', fingeravtrykk: A, melding: null }, 't1');
    const en = nyPost(forrige.post, forrige.grunnlag, { status: 'feilet', fingeravtrykk: null, melding: 'Tidsavbrudd' }, 't2');
    expect(en.post).toMatchObject({ status: 'ok', fingeravtrykk: A, melding: 'Tidsavbrudd', sjekket: 't2' });
    expect(en.grunnlag.feil_pa_rad).toBe(1);
    const to = nyPost(en.post, en.grunnlag, { status: 'feilet', fingeravtrykk: null, melding: 'Tidsavbrudd' }, 't3');
    expect(to.post).toMatchObject({ status: 'feilet', fingeravtrykk: A });
    expect(to.grunnlag.feil_pa_rad).toBe(2);
    const igjen = nyPost(to.post, to.grunnlag, { status: 'ok', fingeravtrykk: A, melding: null }, 't4');
    expect(igjen.post.status).toBe('ok');
    expect(igjen.grunnlag.feil_pa_rad).toBe(0);
    // Nyhetskildene har sin egen regel (mer enn to dager) og feiler med en gang.
    expect(nyPost(forrige.post, forrige.grunnlag, { status: 'feilet', fingeravtrykk: null, melding: 'x' }, 't2', { straks: true }).post.status).toBe('feilet');
    // En helt ny kilde som feiler, har ingenting å falle tilbake på.
    expect(nyPost(undefined, undefined, { status: 'feilet', fingeravtrykk: null, melding: 'x' }, 't1').post.status).toBe('feilet');
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

  it('merker private skoler (ErPrivatskole), og bare dem (avgjørelse 075)', () => {
    const skoler = filtrerSkoler([{ ...enhet('1', 'Privat vgs', '46'), ErPrivatskole: true }, { ...enhet('2', 'Offentleg vgs', '46'), ErPrivatskole: false }], new Set(['46']));
    expect(skoler).toEqual([
      { id: '2', navn: 'Offentleg vgs', fylke: '46', kommune: '4601' },
      { id: '1', navn: 'Privat vgs', fylke: '46', kommune: '4601', privat: true },
    ]);
    const a = { id: '1', navn: 'A', fylke: '46', kommune: '4601' };
    expect(skoleendringer([a], [{ ...a, privat: true }]).endret.map((s) => s.id)).toEqual(['1']);
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

describe('feil i hentingen (kildesjekken 04.10.2026)', () => {
  it('feilmeldingen tar med årsaken bak «fetch failed»', () => {
    const arsak = Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' });
    expect(feilmelding(new TypeError('fetch failed', { cause: arsak }))).toBe('fetch failed (read ECONNRESET)');
    const sertifikat = Object.assign(new Error('unable to verify the first certificate'), { code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' });
    expect(feilmelding(new TypeError('fetch failed', { cause: sertifikat }))).toBe('fetch failed (UNABLE_TO_VERIFY_LEAF_SIGNATURE: unable to verify the first certificate)');
    expect(feilmelding('noe annet')).toBe('noe annet');
  });

  it('Grep venter lenger ved 429 og følger Retry-After', () => {
    expect(ventetid(1, null, null)).toBe(2000);
    expect(ventetid(2, 500, null)).toBe(4000);
    expect(ventetid(1, 429, null)).toBe(15_000);
    expect(ventetid(3, 429, null)).toBe(45_000);
    expect(ventetid(1, 429, '30')).toBe(30_000);
    expect(ventetid(1, 503, '600')).toBe(120_000);
  });
});
