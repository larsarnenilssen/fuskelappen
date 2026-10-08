// En temaside i Videregående i tall (eier 08.10.2026, avgjørelse 090): tallene fra Udir og SSB samlet etter tema.
//
// - Øverst: stien tilbake til oversikten, fanene mellom temaene og fylket. Fanene har ikke oversikten, fordi stien går
//   dit (eier 08.10.2026).
// - «Kort fortalt»: tre tall med en kort tekst og kilden, så siden svarer før brukeren ser på figurene. Tallet står
//   først og stort, så tallene kan leses nedover som en liste.
// - Figurene står i deler som kan lukkes. På mobil er den første delen åpen og de andre lukket, med en linje om hva de
//   viser. På skrivebord er alle åpne i to kolonner. Kildene står i en lukket boks nederst i høyre kolonne.
import { useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { type T, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Seksjon } from '../../../components/Seksjon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner, useBred } from '../../../components/ToKolonner.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import type { Ssb } from '../../../core/statistikk/ssb-skjema.ts';
import type { Statistikk } from '../../../core/statistikk/skjema.ts';
import type { SideProps } from '../../typer.ts';
import { Rangering, statistikkLenke, stedsnavn, tekstFor, useStatistikk } from '../komponenter.tsx';
import { Deltakelse, fortegn, Grunnskolepoeng, Kostnad, kullFor, Laererne, pst, tusenKr, Ungdomskull, Utenfor, useSsb } from '../ssb.tsx';
import { erTema, TEMAER, type Temaid, temaFavoritt, temarute } from '../temaer.ts';
import { fylkeneIDataene, fylkesnokkel, programmerFor, sisteFor, sisteVerdi } from '../visning.ts';
import { Eksamenstabell, Hosten, Par, Programmer } from './Oversikt.tsx';

interface Punkt {
  tall: string;
  tekst: string;
  kilde: 'udir' | 'ssb';
}

/** «Kort fortalt»: tre tall med en kort tekst og kilden. */
function KortFortalt({ punkter }: { punkter: readonly Punkt[] }) {
  const { t } = useTekst();
  return (
    <section class="st-kort" aria-labelledby="st-kort-tittel">
      <h2 id="st-kort-tittel" class="st-kort-tittel">
        {t('statistikk.kortFortalt.tittel')}
      </h2>
      <ul>
        {punkter.map((p) => (
          <li key={p.tekst}>
            <b class="st-kort-tall">{p.tall}</b>
            <span class="st-kort-tekst">
              {p.tekst} <span class="st-kilde-merke">{t(p.kilde === 'ssb' ? 'statistikk.ssb.merke' : 'statistikk.ssb.udirMerke')}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const sisteAv = <V,>(rekke: readonly V[] | undefined): V | null => rekke?.at(-1) ?? null;

/** Programmet med flest søkere i fylket, eller null. */
function flestSokere(d: Statistikk, enhet: string): { navn: string; naa: number } | null {
  return programmerFor(d, enhet).reduce<{ navn: string; naa: number } | null>((m, p) => (typeof p.naa === 'number' && (!m || p.naa > m.naa) ? { navn: p.navn, naa: p.naa } : m), null);
}

function punkterFor(tema: Temaid, t: T, d: Statistikk, s: Ssb, enhet: string): Punkt[] {
  const sted = stedsnavn(d, enhet, t);
  if (tema === 'ungdom') {
    const k = kullFor(s, enhet);
    return [
      {
        tall: k.endring === null ? t('statistikk.ingenTall') : t('statistikk.prosent', { verdi: fortegn(k.endring) }),
        tekst: t('statistikk.kortFortalt.kull', { sted, fra: String(k.fra), til: String(k.til), naa: formaterTall(k.naa ?? 0, 0), da: formaterTall(k.da ?? 0, 0) }),
        kilde: 'ssb',
      },
      {
        tall: tekstFor(t, sisteVerdi(d.sokere.alle[enhet])),
        tekst: t('statistikk.kortFortalt.sokere', { aar: String(d.sokere.aar.at(-1) ?? ''), program: flestSokere(d, enhet)?.navn.toLocaleLowerCase('nb') ?? '' }),
        kilde: 'udir',
      },
      { tall: pst(t, sisteAv(s.deltakelse.alle[enhet])), tekst: t('statistikk.kortFortalt.deltakelse', { aar: String(s.deltakelse.aar.at(-1) ?? '') }), kilde: 'ssb' },
    ];
  }
  if (tema === 'skolen') {
    const l = s.laerere;
    return [
      { tall: tekstFor(t, sisteVerdi(d.elever.elever[enhet])), tekst: t('statistikk.kortFortalt.elever', { skolear: (d.elever.skolear.at(-1) ?? '').replace('-', '–') }), kilde: 'udir' },
      {
        tall: pst(t, l.alder[enhet]?.fra60 ?? null),
        tekst: t('statistikk.kortFortalt.laerere60', { antall: formaterTall(sisteAv(l.antall[enhet]) ?? 0, 0), aar: String(l.aar.at(-1) ?? '') }),
        kilde: 'ssb',
      },
      { tall: tusenKr(t, sisteAv(s.kostnad.perElev[enhet])), tekst: t('statistikk.kortFortalt.perElev', { aar: String(s.kostnad.aar.at(-1) ?? '') }), kilde: 'ssb' },
    ];
  }
  return [
    { tall: tekstFor(t, sisteVerdi(d.formidling.desember[enhet]), 'prosent'), tekst: t('statistikk.kortFortalt.laereplass', { aar: String(d.formidling.aar.at(-1) ?? '') }), kilde: 'udir' },
    { tall: tekstFor(t, sisteVerdi(d.gjennomforing.verdier[enhet]), 'prosent'), tekst: t('statistikk.kortFortalt.gjennomforing', { kull: String(d.gjennomforing.kull.at(-1) ?? '') }), kilde: 'udir' },
    { tall: pst(t, sisteAv(s.utenfor.prosent[enhet])), tekst: t('statistikk.kortFortalt.utenfor', { aar: String(s.utenfor.aar.at(-1) ?? '') }), kilde: 'ssb' },
  ];
}

/** «Flest søkere: Studiespesialisering (7 392).» */
function programInnhold(t: T, d: Statistikk, enhet: string): string | undefined {
  const flest = flestSokere(d, enhet);
  return flest ? t('statistikk.program.innhold', { program: flest.navn, antall: tekstFor(t, flest.naa) }) : undefined;
}

/** «Vestland er nr. 2 av 15.» */
function rangeringInnhold(t: T, d: Statistikk, enhet: string): string | undefined {
  const rangert = Object.entries(sisteFor(d.formidling.desember))
    .filter((r): r is [string, number] => r[0].startsWith('F') && typeof r[1] === 'number')
    .sort((a, b) => b[1] - a[1]);
  const plass = rangert.findIndex(([e]) => e === enhet);
  return plass < 0 ? undefined : t('statistikk.rangering.plass', { sted: stedsnavn(d, enhet, t), plass: String(plass + 1), antall: String(rangert.length) });
}

/** «Desember: Vestland 84,0 %, landet 79,5 %.» */
function hostenInnhold(t: T, d: Statistikk, enhet: string): string {
  const h = d.formidling.hosten;
  const i = h.maneder.length - 1;
  return t('statistikk.hosten.innhold', {
    maned: h.maneder[i] ?? '',
    verdier: (enhet === 'L' ? ['L'] : [enhet, 'L'])
      .map((e) => {
        const verdi = tekstFor(t, h.verdier[e]?.[i] ?? null, 'prosent');
        return e === 'L' ? t('statistikk.landetVerdi', { verdi }) : `${stedsnavn(d, e, t)} ${verdi}`;
      })
      .join(', '),
  });
}

export default function Tema({ parametre, sporring }: SideProps) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const d = useStatistikk();
  const s = useSsb();
  const bred = useBred();
  const tema: Temaid = erTema(parametre.tema) ? parametre.tema : 'ungdom';
  const [fylke, settFylke] = useState<string | null>(() => sporring.get('fylke') ?? innstillinger.fylke ?? null);
  const kilder = (
    <Kildeboks
      kilder={[
        { id: 'udir-statistikkbanken', punkt: t('statistikk.tittel') },
        { id: 'ssb-statistikkbanken', punkt: t('statistikk.ssb.kildeboks') },
      ]}
      nokkel={`statistikk-${tema}`}
    />
  );

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('statistikk.tittel'), href: statistikkLenke(fylke) }]} />
      <Sidetopp tittel={t(`statistikk.tema.${tema}.navn`)} favoritt={temaFavoritt(tema)} />
      {d === null || s === null ? (
        <p class="dempet">{t('statistikk.laster')}</p>
      ) : d === 'feil' || s === 'feil' ? (
        <p role="alert">{t('statistikk.feil')}</p>
      ) : (
        (() => {
          const enhet = d.enheter[fylkesnokkel(fylke)] ? fylkesnokkel(fylke) : 'L';
          const fylkesledd = enhet === 'L' ? '' : `?fylke=${enhet.slice(1)}`;
          const kull = d.gjennomforing.kull.at(-1) ?? '';
          // På mobil er bare den første delen åpen. Lukkede deler viser en linje om hva de har.
          const apen = (forste: boolean) => bred || forste;
          const k = kullFor(s, enhet);
          return (
            <>
              <nav class="frist-filter st-temafaner" aria-label={t('statistikk.tema.faner')}>
                <ul>
                  {TEMAER.map((x) => (
                    <li key={x.id}>
                      <a href={`#${temarute(x.id)}${fylkesledd}`} aria-current={x.id === tema ? 'page' : undefined}>
                        {t(`statistikk.tema.${x.id}.kort`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div class="felt st-velg">
                <label for="st-fylke">{t('statistikk.sted')}</label>
                <select
                  id="st-fylke"
                  value={enhet === 'L' ? '' : enhet.slice(1)}
                  onChange={(e) => {
                    const v = e.currentTarget.value || null;
                    settFylke(v);
                    erstattAdresse(temarute(tema), v ? { fylke: v } : {});
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
              <KortFortalt punkter={punkterFor(tema, t, d, s, enhet)} />
              {tema === 'ungdom' && (
                <ToKolonner
                  hoved={
                    <>
                      <Seksjon
                        id="ssb-kull"
                        tittel={t('statistikk.ssb.kull.tittel')}
                        innhold={k.endring === null ? undefined : t('statistikk.ssb.kull.innhold', { endring: fortegn(k.endring), fra: String(k.fra), til: String(k.til) })}
                        apen={apen(true)}
                      >
                        <Ungdomskull s={s} enhet={enhet} />
                      </Seksjon>
                      <Seksjon id="st-program" tittel={t('statistikk.program.tittel')} innhold={programInnhold(t, d, enhet)} apen={apen(false)}>
                        <Programmer d={d} enhet={enhet} />
                      </Seksjon>
                    </>
                  }
                  side={
                    <>
                      <Seksjon
                        id="ssb-poeng"
                        tittel={t('statistikk.ssb.poeng.tittel')}
                        innhold={t('statistikk.ssb.poeng.innhold', { verdi: formaterTall(sisteAv(s.grunnskolepoeng.poeng[enhet]) ?? 0, 1, 1) })}
                        apen={apen(false)}
                      >
                        <Grunnskolepoeng s={s} enhet={enhet} />
                      </Seksjon>
                      <Seksjon
                        id="ssb-deltakelse"
                        tittel={t('statistikk.ssb.deltakelse.tittel')}
                        innhold={t('statistikk.ssb.deltakelse.innhold', { verdi: pst(t, sisteAv(s.deltakelse.alle[enhet])) })}
                        apen={apen(false)}
                      >
                        <Deltakelse s={s} enhet={enhet} />
                      </Seksjon>
                      {kilder}
                    </>
                  }
                />
              )}
              {tema === 'skolen' && (
                <ToKolonner
                  hoved={
                    <>
                      <Seksjon
                        id="ssb-laerere"
                        tittel={t('statistikk.ssb.laerere.tittel')}
                        innhold={t('statistikk.ssb.laerere.innhold', { antall: formaterTall(sisteAv(s.laerere.antall[enhet]) ?? 0, 0), andel: pst(t, s.laerere.alder[enhet]?.fra60 ?? null) })}
                        apen={apen(true)}
                      >
                        <Laererne s={s} enhet={enhet} />
                      </Seksjon>
                      <Seksjon id="ssb-kostnad" tittel={t('statistikk.ssb.kostnad.tittel')} innhold={t('statistikk.ssb.kostnad.innhold', { verdi: tusenKr(t, sisteAv(s.kostnad.perElev[enhet])) })} apen={apen(false)}>
                        <Kostnad s={s} enhet={enhet} />
                      </Seksjon>
                    </>
                  }
                  side={
                    <>
                      <Seksjon id="st-fravaer" tittel={t('statistikk.fravaer.total')} innhold={tekstFor(t, d.fravaer.total[enhet] ?? null, 'dager')} apen={apen(false)}>
                        <Par
                          d={d}
                          enhet={enhet}
                          tittel={t('statistikk.fravaer.total')}
                          verdi={d.fravaer.total[enhet] ?? null}
                          landet={d.fravaer.total.L ?? null}
                          form="dager"
                          tekst={t('statistikk.fravaer.tekst', { skolear: d.fravaer.skolear.replace('-', '–') })}
                        />
                      </Seksjon>
                      <Seksjon id="st-eksamen" tittel={t('statistikk.eksamen.tittel')} innhold={t('statistikk.eksamen.innhold', { antall: String(d.eksamen.fag.length) })} apen={apen(false)}>
                        <Eksamenstabell d={d} enhet={enhet} t={t} />
                      </Seksjon>
                      {kilder}
                    </>
                  }
                />
              )}
              {tema === 'fullforing' && (
                <ToKolonner
                  hoved={
                    <>
                      <Seksjon id="st-rangering" tittel={t('statistikk.rangering.tittel')} innhold={rangeringInnhold(t, d, enhet)} apen={apen(true)}>
                        <Rangering d={d} enhet={enhet} medTittel={false} />
                      </Seksjon>
                      <Seksjon id="st-hosten" tittel={t('statistikk.hosten.tittel')} innhold={hostenInnhold(t, d, enhet)} apen={apen(false)}>
                        <Hosten d={d} enhet={enhet} />
                      </Seksjon>
                    </>
                  }
                  side={
                    <>
                      <Seksjon id="st-gjennomforing" tittel={t('statistikk.gjennomforing.tittel')} innhold={tekstFor(t, sisteVerdi(d.gjennomforing.verdier[enhet]), 'prosent')} apen={apen(false)}>
                        <Par
                          d={d}
                          enhet={enhet}
                          tittel={t('statistikk.gjennomforing.tittel')}
                          verdi={sisteVerdi(d.gjennomforing.verdier[enhet])}
                          landet={sisteVerdi(d.gjennomforing.verdier.L)}
                          form="prosent"
                          tekst={`${t('statistikk.gjennomforing.tekst', { kull: String(kull) })} ${d.gjennomforing.beregnet && enhet !== 'L' ? t('statistikk.gjennomforing.beregnet') : ''}`}
                        />
                        {d.fagbrev.verdier[enhet] === null && enhet !== 'L' ? (
                          <p class="st-figur-tekst st-ingen">{t('statistikk.gjennomforing.ingenFagbrev', { sted: stedsnavn(d, enhet, t), kull: String(d.fagbrev.kull) })}</p>
                        ) : (
                          <Par
                            d={d}
                            enhet={enhet}
                            tittel={t('statistikk.gjennomforing.fagbrev')}
                            verdi={d.fagbrev.verdier[enhet] ?? null}
                            landet={d.fagbrev.verdier.L ?? null}
                            form="prosent"
                            tekst={t('statistikk.gjennomforing.fagbrevTekst', { kull: String(d.fagbrev.kull) })}
                          />
                        )}
                      </Seksjon>
                      <Seksjon id="ssb-utenfor" tittel={t('statistikk.ssb.utenfor.tittel')} innhold={t('statistikk.ssb.utenfor.innhold', { verdi: pst(t, sisteAv(s.utenfor.prosent[enhet])) })} apen={apen(false)}>
                        <Utenfor s={s} enhet={enhet} />
                      </Seksjon>
                      {kilder}
                    </>
                  }
                />
              )}
            </>
          );
        })()
      )}
    </div>
  );
}
