// Velkomsten (fase 10, avgjørelse 094). Ende-til-ende-testene kjører med navigator.webdriver, og da åpnes velkomsten
// ikke av seg selv, så de andre testene ikke stopper. Testene her viser den med `?vis=velkomst`, eller later som de
// ikke er en testrobot for å prøve første besøk.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { settLagret } from './hjelp.ts';

// Fire trinn (avgjørelse 101).
const TRINN = ['Velkommen til Jukselappen', 'Hvor jobber du?', 'Hvilken rolle har du?', 'Legg appen på hjemskjermen'];
const TRINN_ID = ['velkommen', 'sted', 'rolle', 'installer'];

/** Som en vanlig nettleser: velkomsten åpnes av seg selv ved første besøk. */
async function utenTestrobot(page: Page): Promise<void> {
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }));
}

/** Åpner velkomsten med forhåndsvisningen. Siden lastes på nytt, fordi velkomsten bare ser på adressen når appen starter. */
async function apne(page: Page, trinn?: string): Promise<void> {
  await page.goto(`./#/?vis=velkomst${trinn ? `&trinn=${trinn}` : ''}`);
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
}

const lagret = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('jukselappen') ?? 'null') as Record<string, unknown> | null);

test.describe('velkomsten', () => {
  test('åpnes ved første besøk på forsiden, og ikke igjen når den er lukket', async ({ page }) => {
    await utenTestrobot(page);
    await page.goto('./#/');
    const dialog = page.getByRole('dialog', { name: TRINN[0] });
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();
    await expect(page.locator('#innhold')).toHaveJSProperty('inert', true);
    await dialog.getByRole('button', { name: 'Lukk velkomsten' }).click();
    await expect(dialog).toHaveCount(0);
    expect((await lagret(page))?.velkomst).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await page.reload();
    await expect(page.getByTestId('forbehold')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('åpnes ikke av seg selv fra en delt lenke eller for den som har appen fra før', async ({ page }) => {
    await utenTestrobot(page);
    await page.goto('./#/vurdering');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    const ny = await page.context().newPage();
    await utenTestrobot(ny);
    await settLagret(ny, {});
    await ny.goto('./#/');
    await expect(ny.getByTestId('forbehold')).toBeVisible();
    await expect(ny.getByRole('dialog')).toHaveCount(0);
  });

  test('åpnes igjen fra forsiden og fra Innstillinger', async ({ page }) => {
    await settLagret(page, {});
    await page.goto('./#/');
    await page.getByRole('button', { name: 'Ny her? Se velkomsten' }).click();
    await expect(page.getByRole('dialog', { name: TRINN[0] })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.goto('./#/innstillinger');
    await page.getByRole('button', { name: /^Velkomst/ }).click();
    await expect(page.getByRole('dialog', { name: TRINN[0] })).toBeVisible();
  });

  test('blar med Neste og Tilbake, og Ferdig og Esc lukker', async ({ page }) => {
    await settLagret(page, {});
    await apne(page);
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Hopp over' })).toBeVisible();
    for (const [i, tittel] of TRINN.entries()) {
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(tittel);
      await expect(dialog.getByText(`${i + 1} av ${TRINN.length}`)).toBeVisible();
      if (i < TRINN.length - 1) await dialog.getByRole('button', { name: 'Neste' }).click();
    }
    // Fokus går til tittelen på hvert nytt trinn, så skjermlesere leser den.
    await expect(dialog.getByRole('heading', { level: 2 })).toBeFocused();
    await dialog.getByRole('button', { name: 'Tilbake' }).click();
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(TRINN[TRINN.length - 2] ?? '');
    await dialog.getByRole('button', { name: 'Neste' }).click();
    await dialog.getByRole('button', { name: 'Ferdig' }).click();
    await expect(dialog).toHaveCount(0);

    await apne(page, 'rolle');
    await expect(page.getByRole('dialog', { name: TRINN[2] })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#innhold')).toHaveJSProperty('inert', false);
  });

  test('fylket, rollen, favorittene og jukselappen lagres som i Innstillinger', async ({ page }) => {
    await settLagret(page, {});
    await apne(page, 'sted');
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Fylke', { exact: true }).selectOption({ label: 'Vestland' });
    await dialog.getByRole('button', { name: 'Neste' }).click();
    await dialog.getByRole('radio', { name: 'Skoleleder' }).check();
    await dialog.getByRole('button', { name: 'Legg til alle' }).click();
    await expect(dialog.getByRole('button', { name: 'Alle er lagt til' })).toBeDisabled();
    // Bryteren for dagens jukselapp står i samme trinn som rollen.
    await dialog.getByRole('switch', { name: 'Dagens jukselapp på forsiden' }).check();

    const data = (await lagret(page)) as {
      innstillinger: { fylke: string; rolle: string };
      favoritter: string[];
      forside: { jukselapp?: boolean };
    };
    expect(data.innstillinger.fylke).toBe('46');
    expect(data.innstillinger.rolle).toBe('skoleleder');
    expect(data.favoritter).toContain('arbeidstid:arbeidsplan');
    expect(data.favoritter).toHaveLength(6);
    expect(data.forside.jukselapp).toBe(true);

    await page.keyboard.press('Escape');
    await page.goto('./#/innstillinger');
    await expect(page.getByLabel('Fylke', { exact: true })).toHaveValue('46');
  });

  test('en stjerne legger til og tar bort én favoritt', async ({ page }) => {
    await settLagret(page, {});
    await apne(page, 'rolle');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('radio', { name: 'Annen rolle' }).check();
    const stjerne = dialog.getByRole('button', { name: 'Kalender', exact: true });
    await stjerne.click();
    await expect(stjerne).toHaveAttribute('aria-pressed', 'true');
    expect(((await lagret(page)) as { favoritter: string[] }).favoritter).toEqual(['kalender:oversikt']);
    await stjerne.click();
    await expect(stjerne).toHaveAttribute('aria-pressed', 'false');
  });

  test('lenken til en lokal regel lukker velkomsten og åpner skjemaet', async ({ page }) => {
    await settLagret(page, {});
    await apne(page, 'sted');
    await page.getByRole('dialog').getByRole('link', { name: /Legg inn en lokal regel/ }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'Ny lokal regel' })).toBeVisible();
  });

  test('med redusert bevegelse står bildene stille, uten knappen som spiller dem av', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settLagret(page, {});
    await apne(page, 'velkommen');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Vis igjen' })).toBeHidden();
    const animasjoner = await page.locator('.vk-scene *').evaluateAll((e) => e.map((x) => getComputedStyle(x).animationName).filter((n) => n !== 'none'));
    expect(animasjoner).toEqual([]);
  });

  test('på nynorsk', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await apne(page);
    await expect(page.getByRole('dialog', { name: 'Velkomen til Jukselappen' })).toBeVisible();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Neste' }).click();
    await dialog.getByRole('button', { name: 'Neste' }).click();
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Kva rolle har du?');
  });

  test('et trinn som er tatt bort, gir første trinn', async ({ page }) => {
    await settLagret(page, {});
    for (const gammel of ['sok', 'forsiden', 'sidene', 'jukselapp', 'takk']) {
      await apne(page, gammel);
      await expect(page.getByRole('dialog', { name: TRINN[0] })).toBeVisible();
    }
  });

  test('ingen horisontal overflyt på 320 px i noen av trinnene', { tag: '@mobil' }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await settLagret(page, { tema: 'lys' });
    await apne(page);
    for (const [i, id] of TRINN_ID.entries()) {
      if (i > 0) await page.getByRole('dialog').getByRole('button', { name: 'Neste' }).click();
      await expect(page.getByRole('dialog', { name: TRINN[i] })).toBeVisible();
      const overflyt = await page.evaluate(() => {
        const innhold = document.querySelector('.vk-innhold');
        return Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, innhold ? innhold.scrollWidth - innhold.clientWidth : 0);
      });
      expect(overflyt, id).toBeLessThanOrEqual(0);
    }
  });

  // Hvert trinn skal få plass uten rulling på en iPhone 14 (390 × 844), også med en rolle og favorittene valgt
  // (avgjørelse 101). Er et trinn for høyt, gjøres teksten kortere før vinduet gjøres høyere.
  for (const malform of ['nb', 'nn'] as const) {
    test(`trinnene får plass uten rulling på 390 × 844 (${malform})`, { tag: '@mobil' }, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await settLagret(page, { malform, tema: 'lys' });
      await apne(page);
      const dialog = page.getByRole('dialog');
      const ruller = () =>
        page.evaluate(() => {
          const innhold = document.querySelector('.vk-innhold');
          return innhold ? innhold.scrollHeight - innhold.clientHeight : 0;
        });
      for (const [i, id] of TRINN_ID.entries()) {
        if (i > 0) await dialog.getByRole('button', { name: 'Neste' }).click();
        if (id === 'rolle') {
          for (const rolle of await dialog.getByRole('radio').all()) {
            await rolle.check();
            await expect(dialog.locator('.vk-favorittliste li')).toHaveCount(6);
            expect(await ruller(), `${id}: ${await rolle.evaluate((e) => e.closest('label')?.textContent)}`).toBeLessThanOrEqual(0);
          }
        } else {
          expect(await ruller(), id).toBeLessThanOrEqual(0);
        }
      }
    });
  }

  for (const tema of ['lys', 'mork'] as const) {
    test(`ingen alvorlige axe-funn i trinnene (${tema})`, { tag: '@mobil' }, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await settLagret(page, { tema });
      await apne(page);
      for (const [i, id] of TRINN_ID.entries()) {
        if (i > 0) await page.getByRole('dialog').getByRole('button', { name: 'Neste' }).click();
        await expect(page.getByRole('dialog', { name: TRINN[i] })).toBeVisible();
        const resultat = await new AxeBuilder({ page }).include('.overlegg').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const alvorlige = resultat.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${id} – ${v.id}: ${v.help}`);
        expect(alvorlige).toEqual([]);
      }
    });
  }
});
