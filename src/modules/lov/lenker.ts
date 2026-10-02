// Fra en Lovdata-adresse til paragrafen i appen (eier 02.10.2026). Kilder som lenker til en paragraf hos Lovdata
// (https://lovdata.no/lov/2023-06-09-30/§11-1) får også en lenke til paragrafen i Lov og forskrift, når den er med i
// utvalget. Oversikten lastes først når en slik kilde vises, så startpakken blir ikke større.
import { useEffect, useState } from 'preact/hooks';
import { lastOversikt, paragrafRute } from './data.ts';

const LOVDATA = /^https:\/\/lovdata\.no\/(?:dokument\/[A-Z]+\/)?((?:lov|forskrift)\/[\d-]+)\/§\s?([0-9a-z-]+)$/i;

/** Ruten til paragrafen i appen (uten #), eller null når adressen ikke peker på en paragraf i utvalget. */
export async function appRuteForLovdata(url: string): Promise<string | null> {
  let adresse: string;
  try {
    adresse = decodeURI(url);
  } catch {
    return null;
  }
  const m = LOVDATA.exec(adresse);
  if (!m) return null;
  const nr = (m[2] as string).toLowerCase();
  const { dokumenter } = await lastOversikt();
  const d = dokumenter.find((x) => x.refid === m[1] && x.paragrafer.includes(nr));
  return d ? paragrafRute(d.id, nr) : null;
}

/** Som appRuteForLovdata, som hook: null til oversikten er lastet, og når det ikke finnes noen paragraf i appen. */
export function useLovlenke(url: string | undefined): string | null {
  const [rute, settRute] = useState<string | null>(null);
  useEffect(() => {
    let aktiv = true;
    settRute(null);
    if (url && url.startsWith('https://lovdata.no/')) {
      appRuteForLovdata(url).then(
        (r) => aktiv && settRute(r),
        () => undefined,
      );
    }
    return () => {
      aktiv = false;
    };
  }, [url]);
  return rute;
}
