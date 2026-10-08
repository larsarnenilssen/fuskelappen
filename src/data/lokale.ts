// De godkjente lokale reglene (data/lokale/regler.json, fase 9, avgjørelse 093). Filen lages fra lokale/regler.yaml
// når appen bygges, og publiseres også uten ny versjon. Den hentes første gang en side eller kalkulator trenger den.
// Uten nett gir hurtigbufferen forrige fil. Feiler hentingen, gjelder de nasjonale verdiene og brukerens egne regler.
import { publisertSkjema, type PublisertRegel } from '../core/lokale/skjema.ts';
import { enGang } from './enGang.ts';

export const lastLokaleRegler = enGang(async (): Promise<PublisertRegel[]> => {
  const svar = await fetch(`${import.meta.env.BASE_URL}data/lokale/regler.json`, { cache: 'no-cache' });
  if (!svar.ok) throw new Error(`De lokale reglene svarte ${svar.status}`);
  return publisertSkjema.parse(await svar.json()).regler;
});
