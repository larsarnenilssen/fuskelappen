// Kalenderen (fase 6, pakke 5, avgjørelse 066): fristene fra alle modulene, filteret i adressen, de gamle adressene
// som sender videre, og de neste datoene i Aktuelt på forsiden. Datoene avhenger av dagen testen kjøres, så testene sjekker
// oppsettet og ikke bestemte datoer.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { settLagret, venterPaaSide } from './hjelp.ts';

test.describe('kalenderen', () => {
  test('fra Inntak til kalenderen filtrert på inntak, med et kort som åpnes', async ({ page }) => {
    await page.goto('./#/inntak');
    await page.locator('.frist-inngang', { hasText: 'Neste frist' }).click();
    await expect(page).toHaveURL(/#\/kalender\?tema=inntak$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kalender');
    await expect(page.locator('.kal-filter summary')).toContainText('Inntak');
    await expect(page.locator('.frist-stripe > li')).toHaveCount(12);
    // Uten valgt fylke er det ingen datoer for fylket.
    await expect(page.locator('.kal-kort-lokal')).toHaveCount(0);
    // Søknadsfristen 1. mars er lukket til den åpnes, og lenker til veiviseren.
    const mars = page
      .locator('.kal-kort')
      .filter({ has: page.locator('.kal-tittel', { hasText: /(^|: )Søknadsfrist(\s|$)/ }) })
      .filter({ hasNotText: 'noen grupper' })
      .first();
    await expect(mars.locator('.kal-innhold')).toBeHidden();
    await mars.locator('.kal-topp').click();
    await expect(mars.locator('.kal-innhold')).toContainText('første virkedag');
    await expect(mars.locator('.kal-lenker a').first()).toBeVisible();
  });

  test('filteret står i adressen, og datoer uten fast dag vises bare med tema', async ({ page }) => {
    await page.goto('./#/kalender?visning=skolear');
    await expect(page.locator('.kal-uten-dag')).toHaveCount(0);
    await page.locator('.kal-filter summary').click();
    await page.locator('.kal-filter').getByRole('button', { name: 'Inntak', exact: true }).click();
    await expect(page).toHaveURL(/tema=inntak/);
    await expect(page.locator('.kal-uten-dag').first()).toBeVisible();
    await page.locator('.kal-filter').getByRole('button', { name: 'Voksne', exact: true }).click();
    await expect(page).toHaveURL(/vis=voksne/);
    await expect(page.locator('.kal-hele')).toContainText('Voksne søker når som helst');
  });

  test('de gamle adressene sender videre til kalenderen, ferdig filtrert', async ({ page }) => {
    await page.goto('./#/vurdering/eksamen-og-klage?vis=privatister');
    await expect(page).toHaveURL(/#\/kalender\?tema=eksamen&vis=privatister$/);
    await page.goto('./#/inntak/frister?vis=ungdom');
    await expect(page).toHaveURL(/#\/kalender\?tema=inntak&vis=elever$/);
  });

  test('med Vestland valgt kommer fylkets frister med', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/kalender?visning=skolear&tema=inntak&vis=voksne');
    await expect(page.locator('.kal-kort-lokal').first()).toBeVisible();
    await expect(page.locator('.kal-kort-lokal .merke-fylke').first()).toHaveText('Vestland');
    // Lenken til fylkessiden åpner «Hos fylkeskommunen», som ellers er lukket (eier 05.10.2026).
    const kort = page.locator('.kal-kort-lokal').first();
    await kort.locator('.kal-topp').click();
    await kort.locator('.kal-lenker a[href^="#/fylker/46"]').click();
    await expect(page.locator('[data-rubrikk=fylke-lenker] .kortknapp')).toHaveAttribute('aria-expanded', 'true');
  });

  test('neste skoleår kan velges', async ({ page }) => {
    await page.goto('./#/kalender');
    // Valgene står i filterboksen, som er lukket fra start.
    await page.locator('.kal-filter summary').click();
    await page.locator('.kal-filter').getByRole('radio', { name: 'Skoleåret' }).check();
    await expect(page).toHaveURL(/visning=skolear/);
    await page.locator('.kal-filtervalg .sokefilter-valg').nth(1).click();
    await expect(page).toHaveURL(/aar=\d{4}/);
    await expect(page.locator('.kal-maned')).toHaveCount(12);
  });
});

test.describe('passerte datoer', () => {
  // Datoer som er passert, dempes. Med fast dato midt i skoleåret finnes det alltid passerte datoer, så kontrasten
  // testes uansett hvilken dag testen kjøres (avgjørelse 097). Kortene står lukket, slik brukeren ser dem.
  for (const tema of ['lys', 'mork'] as const) {
    test(`har nok kontrast, uten alvorlige axe-funn (${tema})`, { tag: '@mobil' }, async ({ page }) => {
      await page.clock.setFixedTime(new Date('2027-01-15T10:00:00'));
      await settLagret(page, { tema });
      await page.goto('./#/kalender?visning=skolear');
      await venterPaaSide(page);
      await expect(page.locator('.kal-passert').first()).toBeVisible();
      await expect(page.locator('.kal-passert-maned').first()).toBeVisible();
      await expect(page.locator('.kal-passert .kal-kort[open]')).toHaveCount(0);
      const resultat = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const alvorlige = resultat.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
      expect(alvorlige).toEqual([]);
    });
  }
});

test.describe('De neste datoene på forsiden', () => {
  test('@mobil kalenderen er første visning i Aktuelt, lukket med neste dato, og kan tas ut i menyen', async ({ page }, info) => {
    test.skip(!info.project.name.includes('mobil'), 'Aktuelt er lukket fra start bare på mobil.');
    await page.goto('./');
    const gruppe = page.locator('[data-gruppe="panel"]');
    // Lukket: «Aktuelt», visningen og den neste datoen, uten fanene (avgjørelse 102).
    await expect(gruppe.locator('.gruppe-sammendrag')).toContainText(':');
    await expect(gruppe.locator('.aktuelt-faner')).toBeHidden();
    await gruppe.locator('.gruppeknapp').click();
    await expect(gruppe.locator('.kal-panel .panel-liste > li')).toHaveCount(4);
    await gruppe.getByRole('link', { name: 'Hele kalenderen' }).click();
    await expect(page).toHaveURL(/#\/kalender$/);
    await page.goto('./');
    await gruppe.getByRole('button', { name: 'Velg hva som står i Aktuelt' }).click();
    await gruppe.getByLabel('Neste datoer fra kalenderen').uncheck();
    // Aktuelt ble åpnet over, og står åpent: uten kalenderen og uten fanen for den.
    await expect(gruppe.locator('.gruppeknapp')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.kal-panel')).toHaveCount(0);
    await expect(gruppe.getByRole('button', { name: 'Kalender', exact: true })).toHaveCount(0);
  });
});
