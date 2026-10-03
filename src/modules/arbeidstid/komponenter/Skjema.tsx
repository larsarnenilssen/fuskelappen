// Skjemadeler for kalkulatorene: brytere, fagsøk med årsramme fra vedlegg 1, og kort for hvert fag.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import fagsok from 'virtual:fagsok';
import { useTekst } from '../../../app/tilstand.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Oppsummering, Sammenleggknapp, useSammenlagt } from '../../../components/Sammenlegg.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { somTabell } from '../../../core/regler/motor.ts';
import { lastFagindeks } from '../../fag/data.ts';
import { filtrerFag, tomtFilter } from '../../fag/oppslag.ts';
import type { Fagindeks as Grepindeks } from '../../fag/skjema.ts';
import { finnKobling, lesArsrammer, lesKoblinger, type Arsrammerad, type Arsrammevalg, type Arstimerad, type Gruppe, type Hent, type Koblingstabeller } from '../beregning/index.ts';
import { lagFagindeks, sokFag } from '../fagsok.ts';
import { type Oppdater, useHent } from '../kontekst.ts';
import { type Arsrammeplass, fagvalgFraKobling, type Grepfag, koblingsmetode } from '../fagvalg.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

export { type Arsrammeplass, fagvalgFraKobling, type Grepfag, koblingsmetode };

import { Bryter } from '../../../components/Bryter.tsx';

export { Bryter };

/** Av/på-bryter (avkrysning med rollen «switch»). Hjelpeteksten ligger bak et «?». */
export function Vippe({
  tekst,
  hjelp,
  skjultForan,
  pa,
  onEndring,
}: {
  tekst: string;
  hjelp?: string;
  /** Tekst foran etiketten som bare skjermlesere får, f.eks. «Funksjon 2:» når det er flere like brytere. */
  skjultForan?: string;
  pa: boolean;
  onEndring: (pa: boolean) => void;
}) {
  const id = useId();
  return (
    <div class="vippe med-hjelp">
      <input id={id} type="checkbox" role="switch" checked={pa} onChange={(e) => onEndring(e.currentTarget.checked)} />
      <label for={id}>
        {skjultForan && <span class="skjult-visuelt">{skjultForan} </span>}
        {tekst}
      </label>
      {hjelp && (
        <Hjelp tema={tekst}>
          <p class="felt-hjelp"><Begrepstekst tekst={hjelp} /></p>
        </Hjelp>
      )}
    </div>
  );
}



const arstimerForFagkode = fagsok.arstimer;
let fagkodenavn: Map<string, string> | null = null;

/** Navnet på en fagkode i Grep, f.eks. «Helsefremmende arbeid» for HEA2005. */
export function navnForFagkode(kode: string): string | undefined {
  fagkodenavn ??= new Map(Object.values(fagsok.fagkoder).flat());
  return fagkodenavn.get(kode);
}

/**
 * Kjent årstimetall for et valg: fra fagkoden brukeren søkte fram (Grep), ellers fra årstimetabellen for raden.
 * Undefined når årstimetallet ikke er kjent (f.eks. et programfag på yrkesfag uten valgt fagkode).
 */
export function kjentArstimer(plass: Arsrammeplass | undefined, tabell: ReadonlyMap<number, Arstimerad> | undefined): Arstimerad | undefined {
  // Fag valgt med fagkode: årstimetallet i Grep, også når årsrammen er overstyrt.
  if (plass?.fag && plass.fag.timer !== null) return { arstimer: plass.fag.timer, fagkoder: [plass.fag.kode] };
  if (!plass?.valg || plass.valg === 'manuell') return undefined;
  // Fagkodene må ha samme årstimetall (samme fag i flere programområder), ellers brukes tabellen for raden.
  const tall = (plass.fagkoder ?? []).map((k) => arstimerForFagkode[k]);
  const forste = tall[0];
  if (plass.fagkoder && typeof forste === 'number' && tall.every((t) => t === forste)) return { arstimer: forste, fagkoder: plass.fagkoder };
  return tabell?.get(Number(plass.valg));
}

export function tomArsrammeplass(): Arsrammeplass {
  return { valg: '', t60: null, stjerne: false };
}

