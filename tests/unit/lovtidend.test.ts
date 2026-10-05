// Norsk Lovtidend avdeling II som ukentlig kilde til nye, endrede og opphevede lokale forskrifter (avgjørelse 061).
// Eksempelsidene er utdrag av sider hentet fra Lovdata 05.10.2026.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type Lokale, oppdaterLokale, type Titler } from '../../scripts/lovdata/lokale.ts';
import { kunngjoringstype, lesKunngjoringstidspunkter, lesLovtidendside, lesMetadata, tidspunkt } from '../../scripts/lovdata/register.ts';

const side = (navn: string) => readFileSync(`tests/fixtures/lovdata/${navn}.html`, 'utf8');

describe('Lovtidend avdeling II', () => {
  it('leser tidspunktene for kunngjøring i menyen, nyeste først', () => {
    const meny = lesKunngjoringstidspunkter(side('lovtidend-meny'));
    expect(meny[0]).toBe('02.10.2026 kl. 15.00');
    expect(meny.at(-1)).toBe('02.01.2026 kl. 13.15');
    expect(meny).not.toContain('Alle tidspunkt');
  });

  it('gjør tidspunktene om til tekst som kan sammenlignes', () => {
    expect(tidspunkt('02.10.2026 kl. 15.00')).toBe('2026-10-02T15:00');
    expect(tidspunkt('02.10.2026 kl. 09.15') < tidspunkt('02.10.2026 kl. 15.00')).toBe(true);
    expect(tidspunkt('01.08.2024')).toBe('2024-08-01T00:00');
  });

  it('leser kunngjøringene for ett tidspunkt, og om det finnes en side til', () => {
    const s = lesLovtidendside(side('lovtidend-side'));
    expect(s.neste).toBe(false);
    expect(s.treff).toHaveLength(4);
    expect(s.treff).toContainEqual({ refid: 'forskrift/2026-09-29-1985', avdeling: 'LTII', tittel: 'Forskrift om oppheving av forskrift om skulereglar, Vestland fylkeskommune' });
    expect(lesLovtidendside(side('lovtidend-blar')).neste).toBe(true);
  });

  it('skiller nye forskrifter, endringer og opphevinger ut fra tittelen', () => {
    expect(kunngjoringstype('Forskrift om oppheving av forskrift om skulereglar, Vestland fylkeskommune')).toBe('oppheving');
    expect(kunngjoringstype('Forskrift om endring i forskrift om kommunale bostøtter, Oslo kommune, Oslo')).toBe('endring');
    expect(kunngjoringstype('Ikrafttredelse av forskrift 10. juni 2026 nr. 1971 om endring i forskrift om kommunale bostøtter')).toBe('endring');
    expect(kunngjoringstype('Forskrift om skoleregler for videregående skoler, Agder fylkeskommune')).toBe('ny');
    // Titler fra Lovtidend 2026 som skriver det på andre måter.
    expect(kunngjoringstype('Forskrift om opphevelse av forskrift om lokale tilleggsreglar for Olsvikåsen videregående skole, Vestland')).toBe('oppheving');
    expect(kunngjoringstype('Forskrift om endringar i forskrift om skulereglar, Vestland fylkeskommune')).toBe('endring');
    expect(kunngjoringstype('Forskrift om endringer av forskrift om inntak, Agder fylkeskommune')).toBe('endring');
  });

  it('finner forskriften en oppheving eller endring gjelder, og når den tar til å gjelde', () => {
    const o = lesMetadata(side('ltii-oppheving'));
    expect(o.endrer).toEqual(['forskrift/2024-06-18-1455']);
    expect(o.iKraft).toBe('2026-10-02');
    expect(o.kunngjort).toBe('2026-10-02T15:00');
    expect(lesMetadata(side('ltii-endring')).endrer).toEqual(['forskrift/2022-05-25-1784']);
  });
});

