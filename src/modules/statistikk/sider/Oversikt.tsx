// Videregående i tall (eier 07.10.2026, avgjørelse 080): nøkkeltallene fra Udirs statistikkbank for fylket brukeren
// har valgt, eller for landet, med fylket i adressen (?fylke=46). Skisse til eier.
//
// - Øverst: velg fylke og fire nøkkeltall.
// - Til venstre: søkere per utdanningsprogram (i år som stolpe, i fjor som strek) og fylkene side om side i en tabell.
// - Til høyre: fylkene rangert på læreplass, læreplass gjennom høsten, gjennomføring, fravær og eksamen, og kildene.
// - Gjennomføringen er regnet om til dagens fylker av appen, og det står under tallene.
import { useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import type { Statistikk, Verdi } from '../../../core/statistikk/skjema.ts';
import { oversiktsid } from '../../favoritter.ts';
import type { SideProps } from '../../typer.ts';
import { eksamenTekst, endringTekst, fagnavn, Nokkeltall, Rangering, STATISTIKK_RUTE, stedsnavn, tekstFor, useStatistikk } from '../komponenter.tsx';
import { fylkeneIDataene, fylkesnokkel, programmerFor, sisteVerdi } from '../visning.ts';
import type { T } from '../../../app/tilstand.ts';

/** Søkere per utdanningsprogram: i år som stolpe og i fjor som strek, studieforberedende og yrkesfag hver for seg. */
function Programmer({ d, enhet }: { d: Statistikk; enhet: string }) {
  const { t } = useTekst();
  const liste = programmerFor(d, enhet);
  const maks = Math.max(1, ...liste.flatMap((p) => [p.naa, p.foer]).filter((v): v is number => typeof v === 'number'));
  const pst = (v: number) => `${(v / maks) * 100}%`;
  const [aarFoer, aarNaa] = d.sokere.utdanningsprogram.aar;
  const grupper = [
    {
      navn: t('statistikk.program.studieforberedende'),
      programmer: liste.filter((p) => !p.yrkesfag),
    },
    {
      navn: t('statistikk.program.yrkesfag'),
      programmer: liste.filter((p) => p.yrkesfag),
    },
  ];
  return (
    <figure class="st-figur">
      <figcaption>
        <span class="st-figur-tittel">{t('statistikk.program.tittel')}</span>
        <span class="st-figur-tekst">
          {t('statistikk.program.tekst', {
            aar: String(aarNaa ?? ''),
            fjor: String(aarFoer ?? ''),
          })}
        </span>
      </figcaption>
      {grupper.map((g) => (
        <div key={g.navn} class="st-gruppe">
          <p class="st-gruppe-navn">{g.navn}</p>
          <ul class="st-rangering st-program">
            {g.programmer.map((p) => (
              <li key={p.id} class="st-rad st-valgt">
                <span class="st-rad-navn">{p.navn}</span>
                <span class="st-spor" aria-hidden="true">
                  {typeof p.naa === 'number' && <span class="st-stolpe" style={{ width: pst(p.naa) }} />}
                  {typeof p.foer === 'number' && <span class="st-fjor" style={{ left: pst(p.foer) }} />}
                </span>
                <span class="st-rad-tall">
                  {tekstFor(t, p.naa)}
                  <span class="st-rad-under">{endringTekst(t, p.naa, p.foer, aarFoer ?? '') ?? ''}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </figure>
  );
}

/** Læreplass gjennom høsten: august, oktober og desember, for fylket og landet. */
function Hosten({ d, enhet }: { d: Statistikk; enhet: string }) {
  const { t } = useTekst();
  const h = d.formidling.hosten;
  const serier = enhet === 'L' ? ['L'] : [enhet, 'L'];
  return (
    <figure class="st-figur">
      <figcaption>
        <span class="st-figur-tittel">{t('statistikk.hosten.tittel')}</span>
        <span class="st-figur-tekst">{t('statistikk.hosten.tekst', { aar: String(h.aar) })}</span>
      </figcaption>
      <ul class="st-maneder">
        {h.maneder.map((m, i) => (
          <li key={m} class="st-maned">
            <span class="st-maned-navn">{m}</span>
            {serier.map((s) => {
              const v = h.verdier[s]?.[i] ?? null;
              return (
                <span key={s} class={s === 'L' && enhet !== 'L' ? 'st-rad st-rad-landet' : 'st-rad st-valgt'}>
                  <span class="st-rad-navn">{stedsnavn(d, s, t)}</span>
                  <span class="st-spor" aria-hidden="true">
                    {typeof v === 'number' && <span class="st-stolpe" style={{ width: `${v}%` }} />}
                  </span>
                  <span class="st-rad-tall">{tekstFor(t, v, 'prosent')}</span>
                </span>
              );
            })}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** To tall side om side: fylket og landet, med en tekst under. */
function Par({ d, enhet, tittel, verdi, landet, form, tekst }: { d: Statistikk; enhet: string; tittel: string; verdi: Verdi; landet: Verdi; form: 'prosent' | 'dager'; tekst: string }) {
  const { t } = useTekst();
  return (
    <div class="st-par">
      <p class="st-par-tittel">{tittel}</p>
      <div class="st-par-tall">
        <span>
          <b>{tekstFor(t, verdi, form)}</b> {stedsnavn(d, enhet, t)}
        </span>
        {enhet !== 'L' && (
          <span class="st-par-landet">
            <b>{tekstFor(t, landet, form)}</b> {t('statistikk.landet')}
          </span>
        )}
      </div>
      <p class="st-figur-tekst">{tekst}</p>
    </div>
  );
}

/** Fylkene side om side: de siste tallene for hvert fylke, med det valgte fylket markert og landet nederst. */
function Fylkene({ d, enhet }: { d: Statistikk; enhet: string }) {
  const { t } = useTekst();
  const rader = [...fylkeneIDataene(d).map((f) => f.nokkel), 'L'];
  return (
    <figure class="st-figur">
      <figcaption id="st-fylkene-tittel">
        <span class="st-figur-tittel">{t('statistikk.fylkene.tittel')}</span>
        <span class="st-figur-tekst">{t('statistikk.fylkene.tekst')}</span>
      </figcaption>
      <div class="st-rulle">
        <table class="st-tabell" aria-labelledby="st-fylkene-tittel">
          <thead>
            <tr>
              <th scope="col">{t('statistikk.fylkene.fylke')}</th>
              <th scope="col">{t('statistikk.fylkene.sokere')}</th>
              <th scope="col">{t('statistikk.fylkene.elever')}</th>
              <th scope="col">{t('statistikk.fylkene.laereplass')}</th>
              <th scope="col">{t('statistikk.fylkene.gjennomforing')}</th>
              <th scope="col">{t('statistikk.fylkene.fravaer')}</th>
            </tr>
          </thead>
          <tbody>
            {rader.map((k) => (
              <tr key={k} class={k === enhet ? 'st-valgt' : k === 'L' ? 'st-tabell-landet' : undefined}>
                <th scope="row">{stedsnavn(d, k, t)}</th>
                <td>{tekstFor(t, sisteVerdi(d.sokere.alle[k]))}</td>
                <td>{tekstFor(t, sisteVerdi(d.elever.elever[k]))}</td>
                <td>{tekstFor(t, sisteVerdi(d.formidling.desember[k]), 'prosent')}</td>
                <td>{tekstFor(t, sisteVerdi(d.gjennomforing.verdier[k]), 'prosent')}</td>
                <td>{tekstFor(t, d.fravaer.total[k] ?? null, 'dager')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Skriftlig eksamen i de største fellesfagene: fylket og landet. */
export function Eksamenstabell({ d, enhet, t }: { d: Statistikk; enhet: string; t: T }) {
  return (
    <figure class="st-figur">
      <figcaption id="st-eksamen-tittel">
        <span class="st-figur-tittel">{t('statistikk.eksamen.tittel')}</span>
        <span class="st-figur-tekst">{eksamenTekst(t, d)}</span>
      </figcaption>
      <div class="st-rulle">
        <table class="st-tabell" aria-labelledby="st-eksamen-tittel">
          <thead>
            <tr>
              <th scope="col">{t('statistikk.eksamen.fag')}</th>
              {enhet !== 'L' && <th scope="col">{stedsnavn(d, enhet, t)}</th>}
              <th scope="col">{t('statistikk.landet')}</th>
            </tr>
          </thead>
          <tbody>
            {d.eksamen.fag.map((f) => (
              <tr key={f.id}>
                <th scope="row">{fagnavn(t, f)}</th>
                {enhet !== 'L' && <td>{tekstFor(t, d.eksamen.snitt[enhet]?.[f.id] ?? null, 'karakter')}</td>}
                <td>{tekstFor(t, d.eksamen.snitt.L?.[f.id] ?? null, 'karakter')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export default function Oversikt({ sporring }: SideProps) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const d = useStatistikk();
  const [fylke, settFylke] = useState<string | null>(() => sporring.get('fylke') ?? innstillinger.fylke ?? null);

  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('statistikk.tittel')} favoritt={oversiktsid('statistikk')} />
      <p class="ingress">{t('statistikk.innledning')}</p>
      {d === null ? (
        <p class="dempet">{t('statistikk.laster')}</p>
      ) : d === 'feil' ? (
        <p role="alert">{t('statistikk.feil')}</p>
      ) : (
        (() => {
          const enhet = d.enheter[fylkesnokkel(fylke)] ? fylkesnokkel(fylke) : 'L';
          const kull = d.gjennomforing.kull.at(-1) ?? '';
          const fagbrev = d.fagbrev.verdier[enhet] ?? null;
          return (
            <>
              <div class="felt st-velg">
                <label for="st-fylke">{t('statistikk.sted')}</label>
                <select
                  id="st-fylke"
                  value={enhet === 'L' ? '' : enhet.slice(1)}
                  onChange={(e) => {
                    const v = e.currentTarget.value || null;
                    settFylke(v);
                    erstattAdresse(STATISTIKK_RUTE, v ? { fylke: v } : {});
                  }}
                >
                  <option value="">{t('statistikk.landet')}</option>
                  {fylkeneIDataene(d).map((f) => (
                    <option key={f.nummer} value={f.nummer}>
                      {f.navn}
                    </option>
                  ))}
                </select>
              </div>
              <h2 class="liten-overskrift">{t('statistikk.iTall', { sted: stedsnavn(d, enhet, t) })}</h2>
              <Nokkeltall d={d} enhet={enhet} />
              <ToKolonner
                hoved={
                  <>
                    <Programmer d={d} enhet={enhet} />
                    <Fylkene d={d} enhet={enhet} />
                  </>
                }
                side={
                  <>
                    <Rangering d={d} enhet={enhet} />
                    <Hosten d={d} enhet={enhet} />
                    <Par
                      d={d}
                      enhet={enhet}
                      tittel={t('statistikk.gjennomforing.tittel')}
                      verdi={sisteVerdi(d.gjennomforing.verdier[enhet])}
                      landet={sisteVerdi(d.gjennomforing.verdier.L)}
                      form="prosent"
                      tekst={`${t('statistikk.gjennomforing.tekst', { kull: String(kull) })} ${d.gjennomforing.beregnet && enhet !== 'L' ? t('statistikk.gjennomforing.beregnet') : ''}`}
                    />
                    {fagbrev === null && enhet !== 'L' ? (
                      <p class="st-figur-tekst">
                        {t('statistikk.gjennomforing.ingenFagbrev', {
                          sted: stedsnavn(d, enhet, t),
                          kull: String(d.fagbrev.kull),
                        })}
                      </p>
                    ) : (
                      <Par
                        d={d}
                        enhet={enhet}
                        tittel={t('statistikk.gjennomforing.fagbrev')}
                        verdi={fagbrev}
                        landet={d.fagbrev.verdier.L ?? null}
                        form="prosent"
                        tekst={t('statistikk.gjennomforing.fagbrevTekst', {
                          kull: String(d.fagbrev.kull),
                        })}
                      />
                    )}
                    <Par
                      d={d}
                      enhet={enhet}
                      tittel={t('statistikk.fravaer.total')}
                      verdi={d.fravaer.total[enhet] ?? null}
                      landet={d.fravaer.total.L ?? null}
                      form="dager"
                      tekst={t('statistikk.fravaer.tekst', {
                        skolear: d.fravaer.skolear.replace('-', '–'),
                      })}
                    />
                    <Eksamenstabell d={d} enhet={enhet} t={t} />
                    <Kildeboks
                      kilder={[
                        {
                          id: 'udir-statistikkbanken',
                          punkt: t('statistikk.tittel'),
                        },
                      ]}
                      nokkel="statistikk"
                    />
                  </>
                }
              />
            </>
          );
        })()
      )}
    </div>
  );
}
