// Arbeidsplan for én lærer: fag og funksjoner mot stillingsprosenten, med teknisk undertid eller overtid.
// Hovedkalkulatoren i modulen. Differansen kan regnes om til årsrammetimer i et valgt fag. Under står fordelingen
// av arbeidstiden (samme diagram som i Fordeling), og årslønnen i stillingen kan regnes ut ved behov.
// Arbeidsplanen kan gjelde hele skoleåret eller en periode (eier 30.09.2026). I en periode er fagene timer i perioden,
// og stillingen og funksjonene gjelder perioden. Prosentene kan vises for perioden eller på årsbasis
// (prosent × periodenøkkel). Timer og kroner er de samme i begge visningene.
import { useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sammenleggbartkort } from '../../../components/Sammenlegg.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall, type Malform, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { beregnFordeling, beregnLonn, beregnStillingsplan, differanseIHvertFag, type FordelingsdelId, type Funksjon, funksjonsprosentFor, type Gruppe, lonnsperiode, type Operand, periodenokkel } from '../beregning/index.ts';
import { Fordelingsvisning } from '../komponenter/Fordelingsdiagram.tsx';
import { Belopsstolpe, Periodelinje, Stillingsmaaler, type Stolpedel } from '../komponenter/Grafikk.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useArstimer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Funksjoner, type Livsfase, Livsfasekort, livsfaseregler, nyFunksjon, reserverFunksjonsider, tilFunksjon, tilleggsforslag, utvider } from '../komponenter/Funksjoner.tsx';
import { Lonnsskjema, nyLonnstilstand, tilLonnsgrunnlag } from '../komponenter/Lonnsskjema.tsx';
import { Innholdstekst, useArbeidstidElement } from '../komponenter/Metode.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Bryter, type Fagindeks, type Gruppetilstand, Grupper, nyGruppe, radTekst, reserverIder, tilGruppe, useFagindeks, Vippe } from '../komponenter/Skjema.tsx';
import { medEnhet, tallTekst, Utregningskort } from '../komponenter/Utregning.tsx';
import { Varianter } from '../komponenter/Varianter.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

const fordelingsdeler: FordelingsdelId[] = ['undervisning', 'motetid', 'annen_planfestet', 'planleggingsdager', 'funksjonstid', 'selvdisponert'];

/** Forklaring av hva en del av arbeidstiden brukes til (innhold i content/arbeidstid). */
function BrukAvDel({ id }: { id: FordelingsdelId }) {
  const { t } = useTekst();
  const element = useArbeidstidElement(`bruk-${id.replace('_', '-')}`);
  return (
    <Forklaring tittel={t(`arbeidstid.fordeling.deler.${id}` as Tekstnokkel)}>
      {element ? <Innholdstekst element={element} /> : <p class="dempet">{element === undefined ? t('app.lasterInn') : t('arbeidstid.metode.ikkeFunnet')}</p>}
    </Forklaring>
  );
}

/** Kort navn på faget i en gruppe, f.eks. «Engelsk · Studiespesialisering Vg1». */
function fagnavn(g: Gruppetilstand, indeks: Fagindeks, reserve: string, malform: Malform): string {
  const plass = g.arsrammer[0];
  if (plass?.fag) return `${plass.fag.kode} ${plass.fag.navn[malform]}`;
  if (plass?.valg && plass.valg !== 'manuell') return radTekst(indeks, plass.valg)?.navn ?? reserve;
  return reserve;
}

