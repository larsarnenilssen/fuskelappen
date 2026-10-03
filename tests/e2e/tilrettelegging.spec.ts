// Veiviseren (fase 4, avgjørelse 041): steg for steg med tilstanden i adressen, tilbake med historikken, fokus på
// det nye steget, kildene i en lukket boks, lenker til Regelverk, kartet over hele prosessen og prosessen i egen
// kolonne på stor skjerm.
import { expect, test } from '@playwright/test';
import { aapneAlleSteg, aapneSteg, erMobil } from './hjelp.ts';

const VEIVISER = './#/tilrettelegging/tilpasset-og-individuell';

test.describe('veiviser', () => {
  test('fra oversikten gjennom stegene til et resultat, og tilbake med historikken', async ({ page }) => {
    await page.goto('./#/tilrettelegging');
    await page.getByRole('link', { name: /Tilpasset opplæring og individuell tilrettelegging/ }).click();
    const steg = page.locator('.veiviser-stegtittel');
    await expect(steg).toHaveText(['Hvor saken starter']);

    await page.getByRole('link', { name: 'I den ordinære opplæringen', exact: true }).click();
    await expect(page).toHaveURL(/steg=ti-tilpasset&svar=ordinar$/);
    // Steg uten valg står på samme side som spørsmålet etter dem, så brukeren trykker bare der det er et valg.
    await expect(steg).toHaveText(['Tilpasset opplæring for alle', 'Følge med og melde fra']);
    // Fokus flyttes til den første overskriften på den nye siden, så skjermlesere leser den.
    await expect(steg.first()).toBeFocused();
    await expect(page.getByRole('link', { name: /^Neste/ })).toHaveCount(0);

    await page.getByRole('link', { name: 'Ja, det er tvil' }).click();
    await expect(page).toHaveURL(/steg=ti-tiltak&svar=ordinar\.tvil$/);
    await expect(steg).toHaveText(['Egnede tiltak i den ordinære opplæringen', 'Vurdere tiltakene']);

    await page.getByRole('link', { name: /^Nei, eller eleven eller foreldrene/ }).click();
    await page.getByRole('link', { name: 'Bare personlig assistanse eller fysisk tilrettelegging' }).click();
    await page.getByRole('link', { name: 'Avslag' }).click();
    await expect(page.locator('.veiviser-stegnr')).toHaveText(/^Her ender veien · Vedtak/);
    await expect(page.getByRole('button', { name: 'Kopier oppsummeringen' })).toBeVisible();

    // Tilbake i nettleseren går én side tilbake, og lenken under knappene går til forrige valg.
    await page.goBack();
    await expect(steg).toHaveText(['Opplyse saken om assistanse eller fysisk tilrettelegging', 'Vedtak om individuell tilrettelegging']);
    await page.getByRole('link', { name: 'Tilbake til «Elevens behov»' }).click();
    await expect(steg).toHaveText(['Elevens behov']);
  });

  test('en delt adresse åpner samme steg med veien hit, og et tidligere steg kan velges', async ({ page }, info) => {
    await page.goto(`${VEIVISER}?steg=ti-nok&svar=ordinar.tvil`);
    await expect(page.locator('.veiviser-stegtittel')).toHaveText(['Egnede tiltak i den ordinære opplæringen', 'Vurdere tiltakene']);
    await expect(page.locator('.veiviser-stegnr').first()).toHaveText(/^Steg 3/);
    // Veien hit står som linje på mobil og i prosessen til venstre på stor skjerm.
    const vei = erMobil(info) ? page.locator('.veiviser-vei') : page.locator('.veiviser-prosess');
    await expect(vei.getByText('Ja, det er tvil')).toBeVisible();
    await vei.getByRole('link', { name: 'Følge med og melde fra' }).click();
    await expect(page).toHaveURL(/steg=ti-folge-med&svar=ordinar$/);
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Følge med og melde fra');
  });

  test('en adresse som ikke stemmer, gir det siste steget den fører fram til, med en merknad', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-nok&svar=ordinar.ukjent`);
    await expect(page.locator('.veiviser-stegtittel').last()).toHaveText('Følge med og melde fra');
    await expect(page.getByText('Lenken passet ikke helt med veiviseren')).toBeVisible();
  });

  test('steg uten valg over spørsmålet er lukket på mobil, med smakebit, og åpne på stor skjerm', async ({ page }, info) => {
    await page.goto(`${VEIVISER}?steg=ti-samtykke&svar=foresporsel.faglig`);
    const kort = page.locator('.veiviser-side > .veiviser-steg');
    await expect(kort).toHaveCount(3);
    const forste = kort.first();
    if (erMobil(info)) {
      await expect(forste.locator('.veiviser-smakebit')).toBeVisible();
      await expect(forste.locator('.brodtekst').first()).toBeHidden();
      await forste.getByRole('button', { name: 'Les hele steget' }).click();
      await expect(forste.locator('.brodtekst').first()).toBeVisible();
      await expect(forste.getByRole('button', { name: 'Vis mindre' })).toHaveAttribute('aria-expanded', 'true');
    } else {
      test.skip((page.viewportSize()?.width ?? 0) < 1024, 'Alle steg er åpne fra 64rem');
      await expect(forste.locator('.brodtekst').first()).toBeVisible();
    }
    // Steget med spørsmålet er alltid åpent, og «Til spørsmålet» går dit.
    await expect(kort.last().locator('.veiviser-smakebit')).toHaveCount(0);
    await page.getByRole('button', { name: 'Til spørsmålet' }).click();
    await expect(page.locator('.veiviser-sporsmal-tekst')).toBeFocused();
  });

  test('svarene kan velges med tastaturet', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-folge-med&svar=ordinar`);
    const svar = page.getByRole('link', { name: 'Nei, utbyttet er godt nok' });
    await svar.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.veiviser-stegtittel')).toHaveText(['Fortsett den tilpassede opplæringen']);
    await expect(page.locator('.veiviser-stegtittel')).toBeFocused();
  });

  test('kildene og paragrafene er lukket til de åpnes, og paragrafene lenker til Regelverk', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-tilpasset&svar=ordinar`);
    const forste = page.locator('.veiviser-steg').first();
    await aapneSteg(forste);
    const kilder = forste.locator('details.veiviser-kilder', { hasText: 'Kilder (2)' });
    await expect(kilder.getByRole('link', { name: /punkt 1\.1/ })).toBeHidden();
    await kilder.getByText('Kilder (2)').click();
    await expect(kilder.getByRole('link', { name: /punkt 1\.1/ })).toBeVisible();
    const paragraf = forste.getByRole('link', { name: /§ 11-1 Tilpassa opplæring/ });
    await expect(paragraf).toBeHidden();
    await forste.getByText(/^I regelverket \(\d+\)$/).click();
    await paragraf.click();
    await expect(page).toHaveURL(/#\/lov\/opplaeringslova\/11-1$/);
  });

  test('kartet over hele prosessen viser fristene og går rett til et steg', async ({ page }) => {
    // På starten er kartet åpent.
    await page.goto(VEIVISER);
    await expect(page.getByRole('button', { name: /Hele prosessen/ })).toHaveAttribute('aria-expanded', 'true');
    const kart = page.locator('.prosesskart');
    await expect(kart.locator('.prosesskart-fasenavn')).toHaveText([/Tilpasset opplæring/, /Utredning/, /Vedtak/, /Oppfølging/]);
    await expect(kart.locator('.prosesskart-punkt', { hasText: 'Klage på vedtaket' }).locator('.prosesskart-frist')).toHaveText(/3 uker/);
    await kart.getByRole('link', { name: 'Individuell opplæringsplan (IOP)' }).click();
    await expect(page.locator('.veiviser-stegtittel').first()).toHaveText('Individuell opplæringsplan (IOP)');
  });

  test('fasene: på mobil som stolpe over steget, på stor skjerm som prosess i egen kolonne', async ({ page }, info) => {
    await page.goto(`${VEIVISER}?steg=ti-vedtak&svar=foresporsel.faglig`);
    if (erMobil(info)) {
      await expect(page.locator('.veiviser-faser')).toBeVisible();
      await expect(page.locator('.veiviser-prosess')).toBeHidden();
      await expect(page.locator('.veiviser-fase[aria-current="step"]')).toHaveText(/Vedtak/);
    } else {
      test.skip((page.viewportSize()?.width ?? 0) < 1024, 'Prosessen står i egen kolonne fra 64rem');
      await expect(page.locator('.veiviser-prosess')).toBeVisible();
      await expect(page.locator('.veiviser-faser')).toBeHidden();
      await expect(page.locator('.veiviser-prosess [aria-current="step"]').last()).toHaveText('Vedtak om individuell tilrettelegging');
    }
  });

  test('et begrep åpnet fra veiviseren viser at brukeren er i begrepsbanken', async ({ page }) => {
    await page.goto(`${VEIVISER}?steg=ti-samtykke&svar=foresporsel.faglig`);
    await aapneAlleSteg(page);
    await page.locator('.veiviser-steg').getByRole('link', { name: 'sakkyndig vurdering' }).first().click();
    await expect(page).toHaveURL(/#\/begreper\/sakkyndig-vurdering$/);
    const sti = page.getByRole('navigation', { name: 'Plassering' });
    await sti.getByRole('link', { name: 'Begreper' }).click();
    await expect(page).toHaveURL(/#\/begreper$/);
  });
});

test.describe('veiviser: særskilt språkopplæring og kort botid', () => {
  const SPRAK = './#/tilrettelegging/sprak-og-kort-botid';

  test('fra morsmål via vedtak og innføringsopplæring til vanlig opplæring', async ({ page }) => {
    await page.goto('./#/tilrettelegging');
    await page.getByRole('link', { name: /Særskilt språkopplæring og kort botid/ }).click();
    const steg = page.locator('.veiviser-stegtittel');
    await expect(steg).toHaveText(['Hvem som har rett']);
    await page.getByRole('link', { name: 'Ja', exact: true }).click();
    await expect(steg).toHaveText(['Vurdere norskferdighetene']);
    await page.getByRole('link', { name: 'Nei', exact: true }).click();
    // Vedtaket står på samme side som spørsmålet om kort botid.
    await expect(steg).toHaveText(['Vedtak om særskilt språkopplæring', 'Elever med kort botid']);
    await page.getByRole('link', { name: 'Ja', exact: true }).click();
    await expect(steg).toHaveText(['Innføringsopplæring']);
    await expect(page.locator('.veiviser-fakta')).toContainText('høyst to år');
    await page.getByRole('link', { name: 'Ja, eleven samtykker' }).click();
    await expect(steg).toHaveText(['Læreplanene i særskilt språkopplæring', 'Jevnlig vurdering']);
    // Et svar kan føre til samme steg igjen, og veien husker begge.
    await page.getByRole('link', { name: /^Nei, eleven trenger fortsatt/ }).click();
    await expect(steg).toHaveText(['Jevnlig vurdering']);
    await expect(page).toHaveURL(/steg=sp-oppfolging&svar=ja\.nei\.ja\.ja\.nei$/);
    await page.getByRole('link', { name: 'Ja', exact: true }).click();
    await expect(steg).toHaveText(['Over til vanlig opplæring']);
    await expect(page.locator('.veiviser-stegnr')).toHaveText(/^Her ender veien · Oppfølging/);
  });

  test('læreplanene står i en boks med kompetansegivende, vurdering og fagkodene', async ({ page }) => {
    await page.goto(`${SPRAK}?steg=sp-laereplan&svar=ja.nei.nei`);
    await expect(page.locator('.veiviser-stegtittel').first()).toHaveText('Læreplanene i særskilt språkopplæring');
    // Steget med læreplanene står over spørsmålet om jevnlig vurdering, og er lukket på mobil.
    await aapneSteg(page.locator('.veiviser-steg').first());
    const boks = page.locator('.laereplanboks');
    await boks.getByRole('button', { name: /Læreplanene \(4\)/ }).click();
    const planer = boks.locator('.laereplanboks-liste > li');
    await expect(planer).toHaveCount(4);
    // Læreplanen for voksne står sist, i en egen gruppe og uten merke for kompetansegivende.
    await expect(boks.locator('.laereplanboks-gruppe')).toHaveText(['For elever', 'For voksne']);
    await expect(planer.nth(3)).toContainText('GNS02-01');
    await expect(planer.nth(3).locator('.merke-kompetansegivende, .merke-ikke-kompetansegivende')).toHaveCount(0);
    await expect(planer.nth(0)).toContainText('NOR07-03');
    await expect(planer.nth(0)).toContainText('Ikke kompetansegivende');
    await expect(planer.nth(1)).toContainText('NOR09-05');
    await expect(planer.nth(1).locator('.merke-kompetansegivende')).toHaveText('Kompetansegivende');
    await expect(planer.nth(1)).toContainText('Vurdering: Tallkarakter');
    // Trinnene er lukket til brukeren åpner dem.
    const vg1 = planer.nth(1).getByRole('button', { name: /^Vg1/ });
    await expect(vg1).toHaveAttribute('aria-expanded', 'false');
    await expect(planer.nth(1).getByRole('button', { name: /^Vg/ })).toHaveCount(3);
    await vg1.click();
    await planer.nth(1).getByRole('link', { name: /Vg1 studieforberedende utdanningsprogram, skriftlig/ }).click();
    await expect(page).toHaveURL(/#\/fag\/NOR1412$/);
  });

  test('elever med norsk eller samisk som morsmål får en lenke til tilpasset opplæring', async ({ page }) => {
    await page.goto(SPRAK);
    await page.getByRole('link', { name: /^Nei, eleven har norsk eller samisk/ }).click();
    await expect(page.locator('.veiviser-stegtittel')).toHaveText(['Ikke særskilt språkopplæring']);
    await page.locator('.veiviser-steg').getByRole('link', { name: 'tilpasset opplæring' }).click();
    await expect(page.locator('main h1')).toHaveText('Tilpasset opplæring og individuell tilrettelegging');
  });
});
