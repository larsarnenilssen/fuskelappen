// Små bilder av appen i velkomsten (fase 10), laget med HTML og CSS i appens farger, så de følger lys og mørk visning.
// Animasjonene går én gang og stopper innen fem sekunder (WCAG 2.2.2), og «Vis igjen» spiller dem av på nytt. Med
// redusert bevegelse på enheten står bildet stille i sluttbildet (velkomst.css). Bildene er pynt for skjermlesere
// (aria-hidden): det de viser, står også i teksten under.
import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { Ikon, type Ikonnavn } from '../../components/Ikon.tsx';

function Ramme({ spillAv, children, klasse }: { spillAv: string; children: (runde: number) => ComponentChildren; klasse?: string }) {
  const [runde, settRunde] = useState(0);
  return (
    <div class={`vk-bilde${klasse ? ` ${klasse}` : ''}`}>
      <div class="vk-scene" aria-hidden="true" key={runde}>
        {children(runde)}
      </div>
      <button type="button" class="ikonknapp vk-igjen" aria-label={spillAv} title={spillAv} onClick={() => settRunde((r) => r + 1)}>
        <Ikon navn="igjen" class="ikon-liten" />
      </button>
    </div>
  );
}

const MODULIKONER: readonly Ikonnavn[] = ['skole', 'vurdering', 'kalender', 'arbeidsplan', 'paragraf', 'person'];

/** Trinn 1: logoen, med ikonene for delene av appen rundt. */
export function BildeVelkommen({ spillAv }: { spillAv: string }) {
  return (
    <Ramme spillAv={spillAv}>
      {() => (
        <div class="vk-velkommen">
          <img class="vk-logo" src={`${import.meta.env.BASE_URL}ikoner/logo.svg`} alt="" width={72} height={72} />
          {MODULIKONER.map((ikon, i) => (
            <span key={ikon} class={`vk-modulikon vk-modulikon-${i}`}>
              <Ikon navn={ikon} />
            </span>
          ))}
        </div>
      )}
    </Ramme>
  );
}

/** Trinn 2: forsiden med søket. Et ord skrives i søkefeltet, og treffet kommer fram. */
export function BildeForsiden({ spillAv, sok, treff, treffUnder }: { spillAv: string; sok: string; treff: string; treffUnder: string }) {
  return (
    <Ramme spillAv={spillAv}>
      {() => (
        <div class="vk-telefon">
          <div class="vk-topp">
            <span class="vk-sokefelt">
              <Ikon navn="sok" class="ikon-liten" />
              <span class="vk-skriv" style={{ '--tegn': sok.length }}>
                {sok}
              </span>
            </span>
          </div>
          <div class="vk-treff">
            <span class="vk-treff-tittel">{treff}</span>
            <span class="vk-treff-under">{treffUnder}</span>
          </div>
          <div class="vk-bokser">
            {MODULIKONER.slice(0, 4).map((ikon) => (
              <span key={ikon} class="vk-boks">
                <span class="vk-sirkel">
                  <Ikon navn={ikon} class="ikon-liten" />
                </span>
                <span class="vk-strek" />
              </span>
            ))}
          </div>
        </div>
      )}
    </Ramme>
  );
}

/** Trinn 3: et kort med regelverket og kildene nederst. Raden med regelverket åpnes. */
export function BildeSidene({ spillAv, regelverk, kilder }: { spillAv: string; regelverk: string; kilder: string }) {
  return (
    <Ramme spillAv={spillAv}>
      {() => (
        <div class="vk-kort">
          <span class="vk-strek vk-strek-tittel" />
          <span class="vk-strek" />
          <span class="vk-strek vk-strek-kort" />
          <div class="vk-rader">
            <div class="vk-rad vk-rad-apnes">
              <Ikon navn="paragraf" class="ikon-liten" />
              <span>{regelverk}</span>
              <Ikon navn="ned" class="ikon-liten vk-pil" />
            </div>
            <div class="vk-apnet">
              <span class="vk-strek" />
              <span class="vk-strek vk-strek-kort" />
            </div>
            <div class="vk-rad">
              <Ikon navn="bok" class="ikon-liten" />
              <span>{kilder}</span>
              <Ikon navn="ned" class="ikon-liten" />
            </div>
          </div>
        </div>
      )}
    </Ramme>
  );
}

/** Trinn 5: stjernen ved overskriften fylles, og siden kommer med under favorittene. */
export function BildeFavoritter({ spillAv, favoritter, side }: { spillAv: string; favoritter: string; side: string }) {
  return (
    <Ramme spillAv={spillAv} klasse="vk-bilde-lav">
      {() => (
        <div class="vk-favoritter">
          <div class="vk-sideside">
            <span class="vk-sidetittel">{side}</span>
            <span class="vk-stjerne">
              <Ikon navn="stjerne" fylt />
            </span>
          </div>
          <div class="vk-favorittgruppe">
            <span class="vk-gruppenavn">
              <Ikon navn="stjerne" class="ikon-liten" />
              {favoritter}
            </span>
            <span class="vk-favoritt">
              <span class="vk-sirkel">
                <Ikon navn="vurdering" class="ikon-liten" />
              </span>
              {side}
            </span>
          </div>
        </div>
      )}
    </Ramme>
  );
}

/** Siste trinn: en hake som kommer fram. */
export function BildeTakk({ spillAv }: { spillAv: string }) {
  return (
    <Ramme spillAv={spillAv} klasse="vk-bilde-lav">
      {() => (
        <span class="vk-hake">
          <Ikon navn="hake" />
        </span>
      )}
    </Ramme>
  );
}

/** Trinn 7: hvor knappen for å installere står, for hver enhet. */
export function BildeInstaller({ spillAv, enhet, tekst }: { spillAv: string; enhet: 'ios' | 'android' | 'datamaskin'; tekst: string }) {
  return (
    <Ramme spillAv={spillAv} klasse="vk-bilde-lav" key={enhet}>
      {() =>
        enhet === 'ios' ? (
          <div class="vk-enhet vk-enhet-ios">
            <div class="vk-meny">
              <span class="vk-menyrad vk-menyrad-valgt">
                <Ikon navn="pluss" class="ikon-liten" />
                {tekst}
              </span>
            </div>
            <div class="vk-verktoylinje">
              <Ikon navn="tilbake" class="ikon-liten" />
              <span class="vk-trykk">
                <svg viewBox="0 0 24 24" class="ikon ikon-liten" aria-hidden="true">
                  <path
                    d="M12 3v12M8 7l4-4 4 4M6 11H4.5v9.5h15V11H18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <Ikon navn="bok" class="ikon-liten" />
            </div>
          </div>
        ) : enhet === 'android' ? (
          <div class="vk-enhet vk-enhet-android">
            <div class="vk-adresselinje">
              <span class="vk-adresse" />
              <span class="vk-trykk vk-prikker">⋮</span>
            </div>
            <div class="vk-meny vk-meny-hoyre">
              <span class="vk-menyrad vk-menyrad-valgt">
                <Ikon navn="last" class="ikon-liten" />
                {tekst}
              </span>
            </div>
          </div>
        ) : (
          <div class="vk-enhet vk-enhet-datamaskin">
            <div class="vk-adresselinje">
              <span class="vk-adresse" />
              <span class="vk-trykk">
                <Ikon navn="last" class="ikon-liten" />
              </span>
            </div>
            <div class="vk-meny vk-meny-hoyre">
              <span class="vk-menyrad vk-menyrad-valgt">
                <Ikon navn="last" class="ikon-liten" />
                {tekst}
              </span>
            </div>
          </div>
        )
      }
    </Ramme>
  );
}
