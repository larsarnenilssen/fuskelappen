// Skissen til fase 9: hvordan brukerens egne regler vises på en side, i en kalkulator og i Innstillinger, og hvordan de
// skilles fra godkjente regler. Finnes bare i utvikling og testversjonen (docs/arbeidsordrer/fase-9-forslag.md).
import { Brodsmuler } from '../../components/Brodsmuler.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { Nivamerke, Statusmerke } from '../../components/Merker.tsx';
import { Sidetopp } from '../../components/Sidetopp.tsx';
import { ToKolonner } from '../../components/ToKolonner.tsx';
import { formaterTall } from '../../core/i18n/tekst.ts';
import { LokaleReglerKort } from '../lokaleregler/LokaleReglerKort.tsx';
import { type EgenRegel, GODKJENT_VERDI, nasjonalVerdi, status } from '../lokaleregler/skisse.ts';
import { Egenmerke, Egenregelkort, Lokalfot, medEnhet, Statuslinje, useEgneRegler, useSted } from '../lokaleregler/visning.tsx';
import { useTekst } from '../tilstand.ts';

/** Resultatkortet i Arbeidsplan med planfestet tid, slik det ser ut med en lokal verdi. Utregningen er åpnet. */
function Kalkulatorkort({ regel, egen, sted }: { regel: EgenRegel; egen: boolean; sted: string }) {
  const { t } = useTekst();
  const nokkel = 'sfs2213.planfestet_timer';
  const verdi = regel.verdi ?? 0;
  const nasjonal = Number(nasjonalVerdi(nokkel).verdi);
  const merker = egen ? (
    <Egenmerke verdi />
  ) : (
    <>
      <Nivamerke niva="skole" />
      <Statusmerke status="kontrollert" kontrollert={{ dato: regel.godkjent ?? '' }} />
    </>
  );
  return (
    <section class="resultatkort" aria-label={t('lokaleRegler.skisse.resultat')}>
      <div class="resultatkort-topp">
        <h2 class="resultatkort-tittel">{t('lokaleRegler.skisse.resultat')}</h2>
        <div class="merker merker-inline">{merker}</div>
      </div>
      <p class="resultatkort-verdi">
        <span class="tall">{formaterTall(verdi)}</span>
        <span class="resultatkort-enhet"> {nasjonalVerdi(nokkel).enhet}</span>
      </p>
      <ol class="utregning">
        <li>
          <span class="utregning-tekst">{t('lokaleRegler.skisse.stegPlanfestet')}</span>
          <span class="utregning-linje">
            <span class="utregning-verdi tall">{medEnhet(nokkel, verdi)}</span>
            {egen && <Egenmerke verdi />}
          </span>
          <span class="utregning-formel">
            {t('lokaleRegler.skisse.nasjonaltVar', { verdi: medEnhet(nokkel, nasjonal) })}
            {egen && (
              <>
                {' · '}
                <Statuslinje regel={regel} /> · <a href={`#/innstillinger/lokal-regel?kode=${regel.kode}`}>{t('lokaleRegler.endre')}</a>
              </>
            )}
          </span>
        </li>
        <li>
          <span class="utregning-tekst">{t('lokaleRegler.skisse.stegUke')}</span>
          <span class="utregning-linje">
            <span class="tall">{formaterTall(verdi)} ÷ 39,2 = </span>
            <span class="utregning-verdi tall">{formaterTall(verdi / 39.2, 1)}</span>
          </span>
        </li>
      </ol>
      {!egen && <Lokalfot regel={regel} sted={sted} />}
    </section>
  );
}

export default function LokaleReglerSkisse() {
  const { t } = useTekst();
  const sted = useSted();
  const regler = useEgneRegler();
  const paSiden = regler.filter((r) => r.type === 'regel' && status(r) !== 'godkjent');
  const godkjent = regler.find((r) => status(r) === 'godkjent');
  const egenVerdi = regler.find((r) => r.type === 'verdi' && r.nokkel === 'sfs2213.planfestet_timer' && status(r) !== 'godkjent');
  const skolenavn = sted.skole?.navn ?? sted.fylkesnavn ?? '';

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('innstillinger.tittel'), href: '#/innstillinger' }]} />
      <Sidetopp tittel={t('lokaleRegler.skisse.tittel')} />
      <p class="ingress">{t('lokaleRegler.skisse.ingress')}</p>
      <ToKolonner
        hoved={
          <>
            <section>
              <h2 class="liten-overskrift">{t('lokaleRegler.skisse.paSiden')}</h2>
              <p class="dempet liten">{t('lokaleRegler.skisse.paSidenTekst')}</p>
              <h3 class="lokaleregler-under">{t('lokaleRegler.skisse.skolensRegler')}</h3>
              <ul class="liste">
                <li>
                  <a class="listelenke" href="#/utvikling/lokale-regler">
                    <span class="listelenke-tekst">
                      <span class="listelenke-tittel">{t('lokaleRegler.skisse.ordensreglement')}</span>
                      <span class="listelenke-under">{t('skolemiljo.skoleregler.skolensReglerTekst')}</span>
                    </span>
                    <Ikon navn="hoyre" class="ikon-liten" />
                  </a>
                </li>
              </ul>
              {paSiden.map((r) => (
                <Egenregelkort key={r.kode} regel={r} />
              ))}
              {godkjent && (
                <article class="godkjentregel">
                  <div class="egenregel-topp">
                    <Nivamerke niva="skole" />
                    <Statusmerke status="kontrollert" kontrollert={{ dato: godkjent.godkjent ?? '' }} />
                  </div>
                  <h3 class="egenregel-tittel">{godkjent.tittel}</h3>
                  <p class="egenregel-tekst">{godkjent.tekst}</p>
                  <Lokalfot regel={godkjent} sted={skolenavn} />
                </article>
              )}
            </section>
            <section>
              <h2 class="liten-overskrift">{t('lokaleRegler.skisse.iInnstillinger')}</h2>
              <p class="dempet liten">{t('lokaleRegler.skisse.iInnstillingerTekst')}</p>
              <LokaleReglerKort />
            </section>
          </>
        }
        side={
          <section>
            <h2 class="liten-overskrift">{t('lokaleRegler.skisse.iKalkulatoren')}</h2>
            <p class="dempet liten">{t('lokaleRegler.skisse.iKalkulatorenTekst')}</p>
            {egenVerdi && (
              <>
                <h3 class="lokaleregler-under">{t('lokaleRegler.skisse.forGodkjenning')}</h3>
                <Kalkulatorkort regel={egenVerdi} egen sted={skolenavn} />
              </>
            )}
            <h3 class="lokaleregler-under">{t('lokaleRegler.skisse.etterGodkjenningTittel')}</h3>
            <Kalkulatorkort regel={GODKJENT_VERDI} egen={false} sted={skolenavn} />
          </section>
        }
      />
    </div>
  );
}
