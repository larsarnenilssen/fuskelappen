// Løpet i et utdanningsprogram: fra vg1 (inngangen) videre til vg2 og vg3 eller lærefag, som et tre.
import { useTekst } from '../../../app/tilstand.ts';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { erVariant } from '../../fag/tilbud/modell.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { SideProps } from '../../typer.ts';
import type { Tilbudene } from '../data.ts';
import { Lasting, Tilbudslenke, useTilbudsdata } from './felles.tsx';

/** Et tilbud med tilbudene det fører videre til i samme program. `sett` hindrer at et tilbud vises to ganger i samme gren. */
function Gren({ kode, indeks, tilbud, sett }: { kode: string; indeks: Fagindeks; tilbud: Tilbudene; sett: ReadonlySet<string> }) {
  const videre = (tilbud.tilbud[kode]?.videre ?? []).filter((k) => !sett.has(k));
  const neste = new Set([...sett, kode]);
  return (
    <li>
      <Tilbudslenke indeks={indeks} kode={kode} />
      {videre.length > 0 && (
        <ul class="lop-videre">
          {videre.map((k) => (
            <Gren key={k} kode={k} indeks={indeks} tilbud={tilbud} sett={neste} />
          ))}
        </ul>
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
      <h1 tabIndex={-1}>{struktur.navn[malform]}</h1>
      <p class="dempet">{t(`opplaeringslop.gruppe.${struktur.gruppe}`)}</p>
      <h2 class="liten-overskrift">{t('opplaeringslop.program.lop')}</h2>
      <p class="liten dempet">{t('opplaeringslop.program.lopHjelp')}</p>
      <ul class="lop">
        {hoved.map((k) => (
          <Gren key={k} kode={k} indeks={data.indeks} tilbud={data.tilbud} sett={new Set()} />
        ))}
      </ul>
      {varianter.length > 0 && (
        <section>
          <h2 class="liten-overskrift">{t('opplaeringslop.program.varianter')}</h2>
          <p class="liten dempet">{t('opplaeringslop.program.variantHjelp')}</p>
          <ul class="lop">
            {varianter.map((k) => (
              <Gren key={k} kode={k} indeks={data.indeks} tilbud={data.tilbud} sett={new Set()} />
            ))}
          </ul>
        </section>
      )}
      {struktur.utenfor.length > 0 && (
        <section>
          <h2 class="liten-overskrift">{t('opplaeringslop.program.utenfor')}</h2>
          <p class="liten dempet">{t('opplaeringslop.program.utenforHjelp')}</p>
          <ul class="lop">
            {struktur.utenfor.map((k) => (
              <li key={k}>
                <Tilbudslenke indeks={data.indeks} kode={k} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <Kildeliste kilder={[{ id: 'udir-grep', punkt: program }, { id: 'udir-fag-og-timefordeling' }]} />
    </div>
  );
}
