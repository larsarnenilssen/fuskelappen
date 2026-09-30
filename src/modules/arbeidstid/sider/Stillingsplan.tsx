// Arbeidsplan for én lærer: fag og funksjoner mot stillingsprosenten, med teknisk undertid eller overtid.
// Hovedkalkulatoren i modulen. Differansen kan regnes om til årsrammetimer i et valgt fag. Under står fordelingen
// av arbeidstiden (samme diagram som i Fordeling), og årslønnen i stillingen kan regnes ut ved behov.
// Id og adresse er fortsatt «stillingsplan», så favoritter, lenker og lagrede varianter virker (avgjørelse 012).
import { useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { beregnFordeling, beregnLonn, beregnStillingsplan, differanseIHvertFag, type Gruppe } from '../beregning/index.ts';
import { Fordelingsvisning } from '../komponenter/Fordelingsdiagram.tsx';
import { Belopsstolpe, Stillingsmaaler, type Stolpedel } from '../komponenter/Grafikk.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useArstimer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Lonnsskjema, nyLonnstilstand, tilLonnsgrunnlag } from '../komponenter/Lonnsskjema.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { type Fagindeks, type Gruppetilstand, Grupper, nyGruppe, radTekst, reserverIder, tilGruppe, useFagindeks, Vippe } from '../komponenter/Skjema.tsx';
import { medEnhet, tallTekst, Utregningskort } from '../komponenter/Utregning.tsx';
import { Varianter } from '../komponenter/Varianter.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

interface Funksjonstilstand {
  id: number;
  navn: string;
  prosent: number | null;
  /** Om funksjonen utvider planfestet tid (punkt 5.3). Mangler i skjema lagret før 0.5.0, og regnes da som på. */
  utvider?: boolean;
  /** Om funksjonen gir tillegg i lønnen (godtgjøring, SFS 2213 punkt 9.1). */
  tillegg?: boolean;
  /** Tillegget i kroner per år, eller null når beløpet fra SFS 2213 skal brukes. */
  tilleggKr?: number | null;
}

let nesteFunksjon = 1;
const nyFunksjon = (): Funksjonstilstand => ({ id: nesteFunksjon++, navn: '', prosent: 0, utvider: true });
const utvider = (f: Funksjonstilstand) => f.utvider !== false;

/** Funksjoner med fast minstegodtgjøring i SFS 2213 punkt 9.1, kjent igjen på navnet brukeren har gitt funksjonen. */
const godtgjorteFunksjoner = [
  { nokkel: 'sfs2213.godtgjoring_kontaktlaerer', navn: /kontakt/i, hjelp: 'arbeidstid.stillingsplan.tilleggKontaktlaerer' },
  { nokkel: 'sfs2213.godtgjoring_radgiver', navn: /r[åa]dgiv|sosiall[æa]/i, hjelp: 'arbeidstid.stillingsplan.tilleggRadgiver' },
] as const;

/** Forslag til tillegg for en funksjon: beløpet fra SFS 2213 og en forklaring av hvor det kommer fra. */
type Tilleggsforslag = (f: Funksjonstilstand) => { verdi: number; hjelp: string };

/** Kort navn på faget i en gruppe, f.eks. «Engelsk · Studiespesialisering Vg1». */
function fagnavn(g: Gruppetilstand, indeks: Fagindeks, reserve: string): string {
  const plass = g.arsrammer[0];
  if (plass?.valg && plass.valg !== 'manuell') return radTekst(indeks, plass.valg)?.navn ?? reserve;
  return reserve;
}

function Funksjoner({
  funksjoner,
  tillegg,
  onEndring,
}: {
  funksjoner: Funksjonstilstand[];
  /** Forslag til tillegg når lønnen regnes ut, ellers null (da vises ikke tilleggene). */
  tillegg: Tilleggsforslag | null;
  onEndring: (f: Funksjonstilstand[]) => void;
}) {
  const { t } = useTekst();
  const id = useId();
  const sett = (fid: number, endring: Partial<Funksjonstilstand>) => onEndring(funksjoner.map((f) => (f.id === fid ? { ...f, ...endring } : f)));
  return (
    <fieldset class="fagkort">
      <legend class="fagkort-tittel">{t('arbeidstid.stillingsplan.funksjoner')}</legend>
      {funksjoner.map((f, i) => (
        <div key={f.id} class="inndatarad funksjonsrad">
          <label class="skjult-visuelt" for={`${id}-${f.id}`}>
            {`${t('arbeidstid.stillingsplan.funksjonNr', { nr: i + 1 })}: ${t('arbeidstid.stillingsplan.funksjonNavn')}`}
          </label>
          <input
            id={`${id}-${f.id}`}
            class="tekstfelt"
            type="text"
            autoComplete="off"
            placeholder={t('arbeidstid.stillingsplan.funksjonNavnPlassholder')}
            value={f.navn}
            onInput={(e) => sett(f.id, { navn: e.currentTarget.value })}
          />
          <Tallfelt
            class="felt-kompakt"
            skjultEtikett
            etikett={`${t('arbeidstid.stillingsplan.funksjonNr', { nr: i + 1 })}: ${t('arbeidstid.stillingsplan.funksjonProsent')}`}
            enhet="%"
            verdi={f.prosent}
            min={0}
            maks={100}
            onEndring={(prosent) => sett(f.id, { prosent })}
          />
          <button
            type="button"
            class="ikonknapp"
            aria-label={t('arbeidstid.stillingsplan.fjernFunksjon', { nr: i + 1 })}
            onClick={() => onEndring(funksjoner.filter((x) => x.id !== f.id))}
          >
            <Ikon navn="lukk" class="ikon-liten" />
          </button>
          <Vippe
            tekst={t('arbeidstid.stillingsplan.utvider')}
            skjultForan={`${t('arbeidstid.stillingsplan.funksjonNr', { nr: i + 1 })}:`}
            pa={utvider(f)}
            onEndring={(pa) => sett(f.id, { utvider: pa })}
          />
          {tillegg && (
            <Vippe
              tekst={t('arbeidstid.stillingsplan.tilleggVippe')}
              skjultForan={`${t('arbeidstid.stillingsplan.funksjonNr', { nr: i + 1 })}:`}
              pa={f.tillegg === true}
              onEndring={(pa) => sett(f.id, { tillegg: pa })}
            />
          )}
          {tillegg && f.tillegg && (
            <Tallfelt
              class="felt-kompakt funksjon-tillegg"
              etikett={t('arbeidstid.stillingsplan.tilleggFelt', { nr: i + 1 })}
              hjelpetekst={f.tilleggKr == null ? tillegg(f).hjelp : t('arbeidstid.stillingsplan.tilleggEget')}
              enhet="kr"
              verdi={f.tilleggKr ?? tillegg(f).verdi}
              min={0}
              maks={1000000}
              onEndring={(tilleggKr) => sett(f.id, { tilleggKr })}
            />
          )}
        </div>
      ))}
      <div class="med-hjelp">
        <button type="button" class="lenkeknapp liten" onClick={() => onEndring([...funksjoner, nyFunksjon()])}>
          <Ikon navn="pluss" class="ikon-liten" />
          {t('arbeidstid.stillingsplan.leggTilFunksjon')}
        </button>
        <Hjelp tema={t('arbeidstid.stillingsplan.funksjoner')}>
          <p class="felt-hjelp">{t('arbeidstid.stillingsplan.funksjonerHjelp')}</p>
        </Hjelp>
      </div>
    </fieldset>
  );
}

export default function Stillingsplan() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const arstimer = useArstimer(hent);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const idTimer = useId();
  const [visHvertFag, settVisHvertFag] = useState(false);
  const [s, sett] = useSkjematilstand(
    'stillingsplan',
    () => ({
      stilling: 100 as number | null,
      grupper: [nyGruppe()],
      funksjoner: [nyFunksjon()],
      timerIGruppe: null as number | null,
      moter: null as number | null,
      visLonn: false,
      lonn: nyLonnstilstand(),
      over60: false,
    }),
    (lagret) => {
      reserverIder(lagret.grupper);
      for (const f of lagret.funksjoner) nesteFunksjon = Math.max(nesteFunksjon, f.id + 1);
    },
  );

  // Bare utfylte grupper regnes med. Hver har med seg tilstanden, så navn og valg følger riktig gruppe.
  const fylte = s.grupper.map((g) => ({ g, inn: tilGruppe(g, rader, false) })).filter((x): x is { g: Gruppetilstand; inn: Gruppe } => x.inn !== null);
  const valgtIndeks = Math.max(0, fylte.findIndex((x) => x.g.id === s.timerIGruppe));
  const funksjoner = s.funksjoner.filter((f) => f.prosent !== null).map((f) => ({ navn: f.navn, prosent: f.prosent ?? 0 }));
  const { resultat, feil } = prov(() =>
    s.stilling !== null && s.stilling > 0 && (fylte.length > 0 || funksjoner.some((f) => f.prosent > 0))
      ? beregnStillingsplan(hent, { stilling: s.stilling, grupper: fylte.map((x) => x.inn), funksjoner, timerIGruppe: fylte.length > 0 ? valgtIndeks : null })
      : null,
  );
  // Fordelingen av arbeidstiden i stillingen vises alltid, også før noe er lagt inn: fagene, funksjonene og
  // den delen av stillingen som ikke er fylt ennå. Funksjonene som ikke utvider planfestet tid, fordeles som undervisningen.
  const sumFunksjoner = (utvid: boolean) => s.funksjoner.filter((f) => utvider(f) === utvid).reduce((sum, f) => sum + (f.prosent ?? 0), 0);
  const utenUtvidelse = sumFunksjoner(false);
  const harStilling = s.stilling !== null && s.stilling > 0;
  const fordeling =
    resultat || harStilling
    ? prov(() =>
        beregnFordeling(hent, {
          undervisning: { type: 'fag', grupper: fylte.map((x) => x.inn), ...(harStilling ? { stilling: s.stilling ?? 0 } : {}) },
          funksjon: { type: 'prosent', prosent: sumFunksjoner(true) },
          funksjonUtenUtvidelse: utenUtvidelse,
          moterPerUke: s.moter ?? 0,
        }),
      ).resultat
    : null;
  const ikkeFylt = fordeling?.trinn.find((tr) => tr.id === 'ikke_fordelt')?.resultat.verdi ?? 0;
  // Tillegg per funksjon. Forslaget er minstegodtgjøringen i SFS 2213 punkt 9.1 for funksjonen som er kjent igjen på
  // navnet, eller for kontaktlærer, som er den vanligste, når navnet ikke kjennes igjen. Brukeren kan skrive inn et annet beløp.
  const kontaktlaerer = useRegeltall(hent, 'sfs2213.godtgjoring_kontaktlaerer');
  const radgiver = useRegeltall(hent, 'sfs2213.godtgjoring_radgiver');
  const satser: Record<string, number | null> = { 'sfs2213.godtgjoring_kontaktlaerer': kontaktlaerer, 'sfs2213.godtgjoring_radgiver': radgiver };
  const tilleggsforslag: Tilleggsforslag = (f) => {
    const kjent = godtgjorteFunksjoner.find((g) => g.navn.test(f.navn));
    const verdi = satser[(kjent ?? godtgjorteFunksjoner[0]).nokkel] ?? 0;
    return { verdi, hjelp: t(kjent ? kjent.hjelp : 'arbeidstid.stillingsplan.tilleggUkjent', { kr: tallTekst(verdi) }) };
  };
  const tilleggene = s.funksjoner
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => f.tillegg === true)
    .map(({ f, i }) => ({ navn: f.navn.trim() || t('arbeidstid.stillingsplan.funksjonNr', { nr: i + 1 }), kr: f.tilleggKr ?? tilleggsforslag(f).verdi }));
  const tillegg = tilleggene.length > 0 ? tilleggene.reduce((sum, x) => sum + x.kr, 0) : null;

  const lonnsgrunnlag = s.visLonn ? tilLonnsgrunnlag(s.lonn) : null;
  // Overtidsbetaling regnes som i overtidskalkulatoren, med faget som er valgt for årsrammetimer.
  const overtidsfag = fylte[valgtIndeks]?.inn;
  const lonn =
    lonnsgrunnlag && harStilling
      ? prov(() =>
          beregnLonn(hent, {
            lonn: lonnsgrunnlag,
            stilling: s.stilling ?? 0,
            tillegg,
            overtid:
              resultat && overtidsfag ? { beskjeftigelse: resultat.beskjeftigelse.verdi, arsrammer: overtidsfag.arsrammer, elever: overtidsfag.elever } : null,
            over60: s.over60,
          }),
        )
      : null;
  const overtidUtenFag = s.visLonn && resultat !== null && resultat.beskjeftigelse.verdi > 100 && !overtidsfag;
  let j = 0;
  const delresultater = s.grupper.map((g) => (fylte.some((x) => x.g.id === g.id) ? (resultat?.grupper[j++]?.beskjeftigelse.verdi ?? null) : null));
  const gruppenavn = fylte.map(
    (x, i) =>
      `${t('arbeidstid.felles.gruppe', { nr: s.grupper.indexOf(x.g) + 1 })}: ${fagnavn(x.g, indeks, `${t('arbeidstid.felles.manuellEtikett')} ${formaterTall(resultat?.grupper[i]?.arsramme.verdi ?? 0)}`)}`,
  );

  const deler: Stolpedel[] = resultat
    ? [
        ...resultat.grupper.map((g, i) => ({ navn: t('arbeidstid.felles.gruppe', { nr: s.grupper.indexOf((fylte[i] as { g: Gruppetilstand }).g) + 1 }), prosent: g.beskjeftigelse.verdi })),
        ...funksjoner.filter((f) => f.prosent > 0).map((f, i) => ({ navn: f.navn || t('arbeidstid.stillingsplan.funksjonNr', { nr: i + 1 }), prosent: f.prosent, type: 'funksjon' as const })),
      ]
    : [];
  const diff = resultat?.differanse.verdi ?? 0;
  const iBalanse = Math.abs(diff) < 0.005;
  const diffTekst = iBalanse ? t('arbeidstid.resultat.iBalanse') : diff < 0 ? t('arbeidstid.resultat.tekniskUndertid') : t('arbeidstid.resultat.tekniskOvertid');
  const timerTekst = resultat?.differanseTimer ? ` = ${medEnhet(t, Math.abs(resultat.differanseTimer.verdi), 'arsrammetimer')}` : '';

  const hentVariant = (v: typeof s) => {
    reserverIder(v.grupper);
    for (const f of v.funksjoner) nesteFunksjon = Math.max(nesteFunksjon, f.id + 1);
    sett(v);
  };

  return (
    <Kalkulatorside
      id="stillingsplan"
      resultat={
        <>
          {feil && <Feilmelding feil={feil} />}
          {resultat ? (
            <>
              <Advarsler advarsler={resultat.advarsler} />
              <Utregningskort tittel={t('arbeidstid.resultat.samletBeskjeftigelse')} resultat={resultat.beskjeftigelse} trinn={resultat.trinn} sammendrag={false}>
                <Stillingsmaaler
                  deler={deler}
                  grense={resultat.stilling.verdi}
                  beskrivelse={t('arbeidstid.grafikk.stillingsplan', {
                    deler: deler.map((d) => `${d.navn} ${tallTekst(d.prosent)} %`).join(', '),
                    sum: tallTekst(resultat.beskjeftigelse.verdi),
                    grense: tallTekst(resultat.stilling.verdi),
                  })}
                />
                <Oversiktsliste
                  rader={[
                    { navn: t('arbeidstid.resultat.undervisning'), verdi: medEnhet(t, resultat.undervisning.verdi, 'prosent') },
                    { navn: t('arbeidstid.resultat.funksjoner'), verdi: medEnhet(t, resultat.funksjon.verdi, 'prosent') },
                    { navn: t('arbeidstid.resultat.stillingsprosent'), verdi: medEnhet(t, resultat.stilling.verdi, 'prosent') },
                  ]}
                />
                <p class={`stillingsplan-differanse${iBalanse ? '' : diff < 0 ? ' undertid' : ' overtid'}`} data-differanse={iBalanse ? 'balanse' : diff < 0 ? 'undertid' : 'overtid'}>
                  <span>{diffTekst}</span>
                  {!iBalanse && <span class="tall">{`${medEnhet(t, Math.abs(diff), 'prosent')}${timerTekst}`}</span>}
                </p>
                {!iBalanse && fylte.length > 1 && (
                  <div class="felt felt-liten">
                    <label for={idTimer}>{t('arbeidstid.stillingsplan.timerIFag')}</label>
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
                {!iBalanse && fylte.length === 0 && <p class="felt-hjelp">{t('arbeidstid.stillingsplan.ingenFag')}</p>}
                {!iBalanse && fylte.length > 1 && (
                  <>
                    <button type="button" class="lenkeknapp liten" aria-expanded={visHvertFag} onClick={() => settVisHvertFag(!visHvertFag)}>
                      <Ikon navn={visHvertFag ? 'opp' : 'ned'} class="ikon-liten" />
                      {t('arbeidstid.stillingsplan.hvertFag')}
                    </button>
                    {visHvertFag && (
                      <div class="hjelp-tekst">
                        <p class="felt-hjelp">{diff < 0 ? t('arbeidstid.stillingsplan.hvertFagMangler') : t('arbeidstid.stillingsplan.hvertFagForMye')}</p>
                        <Oversiktsliste
                          rader={differanseIHvertFag(resultat).map((d, i) => ({
                            navn: t('arbeidstid.stillingsplan.fagRad', { fag: gruppenavn[i] ?? '', arsramme: formaterTall(d.arsramme) }),
                            verdi: medEnhet(t, Math.abs(d.timer), 'arsrammetimer'),
                          }))}
                        />
                      </div>
                    )}
                  </>
                )}
                {resultat.beskjeftigelse.verdi > 100 && (
                  <a class="lenke-pil" href={`#/arbeidstid/overtid?beskjeftigelse=${encodeURIComponent(String(Math.round(resultat.beskjeftigelse.verdi * 100) / 100))}`}>
                    {t('arbeidstid.stillingsplan.overtidLenke', { prosent: tallTekst(resultat.beskjeftigelse.verdi) })}
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
              <Fordelingsvisning resultat={fordeling} />
              {ikkeFylt > 0 && <p class="liten dempet">{t('arbeidstid.stillingsplan.ikkeFyltMerknad', { prosent: tallTekst(ikkeFylt) })}</p>}
              {utenUtvidelse > 0 && <p class="liten dempet">{t('arbeidstid.stillingsplan.utenUtvidelseMerknad', { prosent: tallTekst(utenUtvidelse) })}</p>}
              {resultat && diff > 0.005 && <p class="liten dempet">{t('arbeidstid.stillingsplan.diagramMerknad', { prosent: tallTekst(resultat.beskjeftigelse.verdi) })}</p>}
            </>
          )}
          {lonn?.feil && <Feilmelding feil={lonn.feil} />}
          {lonn?.resultat && (
            <Utregningskort tittel={t('arbeidstid.stillingsplan.lonnIAlt')} resultat={lonn.resultat.samlet} trinn={lonn.resultat.trinn} sammendrag={false} fast={false}>
              <Advarsler advarsler={lonn.resultat.advarsler} />
              {(lonn.resultat.tillegg || lonn.resultat.overtid) && (
                <Belopsstolpe
                  deler={[
                    { navn: t('arbeidstid.stillingsplan.arslonn'), verdi: lonn.resultat.arslonn.verdi },
                    ...(lonn.resultat.tillegg ? [{ navn: t('arbeidstid.stillingsplan.tilleggNavn'), verdi: lonn.resultat.tillegg.verdi }] : []),
                    ...(lonn.resultat.overtid ? [{ navn: t('arbeidstid.resultat.overtidsbetaling'), verdi: lonn.resultat.overtid.verdi }] : []),
                  ]}
                />
              )}
              <Oversiktsliste
                rader={[
                  { navn: t('arbeidstid.stillingsplan.arslonnStilling', { prosent: tallTekst(s.stilling ?? 0) }), verdi: medEnhet(t, lonn.resultat.arslonn.verdi, 'kroner') },
                  ...tilleggene.map((x) => ({ navn: t('arbeidstid.stillingsplan.tilleggRad', { funksjon: x.navn }), verdi: medEnhet(t, x.kr, 'kroner') })),
                  ...(lonn.resultat.overtid ? [{ navn: t('arbeidstid.resultat.overtidsbetaling'), verdi: medEnhet(t, lonn.resultat.overtid.verdi, 'kroner') }] : []),
                  { navn: t('arbeidstid.resultat.feriepengerTillegg'), verdi: medEnhet(t, lonn.resultat.feriepenger.verdi, 'kroner') },
                ]}
              />
              {overtidUtenFag && <p class="felt-hjelp">{t('arbeidstid.stillingsplan.overtidUtenFag')}</p>}
              <p class="felt-hjelp">{t('arbeidstid.stillingsplan.lonnMerknad')}</p>
            </Utregningskort>
          )}
          <Varianter
            id="stillingsplan"
            skjema={s}
            resultat={resultat ? { tittel: t('arbeidstid.resultat.samletBeskjeftigelse'), verdi: resultat.beskjeftigelse.verdi, enhet: 'prosent' } : null}
            onHent={hentVariant}
          />
        </>
      }
    >
      <Tallfelt
        class="felt-kompakt"
        etikett={t('arbeidstid.stillingsplan.stilling')}
        enhet="%"
        verdi={s.stilling}
        min={0}
        maks={200}
        onEndring={(stilling) => sett({ ...s, stilling })}
      />
      <Grupper
        arstimer={arstimer}
        grupper={s.grupper}
        rader={rader}
        indeks={indeks}
        periode={false}
        standardUker={uker}
        delresultater={delresultater}
        onEndring={(grupper) => sett({ ...s, grupper })}
      />
      <Funksjoner funksjoner={s.funksjoner} tillegg={s.visLonn ? tilleggsforslag : null} onEndring={(f) => sett({ ...s, funksjoner: f })} />
      <fieldset class="fagkort">
        <legend class="fagkort-tittel">{t('arbeidstid.stillingsplan.tillegg')}</legend>
        <Tallfelt
          class="felt-kompakt"
          etikett={t('arbeidstid.fordeling.moter')}
          hjelpetekst={t('arbeidstid.stillingsplan.moterHjelp')}
          verdi={s.moter}
          min={0}
          maks={37.5}
          onEndring={(moter) => sett({ ...s, moter })}
        />
        <Vippe tekst={t('arbeidstid.stillingsplan.visLonn')} pa={s.visLonn} onEndring={(visLonn) => sett({ ...s, visLonn })} />
        {s.visLonn && (
          <>
            <Lonnsskjema hent={hent} lonn={s.lonn} onEndring={(l) => sett({ ...s, lonn: l })} />
            <Vippe tekst={t('arbeidstid.overtid.over60')} pa={s.over60} onEndring={(over60) => sett({ ...s, over60 })} />
            <p class="felt-hjelp">{t('arbeidstid.stillingsplan.tilleggHint')}</p>
          </>
        )}
      </fieldset>
    </Kalkulatorside>
  );
}
