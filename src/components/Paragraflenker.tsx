// Lenker til paragrafer i Regelverk, gruppert per lov eller forskrift: «Opplæringslova § 11-1 Tilpassa opplæring».
// Titlene vises når dokumentet er lastet. Til da står bare nummeret, og lenken virker uansett.
import { useEffect, useState } from 'preact/hooks';
import { lastDokument, lastOversikt, paragrafRute } from '../modules/lov/data.ts';
import { alleParagrafer } from '../modules/lov/typer.ts';
import { kanVisesIRegelverket } from './kilderader.ts';

interface Dokumentlenker {
  dokument: string;
  navn: string;
  paragrafer: { nr: string; visNr: string; tittel: string | null }[];
}

/** «opplaeringslova/11-1» → dokument og nummer. */
export function delParagrafRef(ref: string): { dokument: string; nr: string } {
  const i = ref.indexOf('/');
  return { dokument: ref.slice(0, i), nr: ref.slice(i + 1) };
}

async function lastLenker(refer: readonly string[]): Promise<Dokumentlenker[]> {
  const { dokumenter } = await lastOversikt();
  const perDokument = new Map<string, string[]>();
  for (const r of refer) {
    const { dokument, nr } = delParagrafRef(r);
    perDokument.set(dokument, [...(perDokument.get(dokument) ?? []), nr]);
  }
  const lenker = await Promise.all(
    [...perDokument].map(async ([id, nr]) => {
      const info = dokumenter.find((d) => d.id === id);
      // En paragraf som ikke er i den hentede teksten, f.eks. i et kapittel som er nytt i utvalget og hentes første gang
      // i Actions, tas bort, så lenken ikke går til en paragraf som mangler.
      const finnes = info ? nr.filter((n) => info.paragrafer.includes(n)) : nr;
      const dok = finnes.length > 0 ? await lastDokument(id).catch(() => null) : null;
      const titler = new Map(dok ? alleParagrafer(dok.seksjoner).map(({ paragraf: p }) => [p.nr, p]) : []);
      return {
        dokument: id,
        navn: info?.korttittel ?? id,
        paragrafer: finnes.map((n) => ({ nr: n, visNr: titler.get(n)?.visNr ?? `§ ${n}`, tittel: titler.get(n)?.tittel ?? null })),
      };
    }),
  );
  return lenker.filter((d) => d.paragrafer.length > 0);
}

/**
 * `utenOverskrift` når lenkene står i en boks som allerede har overskriften, f.eks. «I regelverket» i veiviserne.
 * `onAntall` får antallet paragrafer som vises når de er lastet, så boksen rundt kan vise riktig tall.
 */
export function Paragraflenker({
  paragrafer: alle,
  overskrift,
  utenOverskrift = false,
  onAntall,
}: {
  paragrafer: readonly string[];
  overskrift: string;
  utenOverskrift?: boolean;
  onAntall?: (antall: number) => void;
}) {
  // Paragrafer i et dokument som ikke er hentet ennå, vises ikke (kanVisesIRegelverket).
  const paragrafer = alle.filter(kanVisesIRegelverket);
  const [lenker, settLenker] = useState<Dokumentlenker[] | null>(null);
  const nokkel = paragrafer.join(',');
  useEffect(() => {
    let aktiv = true;
    void lastLenker(paragrafer).then(
      (l) => {
        if (!aktiv) return;
        settLenker(l);
        onAntall?.(l.reduce((sum, d) => sum + d.paragrafer.length, 0));
      },
      () => undefined,
    );
    return () => {
      aktiv = false;
    };
    // Nøkkelen endres når listen endres. Selve listen er en ny tabell ved hver tegning.
  }, [nokkel]);
  if (paragrafer.length === 0 || lenker?.length === 0) return null;
  const vis =
    lenker ??
    [...new Set(paragrafer.map((r) => delParagrafRef(r).dokument))].map((d) => ({
      dokument: d,
      navn: '',
      paragrafer: paragrafer.filter((r) => delParagrafRef(r).dokument === d).map((r) => ({ nr: delParagrafRef(r).nr, visNr: `§ ${delParagrafRef(r).nr}`, tittel: null })),
    }));
  return (
    <div class="paragraflenker">
      {utenOverskrift ? <h3 class="skjult-visuelt">{overskrift}</h3> : <h3 class="liten-overskrift">{overskrift}</h3>}
      {vis.map((d) => (
        <div key={d.dokument} class="paragraflenker-dokument">
          {d.navn && <p class="paragraflenker-navn">{d.navn}</p>}
          <ul>
            {d.paragrafer.map((p) => (
              <li key={p.nr}>
                <a href={`#${paragrafRute(d.dokument, p.nr)}`}>
                  <span class="paragraflenker-nr">{p.visNr}</span>
                  {p.tittel && <span class="paragraflenker-tittel"> {p.tittel}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
