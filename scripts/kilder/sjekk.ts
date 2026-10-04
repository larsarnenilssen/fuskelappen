// Kildejobben: sjekker aktive kilder og skriver data/status/kildestatus.json.
// Bruk: npm run kilder:sjekk [-- --simuler-feil=<kilde-id>]
// Varsler (GitHub-issues) sendes av scripts/kilder/varsle.ts etterpå.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Fylker, Kilde, Kilderegister } from '../../src/core/innhold/skjema.ts';
import { lesKildestatus, type Kildestatusfil, type KildestatusPost } from '../../src/core/kildestatus/kildestatus.ts';
import { lesVerdistatus, medTabellstatus, sjekkbareVerdier, sjekkVerdier, verdinokkel, type Verdistatusfil } from '../../src/core/kontroll/verdisjekk.ts';
import type { Tabellrad } from '../../src/core/regler/skjema.ts';
import { dokumenttekst, type Lovdokument } from '../../src/modules/lov/typer.ts';
import { velgPeriode } from '../../src/core/regler/motor.ts';
import { lesRegelsett } from '../innhold/alt.ts';
import { lesFil } from '../innhold/last.ts';
import { delIBiter, finnEndringer, lesKildetekst, type Kildetekstfil, type Tekstendring } from './avsnitt.ts';
import { antallEndringer, grepdetaljer, grepsammendrag, type Grependringer } from './grep.ts';
import { lagFingeravtrykk, nyPost, vurderMotGodkjent, type Sjekkresultat } from './logikk.ts';
import { sjekkKfInfoserie } from './kf-infoserie.ts';
import { sjekkLovdata } from './lovdata.ts';
import { hentSkoler, sjekkFil, sjekkSide, skoleendringer, type Skole } from './metoder.ts';
import { lesVedlegg1, sammenlignVedlegg1, sjekkGarantilonn, type Tabellresultat } from './tabeller.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const statusfil = join(rot, 'data/status/kildestatus.json');
const verdistatusfil = join(rot, 'data/status/verdistatus.json');
const kildetekstfil = join(rot, 'data/status/kildetekst.json');
const skolefil = join(rot, 'data/skoler/vgs.json');
const generert = join(rot, '.generert');

const simulertFeil = process.argv.find((a) => a.startsWith('--simuler-feil='))?.split('=')[1]?.trim() || null;

const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
const fylker = new Set((lesFil(rot, join(rot, 'content/fylker.yaml')) as Fylker).fylker.map((f) => f.nummer));

if (simulertFeil && !register.kilder.some((k) => k.id === simulertFeil && k.aktiv)) {
  console.error(`Ukjent eller inaktiv kilde for simulert feil: ${simulertFeil}`);
  process.exit(1);
}

function lesJson(fil: string): unknown {
  return existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as unknown) : null;
}

const forrige: Kildestatusfil | null = lesKildestatus(lesJson(statusfil));
const naa = new Date().toISOString();
const rapport: string[] = [];
// Teksten fra hver kilde, eller hvorfor den ikke kunne leses. Brukes av verdisjekken etterpå.
const tekster: Record<string, { tekst: string } | { feil: string }> = {};
// Dokumentet som HTML, for kilder med tabeller som sjekkes rad for rad (vedlegg 1).
const html: Record<string, string> = {};

