// Dagens jukselapp (fase 8, avgjørelse 086 og 102): valget i menyen i Aktuelt, visningen i Aktuelt, knappen for ny
// jukselapp og lenken videre. Den står ikke lenger først ved første besøk på dagen (avgjørelse 102, testet i
// aktuelt.spec.ts). Faktumet avhenger av datoen, så testene ser på oppsettet og ikke på teksten.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { aapneAlt, settLagret } from './hjelp.ts';

const VESTLAND = '46';
const apen = (forside: Record<string, unknown> = {}) => ({ rekkefolge: [], lukket: [], apnet: ['panel'], bareFavoritter: false, ...forside });

test.describe('dagens jukselapp', () => {
  test('er av fra start, og slås på i menyen i Aktuelt eller under «Tilpass», ikke i Innstillinger', async ({ page }) => {
    await settLagret(page, { fylke: VESTLAND, forside: apen() });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]').first();
    await expect(panel.getByRole('button', { name: 'Kalender', exact: true })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Jukselapp', exact: true })).toHaveCount(0);
    // «Tilpass» har bryteren, så den også kan slås på med bare favoritter (eier 10.10.2026).
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await expect(page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' })).not.toBeChecked();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await panel.getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
    await panel.getByRole('checkbox', { name: 'Dagens jukselapp' }).check();
    // Slått på er den én av fanene. Kalenderen står fortsatt, til brukeren velger jukselappen.
    await expect(panel.getByRole('button', { name: 'Kalender', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await panel.getByRole('button', { name: 'Jukselapp', exact: true }).click();
    await expect(panel.locator('.jl-tekst')).not.toBeEmpty();
    await expect(panel.locator('.jl-under')).not.toBeEmpty();
    // Kortet har tittelen over faktumet, og ingen rader med regelverket og kildene (eier 08.10.2026). Lenken har hele
    // bunnlinjen.
    await expect(panel.locator('.jl-tittel')).not.toBeEmpty();
    await expect(panel.locator('.jl-panel details')).toHaveCount(0);
    await expect(panel.locator('a.jl-videre')).toBeVisible();

    // Innstillinger har ikke bryteren (avgjørelse 102).
    await page.goto('./#/innstillinger');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' })).toHaveCount(0);
    await page.goto('./');
    await panel.getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
    await panel.getByRole('checkbox', { name: 'Dagens jukselapp' }).uncheck();
    await expect(page.locator('.jl-panel')).toHaveCount(0);
    await expect(panel.getByRole('button', { name: 'Jukselapp', exact: true })).toHaveCount(0);
  });

  test('med bare favoritter slås den på under «Tilpass», og står også når Aktuelt er skjult (eier 10.10.2026)', async ({ page }) => {
    await settLagret(page, { favoritter: ['vurdering:fravaer'], forside: apen({ bareFavoritter: true, skjult: ['aktuelt'] }) });
    await page.goto('./');
    await expect(page.locator('[data-gruppe="elev"]')).toBeVisible();
    await expect(page.locator('[data-gruppe="jukselapp"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Tilpass' }).click();
    await page.getByRole('switch', { name: 'Dagens jukselapp på forsiden' }).check();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    const gruppe = page.locator('[data-gruppe="jukselapp"]');
    await expect(gruppe).toHaveCount(1);
    // Lukket fra start på mobil (avgjørelse 066).
    const knapp = gruppe.locator('.gruppeknapp').first();
    if ((await knapp.getAttribute('aria-expanded')) === 'false') await knapp.click();
    await expect(gruppe.locator('.jl-tekst')).not.toBeEmpty();
    // Med alt innhold står Aktuelt fortsatt skjult, slik brukeren valgte.
    await page.getByRole('radio', { name: /^Alt/ }).check();
    await expect(page.locator('[data-gruppe="panel"]')).toHaveCount(0);
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

  test('har brukeren valgt jukselappen, står den med fanene som vanlig', async ({ page }) => {
    await settLagret(page, { forside: apen({ jukselapp: true, visning: 'jukselapp' }) });
    await page.goto('./');
    const panel = page.locator('[data-gruppe="panel"]').first();
    await expect(panel.getByRole('button', { name: 'Jukselapp', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(panel.getByRole('button', { name: 'Kalender', exact: true })).toHaveAttribute('aria-pressed', 'false');
  });

  for (const malform of ['nb', 'nn'] as const) {
    test(`ingen horisontal overflyt på 320 px med fylke, og fanene får plass (${malform})`, { tag: '@mobil' }, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await settLagret(page, { malform, tema: 'lys', fylke: VESTLAND, forside: apen({ jukselapp: true, visning: 'jukselapp' }) });
      await page.goto('./');
      await expect(page.locator('.jl-panel')).toHaveAttribute('data-faktum', /.+/);
      await aapneAlt(page, '.jl-panel');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      const faner = await page.locator('.aktuelt-faner').boundingBox();
      const boks = await page.locator('[data-gruppe="panel"]').boundingBox();
      expect((faner?.x ?? 0) + (faner?.width ?? 0)).toBeLessThanOrEqual((boks?.x ?? 0) + (boks?.width ?? 0));
    });
  }

  test('er omtrent like høy som kalenderen (eier 08.10.2026)', { tag: '@mobil' }, async ({ page }) => {
    await settLagret(page, { fylke: VESTLAND, forside: apen({ jukselapp: true, visning: 'neste' }) });
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
      await settLagret(page, { tema, fylke: VESTLAND, forside: apen({ jukselapp: true, visning: 'jukselapp' }) });
      await page.goto('./');
      await expect(page.locator('.jl-panel')).toHaveAttribute('data-faktum', /.+/);
      await aapneAlt(page, '.jl-panel');
      const resultat = await new AxeBuilder({ page }).include('[data-gruppe="panel"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const alvorlige = resultat.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.help}`);
      expect(alvorlige).toEqual([]);
    });
  }
});
