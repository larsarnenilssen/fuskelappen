// Felles for sidene i Lov og forskrift (avgjørelse 039): lasting, teksten i en paragraf, paragrafboksene og søket.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { lovdataUrl, paragraffavoritt, paragraffavorittnavn, paragrafRute, sokIDokumenter, type Treff } from '../data.ts';
import type { Ledd, Lovdokument, Paragraf, Segment } from '../typer.ts';

/** Laster inn, eller feilmelding med «Prøv igjen». */
export function Lasting({ feil, provIgjen }: { feil: boolean; provIgjen: () => void }) {
  const { t } = useTekst();
  if (!feil) return <p class="dempet">{t('app.lasterInn')}</p>;
  return (
    <p role="alert">
      {t('lov.lasterFeil')}{' '}
      <button type="button" class="lenkeknapp" onClick={provIgjen}>
        {t('app.provIgjen')}
      </button>
    </p>
  );
}

/** Laster noe asynkront, med «Prøv igjen» ved feil. Lastes på nytt når `nokkel` endres. */
export function useLast<T>(last: () => Promise<T>, nokkel: string): [T | 'laster' | 'feil', () => void] {
  const [data, settData] = useState<T | 'laster' | 'feil'>('laster');
  const [forsok, settForsok] = useState(0);
  useEffect(() => {
    let aktiv = true;
    settData('laster');
    last().then(
      (d) => aktiv && settData(d),
      () => aktiv && settData('feil'),
    );
    return () => {
      aktiv = false;
    };
    // `last` er en ny funksjon ved hver tegning. Nøkkelen sier når noe annet skal lastes.
  }, [nokkel, forsok]);
  return [data, () => settForsok((n) => n + 1)];
}

/**
 * Teksten i et ledd: lenker til paragrafer i appen går dit, andre lenker går til Lovdata. Fotnotehenvisninger vises
 * hevet.
 */
export function Tekst({ tekst }: { tekst: readonly Segment[] }) {
  return (
    <>
      {tekst.map((s, i) =>
        typeof s === 'string' ? (
          s
        ) : 'f' in s ? (
          <sup key={i}>{s.f}</sup>
        ) : s.a ? (
          <a key={i} href={`#${paragrafRute(...(s.a.split('/') as [string, string]))}`}>
            {s.t}
          </a>
        ) : (
          <a key={i} href={`https://lovdata.no/${s.l}`} target="_blank" rel="noopener noreferrer">
            {s.t}
          </a>
        ),
      )}
    </>
  );
}

