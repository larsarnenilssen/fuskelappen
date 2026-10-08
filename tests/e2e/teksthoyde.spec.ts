// Ikoner og merker som står sammen med tekst, står midt i teksthøyden (eier 08.10.2026, avgjørelse 092).
//
// Testen måler alle ikoner (`svg.ikon`) og merker (`.merke`, `…-merke`) i løpende tekst på alle rutene: midten av
// elementet skal stå ved midten av bokstavene (grunnlinjen pluss en halv x-høyde), med 1,5 px slingring. Ikoner i
// flex og grid plasseres av beholderen (align-items: center) og måles ikke her. Bare i mobilprosjektene og i lys
// visning, som overflyten: plasseringen er den samme på skrivebord og i mørk visning.
import { expect, type Page, test } from '@playwright/test';
import { aapneAlt, ruter, settLagret, venterPaaSide } from './hjelp.ts';

/** Ikonene og merkene i løpende tekst som står mer enn 1,5 px fra midten av bokstavene. */
async function finnSkjeve(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const ut: string[] = [];
    const elementer = [...document.querySelectorAll<Element>('#app svg.ikon, #app .merke, #app [class*="-merke"]')];
    for (const el of elementer) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.height > 40) continue;
      const forelder = el.parentElement;
      if (!forelder) continue;
      // Et element med `display: contents` (f.eks. tittelen i inngangene) lager ingen boks, så det er beholderen over
      // som plasserer ikonet.
      let boks: Element | null = forelder;
      while (boks && getComputedStyle(boks).display === 'contents') boks = boks.parentElement;
      const visning = boks ? getComputedStyle(boks).display : '';
      if (visning.includes('flex') || visning.includes('grid')) continue;
      // Bare når det står tekst ved siden av, i samme element.
      const noder = [...forelder.childNodes];
      const i = noder.indexOf(el);
      const tekst = [...noder.slice(i + 1), ...noder.slice(0, i)].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
      if (!tekst) continue;
      // En tom inline-blokk med bredden 1ex står med bunnen på grunnlinjen, rett foran elementet.
      const probe = document.createElement('span');
      probe.style.cssText = 'display:inline-block;width:1ex;height:0;';
      forelder.insertBefore(probe, el);
      const p = probe.getBoundingClientRect();
      probe.remove();
      // Linjeskift mellom proben og elementet: da står de ikke på samme linje, og målingen sier ingenting.
      if (p.bottom < r.top - 2 || p.bottom > r.bottom + 8) continue;
      const avvik = r.top + r.height / 2 - (p.bottom - p.width / 2);
      if (Math.abs(avvik) > 1.5) {
        const klasse = el.getAttribute('class') ?? '';
        ut.push(`${el.tagName.toLowerCase()}.${klasse.replace(/ +/g, '.')} ved «${(tekst.textContent ?? '').trim().slice(0, 30)}»: ${avvik.toFixed(1)} px`);
      }
    }
    return ut;
  });
}

test.describe('merker og ikoner i teksten står midt i teksthøyden', { tag: '@mobil' }, () => {
  for (const rute of ruter) {
    test(rute, async ({ page }) => {
      test.slow(rute === '#/fag' || rute === '#/arbeidstid/arbeidsplan' || rute.startsWith('#/lov/'), 'Siden åpner mange grupper');
      await settLagret(page, { tema: 'lys', fylke: '46' });
      await page.goto(`./${rute}`);
      await venterPaaSide(page);
      await aapneAlt(page);
      expect(await finnSkjeve(page), rute).toEqual([]);
    });
  }
});
