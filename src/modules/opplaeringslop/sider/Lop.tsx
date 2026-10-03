// Opplæringsløp: utdanningsprogrammene, gruppert i studieforberedende, yrkesfaglige og påbygging (eier 02.10.2026).
// Hvert program fører til løpet. Gruppene er lukket fra start. Har brukeren valgt en skole som utdanning.no har
// tilbudene til, viser siden først programmene ved skolen, med bryteren «Min skole» / «Alle» (avgjørelse 053).
// Egen underside under Opplæringstilbud (eier 03.10.2026).
import { useTekst } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { Programgruppe } from '../../fag/tilbud/modell.ts';
import type { Skoleoppforing } from '../skoler.ts';
import { Brodsmuler, Lasting, Rubrikk, Skolevalg, useSkolevisning, useTilbudsdata } from './felles.tsx';

const GRUPPER: readonly Programgruppe[] = ['studieforberedende', 'yrkesfaglig', 'pabygging'];

/** Antall tilbud ved skolen i hvert utdanningsprogram. */
export function tilbudPerProgram(indeks: Fagindeks, skole: Skoleoppforing | null): Map<string, number> {
  const ut = new Map<string, number>();
  for (const k of skole?.tilbud ?? []) {
    const p = indeks.programomrader[k]?.program;
    if (p) ut.set(p, (ut.get(p) ?? 0) + 1);
  }
  return ut;
}

/** Et utdanningsprogram i listen, med antall tilbud ved skolen brukeren har valgt. */
function Programlenke({ program, navn, antall }: { program: string; navn: string; antall: number }) {
  const { t } = useTekst();
  return (
    <a class="listelenke" href={`#/opplaeringslop/${program}`} data-skole={antall > 0 ? 'ja' : undefined}>
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{navn}</span>
        <span class="listelenke-under">
          {program}
          {antall > 0 && (
            <span class="lop-dinskole">
              <Ikon navn="hake" class="ikon-liten" />
              {antall === 1 ? t('opplaeringslop.visning.etVedSkolen') : t('opplaeringslop.visning.antallVedSkolen', { antall: formaterTall(antall) })}
            </span>
          )}
        </span>
      </span>
      <Ikon navn="hoyre" class="ikon-liten" />
    </a>
  );
}

export default function Lop() {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const visning = useSkolevisning();
  const perProgram = typeof data !== 'string' ? tilbudPerProgram(data.indeks, visning.skole) : new Map<string, number>();
  return (
    <div class="side lop-oversikt">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <h1 tabIndex={-1}>{t('opplaeringslop.lop.tittel')}</h1>
      <p class="ingress">
        <Begrepstekst tekst={t('opplaeringslop.lop.innledning')} />
      </p>
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : (
        <>
          <Skolevalg visning={visning} />
          {visning.aktiv ? (
            <ul class="liste">
              {data.tilbud.struktur
                .filter((p) => (perProgram.get(p.program) ?? 0) > 0)
                .map((p) => (
                  <li key={p.program}>
                    <Programlenke program={p.program} navn={p.navn[malform]} antall={perProgram.get(p.program) ?? 0} />
                  </li>
                ))}
            </ul>
          ) : (
            GRUPPER.map((g) => {
              const programmer = data.tilbud.struktur.filter((p) => p.gruppe === g);
              if (programmer.length === 0) return null;
              return (
                <Rubrikk key={g} nokkel={`lop-gruppe-${g}`} tittel={t(`opplaeringslop.gruppe.${g}`)} hoyre={formaterTall(programmer.length)} lukket>
                  <ul class="liste">
                    {programmer.map((p) => (
                      <li key={p.program}>
                        <Programlenke program={p.program} navn={p.navn[malform]} antall={perProgram.get(p.program) ?? 0} />
                      </li>
                    ))}
                  </ul>
                </Rubrikk>
              );
            })
          )}
          {data.tilbud.skolear && <p class="liten dempet lop-skolear">{t('opplaeringslop.skolear', { skolear: data.tilbud.skolear.replace('-', '–') })}</p>}
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-grep' }, { id: 'udir-fag-og-timefordeling' }, ...(visning.skole ? [{ id: 'utdanning-no', punkt: 'Skoler' }] : [])]} />
    </div>
  );
}
