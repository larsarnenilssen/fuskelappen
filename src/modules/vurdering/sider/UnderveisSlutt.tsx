// Underveis- og sluttvurdering (fase 6, pakke 1, mockup godkjent av eier 04.10.2026): skoleåret som én stripe,
// forskjellen side om side i én boks, vurderingsteksten i læreplanen for et fag fra Grep, og prinsippene for å vurdere
// kompetansemålene som en sti av kort. Faget står i adressen (?fag=ENG1007), så fagarket kan lenke rett hit.
import { useEffect, useId, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Sammenligning } from '../../../components/Sammenligning.tsx';
import { lastFagindeks, lastFagroller, lastLaereplan } from '../../../data/grep.ts';
import { type Fagklasse, fagklasser } from '../../fag/klasser.ts';
import { htmlSpraak, sokFag, tomtFilter } from '../../fag/oppslag.ts';
import type { Fagindeks, Laereplan } from '../../fag/skjema.ts';
import type { SideProps } from '../../typer.ts';
import { type Forklaringselement, hentInnhold, medPrefiks, underveisSluttRute } from '../innhold.ts';

/** Skoleåret fra august til juni som én stripe: underveisvurderingen hele året, og halvår, eksamen og standpunkt som felt. */
function Skolearet() {
  const { t } = useTekst();
  const maneder = t('vurdering.underveisSlutt.maneder').split(',');
  // Plassen i stripen, i måneder fra 1. august (11 måneder).
  const felt = (fra: number, til: number) => ({ left: `${(fra / 11) * 100}%`, width: `${((til - fra) / 11) * 100}%` });
  return (
    <figure class="skolear" aria-label={t('vurdering.underveisSlutt.figurTittel')}>
      {/* Etikettene over og under stolpen har samme størrelse. Underveisvurderingen står over, så feltene ikke deler den. */}
      <div class="skolear-rad" aria-hidden="true">
        <span class="skolear-etikett skolear-underveis" style={{ left: 0 }}>
          {t('vurdering.underveisSlutt.underveis')} {t('vurdering.underveisSlutt.heleAaret')}
        </span>
        <span class="skolear-etikett skolear-standpunkt" style={felt(8.6, 11)}>
          {t('vurdering.underveisSlutt.standpunkt')}
        </span>
      </div>
      <div class="skolear-spor" aria-hidden="true">
        <span class="skolear-felt skolear-felt-halvaar" style={felt(4.3, 5.7)} />
        <span class="skolear-felt skolear-felt-eksamen" style={felt(9.05, 9.75)} />
        <span class="skolear-felt skolear-felt-standpunkt" style={felt(9.85, 10.7)} />
      </div>
      <div class="skolear-rad skolear-rad-under" aria-hidden="true">
        <span class="skolear-etikett skolear-halvaar" style={felt(2.9, 7.1)}>
          {t('vurdering.underveisSlutt.halvaar')}
        </span>
        <span class="skolear-etikett skolear-eksamen" style={felt(7.9, 10.9)}>
          {t('vurdering.underveisSlutt.eksamen')}
        </span>
      </div>
      <div class="skolear-maneder" aria-hidden="true">
        {maneder.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <ul class="skolear-tegn">
        <li class="skolear-tegn-underveis">{t('vurdering.underveisSlutt.tegnUnderveis')}</li>
        <li class="skolear-tegn-halvaar">{t('vurdering.underveisSlutt.tegnHalvaar')}</li>
        <li class="skolear-tegn-eksamen">{t('vurdering.underveisSlutt.tegnEksamen')}</li>
        <li class="skolear-tegn-standpunkt">{t('vurdering.underveisSlutt.tegnStandpunkt')}</li>
      </ul>
    </figure>
  );
}

/** Søk etter et fag, og vurderingsteksten i læreplanen for faget fra Grep. */
function IFaget({ startkode }: { startkode: string }) {
  const { t, malform } = useTekst();
  const id = useId();
  const [indeks, settIndeks] = useState<Fagindeks | null>(null);
  const [klasser, settKlasser] = useState<Map<string, Fagklasse> | null>(null);
  const [sok, settSok] = useState('');
  const [kode, settKode] = useState(startkode);
  const [plan, settPlan] = useState<Laereplan | 'feil' | null>(null);

  useEffect(() => {
    void Promise.all([lastFagindeks(), lastFagroller()]).then(([i, r]) => {
      settIndeks(i);
      settKlasser(fagklasser(i, r.roller));
    });
  }, []);
  const fag = indeks && kode ? indeks.fag[kode] : undefined;
  useEffect(() => {
    settPlan(null);
    if (fag?.lp) lastLaereplan(fag.lp).then(settPlan, () => settPlan('feil'));
  }, [fag?.lp]);

  const velg = (ny: string) => {
    settKode(ny);
    settSok('');
    erstattAdresse(underveisSluttRute, ny ? { fag: ny } : undefined);
  };

  if (indeks === null || klasser === null) return <p class="dempet">{t('app.lasterInn')}</p>;

  if (fag) {
    const sett = plan && plan !== 'feil' ? plan.kompetansemaalsett.filter((s) => fag.km.includes(s.kode)) : [];
    const lang = plan && plan !== 'feil' ? htmlSpraak(plan.spraak) : malform;
    return (
      <div class="vu-fag">
        <p class="vu-fag-navn">
          <a href={`#/fag/${kode}`}>
            {fag.navn[malform]} ({kode})
          </a>
        </p>
        {plan === null && <p class="dempet">{t('app.lasterInn')}</p>}
        {plan === 'feil' && <p role="alert">{t('vurdering.underveisSlutt.lasterFeil')}</p>}
        {plan !== null && plan !== 'feil' && sett.length === 0 && <p>{t('vurdering.underveisSlutt.ingenTekst')}</p>}
        {sett.map((s) => (
          <section key={s.kode} class="vu-fag-sett" lang={lang}>
            <h3 class="liten-overskrift">{s.tittel}</h3>
            {s.underveis.length > 0 && (
              <>
                <p class="vu-fag-etikett" lang={malform}>
                  {t('vurdering.underveisSlutt.underveisTekst')}
                </p>
                {s.underveis.map((a, i) => (
                  <p key={i}>{a}</p>
                ))}
              </>
            )}
            {s.standpunkt.length > 0 && (
              <>
                <p class="vu-fag-etikett" lang={malform}>
                  {t('vurdering.underveisSlutt.standpunktTekst')}
                </p>
                {s.standpunkt.map((a, i) => (
                  <p key={i}>{a}</p>
                ))}
              </>
            )}
          </section>
        ))}
        {plan !== null && plan !== 'feil' && (
          <p class="dempet liten">{t('vurdering.underveisSlutt.fraGrep', { kode: plan.kode })}</p>
        )}
        <p>
          <a href={`#/fag/${kode}`}>{t('vurdering.underveisSlutt.tilFagarket', { fag: fag.navn[malform] })}</a>
        </p>
        <button type="button" class="lenkeknapp" onClick={() => velg('')}>
          {t('vurdering.underveisSlutt.annetFag')}
        </button>
      </div>
    );
  }

  const treff = sok.trim() ? sokFag(indeks, { ...tomtFilter, tekst: sok }, klasser).treff.slice(0, 8) : [];
  return (
    <div>
      <p>{t('vurdering.underveisSlutt.velgFag')}</p>
      <div class="felt">
        <label for={id}>{t('vurdering.underveisSlutt.sokFag')}</label>
        <div class="sokefelt">
          <Ikon navn="sok" class="sokefelt-ikon" />
          <input
            id={id}
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            placeholder={t('vurdering.underveisSlutt.sokPlassholder')}
            value={sok}
            onInput={(e) => settSok(e.currentTarget.value)}
          />
        </div>
      </div>
      {sok.trim() !== '' && treff.length === 0 && <p class="dempet">{t('vurdering.underveisSlutt.ingenFag')}</p>}
      {treff.length > 0 && (
        <ul class="vu-fag-treff">
          {treff.map((f) => (
            <li key={f.kode}>
              <button type="button" class="vu-fag-valg" onClick={() => velg(f.kode)}>
                <span>{f.fag.navn[malform]}</span>
                <span class="dempet liten">{f.kode}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function UnderveisSlutt({ sporring }: SideProps) {
  const { t } = useTekst();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
  }, []);
  const rader = innhold ? medPrefiks(innhold, 'us-rad-') : [];
  const prinsipper = innhold ? medPrefiks(innhold, 'us-prinsipp-') : [];
  const skolearet = innhold?.find((e) => e.id === 'us-skolearet');
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('vurdering.tittel'), href: '#/vurdering' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('vurdering.underveisSlutt.tittel')}</h1>
        <FavorittKnapp id="vurdering:underveis-og-slutt" navn={t('vurdering.underveisSlutt.tittel')} />
      </div>
      <p class="ingress">{t('vurdering.underveisSlutt.innledning')}</p>
      <section>
        <h2 class="liten-overskrift">{t('vurdering.underveisSlutt.skolearet')}</h2>
        <Skolearet />
        {skolearet && <Innholdskort element={skolearet} />}
      </section>
      {/* Fagsøket står rett under skoleåret, så det ikke blir oversett, og et fag fra fagarket vises høyt (eier 04.10.2026). */}
      <section>
        <h2 class="liten-overskrift">{t('vurdering.underveisSlutt.iLaereplanen')}</h2>
        {/* Ny nøkkel når faget i adressen endres via en lenke, så valget følger adressen. */}
        <IFaget key={sporring.get('fag') ?? ''} startkode={sporring.get('fag') ?? ''} />
      </section>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <section>
            <h2 class="liten-overskrift">{t('vurdering.underveisSlutt.forskjellen')}</h2>
            <Sammenligning
              tittel={t('vurdering.underveisSlutt.forskjellen')}
              venstre={t('vurdering.underveisSlutt.venstre')}
              hoyre={t('vurdering.underveisSlutt.hoyre')}
              rader={rader.flatMap((r) => (r.sammenligning ? [{ id: r.id, tittel: r.tittel, venstre: r.sammenligning.venstre, hoyre: r.sammenligning.hoyre }] : []))}
              kilder={rader.flatMap((r) => r.kilder)}
              nokkel="us-rad"
            />
          </section>
          <section>
            <h2 class="liten-overskrift">{t('vurdering.underveisSlutt.prinsipper')}</h2>
            {/* Prinsippene i den rekkefølgen de kommer i skoleåret, som en sti. */}
            <ol class="vu-sti">
              {prinsipper.map((p) => (
                <li key={p.id}>
                  <Innholdskort element={p} />
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
