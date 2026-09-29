import { Ikon } from '../../components/Ikon.tsx';
import { visTekst } from '../../core/i18n/tekst.ts';
import { kategorier } from '../../modules/kategorier.ts';
import { modulerIKategori } from '../../modules/register.ts';
import type { SideProps } from '../../modules/typer.ts';
import { useTekst } from '../tilstand.ts';

export default function Kategori({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const kategori = kategorier.find((k) => k.id === parametre.id);
  if (!kategori) {
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('ikkeFunnet.tittel')}</h1>
        <p>{t('ikkeFunnet.tekst')}</p>
      </div>
    );
  }
  const navn = t(kategori.navn);
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('kategorier.kategoriside', { kategori: navn.toLowerCase() })}</h1>
      <ul class="liste">
        {modulerIKategori(kategori.id).map((m) => (
          <li key={m.id}>
            <a class="listelenke" href={`#${m.ruter[0]?.sti ?? '/'}`}>
              <Ikon navn={m.ikon} />
              <span class="listelenke-tekst">
                <span class="listelenke-tittel">{visTekst(m.navn, malform)}</span>
                {m.beskrivelse && <span class="listelenke-under">{visTekst(m.beskrivelse, malform)}</span>}
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
