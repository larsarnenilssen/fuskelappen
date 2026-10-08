// Visningen av lokale regler (fase 9, avgjørelse 093): kortene på sidene, statuslinjen og navnene på verdiene.
import { Ikon } from '../../components/Ikon.tsx';
import { Egenmerke, Lokalfot, lokalRegelAdresse } from '../../components/Lokalregel.tsx';
import { Nivamerke, Statusmerke } from '../../components/Merker.tsx';
import { formaterDato, formaterTall, type Tekstnokkel } from '../../core/i18n/tekst.ts';
import { egenstatus } from '../../core/lokale/regler.ts';
import { TEMA_FOR_REGELVERK, type EgenRegel, type PublisertRegel, type Tema } from '../../core/lokale/skjema.ts';
import { hentVerdi, regelsett } from '../../core/regler/index.ts';
import { iDag } from '../../data/skolear.ts';
import { useTekst } from '../tilstand.ts';

/**
 * Verdiene som kan ha en lokal verdi (`lokal: true` i rules/), per tema, i rekkefølgen i regelsettet. Nye verdier med
 * `lokal: true` kommer med av seg selv (forslag L7).
 */
export function lokaleVerdivalg(): Record<Tema, string[]> {
  const valg: Record<Tema, string[]> = { arbeidstid: [], skoleregler: [], fravaer: [], eksamen: [], inntak: [] };
  for (const r of regelsett) {
    if (r.gyldighet.niva !== 'nasjonal') continue;
    const tema = TEMA_FOR_REGELVERK[r.regelverk];
    if (!tema) continue;
    for (const [navn, v] of Object.entries(r.verdier)) {
      const nokkel = `${r.regelverk}.${navn}`;
      if (v.lokal === true && !valg[tema].includes(nokkel)) valg[tema].push(nokkel);
    }
  }
  return valg;
}

/** Den nasjonale verdien som gjelder i dag. */
export const nasjonalVerdi = (nokkel: string) => hentVerdi(nokkel, { dato: iDag() });

/** Tekstnøkkelen til navnet på en lokal verdi, f.eks. «lokaleRegler.verdier.planfestet_timer». */
export const verdinavn = (nokkel: string): Tekstnokkel => `lokaleRegler.verdier.${nokkel.split('.')[1] ?? ''}` as Tekstnokkel;

/** Verdier i årsrammetimer for funksjoner kan oppgis i prosent av en stilling (eier 08.10.2026). */
export const iProsent = (nokkel: string): boolean => (nasjonalVerdi(nokkel).enhet ?? '').startsWith('årsrammetimer');

/** Årsrammen for funksjoner (607,5), som prosenten regnes av. */
export const funksjonsramme = (): number => Number(nasjonalVerdi('sfs2213.arsramme_funksjon').verdi);

/** Verdien med enheten, f.eks. «1 150 timer», eller i prosent av en stilling for funksjoner. */
export function visVerdi(nokkel: string, verdi: number): string {
  if (iProsent(nokkel)) return `${formaterTall((verdi / funksjonsramme()) * 100)}\u00a0%`;
  const enhet = nasjonalVerdi(nokkel).enhet;
  return `${formaterTall(verdi)}${enhet ? ` ${enhet}` : ''}`;
}

/** Statuslinjen til en egen regel: når den ble lagt inn, og om den er meldt inn, godkjent eller har gått ut. */
export function Statuslinje({ regel, godkjente }: { regel: EgenRegel; godkjente: readonly PublisertRegel[] }) {
  const { t, malform } = useTekst();
  const dato = (d: string | undefined) => (d ? formaterDato(d, malform) : '');
  const s = egenstatus(regel, godkjente, iDag());
  const godkjent = godkjente.find((g) => g.kode === regel.kode);
  return (
    <span class="egenregel-status">
      {t('lokaleRegler.skjema.lagtInn', { dato: dato(regel.lagtInn) })}
      {' · '}
      {s === 'egen'
        ? t('lokaleRegler.status.egen')
        : s === 'innmeldt'
          ? t('lokaleRegler.status.innmeldt', { dato: dato(regel.innmeldt) })
          : s === 'utlopt'
            ? t('lokaleRegler.status.utlopt', { dato: dato(regel.gjelderTil) })
            : t('lokaleRegler.status.godkjent', { dato: dato(godkjent?.kontrollert?.dato) })}
    </span>
  );
}

