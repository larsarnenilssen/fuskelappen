// Skissen til fase 9: hvordan brukerens egne regler vises på en side, i en kalkulator og i Innstillinger, og hvordan de
// skilles fra godkjente regler. Finnes bare i utvikling og testversjonen (docs/arbeidsordrer/fase-9-forslag.md).
import { Brodsmuler } from '../../components/Brodsmuler.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { Nivamerke, Statusmerke } from '../../components/Merker.tsx';
import { Sidetopp } from '../../components/Sidetopp.tsx';
import { ToKolonner } from '../../components/ToKolonner.tsx';
import { formaterTall } from '../../core/i18n/tekst.ts';
import { LokaleReglerKort } from '../lokaleregler/LokaleReglerKort.tsx';
import { nasjonalVerdi, status } from '../lokaleregler/skisse.ts';
import { Egenmerke, Egenregelkort, medEnhet, Statuslinje, useEgneRegler } from '../lokaleregler/visning.tsx';
import { useTekst } from '../tilstand.ts';

export default function LokaleReglerSkisse() {
  const { t } = useTekst();
  const regler = useEgneRegler();
  const paSiden = regler.filter((r) => r.type === 'regel' && status(r) !== 'godkjent');
  const godkjent = regler.find((r) => status(r) === 'godkjent');
  const verdi = regler.find((r) => r.type === 'verdi' && r.nokkel === 'sfs2213.planfestet_timer');
  const planfestet = verdi?.verdi ?? 1150;
  const nasjonal = 1150;

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
                  <p class="egenregel-fot">
                    <span class="egenregel-status">{t('lokaleRegler.tema.eksamen')}</span>
                  </p>
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
            <section class="resultatkort" aria-label={t('lokaleRegler.skisse.resultat')}>
              <div class="resultatkort-topp">
                <h2 class="resultatkort-tittel">{t('lokaleRegler.skisse.resultat')}</h2>
                <div class="merker merker-inline">{verdi && <Egenmerke verdi />}</div>
              </div>
              <p class="resultatkort-verdi">
                <span class="tall">{formaterTall(planfestet)}</span>
                <span class="resultatkort-enhet"> {nasjonalVerdi('sfs2213.planfestet_timer').enhet}</span>
              </p>
              <ol class="utregning">
                <li>
                  <span class="utregning-tekst">{t('lokaleRegler.skisse.stegPlanfestet')}</span>
                  <span class="utregning-linje">
                    <span class="utregning-verdi tall">{medEnhet('sfs2213.planfestet_timer', planfestet)}</span>
                    {verdi && <Egenmerke verdi />}
                  </span>
                  {verdi && (
                    <span class="utregning-formel">
                      {t('lokaleRegler.skisse.nasjonaltVar', { verdi: medEnhet('sfs2213.planfestet_timer', nasjonal) })} · <Statuslinje regel={verdi} /> ·{' '}
                      <a href={`#/innstillinger/lokal-regel?kode=${verdi.kode}`}>{t('lokaleRegler.endre')}</a>
                    </span>
                  )}
                </li>
                <li>
                  <span class="utregning-tekst">{t('lokaleRegler.skisse.stegUke')}</span>
                  <span class="utregning-linje">
                    <span class="tall">{formaterTall(planfestet)} ÷ 39,2 = </span>
                    <span class="utregning-verdi tall">{formaterTall(planfestet / 39.2, 1)}</span>
                  </span>
                </li>
              </ol>
            </section>
            <p class="dempet liten">
              {t('lokaleRegler.skisse.etterGodkjenning')} <Nivamerke niva="skole" /> <Statusmerke status="kontrollert" kontrollert={{ dato: '2026-10-03' }} />
            </p>
          </section>
        }
      />
    </div>
  );
}
