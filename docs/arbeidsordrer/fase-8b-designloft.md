# Arbeidsordre: fase 8b – Designløft

Lim inn teksten under streken som første melding i en ny samtale. Bakgrunnen og kartleggingen står under arbeidsordren.

*Status 08.10.2026:* Skrevet etter at eier ba om at designet løftes til dagens standard i hele appen. Fasen tas før fase 9 (eier 08.10.2026: «som neste skritt i prosjektet»). Arbeidsordren er klar til bruk.

*Status 08.10.2026, ettermiddag:* Steg 1 er gjort: designprinsippene står i `docs/DESIGN.md`, og skissen står i testversjonen på `#/utvikling/design`. Spørsmålene til eier står i `docs/arbeidsordrer/fase-8b-forslag.md`. Eier godkjente designet samme dag, med en endring for de korte valgene (svarene står i forslagsfilen). Pakke 1 (kalkulatorene) er neste.

---

Vi starter fase 8b i Jukselappen: **Designløft** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler, særlig «Grensesnitt»)
- `OPPDRAG.md`: fase 8b og «Gjelder alle faser»
- `CHANGELOG.md` (siste versjoner)
- Denne filen, også bakgrunnen og kartleggingen under arbeidsordren
- Avgjørelsene om designet:
  - to kolonner på skrivebord og kildeboksen (074)
  - kortfoten med regelverket og kildene (071)
  - delene som kan lukkes og huskes (072)
  - stjernen og ikonene (056 og 058)
  - meldingen over appen (088)
  - tallboksene (091)
  - merker og ikoner midt i teksthøyden (092)

**Målet (eier 08.10.2026):** Designet har utviklet seg gjennom flere generasjoner. Eier foretrekker de siste delene: sidekolonnen på forsiden, kalenderen, nyhetene og Videregående i tall. Designet skal løftes til denne standarden i hele appen, uten nye funksjoner og uten å endre innholdet.

**Slik jobber vi:**
1. **Designprinsippene først.** Skriv dagens standard som korte regler i `docs/DESIGN.md`, med eksempler fra de nyeste sidene. Gi meg en skisse på `test/` med før og etter for de viktigste mønstrene, og vent på mitt svar før du bygger videre. Mønstrene:
   - kort
   - flater
   - overskrifter og merkelapper
   - valgknapper
   - to kolonner
   - delene som kan lukkes
   - tall og resultater
2. **Én pakke om gangen** (se pakkene under). Hver pakke får skisse før og etter, en PR med grønn CI og en linje i CHANGELOG.
3. **Felles komponenter før enkeltsider.** Endringer i `Skjemadel`, `Utregningskort`, `Kalkulatorside`, `Innholdskort` og `Forklaring` løfter mange sider på én gang.
4. **Ingen nye farger.** Fargene ligger i `tokens.css` og `tema.css`. Fjern stiler som ikke lenger brukes.
5. **Tester:** overflyt (320–430 px) og axe i lys og mørk visning for alle rutene. De berørte ende-til-ende-testene lokalt, og hele suiten i CI. Test i WebKit.

**Pakkene (foreslått rekkefølge):**
1. **Kalkulatorene** (Arbeidsplan, Beskjeftigelse, Vikartimer, Overtid, Fraværsgrensen, Poengberegning):
   - kortene i skjemaet
   - de tykke fargede strekene
   - titlene i farge
   - valgknappene
   - resultatkolonnen på skrivebord, som står tom til resultatet kommer
   - «Lagrede varianter»
   - «Slik regnes det ut»
2. **Fag og læreplaner:**
   - fagoversikten med grupper og tykke streker
   - fagarket med tallflisene, «Inngår i tilbud» og delene som kan lukkes
3. **Oversiktene i modulene** (Vurdering, Tilrettelegging, Eksamen og klage, Opplæringstilbud, Inntak, Aktivitetsplikt og skoleregler):
   - to kolonner på skrivebord (`ToKolonner`) i stedet for én smal kolonne
   - samme form på inngangene
