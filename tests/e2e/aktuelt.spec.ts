// Aktuelt øverst på forsiden (avgjørelse 102): kalenderen, nyhetene, tallene og dagens jukselapp i én gruppe som lukkes
// og åpnes som de andre, med menyen for hva som står der. Øverst i sidekolonnen på skrivebord, åpent fra start, og i en
// farget ramme på mobil, lukket fra start. «Tilpass» henter det tilbake når det er skjult.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { erMobil, finnOverflyt, settLagret, venterPaaSide } from './hjelp.ts';

const FAVORITTER = ['testmodul:funksjon', 'begreper:testbegrep-skolemiljo'];
const aktuelt = (page: Page) => page.locator('[data-gruppe="panel"]');
const pil = (page: Page) => aktuelt(page).locator('.gruppeknapp');
const forside = (f: Record<string, unknown> = {}) => ({ rekkefolge: [], lukket: [], bareFavoritter: false, ...f });

async function apne(page: Page): Promise<void> {
  await page.goto('./');
  await venterPaaSide(page);
  await expect(aktuelt(page)).toHaveCount(1);
}

test.describe('Aktuelt på forsiden', () => {
  test('skrivebord: øverst i sidekolonnen, åpent fra start, uten bryter, og lukkes med pilen', async ({ page }, info) => {
    test.skip(erMobil(info), 'Sidekolonnen er bare på skrivebord.');
    await settLagret(page, { favoritter: FAVORITTER });
    await page.setViewportSize({ width: 1280, height: 800 });
    await apne(page);
    const kolonne = page.locator('.forside-sidekolonne');
    await expect(kolonne.locator('.forsidegruppe').first()).toHaveAttribute('data-gruppe', 'panel');
    await expect(kolonne.locator('[data-gruppe="favoritter"]')).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Sidekolonne' })).toHaveCount(0);
    await expect(aktuelt(page).locator('.gruppe-tittel')).toHaveText('Aktuelt');
    await expect(pil(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(aktuelt(page).getByRole('button', { name: 'Kalender', exact: true })).toHaveAttribute('aria-pressed', 'true');
    // Lukket: én linje med visningen og den neste datoen, og menyen står fortsatt.
    await pil(page).click();
    await expect(pil(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(aktuelt(page).locator('.gruppe-sammendrag')).toContainText('Kalender · ');
    await expect(aktuelt(page).getByRole('button', { name: 'Velg hva som står i Aktuelt' })).toBeVisible();
    await page.reload();
    await expect(pil(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(kolonne.locator('[data-gruppe="favoritter"]')).toBeVisible();
  });

  test('mobil: lukket fra start med én linje, og åpnet huskes', async ({ page }, info) => {
    test.skip(!erMobil(info), 'Lukket fra start bare på mobil.');
    await apne(page);
    await expect(pil(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(aktuelt(page).locator('.gruppe-sammendrag')).toContainText('Kalender · ');
    await expect(aktuelt(page).locator('.aktuelt-faner')).toBeHidden();
    await pil(page).click();
    await expect(aktuelt(page).locator('.kal-panel')).toBeVisible();
    await page.reload();
    await expect(pil(page)).toHaveAttribute('aria-expanded', 'true');
  });

  test('menyen velger visningene og dagens jukselapp, og skjuler Aktuelt, som «Tilpass» henter tilbake', async ({ page }) => {
    await settLagret(page, { favoritter: FAVORITTER, forside: forside({ apnet: ['panel'] }) });
    await apne(page);
    const meny = aktuelt(page).getByRole('button', { name: 'Velg hva som står i Aktuelt' });
    await meny.click();
    await expect(meny).toHaveAttribute('aria-expanded', 'true');
    await aktuelt(page).getByRole('checkbox', { name: 'Dagens jukselapp' }).check();
    await aktuelt(page).getByRole('checkbox', { name: 'Nyheter' }).uncheck();
    await expect(aktuelt(page).getByRole('button', { name: 'Jukselapp', exact: true })).toBeVisible();
    await expect(aktuelt(page).getByRole('button', { name: 'Nyheter', exact: true })).toHaveCount(0);
    // Valget av fane huskes, og fokuset blir stående på fanen.
    await aktuelt(page).getByRole('button', { name: 'Jukselapp', exact: true }).click();
    await expect(aktuelt(page).locator('.jl-panel')).toHaveAttribute('data-faktum', /.+/);
    await expect(aktuelt(page).getByRole('button', { name: 'Jukselapp', exact: true })).toBeFocused();
    await page.reload();
    await expect(aktuelt(page).getByRole('button', { name: 'Jukselapp', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await aktuelt(page).getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
    await aktuelt(page).getByRole('button', { name: 'Skjul Aktuelt' }).click();
    await expect(aktuelt(page)).toHaveCount(0);
    await expect(page.locator('.favorittliste a').first()).toBeVisible();
    await page.reload();
    await venterPaaSide(page);
    await expect(aktuelt(page)).toHaveCount(0);

    // «Tilpass» har rekkefølgen og bryterne for Aktuelt og dagens jukselapp, men ikke de andre valgene i menyen.
    await page.getByRole('button', { name: 'Tilpass', exact: true }).click();
    await expect(page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Neste datoer fra kalenderen' })).toHaveCount(0);
    await page.getByRole('switch', { name: 'Vis Aktuelt på forsiden' }).check();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await expect(aktuelt(page)).toHaveCount(1);
    await expect(aktuelt(page).getByRole('button', { name: 'Jukselapp', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('dagens jukselapp står ikke først ved første besøk på dagen, men visningen brukeren valgte sist', async ({ page }) => {
    await settLagret(page, { forside: forside({ apnet: ['panel'], jukselapp: true, visning: 'nyheter', jukselappForlatt: '2000-01-01' }) });
    await apne(page);
    await expect(aktuelt(page).getByRole('button', { name: 'Nyheter', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(aktuelt(page).getByRole('button', { name: 'Jukselapp', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(aktuelt(page).locator('.jl-panel')).toHaveCount(0);
  });

  test('skrivebord: skjult Aktuelt uten favoritter gir gruppene hele bredden', async ({ page }, info) => {
    test.skip(erMobil(info), 'Sidekolonnen er bare på skrivebord.');
    await settLagret(page, { forside: forside({ skjult: ['aktuelt'] }) });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./');
    await venterPaaSide(page);
    await expect(page.locator('.forside-sidekolonne')).toHaveCount(0);
    await expect(page.locator('.forside-full [data-gruppe="favoritter"]')).toBeVisible();
    // Med favoritter står de i sidekolonnen.
    await page.goto('./#/testmodul');
    await page.getByRole('button', { name: /Legg til i favoritter/ }).click();
    await page.goto('./');
    await expect(page.locator('.forside-sidekolonne [data-gruppe="favoritter"]')).toBeVisible();
    await expect(aktuelt(page)).toHaveCount(0);
  });

  test('skrivebord: den som hadde slått av sidekolonnen, får Aktuelt lukket, ikke skjult', async ({ page }, info) => {
    test.skip(erMobil(info), 'Sidekolonnen er bare på skrivebord.');
    await settLagret(page, { favoritter: FAVORITTER, forside: forside({ skjult: ['sidekolonne'] }) });
    await page.setViewportSize({ width: 1280, height: 800 });
    await apne(page);
    await expect(page.locator('.forside-sidekolonne [data-gruppe="panel"]')).toBeVisible();
    await expect(pil(page)).toHaveAttribute('aria-expanded', 'false');
    await pil(page).click();
    await expect(aktuelt(page).locator('.kal-panel')).toBeVisible();
    await page.reload();
    await expect(pil(page)).toHaveAttribute('aria-expanded', 'true');
  });

  test('ingen overflyt i 320–430 px, lukket og åpnet med menyen', { tag: '@mobil' }, async ({ page }) => {
    await settLagret(page, { tema: 'lys', fylke: '46', favoritter: FAVORITTER, forside: forside({ jukselapp: true }) });
    for (const bredde of [320, 390, 430]) {
      await page.setViewportSize({ width: bredde, height: 740 });
      await apne(page);
      expect(await finnOverflyt(page), `lukket i ${bredde}px`).toEqual([]);
      if ((await pil(page).getAttribute('aria-expanded')) === 'false') await pil(page).click();
      await aktuelt(page).getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
      expect(await finnOverflyt(page), `åpnet i ${bredde}px`).toEqual([]);
      await aktuelt(page).getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
    }
  });

  for (const tema of ['lys', 'mork'] as const) {
    test(`ingen alvorlige axe-funn med menyen åpen (${tema})`, { tag: '@mobil' }, async ({ page }) => {
      await settLagret(page, { tema, fylke: '46', favoritter: FAVORITTER, forside: forside({ apnet: ['panel'], jukselapp: true }) });
      await apne(page);
      await aktuelt(page).getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
      const resultat = await new AxeBuilder({ page }).include('[data-gruppe="panel"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const alvorlige = resultat.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
      expect(alvorlige).toEqual([]);
    });
  }
});
