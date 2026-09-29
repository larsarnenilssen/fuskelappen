// Gjør trinnene fra en beregning om til steg i resultatkortet: tekst, formel med navn,
// formel med tall, resultat, og hvor hver verdi kommer fra (kilde, nivå, rad i vedlegg 1).
import { useTekst, type T } from '../../../app/tilstand.ts';
import { Resultatkort, type Utregningssteg } from '../../../components/Resultatkort.tsx';
import { fyllInn, formaterTall, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { Niva } from '../../../core/innhold/skjema.ts';
import type { ComponentChildren } from 'preact';
import { type Enhet, harUkontrollert, type Operand, type Trinn } from '../beregning/index.ts';

const nivaRang: Record<Niva, number> = { nasjonal: 0, fylke: 1, skole: 2 };

export function tallTekst(verdi: number, desimaler = 2): string {
  return formaterTall(verdi, desimaler);
}

/** Enheter uten tekst: forholdstall og rene tall vises uten enhet. */
function enhetTekst(t: T, enhet: Enhet): string {
  return enhet === 'faktor' || enhet === 'tall' ? '' : t(`arbeidstid.enheter.${enhet}` as Tekstnokkel);
}

export function medEnhet(t: T, verdi: number, enhet: Enhet): string {
  const e = enhetTekst(t, enhet);
  return e ? `${tallTekst(verdi)} ${e}` : tallTekst(verdi, 4);
}

function operandTall(o: Operand): string {
  if (o.liste) return o.liste.map((v) => tallTekst(v)).join('; ');
  return tallTekst(o.verdi, o.enhet === 'faktor' ? 4 : 2);
}

function steg(t: T, trinn: Trinn): Utregningssteg {
  const nokkel = `arbeidstid.trinn.${trinn.id}`;
  const mal = t(`${nokkel}.formel` as Tekstnokkel);
  const navn: Record<string, string> = {};
  const tall: Record<string, string> = {};
  for (const [k, o] of Object.entries(trinn.operander)) {
    navn[k] = t(`arbeidstid.storrelser.${o.navn}` as Tekstnokkel);
    tall[k] = operandTall(o);
  }
  // Hver kilde (med punkt og nivå) vises én gang per trinn. Rader i tabeller (f.eks. vedlegg 1) samles på kilden.
  const kilder = new Map<string, NonNullable<Utregningssteg['kilder']>[number]>();
  for (const o of Object.values(trinn.operander)) {
    if (!o.oppslag) continue;
    const id = `${o.oppslag.kilde.id}|${o.oppslag.kilde.punkt ?? ''}|${o.oppslag.niva}`;
    const forrige = kilder.get(id);
    const rad = [forrige?.rad, o.rad].filter(Boolean).join('; ');
    kilder.set(id, { kilde: o.oppslag.kilde, niva: o.oppslag.niva, ...(rad ? { rad } : {}) });
  }
  const tekst = t(`${nokkel}.tekst` as Tekstnokkel);
  return {
    tekst: trinn.gruppe !== undefined ? `${t('arbeidstid.felles.gruppe', { nr: trinn.gruppe })}: ${tekst.charAt(0).toLowerCase()}${tekst.slice(1)}` : tekst,
    formel: fyllInn(mal, navn),
    innsatt: fyllInn(mal, tall),
    verdi: medEnhet(t, trinn.resultat.verdi, trinn.resultat.enhet),
    kilder: [...kilder.values()],
  };
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
  children?: ComponentChildren;
}

/** Resultatkort for en beregning, med utregningen trinn for trinn. */
export function Utregningskort({ tittel, resultat, trinn, children }: Props) {
  const { t } = useTekst();
  const enhet = enhetTekst(t, resultat.enhet);
  return (
    <Resultatkort
      tittel={tittel}
      verdi={tallTekst(resultat.verdi)}
      {...(enhet ? { enhet } : {})}
      niva={brukteNiva(trinn)}
      ikkeKontrollert={harUkontrollert(trinn)}
      steg={trinn.map((tr) => steg(t, tr))}
    >
      {children}
    </Resultatkort>
  );
}

