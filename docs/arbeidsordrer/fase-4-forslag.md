# Fase 4 – forslag til godkjenning (03.10.2026)

Forslaget legges fram før noe bygges (arbeidsordre fase 4). Paragrafene lenker til Regelverk i appen (`#/lov/<dokument>/<paragraf>`). Avsnittene i veilederen viser til Udirs nummerering, og hvert kapittel har egen adresse.

**Veilederen** (`udir-veileder-tilpasset-opplaering`):
`https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/veileder-for-tilpasset-opplaring-og-individuell-tilrettelegging/<kapittel>/#<avsnitt>`

| Kap. | Adresse (`<kapittel>`) |
|---|---|
| 1 | `innledning` |
| 2 | `tilpasset-opplaring` |
| 3 | `tilfredsstillende-utbytte-opplaringen` |
| 4 | `tiltak-innenfor-ordinar-opplaring` |
| 5 | `individuell-tilrettelegging` |
| 6 | `opplyse-saken-vedtak-individuell-tilrettelegging` |
| 7 | `vedtak-om-individuell-tilrettelegging` |
| 8 | `individuell-opplaringsplan-iop` |
| 9 | `arlig-evaluering-av-utbyttet` |
| 12 | `individuelt-tilrettelagt-opplaring-fritak-vurdering-karakter` |

Kapittel 10 (opplæring i hjemmet), 11 (grunnskolen) og 13 (private skoler) brukes ikke.

---

## Pakke 1: Veiviseren (felles komponent)

- Veiviseren er data: steg med tekst, **ansvar**, **dokumentasjon**, **frist**, kilder og en forklaring som er skjult til den åpnes. Et steg kan ha et spørsmål med svaralternativer, og hvert svar fører til et nytt steg eller et utfall.
- Veiviserne skrives i YAML i `content/<modul>/veivisere/`, med bokmål og nynorsk, `kontrollert: null` og kontrollspørsmål. Skjemaet testes som annet innhold.
- Gangen gjennom veiviseren er en ren funksjon (`src/core/veiviser/`) med tester: gitt svarene, hvilket steg er vi på, og hvilke steg har vi gått gjennom.
- **Adressen** har svarene, f.eks. `#/tilrettelegging/veiviser/individuell?svar=tvil.ikke-nok.ito`. Hvert svar er en ny oppføring i historikken, så «tilbake» i nettleseren går ett steg tilbake.
- **Tastatur og skjermleser:** svarene er radioknapper i `fieldset` med `legend`, «Neste» er en vanlig knapp, fokus flyttes til overskriften i det nye steget, og en `aria-live`-melding sier hvilket steg du er på. Stegene du har gått gjennom, står som en liste over steget, med lenke tilbake.
- Til slutt: en oppsummering av stegene og svarene, med ansvar, dokumentasjon, frister og kilder, som kan kopieres.
- Lite eksempel med tre steg først. Skjermbilder til eier før resten bygges.

## Pakke 2: Fra tilpasset opplæring til individuell tilrettelegging

Ny modul **Tilrettelegging** i kategorien «Elev», med veiviseren og begrepene. Gjelder videregående skole og lærekandidater i bedrift der det er nevnt.

