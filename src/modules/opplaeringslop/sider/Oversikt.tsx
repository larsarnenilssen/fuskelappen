// Utdanningsprogrammene, gruppert i studieforberedende, yrkesfaglige og påbygging. Hvert program fører til løpet.
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import type { Programgruppe } from '../../fag/tilbud/modell.ts';
import { Lasting, useTilbudsdata } from './felles.tsx';

const GRUPPER: readonly Programgruppe[] = ['studieforberedende', 'yrkesfaglig', 'pabygging'];

export default function Oversikt() {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('opplaeringslop.tittel')}</h1>
      <p class="dempet">{t('opplaeringslop.innledning')}</p>
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : (
        <>
          {data.tilbud.skolear && <p class="liten dempet">{t('opplaeringslop.skolear', { skolear: data.tilbud.skolear.replace('-', '–') })}</p>}
          {GRUPPER.map((g) => {
            const programmer = data.tilbud.struktur.filter((p) => p.gruppe === g);
            if (programmer.length === 0) return null;
            return (
              <section key={g} aria-labelledby={`gruppe-${g}`}>
                <h2 id={`gruppe-${g}`} class="liten-overskrift">
                  {t(`opplaeringslop.gruppe.${g}`)}
                </h2>
                <ul class="liste">
                  {programmer.map((p) => (
                    <li key={p.program}>
                      <a class="listelenke" href={`#/opplaeringslop/${p.program}`}>
                        <span class="listelenke-tekst">
                          <span class="listelenke-tittel">{p.navn[malform]}</span>
                          <span class="listelenke-under">{p.program}</span>
                        </span>
                        <Ikon navn="hoyre" class="ikon-liten" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-grep' }, { id: 'udir-fag-og-timefordeling' }]} />
    </div>
  );
}
