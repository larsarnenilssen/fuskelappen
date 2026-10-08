// Fakta til dagens jukselapp fra Arbeidstid (avgjørelse 086): forklaringene i kalkulatorene. «Bruk av tiden» står i
// Arbeidsplan, og metoden står i kalkulatoren den hører til. Lastes bare når modulen har dagen.
import { begge } from '../../core/i18n/tekst.ts';
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { faktaFraElementer } from '../../core/jukselapp/fakta.ts';
import { lastFiler } from '../../core/jukselapp/innhold.ts';
import type { Faktum } from '../typer.ts';
import { kalkulatorer } from './kalkulatorer.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/arbeidstid/*.yaml', { import: 'default' });

/** Kalkulatoren elementet står i: «metode-vikar» i Vikar, de andre i Arbeidsplan. */
const kalkulator = (e: Innholdselement) => kalkulatorer.find((k) => (e.id.startsWith('metode-') ? `metode-${k.id}` === e.id : k.id === 'arbeidsplan'));

export async function fakta(): Promise<Faktum[]> {
  const elementer = (await lastFiler(filer)).flatMap((f) => f.elementer);
  return faktaFraElementer(elementer, {
    modul: 'arbeidstid',
    under: 'moduler.arbeidstid.navn',
    rute: (e) => kalkulator(e)?.rute ?? null,
    lenke: (e) => begge(kalkulator(e)?.tittel ?? 'moduler.arbeidstid.navn'),
  });
}
