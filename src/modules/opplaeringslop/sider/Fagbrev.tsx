// «Fag- og svennebrev» i Opplæringstilbud (MOCKUP, fase 6, pakke 6, mockup 3 og 4 fra 04.10.2026): veiene til fag- og
// svennebrev, praksisbrev og kompetansebevis, i tre faner etter hvorfor brukeren kommer. «Veiene»: velg mål og se
// veiene, lukket fra start. «Sammenlign»: to veier side om side, og fellesfagene som egen liste. «Bytte vei»: fra der
// brukeren er, til veiene videre, med vilkår og kilde. Fanen og valgene står i adressen.
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { erstattAdresse } from '../../../app/ruter.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Bryter } from '../../../components/Bryter.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sammenligning } from '../../../components/Sammenligning.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import type { SideProps } from '../../typer.ts';
import { finnVei, maal, type Mal, UTGANGSPUNKTER, type Vei, VEIER } from '../fagbrev/mockup.ts';
import { Brodsmuler } from './felles.tsx';
import { FAGBREV_RUTE, Fakta, Fargeforklaring, Overgangskort, Stegrad, veiRute } from './fagbrevDeler.tsx';

type Fane = 'veiene' | 'sammenlign' | 'bytte';
const FANER: readonly Fane[] = ['veiene', 'sammenlign', 'bytte'];

interface Valg {
  fane: Fane;
  mal: Mal;
  uten: boolean;
  a: string;
  b: string;
  fra: string;
}

function lesValg(s: URLSearchParams): Valg {
  const fane = s.get('fane') ?? '';
  const mal = s.get('mal');
  const vei = (id: string | null, standard: string) => (id && finnVei(id) ? id : standard);
  const fra = s.get('fra');
  return {
    fane: (FANER as readonly string[]).includes(fane) ? (fane as Fane) : 'veiene',
    mal: mal === 'praksisbrev' || mal === 'kompetansebevis' ? mal : 'fagbrev',
    uten: s.get('uten') === '1',
    a: vei(s.get('a'), 'laerling'),
    b: vei(s.get('b'), 'fagbrev-pa-jobb'),
    fra: fra && UTGANGSPUNKTER.some((u) => u.id === fra) ? fra : 'vg2-yf',
  };
}

function sporringFor(v: Valg): Record<string, string> {
  if (v.fane === 'sammenlign') return { fane: v.fane, a: v.a, b: v.b };
  if (v.fane === 'bytte') return { fane: v.fane, fra: v.fra };
  return { fane: v.fane, mal: v.mal, ...(v.uten ? { uten: '1' } : {}) };
}

type Endre = (v: Partial<Valg>) => void;

/** En vei som et lukket kort: tittelen og en linje, og stegene og faktaene når det åpnes. */
function Veikort({ vei }: { vei: Vei }) {
  const { t } = useTekst();
  const [aapen, settAapen] = useState(false);
  const id = `vei-${vei.id}`;
  return (
    <div class="innholdskort fb-vei">
      <button type="button" class="innholdskort-knapp" aria-expanded={aapen} aria-controls={id} onClick={() => settAapen(!aapen)}>
        <span class="innholdskort-topp">
          <span class="innholdskort-tittel">{vei.tittel}</span>
          <span class="innholdskort-smakebit">{vei.kort}</span>
        </span>
        <Ikon navn={aapen ? 'opp' : 'ned'} class="innholdskort-pil" />
      </button>
      <div id={id} class="innholdskort-innhold" hidden={!aapen}>
        <Stegrad vei={vei} />
        <Fakta vei={vei} />
        <a class="lenke-pil" href={`#${veiRute(vei.id)}`}>
          {t('opplaeringslop.fagbrev.lesMer')}
          <Ikon navn="hoyre" class="ikon-liten" />
        </a>
      </div>
    </div>
  );
}

