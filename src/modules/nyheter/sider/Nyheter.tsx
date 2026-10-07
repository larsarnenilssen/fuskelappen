// Nyhetssiden (fase 7b): alle sakene per dag, nyeste først, med filter på hvem som står bak og kilde. Filteret står i
// adressen. Til høyre på stor skjerm: om utvalget og kildene med status. Kildelisten er kildene til siden, så siden
// har ikke egen «Kilder»-boks (eier 07.10.2026).
import { useEffect, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { fylker } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { useHusketApen } from '../../../components/husket.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Seksjon } from '../../../components/Seksjon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner, useBred } from '../../../components/ToKolonner.tsx';
import { formaterDato, formaterTidspunkt } from '../../../core/i18n/tekst.ts';
import { iDag } from '../../../data/skolear.ts';
import { lastNyheter } from '../../../data/nyheter.ts';
import { oversiktsid } from '../../favoritter.ts';
import type { SideProps } from '../../typer.ts';
import { NYHETER_RUTE } from '../adresse.ts';
import { dagTittel, Sak } from '../komponenter.tsx';
import type { Nyheter as Nyhetsfil, Nyhetstype } from '../skjema.ts';
import { filterSporring, forTrettiDager, lesFilter, lesNyhetsfylke, type Nyhetsfylke, NYHETSKILDER, perDag, synligeKilder, typerMedKilder, velgSaker, type Nyhetsfilter } from '../utvalg.ts';

const KS_URL = 'https://www.ks.no/les-mer/?theme=43';

