// Skissen til fase 9: skjemaet der brukeren legger inn eller endrer en lokal regel. Finnes bare i utvikling og
// testversjonen. Se src/app/lokaleregler/skisse.ts og docs/arbeidsordrer/fase-9-forslag.md.
import { useState } from 'preact/hooks';
import { app } from '../../config/app.ts';
import { Brodsmuler } from '../../components/Brodsmuler.tsx';
import { Bryter } from '../../components/Bryter.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { kildeTekst } from '../../components/Kildelenke.tsx';
import { Sidetopp } from '../../components/Sidetopp.tsx';
import { ToKolonner } from '../../components/ToKolonner.tsx';
import { iDag } from '../../data/skolear.ts';
import { formaterDato } from '../../core/i18n/tekst.ts';
import type { SideProps } from '../../modules/typer.ts';
import { epostlenke } from '../tilbakemelding.ts';
import { naviger } from '../ruter.ts';
import { useTekst } from '../tilstand.ts';
import {
  type EgenRegel,
  finnRegel,
  innmelding,
  lagreRegel,
  LOKALE_VERDIER,
  nasjonalVerdi,
  nyKode,
  slettRegel,
  TEMA,
  type Tema,
  type Verdinokkel,
} from '../lokaleregler/skisse.ts';
import { Egenmerke, Egenregelkort, medEnhet, useSted, verdinavn } from '../lokaleregler/visning.tsx';

export default function LokalRegel({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const sted = useSted();
  const kode = sporring.get('kode');
  const finnes = kode ? finnRegel(kode) : undefined;
  const [r, settR] = useState<EgenRegel>(
    () =>
      finnes ?? {
        kode: nyKode(),
        type: 'verdi',
        niva: sted.skole ? 'skole' : 'fylke',
        forhold: 'erstatter',
        nokkel: 'sfs2213.planfestet_timer',
        tema: (sporring.get('tema') as Tema | null) ?? 'skoleregler',
        lagtInn: iDag(),
      },
  );
  const [melding, settMelding] = useState<string | null>(null);
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
    if (meld) location.href = epostlenke(app.tilbakemelding, emne, epostlinjer);
  };

  const nasjonal = r.nokkel ? nasjonalVerdi(r.nokkel) : null;

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('innstillinger.tittel'), href: '#/innstillinger' }]} />
      <Sidetopp tittel={finnes ? t('lokaleRegler.skjema.tittelEndre') : t('lokaleRegler.skjema.tittelNy')} />
      <p class="ingress">{t('lokaleRegler.skjema.ingress', { sted: sted.navn ?? '' })}</p>
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
              <legend>{t('lokaleRegler.skjema.del.hva')}</legend>
              <Bryter
                legend={t('lokaleRegler.skjema.del.hva')}
                skjultLegend
                verdi={r.type}
                valg={[
                  { verdi: 'verdi', tekst: t('lokaleRegler.skjema.hva.verdi') },
                  { verdi: 'regel', tekst: t('lokaleRegler.skjema.hva.regel') },
                ]}
                onEndring={(type) => endre({ type, forhold: type === 'verdi' ? 'erstatter' : 'supplerer' })}
              />
              <p class="felt-hjelp">{r.type === 'verdi' ? t('lokaleRegler.skjema.hva.verdiHjelp') : t('lokaleRegler.skjema.hva.regelHjelp')}</p>
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
              {r.type === 'verdi' ? (
                <>
                  <div class="felt">
                    <label for="lr-nokkel">{t('lokaleRegler.skjema.verdi')}</label>
                    <select id="lr-nokkel" value={r.nokkel} onChange={(e) => endre({ nokkel: e.currentTarget.value as Verdinokkel, verdi: undefined })}>
                      {LOKALE_VERDIER.map((n) => (
                        <option key={n} value={n}>
                          {t(`lokaleRegler.verdier.${verdinavn(n)}`)}
                        </option>
                      ))}
                    </select>
                    {nasjonal && r.nokkel && (
                      <p class="felt-hjelp">
                        {t('lokaleRegler.skjema.nasjonal', { verdi: medEnhet(r.nokkel, Number(nasjonal.verdi)), kilde: (({ navn, punkt }) => navn + punkt)(kildeTekst(t, nasjonal.kilde, true)) })}
                      </p>
                    )}
                  </div>
                  <div class="felt">
                    <label for="lr-verdi">{t('lokaleRegler.skjema.verdiHos')}</label>
                    <span class="lokalregel-tall">
                      <input
                        id="lr-verdi"
                        class="tekstfelt"
                        type="text"
                        inputMode="decimal"
                        value={r.verdi === undefined ? '' : String(r.verdi).replace('.', ',')}
                        onInput={(e) => {
                          const v = e.currentTarget.value.replace(/\s/g, '').replace(',', '.');
                          endre({ verdi: v === '' ? undefined : Number(v) });
                        }}
                      />
                      {nasjonal?.enhet && <span class="dempet">{nasjonal.enhet}</span>}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div class="felt">
                    <label for="lr-tema">{t('lokaleRegler.skjema.tema')}</label>
                    <select id="lr-tema" value={r.tema} onChange={(e) => endre({ tema: e.currentTarget.value as Tema })}>
                      {TEMA.map((tm) => (
                        <option key={tm} value={tm}>
                          {t(`lokaleRegler.tema.${tm}`)}
                        </option>
                      ))}
                    </select>
                  </div>
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
              {finnes && (
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
                    <span class="egenverdi-tall tall">{r.verdi === undefined ? '–' : medEnhet(r.nokkel, r.verdi)}</span>
                    <Egenmerke verdi />
                    {nasjonal && <span class="dempet liten">{t('lokaleRegler.skisse.nasjonaltVar', { verdi: medEnhet(r.nokkel, Number(nasjonal.verdi)) })}</span>}
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
