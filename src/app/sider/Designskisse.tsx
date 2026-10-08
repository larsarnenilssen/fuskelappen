// Skissen til designløftet (fase 8b, docs/DESIGN.md): før og etter for de viktigste mønstrene, med de samme komponentene
// som appen. Stilene som ble vist som «Etter», står nå i base.css, så de to er like. Finnes bare i utvikling, i testene
// og i testversjonen (ruteliste.ts), og fjernes i oppryddingen (pakke 7).
import type { ComponentChildren } from 'preact';
import { useId, useState } from 'preact/hooks';
import { Bryter } from '../../components/Bryter.tsx';
import { Forklaring } from '../../components/Forklaring.tsx';
import { Ikon, type Ikonnavn } from '../../components/Ikon.tsx';
import { Resultatkort } from '../../components/Resultatkort.tsx';
import { Tallfelt } from '../../components/Tallfelt.tsx';
import { Skjemadel } from '../../modules/arbeidstid/komponenter/Skjemadel.tsx';
import { formaterTall } from '../../core/i18n/tekst.ts';
import '../../styles/designskisse.css';
import { useTekst } from '../tilstand.ts';

type T = ReturnType<typeof useTekst>['t'];

/** Ett mønster: tittel, en kort regel og «Før» og «Etter» side om side på skrivebord, under hverandre på mobil. */
function Monster({ id, tittel, tekst, children }: { id: string; tittel: string; tekst: string; children: (etter: boolean) => ComponentChildren }) {
  const { t } = useTekst();
  return (
    <section class="ds-monster" aria-labelledby={`ds-${id}`}>
      <h2 id={`ds-${id}`}>{tittel}</h2>
      <p class="ds-regel">{tekst}</p>
      <div class="ds-par">
        <div class="ds-side ds-for">
          <p class="ds-merke">{t('utvikling.design.for')}</p>
          {children(false)}
        </div>
        <div class="ds-side ds-etter">
          <p class="ds-merke">{t('utvikling.design.etter')}</p>
          {children(true)}
        </div>
      </div>
    </section>
  );
}

function Kalkulatorskjema({ t }: { t: T }) {
  const [timer, settTimer] = useState<number | null>(140);
  const [enhet, settEnhet] = useState<'arstimer' | 'okter'>('arstimer');
  const fagfelt = useId();
  return (
    <>
      <Skjemadel tittel={t('utvikling.design.undervisning')} del="undervisning" sum="26,7 %">
        <div class="fagkortliste">
          <fieldset class="fagkort">
            <legend class="fagkort-tittel">
              <span class="kortknapp">
                <span class="kortknapp-tekst">{t('utvikling.design.fag1')}</span>
              </span>
            </legend>
            <div class="felt">
              <label for={fagfelt}>{t('utvikling.design.fag')}</label>
              <div class="sokefelt">
                <Ikon navn="sok" class="sokefelt-ikon ikon-liten" />
                <input id={fagfelt} type="search" placeholder={t('utvikling.design.fagHjelp')} />
              </div>
            </div>
            <Bryter
              kompakt
              legend={t('utvikling.design.visesSom')}
              skjultLegend
              verdi={enhet}
              valg={[
                { verdi: 'arstimer', tekst: t('utvikling.design.arstimer') },
                { verdi: 'okter', tekst: t('utvikling.design.okter') },
              ]}
              onEndring={settEnhet}
            />
            <Tallfelt etikett={t('utvikling.design.timer')} verdi={timer} min={0} onEndring={settTimer} />
          </fieldset>
        </div>
        <button type="button" class="knapp knapp-sekundaer">
          <Ikon navn="pluss" class="ikon-liten" />
          {t('utvikling.design.leggTilFag')}
        </button>
      </Skjemadel>
      <Skjemadel tittel={t('utvikling.design.funksjoner')} del="funksjoner">
        <button type="button" class="knapp knapp-sekundaer">
          <Ikon navn="pluss" class="ikon-liten" />
          {t('utvikling.design.leggTilFunksjon')}
        </button>
      </Skjemadel>
    </>
  );
}

