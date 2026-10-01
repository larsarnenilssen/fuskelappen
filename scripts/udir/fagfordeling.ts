// Leser tabellene i rundskrivet om fag- og timefordeling og tilbudsstruktur (Udir-1, vedlegg 1, kapittel 3)
// fra sidene på udir.no. Ren funksjon, testes i tests/unit/fagfordeling.test.ts (avgjørelse 024).
//
// To slags tabeller:
// - fordeling: «Fag- og timefordeling …» med linjer (Norsk, Matematikk, Sum fellesfag …) og kolonner
//   (Ordinær, Samisk, Elever med tegnspråk, Med stud.spes vg1 …) for ett trinn eller totalt.
// - fagliste: «Felles programfag …», «Programfag …» og «Valgfrie programfag …» med programområde eller
//   fagområde, fag og timer.
import { parse, type HTMLElement } from 'node-html-parser';
import type { Fagfordeling, Fordelingstabell, Fagliste } from '../../src/modules/fag/tilbud/skjema.ts';

const tekst = (el: HTMLElement): string =>
  el
    .querySelectorAll('sup')
    .reduce((t, s) => t.replace(s.text, ' '), el.text)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Tall med mellomrom som tusenskille («1 963»), eller null for tom celle. */
export function lesTimer(celle: string): number | null {
  const t = celle.replace(/\s/g, '').replace(',', '.');
  if (t === '' || t === '-' || t === '–') return null;
  const n = Number(t);
  if (!Number.isFinite(n)) throw new Error(`Ugyldig timetall i tabellen: «${celle}»`);
  return n;
}

/** Tabellnummeret i tittelen: «Tabell 17a Fag- og …» → «17a». */
function tabellnr(tittel: string): string {
  const m = /^Tabell\s+(\d+[a-z]?)/i.exec(tittel);
  if (!m?.[1]) throw new Error(`Fant ikke tabellnummer i «${tittel}»`);
  return m[1].toLowerCase();
}

function lesFordeling(tittel: string, rader: string[][]): Fordelingstabell {
  const [topp, nummer, navn, ...resten] = rader;
  if (!topp || !nummer || !navn || nummer[0]?.toLowerCase() !== 'kolonnenummer') throw new Error(`Uventet form på ${tittel}`);
  const kolonner = nummer.slice(1).map((n, i) => ({ nr: Number(n), navn: navn[i + 1] ?? '' }));
  if (kolonner.some((k) => !Number.isInteger(k.nr) || k.navn === '')) throw new Error(`Uventede kolonner i ${tittel}`);
  return {
    nr: tabellnr(tittel),
    tittel,
    type: 'fordeling',
    omfang: topp[1] ?? '',
    kolonner,
    rader: resten
      .filter((r) => (r[0] ?? '') !== '')
      .map((r) => ({ linje: r[0] as string, timer: kolonner.map((_, i) => lesTimer(r[i + 1] ?? '')) })),
  };
}

function lesFagliste(tittel: string, rader: string[][]): Fagliste {
  const [, ...resten] = rader;
  let gruppe = '';
  let del: string | null = null;
  const ut: Fagliste['rader'] = [];
  for (const r of resten) {
    // Rader med én celle er overskrifter: programområdet, eller «Felles programfag» og «Valgfrie programfag».
    if (r.length === 1) {
      const t = r[0] ?? '';
      if (/programfag/i.test(t)) del = t;
      else {
        gruppe = t;
        del = null;
      }
      continue;
    }
    const [g = '', fag = '', timer = ''] = r;
    if (g !== '') gruppe = g;
    if (fag === '') continue;
    ut.push({ gruppe, del, fag, timer: lesTimer(timer) });
  }
  return { nr: tabellnr(tittel), tittel, type: 'fagliste', rader: ut };
}

/** Alle tabellene på én side i rundskrivet. */
export function lesTabeller(html: string): (Fordelingstabell | Fagliste)[] {
  return parse(html)
    .querySelectorAll('table')
    .flatMap((t) => {
      const tittel = tekst(t.querySelector('caption') ?? parse(''));
      if (!/^Tabell\s+\d/i.test(tittel)) return [];
      const rader = t.querySelectorAll('tr').map((tr) => tr.querySelectorAll('th, td').map(tekst));
      const erFordeling = rader[1]?.[0]?.toLowerCase() === 'kolonnenummer';
      return [erFordeling ? lesFordeling(tittel, rader) : lesFagliste(tittel, rader)];
    });
}

/** Sjekker at tabellene er der og henger sammen: summene i hver kolonne stemmer med «Totalt omfang». */
export function validerFagfordeling(f: Fagfordeling): string[] {
  const feil: string[] = [];
  const fordeling = f.tabeller.filter((t): t is Fordelingstabell => t.type === 'fordeling');
  const lister = f.tabeller.filter((t): t is Fagliste => t.type === 'fagliste');
  if (fordeling.length < 20) feil.push(`Fant bare ${fordeling.length} tabeller med fag- og timefordeling.`);
  if (lister.length < 20) feil.push(`Fant bare ${lister.length} fagtabeller.`);
  for (const t of fordeling) {
    const total = t.rader.find((r) => /^totalt omfang/i.test(r.linje));
    if (!total) {
      feil.push(`Tabell ${t.nr} (${t.omfang}) mangler «Totalt omfang».`);
      continue;
    }
    const summer = t.rader.filter((r) => /^sum /i.test(r.linje));
    t.kolonner.forEach((k, i) => {
      // Totalt omfang = summen av alle linjer som ikke er summer (Sum fellesfag er med i linjene over seg).
      const linjer = t.rader.filter((r) => r !== total && !summer.includes(r));
      const sum = linjer.reduce((s, r) => s + (r.timer[i] ?? 0), 0);
      const oppgitt = total.timer[i];
      if (oppgitt !== null && oppgitt !== undefined && Math.abs(sum - oppgitt) > 1) feil.push(`Tabell ${t.nr} (${t.omfang}), kolonne ${k.nr} ${k.navn}: linjene gir ${sum}, tabellen sier ${oppgitt}.`);
    });
  }
  return feil;
}