export default function Arbeidsplan() {
  const { t, malform } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const arstimer = useArstimer(hent);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const idTimer = useId();
  const [visHvertFag, settVisHvertFag] = useState(false);
  const [s, sett] = useSkjematilstand(
    'arbeidsplan',
    () => ({
      stilling: 100 as number | null,
      grupper: [nyGruppe()],
      funksjoner: [nyFunksjon()],
      timerIGruppe: null as number | null,
      moter: null as number | null,
      visLonn: false,
      lonn: nyLonnstilstand(),
      over60: false,
      livsfase: 'ingen' as Livsfase,
      /** Redusert undervisning i prosent, eller null for den største reduksjonen i tiltaket. */
      livsfaseProsent: null as number | null,
      /** Arbeidsplanen gjelder en periode av skoleåret. Mangler i skjema lagret før 0.7.0. */
      periode: false as boolean | undefined,
      dager: null as number | null | undefined,
      dagerSkolear: null as number | null | undefined,
      /** Vis prosentene på årsbasis i stedet for i perioden. */
      arsbasis: false as boolean | undefined,
      /** Timer på planleggingsdager, eller null for 6 dager × 7,5 timer (som for hel stilling). */
      planlegging: null as number | null | undefined,
      /** Første og siste dag i perioden (ÅÅÅÅ-MM-DD), til lønnen for perioden. */
      fraDato: '' as string | undefined,
      tilDato: '' as string | undefined,
    }),
    (lagret) => {
      reserverIder(lagret.grupper);
      reserverFunksjonsider(lagret.funksjoner);
    },
  );

  // Bare utfylte grupper regnes med. Hver har med seg tilstanden, så navn og valg følger riktig gruppe.
  const iPeriode = s.periode === true;
  const skolearDager = useRegeltall(hent, 'sfs2213.skolear_dager') ?? 0;
  const dagerPerUke = useRegeltall(hent, 'sfs2213.arbeidsdager_per_uke');
  const dager = s.dager ?? null;
  const periode = iPeriode && dager !== null && dager > 0 ? { dagerIPerioden: dager, dagerISkolearet: s.dagerSkolear ?? null } : undefined;
  // Uker i perioden for økter per uke: dagene i perioden ÷ skoledager per uke, med mindre brukeren skriver inn antallet.
  const ukerFraDager = dager !== null && dager > 0 && dagerPerUke ? dager / dagerPerUke : 0;
  const ukerHjelp =
    ukerFraDager > 0
      ? t('arbeidstid.periode.ukerFraDager', { uker: formaterTall(ukerFraDager, 1), dager: formaterTall(dager ?? 0), perUke: formaterTall(dagerPerUke ?? 0) })
      : t('arbeidstid.periode.ukerFyllDager');
  // Årstimer fylt inn fra Grep gjelder et helt år. De tømmes når arbeidsplanen gjøres om til en periode.
  const settPeriode = (pa: boolean) =>
    sett({ ...s, periode: pa, grupper: pa ? s.grupper.map((g) => (g.arstimerAuto ? { ...g, arstimer: null, arstimerAuto: false } : g)) : s.grupper });
  const fylte = s.grupper.map((g) => ({ g, inn: tilGruppe(g, rader, iPeriode) })).filter((x): x is { g: Gruppetilstand; inn: Gruppe } => x.inn !== null);
  const valgtIndeks = Math.max(0, fylte.findIndex((x) => x.g.id === s.timerIGruppe));
  // Prosenten for hver funksjon, også dem som er oppgitt i årsrammetimer.
  const prosenter = s.funksjoner.map((f) => {
    const inn = tilFunksjon(f);
    return inn ? (prov(() => funksjonsprosentFor(hent, inn)).resultat ?? 0) : 0;
  });
  const funksjoner = s.funksjoner.map(tilFunksjon).filter((f): f is Funksjon => f !== null);
  // Redusert undervisning etter punkt 6: skrevet inn, eller den største reduksjonen i tiltaket.
  const livsfasesatser = {
    nyutdannet: useRegeltall(hent, livsfaseregler.nyutdannet),
    fra57: useRegeltall(hent, livsfaseregler.fra57),
    fra60: useRegeltall(hent, livsfaseregler.fra60),
  };
  const livsfaseMaks = s.livsfase === 'ingen' ? null : livsfasesatser[s.livsfase];
  const reduksjon = s.livsfase === 'ingen' ? 0 : (s.livsfaseProsent ?? livsfaseMaks ?? 0);
  const over60 = s.livsfase === 'fra60';
  // I en periode trengs dagene før noe kan regnes ut.
  const periodeKlar = !iPeriode || periode !== undefined;
  const nokkel = periode ? (prov(() => periodenokkel(hent, periode)).resultat?.resultat ?? null) : null;
  // Prosentene vises i perioden, eller på årsbasis (× periodenøkkelen) når brukeren velger det.
  const paArsbasis = iPeriode && s.arsbasis === true && nokkel !== null;
  const vis = (prosent: number) => (paArsbasis && nokkel ? prosent * nokkel.verdi : prosent);
  const { resultat, feil } = prov(() =>
    periodeKlar && s.stilling !== null && s.stilling > 0 && (fylte.length > 0 || prosenter.some((p) => p > 0) || reduksjon > 0)
      ? beregnStillingsplan(hent, {
          stilling: s.stilling,
          grupper: fylte.map((x) => x.inn),
          funksjoner,
          timerIGruppe: fylte.length > 0 ? valgtIndeks : null,
          reduksjon,
          ...(periode ? { periode } : {}),
        })
      : null,
  );
  // Fordelingen av arbeidstiden i stillingen vises alltid, også før noe er lagt inn: fagene, funksjonene og
  // den delen av stillingen som ikke er fylt ennå. Funksjonene som ikke utvider planfestet tid, fordeles som undervisningen.
  const sumFunksjoner = (utvid: boolean) => s.funksjoner.reduce((sum, f, i) => sum + (utvider(f) === utvid ? (prosenter[i] ?? 0) : 0), 0);
  // Redusert undervisning utvider ikke planfestet tid: den frigjorte tiden erstatter undervisning i planfestet tid.
  const utenUtvidelse = sumFunksjoner(false) + reduksjon;
  const harStilling = s.stilling !== null && s.stilling > 0;
  const fordeling =
    periodeKlar && (resultat || harStilling)
    ? prov(() =>
        beregnFordeling(hent, {
          grupper: fylte.map((x) => x.inn),
          ...(harStilling ? { stilling: s.stilling ?? 0 } : {}),
          funksjon: { type: 'prosent', prosent: sumFunksjoner(true) },
          funksjonUtenUtvidelse: utenUtvidelse,
          moterPerUke: s.moter ?? 0,
          planleggingstimer: s.planlegging ?? null,
          over60,
          ...(periode ? { periode } : {}),
        }),
      ).resultat
    : null;
  const maksUke = useRegeltall(hent, 'sfs2213.planfestet_maks_uke');
  const maksDag = useRegeltall(hent, 'sfs2213.planfestet_maks_dag');
  // Timer på planleggingsdager for en lærer i hel stilling: 6 dager × 7,5 timer (samme tall for alle, som i InSchool).
  const planleggingStandard = (useRegeltall(hent, 'sfs2213.arbeidsaar_tillegg_dager') ?? 0) * (useRegeltall(hent, 'sfs2213.timer_per_dag') ?? 0);
  const ukegrenser = maksUke !== null && maksDag !== null && dagerPerUke !== null ? { maksUke, maksDag, dagerPerUke } : null;
  const ikkeFylt = fordeling?.trinn.find((tr) => tr.id === 'ikke_fordelt')?.resultat.verdi ?? 0;
  // Tillegg per funksjon. Forslaget er minstegodtgjøringen i SFS 2213 punkt 9.1 for funksjonen som er kjent igjen på
  // navnet, eller for kontaktlærer, som er den vanligste, når navnet ikke kjennes igjen. Brukeren kan skrive inn et annet beløp.
  const kontaktlaerer = useRegeltall(hent, 'sfs2213.godtgjoring_kontaktlaerer');
  const radgiver = useRegeltall(hent, 'sfs2213.godtgjoring_radgiver');
  const satser: Record<string, number | null> = { 'sfs2213.godtgjoring_kontaktlaerer': kontaktlaerer, 'sfs2213.godtgjoring_radgiver': radgiver };
  const kontaktlaererTimer = useRegeltall(hent, 'sfs2213.kontaktlaerer_reduksjon');
  const arsrammeFunksjon = useRegeltall(hent, 'sfs2213.arsramme_funksjon');
  const arsverk60 = useRegeltall(hent, 'sfs2213.arsverk_timer_60_ar');
  const arsverk = useRegeltall(hent, 'sfs2213.arsverk_timer');
  const timerPerDag = useRegeltall(hent, 'sfs2213.timer_per_dag');
  // Fra 60 år er årsverket kortere. Forskjellen er arbeidsdager med ekstra ferie (punkt 4, eier 30.09.2026).
  const feriedager60 = arsverk !== null && arsverk60 !== null && timerPerDag ? (arsverk - arsverk60) / timerPerDag : null;
  const tilleggene = s.funksjoner
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => f.tillegg === true)
    .map(({ f, i }) => ({ navn: f.navn.trim() || t('arbeidstid.arbeidsplan.funksjonNr', { nr: i + 1 }), kr: f.tilleggKr ?? tilleggsforslag(f, satser).verdi }));
  const tillegg = tilleggene.length > 0 ? tilleggene.reduce((sum, x) => sum + x.kr, 0) : null;

  const lonnsgrunnlag = s.visLonn ? tilLonnsgrunnlag(s.lonn) : null;
  // I en periode regnes lønnen fra datoene: hele måneder, og arbeidsdager ÷ 21,67 i brutte måneder (som i lønnssystemet).
  const lonnPeriode = iPeriode && s.fraDato && s.tilDato ? (prov(() => lonnsperiode(hent, s.fraDato ?? '', s.tilDato ?? '')).resultat ?? null) : null;
  const datoFeil = iPeriode && !!s.fraDato && !!s.tilDato && lonnPeriode === null;
  // Variabel lønn og overtidsbetaling regnes som i overtidskalkulatoren, med faget som er valgt for årsrammetimer.
  const overtidsfag = fylte[valgtIndeks]?.inn;
  const lonn =
    lonnsgrunnlag && harStilling && periodeKlar && (!iPeriode || lonnPeriode)
      ? prov(() =>
          beregnLonn(hent, {
            lonn: lonnsgrunnlag,
            stilling: s.stilling ?? 0,
            tillegg,
            overtid:
              resultat && overtidsfag ? { beskjeftigelse: resultat.beskjeftigelse.verdi, arsrammer: overtidsfag.arsrammer, elever: overtidsfag.elever } : null,
            over60: s.over60 || over60,
            periodenokkel: nokkel,
            lonnsandel: lonnPeriode?.andel ?? null,
          }),
        )
      : null;
  // Variabel lønn og overtid regnes om med et fag. Uten fag sier vi fra.
  const overtidUtenFag = s.visLonn && resultat !== null && (resultat.variabel.verdi > 0 || resultat.beskjeftigelse.verdi > 100) && !overtidsfag;
  let j = 0;
  const delresultater = s.grupper.map((g) => (fylte.some((x) => x.g.id === g.id) ? (resultat?.grupper[j++]?.beskjeftigelse.verdi ?? null) : null));
  const gruppenavn = fylte.map(
    (x, i) =>
      `${t('arbeidstid.felles.gruppe', { nr: s.grupper.indexOf(x.g) + 1 })}: ${fagnavn(x.g, indeks, `${t('arbeidstid.felles.manuellEtikett')} ${formaterTall(resultat?.grupper[i]?.arsramme.verdi ?? 0)}`, malform)}`,
  );

  const deler: Stolpedel[] = resultat
    ? [
        ...resultat.grupper.map((g, i) => ({ navn: t('arbeidstid.felles.gruppe', { nr: s.grupper.indexOf((fylte[i] as { g: Gruppetilstand }).g) + 1 }), prosent: vis(g.beskjeftigelse.verdi) })),
        ...s.funksjoner
          .map((f, i) => ({ navn: f.navn || t('arbeidstid.arbeidsplan.funksjonNr', { nr: i + 1 }), prosent: vis(prosenter[i] ?? 0), type: 'funksjon' as const }))
          .filter((d) => d.prosent > 0),
        ...(reduksjon > 0 ? [{ navn: t('arbeidstid.livsfase.redusert'), prosent: vis(reduksjon), type: 'funksjon' as const }] : []),
      ]
    : [];
  const diff = resultat?.differanse.verdi ?? 0;
  const iBalanse = Math.abs(diff) < 0.005;
  // Differansen vises som én rute, eller to når den er både variabel lønn (opp til hel stilling) og teknisk overtid.
  // Timene er årsrammetimer for et helt år, og timer i perioden for en periode (de er de samme på årsbasis).
  const medTimer = (prosent: number, timer: Operand | null | undefined) =>
    `${medEnhet(t, Math.abs(vis(prosent)), 'prosent')}${
      timer
        ? ` = ${iPeriode ? t('arbeidstid.arbeidsplan.timerIPerioden', { timer: tallTekst(Math.abs(timer.verdi)) }) : medEnhet(t, Math.abs(timer.verdi), 'arsrammetimer')}`
        : ''
    }`;
  const variabel = resultat?.variabel.verdi ?? 0;
  const overtid = resultat?.overtid.verdi ?? 0;
  const differanseruter: { type: 'balanse' | 'undertid' | 'variabel' | 'overtid'; tekst: string; tall?: string }[] = !resultat
    ? []
    : iBalanse
      ? [{ type: 'balanse', tekst: t('arbeidstid.resultat.iBalanse') }]
      : diff < 0
        ? [{ type: 'undertid', tekst: t('arbeidstid.resultat.tekniskUndertid'), tall: medTimer(diff, resultat.differanseTimer) }]
        : variabel > 0 && overtid > 0
          ? [
              { type: 'variabel', tekst: t('arbeidstid.resultat.variabelLonn'), tall: medTimer(variabel, resultat.variabelTimer) },
              { type: 'overtid', tekst: t('arbeidstid.resultat.tekniskOvertid'), tall: medTimer(overtid, resultat.overtidTimer) },
            ]
          : [
              {
                type: variabel > 0 ? 'variabel' : 'overtid',
                tekst: variabel > 0 ? t('arbeidstid.resultat.variabelLonn') : t('arbeidstid.resultat.tekniskOvertid'),
                tall: medTimer(diff, resultat.differanseTimer),
              },
            ];

  const hentVariant = (v: typeof s) => {
    reserverIder(v.grupper);
    reserverFunksjonsider(v.funksjoner);
    sett(v);
  };

  return (
    <Kalkulatorside
      id="arbeidsplan"
      resultat={
        <>
          {feil && <Feilmelding feil={feil} />}
          {resultat ? (
            <>
              <Advarsler advarsler={resultat.advarsler} />
              <Utregningskort
                tittel={iPeriode ? (paArsbasis ? t('arbeidstid.arbeidsplan.beskjeftigelseArsbasis') : t('arbeidstid.resultat.periodebeskjeftigelse')) : t('arbeidstid.resultat.samletBeskjeftigelse')}
                resultat={{ ...resultat.beskjeftigelse, verdi: vis(resultat.beskjeftigelse.verdi) }}
                trinn={resultat.trinn}
                sammendrag={false}
              >
                {iPeriode && (
                  <Bryter
                    legend={t('arbeidstid.arbeidsplan.visProsent')}
                    kompakt
                    verdi={paArsbasis ? 'arsbasis' : 'periode'}
                    valg={[
                      { verdi: 'periode', tekst: t('arbeidstid.arbeidsplan.iPerioden') },
                      { verdi: 'arsbasis', tekst: t('arbeidstid.arbeidsplan.paArsbasis') },
                    ]}
                    onEndring={(v) => sett({ ...s, arsbasis: v === 'arsbasis' })}
                  />
                )}
                <Stillingsmaaler
                  deler={deler}
                  grense={vis(resultat.stilling.verdi)}
                  hel={vis(100)}
                  beskrivelse={t('arbeidstid.grafikk.arbeidsplan', {
                    deler: deler.map((d) => `${d.navn} ${tallTekst(d.prosent)} %`).join(', '),
                    sum: tallTekst(vis(resultat.beskjeftigelse.verdi)),
                    grense: tallTekst(vis(resultat.stilling.verdi)),
                  })}
                />
                <Oversiktsliste
                  rader={[
                    { navn: t('arbeidstid.resultat.undervisning'), verdi: medEnhet(t, vis(resultat.undervisning.verdi), 'prosent') },
                    { navn: t('arbeidstid.resultat.funksjoner'), verdi: medEnhet(t, vis(resultat.funksjon.verdi), 'prosent') },
                    ...(resultat.reduksjon ? [{ navn: t('arbeidstid.livsfase.redusert'), verdi: medEnhet(t, vis(resultat.reduksjon.verdi), 'prosent') }] : []),
                    { navn: t('arbeidstid.resultat.stillingsprosent'), verdi: medEnhet(t, vis(resultat.stilling.verdi), 'prosent') },
                    // Den andre visningen står også, så begge tallene kan leses uten å bytte.
                    ...(iPeriode && nokkel
                      ? [
                          paArsbasis
                            ? { navn: t('arbeidstid.arbeidsplan.iPeriodenRad'), verdi: medEnhet(t, resultat.beskjeftigelse.verdi, 'prosent') }
                            : { navn: t('arbeidstid.periode.heleAret'), verdi: medEnhet(t, resultat.beskjeftigelse.verdi * nokkel.verdi, 'prosent') },
                        ]
                      : []),
                  ]}
                />
                {differanseruter.map((r) => (
                  <p key={r.type} class={`arbeidsplan-differanse${r.type === 'balanse' ? '' : ` ${r.type}`}`} data-differanse={r.type}>
                    <span>{r.tekst}</span>
                    {r.tall && <span class="tall">{r.tall}</span>}
                  </p>
                ))}
                {!iBalanse && fylte.length > 1 && (
                  <div class="felt felt-liten">
                    <label for={idTimer}>{t('arbeidstid.arbeidsplan.timerIFag')}</label>
                    <select
                      id={idTimer}
                      value={String(valgtIndeks)}
                      onChange={(e) => sett({ ...s, timerIGruppe: fylte[Number(e.currentTarget.value)]?.g.id ?? null })}
                    >
                      {gruppenavn.map((navn, i) => (
                        <option key={i} value={String(i)}>
                          {navn}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!iBalanse && fylte.length === 0 && <p class="felt-hjelp">{t('arbeidstid.arbeidsplan.ingenFag')}</p>}
                {!iBalanse && fylte.length > 1 && (
                  <>
                    <button type="button" class="lenkeknapp liten" aria-expanded={visHvertFag} onClick={() => settVisHvertFag(!visHvertFag)}>
                      <Ikon navn={visHvertFag ? 'opp' : 'ned'} class="ikon-liten" />
                      {t('arbeidstid.arbeidsplan.hvertFag')}
                    </button>
                    {visHvertFag && (
                      <div class="hjelp-tekst">
                        <p class="felt-hjelp">{diff < 0 ? t('arbeidstid.arbeidsplan.hvertFagMangler') : t('arbeidstid.arbeidsplan.hvertFagForMye')}</p>
                        <Oversiktsliste
                          rader={differanseIHvertFag(resultat).map((d, i) => ({
                            navn: t('arbeidstid.arbeidsplan.fagRad', { fag: gruppenavn[i] ?? '', arsramme: formaterTall(d.arsramme) }),
                            verdi: medEnhet(t, Math.abs(d.timer), 'arsrammetimer'),
                          }))}
                        />
                      </div>
                    )}
                  </>
                )}
                {!iPeriode && resultat.beskjeftigelse.verdi > 100 && (
                  <a class="lenke-pil" href={`#/arbeidstid/overtid?beskjeftigelse=${encodeURIComponent(String(Math.round(resultat.beskjeftigelse.verdi * 100) / 100))}`}>
                    {t('arbeidstid.arbeidsplan.overtidLenke', { prosent: tallTekst(resultat.beskjeftigelse.verdi) })}
                    <Ikon navn="hoyre" class="ikon-liten" />
                  </a>
                )}
              </Utregningskort>
            </>
          ) : (
            !feil && <ManglerInndata />
          )}
          {fordeling && (
            <>
              <Fordelingsvisning resultat={fordeling} {...(ukegrenser ? { uke: ukegrenser } : {})}>
                {ikkeFylt > 0 && <p class="liten dempet">{t('arbeidstid.arbeidsplan.ikkeFyltMerknad', { prosent: tallTekst(ikkeFylt) })}</p>}
                {iPeriode && dager !== null && (
                  <p class="liten dempet">
                    {t('arbeidstid.arbeidsplan.fordelingPeriode', { dager: tallTekst(dager), skolear: tallTekst(s.dagerSkolear ?? skolearDager) })}
                  </p>
                )}
                {utenUtvidelse > 0 && <p class="liten dempet">{t('arbeidstid.arbeidsplan.utenUtvidelseMerknad', { prosent: tallTekst(utenUtvidelse) })}</p>}
                {resultat && diff > 0.005 && <p class="liten dempet">{t('arbeidstid.arbeidsplan.diagramMerknad', { prosent: tallTekst(resultat.beskjeftigelse.verdi) })}</p>}
              </Fordelingsvisning>
            </>
          )}
          {lonn?.feil && <Feilmelding feil={lonn.feil} />}
          {s.visLonn && iPeriode && harStilling && !lonnPeriode && <p class="merknad merknad-liten">{t('arbeidstid.arbeidsplan.lonnPeriodeMangler')}</p>}
          {lonn?.resultat && (
            <Utregningskort tittel={iPeriode ? t('arbeidstid.arbeidsplan.lonnIPerioden') : t('arbeidstid.arbeidsplan.lonnIAlt')} resultat={lonn.resultat.samlet} trinn={lonn.resultat.trinn} sammendrag={false} fast={false}>
              <Advarsler advarsler={lonn.resultat.advarsler} />
              {(lonn.resultat.tillegg || lonn.resultat.variabel || lonn.resultat.overtid) && (
                <Belopsstolpe
                  deler={[
                    { navn: iPeriode ? t('arbeidstid.arbeidsplan.lonnStillingKort') : t('arbeidstid.arbeidsplan.arslonn'), verdi: lonn.resultat.arslonn.verdi },
                    ...(lonn.resultat.tillegg ? [{ navn: t('arbeidstid.arbeidsplan.tilleggNavn'), verdi: lonn.resultat.tillegg.verdi }] : []),
                    ...(lonn.resultat.variabel ? [{ navn: t('arbeidstid.resultat.variabelLonn'), verdi: lonn.resultat.variabel.verdi }] : []),
                    ...(lonn.resultat.overtid ? [{ navn: t('arbeidstid.resultat.overtidsbetaling'), verdi: lonn.resultat.overtid.verdi }] : []),
                  ]}
                />
              )}
              <Oversiktsliste
                rader={[
                  {
                    navn: iPeriode
                      ? t('arbeidstid.arbeidsplan.lonnStillingPeriode', { prosent: tallTekst(s.stilling ?? 0) })
                      : t('arbeidstid.arbeidsplan.arslonnStilling', { prosent: tallTekst(s.stilling ?? 0) }),
                    verdi: medEnhet(t, lonn.resultat.arslonn.verdi, 'kroner'),
                  },
                  // Tillegget er per år. I en periode får læreren perioden sin del.
                  ...tilleggene.map((x) => ({ navn: t('arbeidstid.arbeidsplan.tilleggRad', { funksjon: x.navn }), verdi: medEnhet(t, x.kr * (nokkel?.verdi ?? 1), 'kroner') })),
                  ...(lonn.resultat.variabel
                    ? [
                        {
                          navn: t('arbeidstid.arbeidsplan.variabelRad', { timer: tallTekst(lonn.resultat.variabelKalkulertTid?.verdi ?? 0) }),
                          verdi: medEnhet(t, lonn.resultat.variabel.verdi, 'kroner'),
                        },
                      ]
                    : []),
                  ...(lonn.resultat.overtid ? [{ navn: t('arbeidstid.resultat.overtidsbetaling'), verdi: medEnhet(t, lonn.resultat.overtid.verdi, 'kroner') }] : []),
                  { navn: t('arbeidstid.resultat.feriepengerTillegg'), verdi: medEnhet(t, lonn.resultat.feriepenger.verdi, 'kroner') },
                ]}
              />
              {lonnPeriode && (
                <p class="felt-hjelp">
                  {t('arbeidstid.arbeidsplan.lonnsandel', {
                    hele: tallTekst(lonnPeriode.heleManeder),
                    dager: tallTekst(lonnPeriode.arbeidsdager),
                    andel: tallTekst(lonnPeriode.andel.verdi * 100, 2),
                  })}
                </p>
              )}
              {overtidUtenFag && <p class="felt-hjelp">{t('arbeidstid.arbeidsplan.overtidUtenFag')}</p>}
              <p class="felt-hjelp">{iPeriode ? t('arbeidstid.arbeidsplan.lonnMerknadPeriode') : t('arbeidstid.arbeidsplan.lonnMerknad')}</p>
            </Utregningskort>
          )}
          <Varianter
            id="arbeidsplan"
            skjema={s}
            resultat={resultat ? { tittel: t('arbeidstid.resultat.samletBeskjeftigelse'), verdi: resultat.beskjeftigelse.verdi, enhet: 'prosent' } : null}
            onHent={hentVariant}
          />
        </>
      }
      etter={
        <>
          <h2 class="liten-overskrift">{t('arbeidstid.fordeling.brukAvTiden')}</h2>
          {fordelingsdeler.map((d) => (
            <BrukAvDel key={d} id={d} />
          ))}
        </>
      }
    >
      <p class="merknad merknad-liten">{t('arbeidstid.arbeidsplan.illustrasjon')}</p>
      <Bryter
        legend={t('arbeidstid.arbeidsplan.gjelder')}
        verdi={iPeriode ? 'periode' : 'aar'}
        valg={[
          { verdi: 'aar', tekst: t('arbeidstid.arbeidsplan.heleSkolearet') },
          { verdi: 'periode', tekst: t('arbeidstid.arbeidsplan.enPeriode') },
        ]}
        onEndring={(v) => settPeriode(v === 'periode')}
      />
      {iPeriode && (
        <>
          <div class="feltrad">
            <Tallfelt
              etikett={t('arbeidstid.periode.dager')}
              hjelpetekst={t('arbeidstid.periode.dagerHjelp')}
              verdi={dager}
              min={1}
              maks={400}
              onEndring={(v) => sett({ ...s, dager: v })}
            />
            <Tallfelt
              etikett={t('arbeidstid.periode.skolear')}
              hjelpetekst={t('arbeidstid.periode.skolearHjelp', { dager: formaterTall(skolearDager) })}
              plassholder={formaterTall(skolearDager)}
              verdi={s.dagerSkolear ?? null}
              min={1}
              maks={400}
              onEndring={(v) => sett({ ...s, dagerSkolear: v })}
            />
          </div>
          {dager !== null && dager > 0 && <Periodelinje dager={dager} skolear={s.dagerSkolear ?? skolearDager} />}
        </>
      )}
      <Tallfelt
        class="felt-kompakt"
        etikett={iPeriode ? t('arbeidstid.arbeidsplan.stillingPeriode') : t('arbeidstid.arbeidsplan.stilling')}
        enhet="%"
        verdi={s.stilling}
        min={0}
        maks={200}
        onEndring={(stilling) => sett({ ...s, stilling })}
      />
      <Grupper
        {...(iPeriode ? {} : { arstimer })}
        grupper={s.grupper}
        rader={rader}
        indeks={indeks}
        periode={iPeriode}
        standardUker={iPeriode ? ukerFraDager : uker}
        {...(iPeriode ? { ukerHjelp } : {})}
        delresultater={delresultater}
        onEndring={(grupper) => sett({ ...s, grupper })}
      />
      <Funksjoner
        funksjoner={s.funksjoner}
        prosenter={prosenter}
        satser={satser}
        visTillegg={s.visLonn}
        kontaktlaererTimer={kontaktlaererTimer}
        arsrammeFunksjon={arsrammeFunksjon}
        onEndring={(f) => sett({ ...s, funksjoner: f })}
      />
      <Livsfasekort
        livsfase={s.livsfase}
        prosent={s.livsfaseProsent}
        maks={livsfaseMaks}
        satser={livsfasesatser}
        arsverk60={arsverk60}
        feriedager60={feriedager60}
        onEndring={(livsfase, livsfaseProsent) => sett({ ...s, livsfase, livsfaseProsent })}
      />
      <Sammenleggbartkort
        nokkel="moter-og-lonn"
        tittel={t('arbeidstid.arbeidsplan.tillegg')}
        oppsummering={[
          ...(s.moter !== null ? [t('arbeidstid.arbeidsplan.moterOppsummering', { timer: tallTekst(s.moter) })] : []),
          ...(s.planlegging != null ? [t('arbeidstid.arbeidsplan.planleggingOppsummering', { timer: tallTekst(s.planlegging) })] : []),
          ...(s.visLonn ? [t('arbeidstid.arbeidsplan.lonnOppsummering')] : []),
        ].join(', ') || undefined}
      >
        <Tallfelt
          class="felt-kompakt"
          etikett={t('arbeidstid.fordeling.moter')}
          hjelpetekst={t('arbeidstid.arbeidsplan.moterHjelp')}
          verdi={s.moter}
          min={0}
          maks={37.5}
          onEndring={(moter) => sett({ ...s, moter })}
        />
        <Tallfelt
          class="felt-kompakt"
          etikett={t('arbeidstid.arbeidsplan.planlegging')}
          hjelpetekst={t('arbeidstid.arbeidsplan.planleggingHjelp', { timer: tallTekst(planleggingStandard) })}
          plassholder={formaterTall(planleggingStandard)}
          verdi={s.planlegging ?? null}
          min={0}
          maks={400}
          onEndring={(planlegging) => sett({ ...s, planlegging })}
        />
        <Vippe tekst={t('arbeidstid.arbeidsplan.visLonn')} pa={s.visLonn} onEndring={(visLonn) => sett({ ...s, visLonn })} />
        {s.visLonn && (
          <>
            <Lonnsskjema hent={hent} lonn={s.lonn} onEndring={(l) => sett({ ...s, lonn: l })} />
            {iPeriode && (
              <>
                <div class="feltrad">
                  <div class="felt">
                    <label for={`${idTimer}-fra`}>{t('arbeidstid.arbeidsplan.fraDato')}</label>
                    <input id={`${idTimer}-fra`} class="tekstfelt" type="date" value={s.fraDato ?? ''} onInput={(e) => sett({ ...s, fraDato: e.currentTarget.value })} />
                  </div>
                  <div class="felt">
                    <label for={`${idTimer}-til`}>{t('arbeidstid.arbeidsplan.tilDato')}</label>
                    <input id={`${idTimer}-til`} class="tekstfelt" type="date" value={s.tilDato ?? ''} onInput={(e) => sett({ ...s, tilDato: e.currentTarget.value })} />
                  </div>
                </div>
                <p class={datoFeil ? 'felt-feilmelding' : 'felt-hjelp'} role={datoFeil ? 'alert' : undefined}>
                  {datoFeil ? t('arbeidstid.arbeidsplan.datoFeil') : t('arbeidstid.arbeidsplan.datoHjelp')}
                </p>
              </>
            )}
            {over60 ? (
              <p class="felt-hjelp">{t('arbeidstid.livsfase.feriepenger60')}</p>
            ) : (
              <Vippe tekst={t('arbeidstid.overtid.over60')} pa={s.over60} onEndring={(v) => sett({ ...s, over60: v })} />
            )}
            <p class="felt-hjelp">{t('arbeidstid.arbeidsplan.tilleggHint')}</p>
          </>
        )}
      </Sammenleggbartkort>
    </Kalkulatorside>
  );
}
