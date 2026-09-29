import { expect, test } from '@playwright/test';
import { aapneAlt, erMobil, finnOverflyt, ruter, settLagret, venterPaaSide } from './hjelp.ts';

const bredder = [320, 360, 390, 414, 430];

test.describe('ingen horisontal overflyt i 320–430 px', () => {
  for (const tema of ['lys', 'mork'] as const) {
    for (const rute of ruter) {
      test(`${rute} (${tema})`, async ({ page }, info) => {
        test.skip(!erMobil(info), 'Mobilbredder testes i mobilprosjektene');
        await settLagret(page, { tema, fylke: '46', favoritter: ['testmodul:funksjon', 'begreper:testbegrep-skolemiljo'] });
        for (const bredde of bredder) {
          await page.setViewportSize({ width: bredde, height: 740 });
          await page.goto(`./${rute}`);
          await venterPaaSide(page);
          // Åpne alt som kan åpnes, så også skjult innhold sjekkes.
          await aapneAlt(page);
          expect(await finnOverflyt(page), `${rute} i ${bredde}px`).toEqual([]);
        }
      });
    }
  }

  test('nynorsk og lange tekster gir heller ikke overflyt', async ({ page }, info) => {
    test.skip(!erMobil(info), 'Mobilbredder testes i mobilprosjektene');
    await settLagret(page, { malform: 'nn', fylke: '46', skole: { id: null, navn: 'Ein svært lang skulenamn som ikkje skal skape horisontal rulling' } });
    await page.setViewportSize({ width: 320, height: 740 });
    for (const rute of ['#/', '#/innstillinger', '#/om/kilder']) {
      await page.goto(`./${rute}`);
      await venterPaaSide(page);
      expect(await finnOverflyt(page), rute).toEqual([]);
    }
  });
});
