// Godkjenning med avkrysning (avgjørelse 021): eier krysser av punkter i en kontrollsak eller kontrollrunde og
// skriver /godkjent i en kommentar. Da settes datoen for det som er godkjent. Ren logikk; godkjenn.ts leser
// saken, endrer filene og lagrer. Testes i tests/unit/godkjenning.test.ts.

export type Godkjenning =
  | { type: 'kilde'; id: string; fingeravtrykk: string }
  | { type: 'praksis'; id: string }
  | { type: 'innhold'; id: string }
  | { type: 'verdi'; id: string };

/**
 * Punktene eier har krysset av i saken: «- [x] … <!-- merke -->». Tallforslag (verdi:) og Grep godkjennes ved
 * å flette PR-en, så de gir ingen godkjenning her.
 */
export function avkryssede(tekst: string): Godkjenning[] {
  const ut: Godkjenning[] = [];
  for (const m of tekst.matchAll(/^\s*- \[[xX]\] .*?<!-- ([a-z-]+):(.+?) -->\s*$/gm)) {
    const [, type, rest = ''] = m;
    if (type === 'godkjenn-kilde') {
      const i = rest.indexOf(':');
      const fingeravtrykk = rest.slice(i + 1);
      if (i > 0 && fingeravtrykk.startsWith('sha256:')) ut.push({ type: 'kilde', id: rest.slice(0, i), fingeravtrykk });
    } else if (type === 'praksis') {
      ut.push({ type: 'praksis', id: rest });
    } else if (type === 'kontroll') {
      const i = rest.indexOf(':');
      const hva = rest.slice(0, i);
      if (hva === 'innhold' || hva === 'verdi') ut.push({ type: hva, id: rest.slice(i + 1) });
    }
  }
  return ut;
}

/** Id-ene eier har skrevet etter /godkjent, f.eks. «/godkjent arsverk, planleggingsdager». */
export function kommandoIder(kommentar: string): string[] {
  const linje = /^\/godkjent\b(.*)$/m.exec(kommentar.trim())?.[1] ?? '';
  return linje
    .split(/[\s,]+/)
    .map((s) => s.trim().replace(/^`|`$/g, ''))
    .filter(Boolean);
}

function blokk(linjer: string[], start: number, innrykk: number): number {
  const mønster = new RegExp(`^ {0,${innrykk}}\\S`);
  const slutt = linjer.findIndex((l, i) => i > start && (mønster.test(l) || l.startsWith(`${' '.repeat(innrykk)}- `)));
  return slutt < 0 ? linjer.length : slutt;
}

/** Setter en linje i blokken som begynner på linjen start. Kaster hvis feltet ikke finnes i blokken. */
function settFelt(linjer: string[], start: number, innrykk: number, felt: string, verdi: string): void {
  const slutt = blokk(linjer, start, innrykk);
  const prefiks = `${' '.repeat(innrykk + 2)}${felt}: `;
  for (let i = start; i < slutt; i++) {
    const linje = linjer[i] as string;
    const innhold = i === start ? linje.replace(/^(\s*)- /, '$1  ') : linje;
    if (innhold.startsWith(prefiks)) {
      linjer[i] = linje.slice(0, linje.length - innhold.length + prefiks.length) + verdi;
      return;
    }
  }
  throw new Error(`Fant ikke ${felt} for elementet på linje ${start + 1}.`);
}

function dato(d: string): string {
  return `{ dato: "${d}" }`;
}

/** kontrollert for et innholdselement («- id: x» øverst i filen). */
export function settKontrollertInnhold(yaml: string, id: string, d: string): string | null {
  const linjer = yaml.split('\n');
  const start = linjer.findIndex((l) => l === `- id: ${id}`);
  if (start < 0) return null;
  settFelt(linjer, start, 0, 'kontrollert', dato(d));
  return linjer.join('\n');
}

/** kontrollert for en regelverdi («  nøkkel:» under verdier). */
export function settKontrollertVerdi(yaml: string, nokkel: string, d: string): string | null {
  const linjer = yaml.split('\n');
  const start = linjer.findIndex((l) => l === `  ${nokkel}:`);
  if (start < 0) return null;
  const slutt = blokk(linjer, start, 2);
  const i = linjer.findIndex((l, n) => n > start && n < slutt && l.startsWith('    kontrollert: '));
  if (i < 0) return null;
  linjer[i] = `    kontrollert: ${dato(d)}`;
  return linjer.join('\n');
}

/** bekreftet for en praksis i content/kontroll/praksis.yaml. */
export function settBekreftet(yaml: string, id: string, d: string): string | null {
  const linjer = yaml.split('\n');
  const start = linjer.findIndex((l) => l === `  - id: ${id}`);
  if (start < 0) return null;
  settFelt(linjer, start, 2, 'bekreftet', dato(d));
  return linjer.join('\n');
}

/** godkjent_fingeravtrykk for en kilde i content/kilder.yaml, med en kommentar om hvem og når. */
export function settFingeravtrykk(yaml: string, id: string, fingeravtrykk: string, d: string, sak: string): string | null {
  const linjer = yaml.split('\n');
  const start = linjer.findIndex((l) => l === `  - id: ${id}`);
  if (start < 0) return null;
  const slutt = blokk(linjer, start, 2);
  const i = linjer.findIndex((l, n) => n > start && n < slutt && l.startsWith('    godkjent_fingeravtrykk: '));
  if (i < 0) return null;
  linjer[i] = `    godkjent_fingeravtrykk: ${fingeravtrykk}`;
  const kommentar = `    # Godkjent av eier ${d} (sak #${sak}).`;
  if (/^ {4}# Godkjent av eier/.test(linjer[i - 1] ?? '')) linjer[i - 1] = kommentar;
  else linjer.splice(i, 0, kommentar);
  return linjer.join('\n');
}

export function beskriv(g: Godkjenning): string {
  switch (g.type) {
    case 'kilde':
      return `nytt fingeravtrykk for kilden \`${g.id}\``;
    case 'praksis':
      return `praksisen \`${g.id}\` er bekreftet`;
    case 'innhold':
      return `\`${g.id}\` er kontrollert`;
    default:
      return `regelverdien \`${g.id}\` er kontrollert`;
  }
}
