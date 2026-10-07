// Oppslag i UI-tekstene. Rene funksjoner; Preact-kroken ligger i app/tilstand.
// Tekstene for hver målform er en egen bit som lastes når den trengs (avgjørelse 083): ved oppstart bare målformen
// brukeren har valgt, og den andre når brukeren bytter.
import type { Malform, Tekster, Tekstnokkel } from '../../strings/typer.ts';
import type { Flerspraak } from '../innhold/skjema.ts';

export type { Malform, Tekstnokkel };

const lastere: Record<Malform, () => Promise<Tekster>> = {
  nb: () => import('../../strings/nb.ts').then((m) => m.nb),
  nn: () => import('../../strings/nn.ts').then((m) => m.nn),
};

/** Tekstene som er lastet. */
const tekstTabeller: Partial<Record<Malform, Tekster>> = {};
const lasting: Partial<Record<Malform, Promise<void>>> = {};

export function teksterLastet(malform: Malform): boolean {
  return tekstTabeller[malform] !== undefined;
}

/** Laster tekstene for målformen. Prøves på nytt neste gang hvis lastingen feiler. */
export function lastTekster(malform: Malform): Promise<void> {
  if (teksterLastet(malform)) return Promise.resolve();
  lasting[malform] ??= lastere[malform]().then(
    (tabell) => {
      tekstTabeller[malform] = tabell;
    },
    (feil: unknown) => {
      delete lasting[malform];
      throw feil;
    },
  );
  return lasting[malform];
}

/** Begge målformene, f.eks. for søkeindeksen og testene. */
export async function lastAlleTekster(): Promise<void> {
  await Promise.all([lastTekster('nb'), lastTekster('nn')]);
}

export type Verdier = Record<string, string | number>;

function slaaOpp(tabell: unknown, nokkel: string): string | undefined {
  let node: unknown = tabell;
  for (const del of nokkel.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[del];
  }
  return typeof node === 'string' ? node : undefined;
}

export function fyllInn(mal: string, verdier?: Verdier): string {
  if (!verdier) return mal;
  return mal.replace(/\{(\w+)\}/g, (hele, navn: string) => (navn in verdier ? String(verdier[navn]) : hele));
}

export function hentTekst(malform: Malform, nokkel: Tekstnokkel, verdier?: Verdier): string {
  const annen: Malform = malform === 'nb' ? 'nn' : 'nb';
  const mal = slaaOpp(tekstTabeller[malform], nokkel) ?? slaaOpp(tekstTabeller[annen], nokkel) ?? nokkel;
  return fyllInn(mal, verdier);
}

/** En tekst er enten en nøkkel i strings eller en ferdig nb/nn-tekst fra innholdet. */
export type Tekstverdi = Tekstnokkel | Flerspraak;

export function visTekst(verdi: Tekstverdi, malform: Malform): string {
  return typeof verdi === 'string' ? hentTekst(malform, verdi) : verdi[malform];
}

/**
 * Et nb/nn-par som slås opp først når det leses. Slik blir ikke målformen som ennå ikke er lastet, låst til teksten fra
 * den andre: favoritter, søkeoppføringer og kalenderdata lages med begge målformene, men bare den valgte er lastet.
 */
export function latBegge(lag: (m: Malform) => string): Flerspraak {
  return {
    get nb() {
      return lag('nb');
    },
    get nn() {
      return lag('nn');
    },
  };
}

export function begge(verdi: Tekstverdi): Flerspraak {
  return typeof verdi === 'string' ? latBegge((m) => hentTekst(m, verdi)) : verdi;
}

/** Tall med høyst `desimaler` desimaler. `minst` gir faste desimaler, f.eks. 2 for kronebeløp (1 748,80). */
export function formaterTall(tall: number, desimaler = 2, minst = 0): string {
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: desimaler, minimumFractionDigits: Math.min(minst, desimaler) }).format(tall);
}

export function formaterDato(iso: string, malform: Malform): string {
  const dato = new Date(iso);
  if (Number.isNaN(dato.getTime())) return iso;
  return new Intl.DateTimeFormat(malform === 'nn' ? 'nn-NO' : 'nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }).format(dato);
}

/** Dato og klokkeslett i norsk tid, f.eks. «mandag 5. oktober 2026 kl. 06:17». */
export function formaterTidspunkt(iso: string, malform: Malform): string {
  const dato = new Date(iso);
  if (Number.isNaN(dato.getTime())) return iso;
  return new Intl.DateTimeFormat(malform === 'nn' ? 'nn-NO' : 'nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Oslo',
  }).format(dato);
}