| # | Steg | Spørsmål → neste | Ansvar | Dokumentasjon og frist | Kilder |
|---|---|---|---|---|---|
| 0 | **Start** | «Kommer eleven fra grunnskolen med vedtak om individuelt tilrettelagt opplæring?» Ja → 0b. Nei → 1 | – | – | – |
| 0b | **Overgang til videregående** | → 6 | Fylkeskommunen | Ny sakkyndig vurdering for vgs. Midlertidig vedtak kan bygge på vurderingen fra grunnskolen, «så raskt som mulig» nytt vedtak | Veileder 7.5 |
| 1 | **Tilpasset opplæring for alle** | → 2 | Fylkeskommunen, skolen og lærerne. Lærebedriften for dem i bedrift | Ingen egen dokumentasjon | ol. § 11-1. Veileder 1.1, 2.1 |
| 2 | **Følge med og melde fra** | «Er det tvil om eleven får tilfredsstillende utbytte?» Nei → utfall *Fortsett tilpasset opplæring*. Ja → 3. «Åpenbart behov» → 5b | Lærerne følger med og melder fra til rektor | – | ol. § 11-2 første ledd. Veileder 3.1, 3.2, 4.3 |
| 3 | **Egnede tiltak i ordinær opplæring** | → 4 | Skolen. PP-tjenesten støtter | – | ol. § 11-2 første ledd, § 11-13 andre ledd, § 14-2 tredje ledd (nivådeling). Veileder 4.1. Fravær: § 10-6, veileder 4.4 |
| 4 | **Er tiltakene nok?** | Ja → 2. Nei, eller eleven/foreldrene ber om tilrettelegging → «Hva trenger eleven?» (flere valg): faglig → 5b. Assistanse → 5a. Fysisk/hjelpemidler → 5a | Skolen vurderer. Fylkeskommunen må fatte vedtak, også avslag | – | ol. § 11-2 andre ledd. Veileder 5.1 |
| 5a | **Personlig assistanse / fysisk tilrettelegging og hjelpemidler** | → 7 (hvis også faglig behov: → 5b) | Fylkeskommunen | Ingen krav om sakkyndig vurdering. Saken opplyses, eleven og foreldrene får uttale seg | ol. § 11-4, § 11-5. fvl. § 16, § 17. Veileder 5.2, 5.3, 6.2 (avsnittet om assistanse og fysisk tilrettelegging) |
| 5b | **Samtykke og henvisning til PP-tjenesten** | → 6 | Skolen henviser. Eleven samtykker fra 15 år, ellers foreldrene | Skriftlig samtykke og henvisning (form: se spørsmål 3) | ol. § 11-7 tredje ledd, § 24-5. Veileder 5.4, 6.2 |
| 6 | **Sakkyndig vurdering** | → 7 | PP-tjenesten, faglig uavhengig | Fem punkter i § 11-8. «Uten ugrunnet opphold». Foreldrene kan hente inn en alternativ vurdering | ol. § 11-7 første ledd, § 11-8, § 11-13. fvl. § 11 a. Veileder 6.1–6.3 |
| 7 | **Vedtak** | → 8 (bare individuelt tilrettelagt opplæring), ellers → 9 | Fylkeskommunen, kan delegeres til rektor. Ansvaret kan ikke delegeres | Enkeltvedtak: grunngiving, avvik fra sakkyndig vurdering grunngis særskilt, varighet, klagerett. Samtykke. Stor vekt på hva eleven og foreldrene mener | ol. § 11-6, § 11-7, § 11-9, § 10-1, § 10-2. fvl. § 24, § 25, § 27. Veileder 7.1–7.4, 7.8, 7.10, 7.11 |
| 8 | **Individuell opplæringsplan (IOP)** | → 9 | Skolen, sammen med eleven og foreldrene | Mål, innhold og gjennomføring. «Så raskt som mulig» etter vedtaket | ol. § 11-10. Veileder 8.1–8.4 (8.5 lærekandidater) |
| 9 | **Gjennomføring og årlig evaluering** | «Har eleven fortsatt behov?» Ja → 6 (ny sakkyndig vurdering når den gamle går ut) og 7. Nei → utfall *Tilbake til tilpasset opplæring* | Skolen | Skriftlig oversikt og vurdering **én gang i året**. Eleven/foreldrene får tilgang | ol. § 11-11. Veileder 9.1, 9.2 |
| – | **Klage** (fra steg 7 og 9) | Utfall | Elev/foreldre klager til den som fattet vedtaket. Statsforvalteren er klageinstans | **Tre uker** fra vedtaket ble kjent. Klage på gjennomføringen kan komme når som helst | fvl. § 28, § 29. Veileder 7.9, 8.4 |

Fritak fra vurdering med karakter (bare sidemål i vgs, veileder 12, ofo. § 9-21) nevnes i forklaringen til steg 7, ikke som eget steg.

## Pakke 3: Særskilt språkopplæring og kort botid

Ny veiviser i samme modul.

| # | Steg | Spørsmål → neste | Ansvar | Dokumentasjon og frist | Kilder |
|---|---|---|---|---|---|
| 1 | **Hvem har rett?** | «Har eleven et annet morsmål enn norsk og samisk?» Nei → utfall (samisk § 6-2, tegnspråk § 6-3, ellers tilpasset opplæring). Ja → 2 | – | – | ol. § 6-5 første ledd. Udir *Særskilt språkopplæring* |
| 2 | **Vurdere norskferdighetene** | «Kan eleven norsk godt nok til å følge den vanlige opplæringen?» Ja → utfall *Tilpasset opplæring* (lenke til veiviseren). Nei → 3 | Fylkeskommunen/skolen. Ingen nasjonale krav til verktøy | Vurderingen må ha et faglig grunnlag | ol. § 6-5. Udir *Særskilt språkopplæring* («Vurdere elevens ferdigheter i norsk»), *Tilrettelegge opplæringen for minoritetsspråklige og nyankomne elever* |
| 3 | **Vedtak om særskilt språkopplæring** | → 4 | Fylkeskommunen | Enkeltvedtak. Alltid forsterket opplæring i norsk, og ved behov morsmålsopplæring, tospråklig fagopplæring eller begge. Morsmål kan gis ved en annen skole eller som fjernundervisning | ol. § 6-5 første og tredje ledd, § 10-1, § 10-2, § 14-4. fvl. § 17. Udir *Særskilt språkopplæring* («Krav til vedtak») |
| 4 | **Kort botid?** | «Har eleven bodd kort tid i Norge?» Ja → 5. Nei → 7 | – | Ingen fast grense for «kort tid» | Udir *Innføringsopplæring* |
| 5 | **Innføringsopplæring** | «Ønsker eleven det?» Ja → 6. Nei → 6 (ordinær klasse) | Fylkeskommunen | Samtykke. Vedtak for **inntil ett år** om gangen, **til sammen inntil to år**. Kan gjøre unntak fra læreplaner og fag- og timefordelingen. Fritak fra vurdering med karakter, men ikke fra standpunkt | ol. § 6-6, § 14-2. ofo. § 9-20 andre ledd. Udir *Innføringsopplæring* |
| 6 | **Læreplan i norsk for kort botid** | → 7 | Eleven velger | Vilkår: særskilt språkopplæring, og høyst fire års opplæring fra 5. trinn i norsk grunnskole | ofo. § 5-12 første ledd. Fagene i appen (NOR09-05, f.eks. NOR1412) |
| 7 | **Jevnlig vurdering** | «Kan eleven nå norsk godt nok?» Nei → 7. Ja → utfall *Over til vanlig opplæring* | Fylkeskommunen | Jevnlig, uten fast frist | ol. § 6-5 andre ledd. Udir *Særskilt språkopplæring* |

