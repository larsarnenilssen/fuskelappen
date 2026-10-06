// Lærlinger og kandidater i Opplæringstilbud (fase 6, pakke 6, avgjørelse 069): veiene, sammenligningen og bytte vei,
// siden for hver vei, og «Veiene hit» på prøvesiden i Vurdering. Testene setter bredden selv, fordi siden står i én
// kolonne på mobil og i to fra 64rem.
import { expect, test } from '@playwright/test';

const SIDE = './#/opplaeringslop/laerlinger-og-kandidater';

test.describe('lærlinger og kandidater på mobil', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fra Opplæringstilbud til veien, prøven i Vurdering og tilbake via «Veiene hit»', async ({ page }) => {
    await page.goto('./#/opplaeringslop');
    await page.getByRole('link', { name: /^Lærlinger og kandidater/ }).click();
    await expect(page.locator('main h1')).toHaveText('Lærlinger og kandidater');
    await expect(page.getByRole('tab', { name: 'Veiene' })).toHaveAttribute('aria-selected', 'true');
    // Veiene er lukket fra start (eier 04.10.2026).
    const kort = page.locator('.fb-vei');
    await expect(kort).toHaveCount(8);
    const laerling = kort.first().getByRole('button');
    await expect(laerling).toHaveAttribute('aria-expanded', 'false');
    await laerling.click();
    await expect(kort.first().locator('.fb-steg > li')).toHaveCount(4);
    // «Mer om …» står over regelverket og kildene, som er lukkede rader nederst i kortet (eier 06.10.2026).
    const knapp = await kort.first().locator('.fb-mer').boundingBox();
    const fot = await kort.first().locator('.kortfot').boundingBox();
    expect(knapp && fot && fot.y > knapp.y).toBe(true);
    await expect(kort.first().locator('.kortfot .veiviser-kilder:not(.veiviser-regelverk) summary')).toContainText(/Kilder \(\d+\)/);
    await kort.first().getByRole('link', { name: /^Mer om lærling/ }).click();
    await expect(page).toHaveURL(/#\/opplaeringslop\/laerlinger-og-kandidater\/laerling$/);
    await expect(page.locator('main h1')).toHaveText('Lærling');
    await expect(page.locator('.brodsmuler')).toContainText('Lærlinger og kandidater');
    // Prøven i Vurdering er første kort, merket «I Vurdering».
    await expect(page.locator('.fag-ifaget-i').first()).toHaveText(/I Vurdering/i);
    await page.locator('.fb-prove').click();
    await expect(page).toHaveURL(/#\/eksamen\/fag-og-svenneproven$/);
    // «Veiene hit» er et lukket kort under prøvene, og lenker tilbake til hver vei.
    const hit = page.locator('.fb-hit');
    await expect(hit.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    await hit.getByRole('button').click();
    await hit.getByRole('link', { name: 'Lærekandidat', exact: true }).click();
    await expect(page).toHaveURL(/laerlinger-og-kandidater\/laerekandidat$/);
    await expect(page.locator('main h1')).toHaveText('Lærekandidat');
  });

  test('målet og filteret står i adressen, og kompetansebevis nevner elevene', async ({ page }) => {
    await page.goto(SIDE);
    await page.getByRole('button', { name: 'Bare veier uten krav om fellesfag' }).click();
    await expect(page.locator('.fb-vei')).toHaveCount(2);
    await expect(page).toHaveURL(/uten=1/);
    await page.locator('.bryter label', { hasText: 'Kompetansebevis' }).click();
    await expect(page.locator('.fb-vei')).toHaveCount(1);
    await expect(page.locator('.fb-merknad')).toContainText('elever som bare har hatt opplæring i deler av et fag');
    await expect(page).toHaveURL(/mal=kompetansebevis/);
  });

  test('sammenlign: to veier side om side, og fellesfagene i alle veiene lukket', async ({ page }) => {
    await page.goto(`${SIDE}?fane=sammenlign`);
    await expect(page.locator('.tosidig thead th').first()).toHaveText('Lærling');
    await page.getByLabel('Andre vei').selectOption({ label: 'Praksiskandidat' });
    await expect(page.locator('.tosidig thead th').last()).toHaveText('Praksiskandidat');
    await expect(page).toHaveURL(/b=praksiskandidat/);
    const fellesfag = page.locator('.innholdskort', { hasText: 'Fellesfagene i alle veiene' });
    await expect(fellesfag.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  test('bytte vei: fra praksis til fagbrev på jobb, og «Kommer fra» tilbake', async ({ page }) => {
    await page.goto(`${SIDE}?fane=bytte`);
    await page.getByRole('button', { name: 'Praksis i arbeidslivet' }).click();
    await expect(page).toHaveURL(/fra=praksis$/);
    await expect(page.locator('.fb-overganger > li')).toHaveCount(2);
    // Kortene står uten kilder. Regelverket og kildene står lukket under kortene, og på siden overgangen går til (eier
    // 06.10.2026).
    await expect(page.locator('.fb-overganger .veiviser-kilder')).toHaveCount(0);
    await expect(page.locator('.fb-to-bytte .veiviser-regelverk summary')).toContainText('I regelverket (2)');
    await expect(page.locator('.fb-to-bytte .veiviser-kilder:not(.veiviser-regelverk) summary')).toContainText('Kilder (2)');
    await page.getByRole('link', { name: /Kandidat for fagbrev på jobb/ }).click();
    await expect(page.locator('main h1')).toHaveText('Kandidat for fagbrev på jobb');
    const kommerFra = page.locator('section', { has: page.getByRole('heading', { name: 'Kommer fra' }) });
    await kommerFra.locator('.veiviser-kilder:not(.veiviser-regelverk) summary').click();
    await expect(kommerFra.locator('.veiviser-kilder:not(.veiviser-regelverk)')).toContainText('§ 9-58');
    await page.locator('.fb-overganger a', { hasText: 'Praksis i arbeidslivet' }).click();
    await expect(page).toHaveURL(/fane=bytte&fra=praksis$/);
    await expect(page.getByRole('button', { name: 'Praksis i arbeidslivet' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('lærekandidaten kan bli elev, og lærlingen kan gå til Vg3 i skole (eier 06.10.2026)', async ({ page }) => {
    await page.goto(`${SIDE}?fane=bytte&fra=laerekandidat`);
    await expect(page.locator('.fb-overganger')).toContainText('Elev i videregående skole');
    await page.goto(`${SIDE}?fane=bytte&fra=laerling`);
    await page.locator('.fb-overganger a', { hasText: 'Elev på Vg3 i skole' }).click();
    await expect(page.locator('main h1')).toHaveText('Elev på Vg3 i skole');
    const kommerFra = page.locator('section', { has: page.getByRole('heading', { name: 'Kommer fra' }) });
    await expect(kommerFra.locator('.fb-overganger')).toContainText('Når kontrakten er sagt opp');
    await kommerFra.locator('.veiviser-regelverk summary').click();
    await expect(kommerFra.locator('.veiviser-regelverk')).toContainText('§ 5-6');
  });

  test('tilbake fra en paragraf i «I regelverket» viser kortet åpent og siden der den var (eier 06.10.2026)', async ({ page }) => {
    await page.goto(SIDE);
    const kort = page.locator('.fb-vei').nth(1);
    await kort.getByRole('button').first().click();
    const regelverk = kort.locator('.kortfot .veiviser-regelverk');
    await regelverk.locator('summary').click();
    const lenke = regelverk.locator('a').first();
    await lenke.scrollIntoViewIfNeeded();
    const for_ = await page.evaluate(() => window.scrollY);
    expect(for_).toBeGreaterThan(100);
    await lenke.click();
    await expect(page).toHaveURL(/#\/lov\//);
    await page.goBack();
    await expect(page).toHaveURL(/laerlinger-og-kandidater/);
    await expect(kort.getByRole('button').first()).toHaveAttribute('aria-expanded', 'true');
    await expect(regelverk).toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(for_ - 5);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - for_)).toBeLessThan(5);
  });

  test('oppsigelse og heving står bare på veiene med kontrakt i bedrift', async ({ page }) => {
    await page.goto(`${SIDE}/laerling`);
    await expect(page.locator('.fb-om')).toContainText('Når kontrakten sies opp eller heves');
    await page.goto(`${SIDE}/praksiskandidat`);
    await expect(page.locator('main h1')).toHaveText('Praksiskandidat');
    await expect(page.locator('.fb-om')).not.toContainText('Når kontrakten sies opp eller heves');
  });

  test('en vei som ikke finnes', async ({ page }) => {
    await page.goto(`${SIDE}/finnes-ikke`);
    await expect(page.locator('main h1')).toHaveText('Fant ikke veien.');
  });
});

test.describe('lærlinger og kandidater på skrivebord', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('veiene står som en liste, og den valgte veien til høyre', async ({ page }) => {
    await page.goto(SIDE);
    const valgt = page.locator('.fb-valgt');
    await expect(valgt.locator('h2')).toHaveText('Lærling');
    await page.locator('.fb-velg', { hasText: 'Kandidat for fagbrev på jobb' }).click();
    await expect(valgt.locator('h2')).toHaveText('Kandidat for fagbrev på jobb');
    await expect(page).toHaveURL(/vei=fagbrev-pa-jobb/);
    await expect(page.locator('.fb-velg[aria-pressed="true"]')).toContainText('Kandidat for fagbrev på jobb');
    // Kolonnene står side om side.
    const venstre = await page.locator('.fb-to-hoved').boundingBox();
    const hoyre = await valgt.boundingBox();
    expect(venstre && hoyre && hoyre.x > venstre.x + venstre.width - 1).toBe(true);
  });
});

// Fase 6, pakke 7 (eier 06.10.2026): eget utgangspunkt for prøven som ikke er bestått, og «Om veien» uten tomrom.
test.describe('lærlinger og kandidater: prøven ikke bestått', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fag- eller svenneprøven ikke bestått: fire veier videre, og mer opplæring går til Inntak', async ({ page }) => {
    await page.goto(`${SIDE}?fane=bytte`);
    await page.getByRole('button', { name: 'Fag- eller svenneprøven ikke bestått' }).click();
    await expect(page).toHaveURL(/fra=prove-ikke-bestatt$/);
    const overganger = page.locator('.fb-overganger > li');
    await expect(overganger).toHaveCount(4);
    await expect(page.locator('.fb-overganger')).toContainText('Lærekandidat');
    await page.locator('.fb-overganger a', { hasText: 'Mer opplæring på Vg3' }).click();
    await expect(page).toHaveURL(/#\/inntak\/mer-opplaering$/);
    await expect(page.locator('main h1')).toHaveText('Mer opplæring');
  });

});

test.describe('lærlinger og kandidater: «Om veien» på stor skjerm', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('feltene fyller bredden to og to, også uten «Voksne»', async ({ page }) => {
    // Uten «Voksne»: fellesfagene står over to rader til høyre.
    await page.goto(`${SIDE}/laerling-tidlig`);
    await expect(page.locator('.fb-om .fb-fakta-hoy')).toHaveCount(1);
    const melder = await page.locator('.fb-om .fb-fakta > div', { hasText: 'Melder opp' }).boundingBox();
    const dok = await page.locator('.fb-om .fb-fakta > div', { hasText: 'Dokumentasjon' }).boundingBox();
    const fellesfag = await page.locator('.fb-om .fb-fakta-hoy').boundingBox();
    expect(melder && dok && Math.abs(melder.x - dok.x) < 2).toBe(true);
    expect(melder && fellesfag && fellesfag.x > melder.x + melder.width - 1).toBe(true);
    // Med «Voksne»: seks felt to og to, uten felt over to rader.
    await page.goto(`${SIDE}/laerling`);
    await expect(page.locator('.fb-om .fb-fakta > div', { hasText: 'Voksne' })).toBeVisible();
    await expect(page.locator('.fb-om .fb-fakta-hoy')).toHaveCount(0);
  });
});

