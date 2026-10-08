// Opplæringsløp (pakke 5, avgjørelse 035): program → tilbud → fag og timer, med lenker begge veier og til Vilbli.
import { expect, test } from '@playwright/test';
import { settLagret } from './hjelp.ts';

test.describe('opplæringsløp', () => {
  test('fra forsiden til programmet, tilbudet og fagarket', async ({ page }) => {
    await page.goto('./');
    // Modulen heter Opplæringstilbud, og Opplæringsløp er en underside (eier 03.10.2026).
    await page.getByRole('link', { name: /Opplæringstilbud/ }).first().click();
    await expect(page.locator('main h1')).toHaveText('Opplæringstilbud');
    await page.getByRole('link', { name: /^Opplæringsløp/ }).click();
    await expect(page.locator('main h1')).toHaveText('Opplæringsløp');
    await expect(page).toHaveURL(/#\/opplaeringslop\/lop$/);
    // Gruppene er lukket fra start (eier 02.10.2026).
    const yrkesfag = page.getByRole('button', { name: /^Yrkesfaglige utdanningsprogram/ });
    await expect(yrkesfag).toHaveAttribute('aria-expanded', 'false');
    await yrkesfag.click();
    await page.getByRole('link', { name: /Helse- og oppvekstfag/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helse- og oppvekstfag');
    // Løpet går fra vg1 videre til vg2 og lærefag. Grenene er lukket til brukeren åpner dem (eier 02.10.2026).
    // Knappen til neste trinn er bunnen av kortet: «Vis 7 tilbud på vg2».
    await expect(page.locator('.lop > li > .lop-kort > .tilbudslenke').first()).toContainText('Vg1 Helse- og oppvekstfag');
    const vg2 = page.locator('.lop > li > .lop-kort > .lop-knapp').first();
    await expect(vg2).toHaveText(/^Vis \d+ tilbud på vg2/);
    await expect(vg2).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.lop-videre .tilbudslenke', { hasText: 'Vg2 Helsearbeiderfag' })).toBeHidden();
    await vg2.click();
    await expect(vg2).toHaveText(/^Skjul tilbudene på vg2/);
    await page.locator('.lop-videre .tilbudslenke', { hasText: 'Vg2 Helsearbeiderfag' }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
    await expect(page).toHaveURL(/#\/opplaeringslop\/HS\/HSHEA2$/);
    // Timene totalt, og felles programfag i egen rubrikk med timene for hvert fag og eksamen nederst.
    await expect(page.locator('.tilbud-totalt')).toContainText('982');
    const programfag = page.locator('[data-rubrikk$="-felles_programfag"]');
    await expect(programfag.getByRole('button')).toHaveAccessibleName(/Felles programfag 477 timer/);
    await expect(programfag.locator('.fagrad', { hasText: 'Helsefremmende arbeid' })).toContainText('197');
    await expect(programfag).not.toContainText('Velg');
    // Tverrfaglig eksamen står som dempet rad nederst, med koden.
    await expect(programfag.locator('.fagrad[data-dempet]').last()).toContainText('Tverrfaglig eksamen');
    // Rubrikken kan legges sammen.
    await programfag.getByRole('button').click();
    await expect(programfag.locator('.fagrad').first()).toBeHidden();
    await programfag.getByRole('button').click();
    // Lenken til fagarket ligger i fagnavnet, og fagarket lenker tilbake til tilbudet.
    await programfag.getByRole('link', { name: 'Helsefremmende arbeid' }).click();
    await expect(page.locator('main h1')).toHaveText('Helsefremmende arbeid');
    // Fagarket viser hvordan faget inngår i hvert tilbud, med timene (eier 02.10.2026).
    await page.getByRole('button', { name: /^Inngår i tilbud/ }).click();
    await expect(page.locator('.inngar-liste li', { hasText: 'HSHEA2' })).toContainText('Felles programfag · 197 timer');
    await page.locator('.inngar-liste').getByRole('link', { name: /Helsearbeiderfag.*HSHEA2/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
    // Stien tilbake til programmet og oversikten.
    await page.getByRole('navigation', { name: 'Plassering' }).getByRole('link', { name: 'Helse- og oppvekstfag' }).click();
    await expect(page.locator('main h1')).toHaveText('Helse- og oppvekstfag');
  });

  test('fagene i et tilbud kan regnes ut i Arbeidsplan', async ({ page }) => {
    await page.goto('./#/opplaeringslop/HS/HSHEA2');
    await page.getByRole('link', { name: 'Regn ut i Arbeidsplan' }).click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.locator('.fagkort', { hasText: 'Helsefremmende arbeid' }).getByLabel('Antall årstimer')).toHaveValue('197');
    await expect(page.locator('.fagkort', { hasText: 'Kroppsøving' })).toHaveCount(1);
  });

  test('matematikk på vg2 studieforberedende er «velg én» av 2P, R1 og S1, og bare det første går til Arbeidsplan (eier 03.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/ST/STREA2');
    const fellesfag = page.locator('[data-rubrikk$="-fellesfag"]');
    await expect(fellesfag).toContainText(/velg én:\s*2P · R1 · S1/);
    await expect(fellesfag).toContainText('R1 og S1 er programfag på 140 timer');
    await page.getByRole('link', { name: 'Regn ut i Arbeidsplan' }).click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.locator('.fagkort', { hasText: 'Matematikk 2P' })).toHaveCount(1);
    await expect(page.locator('.fagkort', { hasText: /Matematikk (R1|S1)/ })).toHaveCount(0);
    // Fremmedspråk: det første språket i listen følger med, ikke alle.
    await expect(page.locator('.fagkort', { hasText: /FSP\d+/ })).toHaveCount(1);
  });

  test('på alle trinn følger ett av valgene med til Arbeidsplan: 1P eller 1T, og dekk eller maskin (eier 03.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/ST/STUSP1');
    await page.getByRole('link', { name: 'Regn ut i Arbeidsplan' }).click();
    await expect(page.locator('.fagkort', { hasText: /MAT10(19|21)/ })).toHaveCount(1);
    // Vg1 yrkesfag: 1P eller 1T står som merknad med timetallet.
    await page.goto('./#/opplaeringslop/HS/HSHSF1');
    await expect(page.locator('[data-rubrikk$="-fellesfag"]')).toContainText('Eleven kan i stedet velge det studieforberedende tilbudet, 1P eller 1T. Det har 140 timer i stedet for 84');
    await page.goto('./#/opplaeringslop/TP/TPMAR2');
    await page.getByRole('link', { name: 'Regn ut i Arbeidsplan' }).click();
    await expect(page.locator('main h1')).toHaveText('Arbeidsplan');
    await expect(page.locator('.fagkort', { hasText: /Dekk|Maskin/ })).toHaveCount(1);
  });

  test('Vilbli-lenken bruker fylket fra innstillingene, og påbygging står under programmet brukeren kom fra', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/opplaeringslop/HS/HSHEA2');
    await expect(page.getByRole('link', { name: /Skoler og lærebedrifter i Vestland/ })).toHaveAttribute('href', 'https://www.vilbli.no/nb/nb/vestland/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p5');
    await page.locator('[data-rubrikk$="-pabygging"]').getByRole('link').click();
    await expect(page).toHaveURL(/PBPBY3\?via=HSHEA2/);
    await expect(page.locator('main h1')).toHaveText(/påbygging/i);
    // Tilpassede ordninger: fagene som ikke er med, som kommer til og som har andre timer (eier 02.10.2026).
    await page.getByRole('button', { name: /^Tilpassede ordninger/ }).click();
    const samisk = page.locator('.tilpasning', { hasText: 'Elever med samisk' });
    await expect(samisk.locator('dt')).toHaveText(['Fag som ikke er med', 'Fag som kommer til', 'Andre timer']);
    await expect(samisk).toContainText('Historie: 140 → 113 timer');
    await expect(page.getByRole('link', { name: /Skoler og lærebedrifter i Vestland/ })).toHaveAttribute('href', /\/helse-og-oppvekstfag\/program\/v\.hs\/v\.pbpby3----\/p5$/);
  });

  test('lange lister er lukket, og mange fag å velge blant kan søkes i og står i grupper', async ({ page }) => {
    await page.goto('./#/opplaeringslop/HS/HSHSF1');
    const videre = page.getByRole('button', { name: /^Videre \d+/ });
    await expect(videre).toHaveAttribute('aria-expanded', 'false');
    await videre.click();
    await expect(page.locator('[data-rubrikk$="-videre"]').getByRole('link', { name: /Vg2 Helsearbeiderfag/ })).toBeVisible();

    await page.goto('./#/opplaeringslop/ST/STUSP1');
    const sprak = page.getByRole('button', { name: /^Fremmedspråk · velg én av \d+/ }).first();
    await expect(sprak).toHaveAttribute('aria-expanded', 'false');
    await sprak.click();
    await expect(page.locator('.tilbud-fagliste').filter({ hasText: 'Fransk' }).first()).toBeVisible();

    await page.goto('./#/opplaeringslop/ST/STSSA2');
    const valg = page.locator('[data-rubrikk$="-valgfritt"]');
    await valg.getByRole('button', { name: /^Velg 1 fag · blant \d+ fag/ }).click();
    // Fagene står i grupper etter læreplan, som er lukket til brukeren åpner dem eller søker.
    // Programfag til valg står først i grupper etter programområde i Grep, så etter læreplan.
    const realfag = valg.getByRole('button', { name: /^Realfag \d+ fag/ });
    await expect(realfag).toHaveAttribute('aria-expanded', 'false');
    await realfag.click();
    const gruppe = valg.getByRole('button', { name: /^Matematikk for realfag/ });
    await expect(gruppe).toHaveAttribute('aria-expanded', 'false');
    await valg.getByRole('searchbox').fill('matematikk r1');
    // R1 hører til både realfag og språk, samfunnsfag og økonomi i Grep, og står i begge gruppene.
    await expect(valg.getByRole('link', { name: /Matematikk R1/ })).toHaveCount(2);
    await expect(valg.getByRole('link', { name: /Matematikk R1/ }).first()).toBeVisible();
    await expect(valg.getByRole('link', { name: /Matematikk S1/ })).toHaveCount(0);
  });

  test('oversikten har søk etter tilbud', async ({ page }) => {
    await page.goto('./#/opplaeringslop');
    await page.getByRole('searchbox', { name: /Søk/ }).fill('helsearb');
    await expect(page.locator('main').getByRole('status')).toContainText(/\d+ tilbud/);
    await page.getByRole('link', { name: /Vg2 Helsearbeiderfag/ }).click();
    await expect(page.locator('main h1')).toHaveText('Helsearbeiderfag');
  });

  test('avvik mellom rundskrivet og Grep står som merknad (eier 02.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/EL/ELROM3');
    await expect(page.locator('[data-rubrikk$="-felles_programfag"] .tilbud-avvik')).toContainText('Rundskrivet har 925 timer. Fagene i Grep har til sammen 700.');
  });

  test('linjenavnene fra rundskrivet står på nynorsk (eier 02.10.2026)', async ({ page }) => {
    // Målformen settes før siden lastes. En ny adresse med bare annen # laster ikke siden på nytt.
    await settLagret(page, { malform: 'nn' });
    await page.goto('./#/opplaeringslop/ST/STSSA2');
    await expect(page.locator('[data-rubrikk$="-fellesfag"] .fagrad', { hasText: 'Framandspråk' })).toHaveCount(1);
  });

  test('lærefaget i bedrift står alene, med fellesfag som alternativer (eier 02.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/BA/BABDR3');
    const rubrikk = page.locator('[data-rubrikk$="-felles_programfag"]');
    await expect(rubrikk.getByRole('link', { name: /Byggdrifterfaget/ }).first()).toBeVisible();
    await expect(rubrikk.getByRole('button', { name: /Alternativer for særskilte grupper/ })).toBeVisible();
    await expect(rubrikk.locator('.fagrad:not([data-dempet])', { hasText: 'Grunnleggende norsk' })).toHaveCount(0);
  });

  test('tilbud i skole står før opplæring i bedrift (eier 02.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/DT');
    await page.locator('.lop-knapp').first().click();
    const tekster = await page.locator('.lop > li > .lop-videre > li > .lop-kort').allInnerTexts();
    const forsteBedrift = tekster.findIndex((t) => /I bedrift/.test(t));
    expect(forsteBedrift).toBeGreaterThan(0);
    expect(tekster.slice(forsteBedrift).every((t) => /I bedrift/.test(t))).toBe(true);
  });

  test('søket finner tilbud', async ({ page }) => {
    await page.goto('./#/sok?q=helsearbeiderfag');
    await expect(page.getByRole('link', { name: /Helsearbeiderfag/ }).first()).toBeVisible();
  });

  test('ukjent tilbud gir en melding', async ({ page }) => {
    await page.goto('./#/opplaeringslop/HS/FINNES');
    await expect(page.locator('main h1')).toHaveText('Fant ikke tilbudet.');
  });

  test('Vg2 på yrkesfag etter Vg1 studiespesialisering står i en boks med søk, ikke som liste (eier 03.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/ST/STUSP1');
    await expect(page.getByRole('button', { name: /^Kryssløp til/ })).toHaveCount(0);
    const boks = page.locator('.opphenting');
    await expect(boks.getByRole('link', { name: 'Yrkesfaglig opphenting' })).toHaveAttribute('href', '#/fag/YFO2002');
    await expect(boks.locator('.tilbudslenke')).toHaveCount(0);
    await boks.getByLabel('Søk etter Vg2 på yrkesfag').fill('helsearbeider');
    await boks.getByRole('link', { name: /Vg2 Helsearbeiderfag/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Helsearbeiderfag/);
    await expect(page.getByRole('button', { name: /^Fra studieforberedende Vg1 med Yrkesfaglig opphenting 1/ })).toBeVisible();
  });

  test('lærefagene fører videre til Vg4 påbygging (eier 03.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/HS/HSHEA3');
    await page.locator('[data-rubrikk$="-pabygging"]').getByRole('link', { name: /Vg4 Fag for studiekompetanse/ }).click();
    await expect(page.locator('.merke').filter({ hasText: /^Vg4$/ })).toBeVisible();
    // Kildene står i en lukket boks (eier 06.10.2026).
    await page.locator('.kildeboks').getByText(/^Kilder \(\d+\)$/).click();
    await expect(page.getByRole('link', { name: /VIGO Kodeverksbase/ }).first()).toBeVisible();
  });

  test('løp kildene ikke er enige om, er merket, og tilbudet lenker til utdanning.no (avgjørelse 052 og 070)', async ({ page }) => {
    // Løp som bare én kilde har, er med og merket med kilden. Er flere enige, står kilden som mangler løpet.
    await page.goto('./#/opplaeringslop/SR/SRSSR2');
    await expect(page.locator('[data-rubrikk$="-videre"]').getByRole('link', { name: /Sikkerhetsfaget.*Står bare i VIGO/ })).toBeVisible();
    await page.goto('./#/opplaeringslop/IM/IMMED2');
    await expect(page.locator('[data-rubrikk$="-kryss"]').getByRole('link', { name: /Profileringsdesignfaget.*Står ikke i utdanning\.no/ })).toBeVisible();
    await page.goto('./#/opplaeringslop/BA/BAKEM2');
    await expect(page.locator('[data-rubrikk$="-videre"]').getByRole('link', { name: /Rørleggerfaget.*Står bare i Grep/ })).toBeVisible();
    await page.getByRole('button', { name: 'Kildene er ikke enige om alle løpene' }).click();
    await expect(page.getByText('Merknaden sier bare at kildene er uenige')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tilbudet på utdanning.no' })).toHaveAttribute('href', 'https://utdanning.no/utdanning/vgs/BAKEM2----');
  });

  test('med valgt skole viser Opplæringsløp først skolens tilbud, og bryteren gir alle (avgjørelse 053)', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: { id: '974557479', navn: 'Åsane vidaregåande skule' } });
    await page.goto('./#/opplaeringslop');
    // Landingssiden har to likestilte deler: utdanningsprogram og løp, og skoler og opplæringskontorer (eier 03.10.2026).
    await expect(page.locator('main h1')).toHaveText('Opplæringstilbud');
    await expect(page.getByRole('heading', { name: 'Utdanningsprogram og løp' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Skoler og opplæringskontorer' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Skoler og tilbud.*skoler i Vestland/ })).toBeVisible();
    await page.getByRole('link', { name: /^Opplæringsløp.*utdanningsprogram ved Åsane vidaregåande skule/ }).click();
    await expect(page.locator('main h1')).toHaveText('Opplæringsløp');
    await expect(page.getByRole('navigation', { name: 'Plassering' }).getByRole('link', { name: 'Opplæringstilbud' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Min skole' })).toBeChecked();
    await expect(page.getByText('Viser tilbudene ved Åsane vidaregåande skule.')).toBeVisible();
    await expect(page.getByRole('link', { name: /Helse- og oppvekstfag.*tilbud ved skolen/ })).toBeVisible();
    // Løpet starter fra skolens tilbud. Tilbudene ved skolen har egen farge, og knappen sier hvor mange som er ved skolen.
    await page.getByRole('link', { name: /Helse- og oppvekstfag/ }).click();
    const kort = page.locator('.lop > li > .lop-kort').first();
    await expect(kort).toHaveAttribute('data-skole', 'ja');
    await expect(kort).toContainText('Din skole');
    await expect(kort.locator('.lop-knapp')).toHaveText(/Vis \d+ tilbud på vg2 · \d+ ved skolen din/);
    await kort.locator('.lop-knapp').click();
    // Tilbudene ved skolen står først.
    await expect(page.locator('.lop-videre > li > .lop-kort').first()).toHaveAttribute('data-skole', 'ja');
    // Valget huskes: «Alle» gjelder også når Opplæringsløp åpnes på nytt.
    await page.getByRole('radio', { name: 'Alle' }).check();
    await page.goto('./#/opplaeringslop/lop');
    await expect(page.getByRole('radio', { name: 'Alle' })).toBeChecked();
    await expect(page.getByRole('button', { name: /^Yrkesfaglige utdanningsprogram/ })).toBeVisible();
  });

  test('uten valgt skole står en merknad om å velge skole (avgjørelse 053)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/lop');
    await expect(page.getByText('Velg skole under Innstillinger, så ser du tilbudene ved skolen din.')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Min skole' })).toHaveCount(0);
  });

  test('tilbudet lenker til skolene i fylket, og oppslaget kan utvides til hele landet (avgjørelse 053)', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: { id: '974557479', navn: 'Åsane vidaregåande skule' } });
    await page.goto('./#/opplaeringslop/HS/HSHEA2');
    const skoler = page.locator('[data-rubrikk="lop-HSHEA2-skoler"]');
    await expect(skoler).toContainText('Åsane vidaregåande skule har tilbudet.');
    await skoler.getByRole('link', { name: /skoler i Vestland/ }).click();
    await expect(page.locator('main h1')).toHaveText('Skoler og tilbud');
    await expect(page.getByText('Har Vg2 Helsearbeiderfag')).toBeVisible();
    await expect(page.locator('.skoleliste > li').first()).toContainText('Åsane vidaregåande skule');
    const antall = await page.locator('.skoleliste > li').count();
    await page.getByRole('button', { name: /Søk i hele landet/ }).click();
    await expect.poll(() => page.locator('.skoleliste > li').count()).toBeGreaterThan(antall);
    // En skole viser tilbudene sine når den åpnes, per utdanningsprogram og som et løp: Vg2 under Vg1 (eier 03.10.2026).
    // Med et tilbud i filteret vises bare løpet til tilbudet, og tilbudet er merket. Den åpne skolen har egen flate.
    await page.locator('.skolekort-knapp').first().click();
    await expect(page.locator('.skoleliste > li').first()).toHaveClass(/apen/);
    const innhold = page.locator('.skolekort-innhold').first();
    const hs = innhold.locator('.skoletilbud', { has: page.getByRole('heading', { name: 'Helse- og oppvekstfag' }) });
    await expect(hs.locator('.lop > li > .lop-kort')).toContainText(['Vg1 Helse- og oppvekstfag']);
    await expect(hs.locator('.lop > li > .lop-videre').getByRole('link', { name: /Vg2 Helsearbeiderfag/ })).toBeVisible();
    await expect(hs.locator('.lop-kort[data-valgt="ja"]')).toContainText('Vg2 Helsearbeiderfag');
    await expect(innhold.locator('.skoletilbud')).toHaveCount(1);
    // Knappen viser alle tilbudene ved skolen, og fører tilbake til løpet.
    await innhold.getByRole('button', { name: /^Vis alle tilbudene ved skolen \(\d+\)$/ }).click();
    await expect.poll(() => innhold.locator('.skoletilbud').count()).toBeGreaterThan(1);
    await innhold.getByRole('button', { name: 'Vis bare løpet for Vg2 Helsearbeiderfag' }).click();
    await expect(innhold.locator('.skoletilbud')).toHaveCount(1);
  });

  test('med et utdanningsprogram i filteret viser skolen bare det programmet, med knapp til alle tilbudene (eier 03.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop/skoler?fylke=46&program=HS&skole=46015');
    await expect(page.locator('.skoleliste > li')).toHaveCount(1);
    const innhold = page.locator('.skolekort-innhold').first();
    await expect(innhold.locator('.skoletilbud')).toHaveCount(1);
    await expect(innhold.getByRole('heading', { name: 'Helse- og oppvekstfag' })).toBeVisible();
    await innhold.getByRole('button', { name: /^Vis alle tilbudene ved skolen/ }).click();
    await expect.poll(() => innhold.locator('.skoletilbud').count()).toBeGreaterThan(1);
    await innhold.getByRole('button', { name: 'Vis bare Helse- og oppvekstfag' }).click();
    await expect(innhold.locator('.skoletilbud')).toHaveCount(1);
  });

  test('lærefaget har yrker og lenke til opplæringskontorene i fylket (avgjørelse 053)', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./#/opplaeringslop/HS/HSHEA3');
    const yrker = page.locator('[data-rubrikk="lop-HSHEA3-yrker"]');
    await expect(yrker).toContainText('Yrkestittel er helsefagarbeider.');
    await expect(yrker.getByRole('link', { name: /Helsefagarbeider/ })).toHaveAttribute('href', 'https://utdanning.no/yrker/beskrivelse/helsefagarbeider');
    await page.getByRole('button', { name: /^Opplæringskontorer/ }).click();
    await page.getByRole('link', { name: /opplæringskontorer godkjent i Vestland/ }).click();
    await expect(page.locator('main h1')).toHaveText('Opplæringskontorer');
    await expect(page.getByLabel('Fylke')).toHaveValue('46');
    await expect(page.locator('.kontor-status')).toContainText('i Vestland');
    await page.getByLabel('Søk etter kontor eller kommune').fill('bilbransjens');
    const kontor = page.locator('.kontor', { hasText: 'Bergen' }).first();
    await expect(kontor).toContainText(/Godkjent i/);
    await expect(kontor.getByRole('link', { name: /Kontoret på utdanning.no/ })).toHaveAttribute('href', /^https:\/\/utdanning\.no\/finnlarebedrift\/bedrift\/\d{9}\/$/);
    // Et annet fylke kan velges, og søket kan utvides til hele landet.
    await page.getByLabel('Søk etter kontor eller kommune').fill('');
    await page.getByLabel('Fylke').selectOption('03');
    await expect(page.locator('.kontor-status')).toContainText('i Oslo');
    await page.getByRole('button', { name: /Søk i hele landet/ }).click();
    await expect(page.getByLabel('Fylke')).toHaveValue('');
  });

  test('fagarket lenker til faget på NDLA (avgjørelse 053)', async ({ page }) => {
    await page.goto('./#/fag/SAK1001');
    await expect(page.locator('.fagark-ndla').getByRole('link', { name: /Samfunnskunnskap/ })).toHaveAttribute('href', /^https:\/\/ndla\.no\/f\//);
  });

  test('søket på Opplæringstilbud finner tilbud og skoler, og skoleoppslaget kan søkes på tilbud (eier 03.10.2026)', async ({ page }) => {
    await page.goto('./#/opplaeringslop');
    await page.getByRole('searchbox').fill('åsane');
    await expect(page.getByRole('heading', { name: 'Skoler (1)' })).toBeVisible();
    await page.getByRole('link', { name: /Åsane vidaregåande skule/ }).click();
    await expect(page.locator('main h1')).toHaveText('Skoler og tilbud');
    await expect(page.locator('.skoleliste > li')).toHaveCount(1);
    await page.goto('./#/opplaeringslop/skoler?fylke=alle');
    await page.getByLabel('Finn skolene som har et tilbud').fill('helsearbeider');
    await page.getByRole('button', { name: /Vg2 Helsearbeiderfag/ }).click();
    await expect(page.getByText('Har Vg2 Helsearbeiderfag')).toBeVisible();
    await expect(page.getByLabel('Finn skolene som har et tilbud')).toHaveValue('');
  });

  test('skolene kan søkes fra forsiden (eier 03.10.2026)', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('searchbox').first().fill('åsane vidaregåande');
    await page.getByRole('link', { name: /Åsane vidaregåande skule/ }).first().click();
    await expect(page.locator('main h1')).toHaveText('Skoler og tilbud');
  });
});
