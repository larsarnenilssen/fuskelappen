// Veiviser (avgjørelse 041): fasestolpe, veien så langt og det gjeldende steget med ansvar, dokumentasjon, frist,
// paragrafer, forklaring, spørsmål og kilder. Tilstanden står i adressen (`steg` og `svar`), og hvert svar er en ny
// oppføring i historikken, så «tilbake» går ett steg tilbake og et steg kan deles som lenke.
// Gangen gjennom veiviseren står i src/core/veiviser/veiviser.ts.
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';
import { beholdRullingVedNesteNavigasjon, lenke } from '../app/ruter.ts';
import { type T, useTekst } from '../app/tilstand.ts';
import { app } from '../config/app.ts';
import type { Malform } from '../core/i18n/tekst.ts';
import { formaterDato } from '../core/i18n/tekst.ts';
import type { Stegelement, Veiviserelement } from '../core/innhold/skjema.ts';
import { erUtfall, fasestatus, finnVei, lagKart, lesSvar, tilbakeTil, videre, type Vei } from '../core/veiviser/veiviser.ts';
import { Forklaring } from './Forklaring.tsx';
import { Ikon, type Ikonnavn } from './Ikon.tsx';
import { Kildeliste } from './Kildelenke.tsx';
import { delParagrafRef, Paragraflenker } from './Paragraflenker.tsx';

interface Props {
  veiviser: Veiviserelement;
  /** Stegene i veiviseren, allerede valgt for brukerens fylke og skole. */
  steg: readonly Stegelement[];
  /** Ruten til siden veiviseren står på, f.eks. «/tilrettelegging/individuell-tilrettelegging». */
  sti: string;
  sporring: URLSearchParams;
}

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