async function sjekkNsr(kilde: Kilde): Promise<Sjekkresultat> {
  const skoler = await hentSkoler(fylker);
  const tidligere = (lesJson(skolefil) as { skoler?: Skole[] } | null)?.skoler ?? [];
  const endring = skoleendringer(tidligere, skoler);
  const endret = endring.nye.length + endring.fjernet.length + endring.endret.length > 0 || tidligere.length === 0;
  if (endret) {
    mkdirSync(join(rot, 'data/skoler'), { recursive: true });
    // Én skole per linje gir lesbare endringer i git.
    const linjer = skoler.map((s) => `    ${JSON.stringify(s)}`).join(',\n');
    const hode = `"kilde": ${JSON.stringify(kilde.id)}, "hentet": ${JSON.stringify(naa)}, "antall": ${skoler.length}`;
    writeFileSync(skolefil, `{\n  ${hode},\n  "skoler": [\n${linjer}\n  ]\n}\n`);
  }
  rapport.push(
    `### ${kilde.navn}`,
    `${skoler.length} aktive videregående skoler. Nye: ${endring.nye.length}, fjernet: ${endring.fjernet.length}, endret: ${endring.endret.length}.`,
    ...[
      ...endring.nye.map((s) => `- Ny: ${s.navn} (${s.id}, fylke ${s.fylke})`),
      ...endring.fjernet.map((s) => `- Fjernet: ${s.navn} (${s.id}, fylke ${s.fylke})`),
      ...endring.endret.map((s) => `- Endret: ${s.navn} (${s.id}, fylke ${s.fylke})`),
    ].slice(0, 50),
    '',
  );
  // Strukturerte data oppdateres automatisk; status er ok så lenge hentingen lykkes.
  return { status: 'ok', fingeravtrykk: lagFingeravtrykk(JSON.stringify(skoler)), melding: null };
}

/**
 * Grep hentes i et eget steg før kildesjekken (npm run hent:grep), og testene kjøres på de nye dataene.
 * Stemmer testene, tas dataene inn automatisk (eier 30.09.2026). Feiler de, er Grep endret slik at noe i
 * appen må rettes, og dataene er ikke tatt inn.
 */
function sjekkGrep(): Sjekkresultat {
  const endringsfil = join(generert, 'grep-endringer.json');
  if (!existsSync(endringsfil)) return { status: 'feilet', fingeravtrykk: null, melding: 'Hentingen fra Grep feilet. Se loggen for steget «Hent Grep».' };
  const { endringer } = JSON.parse(readFileSync(endringsfil, 'utf8')) as { endret: boolean; endringer: Grependringer | null };
  const tester = existsSync(join(generert, 'grep-tester.txt')) ? readFileSync(join(generert, 'grep-tester.txt'), 'utf8').trim() : 'ikke kjørt';
  // Fingeravtrykket er fagindeksen uten tidspunktet for hentingen (avgjørelse 049).
  const indeks = JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')) as Record<string, unknown>;
  const fingeravtrykk = lagFingeravtrykk(JSON.stringify({ ...indeks, hentet: '' }));
  rapport.push('### Grep', endringer ? grepsammendrag(endringer) : 'Første henting.', ...(endringer ? grepdetaljer(endringer).map((l) => `- ${l}`) : []), '');
  if (tester === 'feilet') {
    return { status: 'endret', fingeravtrykk, melding: `Grep er endret slik at testene feiler, og dataene er ikke tatt inn: ${endringer ? grepsammendrag(endringer) : ''}`.trim() };
  }
  const antall = endringer ? antallEndringer(endringer) : 0;
  return { status: 'ok', fingeravtrykk, melding: antall > 0 && endringer ? `Tatt inn automatisk: ${grepsammendrag(endringer)}` : null };
}

/**
 * Fag- og timefordelingen fra rundskrivet Udir-1 hentes i samme steg som Grep (npm run hent:udir), og testes
 * sammen med Grep-dataene. Stemmer testene, tas de inn automatisk (avgjørelse 024).
 */
