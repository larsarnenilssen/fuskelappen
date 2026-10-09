// Ukens kontroll (avgjørelse 106): fem punkter i kontrollsaken hver uke som eier ikke har kontrollert ennå, valgt etter
// risiko. Først regelverdiene i rules/ (tallene i kalkulatorene), så innholdet i modulene med størst juridisk
// betydning, så resten av innholdet, til slutt begrepene og det som bare gjelder ett fylke. Innenfor hvert nivå roterer
// utvalget med ukenummeret, så det som ikke krysses av, kommer igjen en senere uke, og det som er kontrollert, faller ut
// av seg selv. Avkrysningen har samme merke som kontrollrunden, så /godkjent virker som før (avgjørelse 021).
// Ren logikk, testes i tests/unit/ukenskontroll.test.ts.
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import type { Kildekontroll, Kontrollinnhold, Kontrollkilde, Kontrollverdi } from '../../src/core/kontroll/indeks.ts';
import { kildelenker } from '../kontroll/kildelenker.ts';

export const UKENS_ANTALL = 5;

/** Modulene med størst juridisk betydning: innholdet her kontrolleres før resten (eier 09.10.2026). */
export const TUNGE_MODULER: readonly string[] = ['tilrettelegging', 'skolemiljo', 'eksamen', 'inntak', 'vurdering', 'lov', 'opplaeringslop', 'arbeidstid'];


type Punkt = Kontrollverdi | Kontrollinnhold;

/** Uker siden mandag 5.1.1970. Øker med én hver mandag, så utvalget skifter hver uke. */
export function ukenummer(idag: string): number {
  return Math.floor((Date.parse(`${idag.slice(0, 10)}T00:00:00Z`) - Date.parse('1970-01-05T00:00:00Z')) / (7 * 86_400_000));
}

const modul = (fil: string) => fil.split('/')[1] ?? '';

/**
 * Risikonivået, lavest først: 0 regelverdier som ikke samsvarer automatisk med et sitat i kilden, 1 regelverdier som
 * samsvarer, 2 innhold i de tunge modulene, 3 annet innhold, 4 begreper og innhold som bare gjelder ett fylke.
 */
export function risikoniva(p: Punkt, fylkeinnhold: ReadonlySet<string> = new Set()): number {
  if (p.type === 'verdi') return p.auto?.status === 'samsvarer' ? 1 : 0;
  const m = modul(p.fil);
  if (m === 'begreper' || m === 'fylker' || p.elementtype === 'begrep' || fylkeinnhold.has(p.id)) return 4;
  return TUNGE_MODULER.includes(m) ? 2 : 3;
}

/** Det som ikke er kontrollert, én gang hvert. Verdier med avvik står allerede i saken for seg og er ikke med. */
export function ikkeKontrollert(indeks: readonly Kildekontroll[]): Punkt[] {
  const unike = new Map<string, Punkt>();
  for (const k of indeks) {
    for (const p of [...k.verdier, ...k.innhold]) {
      if (p.eier !== 'utkast' || unike.has(`${p.type}:${p.id}`)) continue;
      if (p.type === 'verdi' && p.auto?.status === 'avvik') continue;
      unike.set(`${p.type}:${p.id}`, p);
    }
  }
  return [...unike.values()];
}

/**
 * Ukens utvalg: punktene sortert etter risikonivå, og innenfor hvert nivå etter id, rotert med ukenummeret. De første
 * `antall` tas. Samme uke og samme status gir alltid samme utvalg.
 */
export function velgUkensKontroll(punkter: readonly Punkt[], idag: string, antall = UKENS_ANTALL, fylkeinnhold: ReadonlySet<string> = new Set()): Punkt[] {
  const uke = ukenummer(idag);
  const nivaer = new Map<number, Punkt[]>();
  for (const p of punkter) {
    const n = risikoniva(p, fylkeinnhold);
    nivaer.set(n, [...(nivaer.get(n) ?? []), p]);
  }
  const ut: Punkt[] = [];
  for (const n of [...nivaer.keys()].sort((a, b) => a - b)) {
    const liste = (nivaer.get(n) ?? []).sort((a, b) => `${a.type}:${a.id}`.localeCompare(`${b.type}:${b.id}`));
    const start = (uke * antall) % liste.length;
    ut.push(...liste.slice(start), ...liste.slice(0, start));
    if (ut.length >= antall) break;
  }
  return ut.slice(0, antall);
}

