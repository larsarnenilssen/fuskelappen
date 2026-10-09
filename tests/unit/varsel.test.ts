// Varslene til eier (avgjørelse 085): når en sak gir e-post, teksten når en arbeidsflyt feiler, og saken om
// nyhetskilder som ikke kan hentes.
import { describe, expect, it } from 'vitest';
import type { Nyheter } from '../../src/modules/nyheter/skjema.ts';
import { nyhetsvarsel } from '../../scripts/nyheter/status.ts';
import { arbeidsflytmerke, feiltekst, loggutdrag } from '../../scripts/varsel/feil.ts';
import { FORMATRAD, feiltype } from '../../scripts/varsel/feiltype.ts';
import { lesMerke, planleggVarsel, punktnokkel, type Varsel } from '../../scripts/varsel/plan.ts';

const varsel = (tekst: string | null, idag: string): Varsel => ({
  tittel: 'Sak',
  tekst,
  idag,
  paminnelseDager: 7,
  lukk: (siden) => `Løst. Laget ${siden}.`,
});

/** Teksten i saken etter en handling, som om GitHub hadde lagret den. */
const lagret = (h: ReturnType<typeof planleggVarsel>[number] | undefined) => (h && 'tekst' in h ? h.tekst : '');

describe('når en sak gir e-post', () => {
  it('lager saken når noe er galt, og gjør ingenting når alt virker', () => {
    expect(planleggVarsel(varsel(null, '2026-10-07'), null)).toEqual([]);
    const [h] = planleggVarsel(varsel('Feil:\n\n- A feilet', '2026-10-07'), null);
    expect(h).toMatchObject({ type: 'opprett', tittel: 'Sak' });
    expect(lesMerke(lagret(h))).toEqual({ siden: '2026-10-07', varslet: '2026-10-07', punkter: new Set([punktnokkel('- A feilet')]) });
  });

  it('gir e-post med de nye punktene og hele listen når noe nytt kommer til', () => {
    const sak = { nummer: 3, tekst: lagret(planleggVarsel(varsel('- A feilet', '2026-10-01'), null)[0]) };
    const [h] = planleggVarsel(varsel('- A feilet\n- B feilet', '2026-10-02'), sak);
    expect(h).toMatchObject({ type: 'oppdater', nummer: 3 });
    const kommentar = h && 'kommentar' in h ? (h.kommentar ?? '') : '';
    expect(kommentar).toMatch(/^\*\*Nytt siden sist \(02\.10\.2026\):\*\*\n\n- B feilet\n/);
    expect(kommentar).toContain('**Alt som står åpent nå** (saken ble laget 01.10.2026):\n\n- A feilet\n- B feilet');
    expect(lesMerke(lagret(h))?.varslet).toBe('2026-10-02');
  });

  it('teller ikke datoer, «N ganger på rad» og avkrysning som noe nytt, men andre tall', () => {
    const sak = { nummer: 3, tekst: lagret(planleggVarsel(varsel('- [ ] Lenken x (2 ganger på rad), 05.10.2026\n- Ny fagkode HEA2005', '2026-10-05'), null)[0]) };
    expect(planleggVarsel(varsel('- [x] Lenken x (3 ganger på rad), 12.10.2026\n- Ny fagkode HEA2005', '2026-10-06'), sak)[0]).toMatchObject({ type: 'oppdater', kommentar: null });
    expect(planleggVarsel(varsel('- [x] Lenken x (3 ganger på rad), 12.10.2026\n- Ny fagkode HEA2006', '2026-10-06'), sak)[0]).toMatchObject({ kommentar: expect.stringContaining('- Ny fagkode HEA2006') });
  });

  it('minner om det som står åpent, med hele listen, når ingenting nytt har kommet til på en stund', () => {
    const sak = { nummer: 3, tekst: lagret(planleggVarsel(varsel('- A feilet', '2026-10-01'), null)[0]) };
    expect(planleggVarsel(varsel('- A feilet', '2026-10-07'), sak)[0]).toMatchObject({ kommentar: null });
    const [h] = planleggVarsel(varsel('- A feilet', '2026-10-08'), sak);
    expect(h).toMatchObject({ kommentar: expect.stringContaining('**Påminnelse:** Dette har stått åpent siden 01.10.2026') });
    expect(h && 'kommentar' in h ? h.kommentar : '').toContain('- A feilet');
    // Neste påminnelse regnes fra denne.
    expect(planleggVarsel(varsel('- A feilet', '2026-10-14'), { nummer: 3, tekst: lagret(h) })[0]).toMatchObject({ kommentar: null });
  });

  it('lukker saken med en kommentar når alt virker igjen, og husker når den ble laget', () => {
    const sak = { nummer: 3, tekst: lagret(planleggVarsel(varsel('- A feilet', '2026-10-01'), null)[0]) };
    expect(planleggVarsel(varsel(null, '2026-10-03'), sak)).toEqual([{ type: 'lukk', nummer: 3, kommentar: 'Løst. Laget 2026-10-01.' }]);
  });

  it('behandler en sak uten merke som om alt er nytt', () => {
    expect(planleggVarsel(varsel('- A feilet', '2026-10-01'), { nummer: 3, tekst: 'Gammel tekst' })[0]).toMatchObject({ kommentar: expect.stringContaining('Nytt siden sist') });
  });
});

