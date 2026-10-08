// Lokale regler (fase 9, avgjørelse 093): de godkjente reglene i lokale/regler.yaml, og vedlikeholdet (forslag L7).
// Nye regelverdier og moduler må ta stilling til om de kan variere lokalt.
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesRegelsett } from '../../scripts/innhold/alt.ts';
import { lesLokaleRegler, lokaleNokler, TESTFIL } from '../../scripts/lokale/les.ts';
import { TEMA, TEMA_FOR_REGELVERK } from '../../src/core/lokale/skjema.ts';
import { alleModuler } from '../../src/modules/register.ts';
import { nb } from '../../src/strings/nb.ts';
import { nn } from '../../src/strings/nn.ts';

const rot = join(__dirname, '../..');
const nasjonale = lesRegelsett(rot).filter((r) => r.gyldighet.niva === 'nasjonal');

describe('godkjente lokale regler', () => {
  it('lokale/regler.yaml passer skjemaet og reglene for innholdet', () => {
    expect(() => lesLokaleRegler(rot)).not.toThrow();
  });

  it('reglene til ende-til-ende-testene passer også', () => {
    expect(lesLokaleRegler(rot, TESTFIL).length).toBeGreaterThan(0);
  });
});

describe('vedlikehold: hva som kan variere lokalt', () => {
  it('hver nasjonal regelverdi har lokal: true eller false', () => {
    const mangler = nasjonale.flatMap((r) => Object.entries(r.verdier).flatMap(([navn, v]) => (typeof v.lokal === 'boolean' ? [] : [`${r.regelverk}.${navn}`])));
    expect(mangler).toEqual([]);
  });

  it('verdier som kan være lokale, er tall, har et tema og navn på bokmål og nynorsk', () => {
    const nokler = [...lokaleNokler(rot)];
    expect(nokler.length).toBeGreaterThan(0);
    for (const nokkel of nokler) {
      const [regelverk = '', navn = ''] = nokkel.split('.');
      const v = nasjonale.find((r) => r.regelverk === regelverk && navn in r.verdier)?.verdier[navn];
      expect(typeof v?.verdi, nokkel).toBe('number');
      expect(TEMA_FOR_REGELVERK[regelverk], nokkel).toBeDefined();
      expect((nb.lokaleRegler.verdier as Record<string, string>)[navn], nokkel).toBeTruthy();
      expect((nn.lokaleRegler.verdier as Record<string, string>)[navn], nokkel).toBeTruthy();
    }
  });

  it('hvert tema har én modul med en side for de lokale reglene', () => {
    for (const tema of TEMA) {
      expect(
        alleModuler.filter((m) => m.lokaleRegler.includes(tema)).map((m) => m.id),
        tema,
      ).toHaveLength(1);
    }
  });
});
