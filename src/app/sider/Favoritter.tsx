// Favorittsiden er tatt bort (avgjørelse 056). Favorittene står på forsiden, så lenker og bokmerker til
// #/favoritter sendes dit, uten en ny oppføring i historikken.
import { useEffect } from 'preact/hooks';
import { lenke } from '../ruter.ts';

export default function Favoritter() {
  useEffect(() => {
    location.replace(lenke('/'));
  }, []);
  return null;
}
