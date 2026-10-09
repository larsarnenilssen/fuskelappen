import { useTekst } from '../../../../src/app/tilstand.ts';
import { FavorittKnapp } from '../../../../src/components/FavorittKnapp.tsx';
import type { SideProps } from '../../../../src/modules/typer.ts';

export default function Side({ sporring }: SideProps) {
  const { malform } = useTekst();
  // Med ?feil=1 kaster siden en feil, så testene kan vise feilgrensen i skallet (avgjørelse 097).
  if (sporring.get('feil') === '1') throw new Error('Testfeil fra testmodulen');
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
