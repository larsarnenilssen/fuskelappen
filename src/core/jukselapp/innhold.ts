// Fakta fra innholdsfilene i en modul (dagens jukselapp, avgjørelse 086): hvert element får adressen til siden det
// står på, og stegene i veiviserne lenker rett til steget.
import type { Faktum } from '../../modules/typer.ts';
import { begge, type Tekstverdi } from '../i18n/tekst.ts';
import type { Innholdselement, Stegelement, Veiviserelement } from '../innhold/skjema.ts';
import { lagKart, tilstand, veiTil } from '../veiviser/veiviser.ts';
import { faktaFraElementer } from './fakta.ts';

/** Elementene i hver fil, med filnavnet uten mappe og endelse («fravaer»). */
export async function lastFiler(filer: Record<string, () => Promise<Innholdselement[]>>): Promise<{ fil: string; elementer: Innholdselement[] }[]> {
  return Promise.all(
    Object.entries(filer).map(async ([sti, last]) => ({ fil: sti.split('/').pop()?.replace(/\.yaml$/, '') ?? sti, elementer: await last() })),
  );
}

/**
 * Adressene til stegene i veiviserne blant elementene: veiviseren, åpnet på steget med svarene på den korteste veien
 * dit. Steg som supplerer et nasjonalt steg (fylkets tillegg), står på det nasjonale stegets plass.
 */
export function stegadresser(elementer: readonly Innholdselement[], veiviserRute: (id: string) => string): Map<string, string> {
  const adresser = new Map<string, string>();
  const veivisere = elementer.filter((e): e is Veiviserelement => e.type === 'veiviser');
  const steg = elementer.filter((e): e is Stegelement => e.type === 'steg');
  for (const v of veivisere) {
    const egne = steg.filter((s) => s.veiviser === v.id);
    const kart = lagKart(
      v.start,
      egne.filter((s) => s.gyldighet.niva === 'nasjonal' || s.gyldighet.forhold !== 'supplerer'),
    );
    for (const s of egne) {
      const svar = veiTil(kart, s.id);
      if (!svar) continue;
      const parametre = new URLSearchParams(tilstand(kart, s.id, svar)).toString();
      adresser.set(s.id, `${veiviserRute(v.id)}${parametre ? `?${parametre}` : ''}`);
    }
  }
  return adresser;
}

/** Tittelen på veiviseren et steg hører til, til lenken under faktumet. */
export function veiviserTitler(elementer: readonly Innholdselement[]): Map<string, Veiviserelement['tittel']> {
  return new Map(elementer.filter((e): e is Veiviserelement => e.type === 'veiviser').map((v) => [v.id, v.tittel]));
}

/** Siden elementene i en fil står på, og teksten i lenken dit. */
export interface Filside {
  rute: string;
  lenke: Tekstverdi;
}

/**
 * Fakta fra alle innholdsfilene i en modul. Elementene i en fil i `sider` lenker til siden filen hører til, stegene i
 * veiviserne til steget, og fristene til kalenderen. Filer som ikke står i `sider`, gir bare fakta fra stegene.
 */
export async function faktaFraModul(
  filer: Record<string, () => Promise<Innholdselement[]>>,
  valg: { modul: string; under: Tekstverdi; sider: Record<string, Filside>; veiviserRute?: (id: string) => string; frister?: Filside },
): Promise<Faktum[]> {
  const lastet = await lastFiler(filer);
  const alle = lastet.flatMap((f) => f.elementer);
  const steg = valg.veiviserRute ? stegadresser(alle, valg.veiviserRute) : new Map<string, string>();
  const titler = veiviserTitler(alle);
  return lastet
    .sort((a, b) => a.fil.localeCompare(b.fil))
    .flatMap(({ fil, elementer }) => {
      const side = valg.sider[fil];
      const hvor = (e: Innholdselement): Filside | null => {
        if (e.type === 'steg') {
          const rute = steg.get(e.id);
          const tittel = titler.get(e.veiviser);
          return rute && tittel ? { rute, lenke: tittel } : null;
        }
        if (e.type === 'frist') return valg.frister ?? null;
        return side ?? null;
      };
      return faktaFraElementer(elementer, {
        modul: valg.modul,
        under: valg.under,
        rute: (e) => hvor(e)?.rute ?? null,
        lenke: (e) => begge(hvor(e)?.lenke ?? valg.under),
      });
    });
}
