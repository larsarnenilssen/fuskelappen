// En vei til fag- og svennebrev, praksisbrev eller kompetansebevis på egen side (MOCKUP, fase 6, pakke 6, mockup 3):
// sti øverst, prøven i Vurdering som første kort, stegene, faktaene, og «Kommer fra» og «Veien videre» som knapper.
import { useTekst } from '../../../app/tilstand.ts';
import { lenke } from '../../../app/ruter.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import type { SideProps } from '../../typer.ts';
import { finnVei, kommerFra, maal, PROVE_RUTE, veienVidere } from '../fagbrev/mockup.ts';
import { Brodsmuler } from './felles.tsx';
import { FAGBREV_RUTE, Fakta, Fargeforklaring, Overgangskort, Stegrad } from './fagbrevDeler.tsx';

export default function Vei({ parametre }: SideProps) {
  const { t } = useTekst();
  const vei = finnVei(parametre.vei ?? '');
  const sti = [
    { tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' },
    { tekst: t('opplaeringslop.fagbrev.tittel'), href: `#${FAGBREV_RUTE}` },
  ];
  if (!vei) {
    return (
      <div class="side">
        <Brodsmuler ledd={sti} />
        <h1 tabIndex={-1}>{t('opplaeringslop.ikkeFunnet')}</h1>
      </div>
    );
  }
  const fra = kommerFra(vei.id);
  const videre = veienVidere(vei);
  return (
    <div class="side fb-side fb-bred">
      <Brodsmuler ledd={sti} />
      <Sidetopp tittel={vei.tittel} favoritt={`opplaeringslop:vei:${vei.id}`} />
      <p class="ingress">{vei.ingress}</p>
      <p class="merknad merknad-advarsel">{t('opplaeringslop.fagbrev.mockup')}</p>
      {/* Prøven står i Vurdering, og lenken er merket med modulen (mockup 3). */}
      <p class="fag-ifaget-i">{t('opplaeringslop.fagbrev.iVurdering')}</p>
      <a class="frist-inngang fb-prove" href={`#${PROVE_RUTE}`}>
        <span class="frist-inngang-tittel">
          <Ikon navn="kontor" />
          {vei.prove}
        </span>
        <span class="frist-inngang-neste">{t('opplaeringslop.fagbrev.proveTekst')}</span>
        <Ikon navn="hoyre" class="frist-inngang-pil" />
      </a>
      {/* Skrivebord: stegene og «Om veien» til venstre, «Kommer fra» og «Veien videre» øverst til høyre (eier 06.10.2026, svar 6). */}
      <div class="fb-to">
        <div class="fb-to-hoved">
          <section>
            <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.stegene')}</h2>
            <Fargeforklaring />
            <Stegrad vei={vei} />
          </section>
          {/* Faktaene om veien i en egen ramme, så de skiller seg fra stegene og overgangene (eier 06.10.2026, runde 2). */}
          <section class="fb-om" aria-labelledby="fb-om">
            <h2 class="liten-overskrift" id="fb-om">
              {t('opplaeringslop.fagbrev.omVeien')}
            </h2>
            <Fakta vei={vei} med="alt" />
          </section>
        </div>
        <div class="fb-to-side">
          {fra.length > 0 && (
            <section>
              <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.kommerFra')}</h2>
              <ul class="fb-overganger">
                {fra.map(({ fra: u, overgang }) => (
                  <Overgangskort key={u.id} rute={lenke(FAGBREV_RUTE, { fane: 'bytte', fra: u.id })} ikon="sted" tittel={u.tittel} vilkar={overgang.vilkar} kilder={overgang.kilder} />
                ))}
              </ul>
            </section>
          )}
          {videre.length > 0 && (
            <section>
              <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.veienVidere')}</h2>
              <ul class="fb-overganger">
                {videre.map((o) => {
                  const m = maal(o);
                  return <Overgangskort key={o.til} rute={`#${m.rute}`} ikon="vei" tittel={m.tittel} vilkar={o.vilkar} kilder={o.kilder} />;
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
