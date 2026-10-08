// Videregående i tall (eier 07.10.2026, avgjørelse 080 og 090): nøkkeltallene fra Udirs statistikkbank og tallene fra
// SSB for fylket brukeren har valgt, eller for landet, med fylket i adressen (?fylke=46).
//
// - Øverst: velg fylke og fire nøkkeltall fra Udir.
// - «Utforsk tallene»: tre temakort til temasidene (sider/Tema.tsx), der tallene fra Udir og SSB står sammen. Kortene er
//   lenker og ser annerledes ut enn nøkkeltallene, med to tall hver, side om side (eier 08.10.2026).
// - Fylkene side om side i en tabell, alltid åpen, og til høyre hvor tallene kommer fra og kildene.
// - Tabellen over fylkene kan sorteres på alle kolonnene (eier 07.10.2026). På mobil viser den fylket og én kolonne,
//   som brukeren velger, fordi seks kolonner ikke får plass i 320 px.
// - Komponentene for søkerne, høsten, tallparene og eksamen brukes av temasidene.
import { useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { type T, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Ssb } from '../../../core/statistikk/ssb-skjema.ts';
import type { Statistikk, Verdi } from '../../../core/statistikk/skjema.ts';
import { oversiktsid } from '../../favoritter.ts';
import type { SideProps } from '../../typer.ts';
import { eksamenTekst, endringTekst, fagnavn, Nokkeltall, STATISTIKK_RUTE, stedsnavn, tekstFor, useStatistikk } from '../komponenter.tsx';
import { fortegn, kullFor, pst, useSsb } from '../ssb.tsx';
import { TEMAER, type Temaid, temaLenke } from '../temaer.ts';
import { FYLKEKOLONNER, type Fylkekolonne, fylkerad, fylkeneIDataene, fylkesnokkel, type Fylketall, programmerFor, sisteVerdi, sorterFylker } from '../visning.ts';

/** Søkere per utdanningsprogram: i år som stolpe og i fjor som strek, studieforberedende og yrkesfag hver for seg. */
export function Programmer({ d, enhet }: { d: Statistikk; enhet: string }) {
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
export function Hosten({ d, enhet }: { d: Statistikk; enhet: string }) {
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
export function Par({ d, enhet, tittel, verdi, landet, form, tekst }: { d: Statistikk; enhet: string; tittel: string; verdi: Verdi; landet: Verdi; form: 'prosent' | 'dager'; tekst: string }) {
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
export function Fylkene({ d, enhet }: { d: Statistikk; enhet: string }) {
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
export function Eksamenstabell({ d, enhet, t }: { d: Statistikk; enhet: string; t: T }) {
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

/** De to tallene på hvert temakort: et tall og hva det er. Tallene fra SSB står med strek til de er lastet. */
function temaTall(t: T, tema: Temaid, d: Statistikk, s: Ssb | null, enhet: string): { tall: string; tekst: string }[] {
  const ingen = t('statistikk.ingenTall');
  if (tema === 'ungdom') {
    const k = s ? kullFor(s, enhet) : null;
    return [
      { tall: k?.endring != null ? t('statistikk.prosent', { verdi: fortegn(k.endring) }) : ingen, tekst: t('statistikk.tema.kull', { aar: String(k?.til ?? '') }) },
      { tall: formaterTall(s?.grunnskolepoeng.poeng[enhet]?.at(-1) ?? 0, 1, 1), tekst: t('statistikk.tema.poeng') },
    ];
  }
  if (tema === 'skolen') {
    return [
      { tall: s ? pst(t, s.laerere.alder[enhet]?.fra60 ?? null, 0) : ingen, tekst: t('statistikk.tema.laerere60') },
      { tall: tekstFor(t, d.fravaer.total[enhet] ?? null, 'dager'), tekst: t('statistikk.tema.fravaer') },
    ];
  }
  return [
    { tall: tekstFor(t, sisteVerdi(d.gjennomforing.verdier[enhet]), 'prosent'), tekst: t('statistikk.tema.fullforer') },
    { tall: s ? pst(t, s.utenfor.prosent[enhet]?.at(-1) ?? null) : ingen, tekst: t('statistikk.tema.utenfor') },
  ];
}

export default function Oversikt({ sporring }: SideProps) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const d = useStatistikk();
  const s = useSsb();
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
          const valgtFylke = enhet === 'L' ? null : enhet.slice(1);
          const ssb = s === 'feil' ? null : s;
          return (
            <>
              <div class="felt st-velg">
                <label for="st-fylke">{t('statistikk.sted')}</label>
                <select
                  id="st-fylke"
                  value={valgtFylke ?? ''}
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
              <section class="st-utforsk" aria-labelledby="st-utforsk-tittel">
                <h2 class="liten-overskrift" id="st-utforsk-tittel">
                  {t('statistikk.utforsk')}
                </h2>
                <ul class="st-temaer">
                  {TEMAER.map((x) => (
                    <li key={x.id}>
                      <a class="st-tema" href={temaLenke(x.id, valgtFylke)}>
                        <span class="st-tema-topp">
                          <span class="st-tema-ikon" aria-hidden="true">
                            <Ikon navn={x.ikon} />
                          </span>
                          <span class="st-tema-navn">
                            <span class="st-tema-tittel">{t(`statistikk.tema.${x.id}.navn`)}</span>
                            <span class="st-tema-tekst">{t(`statistikk.tema.${x.id}.tekst`)}</span>
                          </span>
                          <Ikon navn="hoyre" class="ikon-liten st-tema-pil" />
                        </span>
                        <span class="st-tema-tall">
                          {temaTall(t, x.id, d, ssb, enhet).map((k) => (
                            <span key={k.tekst}>
                              <b>{k.tall}</b>
                              <span>{k.tekst}</span>
                            </span>
                          ))}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <ToKolonner
                hoved={
                  <section aria-labelledby="st-fylkene-tittel">
                    <h2 class="liten-overskrift" id="st-fylkene-tittel">
                      {t('statistikk.fylkene.tittel')}
                    </h2>
                    <Fylkene d={d} enhet={enhet} />
                  </section>
                }
                side={
                  <>
                    <section class="st-om-tallene" aria-labelledby="st-om-tittel">
                      <h2 class="liten-overskrift" id="st-om-tittel">
                        {t('statistikk.om.tittel')}
                      </h2>
                      <p>
                        <span class="st-kilde-merke">{t('statistikk.ssb.udirMerke')}</span> {t('statistikk.om.udir')}
                      </p>
                      <p>
                        <span class="st-kilde-merke">{t('statistikk.ssb.merke')}</span> {t('statistikk.om.ssb')}
                      </p>
                      <p class="dempet">{t('statistikk.om.oppdatering')}</p>
                    </section>
                    <Kildeboks
                      kilder={[
                        { id: 'udir-statistikkbanken', punkt: t('statistikk.tittel') },
                        { id: 'ssb-statistikkbanken', punkt: t('statistikk.ssb.kildeboks') },
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
