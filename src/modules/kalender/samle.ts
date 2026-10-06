// Alt kalenderen viser, samlet (avgjørelse 066): fristene fra modulene med eksamensdatoene, skoleruta i fylket,
// fylkets datoer for inntak og vedtatte endringer i regelverket. Brukes av kalendersiden og gruppen «Neste datoer» på
// forsiden.
import type { Malform } from '../../core/i18n/tekst.ts';
import type { Frist } from '../../core/innhold/skjema.ts';
import { velgSynlige, type Sted } from '../../core/innhold/status.ts';
import { lastInntaksdatoer, lastKommende, lastSkoleruter } from '../../data/kalender.ts';
import { lastEksamensdatoer } from '../../data/eksamen.ts';
import { lastOversikt } from '../lov/data.ts';
import type { Eksamensdatoer } from '../eksamen/eksamensdatoer/skjema.ts';
import { skolearIVindu, skolearVindu, utvid, type Kalenderoppforing, type Kalenderpost, type Vindu } from './beregning/kalender.ts';
import { fraFrist, fristposter } from './beregning/oppforinger.ts';
import { hentAlleFrister } from './data.ts';
import { inntakOppforinger, regelverkOppforinger, skoleruteOppforinger } from './datakilder.ts';
import type { Inntaksdatoer, KommendeEndringer, Skoleruter } from './datatyper.ts';

export interface Kalenderdata {
  frister: Frist[];
  eksamen: Eksamensdatoer | null;
  skolerute: Skoleruter | null;
  inntak: Inntaksdatoer | null;
  kommende: KommendeEndringer | null;
  /** Navnet på et dokument i Regelverk med liten forbokstav («opplæringslova»), eller null. */
  navn: (dokument: string, m: Malform) => string | null;
}

const ellerNull = <T>(p: Promise<T>): Promise<T | null> => p.catch(() => null);

/** Alle dataene. En datafil som ikke kan lastes, gir null, og resten vises likevel. */
export async function hentKalenderdata(): Promise<Kalenderdata> {
  const [frister, eksamen, skolerute, inntak, kommende, oversikt] = await Promise.all([
    hentAlleFrister(),
    ellerNull(lastEksamensdatoer()),
    ellerNull(lastSkoleruter()),
    ellerNull(lastInntaksdatoer()),
    ellerNull(lastKommende()),
    ellerNull(lastOversikt()),
  ]);
  const dokumenter = new Map((oversikt?.dokumenter ?? []).map((d) => [d.id, d]));
  const navn = (id: string, m: Malform) => {
    const d = dokumenter.get(id);
    if (!d) return null;
    const tittel = m === 'nn' && d.korttittelNn ? d.korttittelNn : d.korttittel;
    return tittel.charAt(0).toLowerCase() + tittel.slice(1);
  };
  return { frister, eksamen, skolerute, inntak, kommende, navn };
}

export interface Kalenderinnhold {
  /** Postene i vinduet, usortert og ufiltrert. */
  poster: Kalenderpost[];
  /** Frister som gjelder hele året (løpende). */
  heleAret: Kalenderoppforing[];
  /** Vedtatte endringer i regelverket uten dato. */
  udatert: Kalenderoppforing[];
}

/** Postene i vinduet fra alle kildene, for stedet brukeren har valgt. */
export function samle(d: Kalenderdata, sted: Sted, v: Vindu): Kalenderinnhold {
  const synlige = velgSynlige(d.frister, sted);
  const regelverk = regelverkOppforinger(d.kommende, d.navn);
  // Skoleruta og inntaksdatoene har dato. De foldes ut per skoleår, som fristene.
  const data = [...skoleruteOppforinger(d.skolerute, sted.fylke), ...inntakOppforinger(d.inntak, sted.fylke), ...regelverk.datert];
  const ekstra = skolearIVindu(v).flatMap((s) => {
    const sv = skolearVindu(s);
    const fra = v.fra > sv.fra ? v.fra : sv.fra;
    const til = v.til < sv.til ? v.til : sv.til;
    return fra <= til ? utvid(data.filter((o) => o.dato && o.dato >= sv.fra && o.dato <= sv.til), { fra, til }) : [];
  });
  return {
    poster: [...fristposter(synlige, d.eksamen, v, sted.fylke), ...ekstra],
    heleAret: synlige.filter((f) => !f.dato && f.regel?.type === 'lopende').map(fraFrist),
    udatert: regelverk.udatert,
  };
}
