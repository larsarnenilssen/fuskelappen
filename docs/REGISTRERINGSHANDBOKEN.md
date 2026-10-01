# Registreringshåndboken – innhold og mulig bruk

Vurdering av Udirs registreringshåndbok (`regbok.udir.no`) som kilde, 01.10.2026. Eier viste til den for PBPBY4.

## Om kilden

- **Hva:** Definisjoner av feltene skoler og fylker registrerer om elever og lærlinger i videregående opplæring (i Visma InSchool, VIGO og andre systemer), med gyldige koder og utfyllende kommentarer. Håndboken brukes for å få lik registrering og god statistikk. Den forvaltes av VIGO Kodeverksgruppe (Udir, SSB, Lånekassen og Novari) og blir levert av Udir.
- **Omfang:** 67 felt i fire deler: A (felles, f.eks. programområdekode og fagkode), B (skole, f.eks. fagstatus, fullførtkode, fravær, FAM- og VMM-koder, karakterer), C (fagopplæring, f.eks. læretid, kontraktstype, avbrudd) og E (voksne).
- **Oppdatering:** Én gang i året, vanligvis i april–mai. De fleste feltene ble sist endret 08.04.2025. Hver endring står i endringsloggen (`/endringslogg`), med versjon og dato per felt.
- **Tilgang:** Vanlige HTML-sider. Det finnes ikke noe API eller nedlasting. `robots.txt` tillater henting, helst kl. 02–05 (norsk tid). Lisens er ikke oppgitt, så vi lenker og siterer kort.
- **Adresser:** Hvert felt har en fast adresse for gjeldende versjon, f.eks. A03 Programområdekode: `https://regbok.udir.no/35004/3344/35042-1014307.html`. Eldre versjoner har egne adresser. Lenken eier fant (`35042-1037484`) er versjonen fra 2016. Oversiktssiden (`/oversikt`) har alle feltene med full tekst på én side.

## Kan den hentes automatisk?

Ja, som en vanlig side. Kildesjekken bruker metoden `side` med `#maincolpage` som uttrekk. Det gir fingeravtrykk og varsler når teksten endres. Å lese ut koder og tabeller fra teksten blir skjørt, fordi sidene ikke har fast struktur for kodelister. Henting av hele oversiktssiden én gang i uken, med ett fingeravtrykk per felt, er det mest robuste hvis flere felt tas i bruk.

## I bruk nå

| Felt | Brukes til |
|---|---|
| A03 Programområdekode | Kilde for at PBPBY4 er påbygging etter fag- og yrkesopplæring (`PBPBY4YK--` for elever med fag- eller yrkeskompetanse, `PBPBY4H---` for elever som går mot planlagt sluttkompetanse på lavere nivå etter kontrakt om opplæring), i tillegg til fag for studiekompetanse for voksne og privatister. Sjekkes hver uke (`udir-regbok-programomradekode`). |

## Mulig bruk senere

| Felt | Mulig bruk |
|---|---|
| A03 Programområdekode | Forklare kategoriene og variantene i VIGO (posisjon 7–10, f.eks. H = planlagt sluttkompetanse på lavere nivå, A/B = vg1 over to år, SY = overgang fra studiespesialisering til yrkesfag) i tilbudsvisningen og begrepsbanken. |
| B16–B19 FAM- og VMM-koder | Kilde for begrepene om fagmerknader og vitnemålsmerknader. Håndboken sier hvilke koder som krever utfyllende tekst (f.eks. FAM13, VMM17) og viser til Udirs skriv om føring av vitnemål og kompetansebevis, som er primærkilden. Kan svare på noen av kontrollspørsmålene til eier. |
| B07 Fagstatus, B21 Fullførtkode, B22 Bevistype, B26 Karakterer og andre vurderingsuttrykk, B24 Fravær | Fase 6 (vurdering og dokumentasjon): forklaringer av koder skolen ser i InSchool og VIGO. |
| B10 Individuelt tilrettelagt opplæring, B11 Særskilt språkopplæring, B12 Styrket opplæring | Fase 4: hvordan vedtak registreres. |
| B14 Merknad for yrkesfaglig fordypning | Tilbudsvisningen og vurdering. |
| C05–C16, C23–C26 (læretid, kontrakt, avbrudd, fag- og svenneprøve) | En senere modul om fagopplæring. |

## Forbehold

- Håndboken beskriver registrering, ikke regler. Lov, forskrift og rundskriv går foran. Den viser av og til til paragrafer i den gamle opplæringsloven i eldre versjoner. Gjeldende versjon viser til opplæringsloven fra 2024.
- Personopplysninger: Håndboken beskriver felt som fødselsnummer, men inneholder ingen opplysninger om personer. Appen tar ikke inn slike felt.