/** Gjør et utfylt valg om til inndata for beregningen, eller null hvis det mangler noe. */
export function tilArsrammevalg(p: Arsrammeplass, rader: readonly Arsrammerad[]): Arsrammevalg | null {
  if (p.valg === 'manuell') return p.t60 !== null && p.t60 > 0 ? { type: 'manuell', t60: p.t60, stjerne: p.stjerne } : null;
  const rad = rader.find((r) => String(r.nr) === p.valg);
  return rad ? { type: 'rad', rad, ...(p.fag ? { fagkode: p.fag.kode } : {}) } : null;
}

export function erStjernefag(plasser: readonly Arsrammeplass[], rader: readonly Arsrammerad[]): boolean {
  return plasser.some((p) => {
    const v = tilArsrammevalg(p, rader);
    if (v === null) return false;
    return v.type === 'rad' ? v.rad.stjerne : v.type === 'manuell' && v.stjerne;
  });
}

/** Søkeindeksen for vedlegg 1, med søkeord fra regelsettet og programområdene fra Grep. */
export function useFagindeks(hent: Hent, rader: readonly Arsrammerad[]) {
  return useMemo(() => {
    const tabell = (n: string) => {
      try {
        return somTabell(hent(n), n);
      } catch {
        return [];
      }
    };
    return lagFagindeks(rader, {
      programnavn: tabell('sfs2213.programnavn'),
      fagnavn: tabell('sfs2213.fagnavn'),
      kallenavn: tabell('sfs2213.kallenavn'),
      programomrader: fagsok.programomrader,
      fagkoder: fagsok.fagkoder,
    });
  }, [hent, rader]);
}

export type Fagindeks = ReturnType<typeof useFagindeks>;

/** Kort visning av en valgt rad: «Engelsk · Studiespesialisering Vg1». */
export function radTekst(indeks: Fagindeks, nr: string): { navn: string; t60: number; t45: number; stjerne: boolean } | null {
  const post = indeks.find((p) => String(p.treff.rad.nr) === nr);
  if (!post) return null;
  const { rad, fag, program } = post.treff;
  return { navn: `${fag ?? rad.kategori} · ${program} ${rad.trinn}`, t60: rad.t60, t45: rad.t45, stjerne: rad.stjerne };
}

/** Koblingstabellene og radene i vedlegg 1 for perioden, eller null hvis regelsettet ikke har koblingen. */
export function useKoblingsdata(): { tabeller: Koblingstabeller; rader: Arsrammerad[] } | null {
  const hent = useHent();
  return useMemo(() => {
    try {
      return { tabeller: lesKoblinger(hent), rader: lesArsrammer(hent('sfs2213.arsrammer')) };
    } catch {
      return null;
    }
  }, [hent]);
}

/** Fagindeksen fra Grep. Lastes først når den trengs (brukeren søker, eller et fag med fagkode er valgt). */
function useGrepindeks(aktiv: boolean): Grepindeks | null {
  const [indeks, settIndeks] = useState<Grepindeks | null>(null);
  useEffect(() => {
    if (!aktiv || indeks) return;
    let levende = true;
    lastFagindeks().then(
      (i) => levende && settIndeks(i),
      () => undefined,
    );
    return () => {
      levende = false;
    };
  }, [aktiv, indeks]);
  return indeks;
}

/** Linjen om hvordan årsrammen ble funnet for et fag valgt med fagkode. */
function Koblingslinje({ plass, onEndring }: { plass: Arsrammeplass; onEndring: (p: Arsrammeplass) => void }) {
  const { t } = useTekst();
  const fag = plass.fag;
  const metode = koblingsmetode(plass);
  if (!fag || metode === null) return null;
  const tekst =
    metode === 'eksplisitt'
      ? t('arbeidstid.felles.koblingEksplisitt')
      : metode === 'regel'
        ? t('arbeidstid.felles.koblingRegel')
        : fag.nr !== null
          ? t('arbeidstid.felles.overstyrtArsramme', { nr: fag.nr })
          : t('arbeidstid.felles.valgtSelv');
  return (
    <p class={`felt-hjelp fagvalg-metode${metode === 'manuell' ? ' overstyrt' : ''}`} data-metode={metode}>
      {tekst}{' '}
      {metode === 'manuell' && fag.nr !== null ? (
        <button type="button" class="lenkeknapp liten" onClick={() => onEndring({ ...plass, valg: String(fag.nr), t60: null, stjerne: false, fag: { ...fag, overstyr: false } })}>
          {t('arbeidstid.felles.brukKobling')}
        </button>
      ) : (
        <button type="button" class="lenkeknapp liten" onClick={() => onEndring({ ...plass, valg: '', t60: null, stjerne: false, fag: { ...fag, overstyr: true } })}>
          {t('arbeidstid.felles.endreArsramme')}
        </button>
      )}
    </p>
  );
}

