# VIGO Kodeverksbase – innhold og mulig bruk

Oversikt over VIGO Kodeverksbase (`kodeverk.vigo.no`) til senere apputvikling. Avgjørelse 026 beskriver det appen bruker nå. Tallene er fra 01.10.2026.

## Om kilden

- **Hva:** Felles kodeverk for videregående opplæring i VIGO, fylkeskommunenes system for inntak, fagopplæring og dokumentasjon. Kodeverket forvaltes av Novari IKS. Det består av koder fra Grep, koder fra Nasjonalt skoleregister og koder som er laget for VIGO.
- **Tilgang:** Novari skriver at basen er «åpen for alle og kan brukes for oppslag». Eier avgjorde 01.10.2026 at den er offentlig og kan brukes. Det finnes ingen lisens og ingen dokumentasjon av API-et. Vi bruker det samme API-et som nettsiden selv bruker, og det kan endres uten varsel. Hentingen har derfor kontroller, og forrige filer beholdes ved feil.
- **API:**
  - `POST https://kodeverk.vigo.no/api/<tabell>?page=<n>&size=<antall>` med `[]` som innhold (filtre), høyst 2000 rader per side. Svaret har `content` og `totalElements`.
  - `GET /api/menuItems` og `GET /api/menuItems/relations` lister tabellene og koblingene, med dato for siste oppdatering.
  - Mange tabeller oppdateres daglig.
- **Henting:** `scripts/hent-vigo.ts` (`npm run hent:vigo`) kjøres i GitHub Actions hver uke, i samme steg som Grep. Appen gjør ingen kall til VIGO.
- **Personvern:** Kodebasen har ingen opplysninger om elever. OT-enhetene (`ot-units`) har kontaktinformasjon til kontorer, ikke til personer. Den er ikke tatt i bruk.

## I bruk nå (avgjørelse 026)

| Tabell eller kobling | Antall | Brukes til |
|---|--:|---|
| `relation/element-replaces-element` («element_erstatter_element») | 3 592 | Fagsiden viser utgåtte koder et fag erstatter. En utgått kode i fagsøket eller i adressen viser koden som erstatter den. |
| `relation/replaced-by` («erstattes_av») | 72 | Fagsiden sier fra når læreplanen er erstattet av en ny versjon. |
| `relation/course-used-together-with` («fag_benyttessammenmed») | 1 761 | Fagsiden viser fag som brukes sammen, f.eks. tverrfaglig eksamen og fagene den gjelder. |
| `course-remarks` (FAM-koder) | 63 | Oppslaget «Fagmerknader (FAM-koder)» i begrepsbanken, med søk. |
| `diploma-remarks` (VMM-koder) | 45 | Oppslaget «Vitnemålsmerknader (VMM-koder)» i begrepsbanken, med søk. |
| `relation/course-paabygning` («fag_paabygning») | 131 (49 fag etter at VIGOs egne koder er tatt bort) | Rekkefølgen på fag over flere trinn i tilbudsstrukturen, f.eks. Teater og bevegelse 1 → 2. Eier 01.10.2026: fagene tas i denne rekkefølgen. Aktivitetslære og treningsledelse på idrettsfag mangler i VIGO. |

## Mulig bruk senere

### Fag og vurdering (fase 2 og 6)

| Tabell eller kobling | Antall | Innhold | Mulig bruk |
|---|--:|---|---|
| `relation/fam-connected-to-course` | 153 | Hvilke FAM-koder som hører til hvilke fag | Vise aktuelle fagmerknader på fagsiden. |
| `exam-assessments` | 10 611 | Vurderingsordning per fagkode: trekkfag, eksamensform på vitnemålet, vurderingsform, avsluttende fag | Kontrollere vurderingsordningen fra Grep. Fraværskalkulator og vurdering i fase 6. |
| `relation/exam-assessment-pupil` og `…-private` | 5 444 og 4 072 | Eksamensordning for elever og privatister per fag | Samme som over. |
| `courses` | 22 469 | Alle fagkoder med navn, type, omfang på vitnemålet, sensur, om faget teller for poeng | Kontrollere Grep. «Teller for poeng» kan brukes i poengberegningen i fase 5. |
| `relation/main-course-sub-course` | 8 618 | Hovedfag og delfag (f.eks. tverrfaglig eksamen og delene) | Bedre kobling mellom eksamenskoder og fag i tilbudsstrukturen. |
| `similar-courses` | 1 740 | Par av fagkoder som VIGO regner som «like» (f.eks. KRO1001 og KRO1004) | Antakelig for godkjenning av fag tatt tidligere. Eksemplene er ikke i bruk i dag (eier 01.10.2026). Ikke i bruk. |
| `grades` | 131 | Karakterkoder (tall, IV, fritatt osv.) og om de teller som karakter | Forklaring av karakterkoder i fase 6. |
| `exam-forms`, `course-types`, `variables` | 7, 15, 219 | Eksamensformer, fagtyper og diverse koder (f.eks. oppmøtestatus) | Oppslag og forklaringer i fase 6. |

