// Tallene fra SSB i Videregående i tall (eier 08.10.2026, avgjørelse 090): én figur per spørsmål, med tittel, en setning
// om hva den viser, store tall og så figuren. Kilden står nederst i figuren, med SSB som merke ved tittelen.
//
// - Figurene: ungdomskullene nå og framover, unge utenfor arbeid og utdanning, grunnskolepoengene, hvem som går i
//   videregående, lærerne og pengene per elev. Temasidene (sider/Tema.tsx) setter dem sammen med tallene fra Udir.
// - Boksene står på sidene der tallene er nyttige: Inntak (søkerne fra Udir og ungdomskullene i én boks),
//   Poengberegning, begrepet Oppfølgingstjenesten og Arbeidsplan (lærerne). De følger regelen for tallboksene
//   (Tallboks, avgjørelse 091).
// - Det valgte fylket har seriefargen og de andre fylkene er grå. Landet er en stiplet strek. Tallene står også som
//   tekst, så figuren ikke er alene om å bære dem.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { fylkesnavn } from '../../app/Stedmerknad.tsx';
import { type T, useTekst } from '../../app/tilstand.ts';
import { formaterTall } from '../../core/i18n/tekst.ts';
import type { Ssb } from '../../core/statistikk/ssb-skjema.ts';
import { lastSsb } from '../../data/statistikk.ts';
import { Hovedtall, Linjediagram, Punktskala, Stablet } from './figurer.tsx';
import { endringTekst, Tallboks, tekstFor, useStatistikk } from './komponenter.tsx';
import { temaLenke } from './temaer.ts';
import { forrigeVerdi, sisteVerdi } from './visning.ts';
import '../../styles/statistikk.css';

type Tall = number | null;

/** Tallene fra SSB, lastet første gang de trengs. null mens de lastes, «feil» når de ikke kunne lastes. */
export function useSsb(): Ssb | null | 'feil' {
  const [s, settS] = useState<Ssb | null | 'feil'>(null);
  useEffect(() => {
    lastSsb().then(settS, () => settS('feil'));
  }, []);
  return s;
}

/** «Vestland» eller «Hele landet». */
export const ssbSted = (t: T, enhet: string): string => (enhet === 'L' ? t('statistikk.landet') : (fylkesnavn(enhet.slice(1)) ?? enhet));
/** Stedet inni en setning: «hele landet» med liten forbokstav, ellers fylket («Lærerne i videregående i hele landet»). */
export const ssbStedITekst = (t: T, enhet: string): string => (enhet === 'L' ? t('statistikk.landetITekst') : ssbSted(t, enhet));
/** «F46» når fylket finnes i tallene, ellers landet. */
export const ssbEnhet = (s: Ssb, fylke: string | null | undefined): string => (fylke && s.ungdomskull.verdier[`F${fylke}`] ? `F${fylke}` : 'L');
const fylkene = (s: Ssb) => Object.keys(s.ungdomskull.verdier).filter((k) => k !== 'L');

/** «12,3 %», eller «Ingen tall». */
export const pst = (t: T, v: Tall, desimaler = 1): string => (v === null ? t('statistikk.ingenTall') : t('statistikk.prosent', { verdi: formaterTall(v, desimaler, desimaler) }));
/** «+1,2» og «−8,3» (minustegn, ikke bindestrek). */
export const fortegn = (v: number, desimaler = 1): string => `${v > 0 ? '+' : v < 0 ? '−' : ''}${formaterTall(Math.abs(v), desimaler, desimaler)}`;
/** «215 000 kr», avrundet til hele tusen. */
export const tusenKr = (t: T, v: Tall): string => (v === null ? t('statistikk.ingenTall') : t('statistikk.ssb.tusenKr', { verdi: formaterTall(Math.round(v / 1000), 0) }));
const siste = (rekke: readonly Tall[] | undefined): Tall => rekke?.at(-1) ?? null;

/** 16–18-åringene det siste registrerte året og ni år fram, og endringen i prosent. */
export function kullFor(s: Ssb, enhet: string) {
  const u = s.ungdomskull;
  const v = u.verdier[enhet] ?? [];
  const fra = u.framskrevetFra;
  const til = fra + 9;
  const naa = v[u.aar.indexOf(fra)] ?? null;
  const da = u.aar.includes(til) ? (v[u.aar.indexOf(til)] ?? null) : null;
  return { fra, til, naa, da, endring: naa !== null && da !== null && naa > 0 ? ((da - naa) / naa) * 100 : null };
}

