import { kategorier } from '../../modules/kategorier.ts';
import { modulerIKategori } from '../../modules/register.ts';
import type { SideProps } from '../../modules/typer.ts';
import { Innganger } from '../Innganger.tsx';
import { useTekst } from '../tilstand.ts';

export default function Kategori({ parametre }: SideProps) {
  const { t } = useTekst();
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
      <Innganger moduler={modulerIKategori(kategori.id)} />
    </div>
  );
}
