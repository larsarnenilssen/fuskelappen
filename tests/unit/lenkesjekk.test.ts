// Lenkesjekken (avgjørelse 062, eier 05.10.2026): alle lenker i appen kommer med, også nye, og hver ny datafil med
// lenker eller kodefil som bygger lenker, må ha en regel i scripts/lenker/regler.ts.
import { describe, expect, it } from 'vitest';
import { DATAFILER, LENKEBYGGERE } from '../../scripts/lenker/regler.ts';
import { finnDatafiler, finnLenkebyggere, finnUrler, samleLenker, utenKommentarer } from '../../scripts/lenker/samle.ts';
import { lagKontrollrapport } from '../../scripts/kontroll/rapport.ts';
import { lagRapport, type Lenkestatus, oppdaterStatus, type Resultat, sjekkAlle, stengteLenker, stengteNettsteder, velgStikkprove, vurderSvar } from '../../scripts/lenker/sjekk.ts';

const rot = process.cwd();

describe('alle lenkene kommer med', () => {
  it('hver kodefil som bygger lenker av data, har en lenkebygger', () => {
    const registrert = new Set(LENKEBYGGERE.map((b) => b.fil));
    expect(finnLenkebyggere(rot).filter((f) => !registrert.has(f))).toEqual([]);
  });

  it('hver datafil med lenker har en regel (sjekkes hver gang eller med stikkprøver)', () => {
    expect(finnDatafiler(rot).filter((f) => !DATAFILER.some((r) => r.fil.test(f)))).toEqual([]);
  });

  it('lenkene i innholdet, kilderegisteret og koden sjekkes hver gang, og de massegenererte med stikkprøver', () => {
    const lenker = new Map(samleLenker(rot).map((l) => [l.url, l]));
    expect(lenker.get('https://eksamensplan.udir.no/')?.type).toBe('fast');
    expect(lenker.get('https://lovdata.no/lov/2023-06-09-30')?.type).toBe('fast');
    expect([...lenker.values()].some((l) => l.type === 'stikkprove' && l.url.startsWith('https://www.udir.no/lk20/'))).toBe(true);
    for (const b of LENKEBYGGERE) expect(b.lenker(rot).length, b.navn).toBeGreaterThan(0);
  });

  it('adressene i kommentarer i YAML er eksempler og sjekkes ikke', () => {
    const tekst = '# Mal: https://lovdata.no/lov/ÅÅÅÅ-MM-DD-nr\n  url: https://a.no/x # kommentar\n';
    expect(finnUrler(utenKommentarer(tekst))).toEqual(['https://a.no/x']);
    expect(samleLenker(rot).filter((l) => l.url.includes('ÅÅÅÅ'))).toEqual([]);
  });

  it('finner adresser i tekst uten tegnsettingen etter', () => {
    expect(finnUrler('Lenken må begynne med https://.')).toEqual([]);
    expect(finnUrler('Se https://www.udir.no/lk20/. Og [lenke](https://lovdata.no/lov/2023-06-09-30/§11-1), samt `${x}`.')).toEqual(['https://www.udir.no/lk20/', 'https://lovdata.no/lov/2023-06-09-30/§11-1']);
  });
});

describe('vurderingen av svaret', () => {
  it('borte, flyttet, ok og usikkert', () => {
    expect(vurderSvar('https://a.no/x/', 200, null)).toBe('ok');
    expect(vurderSvar('https://a.no/x', 200, 'https://www.a.no/x/')).toBe('ok');
    expect(vurderSvar('https://a.no/x', 404, null)).toBe('borte');
    expect(vurderSvar('https://a.no/x', 410, null)).toBe('borte');
    expect(vurderSvar('https://a.no/x', 200, 'https://a.no/')).toBe('borte');
    expect(vurderSvar('https://a.no/x', 200, 'https://a.no/y')).toBe('flyttet');
    expect(vurderSvar('https://a.no/x', 403, null)).toBe('feil');
    expect(vurderSvar('https://a.no/x', 503, null)).toBe('feil');
    expect(vurderSvar('https://a.no/x', null, null)).toBe('feil');
  });

  it('Lovdatas korte adresser er ok når de sendes videre til den lange adressen', () => {
    expect(vurderSvar('https://lovdata.no/lov/2023-06-09-30/§5-1', 200, 'https://lovdata.no/dokument/NL/lov/2023-06-09-30/KAPITTEL_3-1')).toBe('ok');
    expect(vurderSvar('https://lovdata.no/forskrift/2024-06-03-900', 200, 'https://lovdata.no/dokument/SF/forskrift/2024-06-03-900')).toBe('ok');
    expect(vurderSvar('https://lovdata.no/dokument/SF/forskrift/2024-06-03-900', 200, 'https://lovdata.no/dokument/SF/forskrift/2025-01-01-1')).toBe('flyttet');
    expect(vurderSvar('https://lovdata.no/lov/2023-06-09-30', 200, 'https://lovdata.no/sok')).toBe('flyttet');
  });
});

const r = (url: string, svar: Resultat['svar'], til: string | null = null): Resultat => ({ url, svar, status: null, til, melding: null });

