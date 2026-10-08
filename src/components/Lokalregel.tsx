// Lokale regler der de brukes (fase 9, avgjørelse 093): merket på brukerens egne regler og verdier, og linjen under en
// godkjent regel om hvem den gjelder for og hvor den kan endres eller meldes inn (eier 08.10.2026).
import { useTekst } from '../app/tilstand.ts';
import { formaterDato } from '../core/i18n/tekst.ts';
import type { LokalVerdi } from '../core/regler/motor.ts';
import { Ikon } from './Ikon.tsx';
import '../styles/lokaleregler.css';

/** Adressen til skjemaet for en lokal regel. */
export const lokalRegelAdresse = (sporring: Record<string, string> = {}): string => {
  const q = new URLSearchParams(sporring).toString();
  return `#/innstillinger/lokal-regel${q ? `?${q}` : ''}`;
};

/** Merket på en regel eller verdi brukeren har lagt inn selv: «Din egen · ikke kontrollert». */
export function Egenmerke({ verdi = false }: { verdi?: boolean }) {
  const { t } = useTekst();
  return (
    <span class="merke merke-egen">
      <Ikon navn="person" />
      {verdi ? t('lokaleRegler.merke.egenVerdi') : t('lokaleRegler.merke.egen')} · {t('lokaleRegler.merke.ikkeKontrollert')}
    </span>
  );
}

/**
 * Under en godkjent regel der den brukes: hvem den gjelder for, når den ble kontrollert, og lenken til skjemaet, der
 * brukeren kan endre den for seg selv eller melde inn at den er feil eller endret.
 */
export function Lokalfot({ kode, stedsnavn, kontrollert }: { kode: string; stedsnavn: string; kontrollert: string | null }) {
  const { t, malform } = useTekst();
  return (
    <p class="lokalfot">
      <span>{t('lokaleRegler.lokalfot.tekst', { sted: stedsnavn, dato: kontrollert ? formaterDato(kontrollert, malform) : '' })}</span>{' '}
      <span>
        {t('lokaleRegler.lokalfot.sporsmal')} <a href={lokalRegelAdresse({ fra: kode })}>{t('lokaleRegler.lokalfot.lenke')}</a>
      </span>
    </p>
  );
}

/** Linjene under resultatet i en kalkulator når en lokal verdi er brukt. */
export function LokaleVerdierFot({ lokale }: { lokale: readonly LokalVerdi[] }) {
  const { t } = useTekst();
  if (lokale.length === 0) return null;
  return (
    <div class="lokaleverdier-fot">
      {lokale.map((l) =>
        l.egen ? (
          <p key={l.kode} class="lokalfot">
            {t('lokaleRegler.lokalfot.egen', { sted: l.stedsnavn })} <a href={lokalRegelAdresse({ kode: l.kode })}>{t('lokaleRegler.endre')}</a>
          </p>
        ) : (
          <Lokalfot key={l.kode} kode={l.kode} stedsnavn={l.stedsnavn} kontrollert={l.kontrollert} />
        ),
      )}
    </div>
  );
}

/** De lokale verdiene i oppslagene, én gang hver. */
export function unikeLokale(lokale: readonly (LokalVerdi | undefined)[]): LokalVerdi[] {
  const sett = new Map<string, LokalVerdi>();
  for (const l of lokale) if (l) sett.set(l.kode, l);
  return [...sett.values()];
}
