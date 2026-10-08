// Lokale regler i appen (fase 9, avgjørelse 093): brukerens egne regler fra lagringen og de godkjente fra
// data/lokale/regler.json, for fylket og skolen brukeren har valgt.
import { useEffect, useMemo, useState } from 'preact/hooks';
import { lokaleVerdier, type Sted } from '../../core/lokale/regler.ts';
import type { EgenRegel, PublisertRegel } from '../../core/lokale/skjema.ts';
import type { LokalVerdi } from '../../core/regler/motor.ts';
import { lastLokaleRegler } from '../../data/lokale.ts';
import { iDag } from '../../data/skolear.ts';
import { useEgneRegler, useTilstand } from '../tilstand.ts';

/** Sist hentede godkjente regler, så neste side har dem med en gang. */
let hentet: PublisertRegel[] | null = null;

/**
 * De godkjente lokale reglene. Tom liste til filen er hentet, eller når den ikke kan hentes. `lastet` er sann når
 * hentingen er ferdig, også når den feilet.
 */
export function useGodkjenteRegler(): { regler: PublisertRegel[]; lastet: boolean } {
  const [regler, settRegler] = useState<PublisertRegel[]>(hentet ?? []);
  const [lastet, settLastet] = useState(hentet !== null);
  useEffect(() => {
    let aktiv = true;
    lastLokaleRegler().then(
      (r) => {
        hentet = r;
        if (aktiv) {
          settRegler(r);
          settLastet(true);
        }
      },
      () => {
        if (aktiv) settLastet(true);
      },
    );
    return () => {
      aktiv = false;
    };
  }, []);
  return { regler, lastet };
}

/** Stedet brukeren har valgt: fylket og skolens nummer i Nasjonalt skoleregister. */
export function useSted(): Sted {
  const { innstillinger } = useTilstand();
  return useMemo(() => ({ fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null }), [innstillinger.fylke, innstillinger.skole?.id]);
}

export interface Lokale {
  egne: EgenRegel[];
  godkjente: PublisertRegel[];
  sted: Sted;
  dato: string;
  /** Verdiene til regelkonteksten i kalkulatorene. */
  verdier: LokalVerdi[];
  /** Hentingen av de godkjente reglene er ferdig. */
  lastet: boolean;
}

/** Alt om lokale regler som sidene og kalkulatorene trenger. */
export function useLokale(): Lokale {
  const egne = useEgneRegler();
  const { regler: godkjente, lastet } = useGodkjenteRegler();
  const sted = useSted();
  const dato = iDag();
  const verdier = useMemo(() => lokaleVerdier(egne, godkjente, sted, dato), [egne, godkjente, sted, dato]);
  return { egne, godkjente, sted, dato, verdier, lastet };
}
