// Skjemaet der brukeren legger inn eller endrer en lokal regel (fase 9, avgjørelse 093). Brukeren velger først hva
// endringen gjelder (temaet), så hva som skal endres, hvor den gjelder, regelen og datoene (eier 08.10.2026).
// Adresser: ny regel, `?tema=` for en ny regel under et tema, `?kode=` for en egen regel og `?fra=` for å endre en
// godkjent regel for seg selv eller melde inn en endring.
import type { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Brodsmuler } from '../../components/Brodsmuler.tsx';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { kildeTekst } from '../../components/Kildelenke.tsx';
import { Egenmerke } from '../../components/Lokalregel.tsx';
import { Sidetopp } from '../../components/Sidetopp.tsx';
import { ToKolonner } from '../../components/ToKolonner.tsx';
import { iDag } from '../../data/skolear.ts';
import { formaterDato, formaterTall } from '../../core/i18n/tekst.ts';
import { innmelding, nyKode } from '../../core/lokale/innmelding.ts';
import { egenstatus } from '../../core/lokale/regler.ts';
import { TEMA, type EgenRegel, type PublisertRegel, type Tema } from '../../core/lokale/skjema.ts';
import type { SideProps } from '../../modules/typer.ts';
import { aapneEpost, epostlenke } from '../tilbakemelding.ts';
import { erstattAdresse, naviger } from '../ruter.ts';
import { fylkesnavn } from '../Stedmerknad.tsx';
import { lagreEgenRegel, slettEgenRegel, type T, useTekst, useTilstand } from '../tilstand.ts';
import { useLokale } from '../lokaleregler/bruk.ts';
import { Egenregelkort, funksjonsramme, iProsent, lokaleVerdivalg, nasjonalVerdi, verdinavn, visVerdi } from '../lokaleregler/visning.tsx';

/** Det som kan endres under temaet: verdiene med `lokal: true` og en regel på siden for temaet («tekst»). */
function valgFor(tema: Tema): string[] {
  return [...lokaleVerdivalg()[tema], 'tekst'];
}

/** Det første som kan endres under temaet, som regel eller verdi. */
function forsteValg(tema: Tema): Pick<EgenRegel, 'type' | 'nokkel'> {
  const forste = valgFor(tema)[0] ?? 'tekst';
  return forste === 'tekst' ? { type: 'regel', nokkel: undefined } : { type: 'verdi', nokkel: forste };
}

/** En egen kopi av en godkjent regel, som endrer den for brukeren. */
function kopiAv(g: PublisertRegel, malform: 'nb' | 'nn'): EgenRegel {
  return {
    kode: nyKode(),
    tema: g.tema,
    type: g.type,
    niva: g.niva,
    fylke: g.fylke,
    skole: g.skole,
    stedsnavn: g.stedsnavn,
    ...(g.nokkel ? { nokkel: g.nokkel } : {}),
    ...(g.verdi !== undefined ? { verdi: g.verdi } : {}),
    ...(g.tittel ? { tittel: g.tittel[malform] } : {}),
    ...(g.tekst ? { tekst: g.tekst[malform] } : {}),
    ...(g.kilde.url ? { lenke: g.kilde.url } : {}),
    merknad: g.kilde.navn,
    ...(g.gjelder_fra ? { gjelderFra: g.gjelder_fra } : {}),
    ...(g.gjelder_til ? { gjelderTil: g.gjelder_til } : {}),
    lagtInn: iDag(),
    endrer: g.kode,
  };
}

/** Hva som mangler eller er feil før regelen kan lagres, eller null. */
function sjekk(t: T, r: EgenRegel): string | null {
  if (r.type === 'verdi' && (r.verdi === undefined || !Number.isFinite(r.verdi) || r.verdi < 0)) return t('lokaleRegler.skjema.mangler');
  if (r.type === 'regel' && !(r.tittel?.trim() && r.tekst?.trim())) return t('lokaleRegler.skjema.mangler');
  if (r.lenke && !/^https?:\/\/\S+$/.test(r.lenke)) return t('lokaleRegler.skjema.ugyldigLenke');
  if (r.gjelderFra && r.gjelderTil && r.gjelderFra > r.gjelderTil) return t('lokaleRegler.skjema.ugyldigDato');
  return null;
}

