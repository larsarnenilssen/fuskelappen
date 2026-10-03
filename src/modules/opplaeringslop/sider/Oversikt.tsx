// Utdanningsprogrammene, gruppert i studieforberedende, yrkesfaglige og påbygging, med søk etter program og tilbud
// (eier 02.10.2026). Hvert program fører til løpet. Gruppene er lukket fra start. Har brukeren valgt en skole som
// utdanning.no har tilbudene til, viser siden først programmene ved skolen, med bryteren «Min skole» / «Alle»
// (avgjørelse 053).
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { lenke } from '../../../app/ruter.ts';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { lastOpplaeringskontor } from '../../../data/udir.ts';
import type { Opplaeringskontorer } from '../nor/skjema.ts';
import { filtrerSkoler, type Skoleoppforing } from '../skoler.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { Programgruppe } from '../../fag/tilbud/modell.ts';
import { sokTilbud } from '../sok.ts';
import { Lasting, Rubrikk, Skolevalg, Tilbudslenke, useSkoler, useSkolevisning, useTilbudsdata } from './felles.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

const GRUPPER: readonly Programgruppe[] = ['studieforberedende', 'yrkesfaglig', 'pabygging'];
const MAKS_TREFF = 40;


/**
 * Den andre delen av modulen: skoleoppslaget og opplæringskontorene, som kort med det viktigste tallet, på samme måte
 * som innngangene på landingssiden for Inntak (eier 03.10.2026).
 */
function Innganger() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const register = useSkoler();
  const [kontor, settKontor] = useState<Opplaeringskontorer | null>(null);
  useEffect(() => {
    lastOpplaeringskontor().then(settKontor, () => undefined);
  }, []);
  const fylke = fylkesnavn(innstillinger.fylke) ? innstillinger.fylke : null;
  const iFylket = (liste: readonly { fylke: string }[]) => (fylke ? liste.filter((x) => x.fylke === fylke).length : liste.length);
  const kontorer = kontor ? (fylke ? kontor.kontor.filter((k) => k.godkjentI.includes(fylke)).length : kontor.kontor.length) : null;
  const sted = fylke ? (fylkesnavn(fylke) ?? '') : null;
  return (
    <section class="lop-del" aria-labelledby="lop-del-skoler">
      <h2 class="liten-overskrift" id="lop-del-skoler">
        {t('opplaeringslop.registre')}
      </h2>
      <div class="lop-innganger">
        <a class="frist-inngang" href="#/opplaeringslop/skoler">
          <span class="frist-inngang-tittel">
            <Ikon navn="skole" />
            {t('opplaeringslop.skoler.tittel')}
          </span>
          <span class="frist-inngang-neste">
            {register && <span class="frist-inngang-tid">{sted ? t('opplaeringslop.inngang.skolerFylke', { antall: formaterTall(iFylket(register.skoler)), fylke: sted }) : t('opplaeringslop.inngang.skoler', { antall: formaterTall(register.skoler.length) })}</span>}
            <span>{t('opplaeringslop.inngang.skolerTekst')}</span>
          </span>
          <Ikon navn="hoyre" class="frist-inngang-pil" />
        </a>
        <a class="frist-inngang" href="#/opplaeringslop/opplaeringskontor">
          <span class="frist-inngang-tittel">
            <Ikon navn="kontor" />
            {t('opplaeringslop.kontor.tittel')}
          </span>
          <span class="frist-inngang-neste">
            {kontorer !== null && <span class="frist-inngang-tid">{sted ? t('opplaeringslop.tilbud.kontorFylke', { antall: formaterTall(kontorer), fylke: sted }) : t('opplaeringslop.tilbud.kontorLandet', { antall: formaterTall(kontorer) })}</span>}
            <span>{t('opplaeringslop.inngang.kontorTekst')}</span>
          </span>
          <Ikon navn="hoyre" class="frist-inngang-pil" />
        </a>
      </div>
    </section>
  );
}

/** Skolene som passer søket på landingssiden: navn eller sted (eier 03.10.2026). */
function Skoletreff({ sok, treff }: { sok: string; treff: readonly Skoleoppforing[] }) {
  const { t } = useTekst();
  if (treff.length === 0) return null;
  return (
    <section class="lop-sok-skoler">
      <h2 class="liten-overskrift">{t('opplaeringslop.oversikt.skoler', { antall: formaterTall(treff.length) })}</h2>
      <ul class="liste">
        {treff.slice(0, MAKS_SKOLER).map((s) => (
          <li key={s.nr ?? s.navn}>
            <a class="listelenke" href={lenke('/opplaeringslop/skoler', s.nr ? { fylke: 'alle', skole: s.nr } : { fylke: 'alle', q: s.navn })}>
              <span class="listelenke-tekst">
                <span class="listelenke-tittel">{s.navn}</span>
                <span class="listelenke-under">{[s.sted, fylkesnavn(s.fylke)].filter(Boolean).join(' · ')}</span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        ))}
      </ul>
      {treff.length > MAKS_SKOLER && (
        <p class="liten">
          <a href={lenke('/opplaeringslop/skoler', { fylke: 'alle', q: sok })}>{t('opplaeringslop.oversikt.alleSkoler', { antall: formaterTall(treff.length) })}</a>
        </p>
      )}
    </section>
  );
}

const MAKS_SKOLER = 5;

