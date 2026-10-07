// «Lærlinger og kandidater» i Opplæringstilbud (fase 6, pakke 6, avgjørelse 069): veiene til fag- og svennebrev,
// praksisbrev og kompetansebevis, i tre faner etter hvorfor brukeren kommer. «Veiene»: velg mål og se veiene.
// «Sammenlign»: to veier side om side, og fellesfagene i alle veiene. «Bytte vei»: fra der brukeren er, til veiene
// videre, med vilkår og kilde. Fanen og valgene står i adressen. På skrivebord står «Veiene» og «Bytte vei» i to
// kolonner (eier 06.10.2026). Innholdet står i content/opplaeringslop/veier.yaml.
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { erstattAdresse } from '../../../app/ruter.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Bryter } from '../../../components/Bryter.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sammenligning } from '../../../components/Sammenligning.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import type { Flerspraak, Veimal } from '../../../core/innhold/skjema.ts';
import type { SideProps } from '../../typer.ts';
import { FAGBREV_RUTE, fraAdresse, maal, useVeier, veiAdresse, type Veielement, type Veiinnhold, veiRute } from '../fagbrev/data.ts';
import { Brodsmuler } from './felles.tsx';
import { Fakta, faktakilder, Fargeforklaring, Kildefot, Overgangskort, Stegrad } from './fagbrevDeler.tsx';
import { useBred } from '../../../components/ToKolonner.tsx';
import { Lukketkort } from '../../../components/Lukketkort.tsx';
import { LaereplassBoks } from '../../statistikk/komponenter.tsx';

type Fane = 'veiene' | 'sammenlign' | 'bytte';
const FANER: readonly Fane[] = ['veiene', 'sammenlign', 'bytte'];

/** Valgene i adressen. Veiene og utgangspunktet står med adressen sin (id-en uten «vei-» og «fra-»). */
interface Valg {
  fane: Fane;
  mal: Veimal;
  uten: boolean;
  a: string;
  b: string;
  fra: string;
  /** Veien som vises i kolonnen til høyre på skrivebord. */
  vei: string;
}

function lesValg(s: URLSearchParams): Valg {
  const fane = s.get('fane') ?? '';
  const mal = s.get('mal');
  return {
    fane: (FANER as readonly string[]).includes(fane) ? (fane as Fane) : 'veiene',
    mal: mal === 'praksisbrev' || mal === 'kompetansebevis' ? mal : 'fagbrev',
    uten: s.get('uten') === '1',
    a: s.get('a') ?? 'laerling',
    b: s.get('b') ?? 'fagbrev-pa-jobb',
    fra: s.get('fra') ?? 'vg2-yf',
    vei: s.get('vei') ?? '',
  };
}

function sporringFor(v: Valg): Record<string, string> {
  if (v.fane === 'sammenlign') return { fane: v.fane, a: v.a, b: v.b };
  if (v.fane === 'bytte') return { fane: v.fane, fra: v.fra };
  return { fane: v.fane, mal: v.mal, ...(v.uten ? { uten: '1' } : {}), ...(v.vei ? { vei: v.vei } : {}) };
}

type Endre = (v: Partial<Valg>) => void;

const finnVei = (data: Veiinnhold, adresse: string) => data.veier.find((v) => veiAdresse(v.id) === adresse);

/** Stegene, faktaene og knappen «Mer om …» for en vei: inni kortet på mobil, i kolonnen til høyre på skrivebord. */
function Veiinnhold({ vei, data }: { vei: Veielement; data: Veiinnhold }) {
  const { t, malform } = useTekst();
  return (
    <>
      <Stegrad vei={vei} />
      <Fakta vei={vei} data={data} />
      {/* Veien videre for den som vil vite mer: en tydelig knapp til siden for veien (eier 06.10.2026, runde 3). Den står
          over regelverket og kildene, som er lukkede rader nederst i kortet (eier 06.10.2026). */}
      <a class="knapp fb-mer" href={`#${veiRute(vei.id)}`}>
        <span class="fb-mer-tekst">
          <span>{t('opplaeringslop.fagbrev.lesMer', { rolle: vei.kortnavn[malform] })}</span>
          <span class="fb-mer-under">{t('opplaeringslop.fagbrev.lesMerTekst')}</span>
        </span>
        <Ikon navn="hoyre" />
      </a>
      <Kildefot kilder={faktakilder(vei, data)} fot />
    </>
  );
}

