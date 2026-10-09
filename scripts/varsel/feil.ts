// Teksten i saken når en arbeidsflyt feiler (etikett «feil», avgjørelse 085): hva arbeidsflyten gjør, hva feilen
// betyr for appen, hvor den feilet, et utdrag av loggen og hva eier gjør. Ren logikk, testet i
// tests/unit/varsel.test.ts. Kjøres av arbeidsflyt.ts.
import { FORMATRAD, feiltype } from './feiltype.ts';

/** Arbeidsflytene som varsler, med navnet de har i .github/workflows. */
/** `henter`: arbeidsflyten henter fra kildene, så en programfeil i loggen tyder på at en kilde har endret format. */
export const ARBEIDSFLYTER: Readonly<Record<string, { gjor: string; betyr: string; henter?: boolean }>> = {
  Kildesjekk: {
    gjor: 'sjekker kildene, lenkene og dataene hver mandag og lager kontrollsaken',
    betyr: 'Kildestatusen og dataene i appen er ikke oppdatert denne gangen, og kontrollsaken kan mangle eller være gammel. Etter 14 dager uten en kildesjekk som går bra, viser appen kildestatusen som «utdatert».',
    henter: true,
  },
  Nyheter: {
    gjor: 'henter nyhetene hver time og publiserer appen når det er nye saker',
    betyr: 'Appen viser nyhetene fra forrige gang hentingen gikk bra.',
    henter: true,
  },
  'Sett versjonstag': {
    gjor: 'setter versjonstaggen og publiserer en ny versjon av appen',
    betyr: 'Den nye versjonen er kanskje ikke ute. jukselappen.no viser i så fall versjonen fra før.',
  },
  CI: {
    gjor: 'tester main etter hver fletting',
    betyr: 'Det er en feil på main. Appen på jukselappen.no er ikke berørt, men feilen må rettes før neste versjon.',
  },
  Publiser: {
    gjor: 'bygger og publiserer appen på jukselappen.no, og sjekker etterpå at den nye utgaven faktisk er ute',
    betyr: 'jukselappen.no viser kanskje den forrige utgaven av appen, eller svarer ikke. Brukere som har appen installert, kan bruke den uten nett.',
  },
  'Lokale regler': {
    gjor: 'publiserer appen med de lokale reglene du har godkjent',
    betyr: 'De nye lokale reglene er kanskje ikke ute. Appen viser reglene fra forrige publisering.',
  },
  Oppetid: {
    gjor: 'sjekker hver time at jukselappen.no svarer, og melder fra når den ikke har svart to ganger på rad med ti minutters mellomrom',
    betyr: 'jukselappen.no svarer ikke. Brukere som har appen installert, kan bruke den uten nett, men nye brukere kommer ikke inn.',
  },
  Godkjenning: {
    gjor: 'fører inn godkjenningene dine når du skriver /godkjent i en kontrollsak',
    betyr: 'Godkjenningen er kanskje ikke lagret. Se etter datoene i kontrollsaken, og skriv /godkjent på nytt hvis de mangler.',
  },
};

export interface Feiletjobb {
  navn: string;
  /** Stegene som feilet. `fortsatte`: steget fikk feile uten at kjøringen stoppet. Tom når jobben feilet før et steg startet. */
  steg: { navn: string; fortsatte: boolean }[];
  url: string;
  /** Utdrag av loggen, eller null når den ikke kunne leses. */
  utdrag: string | null;
}

export interface Kjoring {
  nummer: string;
  url: string;
  /** ÅÅÅÅ-MM-DD */
  dato: string;
}

const MAKS_UTDRAG = 4_000;

/** Linjene rundt den første feilen i loggen, uten tidsstempler og grupper. */
export function loggutdrag(logg: string): string | null {
  const linjer = logg
    .split('\n')
    .map((l) => l.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z ?/, '').replace(/\r$/, ''))
    .filter((l) => !/^##\[(group|endgroup)\]/.test(l));
  const forste = linjer.findIndex((l) => l.startsWith('##[error]'));
  if (forste < 0) return null;
  const utdrag = linjer.slice(Math.max(0, forste - 25), forste + 5).join('\n').trim();
  return utdrag.length <= MAKS_UTDRAG ? utdrag : `…${utdrag.slice(-MAKS_UTDRAG)}`;
}

/** Merket som skiller sakene for de ulike arbeidsflytene. */
export function arbeidsflytmerke(navn: string): string {
  return `<!-- arbeidsflyt:${navn} -->`;
}

export function feiltittel(navn: string): string {
  return `Feil i automatikken: ${navn}`;
}

export function feiltekst(navn: string, kjoring: Kjoring, jobber: readonly Feiletjobb[], actions: string): string {
  const om = ARBEIDSFLYTER[navn];
  const dato = kjoring.dato.split('-').reverse().join('.');
  return [
    `Arbeidsflyten **${navn}**${om ? ` ${om.gjor}` : ''}. Den feilet sist ${dato} ([kjøring ${kjoring.nummer}](${kjoring.url})).`,
    '',
    ...(om ? [`**Hva det betyr:** ${om.betyr}`, ''] : []),
    '**Hvor den feilet:**',
    '',
    ...(jobber.length === 0
      ? ['- Fant ikke jobben som feilet. Se kjøringen.']
      : jobber.flatMap((j) =>
          j.steg.length === 0
            ? [`- Jobben «${j.navn}», før noe steg startet`]
            : j.steg.map((st) => `- Jobben «${j.navn}», steget «${st.navn}»${st.fortsatte ? '. Resten av kjøringen gikk videre.' : ''}`),
        )),
    '',
    ...jobber.flatMap((j) => (j.utdrag ? [`<details><summary>Utdrag av loggen for «${j.navn}»</summary>`, '', '```text', j.utdrag, '```', '', `[Hele loggen](${j.url})`, '</details>', ''] : [])),
    // Ligner loggen på en programfeil eller et uventet format, går feilen ikke over av seg selv (avgjørelse 099).
    om?.henter && jobber.some((j) => j.utdrag !== null && feiltype(j.utdrag) === 'format')
      ? `**Hva du gjør:** ${FORMATRAD} Feilen går neppe over av seg selv. Går en senere kjøring bra, lukkes saken automatisk. Se alle kjøringene under [Actions](${actions}).`
      : `**Hva du gjør:** Mange feil går over av seg selv, for eksempel når en kilde eller GitHub er nede en stund. Går neste kjøring bra, lukkes saken automatisk. Feiler den igjen på samme sted, eller står saken i mer enn et par dager, gi Claude lenken til denne saken. Du kan også starte kjøringen på nytt med «Re-run failed jobs» på [kjøringen](${kjoring.url}), eller se alle kjøringene under [Actions](${actions}).`,
    '',
    arbeidsflytmerke(navn),
  ].join('\n');
}