/** Rammen rundt en figur fra SSB: tittel med merket, en setning om hva den viser, innholdet og kilden. */
export function Ssbfigur({ tittel, tekst, merknad, children }: { tittel: string; tekst: string; merknad: string; children: ComponentChildren }) {
  const { t } = useTekst();
  return (
    <figure class="st-figur">
      <figcaption>
        <span class="st-figur-tittel">
          {tittel}
          <span class="st-kilde-merke">{t('statistikk.ssb.merke')}</span>
        </span>
        <span class="st-figur-tekst">{tekst}</span>
      </figcaption>
      {children}
      <p class="st-forklaring">
        {t('statistikk.ssb.kilde')} {merknad}
      </p>
    </figure>
  );
}

/** Fylkene som liggende stolper fra null, med det valgte fylket i seriefargen og landet som stiplet strek. */
function Stolper({ s, verdier, enhet, maks, format, etikett }: { s: Ssb; verdier: (e: string) => Tall; enhet: string; maks: number; format: (v: Tall) => string; etikett: string }) {
  const { t } = useTekst();
  const rader = fylkene(s)
    .map((e) => ({ e, v: verdier(e) }))
    .filter((r): r is { e: string; v: number } => r.v !== null)
    .sort((a, b) => b.v - a.v);
  const landet = verdier('L');
  const p = (v: number) => `${Math.min(100, (Math.abs(v) / maks) * 100)}%`;
  return (
    <>
      <ol class="st-rangering st-felles-kolonner" aria-label={etikett}>
        {rader.map((r) => (
          <li key={r.e} class={r.e === enhet ? 'st-rad st-valgt' : 'st-rad'}>
            <span class="st-rad-navn">{ssbSted(t, r.e)}</span>
            <span class="st-spor" aria-hidden="true">
              <span class="st-stolpe" style={{ width: p(r.v) }} />
              {landet !== null && <span class="st-landet" style={{ left: p(landet) }} />}
            </span>
            <span class="st-rad-tall">{format(r.v)}</span>
          </li>
        ))}
      </ol>
      {landet !== null && (
        <p class="st-forklaring">
          <span class="st-landet-merke" aria-hidden="true" /> {t('statistikk.ssb.landet', { verdi: format(landet) })}
        </p>
      )}
    </>
  );
}

/** Forklaringen under et linjediagram: det valgte stedet og landet, eller registrert og framskrevet. */
function Strekforklaring({ deler }: { deler: readonly { tekst: string; form: 'heltrukket' | 'gra' | 'stiplet' }[] }) {
  return (
    <ul class="fg-forklaring">
      {deler.map((d) => (
        <li key={d.tekst}>
          <span class={d.form === 'heltrukket' ? 'fg-strek' : `fg-strek fg-strek-${d.form === 'gra' ? 'gra' : 'stiplet'}`} aria-hidden="true" /> {d.tekst}
        </li>
      ))}
    </ul>
  );
}

// ---------- 1. Ungdomskullene: 16–18-åringer nå og framover (07459 og 14746) ----------