### Tilbudsstruktur og programområder (fase 2 og 3)

| Tabell eller kobling | Antall | Innhold | Mulig bruk |
|---|--:|---|---|
| `program-areas` | 12 754 | Programområder med trinn, utdanningsprogram, sluttkompetanse, kontraktstid (læretid), gyldighet | Læretid for lærefag i tilbudsvisningen, og kontroll av Grep. |
| `program-area-courses` | 50 121 | Fag per programområde, med sortering | Samme kobling som i Grep, med rekkefølge. Kan gi riktig rekkefølge på fagene i tilbudsvisningen. |
| `relation/programarea-paabygning` | 825 | Programområde → programområde (videre løp) | Kontrollere «bygger på» fra Grep. |
| `relation/course-belongs-to-programarea` | 39 607 | Fag → programområde | Kontrollere Grep. |
| `program-area-categories` | 95 | Kategorier, f.eks. Rudolf Steiner-skole | Merking av varianter i tilbudsvisningen. |
| `education-programs` | 41 | Utdanningsprogram med refusjonssats | – |
| `refund-rates` | 7 | Refusjonssatser per gruppe av utdanningsprogram (f.eks. ID, KD, ME, ST: 165 000) | Ukjent formål. Avklares før bruk. |

### Inntak (fase 5)

| Tabell eller kobling | Antall | Innhold | Mulig bruk |
|---|--:|---|---|
| `entry-requirements` | 44 493 | Hva et programområde gir grunnlag for å søke videre på, per fylke (`countyNr`, 99 = nasjonalt) | Veiviser for søkere: «hva kan eleven søke på etter …?». Har også gamle koder fra før Kunnskapsløftet, så den må filtreres. |
| `wish-statuses` | 55 | Status på søkerønsker (f.eks. «Ønske til skole, ikke behandlet») | Forklare kodene skolene ser i inntaket. |
| `foreign-languages`, `mother-tongues` | 40 og 305 | Språkkoder | Inntak og særskilt språkopplæring (fase 4 og 5). |

### Læreplaner og kompetansemål

| Tabell eller kobling | Antall | Innhold | Mulig bruk |
|---|--:|---|---|
| `curriculalk20`, `curricula` | 515 og 617 | Læreplaner (LK20 og eldre) med fastsettelse og gyldighet | Kontroll av Grep. |
| `competences`, `competence-sub-goals`, `competence-sets` | 30 860, 15 035, 1 360 | Kompetansemål, delmål og sett | Grep er hovedkilden. |
| `relation/connected-to-core-element`, `…-general-skill`, `…-interdisciplinary-subject`, `…-verb` | 26 941, 42 378, 9 041, 19 348 | Kompetansemål koblet til kjerneelementer, grunnleggende ferdigheter, tverrfaglige temaer og verb | Filtrere kompetansemål på fagsiden. |

### Skoler, geografi og oppfølgingstjenesten

| Tabell eller kobling | Antall | Innhold | Mulig bruk |
|---|--:|---|---|
| `schools` | 3 251 | Skoler med skolenummer, navn, eier, type, fylke, kommune og organisasjonsnummer, koblet til NSR | Kontrollere skolelisten fra Nasjonalt skoleregister. Har ikke skoletilbud. |
| `nsr-units` | 18 358 | Enheter fra Nasjonalt skoleregister | Samme som over. |
| `counties`, `municipalities`, `boroughs`, `postal-areas`, `countries` | 24, 380, 42, 5 282, 498 | Geografi | Ikke behov nå. |
| `ot-units`, `ot-statuses`, `reason-codes` | 343, 40, 46 | Oppfølgingstjenestens kontorer og statuser, årsakskoder for heving av kontrakt | Mulig bruk i en senere modul om oppfølging og fagopplæring. |

## Ikke i kodebasen

- **Hvilke skoler som tilbyr hvilke programområder.** Det står i VIGO og vises på Vilbli.no, men er ikke i kodebasen. Vilbli stenger for automatisk henting. Det må avtales med Novari.