export default function LokalRegel({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const { egne, godkjente, lastet } = useLokale();
  const kode = sporring.get('kode');
  const fra = sporring.get('fra');
  const nyRegel = useRef<{ adresse: string; regel: EgenRegel } | null>(null);
  const brodsmuler = <Brodsmuler ledd={[{ tekst: t('innstillinger.tittel'), href: '#/innstillinger' }]} />;

  const finnes = kode ? egne.find((r) => r.kode === kode) : undefined;
  const godkjent = fra ? godkjente.find((r) => r.kode === fra) : undefined;
  if (!innstillinger.fylke && !finnes) {
    return (
      <div class="side">
        {brodsmuler}
        <Sidetopp tittel={t('lokaleRegler.skjema.tittelNy')} />
        <p class="merknad">{t('lokaleRegler.velgFylke')}</p>
      </div>
    );
  }
  if (fra && !godkjent && !lastet) {
    return (
      <div class="side">
        {brodsmuler}
        <p class="dempet">{t('app.lasterInn')}</p>
      </div>
    );
  }
  const fylke = innstillinger.fylke ?? finnes?.fylke ?? '';
  const skole = innstillinger.skole;
  const ny = (): EgenRegel => {
    const onsket = sporring.get('tema') ?? '';
    const tema = (TEMA as readonly string[]).includes(onsket) ? (onsket as Tema) : 'arbeidstid';
    return {
      kode: nyKode(),
      tema,
      ...forsteValg(tema),
      niva: skole ? 'skole' : 'fylke',
      fylke,
      skole: skole ? skole.id : null,
      stedsnavn: skole ? skole.navn : (fylkesnavn(fylke) ?? fylke),
      lagtInn: iDag(),
    };
  };
  // En ny regel får koden én gang per adresse, så skjemaet ikke starter på nytt når siden tegnes på nytt.
  const adresse = `${kode ?? ''}|${fra ?? ''}|${sporring.get('tema') ?? ''}`;
  if (nyRegel.current?.adresse !== adresse) nyRegel.current = null;
  const start = finnes ?? (nyRegel.current ??= { adresse, regel: godkjent ? kopiAv(godkjent, malform) : ny() }).regel;
  return <Skjema key={start.kode} start={start} finnes={egne.some((e) => e.kode === start.kode)} godkjente={godkjente} brodsmuler={brodsmuler} />;
}

function Skjema({ start, finnes, godkjente, brodsmuler }: { start: EgenRegel; finnes: boolean; godkjente: readonly PublisertRegel[]; brodsmuler: JSX.Element }) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [r, settR] = useState<EgenRegel>(start);
  const [prosent, settProsent] = useState(true);
  const [melding, settMelding] = useState<string | null>(null);
  // E-postprogrammet kan åpne e-posten bak nettleseren (f.eks. Outlook på Windows). Appen sier derfor fra om at
  // e-posten er laget, med «Åpne e-posten på nytt» og «Kopier e-posten» (eier 08.10.2026).
  const [sendt, settSendt] = useState<'ja' | 'kopiert' | 'kopiFeil' | null>(null);
  const sendtBoks = useRef<HTMLElement>(null);
  useEffect(() => {
    if (sendt !== 'ja') return;
    sendtBoks.current?.focus();
    sendtBoks.current?.scrollIntoView({ block: 'center' });
  }, [sendt]);
  const endre = (del: Partial<EgenRegel>) => settR((g) => ({ ...g, ...del }));

  const fylke = fylkesnavn(r.fylke) ?? r.fylke;
  const skole = innstillinger.skole && innstillinger.fylke === r.fylke ? innstillinger.skole : r.niva === 'skole' ? { id: r.skole, navn: r.stedsnavn } : null;
  const settNiva = (niva: 'fylke' | 'skole') =>
    endre(niva === 'skole' && skole ? { niva, skole: skole.id, stedsnavn: skole.navn } : { niva: 'fylke', skole: null, stedsnavn: fylke });
  const tittel = r.type === 'verdi' && r.nokkel ? t(verdinavn(r.nokkel)) : (r.tittel ?? '');
  const versjon = `${__APP_VERSJON__}${__TESTVERSJON__ ? ' (test)' : ''}`;
  const epostlinjer = [
    t('lokaleRegler.meld.mal'),
    '',
    '',
    t('lokaleRegler.meld.skille'),
    ...innmelding(r, { fylkesnavn: fylke, nasjonal: r.nokkel ? String(nasjonalVerdi(r.nokkel).verdi) : null }, malform, versjon, iDag()),
    '---',
    t('lokaleRegler.meld.vedlegg'),
  ];
  const emne = t('lokaleRegler.meld.emne', { app: app.navn, tittel: tittel || '…', kode: r.kode });
  const lenke = () => epostlenke(app.tilbakemelding, emne, epostlinjer);

  const lagre = (meld: boolean) => {
    const feil = sjekk(t, r);
    if (feil) {
      settMelding(feil);
      return;
    }
    const lagret: EgenRegel = meld ? { ...r, innmeldt: iDag() } : r;
    lagreEgenRegel(lagret);
    settR(lagret);
    // Adressen får koden, så siden viser den lagrede regelen etter en ny lasting eller tilbake fra e-posten.
    erstattAdresse('/innstillinger/lokal-regel', { kode: lagret.kode });
    if (meld) {
      aapneEpost(lenke());
      settSendt('ja');
      settMelding(null);
    } else {
      settMelding(t('lokaleRegler.skjema.lagret'));
    }
  };

  const kopierEpost = async () => {
    try {
      await navigator.clipboard.writeText([app.tilbakemelding, emne, '', ...epostlinjer].join('\n'));
      settSendt('kopiert');
    } catch {
      settSendt('kopiFeil');
    }
  };

  const nasjonal = r.nokkel ? nasjonalVerdi(r.nokkel) : null;
  const kilde = nasjonal ? (({ navn, punkt }) => navn + punkt)(kildeTekst(t, nasjonal.kilde, true)) : '';
  // Funksjoner kan oppgis i prosent av en stilling: årsrammetimene delt på årsrammen for funksjoner (607,5).
  const harProsent = r.nokkel !== undefined && iProsent(r.nokkel);
  const ramme = harProsent ? funksjonsramme() : 1;
  const somProsent = (timer: number) => `${formaterTall((timer / ramme) * 100)}\u00a0%`;
  const visProsent = harProsent && prosent;
  // Feltet viser det brukeren skriver. Når verdien eller enheten byttes, vises verdien i den nye enheten.
  const tilFelt = (verdi: number | undefined, somP: boolean) =>
    verdi === undefined ? '' : (somP ? formaterTall((verdi / ramme) * 100, 4) : formaterTall(verdi, 4)).replace(/\s/g, '');
  const [felt, settFelt] = useState(() => tilFelt(r.verdi, visProsent));
  const forrige = useRef({ nokkel: r.nokkel, visProsent });
  useEffect(() => {
    if (forrige.current.nokkel === r.nokkel && forrige.current.visProsent === visProsent) return;
    forrige.current = { nokkel: r.nokkel, visProsent };
    settFelt(tilFelt(r.verdi, visProsent));
  }, [r.nokkel, visProsent]);
  const valg = valgFor(r.tema);
  const status = finnes ? egenstatus(r, godkjente, iDag()) : null;
  const meldTekst = r.innmeldt ? t('lokaleRegler.skjema.meldPaNytt') : t('lokaleRegler.skjema.lagreMeld');

  return (
    <div class="side side-bred">
      {brodsmuler}
      <Sidetopp tittel={finnes || r.endrer ? t('lokaleRegler.skjema.tittelEndre') : t('lokaleRegler.skjema.tittelNy')} />
      <p class="ingress">{t('lokaleRegler.skjema.ingress', { sted: r.stedsnavn })}</p>
      {r.endrer && <p class="merknad">{t('lokaleRegler.skjema.endrerGodkjent', { sted: r.stedsnavn })}</p>}
      {status === 'utlopt' && <p class="merknad merknad-advarsel">{t('lokaleRegler.skjema.utlopt')}</p>}
      <ToKolonner
        hoved={
          <form
            class="lokalregel-skjema"
            onSubmit={(e) => {
              e.preventDefault();
              lagre(false);
            }}
          >
            <fieldset class="valggruppe">
              <legend>{t('lokaleRegler.skjema.del.tema')}</legend>
              <Bryter
                legend={t('lokaleRegler.skjema.del.tema')}
                skjultLegend
                verdi={r.tema}
                valg={TEMA.map((tm) => ({ verdi: tm, tekst: t(`lokaleRegler.tema.${tm}`) }))}
                onEndring={(tema) => endre({ tema, ...forsteValg(tema), verdi: undefined })}
              />
            </fieldset>

            <fieldset class="valggruppe">
              <legend>{t('lokaleRegler.skjema.del.hva')}</legend>
              {valg.length > 1 ? (
                <div class="lokalregel-valg">
                  {valg.map((v) => (
                    <label key={v} class="valg">
                      <input
                        type="radio"
                        name="lr-hva"
                        checked={v === 'tekst' ? r.type === 'regel' : r.nokkel === v}
                        onChange={() => endre(v === 'tekst' ? { type: 'regel', nokkel: undefined, verdi: undefined } : { type: 'verdi', nokkel: v, verdi: undefined })}
                      />
                      <span class="lokalregel-valgtekst">
                        <span>{v === 'tekst' ? t(`lokaleRegler.annen.${r.tema}`) : t(verdinavn(v))}</span>
                        {v !== 'tekst' && <span class="dempet liten">{visVerdi(v, Number(nasjonalVerdi(v).verdi))}</span>}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p>{t(`lokaleRegler.annen.${r.tema}`)}</p>
              )}
              <p class="felt-hjelp">
                {r.type === 'verdi' ? t('lokaleRegler.skjema.hva.verdiHjelp') : t('lokaleRegler.skjema.hva.regelHjelp', { side: t(`lokaleRegler.tema.${r.tema}`) })}
              </p>
            </fieldset>

            <fieldset class="valggruppe">
              <legend>{t('lokaleRegler.skjema.del.hvor')}</legend>
              <Bryter
                legend={t('lokaleRegler.skjema.del.hvor')}
                skjultLegend
                verdi={r.niva}
                valg={[{ verdi: 'fylke' as const, tekst: fylke }, ...(skole ? [{ verdi: 'skole' as const, tekst: skole.navn }] : [])]}
                onEndring={settNiva}
              />
              <p class="felt-hjelp">{t('lokaleRegler.skjema.hvorHjelp', { sted: r.stedsnavn })}</p>
            </fieldset>

            <fieldset class="valggruppe">
              <legend>{t('lokaleRegler.skjema.del.regel')}</legend>
              {r.type === 'verdi' && r.nokkel ? (
                <>
                  {harProsent && (
                    <Bryter
                      legend={t('lokaleRegler.skjema.enhet')}
                      kompakt
                      verdi={prosent ? 'prosent' : 'timer'}
                      valg={[
                        { verdi: 'prosent', tekst: t('lokaleRegler.skjema.prosent') },
                        { verdi: 'timer', tekst: t('lokaleRegler.skjema.timer') },
                      ]}
                      onEndring={(v) => settProsent(v === 'prosent')}
                    />
                  )}
                  <div class="felt">
                    <label for="lr-verdi">{tittel}</label>
                    <span class="lokalregel-tall">
                      <input
                        id="lr-verdi"
                        class="tekstfelt"
                        type="text"
                        inputMode="decimal"
                        aria-describedby="lr-verdi-hjelp"
                        value={felt}
                        onInput={(e) => {
                          const tekst = e.currentTarget.value;
                          settFelt(tekst);
                          const v = tekst.replace(/\s/g, '').replace(',', '.');
                          const tall = Number(v);
                          endre({ verdi: v === '' || Number.isNaN(tall) ? undefined : visProsent ? (tall / 100) * ramme : tall });
                        }}
                      />
                      <span class="dempet">{visProsent ? '%' : nasjonal?.enhet}</span>
                    </span>
                    {harProsent && r.verdi !== undefined && (
                      <p class="felt-hjelp">
                        {visProsent
                          ? t('lokaleRegler.skjema.somTimer', { timer: formaterTall(r.verdi) })
                          : t('lokaleRegler.skjema.somProsent', { prosent: somProsent(r.verdi), timer: formaterTall(r.verdi), ramme: formaterTall(ramme) })}
                      </p>
                    )}
                    {nasjonal && (
                      <p id="lr-verdi-hjelp" class="felt-hjelp">
                        {harProsent
                          ? t('lokaleRegler.skjema.nasjonalProsent', { timer: formaterTall(Number(nasjonal.verdi)), prosent: somProsent(Number(nasjonal.verdi)), kilde })
                          : t('lokaleRegler.skjema.nasjonal', { verdi: visVerdi(r.nokkel, Number(nasjonal.verdi)), kilde })}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div class="felt">
                    <label for="lr-tittel">{t('lokaleRegler.skjema.tittel')}</label>
                    <input id="lr-tittel" type="text" maxLength={120} value={r.tittel ?? ''} onInput={(e) => endre({ tittel: e.currentTarget.value })} />
                  </div>
                  <div class="felt">
                    <label for="lr-tekst">{t('lokaleRegler.skjema.tekst')}</label>
                    <p id="lr-tekst-hjelp" class="felt-hjelp">
                      {t('lokaleRegler.skjema.tekstHjelp')}
                    </p>
                    <textarea id="lr-tekst" rows={5} maxLength={2000} aria-describedby="lr-tekst-hjelp" value={r.tekst ?? ''} onInput={(e) => endre({ tekst: e.currentTarget.value })} />
                  </div>
                </>
              )}
            </fieldset>

            <fieldset class="valggruppe">
              <legend>{t('lokaleRegler.skjema.del.dato')}</legend>
              <div class="lokalregel-datoer">
                <div class="felt">
                  <label for="lr-fra">{t('lokaleRegler.skjema.gjelderFra')}</label>
                  <input id="lr-fra" class="tekstfelt" type="date" value={r.gjelderFra ?? ''} onInput={(e) => endre({ gjelderFra: e.currentTarget.value || undefined })} />
                </div>
                <div class="felt">
                  <label for="lr-til">{t('lokaleRegler.skjema.gjelderTil')}</label>
                  <input id="lr-til" class="tekstfelt" type="date" value={r.gjelderTil ?? ''} onInput={(e) => endre({ gjelderTil: e.currentTarget.value || undefined })} />
                </div>
              </div>
              <div class="felt">
                <label for="lr-lenke">{t('lokaleRegler.skjema.lenke')}</label>
                <p id="lr-lenke-hjelp" class="felt-hjelp">
                  {t('lokaleRegler.skjema.lenkeHjelp')}
                </p>
                <input id="lr-lenke" type="url" aria-describedby="lr-lenke-hjelp" value={r.lenke ?? ''} onInput={(e) => endre({ lenke: e.currentTarget.value.trim() || undefined })} />
              </div>
              <div class="felt">
                <label for="lr-merknad">{t('lokaleRegler.skjema.merknad')}</label>
                <p id="lr-merknad-hjelp" class="felt-hjelp">
                  {t('lokaleRegler.skjema.merknadHjelp')}
                </p>
                <input id="lr-merknad" type="text" maxLength={200} aria-describedby="lr-merknad-hjelp" value={r.merknad ?? ''} onInput={(e) => endre({ merknad: e.currentTarget.value || undefined })} />
              </div>
              <p class="dempet liten">{t('lokaleRegler.skjema.lagtInn', { dato: formaterDato(r.lagtInn, malform) })}</p>
            </fieldset>

            <div class="knapperad lokalregel-knapper">
              <button type="submit" class="knapp">
                <Ikon navn="hake" />
                {t('lokaleRegler.skjema.lagre')}
              </button>
              <button type="button" class="knapp knapp-sekundaer" onClick={() => lagre(true)}>
                <Ikon navn="blyant" />
                {meldTekst}
              </button>
              {finnes && (
                <button
                  type="button"
                  class="knapp knapp-fare"
                  onClick={() => {
                    if (!window.confirm(t('lokaleRegler.skjema.slettBekreft'))) return;
                    slettEgenRegel(r.kode);
                    naviger('/innstillinger');
                  }}
                >
                  <Ikon navn="slett" />
                  {t('lokaleRegler.skjema.slett')}
                </button>
              )}
            </div>
            <p role="status" class="liten">
              {melding}
            </p>
            {sendt && (
              <section class="kort kort-med-topp lokalregel-sendt" ref={sendtBoks} tabIndex={-1} aria-labelledby="lr-sendt">
                <h2 id="lr-sendt">{t('lokaleRegler.meld.sendtTittel')}</h2>
                <p>{t('lokaleRegler.meld.sendtTekst')}</p>
                <div class="knapperad">
                  <a class="knapp knapp-sekundaer" href={lenke()}>
                    <Ikon navn="blyant" />
                    {t('lokaleRegler.meld.apnePaNytt')}
                  </a>
                  <button type="button" class="knapp knapp-sekundaer" onClick={() => void kopierEpost()}>
                    <Ikon navn="kopier" />
                    {t('lokaleRegler.meld.kopier')}
                  </button>
                </div>
                <p role="status" class="liten">
                  {sendt === 'kopiert' ? t('lokaleRegler.meld.kopiert') : sendt === 'kopiFeil' ? t('lokaleRegler.meld.kopiFeil') : ''}
                </p>
              </section>
            )}
          </form>
        }
        side={
          <>
            <section class="kort kort-med-topp">
              <h2>{t('lokaleRegler.forhandsvisning')}</h2>
              {r.type === 'regel' ? (
                <Egenregelkort regel={{ ...r, tittel: r.tittel || '…', tekst: r.tekst || '…' }} godkjente={godkjente} />
              ) : (
                r.nokkel && (
                  <div class="egenverdi">
                    <span class="egenverdi-navn">{tittel}</span>
                    <span class="egenverdi-tall tall">{r.verdi === undefined ? '–' : visVerdi(r.nokkel, r.verdi)}</span>
                    <Egenmerke verdi />
                    {nasjonal && <span class="dempet liten">{t('lokaleRegler.nasjonaltVar', { verdi: visVerdi(r.nokkel, Number(nasjonal.verdi)) })}</span>}
                  </div>
                )
              )}
            </section>
            <section class="kort kort-med-topp">
              <h2>{t('lokaleRegler.meld.tittel')}</h2>
              <p>{t('lokaleRegler.meld.tekst')}</p>
              <ol class="lokalregel-steg">
                <li>{t('lokaleRegler.meld.steg1')}</li>
                <li>{t('lokaleRegler.meld.steg2', { sted: r.stedsnavn })}</li>
                <li>{t('lokaleRegler.meld.steg3')}</li>
              </ol>
              <p class="dempet liten">{t('lokaleRegler.meld.offentlig')}</p>
              <details class="lokalregel-epost">
                <summary>{t('lokaleRegler.meld.vis')}</summary>
                <p class="liten">
                  <strong>{emne}</strong>
                </p>
                <pre>{epostlinjer.join('\n')}</pre>
              </details>
            </section>
          </>
        }
      />
    </div>
  );
}