export function Ungdomskull({ s, enhet }: { s: Ssb; enhet: string }) {
  const { t } = useTekst();
  const u = s.ungdomskull;
  const sted = ssbSted(t, enhet);
  const stedITekst = ssbStedITekst(t, enhet);
  const k = kullFor(s, enhet);
  const landet = kullFor(s, 'L');
  const fraAar = u.aar[0] ?? k.fra;
  const tilAar = u.aar.at(-1) ?? k.til;
  const endring = (e: string) => kullFor(s, e).endring;
  return (
    <Ssbfigur
      tittel={t('statistikk.ssb.kull.figur')}
      tekst={t('statistikk.ssb.kull.tekst', { sted: stedITekst, fra: String(fraAar), reg: String(k.fra), til: String(tilAar) })}
      merknad={t('statistikk.ssb.kull.merknad')}
    >
      <div class="fg-hovedtall-rad">
        <Hovedtall
          tall={k.endring === null ? t('statistikk.ingenTall') : t('statistikk.prosent', { verdi: fortegn(k.endring) })}
          etikett={t('statistikk.ssb.kull.endring', { fra: String(k.fra), til: String(k.til) })}
          under={`${formaterTall(k.naa ?? 0, 0)} → ${formaterTall(k.da ?? 0, 0)}`}
          tone={k.endring !== null && k.endring < 0 ? 'ned' : 'opp'}
        />
        {enhet !== 'L' && landet.endring !== null && (
          <Hovedtall tall={t('statistikk.prosent', { verdi: fortegn(landet.endring) })} etikett={t('statistikk.ssb.kull.landet')} under={t('statistikk.ssb.kull.sammePeriode')} />
        )}
      </div>
      <Linjediagram
        aar={u.aar}
        serier={[{ navn: sted, verdier: u.verdier[enhet] ?? [], valgt: true }]}
        framskrevetFra={u.aar.indexOf(u.framskrevetFra)}
        etikett={t('statistikk.ssb.kull.etikett', { sted: stedITekst, fra: String(fraAar), til: String(tilAar) })}
      />
      <Strekforklaring
        deler={[
          { tekst: t('statistikk.ssb.registrert'), form: 'heltrukket' },
          { tekst: t('statistikk.ssb.framskrevet'), form: 'stiplet' },
        ]}
      />
      <p class="st-gruppe-navn fg-mellomrom">{t('statistikk.ssb.kull.fylkene', { til: String(k.til) })}</p>
      <Stolper
        s={s}
        verdier={endring}
        enhet={enhet}
        maks={Math.max(5, ...fylkene(s).map((e) => Math.abs(endring(e) ?? 0)))}
        format={(v) => (v === null ? t('statistikk.ingenTall') : t('statistikk.prosent', { verdi: fortegn(v) }))}
        etikett={t('statistikk.ssb.kull.fylkene', { til: String(k.til) })}
      />
    </Ssbfigur>
  );
}

// ---------- 2. Unge utenfor arbeid og utdanning (13563 og 13556) ----------

export function Utenfor({ s, enhet }: { s: Ssb; enhet: string }) {
  const { t } = useTekst();
  const n = s.utenfor;
  const sted = ssbSted(t, enhet);
  const stedITekst = ssbStedITekst(t, enhet);
  const sisteAar = String(n.aar.at(-1) ?? '');
  const alder = n.alder[enhet];
  const serier =
    enhet === 'L'
      ? [{ navn: sted, verdier: n.prosent.L ?? [], valgt: true }]
      : [
          { navn: t('statistikk.landet'), verdier: n.prosent.L ?? [] },
          { navn: sted, verdier: n.prosent[enhet] ?? [], valgt: true },
        ];
  const maksAlder = Math.max(10, ...Object.values(n.alder).flatMap((a) => Object.values(a).filter((v): v is number => v !== null)));
  return (
    <Ssbfigur
      tittel={t('statistikk.ssb.utenfor.figur')}
      tekst={`${t('statistikk.ssb.utenfor.tekst', { sted: stedITekst })}${n.forelopig ? ` ${t('statistikk.ssb.utenfor.forelopig', { aar: sisteAar })}` : ''}`}
      merknad={t('statistikk.ssb.utenfor.merknad')}
    >
      <div class="fg-hovedtall-rad">
        <Hovedtall tall={pst(t, siste(n.prosent[enhet]))} etikett={sted} under={t('statistikk.ssb.utenfor.personer', { antall: formaterTall(n.antall[enhet] ?? 0, 0), aar: sisteAar })} />
        {enhet !== 'L' && <Hovedtall tall={pst(t, siste(n.prosent.L))} etikett={t('statistikk.ssb.kull.landet')} under={sisteAar} />}
      </div>
      <Linjediagram
        aar={n.aar}
        serier={serier}
        desimaler={1}
        etikett={t('statistikk.ssb.utenfor.etikett', { sted: stedITekst, fra: String(n.aar[0] ?? ''), til: sisteAar })}
      />
      {enhet !== 'L' && (
        <Strekforklaring
          deler={[
            { tekst: sted, form: 'heltrukket' },
            { tekst: t('statistikk.landet'), form: 'gra' },
          ]}
        />
      )}
      <p class="st-gruppe-navn fg-mellomrom">{t('statistikk.ssb.utenfor.alder', { aar: sisteAar })}</p>
      <ul class="st-rangering">
        {(['15-19', '20-24', '25-29'] as const).map((g) => {
          const [fra, til] = g.split('-');
          const v = alder?.[g] ?? null;
          return (
            <li key={g} class="st-rad st-valgt">
              <span class="st-rad-navn">{t('statistikk.ssb.utenfor.aldersgruppe', { fra: fra ?? '', til: til ?? '' })}</span>
              <span class="st-spor" aria-hidden="true">
                <span class="st-stolpe" style={{ width: `${((v ?? 0) / maksAlder) * 100}%` }} />
              </span>
              <span class="st-rad-tall">{pst(t, v)}</span>
            </li>
          );
        })}
      </ul>
      <p class="st-figur-tekst fg-mellomrom">
        {t('statistikk.ssb.utenfor.innvandrere')}: <b>{pst(t, n.innvandrere[enhet] ?? null)}</b> · {t('statistikk.ssb.utenfor.ovrige')}: <b>{pst(t, n.ovrige[enhet] ?? null)}</b>
      </p>
    </Ssbfigur>
  );
}

