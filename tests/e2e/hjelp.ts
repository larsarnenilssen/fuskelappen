// Hjelpefunksjoner for ende-til-ende-testene.
import type { Locator, Page, TestInfo } from '@playwright/test';

export interface Oppsett {
  malform?: 'nb' | 'nn';
  tema?: 'system' | 'lys' | 'mork';
  fylke?: string | null;
  skole?: { id: string | null; navn: string } | null;
  favoritter?: string[];
  skjultKildevarsel?: string | null;
  forside?: { rekkefolge: string[]; lukket: string[]; bareFavoritter: boolean };
}

/** Setter lagrede innstillinger før siden lastes. */
export async function settLagret(side: Page, oppsett: Oppsett): Promise<void> {
  const data = {
    skjemaversjon: 3,
    innstillinger: {
      malform: oppsett.malform ?? 'nb',
      tema: oppsett.tema ?? 'system',
      fylke: oppsett.fylke ?? null,
      skole: oppsett.skole ?? null,
    },
    favoritter: oppsett.favoritter ?? [],
    scenarier: {},
    skjultKildevarsel: oppsett.skjultKildevarsel ?? null,
    forside: oppsett.forside ?? { rekkefolge: [], lukket: [], bareFavoritter: false },
  };
  await side.addInitScript((d) => {
    if (!sessionStorage.getItem('oppsett-satt')) {
      localStorage.setItem('fuskelappen', JSON.stringify(d));
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
  '#/begreper/fagmerknader',
  '#/begreper/vitnemalsmerknader?q=utvidet',
  '#/arbeidstid/arbeidsplan',
  '#/arbeidstid/beskjeftigelse',
  '#/arbeidstid/vikar',
  '#/arbeidstid/overtid',
  '#/fag',
  '#/fag?q=norsk&program=ST&trinn=Vg1',
  '#/fag/HEA2005',
  '#/fag/AKT2004',
  '#/fag/LBR3018',
  '#/fag/LBR3004',
  '#/fag/FINNES0',
  '#/opplaeringslop',
  '#/opplaeringslop/lop',
  '#/opplaeringslop/HS',
  '#/opplaeringslop/HS/HSHEA2',
  '#/opplaeringslop/ST/STUSP1',
  '#/opplaeringslop/PB/PBPBY3?via=HSHEA2',
  '#/opplaeringslop/HS/HSHEA3',
  '#/opplaeringslop/skoler?fylke=46&tilbud=HSHEA2',
  '#/opplaeringslop/opplaeringskontor?fylke=46',
  '#/laereplanverket',
  '#/laereplanverket/overordnet-del/2.5.1',
  '#/lov',
  '#/lov/vestland-skulereglar/8',
  '#/lov/forvaltningsloven',
  '#/lov/hovedtariffavtalen/hta-ansettelse',
  '#/lov/sfs2213',
  '#/tilrettelegging',
  '#/tilrettelegging/tilpasset-og-individuell',
  '#/tilrettelegging/tilpasset-og-individuell?steg=ti-tiltak&svar=ordinar.tvil',
  '#/tilrettelegging/tilpasset-og-individuell?steg=ti-vedtak&svar=foresporsel.faglig',
  '#/tilrettelegging/tilpasset-og-individuell?steg=ti-avslag&svar=foresporsel.faglig.avslag',
  '#/tilrettelegging/sprak-og-kort-botid',
  '#/tilrettelegging/sprak-og-kort-botid?steg=sp-innforing&svar=ja.nei.ja',
  '#/tilrettelegging/sprak-og-kort-botid?steg=sp-laereplan&svar=ja.nei.nei',
  '#/vurdering',
  '#/vurdering/underveis-og-sluttvurdering',
  '#/vurdering/underveis-og-sluttvurdering?fag=ENG1007',
  '#/vurdering/grunnlag-for-vurdering',
  '#/vurdering/grunnlag-for-vurdering?steg=vu-varsel-fravaer&svar=elev.vanlig.nei.over',
  '#/vurdering/orden-og-oppforsel',
  '#/begreper/karakterer-og-vurderingsuttrykk?q=IV',
  '#/inntak',
  '#/inntak/frister',
  '#/inntak/frister?vis=voksne',
  '#/inntak/poeng',
  '#/inntak/poeng?trinn=vg3',
  '#/inntak/rett-inntak-soknad',
  '#/inntak/rett-inntak-soknad?steg=sk-poeng&svar=norsk.ja.nei.under19.vg1.poeng',
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
  // Lukkede <details>, f.eks. kildene i en veiviser.
  await side.locator(`${omraade} details:not([open])`).evaluateAll((liste) => liste.forEach((d) => ((d as HTMLDetailsElement).open = true)));
}

/**
 * Åpner et steg i en veiviser hvis det er lukket. Steg uten valg over spørsmålet er lukket på mobil (avgjørelse 044).
 */
export async function aapneSteg(steg: Locator): Promise<void> {
  // Vent til steget er tegnet, så knappen finnes hvis steget er lukket.
  await steg.locator('.veiviser-stegtittel').waitFor();
  const knapp = steg.getByRole('button', { name: 'Les hele steget' });
  if ((await knapp.count()) > 0) await knapp.click();
}

/** Åpner alle lukkede steg på siden i en veiviser. */
export async function aapneAlleSteg(side: Page): Promise<void> {
  await side.locator('.veiviser-side .veiviser-stegtittel').first().waitFor();
  const knapper = side.getByRole('button', { name: 'Les hele steget' });
  while ((await knapper.count()) > 0) await knapper.first().click();
}
