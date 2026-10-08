// Meldingen om ny versjon (avgjørelse 088). Service workeren kan ikke lage en ny versjon i testene, så meldingen vises
// med `?vis=nyversjon`, som bare virker i utvikling, i testene og i testversjonen. Punktene kommer fra versjon.json.
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';
import { settLagret } from './hjelp.ts';

const pakke = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };
const { versjoner } = parse(readFileSync(new URL('../../content/versjoner.yaml', import.meta.url), 'utf8')) as {
  versjoner: { versjon: string; nytt: { nb: string; nn: string }[] }[];
};
const nytt = versjoner.find((v) => v.versjon === pakke.version)?.nytt ?? [];

test.describe('ny versjon', () => {
  test('viser det som er nytt, over resten av appen, og lukkes med «Senere» eller Esc', async ({ page }) => {
    await settLagret(page, {});
    await page.goto('./#/?vis=nyversjon');
    const dialog = page.getByRole('dialog', { name: `Nytt i versjon ${pakke.version}` });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('listitem')).toHaveText(nytt.map((p) => p.nb));
    await expect(dialog).toBeFocused();
    await expect(dialog.getByRole('button', { name: 'Oppdater nå' })).toBeVisible();
    // Resten av appen kan ikke nås mens meldingen er åpen.
    await expect(page.locator('#innhold')).toHaveJSProperty('inert', true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('#innhold')).toHaveJSProperty('inert', false);

    await page.reload();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Senere' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('på nynorsk', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/?vis=nyversjon');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('listitem')).toHaveText(nytt.map((p) => p.nn));
    await expect(dialog.getByRole('button', { name: 'Seinare' })).toBeVisible();
  });

  test('ingen horisontal overflyt på 320 px', { tag: '@mobil' }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await settLagret(page, { tema: 'lys' });
    await page.goto('./#/?vis=nyversjon');
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });

  for (const tema of ['lys', 'mork'] as const) {
    test(`ingen alvorlige axe-funn (${tema})`, { tag: '@mobil' }, async ({ page }) => {
      await settLagret(page, { tema });
      await page.goto('./#/?vis=nyversjon');
      await expect(page.getByRole('dialog')).toBeVisible();
      const resultat = await new AxeBuilder({ page }).include('.overlegg').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const alvorlige = resultat.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help}`);
      expect(alvorlige).toEqual([]);
    });
  }
});