/** Kort navn på faget valgt med fagkode: «HEA2005 Helsefremmende arbeid». */
function Fagkodelinje({ fag }: { fag: Grepfag }) {
  const { malform } = useTekst();
  return (
    <span class="fagvalg-kode">
      {fag.kode} {fag.navn[malform]}
    </span>
  );
}

/** Velger en årsramme: søk i vedlegg 1 eller på fagkode, eller skriv inn årsrammen selv. */
export function Fagvelger({
  etikett,
  plass,
  indeks,
  onEndring,
  ekstra,
}: {
  etikett: string;
  plass: Arsrammeplass;
  indeks: Fagindeks;
  onEndring: (p: Arsrammeplass) => void;
  ekstra?: ComponentChildren;
}) {
  const { t, malform } = useTekst();
  const id = useId();
  const [sok, settSok] = useState('');
  const treff = useMemo(() => sokFag(indeks, sok, 6), [indeks, sok]);
  const kobling = useKoblingsdata();
  const fag = plass.fag ?? null;
  const grep = useGrepindeks(sok.trim().length >= 2 || fag !== null);
  const grepTreff = useMemo(() => {
    if (!grep || !kobling || fag || sok.trim().length < 2) return [];
    return filtrerFag(grep, { ...tomtFilter, tekst: sok })
      .slice(0, 5)
      .map(({ kode, fag: f }) => ({ kode, f, r: finnKobling(kode, grep, kobling.tabeller, kobling.rader) }));
  }, [grep, kobling, fag, sok]);
  // Valg som beholder faget valgt med fagkode (årstimene følger faget), men der brukeren velger årsrammen selv.
  const medFag = (p: Arsrammeplass): Arsrammeplass => (fag ? { ...p, fagkoder: [fag.kode], fag: { ...fag, overstyr: false } } : p);
  const manuellKnapp = (
    <button type="button" class="lenkeknapp liten etikettrad-hoyre" onClick={() => onEndring(medFag({ valg: 'manuell', t60: null, stjerne: false }))}>
      {t('arbeidstid.felles.manuellValg')}
    </button>
  );

  if (plass.valg === 'manuell') {
    return (
      <div class="fagvelger">
        {fag && (
          <p class="fagvalg">
            <Fagkodelinje fag={fag} />
          </p>
        )}
        {/* Byttet tilbake til søk står på samme sted som «Skriv inn årsramme selv» (eier 01.10.2026). */}
        <Tallfelt
          etikett={t('arbeidstid.felles.manuellEtikett')}
          verdi={plass.t60}
          min={1}
          maks={2000}
          onEndring={(v) => onEndring({ ...plass, t60: v })}
          etikettHoyre={
            <button type="button" class="lenkeknapp liten etikettrad-hoyre" onClick={() => onEndring(tomArsrammeplass())}>
              {t('arbeidstid.felles.tilbakeTilSok')}
            </button>
          }
        />
        <Vippe tekst={t('arbeidstid.felles.manuellStjerne')} pa={plass.stjerne} onEndring={(stjerne) => onEndring({ ...plass, stjerne })} />
        <Koblingslinje plass={plass} onEndring={onEndring} />
        {ekstra}
      </div>
    );
  }

  const valgt = plass.valg ? radTekst(indeks, plass.valg) : null;
  if (valgt) {
    return (
      <div class="fagvelger">
        <p class="fagvalg" aria-label={`${etikett}: ${fag ? `${fag.kode} ${fag.navn[malform]}, ` : ''}${valgt.navn}`}>
          <span class="fagvalg-navn">
            {valgt.navn}
            {valgt.stjerne && <span aria-hidden="true"> {t('arbeidstid.felles.stjerne')}</span>}
          </span>
          {fag ? (
            <Fagkodelinje fag={fag} />
          ) : (
            plass.fagkoder &&
            plass.fagkoder.length > 0 && (
              <span class="fagvalg-kode">
                {plass.fagkoder.join(', ')} {navnForFagkode(plass.fagkoder[0] as string) ?? ''}
              </span>
            )
          )}
          <span class="fagvalg-ramme tall">{t('arbeidstid.felles.arsrammeKort', { t60: formaterTall(valgt.t60), t45: formaterTall(valgt.t45) })}</span>
          <button type="button" class="lenkeknapp liten" onClick={() => onEndring(tomArsrammeplass())} aria-label={`${t('arbeidstid.felles.endreFag')}: ${valgt.navn}`}>
            {t('arbeidstid.felles.endreFag')}
          </button>
        </p>
        <Koblingslinje plass={plass} onEndring={onEndring} />
        {ekstra}
      </div>
    );
  }

  // Faget er valgt med fagkode, men koblingen er flertydig: brukeren velger utdanningsprogram og trinn.
  const kandidater = fag && !fag.overstyr ? fag.kandidater.filter((k, i, l) => l.findIndex((x) => x.program === k.program && x.trinn === k.trinn) === i) : [];
  if (fag && kandidater.length > 0) {
    return (
      <div class="fagvelger">
        <p class="fagvalg">
          <Fagkodelinje fag={fag} />
          <button type="button" class="lenkeknapp liten" onClick={() => onEndring(tomArsrammeplass())}>
            {t('arbeidstid.felles.endreFag')}
          </button>
        </p>
        <fieldset class="programvalg">
          <legend>{t('arbeidstid.felles.velgProgramTrinn', { fag: `${fag.kode} ${fag.navn[malform]}` })}</legend>
          <p class="felt-hjelp">{t('arbeidstid.felles.velgProgramTrinnHjelp')}</p>
          <ul class="fagtreff">
            {kandidater.map((k) => (
              <li key={`${k.program}-${k.trinn}`}>
                <button type="button" onClick={() => onEndring({ valg: String(k.nr), t60: null, stjerne: false, fagkoder: [fag.kode], fag: { ...fag, nr: k.nr, metode: k.metode, overstyr: false } })}>
                  <span class="fagtreff-navn">
                    {grep?.utdanningsprogram[k.program]?.[malform] ?? k.program} {k.trinn}
                  </span>
                  <span class="fagtreff-under tall">{t('arbeidstid.felles.arsrammeKort', { t60: formaterTall(k.t60), t45: formaterTall(k.t45) })}</span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="button" class="lenkeknapp liten" onClick={() => onEndring({ ...plass, fag: { ...fag, overstyr: true } })}>
          {t('arbeidstid.felles.endreArsramme')}
        </button>
        {ekstra}
      </div>
    );
  }

  return (
    <div class="fagvelger">
      {fag && (
        <>
          <p class="fagvalg">
            <Fagkodelinje fag={fag} />
            <button type="button" class="lenkeknapp liten" onClick={() => onEndring(tomArsrammeplass())}>
              {t('arbeidstid.felles.endreFag')}
            </button>
          </p>
          {fag.kandidater.length === 0 ? (
            <p class="felt-hjelp">{t('arbeidstid.felles.ikkeKoblet', { fag: fag.kode })}</p>
          ) : (
            <p class="felt-hjelp">
              <button
                type="button"
                class="lenkeknapp liten"
                onClick={() => onEndring(fag.nr !== null ? { ...plass, valg: String(fag.nr), fag: { ...fag, overstyr: false } } : { ...plass, fag: { ...fag, overstyr: false } })}
              >
                {t('arbeidstid.felles.avbrytOverstyring')}
              </button>
            </p>
          )}
        </>
      )}
      <div class="felt">
        <div class="etikettrad med-hjelp">
          <label for={id}>{etikett}</label>
          <Hjelp tema={etikett}>
            <p class="felt-hjelp"><Begrepstekst tekst={t('arbeidstid.felles.fagSokHjelp')} /></p>
          </Hjelp>
          {manuellKnapp}
        </div>
        <div class="sokefelt">
          <Ikon navn="sok" class="sokefelt-ikon" />
          <input
            id={id}
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            placeholder={t('arbeidstid.felles.fagSok')}
            aria-controls={`${id}-treff`}
            value={sok}
            onInput={(e) => settSok(e.currentTarget.value)}
          />
        </div>
      </div>
      <ul id={`${id}-treff`} class="fagtreff" aria-live="polite">
        {treff.map((tr) => (
          <li key={tr.rad.nr}>
            <button type="button" onClick={() => onEndring(medFag({ valg: String(tr.rad.nr), t60: null, stjerne: false, fagkoder: tr.fagkoder ?? null }))}>
              <span class="fagtreff-navn">
                {tr.fag ?? tr.rad.kategori} · {tr.program} {tr.rad.trinn}
                {tr.rad.stjerne && <span aria-hidden="true"> {t('arbeidstid.felles.stjerne')}</span>}
              </span>
              <span class="fagtreff-under tall">
                {t('arbeidstid.felles.arsrammeKort', { t60: formaterTall(tr.rad.t60), t45: formaterTall(tr.rad.t45) })}
                {tr.ekstra.length > 0 && ` · ${tr.ekstra.join(', ')}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {grepTreff.length > 0 && (
        <>
          <p class="fagtreff-overskrift" id={`${id}-grep`}>
            {t('arbeidstid.felles.grepTreff')}
          </p>
          <ul class="fagtreff" aria-labelledby={`${id}-grep`}>
            {grepTreff.map(({ kode, f, r }) => (
              <li key={kode}>
                <button type="button" onClick={() => onEndring(fagvalgFraKobling(kode, f.navn, f.timer, r))}>
                  <span class="fagtreff-navn">
                    {kode} {f.navn[malform]}
                  </span>
                  <span class="fagtreff-under tall">
                    {[
                      f.trinn.join(', '),
                      r.status === 'koblet'
                        ? t('arbeidstid.felles.grepArsramme', { t60: formaterTall(r.kandidat.rad.t60), t45: formaterTall(r.kandidat.rad.t45) })
                        : r.status === 'flertydig'
                          ? t('arbeidstid.felles.grepFlertydig')
                          : t('arbeidstid.felles.grepUkoblet'),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {sok.trim() !== '' && treff.length === 0 && grepTreff.length === 0 && <p class="felt-hjelp">{t('arbeidstid.felles.ingenFagTreff')}</p>}
      {ekstra}
    </div>
  );
}

/** Fag med årsramme: hovedfaget, eventuelt flere program eller nivåer i samme time, og bryter for små klasser. */
export function Fagfelt({
  plasser,
  faaElever,
  indeks,
  rader,
  onPlasser,
  onFaaElever,
}: {
  plasser: Arsrammeplass[];
  faaElever: boolean;
  indeks: Fagindeks;
  rader: readonly Arsrammerad[];
  onPlasser: Oppdater<Arsrammeplass[]>;
  onFaaElever: (v: boolean) => void;
}) {
  const { t } = useTekst();
  const sett = (i: number, ny: Arsrammeplass) => onPlasser((gamle) => gamle.map((x, j) => (j === i ? ny : x)));
  return (
    <>
      {plasser.map((p, i) => (
        <div key={i} class={i > 0 ? 'fag-blandet' : undefined}>
          <Fagvelger
            etikett={i === 0 ? t('arbeidstid.felles.fag') : t('arbeidstid.felles.blandetEtikett')}
            plass={p}
            indeks={indeks}
            onEndring={(ny) => sett(i, ny)}
            ekstra={
              i > 0 ? (
                <button type="button" class="lenkeknapp liten" onClick={() => onPlasser((gamle) => gamle.filter((_, j) => j !== i))}>
                  {t('arbeidstid.felles.fjernArsramme')}
                </button>
              ) : undefined
            }
          />
        </div>
      ))}
      {(plasser[0]?.valg || erStjernefag(plasser, rader)) && (
        <div class="valgrad">
          {plasser[0]?.valg && (
            <button type="button" class="lenkeknapp liten" onClick={() => onPlasser((gamle) => [...gamle, tomArsrammeplass()])}>
              <Ikon navn="pluss" class="ikon-liten" />
              {t('arbeidstid.felles.leggTilArsramme')}
            </button>
          )}
          {erStjernefag(plasser, rader) && <Vippe tekst={t('arbeidstid.felles.faaElever')} hjelp={t('arbeidstid.felles.faaEleverHjelp')} pa={faaElever} onEndring={onFaaElever} />}
        </div>
      )}
    </>
  );
}

/** Minutter per økt: 45, 60, 90 eller annet. Kompakt, med etiketten på samme linje. */
export function Minuttvelger({ minutter, fritt, onEndring }: { minutter: number | null; fritt: boolean; onEndring: (m: number | null, fritt: boolean) => void }) {
  const { t } = useTekst();
  const valg = fritt ? 'annet' : String(minutter ?? 45);
  return (
    <>
      <Bryter
        legend={t('arbeidstid.felles.minutter')}
        kompakt
        verdi={valg}
        valg={[
          { verdi: '45', tekst: '45' },
          { verdi: '60', tekst: '60' },
          { verdi: '90', tekst: '90' },
          { verdi: 'annet', tekst: t('arbeidstid.felles.minutterAnnet') },
        ]}
        onEndring={(v) => (v === 'annet' ? onEndring(minutter, true) : onEndring(Number(v), false))}
      />
      {fritt && <Tallfelt etikett={t('arbeidstid.felles.minutterFritt')} verdi={minutter} min={1} maks={600} onEndring={(m) => onEndring(m, true)} />}
    </>
  );
}

export interface Gruppetilstand {
  id: number;
  arsrammer: Arsrammeplass[];
  faaElever: boolean;
  modus: 'arstimer' | 'okter';
  arstimer: number | null;
  /** Sann når årstimene er fylt inn fra det valgte faget (og ikke skrevet av brukeren). */
  arstimerAuto: boolean;
  okter: number | null;
  minutter: number | null;
  minutterFritt: boolean;
  uker: number | null;
  endreUker: boolean;
}

let nesteId = 1;

export function nyGruppe(): Gruppetilstand {
  return { id: nesteId++, arsrammer: [tomArsrammeplass()], faaElever: false, modus: 'arstimer', arstimer: null, arstimerAuto: false, okter: null, minutter: 45, minutterFritt: false, uker: null, endreUker: false };
}

/** Sørger for at nye grupper får id-er som ikke er brukt (etter at tilstanden er hentet fra historikken). */
export function reserverIder(grupper: readonly Gruppetilstand[]): void {
  for (const g of grupper) nesteId = Math.max(nesteId, g.id + 1);
}

/** Gjør gruppeskjemaet om til inndata for beregningen, eller null hvis noe mangler. */
export function tilGruppe(g: Gruppetilstand, rader: readonly Arsrammerad[], periode: boolean): Gruppe | null {
  const valg = g.arsrammer.map((p) => tilArsrammevalg(p, rader));
  if (valg.length === 0 || valg.some((v) => v === null)) return null;
  const arsrammer = valg as Arsrammevalg[];
  if (g.modus === 'arstimer') {
    if (g.arstimer === null) return null;
    return { arsrammer, elever: g.faaElever, undervisning: { type: 'arstimer', arstimer: g.arstimer } };
  }
  // I en periode betyr tomt felt at ukene regnes ut fra dagene i perioden.
  const uker = g.endreUker || periode ? g.uker : null;
  if (g.okter === null || g.minutter === null) return null;
  return { arsrammer, elever: g.faaElever, undervisning: { type: 'okter', okterPerUke: g.okter, minutter: g.minutter, uker } };
}

/**
 * Årstimer når faget i gruppen endres: det kjente årstimetallet for faget fylles inn, med mindre brukeren
 * har skrevet inn timene selv. Fag uten kjent årstimetall tømmer bare et tall som var fylt inn automatisk.
 */
export function autoArstimer(
  gruppe: Gruppetilstand,
  arsrammer: readonly Arsrammeplass[],
  tabell: ReadonlyMap<number, Arstimerad> | undefined,
): Partial<Gruppetilstand> {
  const nokkel = (p: Arsrammeplass | undefined) => `${p?.valg ?? ''}|${(p?.fagkoder ?? []).join(',')}|${p?.fag?.kode ?? ''}`;
  if (nokkel(arsrammer[0]) === nokkel(gruppe.arsrammer[0]) || !(gruppe.arstimer === null || gruppe.arstimerAuto)) return {};
  const kjent = kjentArstimer(arsrammer[0], tabell);
  if (kjent) return { arstimer: kjent.arstimer, arstimerAuto: true };
  return gruppe.arstimerAuto ? { arstimer: null, arstimerAuto: false } : {};
}

export function Gruppekort({
  gruppe,
  nr,
  rader,
  indeks,
  periode,
  standardUker,
  ukerHjelp,
  delresultat,
  kanFjernes,
  arstimer,
  onEndring,
  onFjern,
}: {
  gruppe: Gruppetilstand;
  nr: number;
  rader: readonly Arsrammerad[];
  indeks: Fagindeks;
  periode: boolean;
  standardUker: number;
  ukerHjelp?: string;
  delresultat: string | null;
  kanFjernes: boolean;
  arstimer?: ReadonlyMap<number, Arstimerad>;
  onEndring: Oppdater<Gruppetilstand>;
  onFjern: () => void;
}) {
  const { t, malform } = useTekst();
  const sett = (endring: Partial<Gruppetilstand>) => onEndring((gammel) => ({ ...gammel, ...endring }));
  const kjent = kjentArstimer(gruppe.arsrammer[0], arstimer);
  const [lukket, veksle] = useSammenlagt(`gruppe-${gruppe.id}`);
  const innhold = useId();
  const valg = gruppe.arsrammer[0]?.valg;
  const valgtFag = gruppe.arsrammer[0]?.fag;
  const fagnavn = valgtFag ? `${valgtFag.kode} ${valgtFag.navn[malform]}` : valg && valg !== 'manuell' ? radTekst(indeks, valg)?.navn : undefined;
  return (
    <fieldset class={`fagkort${lukket ? ' lukket' : ''}`} data-gruppe={nr}>
      <legend class="fagkort-tittel">
        <Sammenleggknapp lukket={lukket} onVeksle={veksle} kontroll={innhold} oppsummering={fagnavn}>
          <span>{t('arbeidstid.felles.gruppe', { nr })}</span>
          {delresultat && <span class="fagkort-resultat tall"> · {t('arbeidstid.felles.delresultat', { verdi: delresultat })}</span>}
        </Sammenleggknapp>
      </legend>
      {kanFjernes && (
        <button type="button" class="ikonknapp fagkort-fjern" aria-label={t('arbeidstid.felles.fjernGruppe', { nr })} onClick={onFjern}>
          <Ikon navn="lukk" class="ikon-liten" />
        </button>
      )}
      <Oppsummering lukket={lukket} onVeksle={veksle}>
        {fagnavn}
      </Oppsummering>
      <div id={innhold} hidden={lukket}>
        <Fagfelt
          plasser={gruppe.arsrammer}
          faaElever={gruppe.faaElever}
          indeks={indeks}
          rader={rader}
          onPlasser={(endre) =>
            onEndring((gammel) => {
              const arsrammer = endre(gammel.arsrammer);
              return { ...gammel, arsrammer, ...autoArstimer(gammel, arsrammer, arstimer) };
            })
          }
          onFaaElever={(faaElever) => sett({ faaElever })}
        />
        <div class="inndatarad">
          <Bryter
            legend={t('arbeidstid.felles.undervisning')}
            skjultLegend
            kompakt
            verdi={gruppe.modus}
            valg={[
              { verdi: 'arstimer', tekst: periode ? t('arbeidstid.felles.modusTimerPeriode') : t('arbeidstid.felles.modusArstimer') },
              { verdi: 'okter', tekst: t('arbeidstid.felles.modusOkter') },
            ]}
            onEndring={(modus) => sett({ modus })}
          />
          {gruppe.modus === 'arstimer' ? (
            <Tallfelt
              key="timer"
              class="felt-kompakt"
              skjultEtikett
              etikett={periode ? t('arbeidstid.felles.timerIPerioden') : t('arbeidstid.felles.arstimer')}
              verdi={gruppe.arstimer}
              min={0}
              maks={2000}
              onEndring={(v) => sett({ arstimer: v, arstimerAuto: false })}
            />
          ) : (
            <Tallfelt
              key="okter"
              class="felt-kompakt"
              skjultEtikett
              etikett={t('arbeidstid.felles.okter')}
              verdi={gruppe.okter}
              min={0}
              maks={50}
              onEndring={(v) => sett({ okter: v })}
            />
          )}
        </div>
        {gruppe.modus === 'arstimer' && gruppe.arstimerAuto && kjent && (
          <p class="felt-hjelp">{t('arbeidstid.felles.arstimerFraGrep', { fagkoder: kjent.fagkoder.join(', ') })}</p>
        )}
        {!periode && gruppe.modus === 'arstimer' && !gruppe.arstimerAuto && kjent && gruppe.arstimer !== null && gruppe.arstimer !== kjent.arstimer && (
          <p class="felt-hjelp overstyrt" data-overstyrt="arstimer">
            {t('arbeidstid.felles.arstimerOverstyrt', { timer: formaterTall(kjent.arstimer), fagkode: kjent.fagkoder.join(', ') })}{' '}
            <button type="button" class="lenkeknapp liten" onClick={() => sett({ arstimer: kjent.arstimer, arstimerAuto: true })}>
              {t('arbeidstid.felles.brukArstimer', { timer: formaterTall(kjent.arstimer) })}
            </button>
          </p>
        )}
        {gruppe.modus === 'okter' && (
          <>
            <Minuttvelger minutter={gruppe.minutter} fritt={gruppe.minutterFritt} onEndring={(minutter, minutterFritt) => sett({ minutter, minutterFritt })} />
            {periode || gruppe.endreUker ? (
              <Tallfelt
                key="uker"
                class="felt-kompakt"
                etikett={periode ? t('arbeidstid.felles.ukerPeriode') : t('arbeidstid.felles.uker')}
                {...(periode && standardUker > 0 ? { plassholder: formaterTall(standardUker, 1) } : {})}
                {...(periode && ukerHjelp ? { hjelpetekst: ukerHjelp } : {})}
                verdi={gruppe.uker}
                min={0}
                maks={60}
                onEndring={(v) => sett({ uker: v })}
              />
            ) : (
              <p class="felt-hjelp">
                {t('arbeidstid.felles.ukerStandard', { uker: formaterTall(standardUker) })}{' '}
                <button type="button" class="lenkeknapp liten" onClick={() => sett({ endreUker: true, uker: standardUker })}>
                  {t('arbeidstid.felles.endreUker')}
                </button>{' '}
                {t('arbeidstid.felles.ukerHalvaar')}
              </p>
            )}
          </>
        )}
      </div>
    </fieldset>
  );
}

/** Kort for hvert fag, med knapp for å legge til flere. */
export function Grupper({
  grupper,
  rader,
  indeks,
  periode,
  standardUker,
  ukerHjelp,
  delresultater,
  arstimer,
  onEndring,
}: {
  grupper: Gruppetilstand[];
  rader: readonly Arsrammerad[];
  indeks: Fagindeks;
  periode: boolean;
  standardUker: number;
  /** Hjelpetekst for antall uker i en periode (ukene regnes ut fra dagene når feltet er tomt). */
  ukerHjelp?: string;
  /** Beskjeftigelse per gruppe (prosent), vises på kortet når det finnes flere. */
  delresultater?: (number | null)[];
  /** Kjente årstimer per rad i vedlegg 1. Fylles inn når brukeren velger fag. */
  arstimer?: ReadonlyMap<number, Arstimerad>;
  onEndring: Oppdater<Gruppetilstand[]>;
}) {
  const { t } = useTekst();
  return (
    <section aria-label={t('arbeidstid.felles.grupper')} class="fagkortliste">
      {grupper.map((g, i) => {
        const del = delresultater?.[i];
        return (
          <Gruppekort
            key={g.id}
            gruppe={g}
            nr={i + 1}
            rader={rader}
            indeks={indeks}
            periode={periode}
            standardUker={standardUker}
            {...(ukerHjelp ? { ukerHjelp } : {})}
            delresultat={grupper.length > 1 && del != null ? formaterTall(del) : null}
            kanFjernes={grupper.length > 1}
            {...(arstimer ? { arstimer } : {})}
            onEndring={(endre) => onEndring((gamle) => gamle.map((x) => (x.id === g.id ? endre(x) : x)))}
            onFjern={() => onEndring((gamle) => gamle.filter((x) => x.id !== g.id))}
          />
        );
      })}
      <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => onEndring((gamle) => [...gamle, nyGruppe()])}>
        <Ikon navn="pluss" class="ikon-liten" />
        {t('arbeidstid.felles.leggTilGruppe')}
      </button>
    </section>
  );
}