Rett til videregående og tilbud i overgangen for dem med kort botid står som en forklaring med lenker, ikke som steg, fordi inntak er fase 5: ol. § 5-1 første ledd (fullført vgs i et annet land), § 5-9 (oppholdstillatelse), § 9-6 (tilbud for dem som mangler språklige forutsetninger), § 9-7 (mer grunnskoleopplæring) og ofo. § 4-1 første ledd bokstav b (ni års grunnopplæring i utlandet).

## Kilder

**Udir (NLOD 2.0, slås på i kilderegisteret):**

| Kilde-id | Side |
|---|---|
| `udir-veileder-tilpasset-opplaering` (finnes) | Veilederen, kapittel 1–9 og 12. Kildesjekken bør sjekke hvert kapittel, ikke bare forsiden, så endringer treffer riktig steg |
| `udir-sarskilt-sprakopplaring` (ny) | https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/sarskilt-sprakopplaring/ |
| `udir-innforingsopplaring` (ny) | https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/innforingsopplaring/ |
| `udir-minoritetsspraklige` (ny) | https://www.udir.no/laring-og-trivsel/minoritetsspraklige-og-nyankomne/minoritetsspraklige/tilrettelegge-opplaringen-for-minoritetsspraklige-og-nyankomne-elever/ |

**Vestland fylkeskommune (`vlfk-sider`, fylkesinnhold, bare når Vestland er valgt):** Nettstedet heter nå vestlandfylke.no. Kilden får ny adresse. Vilkårene for gjenbruk er ikke avklart, så alt skrives med egne ord og lenker.

| Side | Brukes i |
|---|---|
| https://www.vestlandfylke.no/utdanning-og-karriere/fremhevde-sider/minoritetsspraklege/ | Språk, steg 2–3: søknad, kartlegging og frist i Vestland |
| https://www.vestlandfylke.no/utdanning-og-karriere/fremhevde-sider/minoritetsspraklege/innforingskurs/ | Språk, steg 5 |
| https://www.vestlandfylke.no/utdanning-og-karriere/tilrettelegging-ved-laringsutfordringar/ | Tilrettelegging, steg 0b, 5b og 6: PP-tjenesten i Rettleiingstenesta, midlertidig vedtak ved inntak |

Nettverket i utviklingsmiljøet stenger vestlandfylke.no, så jeg har ikke lest sidene ennå. Kildesjekken i Actions kan nå dem.

## Nye begreper

Tilpasset opplæring, tilfredsstillende utbytte, individuell tilrettelegging, individuelt tilrettelagt opplæring (stikkord: spesialundervisning), personlig assistanse, fysisk tilrettelegging og tekniske hjelpemidler, sakkyndig vurdering, PP-tjenesten, individuell opplæringsplan (IOP, med årlig evaluering), selvråderett fra 15 år, elevens beste og medvirkning, minoritetsspråklig elev, særskilt språkopplæring (med forsterket norsk), morsmålsopplæring, tospråklig fagopplæring, innføringsopplæring og kort botid.

Finnes fra før og brukes: enkeltvedtak, klage, forhåndsvarsel, forskrift og lokal forskrift.

## Spørsmål til eier

1. **Ukraina-unntaket i ol. § 6-6:** Udir skriver at unntaket fra samtykke gjaldt ut juli 2026. Lovteksten fra Lovdata (hentet 02.10.2026) har det fortsatt. Skal veiviseren nevne det?
2. **Avslutning av særskilt språkopplæring:** Må fylkeskommunen fatte et nytt vedtak når eleven kan nok norsk, eller faller vedtaket bort? Kildene sier det ikke klart.
3. **Henvisning til PP-tjenesten:** Skal veiviseren si at henvisningen og samtykket bør være skriftlig? Veilederen krever samtykke, men sier ikke noe om formen.
4. **Foreløpig svar (fvl. § 11 a):** Skal fristen på én måned for foreløpig svar stå i steg 7, eller bare «uten ugrunnet opphold» for PP-tjenesten, som i veilederen?
5. **Modul og navn:** Én modul «Tilrettelegging» i kategorien «Elev» med begge veiviserne?
