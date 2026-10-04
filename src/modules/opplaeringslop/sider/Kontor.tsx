// Opplæringskontorene som er godkjent i et fylke, etter NOR (avgjørelse 053). NOR sier ikke hvilke lærefag kontorene
// har, så listen er per fylke, med søk i navn og kommune. Fylket står i adressen (#/opplaeringslop/opplaeringskontor?fylke=46).
// Uten fylke i adressen brukes fylket brukeren har valgt, og søket kan utvides til hele landet med én knapp (eier
// 03.10.2026). Hvert kontor lenker til nettsiden og til siden om kontoret på utdanning.no.
import { useEffect, useId, useMemo, useState } from 'preact/hooks';
import { erstattAdresse } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { fylker, fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { kontorfavoritt } from '../favoritter.ts';
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
  // Ett kontor, f.eks. fra en favoritt (avgjørelse 058).
  const [kontor, settKontor] = useState(sporring.get('kontor') ?? '');
  const [antall, settAntall] = useState(PER_SIDE);
  useEffect(() => {
    lastOpplaeringskontor().then(settData, () => settData('feil'));
  }, []);
  const oppdater = (f: string, q: string, valgt = '') => {
    settFylke(f);
    settSok(q);
    settKontor(valgt);
    settAntall(PER_SIDE);
    erstattAdresse('/opplaeringslop/opplaeringskontor', Object.fromEntries(Object.entries({ fylke: f || 'alle', q, kontor: valgt }).filter(([, v]) => v)));
  };
  const { treff, iLandet } = useMemo(() => {
    if (typeof data === 'string') return { treff: [], iLandet: 0 };
    const ord = normaliser(sok).split(/\s+/).filter(Boolean);
    const sokt = data.kontor.filter((k) => (!kontor || k.orgnr === kontor) && ord.every((o) => normaliser(`${k.navn} ${k.kommune}`).includes(o)));
    return { treff: sokt.filter((k) => !fylke || k.godkjentI.includes(fylke)), iLandet: sokt.length };
  }, [data, fylke, sok, kontor]);
  return (
    <div class="side kontorregister">
      <Brodsmuler ledd={[{ tekst: t('opplaeringslop.tittel'), href: '#/opplaeringslop' }]} />
      <Sidetopp tittel={t('opplaeringslop.kontor.tittel')} favoritt="opplaeringslop:opplaeringskontor" />
      <p class="dempet">
        <Begrepstekst tekst={t('opplaeringslop.kontor.innledning')} />
      </p>
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
              <input id={sokId} type="search" autoComplete="off" enterKeyHint="search" value={sok} onInput={(e) => oppdater(fylke, e.currentTarget.value, kontor)} />
            </div>
          </div>
          <div class="felt">
            <label for={fylkeId}>{t('opplaeringslop.skoler.fylke')}</label>
            <select id={fylkeId} value={fylke} onChange={(e) => oppdater(e.currentTarget.value, sok, kontor)}>
              <option value="">{t('opplaeringslop.skoler.alleFylker')}</option>
              {fylker.map((f) => (
                <option key={f.nummer} value={f.nummer}>
                  {f.navn}
                </option>
              ))}
            </select>
          </div>
          <p class="liten dempet">
            <Begrepstekst tekst={t('opplaeringslop.kontor.hjelp')} />
          </p>
          {kontor && (
            <p class="skolefilter-tilbud">
              <span class="merke merke-skole">{data.kontor.find((k) => k.orgnr === kontor)?.navn ?? kontor}</span>{' '}
              <button type="button" class="lenkeknapp liten" onClick={() => oppdater(fylke, sok)}>
                {t('opplaeringslop.skoler.fjernTilbud')}
              </button>
            </p>
          )}
          <p role="status" class="dempet liten kontor-status">
            <span>
              {treff.length === 0
                ? t('opplaeringslop.kontor.ingen')
                : fylke
                  ? t('opplaeringslop.kontor.iFylket', { antall: formaterTall(treff.length), fylke: fylkesnavn(fylke) ?? fylke })
                  : t('opplaeringslop.kontor.antall', { antall: formaterTall(treff.length) })}
            </span>
            {fylke && iLandet > treff.length && (
              <button type="button" class="lenkeknapp" onClick={() => oppdater('', sok)}>
                {t('opplaeringslop.kontor.heleLandet', { antall: formaterTall(iLandet) })}
              </button>
            )}
          </p>
          <ul class="liste kontorliste">
            {treff.slice(0, antall).map((k) => (
              <li key={k.orgnr} class="kontor" data-kontor={k.orgnr}>
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{k.navn}</span>
                  <span class="listelenke-under">
                    {[k.kommune, k.laerlinger !== null ? t('opplaeringslop.kontor.laerlinger', { antall: formaterTall(k.laerlinger) }) : null].filter(Boolean).join(' · ')}
                    <br />
                    {/* Kommunen er der kontoret holder til. Fylkene det er godkjent i, kan være andre (eier 03.10.2026). */}
                    {k.godkjentI.length === 1
                      ? t('opplaeringslop.kontor.godkjentFylke', { fylke: fylkesnavn(k.godkjentI[0] ?? null) ?? k.godkjentI[0] ?? '' })
                      : t('opplaeringslop.kontor.godkjentFylker', { antall: formaterTall(k.godkjentI.length) })}
                  </span>
                </span>
                {/* Ved navnet på mobil, til høyre for lenkene på større skjerm (avgjørelse 058). */}
                <FavorittKnapp id={kontorfavoritt(k.orgnr)} navn={k.navn} liten />
                <span class="kontor-lenker">
                  {k.nettside && (
                    <a class="ekstern-lenke liten" href={k.nettside} target="_blank" rel="noopener noreferrer">
                      {t('opplaeringslop.kontor.nettside')}
                      <Ikon navn="ekstern" class="ikon-liten" />
                    </a>
                  )}
                  <a class="ekstern-lenke liten" href={`https://utdanning.no/finnlarebedrift/bedrift/${k.orgnr}/`} target="_blank" rel="noopener noreferrer">
                    {t('opplaeringslop.kontor.utdanning')}
                    <Ikon navn="ekstern" class="ikon-liten" />
                  </a>
                </span>
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