function sjekkUdir(): Sjekkresultat {
  const endringsfil = join(generert, 'udir-endringer.json');
  if (!existsSync(endringsfil)) return { status: 'feilet', fingeravtrykk: null, melding: 'Hentingen av fag- og timefordelingen feilet. Se loggen for steget «Hent Grep og fag- og timefordeling».' };
  const e = JSON.parse(readFileSync(endringsfil, 'utf8')) as { rundskriv: string; skolear: string; forste: boolean; endringer: string[]; nyVersjon: string | null; varsler?: string[] };
  const varsler = e.varsler ?? [];
  const tester = existsSync(join(generert, 'grep-tester.txt')) ? readFileSync(join(generert, 'grep-tester.txt'), 'utf8').trim() : 'ikke kjørt';
  const fil = join(rot, 'data/udir', `fagfordeling-${e.skolear}.json`);
  const fingeravtrykk = existsSync(fil) ? lagFingeravtrykk(JSON.stringify((JSON.parse(readFileSync(fil, 'utf8')) as { tabeller: unknown }).tabeller)) : null;
  rapport.push(
    `### Fag- og timefordeling (${e.rundskriv}, skoleåret ${e.skolear.replace('-', '–')})`,
    e.forste ? 'Første henting.' : e.endringer.length === 0 ? 'Ingen endringer.' : `${e.endringer.length} endringer:`,
    ...e.endringer.slice(0, 60).map((l) => `- ${l}`),
    ...(e.nyVersjon ? [`- Nytt rundskriv er publisert: ${e.nyVersjon}.`] : []),
    ...varsler.map((v) => `- ${v}`),
    '',
  );
  const nytt = `${e.nyVersjon ? ` Nytt rundskriv er publisert: ${e.nyVersjon}.` : ''}${varsler.map((v) => ` ${v}`).join('')}`;
  if (tester === 'feilet' && e.endringer.length > 0) {
    return { status: 'endret', fingeravtrykk, melding: `Fag- og timefordelingen er endret slik at testene feiler, og endringene er ikke tatt inn (${e.endringer.length} endringer).${nytt}` };
  }
  if (e.nyVersjon) return { status: 'endret', fingeravtrykk, melding: `Nytt rundskriv om fag- og timefordeling er publisert: ${e.nyVersjon}. Det nye skoleåret må legges inn.${varsler.map((v) => ` ${v}`).join('')}` };
  if (varsler.length > 0) return { status: 'endret', fingeravtrykk, melding: varsler.join(' ') };
  return { status: 'ok', fingeravtrykk, melding: e.endringer.length > 0 ? `Tatt inn automatisk: ${e.endringer.length} endringer i fag- og timefordelingen.` : null };
}

/**
 * Dataene fra VIGO Kodeverksbase hentes i samme steg som Grep (npm run hent:vigo) og testes sammen med dem.
 * Stemmer testene, tas de inn automatisk (avgjørelse 026).
 */
