// Opplæringskontorene som er godkjent i et fylke, etter NOR (avgjørelse 053). NOR sier ikke hvilke lærefag kontorene
// har, så listen er per fylke, med søk i navn og kommune. Fylket står i adressen (#/opplaeringslop/opplaeringskontor?fylke=46).
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { fylker, fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterDato, formaterTall } from '../../../core/i18n/tekst.ts';
import { lastOpplaeringskontor } from '../../../data/udir.ts';
import type { SideProps } from '../../typer.ts';
import type { Opplaeringskontorer } from '../nor/skjema.ts';
import { Brodsmuler } from './felles.tsx';

const PER_SIDE = 40;
const normaliser = (s: string) => s.toLocaleLowerCase('nb').normalize('NFKD').replace(/[̀-ͯ]/g, '');

export default function Kontor({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [data, settData] = useState<Opplaeringskontorer | 'laster' | 'feil'>('laster');
  const sokId = useId();
  const fylkeId = useId();
  const [fylke, settFylke] = useState(() => {
    const f = sporring.get('fylke');
    return f === 'alle' ? '' : (f ?? (fylkesnavn(innstillinger.fylke) ? (innstillinger.fylke ?? '') : ''));
  });
  const [sok, settSok] = useState(sporring.get('q') ?? '');
  const [antall, settAntall] = useState(PER_SIDE);
  useEffect(() => {
    lastOpplaeringskontor().then(settData, () => settData('feil'));
  }, []);
  const oppdater = (f: string, q: string) => {
    settFylke(f);
    settSok(q);
    settAntall(PER_SIDE);
    erstattAdresse('/opplaeringslop/opplaeringskontor', Object.fromEntries(Object.entries({ fylke: f || 'alle', q }).filter(([, v]) => v)));
  };
  const treff = useMemo(() => {
    if (typeof data === 'string') return [];
    const ord = normaliser(sok).split(/\s+/).filter(Boolean);
    return data.kontor.filter((k) => (!fylke || k.godkjentI.includes(fylke)) && ord.every((o) => normaliser(`${k.navn} ${k.kommune}`).includes(o)));
  }, [data, fylke, sok]);
  return (
    <div class="side kontorregister">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <h1 tabIndex={-1}>{t('opplaeringslop.kontor.tittel')}</h1>
      <p class="dempet">{t('opplaeringslop.kontor.innledning')}</p>
      {data === 'laster' ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : data === 'feil' ? (
        <p role="alert">{t('opplaeringslop.lasterFeil')}</p>
      ) : (
        <>
          <div class="felt">
            <label for={sokId}>{t('opplaeringslop.kontor.sok')}</label>
            <div class="sokefelt">
              <Ikon navn="sok" class="sokefelt-ikon" />
              <input id={sokId} type="search" autoComplete="off" enterKeyHint="search" value={sok} onInput={(e) => oppdater(fylke, e.currentTarget.value)} />
            </div>
          </div>
          <div class="felt">
            <label for={fylkeId}>{t('opplaeringslop.skoler.fylke')}</label>
            <select id={fylkeId} value={fylke} onChange={(e) => oppdater(e.currentTarget.value, sok)}>
              <option value="">{t('opplaeringslop.skoler.alleFylker')}</option>
              {fylker.map((f) => (
                <option key={f.nummer} value={f.nummer}>
                  {f.navn}
                </option>
              ))}
            </select>
          </div>
          <p class="liten dempet">{t('opplaeringslop.kontor.hjelp')}</p>
          <p role="status" class="dempet liten">
            {treff.length === 0 ? t('opplaeringslop.kontor.ingen') : t('opplaeringslop.kontor.antall', { antall: formaterTall(treff.length) })}
          </p>
          <ul class="liste kontorliste">
            {treff.slice(0, antall).map((k) => (
              <li key={k.orgnr} class="kontor">
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{k.navn}</span>
                  <span class="listelenke-under">
                    {[k.kommune, k.laerlinger !== null ? t('opplaeringslop.kontor.laerlinger', { antall: formaterTall(k.laerlinger) }) : null].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {k.nettside && (
                  <a class="ekstern-lenke liten" href={k.nettside} target="_blank" rel="noopener noreferrer">
                    {t('opplaeringslop.kontor.nettside')}
                    <Ikon navn="ekstern" class="ikon-liten" />
                  </a>
                )}
              </li>
            ))}
          </ul>
          {treff.length > antall && (
            <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => settAntall(antall + PER_SIDE)}>
              {t('opplaeringslop.kontor.visFlere')}
            </button>
          )}
          <p class="dempet liten">{t('opplaeringslop.kontor.hentet', { dato: formaterDato(data.hentet, malform) })}</p>
        </>
      )}
      <Kildeliste kilder={[{ id: 'udir-nor' }]} />
    </div>
  );
}
