import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Veiviser } from '../../../components/Veiviser.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import type { SideProps } from '../../typer.ts';
import { hentInnhold, veiviserRute, type Eksamensinnhold } from '../innhold.ts';

export default function Veiviserside({ parametre, sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Eksamensinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  if (innhold === null) return <p class="side dempet">{t('app.lasterInn')}</p>;
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const veiviser = velgSynlige(innhold.veivisere, sted).find((v) => v.id === parametre.veiviser);
  if (!veiviser) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('eksamen.ikkeFunnet')}</h1>
        <p>
          <a href="#/eksamen">{t('eksamen.tittel')}</a>
        </p>
      </div>
    );
  }
  const steg = velgSynlige(
    innhold.steg.filter((s) => s.veiviser === veiviser.id),
    sted,
  );
  return (
    <div class="side" data-veiviserfarge={veiviser.farge}>
      <Brodsmuler ledd={[{ tekst: t('eksamen.tittel'), href: '#/eksamen' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{veiviser.tittel[malform]}</h1>
        <FavorittKnapp id={`eksamen:${veiviser.id}`} navn={veiviser.tittel[malform]} />
      </div>
      {/* Ingressen står bare på starten, så stegene kommer høyt opp på skjermen. */}
      {!sporring.get('steg') && <div class="ingress" dangerouslySetInnerHTML={{ __html: veiviser.tekst[malform] }} />}
      <Veiviser veiviser={veiviser} steg={steg} sti={veiviserRute(veiviser.id)} sporring={sporring} />
    </div>
  );
}