function sjekkVigo(): Sjekkresultat {
  const endringsfil = join(generert, 'vigo-endringer.json');
  if (!existsSync(endringsfil)) return { status: 'feilet', fingeravtrykk: null, melding: 'Hentingen fra VIGO Kodeverksbase feilet. Se loggen for steget «Hent Grep og fag- og timefordeling».' };
  const e = JSON.parse(readFileSync(endringsfil, 'utf8')) as { forste: boolean; endringer: string[]; avvik?: string[] };
  const tester = existsSync(join(generert, 'grep-tester.txt')) ? readFileSync(join(generert, 'grep-tester.txt'), 'utf8').trim() : 'ikke kjørt';
  const avvik = e.avvik ?? [];
  const filer = ['fagrelasjoner', 'merknader', 'skolenummer'].map((f) => join(rot, 'data/vigo', `${f}.json`)).filter(existsSync);
  const fingeravtrykk = filer.length > 0 ? lagFingeravtrykk(filer.map((f) => readFileSync(f, 'utf8').replace(/"hentet": "[^"]*"/, '')).join('\n')) : null;
  rapport.push('### VIGO Kodeverksbase', e.forste ? 'Første henting.' : e.endringer.length === 0 ? 'Ingen endringer.' : `${e.endringer.length} endringer:`, ...e.endringer.slice(0, 60).map((l) => `- ${l}`), '');
  // VIGO kontrollerer årstimetallet og trekkordningen i fagindeksen fra Grep (fase 6). Avvikene står i kontrollsaken
  // så lenge de finnes, og er merket på fagarket.
  rapport.push('#### Grep kontrollert mot VIGO', avvik.length === 0 ? 'Årstimetallet og trekkordningen stemmer for alle fagene.' : `${avvik.length} avvik:`, ...avvik.slice(0, 60).map((l) => `- ${l}`), '');
  if (tester === 'feilet' && e.endringer.length > 0) return { status: 'endret', fingeravtrykk, melding: `Dataene fra VIGO Kodeverksbase er endret slik at testene feiler, og endringene er ikke tatt inn (${e.endringer.length} endringer).` };
  if (avvik.length > 0) return { status: 'endret', fingeravtrykk, melding: `Grep og VIGO er uenige om årstimetallet eller trekkordningen i ${avvik.length} fag. Se rapporten.` };
  return { status: 'ok', fingeravtrykk, melding: e.endringer.length > 0 ? `Tatt inn automatisk: ${e.endringer.length} endringer i VIGO Kodeverksbase.` : null };
}

/** Endringene fra en henting (.generert/<navn>-endringer.json), del for del. */
interface Delendring {
  endret?: boolean;
  forste: boolean;
  endringer: string[];
  feil?: string | null;
}

/**
 * En datakilde som hentes i samme steg som Grep og testes med de nye dataene (utdanning.no, NDLA og NOR, avgjørelse
 * 052 og 053). Stemmer testene, tas endringene inn automatisk og står til orientering i kontrollsaken. Feiler
 * hentingen av en del, blir forrige versjon stående.
 */
function sjekkHentet(tittel: string, endringsfil: string, deler: { navn: string; fil: string; hent: (e: Record<string, unknown>) => Delendring | undefined }[]): Sjekkresultat {
  const sti = join(generert, endringsfil);
  if (!existsSync(sti)) return { status: 'feilet', fingeravtrykk: null, melding: `Hentingen fra ${tittel} kjørte ikke. Se loggen for steget «Hent Grep, fag- og timefordeling, overordnet del og lovtekst».` };
  const e = JSON.parse(readFileSync(sti, 'utf8')) as Record<string, unknown>;
  const tester = existsSync(join(generert, 'grep-tester.txt')) ? readFileSync(join(generert, 'grep-tester.txt'), 'utf8').trim() : 'ikke kjørt';
  const resultater = deler.map((d) => ({ ...d, r: d.hent(e) }));
  const filer = resultater.map((d) => join(rot, d.fil)).filter((f) => existsSync(f));
  const fingeravtrykk = filer.length > 0 ? lagFingeravtrykk(filer.map((f) => readFileSync(f, 'utf8').replace(/"hentet": "[^"]*"/, '')).join('\n')) : null;
  rapport.push(`### ${tittel}`);
  for (const d of resultater) {
    const r = d.r;
    const linje = !r ? 'ikke hentet.' : r.feil ? r.feil : r.forste ? 'første henting.' : r.endringer.length === 0 ? 'ingen endringer.' : `${r.endringer.length} endringer:`;
    rapport.push(`- ${d.navn}: ${linje}`, ...(r && !r.feil ? r.endringer.slice(0, 30).map((l) => `  - ${l}`) : []));
  }
  rapport.push('');
  const feil = resultater.find((d) => !d.r || d.r.feil);
  const antall = resultater.reduce((n, d) => n + (d.r && !d.r.feil ? d.r.endringer.length : 0), 0);
  if (feil) return { status: 'feilet', fingeravtrykk, melding: `${feil.navn}: ${feil.r?.feil ?? 'ikke hentet'}. Appen viser forrige henting.` };
  if (tester === 'feilet' && antall > 0) return { status: 'endret', fingeravtrykk, melding: `${tittel} er endret slik at testene feiler, og endringene er ikke tatt inn (${antall} endringer).` };
  return { status: 'ok', fingeravtrykk, melding: antall > 0 ? `Tatt inn automatisk: ${antall} endringer fra ${tittel}.` : null };
}

const del = (nokkel: string | null) => (e: Record<string, unknown>) => (nokkel ? (e[nokkel] as Delendring | undefined) : (e as unknown as Delendring));

function sjekkUtdanning(kilde: Kilde): Sjekkresultat {
  if (kilde.id === 'utdanning-no-beskrivelser') return sjekkHentet('utdanning.no (beskrivelser)', 'utdanning-endringer.json', [{ navn: 'Yrkene', fil: 'data/utdanning/yrker.json', hent: del('yrker') }]);
  return sjekkHentet('utdanning.no', 'utdanning-endringer.json', [
    { navn: 'Løpene', fil: 'data/utdanning/lop.json', hent: del(null) },
    { navn: 'Skolene', fil: 'data/utdanning/skoler.json', hent: del('skoler') },
  ]);
}

/**
 * Eksamensdatoene fra udir.no og fylkenes sider (npm run hent:eksamen, avgjørelse 059), hentet i januar og august.
 * Endrede datoer tas inn automatisk. Er fylkene uenige uten at Udir har datoen, eller finner ikke et mønster datoen
 * lenger (siden kan være endret), blir det en kontrollsak. Datoer bare ett fylke har, står til orientering.
 */
function sjekkEksamen(): Sjekkresultat {
  const sti = join(generert, 'eksamen-endringer.json');
  if (!existsSync(sti)) return { status: 'feilet', fingeravtrykk: null, melding: 'Hentingen av eksamensdatoene kjørte ikke. Se loggen for steget «Hent Grep, fag- og timefordeling, overordnet del og lovtekst».' };
  const e = JSON.parse(readFileSync(sti, 'utf8')) as { hoppetOver?: boolean; forste: boolean; endringer: string[]; uenige: string[]; enKilde: string[]; mangler: string[] };
  const fil = join(rot, 'data/eksamen/datoer.json');
  const fingeravtrykk = existsSync(fil) ? lagFingeravtrykk(readFileSync(fil, 'utf8').replace(/"hentet": "[^"]*"/, '')) : null;
  if (e.hoppetOver) return { status: 'ok', fingeravtrykk, melding: null };
  rapport.push(
    '### Eksamensdatoer',
    e.forste ? 'Første henting.' : e.endringer.length === 0 ? 'Ingen endringer.' : `${e.endringer.length} endringer:`,
    ...e.endringer.map((l) => `- ${l}`),
    ...(e.uenige.length > 0 ? ['', 'Fylkene er uenige, og Udir har ikke datoen:', ...e.uenige.map((l) => `- ${l}`)] : []),
    ...(e.mangler.length > 0 ? ['', 'Fant ikke datoen (siden kan være endret):', ...e.mangler.map((l) => `- ${l}`)] : []),
    ...(e.enKilde.length > 0 ? ['', 'Bare ett fylke har datoen, så den er ikke tatt inn:', ...e.enKilde.map((l) => `- ${l}`)] : []),
    '',
  );
  if (e.uenige.length > 0 || e.mangler.length > 0) {
    return { status: 'endret', fingeravtrykk, melding: `Eksamensdatoene: ${e.uenige.length} uenige og ${e.mangler.length} som ikke ble funnet. Se rapporten.` };
  }
  return { status: 'ok', fingeravtrykk, melding: e.endringer.length > 0 ? `Tatt inn automatisk: ${e.endringer.length} endrede eksamensdatoer.` : null };
}

/** Resultatet av npm run hent:lovdata for hvert dokument (.generert/lovdata-endringer.json). */
interface Lovdataresultat {
  id: string;
  kilde: string;
  endringer: string[];
  feil: string | null;
  forste: boolean;
}

/**
 * Lov- og forskriftstekst fra Lovdata (avgjørelse 039) hentes i samme steg som Grep (npm run hent:lovdata), og vises
 * uendret. Endringer tas inn automatisk og står til orientering i kontrollsaken. Feiler hentingen, beholdes forrige tekst.
 */
function sjekkLovtekst(kilde: Kilde): Sjekkresultat {
  const endringsfil = join(generert, 'lovdata-endringer.json');
  if (!existsSync(endringsfil)) return { status: 'feilet', fingeravtrykk: null, melding: 'Hentingen av lov- og forskriftstekst kjørte ikke. Se loggen for steget «Hent Grep, fag- og timefordeling og overordnet del».' };
  const mine = (JSON.parse(readFileSync(endringsfil, 'utf8')) as { dokumenter: Lovdataresultat[] }).dokumenter.filter((d) => d.kilde === kilde.id);
  if (mine.length === 0) return { status: 'feilet', fingeravtrykk: null, melding: 'Kilden er ikke med i content/lovverk.yaml.' };
  const filer = mine.map((d) => join(rot, 'data/lovdata', `${d.id}.json`)).filter((f) => existsSync(f));
  const fingeravtrykk = filer.length > 0 ? lagFingeravtrykk(filer.map((f) => readFileSync(f, 'utf8')).join('\n')) : null;
  // Teksten i dokumentene, så verdisjekken kan se etter sitatene (f.eks. tallene for poengberegningen i rules/inntak).
  if (filer.length > 0) tekster[kilde.id] = { tekst: filer.map((f) => dokumenttekst(JSON.parse(readFileSync(f, 'utf8')) as Lovdokument)).join('\n') };
  const endringer = mine.flatMap((d) => d.endringer);
  rapport.push(
    `### ${kilde.navn}`,
    ...mine.map((d) => (d.feil ? `- ${d.id}: ${d.feil}` : d.forste ? `- ${d.id}: første henting.` : `- ${d.id}: ${d.endringer.length === 0 ? 'ingen endringer' : `${d.endringer.length} endringer`}.`)),
    ...endringer.slice(0, 60).map((l) => `  - ${l}`),
    '',
  );
  const feil = mine.find((d) => d.feil);
  if (feil) return { status: 'feilet', fingeravtrykk, melding: `${feil.feil} Appen viser forrige henting.` };
  return { status: 'ok', fingeravtrykk, melding: endringer.length > 0 ? `Tatt inn automatisk: ${endringer.length === 1 ? 'én endring' : `${endringer.length} endringer`} i teksten.` : null };
}

async function sjekk(kilde: Kilde): Promise<Sjekkresultat> {
  if (kilde.id === simulertFeil) {
    tekster[kilde.id] = { feil: 'Simulert feil.' };
    return { status: 'feilet', fingeravtrykk: null, melding: 'Simulert feil (manuell test av varsling).' };
  }
  try {
    switch (kilde.sjekkmetode) {
      case 'side': {
        const { fingeravtrykk, tekst, nettleser } = await sjekkSide(kilde);
        tekster[kilde.id] = { tekst };
        if (nettleser) rapport.push(`### ${kilde.navn}`, 'Lest med nettleser, fordi siden ikke svarte på vanlig henting.', '');
        return vurderMotGodkjent(fingeravtrykk, kilde.godkjent_fingeravtrykk);
      }
      case 'nsr':
        return await sjekkNsr(kilde);
      case 'grep':
        return sjekkGrep();
      case 'udir-fagfordeling':
        return sjekkUdir();
      case 'lovtekst':
        return sjekkLovtekst(kilde);
      case 'vigo-kodeverk':
        return sjekkVigo();
      case 'utdanning-no':
        return sjekkUtdanning(kilde);
      case 'ndla':
        return sjekkHentet('NDLA', 'ndla-endringer.json', [{ navn: 'Fagene', fil: 'data/ndla/fag.json', hent: del(null) }]);
      case 'nor':
        return sjekkHentet('NOR', 'nor-endringer.json', [{ navn: 'Opplæringskontorene', fil: 'data/udir/opplaeringskontor.json', hent: del(null) }]);
      case 'eksamen':
        return sjekkEksamen();
      case 'fil': {
        const { fingeravtrykk, bytes, tekst, tekstfeil } = await sjekkFil(kilde);
        tekster[kilde.id] = tekst === null ? { feil: tekstfeil ?? 'Teksten kunne ikke leses.' } : { tekst };
        rapport.push(`### ${kilde.navn}`, `Filen er ${bytes} byte, fingeravtrykk ${fingeravtrykk}.`, '');
        return vurderMotGodkjent(fingeravtrykk, kilde.godkjent_fingeravtrykk);
      }
      case 'kf-infoserie': {
        const r = await sjekkKfInfoserie(kilde);
        tekster[kilde.id] = { tekst: r.tekst };
        html[kilde.id] = r.html;
        rapport.push(
          `### ${kilde.navn}`,
          `${r.tittel ?? 'Ukjent tittel'}, versjon ${r.versjon ?? '?'}, gyldig ${r.gyldig ?? '?'}. ${r.tegn} tegn tekst, fingeravtrykk ${r.fingeravtrykk}.`,
          '',
        );
        return vurderMotGodkjent(r.fingeravtrykk, kilde.godkjent_fingeravtrykk);
      }
      case 'lovdata': {
        const { fingeravtrykk, tekst } = await sjekkLovdata(kilde);
        tekster[kilde.id] = { tekst };
        rapport.push(`### ${kilde.navn}`, `Fingeravtrykk ${fingeravtrykk}.`, '');
        return vurderMotGodkjent(fingeravtrykk, kilde.godkjent_fingeravtrykk);
      }
      default:
        return { status: 'feilet', fingeravtrykk: null, melding: `Sjekkmetoden «${kilde.sjekkmetode}» er ikke laget ennå.` };
    }
  } catch (e) {
    const melding = e instanceof Error ? e.message : String(e);
    tekster[kilde.id] = { feil: melding };
    return { status: 'feilet', fingeravtrykk: null, melding };
  }
}

const kilder: Record<string, KildestatusPost> = {};
for (const kilde of register.kilder.filter((k) => k.aktiv && k.sjekkmetode !== 'ingen')) {
  const resultat = await sjekk(kilde);
  kilder[kilde.id] = nyPost(forrige?.kilder[kilde.id], resultat, naa);
  console.log(`${kilde.id}: ${resultat.status}${resultat.melding ? ` – ${resultat.melding}` : ''}`);
}

const fil: Kildestatusfil = { skjema: 1, kjort: naa, kilder };
mkdirSync(join(rot, 'data/status'), { recursive: true });
writeFileSync(statusfil, `${JSON.stringify(fil, null, 2)}\n`);

// Verdisjekken: ser etter sitatet til hver regelverdi i kildeteksten (docs/avgjorelser/017).
const regelsett = lesRegelsett(rot);
const forrigeVerdistatus = lesVerdistatus(lesJson(verdistatusfil));
let verdistatus: Verdistatusfil = sjekkVerdier(sjekkbareVerdier(regelsett), tekster, forrigeVerdistatus, naa);

// Tabeller rad for rad (avgjørelse 018): vedlegg 1 fra dokumentet hos KF Infoserie, garantilønnen fra teksten
// i hovedtariffavtalen.
function tabellsjekk(regelsettId: string, nokkel: string, kildeId: string, sjekk: (rader: Tabellrad[]) => Tabellresultat): void {
  const verdi = regelsett.find((r) => r.id === regelsettId)?.verdier[nokkel];
  if (!verdi || verdi.kilde.id !== kildeId || !Array.isArray(verdi.verdi)) {
    rapport.push(`- Tabellsjekken fant ikke ${nokkel} med kilden ${kildeId} i ${regelsettId}.`, '');
    return;
  }
  let resultat: Tabellresultat | { feil: string };
  try {
    resultat = sjekk(verdi.verdi as Tabellrad[]);
  } catch (e) {
    resultat = { feil: e instanceof Error ? e.message : String(e) };
  }
  verdistatus = medTabellstatus(verdistatus, verdinokkel(regelsettId, nokkel), kildeId, resultat, forrigeVerdistatus);
}
function kildetekst(id: string): string {
  const t = tekster[id];
  if (t === undefined) throw new Error('Kilden sjekkes ikke automatisk ennå.');
  if ('feil' in t) throw new Error(`Kilden kunne ikke leses: ${t.feil}`);
  return t.tekst;
}
// Regelsettet som gjelder i dag for et regelverk, så tabellsjekken følger med når en ny periode legges inn.
function gjeldende(regelverk: string): string | null {
  try {
    return velgPeriode(regelsett, regelverk, { dato: naa.slice(0, 10) }).id;
  } catch (e) {
    rapport.push(`- Tabellsjekken for ${regelverk} ble ikke kjørt: ${e instanceof Error ? e.message : String(e)}`, '');
    return null;
  }
}
const sfs = gjeldende('sfs2213');
if (sfs) {
  tabellsjekk(sfs, 'arsrammer', 'ks-sfs2213-avtaletekst', (rader) => {
    kildetekst('ks-sfs2213-avtaletekst');
    return sammenlignVedlegg1(rader, lesVedlegg1(html['ks-sfs2213-avtaletekst'] ?? ''));
  });
}
const hta = gjeldende('hta');
if (hta) {
  tabellsjekk(hta, 'garantilonn', 'ks-hovedtariffavtalen', (rader) => {
    const trinn = regelsett.find((r) => r.id === hta)?.verdier.garantilonn_ansiennitet?.verdi as number[];
    return sjekkGarantilonn(rader, trinn, kildetekst('ks-hovedtariffavtalen'));
  });
}
writeFileSync(verdistatusfil, `${JSON.stringify(verdistatus, null, 2)}\n`);
const verdiposter = Object.entries(verdistatus.verdier);
const antall = (s: string) => verdiposter.filter(([, p]) => p.status === s).length;
rapport.push(
  '### Verdisjekk',
  `${verdiposter.length} regelverdier med sitat: ${antall('samsvarer')} samsvarer med kilden, ${antall('avvik')} avvik, ${antall('ikke_sjekket')} ikke sjekket.`,
  ...verdiposter
    .filter(([, p]) => p.status !== 'samsvarer' || p.melding)
    .map(([n, p]) => `- ${n}: ${p.status}${p.forslag === null ? '' : ` (forslag: ${p.forslag})`}${p.melding ? ` – ${p.melding}` : ''}`),
  '',
);
console.log(`Verdisjekk: ${antall('samsvarer')} samsvarer, ${antall('avvik')} avvik, ${antall('ikke_sjekket')} ikke sjekket.`);

// Hva som er endret i kildene (avgjørelse 018). Bitene fra sist kilden var godkjent (status ok) lagres; ved
// endring sammenlignes teksten nå med dem. Endringene går til den ukentlige kontrollsaken (varsle.ts).
const forrigeTekst: Kildetekstfil = lesKildetekst(lesJson(kildetekstfil)) ?? { skjema: 1, kilder: {} };
const nyTekst: Kildetekstfil = { skjema: 1, kilder: { ...forrigeTekst.kilder } };
const endringer: Record<string, Tekstendring[] | null> = {};
for (const [id, post] of Object.entries(kilder)) {
  const t = tekster[id];
  if (t === undefined || 'feil' in t || post.fingeravtrykk === null) continue;
  if (post.status === 'ok') {
    nyTekst.kilder[id] = { fingeravtrykk: post.fingeravtrykk, lagret: forrigeTekst.kilder[id]?.fingeravtrykk === post.fingeravtrykk ? (forrigeTekst.kilder[id]?.lagret ?? naa) : naa, biter: delIBiter(t.tekst).map((b) => b.hash) };
  } else if (post.status === 'endret') {
    const godkjent = forrigeTekst.kilder[id];
    endringer[id] = godkjent ? finnEndringer(godkjent.biter, t.tekst) : null;
  }
}
writeFileSync(kildetekstfil, `${JSON.stringify(nyTekst, null, 2)}\n`);
mkdirSync(join(generert, 'kildetekster'), { recursive: true });
// Teksten fra kildene, til endringsforslagene (lag-forslag.ts). Ligger bare i .generert, som ikke committes.
for (const [id, t] of Object.entries(tekster)) if ('tekst' in t) writeFileSync(join(generert, 'kildetekster', `${id}.txt`), t.tekst);
writeFileSync(join(generert, 'endringer.json'), `${JSON.stringify(endringer, null, 2)}\n`);
for (const [id, liste] of Object.entries(endringer)) {
  rapport.push(`### Endringer i ${id}`, ...(liste === null ? ['Ingen lagret tekst fra forrige godkjenning å sammenligne med.'] : liste.map((e) => `- ${e.punkt ?? 'ukjent punkt'}: ${e.ny.length} nye biter, ${e.fjernet} fjernet`)), '');
}

const tabell = [
  '## Kildesjekk',
  '',
  `Kjørt ${naa}${simulertFeil ? ` (simulert feil for ${simulertFeil})` : ''}.`,
  '',
  '| Kilde | Status | Melding |',
  '|---|---|---|',
  ...Object.entries(kilder).map(([id, p]) => `| ${id} | ${p.status} | ${p.melding ?? ''} |`),
  '',
  ...rapport,
];
mkdirSync(generert, { recursive: true });
writeFileSync(join(generert, 'kilderapport.md'), `${tabell.join('\n')}\n`);
console.log(`Skrev ${statusfil}`);
