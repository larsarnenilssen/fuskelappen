// Hjelpefunksjoner for ende-til-ende-testene.
import type { Page, TestInfo } from '@playwright/test';

export interface Oppsett {
  malform?: 'nb' | 'nn';
  tema?: 'system' | 'lys' | 'mork';
  fylke?: string | null;
  skole?: { id: string | null; navn: string } | null;
  favoritter?: string[];
  skjultKildevarsel?: string | null;
}

/** Setter lagrede innstillinger før siden lastes. */
export async function settLagret(side: Page, oppsett: Oppsett): Promise<void> {
  const data = {
    skjemaversjon: 2,
    innstillinger: {
      malform: oppsett.malform ?? 'nb',
      tema: oppsett.tema ?? 'system',
      fylke: oppsett.fylke ?? null,
      skole: oppsett.skole ?? null,
    },
    favoritter: oppsett.favoritter ?? [],
    scenarier: {},
    skjultKildevarsel: oppsett.skjultKildevarsel ?? null,
  };
  await side.addInitScript((d) => {
    if (!sessionStorage.getItem('oppsett-satt')) {
      localStorage.setItem('protokollen', JSON.stringify(d));
      sessionStorage.setItem('oppsett-satt', '1');
    }
  }, data);
}

export function erMobil(info: TestInfo): boolean {
  return info.project.name.endsWith('-mobil');
}

/** Alle ruter som skal testes for overflyt og tilgjengelighet. */
export const ruter = [
  '#/',
  '#/sok',
  '#/sok?q=skule',
  '#/favoritter',
  '#/innstillinger',
  '#/om',
  '#/om/kilder',
  '#/kategori/skolemiljo',
  '#/utvikling/komponenter',
  '#/testmodul',
  '#/begreper',
  '#/begreper/testbegrep-skolemiljo',
  '#/begreper/arsramme',
  '#/arbeidstid',
  '#/arbeidstid/stillingsplan',
  '#/arbeidstid/beskjeftigelse',
  '#/arbeidstid/periode',
  '#/arbeidstid/vikar',
  '#/arbeidstid/planfestet',
  '#/arbeidstid/overtid',
  '#/arbeidstid/fordeling',
  '#/finnes-ikke',
];

/** Venter til siden er tegnet (h1 finnes og lasteteksten er borte). */
export async function venterPaaSide(side: Page): Promise<void> {
  await side.locator('main h1').first().waitFor();
  await side.locator('main .laster').waitFor({ state: 'detached' }).catch(() => undefined);
}

/** Finner elementer som går utenfor skjermen horisontalt. */
export async function finnOverflyt(side: Page): Promise<string[]> {
  return side.evaluate(() => {
    const bredde = document.documentElement.clientWidth;
    const feil: string[] = [];
    if (document.documentElement.scrollWidth > bredde) {
      feil.push(`dokumentet er ${document.documentElement.scrollWidth}px bredt, skjermen ${bredde}px`);
    }
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (el.closest('.skjult-visuelt, .hopp, [hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > bredde + 0.5 || r.left < -0.5) {
        const navn = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ').join('.')}` : ''}`;
        feil.push(`${navn} går fra ${Math.round(r.left)} til ${Math.round(r.right)} (skjerm ${bredde})`);
      }
    }
    return feil.slice(0, 10);
  });
}

/** Åpner alle forklaringer og utregninger, så også skjult innhold blir sjekket. */
export async function aapneAlt(side: Page, omraade = 'main'): Promise<void> {
  const lukket = side.locator(`${omraade} button[aria-expanded="false"]`);
  for (let i = 0; i < 20 && (await lukket.count()) > 0; i++) await lukket.first().click();
}