export default function Nyheter({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const bred = useBred();
  const [data, settData] = useState<Nyhetsfil | null | 'feil'>(null);
  const [filter, settFilter] = useState<Nyhetsfilter>(() => lesFilter(sporring));
  useEffect(() => {
    let aktiv = true;
    lastNyheter()
      .then((d) => aktiv && settData(d))
      .catch(() => aktiv && settData('feil'));
    return () => {
      aktiv = false;
    };
  }, []);

  // Fylket: det i innstillingene, et annet fylke, alle fylkene eller ingen (bare de nasjonale kildene). Forsiden følger
  // alltid innstillingene (eier 07.10.2026).
  const mittFylke = innstillinger.fylke;
  const [fylke, settFylke] = useState<Nyhetsfylke>(() => lesNyhetsfylke(sporring, fylker.map((f) => f.nummer), mittFylke));
  const kilder = useMemo(() => synligeKilder(NYHETSKILDER, fylke), [fylke]);
  const typer = typerMedKilder(kilder);
  const kilderForType = filter.type ? kilder.filter((k) => k.type === filter.type) : kilder;
  const endre = (endring: Partial<Nyhetsfilter>, nyttFylke: Nyhetsfylke = fylke) => {
    const ny = { ...filter, ...endring };
    const synlige = synligeKilder(NYHETSKILDER, nyttFylke);
    // En kilde som ikke hører til typen eller fylket, faller bort.
    const k = synlige.find((x) => x.id === ny.kilde);
    if (ny.kilde && (!k || (ny.type && k.type !== ny.type))) ny.kilde = null;
    settFilter(ny);
    settFylke(nyttFylke);
    erstattAdresse(NYHETER_RUTE, Object.fromEntries(new URLSearchParams(filterSporring(ny, { valgt: nyttFylke, standard: mittFylke }))));
  };
  const saker = data && data !== 'feil' ? velgSaker(data.saker, kilder, filter) : [];
  const idag = iDag();
  // De siste 30 dagene står først, og resten under «Vis eldre» (eier 07.10.2026).
  const [visEldre, settVisEldre] = useHusketApen('nyheter:eldre');
  const grense = forTrettiDager(idag);
  const nye = saker.filter((s) => s.dato >= grense);
  const vist = visEldre ? saker : nye;
  const eldre = saker.length - nye.length;

  const hoved = (
    <>
      <div class="nyh-filter">
        <div class="felt">
          <label for="nyh-hvem">{t('nyheter.filter.hvem')}</label>
          <select id="nyh-hvem" value={filter.type ?? ''} onChange={(e) => endre({ type: (e.currentTarget.value || null) as Nyhetstype | null })}>
            <option value="">{t('nyheter.filter.alle')}</option>
            {typer.map((ty) => (
              <option key={ty} value={ty}>
                {t(`nyheter.filter.${ty}`)}
              </option>
            ))}
          </select>
        </div>
        <div class="felt">
          <label for="nyh-fylke">{t('nyheter.filter.fylke')}</label>
          <select id="nyh-fylke" value={fylke ?? 'ingen'} onChange={(e) => endre({}, e.currentTarget.value === 'ingen' ? null : e.currentTarget.value)}>
            <option value="ingen">{t('nyheter.filter.ingenFylke')}</option>
            <option value="alle">{t('nyheter.filter.alleFylker')}</option>
            {fylker.map((f) => (
              <option key={f.nummer} value={f.nummer}>
                {f.nummer === mittFylke ? t('nyheter.filter.mittFylke', { fylke: f.navn }) : f.navn}
              </option>
            ))}
          </select>
        </div>
        <div class="felt">
          <label for="nyh-kilde">{t('nyheter.filter.kilde')}</label>
          <select id="nyh-kilde" value={filter.kilde ?? ''} onChange={(e) => endre({ kilde: e.currentTarget.value || null })}>
            <option value="">{t('nyheter.filter.alleKilder')}</option>
            {kilderForType.map((k) => (
              <option key={k.id} value={k.id}>
                {k.navn[malform]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {data === null && <p class="dempet">{t('nyheter.laster')}</p>}
      {data === 'feil' && <p role="alert">{t('nyheter.feil')}</p>}
      {data && data !== 'feil' && (
        <>
          <p class="liten dempet" aria-live="polite">
            {t('nyheter.antall', { antall: vist.length })} · {t('nyheter.hentet', { tid: formaterTidspunkt(data.hentet, malform) })}
          </p>
          {vist.length === 0 && <p>{eldre > 0 ? t('nyheter.ingenNyere') : t('nyheter.ingen')}</p>}
          {perDag(vist).map((dag) => (
            <section key={dag.dato} class="nyh-dag" aria-labelledby={`nyh-${dag.dato}`}>
              <h2 id={`nyh-${dag.dato}`} class="liten-overskrift">
                {dagTittel(dag.dato, idag, t, malform)}
              </h2>
              <ul class="liste">
                {dag.saker.map((s) => (
                  <li key={s.url}>
                    <Sak sak={s} fulltNavn={fylke !== mittFylke} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {!visEldre && eldre > 0 && (
            <button type="button" class="knapp knapp-sekundaer knapp-liten nyh-eldre" onClick={() => settVisEldre(true)}>
              {t('nyheter.visEldre', { antall: eldre })}
            </button>
          )}
        </>
      )}
    </>
  );

  const status = data && data !== 'feil' ? data.kilder : {};
  const side = (
    <>
      <Seksjon id="nyh-om" tittel={t('nyheter.om.tittel')} apen={bred}>
        <div class="nyh-om">
          <p>{t('nyheter.om.utvalg')}</p>
          <p>{t('nyheter.om.interesseparter')}</p>
          <p>
            {t('nyheter.om.fylke')}
            {!innstillinger.fylke && (
              <>
                {' '}
                <a href="#/innstillinger">{t('nyheter.om.velgFylke')}</a>
              </>
            )}
          </p>
          <p class="dempet">{t('nyheter.om.ingenBilder')}</p>
        </div>
      </Seksjon>
      <Seksjon id="nyh-kildene" tittel={t('nyheter.kildene.tittel', { antall: kilder.length })} innhold={kilder.map((k) => k.navn[malform]).join(', ')} apen={bred}>
        <ul class="nyh-kildeliste">
          {kilder.map((k) => {
            const s = status[k.id];
            return (
              <li key={k.id}>
                <span class="nyh-kildenavn">{k.navn[malform]}</span> <span class="dempet">· {t(`nyheter.typer.${k.type}`)}</span>
                {k.merknad && <span class="liten dempet"> · {k.merknad[malform]}</span>}
                {s && s.status !== 'ok' && (
                  <span class="nyh-kildefeil liten">
                    <Ikon navn="info" class="ikon-liten" />
                    {t(`nyheter.kildene.${s.status}`, { dato: s.feilSiden ? formaterDato(s.feilSiden, malform) : '' })}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Seksjon>
      <div class="nyh-ks">
        <h2 class="liten-overskrift">{t('nyheter.ks.tittel')}</h2>
        <p>{t('nyheter.ks.tekst')}</p>
        <a class="ekstern-lenke" href={KS_URL} target="_blank" rel="noopener noreferrer">
          {t('nyheter.ks.lenke')}
          <Ikon navn="ekstern" class="ikon-liten" />
        </a>
      </div>
    </>
  );

  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('nyheter.tittel')} favoritt={oversiktsid('nyheter')} />
      <p class="ingress">{t('nyheter.innledning')}</p>
      <ToKolonner hoved={hoved} side={side} />
    </div>
  );
}
