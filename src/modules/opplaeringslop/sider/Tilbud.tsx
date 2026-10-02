// Et tilbud (programområde): fag og timer etter rundskrivet Udir-1, plassene for valgfrie fag og yrkesfaglig
// fordypning, hva tilbudet bygger på og fører videre til, og lenker til Vilbli for skolene som har det (avgjørelse 027).
// Linjenavnene («Norsk», «Felles programfag fra eget utdanningsprogram») er rundskrivets tekst og vises uoversatt.
import { useId, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Fagindeks } from '../../fag/skjema.ts';
import type { Tilbudsdel } from '../../fag/tilbud/modell.ts';
import { vilbliLenke } from '../../fag/tilbud/vilbli.ts';
import { trinnTekst } from '../../fag/visning.ts';
import type { SideProps } from '../../typer.ts';
import { fullKode, kortKode, type Tilbudsdata } from '../data.ts';
import { Faglenke, Fagkoder, Lasting, Tilbudslenke, tilbudsnavn, useTilbudsdata } from './felles.tsx';

/** Så mange fagkoder vises med en gang. Flere står i en liste som brukeren åpner. */
const FAA = 4;

function Fagdel({ del, indeks }: { del: Extract<Tilbudsdel, { type: 'fag' }>; indeks: Fagindeks }) {
  const { t, malform } = useTekst();
  // Felles programfag tas alle, med timene for hvert fag. I fellesfag velger eleven ett av fagene (f.eks. 1P eller 1T).
  const alle = del.kategori === 'felles_programfag';
  return (
    <>
      {alle ? (
        <ul class="tett tilbud-fagliste">
          {del.koder.map((k) => (
            <li key={k}>
              <Faglenke indeks={indeks} kode={k} timer />
            </li>
          ))}
        </ul>
      ) : del.koder.length > 1 && del.koder.length > FAA ? (
        <Fagkoder indeks={indeks} koder={del.koder} tittel={t('opplaeringslop.tilbud.velgEn', { antall: formaterTall(del.koder.length) })} />
      ) : (
        <>
          {del.koder.length > 1 && <p class="tilbud-merknad">{t('opplaeringslop.tilbud.velgEn', { antall: formaterTall(del.koder.length) })}</p>}
          <ul class="tett tilbud-fagliste">
            {del.koder.map((k) => (
              <li key={k}>
                <Faglenke indeks={indeks} kode={k} />
              </li>
            ))}
          </ul>
        </>
      )}
      {del.utvalg && (
        <div class="tilbud-utvalg">
          <p class="tilbud-merknad">
            {del.utvalg.grunn === 'flere_trinn'
              ? t('opplaeringslop.tilbud.utvalgFlereTrinn', { timer: formaterTall(del.utvalg.timer) })
              : del.utvalg.antall
                ? t('opplaeringslop.tilbud.utvalgValg', { timer: formaterTall(del.utvalg.timer), antall: formaterTall(del.utvalg.antall) })
                : t('opplaeringslop.tilbud.utvalgValgFritt', { timer: formaterTall(del.utvalg.timer) })}
          </p>
          <ul class="tett tilbud-fagliste">
            {del.utvalg.koder.map((k) => (
              <li key={k}>
                <Faglenke indeks={indeks} kode={k} timer />
              </li>
            ))}
          </ul>
          {del.utvalg.rekker.length > 0 && (
            <p class="tilbud-merknad">
              {t('opplaeringslop.tilbud.rekkefolge')}: {del.utvalg.rekker.map((r) => r.join(' → ')).join('; ')}
            </p>
          )}
        </div>
      )}
      {del.vurdering.length > 0 && (
        <Fagkoder indeks={indeks} koder={del.vurdering} tittel={`${t('opplaeringslop.tilbud.vurdering')} (${formaterTall(del.vurdering.length)})`} />
      )}
      {del.alternativer.length > 0 && (
        <Fagkoder indeks={indeks} koder={del.alternativer} tittel={t('opplaeringslop.tilbud.alternativer', { antall: formaterTall(del.alternativer.length) })} />
      )}
      {del.lantFra && (
        <p class="tilbud-merknad dempet">{t('opplaeringslop.tilbud.lantFra', { tilbud: tilbudsnavn(t, indeks, del.lantFra, malform) })}</p>
      )}
    </>
  );
}

