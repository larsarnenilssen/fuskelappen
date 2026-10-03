// Lenker til paragrafer i Regelverk, gruppert per lov eller forskrift: «Opplæringslova § 11-1 Tilpassa opplæring».
// Titlene vises når dokumentet er lastet. Til da står bare nummeret, og lenken virker uansett.
import { useEffect, useState } from 'preact/hooks';
import { lastDokument, lastOversikt, paragrafRute } from '../modules/lov/data.ts';
import { alleParagrafer } from '../modules/lov/typer.ts';

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
  return Promise.all(
    [...perDokument].map(async ([id, nr]) => {
      const dok = await lastDokument(id).catch(() => null);
      const titler = new Map(dok ? alleParagrafer(dok.seksjoner).map(({ paragraf: p }) => [p.nr, p]) : []);
      return {
        dokument: id,
        navn: dokumenter.find((d) => d.id === id)?.korttittel ?? id,
        paragrafer: nr.map((n) => ({ nr: n, visNr: titler.get(n)?.visNr ?? `§ ${n}`, tittel: titler.get(n)?.tittel ?? null })),
      };
    }),
  );
}

/**
 * `kompakt` viser bare numrene, side om side under navnet på loven eller forskriften, med tittelen som tips og i
 * navnet til lenken. Brukes i veiviserne, der mange paragrafer ellers tar mye plass (eier 03.10.2026).
 */
export function Paragraflenker({ paragrafer, overskrift, kompakt = false }: { paragrafer: readonly string[]; overskrift: string; kompakt?: boolean }) {
  const [lenker, settLenker] = useState<Dokumentlenker[] | null>(null);
  const nokkel = paragrafer.join(',');
  useEffect(() => {
    let aktiv = true;
    void lastLenker(paragrafer).then(
      (l) => aktiv && settLenker(l),
      () => undefined,
    );
    return () => {
      aktiv = false;
    };
    // Nøkkelen endres når listen endres. Selve listen er en ny tabell ved hver tegning.
  }, [nokkel]);
  if (paragrafer.length === 0) return null;
  const vis =
    lenker ??
    [...new Set(paragrafer.map((r) => delParagrafRef(r).dokument))].map((d) => ({
      dokument: d,
      navn: '',
      paragrafer: paragrafer.filter((r) => delParagrafRef(r).dokument === d).map((r) => ({ nr: delParagrafRef(r).nr, visNr: `§ ${delParagrafRef(r).nr}`, tittel: null })),
    }));
  return (
    <div class={`paragraflenker${kompakt ? ' paragraflenker-kompakt' : ''}`}>
      <h3 class="liten-overskrift">{overskrift}</h3>
      {vis.map((d) => (
        <div key={d.dokument} class="paragraflenker-dokument">
          {d.navn && <p class="paragraflenker-navn">{d.navn}</p>}
          <ul>
            {d.paragrafer.map((p) => (
              <li key={p.nr}>
                {kompakt ? (
                  <a
                    href={`#${paragrafRute(d.dokument, p.nr)}`}
                    title={p.tittel ?? undefined}
                    aria-label={[d.navn, p.visNr, p.tittel].filter(Boolean).join(' ')}
                  >
                    {p.visNr}
                  </a>
                ) : (
                  <a href={`#${paragrafRute(d.dokument, p.nr)}`}>
                    <span class="paragraflenker-nr">{p.visNr}</span>
                    {p.tittel && <span class="paragraflenker-tittel"> {p.tittel}</span>}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
