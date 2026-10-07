// Videregående i tall (eier 07.10.2026, avgjørelse 080): nøkkeltallene fra Udirs statistikkbank for fylket brukeren
// har valgt, eller for landet, med fylket i adressen (?fylke=46).
//
// - Øverst: velg fylke og fire nøkkeltall.
// - Til venstre: søkere per utdanningsprogram (i år som stolpe, i fjor som strek) og fylkene side om side i en tabell.
// - Til høyre: fylkene rangert på læreplass, læreplass gjennom høsten, gjennomføring, fravær og eksamen, og kildene.
// - Gjennomføringen er regnet om til dagens fylker av appen, og det står under tallene.
// - Delene kan lukkes (Seksjon, eier 07.10.2026) og viser en kort oppsummering når de er lukket. På mobil er alle lukket
//   fra start unntatt gjennomføring og fravær, som er tre korte tall, så siden gir rask oversikt.
// - Tabellen over fylkene kan sorteres på alle kolonnene (eier 07.10.2026). På mobil viser den fylket og én kolonne,
//   som brukeren velger, fordi seks kolonner ikke får plass i 320 px.
import { useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Seksjon } from '../../../components/Seksjon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner, useBred } from '../../../components/ToKolonner.tsx';
import type { Statistikk, Verdi } from '../../../core/statistikk/skjema.ts';
import { oversiktsid } from '../../favoritter.ts';
import type { SideProps } from '../../typer.ts';
import { eksamenTekst, endringTekst, fagnavn, Nokkeltall, Rangering, STATISTIKK_RUTE, stedsnavn, tekstFor, useStatistikk } from '../komponenter.tsx';
import { FYLKEKOLONNER, type Fylkekolonne, fylkerad, fylkeneIDataene, fylkesnokkel, type Fylketall, programmerFor, ranger, sisteFor, sisteVerdi, sorterFylker } from '../visning.ts';
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

/** Hvordan en tallkolonne vises i tabellen. */
const FORM: Record<Fylketall, 'antall' | 'prosent' | 'dager'> = { sokere: 'antall', elever: 'antall', laereplass: 'prosent', gjennomforing: 'prosent', fravaer: 'dager' };

/**
 * Fylkene side om side: de siste tallene for hvert fylke, med det valgte fylket markert og landet nederst. Overskriftene
 * er knapper som sorterer: navnet alfabetisk, tallene høyest først og så lavest først. På mobil vises fylket og
 * kolonnen i «Vis og sorter etter».
 */