/** Tekst med avsnitt, uten HTML. */
function Avsnitt({ tekst }: { tekst: string }) {
  return (
    <>
      {tekst
        .split(/\n\s*\n/)
        .map((a) => a.trim())
        .filter(Boolean)
        .map((a, i) => (
          <p key={i} class="egenregel-tekst">
            {a}
          </p>
        ))}
    </>
  );
}

function vertsnavn(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** En regel brukeren har lagt inn, som et kort på siden der den gjelder: stiplet kant og merket «Din egen». */
export function Egenregelkort({ regel, godkjente }: { regel: EgenRegel; godkjente: readonly PublisertRegel[] }) {
  const { t } = useTekst();
  return (
    <article class="egenregel">
      <div class="egenregel-topp">
        <Egenmerke />
      </div>
      <h3 class="egenregel-tittel">{regel.tittel}</h3>
      <Avsnitt tekst={regel.tekst ?? ''} />
      {regel.lenke && (
        <p class="egenregel-kilde">
          <a href={regel.lenke} rel="noopener noreferrer" target="_blank">
            {vertsnavn(regel.lenke)}
            <Ikon navn="ekstern" class="ikon-liten" />
          </a>
        </p>
      )}
      <p class="egenregel-fot">
        <Statuslinje regel={regel} godkjente={godkjente} />
        <a href={lokalRegelAdresse({ kode: regel.kode })}>
          <Ikon navn="blyant" class="ikon-liten" />
          {t('lokaleRegler.endre')}
        </a>
      </p>
    </article>
  );
}

/** En regel eier har godkjent: merket for skolen eller fylket, «Kontrollert», kilden og hvor den endres. */
export function Godkjentkort({ regel }: { regel: PublisertRegel }) {
  const { t, malform } = useTekst();
  const kilde = regel.kilde.offentlig ? regel.kilde.navn : t('lokaleRegler.side.ikkeOffentlig', { navn: regel.kilde.navn });
  return (
    <article class="godkjentregel">
      <div class="egenregel-topp">
        <Nivamerke niva={regel.niva} />
        <Statusmerke status="kontrollert" kontrollert={regel.kontrollert} />
      </div>
      <h3 class="egenregel-tittel">{regel.tittel?.[malform]}</h3>
      <Avsnitt tekst={regel.tekst?.[malform] ?? ''} />
      <p class="egenregel-kilde">
        {regel.kilde.url ? (
          <a href={regel.kilde.url} rel="noopener noreferrer" target="_blank">
            {t('lokaleRegler.side.kilde', { navn: kilde })}
            <Ikon navn="ekstern" class="ikon-liten" />
          </a>
        ) : (
          t('lokaleRegler.side.kilde', { navn: kilde })
        )}
      </p>
      <Lokalfot kode={regel.kode} stedsnavn={regel.stedsnavn} kontrollert={regel.kontrollert?.dato ?? null} />
    </article>
  );
}

/** En lokal verdi på siden for temaet: navnet, tallet, den nasjonale verdien og hvor den endres eller meldes inn. */
export function Verdikort({ regel, egen }: { regel: EgenRegel | PublisertRegel; egen: boolean }) {
  const { t } = useTekst();
  if (!regel.nokkel || regel.verdi === undefined) return null;
  const nasjonal = Number(nasjonalVerdi(regel.nokkel).verdi);
  const godkjent = egen ? null : (regel as PublisertRegel);
  return (
    <article class={egen ? 'egenregel' : 'godkjentregel'}>
      <div class="egenregel-topp">
        {godkjent ? (
          <>
            <Nivamerke niva={godkjent.niva} />
            <Statusmerke status="kontrollert" kontrollert={godkjent.kontrollert} />
          </>
        ) : (
          <Egenmerke verdi />
        )}
      </div>
      <h3 class="egenregel-tittel">{t(verdinavn(regel.nokkel))}</h3>
      <p class="egenverdi-tall tall">{visVerdi(regel.nokkel, regel.verdi)}</p>
      <p class="egenregel-status">{t('lokaleRegler.nasjonaltVar', { verdi: visVerdi(regel.nokkel, nasjonal) })}</p>
      {godkjent ? (
        <Lokalfot kode={godkjent.kode} stedsnavn={godkjent.stedsnavn} kontrollert={godkjent.kontrollert?.dato ?? null} />
      ) : (
        <p class="egenregel-fot">
          <Statuslinje regel={regel as EgenRegel} godkjente={[]} />
          <a href={lokalRegelAdresse({ kode: regel.kode })}>
            <Ikon navn="blyant" class="ikon-liten" />
            {t('lokaleRegler.endre')}
          </a>
        </p>
      )}
    </article>
  );
}
