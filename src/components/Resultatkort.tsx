// Resultatkort med «vis utregning» og «kopier». Viser nivå der verdien er lokal.
// Utregningen er kompakt: én linje per trinn med tallene satt inn, formelen med navn i liten skrift,
// og kildene samlet nederst. Kildene står med kortnavn (f.eks. «Opplæringsforskrifta § 4-19»), så de ikke tar
// mer plass enn utregningen. Kopien har de fulle navnene. Hovedresultatet kan også vises i en fast linje
// nederst på skjermen.
import type { ComponentChildren } from 'preact';
import { useId, useRef, useState } from 'preact/hooks';
import { type T, useTekst } from '../app/tilstand.ts';
import { app } from '../config/app.ts';
import { formaterDato } from '../core/i18n/tekst.ts';
import type { KildeRef, Niva } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';
import { Kildelenke, kildeTekst } from './Kildelenke.tsx';
import { Nivamerke } from './Merker.tsx';
import { Egenmerke, LokaleVerdierFot } from './Lokalregel.tsx';
import type { LokalVerdi } from '../core/regler/motor.ts';
import { Resultatlinje } from './Resultatlinje.tsx';
import { Sammenleggknapp, useSammenlagt } from './Sammenlegg.tsx';

export interface Utregningssteg {
  tekst: string;
  verdi: string;
  kilde?: KildeRef;
  niva?: Niva;
  /** Formelen med navn, f.eks. «årstimer ÷ årsramme × 100». */
  formel?: string;
  /** Formelen med tallene satt inn, f.eks. «140 ÷ 525 × 100». Vises foran verdien. */
  innsatt?: string;
  /** Hvor verdiene i trinnet kommer fra. Lokale nivåer vises som merke på trinnet. */
  kilder?: { kilde: KildeRef; niva: Niva; rad?: string }[];
  /** Trinnet bruker en verdi brukeren har lagt inn selv (fase 9). Merket «din egen verdi» står i stedet for nivået. */
  egen?: boolean;
}

interface Props {
  tittel: string;
  verdi: string;
  enhet?: string;
  niva?: Niva;
  /** Kort linje under verdien, f.eks. den siste utregningen: «140 ÷ 525 × 100». */
  sammendrag?: string;
  steg: Utregningssteg[];
  /** Kildene for hele utregningen, vist samlet nederst i utregningen. */
  kilder?: { kilde: KildeRef; niva: Niva; rad?: string }[];
  /** Vis hovedresultatet i en fast linje nederst når kortet er utenfor skjermen. */
  fast?: boolean;
  /** Innhold under hovedverdien, f.eks. en oversikt over delresultater. */
  children?: ComponentChildren;
  /** Lokale verdier som er brukt (fase 9): brukerens egne og de godkjente, med hvor de endres eller meldes inn. */
  lokale?: readonly LokalVerdi[];
}

/** Utregningen som ren tekst, til utklippstavlen. */
export function lagKopitekst(t: T, p: Omit<Props, 'children' | 'fast'>, dato: string): string {
  const linjer = [`${p.tittel}: ${p.verdi}${p.enhet ? ` ${p.enhet}` : ''}`];
  if (p.sammendrag) linjer.push(p.sammendrag);
  linjer.push('', `${t('komponenter.resultat.utregning')}:`);
  p.steg.forEach((s, i) => {
    linjer.push(`${i + 1}. ${s.tekst}: ${s.innsatt ? `${s.innsatt} = ` : ''}${s.verdi}`);
    if (s.formel) linjer.push(`   ${s.formel}`);
  });
  for (const l of p.lokale ?? []) {
    linjer.push('', l.egen ? t('lokaleRegler.kopi.egen', { sted: l.stedsnavn }) : t('lokaleRegler.kopi.godkjent', { sted: l.stedsnavn, dato: l.kontrollert ?? '' }));
  }
  if (p.kilder && p.kilder.length > 0) {
    linjer.push('', `${t('komponenter.resultat.kilde')}:`);
    for (const k of p.kilder) {
      const { navn, punkt, url } = kildeTekst(t, k.kilde);
      linjer.push(`- ${navn}${punkt}${k.rad ? ` (${k.rad})` : ''}${url ? `: ${url}` : ''}`);
    }
  }
  linjer.push('');
  linjer.push(t('komponenter.resultat.beregnet', { app: app.navn, dato }));
  linjer.push(t('komponenter.resultat.forbehold', { app: app.navn }));
  return linjer.join('\n');
}

type Kopistatus = 'klar' | 'kopiert' | 'feilet';

