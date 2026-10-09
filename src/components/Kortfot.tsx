// Paragrafene i regelverket og kildene som lukkede rader nederst i et kort, med strek mellom (eier 03.10.2026). Eier
// 04.10.2026: slik i alle kort og bokser i appen, ikke bare i veiviserne. Utenfor kort, f.eks. nederst på en side eller
// i begrepene, står kildene som før. Oppgir ikke kortet paragrafene, hentes de fra kildene, så «I regelverket» står
// med der kildene er paragrafer i Lov og forskrift (eier 06.10.2026, avgjørelse 071).
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { usePrivatskole, useTekst } from '../app/tilstand.ts';
import { PRIVATSKOLEDOKUMENTER, parallellTil, privatskolekilder } from '../core/privatskole.ts';
import type { KildeRef } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';
import { Kildeliste } from './Kildelenke.tsx';
import { useHusketApen, nokkelFra } from './husket.ts';
import { erHentet, kanVisesIRegelverket, paragraferFra } from './kilderader.ts';
import { Paragraflenker } from './Paragraflenker.tsx';

interface Props {
  paragrafer?: readonly string[] | undefined;
  kilder: readonly KildeRef[];
  /** Nøkkelen radene huskes som åpne med på siden. Uten nøkkel lages den av paragrafene og kildene. */
  nokkel?: string;
  /** Rader mellom regelverket og kildene, f.eks. «Mer om dette steget» i veiviserne. */
  children?: ComponentChildren;
  /**
   * Lenker som står med kildene, men ikke i kilderegisteret, f.eks. oversikter som får ny adresse hvert år
   * (kalenderen, avgjørelse 100).
   */
  lenker?: readonly Kildeboklenke[];
}

/** En lenke blant kildene som ikke står i kilderegisteret. */
export interface Kildeboklenke {
  tekst: string;
  url: string;
}

/** Radene uten ramme, til kort som har sin egen bunn (veiviserne og fristene). */
export function KortfotRader({ paragrafer: oppgittFelles, kilder: kilderFelles, children, nokkel, lenker = [] }: Props) {
  const { t } = useTekst();
  // For privatskoler står paragrafene i opplæringsforskrifta som har en parallell, i privatskoleforskrifta
  // (avgjørelse 075).
  const privat = usePrivatskole();
  const kilder = privat ? privatskolekilder(kilderFelles) : kilderFelles;
  const oppgitt = privat ? oppgittFelles?.map((p) => {
    const ny = parallellTil(p);
    return ny && erHentet(ny.split('/')[0] ?? '') ? ny : p;
  }) : oppgittFelles;
  const fraKilder = paragraferFra(kilder);
  // Paragrafene i privatskolelova og forskriften fra merknaden for privatskoler kommer med også når kortet oppgir
  // paragrafene selv.
  const privatParagrafer = privat ? fraKilder.filter((p) => PRIVATSKOLEDOKUMENTER.has(p.split('/')[0] ?? '') && !oppgitt?.includes(p)) : [];
  const paragrafer = (oppgitt?.length ? [...oppgitt, ...privatParagrafer] : fraKilder).filter(kanVisesIRegelverket);
  // Radene huskes som åpne på siden, så de er åpne igjen når brukeren går tilbake fra en paragraf eller en kilde.
  const grunn = nokkel ?? nokkelFra([...paragrafer, ...kilder.map((k) => `${k.id}|${k.punkt ?? ''}`)].join(','));
  const [regelverkApen, settRegelverkApen] = useHusketApen(`kortfot:${grunn}:regelverk`);
  const [kilderApen, settKilderApen] = useHusketApen(`kortfot:${grunn}:kilder`);
  // Antallet paragrafer som finnes i teksten, når de er lastet. En paragraf i et kapittel som ikke er hentet ennå, vises
  // ikke (Paragraflenker), og raden står ikke når ingen av paragrafene finnes.
  const regelverkNokkel = paragrafer.join(',');
  const [funnet, settFunnet] = useState<{ nokkel: string; antall: number } | null>(null);
  const antall = funnet?.nokkel === regelverkNokkel ? funnet.antall : paragrafer.length;
  return (
    <>
      {antall > 0 && (
        <details
          class="veiviser-kilder veiviser-regelverk"
          open={regelverkApen}
          onToggle={(e) => settRegelverkApen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary class="forklaring-knapp">
            <Ikon navn="paragraf" />
            <span>{t('komponenter.veiviser.regelverkAntall', { antall: String(antall) })}</span>
            <Ikon navn="ned" class="forklaring-pil" />
          </summary>
          <Paragraflenker
            paragrafer={paragrafer}
            overskrift={t('komponenter.veiviser.regelverk')}
            utenOverskrift
            onAntall={(n) => settFunnet({ nokkel: regelverkNokkel, antall: n })}
          />
        </details>
      )}
      {children}
      {kilder.length + lenker.length > 0 && (
        <details class="veiviser-kilder" open={kilderApen} onToggle={(e) => settKilderApen((e.currentTarget as HTMLDetailsElement).open)}>
          <summary class="forklaring-knapp">
            <Ikon navn="bok" />
            <span>{t('komponenter.veiviser.kilder', { antall: String(kilder.length + lenker.length) })}</span>
            <Ikon navn="ned" class="forklaring-pil" />
          </summary>
          {kilder.length > 0 && <Kildeliste kilder={kilder} niva={3} utenOverskrift />}
          {lenker.length > 0 && (
            <div class="kildeliste">
              <ul>
                {lenker.map((l) => (
                  <li key={l.url}>
                    <a class="kildelenke" href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.tekst}
                      <Ikon navn="ekstern" class="ikon-liten" />
                      <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted: new URL(l.url).hostname.replace(/^www\./, '') })}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </details>
      )}
    </>
  );
}

/** Radene festet nederst i kortet, fra kant til kant. */
export function Kortfot(props: Props) {
  if (!props.paragrafer?.length && props.kilder.length === 0 && !props.lenker?.length && !props.children) return null;
  return (
    <div class="kortfot">
      <KortfotRader {...props} />
    </div>
  );
}