describe('oppdatering fra Lovtidend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const titler = Object.fromEntries(
    ['skoleregler', 'skoleregler-voksne', 'skoleregler-skole', 'inntak', 'skolerute', 'skyss', 'fagfordeling'].map((t) => [t, { nb: `${t} {sted}`, nn: `${t} {sted}` }]),
  ) as Titler;
  const forrige: Lokale = {
    fullstendig: '2026-09-01',
    lest: '2026-09-28',
    lovtidend: '2026-10-02T09:15',
    opphevinger: {},
    endringer: {},
    forskrifter: [],
    vurdert: [
      {
        refid: 'forskrift/2024-06-18-1455',
        tittel: 'Forskrift om skulereglar, Vestland fylkeskommune',
        gjelderFor: 'Vestland',
        hjemmel: ['lov/2023-06-09-30/§10-7'],
        malform: 'nn',
        iKraft: '2024-08-01',
        iKraftTil: null,
        sistEndret: null,
        vurdert: '2026-09-01',
      },
    ],
  };

  it('leser bare tidspunktene etter forrige gang, og fjerner en opphevet forskrift', async () => {
    const hentet: string[] = [];
    const tom = '<!doctype html><html><body><div class="documentList"></div></body></html>';
    vi.stubGlobal('fetch', async (url: string) => {
      hentet.push(decodeURIComponent(url));
      const u = decodeURIComponent(url);
      const html = u.endsWith('/register/lovtidend?avdeling=LTII')
        ? side('lovtidend-meny')
        : u.includes('kunngjortDato=02.10.2026 kl. 15.00')
          ? side('lovtidend-side')
          : u.includes('kunngjortDato=')
            ? tom
            : u.endsWith('/dokument/LTII/forskrift/2026-09-29-1985')
              ? side('ltii-oppheving')
              : null;
      return html === null ? new Response('', { status: 404 }) : new Response(html, { status: 200 });
    });
    const svar = await oppdaterLokale(forrige, { full: false, fylker: [{ nummer: '46', navn: 'Vestland' }], skoler: [], titler, idag: '2026-10-05', pauseMs: 0 });
    // Tidspunktet 09.15 er lest før. 14.50 og 15.00 er nye. Bare opphevingen av skulereglane hentes, ikke de andre.
    expect(hentet.filter((u) => u.includes('kunngjortDato='))).toHaveLength(2);
    expect(hentet.filter((u) => u.includes('/dokument/'))).toEqual(['https://lovdata.no/dokument/LTII/forskrift/2026-09-29-1985']);
    expect(svar.lokale.lovtidend).toBe('2026-10-02T15:00');
    expect(svar.lokale.vurdert).toEqual([]);
    expect(svar.lokale.opphevinger).toEqual({});
    expect(svar.lokale.fullstendig).toBe('2026-09-01');
    expect(svar.rapport).toContain('Opphevet: Forskrift om skulereglar, Vestland fylkeskommune');
  });

  it('venter med å fjerne en forskrift som oppheves fra en senere dato', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      const u = decodeURIComponent(url);
      const html = u.endsWith('avdeling=LTII') ? side('lovtidend-meny') : u.includes('15.00') ? side('lovtidend-side') : u.includes('/dokument/LTII/') ? side('ltii-oppheving') : '<html></html>';
      return new Response(html, { status: 200 });
    });
    const svar = await oppdaterLokale(forrige, { full: false, fylker: [{ nummer: '46', navn: 'Vestland' }], skoler: [], titler, idag: '2026-10-01', pauseMs: 0 });
    expect(svar.lokale.vurdert).toHaveLength(1);
    expect(svar.lokale.opphevinger).toEqual({ 'forskrift/2024-06-18-1455': '2026-10-02' });
  });

  it('leser en kunngjøring som ikke finnes blant de lokale forskriftene, fra Lovtidend, uten å stoppe', async () => {
    // Tittelen sier ikke at forskriften oppheves, så den ser ny ut. Siden i Lovtidend viser at den er en oppheving.
    const side = (navn: string) => readFileSync(`tests/fixtures/lovdata/${navn}.html`, 'utf8');
    const lovtidend = side('lovtidend-side').replaceAll('Forskrift om oppheving av forskrift om skulereglar, Vestland fylkeskommune', 'Forskrift om skulereglar, Vestland fylkeskommune');
    const hentet: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => {
      const u = decodeURIComponent(url);
      hentet.push(u);
      if (u.includes('/dokument/LF/')) return new Response('', { status: 404 });
      const html = u.endsWith('avdeling=LTII') ? side('lovtidend-meny') : u.includes('15.00') ? lovtidend : u.includes('/dokument/LTII/') ? side('ltii-oppheving') : '<html></html>';
      return new Response(html, { status: 200 });
    });
    const svar = await oppdaterLokale(forrige, { full: false, fylker: [{ nummer: '46', navn: 'Vestland' }], skoler: [], titler, idag: '2026-10-05', pauseMs: 0 });
    expect(hentet).toContain('https://lovdata.no/dokument/LF/forskrift/2026-09-29-1985');
    expect(hentet).toContain('https://lovdata.no/dokument/LTII/forskrift/2026-09-29-1985');
    expect(svar.lokale.vurdert).toEqual([]);
  });
});