function Valgknapper({ t }: { t: T }) {
  const [hvem, settHvem] = useState<'ansatt' | 'vikar'>('ansatt');
  const [min, settMin] = useState<'45' | '60' | '90' | 'annet'>('45');
  const [lonn, settLonn] = useState<'garanti' | 'egen'>('garanti');
  return (
    <div class="kort">
      <Bryter
        legend={t('utvikling.design.hvem')}
        verdi={hvem}
        valg={[
          { verdi: 'ansatt', tekst: t('utvikling.design.ansatt') },
          { verdi: 'vikar', tekst: t('utvikling.design.timevikar') },
        ]}
        onEndring={settHvem}
      />
      <Bryter
        kompakt
        legend={t('utvikling.design.minutter')}
        verdi={min}
        valg={[
          { verdi: '45', tekst: '45' },
          { verdi: '60', tekst: '60' },
          { verdi: '90', tekst: '90' },
          { verdi: 'annet', tekst: t('utvikling.design.annet') },
        ]}
        onEndring={settMin}
      />
      <Bryter
        legend={t('utvikling.design.lonn')}
        verdi={lonn}
        valg={[
          { verdi: 'garanti', tekst: t('utvikling.design.garanti') },
          { verdi: 'egen', tekst: t('utvikling.design.egen') },
        ]}
        onEndring={settLonn}
      />
    </div>
  );
}

function Inngang({ ikon, tittel, tekst }: { ikon: Ikonnavn; tittel: string; tekst: string }) {
  return (
    <a class="frist-inngang" href="#/vurdering">
      <span class="frist-inngang-tittel">
        <Ikon navn={ikon} />
        {tittel}
      </span>
      <span class="frist-inngang-neste">{tekst}</span>
      <Ikon navn="hoyre" class="frist-inngang-pil" />
    </a>
  );
}

function Oversikt({ t }: { t: T }) {
  const faser = [t('utvikling.design.fase1'), t('utvikling.design.fase2'), t('utvikling.design.fase3'), t('utvikling.design.fase4')];
  return (
    <>
      <section class="lop-del">
        <h3 class="liten-overskrift">{t('utvikling.design.vurderingIFag')}</h3>
        <ul class="veiviser-innganger">
          <li>
            <Inngang ikon="bok" tittel={t('utvikling.design.underveis')} tekst={t('utvikling.design.underveisTekst')} />
          </li>
          <li>
            <a class="veiviser-inngang" href="#/vurdering/grunnlag-for-vurdering" data-veiviserfarge="rav">
              <span class="veiviser-inngang-topp">
                <span class="veiviser-inngang-tittel">{t('utvikling.design.grunnlag')}</span>
                <Ikon navn="hoyre" />
              </span>
              <span class="veiviser-inngang-faser" aria-hidden="true">
                {faser.map((f) => (
                  <span key={f} class="veiviser-inngang-fase">
                    <span class="veiviser-inngang-strek" />
                    <span class="veiviser-inngang-fasenavn">{f}</span>
                  </span>
                ))}
              </span>
            </a>
          </li>
        </ul>
      </section>
      <section class="lop-del">
        <h3 class="liten-overskrift">{t('utvikling.design.fravaer')}</h3>
        <Inngang ikon="klokke" tittel={t('utvikling.design.fravaersgrensen')} tekst={t('utvikling.design.fravaersgrensenTekst')} />
      </section>
    </>
  );
}