// ---------- 3. Grunnskolepoeng (07495) ----------

export function Grunnskolepoeng({ s, enhet }: { s: Ssb; enhet: string }) {
  const { t } = useTekst();
  const g = s.grunnskolepoeng;
  const aar = String(g.aar.at(-1) ?? '');
  const v = siste(g.poeng[enhet]);
  const fjor = g.poeng[enhet]?.at(-2) ?? null;
  const alle = fylkene(s).map((e) => siste(g.poeng[e])).filter((x): x is number => x !== null);
  const poeng = (x: Tall) => (x === null ? t('statistikk.ingenTall') : formaterTall(x, 1, 1));
  return (
    <Ssbfigur tittel={t('statistikk.ssb.poeng.tittel')} tekst={t('statistikk.ssb.poeng.tekst', { aar })} merknad={t('statistikk.ssb.poeng.merknad')}>
      <div class="fg-hovedtall-rad">
        <Hovedtall
          tall={poeng(v)}
          etikett={ssbSted(t, enhet)}
          under={v !== null && fjor !== null ? t('statistikk.ssb.poeng.fraFjor', { endring: fortegn(v - fjor), aar: String(g.aar.at(-2) ?? '') }) : undefined}
        />
        <Hovedtall tall={poeng(g.jenter[enhet] ?? null)} etikett={t('statistikk.ssb.poeng.jenter')} />
        <Hovedtall tall={poeng(g.gutter[enhet] ?? null)} etikett={t('statistikk.ssb.poeng.gutter')} />
      </div>
      <Punktskala
        rader={fylkene(s).map((e) => ({ navn: ssbSted(t, e), verdi: siste(g.poeng[e]), valgt: e === enhet }))}
        landet={siste(g.poeng.L)}
        min={Math.floor(Math.min(...alle) - 1)}
        maks={Math.ceil(Math.max(...alle) + 1)}
        etikett={t('statistikk.ssb.poeng.etikett', { aar })}
      />
      <p class="st-forklaring">
        <span class="st-landet-merke" aria-hidden="true" /> {t('statistikk.ssb.landet', { verdi: poeng(siste(g.poeng.L)) })}
      </p>
    </Ssbfigur>
  );
}

// ---------- 4. Hvem går i videregående (12274 og 09382) ----------

/**
 * Andelen 16–18-åringer i videregående. Fra start fylke for fylke. «Etter bakgrunn» viser andelen med
 * innvandringsbakgrunn og alle andre i fylket, og innvandrere og norskfødte for landet (eier 08.10.2026).
 */
