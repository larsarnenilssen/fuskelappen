// Velkomsten (fase 10): fire trinn i et vindu over appen (avgjørelse 101): hva appen er, fylke og skole, rolle med
// favoritter og dagens jukselapp, og hjelp til å installere appen. Hvert trinn skal få plass uten rulling på en iPhone.
// Bygger på `Overlegg` (avgjørelse 088): resten av appen kan ikke nås mens vinduet er åpent, Esc og krysset lukker det,
// også ved første trinn. Lastes først når vinduet åpnes.
import type { JSX } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { Overlegg } from '../../components/Overlegg.tsx';
import { fyllInn } from '../../core/i18n/tekst.ts';
import type { Favorittbar } from '../../modules/typer.ts';
import { ikonForFavoritt, samleFavorittbare } from '../../modules/register.ts';
import { velkomstNb } from '../../strings/velkomst.nb.ts';
import { velkomstNn } from '../../strings/velkomst.nn.ts';
import { Jukselappbryter } from '../Jukselapp.tsx';
import { StedValg } from '../StedValg.tsx';
import { tilstand, useTekst, useTilstand } from '../tilstand.ts';
import { FORHANDSVISNING } from './apne.ts';
import { ANBEFALTE, lesRolle, ROLLER, type Rolle } from './roller.ts';
import { installasjonstilbud } from './VelkomstLaster.tsx';
import { BildeForsiden, BildeInstaller } from './Bilder.tsx';
import '../../styles/velkomst.css';

type Enhet = 'ios' | 'android' | 'datamaskin';

