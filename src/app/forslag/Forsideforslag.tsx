// Forslaget til ny presentasjon av kalenderen, nyhetene, tallene og dagens jukselapp på forsiden (09.10.2026), i tre
// varianter som eier kan prøve i testversjonen (`?forslag=1|2|3`, se forslag.ts). Lastes bare når et forslag er valgt.
//
// Felles for variantene: elementene heter samlet «Aktuelt» og står på en myk flate i temafargen, så de skiller seg fra
// modulene og favorittene. Brukeren kan legge dem sammen til én linje eller skjule dem helt, og valget huskes. Hva som
// står der, også dagens jukselapp, velges i menyen i Aktuelt selv. «Tilpass» har bare valget om å vise Aktuelt igjen.
//
// 1. Sidekolonne med lukk: sidekolonnen på skrivebord uten bryteren. På mobil et farget kort, sammenlagt fra start.
// 2. Bånd: ingen sidekolonne. Et bånd under søket, sammenlagt fra start. Åpnet står visningene side om side på stor
//    skjerm, og med faner på mobil.
// 3. Kompakt rad: en rad med små knapper under søket. Hver knapp åpner visningen i et overlegg.
//
// Lagringen er den samme som før, uten nye felt: `lukket`/`apnet` med `panel` for sammenlagt eller åpnet, og `skjult`
// med `aktuelt` når Aktuelt er skjult helt, ved siden av visningene (`neste`, `nyheter`, `itall`) som før.
import { useId, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { Ikon, type Ikonnavn } from '../../components/Ikon.tsx';
import { Overlegg } from '../../components/Overlegg.tsx';
import { fyllInn } from '../../core/i18n/tekst.ts';
import { iDag } from '../../data/skolear.ts';
import { forsideforslagNb } from '../../strings/forsideforslag.nb.ts';
import { forsideforslagNn } from '../../strings/forsideforslag.nn.ts';
import { Innhold, JUKSELAPPVISNING, PANEL, VISNINGER, type Ramme, type Visning } from '../Forsidepanel.tsx';
import { SIDEKOLONNE_FRA, useMinstBredde } from '../Forsidegruppe.tsx';
import { forlatJukselapp, settForsidevisning, settJukselapp, tilstand, useTekst, useTilstand, vekslGruppe, vekslSkjultGruppe } from '../tilstand.ts';
import type { Forslag } from './forslag.ts';
import '../../styles/forsideforslag.css';

/** Id-en i `forside.skjult` når Aktuelt er skjult helt. */
export const AKTUELT_SKJULT = 'aktuelt';

/** Bryteren for sidekolonnen før forslaget (avgjørelse 068). Slått av gir den Aktuelt sammenlagt i forslag 1. */
const SIDEKOLONNE = 'sidekolonne';

function useForslagstekst() {
  const { malform } = useTekst();
  return malform === 'nn' ? (forsideforslagNn as typeof forsideforslagNb) : forsideforslagNb;
}

const ikonFor = (v: Visning): Ikonnavn => (v === 'jukselapp' ? JUKSELAPPVISNING.ikon : (VISNINGER.find((x) => x.id === v)?.ikon ?? 'kalender'));

/**
 * Visningene brukeren har med, og den som står nå. Første besøk på dagen står dagens jukselapp, når den er med
 * (avgjørelse 086). Velger brukeren en annen visning, gjelder det resten av dagen.
 */
function useAktuelt() {
  const { forside } = useTilstand();
  const skjult = forside.skjult ?? [];
  const paa: Visning[] = [...VISNINGER.filter((v) => !skjult.includes(v.id)).map((v) => v.id), ...(forside.jukselapp ? (['jukselapp'] as const) : [])];
  const idag = iDag();
  const egen = paa.find((v) => v === forside.visning) ?? paa[0] ?? 'neste';
  const dagens = paa.includes('jukselapp') && egen !== 'jukselapp' && forside.jukselappForlatt !== idag;
  const aktiv: Visning = dagens ? 'jukselapp' : egen;
  const velg = (v: Visning) => {
    if (dagens && v !== 'jukselapp') forlatJukselapp(idag);
    settForsidevisning(v);
  };
  return { paa, aktiv, velg, skjultHelt: skjult.includes(AKTUELT_SKJULT) || paa.length === 0 };
}

/** Navnet på en visning i fanene og knappene. */
function useVisningsnavn() {
  const { t } = useTekst();
  return (v: Visning) => (v === 'jukselapp' ? t('forside.panel.dagens') : t(`forside.panel.${v}`));
}

/** Knappen som åpner menyen i Aktuelt. */
function Menyknapp({ apen, menyId, onVeksle }: { apen: boolean; menyId: string; onVeksle: () => void }) {
  const s = useForslagstekst();
  return (
    <button type="button" class="ikonknapp ff-menyknapp" aria-expanded={apen} aria-controls={menyId} aria-label={s.meny} title={s.meny} onClick={onVeksle}>
      <Ikon navn={apen ? 'lukk' : 'filter'} class="ikon-liten" />
    </button>
  );
}

/** Menyen i Aktuelt: hva som står der, og «Skjul Aktuelt». Dagens jukselapp slås av og på her (forslag). */
function Meny({ id }: { id: string }) {
  const s = useForslagstekst();
  const { t } = useTekst();
  const { forside } = useTilstand();
  const skjult = forside.skjult ?? [];
  return (
    <div id={id} class="ff-meny">
      <fieldset>
        <legend>{s.menyTittel}</legend>
        {VISNINGER.map((v) => (
          <label key={v.id} class="avkrysning">
            <input type="checkbox" checked={!skjult.includes(v.id)} onChange={() => vekslSkjultGruppe(v.id)} />
            {t(`forside.tilpass.visning.${v.id}`)}
          </label>
        ))}
        <label class="avkrysning">
          <input type="checkbox" checked={!!forside.jukselapp} onChange={() => settJukselapp(!forside.jukselapp)} />
          {t('forside.tilpass.visning.jukselapp')}
        </label>
      </fieldset>
      <button type="button" class="lenkeknapp ff-skjul" onClick={() => vekslSkjultGruppe(AKTUELT_SKJULT)}>
        <Ikon navn="lukk" class="ikon-liten" />
        {s.skjul}
      </button>
      <p class="dempet liten">{s.skjulHjelp}</p>
    </div>
  );
}

/** Fanene mellom visningene: rolige tekstknapper med strek under den valgte, som i panelet i dag (avgjørelse 081). */
function Faner({ paa, aktiv, onVelg }: { paa: readonly Visning[]; aktiv: Visning; onVelg: (v: Visning) => void }) {
  const { t } = useTekst();
  const navn = useVisningsnavn();
  return (
    <div class="ff-faner" role="group" aria-label={t('forside.panel.legend')}>
      {paa.map((v) => (
        <button key={v} type="button" class="panel-fane" aria-pressed={v === aktiv} onClick={() => onVelg(v)}>
          {v === 'jukselapp' ? t('forside.panel.jukselapp') : navn(v)}
        </button>
      ))}
    </div>
  );
}

/**
 * Aktuelt som ett kort med faner: sidekolonnen og mobilen i forslag 1, og mobilen i forslag 2. Sammenlagt er det én
 * linje med ikonet og oppsummeringen av visningen som står, og menyen.
 */
function Panelkort({ lukket, onVeksle, klasse }: { lukket: boolean; onVeksle: () => void; klasse: string }) {
  const s = useForslagstekst();
  const navn = useVisningsnavn();
  const { paa, aktiv, velg, skjultHelt } = useAktuelt();
  const [meny, settMeny] = useState(false);
  const id = useId();
  if (skjultHelt) return null;
  const ramme: Ramme = ({ tittel, sammendrag, children }) => (
    <section class={`ff-panel ${klasse}${lukket ? ' ff-lukket' : ''}`} data-aktuelt={klasse} aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} class="ff-hode">
        <button type="button" class="ff-veksle" aria-expanded={!lukket} aria-controls={`${id}-i`} onClick={onVeksle}>
          {lukket && (
            <span class="ff-ikon" aria-hidden="true">
              <Ikon navn={ikonFor(aktiv)} class="ikon-liten" />
            </span>
          )}
          <span class="ff-hode-tekst">
            <span class="ff-merke">{s.merke}</span>
            {lukket && (
              <span class="ff-sammendrag">
                <strong>{navn(aktiv)}</strong> · {sammendrag}
              </span>
            )}
          </span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten ff-pil" />
        </button>
        <Menyknapp apen={meny} menyId={`${id}-m`} onVeksle={() => settMeny(!meny)} />
      </h2>
      {meny && <Meny id={`${id}-m`} />}
      <div id={`${id}-i`} class="ff-innhold" hidden={lukket}>
        {!lukket && (
          <>
            {paa.length > 1 && <Faner paa={paa} aktiv={aktiv} onVelg={velg} />}
            <h3 class="skjult-visuelt">{tittel}</h3>
            {children}
          </>
        )}
      </div>
    </section>
  );
  return <Innhold key={aktiv} id={aktiv} ramme={ramme} />;
}

