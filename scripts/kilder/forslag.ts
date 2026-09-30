// Endringsforslag fra kildesjekken: når et tall i kilden er endret, lages et forslag med nytt tall og nytt
// sitat i regelfilen. Ren logikk; lag-forslag.ts lager grenen og PR-en. Testes i tests/unit/forslag.test.ts
// (avgjørelse 020). Forslaget setter alltid kontrollert: null, og det flettes bare av eier.
import { normaliserTekst } from '../../src/core/kontroll/tekst.ts';
import { sitatmonster, type Sjekkbar, type Verdistatusfil } from '../../src/core/kontroll/verdisjekk.ts';

export interface Verdiendring {
  /** «regelsett/nøkkel» */
  id: string;
  regelsett: string;
  nokkel: string;
  kilde: string;
  fra: number;
  /** Nytt tall, eller null når bare sitatet må oppdateres (et annet tall i sitatet er endret). */
  til: number | null;
  sitat: string;
  nyttSitat: string;
}

/**
 * Finner verdiene som bør endres: avvik med forslag, og verdier der tallet stemmer, men et annet tall i
 * sitatet er endret. Det nye sitatet er teksten som står i kilden nå, på samme sted.
 */
export function finnVerdiendringer(
  verdier: readonly Sjekkbar[],
  status: Verdistatusfil | null,
  tekster: Readonly<Record<string, string | undefined>>,
): Verdiendring[] {
  const ut: Verdiendring[] = [];
  for (const v of verdier) {
    const post = status?.verdier[v.nokkel];
    const tekst = tekster[v.kilde];
    if (!post || tekst === undefined) continue;
    const nyttTall = post.status === 'avvik' && post.forslag !== null;
    const baresitat = post.status === 'samsvarer' && post.melding !== null;
    if (!nyttTall && !baresitat) continue;
    const treff = sitatmonster(v.sitat).exec(normaliserTekst(tekst));
    if (!treff) continue;
    const [regelsett = '', nokkel = ''] = v.nokkel.split('/');
    ut.push({ id: v.nokkel, regelsett, nokkel, kilde: v.kilde, fra: v.verdi, til: nyttTall ? post.forslag : null, sitat: v.sitat, nyttSitat: treff[0] });
  }
  return ut;
}

/** Et tall slik det skrives i YAML-filene: punktum som desimaltegn, ingen tusenskille. */
function yamlTall(n: number): string {
  return String(n);
}

/**
 * Endrer én verdi i teksten til en regelfil uten å røre resten av filen (kommentarer og rekkefølge beholdes):
 * verdi, sitat og kontrollert: null. Kaster hvis verdien ikke finnes i filen.
 */
export function endreRegelfil(yaml: string, nokkel: string, endring: Pick<Verdiendring, 'til' | 'nyttSitat'>): string {
  const linjer = yaml.split('\n');
  const start = linjer.findIndex((l) => l === `  ${nokkel}:`);
  if (start < 0) throw new Error(`Fant ikke verdien ${nokkel} i regelfilen.`);
  let slutt = linjer.findIndex((l, i) => i > start && /^ {2}\S/.test(l));
  if (slutt < 0) slutt = linjer.length;
  for (let i = start + 1; i < slutt; i++) {
    const linje = linjer[i] as string;
    if (endring.til !== null && /^ {4}verdi: /.test(linje)) linjer[i] = `    verdi: ${yamlTall(endring.til)}`;
    else if (/^ {4}sitat: /.test(linje)) linjer[i] = `    sitat: ${JSON.stringify(endring.nyttSitat)}`;
    else if (/^ {4}kontrollert: /.test(linje)) linjer[i] = '    kontrollert: null';
  }
  return linjer.join('\n');
}

function norsk(n: number): string {
  return String(n).replace('.', ',');
}

/** Beskrivelsen av PR-en med forslagene. */
export function forslagstekst(endringer: readonly Verdiendring[], feiledeTester: readonly string[], kontrollsak: string | null): string {
  return [
    'Kildesjekken har funnet tall i kildene som er endret. Denne PR-en er et **forslag**: den oppdaterer tallene og sitatene i regelfilene, og setter `kontrollert: null`. Ingenting endres i appen før du fletter.',
    '',
    '## Endringer',
    '',
    '| Verdi | Fra | Til | Sitat i kilden nå |',
    '|---|---|---|---|',
    ...endringer.map((e) => `| \`${e.id}\` | ${norsk(e.fra)} | ${e.til === null ? 'uendret (bare sitatet)' : norsk(e.til)} | ${e.nyttSitat.replace(/\|/g, '\\|')} |`),
    '',
    '## Tester',
    '',
    ...(feiledeTester.length === 0
      ? ['Alle testene består med de nye tallene.']
      : [
          'Disse testene feiler med de nye tallene. Fasittestene endres bare når du godkjenner det, så si fra til Claude hvordan de skal rettes:',
          '',
          ...feiledeTester.slice(0, 30).map((t) => `- ${t}`),
          ...(feiledeTester.length > 30 ? [`- … og ${feiledeTester.length - 30} til.`] : []),
        ]),
    '',
    '## Før du fletter',
    '',
    '- Sjekk tallene mot kilden.',
    '- Gjelder endringen en ny avtaleperiode (for eksempel en ny hovedtariffavtale), skal den ikke flettes. Da skal det lages en ny regelfil for perioden. Si fra til Claude.',
    '- Forklaringer og begreper som nevner tallet, oppdateres ikke automatisk. Se kontrollsaken for hva som kan være berørt.',
    ...(kontrollsak ? ['', `Kontrollsaken: ${kontrollsak}`] : []),
  ].join('\n');
}

/** Beskrivelsen av PR-en med nye Grep-data når testene feiler. */
export function grepforslagstekst(sammendrag: string, detaljer: readonly string[], feiledeTester: readonly string[]): string {
  return [
    'Grep er endret slik at testene feiler, og derfor er de nye dataene ikke tatt inn automatisk. Denne PR-en har de nye dataene, så du og Claude kan se hva som må rettes.',
    '',
    `**Endringer:** ${sammendrag}`,
    '',
    ...detaljer.map((d) => `- ${d}`),
    '',
    '## Tester som feiler',
    '',
    ...feiledeTester.slice(0, 30).map((t) => `- ${t}`),
    '',
    'Si fra til Claude, som retter koblingene i regelfilene (for eksempel årstimetabellen) i denne PR-en. Flett når testene består.',
  ].join('\n');
}
