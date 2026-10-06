// Fagside: fagkode, type, trinn, utdanningsprogram, årstimetall og vurderingsordning fra Grep, og kompetansemål,
// underveisvurdering og vurderingsordning fra læreplanen. Læreplanteksten vises på målformen planen er fastsatt i,
// merket og uoversatt (OPPDRAG 3.6).
// Rekkefølge (eier 01.10.2026): grunnopplysninger med årsramme, så kompetansemål, så vurdering samlet, så
// programområdene. Delene kan lukkes, og begrepene har «i» med lenke til begrepsbanken.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { naviger } from '../../../app/ruter.ts';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { ToKolonner, useBred } from '../../../components/ToKolonner.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { finnKobling, type Koblingsresultat } from '../../arbeidstid/beregning/index.ts';
import { fagvalgFraKobling } from '../../arbeidstid/fagvalg.ts';
import { nyGruppe, useKoblingsdata } from '../../arbeidstid/komponenter/Skjema.tsx';
import { overforSkjema, useHent } from '../../arbeidstid/kontekst.ts';
import { lastMerknader } from '../../../data/vigo.ts';
import { beregnGrenser } from '../../vurdering/beregning/fravaer.ts';
import { hentBegreper } from '../../begreper/innhold.ts';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';
import { formaterDato, formaterTall, type Malform, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { FerdigheterOgTemaer } from '../../laereplanverket/komponenter/IFaget.tsx';
import { lastTilbud, type Tilbudene, tilbudRute } from '../../opplaeringslop/data.ts';
import { type Fagrolle, fagITilbud } from '../../opplaeringslop/grupper.ts';
import type { SideProps } from '../../typer.ts';
import { lastFagindeks, lastFagrelasjoner, lastLaereplan } from '../data.ts';
import { lastNdla } from '../../../data/ndla.ts';
import type { Ndla } from '../ndla/skjema.ts';
import { htmlSpraak, programmerFor, programSammendrag, udirLenke } from '../oppslag.ts';
import type { Fag, Fagindeks, Fagtype, Laereplan, Vurdering } from '../skjema.ts';
import { fagtypeTekst, koTekst, programTekst, trinnTekst } from '../visning.ts';
import { brukesSammenMed, erstatterKoder, gjeldendeKoder, nyLaereplan } from '../vigo/oppslag.ts';
import type { Fagrelasjoner, Merknad } from '../vigo/skjema.ts';

/** Navnet på en fagkode: fra fagindeksen, ellers fra VIGO, ellers bare koden. */
function navnFor(kode: string, indeks: Fagindeks, rel: Fagrelasjoner, malform: Malform): string {
  return indeks.fag[kode]?.navn[malform] ?? rel.navn[kode] ?? rel.erstatninger[kode]?.navn ?? '';
}

/** Nettstedet til NDLA. Stiene til fagene står i data/ndla/fag.json. */
const NDLA = 'https://ndla.no';

/** Lenke til fagsiden når koden finnes i fagindeksen, ellers bare kode og navn. */
function Faglenke({ kode, indeks, rel, malform }: { kode: string; indeks: Fagindeks; rel: Fagrelasjoner; malform: Malform }) {
  const tekst = `${kode} ${navnFor(kode, indeks, rel, malform)}`.trim();
  return indeks.fag[kode] ? <a href={`#/fag/${kode}`}>{tekst}</a> : <>{tekst}</>;
}

const utgattTekst = (t: T, utgatt: string | null, malform: Malform) =>
  utgatt === null ? '' : utgatt === 'ukjent' ? t('fag.side.utgatt') : t('fag.side.utgattDato', { dato: formaterDato(utgatt, malform) });

function Avsnitt({ tekst }: { tekst: readonly string[] }) {
  return (
    <>
      {tekst.map((a, i) => (
        <p key={i} class="linjeskift">
          {a}
        </p>
      ))}
    </>
  );
}

function Vurderingstabell({ t, indeks, tittel, v }: { t: T; indeks: Fagindeks; tittel: string; v: Vurdering }) {
  const rader: [Tekstnokkel, string | null][] = [
    ['fag.side.standpunkt', v.standpunkt ? t('fag.side.ja') : t('fag.side.nei')],
    ['fag.side.eksamen', v.trekk && koTekst(t, indeks, 'vurdering', v.trekk)],
    ['fag.side.eksamensordning', v.eksamensordning && koTekst(t, indeks, 'eksamensordning', v.eksamensordning)],
    ['fag.side.eksamensform', v.eksamensform && koTekst(t, indeks, 'eksamensform', v.eksamensform)],
    ['fag.side.uttrykk', v.uttrykk && koTekst(t, indeks, 'uttrykk', v.uttrykk)],
  ];
  return (
    <div class="fag-vurdering">
      <h3 class="liten-overskrift">{tittel}</h3>
      <dl class="egenskaper">
        {rader
          .filter((r): r is [Tekstnokkel, string] => r[1] !== null)
          .map(([n, verdi]) => (
            <div key={n}>
              <dt>{t(n)}</dt>
              <dd>{verdi}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

function Laereplandel({ t, fag, plan, malform }: { t: T; fag: Fag; plan: Laereplan; malform: Malform }) {
  const spraakNavn = t(`fag.spraak.${plan.spraak}` as Tekstnokkel);
  const sett = plan.kompetansemaalsett.filter((s) => fag.km.includes(s.kode));
  const lang = htmlSpraak(plan.spraak);
  return (
    <>
      <p class="merker">
        <span class="merke">
          {t('fag.side.fastsatt', {
            spraak: spraakNavn === `fag.spraak.${plan.spraak}` ? plan.spraak : spraakNavn,
          })}
        </span>
      </p>
      <div lang={lang}>
        {/* Tittelen på læreplanen står ikke her, så kompetansemålene kommer rett etter merket (eier 04.10.2026). */}
        {sett.length === 0 && (
          <p class="dempet" lang={malform}>
            {t('fag.side.ingenMaal')}
          </p>
        )}
        {sett.map((s) => {
          // «Kompetansemål og vurdering Vg1» → «Vg1». Uten noe etter, står bare «Kompetansemål».
          const del = s.tittel.replace(/^Kompetansemål og vurdering\s*/i, '');
          const med = (navn: string) => (del ? `${navn}: ${del}` : navn);
          return (
            <section key={s.kode} class="kompetansemaalsett">
              <h3 class="liten-overskrift">
                <span lang={malform}>{t('fag.side.kompetansemaal')}</span>
                {del && `: ${del}`}
              </h3>
              {s.ingress && <p>{s.ingress}</p>}
              <ul class="kompetansemaal">
                {s.maal.map((m) => (
                  <li key={m.kode}>{m.tekst}</li>
                ))}
              </ul>
              {s.underveis.length > 0 && (
                <Forklaring tittel={med(t('fag.side.underveis'))}>
                  <div lang={lang}>
                    <Avsnitt tekst={s.underveis} />
                  </div>
                </Forklaring>
              )}
              {s.standpunkt.length > 0 && (
                <Forklaring tittel={med(t('fag.side.standpunktvurdering'))}>
                  <div lang={lang}>
                    <Avsnitt tekst={s.standpunkt} />
                  </div>
                </Forklaring>
              )}
              <p class="liten">
                <a href={udirLenke(plan.kode, s.kode)} target="_blank" rel="noopener noreferrer" lang={malform}>
                  {t('fag.side.udirLenke')} ({s.kode})
                  <Ikon navn="ekstern" class="ikon-liten" />
                  <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted: 'udir.no' })}</span>
                </a>
              </p>
            </section>
          );
        })}
      </div>
    </>
  );
}

/**
 * Boksen «Fravær og eksamen» under «Vurderingsordning», ved siden av boksene for elever og privatister (eier
 * 04.10.2026): fraværsgrensen i faget, om eksamen er sentralt eller lokalt gitt (VIGO), og fagmerknadene som hører til
 * faget (VIGO, lenke til FAM-oppslaget). Nederst står lenkene til Vurdering: kalkulatoren med faget valgt,
 * underveis- og sluttvurdering i faget og oversikten «Eksamen» (fase 6, pakke 3). Er Grep og VIGO uenige om årstimetallet eller trekkordningen, står det i boksen.
 */
function IFaget({ t, kode, fag, rel, malform }: { t: T; kode: string; fag: Fag; rel: Fagrelasjoner | null; malform: Malform }) {
  const hent = useHent();
  const v = rel?.vurdering[kode];
  const avvik = rel?.avvik[kode];
  const [merknader, settMerknader] = useState<readonly Merknad[] | null>(null);
  const fam = v?.fam ?? [];
  useEffect(() => {
    if (fam.length > 0) lastMerknader().then((m) => settMerknader(m.fagmerknader), () => undefined);
  }, [fam.join()]);
  let grense: { timer: number; prosent: number } | null = null;
  try {
    grense = fag.timer !== null ? beregnGrenser(hent, { arstimer: fag.timer, minutter: 60 }).grense : null;
  } catch {
    // Uten regelsett for datoen står ikke raden.
  }
  const tom = t('fag.side.avvikTom');
  const avvikLinjer = avvik
    ? [
        ...(avvik.timer !== undefined ? [t('fag.side.avvikTimer', { verdi: avvik.timer === null ? tom : formaterTall(avvik.timer) })] : []),
        ...(avvik.elev !== undefined ? [t('fag.side.avvikElev', { verdi: avvik.elev ?? tom })] : []),
        ...(avvik.privatist !== undefined ? [t('fag.side.avvikPrivatist', { verdi: avvik.privatist ?? tom })] : []),
      ]
    : [];
  const harTall = grense !== null || Boolean(v?.eksamen) || fam.length > 0;
  return (
    <div class="fag-vurdering fag-ifaget">
      <h3 class="liten-overskrift">{t('fag.side.fravaerOgEksamen')}</h3>
      {harTall && (
        <dl class="egenskaper">
          {grense !== null && fag.timer !== null && (
            <div>
              <dt>{t('fag.side.fravaersgrense')}</dt>
              <dd class="tall">
                {t('fag.side.fravaersgrenseVerdi', { timer: formaterTall(grense.timer) })}
                {/* Andelen på egen linje, så den ikke deles midt i (eier 04.10.2026). */}
                <span class="fag-ifaget-andel">{t('fag.side.fravaersgrenseAndel', { prosent: formaterTall(grense.prosent), arstimer: formaterTall(fag.timer) })}</span>
              </dd>
            </div>
          )}
          {v?.eksamen && (
            <div>
              <dt>{t('fag.side.eksamenGitt')}</dt>
              <dd>
                {t(`fag.side.gitt.${v.eksamen}`)}
                {v.sensur && `, ${t(`fag.side.sensur.${v.sensur}`)}`}
              </dd>
            </div>
          )}
          {fam.length > 0 && (
            <div>
              <dt>{t('fag.side.fagmerknader')}</dt>
              <dd>
                <ul class="tett">
                  {fam.map((k) => {
                    const m = merknader?.find((x) => x.kode === k);
                    return (
                      <li key={k}>
                        <a href={`#/begreper/fagmerknader?q=${k}`}>{k}</a>
                        {m && ` ${m[malform]}`}
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}
      {avvikLinjer.length > 0 && (
        <div class="merknad merknad-advarsel fag-avvik">
          <p>{t('fag.side.avvikVigo')}</p>
          <ul class="tett">
            {avvikLinjer.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Lenkene til den andre modulen er merket «I Vurdering» (mockup 3, eier 04.10.2026). */}
      <p class="fag-ifaget-i">{t('fag.side.iVurdering')}</p>
      <ul class="fag-ifaget-lenker">
        {grense !== null && (
          <li>
            <a class="lenke-pil" href={`#/vurdering/fravaer?fag=${kode}`}>
              {t('fag.side.tilFravaer')}
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        )}
        <li>
          <a class="lenke-pil" href={`#/vurdering/underveis-og-sluttvurdering?fag=${kode}`}>
            {t('fag.side.tilVurdering')}
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
        <li>
          <a class="lenke-pil" href="#/vurdering/eksamen">
            {t('fag.side.tilEksamen')}
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
    </div>
  );
}

/** Vurderingsordningen i læreplanen, under «Vurdering» sammen med vurderingen fra Grep (eier 01.10.2026). */
function VurderingIPlan({ t, plan }: { t: T; plan: Laereplan }) {
  if (plan.vurderingsordning.length === 0) return null;
  return (
    <Forklaring tittel={t('fag.side.vurderingsordningLaereplan')}>
      <div lang={htmlSpraak(plan.spraak)}>
        {plan.vurderingsordning.map((v) => (
          <section key={v.overskrift}>
            <h4 class="liten-overskrift">{v.overskrift}</h4>
            <Avsnitt tekst={v.tekst} />
          </section>
        ))}
      </div>
    </Forklaring>
  );
}

/** «i» ved et begrep: lenke til begrepet i begrepsbanken. */
function Begrepslenke({ id, navn }: { id: string; navn: string }) {
  const { t } = useTekst();
  return (
    <a class="begrep-i" href={`#/begreper/${id}`} aria-label={t('fag.side.omBegrep', { begrep: navn.toLowerCase() })}>
      <Ikon navn="info" class="ikon-liten" />
    </a>
  );
}

/** Begrepet som forklarer hver fagtype. */
const BEGREP_FOR_TYPE: Partial<Record<Fagtype, string>> = {
  fellesfag: 'fellesfag',
  felles_programfag: 'felles-programfag',
  valgfritt_programfag: 'programfag',
  yrkesfaglig_fordypning: 'yrkesfaglig-fordypning',
};

/** En del av fagarket med overskrift som åpner og lukker den. Hvilke deler som er åpne, huskes for siden. */
function Seksjon({ id, tittel, lukket: standard = false, children }: { id: string; tittel: string; lukket?: boolean; children: ComponentChildren }) {
  const [lukket, veksle] = useSammenlagt(`fag-${id}`, standard);
  const innhold = useId();
  return (
    <section class="fag-seksjon" data-seksjon={id}>
      <h2 class="fag-seksjon-tittel">
        <button type="button" class="kortknapp" aria-expanded={!lukket} aria-controls={innhold} onClick={veksle}>
          <span class="kortknapp-tekst">{tittel}</span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten kortknapp-pil" />
        </button>
      </h2>
      <div id={innhold} hidden={lukket}>
        {children}
      </div>
    </section>
  );
}

/** Åpner en ny, ulagret arbeidsplan med faget som fag 1 (eier 01.10.2026, B4). */
function regnUtIArbeidsplan(kode: string, fag: Fag, r: Koblingsresultat) {
  const gruppe = { ...nyGruppe(), arsrammer: [fagvalgFraKobling(kode, fag.navn, fag.timer, r)], arstimer: fag.timer, arstimerAuto: fag.timer !== null };
  overforSkjema('arbeidsplan', { grupper: [gruppe] });
  naviger('/arbeidstid/arbeidsplan');
}

/**
 * Nøkkeltallene øverst på fagarket: årstimetall og årsramme. Årsrammen kommer fra koblingen til vedlegg 1. Avhenger
 * den av program og trinn, står radene under nøkkeltallene.
 */
function Nokkeltall({ kode, fag, r, indeks, malform }: { kode: string; fag: Fag; r: Koblingsresultat | null; indeks: Fagindeks; malform: Malform }) {
  const { t } = useTekst();
  const kjent = r !== null && r.status !== 'ukoblet';
  const [visRader, settVisRader] = useState(false);
  const raderId = useId();
  return (
    <section class="nokkeltall-kort" aria-label={t('fag.side.nokkeltall')}>
      <div class="nokkeltall">
        <div class="nokkeltall-rute">
          <span class="nokkeltall-etikett">{t('fag.side.arstimer')}</span>
          <span class="nokkeltall-verdi tall">{fag.timer !== null ? formaterTall(fag.timer) : '–'}</span>
          <span class="nokkeltall-enhet">{fag.timer !== null ? t('fag.side.timerEnhet') : t('fag.side.arstimerMangler')}</span>
        </div>
        {kjent && (
          <div class="nokkeltall-rute">
            {/* «Regn ut i Arbeidsplan» står som knapp på linje med overskriften i ruten, så kortet ikke trenger en egen rad
                (eier 04.10.2026). På smal skjerm vises bare ikonet. At årsrammen bygger på appens tolkning av vedlegg 1,
                står på begrepet Årsramme bak «i». Teksten følger bredden på ruten: hele, «Arbeidsplan» eller bare ikonet. */}
            <div class="nokkeltall-topp">
              <span class="nokkeltall-etikett">
                {t('fag.side.arsramme')} <Begrepslenke id="arsramme" navn={t('fag.side.arsramme')} />
              </span>
              <a
                class="knapp knapp-sekundaer knapp-liten nokkeltall-regn-ut"
                href="#/arbeidstid/arbeidsplan"
                title={t('fag.side.regnUt')}
                aria-label={t('fag.side.regnUt')}
                onClick={(e) => {
                  e.preventDefault();
                  regnUtIArbeidsplan(kode, fag, r);
                }}
                data-regn-ut
              >
                <Ikon navn="kalkulator" class="ikon-liten" />
                <span class="nokkeltall-regn-ut-lang" aria-hidden="true">
                  {t('fag.side.regnUt')}
                </span>
                <span class="nokkeltall-regn-ut-kort" aria-hidden="true">
                  {t('fag.side.regnUtKort')}
                </span>
              </a>
            </div>
            {r.status === 'koblet' ? (
              <>
                <span class="nokkeltall-verdi tall">{formaterTall(r.kandidat.rad.t60)}</span>
                <span class="nokkeltall-enhet">{t('fag.side.arsrammeEnhet', { t45: formaterTall(r.kandidat.rad.t45) })}</span>
              </>
            ) : (
              // Rutene for hvert program står i en utvidelse av ruten, lukket til brukeren åpner den (eier 02.10.2026).
              <button type="button" class="nokkeltall-utvid" aria-expanded={visRader} aria-controls={raderId} onClick={() => settVisRader(!visRader)}>
                <span class="nokkeltall-verdi">{t('fag.side.arsrammeVarierer')}</span>
                <span class="nokkeltall-enhet">{t('fag.side.arsrammeAvhenger')}</span>
                <span class="nokkeltall-vis">
                  {t('fag.side.arsrammeVis', { antall: formaterTall(r.kandidater.length) })}
                  <Ikon navn={visRader ? 'opp' : 'ned'} class="ikon-liten" />
                </span>
              </button>
            )}
          </div>
        )}
      </div>
      {kjent && r.status === 'flertydig' && (
        <dl id={raderId} class="nokkeltall-rader" hidden={!visRader}>
          {r.kandidater.map((k) => (
            <div key={`${k.program}-${k.trinn}-${k.rad.nr}`}>
              <dt>
                {programTekst(indeks, k.program, malform)} {trinnTekst(t, k.trinn as Fag['trinn'][number])}
              </dt>
              <dd class="tall">{t('fag.side.arsrammeProgramVerdi', { t60: formaterTall(k.rad.t60), t45: formaterTall(k.rad.t45) })}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** Forklaringen av yrkesfaglig fordypning fra begrepsbanken, på fagarket for fagene i yrkesfaglig fordypning. */
function YffForklaring({ malform }: { malform: Malform }) {
  const { t } = useTekst();
  const [begrep, settBegrep] = useState<Innholdselement | null>(null);
  useEffect(() => {
    hentBegreper().then(
      (b) => settBegrep(b.find((x) => x.id === 'yrkesfaglig-fordypning') ?? null),
      () => undefined,
    );
  }, []);
  if (!begrep) return null;
  return (
    <div class="merknad fagark-yff">
      <h2 class="liten-overskrift">{t('fag.side.yffOverskrift')}</h2>
      {/* Teksten er HTML fra begrepsbanken, laget av innholdet i content/ ved bygging, som på begrepssiden. */}
      <div class="brodtekst" dangerouslySetInnerHTML={{ __html: begrep.tekst[malform] }} />
      <p class="liten">
        <a href="#/begreper/yrkesfaglig-fordypning">{t('fag.side.lesMer')}</a>
      </p>
    </div>
  );
}

/** «Felles programfag · 197 timer» eller «Fellesfag, ett av flere valg · 112 timer». */
function rolletekst(t: T, r: Fagrolle): string {
  const navn = t(`opplaeringslop.tilbud.kategori.${r.kategori}`);
  const del = r.valg ? t('opplaeringslop.tilbud.rolleValg', { kategori: navn }) : navn;
  return r.timer !== null ? `${del} · ${t('opplaeringslop.tilbud.timer', { timer: formaterTall(r.timer) })}` : del;
}

export default function Fagside({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const kode = parametre.kode ?? '';
  const [indeks, settIndeks] = useState<Fagindeks | null>(null);
  const [plan, settPlan] = useState<Laereplan | 'laster' | 'feil' | null>(null);
  const [forsok, settForsok] = useState(0);
  const [rel, settRel] = useState<Fagrelasjoner | null>(null);
  const koblingsdata = useKoblingsdata();
  const [tilbud, settTilbud] = useState<Tilbudene | null>(null);
  const [ndla, settNdla] = useState<Ndla | null>(null);
  const bred = useBred();

  useEffect(() => {
    // Faget på NDLA (avgjørelse 053). Siden virker også uten.
    lastNdla().then(settNdla, () => undefined);
    void lastFagindeks().then(settIndeks);
    // Tilbudene viser hvordan faget inngår i hvert programområde. Siden virker også uten.
    lastTilbud().then(settTilbud, () => undefined);
    // Erstatninger og fag som brukes sammen, fra VIGO Kodeverksbase. Siden virker også uten.
    lastFagrelasjoner().then(settRel, () => undefined);
  }, []);
  const fag = indeks?.fag[kode];
  const lp = fag?.lp ?? null;
  useEffect(() => {
    if (!lp) return;
    settPlan('laster');
    lastLaereplan(lp).then(settPlan, () => settPlan('feil'));
  }, [lp, forsok]);

  if (indeks === null) return <p class="side dempet">{t('app.lasterInn')}</p>;
  if (!fag) {
    const nye = rel ? gjeldendeKoder(kode, rel, (k) => indeks.fag[k] !== undefined) : [];
    if (rel && nye.length > 0) {
      return (
        <div class="side">
          <Brodsmuler ledd={[{ tekst: t('fag.tittel'), href: '#/fag' }]} />
          <h1 tabIndex={-1}>{t('fag.side.utgattKode', { kode })}</h1>
          <p>
            {rel.erstatninger[kode]?.navn}{' '}
            {utgattTekst(t, rel.erstatninger[kode]?.utgatt ?? null, malform) && `(${utgattTekst(t, rel.erstatninger[kode]?.utgatt ?? null, malform)})`}
          </p>
          <p>{t('fag.side.erstattetAv')}</p>
          <ul>
            {nye.map((k) => (
              <li key={k}>
                <Faglenke kode={k} indeks={indeks} rel={rel} malform={malform} />
              </li>
            ))}
          </ul>
          <Kildeliste kilder={[{ id: 'vigo-kodeverk', punkt: kode }]} />
        </div>
      );
    }
    return (
      <div class="side">
        <Brodsmuler ledd={[{ tekst: t('fag.tittel'), href: '#/fag' }]} />
        <h1 tabIndex={-1}>{t('fag.side.ikkeFunnet')}</h1>
        <p>
          <a href="#/fag">{t('fag.side.tilbakeTilListen')}</a>
        </p>
      </div>
    );
  }
  const programmer = programmerFor(indeks, fag);
  const sammendrag = programSammendrag(indeks, programmer);
  const programtekster = [
    ...(sammendrag.alleYrkesfaglige ? [t('fag.side.alleYrkesfaglige')] : []),
    ...(sammendrag.alleStudieforberedende ? [t('fag.side.alleStudieforberedende')] : []),
    ...sammendrag.andre.map((p) => programTekst(indeks, p, malform)),
  ];
  const kobling = koblingsdata ? finnKobling(kode, indeks, koblingsdata.tabeller, koblingsdata.rader) : null;
  const erstatter = rel ? erstatterKoder(kode, rel) : [];
  const sammen = rel ? brukesSammenMed(kode, rel) : [];
  const nyPlan = rel && lp ? nyLaereplan(lp, rel) : null;
  const medVigo = erstatter.length > 0 || sammen.length > 0 || nyPlan !== null || Boolean(rel?.vurdering[kode]) || Boolean(rel?.avvik[kode]);
  const erYff = fag.type === 'yrkesfaglig_fordypning';
  const typeBegrep = BEGREP_FOR_TYPE[fag.type];
  const ndlafag = ndla?.fag[kode] ?? [];
  const kilder = [
    ...(lp ? [{ id: 'udir-lk20', punkt: lp, url: udirLenke(lp) }] : []),
    { id: 'udir-grep', punkt: kode },
    ...(kobling && kobling.status !== 'ukoblet' ? [{ id: 'ks-sfs2213-avtaletekst', punkt: 'Vedlegg 1' }] : []),
    ...(erYff ? [{ id: 'udir-yff-forskrift' }] : []),
    ...(medVigo ? [{ id: 'vigo-kodeverk', punkt: kode }] : []),
    ...(ndlafag.length > 0 ? [{ id: 'ndla', punkt: kode }] : []),
  ];
  const antallMaal =
    plan && typeof plan === 'object' ? plan.kompetansemaalsett.filter((x) => fag.km.includes(x.kode)).reduce((sum, x) => sum + x.maal.length, 0) : null;
  /** Nøkkeltallene og faktaene om faget. */
  const fakta = (
    <>
      <Nokkeltall kode={kode} fag={fag} r={kobling} indeks={indeks} malform={malform} />
      <dl class="egenskaper fagark-fakta">
        {programtekster.length > 0 && (
          <div>
            <dt>
              {t('fag.side.program')} <Begrepslenke id="utdanningsprogram" navn={t('fag.side.program')} />
            </dt>
            <dd>{programtekster.join(', ')}</dd>
          </div>
        )}
        {rel && sammen.length > 0 && (
          <div>
            <dt>{t('fag.side.brukesSammen')}</dt>
            <dd>
              <ul class="tett">
                {sammen.map((k) => (
                  <li key={k}>
                    <Faglenke kode={k} indeks={indeks} rel={rel} malform={malform} />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {ndlafag.length > 0 && (
          <div class="fagark-ndla">
            <dt>{t('fag.side.ndla')}</dt>
            <dd>
              <ul class="tett">
                {ndlafag.map((f) => (
                  <li key={f.sti}>
                    <a class="ekstern-lenke" href={`${NDLA}${f.sti}`} target="_blank" rel="noopener noreferrer">
                      {f.navn[malform]}
                      <Ikon navn="ekstern" class="ikon-liten" />
                      <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted: 'ndla.no' })}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p class="liten dempet">{t('fag.side.ndlaHjelp')}</p>
            </dd>
          </div>
        )}
        {erstatter.length > 0 && (
          <div>
            <dt>{t('fag.side.erstatter')}</dt>
            <dd>
              <ul class="tett">
                {erstatter.map((e) => (
                  <li key={e.kode}>
                    {e.kode} {e.navn}
                    {e.utgatt && ` (${utgattTekst(t, e.utgatt, malform)})`}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      {nyPlan && lp && <p class="merknad">{t('fag.side.nyLaereplan', { gammel: lp, ny: nyPlan })}</p>}
      {erYff && <YffForklaring malform={malform} />}
    </>
  );
  /** Læreplanverket, kompetansemålene og vurderingen. */
  const seksjoner = (
    <>
      {/* Grunnleggende ferdigheter og tverrfaglige temaer i faget, med lenke til overordnet del (avgjørelse 037). Står før
          kompetansemålene, og alle delene er lukket til brukeren åpner dem (eier 02.10.2026). */}
      {plan && typeof plan === 'object' && plan.ferdigheter.length + plan.temaer.length > 0 && (
        <Seksjon id="laereplanverket" lukket tittel={t('laereplanverket.fagark.tittel')}>
          <FerdigheterOgTemaer plan={plan} lang={htmlSpraak(plan.spraak)} />
        </Seksjon>
      )}

      {!erYff && (
        <Seksjon
          id="kompetansemaal"
          lukket
          tittel={antallMaal !== null ? `${t('fag.side.kompetansemaalSeksjon')} (${formaterTall(antallMaal)})` : t('fag.side.kompetansemaalSeksjon')}
        >
          {!lp ? (
            <p class="dempet">{t('fag.side.ingenLaereplan')}</p>
          ) : plan === 'feil' ? (
            <p role="alert">
              {t('fag.side.laereplanFeil')}{' '}
              <button type="button" class="lenkeknapp" onClick={() => settForsok(forsok + 1)}>
                {t('app.provIgjen')}
              </button>
            </p>
          ) : plan === null || plan === 'laster' ? (
            <p class="dempet">{t('fag.side.lasterLaereplan')}</p>
          ) : (
            <Laereplandel t={t} fag={fag} plan={plan} malform={malform} />
          )}
        </Seksjon>
      )}

      <Seksjon id="vurdering" lukket tittel={t('fag.side.vurdering')}>
        <div class="fag-vurderinger">
          <IFaget t={t} kode={kode} fag={fag} rel={rel} malform={malform} />
          {fag.elev && <Vurderingstabell t={t} indeks={indeks} tittel={t('fag.side.elev')} v={fag.elev} />}
          {fag.privatist && <Vurderingstabell t={t} indeks={indeks} tittel={t('fag.side.privatist')} v={fag.privatist} />}
        </div>
        {!fag.elev && !fag.privatist && <p class="dempet">{t('fag.side.ingenVurdering')}</p>}
        {plan && typeof plan === 'object' && <VurderingIPlan t={t} plan={plan} />}
      </Seksjon>
    </>
  );
  /** Programområdene faget inngår i. */
  const programomrader = (
    <>
      {fag.po.length > 0 && (
        <Seksjon id="programomrader" lukket tittel={t('fag.side.programomrader', { antall: fag.po.length })}>
          <p class="liten">
            <a href="#/begreper/programomrade">{t('fag.side.omProgramomrade')}</a>
          </p>
          {/* Hvert programområde lenker til tilbudet i Opplæringsløp (pakke 5, avgjørelse 035), med hvordan faget
              inngår i tilbudet og timene (eier 02.10.2026). */}
          <ul class="inngar-liste">
            {fag.po.map((p) => {
              const po = indeks.programomrader[p];
              const tb = tilbud?.tilbud[p];
              const rolle = tb ? fagITilbud(tb, kode, indeks) : null;
              return (
                <li key={p}>
                  {po ? <a href={`#${tilbudRute(po.program, p)}`}>{`${po.navn[malform]} (${p.replace(/-+$/, '')}, ${trinnTekst(t, po.trinn)})`}</a> : p}
                  {rolle && <span class="inngar-rolle">{rolletekst(t, rolle)}</span>}
                </li>
              );
            })}
          </ul>
        </Seksjon>
      )}
    </>
  );
  return (
    <article class="side side-bred fagark" data-fagtype={fag.type}>
      <Brodsmuler ledd={[{ tekst: t('fag.tittel'), href: '#/fag' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{fag.navn[malform]}</h1>
        <FavorittKnapp id={`fag:${kode}`} navn={fag.navn[malform]} />
      </div>
      {/* Fagkode, fagtype og trinn som merker under tittelen. Fargen på fagtypen går igjen i delene under. */}
      <ul class="merker fagark-merker" aria-label={t('fag.side.merker')}>
        <li class="merke merke-kode">
          <span class="skjult-visuelt">{t('fag.side.fagkode')}: </span>
          {kode}
        </li>
        <li class="merke merke-fagtype">
          <span class="skjult-visuelt">{t('fag.side.fagtype')}: </span>
          {fagtypeTekst(t, fag.type)}
          {typeBegrep && <Begrepslenke id={typeBegrep} navn={fagtypeTekst(t, fag.type)} />}
        </li>
        {/* «i» for trinnet står inni det siste trinnmerket, som for fagtypen (eier 04.10.2026). */}
        {fag.trinn.map((x, i) => (
          <li key={x} class="merke">
            <span class="skjult-visuelt">{t('fag.side.trinn')}: </span>
            {trinnTekst(t, x)}
            {i === fag.trinn.length - 1 && <Begrepslenke id="trinn-vg" navn={t('fag.side.trinn')} />}
          </li>
        ))}
      </ul>
      {/* På skrivebord (fra 64rem): læreplanen, kompetansemålene og vurderingen til venstre, og nøkkeltallene, faktaene og
          programområdene til høyre (eier 06.10.2026, avgjørelse 074). På mobil står alt i samme rekkefølge som før. */}
      {bred ? (
        <ToKolonner
          hoved={seksjoner}
          side={
            <>
              {fakta}
              {programomrader}
            </>
          }
        />
      ) : (
        <>
          {fakta}
          {seksjoner}
          {programomrader}
        </>
      )}
      <Kildeliste kilder={kilder} />
    </article>
  );
}