function Plassdel({ del, indeks }: { del: Extract<Tilbudsdel, { type: 'plass' }>; indeks: Fagindeks }) {
  const { t } = useTekst();
  const kandidater = formaterTall(del.kandidater.length);
  if (del.kategori === 'yff') {
    const andre = del.kandidater.filter((k) => k !== del.anbefalt);
    return (
      <>
        {del.anbefalt && (
          <>
            <p class="tilbud-merknad">{t('opplaeringslop.tilbud.anbefalt')}:</p>
            <ul class="tett tilbud-fagliste">
              <li>
                <Faglenke indeks={indeks} kode={del.anbefalt} />
              </li>
            </ul>
          </>
        )}
        <Fagkoder indeks={indeks} koder={andre} tittel={t('opplaeringslop.tilbud.andreKoder', { antall: formaterTall(andre.length) })} />
      </>
    );
  }
  const tekst = del.antall
    ? t(del.kategori === 'fordypning' ? 'opplaeringslop.tilbud.plassFordypning' : 'opplaeringslop.tilbud.plassValgfritt', { antall: formaterTall(del.antall), kandidater })
    : t('opplaeringslop.tilbud.plassUtenAntall', { kandidater });
  return <Fagkoder indeks={indeks} koder={del.kandidater} tittel={tekst} />;
}

/** Så mange tilbud vises med en gang. Flere (f.eks. kryssløp fra vg1 studiespesialisering) står i en liste som brukeren åpner. */
const MANGE_TILBUD = 6;

