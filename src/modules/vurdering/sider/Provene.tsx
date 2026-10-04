// Siden «Fag- og svenneprøven og de andre prøvene» (fase 6, pakke 3, eier 04.10.2026): prøvene som sluttvurdering for
// lærlinger og kandidater. Kortene står i content/vurdering/proevene.yaml. Veiene fram til prøven kommer i
// Opplæringstilbud («Fag- og svennebrev»), og da får siden «Veiene hit».
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Tabell } from '../../../components/Tabell.tsx';
import { type Forklaringselement, hentInnhold, klageRute, UDIR_PROVER } from '../innhold.ts';
import { Inngang } from './Inngang.tsx';

const DELER = [
  { tittel: 'vurdering.provene.forProven', kort: ['pr-krav', 'pr-oppmelding'] },
  { tittel: 'vurdering.provene.proven', kort: ['pr-provenemnda', 'pr-vurdering', 'pr-tilrettelegging'] },
  { tittel: 'vurdering.provene.etterpa', kort: ['pr-ny-utsatt', 'pr-bortvisning'] },
] as const;

export default function Provene() {
  const { t } = useTekst();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
  }, []);
  const finn = (id: string) => innhold?.find((e) => e.id === id);
  const hva = finn('pr-hva');
  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('vurdering.tittel'), href: '#/vurdering' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('vurdering.provene.tittel')}</h1>
        <FavorittKnapp id="vurdering:fag-og-svenneproven" navn={t('vurdering.provene.tittel')} />
      </div>
      <p class="ingress">{t('vurdering.provene.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          {hva && (
            <section>
              <h2 class="liten-overskrift">{t('vurdering.provene.prover')}</h2>
              {hva.tabell && <Tabell tabell={hva.tabell} tittel={hva.tittel} />}
              <Innholdskort element={hva} />
            </section>
          )}
          {DELER.map((d) => (
            <section key={d.tittel}>
              <h2 class="liten-overskrift">{t(d.tittel)}</h2>
              {d.kort.map((id) => {
                const e = finn(id);
                return e ? <Innholdskort key={id} element={e} /> : null;
              })}
            </section>
          ))}
          <section>
            <h2 class="liten-overskrift">{t('vurdering.provene.videre')}</h2>
            <ul class="vu-videre">
              <li>
                <Inngang rute={`${klageRute}?steg=kl-prove&svar=prove`} ikon="veiviser" tittel={t('vurdering.klage.kort')} tekst={t('vurdering.provene.klageTekst')} />
              </li>
              <li>
                <Inngang rute="/opplaeringslop/opplaeringskontor" ikon="kontor" tittel={t('vurdering.provene.opplaeringskontor')} tekst={t('vurdering.provene.iOpplaeringstilbud')} />
              </li>
            </ul>
            <p>
              <a class="ekstern-lenke" href={UDIR_PROVER} target="_blank" rel="noopener noreferrer">
                {t('vurdering.provene.udir')}
                <Ikon navn="ekstern" class="ikon-liten" />
              </a>
            </p>
          </section>
        </>
      )}
    </div>
  );
}
