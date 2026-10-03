// Utdanningsprogrammene, gruppert i studieforberedende, yrkesfaglige og påbygging, med søk etter program og tilbud
// (eier 02.10.2026). Hvert program fører til løpet. Gruppene er lukket fra start.
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import { erVariant, type Programgruppe } from '../../fag/tilbud/modell.ts';
import { kortKode } from '../data.ts';
import { Lasting, Rubrikk, Tilbudslenke, useTilbudsdata, useValgtSkole } from './felles.tsx';
import { lenke } from '../../../app/ruter.ts';
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

/** Lenker til skoleregisteret og opplæringskontorene, og til tilbudene ved skolen brukeren har valgt (avgjørelse 053). */
function Registre() {
  const { t } = useTekst();
  const skole = useValgtSkole();
  const lenker = [
    ...(skole?.nr ? [{ href: lenke('/opplaeringslop/skoler', { fylke: 'alle', skole: skole.nr }), tittel: t('opplaeringslop.tilbudVedSkolen', { skole: skole.navn }) }] : []),
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

export default function Oversikt() {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const [sok, settSok] = useState('');
  const aktivt = sok.trim().length >= 2;
  const treff = typeof data !== 'string' && aktivt ? sokTilbud(data.indeks, sok, malform) : [];
  return (
    <div class="side lop-oversikt">
      <h1 tabIndex={-1}>{t('opplaeringslop.tittel')}</h1>
      <p class="dempet"><Begrepstekst tekst={t('opplaeringslop.innledning')} /></p>
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
              {GRUPPER.map((g) => {
                const programmer = data.tilbud.struktur.filter((p) => p.gruppe === g);
                if (programmer.length === 0) return null;
                return (
                  <Rubrikk key={g} nokkel={`lop-gruppe-${g}`} tittel={t(`opplaeringslop.gruppe.${g}`)} hoyre={formaterTall(programmer.length)} lukket>
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
                  </Rubrikk>
                );
              })}
              <Registre />
            </>
          )}
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-grep' }, { id: 'udir-fag-og-timefordeling' }, { id: 'utdanning-no', punkt: 'Skoler' }, { id: 'udir-nor' }]} />
    </div>
  );
}
