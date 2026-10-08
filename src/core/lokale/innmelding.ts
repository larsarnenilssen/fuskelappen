// Innmeldingen av en lokal regel på e-post (fase 9, avgjørelse 093). Regelen står i fast form (YAML), så Claude kan
// legge den inn i lokale/regler.yaml uten å tolke den. Navn og underskrifter er ikke med. Skolen er med som nummer fra
// Nasjonalt skoleregister og navn. Rene funksjoner.
import type { EgenRegel } from './skjema.ts';

const TEGN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** En kort kode uten tegn som er lette å forveksle (0/O, 1/I). Tilfeldig og ingen personopplysning. */
export function nyKode(tilfeldig: () => number = Math.random): string {
  let kode = 'LR-';
  for (let i = 0; i < 4; i++) kode += TEGN[Math.floor(tilfeldig() * TEGN.length)] ?? 'A';
  return kode;
}

/** Linjene med regelen i fast form. `nasjonal` er den nasjonale verdien for en verdi, til sammenligning. */
export function innmelding(
  r: EgenRegel,
  sted: { fylkesnavn: string; nasjonal: string | null },
  malform: 'nb' | 'nn',
  versjon: string,
  idag: string,
): string[] {
  const sitat = (s: string) => JSON.stringify(s);
  const linjer = ['lokal_regel:', `  kode: ${r.kode}`, `  tema: ${r.tema}`, `  type: ${r.type}`, `  niva: ${r.niva}`, `  fylke: "${r.fylke}" # ${sted.fylkesnavn}`];
  if (r.niva === 'skole') linjer.push(`  skole: "${r.skole ?? ''}" # ${r.stedsnavn}`);
  if (r.endrer) linjer.push(`  endrer: ${r.endrer}`);
  if (r.type === 'verdi') {
    linjer.push(`  nokkel: ${r.nokkel ?? ''}`, `  verdi: ${r.verdi ?? ''}`);
    if (sted.nasjonal !== null) linjer.push(`  nasjonal_verdi: ${sted.nasjonal}`);
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
