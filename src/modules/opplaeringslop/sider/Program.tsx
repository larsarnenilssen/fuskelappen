// Løpet i et utdanningsprogram: fra vg1 (inngangen) videre til vg2 og vg3 eller lærefag, som et tre. Grenene er
// lukket fra start, så løpet er oversiktlig, og streken i treet ender ved det siste tilbudet (eier 02.10.2026).
// Tilbudene ved skolen brukeren har valgt, har egen farge, og knappen til neste trinn får fargen når løpet videre har
// tilbud ved skolen. Med «Min skole» starter løpet fra tilbudene ved skolen (avgjørelse 053).
import { useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { erVariant } from '../../fag/tilbud/modell.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import { trinnTekst } from '../../fag/visning.ts';
import type { SideProps } from '../../typer.ts';
import { kortKode, skoleForst, type Tilbudene } from '../data.ts';
import { Brodsmuler, Lasting, Rubrikk, Skolevalg, Tilbudslenke, useSkolevisning, useTilbudsdata } from './felles.tsx';

/**
 * Et tilbud med en knapp som viser tilbudene det fører videre til i samme program. `sett` hindrer at et tilbud
 * vises to ganger i samme gren.
 */
/** Har løpet videre fra tilbudet (alle trinn) et tilbud ved skolen? */
function skoleVidere(kode: string, tilbud: Tilbudene, skole: ReadonlySet<string>, sett: Set<string> = new Set()): boolean {
  if (sett.has(kode)) return false;
  sett.add(kode);
  return (tilbud.tilbud[kode]?.videre ?? []).some((k) => skole.has(k) || skoleVidere(k, tilbud, skole, sett));
}

function Gren({ kode, indeks, tilbud, sett, skole }: { kode: string; indeks: Fagindeks; tilbud: Tilbudene; sett: ReadonlySet<string>; skole: ReadonlySet<string> }) {
  const { t } = useTekst();
  // Tilbudene ved skolen står først blant tilbudene videre.
  const alleVidere = skoleForst((tilbud.tilbud[kode]?.videre ?? []).filter((k) => !sett.has(k)), indeks);
  const videre = [...alleVidere.filter((k) => skole.has(k)), ...alleVidere.filter((k) => !skole.has(k))];
  const neste = new Set([...sett, kode]);
  const [lukket, veksle] = useSammenlagt(`lop-gren-${kortKode(kode)}`, true);
  const id = useId();
  // «Vis 7 tilbud på vg2»: trinnet til tilbudene videre, når alle er på samme trinn.
  const trinn = [...new Set(videre.map((k) => indeks.programomrader[k]?.trinn))];
  // «Bedrift» er ikke et trinn i setningen. Da står det «Vis 2 tilbud videre».
  const paTrinn = trinn.length === 1 && trinn[0] && trinn[0] !== 'Bedrift' ? trinnTekst(t, trinn[0]).toLowerCase() : null;
  const tekst = lukket
    ? paTrinn
      ? t('opplaeringslop.program.visVidere', { antall: formaterTall(videre.length), trinn: paTrinn })
      : t('opplaeringslop.program.visVidereBlandet', { antall: formaterTall(videre.length) })
    : paTrinn
      ? t('opplaeringslop.program.skjulVidere', { trinn: paTrinn })
      : t('opplaeringslop.program.skjulVidereBlandet');
  const po = indeks.programomrader[kode];
  const direkte = videre.filter((k) => skole.has(k)).length;
  const lenger = direkte === 0 && skoleVidere(kode, tilbud, skole, new Set(sett));
  const vedSkolen = direkte > 0 ? t('opplaeringslop.visning.vedSkolenDin', { antall: formaterTall(direkte) }) : lenger ? t('opplaeringslop.visning.vedSkolenLenger') : null;
  return (
    <li>
      {/* Tilbudet og knappen til neste trinn er ett kort, så det er tydelig hva knappen åpner (eier 02.10.2026). */}
      <div class="lop-kort" data-sted={po?.sted} data-skole={skole.has(kode) ? 'ja' : undefined}>
        <Tilbudslenke indeks={indeks} kode={kode} />
        {videre.length > 0 && (
          <button type="button" class="lop-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle} data-skole={vedSkolen ? 'ja' : undefined}>
            <span>
              {tekst}
              {vedSkolen && <span class="lop-knapp-skole"> · {vedSkolen}</span>}
            </span>
            <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
          </button>
        )}
      </div>
      {videre.length > 0 && (
        <ul id={id} class="lop-videre" hidden={lukket}>
          {videre.map((k) => (
            <Gren key={k} kode={k} indeks={indeks} tilbud={tilbud} sett={neste} skole={skole} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Program({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const visning = useSkolevisning();
  const program = (parametre.program ?? '').toUpperCase();
  if (typeof data === 'string') {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('opplaeringslop.tittel')}</h1>
        <Lasting data={data} provIgjen={provIgjen} />
      </div>
    );
  }
  const struktur = data.tilbud.struktur.find((p) => p.program === program);
  if (!struktur) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('opplaeringslop.ikkeFunnet')}</h1>
      </div>
    );
  }
  const skole = new Set(visning.skole?.tilbud ?? []);
  // Tilbudene ved skolen står først, også med «Alle» (eier 03.10.2026).
  const skoleforst = (koder: readonly string[]) => [...koder.filter((k) => skole.has(k)), ...koder.filter((k) => !skole.has(k))];
  const hoved = skoleforst(struktur.inngang.filter((k) => !erVariant(k)));
  const varianter = skoleforst(struktur.inngang.filter((k) => erVariant(k)));
  // Med «Min skole» starter løpet fra tilbudene ved skolen i programmet som ikke bygger på et annet tilbud ved skolen.
  const vedSkolen = [...skole].filter((k) => data.indeks.programomrader[k]?.program === program);
  const skolestart = vedSkolen
    .filter((k) => !(data.tilbud.tilbud[k]?.fra ?? []).some((f) => skole.has(f) && data.indeks.programomrader[f]?.program === program))
    .sort((a, b) => (data.indeks.programomrader[a]?.trinn ?? '').localeCompare(data.indeks.programomrader[b]?.trinn ?? '') || a.localeCompare(b));
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <h1 tabIndex={-1}>{struktur.navn[malform]}</h1>
      <p class="dempet">{t(`opplaeringslop.gruppe.${struktur.gruppe}`)}</p>
      <Skolevalg visning={visning} />
      <p class="liten dempet">{t('opplaeringslop.program.lopHjelp')}</p>
      {visning.aktiv && visning.skole ? (
        skolestart.length > 0 ? (
          <ul class="lop">
            {skolestart.map((k) => (
              <Gren key={k} kode={k} indeks={data.indeks} tilbud={data.tilbud} sett={new Set()} skole={skole} />
            ))}
          </ul>
        ) : (
          <p class="merknad">
            {t('opplaeringslop.visning.ingenIProgram', { skole: visning.skole.navn })}{' '}
            <button type="button" class="lenkeknapp" onClick={() => visning.settVisning('alle')}>
              {t('opplaeringslop.visning.visAlle')}
            </button>
          </p>
        )
      ) : (
        <ul class="lop">
          {hoved.map((k) => (
            <Gren key={k} kode={k} indeks={data.indeks} tilbud={data.tilbud} sett={new Set()} skole={skole} />
          ))}
        </ul>
      )}
      {!visning.aktiv && varianter.length > 0 && (
        <Rubrikk nokkel={`lop-${program}-varianter`} tittel={t('opplaeringslop.program.varianter')} hoyre={formaterTall(varianter.length)} lukket>
          <p class="liten dempet">{t('opplaeringslop.program.variantHjelp')}</p>
          <ul class="lop">
            {varianter.map((k) => (
              <Gren key={k} kode={k} indeks={data.indeks} tilbud={data.tilbud} sett={new Set()} skole={skole} />
            ))}
          </ul>
        </Rubrikk>
      )}
      {!visning.aktiv && struktur.utenfor.length > 0 && (
        <Rubrikk nokkel={`lop-${program}-utenfor`} tittel={t('opplaeringslop.program.utenfor')} hoyre={formaterTall(struktur.utenfor.length)} lukket>
          <p class="liten dempet">{t('opplaeringslop.program.utenforHjelp')}</p>
          <ul class="liste">
            {struktur.utenfor.map((k) => (
              <li key={k}>
                <Tilbudslenke indeks={data.indeks} kode={k} />
              </li>
            ))}
          </ul>
        </Rubrikk>
      )}
      <Kildeliste kilder={[{ id: 'udir-grep', punkt: program }, { id: 'udir-fag-og-timefordeling' }, ...(visning.skole ? [{ id: 'utdanning-no', punkt: 'Skoler' }] : [])]} />
    </div>
  );
}
