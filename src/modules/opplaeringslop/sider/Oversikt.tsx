// Utdanningsprogrammene, gruppert i studieforberedende, yrkesfaglige og påbygging, med søk etter program og tilbud
// (eier 02.10.2026). Hvert program fører til løpet. Gruppene er lukket fra start. Har brukeren valgt en skole som
// utdanning.no har tilbudene til, viser siden først programmene ved skolen, med bryteren «Min skole» / «Alle»
// (avgjørelse 053).
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import { erVariant, type Programgruppe } from '../../fag/tilbud/modell.ts';
import { kortKode } from '../data.ts';
import { Lasting, Rubrikk, Skolevalg, Tilbudslenke, useSkolevisning, useTilbudsdata } from './felles.tsx';
import type { Skoleoppforing } from '../skoler.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

const GRUPPER: readonly Programgruppe[] = ['studieforberedende', 'yrkesfaglig', 'pabygging'];
const MAKS_TREFF = 40;

/** Tilbudene som passer søket: navn eller kode. Tilbud i skole først, så lærefag, og varianter for særskilte skoler sist. */
function sokTilbud(indeks: Fagindeks, sok: string, malform: 'nb' | 'nn'): string[] {
  const ord = sok.toLowerCase().split(/\s+/).filter(Boolean);
  const rang = (k: string) => (erVariant(k) ? 2 : indeks.programomrader[k]?.sted === 'bedrift' ? 1 : 0);
  return Object.entries(indeks.programomrader)
    .filter(([k, po]) => {
      const tekst = `${po.navn[malform]} ${po.navn.nb} ${kortKode(k)} ${po.trinn}`.toLowerCase();
      return ord.every((o) => tekst.includes(o));
    })
    .map(([k]) => k)
    .sort((a, b) => rang(a) - rang(b) || (indeks.programomrader[a]?.trinn ?? '').localeCompare(indeks.programomrader[b]?.trinn ?? '') || a.localeCompare(b));
}

/** Lenker til skoleregisteret og opplæringskontorene (avgjørelse 053). */
function Registre() {
  const { t } = useTekst();
  const lenker = [
    { href: '#/opplaeringslop/skoler', tittel: t('opplaeringslop.skoler.tittel') },
    { href: '#/opplaeringslop/opplaeringskontor', tittel: t('opplaeringslop.kontor.tittel') },
  ];
  return (
    <section class="lop-registre" aria-label={t('opplaeringslop.registre')}>
      <h2 class="liten-overskrift">{t('opplaeringslop.registre')}</h2>
      <ul class="liste">
        {lenker.map((l) => (
          <li key={l.href}>
            <a class="listelenke" href={l.href}>
              <span class="listelenke-tekst">
                <span class="listelenke-tittel">{l.tittel}</span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Antall tilbud ved skolen i hvert utdanningsprogram. */
function tilbudPerProgram(indeks: Fagindeks, skole: Skoleoppforing | null): Map<string, number> {
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

export default function Oversikt() {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const [sok, settSok] = useState('');
  const aktivt = sok.trim().length >= 2;
  const visning = useSkolevisning();
  // Søketreff ved skolen brukeren har valgt, står først.
  const sokt = typeof data !== 'string' && aktivt ? sokTilbud(data.indeks, sok, malform) : [];
  const vedSkolen = new Set(visning.skole?.tilbud ?? []);
  const treff = [...sokt.filter((k) => vedSkolen.has(k)), ...sokt.filter((k) => !vedSkolen.has(k))];
  const perProgram = typeof data !== 'string' ? tilbudPerProgram(data.indeks, visning.skole) : new Map<string, number>();
  return (
    <div class="side lop-oversikt">
      <h1 tabIndex={-1}>{t('opplaeringslop.tittel')}</h1>
      <p class="dempet"><Begrepstekst tekst={t('opplaeringslop.innledning')} /></p>
      <Skolevalg visning={visning} />
      {typeof data === 'string' ? (
        <Lasting data={data} provIgjen={provIgjen} />
      ) : (
        <>
          <div class="sokeboks">
            <div class="sokefelt">
              <input
                type="search"
                class="tekstfelt"
                aria-label={t('opplaeringslop.oversikt.sok')}
                placeholder={t('opplaeringslop.oversikt.sok')}
                value={sok}
                onInput={(e) => settSok(e.currentTarget.value)}
              />
              <Ikon navn="sok" class="sokefelt-ikon" />
            </div>
            <p class="sokestatus" role="status" aria-live="polite">
              {aktivt ? (treff.length === 0 ? t('opplaeringslop.oversikt.ingenTreff') : t('opplaeringslop.oversikt.antallTreff', { antall: formaterTall(treff.length) })) : ''}
            </p>
          </div>
          {aktivt ? (
            <ul class="liste">
              {treff.slice(0, MAKS_TREFF).map((k) => (
                <li key={k}>
                  <Tilbudslenke indeks={data.indeks} kode={k} />
                </li>
              ))}
            </ul>
          ) : (
            <>
              {data.tilbud.skolear && <p class="liten dempet lop-skolear">{t('opplaeringslop.skolear', { skolear: data.tilbud.skolear.replace('-', '–') })}</p>}
              {visning.aktiv ? (
                <section class="lop-skoleprogram">
                  <h2 class="liten-overskrift">{t('opplaeringslop.visning.programmerTittel')}</h2>
                  <ul class="liste">
                    {data.tilbud.struktur
                      .filter((p) => (perProgram.get(p.program) ?? 0) > 0)
                      .map((p) => (
                        <li key={p.program}>
                          <Programlenke program={p.program} navn={p.navn[malform]} antall={perProgram.get(p.program) ?? 0} />
                        </li>
                      ))}
                  </ul>
                </section>
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
              <Registre />
            </>
          )}
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-grep' }, { id: 'udir-fag-og-timefordeling' }, { id: 'utdanning-no', punkt: 'Skoler' }, { id: 'udir-nor' }]} />
    </div>
  );
}
