// Arbeidsplan for én lærer: fag og funksjoner mot stillingsprosenten, med teknisk undertid eller overtid.
// Hovedkalkulatoren i modulen. Differansen kan regnes om til årsrammetimer i et valgt fag. Under står fordelingen
// av arbeidstiden (samme diagram som i Fordeling), og årslønnen i stillingen kan regnes ut ved behov.
// Arbeidsplanen kan gjelde hele skoleåret eller en periode (eier 30.09.2026). I en periode er fagene timer i perioden,
// og stillingen og funksjonene gjelder perioden. Prosentene kan vises for perioden eller på årsbasis
// (prosent × periodenøkkel). Timer og kroner er de samme i begge visningene.
import { useId, useMemo, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { LaerereBoks } from '../../statistikk/ssb.tsx';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall, type Malform, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { SideProps } from '../../typer.ts';
import { type Arbeidsplanskjema, beregnArbeidsplan, lesDeltArbeidsplan, nokkeltallForArbeidsplan, type NokkeltallId, nyttArbeidsplanskjema, tilleggssatser } from '../arbeidsplan.ts';
import { differanseIHvertFag, unikeFag, type FordelingsdelId, type Operand } from '../beregning/index.ts';
import { Fordelingsvisning } from '../komponenter/Fordelingsdiagram.tsx';
import { Belopsstolpe, Periodelinje, Stillingsmaaler, type Stolpedel } from '../komponenter/Grafikk.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, useArsrammer, useArstimer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Funksjoner, Livsfasekort, livsfaseregler, reserverFunksjonsider } from '../komponenter/Funksjoner.tsx';
import { Lonnsskjema } from '../komponenter/Lonnsskjema.tsx';
import { Innholdstekst, useArbeidstidElement } from '../komponenter/Metode.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Skjemadel } from '../komponenter/Skjemadel.tsx';
import { Bryter, type Fagindeks, type Gruppetilstand, Grupper, gruppenavn, radTekst, reserverIder, useFagindeks, Vippe } from '../komponenter/Skjema.tsx';
import { medEnhet, tallTekst, Utregningskort } from '../komponenter/Utregning.tsx';
import { DeltMerknad, DELT_PARAMETER, type Sammenligning, Sammenligningsvisning, useDeltVariant, Varianter } from '../komponenter/Varianter.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

const fordelingsdeler: FordelingsdelId[] = ['undervisning', 'motetid', 'annen_planfestet', 'planleggingsdager', 'funksjonstid', 'selvdisponert'];

/** Forklaring av hva en del av arbeidstiden brukes til (innhold i content/arbeidstid). */
function BrukAvDel({ id }: { id: FordelingsdelId }) {
  const { t } = useTekst();
  const element = useArbeidstidElement(`bruk-${id.replace('_', '-')}`);
  return (
    <Forklaring tittel={t(`arbeidstid.fordeling.deler.${id}` as Tekstnokkel)}>
      {element ? <Innholdstekst element={element} iKort /> : <p class="dempet">{element === undefined ? t('app.lasterInn') : t('arbeidstid.metode.ikkeFunnet')}</p>}
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

/** Adressen til Arbeidsplan, også i delte lenker. */
const STI = '/arbeidstid/arbeidsplan';

/** Navnet på et nøkkeltall i sammenligningen av to varianter. */
function nokkeltallNavn(t: ReturnType<typeof useTekst>['t'], id: NokkeltallId, iPeriode: boolean): string {
  if (id.startsWith('del_')) return t(`arbeidstid.fordeling.deler.${id.slice(4)}` as Tekstnokkel);
  if (id === 'arsverk') return t('arbeidstid.fordeling.sum');
  const navn: Record<Exclude<NokkeltallId, `del_${string}` | 'arsverk'>, Tekstnokkel> = {
    stilling: 'arbeidstid.resultat.stillingsprosent',
    undervisning: 'arbeidstid.resultat.undervisning',
    funksjoner: 'arbeidstid.resultat.funksjoner',
    reduksjon: 'arbeidstid.livsfase.redusert',
    beskjeftigelse: 'arbeidstid.resultat.samletBeskjeftigelse',
    differanse: 'arbeidstid.arbeidsplan.sammenligning.differanse',
    planfestet: 'arbeidstid.fordeling.planfestetIAlt',
    lonn: iPeriode ? 'arbeidstid.arbeidsplan.lonnIPerioden' : 'arbeidstid.arbeidsplan.lonnIAlt',
  };
  return t(navn[id as Exclude<NokkeltallId, `del_${string}` | 'arsverk'>]);
}

export default function Arbeidsplan({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const arstimer = useArstimer(hent);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const idTimer = useId();
  const [visHvertFag, settVisHvertFag] = useState(false);
  const [visSammenligning, settVisSammenligning] = useState(false);
  const [s, sett, endre] = useSkjematilstand('arbeidsplan', nyttArbeidsplanskjema, (lagret) => {
    reserverIder(lagret.grupper);
    reserverFunksjonsider(lagret.funksjoner);
  });

  const b = beregnArbeidsplan(hent, rader, s);
  const { iPeriode, nokkel, fylte, valgtIndeks, prosenter, reduksjon, over60, resultat, feil, utenUtvidelse, fordeling, lonnPeriode, datoFeil, lonn, overtidUtenFag } = b;
  const skolearDager = useRegeltall(hent, 'sfs2213.skolear_dager') ?? 0;
  const dagerPerUke = useRegeltall(hent, 'sfs2213.arbeidsdager_per_uke');
  const dager = s.dager ?? null;
  // Uker i perioden for økter per uke: dagene i perioden ÷ skoledager per uke, med mindre brukeren skriver inn antallet.
  const ukerFraDager = dager !== null && dager > 0 && dagerPerUke ? dager / dagerPerUke : 0;
  const ukerHjelp =
    ukerFraDager > 0
      ? t('arbeidstid.periode.ukerFraDager', { uker: formaterTall(ukerFraDager, 1), dager: formaterTall(dager ?? 0), perUke: formaterTall(dagerPerUke ?? 0) })
      : t('arbeidstid.periode.ukerFyllDager');
  // Årstimer fylt inn fra Grep gjelder et helt år. De tømmes når arbeidsplanen gjøres om til en periode.
  const settPeriode = (pa: boolean) =>
    sett((gammel) => ({ ...gammel, periode: pa, grupper: pa ? gammel.grupper.map((g) => (g.arstimerAuto ? { ...g, arstimer: null, arstimerAuto: false } : g)) : gammel.grupper }));
  const livsfasesatser = {
    nyutdannet: useRegeltall(hent, livsfaseregler.nyutdannet),
    fra57: useRegeltall(hent, livsfaseregler.fra57),
    fra60: useRegeltall(hent, livsfaseregler.fra60),
  };
  const livsfaseMaks = b.livsfaseMaks;
  // Prosentene vises i perioden, eller på årsbasis (× periodenøkkelen) når brukeren velger det.
  const paArsbasis = iPeriode && s.arsbasis === true && nokkel !== null;
  const vis = (prosent: number) => (paArsbasis && nokkel ? prosent * nokkel.verdi : prosent);
  const harStilling = b.harStilling;
  const maksUke = useRegeltall(hent, 'sfs2213.planfestet_maks_uke');
  const maksDag = useRegeltall(hent, 'sfs2213.planfestet_maks_dag');
  // Timer på planleggingsdager for en lærer i hel stilling: 6 dager × 7,5 timer (samme tall for alle, som i InSchool).
  const planleggingStandard = (useRegeltall(hent, 'sfs2213.arbeidsaar_tillegg_dager') ?? 0) * (useRegeltall(hent, 'sfs2213.timer_per_dag') ?? 0);
  const ukegrenser = maksUke !== null && maksDag !== null && dagerPerUke !== null ? { maksUke, maksDag, dagerPerUke } : null;
  const satser = useMemo(() => tilleggssatser(hent), [hent]);
  const kontaktlaererTimer = useRegeltall(hent, 'sfs2213.kontaktlaerer_reduksjon');
  const arsrammeFunksjon = useRegeltall(hent, 'sfs2213.arsramme_funksjon');
  const arsverk60 = useRegeltall(hent, 'sfs2213.arsverk_timer_60_ar');
  const arsverk = useRegeltall(hent, 'sfs2213.arsverk_timer');
  const timerPerDag = useRegeltall(hent, 'sfs2213.timer_per_dag');
  // Fra 60 år er årsverket kortere. Forskjellen er arbeidsdager med ekstra ferie (punkt 4, eier 30.09.2026).
  const feriedager60 = arsverk !== null && arsverk60 !== null && timerPerDag ? (arsverk - arsverk60) / timerPerDag : null;
  const hentVariant = (v: Arbeidsplanskjema) => {
    reserverIder(v.grupper);
    reserverFunksjonsider(v.funksjoner);
    sett(v);
  };
  // En delt lenke (#/arbeidstid/arbeidsplan?del=…) fyller ut skjemaet. Merknaden øverst sier fra.
  const [delt, settDelt] = useDeltVariant(STI, sporring.get(DELT_PARAMETER), lesDeltArbeidsplan, hentVariant);
  // Sammenligning av to varianter: nøkkeltallene regnes ut på samme måte som på siden.
  const sammenlign = (skjema: Arbeidsplanskjema): Sammenligning => {
    const fullt = { ...nyttArbeidsplanskjema(), ...skjema };
    const x = beregnArbeidsplan(hent, rader, fullt);
    // Enheten står i gruppeoverskriften, så tallene i tabellen kan stå uten enhet.
    const grupper = {
      stillingen: t('arbeidstid.arbeidsplan.sammenligning.stillingen'),
      arbeidstid: x.iPeriode ? t('arbeidstid.arbeidsplan.sammenligning.arbeidstidPeriode') : t('arbeidstid.arbeidsplan.sammenligning.arbeidstid'),
      lonn: t('arbeidstid.arbeidsplan.sammenligning.lonn'),
    };
    return {
      tall: nokkeltallForArbeidsplan(x, fullt).map((n) => ({
        id: n.id,
        verdi: n.verdi,
        navn: nokkeltallNavn(t, n.id, x.iPeriode),
        gruppe: grupper[n.gruppe],
        ...(n.farge ? { farge: n.farge } : {}),
        ...(n.valgfri ? { valgfri: true } : {}),
        ...(n.sum ? { sum: true } : {}),
        // Kort navn på smale skjermer, så raden får plass på to linjer.
        ...(n.id === 'del_funksjonstid' ? { kortNavn: t('arbeidstid.arbeidsplan.sammenligning.funksjonerKort') } : {}),
        // Timer med én desimal, som i fordelingstabellen, og hele kroner.
        desimaler: n.enhet === 'timer' ? 1 : n.enhet === 'kroner' ? 0 : 2,
      })),
      merknad: x.iPeriode ? t('arbeidstid.arbeidsplan.sammenligning.periode') : null,
    };
  };
  const tilleggene = b.tilleggene.map(({ i, kr }) => ({ navn: s.funksjoner[i]?.navn.trim() || t('arbeidstid.arbeidsplan.funksjonNr', { nr: i + 1 }), kr }));
  let j = 0;
  const delresultater = s.grupper.map((g) => (fylte.some((x) => x.g.id === g.id) ? (resultat?.grupper[j++]?.beskjeftigelse.verdi ?? null) : null));
  // Kortnavnene på fagene i stolpen og utregningen (eier 09.10.2026), for fagene som er med i beregningen.
  const alleNavn = gruppenavn(s.grupper, indeks, malform, t);
  const navnIBeregningen = fylte.map((x) => alleNavn[s.grupper.indexOf(x.g)] ?? '');
  const fagIGruppe = fylte.map((x, i) => fagnavn(x.g, indeks, `${t('arbeidstid.felles.manuellEtikett')} ${formaterTall(resultat?.grupper[i]?.arsramme.verdi ?? 0)}`, malform));
  // Samme fag lagt til i flere grupper gir samme omregning, så hvert fag vises én gang i valget og listen.
  const hvertFag = resultat ? unikeFag(differanseIHvertFag(resultat).map((d, i) => ({ ...d, fag: fagIGruppe[i] ?? '' }))) : [];
  const valgtFag = Math.max(0, hvertFag.findIndex((f) => f.indekser.includes(valgtIndeks)));

  const deler: Stolpedel[] = resultat
    ? [
        ...resultat.grupper.map((g, i) => ({ navn: navnIBeregningen[i] ?? '', prosent: vis(g.beskjeftigelse.verdi) })),
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

  return (
    <Kalkulatorside
      id="arbeidsplan"
      // Lærerne i fylket fra SSB (eier 08.10.2026, avgjørelse 090 og 091).
      tall={<LaerereBoks fylke={innstillinger.fylke} />}
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
                gruppenavn={navnIBeregningen}
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
                    onEndring={(v) => endre({ arsbasis: v === 'arsbasis' })}
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
                {!iBalanse && hvertFag.length > 1 && (
                  <div class="felt felt-liten">
                    <label for={idTimer}>{t('arbeidstid.arbeidsplan.timerIFag')}</label>
                    <select
                      id={idTimer}
                      value={String(valgtFag)}
                      onChange={(e) => endre({ timerIGruppe: fylte[hvertFag[Number(e.currentTarget.value)]?.indekser[0] ?? 0]?.g.id ?? null })}
                    >
                      {hvertFag.map((f, i) => (
                        <option key={i} value={String(i)}>
                          {f.fag}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!iBalanse && fylte.length === 0 && <p class="felt-hjelp">{t('arbeidstid.arbeidsplan.ingenFag')}</p>}
                {!iBalanse && hvertFag.length > 1 && (
                  <>
                    <button type="button" class="lenkeknapp liten" aria-expanded={visHvertFag} onClick={() => settVisHvertFag(!visHvertFag)}>
                      <Ikon navn={visHvertFag ? 'opp' : 'ned'} class="ikon-liten" />
                      {t('arbeidstid.arbeidsplan.hvertFag')}
                    </button>
                    {visHvertFag && (
                      <div class="hjelp-tekst">
                        <p class="felt-hjelp">{diff < 0 ? t('arbeidstid.arbeidsplan.hvertFagMangler') : t('arbeidstid.arbeidsplan.hvertFagForMye')}</p>
                        <Oversiktsliste
                          rader={hvertFag.map((d) => ({
                            navn: t('arbeidstid.arbeidsplan.fagRad', { fag: d.fag, arsramme: formaterTall(d.arsramme) }),
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
            !feil && <ManglerInndata tittel={iPeriode ? t('arbeidstid.resultat.periodebeskjeftigelse') : t('arbeidstid.resultat.samletBeskjeftigelse')} />
          )}
          {fordeling && (
            <>
              <Fordelingsvisning resultat={fordeling} {...(ukegrenser ? { uke: ukegrenser } : {})}>
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
                    { id: 'lonn', navn: iPeriode ? t('arbeidstid.arbeidsplan.lonnStillingKort') : t('arbeidstid.arbeidsplan.arslonn'), verdi: lonn.resultat.arslonn.verdi },
                    ...(lonn.resultat.tillegg ? [{ id: 'tillegg' as const, navn: t('arbeidstid.arbeidsplan.tilleggNavn'), verdi: lonn.resultat.tillegg.verdi }] : []),
                    ...(lonn.resultat.variabel ? [{ id: 'variabel' as const, navn: t('arbeidstid.resultat.variabelLonn'), verdi: lonn.resultat.variabel.verdi }] : []),
                    ...(lonn.resultat.overtid ? [{ id: 'overtid' as const, navn: t('arbeidstid.resultat.overtidsbetaling'), verdi: lonn.resultat.overtid.verdi }] : []),
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
            onSammenlign={() => settVisSammenligning(true)}
            sti={STI}
          />
        </>
      }
      etter={
        <>
          {/* Sammenligningen står i full bredde under skjemaet og resultatet. */}
          <Sammenligningsvisning id="arbeidsplan" skjema={s} harResultat={resultat !== null} sammenlign={sammenlign} aapen={visSammenligning} onLukk={() => settVisSammenligning(false)} />
          <h2 class="liten-overskrift">{t('arbeidstid.fordeling.brukAvTiden')}</h2>
          {fordelingsdeler.map((d) => (
            <BrukAvDel key={d} id={d} />
          ))}
        </>
      }
    >
      <DeltMerknad
        id="arbeidsplan"
        delt={delt}
        settDelt={settDelt}
        skjema={s}
        resultat={resultat ? { tittel: t('arbeidstid.resultat.samletBeskjeftigelse'), verdi: resultat.beskjeftigelse.verdi, enhet: 'prosent' } : null}
      />
      <p class="merknad merknad-liten">{t('arbeidstid.arbeidsplan.illustrasjon')}</p>
      {/* Skjemaet i fem deler (avgjørelse 033): stilling, undervisning, funksjoner, tid på skolen og lønn. */}
      <Skjemadel del="stilling" tittel={t('arbeidstid.skjema.stilling')} sum={s.stilling !== null ? `${tallTekst(s.stilling)} %` : null}>
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
                onEndring={(v) => endre({ dager: v })}
              />
              <Tallfelt
                etikett={t('arbeidstid.periode.skolear')}
                hjelpetekst={t('arbeidstid.periode.skolearHjelp', { dager: formaterTall(skolearDager) })}
                plassholder={formaterTall(skolearDager)}
                verdi={s.dagerSkolear ?? null}
                min={1}
                maks={400}
                onEndring={(v) => endre({ dagerSkolear: v })}
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
          onEndring={(stilling) => endre({ stilling })}
        />
        <Livsfasekort
          livsfase={s.livsfase}
          prosent={s.livsfaseProsent}
          maks={livsfaseMaks}
          satser={livsfasesatser}
          arsverk60={arsverk60}
          feriedager60={feriedager60}
          onEndring={(livsfase, livsfaseProsent) => endre({ livsfase, livsfaseProsent })}
        />
      </Skjemadel>
      <Skjemadel del="undervisning" tittel={t('arbeidstid.skjema.undervisning')} sum={resultat ? `${tallTekst(vis(resultat.undervisning.verdi))} %` : null}>
        <Grupper
          {...(iPeriode ? {} : { arstimer })}
          grupper={s.grupper}
          rader={rader}
          indeks={indeks}
          periode={iPeriode}
          standardUker={iPeriode ? ukerFraDager : uker}
          {...(iPeriode ? { ukerHjelp } : {})}
          delresultater={delresultater}
          onEndring={(oppdater) => sett((gammel) => ({ ...gammel, grupper: oppdater(gammel.grupper) }))}
        />
      </Skjemadel>
      <Skjemadel
        del="funksjoner"
        tittel={t('arbeidstid.arbeidsplan.funksjoner')}
        sum={resultat && resultat.funksjon.verdi > 0 ? `${tallTekst(vis(resultat.funksjon.verdi))} %` : null}
        oppsummering={
          s.funksjoner.length === 0
            ? t('arbeidstid.arbeidsplan.funksjonerIngen')
            : t('arbeidstid.arbeidsplan.funksjonerOppsummering', { antall: s.funksjoner.length, prosent: tallTekst(prosenter.reduce((sum, p) => sum + p, 0)) })
        }
      >
        <Funksjoner
          funksjoner={s.funksjoner}
          prosenter={prosenter}
          satser={satser}
          visTillegg={s.visLonn}
          kontaktlaererTimer={kontaktlaererTimer}
          arsrammeFunksjon={arsrammeFunksjon}
          onEndring={(oppdater) => sett((gammel) => ({ ...gammel, funksjoner: oppdater(gammel.funksjoner) }))}
        />
      </Skjemadel>
      <Skjemadel del="tid" tittel={t('arbeidstid.skjema.tid')}>
        <Tallfelt
          class="felt-kompakt"
          etikett={t('arbeidstid.fordeling.moter')}
          hjelpetekst={t('arbeidstid.arbeidsplan.moterHjelp')}
          verdi={s.moter}
          min={0}
          maks={37.5}
          onEndring={(moter) => endre({ moter })}
        />
        <Tallfelt
          class="felt-kompakt"
          etikett={t('arbeidstid.arbeidsplan.planlegging')}
          hjelpetekst={t('arbeidstid.arbeidsplan.planleggingHjelp', { timer: tallTekst(planleggingStandard) })}
          plassholder={formaterTall(planleggingStandard)}
          verdi={s.planlegging ?? null}
          min={0}
          maks={400}
          onEndring={(planlegging) => endre({ planlegging })}
        />
      </Skjemadel>
      {/* Lønn har eget kort. Bryteren står i overskriften, og resten vises når den er slått på (eier 01.10.2026). */}
      <Skjemadel del="lonn" tittel={t('arbeidstid.skjema.lonn')} hoyre={<Vippe tekst={t('arbeidstid.arbeidsplan.visLonn')} pa={s.visLonn} onEndring={(visLonn) => endre({ visLonn })} />}>
        {s.visLonn && (
          <>
            <Lonnsskjema hent={hent} lonn={s.lonn} onEndring={(l) => endre({ lonn: l })} />
            {iPeriode && (
              <>
                <div class="feltrad">
                  <div class="felt">
                    <label for={`${idTimer}-fra`}>{t('arbeidstid.arbeidsplan.fraDato')}</label>
                    <input id={`${idTimer}-fra`} class="tekstfelt" type="date" value={s.fraDato ?? ''} onInput={(e) => endre({ fraDato: e.currentTarget.value })} />
                  </div>
                  <div class="felt">
                    <label for={`${idTimer}-til`}>{t('arbeidstid.arbeidsplan.tilDato')}</label>
                    <input id={`${idTimer}-til`} class="tekstfelt" type="date" value={s.tilDato ?? ''} onInput={(e) => endre({ tilDato: e.currentTarget.value })} />
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
              <Vippe tekst={t('arbeidstid.overtid.over60')} pa={s.over60} onEndring={(v) => endre({ over60: v })} />
            )}
            <p class="felt-hjelp">{t('arbeidstid.arbeidsplan.tilleggHint')}</p>
          </>
        )}
      </Skjemadel>
    </Kalkulatorside>
  );
}
