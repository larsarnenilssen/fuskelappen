// Koder med forklaring under et begrep, i grupper som kan lukkes, med søk på kode og tekst (fase 6, eier 04.10.2026),
// f.eks. karakterer og vurderingsuttrykk, orden og oppførsel og karakterstatus. Søket står i adressen (?q=IV), så treff
// fra det samlede søket åpner gruppen med koden. Kodene og tekstene står i innholdet (content/begreper/).
import { useId, useState } from 'preact/hooks';
import { erstattAdresse } from '../../app/ruter.ts';
import { useTekst } from '../../app/tilstand.ts';
import { Forklaring } from '../../components/Forklaring.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import type { Kodegruppe } from '../../core/innhold/skjema.ts';
import { formaterTall, type Malform } from '../../core/i18n/tekst.ts';

type Kode = Kodegruppe['koder'][number];

/** Små bokstaver uten tegnsetting, som fagsøket. */
const normaliser = (tekst: string) => tekst.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Kodene i gruppen som passer søket. En kode som er lik søket, står først. Korte søk (opptil tre tegn) treffer bare
 * starten av ord, så «IV» ikke gir treff i «negative» eller «privatisten». Lengre søk treffer også inni sammensatte ord.
 */
export function sokKoder(koder: readonly Kode[], sok: string, malform: Malform): Kode[] {
  const s = normaliser(sok);
  if (s === '') return [...koder];
  const lik = (k: Kode) => normaliser(k.kode) === s;
  const passer = (x: string) => (s.length <= 3 ? ` ${normaliser(x)}`.includes(` ${s}`) : normaliser(x).includes(s));
  return koder.filter((k) => lik(k) || [k.kode, k.navn[malform], k.tekst[malform]].some(passer)).sort((a, b) => Number(lik(b)) - Number(lik(a)));
}

export function Kodegrupper({ grupper, sti, sporring }: { grupper: readonly Kodegruppe[]; sti: string; sporring: URLSearchParams }) {
  const { t, malform } = useTekst();
  const id = useId();
  const [sok, settSok] = useState(sporring.get('q') ?? '');
  const sett = (ny: string) => {
    settSok(ny);
    erstattAdresse(sti, ny.trim() ? { q: ny } : undefined);
  };
  const treff = grupper.map((g) => ({ gruppe: g, koder: sokKoder(g.koder, sok, malform) }));
  const antall = treff.reduce((n, g) => n + g.koder.length, 0);
  const soker = sok.trim() !== '';
  return (
    <section class="kodelisteseksjon" aria-labelledby={`${id}-tittel`}>
      <h2 id={`${id}-tittel`}>{t('begreper.kodegrupper.tittel')}</h2>
      <div class="felt">
        <label for={id}>{t('begreper.kodeliste.sok')}</label>
        <div class="sokefelt">
          <Ikon navn="sok" class="sokefelt-ikon" />
          <input id={id} type="search" autoComplete="off" enterKeyHint="search" value={sok} onInput={(e) => sett(e.currentTarget.value)} />
        </div>
      </div>
      {soker && (
        <p role="status" class="dempet liten">
          {antall === 0 ? t('begreper.kodeliste.ingenTreff') : antall === 1
            ? t('begreper.kodeliste.enKode')
            : t('begreper.kodeliste.antall', { antall: formaterTall(antall) })}
        </p>
      )}
      {treff
        .filter((g) => g.koder.length > 0)
        .map(({ gruppe, koder }) => (
          // Gruppene er lukket til de åpnes. Med søk er gruppene med treff åpne. Nøkkelen med søket gjør at gruppen
          // åpnes eller lukkes på nytt når søket endres.
          <Forklaring key={`${gruppe.id}:${soker}`} tittel={`${gruppe.tittel[malform]} (${formaterTall(koder.length)})`} aapen={soker} ikon="kategori">
            <ul class="kodeliste">
              {koder.map((k) => (
                <li key={k.kode} id={`kode-${k.kode}`}>
                  <span class="kodeliste-kode">{k.kode}</span>
                  <span class="kodeliste-tekst">
                    <strong>{k.navn[malform]}</strong> {k.tekst[malform]}
                  </span>
                </li>
              ))}
            </ul>
          </Forklaring>
        ))}
    </section>
  );
}
