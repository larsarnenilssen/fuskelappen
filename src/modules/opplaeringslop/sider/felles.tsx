// Felles for sidene i Opplæringsløp: lasting av fagindeksen og tilbudene, og lenker til fag og tilbud.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
export { Rubrikk } from '../../../components/Rubrikk.tsx';
import { lastFagindeks } from '../../fag/data.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import { trinnTekst } from '../../fag/visning.ts';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { programomradegrupper } from '../grupper.ts';
import { kortKode, lastTilbud, type Tilbudene, tilbudRute } from '../data.ts';

export type Lastet = { indeks: Fagindeks; tilbud: Tilbudene } | 'laster' | 'feil';

/** Fagindeksen og tilbudene. Begge lastes første gang de trengs. */
export function useTilbudsdata(): [Lastet, () => void] {
  const [data, settData] = useState<Lastet>('laster');
  const [forsok, settForsok] = useState(0);
  useEffect(() => {
    settData('laster');
    Promise.all([lastFagindeks(), lastTilbud()]).then(
      ([indeks, tilbud]) => settData({ indeks, tilbud }),
      () => settData('feil'),
    );
  }, [forsok]);
  return [data, () => settForsok((n) => n + 1)];
}

/** Laster inn, eller feilmelding med «Prøv igjen». */
export function Lasting({ data, provIgjen }: { data: 'laster' | 'feil'; provIgjen: () => void }) {
  const { t } = useTekst();
  if (data === 'laster') return <p class="dempet">{t('app.lasterInn')}</p>;
  return (
    <p role="alert">
      {t('opplaeringslop.lasterFeil')}{' '}
      <button type="button" class="lenkeknapp" onClick={provIgjen}>
        {t('app.provIgjen')}
      </button>
    </p>
  );
}

/** «Vg2 Helsearbeiderfag»: trinnet og navnet på programområdet. */
/**
 * Tilbud i skole før opplæring i bedrift, ellers i samme rekkefølge. Etter vg1 i yrkesfag kan det være mange tilbud
 * videre, og vg2 i skole skal stå øverst (eier 02.10.2026).
 */
export function skoleForst(koder: readonly string[], indeks: Fagindeks): string[] {
  const iBedrift = (k: string) => (indeks.programomrader[k]?.sted === 'bedrift' ? 1 : 0);
  return [...koder].sort((a, b) => iBedrift(a) - iBedrift(b));
}

export function tilbudsnavn(t: T, indeks: Fagindeks, kode: string, malform: 'nb' | 'nn'): string {
  const po = indeks.programomrader[kode];
  if (!po) return kortKode(kode);
  const trinn = trinnTekst(t, po.trinn);
  // Noen navn har trinnet fra før, f.eks. «Vg3 påbygging til generell studiekompetanse».
  return po.navn[malform].toLowerCase().startsWith(trinn.toLowerCase()) ? po.navn[malform] : `${trinn} ${po.navn[malform]}`;
}

/** Lenke til et tilbud. `via` er tilbudet brukeren kom fra; det avgjør programmet påbygging står under. */
export function Tilbudslenke({ indeks, kode, via, under }: { indeks: Fagindeks; kode: string; via?: string | null; under?: ComponentChildren }) {
  const { t, malform } = useTekst();
  const po = indeks.programomrader[kode];
  if (!po) return <span>{kortKode(kode)}</span>;
  return (
    <a class="listelenke tilbudslenke" href={`#${tilbudRute(po.program, kode, via)}`} data-sted={po.sted}>
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{tilbudsnavn(t, indeks, kode, malform)}</span>
        <span class="listelenke-under">
          {kortKode(kode)}
          {po.sted === 'bedrift' && ` · ${t('opplaeringslop.sted.bedrift')}`}
          {under}
        </span>
      </span>
      <Ikon navn="hoyre" class="ikon-liten" />
    </a>
  );
}

/**
 * Ett fag i en liste: navnet er lenken til fagarket, koden står dempet etter, og årstimene til høyre. `navn` brukes
 * når navnet er forkortet, f.eks. uten læreplanen gruppen allerede viser.
 */