export function Resultatkort(props: Props) {
  const { tittel, verdi, enhet, niva = 'nasjonal', sammendrag, steg, kilder, fast = false, children, lokale = [] } = props;
  const egen = lokale.some((l) => l.egen);
  const { t, malform } = useTekst();
  const [vis, settVis] = useState(false);
  const [kopi, settKopi] = useState<{ status: Kopistatus; tekst: string }>({ status: 'klar', tekst: '' });
  const id = useId();
  const innhold = useId();
  const kort = useRef<HTMLElement>(null);
  // Et sammenlagt kort viser bare tittelen og svaret.
  const [lukket, veksle] = useSammenlagt(`resultat-${tittel}`);

  const kopier = async () => {
    const tekst = lagKopitekst(t, props, formaterDato(new Date().toISOString(), malform));
    try {
      await navigator.clipboard.writeText(tekst);
      settKopi({ status: 'kopiert', tekst });
    } catch {
      settKopi({ status: 'feilet', tekst });
    }
  };

  return (
    <section class="resultatkort" aria-label={tittel} ref={kort} tabIndex={-1}>
      <div class="resultatkort-topp">
        <h2 class="resultatkort-tittel">
          <Sammenleggknapp lukket={lukket} onVeksle={veksle} kontroll={innhold}>
            {tittel}
          </Sammenleggknapp>
        </h2>
        <div class="merker merker-inline">{egen ? <Egenmerke verdi /> : <Nivamerke niva={niva} />}</div>
      </div>
      <p class="resultatkort-verdi" aria-live="polite">
        <span class="tall">{verdi}</span>
        {enhet && <span class="resultatkort-enhet"> {enhet}</span>}
      </p>
      <div id={innhold} hidden={lukket}>
        {sammendrag && <p class="resultatkort-sammendrag tall">{sammendrag}</p>}
        {children}
        <LokaleVerdierFot lokale={lokale} />
        <div class="resultatkort-knapper">
          <button type="button" class="lenkeknapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
            <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten" />
            {vis ? t('komponenter.resultat.skjulUtregning') : t('komponenter.resultat.visUtregning')}
          </button>
          <button type="button" class="lenkeknapp" onClick={() => void kopier()}>
            <Ikon navn="kopier" class="ikon-liten" />
            {t('komponenter.resultat.kopier')}
          </button>
          <span class="resultatkort-kopistatus" role="status">
            {kopi.status === 'kopiert' ? t('komponenter.resultat.kopiert') : ''}
          </span>
        </div>
        {kopi.status === 'feilet' && (
          <div class="resultatkort-kopi">
            <p class="felt-hjelp">{t('komponenter.resultat.kopierFeilet')}</p>
            <textarea readOnly rows={8} aria-label={t('komponenter.resultat.kopiTekst')} value={kopi.tekst} />
          </div>
        )}
        <div id={id} hidden={!vis}>
          <h3 class="skjult-visuelt">{t('komponenter.resultat.utregning')}</h3>
          <ol class="utregning">
            {steg.map((s, i) => (
              <li key={i}>
                <span class="utregning-tekst">{s.tekst}</span>
                <span class="utregning-linje">
                  {s.innsatt && <span class="tall">{s.innsatt} = </span>}
                  <span class="utregning-verdi tall">{s.verdi}</span>
                  {s.egen ? (
                    <Egenmerke verdi />
                  ) : (
                    [...new Set((s.kilder ?? []).map((k) => k.niva).concat(s.niva ? [s.niva] : []))]
                      .filter((n) => n !== 'nasjonal')
                      .map((n) => <Nivamerke key={n} niva={n} />)
                  )}
                </span>
                {s.formel && <span class="utregning-formel">{s.formel}</span>}
                {s.kilde && (
                  <span class="utregning-kilde">
                    <Kildelenke kilde={s.kilde} kort />
                  </span>
                )}
              </li>
            ))}
          </ol>
          {kilder && kilder.length > 0 && (
            <div class="utregning-kilder">
              <h3 class="liten-overskrift">{t('komponenter.resultat.kilde')}</h3>
              <ul>
                {kilder.map((k) => (
                  <li key={`${k.kilde.id}-${k.kilde.punkt ?? ''}-${k.niva}`}>
                    <Kildelenke kilde={k.kilde} kort />
                    {k.niva !== 'nasjonal' && <Nivamerke niva={k.niva} />}
                    {k.rad && <span class="dempet"> {k.rad}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {fast && <Resultatlinje mal={kort} tittel={tittel} verdi={verdi} {...(enhet ? { enhet } : {})} />}
    </section>
  );
}

/**
 * Resultatkortet før noe er fylt inn (eier 08.10.2026, docs/DESIGN.md): tittelen, en strek der tallet kommer, og hva
 * som må fylles inn. Kolonnen med resultatet står da ikke tom på skrivebord, og siden hopper ikke når tallet kommer.
 */
export function Tomtresultat({ tittel, tekst }: { tittel: string; tekst: string }) {
  return (
    <section class="tomtresultat" aria-label={tittel}>
      <h2 class="tomtresultat-tittel">{tittel}</h2>
      <p class="tomtresultat-verdi tall" aria-hidden="true">
        –
      </p>
      <p class="tomtresultat-tekst">{tekst}</p>
    </section>
  );
}
