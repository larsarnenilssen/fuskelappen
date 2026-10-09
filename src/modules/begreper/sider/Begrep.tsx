import { useEffect, useState } from 'preact/hooks';
import { useKildestatus } from '../../../app/kildestatus.ts';
import { usePrivatskole, useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Nivamerke, Statusmerke } from '../../../components/Merker.tsx';
import type { Innholdselement } from '../../../core/innhold/skjema.ts';
import { beregnStatus, velgSynlige } from '../../../core/innhold/status.ts';
import type { SideProps } from '../../typer.ts';
import { hentBegreper } from '../innhold.ts';
import { Kodegrupper } from '../Kodegrupper.tsx';
import { Kodeliste } from '../Kodeliste.tsx';
import { UtenforBoks } from '../../statistikk/ssb.tsx';
import { Kortfot } from '../../../components/Kortfot.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { medPrivatskolekilder, Privatskolemerknad } from '../../../components/Privatskolemerknad.tsx';

export default function Begrep({ parametre, sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const privat = usePrivatskole();
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
  // Relaterte begreper på brukerens nivå. Et begrep som bare gjelder et annet fylke, vises ikke.
  const synlige = velgSynlige(alle, sted);
  const relaterte = begrep.relatert
    .map((id) => synlige.find((b) => b.id === id))
    .filter((b): b is Innholdselement => b !== undefined);

  return (
    <article class="side">
      {/* Begrepene åpnes ofte via lenker fra andre moduler. Stien viser at brukeren er i begrepsbanken. */}
      <Brodsmuler ledd={[{ tekst: t('begreper.tittel'), href: '#/begreper' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{begrep.tittel[malform]}</h1>
        <FavorittKnapp id={`begreper:${begrep.id}`} navn={begrep.tittel[malform]} />
      </div>
      {/* Begrepet står i et hvitt kort med regelverket og kildene som lukkede rader nederst, som de andre kortene, og «Se
          også» som rader med pil (fase 8b, eier 08.10.2026). */}
      <div class="kort begrep-kort">
        <div class="merker">
          <Nivamerke niva={begrep.gyldighet.niva} />
          <Statusmerke status={status} kontrollert={begrep.kontrollert} />
        </div>
        <div class="brodtekst" dangerouslySetInnerHTML={{ __html: begrep.tekst[malform] }} />
        {begrep.merknad && <p class="merknad merknad-advarsel begrep-merknad">{begrep.merknad[malform]}</p>}
        {/* Det som er ulikt for privatskoler, når brukeren har valgt «Privatskole», som i kortene (avgjørelse 075). */}
        <Privatskolemerknad element={begrep} />
        {begrep.kildetekst && (
          <blockquote class="kildetekst" lang={begrep.kildetekst.spraak}>
            <p class="liten dempet">{t('begreper.kildetekst', { spraak: t(`spraak.${begrep.kildetekst.spraak}`) })}</p>
            <p>{begrep.kildetekst.tekst}</p>
          </blockquote>
        )}
        {begrep.kodeliste && <Kodeliste liste={begrep.kodeliste} sti={`/begreper/${begrep.id}`} sporring={sporring} />}
        {'kodegrupper' in begrep && begrep.kodegrupper && <Kodegrupper grupper={begrep.kodegrupper} sti={`/begreper/${begrep.id}`} sporring={sporring} />}
        <Kortfot kilder={medPrivatskolekilder(begrep.kilder, begrep, privat)} nokkel={`begrep-${begrep.id}`} />
      </div>
      {relaterte.length > 0 && (
        <section class="lop-del">
          <h2 class="liten-overskrift">{t('begreper.relatert')}</h2>
          <ul class="liste">
            {relaterte.map((r) => (
              <li key={r.id}>
                <a class="listelenke" href={`#/begreper/${r.id}`}>
                  <span class="listelenke-tekst">
                    <span class="listelenke-tittel">{r.tittel[malform]}</span>
                  </span>
                  <Ikon navn="hoyre" class="ikon-liten" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {/* Unge utenfor arbeid og utdanning fra SSB, nederst (avgjørelse 090 og 091). */}
      {begrep.id === 'oppfolgingstjenesten' && <UtenforBoks fylke={innstillinger.fylke} />}
    </article>
  );
}
