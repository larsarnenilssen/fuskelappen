// Tekstene i velkomsten (fase 10). De lastes med velkomsten, ikke med resten av tekstene, så startpakken ikke vokser
// (avgjørelse 082 og 083). velkomst.nn.ts må ha de samme nøklene (sjekkes av typesjekken).
export const velkomstNb = {
  dialog: 'Velkomst',
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
    tekst:
      '{app} er en digital jukselapp: en enkel oversikt og et raskt oppslag for skoleledere og lærere i videregående skole. Her er arbeidstid, inntak, fag og læreplaner, vurdering, tilrettelegging, skolemiljø og frister, med kalkulatorer, veivisere, kalenderen, nyheter og tall.',
    navnet:
      'Navnet spiller på jukselappen fra skolen. Innholdet er det du bør kunne, men ingen husker alt. Når det teller, kan du «jukse litt» og sjekke jukselappen: regelen, tallet eller neste skritt, med lenke til kilden.',
    omvisning: 'Her får du en kort omvisning og kan gjøre noen valg. Du kan lukke når som helst og se velkomsten igjen under Innstillinger.',
  },
  sok: {
    tittel: 'Søket',
    hvor: 'Søkefeltet står øverst på forsiden. På de andre sidene åpner du søket med forstørrelsesglasset øverst til høyre.',
    hva: 'Søk etter et tema, et begrep, et fag, en paragraf eller en skole. Får du treff i flere grupper, kan du velge bare regelverket, fagene eller skolene.',
    bildeSok: 'fravær',
    bildeTreff: 'Fraværsgrensen',
    bildeTreffUnder: 'Vurdering',
  },
  forsiden: {
    tittel: 'Forsiden',
    panel:
      'Øverst på forsiden står de neste datoene fra kalenderen. I overskriften bytter du til nyhetene eller tallene fra Videregående i tall. På stor skjerm står de i en kolonne til høyre.',
    grupper: 'Under står innholdet i grupper, fra inntak til arbeidstid. Hver boks åpner en del av appen, og favorittene dine får en egen gruppe.',
    tilpass: 'Med «Tilpass» velger du hva forsiden viser, og i hvilken rekkefølge.',
    bildeKalender: 'Kalender',
    bildeNyheter: 'Nyheter',
    bildeTall: 'I tall',
  },
  sidene: {
    tittel: 'Sidene',
    oversikt:
      'Hver del har en oversikt. Først står oppslagene og forklaringene, så veiviserne og kalkulatorene. Kort og forklaringer er lukket til du åpner dem.',
    kilder:
      'Nederst i kortene står «I regelverket» med paragrafene og «Kilder» med lenke til kilden. Ord med stiplet strek under er begreper. Trykk på dem for å se hva de betyr.',
    bildeRegelverk: 'I regelverket (2)',
    bildeKilder: 'Kilder (1)',
  },
  sted: {
    tittel: 'Hvor jobber du?',
    tekst:
      'Velger du fylke og skole, ser du også det som gjelder der: lokale forskrifter, frister, skoleregler og lokale avtaler. Mangler en lokal regel, kan du legge den inn selv, nå eller senere under Innstillinger. Valgene lagres bare på denne enheten.',
    lokaleLenke: 'Legg inn en lokal regel',
    lokaleUnder: 'Den gjelder for deg med en gang.',
  },
  rolle: {
    tittel: 'Hvilken rolle har du?',
    tekst: 'Velg rollen din, så foreslår appen noen favoritter. Valget er frivillig og lagres bare på denne enheten.',
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
    slik: 'Favorittene står øverst på forsiden. Trykk på stjernen ved overskriften på en side for å legge den til eller ta den bort.',
    bildeFavoritter: 'Favoritter',
    bildeSide: 'Fraværsgrensen',
  },
  jukselapp: {
    tittel: 'Dagens jukselapp',
    tekst: 'Vil du ha ett faktum fra appen hver dag? Dagens jukselapp står øverst på forsiden, med lenke til der du kan lese mer.',
    eksempel: 'Slik ser dagens jukselapp ut:',
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
  takk: {
    tittel: 'Du er klar!',
    privat: '{app} er et privat prosjekt, laget med hjelp av KI. Opplysningene kan være feil, så sjekk kilden når det er viktig.',
    innspill: 'Ser du feil eller mangler, eller har du forslag til hva som kan bli bedre? Alle innspill er velkomne.',
    knapp: 'Skriv tilbakemelding',
    senere: 'Du kan også skrive senere, under Innstillinger → «Tilbakemelding».',
    takk: 'Takk for at du bruker {app}!',
  },
};
