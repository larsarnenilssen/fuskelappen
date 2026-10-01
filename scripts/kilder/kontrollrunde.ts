// Kontrollrundene: to ganger i året (første mandag i mai, når hovedtariffavtalen endres, og første mandag i
// august, før skoleåret) lager kildejobben en egen sak med praksis og tolkninger som bør bekreftes, og innhold
// som bør kontrolleres på nytt. Ren logikk, testes i tests/unit/kontrollrunde.test.ts (avgjørelse 019).
import type { Praksis } from '../../src/core/innhold/skjema.ts';
import type { Kildekontroll, Kontrollinnhold, Kontrollverdi } from '../../src/core/kontroll/indeks.ts';
import { tellKontroll } from '../../src/core/kontroll/indeks.ts';

export const RUNDEETIKETT = 'kontrollrunde';

const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
const RUNDEMANEDER = new Set([5, 8]);

/** Perioden for kontrollrunden («2026-08») hvis datoen er i den første uken i mai eller august, ellers null. */
export function rundeperiode(idag: string): string | null {
  const maned = Number(idag.slice(5, 7));
  const dag = Number(idag.slice(8, 10));
  return RUNDEMANEDER.has(maned) && dag <= 7 ? idag.slice(0, 7) : null;
}

/** Praksis som ikke er bekreftet, eller som ble bekreftet for mer enn 12 måneder siden. */
export function praksisTilBekreftelse(praksis: readonly Praksis[], idag: string): Praksis[] {
  const grense = `${Number(idag.slice(0, 4)) - 1}${idag.slice(4, 10)}`;
  return praksis.filter((p) => p.bekreftet === null || p.bekreftet.dato < grense);
}

export function rundemerke(periode: string): string {
  return `<!-- protokollen-kontrollrunde:${periode} -->`;
}

function dato(iso: string): string {
  const [aar, mnd, dag] = iso.slice(0, 10).split('-');
  return `${dag}.${mnd}.${aar}`;
}

export interface Kontrollrunde {
  tittel: string;
  tekst: string;
}

/**
 * Lager saken for kontrollrunden. praksis er det som bør bekreftes (ikke bekreftet, eller bekreftet for mer
 * enn 12 måneder siden). Innhold og verdier som eier har kontrollert, men som er gamle eller har endret kilde,
 * får et avkrysningspunkt. Det som ikke er kontrollert ennå, telles bare, med lenke til kontrolloversikten.
 */
export function lagKontrollrunde(
  periode: string,
  praksis: readonly Praksis[],
  indeks: readonly Kildekontroll[],
  repo: string,
  /** Lenker til Vilbli som sjekkes for hånd (avgjørelse 027). */
  lenker: readonly { tekst: string; url: string }[] = [],
): Kontrollrunde {
  const [aar, maned] = periode.split('-');
  const nr = Number(maned);
  const navn = MANEDER[nr - 1] ?? periode;
  const innledning =
    nr === 8 ? 'Før skoleåret starter' : nr === 5 ? 'Når hovedtariffavtalen endres 1. mai' : 'I denne ekstra runden';
  const sett = new Map<string, Kontrollverdi | Kontrollinnhold>();
  for (const k of indeks) for (const p of [...k.verdier, ...k.innhold]) if (!sett.has(`${p.type}:${p.id}`)) sett.set(`${p.type}:${p.id}`, p);
  const gamle = [...sett.values()].filter((p) => p.eier === 'bor_kontrolleres' || p.eier === 'kilde_endret');
  const t = tellKontroll(indeks);
  const oversikt = `https://github.com/${repo}/blob/main/docs/KONTROLL.md`;
  const tekst = [
    `Kontrollrunden i ${navn} ${aar ?? ''}. ${innledning} går du gjennom det appen bygger på uten at det står i kildene, og det som bør kontrolleres på nytt. Kryss av det som fortsatt stemmer, og skriv \`/godkjent\` i en kommentar. Da legges datoen inn automatisk. Er noe endret, skriv det til Claude.`,
    '',
    '## Praksis og tolkninger',
    '',
    ...(praksis.length === 0
      ? ['Alt er bekreftet de siste 12 månedene.', '']
      : praksis.flatMap((p) => [
          `- [ ] **${p.tittel}:** ${p.sporsmal} <!-- praksis:${p.id} -->`,
          `  - Appen: ${p.appen}`,
          `  - Grunnlag: ${p.grunnlag} Sist bekreftet: ${p.bekreftet ? dato(p.bekreftet.dato) : 'aldri'}.`,
        ])),
    '',
    '## Bør kontrolleres på nytt',
    '',
    ...(gamle.length === 0
      ? ['Ingenting av det du har kontrollert, er eldre enn 12 måneder eller har endret kilde.']
      : gamle.map((p) => {
          const hva = p.type === 'verdi' ? `Regelverdien \`${p.id}\`` : `«${p.tittel}» (${p.elementtype})`;
          const hvorfor = p.eier === 'kilde_endret' ? 'kilden er endret etter kontrollen' : 'kontrollert for mer enn 12 måneder siden';
          return `- [ ] ${hva}: ${hvorfor} (${p.kontrollert ? dato(p.kontrollert) : '–'}). <!-- kontroll:${p.type}:${p.id} -->`;
        })),
    '',
    ...(lenker.length > 0
      ? [
          '## Lenker til Vilbli',
          '',
          'Lenkene fra tilbudene til skolene på Vilbli kan ikke sjekkes automatisk. Åpne dem, og kryss av når riktig side med skoler vises. Virker en lenke ikke, skriv hvordan adressen ser ut når du finner siden selv på Vilbli.',
          '',
          ...lenker.map((l, i) => `- [ ] [${l.tekst}](${l.url}) <!-- vilbli:${i + 1} -->`),
          '',
        ]
      : []),
    '## Ikke kontrollert ennå',
    '',
    `${t.ikkeKontrollert} ${t.ikkeKontrollert === 1 ? 'begrep, forklaring eller verdi er' : 'begreper, forklaringer og verdier er'} ikke kontrollert. Kontrollspørsmålene til hver tekst står i [kontrolloversikten](${oversikt}). Ta gjerne noen av dem i denne runden.`,
    '',
    rundemerke(periode),
  ].join('\n');
  const antall = praksis.length + gamle.length + lenker.length;
  return { tittel: `Kontrollrunde ${navn} ${aar ?? ''}: ${antall} ${antall === 1 ? 'punkt' : 'punkter'}`, tekst };
}
