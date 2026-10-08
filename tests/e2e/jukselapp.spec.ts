// Dagens jukselapp (fase 8, avgjørelse 086): bryteren under «Tilpass» og Innstillinger, visningen i panelet, knappen
// for ny jukselapp, lenken videre og visningen først ved første besøk hver dag (alternativ C), med det gule merket og
// «Tilbake til …» (variant B, eier 08.10.2026). Faktumet avhenger av datoen, så testene ser på oppsettet og ikke på
// teksten.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { aapneAlt, settLagret } from './hjelp.ts';

const VESTLAND = '46';
/** Dagens dato, så jukselappen ikke vises først (alternativ C). */
const idag = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const apen = (forside: Record<string, unknown> = {}) => ({ rekkefolge: [], lukket: [], apnet: ['panel'], bareFavoritter: false, ...forside });

test.describe('dagens jukselapp', () => {
  test('er av fra start, og slås på under «Tilpass» med den samme bryteren som under Innstillinger', async ({ page }) => {
    await settLagret(page, { fylke: VESTLAND, forside: apen() });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]').first();
    await expect(panel.getByRole('button', { name: 'Kalender', exact: true })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Jukselapp', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Tilpass' }).click();
    const bryter = page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' });
    await expect(bryter).not.toBeChecked();
    await bryter.check();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    // Slått på står den som dagens jukselapp, med veien tilbake til kalenderen.
    await expect(panel.locator('.panel-dagens-merke')).toHaveText('Dagens jukselapp');
    await expect(panel.getByRole('button', { name: 'Tilbake til kalenderen' })).toBeVisible();
    await expect(panel.locator('.jl-tekst')).not.toBeEmpty();
    await expect(panel.locator('.jl-under')).not.toBeEmpty();
    // Kortet har tittelen over faktumet, og ingen rader med regelverket og kildene (eier 08.10.2026). Lenken har hele
    // bunnlinjen.
    await expect(panel.locator('.jl-tittel')).not.toBeEmpty();
    await expect(panel.locator('.jl-panel details')).toHaveCount(0);
    await expect(panel.locator('a.jl-videre')).toBeVisible();

    // Innstillinger viser samme valg.
    await page.goto('./#/innstillinger');
    await expect(page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' })).toBeChecked();
    await page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' }).uncheck();
    await page.goto('./');
    await expect(page.locator('.jl-panel')).toHaveCount(0);
  });

  test('knappen gir en ny jukselapp, og lenken går til stedet i appen', async ({ page }) => {
    await settLagret(page, { forside: apen({ jukselapp: true, visning: 'jukselapp' }) });
    await page.goto('./');
    const kort = page.locator('.jl-panel');
    await expect(kort).toHaveAttribute('data-faktum', /.+/);
    const forste = await kort.getAttribute('data-faktum');
    await kort.getByRole('button', { name: 'Ny jukselapp' }).click();
    await expect(kort).not.toHaveAttribute('data-faktum', forste ?? '');
    const lenke = kort.locator('a.jl-videre');
    const adresse = (await lenke.getAttribute('href')) ?? '';
    expect(adresse).toMatch(/^#\/[a-z]/);
    await lenke.click();
    await expect(page).toHaveURL(new RegExp(`${adresse.split('?')[0]?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await expect(page.locator('main h1').first()).toBeVisible();
  });

  test('vises først ved første besøk en ny dag, merket, og «Tilbake til …» gjelder resten av dagen', async ({ page }) => {
    await settLagret(page, { forside: apen({ jukselapp: true, visning: 'nyheter', jukselappForlatt: '2000-01-01' }) });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]').first();
    await expect(panel.locator('.jl-panel')).toHaveAttribute('data-faktum', /.+/);
    await expect(panel.locator('.panel-dagens-merke')).toHaveText('Dagens jukselapp');
    // Valgene er byttet ut med merket og veien tilbake til brukerens egen visning.
    await expect(panel.getByRole('button', { name: 'Kalender', exact: true })).toHaveCount(0);
    await panel.getByRole('button', { name: 'Tilbake til nyhetene' }).click();
    await expect(panel.getByRole('button', { name: 'Nyheter', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(panel.locator('.panel-dagens-merke')).toHaveCount(0);
    await page.reload();
    await expect(panel.getByRole('button', { name: 'Nyheter', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('har brukeren valgt jukselappen selv, står valgene som vanlig, uten merket', async ({ page }) => {
    await settLagret(page, { forside: apen({ jukselapp: true, visning: 'jukselapp' }) });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]').first();
    await expect(panel.getByRole('button', { name: 'Jukselapp', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(panel.locator('.panel-dagens-merke')).toHaveCount(0);
  });

  for (const malform of ['nb', 'nn'] as const) {
    test(`ingen horisontal overflyt på 320 px med fylke, og merket dekker ikke pilen (${malform})`, { tag: '@mobil' }, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await settLagret(page, { malform, tema: 'lys', fylke: VESTLAND, forside: apen({ jukselapp: true, visning: 'neste' }) });
      await page.goto('./');
      await expect(page.locator('.jl-panel')).toHaveAttribute('data-faktum', /.+/);
      // På smale skjermer står det «Til kalenderen».
      await expect(page.locator('.panel-tilbake-kort')).toHaveText('Til kalenderen');
      await expect(page.locator('.panel-tilbake-kort')).toBeVisible();
      await expect(page.locator('.panel-tilbake-lang')).toBeHidden();
      await aapneAlt(page, '.jl-panel');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const tilbake = await page.locator('.panel-tilbake').boundingBox();
      const pil = await page.locator('[data-gruppe="panel"] h2 .ikon').last().boundingBox();
      expect((tilbake?.x ?? 0) + (tilbake?.width ?? 0)).toBeLessThanOrEqual(pil?.x ?? 0);
    });
  }

  test('er omtrent like høy som kalenderen (eier 08.10.2026)', { tag: '@mobil' }, async ({ page }) => {
    await settLagret(page, { fylke: VESTLAND, forside: apen({ jukselapp: true, visning: 'neste', jukselappForlatt: idag() }) });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]').first();
    // Kalenderen tilpasser hvor mange datoer som får plass (useTilpassetListe), så høyden måles når den står stille.
    const hoyde = async () => (await panel.locator('.kal-panel').boundingBox())?.height ?? 0;
    await expect(panel.locator('.kal-panel .panel-liste > li').nth(2)).toBeVisible();
    let kalender = 0;
    await expect
      .poll(async () => {
        const forrige = kalender;
        kalender = await hoyde();
        return kalender > 0 && kalender === forrige;
      })
      .toBe(true);
    await panel.getByRole('button', { name: 'Jukselapp', exact: true }).click();
    await expect(page.locator('.jl-panel')).toHaveAttribute('data-faktum', /.+/);
    const jukselapp = (await page.locator('.jl-panel').boundingBox())?.height ?? 0;
    expect(Math.abs(jukselapp - kalender)).toBeLessThanOrEqual(48);
  });

  for (const tema of ['lys', 'mork'] as const) {
    test(`ingen alvorlige axe-funn (${tema})`, { tag: '@mobil' }, async ({ page }) => {
      // Første besøk på dagen, så det gule merket og «Tilbake til …» kommer med.
      await settLagret(page, { tema, fylke: VESTLAND, forside: apen({ jukselapp: true, visning: 'neste' }) });
      await page.goto('./');
      await expect(page.locator('.jl-panel')).toHaveAttribute('data-faktum', /.+/);
      await aapneAlt(page, '.jl-panel');
      const resultat = await new AxeBuilder({ page }).include('[data-gruppe="panel"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const alvorlige = resultat.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help}`);
      expect(alvorlige).toEqual([]);
    });
  }
});