function Fylkene({ d, enhet }: { d: Statistikk; enhet: string }) {
  const { t } = useTekst();
  const [sortering, settSortering] = useState<{ kolonne: Fylkekolonne; synkende: boolean }>({ kolonne: 'navn', synkende: false });
  const [vist, settVist] = useState<Fylketall>('sokere');
  const rader = sorterFylker(
    fylkeneIDataene(d).map((f) => fylkerad(d, f.nokkel)),
    sortering.kolonne,
    sortering.synkende,
  );
  const landet = fylkerad(d, 'L');
  const sorter = (kolonne: Fylkekolonne) => {
    // Første trykk på en tallkolonne gir høyest først, neste trykk lavest først. Navnet starter med A.
    settSortering(sortering.kolonne === kolonne ? { kolonne, synkende: !sortering.synkende } : { kolonne, synkende: kolonne !== 'navn' });
    if (kolonne !== 'navn') settVist(kolonne);
  };
  const ariaSort = (kolonne: Fylkekolonne) => (sortering.kolonne === kolonne ? (sortering.synkende ? 'descending' : 'ascending') : undefined);
  const pil = (kolonne: Fylkekolonne) => (sortering.kolonne === kolonne ? (sortering.synkende ? 'ned' : 'opp') : 'sorter');
  const kol = (k: Fylketall) => (k === vist ? 'st-kol st-kol-vist' : 'st-kol');
  return (
    <figure class="st-figur">
      <figcaption id="st-fylkene-tekst">
        <span class="st-figur-tekst">{t('statistikk.fylkene.tekst')}</span>
      </figcaption>
      <div class="felt st-vis">
        <label for="st-fylkene-vis">{t('statistikk.fylkene.vis')}</label>
        <select
          id="st-fylkene-vis"
          value={vist}
          onChange={(e) => {
            const k = e.currentTarget.value as Fylketall;
            settVist(k);
            settSortering({ kolonne: k, synkende: true });
          }}
        >
          {FYLKEKOLONNER.map((k) => (
            <option key={k} value={k}>
              {t(`statistikk.fylkene.${k}`)}
            </option>
          ))}
        </select>
      </div>
      <div class="st-rulle">
        <table class="st-tabell st-fylketabell" aria-label={t('statistikk.fylkene.tittel')} aria-describedby="st-fylkene-tekst">
          <thead>
            <tr>
              <th scope="col" aria-sort={ariaSort('navn')}>
                <button type="button" class="st-sorter" onClick={() => sorter('navn')}>
                  {t('statistikk.fylkene.fylke')}
                  <Ikon navn={pil('navn')} class="ikon-liten" />
                </button>
              </th>
              {FYLKEKOLONNER.map((k) => (
                <th key={k} scope="col" class={kol(k)} aria-sort={ariaSort(k)}>
                  <button type="button" class="st-sorter" onClick={() => sorter(k)}>
                    {t(`statistikk.fylkene.${k}`)}
                    <Ikon navn={pil(k)} class="ikon-liten" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...rader, landet].map((r) => (
              <tr key={r.enhet} class={r.enhet === enhet ? 'st-valgt' : r.enhet === 'L' ? 'st-tabell-landet' : undefined}>
                <th scope="row">{stedsnavn(d, r.enhet, t)}</th>
                {FYLKEKOLONNER.map((k) => (
                  <td key={k} class={kol(k)}>
                    {tekstFor(t, r.verdier[k], FORM[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Skriftlig eksamen i de største fellesfagene: fylket og landet. */
function Eksamenstabell({ d, enhet, t }: { d: Statistikk; enhet: string; t: T }) {
  return (
    <figure class="st-figur">
      <figcaption id="st-eksamen-tekst">
        <span class="st-figur-tekst">{eksamenTekst(t, d)}</span>
      </figcaption>
      <div class="st-rulle">
        <table class="st-tabell" aria-label={t('statistikk.eksamen.tittel')} aria-describedby="st-eksamen-tekst">
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
  // På mobil er delene lukket fra start (eier 07.10.2026), på skrivebord åpne.
  const bred = useBred();
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
          // Oppsummeringene som står under en lukket del.
          const flest = programmerFor(d, enhet).reduce<{ navn: string; naa: Verdi } | null>((m, p) => (typeof p.naa === 'number' && (!m || p.naa > (m.naa as number)) ? p : m), null);
          const programInnhold = flest ? t('statistikk.program.innhold', { program: flest.navn, antall: tekstFor(t, flest.naa) }) : undefined;
          const rangert = ranger(d, sisteFor(d.formidling.desember));
          const plass = rangert.find((r) => r.enhet === enhet);
          const rangeringInnhold = plass ? t('statistikk.rangering.plass', { sted: plass.navn, plass: String(plass.plass), antall: String(rangert.length) }) : undefined;
          const h = d.formidling.hosten;
          const sisteManed = h.maneder.length - 1;
          const hostenInnhold = t('statistikk.hosten.innhold', {
            maned: h.maneder[sisteManed] ?? '',
            // «Vestland 84,0 %, landet 79,5 %» – landet med liten forbokstav inne i setningen.
            verdier: (enhet === 'L' ? ['L'] : [enhet, 'L'])
              .map((s) => {
                const verdi = tekstFor(t, h.verdier[s]?.[sisteManed] ?? null, 'prosent');
                return s === 'L' ? t('statistikk.landetVerdi', { verdi }) : `${stedsnavn(d, s, t)} ${verdi}`;
              })
              .join(', '),
          });
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
                    <Seksjon id="st-program" tittel={t('statistikk.program.tittel')} innhold={programInnhold} apen={bred}>
                      <Programmer d={d} enhet={enhet} />
                    </Seksjon>
                    <Seksjon id="st-fylkene" tittel={t('statistikk.fylkene.tittel')} innhold={t('statistikk.fylkene.innhold')} apen={bred}>
                      <Fylkene d={d} enhet={enhet} />
                    </Seksjon>
                  </>
                }
                side={
                  <>
                    <Seksjon id="st-rangering" tittel={t('statistikk.rangering.tittel')} innhold={rangeringInnhold} apen={bred}>
                      <Rangering d={d} enhet={enhet} medTittel={false} />
                    </Seksjon>
                    <Seksjon id="st-hosten" tittel={t('statistikk.hosten.tittel')} innhold={hostenInnhold} apen={bred}>
                      <Hosten d={d} enhet={enhet} />
                    </Seksjon>
                    <Seksjon
                      id="st-gjennomforing"
                      tittel={t('statistikk.gjennomforing.del')}
                      innhold={t('statistikk.gjennomforing.innhold', {
                        gjennomforing: tekstFor(t, sisteVerdi(d.gjennomforing.verdier[enhet]), 'prosent'),
                        fravaer: tekstFor(t, d.fravaer.total[enhet] ?? null, 'dager'),
                      })}
                      apen
                    >
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
                        <p class="st-figur-tekst st-ingen">
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
                    </Seksjon>
                    <Seksjon id="st-eksamen" tittel={t('statistikk.eksamen.tittel')} innhold={t('statistikk.eksamen.innhold', { antall: String(d.eksamen.fag.length) })} apen={bred}>
                      <Eksamenstabell d={d} enhet={enhet} t={t} />
                    </Seksjon>
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