/**
 * Forslag 1: sidekolonnen med lukk. På skrivebord står Aktuelt øverst i sidekolonnen, uten bryteren for kolonnen, åpent
 * fra start. På mobil, og med «Bare favoritter», er det et farget kort, sammenlagt fra start. Den som hadde slått av
 * sidekolonnen, får Aktuelt sammenlagt.
 */
export function Kolonnepanel() {
  const { forside } = useTilstand();
  const stor = useMinstBredde(SIDEKOLONNE_FRA);
  const apnet = (forside.apnet ?? []).includes(PANEL);
  const lukket = forside.lukket.includes(PANEL) || (!apnet && (!stor || (forside.skjult ?? []).includes(SIDEKOLONNE)));
  return <Panelkort lukket={lukket} onVeksle={() => vekslGruppe(PANEL, lukket)} klasse="ff-kolonne" />;
}

/** Sammenlagt i forslag 2 og 3 til brukeren åpner det. */
function useLukketFraStart(): boolean {
  const { forside } = useTilstand();
  return forside.lukket.includes(PANEL) || !(forside.apnet ?? []).includes(PANEL);
}

/**
 * Forslag 2: båndet under søket, i full bredde. Sammenlagt fra start. På stor skjerm viser den sammenlagte linjen én
 * oppsummering for hver visning, og åpnet står visningene side om side, uten faner. På mobil er det kortet med faner.
 */
