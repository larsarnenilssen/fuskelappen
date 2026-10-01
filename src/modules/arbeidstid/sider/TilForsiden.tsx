// Mellomsiden for arbeidstid er tatt bort (avgjørelse 030). Lenker og bokmerker til #/arbeidstid sendes til
// forsiden, der kalkulatorene står, uten en ny oppføring i historikken.
import { useEffect } from 'preact/hooks';
import { lenke } from '../../../app/ruter.ts';

export default function TilForsiden() {
  useEffect(() => {
    location.replace(lenke('/'));
  }, []);
  return null;
}