/** Oppsummeringen som ren tekst: stegene, svarene, ansvar, dokumentasjon, frister og paragrafer, og lenken. */
export function lagOppsummering(
  t: T,
  malform: Malform,
  veiviser: Veiviserelement,
  stegPaaVeien: { steg: Stegelement; svar?: string | undefined }[],
  adresse: string,
  dato: string,
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
  return (
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

/** Fasene med stegene på veien under hver fase, til venstre på stor skjerm. */
function Prosessoversikt({
  veiviser,
  punkter,
}: {
  veiviser: Veiviserelement;
  punkter: { steg: Stegelement; svar?: string | undefined; href?: string | undefined; gjeldende: boolean }[];
}) {
  const { t, malform } = useTekst();
  const gjeldende = punkter.find((p) => p.gjeldende)?.steg;
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

const redusertBevegelse = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Veiviser({ veiviser, steg, sti, sporring }: Props) {
  const { t, malform } = useTekst();
  const kart = useMemo(() => lagKart(veiviser.start, steg), [veiviser.start, steg]);
  const vei: Vei = finnVei(kart, lesSvar(sporring.get('svar')), sporring.get('steg'));
  const node = kart.steg.get(vei.gjeldende);
  const overskrift = useRef<HTMLHeadingElement>(null);
  const kort = useRef<HTMLElement>(null);
  const forrige = useRef<{ nokkel: string; lengde: number } | null>(null);
  const tilstandNokkel = `${vei.gjeldende}|${vei.svar.join('.')}`;
  const overskriftId = useId();
  const sporsmalId = useId();
  const veiId = useId();

  // Nytt steg: fokus på overskriften i steget, så skjermlesere leser det nye steget. Ikke ved første visning, der
  // siden selv får fokus. Går brukeren videre, rulles det nye kortet fram der knappene sto. Går brukeren tilbake,
  // gjenoppretter historikken posisjonen.
  useEffect(() => {
    const f = forrige.current;
    if (f !== null && f.nokkel !== tilstandNokkel) {
      overskrift.current?.focus({ preventScroll: true });
      if (vei.bak.length > f.lengde) {
        // Skallet ruller ikke til toppen (beholdRullingVedNesteNavigasjon), så kortet glir fram fra der knappene sto.
        requestAnimationFrame(() => kort.current?.scrollIntoView({ block: 'start', behavior: redusertBevegelse() ? 'auto' : 'smooth' }));
      }
    }
    forrige.current = { nokkel: tilstandNokkel, lengde: vei.bak.length };
  }, [tilstandNokkel, vei.bak.length]);

  if (!node) return null;
  const href = (tilstand: Record<string, string> | null) => (tilstand ? lenke(sti, tilstand) : undefined);
  const nr = vei.bak.length + 1;
  const utfall = erUtfall(node);
  const fase = veiviser.faser.find((f) => f.id === node.fase);
  const nesteSteg = node.neste ? kart.steg.get(node.neste) : undefined;
  const stegPaaVeien: { steg: Stegelement; svar?: string | undefined }[] = [
    ...vei.bak.flatMap((p) => {
      const s = kart.steg.get(p.steg);
      return s ? [{ steg: s, svar: p.svar }] : [];
    }),
    { steg: node },
  ];
  const punkter = stegPaaVeien.map((p, i) => ({
    ...p,
    gjeldende: i === stegPaaVeien.length - 1,
    href: i < vei.bak.length ? href(tilbakeTil(kart, vei, i)) : undefined,
  }));

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
        {vei.bak.length > 0 && (
          <nav aria-labelledby={veiId} class="veiviser-lop veiviser-vei-nav">
            <h2 id={veiId} class="skjult-visuelt">
              {t('komponenter.veiviser.veienHit')}
            </h2>
            <ol class="veiviser-vei">
              {punkter.slice(0, -1).map((p, i) => {
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
          <section ref={kort} class={`veiviser-steg${utfall ? ' veiviser-steg-utfall' : ''}`} aria-labelledby={overskriftId}>
            <p class="veiviser-stegnr">
              {utfall ? t('komponenter.veiviser.utfall') : t('komponenter.veiviser.steg', { nr: String(nr) })}
              {fase && <span class="veiviser-stegfase"> · {fase.tittel[malform]}</span>}
            </p>
            <h2 id={overskriftId} ref={overskrift} tabIndex={-1} class="veiviser-stegtittel">
              {node.tittel[malform]}
            </h2>
            <div class="brodtekst" dangerouslySetInnerHTML={{ __html: node.tekst[malform] }} />
            {(node.ansvar || node.dokumentasjon || node.frist) && (
              <dl class="veiviser-fakta">
                {node.ansvar && <Fakta ikon="person" etikett={t('komponenter.veiviser.ansvar')} tekst={node.ansvar[malform]} />}
                {node.dokumentasjon && <Fakta ikon="dokument" etikett={t('komponenter.veiviser.dokumentasjon')} tekst={node.dokumentasjon[malform]} />}
                {node.frist && <Fakta ikon="klokke" etikett={t('komponenter.veiviser.frist')} tekst={node.frist[malform]} />}
              </dl>
            )}
            <Paragraflenker paragrafer={node.paragrafer} overskrift={t('komponenter.veiviser.regelverk')} />
            <div class="veiviser-mer">
              {node.forklaring && (
                <Forklaring tittel={t('komponenter.veiviser.merOm')}>
                  <div class="brodtekst" dangerouslySetInnerHTML={{ __html: node.forklaring[malform] }} />
                </Forklaring>
              )}
              <details class="veiviser-kilder">
                {/* Samme utseende som knappen i Forklaring rett over. */}
                <summary class="forklaring-knapp">
                  <Ikon navn="bok" />
                  <span>{t('komponenter.veiviser.kilder', { antall: String(node.kilder.length) })}</span>
                  <Ikon navn="ned" class="forklaring-pil" />
                </summary>
                <Kildeliste kilder={node.kilder} niva={3} utenOverskrift />
              </details>
            </div>
          </section>

          {/* Veien videre står under kortet, så knappene er det første brukeren ser etter å ha lest steget. */}
          <div class={`veiviser-videre${utfall ? ' veiviser-videre-slutt' : ''}`}>
            {node.sporsmal && (
              <div role="group" aria-labelledby={sporsmalId}>
                <h3 id={sporsmalId} class="veiviser-sporsmal-tekst">
                  {node.sporsmal.tekst[malform]}
                </h3>
                <ul class="veiviser-svarliste">
                  {node.sporsmal.svar.map((a) => (
                    <li key={a.id}>
                      <a class="veiviser-svarknapp" href={href(videre(kart, vei, a.id))} onClick={beholdRullingVedNesteNavigasjon}>
                        <span>{a.tekst[malform]}</span>
                        <Ikon navn="hoyre" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {nesteSteg && (
              <a class="veiviser-svarknapp veiviser-neste" href={href(videre(kart, vei))} onClick={beholdRullingVedNesteNavigasjon}>
                <span>
                  <span class="veiviser-neste-etikett">{t('komponenter.veiviser.neste')}</span>
                  {nesteSteg.tittel[malform]}
                </span>
                <Ikon navn="hoyre" />
              </a>
            )}
            {utfall && (
              <Oppsummering
                startPaaNytt={lenke(sti)}
                tekst={() => lagOppsummering(t, malform, veiviser, stegPaaVeien, location.href, formaterDato(new Date().toISOString(), malform))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
