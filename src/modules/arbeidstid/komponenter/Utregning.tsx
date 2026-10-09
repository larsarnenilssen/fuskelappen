// Gjør trinnene fra en beregning om til steg i resultatkortet: tekst, formel med navn,
// formel med tall, resultat, og hvor hver verdi kommer fra (kilde, nivå, rad i vedlegg 1).
import { useTekst, type T } from '../../../app/tilstand.ts';
import { Resultatkort, type Utregningssteg } from '../../../components/Resultatkort.tsx';
import { fyllInn, formaterTall, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Niva } from '../../../core/innhold/skjema.ts';
import type { ComponentChildren } from 'preact';
import { unikeLokale } from '../../../components/Lokalregel.tsx';
import type { LokalVerdi } from '../../../core/regler/motor.ts';
import { type Enhet, type Operand, type Trinn } from '../beregning/index.ts';

const nivaRang: Record<Niva, number> = { nasjonal: 0, fylke: 1, skole: 2 };

export function tallTekst(verdi: number, desimaler = 2): string {
  return formaterTall(verdi, desimaler);
}

/** Kronebeløp vises alltid med øre (1 748,80), andre tall uten unødvendige nuller (28, 10,5). */
function tallMedEnhet(verdi: number, enhet: Enhet): string {
  return enhet === 'kroner' || enhet === 'kroner_per_time' ? formaterTall(verdi, 2, 2) : tallTekst(verdi, enhet === 'faktor' ? 4 : 2);
}

/** Enheter uten tekst: forholdstall og rene tall vises uten enhet. */
function enhetTekst(t: T, enhet: Enhet): string {
  return enhet === 'faktor' || enhet === 'tall' ? '' : t(`arbeidstid.enheter.${enhet}` as Tekstnokkel);
}

export function medEnhet(t: T, verdi: number, enhet: Enhet): string {
  const e = enhetTekst(t, enhet);
  return e ? `${tallMedEnhet(verdi, enhet)} ${e}` : tallTekst(verdi, 4);
}

/** Tall for en operand. Lister vises som sum (a + b) når trinnet summerer, ellers adskilt med semikolon. */
function operandTall(o: Operand, sum = false): string {
  if (o.liste) return o.liste.map((v) => tallTekst(v)).join(sum ? ' + ' : '; ');
  return tallMedEnhet(o.verdi, o.enhet);
}

function stegFra(t: T, trinn: Trinn, gruppenavn?: readonly string[]): Utregningssteg {
  const nokkel = `arbeidstid.trinn.${trinn.id}`;
  const mal = t(`${nokkel}.formel` as Tekstnokkel);
  const navn: Record<string, string> = {};
  const tall: Record<string, string> = {};
  for (const [k, o] of Object.entries(trinn.operander)) {
    navn[k] = t(`arbeidstid.storrelser.${o.navn}` as Tekstnokkel);
    tall[k] = operandTall(o, trinn.id === 'sum_beskjeftigelse' || trinn.id === 'sum_funksjon');
  }
  // Hver kilde (med punkt og nivå) vises én gang per trinn. Rader i tabeller (f.eks. vedlegg 1) samles på kilden.
  const kilder = new Map<string, NonNullable<Utregningssteg['kilder']>[number]>();
  const egen = Object.values(trinn.operander).some((o) => o.oppslag?.lokal?.egen === true);
  for (const o of Object.values(trinn.operander)) {
    if (!o.oppslag) continue;
    const id = `${o.oppslag.kilde.id}|${o.oppslag.kilde.punkt ?? ''}|${o.oppslag.niva}`;
    const forrige = kilder.get(id);
    const rad = [forrige?.rad, o.rad].filter(Boolean).join('; ');
    kilder.set(id, { kilde: o.oppslag.kilde, niva: o.oppslag.niva, ...(rad ? { rad } : {}) });
  }
  const tekst = t(`${nokkel}.tekst` as Tekstnokkel);
  return {
    tekst:
      trinn.gruppe !== undefined
        ? `${gruppenavn?.[trinn.gruppe - 1] ?? t('arbeidstid.felles.gruppe', { nr: trinn.gruppe })}: ${tekst.charAt(0).toLowerCase()}${tekst.slice(1)}`
        : tekst,
    formel: fyllInn(mal, navn),
    innsatt: fyllInn(mal, tall),
    verdi: medEnhet(t, trinn.resultat.verdi, trinn.resultat.enhet),
    kilder: [...kilder.values()],
    ...(egen ? { egen } : {}),
  };
}

