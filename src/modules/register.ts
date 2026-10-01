// Modulregisteret. Moduler oppdages automatisk fra src/modules/*/index.ts.
// Forsiden, søket og favorittene bygges herfra, så en ny modul krever ingen endring i forsidekoden.
import { ekstraModuler, utvikling } from 'virtual:testoppsett';
import { begge } from '../core/i18n/tekst.ts';
import type { Sokeoppforing } from '../core/sok/sok.ts';
import { kategorier, type KategoriId } from './kategorier.ts';
import type { Favorittbar, Inngang, Modulmanifest, Modulrute } from './typer.ts';

const funnet = import.meta.glob<Modulmanifest>('./*/index.ts', { eager: true, import: 'manifest' });

function sjekk(moduler: Modulmanifest[]): Modulmanifest[] {
  const ider = new Set<string>();
  for (const m of moduler) {
    if (ider.has(m.id)) throw new Error(`Modul-id brukt to ganger: ${m.id}`);
    ider.add(m.id);
    for (const r of m.ruter) {
      if (!r.sti.startsWith(`/${m.id}`)) throw new Error(`Ruten ${r.sti} må starte med /${m.id}`);
    }
  }
  return moduler;
}

export const alleModuler: readonly Modulmanifest[] = sjekk([
  ...Object.values(funnet),
  ...(Object.values(ekstraModuler) as Modulmanifest[]),
]);

/** Skjulte moduler er med i utvikling og testing, men ikke i publisert app. */
export const synligeModuler: readonly Modulmanifest[] = alleModuler.filter((m) => m.status === 'aktiv' || utvikling);

export const aktiveModuler: readonly Modulmanifest[] = alleModuler.filter((m) => m.status === 'aktiv');

export function modulerIKategori(kategori: KategoriId): Modulmanifest[] {
  return aktiveModuler
    .filter((m) => m.kategori === kategori)
    .sort((a, b) => (a.rekkefolge ?? 100) - (b.rekkefolge ?? 100));
}

export function kategorierMedModuler() {
  return kategorier.map((k) => ({ ...k, moduler: modulerIKategori(k.id) })).filter((k) => k.moduler.length > 0);
}

/** Boksene modulen har på forsiden. Uten egne innganger er modulen selv én boks. */
export function innganger(m: Modulmanifest): Inngang[] {
  if (m.innganger) return m.innganger;
  return [{ id: `modul:${m.id}`, tittel: m.navn, ...(m.beskrivelse ? { beskrivelse: m.beskrivelse } : {}), rute: m.ruter[0]?.sti ?? '/', ikon: m.ikon }];
}

export function alleRuter(): { modul: Modulmanifest; rute: Modulrute }[] {
  return synligeModuler.flatMap((modul) => modul.ruter.map((rute) => ({ modul, rute })));
}

/** Alt som skal kunne søkes i, fra alle aktive moduler. */
export async function samleSokeoppforinger(moduler: readonly Modulmanifest[] = aktiveModuler): Promise<Sokeoppforing[]> {
  const lister = await Promise.all(
    moduler.map(async (m) => {
      const forste = m.ruter[0];
      const egen: Sokeoppforing[] = forste
        ? [
            {
              id: `modul:${m.id}`,
              type: 'modul',
              tittel: begge(m.navn),
              ...(m.beskrivelse ? { tekst: begge(m.beskrivelse) } : {}),
              rute: forste.sti,
              modul: m.id,
            },
          ]
        : [];
      return [...egen, ...(await m.sokeoppforinger())];
    }),
  );
  return lister.flat();
}

export async function samleFavorittbare(moduler: readonly Modulmanifest[] = synligeModuler, ider?: readonly string[]): Promise<Map<string, Favorittbar>> {
  const lister = await Promise.all(moduler.map((m) => m.favorittbare(ider)));
  return new Map(lister.flat().map((f) => [f.id, f]));
}
