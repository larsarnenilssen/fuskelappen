import { expect, test } from '@playwright/test';

test.describe('komponenter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/utvikling/komponenter');
  });

  test('forklaringen er skjult til den åpnes', async ({ page }) => {
    const knapp = page.getByRole('button', { name: /Hva er en årsramme\?/ });
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('Eksempeltekst som er skjult')).toBeHidden();
    await knapp.click();
    await expect(knapp).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText('Eksempeltekst som er skjult')).toBeVisible();
    await knapp.press('Enter');
    await expect(page.getByText('Eksempeltekst som er skjult')).toBeHidden();
  });

  test('tallfeltet godtar desimalkomma og viser feil', async ({ page }) => {
    const felt = page.getByLabel('Timer per uke');
    await felt.fill('12,5');
    await expect(page.locator('.resultatkort-verdi')).toContainText('31,3');
    await felt.fill('abc');
    await expect(felt).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert')).toHaveText('Skriv inn et tall, for eksempel 12,5.');
    await felt.fill('50');
    await expect(page.getByRole('alert')).toHaveText('Tallet kan ikke være større enn 40.');
    await felt.fill('4');
    await expect(felt).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('resultatkortet viser utregning ved behov, med nivå og uten kontrollmerke', async ({ page }) => {
    const kort = page.locator('.resultatkort');
    await expect(kort.getByText('Lokal verdi (fylke)').first()).toBeVisible();
    const knapp = kort.getByRole('button', { name: 'Vis utregning' });
    await expect(kort.locator('.utregning')).toBeHidden();
    await knapp.click();
    await expect(kort.locator('.utregning')).toBeVisible();
    await expect(kort.getByRole('button', { name: 'Skjul utregning' })).toHaveAttribute('aria-expanded', 'true');
  });
});