describe('status fra gang til gang', () => {
  it('teller hvor mange ganger på rad, og tar ut lenker som ikke finnes lenger', () => {
    const en = oppdaterStatus(null, [r('https://a.no/1', 'borte'), r('https://a.no/2', 'ok'), r('https://b.no/', 'ok')], new Set(['https://a.no/1', 'https://a.no/2', 'https://b.no/']), '2026-10-05');
    const to = oppdaterStatus(en, [r('https://a.no/1', 'borte'), r('https://a.no/2', 'feil')], new Set(['https://a.no/1', 'https://a.no/2']), '2026-10-12');
    expect(to.lenker['https://a.no/1']).toMatchObject({ svar: 'borte', ganger: 2, sist: '2026-10-12' });
    expect(to.lenker['https://a.no/2']).toMatchObject({ svar: 'feil', ganger: 1 });
    expect(to.lenker['https://b.no/']).toBeUndefined();
  });

  it('stikkprøvene tar de usjekkede først, så dem som er sjekket for lengst siden', () => {
    const lenker = ['https://a.no/1', 'https://a.no/2', 'https://a.no/3'].map((url) => ({ url, type: 'stikkprove' as const, brukt: [] }));
    const status: Lenkestatus = { sjekket: '2026-10-05', lenker: { 'https://a.no/1': { svar: 'ok', ganger: 1, sist: '2026-10-05', til: null, melding: null }, 'https://a.no/3': { svar: 'ok', ganger: 1, sist: '2026-09-28', til: null, melding: null } } };
    expect(velgStikkprove(lenker, status, 2)).toEqual(['https://a.no/2', 'https://a.no/3']);
  });

  it('nettsteder der alle lenkene feilet, regnes som stengt', () => {
    expect(stengteNettsteder([r('https://www.a.no/1', 'feil'), r('https://a.no/2', 'feil'), r('https://b.no/1', 'feil'), r('https://b.no/2', 'ok')])).toEqual(['a.no']);
  });

  it('rapporten viser lenker som har vært borte eller flyttet to ganger på rad, og er tom ellers', () => {
    const status: Lenkestatus = {
      sjekket: '2026-10-12',
      lenker: {
        'https://a.no/1': { svar: 'borte', ganger: 2, sist: '2026-10-12', til: null, melding: null },
        'https://a.no/2': { svar: 'flyttet', ganger: 1, sist: '2026-10-12', til: 'https://a.no/3', melding: null },
      },
    };
    const rapport = lagRapport(status, [{ url: 'https://a.no/1', type: 'fast', brukt: ['content/x.yaml'] }]);
    expect(rapport).toContain('- [ ] https://a.no/1 (2 ganger på rad). Står i: content/x.yaml');
    expect(rapport).not.toContain('https://a.no/2');
    expect(lagRapport({ ...status, lenker: { 'https://a.no/2': status.lenker['https://a.no/2'] as Lenkestatus['lenker'][string] } }, [])).toBe('');
  });

  it('stengte nettsteder gir ingen sak, men står i kontrolloversikten med lenkene og hvor de står (sak #98)', () => {
    const lenker = [
      { url: 'https://www.stengt.no/a', type: 'fast' as const, brukt: ['content/x.yaml', 'src/y.ts'] },
      { url: 'https://stengt.no/b', type: 'stikkprove' as const, brukt: ['data/z.json'] },
      { url: 'https://stengt.no/c', type: 'stikkprove' as const, brukt: ['data/z.json'] },
      { url: 'https://apen.no/', type: 'fast' as const, brukt: ['content/x.yaml'] },
    ];
    const resultater = [r('https://www.stengt.no/a', 'feil'), r('https://stengt.no/b', 'feil'), r('https://apen.no/', 'ok')];
    const status = oppdaterStatus(null, resultater, new Set(lenker.map((l) => l.url)), '2026-10-12');
    // Bare stengte nettsteder: ingen sak (en åpen sak lukkes).
    expect(lagRapport(status, lenker)).toBe('');
    const stengte = stengteLenker(stengteNettsteder(resultater), lenker, '2026-10-12');
    expect(stengte).toEqual({ sjekket: '2026-10-12', nettsteder: [{ vert: 'stengt.no', lenker: [{ url: 'https://www.stengt.no/a', brukt: ['content/x.yaml', 'src/y.ts'] }], stikkprover: 2 }] });
    const md = lagKontrollrapport([], { kilder: [] } as unknown as Parameters<typeof lagKontrollrapport>[1], null, null, '2026-10-12', [], null, stengte);
    expect(md).toContain('## Nettsteder som ikke kan sjekkes automatisk');
    expect(md).toContain('Lenkesjekken 12.10.2026 fikk ikke svar fra noen av lenkene');
    expect(md).not.toContain('kontrollrunden');
    expect(md).toContain('- **stengt.no** (3 lenker)\n  - https://www.stengt.no/a (står i `content/x.yaml`, `src/y.ts`)\n  - 2 lenker fra dataene, som sjekkes med stikkprøver.');
    expect(md.indexOf('## Nettsteder som ikke kan sjekkes automatisk')).toBeLessThan(md.indexOf('## Per kilde'));
    // Før første lenkesjekk er det ingen del om nettstedene.
    expect(lagKontrollrapport([], { kilder: [] } as unknown as Parameters<typeof lagKontrollrapport>[1], null, null, '2026-10-12', [], null, { sjekket: null, nettsteder: [] })).not.toContain('Nettsteder som ikke');
  });

  it('sjekker nettstedene parallelt og lenkene til samme nettsted etter hverandre', async () => {
    const aktive = new Map<string, number>();
    let maks = 0;
    const sjekk = async (u: string) => {
      const v = new URL(u).hostname;
      aktive.set(v, (aktive.get(v) ?? 0) + 1);
      maks = Math.max(maks, aktive.get(v) as number);
      await new Promise((x) => setTimeout(x, 2));
      aktive.set(v, (aktive.get(v) ?? 1) - 1);
      return r(u, 'ok');
    };
    const ut = await sjekkAlle(['https://a.no/1', 'https://a.no/2', 'https://b.no/1'], { pauseMs: 0, sjekk });
    expect(ut.map((x) => x.url).sort()).toEqual(['https://a.no/1', 'https://a.no/2', 'https://b.no/1']);
    expect(maks).toBe(1);
  });
});