export function Baand() {
  const s = useForslagstekst();
  const navn = useVisningsnavn();
  const stor = useMinstBredde(SIDEKOLONNE_FRA);
  const lukket = useLukketFraStart();
  const { paa, skjultHelt } = useAktuelt();
  const [meny, settMeny] = useState(false);
  const id = useId();
  const veksle = () => vekslGruppe(PANEL, lukket);
  if (!stor) return <Panelkort lukket={lukket} onVeksle={veksle} klasse="ff-baand" />;
  if (skjultHelt) return null;
  // Sammenlagt: én knapp for hver visning, med navnet og oppsummeringen. Åpnet: et kort for hver visning.
  const segment: (v: Visning) => Ramme =
    (v) =>
    ({ sammendrag }) => (
      <li>
        <button type="button" class="ff-segment" aria-expanded={false} aria-controls={`${id}-i`} onClick={veksle}>
          <span class="ff-ikon" aria-hidden="true">
            <Ikon navn={ikonFor(v)} class="ikon-liten" />
          </span>
          <span class="ff-segment-tekst">
            <strong>{navn(v)}</strong>
            <span class="ff-sammendrag">{sammendrag}</span>
          </span>
        </button>
      </li>
    );
  const kort: Ramme = ({ tittel, children }) => (
    <div class="ff-kort">
      <h3 class="ff-kort-tittel">{tittel}</h3>
      {children}
    </div>
  );
  return (
    <section class={`ff-panel ff-baand ff-baand-bred${lukket ? ' ff-lukket' : ''}`} data-aktuelt="ff-baand" aria-labelledby={`${id}-t`}>
      <div class="ff-baand-rad">
        <h2 id={`${id}-t`} class="ff-merke">
          {s.merke}
        </h2>
        {lukket && (
          <ul class="ff-segmenter">
            {paa.map((v) => (
              <Innhold key={v} id={v} ramme={segment(v)} />
            ))}
          </ul>
        )}
        <div class="ff-verktoy">
          <Menyknapp apen={meny} menyId={`${id}-m`} onVeksle={() => settMeny(!meny)} />
          <button type="button" class="ikonknapp ff-veksle-liten" aria-expanded={!lukket} aria-controls={`${id}-i`} aria-label={lukket ? s.apne : s.leggSammen} title={lukket ? s.apne : s.leggSammen} onClick={veksle}>
            <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
          </button>
        </div>
      </div>
      {meny && <Meny id={`${id}-m`} />}
      <div id={`${id}-i`} class="ff-kortrad" hidden={lukket}>
        {!lukket && paa.map((v) => <Innhold key={v} id={v} ramme={kort} />)}
      </div>
    </section>
  );
}

/**
 * Forslag 3: en kompakt rad med en liten knapp for hver visning og menyen. Knappen åpner visningen i et overlegg
 * (avgjørelse 088), med fanene øverst, så brukeren kan bytte uten å lukke. Ingenting står i sideflyten.
 */
