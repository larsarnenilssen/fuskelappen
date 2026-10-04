import { expect, test } from '@playwright/test';

test.describe('fylke og skole', () => {
  test('kan velges, endres og fjernes, og huskes', async ({ page }) => {
    await page.goto('./#/innstillinger');
    const fylke = page.getByLabel('Fylke', { exact: true });
    const skole = page.getByLabel('Skole', { exact: true });
    await expect(skole).toBeDisabled();
    await expect(page.getByText('Uten valgt fylke vises bare nasjonalt innhold.')).toBeVisible();

    await fylke.selectOption({ label: 'Vestland' });
    await expect(skole).toBeEnabled();
    const valg = await skole.locator('option').allTextContents();
    expect(valg.length).toBeGreaterThan(20);
    const forsteSkole = valg[1] ?? '';
    await skole.selectOption({ label: forsteSkole });

    await page.reload();
    await expect(page.getByLabel('Fylke', { exact: true })).toHaveValue('46');
    await expect(page.getByLabel('Skole', { exact: true }).locator('option:checked')).toHaveText(forsteSkole);

    await page.locator('.topplinje .appnavn').click();
    await expect(page.getByText(`Viser også innhold for ${forsteSkole}, Vestland.`)).toBeVisible();

    await page.getByRole('navigation', { name: 'Hovedmeny' }).getByRole('link', { name: 'Innstillinger' }).click();
    await page.getByLabel('Fylke', { exact: true }).selectOption({ label: 'Rogaland' });
    await expect(page.getByLabel('Skole', { exact: true })).toHaveValue('');

    await page.getByRole('button', { name: 'Fjern fylke og skole' }).click();
    await expect(page.getByLabel('Fylke', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('Skole', { exact: true })).toBeDisabled();
  });

  test('uten valgt fylke viser forsiden merknad om nasjonalt innhold', async ({ page }) => {
    await page.goto('./');
    // Én kort linje (avgjørelse 056).
    await expect(page.getByText('Nasjonalt innhold', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: 'Velg fylke og skole' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillinger' })).toBeVisible();
  });

  test('bruker fritekst når skolelisten ikke kan hentes', async ({ page }) => {
    await page.route('**/data/skoler/vgs.json', (r) => r.fulfill({ status: 404, body: '' }));
    await page.goto('./#/innstillinger');
    await page.getByLabel('Fylke', { exact: true }).selectOption({ label: 'Vestland' });
    const felt = page.getByLabel('Skole', { exact: true });
    await felt.fill('Testskulen');
    await felt.blur();
    await page.reload();
    await expect(page.getByLabel('Skole', { exact: true })).toHaveValue('Testskulen');
  });

  test('lokale data kan eksporteres, slettes og importeres', async ({ page }, info) => {
    test.skip(info.project.name.startsWith('webkit'), 'Nedlasting testes i Chromium');
    await page.goto('./#/innstillinger');
    await page.getByRole('radio', { name: 'Nynorsk' }).check();
    const nedlasting = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Last ned kopi' }).click();
    const fil = await (await nedlasting).path();

    page.on('dialog', (d) => void d.accept());
    await page.getByRole('button', { name: 'Slett alle lokale data' }).click();
    await expect(page.getByRole('radio', { name: 'Nynorsk' })).toBeChecked();

    await page.getByRole('radio', { name: 'Bokmål' }).check();
    await page.locator('input[type="file"]').setInputFiles(fil);
    await expect(page.getByRole('heading', { level: 1, name: 'Innstillingar' })).toBeVisible();
  });
});
