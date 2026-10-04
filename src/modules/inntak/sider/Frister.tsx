// Søknad og frister gjennom året (fase 5, pakke 2, avgjørelse 046). Tidslinjen er felles med Vurdering
// (components/Tidslinje.tsx). Filteret står i adressen (`?vis=voksne`), så en lenke kan peke rett til fristene for en
// gruppe.
import { useEffect, useState } from 'preact/hooks';
import { lenke } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Tidslinje } from '../../../components/Tidslinje.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { iDag } from '../../../data/skolear.ts';
import type { SideProps } from '../../typer.ts';
import { fristerRute, hentInnhold, type Inntaksinnhold } from '../innhold.ts';
import { FILTRE, gjelder, lesFilter, MANEDER, sorter, type Filter } from '../tidslinje.ts';
import { Lokalmerknad } from './Lokalmerknad.tsx';

export default function Frister({ sporring }: SideProps) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Inntaksinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const filter = lesFilter(sporring.get('vis'));
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const frister = innhold ? sorter(velgSynlige(innhold.frister, sted).filter((f) => gjelder(f, filter))) : [];

  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('inntak.tittel'), href: '#/inntak' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('inntak.frister.tittel')}</h1>
        <FavorittKnapp id="inntak:frister" navn={t('inntak.frister.tittel')} />
      </div>
      <p class="ingress"><Begrepstekst tekst={t('inntak.frister.innledning')} /></p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <Lokalmerknad innhold={innhold} />
          <Tidslinje
            frister={frister}
            maneder={MANEDER}
            naa={Number(iDag().slice(5, 7))}
            idPrefiks="frister"
            filtre={FILTRE.map((f) => ({ id: f, tekst: t(`inntak.frister.filtre.${f}`), href: lenke(fristerRute, f === 'alle' ? undefined : { vis: f }) }))}
            filter={filter}
            gruppenavn={(g) => t(`inntak.frister.grupper.${g as Exclude<Filter, 'alle'>}`)}
            tekster={{
              filter: t('inntak.frister.filter'),
              aaret: t('inntak.frister.aaret'),
              ingen: t('inntak.frister.ingen'),
              enFrist: t('inntak.frister.enFrist'),
              flereFrister: t('inntak.frister.flereFrister'),
              nasjonal: t('inntak.frister.nasjonal'),
              tomt: t('inntak.frister.tomt'),
              heleAret: t('inntak.frister.heleAret'),
              naa: t('inntak.frister.naa'),
            }}
          />
        </>
      )}
    </div>
  );
}
