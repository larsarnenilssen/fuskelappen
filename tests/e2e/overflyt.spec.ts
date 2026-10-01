import { expect, test } from '@playwright/test';
import { aapneAlt, erMobil, finnOverflyt, ruter, settLagret, venterPaaSide } from './hjelp.ts';

const bredder = [320, 360, 390, 414, 430];

test.describe('ingen horisontal overflyt i 320–430 px', () => {
  for (const tema of ['lys', 'mork'] as const) {
    for (const rute of ruter) {
      test(`${rute} (${tema})`, async ({ page }, info) => {
        test.skip(!erMobil(info), 'Mobilbredder testes i mobilprosjektene');
        // Fagsøket åpner alle faggruppene i fem bredder. Det tar nær 30 sekunder i CI, så testen får mer tid.
        test.slow(rute === '#/fag', 'Fagsøket åpner mange grupper i fem bredder');
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

test('utfylt arbeidsplan med diagram og årslønn gir ikke overflyt', async ({ page }, info) => {
  test.skip(!erMobil(info), 'Mobilbredder testes i mobilprosjektene');
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./#/arbeidstid/arbeidsplan');
  await venterPaaSide(page);
  await page.getByLabel('Fag', { exact: true }).fill('engelsk stud vg1');
  await page.locator('.fagtreff button').first().click();
  await page.getByLabel('Antall årstimer').fill('420');
  await page.getByLabel('Funksjon 1: Prosent').fill('20');
  await page.getByLabel('Møtetid per uke (timer)').fill('2');
  await page.getByRole('switch', { name: 'Regn ut lønn' }).check();
  await page.getByRole('switch', { name: 'Funksjon 1: Tillegg i lønnen' }).check();
  await expect(page.locator('.fordeling-tabell')).toBeVisible();
  for (const bredde of bredder) {
    await page.setViewportSize({ width: bredde, height: 740 });
    expect(await finnOverflyt(page), `arbeidsplan i ${bredde}px`).toEqual([]);
  }
  // Også når kortene er lagt sammen og overskriftene viser oppsummeringer.
  const apne = page.locator('.kortknapp[aria-expanded="true"]');
  while ((await apne.count()) > 0) await apne.first().click();
  for (const bredde of bredder) {
    await page.setViewportSize({ width: bredde, height: 740 });
    expect(await finnOverflyt(page), `arbeidsplan lagt sammen i ${bredde}px`).toEqual([]);
  }
});
