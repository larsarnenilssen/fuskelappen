// Tekstane i velkomsten (fase 10) på nynorsk. Same nøklar som velkomst.nb.ts.
import type { velkomstNb } from './velkomst.nb.ts';

type Skjema<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends readonly string[] ? readonly string[] : Skjema<T[K]>;
};

export const velkomstNn: Skjema<typeof velkomstNb> = {
  dialog: 'Velkomst',
  merke: 'Velkomen',
  teller: '{nr} av {antall}',
  neste: 'Neste',
  tilbake: 'Tilbake',
  hoppOver: 'Hopp over',
  ferdig: 'Ferdig',
  lukk: 'Lukk velkomsten',
  spillAv: 'Vis igjen',
  velkommen: {
    tittel: 'Velkomen til {app}',
    tekst:
      '{app} samlar regelverket for vidaregåande opplæring på éin stad: arbeidstid, inntak, fag og læreplanar, vurdering, tilrettelegging, skulemiljø og fristar.',
    hvem: 'Appen er laga for skuleleiarar og lærarar i vidaregåande skule. Alt innhald har kjelde, med lenke dit.',
    omvisning: 'Her får du ei kort omvising og kan gjere nokre val. Du kan lukke når som helst og sjå velkomsten igjen under Innstillingar.',
  },
  forsiden: {
    tittel: 'Framsida og søket',
    sok: 'Søk etter eit tema, eit omgrep, eit fag eller ein paragraf øvst på framsida.',
    grupper: 'Innhaldet er delt i grupper, frå inntak til arbeidstid. Kvar boks opnar ein del av appen.',
    panel: 'Øvst står dei neste datoane frå kalenderen, nyheitene og tala. Du byter mellom dei i overskrifta.',
    tilpass: 'Med «Tilpass» vel du kva framsida viser, og i kva rekkjefølgje.',
    bildeSok: 'fråvær',
    bildeTreff: 'Fråværsgrensa',
    bildeTreffUnder: 'Vurdering',
  },
  sidene: {
    tittel: 'Sidene',
    oversikt: 'Kvar del har ei oversikt. Først står oppslaga og forklaringane, så vegvisarane og kalkulatorane.',
    lukket: 'Kort og forklaringar er lukka til du opnar dei.',
    kilder: 'Nedst i korta står «I regelverket» med paragrafane og «Kjelder» med lenke til kjelda.',
    begreper: 'Ord med stipla strek under er omgrep. Trykk på dei for å sjå kva dei tyder.',
    bildeRegelverk: 'I regelverket (2)',
    bildeKilder: 'Kjelder (1)',
  },
  sted: {
    tittel: 'Kvar jobbar du?',
    tekst:
      'Vel du fylke og skule, viser appen også det som gjeld der: lokale forskrifter, fristar, skulereglar og lokale avtalar. Utan val ser du det som gjeld i heile landet.',
    forklaring: 'Valet blir berre lagra på denne eininga, og du kan endre det under Innstillingar.',
    lokaleTittel: 'Manglar ein lokal regel?',
    lokaleTekst:
      'Du kan leggje inn ein regel for fylket eller skulen din og melde han inn. Han gjeld med ein gong for deg, og for andre ved skulen når han er godkjend.',
    lokaleLenke: 'Legg inn ein lokal regel',
    lokaleSenere: 'Du kan også gjere det seinare, under Innstillingar → «Lokale reglar».',
  },
  rolle: {
    tittel: 'Kva rolle har du?',
    tekst: 'Vel rolla di, så føreslår appen nokre favorittar. Rolla blir berre lagra på denne eininga.',
    legend: 'Rolle',
    roller: {
      laerer: 'Lærar',
      kontaktlaerer: 'Kontaktlærar',
      radgiver: 'Rådgivar',
      skoleleder: 'Skuleleiar',
    },
    anbefalte: 'Forslag til favorittar',
    leggTilAlle: 'Legg til alle',
    alleLagtTil: 'Alle er lagde til',
    slik: 'Favorittane står øvst på framsida. Trykk på stjerna ved overskrifta på ei side for å leggje ho til eller ta ho bort.',
    bildeFavoritter: 'Favorittar',
    bildeSide: 'Fråværsgrensa',
  },
  jukselapp: {
    tittel: 'Dagens jukselapp',
    tekst: 'Vil du ha eitt faktum frå appen kvar dag? Dagens jukselapp står øvst på framsida, med lenke til der du kan lese meir.',
    eksempel: 'Slik ser dagens jukselapp ut:',
  },
  installer: {
    tittel: 'Legg appen på heimeskjermen',
    tekst: 'Då opnar du {app} som ein eigen app, rett frå heimeskjermen eller programlinja.',
    legend: 'Eining',
    ios: 'iPhone og iPad',
    android: 'Android',
    datamaskin: 'Datamaskin',
    iosSteg: ['Opne appen i Safari.', 'Trykk på Del-knappen, firkanten med pil opp.', 'Vel «Legg til på Hjem-skjerm».', 'Trykk «Legg til».'],
    androidSteg: ['Trykk på menyen med tre prikkar øvst til høgre i Chrome.', 'Vel «Installer app» eller «Legg til på startskjermen».', 'Trykk «Installer».'],
    datamaskinSteg: [
      'I Chrome og Edge: trykk på ikonet for installering til høgre i adressefeltet, eller vel «Installer {app}» i menyen.',
      'I Safari på Mac: vel Fil, så «Legg til i Dock».',
      'Firefox kan ikkje installere appar. Legg til eit bokmerke i staden.',
    ],
    knapp: 'Installer appen',
    bildeLeggTil: 'Legg til på Hjem-skjerm',
    bildeInstaller: 'Installer app',
    bildeInstallerDatamaskin: 'Installer {app}',
  },
  takk: {
    tittel: 'Du er klar!',
    privat: '{app} er eit privat prosjekt, laga med hjelp av KI. Opplysningane kan vere feil, så sjekk kjelda når det er viktig.',
    innspill: 'Ser du feil eller manglar, eller har du forslag til kva som kan bli betre? Alle innspel er velkomne.',
    knapp: 'Skriv tilbakemelding',
    senere: 'Du kan også skrive seinare, under Innstillingar → «Tilbakemelding».',
    takk: 'Takk for at du brukar {app}!',
  },
};
