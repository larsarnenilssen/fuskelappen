// Forslaget til ny presentasjon av kalenderen, nyhetene, tallene og dagens jukselapp på forsiden (09.10.2026,
// src/app/forslag/). Forslaget vises bare med `?forslag=1|2|3`. Uten står dagens forside.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { erMobil, finnOverflyt, settLagret, venterPaaSide } from './hjelp.ts';

const FAVORITTER = ['testmodul:funksjon', 'begreper:testbegrep-skolemiljo'];
const aktuelt = (page: Page) => page.locator('[data-aktuelt]');

async function apne(page: Page, forslag: number): Promise<void> {
  await page.goto(`./#/?forslag=${forslag}`);
  await venterPaaSide(page);
  await expect(aktuelt(page)).toHaveCount(1);
}

test.describe('forslaget til ny forside', () => {
  test('uten parameter står dagens forside, uten Aktuelt og uten linjen om forslaget', async ({ page }) => {
    await page.goto('./');
    await venterPaaSide(page);
    await expect(page.locator('[data-gruppe="panel"]')).toHaveCount(1);
    await expect(aktuelt(page)).toHaveCount(0);
    await expect(page.getByTestId('forslagslinje')).toHaveCount(0);
  });

  test('forslaget huskes i økten, og forslag=0 går tilbake til dagens forside', async ({ page }) => {
    await apne(page, 2);
    await page.goto('./#/om');
    await venterPaaSide(page);
    await page.goto('./#/');
    await venterPaaSide(page);
    await expect(aktuelt(page)).toHaveCount(1);
    await expect(page.getByTestId('forslagslinje').getByRole('link', { name: 'dagens forside' })).toHaveAttribute('href', '#/?forslag=0');
    await page.goto('./#/?forslag=0');
    await venterPaaSide(page);
    await expect(aktuelt(page)).toHaveCount(0);
    await expect(page.locator('[data-gruppe="panel"]')).toHaveCount(1);
  });

  for (const forslag of [1, 2] as const) {
    test(`forslag ${forslag}: Aktuelt kan åpnes, legges sammen og skjules, og hentes tilbake under «Tilpass»`, async ({ page }, info) => {
      await settLagret(page, { favoritter: FAVORITTER });
      await apne(page, forslag);
      const panel = aktuelt(page);
      // Sammenlagt fra start, unntatt sidekolonnen i forslag 1 på stor skjerm.
      const apenFraStart = forslag === 1 && !erMobil(info);
      const veksle = panel.locator('button[aria-expanded]:not(.ff-menyknapp):not(.ff-segment)').first();
      await expect(veksle).toHaveAttribute('aria-expanded', String(apenFraStart));
      if (!apenFraStart) await veksle.click();
      await expect(panel.locator('.panel-boks').first()).toBeVisible();
      await page.reload();
      await venterPaaSide(page);
      await expect(panel.locator('.panel-boks').first()).toBeVisible();

      // Menyen: dagens jukselapp slås på her, og Aktuelt skjules.
      await panel.getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
      await panel.getByRole('checkbox', { name: 'Dagens jukselapp' }).check();
      await panel.getByRole('button', { name: 'Skjul Aktuelt' }).click();
      await expect(aktuelt(page)).toHaveCount(0);
      // Favorittene står som før.
      await expect(page.locator('.favorittliste a').first()).toBeVisible();
      await page.reload();
      await venterPaaSide(page);
      await expect(aktuelt(page)).toHaveCount(0);

      await page.getByRole('button', { name: 'Tilpass', exact: true }).click();
      await expect(page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' })).toHaveCount(0);
      await page.getByRole('switch', { name: 'Vis Aktuelt på forsiden' }).check();
      await page.getByRole('button', { name: 'Ferdig' }).click();
      await expect(aktuelt(page)).toHaveCount(1);
    });
  }

  test('forslag 1 på skrivebord: sidekolonnen står uten bryteren, med favorittene', async ({ page }, info) => {
    test.skip(erMobil(info), 'Sidekolonnen er bare på skrivebord');
    await settLagret(page, { favoritter: FAVORITTER });
    await apne(page, 1);
    const kolonne = page.locator('.forside-sidekolonne');
    await expect(kolonne.locator('[data-aktuelt]')).toHaveCount(1);
    await expect(kolonne.locator('[data-gruppe="favoritter"]')).toHaveCount(1);
    await expect(page.getByRole('switch', { name: 'Sidekolonne' })).toHaveCount(0);
  });

  test('forslag 2 på skrivebord: ingen sidekolonne, og visningene side om side når båndet er åpnet', async ({ page }, info) => {
    test.skip(erMobil(info), 'Båndet har faner på mobil');
    await apne(page, 2);
    await expect(page.locator('.forside-sidekolonne')).toHaveCount(0);
    await expect(page.locator('.ff-segment')).toHaveCount(3);
    await page.locator('.ff-segment').first().click();
    await expect(page.locator('.ff-kort')).toHaveCount(3);
  });

  test('forslag 3: en knapp åpner visningen i et overlegg, og Esc lukker det', async ({ page }) => {
    await apne(page, 3);
    await page.locator('.ff-chip').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.panel-boks')).toBeVisible();
    await dialog.getByRole('button', { name: 'Nyheter' }).click();
    await expect(dialog.getByRole('button', { name: 'Nyheter' })).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('ingen overflyt i 320–430 px, sammenlagt og åpnet', { tag: '@mobil' }, async ({ page }) => {
    await settLagret(page, { tema: 'lys', fylke: '46', favoritter: FAVORITTER, forside: { rekkefolge: [], lukket: [], bareFavoritter: false, apnet: ['panel'] } });
    for (const forslag of [1, 2, 3]) {
      for (const bredde of [320, 390, 430]) {
        await page.setViewportSize({ width: bredde, height: 740 });
        await apne(page, forslag);
        await aktuelt(page).locator('.ff-menyknapp').first().click();
        expect(await finnOverflyt(page), `forslag ${forslag} i ${bredde}px`).toEqual([]);
      }
    }
  });

  for (const tema of ['lys', 'mork'] as const) {
    for (const forslag of [1, 2, 3]) {
      test(`axe i forslag ${forslag} (${tema})`, { tag: '@mobil' }, async ({ page }) => {
        // axe på hele forsiden med favorittene og Aktuelt åpnet tar lang tid i WebKit.
        test.slow();
        await settLagret(page, { tema, favoritter: FAVORITTER, forside: { rekkefolge: [], lukket: [], bareFavoritter: false, apnet: ['panel'] } });
        await apne(page, forslag);
        await aktuelt(page).locator('.ff-menyknapp').first().click();
        if (forslag === 3) await page.locator('.ff-chip').first().click();
        const resultat = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const alvorlige = resultat.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
        expect(alvorlige).toEqual([]);
      });
    }
  }
});
