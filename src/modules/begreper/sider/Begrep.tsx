import { useEffect, useState } from 'preact/hooks';
import { useKildestatus } from '../../../app/kildestatus.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { Nivamerke, Statusmerke } from '../../../components/Merker.tsx';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';
import { beregnStatus, velgSynlige } from '../../../core/innhold/status.ts';
import type { SideProps } from '../../typer.ts';
import { hentBegreper } from '../innhold.ts';
import { Kodeliste } from '../Kodeliste.tsx';

export default function Begrep({ parametre, sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const kildestatus = useKildestatus();
  const [alle, settAlle] = useState<Innholdselement[] | null>(null);

  useEffect(() => {
    void hentBegreper().then(settAlle);
  }, []);

  if (alle === null) return <p class="side dempet">{t('app.lasterInn')}</p>;
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const begrep = velgSynlige(alle, sted).find((b) => b.id === parametre.id);
  if (!begrep) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('begreper.ikkeFunnet')}</h1>
        <p>
          <a href="#/begreper">{t('begreper.tittel')}</a>
        </p>
      </div>
    );
  }
  const statuser = kildestatus.tilstand === 'ok' ? kildestatus.data.kilder : {};
  const status = beregnStatus(begrep, statuser, new Date().toISOString().slice(0, 10));
  const relaterte = begrep.relatert
    .map((id) => alle.find((b) => b.id === id))
    .filter((b): b is Innholdselement => b !== undefined);

  return (
    <article class="side">
      {/* Begrepene åpnes ofte via lenker fra andre moduler. Stien viser at brukeren er i begrepsbanken. */}
      <Brodsmuler ledd={[{ tekst: t('begreper.tittel'), href: '#/begreper' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{begrep.tittel[malform]}</h1>
        <FavorittKnapp id={`begreper:${begrep.id}`} navn={begrep.tittel[malform]} />
      </div>
      <div class="merker">
        <Nivamerke niva={begrep.gyldighet.niva} />
        <Statusmerke status={status} kontrollert={begrep.kontrollert} />
      </div>
      <div class="brodtekst" dangerouslySetInnerHTML={{ __html: begrep.tekst[malform] }} />
      {begrep.kildetekst && (
        <blockquote class="kildetekst" lang={begrep.kildetekst.spraak}>
          <p class="liten dempet">{t('begreper.kildetekst', { spraak: t(`spraak.${begrep.kildetekst.spraak}`) })}</p>
          <p>{begrep.kildetekst.tekst}</p>
        </blockquote>
      )}
      {begrep.kodeliste && <Kodeliste liste={begrep.kodeliste} sti={`/begreper/${begrep.id}`} sporring={sporring} />}
      <Kildeliste kilder={begrep.kilder} />
      {relaterte.length > 0 && (
        <section>
          <h2 class="liten-overskrift">{t('begreper.relatert')}</h2>
          <ul>
            {relaterte.map((r) => (
              <li key={r.id}>
                <a href={`#/begreper/${r.id}`}>{r.tittel[malform]}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
