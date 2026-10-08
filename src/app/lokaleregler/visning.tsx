// Skissen til fase 9: hvordan brukerens egne regler vises. Se skisse.ts.
import { useEffect, useState } from 'preact/hooks';
import { Ikon } from '../../components/Ikon.tsx';
import { formaterDato, formaterTall } from '../../core/i18n/tekst.ts';
import { fylkesnavn } from '../Stedmerknad.tsx';
import { useTekst, useTilstand } from '../tilstand.ts';
import { type EgenRegel, hentRegler, lytt, nasjonalVerdi, status, type Verdinokkel } from './skisse.ts';
import '../../styles/lokaleregler.css';

/** Reglene i skissen, oppdatert når de endres. */
export function useEgneRegler(): readonly EgenRegel[] {
  const [regler, settRegler] = useState(hentRegler);
  useEffect(() => lytt(() => settRegler(hentRegler())), []);
  return regler;
}

/** Stedet regelen gjelder for, med navn: skolen eller fylket brukeren har valgt. */
export function useSted() {
  const { innstillinger } = useTilstand();
  const fylke = fylkesnavn(innstillinger.fylke);
  return { fylke: innstillinger.fylke, fylkesnavn: fylke, skole: innstillinger.skole, navn: innstillinger.skole?.navn ?? fylke };
}

export const verdinavn = (nokkel: Verdinokkel) => nokkel.split('.')[1] as 'planfestet_timer';

/** Verdien med enheten fra regelsettet, f.eks. «1 150 timer». */
export function medEnhet(nokkel: Verdinokkel, verdi: number): string {
  const enhet = nasjonalVerdi(nokkel).enhet;
  return `${formaterTall(verdi)}${enhet ? ` ${enhet}` : ''}`;
}

/** Merket på en regel brukeren har lagt inn selv: «Din egen · ikke kontrollert». */
export function Egenmerke({ verdi = false }: { verdi?: boolean }) {
  const { t } = useTekst();
  return (
    <span class="merke merke-egen">
      <Ikon navn="person" />
      {verdi ? t('lokaleRegler.merke.egenVerdi') : t('lokaleRegler.merke.egen')} · {t('lokaleRegler.merke.ikkeKontrollert')}
    </span>
  );
}

/** Statuslinjen: når regelen ble lagt inn, og om den er meldt inn eller godkjent. */
export function Statuslinje({ regel }: { regel: EgenRegel }) {
  const { t, malform } = useTekst();
  const s = status(regel);
  const dato = (d: string) => formaterDato(d, malform);
  return (
    <span class="egenregel-status">
      {t('lokaleRegler.skjema.lagtInn', { dato: dato(regel.lagtInn) })}
      {' · '}
      {s === 'egen'
        ? t('lokaleRegler.status.egen')
        : s === 'innmeldt'
          ? t('lokaleRegler.status.innmeldt', { dato: dato(regel.innmeldt ?? '') })
          : t('lokaleRegler.status.godkjent', { dato: dato(regel.godkjent ?? '') })}
    </span>
  );
}

/** En regel brukeren har lagt inn, som et kort på siden der den gjelder: stiplet kant og merket «Din egen». */
export function Egenregelkort({ regel }: { regel: EgenRegel }) {
  const { t } = useTekst();
  return (
    <article class="egenregel">
      <div class="egenregel-topp">
        <Egenmerke />
      </div>
      <h3 class="egenregel-tittel">{regel.tittel}</h3>
      <p class="egenregel-tekst">{regel.tekst}</p>
      {regel.lenke && (
        <p class="egenregel-kilde">
          <a href={regel.lenke} rel="noopener noreferrer" target="_blank">
            {new URL(regel.lenke).hostname}
            <Ikon navn="ekstern" class="ikon-liten" />
          </a>
        </p>
      )}
      <p class="egenregel-fot">
        <Statuslinje regel={regel} />
        <a href={`#/innstillinger/lokal-regel?kode=${regel.kode}`}>
          <Ikon navn="blyant" class="ikon-liten" />
          {t('lokaleRegler.endre')}
        </a>
      </p>
    </article>
  );
}