export function Rad() {
  const s = useForslagstekst();
  const { t } = useTekst();
  const navn = useVisningsnavn();
  const { paa, aktiv, velg, skjultHelt } = useAktuelt();
  const [apen, settApen] = useState<Visning | null>(null);
  const [meny, settMeny] = useState(false);
  const id = useId();
  if (skjultHelt) return null;
  const tittelId = `${id}-o`;
  const ramme: Ramme = ({ tittel, children }) => (
    <>
      <div class="ff-overlegg-topp">
        <span class="ff-merke">{s.merke}</span>
        <button type="button" class="ikonknapp" aria-label={s.lukk} title={s.lukk} onClick={() => settApen(null)}>
          <Ikon navn="lukk" />
        </button>
      </div>
      {paa.length > 1 && (
        <Faner
          paa={paa}
          aktiv={apen ?? aktiv}
          onVelg={(v) => {
            velg(v);
            settApen(v);
          }}
        />
      )}
      <h2 id={tittelId} class="ff-overlegg-tittel">
        {tittel}
      </h2>
      {children}
    </>
  );
  return (
    <section class="ff-rad" data-aktuelt="ff-rad" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} class="ff-merke">
        {s.merke}
      </h2>
      <ul class="ff-chips">
        {paa.map((v) => (
          <li key={v}>
            <button type="button" class="ff-chip" aria-haspopup="dialog" onClick={() => settApen(v)}>
              <Ikon navn={ikonFor(v)} class="ikon-liten" />
              <span>{v === 'jukselapp' ? t('forside.panel.jukselapp') : navn(v)}</span>
            </button>
          </li>
        ))}
        <li>
          <Menyknapp apen={meny} menyId={`${id}-m`} onVeksle={() => settMeny(!meny)} />
        </li>
      </ul>
      {meny && <Meny id={`${id}-m`} />}
      {apen &&
        createPortal(
          <Overlegg tittelId={tittelId} onLukk={() => settApen(null)} klasse="ff-overlegg">
            <Innhold key={apen} id={apen} ramme={ramme} />
          </Overlegg>,
          document.body,
        )}
    </section>
  );
}

/** Aktuelt er med når det ikke er skjult og minst én visning er valgt. */
function aktueltVises(skjult: readonly string[], jukselapp: boolean): boolean {
  if (skjult.includes(AKTUELT_SKJULT)) return false;
  return jukselapp || VISNINGER.some((v) => !skjult.includes(v.id));
}

/**
 * «Tilpass» i forslaget: bare valget om Aktuelt står på forsiden. Hva som står der, velges i menyen i Aktuelt. Slås det
 * på igjen uten noen visning valgt, kommer kalenderen tilbake.
 */
export function TilpassAktuelt() {
  const s = useForslagstekst();
  const { forside } = useTilstand();
  const skjult = forside.skjult ?? [];
  const vises = aktueltVises(skjult, !!forside.jukselapp);
  const veksle = () =>
    tilstand.oppdater((d) => {
      const f = d.forside;
      const naa = f.skjult ?? [];
      if (vises) return { ...d, forside: { ...f, skjult: [...naa, AKTUELT_SKJULT] } };
      const uten = naa.filter((g) => g !== AKTUELT_SKJULT);
      const ingen = !f.jukselapp && VISNINGER.every((v) => uten.includes(v.id));
      return { ...d, forside: { ...f, skjult: ingen ? uten.filter((g) => g !== 'neste') : uten } };
    });
  return (
    <fieldset class="tilpass-visninger">
      <legend class="tilpass-del">{s.tilpass.tittel}</legend>
      <p class="dempet liten">{s.tilpass.hjelp}</p>
      <div class="vippe">
        <input id="ff-tilpass-aktuelt" type="checkbox" role="switch" checked={vises} onChange={veksle} />
        <label for="ff-tilpass-aktuelt">{s.tilpass.vis}</label>
      </div>
    </fieldset>
  );
}

/** Linjen nederst på forsiden i forslaget: hvilket forslag som vises, og lenker til de andre. */
export function Forslagslinje({ forslag }: { forslag: Forslag }) {
  const s = useForslagstekst();
  const andre = ([1, 2, 3] as const).filter((n) => n !== forslag);
  return (
    <p class="ff-linje" data-testid="forslagslinje">
      {fyllInn(s.linje.tekst, { nr: String(forslag), navn: s.navn[forslag as 1 | 2 | 3] })} {s.linje.prov}:{' '}
      {andre.map((n) => (
        <span key={n}>
          <a href={`#/?forslag=${n}`}>{fyllInn(s.linje.lenke, { nr: String(n), navn: s.navn[n] })}</a>
          {' · '}
        </span>
      ))}
      <a href="#/?forslag=0">{s.linje.dagens}</a>
    </p>
  );
}
