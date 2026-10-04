// Fag og læreplaner (fase 2): søk og filter, fagside med kompetansemål og vurdering, målform og favoritter.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('fag og læreplaner', () => {
  test('søk og filter følger adressen, og fører til fagsiden', async ({ page }) => {
    await page.goto('./#/fag');
    await page.getByLabel('Søk etter fag eller fagkode').fill('helsefremmende arbeid');
    await expect(page).toHaveURL(/#\/fag\?q=helsefremmende\+arbeid/);
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByLabel('Utdanningsprogram').selectOption('HS');
    await page.getByLabel('Trinn').selectOption('Vg2');
    await expect(page).toHaveURL(/program=HS/);
    // Faget har samme navn i to programområder på Vg2. Fagkoden skiller dem.
    await expect(page.getByRole('status')).toHaveText('2 fag');
    // Fag med samme navn viser tilbudet etter fagkoden, og fagtypen har fargen til fagtypen.
    await expect(page.getByRole('link', { name: /HEA2005/ })).toContainText('HEA2005 · Helsearbeiderfag');
    await expect(page.getByRole('link', { name: /HEA2005/ })).toHaveAttribute('data-fagtype', 'felles_programfag');
    await expect(page.getByRole('link', { name: /HEA2005/ }).locator('.faglenke-type')).toHaveText('Felles programfag');
    await page.getByRole('link', { name: /HEA2005/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helsefremmende arbeid');

    // Tilbake gir samme søk og filter.
    await page.goBack();
    await expect(page.getByLabel('Søk etter fag eller fagkode')).toHaveValue('helsefremmende arbeid');
    await expect(page.getByRole('button', { name: 'Filter (2)' })).toBeVisible();
    await page.getByRole('button', { name: 'Nullstill filter' }).click();
    await expect(page).not.toHaveURL(/program=/);
  });

  test('filteret viser de vanlige fagene gruppert, og varianter når de slås på (avgjørelse 031)', async ({ page }) => {
    await page.goto('./#/fag?program=HS');
    const grupper = page.locator('.faggruppe-2 > .faggruppe-tittel');
    // Yrkesfaglig fordypning står først på et yrkesfaglig program.
    await expect(grupper.first()).toContainText('Yrkesfaglig fordypning');
    await expect(page.getByRole('button', { name: /^Felles programfag \(\d+\)/ })).toHaveAttribute('aria-expanded', 'true');
    // Hele overskriftsraden åpner og lukker gruppen, også til høyre for teksten (eier 02.10.2026).
    const felles = page.getByRole('button', { name: /^Felles programfag \(\d+\)/ });
    await felles.scrollIntoViewIfNeeded();
    const rad = await felles.boundingBox();
    await page.mouse.click((rad?.x ?? 0) + (rad?.width ?? 0) - 40, (rad?.y ?? 0) + (rad?.height ?? 0) / 2);
    await expect(felles).toHaveAttribute('aria-expanded', 'false');
    await felles.click();
    await expect(felles).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/Kvensk/)).toHaveCount(0);
    // «Vis også» er lukket til brukeren åpner den.
    const visOgsaa = page.getByRole('button', { name: /Vis også/ });
    await expect(visOgsaa).toHaveAttribute('aria-expanded', 'false');
    await expect(visOgsaa).toContainText(/\d+ skjulte fag passer søket/);
    await visOgsaa.click();
    const varianter = page.getByRole('checkbox', { name: /Varianter for særskilte grupper/ });
    await expect(varianter).not.toBeChecked();
    await varianter.check();
    await expect(page).toHaveURL(/vis=variant/);
    await expect(page.getByText(/Kvensk/).first()).toBeVisible();
    // Uten de vanlige fagene står bare variantene igjen.
    await page.getByRole('checkbox', { name: /Vanlige fag/ }).uncheck();
    await expect(page).toHaveURL(/vanlige=nei/);
    await expect(page.getByRole('button', { name: /^Yrkesfaglig fordypning/ })).toHaveCount(0);
    await expect(page.getByText(/Kvensk/).first()).toBeVisible();

    // Et søk på en hel fagkode viser faget, også når det er skjult.
    await page.goto('./#/fag?q=KEF1001');
    await expect(page.getByRole('link', { name: /KEF1001/ })).toBeVisible();
  });

  test('fagsiden viser årstimer, vurdering og kompetansemål, merket med målformen læreplanen er fastsatt i', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    // Årstimetallet står som nøkkeltall: tallet og enheten hver for seg.
    const timer = page.locator('.nokkeltall-rute').first();
    await expect(timer.locator('.nokkeltall-verdi')).toHaveText('197');
    await expect(timer.locator('.nokkeltall-enhet')).toHaveText('timer à 60 minutter');
    await expect(page.locator('.merke-fagtype')).toContainText('Felles programfag');
    // Kompetansemålene er lukket til brukeren åpner dem (eier 02.10.2026).
    await page.getByRole('button', { name: /^Kompetansemål og læreplan/ }).click();
    await expect(page.getByText('Fastsatt på bokmål. Teksten fra læreplanen er gjengitt uoversatt.')).toBeVisible();
    await expect(page.locator('.kompetansemaal li').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Læreplanen på udir.no \(KV366\)/ })).toHaveAttribute('href', 'https://www.udir.no/lk20/hea02-04/kompetansemaal-og-vurdering/kv366');
    const underveis = page.getByRole('button', { name: /Underveisvurdering/ });
    await expect(underveis).toHaveAttribute('aria-expanded', 'false');
    await underveis.click();
    await expect(page.locator('.forklaring-innhold p').first()).toBeVisible();
  });

  test('fagarket viser årsramme, og «Regn ut i Arbeidsplan» åpner en ny arbeidsplan med faget (eier 01.10.2026)', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    // Fagkode, fagtype og trinn står som merker, og fagtypen har fargen til fagtypen (eier 01.10.2026).
    await expect(page.locator('.fagark-merker')).toContainText('HEA2005');
    await expect(page.locator('article.fagark')).toHaveAttribute('data-fagtype', 'felles_programfag');
    const ramme = page.locator('.nokkeltall-kort');
    await expect(ramme.locator('.nokkeltall-rute').first()).toContainText('197');
    await expect(ramme).toContainText('607,5');
    // At årsrammen bygger på appens tolkning, står på begrepet bak «i», ikke i ruten (eier 04.10.2026).
    await expect(ramme).not.toContainText('appens tolkning av vedlegg 1');
    // Alle delene er lukket til brukeren åpner dem, og ferdighetene og temaene står før kompetansemålene (eier 02.10.2026).
    const deler = ['laereplanverket', 'kompetansemaal', 'vurdering', 'programomrader'];
    await expect(page.locator('[data-seksjon]')).toHaveCount(deler.length);
    expect(await page.locator('[data-seksjon]').evaluateAll((e) => e.map((x) => x.getAttribute('data-seksjon')))).toEqual(deler);
    for (const navn of [/^Grunnleggende ferdigheter og tverrfaglige temaer/, /^Kompetansemål og læreplan/, /^Vurderingsordning$/, /^Inngår i tilbud/]) {
      await expect(page.getByRole('button', { name: navn })).toHaveAttribute('aria-expanded', 'false');
    }
    await expect(page.getByRole('link', { name: 'Om begrepet felles programfag' })).toHaveAttribute('href', '#/begreper/felles-programfag');
    await ramme.getByRole('link', { name: 'Regn ut i Arbeidsplan' }).click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.locator('[data-gruppe="1"] .fagvalg')).toContainText('HEA2005');
    await expect(page.getByLabel('Antall årstimer')).toHaveValue('197');
  });

  test('begrepet årsramme sier i en merknad at årsrammene bygger på appens tolkning (eier 04.10.2026)', async ({ page }) => {
    await page.goto('./#/begreper/arsramme');
    await expect(page.locator('.begrep-merknad')).toContainText('appens tolkning av vedlegg 1 til SFS 2213');
  });

  test('årsrammen som varierer med program, står i en utvidelse av ruten som er lukket (eier 02.10.2026)', async ({ page }) => {
    await page.goto('./#/fag/YFF4105');
    const knapp = page.getByRole('button', { name: /Varierer/ });
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.nokkeltall-rader')).toBeHidden();
    await knapp.click();
    await expect(knapp).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.nokkeltall-rader div', { hasText: 'Helse- og oppvekstfag Vg1' })).toContainText('607,5 (810)');
  });

  test('fagarket for yrkesfaglig fordypning forklarer faget og samler programmene', async ({ page }) => {
    await page.goto('./#/fag/YFF4106');
    await expect(page.getByText('Alle yrkesfaglige utdanningsprogram')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om yrkesfaglig fordypning' })).toBeVisible();
    await expect(page.locator('.merknad')).toContainText('lokale læreplaner');
    // Teksten står som avsnitt, ikke som HTML-kode, og det er luft før neste kort (eier 02.10.2026).
    await expect(page.locator('.fagark-yff')).not.toContainText('<p>');
    expect(await page.locator('.fagark-yff .brodtekst p').count()).toBeGreaterThan(1);
    const [yff, neste] = await Promise.all([page.locator('.fagark-yff').boundingBox(), page.locator('.fagark-yff + *').boundingBox()]);
    expect((neste?.y ?? 0) - ((yff?.y ?? 0) + (yff?.height ?? 0))).toBeGreaterThan(8);
  });

  test('læreplaner fastsatt på nynorsk vises på nynorsk også når appen er på bokmål', async ({ page }) => {
    await page.goto('./#/fag/AKT2004');
    await page.getByRole('button', { name: /^Kompetansemål og læreplan/ }).click();
    await expect(page.getByText('Fastsatt på nynorsk.', { exact: false })).toBeVisible();
    await expect(page.locator('main [lang="nn"]:visible').first()).toBeVisible();
  });

  test('appen på nynorsk viser egne tekster på nynorsk og læreplanen uoversatt', async ({ page }) => {
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/fag/HEA2005');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Helsefremjande arbeid');
    await page.getByRole('button', { name: /^Kompetansemål og læreplan/ }).click();
    await expect(page.getByText('Fastsett på bokmål. Teksten frå læreplanen er gjengitt utan omsetjing.')).toBeVisible();
    await expect(page.locator('main [lang="nb"]:visible').first()).toBeVisible();
  });

  test('fag kan legges til som favoritt', async ({ page }) => {
    await page.goto('./#/fag/HEA2005');
    await page.getByRole('button', { name: 'Legg til i favoritter: Helsefremmende arbeid' }).click();
    await page.goto('./');
    await expect(page.locator('.favorittliste').getByRole('link', { name: 'Helsefremmende arbeid (HEA2005)' })).toBeVisible();
  });

  test('ukjent fagkode gir en melding', async ({ page }) => {
    await page.goto('./#/fag/FINNES0');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fant ikke faget.');
  });

  test('fagsiden viser fag som brukes sammen og utgåtte koder faget erstatter (VIGO)', async ({ page }) => {
    await page.goto('./#/fag/LBR3018');
    const sammen = page.locator('.egenskaper div', { hasText: 'Brukes sammen med' });
    await expect(sammen.getByRole('link', { name: /LBR3020 Tverrfaglig eksamen landbruk/ })).toBeVisible();
    await page.goto('./#/fag/LBR3012');
    await expect(page.locator('.egenskaper div', { hasText: 'Erstatter' })).toContainText('LBR3004 Traktor og maskiner');
  });

  test('en utgått fagkode viser koden som erstatter den, på fagsiden og i søket', async ({ page }) => {
    await page.goto('./#/fag/LBR3004');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fagkoden LBR3004 er utgått.');
    await page.getByRole('link', { name: /LBR3012/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maskiner og teknologi i landbruk');
    await page.goto('./#/fag?q=lbr3004');
    await expect(page.locator('[data-erstatning="LBR3004"]').getByRole('link', { name: /LBR3012/ })).toBeVisible();
  });

  test('det samlede søket finner fag på navn og kode', async ({ page }) => {
    await page.goto('./#/sok?q=HEA2005');
    await expect(page.getByRole('link', { name: /Helsefremmende arbeid/ }).first()).toBeVisible();
  });

  test('«Til toppen» vises når brukeren har rullet langt ned i fagsøket, og fører til toppen (eier 02.10.2026)', async ({ page }) => {
    await page.goto('./#/fag?program=HS&vis=variant,bedrift,andre');
    await expect(page.locator('.faggruppe-2').first()).toBeVisible();
    const knapp = page.getByRole('button', { name: 'Til toppen' });
    await expect(knapp).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(knapp).toBeVisible();
    await knapp.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
    await expect(page.locator('main h1')).toBeFocused();
    await expect(knapp).toHaveCount(0);
  });
});
