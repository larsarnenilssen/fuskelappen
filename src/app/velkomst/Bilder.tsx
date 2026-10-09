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

const MODULIKONER: readonly Ikonnavn[] = ['skole', 'vurdering'];

/**
 * Første trinn: forsiden med søkefeltet øverst. Panelet bytter fra kalenderen til nyhetene og tallene og tilbake, med
 * boksene under (eier 09.10.2026, avgjørelse 101).
 */
export function BildeForsiden({ spillAv, faner }: { spillAv: string; faner: readonly [string, string, string] }) {
  return (
    <Ramme spillAv={spillAv}>
      {() => (
        <div class="vk-telefon">
          <div class="vk-topp">
            <span class="vk-sokefelt">
              <Ikon navn="sok" class="ikon-liten" />
            </span>
          </div>
          <div class="vk-panel">
            <div class="vk-faner">
              {faner.map((f, i) => (
                <span key={f} class={`vk-fane vk-vis-${i}`}>
                  {f}
                </span>
              ))}
            </div>
            <div class="vk-panelinnhold">
              <div class="vk-lag vk-vis-0">
                {[0, 1].map((i) => (
                  <span key={i} class="vk-panelrad">
                    <span class="vk-dato" />
                    <span class="vk-strek" />
                  </span>
                ))}
              </div>
              <div class="vk-lag vk-vis-1">
                {[0, 1].map((i) => (
                  <span key={i} class="vk-panelrad">
                    <span class="vk-prikk" />
                    <span class="vk-strek" />
                  </span>
                ))}
              </div>
              <div class="vk-lag vk-vis-2 vk-soyler">
                {[45, 70, 55, 90, 75, 60].map((h) => (
                  <span key={h} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div class="vk-bokser">
            {MODULIKONER.map((ikon) => (
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

/** Siste trinn: hvor knappen for å installere står, for hver enhet. */
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
