import { useTekst } from '../../../../src/app/tilstand.ts';
import { FavorittKnapp } from '../../../../src/components/FavorittKnapp.tsx';

export default function Side() {
  const { malform } = useTekst();
  const tittel = malform === 'nn' ? 'Testmodul for skulemiljø' : 'Testmodul for skolemiljø';
  return (
    <div class="side">
      <div class="tittelrad">
        <h1 tabIndex={-1}>{tittel}</h1>
        <FavorittKnapp id="testmodul:funksjon" navn="Testfunksjon" />
      </div>
      <p>{malform === 'nn' ? 'Denne sida finst berre i testane.' : 'Denne siden finnes bare i testene.'}</p>
    </div>
  );
}