function Veiene({ valg, endre }: { valg: Valg; endre: Endre }) {
  const { t } = useTekst();
  const veier = VEIER.filter((v) => v.mal === valg.mal && (!valg.uten || v.fellesfag === 'nei'));
  return (
    <>
      <Bryter
        legend={t('opplaeringslop.fagbrev.maal')}
        verdi={valg.mal}
        valg={[
          { verdi: 'fagbrev', tekst: t('opplaeringslop.fagbrev.maalValg.fagbrev'), tekstKort: t('opplaeringslop.fagbrev.maalValg.fagbrevKort') },
          { verdi: 'praksisbrev', tekst: t('opplaeringslop.fagbrev.maalValg.praksisbrev') },
          { verdi: 'kompetansebevis', tekst: t('opplaeringslop.fagbrev.maalValg.kompetansebevis') },
        ]}
        onEndring={(mal) => endre({ mal, uten: false })}
      />
      {valg.mal === 'fagbrev' && (
        <div class="sokefilter">
          <button type="button" class="sokefilter-valg" aria-pressed={valg.uten} onClick={() => endre({ uten: !valg.uten })}>
            {t('opplaeringslop.fagbrev.utenFellesfag')}
          </button>
        </div>
      )}
      <p class="dempet liten" role="status">
        {t('opplaeringslop.fagbrev.antallVeier', { antall: String(veier.length) })}
      </p>
      <Fargeforklaring />
      {veier.map((v) => (
        <Veikort key={v.id} vei={v} />
      ))}
    </>
  );
}

function Veivalg({ etikett, verdi, onEndring }: { etikett: string; verdi: string; onEndring: (id: string) => void }) {
  const id = useId();
  return (
    <div class="felt">
      <label for={id}>{etikett}</label>
      <select id={id} value={verdi} onChange={(e) => onEndring(e.currentTarget.value)}>
        {VEIER.map((v) => (
          <option key={v.id} value={v.id}>
            {v.tittel}
          </option>
        ))}
      </select>
    </div>
  );
}