export function Deltakelse({ s, enhet }: { s: Ssb; enhet: string }) {
  const { t } = useTekst();
  const [visning, settVisning] = useState<'fylkene' | 'bakgrunn'>('fylkene');
  const d = s.deltakelse;
  const sted = ssbSted(t, enhet);
  const stedITekst = ssbStedITekst(t, enhet);
  const aar = String(d.aar.at(-1) ?? '');
  const alle = fylkene(s).map((e) => siste(d.alle[e])).filter((x): x is number => x !== null);
  return (
    <Ssbfigur tittel={t('statistikk.ssb.deltakelse.figur')} tekst={t('statistikk.ssb.deltakelse.tekst', { sted: stedITekst, aar })} merknad={t('statistikk.ssb.deltakelse.merknad')}>
      <div class="fg-hovedtall-rad">
        <Hovedtall tall={pst(t, siste(d.alle[enhet]))} etikett={t('statistikk.ssb.deltakelse.hoved')} under={sted} />
        {enhet !== 'L' && <Hovedtall tall={pst(t, siste(d.alle.L))} etikett={t('statistikk.ssb.kull.landet')} under={aar} />}
      </div>
      <div class="st-valg" role="group" aria-label={t('statistikk.ssb.deltakelse.visning')}>
        {(['fylkene', 'bakgrunn'] as const).map((v) => (
          <button key={v} type="button" aria-pressed={visning === v} onClick={() => settVisning(v)}>
            {t(`statistikk.ssb.deltakelse.${v}`)}
          </button>
        ))}
      </div>
      {visning === 'fylkene' ? (
        <>
          <Punktskala
            rader={fylkene(s).map((e) => ({ navn: ssbSted(t, e), verdi: siste(d.alle[e]), valgt: e === enhet }))}
            landet={siste(d.alle.L)}
            min={Math.floor(Math.min(...alle) - 2)}
            maks={Math.min(100, Math.ceil(Math.max(...alle) + 2))}
            etikett={t('statistikk.ssb.deltakelse.etikett', { aar })}
          />
          <p class="st-forklaring">
            <span class="st-landet-merke" aria-hidden="true" /> {t('statistikk.ssb.landet', { verdi: pst(t, siste(d.alle.L)) })}
          </p>
        </>
      ) : (
        <>
          <ul class="st-rangering fg-brede-navn">
            {[
              { navn: t('statistikk.ssb.deltakelse.med'), v: d.innvandringsbakgrunn[enhet] ?? null },
              { navn: t('statistikk.ssb.deltakelse.ovrige'), v: d.ovrige[enhet] ?? null },
            ].map((r) => (
              <li key={r.navn} class="st-rad st-valgt">
                <span class="st-rad-navn">{r.navn}</span>
                <span class="st-spor" aria-hidden="true">
                  <span class="st-stolpe" style={{ width: `${r.v ?? 0}%` }} />
                </span>
                <span class="st-rad-tall">{pst(t, r.v)}</span>
              </li>
            ))}
          </ul>
          <p class="st-figur-tekst fg-mellomrom">{t('statistikk.ssb.deltakelse.landet', { innvandrere: pst(t, d.landet.innvandrere), norskfodte: pst(t, d.landet.norskfodte) })}</p>
        </>
      )}
    </Ssbfigur>
  );
}

// ---------- 5. Lærerne i videregående (12091 og 12697) ----------

export function Laererne({ s, enhet }: { s: Ssb; enhet: string }) {
  const { t } = useTekst();
  const l = s.laerere;
  const sted = ssbSted(t, enhet);
  const stedITekst = ssbStedITekst(t, enhet);
  const aar = String(l.aar.at(-1) ?? '');
  const a = l.alder[enhet];
  return (
    <Ssbfigur tittel={t('statistikk.ssb.laerere.figur')} tekst={t('statistikk.ssb.laerere.tekst', { sted: stedITekst, aar })} merknad={t('statistikk.ssb.laerere.merknad')}>
      <div class="fg-hovedtall-rad">
        <Hovedtall tall={formaterTall(siste(l.antall[enhet]) ?? 0, 0)} etikett={t('statistikk.ssb.laerere.laerere')} under={t('statistikk.ssb.laerere.kvinner', { verdi: pst(t, l.kvinner[enhet] ?? null) })} />
        <Hovedtall tall={pst(t, a?.fra60 ?? null)} etikett={t('statistikk.ssb.laerere.over60')} under={enhet === 'L' ? undefined : t('statistikk.landetVerdi', { verdi: pst(t, l.alder.L?.fra60 ?? null) })} />
        <Hovedtall tall={pst(t, l.pedagogisk[enhet] ?? null)} etikett={t('statistikk.ssb.laerere.pedagogisk')} />
      </div>
      <Stablet
        etikett={t('statistikk.ssb.laerere.alder')}
        deler={[
          { navn: t('statistikk.ssb.laerere.under30'), andel: a?.under30 ?? 0 },
          { navn: t('statistikk.ssb.laerere.fra30'), andel: a?.fra30til49 ?? 0 },
          { navn: t('statistikk.ssb.laerere.fra50'), andel: a?.fra50til59 ?? 0 },
          { navn: t('statistikk.ssb.laerere.fra60'), andel: a?.fra60 ?? 0, fremhevet: true },
        ]}
      />
      <p class="st-gruppe-navn fg-mellomrom">{t('statistikk.ssb.laerere.utvikling', { fra: String(l.aar[0] ?? ''), til: aar })}</p>
      <Linjediagram
        aar={l.aar}
        serier={
          enhet === 'L'
            ? [{ navn: sted, verdier: l.andel60.L ?? [], valgt: true }]
            : [
                { navn: t('statistikk.landet'), verdier: l.andel60.L ?? [] },
                { navn: sted, verdier: l.andel60[enhet] ?? [], valgt: true },
              ]
        }
        desimaler={1}
        etikett={t('statistikk.ssb.laerere.etikett', { sted: stedITekst, fra: String(l.aar[0] ?? ''), til: aar })}
      />
      {enhet !== 'L' && (
        <Strekforklaring
          deler={[
            { tekst: sted, form: 'heltrukket' },
            { tekst: t('statistikk.landet'), form: 'gra' },
          ]}
        />
      )}
    </Ssbfigur>
  );
}

