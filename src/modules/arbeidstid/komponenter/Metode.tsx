// «Slik regnes det ut»: metodebeskrivelsen for en kalkulator, fra content/arbeidstid/.
// Skjult til brukeren åpner den. Teksten kan rettes i innholdsfilen uten kodeendring.
import { useEffect, useState } from 'preact/hooks';
import { useKildestatus } from '../../../app/kildestatus.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Kortfot } from '../../../components/Kortfot.tsx';
import { Nivamerke, Statusmerke } from '../../../components/Merker.tsx';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';
import { beregnStatus, velgSynlige } from '../../../core/innhold/status.ts';
import { iDag } from '../kontekst.ts';
import { hentArbeidstidInnhold } from '../innhold.ts';

/** Henter ett innholdselement fra content/arbeidstid/ for brukerens fylke og skole. */
export function useArbeidstidElement(id: string): Innholdselement | null | undefined {
  const { innstillinger } = useTilstand();
  const [alle, settAlle] = useState<Innholdselement[] | null>(null);
  useEffect(() => {
    void hentArbeidstidInnhold().then(settAlle);
  }, []);
  if (alle === null) return undefined;
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  return velgSynlige(alle, sted).find((e) => e.id === id) ?? null;
}

/** Innholdselementet med merker, tekst og kilder. I et kort står kildene som en lukket rad nederst (`iKort`). */
export function Innholdstekst({ element, iKort = false }: { element: Innholdselement; iKort?: boolean }) {
  const { malform } = useTekst();
  const kildestatus = useKildestatus();
  const statuser = kildestatus.tilstand === 'ok' ? kildestatus.data.kilder : {};
  const status = beregnStatus(element, statuser, iDag());
  return (
    <>
      <div class="merker">
        <Nivamerke niva={element.gyldighet.niva} />
        <Statusmerke status={status} kontrollert={element.kontrollert} />
      </div>
      <div class="brodtekst" dangerouslySetInnerHTML={{ __html: element.tekst[malform] }} />
      {iKort ? <Kortfot kilder={element.kilder} /> : <Kildeliste kilder={element.kilder} />}
    </>
  );
}

export function Metode({ id }: { id: string }) {
  const { t } = useTekst();
  const element = useArbeidstidElement(id);
  return (
    <Forklaring tittel={t('arbeidstid.metode.tittel')}>
      {element === undefined ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : element === null ? (
        <p class="dempet">{t('arbeidstid.metode.ikkeFunnet')}</p>
      ) : (
        <Innholdstekst element={element} iKort />
      )}
    </Forklaring>
  );
}