export function Faglenke({ indeks, kode, timer = false, navn }: { indeks: Fagindeks; kode: string; timer?: boolean; navn?: string }) {
  const { malform } = useTekst();
  const fag = indeks.fag[kode];
  return (
    <>
      <span class="fagliste-navn">
        <a href={`#/fag/${kode}`}>{navn ?? fag?.navn[malform] ?? kode}</a> <span class="fagliste-kode">{kode}</span>
      </span>
      {timer && fag?.timer != null && <span class="fagliste-timer tall">{formaterTall(fag.timer)}</span>}
    </>
  );
}

/** «Norsk for elever med samisk som førstespråk, vg2 …» i gruppen med samme navn → «vg2 …». */
function utenGruppenavn(navn: string, gruppe: string): string {
  if (!navn.toLowerCase().startsWith(gruppe.toLowerCase())) return navn;
  const rest = navn.slice(gruppe.length).replace(/^[\s,–-]+/, '');
  return rest || navn;
}

/** Fagene gruppert etter læreplan, sortert etter navnet på læreplanen. */
function laereplangrupper(koder: readonly string[], indeks: Fagindeks, laereplaner: Readonly<Record<string, string>>, malform: 'nb' | 'nn'): [string, string[]][] {
  const grupper = new Map<string, string[]>();
  for (const k of koder) {
    const lp = indeks.fag[k]?.lp ?? '';
    const navn = laereplaner[lp] ?? indeks.fag[k]?.navn[malform] ?? k;
    grupper.set(navn, [...(grupper.get(navn) ?? []), k]);
  }
  return [...grupper].sort(([a], [b]) => a.localeCompare(b, 'nb'));
}

/**
 * En rad i fagrubrikken som åpner en liste med fag: navnet, en dempet forklaring («velg én av 101») og timene eller
 * antallet til høyre, som de andre radene. Lange lister har søk, og fagene står i grupper etter programområde (når
 * `trinn` er satt og fagene hører til flere) og læreplan. Gruppene er lukket til brukeren åpner dem eller søker. En
 * læreplan med bare ett fag står som lenke direkte (eier 02.10.2026).
 */
export function Fagvalgrad({
  indeks,
  koder,
  tittel,
  under,
  hoyre,
  dempet = false,
  laereplaner,
  trinn,
  children,
}: {
  indeks: Fagindeks;
  koder: readonly string[];
  tittel: ComponentChildren;
  /** Dempet tekst etter navnet, f.eks. «velg én av 101». */
  under?: ComponentChildren;
  /** Timene eller antallet til høyre. */
  hoyre?: string | null;
  /** Vurderingskoder og alternativer står dempet nederst i rubrikken. */
  dempet?: boolean;
  laereplaner: Readonly<Record<string, string>>;
  /** Trinnet til tilbudet. Med trinnet grupperes fagene etter programområde. */
  trinn?: string;
  /** Mer innhold under listen, f.eks. rekkefølgen for fag over flere trinn. */
  children?: ComponentChildren;
}) {
  const { t, malform } = useTekst();
  const [vis, settVis] = useState(false);
  const [sok, settSok] = useState('');
  const id = useId();
  if (koder.length === 0) return null;
  const q = sok.trim().toLowerCase();
  const treff = q ? koder.filter((k) => k.toLowerCase().includes(q) || (indeks.fag[k]?.navn[malform] ?? '').toLowerCase().includes(q)) : koder;
  const omrader = trinn && koder.length > 8 ? programomradegrupper(treff, indeks, trinn, malform, t('opplaeringslop.tilbud.andreFag')) : null;
  const sortert = laereplangrupper(treff, indeks, laereplaner, malform);
  return (
    <li class="fagrad" data-dempet={dempet || undefined}>
      <button type="button" class="fagrad-knapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
        <span class="fagrad-navn">
          {tittel}
          {under && <span class="fagrad-under"> · {under}</span>}
          <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten fagrad-pil" />
        </span>
        {hoyre && <span class="fagrad-timer tall">{hoyre}</span>}
      </button>
      <div id={id} class="fagrad-innhold" hidden={!vis}>
        {koder.length > 8 && (
          <input
            type="search"
            class="tekstfelt fagvalg-sok"
            aria-label={t('opplaeringslop.tilbud.sokFag')}
            placeholder={t('opplaeringslop.tilbud.sokFag')}
            value={sok}
            onInput={(e) => settSok(e.currentTarget.value)}
          />
        )}
        {treff.length === 0 && <p class="liten dempet">{t('opplaeringslop.tilbud.ingenFag')}</p>}
        {omrader ? (
          <ul class="fagvalg-grupper">
            {omrader.map(([navn, ks]) => (
              <li key={navn}>
                <Faggruppe navn={navn} antall={ks.length} aapen={q.length > 0} niva="omrade">
                  <Laereplangrupper grupper={laereplangrupper(ks, indeks, laereplaner, malform)} indeks={indeks} aapen={q.length > 0} />
                </Faggruppe>
              </li>
            ))}
          </ul>
        ) : sortert.length === 1 || koder.length <= 8 ? (
          <ul class="tilbud-fagliste">
            {treff.map((k) => (
              <li key={k}>
                <Faglenke indeks={indeks} kode={k} timer />
              </li>
            ))}
          </ul>
        ) : (
          <Laereplangrupper grupper={sortert} indeks={indeks} aapen={q.length > 0} />
        )}
        {children}
      </div>
    </li>
  );
}