// ---------- 6. Penger per elev (KOSTRA, 12399 og 12609) ----------

export function Kostnad({ s, enhet }: { s: Ssb; enhet: string }) {
  const { t } = useTekst();
  const k = s.kostnad;
  const aar = String(k.aar.at(-1) ?? '');
  const perElev = (e: string) => siste(k.perElev[e]);
  return (
    <Ssbfigur tittel={t('statistikk.ssb.kostnad.figur')} tekst={t('statistikk.ssb.kostnad.tekst', { aar })} merknad={t('statistikk.ssb.kostnad.merknad')}>
      <div class="fg-hovedtall-rad">
        <Hovedtall tall={tusenKr(t, perElev(enhet))} etikett={t('statistikk.ssb.kostnad.perElev')} under={ssbSted(t, enhet)} />
        <Hovedtall
          tall={formaterTall(siste(k.elevPerLaerer[enhet]) ?? 0, 1, 1)}
          etikett={t('statistikk.ssb.kostnad.perLaerer')}
          under={enhet === 'L' ? undefined : t('statistikk.landetVerdi', { verdi: formaterTall(siste(k.elevPerLaerer.L) ?? 0, 1, 1) })}
        />
      </div>
      <Stolper
        s={s}
        verdier={perElev}
        enhet={enhet}
        maks={Math.max(...fylkene(s).map((e) => perElev(e) ?? 0)) * 1.05}
        format={(v) => tusenKr(t, v)}
        etikett={t('statistikk.ssb.kostnad.etikett', { aar })}
      />
    </Ssbfigur>
  );
}

// ---------- Boksene på sidene der tallene er nyttige ----------

/** Inntak: søkerne i år fra Udir og ungdomskullene framover fra SSB i én boks, så tallene leses sammen. */
export function InntakBoks({ fylke }: { fylke: string | null }) {
  const { t } = useTekst();
  const d = useStatistikk();
  const s = useSsb();
  if (s === null || s === 'feil') return null;
  const enhet = ssbEnhet(s, fylke);
  const k = kullFor(s, enhet);
  const udir = d !== null && d !== 'feil' ? d : null;
  const sok = udir?.sokere.alle[enhet];
  return (
    <Tallboks tittel={t('statistikk.ssb.boks.inntak', { sted: ssbStedITekst(t, enhet) })} lenke={temaLenke('ungdom', fylke)} kilde={t('statistikk.kildeBegge')}>
      {udir && sok && (
        <p>
          {t('statistikk.boks.inntakTekst', {
            antall: tekstFor(t, sisteVerdi(sok)),
            aar: String(udir.sokere.aar.at(-1) ?? ''),
            endring: endringTekst(t, sisteVerdi(sok), forrigeVerdi(sok), udir.sokere.aar.at(-2) ?? '') ?? '',
            laereplass: tekstFor(t, sisteVerdi(udir.sokere.laereplass[enhet])),
          })}
        </p>
      )}
      <p>
        {t('statistikk.ssb.boks.kull', { naa: formaterTall(k.naa ?? 0, 0), fra: String(k.fra), da: formaterTall(k.da ?? 0, 0), til: String(k.til), endring: fortegn(k.endring ?? 0) })}
      </p>
      <Linjediagram
        aar={s.ungdomskull.aar}
        serier={[{ navn: ssbSted(t, enhet), verdier: s.ungdomskull.verdier[enhet] ?? [], valgt: true }]}
        framskrevetFra={s.ungdomskull.aar.indexOf(s.ungdomskull.framskrevetFra)}
        etikett={t('statistikk.ssb.kull.etikett', { sted: ssbStedITekst(t, enhet), fra: String(s.ungdomskull.aar[0] ?? ''), til: String(s.ungdomskull.aar.at(-1) ?? '') })}
      />
    </Tallboks>
  );
}

