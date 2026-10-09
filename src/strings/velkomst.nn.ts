// Tekstane i velkomsten (fase 10) på nynorsk. Same nøklar som velkomst.nb.ts.
import type { velkomstNb } from './velkomst.nb.ts';

type Skjema<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends readonly string[] ? readonly string[] : Skjema<T[K]>;
};

export const velkomstNn: Skjema<typeof velkomstNb> = {
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
    tekst: '{app} er ein digital jukselapp: ei enkel oversikt og eit raskt oppslag for skuleleiarar og lærarar i vidaregåande.',
    navnet:
      'Namnet spelar på jukselappen frå skulen. Innhaldet er det du bør kunne, men ingen hugsar alt. Når det gjeld, kan du «jukse litt» og sjekke jukselappen: regelen, talet eller neste steg, med lenke til kjelda.',
    sok: 'Søk øvst på framsida eller med forstørringsglaset på dei andre sidene. På framsida står også Aktuelt: kalenderen, nyheitene og tala.',
    tilbakemelding: 'Gi gjerne tilbakemelding under {om} eller {innstillinger}.',
    om: 'Om appen',
    innstillinger: 'Innstillingar',
    bildeKalender: 'Kalender',
    bildeNyheter: 'Nyheiter',
    bildeTall: 'I tal',
  },
  sted: {
    tittel: 'Kvar jobbar du?',
    tekst:
      'Vel du fylke og skule, ser du også det som gjeld der: lokale forskrifter, fristar, skulereglar og lokale avtalar. Vala blir berre lagra på denne eininga.',
    lokaleLenke: 'Legg inn ein lokal regel',
    lokaleUnder: 'No eller seinare, under Innstillingar.',
  },
  rolle: {
    tittel: 'Kva rolle har du?',
    tekst: 'Vel gjerne ei rolle for forslag til favorittar.',
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
    jukselapp: 'Eitt faktum frå appen kvar dag.',
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
};