/** Antall tilbud ved skolen i hvert utdanningsprogram. */
function tilbudPerProgram(indeks: Fagindeks, skole: Skoleoppforing | null): Map<string, number> {
  const ut = new Map<string, number>();
  for (const k of skole?.tilbud ?? []) {
    const p = indeks.programomrader[k]?.program;
    if (p) ut.set(p, (ut.get(p) ?? 0) + 1);
  }
  return ut;
}

/** Et utdanningsprogram i listen, med antall tilbud ved skolen brukeren har valgt. */
function Programlenke({ program, navn, antall }: { program: string; navn: string; antall: number }) {
  const { t } = useTekst();
  return (
    <a class="listelenke" href={`#/opplaeringslop/${program}`} data-skole={antall > 0 ? 'ja' : undefined}>
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{navn}</span>
        <span class="listelenke-under">
          {program}
          {antall > 0 && (
            <span class="lop-dinskole">
              <Ikon navn="hake" class="ikon-liten" />
              {antall === 1 ? t('opplaeringslop.visning.etVedSkolen') : t('opplaeringslop.visning.antallVedSkolen', { antall: formaterTall(antall) })}
            </span>
          )}
        </span>
      </span>
      <Ikon navn="hoyre" class="ikon-liten" />
    </a>
  );
}

export default function Oversikt() {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const [sok, settSok] = useState('');
  const aktivt = sok.trim().length >= 2;
  const visning = useSkolevisning();
  // Søketreff ved skolen brukeren har valgt, står først.
  const sokt = typeof data !== 'string' && aktivt ? sokTilbud(data.indeks, sok, malform) : [];
  const vedSkolen = new Set(visning.skole?.tilbud ?? []);
  const treff = [...sokt.filter((k) => vedSkolen.has(k)), ...sokt.filter((k) => !vedSkolen.has(k))];
  const perProgram = typeof data !== 'string' ? tilbudPerProgram(data.indeks, visning.skole) : new Map<string, number>();
  const register = useSkoler();
  const skoletreff = aktivt && register ? filtrerSkoler(register.skoler, { fylke: null, tilbud: null, sok }) : [];
  const status = !aktivt
    ? ''
    : treff.length + skoletreff.length === 0
      ? t('opplaeringslop.oversikt.ingenTreff')
      : t('opplaeringslop.oversikt.antallTreffBegge', { tilbud: formaterTall(treff.length), skoler: formaterTall(skoletreff.length) });
  return (
    <div class="side lop-oversikt">
      <h1 tabIndex={-1}>{t('opplaeringslop.tittel')}</h1>
      <p class="ingress"><Begrepstekst tekst={t('opplaeringslop.innledning')} /></p>
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : (
        <>
          {/* Ett søk for begge delene av modulen: tilbud og skoler (eier 03.10.2026). */}
          <div class="sokeboks">
            <div class="sokefelt">
              <input
                type="search"
                class="tekstfelt"
                aria-label={t('opplaeringslop.oversikt.sok')}
                placeholder={t('opplaeringslop.oversikt.sok')}
                value={sok}
                onInput={(e) => settSok(e.currentTarget.value)}
              />
              <Ikon navn="sok" class="sokefelt-ikon" />
            </div>
            <p class="sokestatus" role="status" aria-live="polite">
              {status}
            </p>
          </div>
          {aktivt ? (
            <>
              {treff.length > 0 && (
                <ul class="liste">
                  {treff.slice(0, MAKS_TREFF).map((k) => (
                    <li key={k}>
                      <Tilbudslenke indeks={data.indeks} kode={k} />
                    </li>
                  ))}
                </ul>
              )}
              <Skoletreff sok={sok} treff={skoletreff} />
            </>
          ) : (
            <>
              <section class="lop-del" aria-labelledby="lop-del-program">
                <h2 class="liten-overskrift" id="lop-del-program">
                  {t('opplaeringslop.oversikt.program')}
                </h2>
                <Skolevalg visning={visning} />
                {visning.aktiv ? (
                  <ul class="liste">
                    {data.tilbud.struktur
                      .filter((p) => (perProgram.get(p.program) ?? 0) > 0)
                      .map((p) => (
                        <li key={p.program}>
                          <Programlenke program={p.program} navn={p.navn[malform]} antall={perProgram.get(p.program) ?? 0} />
                        </li>
                      ))}
                  </ul>
                ) : (
                  GRUPPER.map((g) => {
                    const programmer = data.tilbud.struktur.filter((p) => p.gruppe === g);
                    if (programmer.length === 0) return null;
                    return (
                      <Rubrikk key={g} nokkel={`lop-gruppe-${g}`} tittel={t(`opplaeringslop.gruppe.${g}`)} hoyre={formaterTall(programmer.length)} lukket>
                        <ul class="liste">
                          {programmer.map((p) => (
                            <li key={p.program}>
                              <Programlenke program={p.program} navn={p.navn[malform]} antall={perProgram.get(p.program) ?? 0} />
                            </li>
                          ))}
                        </ul>
                      </Rubrikk>
                    );
                  })
                )}
                {data.tilbud.skolear && <p class="liten dempet lop-skolear">{t('opplaeringslop.skolear', { skolear: data.tilbud.skolear.replace('-', '–') })}</p>}
              </section>
              <Innganger />
            </>
          )}
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-grep' }, { id: 'udir-fag-og-timefordeling' }, { id: 'utdanning-no', punkt: 'Skoler' }, { id: 'udir-nor' }]} />
    </div>
  );
}
