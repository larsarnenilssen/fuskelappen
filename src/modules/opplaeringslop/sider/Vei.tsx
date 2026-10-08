// En vei for lærlinger og kandidater på egen side (fase 6, pakke 6, avgjørelse 069): sti øverst, prøven i Vurdering
// som første kort, stegene, «Om veien», og «Kommer fra» og «Veien videre» som knapper. Regelverket og kildene står som
// lukkede rader nederst i «Om veien» og under overgangene (eier 06.10.2026). På skrivebord står stegene og
// «Om veien» til venstre, og «Kommer fra» og «Veien videre» til høyre (eier 06.10.2026).
import { useTekst } from '../../../app/tilstand.ts';
import { lenke } from '../../../app/ruter.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import type { SideProps } from '../../typer.ts';
import { FAGBREV_RUTE, fraAdresse, kommerFra, maal, PROVE_RUTE, useVeier, veiAdresse, veienVidere } from '../fagbrev/data.ts';
import { Brodsmuler } from './felles.tsx';
import { Fakta, faktakilder, Fargeforklaring, Kildefot, Overgangskort, Stegrad } from './fagbrevDeler.tsx';

export default function Vei({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const data = useVeier();
  const sti = [
    { tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' },
    { tekst: t('opplaeringslop.fagbrev.tittel'), href: `#${FAGBREV_RUTE}` },
  ];
  if (data === null) {
    return (
      <div class="side">
        <Brodsmuler ledd={sti} />
        <p class="dempet">{t('app.lasterInn')}</p>
      </div>
    );
  }
  const vei = data.veier.find((v) => veiAdresse(v.id) === parametre.vei);
  if (!vei) {
    return (
      <div class="side">
        <Brodsmuler ledd={sti} />
        <h1 tabIndex={-1}>{t('opplaeringslop.fagbrev.ikkeFunnet')}</h1>
        <p>
          <a class="lenke-pil" href={`#${FAGBREV_RUTE}`}>
            {t('opplaeringslop.fagbrev.alleVeier')}
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </p>
      </div>
    );
  }
  const fra = kommerFra(data, vei);
  const videre = veienVidere(data, vei);
  return (
    <div class="side fb-side fb-bred">
      <Brodsmuler ledd={sti} />
      <Sidetopp tittel={vei.tittel[malform]} favoritt={`opplaeringslop:vei:${veiAdresse(vei.id)}`} />
      <div class="ingress" dangerouslySetInnerHTML={{ __html: vei.tekst[malform] }} />
      {/* Prøven står i Vurdering, og lenken er merket med modulen (mockup 3). */}
      <p class="fag-ifaget-i">{t('opplaeringslop.fagbrev.iVurdering')}</p>
      <a class="frist-inngang fb-prove" href={`#${PROVE_RUTE}`}>
        <span class="frist-inngang-tittel">
          <Ikon navn="kontor" />
          {vei.prove[malform]}
        </span>
        <span class="frist-inngang-neste">{t('opplaeringslop.fagbrev.proveTekst')}</span>
        <Ikon navn="hoyre" class="frist-inngang-pil" />
      </a>
      <div class="fb-to">
        <div class="fb-to-hoved">
          <section>
            <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.stegene')}</h2>
            <Fargeforklaring />
            <Stegrad vei={vei} />
          </section>
          {/* Faktaene om veien i en egen ramme, så de skiller seg fra stegene og overgangene (eier 06.10.2026, runde 2). */}
          <section class="kort kort-med-topp fb-om" aria-labelledby="fb-om">
            <h2 class="liten-overskrift" id="fb-om">
              {t('opplaeringslop.fagbrev.omVeien')}
            </h2>
            <Fakta vei={vei} data={data} med="alt" />
            <Kildefot kilder={faktakilder(vei, data, 'alt')} fot />
          </section>
        </div>
        <div class="fb-to-side">
          {fra.length > 0 && (
            <section>
              <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.kommerFra')}</h2>
              <ul class="fb-overganger">
                {fra.map(({ fra: u, overgang }) => (
                  <Overgangskort key={u.id} rute={lenke(FAGBREV_RUTE, { fane: 'bytte', fra: fraAdresse(u.id) })} ikon="sted" tittel={u.tittel[malform]} vilkar={overgang.vilkar[malform]} />
                ))}
              </ul>
              <Kildefot kilder={fra.flatMap((f) => f.overgang.kilder)} />
            </section>
          )}
          {videre.length > 0 && (
            <section>
              <h2 class="liten-overskrift">{t('opplaeringslop.fagbrev.veienVidere')}</h2>
              <ul class="fb-overganger">
                {videre.map((o) => {
                  const m = maal(data, o);
                  return <Overgangskort key={m.rute + m.tittel.nb} rute={`#${m.rute}`} ikon="vei" tittel={m.tittel[malform]} vilkar={o.vilkar[malform]} />;
                })}
              </ul>
              <Kildefot kilder={videre.flatMap((o) => o.kilder)} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
