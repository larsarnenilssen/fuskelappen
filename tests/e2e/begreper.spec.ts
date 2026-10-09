// Begrepsbanken: det som er ulikt for privatskoler, står i begrepet når brukeren har valgt «Privatskole», som i kortene
// (avgjørelse 075, eier 09.10.2026).
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('begrepsbanken', () => {
  test('med «Privatskole» viser begrepet merknaden for privatskoler, med kildene nederst', async ({ page }) => {
    await settLagret(page, { privatskole: true });
    await page.goto('./#/begreper/politiattest');
    await expect(page.locator('main h1')).toHaveText('Politiattest');
    const merknad = page.locator('.begrep-kort .privatskolemerknad');
    await expect(merknad).toContainText('For privatskoler');
    await expect(merknad).toContainText('privatskolelova § 4-3');
    // Kildene til merknaden står sammen med begrepets kilder.
    await page.locator('.begrep-kort .kortfot summary').last().click();
    await expect(page.locator('.begrep-kort .kildeliste')).toContainText('§ 4-3');
  });

  test('uten «Privatskole» står ikke merknaden', async ({ page }) => {
    await page.goto('./#/begreper/politiattest');
    await expect(page.locator('main h1')).toHaveText('Politiattest');
    await expect(page.locator('.privatskolemerknad')).toHaveCount(0);
  });
});
