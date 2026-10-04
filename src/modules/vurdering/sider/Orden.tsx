// Orden og oppførsel (fase 6, pakke 1): eget stoff, ikke blandet med vurderingen i fag (eier 04.10.2026). Kortene står
// i content/vurdering/orden-og-oppforsel.yaml. Fylkets regler (f.eks. skulereglane i Vestland) vises bare når fylket er
// valgt, merket med fylket.
import { useEffect, useState } from 'preact/hooks';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { type Forklaringselement, hentInnhold, medPrefiks } from '../innhold.ts';

export default function Orden() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const kort = innhold ? velgSynlige(medPrefiks(innhold, 'oo-'), sted) : [];
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('vurdering.tittel'), href: '#/vurdering' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('vurdering.orden.tittel')}</h1>
        <FavorittKnapp id="vurdering:orden-og-oppforsel" navn={t('vurdering.orden.tittel')} />
      </div>
      <p class="ingress">{t('vurdering.orden.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        kort.map((k) =>
          k.gyldighet.niva === 'nasjonal' ? (
            <Innholdskort key={k.id} element={k} />
          ) : (
            <div key={k.id} class="lokalkort">
              <p class="lokalkort-sted">{t('vurdering.orden.iFylket', { fylke: fylkesnavn(k.gyldighet.fylke) ?? k.gyldighet.fylke })}</p>
              <Innholdskort element={k} />
            </div>
          ),
        )
      )}
    </div>
  );
}
