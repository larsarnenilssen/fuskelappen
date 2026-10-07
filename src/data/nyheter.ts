// Nyhetene (data/nyheter/nyheter.json), hentet hver dag av scripts/hent-nyheter.ts (fase 7b). Filen ligger ved siden av
// appen og hentes når nyhetene vises, ikke med appen, så en ny dag med nyheter ikke gir en ny versjon av appen. Uten
// nett gir hurtigbufferen forrige liste. Se src/data/README.md.
import { nyheterSkjema, type Nyheter } from '../modules/nyheter/skjema.ts';
import { enGang } from './enGang.ts';

export const lastNyheter = enGang(async (): Promise<Nyheter> => {
  const svar = await fetch(`${import.meta.env.BASE_URL}data/nyheter/nyheter.json`, { cache: 'no-cache' });
  if (!svar.ok) throw new Error(`Nyhetene svarte ${svar.status}`);
  return nyheterSkjema.parse(await svar.json());
});