describe('feil i automatikken', () => {
  it('forklarer hva arbeidsflyten gjør, hva feilen betyr, hvor den feilet og hva eier gjør', () => {
    const tekst = feiltekst(
      'Nyheter',
      { nummer: '42', url: 'https://github.com/r/actions/runs/1', dato: '2026-10-07' },
      [
        { navn: 'Hent nyhetene', steg: [{ navn: 'Hent nyhetene', fortsatte: false }], url: 'https://github.com/r/job/1', utdrag: 'Error: 503' },
        { navn: 'Sjekk kilder', steg: [{ navn: 'Sjekk lenkene', fortsatte: true }], url: 'https://github.com/r/job/2', utdrag: null },
      ],
      'https://github.com/r/actions',
    );
    expect(tekst).toContain('Arbeidsflyten **Nyheter** henter nyhetene hver time');
    expect(tekst).toContain('Den feilet sist 07.10.2026 ([kjøring 42](https://github.com/r/actions/runs/1)).');
    expect(tekst).toContain('**Hva det betyr:** Appen viser nyhetene fra forrige gang hentingen gikk bra.');
    expect(tekst).toContain('- Jobben «Hent nyhetene», steget «Hent nyhetene»\n');
    expect(tekst).toContain('- Jobben «Sjekk kilder», steget «Sjekk lenkene». Resten av kjøringen gikk videre.');
    expect(tekst).toContain('```text\nError: 503\n```');
    expect(tekst).toContain('**Hva du gjør:**');
    expect(tekst).toContain(arbeidsflytmerke('Nyheter'));
  });

  it('tar med linjene før den første feilen i loggen, uten tidsstempler og grupper', () => {
    const logg = ['2026-10-07T04:47:01.1234567Z ##[group]Run npm run hent:nyheter', '2026-10-07T04:47:02.0000000Z Henter udir', '2026-10-07T04:47:03.0000000Z ##[endgroup]', '2026-10-07T04:47:04.0000000Z ##[error]Process completed with exit code 1.', '2026-10-07T04:47:05.0000000Z etter'].join('\n');
    expect(loggutdrag(logg)).toBe('Henter udir\n##[error]Process completed with exit code 1.\netter');
    expect(loggutdrag('ingen feil her')).toBeNull();
  });

  it('ber eier sende saken til Claude når loggen fra en henting ligner en programfeil (avgjørelse 099)', () => {
    const kjoring = { nummer: '7', url: 'https://github.com/r/actions/runs/7', dato: '2026-10-08' };
    const jobb = (utdrag: string) => [{ navn: 'Sjekk kilder', steg: [{ navn: 'Hent Grep', fortsatte: true }], url: 'https://github.com/r/job/7', utdrag }];
    const format = feiltekst('Kildesjekk', kjoring, jobb("TypeError: Cannot read properties of undefined (reading 'length')\n##[error]Process completed with exit code 1."), 'https://github.com/r/actions');
    expect(format).toContain(`**Hva du gjør:** ${FORMATRAD}`);
    expect(format).not.toContain('Mange feil går over av seg selv');
    const nett = feiltekst('Kildesjekk', kjoring, jobb('TypeError: fetch failed (ECONNRESET: read ECONNRESET)\n##[error]Process completed with exit code 1.'), 'https://github.com/r/actions');
    expect(nett).toContain('Mange feil går over av seg selv');
    // CI henter ingen kilder, så en TypeError der er en feil i koden, ikke i en kilde.
    expect(feiltekst('CI', kjoring, jobb('TypeError: x is not a function'), 'https://github.com/r/actions')).toContain('Mange feil går over av seg selv');
  });
});

