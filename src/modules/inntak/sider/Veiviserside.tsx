import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Veiviser } from '../../../components/Veiviser.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import type { SideProps } from '../../typer.ts';
import { hentInnhold, veiviserRute, type Inntaksinnhold } from '../innhold.ts';
import { Lokalmerknad } from './Lokalmerknad.tsx';

export default function Veiviserside({ parametre, sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Inntaksinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  if (innhold === null) return <p class="side dempet">{t('app.lasterInn')}</p>;
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const veiviser = velgSynlige(innhold.veivisere, sted).find((v) => v.id === parametre.veiviser);
  if (!veiviser) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('inntak.ikkeFunnet')}</h1>
        <p>
          <a href="#/inntak">{t('inntak.tittel')}</a>
        </p>
      </div>
    );
  }
  const steg = velgSynlige(
    innhold.steg.filter((s) => s.veiviser === veiviser.id),
    sted,
  );
  const start = !sporring.get('steg');
  return (
    <div class="side" data-veiviserfarge={veiviser.farge}>
      <Brodsmuler ledd={[{ tekst: t('inntak.tittel'), href: '#/inntak' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{veiviser.tittel[malform]}</h1>
        <FavorittKnapp id={`inntak:${veiviser.id}`} navn={veiviser.tittel[malform]} />
      </div>
      {/* Ingressen og merknaden om lokale regler står bare på starten, så stegene kommer høyt opp på skjermen. */}
      {start && <div class="ingress" dangerouslySetInnerHTML={{ __html: veiviser.tekst[malform] }} />}
      {start && <Lokalmerknad innhold={innhold} />}
      <Veiviser veiviser={veiviser} steg={steg} sti={veiviserRute(veiviser.id)} sporring={sporring} />
    </div>
  );
}
