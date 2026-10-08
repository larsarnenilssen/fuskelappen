// Oversikten i Skolemiljø (fase 7): «Retten og resultatene» øverst (kapittel 12 og Elevundersøkelsen, eier 06.10.2026),
// veiviseren for aktivitetsplikten og skolereglene.
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { veiviseroverskrift, Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { oversiktsid } from '../../favoritter.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { hentInnhold, type Skolemiljoinnhold, UNDERSIDER, veiviserRute } from '../innhold.ts';

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Skolemiljoinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const veivisere = innhold ? velgSynlige(innhold.veivisere, sted) : [];
  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('skolemiljo.tittel')} favoritt={oversiktsid('skolemiljo')} />
      <p class="ingress">
        <Begrepstekst tekst={t('skolemiljo.innledning')} />
      </p>
      {/* To kolonner på skrivebord (fase 8b, docs/DESIGN.md): retten og skolereglene til venstre, veiviseren til høyre
          (eier 08.10.2026). */}
      <ToKolonner
        hoved={
          <>
            {/* Retten og pliktene øverst (eier 06.10.2026): kapittel 12. Elevundersøkelsen er egen modul (avgjørelse 087). */}
            <section class="lop-del">
              <h2 class="liten-overskrift">{t('skolemiljo.rettenOgResultatene')}</h2>
              <ul class="vu-videre">
                <li>
                  <Inngang {...UNDERSIDER.kapittel12} tittel={t('skolemiljo.kapittel12.kort')} tekst={t('skolemiljo.kapittel12.beskrivelse')} />
                </li>
              </ul>
            </section>
            <section class="lop-del">
              <h2 class="liten-overskrift">{t('skolemiljo.oppslag')}</h2>
              <ul class="vu-videre">
                <li>
                  <Inngang {...UNDERSIDER.skoleregler} tittel={t('skolemiljo.skoleregler.kort')} tekst={t('skolemiljo.skoleregler.beskrivelse')} />
                </li>
              </ul>
            </section>
          </>
        }
        side={
          <section class="lop-del">
            <h2 class="liten-overskrift">{t(veiviseroverskrift(veivisere.length))}</h2>
            {innhold === null ? (
              <p class="dempet">{t('app.lasterInn')}</p>
            ) : (
              <Veiviserinnganger veivisere={veivisere} rute={veiviserRute} />
            )}
          </section>
        }
      />
    </div>
  );
}