/** De lokale verdiene som er brukt i utregningen (fase 9): brukerens egne og de godkjente. */
export function brukteLokale(trinnliste: readonly Trinn[]): LokalVerdi[] {
  return unikeLokale(trinnliste.flatMap((tr) => Object.values(tr.operander).map((o) => o.oppslag?.lokal)));
}

/** Mest lokale nivå blant verdiene som er brukt (skole → fylke → nasjonal). */
export function brukteNiva(trinnliste: readonly Trinn[]): Niva {
  let niva: Niva = 'nasjonal';
  for (const tr of trinnliste) {
    for (const o of Object.values(tr.operander)) {
      if (o.oppslag && nivaRang[o.oppslag.niva] > nivaRang[niva]) niva = o.oppslag.niva;
    }
  }
  return niva;
}

interface Props {
  tittel: string;
  resultat: Operand;
  trinn: readonly Trinn[];
  /** Vis siste trinn som sammendrag under verdien. Standard er sann. */
  sammendrag?: boolean;
  /** Vis hovedresultatet i en fast linje nederst når kortet er utenfor skjermen. Standard er sann. */
  fast?: boolean;
  /** Kortnavnene på fagene i beregningen, i samme rekkefølge (eier 09.10.2026). Uten dem står «Fag 1», «Fag 2». */
  gruppenavn?: readonly string[];
  children?: ComponentChildren;
}

/** Alle kildene i utregningen, én gang hver, i rekkefølgen de brukes. */
function samleKilder(steg: readonly Utregningssteg[]): NonNullable<Utregningssteg['kilder']> {
  const kilder = new Map<string, NonNullable<Utregningssteg['kilder']>[number]>();
  for (const s of steg) {
    for (const k of s.kilder ?? []) {
      const id = `${k.kilde.id}|${k.kilde.punkt ?? ''}|${k.niva}`;
      const forrige = kilder.get(id);
      const rader = new Set([...(forrige?.rad?.split('; ') ?? []), ...(k.rad ? [k.rad] : [])]);
      kilder.set(id, { kilde: k.kilde, niva: k.niva, ...(rader.size ? { rad: [...rader].join('; ') } : {}) });
    }
  }
  return [...kilder.values()];
}

/** Resultatkort for en beregning, med kompakt utregning trinn for trinn og kildene samlet. */
export function Utregningskort({ tittel, resultat, trinn, sammendrag = true, fast = true, gruppenavn, children }: Props) {
  const { t } = useTekst();
  const enhet = enhetTekst(t, resultat.enhet);
  const steg = trinn.map((tr) => stegFra(t, tr, gruppenavn));
  const siste = steg[steg.length - 1];
  return (
    <Resultatkort
      tittel={tittel}
      verdi={tallMedEnhet(resultat.verdi, resultat.enhet)}
      {...(enhet ? { enhet } : {})}
      niva={brukteNiva(trinn)}
      {...(sammendrag && siste?.innsatt ? { sammendrag: `${siste.innsatt} = ${siste.verdi}` } : {})}
      steg={steg.map((s) => ({ ...s, kilder: (s.kilder ?? []).filter((k) => k.niva !== 'nasjonal') }))}
      kilder={samleKilder(steg)}
      lokale={brukteLokale(trinn)}
      fast={fast}
    >
      {children}
    </Resultatkort>
  );
}