function erInstallert(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

function gjettEnhet(): Enhet {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'datamaskin';
}

function Avsnitt({ tekster }: { tekster: readonly string[] }) {
  return (
    <>
      {tekster.map((t) => (
        <p key={t}>{t}</p>
      ))}
    </>
  );
}

/**
 * En tekst der `{navn}` blir lenker til sider i appen. En lenke lukker velkomsten og åpner siden (som lenken til en
 * lokal regel).
 */
function MedLenker({ tekst, lenker }: { tekst: string; lenker: Record<string, { href: string; tekst: string }> }) {
  return (
    <>
      {tekst.split(/(\{\w+\})/).map((del, i) => {
        const lenke = /^\{\w+\}$/.test(del) ? lenker[del.slice(1, -1)] : undefined;
        return lenke ? (
          <a key={i} href={lenke.href}>
            {lenke.tekst}
          </a>
        ) : (
          del
        );
      })}
    </>
  );
}

/** Trinnet om rollen: rollen som gule piller, og favorittene rollen får foreslått, med stjernen ved hver. */
function Rollevalg({ v }: { v: typeof velkomstNb }) {
  const { malform } = useTekst();
  const data = useTilstand();
  const rolle = lesRolle(data.innstillinger.rolle);
  const [favorittbare, settFavorittbare] = useState<Map<string, Favorittbar> | null>(null);
  useEffect(() => {
    void samleFavorittbare(undefined, [...new Set(Object.values(ANBEFALTE).flat())]).then(settFavorittbare);
  }, []);
  const anbefalte = rolle ? ANBEFALTE[rolle].filter((id) => favorittbare?.has(id)) : [];
  const alle = anbefalte.length > 0 && anbefalte.every((id) => data.favoritter.includes(id));
  const veksl = (id: string) =>
    tilstand.oppdater((d) => ({
      ...d,
      favoritter: d.favoritter.includes(id) ? d.favoritter.filter((f) => f !== id) : [...d.favoritter, id],
    }));

  return (
    <>
      <Bryter<Rolle | ''>
        legend={v.rolle.legend}
        skjultLegend
        verdi={rolle ?? ''}
        valg={ROLLER.map((r) => ({ verdi: r, tekst: v.rolle.roller[r] }))}
        onEndring={(r) => tilstand.oppdaterInnstillinger({ rolle: r })}
      />
      {rolle && favorittbare && (
        <div class="vk-anbefalte">
          <div class="vk-anbefalte-topp">
            <h3>{v.rolle.anbefalte}</h3>
            <button
              type="button"
              class="lenkeknapp liten"
              disabled={alle}
              onClick={() =>
                tilstand.oppdater((d) => ({
                  ...d,
                  favoritter: [...new Set([...d.favoritter, ...anbefalte])],
                }))
              }
            >
              <Ikon navn={alle ? 'hake' : 'pluss'} class="ikon-liten" />
              {alle ? v.rolle.alleLagtTil : v.rolle.leggTilAlle}
            </button>
          </div>
          <ul class="vk-favorittliste">
            {anbefalte.map((id) => {
              const f = favorittbare.get(id);
              if (!f) return null;
              const valgt = data.favoritter.includes(id);
              const ikon = ikonForFavoritt(id, f);
              return (
                <li key={id}>
                  {ikon && (
                    <span class="vk-sirkel">
                      <Ikon navn={ikon} class="ikon-liten" />
                    </span>
                  )}
                  <span class="vk-favoritt-navn">{f.tittel[malform]}</span>
                  <button
                    type="button"
                    class={`ikonknapp favorittknapp${valgt ? ' valgt' : ''}`}
                    aria-pressed={valgt}
                    aria-label={f.tittel[malform]}
                    onClick={() => veksl(id)}
                  >
                    <Ikon navn="stjerne" fylt={valgt} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

function Installering({ v }: { v: typeof velkomstNb }) {
  const [enhet, settEnhet] = useState<Enhet>(gjettEnhet);
  const [tilbud, settTilbud] = useState(installasjonstilbud);
  const steg = enhet === 'ios' ? v.installer.iosSteg : enhet === 'android' ? v.installer.androidSteg : v.installer.datamaskinSteg;
  return (
    <>
      <Bryter<Enhet>
        legend={v.installer.legend}
        skjultLegend
        verdi={enhet}
        valg={[
          { verdi: 'ios', tekst: v.installer.ios },
          { verdi: 'android', tekst: v.installer.android },
          { verdi: 'datamaskin', tekst: v.installer.datamaskin },
        ]}
        onEndring={settEnhet}
      />
      <BildeInstaller
        spillAv={v.spillAv}
        enhet={enhet}
        tekst={
          enhet === 'ios'
            ? v.installer.bildeLeggTil
            : enhet === 'android'
              ? v.installer.bildeInstaller
              : fyllInn(v.installer.bildeInstallerDatamaskin, { app: app.navn })
        }
      />
      {tilbud && enhet !== 'ios' ? (
        <button
          type="button"
          class="knapp"
          onClick={() => {
            void tilbud.prompt();
            void tilbud.userChoice.finally(() => settTilbud(null));
          }}
        >
          <Ikon navn="last" />
          {v.installer.knapp}
        </button>
      ) : (
        <ol class="vk-steg">
          {steg.map((s) => (
            <li key={s}>{fyllInn(s, { app: app.navn })}</li>
          ))}
        </ol>
      )}
    </>
  );
}

type Trinn = { id: string; tittel: string; innhold: JSX.Element };

export function Velkomst({ onLukk }: { onLukk: () => void }) {
  const { malform } = useTekst();
  const v = malform === 'nn' ? (velkomstNn as typeof velkomstNb) : velkomstNb;
  const a = { app: app.navn };
  // Trinnet om installasjon hoppes over når appen alt er installert. Forhåndsvisningen viser det likevel.
  const visInstallering = useMemo(() => !erInstallert() || location.hash.includes(FORHANDSVISNING), []);

  const trinn: Trinn[] = [
    {
      id: 'velkommen',
      tittel: fyllInn(v.velkommen.tittel, a),
      innhold: (
        <>
          <BildeForsiden spillAv={v.spillAv} faner={[v.velkommen.bildeKalender, v.velkommen.bildeNyheter, v.velkommen.bildeTall]} />
          <Avsnitt tekster={[fyllInn(v.velkommen.tekst, a), v.velkommen.navnet]} />
          {/* Tilbakemeldingen står under Om appen og Innstillinger (eier 09.10.2026), i samme avsnitt som søket. */}
          <p>
            {v.velkommen.sok}{' '}
            <MedLenker
              tekst={v.velkommen.tilbakemelding}
              lenker={{ om: { href: '#/om', tekst: v.velkommen.om }, innstillinger: { href: '#/innstillinger', tekst: v.velkommen.innstillinger } }}
            />
          </p>
        </>
      ),
    },
    {
      id: 'sted',
      tittel: v.sted.tittel,
      innhold: (
        <>
          <p>{v.sted.tekst}</p>
          <StedValg id="vk" kort />
          {/* Lokale regler som én lenkerad, som «Legg inn en lokal regel» på sidene (fase 9). */}
          <ul class="liste">
            <li>
              <a class="listelenke" href="#/innstillinger/lokal-regel">
                <Ikon navn="pluss" />
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{v.sted.lokaleLenke}</span>
                  <span class="listelenke-under">{v.sted.lokaleUnder}</span>
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rolle',
      tittel: v.rolle.tittel,
      innhold: (
        <>
          <p>{v.rolle.tekst}</p>
          <Rollevalg v={v} />
          <div class="vk-bryter">
            <Jukselappbryter id="vk-jukselapp" hjelp={v.rolle.jukselapp} />
          </div>
        </>
      ),
    },
    ...(visInstallering
      ? [
          {
            id: 'installer',
            tittel: v.installer.tittel,
            innhold: (
              <>
                <p>{fyllInn(v.installer.tekst, a)}</p>
                <Installering v={v} />
              </>
            ),
          },
        ]
      : []),
  ];

  // Forhåndsvisningen kan starte på et bestemt trinn, f.eks. `?vis=velkomst&trinn=rolle` (til skjermbildene). En id som
  // ikke finnes (også trinnene som er tatt bort, f.eks. `sok` og `takk`), gir første trinn.
  const [nr, settNr] = useState(() => {
    const start = new URLSearchParams(location.hash.split('?')[1] ?? '').get('trinn');
    return Math.max(
      0,
      trinn.findIndex((t) => t.id === start),
    );
  });
  const tittel = useRef<HTMLHeadingElement>(null);
  const innhold = useRef<HTMLDivElement>(null);
  const forste = useRef(true);
  useEffect(() => {
    // Ved første visning har `Overlegg` gitt fokus til vinduet. Ved et nytt trinn går fokus til tittelen, så
    // skjermlesere leser den, og innholdet begynner øverst.
    innhold.current?.scrollTo({ top: 0 });
    if (forste.current) {
      forste.current = false;
      return;
    }
    tittel.current?.focus({ preventScroll: true });
  }, [nr]);

  // Trinnene er aldri tomme: første trinn er alltid med.
  const gjeldende = (trinn[nr] ?? trinn[0]) as Trinn;
  const sist = nr === trinn.length - 1;

  return (
    <Overlegg tittelId="velkomst-tittel" onLukk={onLukk} klasse="overlegg-velkomst">
      <div
        class="vk"
        onClick={(e) => {
          // En lenke til en side i appen lukker velkomsten, så siden ikke står bak et vindu.
          const lenke = (e.target as HTMLElement).closest('a');
          if (lenke?.getAttribute('href')?.startsWith('#')) onLukk();
        }}
      >
        <div class="vk-hode">
          <p class="overlegg-merke">{v.merke}</p>
          <span class="vk-teller dempet liten">{fyllInn(v.teller, { nr: nr + 1, antall: trinn.length })}</span>
          <button type="button" class="ikonknapp vk-lukk" aria-label={v.lukk} title={v.lukk} onClick={onLukk}>
            <Ikon navn="lukk" />
          </button>
        </div>
        <ol class="vk-stolpe" aria-hidden="true">
          {trinn.map((t, i) => (
            <li key={t.id} class={i < nr ? 'vk-ferdig' : i === nr ? 'vk-her' : undefined} />
          ))}
        </ol>
        {/* Innholdet ruller for seg, og kan få fokus, så det kan rulles med tastaturet også når ingenting i det kan få
            fokus (WCAG 2.1.1). */}
        <div class="vk-innhold" ref={innhold} key={gjeldende.id} tabIndex={0} role="region" aria-labelledby="velkomst-tittel">
          <h2 id="velkomst-tittel" tabIndex={-1} ref={tittel}>
            {gjeldende.tittel}
          </h2>
          {gjeldende.innhold}
        </div>
        <div class="vk-knapper">
          {nr === 0 ? (
            <button type="button" class="knapp knapp-sekundaer" onClick={onLukk}>
              {v.hoppOver}
            </button>
          ) : (
            <button type="button" class="knapp knapp-sekundaer" onClick={() => settNr(nr - 1)}>
              <Ikon navn="tilbake" />
              {v.tilbake}
            </button>
          )}
          {sist ? (
            <button type="button" class="knapp" onClick={onLukk}>
              <Ikon navn="hake" />
              {v.ferdig}
            </button>
          ) : (
            <button type="button" class="knapp vk-neste" onClick={() => settNr(nr + 1)}>
              {v.neste}
              <Ikon navn="hoyre" />
            </button>
          )}
        </div>
      </div>
    </Overlegg>
  );
}
