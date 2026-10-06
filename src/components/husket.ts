// Hva som er åpent på en side, husket i nettleserhistorikken for siden (eier 06.10.2026): følger brukeren en lenke,
// f.eks. til en paragraf under «I regelverket», og går tilbake, er de samme kortene og radene åpne igjen, og siden står
// der den var (ruter.ts). Som de sammenlagte kortene (Sammenlegg.tsx) huskes det ikke på enheten.
import { useCallback, useState } from 'preact/hooks';

function lesApne(): Record<string, boolean> {
  try {
    const apne = (history.state as { apne?: unknown } | null)?.apne;
    return apne && typeof apne === 'object' ? (apne as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/** Om noe med denne nøkkelen er åpent på siden, og en funksjon som setter det. Uten lagret valg gjelder `standard`. */
export function useHusketApen(nokkel: string, standard = false): [boolean, (apen: boolean) => void] {
  const [apen, settApen] = useState(() => {
    const lagret = lesApne()[nokkel];
    return typeof lagret === 'boolean' ? lagret : standard;
  });
  const sett = useCallback(
    (ny: boolean) => {
      settApen(ny);
      try {
        const tilstand = (history.state as Record<string, unknown> | null) ?? {};
        history.replaceState({ ...tilstand, apne: { ...lesApne(), [nokkel]: ny } }, '');
      } catch {
        // Historikken kan ikke oppdateres. Kortet virker likevel.
      }
    },
    [nokkel],
  );
  return [apen, sett];
}

/** En kort, stabil nøkkel laget av teksten, f.eks. kildene i et kort som ikke har egen id. */
export function nokkelFra(tekst: string): string {
  let h = 5381;
  for (let i = 0; i < tekst.length; i++) h = ((h << 5) + h + tekst.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
