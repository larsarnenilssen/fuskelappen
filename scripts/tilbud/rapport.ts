// Oversikten over tilbudsstrukturen (docs/TILBUDSSTRUKTUR.md) til eiers kontroll, avgjørelse 024.
// Ordnet fra det generelle til det spesielle: studieforberedende og yrkesfaglige utdanningsprogram → vg1 →
// vg2-retninger → vg3 og lærefag → påbygging. For hvert tilbud vises fagene og timene etter rundskrivet Udir-1,
// fagkodene fra Grep, årsrammen fra koblingen (avgjørelse 023), valgfrie plasser, alternativer, tilpassede
// ordninger og avvik. Kildesjekken lager den på nytt hver uke etter at Grep og Udir-1 er hentet.
// Kjør: npm run tilbud:rapport
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Arsrammerad } from '../../src/modules/arbeidstid/beregning/arsrammer.ts';
import { finnKobling, type Koblingstabeller } from '../../src/modules/arbeidstid/beregning/kobling.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { ukjenteNavn } from '../../src/modules/opplaeringslop/navn.ts';
import { avvikTekst, byggStruktur, byggTilbud, erVariant, erVoksenopplaering, skolearFor, velgFordeling, type FagBygger, type Programstruktur, type Tilbud, type Tilbudsdel } from '../../src/modules/fag/tilbud/modell.ts';
import type { Fagfordeling } from '../../src/modules/fag/tilbud/skjema.ts';
import { vilbliLenke } from '../../src/modules/fag/tilbud/vilbli.ts';
import { lesFagrelasjoner, lesFordelinger } from '../data/les.ts';
import { lesKoblingsgrunnlag } from '../kobling/rapport.ts';

export interface Kobling {
  tabeller: Koblingstabeller;
  rader: readonly Arsrammerad[];
}

const GRUPPER = [
  ['studieforberedende', 'Studieforberedende utdanningsprogram'],
  ['yrkesfaglig', 'Yrkesfaglige utdanningsprogram'],
  ['pabygging', 'Påbygging til generell studiekompetanse'],
] as const;

const KATEGORI: Record<Exclude<Tilbudsdel['kategori'], 'fellesfag' | 'felles_programfag'>, string> = {
  yff: 'obligatorisk',
  fordypning: 'fordypning',
  valgfritt: 'valgfritt',
  opphenting: 'opphenting',
};

/** Kort kode for programområdet: HSHEA2---- → HSHEA2. */
const kort = (kode: string) => kode.replace(/-+$/, '');
const celle = (t: string) => t.replace(/\|/g, '\\|');

