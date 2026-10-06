// Veiviser (avgjørelse 041): fasestolpe, veien så langt og det gjeldende steget med ansvar, dokumentasjon, frist,
// paragrafer, forklaring, spørsmål og kilder. Tilstanden står i adressen (`steg` og `svar`), og hvert svar er en ny
// oppføring i historikken, så «tilbake» går ett steg tilbake og et steg kan deles som lenke.
// Gangen gjennom veiviseren står i src/core/veiviser/veiviser.ts.
import type { ComponentChildren, Ref } from 'preact';
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';
import { beholdRullingVedNesteNavigasjon, lenke } from '../app/ruter.ts';
import { type T, usePrivatskole, useTekst } from '../app/tilstand.ts';
import { fylkesnavn } from '../app/Stedmerknad.tsx';
import { app } from '../config/app.ts';
import type { Malform } from '../core/i18n/tekst.ts';
import { formaterDato } from '../core/i18n/tekst.ts';
import type { Stegelement, Veiviserelement } from '../core/innhold/skjema.ts';
import { erUtfall, fasestatus, finnSide, finnVei, korstesteVei, lagKart, lesSvar, stegIRekkefolge, tilbakeTil, tilstand, videre, type Vei, type Veiviserkart } from '../core/veiviser/veiviser.ts';
import { HosFylket } from './HosFylket.tsx';
import { useHusketApen } from './husket.ts';
import { Forklaring } from './Forklaring.tsx';
import { Ikon, type Ikonnavn } from './Ikon.tsx';
import { Kortfot, KortfotRader } from './Kortfot.tsx';
import { Laereplanboks } from './Laereplanboks.tsx';
import { medPrivatskolekilder, Privatskolemerknad } from './Privatskolemerknad.tsx';
import { delParagrafRef } from './Paragraflenker.tsx';

interface Props {
  veiviser: Veiviserelement;
  /**
   * Stegene i veiviseren, allerede valgt for brukerens fylke og skole. Et lokalt steg som supplerer et nasjonalt steg
   * med samme id, vises som en egen boks i det nasjonale steget og er ikke et steg på veien.
   */
  steg: readonly Stegelement[];
  /** Ruten til siden veiviseren står på, f.eks. «/tilrettelegging/individuell-tilrettelegging». */
  sti: string;
  sporring: URLSearchParams;
}

/** Lokalt steg som supplerer det nasjonale steget med samme id (fylkes- eller skoleinnhold). */
export const erTillegg = (s: Stegelement) => s.gyldighet.niva !== 'nasjonal' && s.gyldighet.forhold === 'supplerer';

const svartekst = (s: Stegelement, svarId: string | undefined, malform: Malform) =>
  s.sporsmal?.svar.find((a) => a.id === svarId)?.tekst[malform];

