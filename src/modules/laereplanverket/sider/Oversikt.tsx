// Læreplanverket (pakke 6, avgjørelse 037): søk i overordnet del, innholdsregisteret med lenker til hver del, og de
// grunnleggende ferdighetene og de tverrfaglige temaene med lenke til omtalen i overordnet del. Rubrikkene kan
// legges sammen, som i Opplæringsløp.
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Rubrikk } from '../../../components/Rubrikk.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { delRute, type Element, elementRute } from '../data.ts';
import type { Del } from '../typer.ts';
import { Lasting, Sok, delnavn, useLaereplanverket } from './felles.tsx';

/** Innholdsregisteret: hver del er en lenke, og delene inni står innrykket under. */
export function Innholdsregister({ deler }: { deler: readonly Del[] }) {
  const { malform } = useTekst();
  return (
    <ul class="innholdsregister">
      {deler.map((d) => (
        <li key={d.id}>
          <a href={`#${delRute(d)}`}>{delnavn(d, malform)}</a>
          {d.deler.length > 0 && <Innholdsregister deler={d.deler} />}
        </li>
      ))}
    </ul>
  );
}

function Elementliste({ elementer }: { elementer: readonly Element[] }) {
  const { malform } = useTekst();
  return (
    <ul class="liste">
      {elementer.map((e) => (
        <li key={e.kode}>
          <a class="listelenke" href={`#${elementRute(e.kode)}`}>
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{e.navn[malform]}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Oversikt() {
  const { t } = useTekst();
  const [data, provIgjen] = useLaereplanverket();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('laereplanverket.tittel')}</h1>
      <p class="dempet">{t('laereplanverket.innledning')}</p>
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : (
        <Sok od={data.od}>
          <Rubrikk nokkel="lv-overordnet" tittel={t('laereplanverket.overordnetDel')}>
            <p class="liten dempet">
              {t('laereplanverket.overordnetHjelp')} <a href="#/begreper/overordnet-del">{t('laereplanverket.omBegrep.overordnetDel')}</a>
            </p>
            <Innholdsregister deler={data.od.deler} />
          </Rubrikk>
          <Rubrikk nokkel="lv-ferdigheter" tittel={t('laereplanverket.ferdigheter')} hoyre={formaterTall(data.lv.ferdigheter.length)}>
            <p class="liten dempet">
              {t('laereplanverket.ferdigheterHjelp')} <a href="#/begreper/grunnleggende-ferdigheter">{t('laereplanverket.omBegrep.ferdigheter')}</a>
            </p>
            <Elementliste elementer={data.lv.ferdigheter} />
          </Rubrikk>
          <Rubrikk nokkel="lv-temaer" tittel={t('laereplanverket.temaer')} hoyre={formaterTall(data.lv.temaer.length)}>
            <p class="liten dempet">
              {t('laereplanverket.temaerHjelp')} <a href="#/begreper/tverrfaglige-temaer">{t('laereplanverket.omBegrep.temaer')}</a>
            </p>
            <Elementliste elementer={data.lv.temaer} />
          </Rubrikk>
        </Sok>
      )}
      <Kildeliste kilder={[{ id: 'udir-overordnet-del' }, { id: 'udir-grep' }]} />
    </div>
  );
}
