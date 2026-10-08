// Skissen til fase 9: brukerens egne lokale regler (docs/arbeidsordrer/fase-9-forslag.md). Finnes bare i utvikling og
// testversjonen. Reglene ligger i minnet og forsvinner når siden lastes på nytt. Den ferdige løsningen lagrer dem på
// enheten (et valgfritt felt i lagringen) og bruker dem i oppslaget skole → fylke → nasjonal.
import { hentVerdi } from '../../core/regler/index.ts';
import { iDag } from '../../data/skolear.ts';

/** Om skissen er med i dette bygget. Produksjonsbygget har den ikke. */
export const SKISSE = import.meta.env.MODE !== 'production' || __TESTVERSJON__;

/**
 * Verdiene i regelsettet som kan ha en lokal verdi i første omgang (forslag L1): de avtalen sier er et minimum, eller
 * som partene på skolen kan avtale noe annet om, og skoleåret. I den ferdige løsningen: `lokal: true` i rules/.
 */
export const LOKALE_VERDIER = [
  'sfs2213.planfestet_timer',
  'sfs2213.kontaktlaerer_reduksjon',
  'sfs2213.godtgjoring_kontaktlaerer',
  'sfs2213.godtgjoring_radgiver',
  'sfs2213.skolear_dager',
] as const;

export type Verdinokkel = (typeof LOKALE_VERDIER)[number];

/** Temaene, i rekkefølgen i skjemaet. Brukeren velger først hva endringen gjelder (eier 08.10.2026). */
export const TEMA = ['arbeidstid', 'skoleregler', 'fravaer', 'eksamen', 'inntak'] as const;
export type Tema = (typeof TEMA)[number];

/**
 * Det som kan endres lokalt under hvert tema: verdier i kalkulatorene og «tekst», en regel på siden for temaet. I den
 * ferdige løsningen kommer listen fra `lokal: true` i rules/ og `lokaleRegler` i manifestene, så nye sider, funksjoner
 * og kalkulatorer kommer med (eier 08.10.2026, forslag L7).
 */
export const VALG: Readonly<Record<Tema, readonly (Verdinokkel | 'tekst')[]>> = {
  arbeidstid: ['sfs2213.planfestet_timer', 'sfs2213.kontaktlaerer_reduksjon', 'sfs2213.godtgjoring_kontaktlaerer', 'sfs2213.godtgjoring_radgiver', 'sfs2213.skolear_dager', 'tekst'],
  skoleregler: ['tekst'],
  fravaer: ['tekst'],
  eksamen: ['tekst'],
  inntak: ['tekst'],
};

/** Verdier for funksjoner, som kan oppgis i prosent av en stilling i stedet for årsrammetimer (eier 08.10.2026). */
export const I_PROSENT: readonly Verdinokkel[] = ['sfs2213.kontaktlaerer_reduksjon'];

export type Regelstatus = 'egen' | 'innmeldt' | 'godkjent';

export interface EgenRegel {
  /** Koden for innmeldingen, f.eks. «LR-7K3Q». Den godkjente regelen får samme kode, så kopien kan byttes ut. */
  kode: string;
  type: 'verdi' | 'regel';
  niva: 'fylke' | 'skole';
  /** Verdier erstatter den nasjonale, regler på en side kommer i tillegg (forslag L1). */
  forhold: 'erstatter' | 'supplerer';
  nokkel?: Verdinokkel;
  verdi?: number;
  tema: Tema;
  /** Koden til en godkjent regel som denne endrer. Brukerens versjon gjelder da for brukeren i stedet for den godkjente. */
  endrer?: string;
  tittel?: string;
  tekst?: string;
  lenke?: string;
  merknad?: string;
  lagtInn: string;
  gjelderFra?: string;
  gjelderTil?: string;
  innmeldt?: string;
  /** Bare i skissen: datoen eier godkjente regelen. I den ferdige løsningen står den i innholdet (`kontrollert`). */
  godkjent?: string;
}

export function status(r: EgenRegel): Regelstatus {
  return r.godkjent ? 'godkjent' : r.innmeldt ? 'innmeldt' : 'egen';
}

const TEGN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** En kort kode uten tegn som er lette å forveksle (0/O, 1/I). Ikke en personopplysning. */
export function nyKode(): string {
  let kode = 'LR-';
  for (let i = 0; i < 4; i++) kode += TEGN[Math.floor(Math.random() * TEGN.length)];
  return kode;
}

