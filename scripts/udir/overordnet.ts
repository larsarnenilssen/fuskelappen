// Leser overordnet del fra sidene på udir.no (pakke 6, avgjørelse 037): innholdsregisteret i menyen og teksten på
// hver side. Rene funksjoner, så de kan testes med utdrag av sidene.
import { type HTMLElement, parse } from 'node-html-parser';
import type { Blokk } from '../../src/modules/laereplanverket/skjema.ts';

/** Et punkt i menyen på udir.no: adresse, kapittelnummer («1.1») og tittel. */
export interface Menypunkt {
  href: string;
  nr: string | null;
  tittel: string;
}

const rydd = (s: string) =>
  s
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Innholdsregisteret i overordnet del, i rekkefølge: fra innholdsfortegnelsen på forsiden eller menyen på de andre
 * sidene. Forsiden selv er ikke med.
 */
export function lesMeny(html: string): Menypunkt[] {
  const rot = parse(html);
  const ut: Menypunkt[] = [];
  const sett = new Set<string>();
  for (const a of rot.querySelectorAll('.curriculum-table-of-contents a, a.curriculum-menu-item__link')) {
    const href = a.getAttribute('href') ?? '';
    if (!/^\/lk20\/overordnet-del\/.+/.test(href) || sett.has(href)) continue;
    sett.add(href);
    // Innholdsfortegnelsen: «1.1<span>Menneskeverdet</span>». Menyen: egne felt for nummer og tittel.
    const tittelEl = a.querySelector('.link__text-without-numbers, .curriculum-menu-item__body');
    const tittel = rydd(tittelEl?.text ?? a.text);
    const prefiks = a.querySelector('.curriculum-menu-item__prefix')?.text ?? (tittelEl ? a.text.slice(0, a.text.length - tittelEl.text.length) : '');
    ut.push({ href, nr: rydd(prefiks).replace(/\.$/, '') || null, tittel });
  }
  return ut;
}

/** Tittelen på siden (den andre delen av overskriften, etter «Overordnet del»). */
export function lesTittel(html: string): string {
  const h1 = parse(html).querySelector('h1');
  const deler = h1?.querySelectorAll('span') ?? [];
  return rydd((deler[deler.length - 1] ?? h1)?.text ?? '');
}

function blokker(el: HTMLElement | null): Blokk[] {
  if (!el) return [];
  const ut: Blokk[] = [];
  for (const n of el.querySelectorAll('p, ul, ol')) {
    // Avsnitt inne i lister tas med i listen.
    if (n.tagName === 'P' && n.closest('li')) continue;
    if (n.tagName === 'P') {
      const tekst = rydd(n.text);
      if (tekst) ut.push({ type: 'avsnitt', tekst });
    } else if (!n.parentNode?.closest('li')) {
      const punkter = n.querySelectorAll(':scope > li').map((li) => rydd(li.text)).filter(Boolean);
      if (punkter.length > 0) ut.push({ type: 'liste', punkter });
    }
  }
  return ut;
}

/** Ingressen og teksten på en side. Ressurslenker og navigasjon er ikke med. */
export function lesTekst(html: string): { ingress: Blokk[]; tekst: Blokk[] } {
  const rot = parse(html);
  for (const fjern of rot.querySelectorAll('script, style, nav, .accordion, button')) fjern.remove();
  return {
    ingress: blokker(rot.querySelector('.curriculum-general-article__ingress')),
    tekst: blokker(rot.querySelector('.curriculum-general-article__body')),
  };
}

/** Plasserer menypunktene i et tre etter kapittelnummeret: 1.1 hører til 1, og 2.5.1 til 2.5. */
export type Tre<T> = T & { deler: Tre<T>[] };

export function lagTre<T extends { nr: string | null }>(punkter: readonly T[]): Tre<T>[] {
  const rot: Tre<T>[] = [];
  const etterNr = new Map<string, Tre<T>>();
  for (const p of punkter) {
    const node: Tre<T> = { ...p, deler: [] };
    const forelder = p.nr && p.nr.includes('.') ? etterNr.get(p.nr.slice(0, p.nr.lastIndexOf('.'))) : undefined;
    (forelder ? forelder.deler : rot).push(node);
    if (p.nr) etterNr.set(p.nr, node);
  }
  return rot;
}
