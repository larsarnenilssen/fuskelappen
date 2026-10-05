// Fra fristene i modulene til oppføringer i kalenderen (avgjørelse 066). Rene funksjoner.
// Eksamensdatoene settes inn per skoleår, så et vindu over to skoleår får datoene for begge.
import { KALENDERTEMAER, type Frist, type Kalendertema } from '../../../core/innhold/skjema.ts';
import type { Tidslinjefrist } from '../../../core/tidslinje.ts';
import { finnDato, medEksamensdatoer } from '../../vurdering/eksamen/datoer.ts';
import type { Eksamensdatoer } from '../../vurdering/eksamen/skjema.ts';
import { skolearIVindu, skolearVindu, utvid, type Kalenderoppforing, type Kalenderpost, type Vindu } from './kalender.ts';

const erTema = (t: string): t is Kalendertema => (KALENDERTEMAER as readonly string[]).includes(t);

/** Temaene til fristen: feltet `tema`, ellers modulen når den er et tema i kalenderen. */
export function temaFor(f: Frist): Kalendertema[] {
  if (f.tema && f.tema.length > 0) return [...f.tema];
  return erTema(f.modul) ? [f.modul] : [];
}

/** En frist (med dato fra eksamensdatoene når den finnes) som oppføring i kalenderen. */
export function fraFrist(f: Tidslinjefrist): Kalenderoppforing {
  const g = f.gyldighet;
  return {
    id: g.niva === 'nasjonal' ? f.id : `${f.id}@${g.fylke}`,
    tittel: f.tittel,
    tekst: f.tekst,
    // Med dato fra dataene (eksamensdatoene) gjelder ikke tidspunktet med ord («Udir fastsetter datoen»).
    ...(f.naar && !f.dato ? { naar: f.naar } : {}),
    tema: temaFor(f),
    grupper: f.grupper,
    lenker: f.lenker,
    paragrafer: f.paragrafer,
    kilder: f.kilder,
    fylke: g.niva === 'nasjonal' ? null : g.fylke,
    ...(f.dato ? { dato: f.dato } : {}),
    ...(f.til ? { til: f.til } : {}),
    ...(f.kl ? { kl: f.kl } : {}),
    ...(f.regel && !f.dato ? { regel: f.regel } : {}),
  };
}

/** Delen av vinduet som ligger i skoleåret. */
function snitt(v: Vindu, skolear: number): Vindu | null {
  const s = skolearVindu(skolear);
  const fra = v.fra > s.fra ? v.fra : s.fra;
  const til = v.til < s.til ? v.til : s.til;
  return fra <= til ? { fra, til } : null;
}

/**
 * Fristene som poster i vinduet. For hvert skoleår vinduet berører, får fristene eksamensdatoene for det skoleåret,
 * og foldes ut i den delen av vinduet som ligger i skoleåret. `fylke` er fylket brukeren har valgt.
 */
export function fristposter(frister: readonly Frist[], data: Eksamensdatoer | null, v: Vindu, fylke: string | null): Kalenderpost[] {
  return skolearIVindu(v).flatMap((skolear) => {
    const del = snitt(v, skolear);
    if (!del) return [];
    const medDatoer = medEksamensdatoer(frister, data, skolear, fylke);
    return utvid(medDatoer.map(fraFrist), del);
  });
}

/** Fristene som gjelder hele året (løpende), som oppføringer. */
export function heleAretOppforinger(frister: readonly Frist[]): Kalenderoppforing[] {
  return frister.filter((f) => !f.dato && f.regel?.type === 'lopende').map(fraFrist);
}

/** Har Udir eller fylkene lagt ut eksamensdatoer for skoleåret? Uten dem står eksamen med måneden. */
export function harEksamensdatoer(data: Eksamensdatoer | null, skolear: number): boolean {
  if (!data) return false;
  const felter = new Set(Object.values(data.nasjonal).flatMap((p) => Object.keys(p)));
  return [...felter].some((felt) => finnDato(data.nasjonal, 'host', felt, skolear) !== null || finnDato(data.nasjonal, 'var', felt, skolear) !== null);
}
