// Skissen til fase 9: skjemaet der brukeren legger inn eller endrer en lokal regel. Finnes bare i utvikling og
// testversjonen. Se src/app/lokaleregler/skisse.ts og docs/arbeidsordrer/fase-9-forslag.md.
// Brukeren velger først hva endringen gjelder (temaet), så hva som skal endres (eier 08.10.2026).
import { useEffect, useRef, useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Brodsmuler } from '../../components/Brodsmuler.tsx';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { kildeTekst } from '../../components/Kildelenke.tsx';
import { Sidetopp } from '../../components/Sidetopp.tsx';
import { ToKolonner } from '../../components/ToKolonner.tsx';
import { iDag } from '../../data/skolear.ts';
import { formaterDato, formaterTall } from '../../core/i18n/tekst.ts';
import type { SideProps } from '../../modules/typer.ts';
import { epostlenke } from '../tilbakemelding.ts';
import { naviger } from '../ruter.ts';
import { useTekst } from '../tilstand.ts';
import {
  type EgenRegel,
  finnRegel,
  I_PROSENT,
  innmelding,
  lagreRegel,
  nasjonalVerdi,
  nyKode,
  slettRegel,
  status,
  TEMA,
  type Tema,
  VALG,
} from '../lokaleregler/skisse.ts';
import { Egenmerke, Egenregelkort, medEnhet, useSted, verdinavn } from '../lokaleregler/visning.tsx';

/** Det første som kan endres under temaet, som regel eller verdi. */
function forsteValg(tema: Tema): Pick<EgenRegel, 'type' | 'forhold' | 'nokkel'> {
  const forste = VALG[tema][0] ?? 'tekst';
  return forste === 'tekst' ? { type: 'regel', forhold: 'supplerer', nokkel: undefined } : { type: 'verdi', forhold: 'erstatter', nokkel: forste };
}