describe('nettfeil og formatendring (avgjørelse 099)', () => {
  it('skiller programfeil og uventet format fra nett, tidsavbrudd og feil hos serveren', () => {
    expect(feiltype("Nøkkeltallene: Cannot read properties of undefined (reading 'length'). Appen viser forrige henting.")).toBe('format');
    expect(feiltype('Fant ikke innholdet (selektor «main»). Siden kan ha fått ny struktur.')).toBe('format');
    expect(feiltype('Tallene fra statistikkbanken ser ikke ut som ventet: mangler landet. Beholder forrige fil.')).toBe('format');
    expect(feiltype('Nyhetene passer ikke skjemaet: invalid_type')).toBe('format');
    expect(feiltype('https://www.udir.no/x svarte 404 Not Found')).toBe('format');
    expect(feiltype('fetch failed (ECONNRESET: read ECONNRESET)')).toBe('nett');
    expect(feiltype('TypeError: fetch failed')).toBe('nett');
    expect(feiltype('The operation was aborted due to timeout')).toBe('nett');
    expect(feiltype('https://www.udir.no/x svarte 503 Service Unavailable')).toBe('nett');
    expect(feiltype('Tidsavbrudd')).toBe('nett');
    expect(feiltype('https://www.ks.no/x svarte 403 Forbidden')).toBe('ukjent');
    expect(feiltype('Hentingen av lov- og forskriftstekst kjørte ikke. Se loggen.')).toBe('ukjent');
  });
});

describe('saken om nyhetskilder', () => {
  const nyheter = (kilder: Nyheter['kilder']): Nyheter => ({ skjema: 1, hentet: '2026-10-07T04:47:00Z', kilder, saker: [] });
  const kilder = [
    { id: 'udir', navn: { nb: 'Utdanningsdirektoratet' }, url: 'https://www.udir.no/' },
    { id: 'nifu', navn: { nb: 'NIFU' }, url: 'https://www.nifu.no/' },
  ];

  it('tar med kilder som har feilet eller vært tomme i mer enn to dager, med forklaring', () => {
    const tekst = nyhetsvarsel(nyheter({ udir: { status: 'feilet', feilSiden: '2026-10-03', melding: 'Svarte 503' }, nifu: { status: 'tom', feilSiden: '2026-10-04' } }), kilder, '2026-10-07T04:47:00Z');
    expect(tekst).toContain('- **Utdanningsdirektoratet** (`udir`) har ikke kunnet hentes siden 03.10.2026 (Svarte 503). [Kilden](https://www.udir.no/)');
    expect(tekst).toContain('- **NIFU** (`nifu`) har ikke gitt noen saker siden 04.10.2026.');
    expect(tekst).toContain('**Hva du gjør:**');
  });

  it('venter to dager før en kilde kommer med, og gir null når alle virker', () => {
    expect(nyhetsvarsel(nyheter({ udir: { status: 'feilet', feilSiden: '2026-10-06' }, nifu: { status: 'ok' } }), kilder, '2026-10-07T04:47:00Z')).toBeNull();
  });
});