export function lagTilbudsrapport(indeks: Fagindeks, fordeling: Fagfordeling | null, kobling: Kobling, neste: Fagfordeling | null = null, fagBygger: FagBygger = {}): string {
  const tilbud = new Map(Object.keys(indeks.programomrader).map((k) => [k, byggTilbud(k, indeks, fordeling, fagBygger)]));
  const struktur = byggStruktur(indeks);
  const fagnavn = (k: string) => `${k} ${indeks.fag[k]?.navn.nb ?? '(ukjent)'}`;
  const ponavn = (k: string) => `${indeks.programomrader[k]?.navn.nb ?? '(ukjent)'} (${kort(k)})`;

  /** Lister kodene, eller teller dem per utdanningsprogram når de er mange. */
  const polister = (koder: readonly string[]): string => {
    if (koder.length <= 6) return koder.map(ponavn).join(', ');
    const per = new Map<string, number>();
    for (const k of koder) per.set(indeks.programomrader[k]?.program ?? '?', (per.get(indeks.programomrader[k]?.program ?? '?') ?? 0) + 1);
    return `${koder.length} programområder: ${[...per].map(([p, n]) => `${p} ${n}`).join(', ')}`;
  };
  const faglister = (koder: readonly string[], maks = 4): string =>
    koder.length <= maks ? koder.map(fagnavn).join(', ') : `${koder.length} koder, f.eks. ${koder.slice(0, 2).map(fagnavn).join(', ')}`;

  /** Årsrammen (60-minutters timer) fra koblingen for kodene på programmet og trinnet. */
  const arsramme = (koder: readonly string[], t: Tilbud, lantFra: string | null = null): string => {
    // Koder hentet fra påbygging har årsrammen for påbygging.
    const po = (lantFra ? indeks.programomrader[lantFra] : undefined) ?? t.programomrade;
    const verdier = new Set<string>();
    let ukoblet = 0;
    for (const k of koder) {
      const r = finnKobling(k, indeks, kobling.tabeller, kobling.rader, { program: po.program, trinn: po.trinn });
      if (r.status === 'koblet') verdier.add(`${r.kandidat.rad.t60}${r.kandidat.rad.stjerne ? '*' : ''}`);
      else if (r.status === 'flertydig') verdier.add('flertydig');
      else ukoblet++;
    }
    const ut = [...verdier].sort();
    if (ukoblet > 0) ut.push(ut.length > 0 ? `${ukoblet} ukoblet` : '–');
    return ut.join(', ');
  };

  const delrad = (d: Tilbudsdel, t: Tilbud): string => {
    if (d.type === 'fag') {
      // Fellesfag med flere koder: eleven velger én (1P/1T, fremmedspråk). Felles programfag: eleven har alle, og
      // hvert fag står på egen linje med timetall.
      const medTimer = (k: string) => `${fagnavn(k)} (${indeks.fag[k]?.timer ?? '–'})`;
      const deler: string[] = [];
      if (d.koder.length === 0 && !d.utvalg) deler.push('**ingen fagkode i Grep**');
      else if (d.kategori === 'fellesfag') deler.push(d.koder.length === 1 ? fagnavn(d.koder[0] as string) : d.koder.length <= 4 ? `velg én: ${d.koder.map(fagnavn).join(', ')}` : `velg én av ${d.koder.length}: ${d.koder.slice(0, 3).map(fagnavn).join(', ')} …`);
      else deler.push(...d.koder.map(medTimer));
      if (d.utvalg?.grunn === 'valg') deler.push(`velg ${d.utvalg.antall ?? ''} av: ${d.utvalg.koder.map(medTimer).join(', ')}`);
      if (d.utvalg?.grunn === 'flere_trinn') {
        const iRekke = new Set(d.utvalg.rekker.flat());
        const uten = d.utvalg.koder.filter((k) => !iRekke.has(k));
        deler.push(`${d.utvalg.timer} timer fra fag som går over flere trinn i Grep: ${d.utvalg.koder.map(medTimer).join(', ')}`);
        if (d.utvalg.rekker.length > 0) deler.push(`rekkefølge (VIGO): ${d.utvalg.rekker.map((r) => r.join(' → ')).join('; ')}`);
        if (uten.length > 0) deler.push(`uten rekkefølge i VIGO: ${uten.join(', ')}`);
      }
      if (d.lantFra)
        deler.push(
          indeks.programomrader[d.lantFra]?.program === 'PB' && t.programomrade.program !== 'PB'
            ? `koder fra påbygging (${kort(d.lantFra)}): programområdet er merket «påbygg» i Grep`
            : `koder fra ${indeks.programomrader[d.lantFra]?.navn.nb ?? ''} (${kort(d.lantFra)}): Grep kobler ingen fellesfag til programområdet`,
        );
      if (d.vurdering.length > 0) deler.push(`vurdering: ${d.vurdering.length <= 3 ? d.vurdering.map(fagnavn).join(', ') : `${d.vurdering.length} koder`}`);
      return `| ${celle(d.linje)} | ${d.timer} | ${celle(deler.join('<br>'))} | ${arsramme([...d.koder, ...(d.utvalg?.koder ?? [])], t, d.lantFra)} |`;
    }
    const tekst =
      d.kategori === 'yff'
        ? `anbefalt ${d.anbefalt ? fagnavn(d.anbefalt) : '**ingen YFF-kode med samme timetall**'}; ${d.kandidater.length} YFF-koder å velge blant`
        : d.antall
          ? `${d.antall} fag à 140 timer, velges blant ${d.kandidater.length} programfag`
          : `${d.kandidater.length} koder: ${faglister(d.kandidater)}`;
    const merke = d.linje.toLowerCase().includes(KATEGORI[d.kategori]) ? '' : ` (${KATEGORI[d.kategori]})`;
    return `| ${celle(d.linje)}${merke} | ${d.timer} | ${celle(tekst)} | ${d.kategori === 'yff' && d.anbefalt ? arsramme([d.anbefalt], t) : ''} |`;
  };

  const vist = new Set<string>();
  const ut: string[] = [];

  const visTilbud = (kode: string, niva: string) => {
    const t = tilbud.get(kode);
    if (!t) return;
    const po = t.programomrade;
    if (vist.has(kode)) {
      ut.push(`${niva} ${po.trinn} ${ponavn(kode)}`, '', 'Se over.', '');
      return;
    }
    vist.add(kode);
    const stemmer = t.totalt !== null && t.sum === t.totalt;
    ut.push(`${niva} ${po.trinn} ${ponavn(kode)}${t.tabell ? ` · ${t.sum} timer ${stemmer ? '✓' : '⚠'}` : ''}`, '');
    const om: string[] = [];
    if (t.tabell) om.push(`Tabell ${t.tabell.nr} (${t.tabell.omfang}) i ${fordeling?.rundskriv ?? 'rundskrivet'}.`);
    else om.push(po.sted === 'bedrift' ? 'Opplæring i bedrift.' : erVoksenopplaering(po) ? 'Voksenopplæring: tabellene i rundskrivet gjelder ikke, og det er ingen kroppsøving.' : '**Ingen tabell i rundskrivet.**');
    if (t.fra.length > 0) om.push(`Bygger på ${polister(t.fra)}${t.fraAvledet ? ' (Grep mangler «bygger på»; eneste vg2 i programmet, se udir.no/kl06)' : ''}.`);
    // Påbygging bygger på vg2 i de yrkesfaglige programmene. Det er det vanlige løpet, ikke kryssløp.
    if (t.kryssFra.length > 0) om.push(`${t.gruppe === 'pabygging' ? 'Bygger på' : 'Kryssløp fra'} ${polister(t.kryssFra)}.`);
    if (po.timer !== null && t.totalt !== null && po.timer !== t.totalt) om.push(`Grep oppgir ${po.timer} årstimer.`);
    ut.push(om.join(' '), '');
    const skoler = vilbliLenke(kode, indeks, { side: 'p5' });
    if (skoler) ut.push(`Vilbli: [skoler og lærebedrifter](${skoler}) · [fag- og timefordeling](${vilbliLenke(kode, indeks, { side: 'p2' }) ?? ''})`, '');
    if (t.tabell) {
      ut.push('| Del | Timer | Fagkoder | Årsramme |', '|---|--:|---|---|');
      for (const d of t.deler) ut.push(delrad(d, t));
      ut.push(`| **Sum** | **${t.sum}** | Rundskrivet: ${t.totalt ?? '–'} | |`, '');
    } else if (t.deler.length > 0) {
      for (const d of t.deler) if (d.type === 'fag') ut.push(`Fagkoder: ${d.koder.map(fagnavn).join(', ')}.`, '');
    }
    const alt = [
      ...t.deler.flatMap((d) => (d.type === 'fag' && d.alternativer.length > 0 ? [`${d.linje.split('/')[0]}: ${faglister(d.alternativer, 3)}`] : [])),
      ...(t.alternativer.length > 0 ? [`andre fellesfag: ${faglister(t.alternativer, 3)}`] : []),
    ];
    if (alt.length > 0) ut.push(`Alternativer for særskilte grupper: ${alt.join('; ')}.`, '');
    const tilp = t.tilpasninger.filter((p) => p.linjer.length > 0 || p.total !== t.totalt);
    if (tilp.length > 0) {
      ut.push('Tilpassede ordninger (kolonner i rundskrivet):', '');
      for (const p of tilp) {
        const linjer = p.linjer.map((l) => `${l.linje.split('/')[0]} ${l.ordinar ?? '–'} → ${l.timer ?? '–'}${l.koder.length > 0 ? ` (${l.koder.join(', ')})` : ''}`);
        ut.push(`- ${p.navn}, ${p.total ?? '–'} timer: ${linjer.join('; ') || 'samme fag og timer'}`);
      }
      ut.push('');
    }
    if (t.avvik.length > 0) {
      ut.push('Avvik:', '');
      for (const a of t.avvik) ut.push(`- ⚠ ${avvikTekst(a)}`);
      ut.push('');
    }
    if (t.andreFag.length > 0) ut.push(`Andre fag i Grep for programområdet: ${faglister(t.andreFag)}.`, '');
    if (t.pabygging.length > 0) ut.push(`Påbygging: ${t.pabygging.map(ponavn).join(', ')}.`, '');
    if (t.kryssTil.length > 0) ut.push(`Kryssløp til: ${polister(t.kryssTil)}.`, '');
  };

  /** Videre løp i samme program: vg2-retninger og vg3 i skole med egne avsnitt, lærefag som liste. */
  const visVidere = (kode: string, dybde: number) => {
    const t = tilbud.get(kode);
    if (!t) return;
    const videre = t.videre.filter((k) => !erVariant(k));
    const bedrift = videre.filter((k) => indeks.programomrader[k]?.sted === 'bedrift');
    if (bedrift.length > 0) {
      ut.push(`Lærefag etter ${ponavn(kode)}:`, '');
      for (const b of bedrift) {
        vist.add(b);
        const tb = tilbud.get(b);
        // Lærefagets egne koder og fordypningsområdene (fag til valg). Fellesfag for særskilte grupper står ikke her.
        const koder = (tb?.deler.flatMap((d) => (d.type === 'fag' ? [...d.koder, ...(d.utvalg?.koder ?? [])] : [])) ?? []).sort((x, y) => Number(indeks.fag[x]?.type !== 'felles_programfag') - Number(indeks.fag[y]?.type !== 'felles_programfag') || x.localeCompare(y));
        const lenke = vilbliLenke(b, indeks, { side: 'p5', via: kode });
        ut.push(`- ${ponavn(b)}${koder.length > 0 ? `: ${faglister(koder, 3)}` : ''}${tb && tb.fra.length > 1 ? ` (også etter ${tb.fra.filter((f) => f !== kode).map(kort).join(', ')})` : ''}${tb?.fraAvledet ? ' (Grep mangler «bygger på»; eneste vg2 i programmet, se udir.no/kl06)' : ''}${lenke ? ` · [Vilbli](${lenke})` : ''}`);
      }
      ut.push('');
    }
    for (const k of videre.filter((v) => !bedrift.includes(v)).sort((a, b) => ponavn(a).localeCompare(ponavn(b), 'nb'))) {
      visTilbud(k, '#'.repeat(Math.min(4 + dybde, 6)));
      visVidere(k, dybde + 1);
    }
  };

  // Sammendrag
  const alle = [...tilbud.values()];
  const iSkole = alle.filter((t) => t.programomrade.sted !== 'bedrift');
  const medTabell = iSkole.filter((t) => t.tabell);
  const stemmer = medTabell.filter((t) => t.sum === t.totalt);
  const avvik = new Map<string, string[]>();
  for (const t of alle) for (const a of t.avvik.map(avvikTekst)) avvik.set(a, [...(avvik.get(a) ?? []), t.kode]);

  ut.push(
    '# Tilbudsstrukturen i videregående',
    '',
    `Generert av \`npm run tilbud:rapport\` fra Grep (hentet ${indeks.hentet.slice(0, 10)})${fordeling ? ` og ${fordeling.rundskriv} «Fag- og timefordeling og tilbudsstruktur» for skoleåret ${fordeling.skolear.replace('-', '–')} (hentet ${fordeling.hentet.slice(0, 10)})` : ''}. Ikke rediger for hånd. Se avgjørelse 024.`,
    '',
    '**Slik leser du den.** Hvert programområde (tilbud) viser linjene i den ordinære kolonnen i rundskrivet med timer (60 minutter) og fagkodene fra Grep. Felles programfag står hvert for seg med timetallet i Grep i parentes. «Velg én» betyr at eleven velger ett av fagene (f.eks. 1P eller 1T). Vurderingskoder (muntlig, tverrfaglig eksamen) har ikke timer, men hører til samme læreplan. Yrkesfaglig fordypning er obligatorisk; den anbefalte koden er den med samme timetall som trinnet. Plasser for fordypning og valgfrie programfag viser antall fag og hvor mange fag som kan velges. Alternativer er fag for særskilte grupper (samisk, tegnspråk, grunnleggende norsk, styrket opplæring …) som kan erstatte et fag, men ikke er det vanlige tilbudet. Tilpassede ordninger er de andre kolonnene i rundskrivet. Årsrammen er fra koblingen til vedlegg 1 i SFS 2213 (* = stjernemerket), se [KOBLING.md](KOBLING.md). Lenkene til Vilbli viser skolene og lærebedriftene som tilbyr hvert tilbud (avgjørelse 027). ✓ betyr at summen stemmer med «Totalt omfang» i rundskrivet.',
    '',
    '## Sammendrag',
    '',
    `- ${struktur.length} utdanningsprogram, ${alle.length} programområder: ${iSkole.length} i skole og ${alle.length - iSkole.length} i bedrift. ${alle.filter((t) => t.variant).length} er varianter for særskilte skoler.`,
    `- ${medTabell.length} av ${iSkole.length} programområder i skole har tabell i rundskrivet. Summen stemmer for ${stemmer.length} av dem.`,
    `- ${avvik.size} ulike avvik i ${new Set([...avvik.values()].flat()).size} programområder (se under).`,
    '',
  );
  if (fordeling && fordeling.merknader.length > 0) {
    ut.push('### Summer i rundskrivet som ikke stemmer', '', 'Kontrollen av hver kolonne i rundskrivet fant disse. De påvirker ikke tilbudene, som bruker linjene.', '');
    for (const m of fordeling.merknader) ut.push(`- ${m}`);
    ut.push('');
  }
  const utenTabell = iSkole.filter((t) => !t.tabell);
  if (utenTabell.length > 0) ut.push('### Programområder i skole uten tabell i rundskrivet', '', ...utenTabell.map((t) => `- ${t.programomrade.trinn} ${ponavn(t.kode)}${erVoksenopplaering(t.programomrade) ? ' – voksenopplæring' : ''}`), '');
  const utenfor = struktur.filter((s) => s.utenfor.length > 0);
  if (utenfor.length > 0) {
    ut.push('### Programområder som ikke nås fra inngangen', '', 'Grep oppgir ikke hva de bygger på i samme utdanningsprogram. De vises nederst under programmet.', '');
    for (const s of utenfor) ut.push(`- ${s.navn.nb}: ${s.utenfor.map(ponavn).join(', ')}`);
    ut.push('');
  }
  if (avvik.size > 0) {
    ut.push('### Avvik mellom rundskrivet og Grep', '');
    for (const [a, koder] of [...avvik].sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0], 'nb'))) ut.push(`- ${a} ${koder.length === 1 ? kort(koder[0] as string) : `(${koder.length}: ${koder.slice(0, 5).map(kort).join(', ')}${koder.length > 5 ? ' …' : ''})`}`);
    ut.push('');
  }
  if (neste) {
    const nesteTilbud = alle.map((t) => ({ t, n: byggTilbud(t.kode, indeks, neste, fagBygger) }));
    const endret = nesteTilbud.filter(({ t, n }) => JSON.stringify(t.deler.map((d) => [d.linje, d.timer])) !== JSON.stringify(n.deler.map((d) => [d.linje, d.timer])));
    ut.push(`### Endringer i ${neste.rundskriv} for skoleåret ${neste.skolear.replace('-', '–')}`, '');
    if (endret.length === 0) ut.push('Ingen endringer i linjene eller timene.', '');
    for (const { t, n } of endret.slice(0, 50)) {
      const for_ = new Map(t.deler.map((d) => [d.linje, d.timer]));
      const etter = new Map(n.deler.map((d) => [d.linje, d.timer]));
      const linjer = [...new Set([...for_.keys(), ...etter.keys()])].filter((l) => for_.get(l) !== etter.get(l)).map((l) => `${l} ${for_.get(l) ?? '–'} → ${etter.get(l) ?? '–'}`);
      ut.push(`- ${t.programomrade.trinn} ${ponavn(t.kode)}: ${linjer.join('; ')}`);
    }
    if (endret.length > 50) ut.push(`- … og ${endret.length - 50} til.`);
    ut.push('');
  }

  const visProgram = (s: Programstruktur) => {
    ut.push(`### ${s.navn.nb} (${s.program})`, '');
    for (const k of s.inngang.filter((i) => !erVariant(i))) {
      visTilbud(k, '####');
      visVidere(k, 1);
    }
    const rest = s.utenfor.filter((k) => !erVariant(k));
    if (rest.length > 0) {
      ut.push('#### Ikke koblet til inngangen i Grep', '');
      for (const k of rest) visTilbud(k, '#####');
    }
    const varianter = Object.keys(indeks.programomrader)
      .filter((k) => indeks.programomrader[k]?.program === s.program && erVariant(k))
      .sort();
    if (varianter.length > 0) {
      ut.push('#### Varianter for særskilte skoler', '', 'Rudolf Steiner (RS), Montessori (MO) og tysk skole (TY) har egne programområder i Grep. Rundskrivet har ikke egne tabeller for dem; her brukes tabellen for programmet.', '');
      for (const k of varianter) {
        const t = tilbud.get(k);
        if (!t) continue;
        vist.add(k);
        ut.push(`- ${t.programomrade.trinn} ${ponavn(k)}${t.tabell ? ` · tabell ${t.tabell.nr}` : ''}${t.fra.length > 0 ? ` · bygger på ${t.fra.map(kort).join(', ')}` : ''}${t.avvik[0] ? ` · ⚠ ${t.avvik.length === 1 ? avvikTekst(t.avvik[0]) : `${t.avvik.length} avvik, bl.a. ${avvikTekst(t.avvik[0])}`}` : ''}`);
      }
      ut.push('');
    }
  };

  for (const [gruppe, tittel] of GRUPPER) {
    const program = struktur.filter((s) => s.gruppe === gruppe);
    if (program.length === 0) continue;
    ut.push(`## ${tittel}`, '');
    for (const s of program) visProgram(s);
  }
  const ikkeVist = alle.filter((t) => !vist.has(t.kode));
  if (ikkeVist.length > 0) {
    ut.push('## Andre programområder', '', 'Programområder som ikke kom med over.', '');
    for (const t of ikkeVist) ut.push(`- ${t.programomrade.trinn} ${ponavn(t.kode)}`);
    ut.push('');
  }
  return `${ut.join('\n').trimEnd()}\n`;
}