function Veiene({ data, valg, endre }: { data: Veiinnhold; valg: Valg; endre: Endre }) {
  const { t, malform } = useTekst();
  const bred = useBred();
  const veier = data.veier.filter((v) => v.mal === valg.mal && (!valg.uten || v.fellesfag === 'nei'));
  const valgt = veier.find((v) => veiAdresse(v.id) === valg.vei) ?? veier[0];
  const styring = (
    <>
      <Bryter
        legend={t('opplaeringslop.fagbrev.maal')}
        verdi={valg.mal}
        valg={[
          { verdi: 'fagbrev', tekst: t('opplaeringslop.fagbrev.maalValg.fagbrev'), tekstKort: t('opplaeringslop.fagbrev.maalValg.fagbrevKort') },
          { verdi: 'praksisbrev', tekst: t('opplaeringslop.fagbrev.maalValg.praksisbrev') },
          { verdi: 'kompetansebevis', tekst: t('opplaeringslop.fagbrev.maalValg.kompetansebevis') },
        ]}
        onEndring={(mal) => endre({ mal, uten: false, vei: '' })}
      />
      {valg.mal === 'fagbrev' && (
        <div class="sokefilter">
          <button type="button" class="sokefilter-valg" aria-pressed={valg.uten} onClick={() => endre({ uten: !valg.uten, vei: '' })}>
            {t('opplaeringslop.fagbrev.utenFellesfag')}
          </button>
        </div>
      )}
      {/* Kompetansebevis er også dokumentasjon for elever som ikke har fullført (eier 06.10.2026, svar 3). */}
      {valg.mal === 'kompetansebevis' && data.kompetansebevis && (
        <div class="merknad fb-merknad">
          <div dangerouslySetInnerHTML={{ __html: data.kompetansebevis.tekst[malform] }} />
          <Kildefot kilder={data.kompetansebevis.kilder} fot />
        </div>
      )}
      <p class="dempet liten" role="status">
        {veier.length === 1 ? t('opplaeringslop.fagbrev.enVei') : t('opplaeringslop.fagbrev.antallVeier', { antall: String(veier.length) })}
      </p>
      <Fargeforklaring />
    </>
  );
  // Skrivebord (fra 64rem): listen til venstre og den valgte veien til høyre (eier 06.10.2026, svar 6).
  if (bred) {
    return (
      <div class="fb-to fb-to-veiene">
        <div class="fb-to-hoved">
          {styring}
          <ul class="fb-velg-liste">
            {veier.map((v) => (
              <li key={v.id}>
                <button type="button" class="fb-velg" aria-pressed={v.id === valgt?.id} aria-controls="fb-valgt" onClick={() => endre({ vei: veiAdresse(v.id) })}>
                  <span class="fb-velg-tittel">{v.tittel[malform]}</span>
                  <span class="fb-velg-kort">{v.kort[malform]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {valgt && (
          <section id="fb-valgt" class="fb-to-side fb-valgt" aria-labelledby="fb-valgt-tittel" aria-live="polite">
            <h2 id="fb-valgt-tittel" class="fb-valgt-tittel">
              {valgt.tittel[malform]}
            </h2>
            <p class="fb-valgt-kort">{valgt.kort[malform]}</p>
            <Veiinnhold vei={valgt} data={data} />
          </section>
        )}
      </div>
    );
  }
  return (
    <>
      {styring}
      {veier.map((v) => (
        <Lukketkort key={v.id} tittel={v.tittel[malform]} smakebit={v.kort[malform]} klasse="fb-vei">
          <Veiinnhold vei={v} data={data} />
        </Lukketkort>
      ))}
    </>
  );
}

function Veivalg({ data, etikett, verdi, onEndring }: { data: Veiinnhold; etikett: string; verdi: string; onEndring: (adresse: string) => void }) {
  const { malform } = useTekst();
  const id = useId();
  return (
    <div class="felt">
      <label for={id}>{etikett}</label>
      <select id={id} value={verdi} onChange={(e) => onEndring(e.currentTarget.value)}>
        {data.veier.map((v) => (
          <option key={v.id} value={veiAdresse(v.id)}>
            {v.tittel[malform]}
          </option>
        ))}
      </select>
    </div>
  );
}

function Sammenlign({ data, valg, endre }: { data: Veiinnhold; valg: Valg; endre: Endre }) {
  const { t, malform } = useTekst();
  const a = finnVei(data, valg.a) ?? data.veier[0];
  const b = finnVei(data, valg.b) ?? data.veier[1];
  if (!a || !b) return null;
  const strek: Flerspraak = { nb: '–', nn: '–' };
  const rad = (id: string, tittel: string, f: (v: Veielement) => Flerspraak) => ({ id, tittel: { nb: tittel, nn: tittel }, venstre: f(a), hoyre: f(b) });
  const stegene = (v: Veielement): Flerspraak => {
    const tekst = (m: 'nb' | 'nn') => v.steg.map((s) => (s.tid ? `${s.tekst[m]} (${s.tid[m]})` : s.tekst[m])).join(' → ');
    return { nb: tekst('nb'), nn: tekst('nn') };
  };
  return (
    <>
      <div class="fb-velg-to">
        <Veivalg data={data} etikett={t('opplaeringslop.fagbrev.velgA')} verdi={veiAdresse(a.id)} onEndring={(adresse) => endre({ a: adresse })} />
        <Veivalg data={data} etikett={t('opplaeringslop.fagbrev.velgB')} verdi={veiAdresse(b.id)} onEndring={(adresse) => endre({ b: adresse })} />
      </div>
      <Sammenligning
        tittel={t('opplaeringslop.fagbrev.fane.sammenlign')}
        venstre={a.tittel[malform]}
        hoyre={b.tittel[malform]}
        rader={[
          rad('steg', t('opplaeringslop.fagbrev.stegene'), stegene),
          rad('kontrakt', t('opplaeringslop.fagbrev.kontrakt'), (v) => v.kontrakt),
          rad('prove', t('opplaeringslop.fagbrev.prove'), (v) => v.prove),
          rad('melder', t('opplaeringslop.fagbrev.melderOpp'), (v) => v.melderOpp),
          rad('fellesfag', t('opplaeringslop.fagbrev.fellesfag'), (v) => v.fellesfagTekst),
          rad('dok', t('opplaeringslop.fagbrev.dokumentasjon'), (v) => v.dokumentasjon),
          rad('voksne', t('opplaeringslop.fagbrev.voksne'), (v) => v.voksne ?? strek),
        ]}
        // Kildene til begge veiene som lukkede rader nederst i boksen, ikke som en rad i tabellen (eier 06.10.2026).
        kilder={[...a.kilder, ...b.kilder]}
      />
      {/* Lukket fra start: fellesfagene for de to veiene står allerede i boksen over (eier 06.10.2026, runde 2). */}
      <Lukketkort tittel={t('opplaeringslop.fagbrev.fellesfagListe')} smakebit={t('opplaeringslop.fagbrev.fellesfagListeTekst')}>
        <ul class="fb-fellesfag">
          {data.veier.map((v) => (
            <li key={v.id} data-krav={v.fellesfag}>
              <a href={`#${veiRute(v.id)}`}>{v.tittel[malform]}</a>
              <span class="fb-fellesfag-krav">
                <Ikon navn={v.fellesfag === 'ja' ? 'hake' : v.fellesfag === 'nei' ? 'lukk' : 'sporsmal'} class="ikon-liten" />
                {t(`opplaeringslop.fagbrev.fellesfagKrav.${v.fellesfag}`)}
              </span>
            </li>
          ))}
        </ul>
      </Lukketkort>
    </>
  );
}

function Bytte({ data, valg, endre }: { data: Veiinnhold; valg: Valg; endre: Endre }) {
  const { t, malform } = useTekst();
  const fra = data.utgangspunkter.find((u) => fraAdresse(u.id) === valg.fra) ?? data.utgangspunkter[0];
  if (!fra) return null;
  // «fra grunnskolen», men «fra Vg2 yrkesfag».
  const navn = fra.tittel[malform];
  const fraTekst = /^Vg\d/.test(navn) ? navn : navn.toLowerCase();
  return (
    <div class="fb-to fb-to-bytte">
      <div class="fb-to-hoved">
        <h2 class="liten-overskrift fb-hvor" id="fb-hvor">
          <Ikon navn="sted" />
          {t('opplaeringslop.fagbrev.hvorErDu')}
        </h2>
        <div class="sokefilter fb-fra" role="group" aria-labelledby="fb-hvor">
          {data.utgangspunkter.map((u) => (
            <button key={u.id} type="button" class="sokefilter-valg" aria-pressed={u.id === fra.id} onClick={() => endre({ fra: fraAdresse(u.id) })}>
              {u.tittel[malform]}
            </button>
          ))}
        </div>
      </div>
      <div class="fb-to-side">
        <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.veieneVidere', { fra: fraTekst })}</h2>
        <ul class="fb-overganger">
          {fra.overganger.map((o) => {
            const m = maal(data, o);
            return <Overgangskort key={m.rute + m.tittel.nb} rute={`#${m.rute}`} ikon="vei" tittel={m.tittel[malform]} vilkar={o.vilkar[malform]} />;
          })}
        </ul>
        {/* Regelverket og kildene til overgangene står samlet og lukket under kortene, og på siden hver vei går til (eier
            06.10.2026). */}
        <Kildefot kilder={fra.kilder} />
      </div>
    </div>
  );
}

export default function Fagbrev({ sporring }: SideProps) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const data = useVeier();
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
    <div class="side fb-side fb-bred">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <Sidetopp tittel={t('opplaeringslop.fagbrev.tittel')} favoritt="opplaeringslop:laerlinger-og-kandidater" />
      <p class="ingress">
        <Begrepstekst tekst={t('opplaeringslop.fagbrev.innledning')} />
      </p>
      {/* Læreplass i fylket (eier 07.10.2026, avgjørelse 080). */}
      <LaereplassBoks fylke={innstillinger.fylke} />
      <div class="fb-faner" role="tablist" aria-label={t('opplaeringslop.fagbrev.faner')}>
        {FANER.map((f) => (
          <button key={f} type="button" role="tab" id={`fb-fane-${f}`} class="fb-fane" aria-selected={valg.fane === f} aria-controls="fb-panel" onClick={() => endre({ fane: f })}>
            {t(`opplaeringslop.fagbrev.fane.${f}`)}
          </button>
        ))}
      </div>
      <div id="fb-panel" class="fb-panel" role="tabpanel" aria-labelledby={`fb-fane-${valg.fane}`}>
        {data === null ? (
          <p class="dempet">{t('app.lasterInn')}</p>
        ) : (
          <>
            {valg.fane === 'veiene' && <Veiene data={data} valg={valg} endre={endre} />}
            {valg.fane === 'sammenlign' && <Sammenlign data={data} valg={valg} endre={endre} />}
            {valg.fane === 'bytte' && <Bytte data={data} valg={valg} endre={endre} />}
          </>
        )}
      </div>
    </div>
  );
}
