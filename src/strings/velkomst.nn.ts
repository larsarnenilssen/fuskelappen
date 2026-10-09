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
      '{app} er ein digital jukselapp: ei enkel oversikt og eit raskt oppslag for skuleleiarar og lærarar i vidaregåande skule. Her er arbeidstid, inntak, fag og læreplanar, vurdering, tilrettelegging, skulemiljø og fristar, med kalkulatorar, vegvisarar, kalenderen, nyheiter og tal.',
    navnet:
      'Namnet spelar på jukselappen frå skulen. Innhaldet er det du bør kunne, men ingen hugsar alt. Når det gjeld, kan du «jukse litt» og sjekke jukselappen: regelen, talet eller neste steg, med lenke til kjelda.',
    omvisning: 'Her får du ei kort omvising og kan gjere nokre val. Du kan lukke når som helst og sjå velkomsten igjen under Innstillingar.',
  },
  sok: {
    tittel: 'Søket',
    hvor: 'Søkefeltet står øvst på framsida. På dei andre sidene opnar du søket med forstørringsglaset øvst til høgre.',
    hva: 'Søk etter eit tema, eit omgrep, eit fag, ein paragraf eller ein skule. Får du treff i fleire grupper, kan du velje berre regelverket, faga eller skulane.',
    bildeSok: 'fråvær',
    bildeTreff: 'Fråværsgrensa',
    bildeTreffUnder: 'Vurdering',
  },
  forsiden: {
    tittel: 'Framsida',
    panel:
      'Øvst på framsida står dei neste datoane frå kalenderen. I overskrifta byter du til nyheitene eller tala frå Vidaregåande i tal. På stor skjerm står dei i ein kolonne til høgre.',
    grupper: 'Under står innhaldet i grupper, frå inntak til arbeidstid. Kvar boks opnar ein del av appen, og favorittane dine får ei eiga gruppe.',
    tilpass: 'Med «Tilpass» vel du kva framsida viser, og i kva rekkjefølgje.',
    bildeKalender: 'Kalender',
    bildeNyheter: 'Nyheiter',
    bildeTall: 'I tal',
  },
  sidene: {
    tittel: 'Sidene',
    oversikt:
      'Kvar del har ei oversikt. Først står oppslaga og forklaringane, så vegvisarane og kalkulatorane. Kort og forklaringar er lukka til du opnar dei.',
    kilder:
      'Nedst i korta står «I regelverket» med paragrafane og «Kjelder» med lenke til kjelda. Ord med stipla strek under er omgrep. Trykk på dei for å sjå kva dei tyder.',
    bildeRegelverk: 'I regelverket (2)',
    bildeKilder: 'Kjelder (1)',
  },
  sted: {
    tittel: 'Kvar jobbar du?',
    tekst:
      'Vel du fylke og skule, ser du også det som gjeld der: lokale forskrifter, fristar, skulereglar og lokale avtalar. Manglar ein lokal regel, kan du leggje han inn sjølv, no eller seinare under Innstillingar. Vala blir berre lagra på denne eininga.',
    lokaleLenke: 'Legg inn ein lokal regel',
    lokaleUnder: 'Han gjeld for deg med ein gong.',
  },
  rolle: {
    tittel: 'Kva rolle har du?',
    tekst: 'Vel rolla di, så føreslår appen nokre favorittar. Valet er frivillig og blir berre lagra på denne eininga.',
    legend: 'Rolle',
    roller: {
      laerer: 'Lærar',
      kontaktlaerer: 'Kontaktlærar',
      radgiver: 'Rådgivar',
      skoleleder: 'Skuleleiar',
      annen: 'Anna rolle',
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
