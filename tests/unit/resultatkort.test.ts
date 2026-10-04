// Kopiteksten fra resultatkortet: resultat, trinn, kilder og forbehold.
import { describe, expect, it } from 'vitest';
import { lagKopitekst } from '../../src/components/Resultatkort.tsx';
import type { T } from '../../src/app/tilstand.ts';
import { hentTekst } from '../../src/core/i18n/tekst.ts';

const t: T = (nokkel, verdier) => hentTekst('nb', nokkel, verdier);

describe('kopitekst', () => {
  it('har resultat, trinn med tall, kilder og dato', () => {
    const tekst = lagKopitekst(
      t,
      {
        tittel: 'Beskjeftigelse',
        verdi: '26,67',
        enhet: '%',
        sammendrag: '140 ÷ 525 × 100 = 26,67 %',
        steg: [{ tekst: 'Beskjeftigelse', formel: 'årstimer ÷ årsramme × 100', innsatt: '140 ÷ 525 × 100', verdi: '26,67 %' }],
        kilder: [{ kilde: { id: 'ks-sfs2213-avtaletekst', punkt: 'Vedlegg 1' }, niva: 'nasjonal', rad: 'Engelsk – Stud.spes Vg1' }],
      },
      '29. september 2026',
    );
    expect(tekst.split('\n')[0]).toBe('Beskjeftigelse: 26,67 %');
    expect(tekst).toContain('1. Beskjeftigelse: 140 ÷ 525 × 100 = 26,67 %');
    expect(tekst).toContain('   årstimer ÷ årsramme × 100');
    expect(tekst).toMatch(/- SFS 2213.*, Vedlegg 1 \(Engelsk – Stud\.spes Vg1\): https:\/\//);
    expect(tekst).not.toContain('kontrollert');
    expect(tekst).toContain('Regnet ut med Jukselappen 29. september 2026.\nJukselappen er utviklet privat, og opplysningene kan være uriktige.');
  });
});
