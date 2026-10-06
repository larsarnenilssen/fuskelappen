// Landingssiden for Opplæringstilbud (eier 03.10.2026): søk etter tilbud og skoler, og to likestilte deler med kort,
// «Utdanningsprogram og løp» (undersiden Opplæringsløp) og «Skoler og opplæringskontorer» (avgjørelse 053).
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { lenke } from '../../../app/ruter.ts';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { lastOpplaeringskontor } from '../../../data/udir.ts';
import type { Opplaeringskontorer } from '../nor/skjema.ts';
import { filtrerSkoler, type Skoleoppforing } from '../skoler.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { UNDERSIDER } from '../favoritter.ts';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { sokTilbud } from '../sok.ts';
import { Lasting, Tilbudslenke, useSkoler, useSkolevisning, useTilbudsdata } from './felles.tsx';
import { tilbudPerProgram } from './Lop.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { useVeier } from '../fagbrev/data.ts';

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
        <a class="frist-inngang" href={`#${UNDERSIDER.skoler.rute}`}>
          <span class="frist-inngang-tittel">
            <Ikon navn={UNDERSIDER.skoler.ikon} />
            {t('opplaeringslop.skoler.tittel')}
          </span>
          <span class="frist-inngang-neste">
            {register && <span class="frist-inngang-tid">{sted ? t('opplaeringslop.inngang.skolerFylke', { antall: formaterTall(iFylket(register.skoler)), fylke: sted }) : t('opplaeringslop.inngang.skoler', { antall: formaterTall(register.skoler.length) })}</span>}
            <span>{t('opplaeringslop.inngang.skolerTekst')}</span>
          </span>
          <Ikon navn="hoyre" class="frist-inngang-pil" />
        </a>
        <a class="frist-inngang" href={`#${UNDERSIDER.kontor.rute}`}>
          <span class="frist-inngang-tittel">
            <Ikon navn={UNDERSIDER.kontor.ikon} />
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

export default function Oversikt() {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const [sok, settSok] = useState('');
  const aktivt = sok.trim().length >= 2;
  const visning = useSkolevisning();
  const veier = useVeier();
  // Søketreff ved skolen brukeren har valgt, står først.
  const sokt = typeof data !== 'string' && aktivt ? sokTilbud(data.indeks, sok, malform) : [];
  const vedSkolen = new Set(visning.skole?.tilbud ?? []);
  const treff = [...sokt.filter((k) => vedSkolen.has(k)), ...sokt.filter((k) => !vedSkolen.has(k))];
  const register = useSkoler();
  const skoletreff = aktivt && register ? filtrerSkoler(register.skoler, { fylke: null, tilbud: null, sok }) : [];
  const status = !aktivt
    ? ''
    : treff.length + skoletreff.length === 0
      ? t('opplaeringslop.oversikt.ingenTreff')
      : t('opplaeringslop.oversikt.antallTreffBegge', { tilbud: formaterTall(treff.length), skoler: formaterTall(skoletreff.length) });
  return (
    <div class="side lop-oversikt">
      <Sidetopp tittel={t('opplaeringslop.tittel')} favoritt={oversiktsid('opplaeringslop')} />
      <p class="ingress">
        <Begrepstekst tekst={t('opplaeringslop.innledning')} />
      </p>
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
                <div class="lop-innganger">
                  {/* Opplæringsløpet er en egen underside, med «Min skole» / «Alle» og programmene (eier 03.10.2026). */}
                  <a class="frist-inngang" href={`#${UNDERSIDER.lop.rute}`}>
                    <span class="frist-inngang-tittel">
                      <Ikon navn={UNDERSIDER.lop.ikon} />
                      {t('opplaeringslop.lop.tittel')}
                    </span>
                    <span class="frist-inngang-neste">
                      <span class="frist-inngang-tid">
                        {visning.skole
                          ? t('opplaeringslop.inngang.programSkole', { antall: formaterTall(tilbudPerProgram(data.indeks, visning.skole).size), skole: visning.skole.navn })
                          : t('opplaeringslop.inngang.program', { antall: formaterTall(data.tilbud.struktur.length) })}
                      </span>
                      <span>{t('opplaeringslop.inngang.programTekst')}</span>
                    </span>
                    <Ikon navn="hoyre" class="frist-inngang-pil" />
                  </a>
                  {/* Veiene til fag- og svennebrev (fase 6, pakke 6, eier 04.10.2026). */}
                  <a class="frist-inngang" href={`#${UNDERSIDER.fagbrev.rute}`}>
                    <span class="frist-inngang-tittel">
                      <Ikon navn={UNDERSIDER.fagbrev.ikon} />
                      {t('opplaeringslop.fagbrev.tittel')}
                    </span>
                    <span class="frist-inngang-neste">
                      {veier && <span class="frist-inngang-tid">{t('opplaeringslop.fagbrev.inngang', { antall: formaterTall(veier.veier.length) })}</span>}
                      <span>{t('opplaeringslop.fagbrev.inngangTekst')}</span>
                    </span>
                    <Ikon navn="hoyre" class="frist-inngang-pil" />
                  </a>
                </div>
              </section>
              <Innganger />
            </>
          )}
        </>
      )}
    </div>
  );
}
