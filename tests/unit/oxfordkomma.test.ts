// Oppramsinger har ikke komma foran siste «og»/«eller» (ikke «A, B, og C»). Sjekker appens egne tekster:
// UI-tekstene i src/strings og innholdet i content. Kildetekst (kilderegisteret, `punkt`, `url`, `sitat`,
// `kildetekst`) gjengis ordrett og sjekkes ikke.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { isPair, isScalar, LineCounter, parseDocument, visit } from 'yaml';
import { describe, expect, it } from 'vitest';

const rot = join(__dirname, '../..');

function filer(mappe: string, endelse: string): string[] {
  return readdirSync(mappe).flatMap((navn) => {
    const sti = join(mappe, navn);
    if (statSync(sti).isDirectory()) return filer(sti, endelse);
    return navn.endsWith(endelse) ? [sti] : [];
  });
}

// «, B, og C» der B er ett til fire ord uten tegnsetting: B kan være nest siste ledd i en oppramsing.
const oppramsing = /, ((?:[^\s,.;:!?()]+ ){0,3}[^\s,.;:!?()]+), (og|eller) (\S+)/g;

// Ordlistene under sorterer bort treff der kommaet er riktig. Hele ord sammenlignes (\b virker ikke med æøå).
const ordliste = (ord: string) => new Set(ord.split(' '));
// B har selv «og»/«eller», så kommaet viser hvor leddene skilles.
const konjunksjon = ordliste('og eller');
// B er et innskudd, ikke et ledd i oppramsingen («…, unntatt kroppsøving, og skal …»).
const innskudd = ordliste('også unntatt unnateke der slik ut bare berre fortsatt framleis');
// B har et verbal, så kommaet avslutter en setning eller et innskudd («…, skal eleven varsles, og foreldrene …»)
const verbal = ordliste('er kan skal må bør blir har får gjelder gjeld');
// … men en leddsetning kan være et ledd i oppramsingen («…, hva skolen kan gjøre, og klageinstansen»).
const leddsetning = ordliste('at om hva hvem hvor hvordan hvilke kva kven kvar korleis');
// Etter «og»/«eller» begynner en ny helsetning («…, og det kan endres»).
const nyHelsetning = ordliste('det de dei den han ho hen alle er kan skal må bør blir får viderefører vidarefører');

/** Steder der kommaet er riktig. Utdraget er det som står fra «, B» til og med «og»/«eller». */
const unntak: { fil: string; utdrag: string }[] = [
  // To helsetninger: «… teller med, og omsorg for barn … teller med inntil tre år».
  { fil: 'content/begreper/ansettelse.yaml', utdrag: ', teller med, og' },
  { fil: 'content/begreper/ansettelse.yaml', utdrag: ', tel med, og' },
  // Leddene har selv «eller» («1P eller 1T», «dekk eller maskin»), så kommaet viser hvor de skilles.
  { fil: 'src/strings/moduler/opplaeringslop.nb.ts', utdrag: ', et fremmedspråk, eller' },
  { fil: 'src/strings/moduler/opplaeringslop.nn.ts', utdrag: ', eit framandspråk, eller' },
  // Siste ledd er selv en oppramsing («utsatt, ny og særskilt eksamen»).
  { fil: 'src/strings/moduler/eksamen.nb.ts', utdrag: ', særskilt tilrettelegging, og' },
  { fil: 'src/strings/moduler/eksamen.nn.ts', utdrag: ', særskild tilrettelegging, og' },
];

/** Utdragene i en tekst som ser ut som en oppramsing med komma foran siste «og»/«eller». */
function oxfordkomma(tekst: string): string[] {
  return [...tekst.matchAll(oppramsing)]
    .filter(([, ledd = '', , neste = '']) => {
      const ord = ledd.toLowerCase().split(' ');
      const forste = ord[0] ?? '';
      if (ord.some((o) => konjunksjon.has(o)) || innskudd.has(forste)) return false;
      if (ord.some((o) => verbal.has(o)) && !leddsetning.has(forste)) return false;
      return !nyHelsetning.has(neste.toLowerCase());
    })
    .map(([, ledd, og]) => `, ${ledd}, ${og}`);
}

const erUnntak = (fil: string, utdrag: string) => unntak.some((u) => u.fil === fil && u.utdrag === utdrag);

// Felt som holder kildetekst, eller som ikke er tekst.
const hoppOver = new Set(['id', 'url', 'punkt', 'sitat', 'kildetekst', 'stikkord', 'lenkeord']);

/** Alle treff som ikke er unntak, som «fil:linje: «utdrag»». */
function brudd(): string[] {
  const funn: string[] = [];

  for (const sti of filer(join(rot, 'src/strings'), '.ts')) {
    const fil = relative(rot, sti);
    readFileSync(sti, 'utf8')
      .split('\n')
      .forEach((linje, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(linje)) return;
        for (const utdrag of oxfordkomma(linje)) {
          if (!erUnntak(fil, utdrag)) funn.push(`${fil}:${i + 1}: «${utdrag}»`);
        }
      });
  }

  for (const sti of filer(join(rot, 'content'), '.yaml')) {
    const fil = relative(rot, sti);
    if (fil === 'content/kilder.yaml') continue;
    const kilde = readFileSync(sti, 'utf8');
    const linjer = new LineCounter();
    visit(parseDocument(kilde, { lineCounter: linjer }), {
      Scalar(nokkel, node, over) {
        if (nokkel === 'key' || typeof node.value !== 'string' || !node.range) return;
        if (over.some((p) => isPair(p) && isScalar(p.key) && hoppOver.has(String(p.key.value)))) return;
        // Brettede blokker (>-) deler linjene, så teksten leses med ett mellomrom mellom ordene.
        for (const utdrag of oxfordkomma(node.value.replace(/\s+/g, ' '))) {
          if (erUnntak(fil, utdrag)) continue;
          // Linjen der utdraget står, ikke bare der teksten begynner.
          const monster = new RegExp(utdrag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'));
          const indeks = monster.exec(kilde.slice(node.range[0]))?.index ?? 0;
          funn.push(`${fil}:${linjer.linePos(node.range[0] + indeks).line}: «${utdrag}»`);
        }
      },
    });
  }
  return funn;
}

describe('oxfordkomma', () => {
  it('kjenner igjen komma foran siste og/eller i en oppramsing', () => {
    expect(oxfordkomma('Steg for steg: begrunnelse, frist, hva skolen kan gjøre, og klageinstansen.')).toHaveLength(1);
    expect(oxfordkomma('planlegge, gjennomføre, og vurdere')).toHaveLength(1);
    expect(oxfordkomma('underveisvurdering, sluttvurdering og eksamen')).toHaveLength(0);
    expect(oxfordkomma('Samme antall brukes for alle, slik Visma gjør, og det kan endres.')).toHaveLength(0);
  });

  it('ingen oppramsinger med komma foran siste og/eller', () => {
    expect(brudd()).toEqual([]);
  });
});
