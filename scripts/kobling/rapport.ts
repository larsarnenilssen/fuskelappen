// Rapporten over koblingen fra fagkode til årsramme (docs/KOBLING.md og data/status/kobling.json), avgjørelse 023.
// Viser hvor mange fagkoder som er koblet og hvordan, avvik i koblingstabellene, tabellen over programnavn, et
// utvalg koblinger til kontroll og alle fagkoder som ikke er koblet, med grunn. Kildesjekken lager den på nytt
// hver uke etter at Grep er hentet. Kjør: npm run kobling:rapport
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { finnVerdi, somTabell } from '../../src/core/regler/motor.ts';
import { lesArsrammer, type Arsrammerad } from '../../src/modules/arbeidstid/beregning/arsrammer.ts';
import { finnKobling, grepPar, koblingskandidater, lesKoblinger, ukobletGrunn, type Koblingstabeller, type Ukobletgrunn } from '../../src/modules/arbeidstid/beregning/kobling.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { lesRegelsett } from '../innhold/alt.ts';
import { lesFagindeks } from '../data/les.ts';

export interface Avvik {
  /** feil: tabellene motsier seg selv eller vedlegg 1 (testene feiler). advarsel: bør ses på. */
  alvor: 'feil' | 'advarsel';
  tekst: string;
}

export interface Koblingsstatus {
  hentet: string;
  antall: { fag: number; koblet: number; flertydig: number; ukoblet: number; eksplisitt: number; regel: number };
  ukoblede: Record<string, Ukobletgrunn>;
  avvik: Avvik[];
}

/** Endringer siden forrige rapport, til den ukentlige kontrollsaken. */
export interface Koblingsendringer {
  nyeUkoblede: string[];
  nyeAvvik: string[];
}

export const GRUNNTEKST: Record<Ukobletgrunn, { tittel: string; forklaring: string }> = {
  fellesfag_ikke_koblet: {
    tittel: 'Fellesfag som ikke er koblet',
    forklaring:
      'Fellesfag kobles bare eksplisitt. Dette er varianter (samisk plan, tegnspråk, kort botid, grunnleggende norsk, styrket opplæring, morsmål), samisk, og fellesfag på program og trinn uten rad i vedlegg 1. Skal de ha samme årsramme som hovedfaget?',
  },
  ikke_i_vedlegg: {
    tittel: 'Programfag uten rad i vedlegg 1',
    forklaring: 'Programfag med årstimer der ingen regel eller eksplisitt kobling passer: valgfrie programfag vedlegget ikke nevner, og program og trinn uten rad for felles programfag.',
  },
  uten_arstimer: {
    tittel: 'Programfag uten årstimer i Grep',
    forklaring: 'Ofte eksamenskoder (tverrfaglig eksamen) eller vurderingskoder (muntlig). Reglene gjelder bare fag med årstimer.',
  },
  bedrift: {
    tittel: 'Opplæring i bedrift',
    forklaring: 'Faget brukes bare i programområder med opplæring i bedrift (læretid, fagprøve). Det gir ingen undervisning med årsramme på skolen.',
  },
  fagtype: {
    tittel: 'Individuell opplæringsplan og andre fagtyper',
    forklaring: 'Fagkoder for individuell opplæringsplan har ikke eget fag eller eget utdanningsprogram.',
  },
  ukjent_fagkode: { tittel: 'Ukjente fagkoder', forklaring: 'Fagkoden finnes ikke i Grep.' },
};

const GRUNNREKKEFOLGE: Ukobletgrunn[] = ['fellesfag_ikke_koblet', 'ikke_i_vedlegg', 'uten_arstimer', 'bedrift', 'fagtype', 'ukjent_fagkode'];

const tall = (n: number) => String(n).replace('.', ',');
const celle = (s: string) => s.replace(/\|/g, '\\|');

