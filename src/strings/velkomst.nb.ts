// Tekstene i velkomsten (fase 10). De lastes med velkomsten, ikke med resten av tekstene, så startpakken ikke vokser
// (avgjørelse 082 og 083). velkomst.nn.ts må ha de samme nøklene (sjekkes av typesjekken). Fire trinn, som hvert skal
// få plass uten rulling på en iPhone (avgjørelse 101), så tekstene er korte.
export const velkomstNb = {
  merke: 'Velkommen',
  teller: '{nr} av {antall}',
  neste: 'Neste',
  tilbake: 'Tilbake',
  hoppOver: 'Hopp over',
  ferdig: 'Ferdig',
  lukk: 'Lukk velkomsten',
  spillAv: 'Vis igjen',
  velkommen: {
    tittel: 'Velkommen til {app}',
    // Hvorfor appen heter Jukselappen (eier 09.10.2026). Appen kalles en digital jukselapp, ikke en lapp.
    tekst: '{app} er en digital jukselapp: en enkel oversikt og et raskt oppslag for skoleledere og lærere i videregående skole.',
    navnet:
      'Navnet spiller på jukselappen fra skolen. Innholdet er det du bør kunne, men ingen husker alt. Når det teller, kan du «jukse litt» og sjekke jukselappen: regelen, tallet eller neste skritt, med lenke til kilden.',
    // Det viktigste fra de tidligere trinnene om søket og forsiden (avgjørelse 101).
    sok: 'Søk øverst på forsiden, eller med forstørrelsesglasset på de andre sidene. På forsiden står også kalenderen, nyhetene og tallene.',
    bildeKalender: 'Kalender',
    bildeNyheter: 'Nyheter',
    bildeTall: 'I tall',
  },
  sted: {
    tittel: 'Hvor jobber du?',
    tekst:
      'Velger du fylke og skole, ser du også det som gjelder der: lokale forskrifter, frister, skoleregler og lokale avtaler. Valgene lagres bare på denne enheten.',
    lokaleLenke: 'Legg inn en lokal regel',
    lokaleUnder: 'Nå eller senere, under Innstillinger.',
  },
  rolle: {
    tittel: 'Hvilken rolle har du?',
    tekst: 'Velg gjerne en rolle for forslag til favoritter.',
    legend: 'Rolle',
    roller: {
      laerer: 'Lærer',
      kontaktlaerer: 'Kontaktlærer',
      radgiver: 'Rådgiver',
      skoleleder: 'Skoleleder',
      annen: 'Annen rolle',
    },
    anbefalte: 'Forslag til favoritter',
    leggTilAlle: 'Legg til alle',
    alleLagtTil: 'Alle er lagt til',
    jukselapp: 'Ett faktum fra appen hver dag.',
  },
  installer: {
    tittel: 'Legg appen på hjemskjermen',
    tekst: 'Da åpner du {app} som en egen app, rett fra hjemskjermen eller programlinjen.',
    legend: 'Enhet',
    ios: 'iPhone og iPad',
    android: 'Android',
    datamaskin: 'Datamaskin',
    iosSteg: ['Åpne appen i Safari.', 'Trykk på Del-knappen, firkanten med pil opp.', 'Velg «Legg til på Hjem-skjerm».', 'Trykk «Legg til».'],
    androidSteg: [
      'Trykk på menyen med tre prikker øverst til høyre i Chrome.',
      'Velg «Installer app» eller «Legg til på startskjermen».',
      'Trykk «Installer».',
    ],
    datamaskinSteg: [
      'I Chrome og Edge: trykk på ikonet for installering til høyre i adressefeltet, eller velg «Installer {app}» i menyen.',
      'I Safari på Mac: velg Fil, så «Legg til i Dock».',
      'Firefox kan ikke installere apper. Legg til et bokmerke i stedet.',
    ],
    knapp: 'Installer appen',
    bildeLeggTil: 'Legg til på Hjem-skjerm',
    bildeInstaller: 'Installer app',
    bildeInstallerDatamaskin: 'Installer {app}',
  },
};
