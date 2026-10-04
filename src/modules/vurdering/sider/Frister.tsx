// Eksamen og klage gjennom året (fase 6, pakke 3, avgjørelse 046 og 059): datoene fra august til juli på den felles
// tidslinjen, med filter for elever, privatister og lærlinger. Datoene fra Udir og fylkene står i
// data/eksamen/datoer.json. Fylkets egne datoer vises bare når fylket er valgt og datoene er hentet.
import { useEffect, useState } from 'preact/hooks';
import { lenke } from '../../../app/ruter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Tidslinje } from '../../../components/Tidslinje.tsx';
import { formaterDato } from '../../../core/i18n/tekst.ts';
import type { Frist } from '../../../core/innhold/skjema.ts';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { gjelder, sorter } from '../../../core/tidslinje.ts';
import { lastEksamensdatoer } from '../../../data/eksamen.ts';
import { iDag, skolearFor } from '../../../data/skolear.ts';
import type { SideProps } from '../../typer.ts';
import { FILTRE, lesFilter, MANEDER_SKOLEAR, medEksamensdatoer } from '../eksamen/datoer.ts';
import type { Eksamensdatoer } from '../eksamen/skjema.ts';
import { EKSAMENSPLAN, fristerRute, hentInnhold } from '../innhold.ts';

export default function Frister({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [frister, settFrister] = useState<Frist[] | null>(null);
  const [data, settData] = useState<Eksamensdatoer | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settFrister(i.frister));
    // Uten datoene vises fristene med måneden.
    lastEksamensdatoer().then(settData, () => settData(null));
  }, []);
  const filter = lesFilter(sporring.get('vis'));
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const idag = iDag();
  const skolear = Number(skolearFor(idag).slice(0, 4));
  const synlige = frister ? medEksamensdatoer(velgSynlige(frister, sted), data, skolear, innstillinger.fylke) : [];
  const liste = sorter(
    synlige.filter((f) => gjelder(f, filter)),
    MANEDER_SKOLEAR,
  );

  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('vurdering.tittel'), href: '#/vurdering' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('vurdering.frister.tittel')}</h1>
        <FavorittKnapp id="vurdering:frister" navn={t('vurdering.frister.tittel')} />
      </div>
      <p class="ingress">
        <Begrepstekst tekst={t('vurdering.frister.innledning')} />
      </p>
      {frister === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <Tidslinje
            frister={liste}
            maneder={MANEDER_SKOLEAR}
            naa={Number(idag.slice(5, 7))}
            idPrefiks="vu-frister"
            filtre={FILTRE.map((f) => ({ id: f, tekst: t(`vurdering.frister.filtre.${f}`), href: lenke(fristerRute, f === 'alle' ? undefined : { vis: f }) }))}
            filter={filter}
            gruppenavn={(g) => t(`vurdering.frister.grupper.${g as Exclude<typeof filter, 'alle'>}`)}
            tekster={{
              filter: t('vurdering.frister.filter'),
              aaret: t('vurdering.frister.aaret'),
              ingen: t('vurdering.frister.ingen'),
              enFrist: t('vurdering.frister.enFrist'),
              flereFrister: t('vurdering.frister.flereFrister'),
              nasjonal: t('vurdering.frister.nasjonal'),
              tomt: t('vurdering.frister.tomt'),
              heleAret: t('vurdering.frister.heleAret'),
              naa: t('vurdering.frister.naa'),
            }}
          />
          <p class="liten dempet vu-frister-kilde">
            {t('vurdering.frister.kilde')} {data && t('vurdering.frister.hentet', { dato: formaterDato(data.hentet, malform) })}{' '}
            <a class="ekstern-lenke" href={EKSAMENSPLAN} target="_blank" rel="noopener noreferrer">
              {t('vurdering.frister.eksamensplan')}
              <Ikon navn="ekstern" class="ikon-liten" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