/** Tilbudene under en overskrift, f.eks. «Videre» eller «Bygger på». */
function Tilbudsliste({ tittel, koder, indeks, via }: { tittel: string; koder: readonly string[]; indeks: Fagindeks; via?: string }) {
  const [vis, settVis] = useState(koder.length <= MANGE_TILBUD);
  const id = useId();
  if (koder.length === 0) return null;
  return (
    <section class="tilbud-lop">
      <h2 class="liten-overskrift">
        {koder.length > MANGE_TILBUD ? (
          <button type="button" class="kortknapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
            <span class="kortknapp-tekst">{`${tittel} (${formaterTall(koder.length)})`}</span>
            <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten kortknapp-pil" />
          </button>
        ) : (
          tittel
        )}
      </h2>
      <ul id={id} class="liste" hidden={!vis}>
        {koder.map((k) => (
          <li key={k}>
            <Tilbudslenke indeks={indeks} kode={k} {...(via ? { via } : {})} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Vilbli({ kode, indeks, via }: { kode: string; indeks: Fagindeks; via: string | null }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const fylke = fylkesnavn(innstillinger.fylke);
  const skoler = vilbliLenke(kode, indeks, { side: 'p5', fylke, via });
  const fordeling = vilbliLenke(kode, indeks, { side: 'p2', via });
  if (!skoler) return null;
  return (
    <section class="tilbud-vilbli">
      <h2 class="liten-overskrift">{t('opplaeringslop.tilbud.vilbliOverskrift')}</h2>
      <p>
        <a href={skoler} target="_blank" rel="noopener noreferrer">
          {fylke ? t('opplaeringslop.tilbud.vilbliFylke', { fylke }) : t('opplaeringslop.tilbud.vilbli')}
          <Ikon navn="ekstern" class="ikon-liten" />
        </a>
      </p>
      {fordeling && (
        <p>
          <a href={fordeling} target="_blank" rel="noopener noreferrer">
            {t('opplaeringslop.tilbud.vilbliFordeling')}
            <Ikon navn="ekstern" class="ikon-liten" />
          </a>
        </p>
      )}
      <p class="liten dempet">{t('opplaeringslop.tilbud.vilbliHjelp')}</p>
    </section>
  );
}

function Delene({ tb, indeks }: { tb: Tilbudsdata; indeks: Fagindeks }) {
  const { t } = useTekst();
  return (
    <section class="tilbud-deler" aria-labelledby="tilbud-fag">
      <h2 id="tilbud-fag" class="liten-overskrift">
        {t('opplaeringslop.tilbud.fagOgTimer')}
      </h2>
      <ol class="tilbud-delliste">
        {tb.deler.map((d, i) => (
          <li key={i} class="tilbud-del" data-kategori={d.kategori}>
            <div class="tilbud-del-topp">
              <span class="tilbud-linje" lang="nb">
                {d.linje}
              </span>
              <span class="tilbud-timer tall">{formaterTall(d.timer)}</span>
            </div>
            {d.type === 'fag' ? <Fagdel del={d} indeks={indeks} /> : <Plassdel del={d} indeks={indeks} />}
          </li>
        ))}
      </ol>
      <div class="tilbud-del-topp tilbud-sum">
        <span>{t('opplaeringslop.tilbud.sum')}</span>
        <span class="tall">{formaterTall(tb.sum)}</span>
      </div>
      <p class="liten dempet">{t('opplaeringslop.tilbud.timerHjelp')}</p>
    </section>
  );
}

export default function Tilbud({ parametre, sporring }: SideProps) {
  const { t, malform } = useTekst();
  const [data, provIgjen] = useTilbudsdata();
  const kode = fullKode(parametre.tilbud ?? '');
  const via = sporring.get('via');
  const viaKode = via ? fullKode(via) : null;
  if (typeof data === 'string') {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('opplaeringslop.tittel')}</h1>
        <Lasting data={data} provIgjen={provIgjen} />
      </div>
    );
  }
  const { indeks } = data;
  const po = indeks.programomrader[kode];
  const tb = data.tilbud.tilbud[kode];
  if (!po || !tb) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('opplaeringslop.ikkeFunnet')}</h1>
      </div>
    );
  }
  return (
    <article class="side tilbudsside" data-sted={po.sted}>
      <h1 tabIndex={-1}>{po.navn[malform]}</h1>
      <ul class="merker fagark-merker" aria-label={t('opplaeringslop.tittel')}>
        <li class="merke merke-kode">{kortKode(kode)}</li>
        <li class="merke">{trinnTekst(t, po.trinn)}</li>
        <li class="merke">{t(`opplaeringslop.sted.${po.sted}`)}</li>
        <li>
          <a class="merke" href={`#/opplaeringslop/${po.program}`}>
            {indeks.utdanningsprogram[po.program]?.[malform] ?? po.program}
          </a>
        </li>
      </ul>
      <p class="liten">
        <a href="#/begreper/programomrade">{t('opplaeringslop.tilbud.omProgramomrade')}</a>
      </p>

      <Tilbudsliste tittel={t('opplaeringslop.tilbud.byggerPaa')} koder={tb.fra} indeks={indeks} />
      <Tilbudsliste tittel={t('opplaeringslop.tilbud.kryssFra')} koder={tb.kryssFra} indeks={indeks} />

      {tb.deler.length > 0 ? (
        <Delene tb={tb} indeks={indeks} />
      ) : (
        <p class="merknad">{po.sted === 'bedrift' ? t('opplaeringslop.tilbud.bedrift') : t('opplaeringslop.tilbud.utenTabell')}</p>
      )}

      {tb.tilpasninger.length > 0 && (
        <details class="tilbud-tilpasninger">
          <summary>{t('opplaeringslop.tilbud.tilpasninger', { antall: formaterTall(tb.tilpasninger.length) })}</summary>
          <ul>
            {tb.tilpasninger.map((p) => (
              <li key={p.navn}>
                <strong lang="nb">{p.navn}</strong>
                {p.total !== null && ` · ${t('opplaeringslop.tilbud.tilpasningTotal', { timer: formaterTall(p.total) })}`}
                <ul class="tett">
                  {p.linjer.map((l) => (
                    <li key={l.linje} lang="nb">
                      {t('opplaeringslop.tilbud.tilpasningLinje', { linje: l.linje, fra: l.ordinar === null ? '–' : formaterTall(l.ordinar), til: l.timer === null ? '–' : formaterTall(l.timer) })}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      )}

      <Tilbudsliste tittel={t('opplaeringslop.tilbud.videre')} koder={tb.videre} indeks={indeks} />
      <Tilbudsliste tittel={t('opplaeringslop.tilbud.pabygging')} koder={tb.pabygging} indeks={indeks} via={kode} />
      <Tilbudsliste tittel={t('opplaeringslop.tilbud.kryssTil')} koder={tb.kryssTil} indeks={indeks} />

      <Vilbli kode={kode} indeks={indeks} via={viaKode} />

      <Kildeliste
        kilder={[
          { id: 'udir-grep', punkt: kortKode(kode) },
          ...(tb.tabell ? [{ id: 'udir-fag-og-timefordeling', punkt: `Tabell ${tb.tabell.nr}` }] : []),
        ]}
      />
    </article>
  );
}
