import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { aapneAlt, ruter, settLagret, venterPaaSide } from './hjelp.ts';

test.describe('tilgjengelighet (axe)', () => {
  for (const tema of ['lys', 'mork'] as const) {
    for (const rute of ruter) {
      // axe kjøres i mobilprosjektene i begge motorer (@mobil), i lys og mørk visning, fordi kontrasten avhenger av temaet.
      test(`${rute} (${tema})`, { tag: '@mobil' }, async ({ page }) => {
        await settLagret(page, { tema, favoritter: ['testmodul:funksjon'] });
        await page.goto(`./${rute}`);
        await venterPaaSide(page);
        await aapneAlt(page);
        const resultat = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const alvorlige = resultat.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
        expect(alvorlige).toEqual([]);
      });
    }
  }

  test('tastaturnavigasjon: hopp til innhold og synlig fokus', async ({ page }, info) => {
    test.skip(info.project.name.startsWith('webkit'), 'Tab i WebKit hopper over lenker som standard');
    await page.goto('./');
    await page.keyboard.press('Tab');
    const hopp = page.getByRole('link', { name: 'Hopp til innhold' });
    await expect(hopp).toBeFocused();
    await expect(hopp).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
});