export default function LokalRegel({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const sted = useSted();
  const kode = sporring.get('kode');
  const fra = sporring.get('fra');
  const finnes = kode ? finnRegel(kode) : undefined;
  const godkjent = fra ? finnRegel(fra) : undefined;
  const [r, settR] = useState<EgenRegel>(() => {
    if (finnes) return finnes;
    // En endring av en godkjent regel: en ny regel for brukeren med verdiene fra den godkjente.
    if (godkjent) {
      const kopi: EgenRegel = { ...godkjent, kode: nyKode(), endrer: godkjent.kode, lagtInn: iDag() };
      delete kopi.innmeldt;
      delete kopi.godkjent;
      return kopi;
    }
    const tema = (sporring.get('tema') as Tema | null) ?? 'arbeidstid';
    return { kode: nyKode(), niva: sted.skole ? 'skole' : 'fylke', tema, ...forsteValg(tema), lagtInn: iDag() };
  });
  const [iProsent, settIProsent] = useState(true);
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
  const versjon = `${__APP_VERSJON__}${__TESTVERSJON__ ? ' (test)' : ''}`;
  const stedsnavn = r.niva === 'skole' && sted.skole ? sted.skole.navn : (sted.fylkesnavn ?? '');
  const tittel = r.type === 'verdi' && r.nokkel ? t(`lokaleRegler.verdier.${verdinavn(r.nokkel)}`) : (r.tittel ?? '');
  const utfylt = r.type === 'verdi' ? r.verdi !== undefined && !Number.isNaN(r.verdi) : Boolean(r.tittel?.trim() && r.tekst?.trim());

  if (!sted.fylke) {
    return (
      <div class="side">
        <Brodsmuler ledd={[{ tekst: t('innstillinger.tittel'), href: '#/innstillinger' }]} />
        <Sidetopp tittel={t('lokaleRegler.skjema.tittelNy')} />
        <p class="merknad">{t('lokaleRegler.velgFylke')}</p>
      </div>
    );
  }

  const epostlinjer = [
    t('lokaleRegler.meld.mal'),
    '',
    '',
    t('lokaleRegler.meld.skille'),
    ...innmelding(r, { fylke: sted.fylke, fylkesnavn: sted.fylkesnavn ?? '', skole: sted.skole }, malform, versjon, iDag()),
    '---',
    t('lokaleRegler.meld.vedlegg'),
  ];
  const emne = t('lokaleRegler.meld.emne', { app: app.navn, tittel: tittel || '…', kode: r.kode });

  const lagre = (meld: boolean) => {
    if (!utfylt) {
      settMelding(t('lokaleRegler.skjema.mangler'));
      return;
    }
    const ny = meld ? { ...r, innmeldt: r.innmeldt ?? iDag() } : r;
    lagreRegel(ny);
    settR(ny);
    settMelding(t('lokaleRegler.skjema.lagret'));
    if (meld) {
      location.href = epostlenke(app.tilbakemelding, emne, epostlinjer);
      settSendt('ja');
      settMelding(null);
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
  const harProsent = r.nokkel !== undefined && I_PROSENT.includes(r.nokkel);
  const ramme = Number(nasjonalVerdi('sfs2213.arsramme_funksjon').verdi);
  const somProsent = (timer: number) => `${formaterTall((timer / ramme) * 100)}\u00a0%`;
  const visProsent = harProsent && iProsent;
  const feltverdi = r.verdi === undefined ? '' : visProsent ? formaterTall((r.verdi / ramme) * 100, 4) : String(r.verdi).replace('.', ',');
  const valg = VALG[r.tema];

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('innstillinger.tittel'), href: '#/innstillinger' }]} />
      <Sidetopp tittel={finnes || godkjent ? t('lokaleRegler.skjema.tittelEndre') : t('lokaleRegler.skjema.tittelNy')} />
      <p class="ingress">{t('lokaleRegler.skjema.ingress', { sted: sted.navn ?? '' })}</p>
      {r.endrer && <p class="merknad">{t('lokaleRegler.skjema.endrerGodkjent', { sted: stedsnavn })}</p>}
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
                        onChange={() =>
                          endre(v === 'tekst' ? { type: 'regel', forhold: 'supplerer', nokkel: undefined } : { type: 'verdi', forhold: 'erstatter', nokkel: v, verdi: undefined })
                        }
                      />
                      <span class="lokalregel-valgtekst">
                        <span>{v === 'tekst' ? t(`lokaleRegler.annen.${r.tema}`) : t(`lokaleRegler.verdier.${verdinavn(v)}`)}</span>
                        {v !== 'tekst' && (
                          <span class="dempet liten">
                            {I_PROSENT.includes(v) ? somProsent(Number(nasjonalVerdi(v).verdi)) : medEnhet(v, Number(nasjonalVerdi(v).verdi))}
                          </span>
                        )}
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
                valg={[
                  { verdi: 'fylke', tekst: sted.fylkesnavn ?? '' },
                  ...(sted.skole ? [{ verdi: 'skole' as const, tekst: sted.skole.navn }] : []),
                ]}
                onEndring={(niva) => endre({ niva })}
              />
              <p class="felt-hjelp">{t('lokaleRegler.skjema.hvorHjelp', { sted: stedsnavn })}</p>
            </fieldset>

            <fieldset class="valggruppe">
              <legend>{t('lokaleRegler.skjema.del.regel')}</legend>
              {r.type === 'verdi' && r.nokkel ? (
                <>
                  {harProsent && (
                    <Bryter
                      legend={t('lokaleRegler.skjema.enhet')}
                      kompakt
                      verdi={iProsent ? 'prosent' : 'timer'}
                      valg={[
                        { verdi: 'prosent', tekst: t('lokaleRegler.skjema.prosent') },
                        { verdi: 'timer', tekst: t('lokaleRegler.skjema.timer') },
                      ]}
                      onEndring={(v) => settIProsent(v === 'prosent')}
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
                        value={feltverdi}
                        onInput={(e) => {
                          const v = e.currentTarget.value.replace(/\s/g, '').replace(',', '.');
                          const tall = Number(v);
                          endre({ verdi: v === '' ? undefined : visProsent ? (tall / 100) * ramme : tall });
                        }}
                      />
                      <span class="dempet">{visProsent ? '%' : nasjonal?.enhet}</span>
                    </span>
                    {harProsent && r.verdi !== undefined && !Number.isNaN(r.verdi) && (
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
                          : t('lokaleRegler.skjema.nasjonal', { verdi: medEnhet(r.nokkel, Number(nasjonal.verdi)), kilde })}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div class="felt">
                    <label for="lr-tittel">{t('lokaleRegler.skjema.tittel')}</label>
                    <input id="lr-tittel" type="text" value={r.tittel ?? ''} onInput={(e) => endre({ tittel: e.currentTarget.value })} />
                  </div>
                  <div class="felt">
                    <label for="lr-tekst">{t('lokaleRegler.skjema.tekst')}</label>
                    <p id="lr-tekst-hjelp" class="felt-hjelp">
                      {t('lokaleRegler.skjema.tekstHjelp')}
                    </p>
                    <textarea id="lr-tekst" rows={5} aria-describedby="lr-tekst-hjelp" value={r.tekst ?? ''} onInput={(e) => endre({ tekst: e.currentTarget.value })} />
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
                <input id="lr-lenke" type="url" aria-describedby="lr-lenke-hjelp" value={r.lenke ?? ''} onInput={(e) => endre({ lenke: e.currentTarget.value || undefined })} />
              </div>
              <div class="felt">
                <label for="lr-merknad">{t('lokaleRegler.skjema.merknad')}</label>
                <p id="lr-merknad-hjelp" class="felt-hjelp">
                  {t('lokaleRegler.skjema.merknadHjelp')}
                </p>
                <input id="lr-merknad" type="text" aria-describedby="lr-merknad-hjelp" value={r.merknad ?? ''} onInput={(e) => endre({ merknad: e.currentTarget.value || undefined })} />
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
                {t('lokaleRegler.skjema.lagreMeld')}
              </button>
              {finnes && status(finnes) !== 'godkjent' && (
                <button
                  type="button"
                  class="knapp knapp-fare"
                  onClick={() => {
                    if (!window.confirm(t('lokaleRegler.skjema.slettBekreft'))) return;
                    slettRegel(r.kode);
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
                  <a class="knapp knapp-sekundaer" href={epostlenke(app.tilbakemelding, emne, epostlinjer)}>
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
                <Egenregelkort regel={{ ...r, tittel: r.tittel || '…', tekst: r.tekst || '…' }} />
              ) : (
                r.nokkel && (
                  <div class="egenverdi">
                    <span class="egenverdi-navn">{tittel}</span>
                    <span class="egenverdi-tall tall">{r.verdi === undefined ? '–' : harProsent ? somProsent(r.verdi) : medEnhet(r.nokkel, r.verdi)}</span>
                    <Egenmerke verdi />
                    {nasjonal && (
                      <span class="dempet liten">
                        {t('lokaleRegler.skisse.nasjonaltVar', {
                          verdi: harProsent ? somProsent(Number(nasjonal.verdi)) : medEnhet(r.nokkel, Number(nasjonal.verdi)),
                        })}
                      </span>
                    )}
                  </div>
                )
              )}
            </section>
            <section class="kort kort-med-topp">
              <h2>{t('lokaleRegler.meld.tittel')}</h2>
              <p>{t('lokaleRegler.meld.tekst')}</p>
              <ol class="lokalregel-steg">
                <li>{t('lokaleRegler.meld.steg1')}</li>
                <li>{t('lokaleRegler.meld.steg2', { sted: stedsnavn })}</li>
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
