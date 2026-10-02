// Felles for sidene i Opplæringsløp: lasting av fagindeksen og tilbudene, og lenker til fag og tilbud.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { lastFagindeks } from '../../fag/data.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import { trinnTekst } from '../../fag/visning.ts';
import { formaterTall } from '../../../core/i18n/tekst.ts';
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
