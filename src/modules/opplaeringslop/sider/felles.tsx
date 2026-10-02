// Felles for sidene i Opplæringsløp: lasting av fagindeksen og tilbudene, og lenker til fag og tilbud.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
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

/** Lenke til fagarket: «HEA2005 Helsefremmende arbeid», med årstimene etter når `timer` er satt. */
export function Faglenke({ indeks, kode, timer = false }: { indeks: Fagindeks; kode: string; timer?: boolean }) {
  const { malform } = useTekst();
  const fag = indeks.fag[kode];
  return (
    <>
      <a class="tilbud-fag" href={`#/fag/${kode}`}>
        <span class="tilbud-fagkode">{kode}</span> {fag ? fag.navn[malform] : ''}
      </a>
      {timer && fag?.timer != null && <span class="tilbud-fagtimer tall"> ({formaterTall(fag.timer)})</span>}
    </>
  );
}

/** Mange fagkoder står i en liste som er lukket til brukeren åpner den. Få koder vises med en gang. */
export function Fagkoder({ indeks, koder, tittel, aapen = false }: { indeks: Fagindeks; koder: readonly string[]; tittel: string; aapen?: boolean }) {
  const [vis, settVis] = useState(aapen);
  const id = useId();
  if (koder.length === 0) return null;
  return (
    <div class="tilbud-koder">
      <button type="button" class="lenkeknapp liten tilbud-koder-knapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
        {tittel}
        <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten" />
      </button>
      <ul id={id} class="tett tilbud-fagliste" hidden={!vis}>
        {koder.map((k) => (
          <li key={k}>
            <Faglenke indeks={indeks} kode={k} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * En rubrikk som kan legges sammen, med antall eller timer i overskriften. Hvilke rubrikker som er lagt sammen,
 * huskes i historikken for siden (som de andre kortene). `farge` gir kanten fargen til en fagtype.
 */
export function Rubrikk({
  nokkel,
  tittel,
  hoyre,
  lukket: standard = false,
  farge,
  children,
}: {
  nokkel: string;
  tittel: string;
  hoyre?: string | null;
  lukket?: boolean;
  farge?: string;
  children: ComponentChildren;
}) {
  const [lukket, veksle] = useSammenlagt(nokkel, standard);
  const id = useId();
  return (
    <section class="rubrikk" data-fagtype={farge} data-rubrikk={nokkel}>
      <h2 class="rubrikk-tittel">
        <button type="button" class="kortknapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
          <span class="kortknapp-tekst">
            <span>{tittel}</span>
            {/* Mellomrommet skiller tittelen og tallet for skjermlesere. Det vises ikke i flex. */}
            {hoyre && ' '}
            {hoyre && <span class="rubrikk-hoyre tall">{hoyre}</span>}
          </span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten kortknapp-pil" />
        </button>
      </h2>
      <div id={id} class="rubrikk-innhold" hidden={lukket}>
        {children}
      </div>
    </section>
  );
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
 * Mange fag å velge blant (f.eks. valgfrie programfag eller fremmedspråk): lukket til brukeren åpner listen, med
 * søk. Fagene står i grupper etter programområde (når de hører til flere) og læreplan. Gruppene er lukket til
 * brukeren åpner dem eller søker. En læreplan med bare ett fag står som lenke direkte (eier 02.10.2026).
 */
export function Fagvalg({
  indeks,
  koder,
  tittel,
  laereplaner,
  trinn,
}: {
  indeks: Fagindeks;
  koder: readonly string[];
  tittel: string;
  laereplaner: Readonly<Record<string, string>>;
  /** Trinnet til tilbudet. Med trinnet grupperes fagene etter programområde. */
  trinn?: string;
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
    <div class="tilbud-koder fagvalg-liste">
      <button type="button" class="lenkeknapp liten tilbud-koder-knapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
        {tittel}
        <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten" />
      </button>
      <div id={id} hidden={!vis}>
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
          <ul class="tett fagvalg-grupper fagvalg-omrader">
            {omrader.map(([navn, ks]) => (
              <li key={navn}>
                <Faggruppe navn={navn} antall={ks.length} aapen={q.length > 0} niva="omrade">
                  <Laereplangrupper grupper={laereplangrupper(ks, indeks, laereplaner, malform)} indeks={indeks} aapen={q.length > 0} />
                </Faggruppe>
              </li>
            ))}
          </ul>
        ) : sortert.length === 1 || koder.length <= 8 ? (
          <ul class="tett tilbud-fagliste">
            {treff.map((k) => (
              <li key={k}>
                <Faglenke indeks={indeks} kode={k} timer />
              </li>
            ))}
          </ul>
        ) : (
          <Laereplangrupper grupper={sortert} indeks={indeks} aapen={q.length > 0} />
        )}
      </div>
    </div>
  );
}

/** Læreplanene med fagene sine. En læreplan med bare ett fag står som lenke direkte, uten egen gruppe. */
function Laereplangrupper({ grupper, indeks, aapen }: { grupper: readonly [string, string[]][]; indeks: Fagindeks; aapen: boolean }) {
  return (
    <ul class="tett fagvalg-grupper">
      {grupper.map(([navn, ks]) => (
        <li key={navn}>
          {ks.length === 1 && ks[0] ? (
            <Faglenke indeks={indeks} kode={ks[0]} timer />
          ) : (
            <Faggruppe navn={navn} antall={ks.length} aapen={aapen}>
              <ul class="tett tilbud-fagliste">
                {ks.map((k) => (
                  <li key={k}>
                    <Faglenke indeks={indeks} kode={k} timer />
                  </li>
                ))}
              </ul>
            </Faggruppe>
          )}
        </li>
      ))}
    </ul>
  );
}

function Faggruppe({ navn, antall, aapen, niva = 'laereplan', children }: { navn: string; antall: number; aapen: boolean; niva?: 'omrade' | 'laereplan'; children: ComponentChildren }) {
  const [vis, settVis] = useState(false);
  const id = useId();
  const synlig = vis || aapen;
  return (
    <div class="faggruppe-valg" data-niva={niva}>
      <button type="button" class="kortknapp faggruppe-valg-knapp" aria-expanded={synlig} aria-controls={id} onClick={() => settVis(!vis)}>
        <span class="kortknapp-tekst">{`${navn} (${formaterTall(antall)})`}</span>
        <Ikon navn={synlig ? 'opp' : 'ned'} class="ikon-liten kortknapp-pil" />
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