// Eksemplene i skissen: én verdi som bare er lagret, én regel som er meldt inn, og én regel eier har godkjent.
let regler: EgenRegel[] = [
  {
    kode: 'LR-7K3Q',
    type: 'verdi',
    niva: 'skole',
    forhold: 'erstatter',
    nokkel: 'sfs2213.planfestet_timer',
    tema: 'arbeidstid',
    verdi: 1100,
    merknad: 'Lokal avtale om arbeidstid for skoleåret 2026–27',
    lagtInn: '2026-10-08',
    gjelderFra: '2026-08-01',
    gjelderTil: '2027-07-31',
  },
  {
    kode: 'LR-M4TP',
    type: 'regel',
    niva: 'skole',
    forhold: 'supplerer',
    tema: 'skoleregler',
    tittel: 'Mobilen i hylla i timene',
    tekst: 'Elevene legger mobilen i mobilhylla i klasserommet når timen begynner, og henter den når timen er slutt. Læreren kan gi lov til å bruke den i undervisningen.',
    lenke: 'https://example.no/skolen/ordensregler',
    lagtInn: '2026-10-06',
    innmeldt: '2026-10-06',
  },
  {
    kode: 'LR-9HWD',
    type: 'regel',
    niva: 'skole',
    forhold: 'supplerer',
    tema: 'eksamen',
    tittel: 'Oppmøte til skriftlig eksamen',
    tekst: 'Elevene møter i kantina 30 minutter før eksamen begynner. Mobilen leveres ved inngangen.',
    lenke: 'https://example.no/skolen/eksamen',
    lagtInn: '2026-10-01',
    innmeldt: '2026-10-01',
    godkjent: '2026-10-03',
  },
];

/**
 * Bare i skissen: en verdi eier har godkjent for skolen, som den vises for alle som har valgt skolen. I den ferdige
 * løsningen står den i rules/ med gyldighet for skolen.
 */
export const GODKJENT_VERDI: EgenRegel = {
  kode: 'LR-2FXB',
  type: 'verdi',
  niva: 'skole',
  forhold: 'erstatter',
  tema: 'arbeidstid',
  nokkel: 'sfs2213.planfestet_timer',
  verdi: 1100,
  merknad: 'Lokal avtale om arbeidstid for skoleåret 2026–27',
  lagtInn: '2026-09-20',
  gjelderFra: '2026-08-01',
  gjelderTil: '2027-07-31',
  innmeldt: '2026-09-20',
  godkjent: '2026-09-24',
};

const lyttere = new Set<() => void>();

export function hentRegler(): readonly EgenRegel[] {
  return regler;
}

export function finnRegel(kode: string): EgenRegel | undefined {
  return [...regler, GODKJENT_VERDI].find((r) => r.kode === kode);
}

export function lagreRegel(regel: EgenRegel): void {
  regler = [...regler.filter((r) => r.kode !== regel.kode), regel];
  for (const l of lyttere) l();
}

export function slettRegel(kode: string): void {
  regler = regler.filter((r) => r.kode !== kode);
  for (const l of lyttere) l();
}

export function lytt(lytter: () => void): () => void {
  lyttere.add(lytter);
  return () => lyttere.delete(lytter);
}

/** Den nasjonale verdien som gjelder i dag, fra regelsettet. */
export function nasjonalVerdi(nokkel: Verdinokkel | 'sfs2213.arsramme_funksjon') {
  return hentVerdi(nokkel, { dato: iDag() });
}

/**
 * Innmeldingen i fast form, som YAML, så Claude kan legge den inn uten å tolke (arbeidsordren, «Tekniske hensyn»).
 * Navn og underskrifter er ikke med. Skolen er med som nummer fra Nasjonalt skoleregister og navn.
 */
export function innmelding(
  r: EgenRegel,
  sted: { fylke: string; fylkesnavn: string; skole: { id: string | null; navn: string } | null },
  malform: 'nb' | 'nn',
  versjon: string,
  idag: string,
): string[] {
  const sitat = (s: string) => JSON.stringify(s);
  const linjer = [
    'lokal_regel:',
    `  kode: ${r.kode}`,
    `  type: ${r.type}`,
    `  niva: ${r.niva}`,
    `  fylke: "${sted.fylke}" # ${sted.fylkesnavn}`,
  ];
  if (r.niva === 'skole' && sted.skole) linjer.push(`  skole: "${sted.skole.id ?? ''}" # ${sted.skole.navn}`);
  linjer.push(`  forhold: ${r.forhold}`, `  tema: ${r.tema}`);
  if (r.endrer) linjer.push(`  endrer: ${r.endrer}`);
  if (r.type === 'verdi') {
    const n = r.nokkel ? String(nasjonalVerdi(r.nokkel).verdi) : '';
    linjer.push(`  nokkel: ${r.nokkel ?? ''}`, `  verdi: ${r.verdi ?? ''}`, `  nasjonal_verdi: ${n}`);
  } else {
    linjer.push(`  malform: ${malform}`, `  tittel: ${sitat(r.tittel ?? '')}`, `  tekst: ${sitat(r.tekst ?? '')}`);
  }
  if (r.gjelderFra) linjer.push(`  gjelder_fra: ${r.gjelderFra}`);
  if (r.gjelderTil) linjer.push(`  gjelder_til: ${r.gjelderTil}`);
  if (r.lenke) linjer.push(`  lenke: ${r.lenke}`);
  if (r.merknad) linjer.push(`  merknad: ${sitat(r.merknad)}`);
  linjer.push(`  lagt_inn: ${r.lagtInn}`, `  meldt_inn: ${r.innmeldt ?? idag}`, `  versjon: ${versjon}`);
  return linjer;
}