/** Fag- og timefordelingen som gjelder på datoen, og eventuelt den neste. */
export function fordelingOgNeste(rot: string, dato: string): { fordeling: Fagfordeling | null; neste: Fagfordeling | null } {
  const alle = lesFordelinger(rot);
  const fordeling = velgFordeling(alle, dato);
  const neste = alle.filter((f) => f.skolear > (fordeling?.skolear ?? skolearFor(dato))).sort((a, b) => a.skolear.localeCompare(b.skolear))[0] ?? null;
  return { fordeling, neste };
}

/** Fag som bygger på andre fag, fra VIGO (data/vigo/fagrelasjoner.json). */
export function lesFagBygger(rot: string): FagBygger {
  return lesFagrelasjoner(rot)?.byggerPaa ?? {};
}

/** Lager rapporten med dataene i repoet. */
export function lagRapportFraRepo(rot: string, dato = new Date().toISOString().slice(0, 10)): string {
  const g = lesKoblingsgrunnlag(rot);
  const { fordeling, neste } = fordelingOgNeste(rot, dato);
  return lagTilbudsrapport(g.indeks, fordeling, { tabeller: g.tabeller, rader: g.rader }, neste, lesFagBygger(rot));
}

/**
 * Linjenavn og kolonnenavn i rundskrivet (dette og neste skoleår) som appen ikke har nynorsk eller utskrevet navn
 * for. De vises som i rundskrivet til de er lagt inn i src/strings/linjenavn.ts eller navn.ts, og kildesjekken melder
 * dem i kontrollsaken (eier 02.10.2026).
 */
export function ukjenteNavnFraRepo(rot: string, dato = new Date().toISOString().slice(0, 10)): { linjer: string[]; ordninger: string[] } {
  const g = lesKoblingsgrunnlag(rot);
  const { fordeling, neste } = fordelingOgNeste(rot, dato);
  const bygger = lesFagBygger(rot);
  const tilbud = [fordeling, neste].flatMap((f) => (f ? Object.keys(g.indeks.programomrader).map((k) => byggTilbud(k, g.indeks, f, bygger)) : []));
  return ukjenteNavn(tilbud);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rot = fileURLToPath(new URL('../..', import.meta.url));
  const tekst = lagRapportFraRepo(rot);
  writeFileSync(join(rot, 'docs/TILBUDSSTRUKTUR.md'), tekst);
  console.log(`docs/TILBUDSSTRUKTUR.md: ${tekst.split('\n').length} linjer.`);
  const navn = ukjenteNavnFraRepo(rot);
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/tilbud-navn.json'), `${JSON.stringify(navn, null, 2)}\n`);
  console.log(`Navn uten oversettelse: ${navn.linjer.length} linjer, ${navn.ordninger.length} ordninger.`);
}