/** Læreplanene med fagene sine. En læreplan med bare ett fag står som lenke direkte, uten egen gruppe. */
function Laereplangrupper({ grupper, indeks, aapen }: { grupper: readonly [string, string[]][]; indeks: Fagindeks; aapen: boolean }) {
  const { malform } = useTekst();
  return (
    <ul class="fagvalg-grupper">
      {grupper.map(([navn, ks]) =>
        ks.length === 1 && ks[0] ? (
          <li key={navn} class="fagliste-rad">
            <Faglenke indeks={indeks} kode={ks[0]} timer />
          </li>
        ) : (
          <li key={navn}>
            <Faggruppe navn={navn} antall={ks.length} aapen={aapen}>
              <ul class="tilbud-fagliste">
                {ks.map((k) => (
                  <li key={k}>
                    <Faglenke indeks={indeks} kode={k} timer navn={utenGruppenavn(indeks.fag[k]?.navn[malform] ?? k, navn)} />
                  </li>
                ))}
              </ul>
            </Faggruppe>
          </li>
        ),
      )}
    </ul>
  );
}

function Faggruppe({ navn, antall, aapen, niva = 'laereplan', children }: { navn: string; antall: number; aapen: boolean; niva?: 'omrade' | 'laereplan'; children: ComponentChildren }) {
  const { t } = useTekst();
  const [vis, settVis] = useState(false);
  const id = useId();
  const synlig = vis || aapen;
  return (
    <div class="faggruppe-valg" data-niva={niva}>
      <button type="button" class="faggruppe-valg-knapp" aria-expanded={synlig} aria-controls={id} onClick={() => settVis(!vis)}>
        <span>
          {navn}
          <Ikon navn={synlig ? 'opp' : 'ned'} class="ikon-liten fagrad-pil" />
        </span>
        <span class="fagliste-timer tall">{t('opplaeringslop.tilbud.antallFag', { antall: formaterTall(antall) })}</span>
      </button>
      <div id={id} class="faggruppe-innhold" hidden={!synlig}>
        {children}
      </div>
    </div>
  );
}

/** Stien tilbake: «Opplæringsløp › Helse- og oppvekstfag». Siste ledd er siden over den brukeren står på. */
export function Brodsmuler({ ledd }: { ledd: readonly { tekst: string; href: string }[] }) {
  const { t } = useTekst();
  return (
    <nav class="brodsmuler" aria-label={t('opplaeringslop.brodsmuler')}>
      <ol>
        {ledd.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.tekst}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