/** Skjematisk oppsett på skrivebord: blokkene med navn, så skissen viser fordelingen også på mobil. */
function Oppsett({ t, etter }: { t: T; etter: boolean }) {
  return (
    <div class="ds-oppsett">
      <p class="ds-oppsett-tittel">{t('utvikling.design.kalkulator')}</p>
      <div class="ds-rammer">
        <div class="ds-kolonne ds-bred">
          <span class="ds-blokk ds-hvit ds-hoy">{t('utvikling.design.skjema')}</span>
        </div>
        <div class="ds-kolonne ds-bred">
          {etter ? (
            <span class="ds-blokk ds-hvit">{t('utvikling.design.resultatFraStart')}</span>
          ) : (
            <span class="ds-blokk ds-tom">{t('utvikling.design.tomt')}</span>
          )}
        </div>
      </div>
      <p class="ds-oppsett-tittel">{t('utvikling.design.oversikt')}</p>
      {etter ? (
        <div class="ds-rammer">
          <div class="ds-kolonne ds-tre">
            <span class="ds-blokk ds-bakgrunn">{t('utvikling.design.ingress')}</span>
            <span class="ds-blokk ds-hvit">{t('utvikling.design.innganger')}</span>
          </div>
          <div class="ds-kolonne ds-to">
            <span class="ds-blokk ds-hvit">{t('utvikling.design.veivisere')}</span>
            <span class="ds-blokk ds-hvit ds-lav">{t('utvikling.design.kilder')}</span>
          </div>
        </div>
      ) : (
        <div class="ds-rammer">
          <div class="ds-kolonne ds-tre">
            <span class="ds-blokk ds-bakgrunn">{t('utvikling.design.ingress')}</span>
            <span class="ds-blokk ds-hvit">{t('utvikling.design.innganger')}</span>
            <span class="ds-blokk ds-hvit">{t('utvikling.design.veivisere')}</span>
          </div>
          <div class="ds-kolonne ds-to">
            <span class="ds-blokk ds-tom ds-hoy">{t('utvikling.design.tomPlass')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Delene på fagarket: samme markering som FagSeksjon i src/modules/fag/sider/Fag.tsx. */
function Fagdel({ id, tittel, apen, t }: { id: string; tittel: string; apen?: boolean; t: T }) {
  const [erApen, settApen] = useState(apen === true);
  return (
    <section class="fag-seksjon" data-fagtype="fellesfag">
      <h3 class="fag-seksjon-tittel">
        <button type="button" class="kortknapp" aria-expanded={erApen} aria-controls={`ds-fag-${id}`} onClick={() => settApen(!erApen)}>
          <span class="kortknapp-tekst">{tittel}</span>
          <Ikon navn={erApen ? 'opp' : 'ned'} class="ikon-liten kortknapp-pil" />
        </button>
      </h3>
      <div id={`ds-fag-${id}`} hidden={!erApen}>
        <p>{t('utvikling.design.eksempeltekst')}</p>
      </div>
    </section>
  );
}

function Lukkes({ t, etter }: { t: T; etter: boolean }) {
  const s = etter ? 'e' : 'f';
  return (
    <div class="fagark" data-fagtype="fellesfag">
      <Fagdel id={`${s}-mal`} tittel={t('utvikling.design.kompetansemal')} t={t} />
      <Fagdel id={`${s}-vurdering`} tittel={t('utvikling.design.vurderingsordning')} t={t} />
      <Fagdel id={`${s}-tilbud`} tittel={t('utvikling.design.tilbud')} t={t} />
      <Forklaring tittel={t('utvikling.forklaringTittel')}>
        <p>{t('utvikling.forklaringTekst')}</p>
      </Forklaring>
    </div>
  );
}

function Tall({ t }: { t: T }) {
  return (
    <>
      <section class="fagark nokkeltall-kort" data-fagtype="fellesfag" aria-label={t('utvikling.design.arstimetall')}>
        <div class="nokkeltall">
          <div class="nokkeltall-rute">
            <span class="nokkeltall-etikett">{t('utvikling.design.arstimetall')}</span>
            <span class="nokkeltall-verdi tall">{formaterTall(168)}</span>
            <span class="nokkeltall-enhet">{t('utvikling.design.timer60')}</span>
          </div>
          <div class="nokkeltall-rute">
            <span class="nokkeltall-etikett">{t('utvikling.design.arsramme')}</span>
            <span class="nokkeltall-verdi tall">{formaterTall(466.5, 1)}</span>
            <span class="nokkeltall-enhet">{t('utvikling.design.timer60')}</span>
          </div>
        </div>
      </section>
      <Resultatkort
        tittel={t('utvikling.design.stillingsprosent')}
        verdi={formaterTall(26.7, 1)}
        enhet="%"
        sammendrag="140 ÷ 525 × 100"
        steg={[
          { tekst: t('utvikling.design.steg1'), verdi: formaterTall(0.267, 3) },
          { tekst: t('utvikling.design.steg2'), verdi: formaterTall(26.7, 1) },
        ]}
      />
    </>
  );
}

export default function Designskisse() {
  const { t } = useTekst();
  return (
    <div class="side side-bred designskisse">
      <h1 tabIndex={-1}>{t('utvikling.design.tittel')}</h1>
      <p class="ingress">{t('utvikling.design.innledning')}</p>
      <Monster id="kort" tittel={t('utvikling.design.kort')} tekst={t('utvikling.design.kortTekst')}>
        {() => <Kalkulatorskjema t={t} />}
      </Monster>
      <Monster id="valg" tittel={t('utvikling.design.valg')} tekst={t('utvikling.design.valgTekst')}>
        {() => <Valgknapper t={t} />}
      </Monster>
      <Monster id="flater" tittel={t('utvikling.design.flater')} tekst={t('utvikling.design.flaterTekst')}>
        {() => <Oversikt t={t} />}
      </Monster>
      <Monster id="kolonner" tittel={t('utvikling.design.kolonner')} tekst={t('utvikling.design.kolonnerTekst')}>
        {(etter) => <Oppsett t={t} etter={etter} />}
      </Monster>
      <Monster id="lukkes" tittel={t('utvikling.design.lukkes')} tekst={t('utvikling.design.lukkesTekst')}>
        {(etter) => <Lukkes t={t} etter={etter} />}
      </Monster>
      <Monster id="tall" tittel={t('utvikling.design.tall')} tekst={t('utvikling.design.tallTekst')}>
        {() => <Tall t={t} />}
      </Monster>
    </div>
  );
}