4. **Veiviserne:** stegene, fasene og resultatet, med samme kort og overskrifter som de nyeste sidene.
5. **Regelverk, Læreplanverket og Begreper:**
   - listene og gruppene
   - søket
   - paragrafene og lenkene
6. **Innstillinger, Om appen, Kilder og Fant ikke siden:** skjemaene og boksene med samme flater og avstander.
7. **Opprydding:**
   - stiler som ikke brukes lenger
   - varianter av samme mønster som kan bli én
   - en kort test som hindrer at gamle mønstre kommer tilbake, f.eks. tykke streker til venstre utenfor de få stedene der de betyr noe

**Kontrollpunkt:** Eier ser gjennom appen på `test/` på mobil og skrivebord og opplever den som én helhet i den nyeste stilen.

---

## Bakgrunn

Eier 08.10.2026:

> Gjennom arbeidet med appen har det blitt tatt en rekke designvurderinger underveis, og jeg opplever at designet har utviklet seg gjennom noen generasjoner. Jeg foretrekker generelt designet i de siste delene av prosjektet (f.eks. sidekolonnen på forsiden med sine moduler, dine nyligste sider om Videregående i tall), fremfor designet for de første sidene (kalkulatorene, for eksempel). Jeg ønsker at designet blir løftet til dagens standard i hele appen.

**Vurdering: eget arbeid.**
- Løftet gjelder om lag 25 sidetyper og de felles komponentene de bygger på.
- Det krever designvalg som eier bør se før de bygges, og hver pakke må testes for overflyt og tilgjengelighet på alle rutene.
- Gjort i én operasjon blir det for stort til å kontrollere.

Den andre delen av samme ønske ble gjort med en gang (versjonen etter 0.44.0, avgjørelse 092): merker, piler og ikoner står midt i teksthøyden når de står sammen med tekst, og en test sjekker det.

## Kartlegging (08.10.2026)

Skjermbildene står i `bilder/designloft-*.jpg`.

**Generasjon 1 (fase 1–2): kalkulatorene og fagarket.**
- Kortene har tykke fargede streker til venstre (blå, lilla, brun), titler i farge og mørkeblå valgknapper.
- Underoverskriftene står med store bokstaver og pil («FAG 1»).
- På skrivebord står resultatkolonnen tom med en løs tekst («Velg fag og fyll inn timer …») til noe er fylt inn.
- Fagoversikten og fagarket har mørke streker til venstre og egne tallfliser.

**Generasjon 2 (fase 3–6): oversiktene i modulene.**
- Det er Vurdering, Tilrettelegging, Eksamen og klage, Opplæringstilbud og Regelverk.
- Hvite kort har ikon og blå tittel. Veiviserne har stolper for fasene.
- På skrivebord står sidene i én smal kolonne med mye tom plass til høyre.
- Overskriftene for gruppene er små og står rett på bakgrunnen.

**Generasjon 3 (fase 7–8): dagens standard.**
- Det er forsiden med sidekolonnen, Kalender, Nyheter, Elevundersøkelsen og Videregående i tall.
- **Oppsett:** to kolonner på skrivebord, og deler som kan lukkes, med en linje om innholdet.
- **Flater og kort:** myke flater i temafargen, hvite kort med tynn kant og avrundede hjørner.
- **Merking og valg:** gule pilleknapper for valg og faner, og små merkelapper med store bokstaver over tittelen.
- **Tall:** først og store, med teksten under eller ved siden av.
- **Kilder:** kildeboksen nederst i høyre kolonne, og kortfoten med regelverket og kildene.
- **Stien:** står i én avrundet flate (0.44.0).

**Felles komponenter som bærer generasjon 1 og 2:**
- `Skjemadel`
- `Kalkulatorside`
- `Utregningskort`
- `Innholdskort`
- `Veiviserinnganger`
- fagarket (`src/modules/fag/sider/Fag.tsx`)
- stilene i `src/styles/base.css`