/** Avvik i koblingstabellene, sammenlignet med vedlegg 1, programnavnene, Grep og årstimetabellen. */
export function finnAvvik(indeks: Pick<Fagindeks, 'fag' | 'programomrader'>, tabeller: Koblingstabeller, rader: readonly Arsrammerad[], arstimer: readonly { nr: number; fagkoder: string[] }[] = []): Avvik[] {
  const ut: Avvik[] = [];
  const radFor = new Map(rader.map((r) => [r.nr, r]));
  const program = new Map(tabeller.programnavn.map((p) => [p.vedlegg, p.grep]));
  // Med merknad (eiers valg, f.eks. opphenting av vg1 på vg2) kan raden gjelde et annet program, trinn eller en annen
  // kategori i vedlegget.
  const passer = (nr: number, prog: string, trinn: string, hva: string, medVilje = false): Arsrammerad | null => {
    const rad = radFor.get(nr);
    if (!rad) {
      ut.push({ alvor: 'feil', tekst: `${hva}: rad ${nr} finnes ikke i vedlegg 1.` });
      return null;
    }
    if (medVilje) return rad;
    if (!(program.get(rad.program) ?? []).includes(prog)) ut.push({ alvor: 'feil', tekst: `${hva}: rad ${nr} gjelder «${rad.program}», som ikke er koblet til ${prog} i tabellen over programnavn.` });
    if (rad.trinn !== trinn) ut.push({ alvor: 'feil', tekst: `${hva}: rad ${nr} gjelder ${rad.trinn}, ikke ${trinn}.` });
    return rad;
  };
  const ikkeIGrep = new Map<string, string[]>();
  for (const e of tabeller.eksplisitte) {
    const hva = `${e.tabell} (${e.program} ${e.trinn})`;
    const rad = passer(e.nr, e.program, e.trinn, hva, !!e.merknad);
    if (rad && !e.merknad && e.tabell === 'kobling_fellesfag' && (rad.fag === null || rad.kategori === 'Valgfrie programfag')) ut.push({ alvor: 'feil', tekst: `${hva}: rad ${e.nr} er ikke et fellesfag i vedlegg 1.` });
    if (rad && !e.merknad && e.tabell === 'kobling_programfag' && rad.kategori !== 'Valgfrie programfag') ut.push({ alvor: 'feil', tekst: `${hva}: rad ${e.nr} er ikke et valgfritt programfag i vedlegg 1.` });
    for (const k of e.fagkoder) {
      const fag = indeks.fag[k];
      if (!fag) {
        ut.push({ alvor: 'advarsel', tekst: `${k} står i ${e.tabell} (rad ${e.nr}), men finnes ikke lenger i Grep.` });
        continue;
      }
      const skal = e.tabell === 'kobling_fellesfag' ? 'fellesfag' : 'valgfritt_programfag';
      if (fag.type !== skal) ut.push({ alvor: 'feil', tekst: `${k} ${fag.navn.nb} står i ${e.tabell}, men er ${fag.type.replace(/_/g, ' ')} i Grep.` });
      // Med merknad (f.eks. eiers valg) er det gjort med vilje.
      if (!e.merknad && !grepPar(fag, indeks.programomrader).some((p) => p.program === e.program && p.trinn === e.trinn)) {
        const n = `${k} ${fag.navn.nb}|${e.trinn}|${e.nr}`;
        ikkeIGrep.set(n, [...(ikkeIGrep.get(n) ?? []), e.program]);
      }
    }
  }
  for (const [n, program] of ikkeIGrep) {
    const [fag = '', trinn = '', nr = ''] = n.split('|');
    ut.push({ alvor: 'advarsel', tekst: `${fag} er koblet for ${program.join(', ')} ${trinn} (rad ${nr}), men brukes ikke der i Grep.` });
  }
  for (const r of tabeller.regler) {
    const rad = passer(r.nr, r.program, r.trinn, `Regelen ${r.id}`, !!r.merknad);
    if (rad && !r.merknad && (rad.fag !== null || rad.kategori !== 'Felles programfag')) ut.push({ alvor: 'feil', tekst: `Regelen ${r.id}: rad ${r.nr} er ikke felles programfag i vedlegg 1.` });
    const treff = Object.keys(indeks.fag).filter((k) => {
      const fag = indeks.fag[k];
      return fag && koblingskandidater(k, fag, grepPar(fag, indeks.programomrader), { ...tabeller, eksplisitte: [], regler: [r] }, rader).length > 0;
    });
    if (treff.length === 0) ut.push({ alvor: 'advarsel', tekst: `Regelen ${r.id} (${r.prefikser.join(', ')}, ${r.program} ${r.trinn}) treffer ingen fagkoder i Grep.` });
  }
  // Samme fagkode, program og trinn skal ikke gi ulike årsrammer.
  for (const kode of Object.keys(indeks.fag)) {
    const fag = indeks.fag[kode];
    if (!fag) continue;
    const kandidater = koblingskandidater(kode, fag, grepPar(fag, indeks.programomrader), tabeller, rader);
    const perPar = new Map<string, Set<number>>();
    for (const k of kandidater) perPar.set(`${k.program} ${k.trinn}`, (perPar.get(`${k.program} ${k.trinn}`) ?? new Set()).add(k.rad.t60));
    for (const [p, rammer] of perPar) if (rammer.size > 1) ut.push({ alvor: 'feil', tekst: `${kode} ${fag.navn.nb} får ulike årsrammer for ${p}: ${[...rammer].map(tall).join(' og ')}.` });
  }
  // Årstimetabellen fra fase 1 (rad → fagkoder) skal stemme med koblingen.
  for (const a of arstimer) {
    const rad = radFor.get(a.nr);
    if (!rad) continue;
    for (const k of a.fagkoder) {
      const fag = indeks.fag[k];
      if (!fag) continue;
      const kandidater = koblingskandidater(k, fag, grepPar(fag, indeks.programomrader), tabeller, rader);
      if (kandidater.length > 0 && !kandidater.some((c) => c.rad.nr === a.nr)) {
        ut.push({ alvor: 'advarsel', tekst: `Årstimetabellen har ${k} ${fag.navn.nb} på rad ${a.nr} (${rad.fag ?? rad.kategori} – ${rad.program} ${rad.trinn}), men koblingen gir rad ${[...new Set(kandidater.map((c) => c.rad.nr))].join(', ')}.` });
      }
    }
  }
  return ut;
}