/** Tall på norsk: desimalkomma og mellomrom som tusenskille. */
function tall(n: number): string {
  const [heltall = '', desimaler] = String(n).split('.');
  const gruppert = heltall.length > 4 ? heltall.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : heltall;
  return desimaler ? `${gruppert},${desimaler}` : gruppert;
}

function visVerdi(v: Kontrollverdi): string {
  if (Array.isArray(v.verdi)) return `en liste eller tabell med ${v.verdi.length} rader`;
  const verdi = typeof v.verdi === 'number' ? tall(v.verdi) : String(v.verdi);
  return v.enhet ? `${verdi} ${v.enhet}` : verdi;
}

export interface Verdidetaljer {
  sitat?: string;
  merknad?: string;
}

export interface UkensKontroll {
  /** Delen i saken, med merkene rundt, eller tom når alt er kontrollert. */
  linjer: string[];
  antall: number;
}

/**
 * Lager delen «Ukens kontroll» i kontrollsaken: tittel, verdi eller kontrollspørsmål og kildene med lenke for hvert
 * punkt, og hvor mye som ikke er kontrollert ennå.
 */
export function lagUkensKontroll(
  indeks: readonly Kildekontroll[],
  register: Pick<Kilderegister, 'kilder'>,
  idag: string,
  repo: string,
  valg: { antall?: number; fylkeinnhold?: ReadonlySet<string>; verdidetaljer?: ReadonlyMap<string, Verdidetaljer> } = {},
): UkensKontroll {
  const alle = ikkeKontrollert(indeks);
  const utvalg = velgUkensKontroll(alle, idag, valg.antall ?? UKENS_ANTALL, valg.fylkeinnhold);
  if (utvalg.length === 0) return { linjer: [], antall: 0 };
  const kildelinje = (kilder: readonly Kontrollkilde[]) => {
    const tekst = kildelenker(kilder, register);
    return tekst ? [`  - Kilder å sjekke mot: ${tekst}`] : [];
  };
  const punkter = utvalg.flatMap((p) => {
    if (p.type === 'verdi') {
      const d = valg.verdidetaljer?.get(p.id);
      const kilder = indeks.filter((k) => k.verdier.some((v) => v.id === p.id)).map((k) => ({ id: k.kilde, punkt: p.punkt, url: null }));
      const grunnlag =
        p.grunnlag === 'avledet' ? 'Regnet ut fra andre verdier, står ikke direkte i kilden.' : p.grunnlag === 'praksis' ? 'Bygger på praksis, står ikke i kilden.' : p.auto?.status === 'samsvarer' ? 'Tallet står i sitatet i kilden (automatisk sjekk). Tolkningen er ikke sjekket.' : 'Ikke sjekket automatisk mot kilden.';
      return [
        `- [ ] Regelverdien \`${p.id}\`: ${visVerdi(p)} <!-- kontroll:verdi:${p.id} -->`,
        ...(d?.sitat ? [`  - Sitat: «${d.sitat.replace(/\s+/g, ' ').trim()}»`] : []),
        ...(d?.merknad ? [`  - Merknad: ${d.merknad.replace(/\s+/g, ' ').trim()}`] : []),
        `  - ${grunnlag}`,
        ...kildelinje(kilder),
      ];
    }
    return [
      `- [ ] «${p.tittel}» (${p.elementtype} i [${p.fil}](https://github.com/${repo}/blob/main/${p.fil})) <!-- kontroll:innhold:${p.id} -->`,
      ...(p.sporsmal.length > 0 ? p.sporsmal.map((s) => `  - Spørsmål: ${s}`) : ['  - Ingen kontrollspørsmål. Les teksten mot kilden.']),
      ...kildelinje(p.kilder),
    ];
  });
  const verdier = alle.filter((p) => p.type === 'verdi').length;
  const innhold = alle.length - verdier;
  return {
    antall: utvalg.length,
    linjer: [
      '## Ukens kontroll',
      '',
      `${utvalg.length === 1 ? 'Ett punkt' : `${utvalg.length} punkter`} du ikke har kontrollert ennå, valgt etter risiko: tallene i kalkulatorene først, så tekstene med størst juridisk betydning, til slutt begreper og fylkenes egne regler. Les det opp mot kildene og spørsmålene. Kryss av det som stemmer, og skriv \`/godkjent\`. Det du ikke krysser av, kommer igjen en senere uke. Er noe feil, skriv det til Claude.`,
      '',
      ...punkter,
      '',
      `Ikke kontrollert ennå: ${verdier} ${verdier === 1 ? 'regelverdi' : 'regelverdier'} og ${innhold} ${innhold === 1 ? 'tekst' : 'tekster'}.`,
      '',
    ],
  };
}
