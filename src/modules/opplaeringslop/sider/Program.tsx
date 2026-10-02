// Løpet i et utdanningsprogram: fra vg1 (inngangen) videre til vg2 og vg3 eller lærefag, som et tre. Grenene er
// lukket fra start, så løpet er oversiktlig, og streken i treet ender ved det siste tilbudet (eier 02.10.2026).
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
import { kortKode, type Tilbudene } from '../data.ts';
import { Brodsmuler, Lasting, Rubrikk, Tilbudslenke, useTilbudsdata } from './felles.tsx';

/**
 * Et tilbud med en knapp som viser tilbudene det fører videre til i samme program. `sett` hindrer at et tilbud
 * vises to ganger i samme gren.
 */
function Gren({ kode, indeks, tilbud, sett }: { kode: string; indeks: Fagindeks; tilbud: Tilbudene; sett: ReadonlySet<string> }) {
  const { t } = useTekst();
  const videre = (tilbud.tilbud[kode]?.videre ?? []).filter((k) => !sett.has(k));
  const neste = new Set([...sett, kode]);
  const [lukket, veksle] = useSammenlagt(`lop-gren-${kortKode(kode)}`, true);
  const id = useId();
  // «Vg2 (7)»: trinnet til tilbudene videre, når alle er på samme trinn.
  const trinn = [...new Set(videre.map((k) => indeks.programomrader[k]?.trinn))];
  const etikett = trinn.length === 1 && trinn[0] ? trinnTekst(t, trinn[0]) : t('opplaeringslop.program.videreKort');
  return (
    <li>
      <Tilbudslenke indeks={indeks} kode={kode} />
      {videre.length > 0 && (
        <>
          <button type="button" class="lop-knapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
            {`${etikett} (${formaterTall(videre.length)})`}
            <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
          </button>
          <ul id={id} class="lop-videre" hidden={lukket}>
            {videre.map((k) => (
              <Gren key={k} kode={k} indeks={indeks} tilbud={tilbud} sett={neste} />
            ))}
          </ul>
        </>
      )}
    </li>
  );
}

export default function Program({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
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
  const hoved = struktur.inngang.filter((k) => !erVariant(k));
  const varianter = struktur.inngang.filter((k) => erVariant(k));
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <h1 tabIndex={-1}>{struktur.navn[malform]}</h1>
      <p class="dempet">{t(`opplaeringslop.gruppe.${struktur.gruppe}`)}</p>
      <p class="liten dempet">{t('opplaeringslop.program.lopHjelp')}</p>
      <ul class="lop">
        {hoved.map((k) => (
          <Gren key={k} kode={k} indeks={data.indeks} tilbud={data.tilbud} sett={new Set()} />
        ))}
      </ul>
      {varianter.length > 0 && (
        <Rubrikk nokkel={`lop-${program}-varianter`} tittel={t('opplaeringslop.program.varianter')} hoyre={formaterTall(varianter.length)} lukket>
          <p class="liten dempet">{t('opplaeringslop.program.variantHjelp')}</p>
          <ul class="lop">
            {varianter.map((k) => (
              <Gren key={k} kode={k} indeks={data.indeks} tilbud={data.tilbud} sett={new Set()} />
            ))}
          </ul>
        </Rubrikk>
      )}
      {struktur.utenfor.length > 0 && (
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
      <Kildeliste kilder={[{ id: 'udir-grep', punkt: program }, { id: 'udir-fag-og-timefordeling' }]} />
    </div>
  );
}
