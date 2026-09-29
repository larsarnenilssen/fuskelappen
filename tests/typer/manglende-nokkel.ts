// Typetest: en manglende nynorsk nøkkel skal gi typefeil, og dermed byggefeil.
// Kjøres av «npm run typecheck». Virker ikke regelen, blir @ts-expect-error ubrukt og typesjekken feiler.
import type { Tekster } from '../../src/strings/typer.ts';
import { nn } from '../../src/strings/nn.ts';

// @ts-expect-error – «nav.hjem» mangler, så objektet er ikke gyldige Tekster.
export const manglerNokkel: Tekster = { ...nn, nav: { sok: 'Søk', favoritter: 'Favorittar', innstillinger: 'Innstillingar' } };

export const gyldig: Tekster = nn;