/** Fra HTML til ren tekst, til kopien av oppsummeringen. */
function rentekst(html: string): string {
  return html
    .replace(/<\/p>\s*<p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Den første setningen i teksten, som smakebit når steget er lukket. Punktum etter tall («1. februar») og
 * forkortelser («f.eks.») avslutter ikke en setning. Lange setninger kortes med «…».
 */
export function forsteSetning(html: string, maks = 160): string {
  const tekst = rentekst(html.replace(/<\/?(p|li|ul|ol|br)\b[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  const slutt = /(?<!\d)(?<!\bf\.eks)(?<!\bbl\.a)[.!?:](?=\s+[A-ZÆØÅ«-]|$)/.exec(tekst);
  const setning = slutt ? tekst.slice(0, slutt.index + 1) : tekst;
  return setning.length > maks ? `${setning.slice(0, maks - 1).replace(/\s+\S*$/, '')} …` : setning;
}

type Svar = NonNullable<Stegelement['sporsmal']>['svar'][number];

/** Svarene gruppert etter `gruppe`: svar etter hverandre med samme gruppe står under samme overskrift. */
export function svargrupper(svar: readonly Svar[], malform: Malform): { tittel: string | null; svar: Svar[] }[] {
  const grupper: { tittel: string | null; svar: Svar[] }[] = [];
  for (const a of svar) {
    const tittel = a.gruppe?.[malform] ?? null;
    const siste = grupper.at(-1);
    if (siste && siste.tittel === tittel) siste.svar.push(a);
    else grupper.push({ tittel, svar: [a] });
  }
  return grupper;
}

/** Stor skjerm, der prosessen står i egen kolonne. Der står alle steg åpne (eier 03.10.2026). */
const storSkjerm = () => typeof matchMedia === 'function' && matchMedia('(min-width: 64rem)').matches;

/** Oppsummeringen som ren tekst: stegene, svarene, ansvar, dokumentasjon, frister og paragrafer, og lenken. */
export function lagOppsummering(
  t: T,
  malform: Malform,
  veiviser: Veiviserelement,
  stegPaaVeien: { steg: Stegelement; svar?: string | undefined }[],
  adresse: string,
  dato: string,
  tillegg: readonly Stegelement[] = [],
): string {
  const linjer = [t('komponenter.veiviser.kopiOverskrift', { tittel: veiviser.tittel[malform] }), ''];
  stegPaaVeien.forEach(({ steg, svar }, i) => {
    linjer.push(`${i + 1}. ${steg.tittel[malform]}`);
    const valgt = svartekst(steg, svar, malform);
    if (valgt) linjer.push(`   ${t('komponenter.veiviser.dittSvar', { svar: valgt })}`);
    if (steg.ansvar) linjer.push(`   ${t('komponenter.veiviser.ansvar')}: ${steg.ansvar[malform]}`);
    if (steg.dokumentasjon) linjer.push(`   ${t('komponenter.veiviser.dokumentasjon')}: ${steg.dokumentasjon[malform]}`);
    if (steg.frist) linjer.push(`   ${t('komponenter.veiviser.frist')}: ${steg.frist[malform]}`);
    if (steg.paragrafer.length > 0) {
      linjer.push(`   ${t('komponenter.veiviser.regelverk')}: ${steg.paragrafer.map((r) => `${delParagrafRef(r).dokument} § ${delParagrafRef(r).nr}`).join(', ')}`);
    }
    for (const l of tillegg.filter((x) => x.id === steg.id)) {
      const sted = l.gyldighet.niva === 'nasjonal' ? '' : (fylkesnavn(l.gyldighet.fylke) ?? '');
      linjer.push(`   ${t('komponenter.veiviser.lokalt', { sted })}: ${l.tittel[malform]}`);
      if (l.frist) linjer.push(`   ${t('komponenter.veiviser.frist')}: ${l.frist[malform]}`);
    }
  });
  const sisteSteg = stegPaaVeien.at(-1)?.steg;
  if (sisteSteg) linjer.push('', rentekst(sisteSteg.tekst[malform]));
  linjer.push('', adresse, t('komponenter.veiviser.kopiLaget', { app: app.navn, dato }));
  return linjer.join('\n');
}

function Fasestolpe({ veiviser, gjeldende }: { veiviser: Veiviserelement; gjeldende: Stegelement | undefined }) {
  const { t, malform } = useTekst();
  if (veiviser.faser.length === 0) return null;
  const status = fasestatus(
    veiviser.faser.map((f) => f.id),
    gjeldende?.fase,
  );
  const statustekst = { ferdig: t('komponenter.veiviser.faseFerdig'), gjeldende: t('komponenter.veiviser.faseGjeldende'), senere: t('komponenter.veiviser.faseSenere') };
  const naa = veiviser.faser.findIndex((f) => f.id === gjeldende?.fase);
  return (
    <>
      <ol class="veiviser-faser" aria-label={t('komponenter.veiviser.faser')}>
        {veiviser.faser.map((f, i) => {
          const s = status[i] ?? 'senere';
          return (
            <li key={f.id} class={`veiviser-fase veiviser-fase-${s}`} aria-current={s === 'gjeldende' ? 'step' : undefined}>
              <span class="veiviser-fase-strek" aria-hidden="true" />
              <span class="veiviser-fase-navn">
                {s === 'ferdig' && <Ikon navn="ok" class="ikon-liten" />}
                {f.tittel[malform]}
              </span>
              <span class="skjult-visuelt"> ({statustekst[s]})</span>
            </li>
          );
        })}
      </ol>
      {/* På svært smal skjerm er det ikke plass til navnene under stolpen. Da står fasen her i stedet. */}
      {naa >= 0 && (
        <p class="veiviser-fase-tekst" aria-hidden="true">
          {t('komponenter.veiviser.faseAv', { nr: String(naa + 1), antall: String(veiviser.faser.length), fase: veiviser.faser[naa]?.tittel[malform] ?? '' })}
        </p>
      )}
    </>
  );
}

function Fakta({ ikon, etikett, tekst }: { ikon: Ikonnavn; etikett: string; tekst: string }) {
  return (
    <div class="veiviser-fakta-rad">
      <dt>
        <Ikon navn={ikon} class="ikon-liten" />
        {etikett}
      </dt>
      <dd>{tekst}</dd>
    </div>
  );
}

type Kopistatus = { status: 'klar' | 'kopiert' | 'feilet'; tekst: string };

/** Resultatet: kopier oppsummeringen av veien, eller start på nytt. Veien står allerede over, så den gjentas ikke. */
function Oppsummering({ tekst, startPaaNytt }: { tekst: () => string; startPaaNytt: string }) {
  const { t } = useTekst();
  const [kopi, settKopi] = useState<Kopistatus>({ status: 'klar', tekst: '' });
  const kopier = async () => {
    const innhold = tekst();
    try {
      await navigator.clipboard.writeText(innhold);
      settKopi({ status: 'kopiert', tekst: innhold });
    } catch {
      settKopi({ status: 'feilet', tekst: innhold });
    }
  };
  return (
    <div class="veiviser-oppsummering">
      <div class="knapperad">
        <button type="button" class="knapp knapp-sekundaer" onClick={() => void kopier()}>
          <Ikon navn="kopier" class="ikon-liten" />
          {t('komponenter.veiviser.kopier')}
        </button>
        <a class="knapp knapp-sekundaer" href={startPaaNytt}>
          {t('komponenter.veiviser.startPaaNytt')}
        </a>
      </div>
      <p role="status" class="liten">
        {kopi.status === 'kopiert' ? t('komponenter.veiviser.kopiert') : ''}
      </p>
      {kopi.status === 'feilet' && (
        <>
          <p class="felt-hjelp">{t('komponenter.veiviser.kopierFeilet')}</p>
          <textarea readOnly rows={8} aria-label={t('komponenter.veiviser.oppsummering')} value={kopi.tekst} />
        </>
      )}
    </div>
  );
}

/** Fylkes- eller skoleinnhold som supplerer steget, i en egen boks merket med stedet. */
function Tillegg({ steg }: { steg: Stegelement }) {
  const { t, malform } = useTekst();
  const sted = steg.gyldighet.niva === 'nasjonal' ? '' : (fylkesnavn(steg.gyldighet.fylke) ?? steg.gyldighet.fylke);
  // Lukket til brukeren åpner den, så siden ikke blir lang. Stedet og tittelen står alltid synlig. Om den er åpen,
  // huskes for siden (husket.ts).
  const [apen, settApen] = useHusketApen(`tillegg:${steg.id}`);
  return (
    <details class="veiviser-tillegg" open={apen} onToggle={(e) => settApen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary class="veiviser-tillegg-topp">
        <span class="veiviser-tillegg-sted">
          <Ikon navn="skole" class="ikon-liten" />
          {t('komponenter.veiviser.lokalt', { sted })}
        </span>
        <span class="veiviser-tillegg-tittel">{steg.tittel[malform]}</span>
        <Ikon navn="ned" class="forklaring-pil" />
      </summary>
      <div class="veiviser-tillegg-innhold">
        <div class="brodtekst" dangerouslySetInnerHTML={{ __html: steg.tekst[malform] }} />
        {(steg.ansvar || steg.dokumentasjon || steg.frist) && (
          <dl class="veiviser-fakta">
            {steg.ansvar && <Fakta ikon="person" etikett={t('komponenter.veiviser.ansvar')} tekst={steg.ansvar[malform]} />}
            {steg.dokumentasjon && <Fakta ikon="dokument" etikett={t('komponenter.veiviser.dokumentasjon')} tekst={steg.dokumentasjon[malform]} />}
            {steg.frist && <Fakta ikon="klokke" etikett={t('komponenter.veiviser.frist')} tekst={steg.frist[malform]} />}
          </dl>
        )}
        <Kortfot paragrafer={steg.paragrafer} kilder={[]} />
      </div>
    </details>
  );
}

/** Fasene med stegene på veien under hver fase, til venstre på stor skjerm. */
function Prosessoversikt({
  veiviser,
  punkter,
}: {
  veiviser: Veiviserelement;
  punkter: { steg: Stegelement; svar?: string | undefined; href?: string | undefined; gjeldende: boolean }[];
}) {
  const { t, malform } = useTekst();
  const gjeldende = punkter.filter((p) => p.gjeldende).at(-1)?.steg;
  const status = fasestatus(
    veiviser.faser.map((f) => f.id),
    gjeldende?.fase,
  );
  const statustekst = { ferdig: t('komponenter.veiviser.faseFerdig'), gjeldende: t('komponenter.veiviser.faseGjeldende'), senere: t('komponenter.veiviser.faseSenere') };
  const grupper = veiviser.faser.length > 0 ? veiviser.faser.map((f) => ({ id: f.id, navn: f.tittel[malform] })) : [{ id: '', navn: '' }];
  return (
    <nav class="veiviser-prosess" aria-label={t('komponenter.veiviser.prosessen')}>
      <ol class="veiviser-prosess-faser">
        {grupper.map((g, i) => {
          const s = veiviser.faser.length > 0 ? (status[i] ?? 'senere') : 'gjeldende';
          const egne = punkter.filter((p) => veiviser.faser.length === 0 || p.steg.fase === g.id);
          return (
            <li key={g.id} class={`veiviser-prosess-fase veiviser-prosess-${s}`}>
              {g.navn && (
                <p class="veiviser-prosess-fasenavn">
                  <span class="veiviser-prosess-merke" aria-hidden="true">
                    {s === 'ferdig' ? <Ikon navn="ok" class="ikon-liten" /> : null}
                  </span>
                  {g.navn}
                  <span class="skjult-visuelt"> ({statustekst[s]})</span>
                </p>
              )}
              {egne.length > 0 && (
                <ol class="veiviser-prosess-steg">
                  {egne.map((p, j) => {
                    const svar = svartekst(p.steg, p.svar, malform);
                    return (
                      <li key={j} class={p.gjeldende ? 'veiviser-prosess-naa' : undefined} aria-current={p.gjeldende ? 'step' : undefined}>
                        {p.gjeldende || !p.href ? <span>{p.steg.tittel[malform]}</span> : <a href={p.href}>{p.steg.tittel[malform]}</a>}
                        {svar && <span class="veiviser-svar-valgt">{svar}</span>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Kartet over hele prosessen: stegene i hver fase, med fristene som merker. Stegene på veien er krysset av, og
 * steget brukeren står på, er markert. Hvert steg er en lenke dit, med den korteste veien fra starten.
 */
function Prosesskart({
  veiviser,
  kart,
  besokt,
  gjeldende,
  sti,
  aapen,
}: {
  veiviser: Veiviserelement;
  kart: Veiviserkart<Stegelement>;
  besokt: ReadonlySet<string>;
  /** Stegene på siden brukeren står på. */
  gjeldende: ReadonlySet<string>;
  sti: string;
  /** Åpent fra start, f.eks. på første steg, så brukeren ser hele prosessen med en gang. */
  aapen: boolean;
}) {
  const { t, malform } = useTekst();
  if (veiviser.faser.length === 0) return null;
  // Stegene i den rekkefølgen de nås. Utfallene (der veien kan ende) står for seg sist i hver fase.
  const iFase = stegIRekkefolge(kart).flatMap((id) => {
    const s = kart.steg.get(id);
    return s?.fase ? [s] : [];
  });
  const rekkefolge = [...iFase.filter((s) => !erUtfall(s)), ...iFase.filter((s) => erUtfall(s))];
  const punkt = (s: Stegelement) => {
    const vei = korstesteVei(kart, s.id);
    const naa = gjeldende.has(s.id);
    const klasse = ['prosesskart-punkt', besokt.has(s.id) ? 'prosesskart-besokt' : '', naa ? 'prosesskart-naa' : ''].filter(Boolean).join(' ');
    return (
      <li key={s.id} class={klasse}>
        <a href={vei ? lenke(sti, tilstand(kart, vei.steg, vei.svar)) : undefined} aria-current={naa ? 'step' : undefined}>
          {erUtfall(s) ? <Ikon navn="flagg" class="ikon-liten" /> : besokt.has(s.id) && !naa && <Ikon navn="ok" class="ikon-liten" />}
          <span>{s.tittel[malform]}</span>
        </a>
        {s.fristKort && (
          <span class="prosesskart-frist">
            <Ikon navn="klokke" class="ikon-liten" />
            {s.fristKort[malform]}
          </span>
        )}
      </li>
    );
  };
  return (
    <div class="veiviser-kart">
      <Forklaring tittel={t('komponenter.veiviser.heleProsessen')} aapen={aapen}>
        <p class="liten dempet">{t('komponenter.veiviser.kartHjelp')}</p>
        <ol class="prosesskart">
          {veiviser.faser.map((f, i) => {
            const egne = rekkefolge.filter((s) => s.fase === f.id);
            if (egne.length === 0) return null;
            return (
              <li key={f.id} class="prosesskart-fase">
                <h3 class="prosesskart-fasenavn">
                  <span class="prosesskart-nr" aria-hidden="true">
                    {i + 1}
                  </span>
                  {f.tittel[malform]}
                </h3>
                <ul class="prosesskart-steg">
                  {egne.filter((s) => !erUtfall(s)).map((s) => punkt(s))}
                </ul>
                {egne.some((s) => erUtfall(s)) && (
                  <>
                    <p class="prosesskart-ende">{t('komponenter.veiviser.kanEnde')}</p>
                    <ul class="prosesskart-steg prosesskart-utfall-liste">{egne.filter((s) => erUtfall(s)).map((s) => punkt(s))}</ul>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </Forklaring>
    </div>
  );
}

/** Så mange av de siste valgene står synlige i «Veien hit» før resten legges bak en knapp. */
const VISTE_VALG = 2;

const redusertBevegelse = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Ett steg på siden: overskrift, tekst, felt for ansvar, dokumentasjon og frist, paragrafer, lokale tillegg og kilder. */
function Stegdel({
  node,
  etikett,
  tillegg,
  overskriftId,
  overskrift,
  lukkbar = false,
}: {
  node: Stegelement;
  etikett: ComponentChildren;
  tillegg: readonly Stegelement[];
  overskriftId?: string | undefined;
  overskrift?: Ref<HTMLHeadingElement> | undefined;
  /** Steg uten valg over spørsmålet: lukket på mobil, med en smakebit og fristen synlig (eier 03.10.2026). */
  lukkbar?: boolean;
}) {
  const { t, malform } = useTekst();
  const egenId = useId();
  const innholdId = useId();
  const [aapen, settAapen] = useState(() => !lukkbar || storSkjerm());
  const egne = tillegg.filter((s) => s.id === node.id);
  const privat = usePrivatskole();
  const kilder = [...medPrivatskolekilder(node.kilder, node, privat), ...egne.flatMap((s) => s.kilder)];
  const sted = egne[0] && egne[0].gyldighet.niva !== 'nasjonal' ? (fylkesnavn(egne[0].gyldighet.fylke) ?? '') : '';
  const veksle = lukkbar && (
    <button type="button" class="forklaring-knapp veiviser-veksle" aria-expanded={aapen} aria-controls={innholdId} onClick={() => settAapen(!aapen)}>
      <Ikon navn={aapen ? 'opp' : 'ned'} />
      <span>{aapen ? t('komponenter.veiviser.visMindre') : t('komponenter.veiviser.lesHele')}</span>
    </button>
  );
  return (
    <article
      class={`veiviser-steg${erUtfall(node) ? ' veiviser-steg-utfall' : ''}${aapen ? '' : ' veiviser-steg-lukket'}`}
      aria-labelledby={overskriftId ?? egenId}
    >
      <p class="veiviser-stegnr">{etikett}</p>
      <h2 id={overskriftId ?? egenId} ref={overskrift} tabIndex={-1} class="veiviser-stegtittel">
        {node.tittel[malform]}
      </h2>
      {!aapen && (
        <>
          <p class="veiviser-smakebit">{forsteSetning(node.tekst[malform])}</p>
          {(node.frist || node.ansvar) && (
            <ul class="veiviser-kortfakta">
              {node.frist && (
                <li>
                  <Ikon navn="klokke" class="ikon-liten" />
                  {t('komponenter.veiviser.frist')}: {node.fristKort?.[malform] ?? node.frist[malform]}
                </li>
              )}
              {node.ansvar && (
                <li>
                  <Ikon navn="person" class="ikon-liten" />
                  {t('komponenter.veiviser.ansvar')}: {node.ansvar[malform]}
                </li>
              )}
            </ul>
          )}
          {sted && (
            <p class="veiviser-kortfakta-lokalt">
              <Ikon navn="skole" class="ikon-liten" />
              {t('komponenter.veiviser.harLokalt', { sted })}
            </p>
          )}
          {privat && node.privatskole && (
            <p class="veiviser-kortfakta-lokalt">
              <Ikon navn="skole" class="ikon-liten" />
              {t('komponenter.privatskole.harMerknad')}
            </p>
          )}
          <div class="veiviser-mer">{veksle}</div>
        </>
      )}
      <div id={innholdId} hidden={!aapen}>
        <div class="brodtekst" dangerouslySetInnerHTML={{ __html: node.tekst[malform] }} />
        {node.fylke && <HosFylket tema={node.fylke.tema} tekst={node.fylke.tekst} />}
        <Privatskolemerknad element={node} />
        {(node.ansvar || node.dokumentasjon || node.frist) && (
          <dl class="veiviser-fakta">
            {node.ansvar && <Fakta ikon="person" etikett={t('komponenter.veiviser.ansvar')} tekst={node.ansvar[malform]} />}
            {node.dokumentasjon && <Fakta ikon="dokument" etikett={t('komponenter.veiviser.dokumentasjon')} tekst={node.dokumentasjon[malform]} />}
            {node.frist && <Fakta ikon="klokke" etikett={t('komponenter.veiviser.frist')} tekst={node.frist[malform]} />}
          </dl>
        )}
        <Laereplanboks laereplaner={node.laereplaner} />
        {egne.map((s) => (
          <Tillegg key={`${s.gyldighet.niva}-${s.id}`} steg={s} />
        ))}
        <div class="veiviser-mer">
          {/* Paragrafene med titler og kildene, lukket til brukeren åpner dem (eier 03.10.2026). */}
          <KortfotRader paragrafer={node.paragrafer} kilder={kilder}>
            {node.forklaring && (
              <Forklaring tittel={t('komponenter.veiviser.merOm')}>
                <div class="brodtekst" dangerouslySetInnerHTML={{ __html: node.forklaring[malform] }} />
              </Forklaring>
            )}
          </KortfotRader>
          {aapen && veksle}
        </div>
      </div>
    </article>
  );
}

export function Veiviser({ veiviser, steg, sti, sporring }: Props) {
  const { t, malform } = useTekst();
  const kart = useMemo(
    () =>
      lagKart(
        veiviser.start,
        steg.filter((s) => !erTillegg(s)),
      ),
    [veiviser.start, steg],
  );
  const tillegg = useMemo(() => steg.filter(erTillegg), [steg]);
  const vei: Vei = finnVei(kart, lesSvar(sporring.get('svar')), sporring.get('steg'));
  // Steg uten valg står på samme side som spørsmålet eller utfallet etter dem (eier 03.10.2026).
  const side = finnSide(kart, vei);
  const slutt = side.slutt;
  const node = kart.steg.get(slutt.gjeldende);
  const overskrift = useRef<HTMLHeadingElement>(null);
  const kort = useRef<HTMLElement>(null);
  const forrige = useRef<{ nokkel: string; lengde: number } | null>(null);
  const tilstandNokkel = `${side.steg[0] ?? ''}|${slutt.svar.join('.')}`;
  const overskriftId = useId();
  const sporsmalId = useId();
  const veiId = useId();
  const [helVei, settHelVei] = useState(false);
  const sporsmalRef = useRef<HTMLHeadingElement>(null);
  // Til spørsmålet, eller til steget der veien ender, med fokus på overskriften.
  const tilSlutten = () => {
    const maal = sporsmalRef.current ?? kort.current?.querySelector<HTMLElement>('.veiviser-steg:last-child .veiviser-stegtittel') ?? null;
    maal?.scrollIntoView({ block: 'start', behavior: redusertBevegelse() ? 'auto' : 'smooth' });
    maal?.focus({ preventScroll: true });
  };

  // Ny side: fokus på den første overskriften på siden, så skjermlesere leser den. Ikke ved første visning, der
  // siden selv får fokus. Går brukeren videre, rulles den nye siden fram der knappene sto. Går brukeren tilbake,
  // gjenoppretter historikken posisjonen.
  useEffect(() => {
    const f = forrige.current;
    if (f !== null && f.nokkel !== tilstandNokkel) {
      settHelVei(false);
      overskrift.current?.focus({ preventScroll: true });
      if (slutt.svar.length > f.lengde) {
        // Skallet ruller ikke til toppen (beholdRullingVedNesteNavigasjon), så kortet glir fram fra der knappene sto.
        requestAnimationFrame(() => kort.current?.scrollIntoView({ block: 'start', behavior: redusertBevegelse() ? 'auto' : 'smooth' }));
      }
    }
    forrige.current = { nokkel: tilstandNokkel, lengde: slutt.svar.length };
  }, [tilstandNokkel, slutt.svar.length]);

  if (!node) return null;
  const href = (tilstand: Record<string, string> | null) => (tilstand ? lenke(sti, tilstand) : undefined);
  const nr = slutt.svar.length + 1;
  const utfall = erUtfall(node);
  const sidesteg = side.steg.flatMap((id) => {
    const s = kart.steg.get(id);
    return s ? [s] : [];
  });
  const stegPaaVeien: { steg: Stegelement; svar?: string | undefined }[] = [
    ...slutt.bak.flatMap((p) => {
      const s = kart.steg.get(p.steg);
      return s ? [{ steg: s, svar: p.svar }] : [];
    }),
    { steg: node },
  ];
  const paaSiden = new Set(side.steg);
  const forSiden = side.forSiden.length;
  const punkter = stegPaaVeien.map((p, i) => ({
    ...p,
    gjeldende: i >= forSiden,
    href: i < forSiden ? href(tilbakeTil(kart, slutt, i)) : undefined,
  }));
  // Veien hit viser bare valgene. Stegene uten valg står på samme side som valget.
  const valg = punkter.filter((p) => !p.gjeldende && p.svar !== undefined);
  const fasenavn = (s: Stegelement) => veiviser.faser.find((f) => f.id === s.fase)?.tittel[malform];
  // Lang vei: bare de siste valgene står synlige, og resten vises med en knapp, så siden starter nær steget.
  const skjulte = helVei ? 0 : Math.max(0, valg.length - VISTE_VALG);

  return (
    <div class={`veiviser${veiviser.faser.length > 0 ? ' veiviser-med-faser' : ''}`}>
      <div class="veiviser-sidekolonne">
        <Prosessoversikt veiviser={veiviser} punkter={punkter} />
      </div>
      <div class="veiviser-hoved">
        <Fasestolpe veiviser={veiviser} gjeldende={node} />
        {vei.korrigert && (
          <p class="merknad merknad-advarsel" role="status">
            {t('komponenter.veiviser.korrigert')}
          </p>
        )}
        {valg.length > 0 && (
          <nav aria-labelledby={veiId} class="veiviser-lop veiviser-vei-nav">
            <h2 id={veiId} class="skjult-visuelt">
              {t('komponenter.veiviser.veienHit')}
            </h2>
            {skjulte > 0 && (
              <button type="button" class="lenkeknapp veiviser-vei-vis" onClick={() => settHelVei(true)}>
                <Ikon navn="opp" class="ikon-liten" />
                {t('komponenter.veiviser.visHeleVeien', { antall: String(skjulte) })}
              </button>
            )}
            <ol class="veiviser-vei" start={skjulte + 1}>
              {valg.slice(skjulte).map((p, i) => {
                const svar = svartekst(p.steg, p.svar, malform);
                return (
                  <li key={i} class="veiviser-vei-punkt">
                    <a href={p.href} title={t('komponenter.veiviser.tilbakeTil', { steg: p.steg.tittel[malform] })}>
                      {p.steg.tittel[malform]}
                    </a>
                    {svar && <span class="veiviser-svar-valgt">{svar}</span>}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <div class="veiviser-lop">
          {/* På en side med flere steg kan brukeren gå rett til spørsmålet eller til der veien ender. */}
          {sidesteg.length > 1 && (
            <p class="veiviser-til-sporsmal">
              <button type="button" class="lenkeknapp" onClick={tilSlutten}>
                <Ikon navn="ned" class="ikon-liten" />
                {utfall ? t('komponenter.veiviser.tilSlutten') : t('komponenter.veiviser.tilSporsmalet')}
              </button>
            </p>
          )}
          {/* Stegene på siden, hvert i sin ramme. Steg uten valg står over steget med spørsmålet eller utfallet. */}
          <section ref={kort} class="veiviser-side" aria-labelledby={overskriftId}>
            {sidesteg.map((s, i) => {
              const fase = fasenavn(s);
              const slutten = erUtfall(s);
              const etikett = (
                <>
                  {slutten && <Ikon navn="flagg" class="ikon-liten" />}
                  {slutten ? t('komponenter.veiviser.utfall') : i === 0 ? t('komponenter.veiviser.steg', { nr: String(nr) }) : null}
                  {fase && (slutten || i === 0 ? <span class="veiviser-stegfase"> · {fase}</span> : <span class="veiviser-stegfase">{fase}</span>)}
                </>
              );
              return (
                <Stegdel
                  key={`${i}-${s.id}`}
                  node={s}
                  etikett={etikett}
                  tillegg={tillegg}
                  overskriftId={i === 0 ? overskriftId : undefined}
                  overskrift={i === 0 ? overskrift : undefined}
                  lukkbar={i < sidesteg.length - 1}
                />
              );
            })}
          </section>

          {/* Veien videre står under kortet, så knappene er det første brukeren ser etter å ha lest siden. */}
          <div class={`veiviser-videre${utfall ? ' veiviser-videre-slutt' : ''}`}>
            {node.sporsmal && (
              <div role="group" aria-labelledby={sporsmalId}>
                <h3 id={sporsmalId} ref={sporsmalRef} tabIndex={-1} class="veiviser-sporsmal-tekst">
                  {node.sporsmal.tekst[malform]}
                </h3>
                {svargrupper(node.sporsmal.svar, malform).map((g, i) => {
                  const liste = (
                    <ul class="veiviser-svarliste">
                      {g.svar.map((a) => (
                        <li key={a.id}>
                          <a class="veiviser-svarknapp" href={href(videre(kart, slutt, a.id))} onClick={beholdRullingVedNesteNavigasjon}>
                            <span>{a.tekst[malform]}</span>
                            <Ikon navn="hoyre" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  );
                  return g.tittel ? (
                    <div key={i} class="veiviser-svargruppe" role="group" aria-labelledby={`${sporsmalId}-${i}`}>
                      <h4 id={`${sporsmalId}-${i}`} class="veiviser-svargruppe-tittel">
                        {g.tittel}
                      </h4>
                      {liste}
                    </div>
                  ) : (
                    <div key={i}>{liste}</div>
                  );
                })}
              </div>
            )}
            {utfall && (
              <Oppsummering
                startPaaNytt={lenke(sti)}
                tekst={() => lagOppsummering(t, malform, veiviser, stegPaaVeien, location.href, formaterDato(new Date().toISOString(), malform), tillegg)}
              />
            )}
          </div>
          {/* Nøkkelen gir et nytt, lukket kart når brukeren går fra starten. */}
          <Prosesskart
            key={slutt.svar.length === 0 ? 'start' : 'videre'}
            veiviser={veiviser}
            kart={kart}
            besokt={new Set(slutt.bak.map((p) => p.steg).filter((id) => !paaSiden.has(id)))}
            gjeldende={paaSiden}
            sti={sti}
            aapen={slutt.svar.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
