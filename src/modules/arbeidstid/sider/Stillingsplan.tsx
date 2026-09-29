// Stillingsplan for én lærer: fag og funksjoner mot stillingsprosenten, med teknisk undertid eller overtid.
// Hovedkalkulatoren i modulen. Differansen kan regnes om til årsrammetimer i et valgt fag.
import { useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { beregnStillingsplan, differanseIHvertFag, type Gruppe } from '../beregning/index.ts';
import { Stillingsmaaler, type Stolpedel } from '../komponenter/Grafikk.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { type Fagindeks, type Gruppetilstand, Grupper, nyGruppe, radTekst, reserverIder, tilGruppe, useFagindeks } from '../komponenter/Skjema.tsx';
import { medEnhet, tallTekst, Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

interface Funksjonstilstand {
  id: number;
  navn: string;
  prosent: number | null;
}

let nesteFunksjon = 1;
const nyFunksjon = (): Funksjonstilstand => ({ id: nesteFunksjon++, navn: '', prosent: 0 });

/** Kort navn på faget i en gruppe, f.eks. «Engelsk · Studiespesialisering Vg1». */
function fagnavn(g: Gruppetilstand, indeks: Fagindeks, reserve: string): string {
  const plass = g.arsrammer[0];
  if (plass?.valg && plass.valg !== 'manuell') return radTekst(indeks, plass.valg)?.navn ?? reserve;
  return reserve;
}

function Funksjoner({ funksjoner, onEndring }: { funksjoner: Funksjonstilstand[]; onEndring: (f: Funksjonstilstand[]) => void }) {
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

  return (
    <Kalkulatorside id="stillingsplan">
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
        grupper={s.grupper}
        rader={rader}
        indeks={indeks}
        periode={false}
        standardUker={uker}
        delresultater={delresultater}
        onEndring={(grupper) => sett({ ...s, grupper })}
      />
      <Funksjoner funksjoner={s.funksjoner} onEndring={(f) => sett({ ...s, funksjoner: f })} />
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
    </Kalkulatorside>
  );
}