/** Stabil «tilfeldig» rekkefølge, så utvalget til kontroll er det samme fra uke til uke. */
const stokk = (kode: string) => createHash('sha1').update(kode).digest('hex');

export function lagKoblingsrapport(
  indeks: Fagindeks,
  tabeller: Koblingstabeller,
  rader: readonly Arsrammerad[],
  arstimer: readonly { nr: number; fagkoder: string[] }[] = [],
): { tekst: string; status: Koblingsstatus } {
  const radNavn = (r: Arsrammerad) => `${r.nr}: ${r.fag ?? r.kategori} – ${r.program} ${r.trinn}`;
  const koder = Object.keys(indeks.fag).sort();
  const ukoblede: Record<string, Ukobletgrunn> = {};
  const koblet: string[] = [];
  const flertydig: string[] = [];
  let eksplisitt = 0;
  let regel = 0;
  const hull = new Map<string, string[]>();
  for (const kode of koder) {
    const fag = indeks.fag[kode];
    if (!fag) continue;
    const par = grepPar(fag, indeks.programomrader);
    const kandidater = koblingskandidater(kode, fag, par, tabeller, rader);
    const r = finnKobling(kode, indeks, tabeller, rader);
    if (r.status === 'ukoblet') {
      ukoblede[kode] = ukobletGrunn(fag, par);
      continue;
    }
    (r.status === 'koblet' ? koblet : flertydig).push(kode);
    if (kandidater.some((k) => k.metode === 'eksplisitt')) eksplisitt += 1;
    else regel += 1;
    // Program og trinn faget brukes på i Grep, men der det ikke er koblet.
    if (fag.timer !== null) {
      for (const p of par) {
        if (kandidater.some((k) => k.program === p.program && k.trinn === p.trinn)) continue;
        const n = `${p.program}|${p.trinn}|${fag.type}`;
        hull.set(n, [...(hull.get(n) ?? []), kode]);
      }
    }
  }
  for (const [kode, grunn] of Object.entries(ukoblede)) {
    const fag = indeks.fag[kode];
    if (!fag || fag.timer === null || grunn === 'bedrift' || grunn === 'fagtype') continue;
    for (const p of grepPar(fag, indeks.programomrader)) {
      const n = `${p.program}|${p.trinn}|${fag.type}`;
      hull.set(n, [...(hull.get(n) ?? []), kode]);
    }
  }
  const avvik = finnAvvik(indeks, tabeller, rader, arstimer);
  const status: Koblingsstatus = {
    hentet: indeks.hentet,
    antall: { fag: koder.length, koblet: koblet.length, flertydig: flertydig.length, ukoblet: Object.keys(ukoblede).length, eksplisitt, regel },
    ukoblede,
    avvik,
  };

  const programTekst = (p: string) => indeks.utdanningsprogram[p]?.nb ?? p;
  const linjer: string[] = [
    '# Kobling fra fagkode til årsramme',
    '',
    `Laget automatisk (\`npm run kobling:rapport\`). Kildesjekken lager rapporten på nytt hver mandag etter at Grep er hentet. Grep hentet ${indeks.hentet.slice(0, 10)}.`,
    '',
    'Koblingen står i `rules/sfs2213/kobling-fagkode-<periode>.yaml`. Fellesfag kobles eksplisitt per fagkode, utdanningsprogram og trinn. Felles programfag kobles med regler på fagkodeprefiks, utdanningsprogram og trinn. Alt er et forslag som ikke er kontrollert ennå. Se avgjørelse 023.',
    '',
    '## Sammendrag',
    '',
    '| | Fagkoder |',
    '|---|---:|',
    `| Fagkoder i videregående i Grep | ${koder.length} |`,
    `| Koblet til én årsramme | ${koblet.length} |`,
    `| Koblet, men årsrammen avhenger av utdanningsprogram eller trinn (kalkulatoren spør) | ${flertydig.length} |`,
    `| Ikke koblet (listen nederst) | ${Object.keys(ukoblede).length} |`,
    '',
    `Av de koblede er ${eksplisitt} koblet eksplisitt og ${regel} med regel.`,
    '',
    '## Avvik',
    '',
  ];
  if (avvik.length === 0) linjer.push('Ingen avvik.', '');
  else {
    const feil = avvik.filter((a) => a.alvor === 'feil');
    const adv = avvik.filter((a) => a.alvor === 'advarsel');
    if (feil.length > 0) linjer.push('**Feil** (testene feiler til dette er rettet):', '', ...feil.map((a) => `- ${a.tekst}`), '');
    if (adv.length > 0) linjer.push('**Bør ses på:**', '', ...adv.map((a) => `- ${a.tekst}`), '');
  }

  linjer.push(
    '## Programnavn i vedlegg 1 og utdanningsprogram i Grep',
    '',
    'Tabellen skal bekreftes av eier.',
    '',
    '| Vedlegg 1 | Utdanningsprogram | Kode i Grep |',
    '|---|---|---|',
    ...tabeller.programnavn.map((p) => `| ${celle(p.vedlegg)} | ${celle(p.navn)} | ${p.grep.length > 0 ? p.grep.join(', ') : '–'} |`),
    '',
  );

  // Utvalg: fellesfag, valgfrie programfag og regler, i en fast rekkefølge.
  const utvalg = (filter: (kode: string) => boolean, n: number) => koder.filter((k) => !(k in ukoblede)).sort((a, b) => stokk(a).localeCompare(stokk(b))).filter(filter).slice(0, n);
  const metodeFor = (k: string) => {
    const fag = indeks.fag[k];
    return fag ? koblingskandidater(k, fag, grepPar(fag, indeks.programomrader), tabeller, rader) : [];
  };
  // Ett fellesfag per fagkodeprefiks (norsk, engelsk, matematikk …), så utvalget ikke bare blir fremmedspråk.
  const prefikser = new Set<string>();
  const valgte = [
    ...utvalg((k) => {
      if (indeks.fag[k]?.type !== 'fellesfag' || prefikser.has(k.slice(0, 3))) return false;
      prefikser.add(k.slice(0, 3));
      return true;
    }, 10),
    ...utvalg((k) => metodeFor(k).some((c) => c.fra === 'kobling_programfag'), 5),
    ...utvalg((k) => metodeFor(k).some((c) => c.metode === 'regel'), 10),
  ];
  linjer.push(
    '## Utvalg til kontroll',
    '',
    'Et fast utvalg koblinger (det samme fra uke til uke så lenge dataene er de samme). Stemmer årsrammen med det dere bruker?',
    '',
    '| Fagkode | Fag | Program og trinn | Rad i vedlegg 1 | Årsramme (60/45) | Hvordan |',
    '|---|---|---|---|---|---|',
    ...valgte.flatMap((k) =>
      metodeFor(k).slice(0, 3).map((c) => `| ${k} | ${celle(indeks.fag[k]?.navn.nb ?? '')} | ${c.program} ${c.trinn} | ${celle(radNavn(c.rad))} | ${tall(c.rad.t60)}/${tall(c.rad.t45)}${c.rad.stjerne ? ' *' : ''} | ${c.metode === 'regel' ? `regel ${c.fra}` : 'eksplisitt'} |`),
    ),
    '',
  );

  linjer.push(
    '## Program og trinn uten kobling',
    '',
    'Fag med årstimer som brukes på et utdanningsprogram og trinn i Grep, men som ikke er koblet der. Ofte fordi vedlegg 1 ikke har en rad for programmet og trinnet.',
    '',
    '| Program | Trinn | Fagtype | Fagkoder | Eksempler |',
    '|---|---|---|---:|---|',
    ...[...hull]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([n, liste]) => {
        const [p = '', t = '', type = ''] = n.split('|');
        return `| ${programTekst(p)} (${p}) | ${t} | ${type.replace(/_/g, ' ')} | ${liste.length} | ${liste.slice(0, 4).join(', ')} |`;
      }),
    '',
    '## Fagkoder som ikke er koblet',
    '',
  );
  for (const grunn of GRUNNREKKEFOLGE) {
    const liste = Object.entries(ukoblede).filter(([, g]) => g === grunn);
    if (liste.length === 0) continue;
    linjer.push(`### ${GRUNNTEKST[grunn].tittel} (${liste.length})`, '', GRUNNTEKST[grunn].forklaring, '', '<details><summary>Vis fagkodene</summary>', '');
    for (const [kode] of liste) {
      const fag = indeks.fag[kode];
      const par = fag ? grepPar(fag, indeks.programomrader).map((p) => `${p.program} ${p.trinn}`) : [];
      linjer.push(`- ${kode} ${fag?.navn.nb ?? ''}${par.length > 0 ? ` (${par.length > 6 ? `${par.slice(0, 6).join(', ')} …` : par.join(', ')})` : ''}`);
    }
    linjer.push('', '</details>', '');
  }
  return { tekst: `${linjer.join('\n').trimEnd()}\n`, status };
}