function Sammenlign({ valg, endre }: { valg: Valg; endre: Endre }) {
  const { t } = useTekst();
  const a = finnVei(valg.a);
  const b = finnVei(valg.b);
  if (!a || !b) return null;
  const rad = (id: string, tittel: string, f: (v: Vei) => string) => ({ id, tittel: { nb: tittel, nn: tittel }, venstre: { nb: f(a), nn: f(a) }, hoyre: { nb: f(b), nn: f(b) } });
  return (
    <>
      <div class="fb-velg-to">
        <Veivalg etikett={t('opplaeringslop.fagbrev.velgA')} verdi={valg.a} onEndring={(a) => endre({ a })} />
        <Veivalg etikett={t('opplaeringslop.fagbrev.velgB')} verdi={valg.b} onEndring={(b) => endre({ b })} />
      </div>
      <Sammenligning
        tittel={t('opplaeringslop.fagbrev.fane.sammenlign')}
        venstre={a.tittel}
        hoyre={b.tittel}
        rader={[
          rad('steg', t('opplaeringslop.fagbrev.stegene'), (v) => v.steg.map((s) => (s.tid ? `${s.tekst} (${s.tid})` : s.tekst)).join(' → ')),
          rad('kontrakt', t('opplaeringslop.fagbrev.kontrakt'), (v) => v.kontrakt),
          rad('prove', t('opplaeringslop.fagbrev.prove'), (v) => v.prove),
          rad('melder', t('opplaeringslop.fagbrev.melderOpp'), (v) => v.melderOpp),
          rad('fellesfag', t('opplaeringslop.fagbrev.fellesfag'), (v) => v.fellesfagTekst),
          rad('dok', t('opplaeringslop.fagbrev.dokumentasjon'), (v) => v.dokumentasjon),
          rad('voksne', t('opplaeringslop.fagbrev.voksne'), (v) => v.voksne),
          rad('kilde', t('opplaeringslop.fagbrev.kilde'), (v) => v.kilder.join(', ')),
        ]}
      />
      <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.fellesfagListe')}</h2>
      <ul class="fb-fellesfag">
        {VEIER.map((v) => (
          <li key={v.id} data-krav={v.fellesfag}>
            <a href={`#${veiRute(v.id)}`}>{v.tittel}</a>
            <span class="fb-fellesfag-krav">
              <Ikon navn={v.fellesfag === 'ja' ? 'hake' : v.fellesfag === 'nei' ? 'lukk' : 'sporsmal'} class="ikon-liten" />
              {t(`opplaeringslop.fagbrev.fellesfagKrav.${v.fellesfag}`)}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Bytte({ valg, endre }: { valg: Valg; endre: Endre }) {
  const { t } = useTekst();
  const fra = UTGANGSPUNKTER.find((u) => u.id === valg.fra);
  if (!fra) return null;
  // «fra grunnskolen», men «fra Vg2 yrkesfag».
  const fraTekst = /^Vg\d/.test(fra.tittel) ? fra.tittel : fra.tittel.toLowerCase();
  return (
    <>
      <h2 class="liten-overskrift" id="fb-hvor">
        {t('opplaeringslop.fagbrev.hvorErDu')}
      </h2>
      <div class="sokefilter" role="group" aria-labelledby="fb-hvor">
        {UTGANGSPUNKTER.map((u) => (
          <button key={u.id} type="button" class="sokefilter-valg" aria-pressed={u.id === fra.id} onClick={() => endre({ fra: u.id })}>
            {u.tittel}
          </button>
        ))}
      </div>
      <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.veieneVidere', { fra: fraTekst })}</h2>
      <ul class="fb-overganger">
        {fra.overganger.map((o) => {
          const m = maal(o);
          return <Overgangskort key={o.til} rute={`#${m.rute}`} ikon="vei" tittel={m.tittel} vilkar={o.vilkar} kilder={o.kilder} />;
        })}
      </ul>
    </>
  );
}

export default function Fagbrev({ sporring }: SideProps) {
  const { t } = useTekst();
  const [valg, settValg] = useState<Valg>(() => lesValg(sporring));
  // En ny adresse mens siden vises (f.eks. «Kommer fra» på en vei), er samme side, så valgene leses på nytt.
  const fraAdressen = sporring.toString();
  useEffect(() => settValg(lesValg(new URLSearchParams(fraAdressen))), [fraAdressen]);
  const endre: Endre = (endring) => {
    const neste = { ...valg, ...endring };
    settValg(neste);
    erstattAdresse(FAGBREV_RUTE, sporringFor(neste));
  };
  return (
    <div class="side fb-side">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <Sidetopp tittel={t('opplaeringslop.fagbrev.tittel')} favoritt="opplaeringslop:fag-og-svennebrev" />
      <p class="ingress">
        <Begrepstekst tekst={t('opplaeringslop.fagbrev.innledning')} />
      </p>
      <p class="merknad merknad-advarsel">{t('opplaeringslop.fagbrev.mockup')}</p>
      <div class="fb-faner" role="tablist" aria-label={t('opplaeringslop.fagbrev.faner')}>
        {FANER.map((f) => (
          <button key={f} type="button" role="tab" id={`fb-fane-${f}`} class="fb-fane" aria-selected={valg.fane === f} aria-controls="fb-panel" onClick={() => endre({ fane: f })}>
            {t(`opplaeringslop.fagbrev.fane.${f}`)}
          </button>
        ))}
      </div>
      <div id="fb-panel" class="fb-panel" role="tabpanel" aria-labelledby={`fb-fane-${valg.fane}`}>
        {valg.fane === 'veiene' && <Veiene valg={valg} endre={endre} />}
        {valg.fane === 'sammenlign' && <Sammenlign valg={valg} endre={endre} />}
        {valg.fane === 'bytte' && <Bytte valg={valg} endre={endre} />}
      </div>
    </div>
  );
}