/** Poengberegning: snittet i fylket, for jenter og gutter. */
export function PoengBoks({ fylke }: { fylke: string | null }) {
  const { t } = useTekst();
  const s = useSsb();
  if (s === null || s === 'feil') return null;
  const enhet = ssbEnhet(s, fylke);
  const g = s.grunnskolepoeng;
  const poeng = (x: Tall) => (x === null ? t('statistikk.ingenTall') : formaterTall(x, 1, 1));
  return (
    <Tallboks tittel={t('statistikk.ssb.boks.poeng', { sted: ssbStedITekst(t, enhet) })} lenke={temaLenke('ungdom', fylke)} kilde={t('statistikk.ssb.kildeAar', { aar: String(g.aar.at(-1) ?? '') })}>
      <div class="fg-hovedtall-rad">
        <Hovedtall tall={poeng(siste(g.poeng[enhet]))} etikett={t('statistikk.ssb.poeng.snitt', { aar: String(g.aar.at(-1) ?? '') })} />
        <Hovedtall tall={poeng(g.jenter[enhet] ?? null)} etikett={t('statistikk.ssb.poeng.jenter')} />
        <Hovedtall tall={poeng(g.gutter[enhet] ?? null)} etikett={t('statistikk.ssb.poeng.gutter')} />
      </div>
    </Tallboks>
  );
}

/** Oppfølgingstjenesten: andelen unge utenfor arbeid og utdanning i aldersgruppene tjenesten har ansvar for. */
export function UtenforBoks({ fylke }: { fylke: string | null }) {
  const { t } = useTekst();
  const s = useSsb();
  if (s === null || s === 'feil') return null;
  const enhet = ssbEnhet(s, fylke);
  const n = s.utenfor;
  const stedITekst = ssbStedITekst(t, enhet);
  return (
    <Tallboks tittel={t('statistikk.ssb.boks.utenfor', { sted: stedITekst })} lenke={temaLenke('fullforing', fylke)} kilde={t('statistikk.ssb.kildeAar', { aar: String(n.aar.at(-1) ?? '') })}>
      <div class="fg-hovedtall-rad">
        {(['15-19', '20-24'] as const).map((g) => {
          const [fra, til] = g.split('-');
          return (
            <Hovedtall
              key={g}
              tall={pst(t, n.alder[enhet]?.[g] ?? null)}
              etikett={t('statistikk.ssb.boks.utenforEtikett', { fra: fra ?? '', til: til ?? '' })}
              under={enhet === 'L' ? undefined : t('statistikk.landetVerdi', { verdi: pst(t, n.alder.L?.[g] ?? null) })}
            />
          );
        })}
      </div>
    </Tallboks>
  );
}

/** Arbeidstid: lærerne i fylket, hvor mange som er 60 år eller eldre og hvor mange som har pedagogisk utdanning. */
export function LaerereBoks({ fylke }: { fylke: string | null }) {
  const { t } = useTekst();
  const s = useSsb();
  if (s === null || s === 'feil') return null;
  const enhet = ssbEnhet(s, fylke);
  const l = s.laerere;
  return (
    <Tallboks tittel={t('statistikk.ssb.boks.laerere', { sted: ssbStedITekst(t, enhet) })} lenke={temaLenke('skolen', fylke)} kilde={t('statistikk.ssb.kildeAar', { aar: String(l.aar.at(-1) ?? '') })}>
      <div class="fg-hovedtall-rad">
        <Hovedtall tall={formaterTall(siste(l.antall[enhet]) ?? 0, 0)} etikett={t('statistikk.ssb.laerere.laerere')} />
        <Hovedtall
          tall={pst(t, l.alder[enhet]?.fra60 ?? null)}
          etikett={t('statistikk.ssb.laerere.over60')}
          under={enhet === 'L' ? undefined : t('statistikk.landetVerdi', { verdi: pst(t, l.alder.L?.fra60 ?? null) })}
        />
        <Hovedtall tall={pst(t, l.pedagogisk[enhet] ?? null)} etikett={t('statistikk.ssb.laerere.pedagogisk')} />
      </div>
    </Tallboks>
  );
}