/** Leser alt rapporten trenger fra repoet. */
export function lesKoblingsgrunnlag(rot: string) {
  const regler = lesRegelsett(rot);
  const hent = (n: string) => finnVerdi(regler, n, { dato: new Date().toISOString().slice(0, 10) });
  const indeks = lesFagindeks(rot);
  const arstimer = somTabell(hent('sfs2213.arstimer')).map((r) => ({ nr: Number(r.nr), fagkoder: Array.isArray(r.fagkoder) ? r.fagkoder.map(String) : [] }));
  return { indeks, tabeller: lesKoblinger(hent), rader: lesArsrammer(hent('sfs2213.arsrammer')), arstimer };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rot = fileURLToPath(new URL('../..', import.meta.url));
  const g = lesKoblingsgrunnlag(rot);
  const { tekst, status } = lagKoblingsrapport(g.indeks, g.tabeller, g.rader, g.arstimer);
  const statusfil = join(rot, 'data/status/kobling.json');
  const forrige = existsSync(statusfil) ? (JSON.parse(readFileSync(statusfil, 'utf8')) as Koblingsstatus) : null;
  writeFileSync(join(rot, 'docs/KOBLING.md'), tekst);
  writeFileSync(statusfil, `${JSON.stringify(status, null, 1)}\n`);
  const nye = forrige ? Object.keys(status.ukoblede).filter((k) => !(k in forrige.ukoblede)) : [];
  // Til den ukentlige kontrollsaken: nye fag uten kobling og nye avvik siden forrige rapport.
  const gamleAvvik = new Set((forrige?.avvik ?? []).map((a) => a.tekst));
  const endringer: Koblingsendringer = {
    nyeUkoblede: nye.map((k) => `${k} ${g.indeks.fag[k]?.navn.nb ?? ''} (${GRUNNTEKST[status.ukoblede[k] as Ukobletgrunn].tittel.toLowerCase()})`),
    nyeAvvik: forrige ? status.avvik.filter((a) => !gamleAvvik.has(a.tekst)).map((a) => a.tekst) : [],
  };
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert/kobling-endringer.json'), `${JSON.stringify(endringer, null, 2)}\n`);
  console.log(`Kobling: ${status.antall.koblet + status.antall.flertydig} av ${status.antall.fag} fagkoder koblet, ${status.antall.ukoblet} ukoblet${nye.length > 0 ? ` (${nye.length} nye)` : ''}, ${status.avvik.length} avvik.`);
}
