import { describe, expect, it } from 'vitest';
import { epostlenke, forrigeSide, merkSide } from '../../src/app/tilbakemelding.ts';

describe('tilbakemelding', () => {
  it('lager en mailto-lenke med kodet emne og tekst', () => {
    const lenke = epostlenke('post@eksempel.no', 'Jukselappen 1.0: tilbakemelding', ['Hei & takk', '', 'Side: https://x.no/#/fylker/46?a=1']);
    expect(lenke.startsWith('mailto:post@eksempel.no?subject=')).toBe(true);
    const url = new URL(lenke);
    expect(url.searchParams.get('subject')).toBe('Jukselappen 1.0: tilbakemelding');
    expect(url.searchParams.get('body')).toBe('Hei & takk\r\n\r\nSide: https://x.no/#/fylker/46?a=1');
    expect(lenke).not.toContain('+');
  });

  it('husker siden før Innstillinger og Om appen', () => {
    merkSide('/fylker/46', '#/fylker/46');
    merkSide('/innstillinger', '#/innstillinger');
    merkSide('/om', '#/om');
    expect(forrigeSide()).toBe('#/fylker/46');
  });
});