function Leddtekst({ ledd }: { ledd: Ledd }) {
  return (
    <>
      {ledd.tekst.length > 0 && (
        <p>
          <Tekst tekst={ledd.tekst} />
        </p>
      )}
      {ledd.liste && (
        <ol class="lov-liste">
          {ledd.liste.map((p, i) => (
            <li key={i}>
              <span class="lov-merke">{p.merke}</span>
              <div class="lov-punkt">
                {p.ledd.map((l, j) => (
                  <Leddtekst key={j} ledd={l} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
      {ledd.etter?.map((e, i) => (
        <p key={i}>
          <Tekst tekst={e} />
        </p>
      ))}
      {ledd.tabell && (
        // Tabeller (f.eks. skoleruta) kan være bredere enn skjermen og rulles for seg, så siden ikke flyter over.
        <div class="lov-tabell" tabIndex={0}>
          <table>
            {ledd.tabell.hode && (
              <thead>
                <tr>
                  {ledd.tabell.hode.map((c, i) => (
                    <th key={i} scope="col">
                      <Tekst tekst={c} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {ledd.tabell.rader.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      <Tekst tekst={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/** Teksten i en paragraf: leddene, fotnotene, endringene og lenken til Lovdata. Merket med målformen den er fastsatt på. */
export function Paragraftekst({ dokument, paragraf }: { dokument: Lovdokument; paragraf: Paragraf }) {
  const { t } = useTekst();
  return (
    <div class="lov-tekst" lang={dokument.malform}>
      {paragraf.ledd.map((l, i) => (
        <div key={i} class="lov-ledd">
          <Leddtekst ledd={l} />
        </div>
      ))}
      {paragraf.fotnoter.length > 0 && (
        <ol class="lov-fotnoter liten dempet" aria-label={t('lov.fotnoter')}>
          {paragraf.fotnoter.map((f) => (
            <li key={f.nr}>
              <sup>{f.nr}</sup> <Tekst tekst={f.tekst} />
            </li>
          ))}
        </ol>
      )}
      {paragraf.endringer.map((e, i) => (
        <p key={i} class="liten dempet">
          <Tekst tekst={e} />
        </p>
      ))}
      <p class="liten">
        <a class="ekstern-lenke" href={lovdataUrl(dokument.refid, paragraf.nr)} target="_blank" rel="noopener noreferrer">
          {t('lov.lovdataParagraf', { paragraf: paragraf.visNr })}
          <Ikon navn="ekstern" class="ikon-liten" />
        </a>
      </p>
    </div>
  );
}

/** «§ 11-1 Tilpassa opplæring». */
export const paragrafnavn = (p: Paragraf) => `${p.visNr} ${p.tittel}`.trim();

/** En paragraf som en boks som er lukket til brukeren åpner den. Adressen til paragrafen åpner den. */
export function Paragrafboks({ dokument, paragraf, apen }: { dokument: Lovdokument; paragraf: Paragraf; apen: boolean }) {
  const { malform } = useTekst();
  const [lukket, veksle] = useSammenlagt(`lov-${dokument.id}-${paragraf.nr}`, !apen);
  const id = useId();
  return (
    <div class="od-underdel lov-paragraf" data-rubrikk={`lov-${paragraf.nr}`}>
      <div class="med-stjerne">
        <h3 class="od-underdel-tittel">
          <button type="button" class="od-underdel-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
            <span lang={dokument.malform}>
              <span class="lov-nr">{paragraf.visNr}</span> {paragraf.tittel}
            </span>
            <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
          </button>
        </h3>
        <FavorittKnapp id={paragraffavoritt(dokument.id, paragraf.nr)} navn={paragraffavorittnavn(dokument, paragraf, malform)} liten />
      </div>
      <div id={id} class="od-underdel-innhold" hidden={lukket}>
        <Paragraftekst dokument={dokument} paragraf={paragraf} />
      </div>
    </div>
  );
}

/** Høyst så mange treff vises. Flere ord gir færre treff. */
const MAKS_TREFF = 60;

/**
 * Søket i ett eller flere dokumenter: feltet og, når det er søkt, paragrafene som passer med et utdrag. `barn` vises
 * når det ikke er søkt. `dokumenter` lastes først når brukeren søker (oversikten), eller er lastet fra før.
 */
export function Sok({
  etikett,
  dokumenter,
  visDokument,
  children,
}: {
  etikett: string;
  dokumenter: () => Promise<Lovdokument[]>;
  /** Vis navnet på dokumentet i treffene (når det søkes i flere dokumenter). */
  visDokument: boolean;
  children: ComponentChildren;
}) {
  const { t } = useTekst();
  const [sok, settSok] = useState('');
  const [lastet, settLastet] = useState<Lovdokument[] | null>(null);
  const aktivt = sok.trim().length >= 2;
  useEffect(() => {
    if (aktivt && !lastet) void dokumenter().then(settLastet);
  }, [aktivt, lastet, dokumenter]);
  const treff: Treff[] = aktivt && lastet ? sokIDokumenter(lastet, sok.trim()) : [];
  return (
    <>
      <div class="sokeboks lv-sok">
        <div class="sokefelt">
          <input type="search" class="tekstfelt" aria-label={etikett} placeholder={etikett} value={sok} onInput={(e) => settSok(e.currentTarget.value)} />
          <Ikon navn="sok" class="sokefelt-ikon" />
        </div>
        <p class="sokestatus" role="status" aria-live="polite">
          {aktivt && lastet
            ? treff.length === 0
              ? t('lov.ingenTreff')
              : treff.length === 1
                ? t('lov.ettTreff')
                : t('lov.antallTreff', { antall: formaterTall(treff.length) })
            : aktivt
              ? t('app.lasterInn')
              : ''}
        </p>
      </div>
      {aktivt ? (
        <>
          <ul class="liste lv-treff">
            {treff.slice(0, MAKS_TREFF).map(({ dokument, paragraf, utdrag }) => (
              <li key={`${dokument.id}:${paragraf.nr}`}>
                <a class="listelenke" href={`#${paragrafRute(dokument.id, paragraf.nr)}`}>
                  <span class="listelenke-tekst" lang={dokument.malform}>
                    <span class="listelenke-tittel">{paragrafnavn(paragraf)}</span>
                    {visDokument && <span class="listelenke-under">{dokument.korttittel}</span>}
                    {utdrag && (
                      <span class="listelenke-under">
                        {utdrag.for}
                        <mark>{utdrag.treff}</mark>
                        {utdrag.etter}
                      </span>
                    )}
                  </span>
                  <Ikon navn="hoyre" class="ikon-liten" />
                </a>
              </li>
            ))}
          </ul>
          {treff.length > MAKS_TREFF && <p class="liten dempet">{t('lov.flereTreff', { antall: formaterTall(MAKS_TREFF) })}</p>}
        </>
      ) : (
        children
      )}
    </>
  );
}

/**
 * Ruller til elementet med `data-rubrikk`, så overskriften står synlig under toppfeltet. Det rulles på nytt når
 * skriftene er lastet, men bare hvis brukeren ikke har rullet selv (som i overordnet del).
 */
export function useRullTil(nokkel: string | null) {
  useEffect(() => {
    if (!nokkel) return;
    let rullet: number | null = null;
    const rull = () => {
      if (rullet !== null && Math.abs(window.scrollY - rullet) > 2) return;
      document.querySelector(`[data-rubrikk="${CSS.escape(nokkel)}"]`)?.scrollIntoView({ block: 'start' });
      rullet = window.scrollY;
    };
    const ramme = requestAnimationFrame(rull);
    void document.fonts?.ready.then(() => requestAnimationFrame(rull));
    return () => cancelAnimationFrame(ramme);
  }, [nokkel]);
}
