// Lenkesjekken (avgjørelse 062, eier 05.10.2026): alle lenker i appen kommer med, også nye, og hver ny datafil med
// lenker eller kodefil som bygger lenker, må ha en regel i scripts/lenker/regler.ts.
import { describe, expect, it } from 'vitest';
import { DATAFILER, LENKEBYGGERE } from '../../scripts/lenker/regler.ts';
import { finnDatafiler, finnLenkebyggere, finnUrler, samleLenker } from '../../scripts/lenker/samle.ts';
import { lagRapport, type Lenkestatus, oppdaterStatus, type Resultat, sjekkAlle, stengteNettsteder, velgStikkprove, vurderSvar } from '../../scripts/lenker/sjekk.ts';

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

  it('finner adresser i tekst uten tegnsettingen etter', () => {
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
    const rapport = lagRapport(status, [{ url: 'https://a.no/1', type: 'fast', brukt: ['content/x.yaml'] }], []);
    expect(rapport).toContain('- [ ] https://a.no/1 (2 ganger på rad). Står i: content/x.yaml');
    expect(rapport).not.toContain('https://a.no/2');
    expect(lagRapport({ ...status, lenker: { 'https://a.no/2': status.lenker['https://a.no/2'] as Lenkestatus['lenker'][string] } }, [], [])).toBe('');
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
